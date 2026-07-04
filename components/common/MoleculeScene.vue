<script setup lang="ts">
// MoleculeScene renders a ball-and-stick model of a molecule.
//
// Structure:
//   - One sphere per atom, coloured by CPK convention (O=red, N=blue, C=grey, H=light blue).
//   - One cylinder per bond connecting the two atom centres.
//   - Double bonds are represented as two parallel cylinders offset slightly apart.
//
// Animation:
//   The entire molecule group rotates continuously around Y, with a gentle
//   oscillating tilt on X so the 3D structure is visible from all angles.
//
// Bond alignment:
//   Three.js CylinderGeometry is Y-up by default. Each bond cylinder must be
//   rotated so its Y axis points along the line between the two bonded atoms.
//   This is done via eulerFromYUp() which converts a direction vector into
//   the XYZ Euler angles Three.js expects on a :rotation prop.

export interface MoleculeAtom {
  id:       string
  label:    string
  color:    string
  position: [number, number, number]
  radius:   number  // visual radius (loosely based on van der Waals radii)
}

export interface MoleculeBond {
  from:  string   // atom id
  to:    string   // atom id
  order: 1 | 2   // 1 = single bond (one cylinder), 2 = double bond (two cylinders)
}

export interface MoleculeDef {
  name:    string
  formula: string
  atoms:   MoleculeAtom[]
  bonds:   MoleculeBond[]
}

const props = defineProps<{
  molecule:  MoleculeDef
  speed:     number
  wireframe: boolean
}>()

// The whole molecule is wrapped in a TresGroup so a single rotation drives everything.
const groupRef = ref<any>(null)

const { onBeforeRender } = useLoop()

onBeforeRender(({ elapsed }) => {
  if (!groupRef.value) return
  // Continuous Y rotation gives a slow spin
  groupRef.value.rotation.y = elapsed * props.speed * 0.5
  // Oscillating X tilt (±0.25 rad ≈ ±14°) lets you see the molecule from above and below
  groupRef.value.rotation.x = Math.sin(elapsed * props.speed * 0.2) * 0.25
})

// ── Bond alignment ────────────────────────────────────────────────────────
//
// Problem: CylinderGeometry is built along the Y axis (from -height/2 to +height/2).
// We need each cylinder to stretch from atom A to atom B at an arbitrary angle.
//
// Solution: find the quaternion that rotates the unit Y vector (0,1,0) onto the
// unit bond direction vector, then convert that quaternion to Euler XYZ angles.
//
// The quaternion is constructed using the "rotation between two vectors" formula:
//   axis  = cross((0,1,0), dir)  =  (dir.z, 0, -dir.x)   [always has y=0]
//   angle = acos(dot((0,1,0), dir)) = acos(dir.y)
//   q     = (axis_normalised * sin(angle/2),  cos(angle/2))
//
// Special cases handled explicitly:
//   dir ≈ +Y  →  identity (no rotation)
//   dir ≈ -Y  →  180° flip around X (cross product would be zero-length)

function eulerFromYUp(dx: number, dy: number, dz: number, len: number): [number, number, number] {
  // Normalise bond direction vector
  const nx = dx / len
  const ny = dy / len
  const nz = dz / len

  // Rotation axis = cross((0,1,0), (nx,ny,nz)) = (nz, 0, -nx)
  const axisX   = nz
  const axisZ   = -nx
  const axisLen = Math.sqrt(axisX * axisX + axisZ * axisZ)
  const dot     = ny  // dot((0,1,0), dir) = cosine of the rotation angle

  let qx: number, qy: number, qz: number, qw: number

  if (axisLen < 1e-6) {
    // Bond is (anti-)parallel to Y — cross product degenerates to zero
    if (dot > 0) { qx = 0; qy = 0; qz = 0; qw = 1 }  // already Y-up, identity quaternion
    else         { qx = 1; qy = 0; qz = 0; qw = 0 }  // pointing straight down, 180° around X
  } else {
    // Half-angle quaternion: sin(θ/2) and cos(θ/2) from half-angle identities
    const sinHalf = Math.sqrt((1 - dot) / 2)
    const cosHalf = Math.sqrt((1 + dot) / 2)
    qx = (axisX / axisLen) * sinHalf
    qy = 0  // axisY is always 0 since cross((0,1,0), dir).y = 0
    qz = (axisZ / axisLen) * sinHalf
    qw = cosHalf
  }

  // Convert quaternion → Euler XYZ (the rotation order Three.js uses by default).
  // Standard formula derived from the rotation matrix entries.
  const sinRcosP = 2 * (qw * qx + qy * qz)
  const cosRcosP = 1 - 2 * (qx * qx + qy * qy)
  const ex = Math.atan2(sinRcosP, cosRcosP)  // rotation around X

  const sinP = 2 * (qw * qy - qz * qx)
  const ey = Math.abs(sinP) >= 1
    ? Math.sign(sinP) * Math.PI / 2  // clamp to ±90° to avoid asin domain error
    : Math.asin(sinP)                // rotation around Y

  const sinYcosP = 2 * (qw * qz + qx * qy)
  const cosYcosP = 1 - 2 * (qy * qy + qz * qz)
  const ez = Math.atan2(sinYcosP, cosYcosP)  // rotation around Z

  return [ex, ey, ez]
}

// Pre-computed geometry for every bond in the molecule.
// Recomputed if the molecule prop changes (e.g. user switches molecule).
interface BondGeom {
  // World-space midpoint between the two bonded atoms — where Three.js centres the cylinder
  position: [number, number, number]
  // Full distance between the two atoms — sets the cylinder height
  length:   number
  // XYZ Euler angles that rotate a Y-up cylinder to point along the bond
  rotation: [number, number, number]
  order:    1 | 2
}

const bondGeoms = computed<BondGeom[]>(() => {
  // Build a lookup map so we can find each atom by id in O(1)
  const atomMap = new Map(props.molecule.atoms.map(a => [a.id, a]))

  return props.molecule.bonds.map(b => {
    const a1 = atomMap.get(b.from)!
    const a2 = atomMap.get(b.to)!

    // Bond vector from a1 → a2
    const dx  = a2.position[0] - a1.position[0]
    const dy  = a2.position[1] - a1.position[1]
    const dz  = a2.position[2] - a1.position[2]
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz)

    return {
      // Midpoint = where the cylinder's local origin will sit
      position: [
        (a1.position[0] + a2.position[0]) / 2,
        (a1.position[1] + a2.position[1]) / 2,
        (a1.position[2] + a2.position[2]) / 2,
      ] as [number, number, number],
      length:   len,
      rotation: eulerFromYUp(dx, dy, dz, len),
      order:    b.order,
    }
  })
})
</script>

<template>
  <!--
    Wrapping group lets us animate the whole molecule with a single rotation,
    rather than updating every atom and bond position individually each frame.
  -->
  <TresGroup ref="groupRef">

    <!-- Atom spheres — one per entry in molecule.atoms -->
    <TresMesh
      v-for="atom in molecule.atoms"
      :key="atom.id"
      :position="(atom.position as any)"
    >
      <!--
        32 segments give smooth spheres without excessive vertex count.
        Radius comes from the atom definition (loosely van der Waals scaled).
      -->
      <TresSphereGeometry :args="[atom.radius, 32, 32]" />
      <TresMeshStandardMaterial
        :color="atom.color"
        :roughness="0.25"
        :metalness="0.3"
        :wireframe="wireframe"
        :emissive="atom.color"
        :emissive-intensity="0.1"
      />
    </TresMesh>

    <!--
      Bond cylinders — one template block per bond.
      Single bonds render one cylinder centred on the midpoint.
      Double bonds render two cylinders offset ±0.08 units in X from the midpoint,
      giving the parallel-stick appearance of a double bond.
      Both cylinders share the same rotation since they are parallel.
    -->
    <template v-for="(bg, i) in bondGeoms" :key="`bond-${i}`">

      <!-- First cylinder (single bond) or left cylinder (double bond) -->
      <TresMesh
        :position="(bg.order === 2 ? [bg.position[0] - 0.08, bg.position[1], bg.position[2]] : bg.position as any)"
        :rotation="(bg.rotation as any)"
      >
        <TresCylinderGeometry :args="[0.06, 0.06, bg.length, 8]" />
        <TresMeshStandardMaterial
          color="#aaaaaa"
          :roughness="0.6"
          :metalness="0.1"
          :wireframe="wireframe"
        />
      </TresMesh>

      <!-- Second cylinder for double bonds only (right stick, offset +0.08 in X) -->
      <TresMesh
        v-if="bg.order === 2"
        :position="([bg.position[0] + 0.08, bg.position[1], bg.position[2]] as any)"
        :rotation="(bg.rotation as any)"
      >
        <TresCylinderGeometry :args="[0.06, 0.06, bg.length, 8]" />
        <TresMeshStandardMaterial
          color="#aaaaaa"
          :roughness="0.6"
          :metalness="0.1"
          :wireframe="wireframe"
        />
      </TresMesh>

    </template>
  </TresGroup>
</template>
