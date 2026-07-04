<script setup lang="ts">
// AtomScene renders a simplified Bohr-inspired atom using a ball-and-stick visual style.
// It is NOT to scale — radii and distances are chosen for visual clarity.
//
// Structure:
//   - One nucleus sphere at the origin, sized loosely by atomic mass.
//   - One electron sphere per electron, orbiting the nucleus.
//   - One thin cylinder (rod) per electron, drawn from the nucleus to the electron
//     each frame so it always tracks the electron's current position.
//
// Animation:
//   Each electron orbits on a circular path of radius shellRadius(shellIdx).
//   The orbit plane is tilted uniquely per shell (tiltX, tiltZ) so the electrons
//   fan out in 3D rather than all spinning on a single flat disc.
//   Inner shells orbit slightly faster than outer ones (speed factor scales down with shellIdx).

const props = defineProps<{
  protons:       number
  neutrons:      number
  // shells[i] = number of electrons in shell i (e.g. Carbon = [2, 4])
  shells:        number[]
  nucleusColor:  string
  orbitColor:    string
  electronColor: string
  speed:         number
}>()

// One entry per electron across all shells.
interface ElectronDef {
  shellIdx: number  // which shell this electron belongs to
  phase:    number  // angular offset so electrons in the same shell are evenly spread
  tiltX:    number  // radians to tilt the orbit plane around the X axis
  tiltZ:    number  // radians to tilt the orbit plane around the Z axis
}

const electrons = computed<ElectronDef[]>(() => {
  const list: ElectronDef[] = []
  props.shells.forEach((count, si) => {
    for (let i = 0; i < count; i++) {
      list.push({
        shellIdx: si,
        // Spread electrons evenly around the full circle (2π) for this shell
        phase: (i / Math.max(count, 1)) * Math.PI * 2,
        // Prime-ish multipliers (47°, 31°) ensure no two shells share the same tilt,
        // giving each orbit a distinct 3D angle without any landing on an axis-aligned plane
        tiltX: (si * 47 * Math.PI) / 180,
        tiltZ: (si * 31 * Math.PI) / 180,
      })
    }
  })
  return list
})

// Shell radius is purely visual — inner shell at 0.7, each subsequent shell adds 0.5.
const shellRadius = (idx: number) => 0.7 + idx * 0.5

// Electron world-space positions, recomputed every frame by onBeforeRender.
// Initialised to the origin; the first render tick moves them to their correct positions.
const electronPositions = ref<[number, number, number][]>(
  electrons.value.map(() => [0, 0, 0] as [number, number, number]),
)

const { onBeforeRender } = useLoop()

onBeforeRender(({ elapsed }) => {
  const t = elapsed * props.speed
  electronPositions.value = electrons.value.map((e) => {
    const r = shellRadius(e.shellIdx)
    // Inner shells orbit faster: speed factor decreases by 15% per shell
    const angle = t * (1 - e.shellIdx * 0.15) + e.phase

    // Step 1 — place the electron on a flat XZ circle of radius r
    const x0 = Math.cos(angle) * r
    const z0 = Math.sin(angle) * r

    // Step 2 — tilt the orbit plane around the X axis by tiltX.
    // This lifts z0 up into Y, creating an inclined orbit.
    const y1 = -z0 * Math.sin(e.tiltX)
    const z1 =  z0 * Math.cos(e.tiltX)

    // Step 3 — tilt the result around the Z axis by tiltZ.
    // Combined with tiltX this gives each shell a unique 3D orbit orientation.
    const x2 = x0 * Math.cos(e.tiltZ) - y1 * Math.sin(e.tiltZ)
    const y2 = x0 * Math.sin(e.tiltZ) + y1 * Math.cos(e.tiltZ)

    return [x2, y2, z1] as [number, number, number]
  })
})

// Nucleus size grows very slightly with atomic mass (cube-root keeps it compact).
const nucleusRadius = computed(() =>
  0.18 + Math.cbrt(props.protons + props.neutrons) * 0.04,
)

// ── Rod alignment ─────────────────────────────────────────────────────────
//
// Three.js CylinderGeometry is aligned along the Y axis by default.
// To draw a rod from the nucleus (origin) to an electron at (dx, dy, dz) we need
// to rotate the cylinder so its Y axis points along the bond direction.
//
// Approach: compute the quaternion that rotates (0,1,0) onto the normalised
// direction vector, then convert that quaternion to XYZ Euler angles that
// TresJS accepts as a :rotation prop.
//
// Quaternion construction:
//   The rotation axis is  cross((0,1,0), dir) = (dir.z, 0, -dir.x)
//   The rotation angle θ satisfies  cos θ = dot((0,1,0), dir) = dir.y
//   Using the half-angle form:  q = (axis * sin(θ/2), cos(θ/2))
//
// Special cases:
//   dir is parallel to Y  →  identity quaternion (no rotation needed)
//   dir is anti-parallel  →  180° flip around X

function eulerFromYUp(dx: number, dy: number, dz: number, len: number): [number, number, number] {
  if (len < 1e-6) return [0, 0, 0]

  // Normalise the direction vector
  const nx = dx / len
  const ny = dy / len
  const nz = dz / len

  // Rotation axis = cross((0,1,0), (nx,ny,nz)) = (nz, 0, -nx)
  const axisX   = nz
  const axisZ   = -nx
  const axisLen = Math.sqrt(axisX * axisX + axisZ * axisZ)
  const dot     = ny  // cos of rotation angle = dot product with Y-up

  let qx: number, qy: number, qz: number, qw: number

  if (axisLen < 1e-6) {
    // Direction is (anti-)parallel to Y — cross product is zero length
    if (dot > 0) { qx = 0; qy = 0; qz = 0; qw = 1 }  // already aligned, identity
    else         { qx = 1; qy = 0; qz = 0; qw = 0 }  // pointing down, flip 180° around X
  } else {
    // Half-angle quaternion components
    const sinHalf = Math.sqrt((1 - dot) / 2)
    const cosHalf = Math.sqrt((1 + dot) / 2)
    qx = (axisX / axisLen) * sinHalf
    qy = 0  // axisY is always 0 for cross((0,1,0), dir)
    qz = (axisZ / axisLen) * sinHalf
    qw = cosHalf
  }

  // Convert quaternion to Euler XYZ angles (Three.js default rotation order)
  const sinRcosP = 2 * (qw * qx + qy * qz)
  const cosRcosP = 1 - 2 * (qx * qx + qy * qy)
  const ex = Math.atan2(sinRcosP, cosRcosP)

  const sinP = 2 * (qw * qy - qz * qx)
  const ey = Math.abs(sinP) >= 1
    ? Math.sign(sinP) * Math.PI / 2  // clamp to ±90° to avoid asin domain error
    : Math.asin(sinP)

  const sinYcosP = 2 * (qw * qz + qx * qy)
  const cosYcosP = 1 - 2 * (qy * qy + qz * qz)
  const ez = Math.atan2(sinYcosP, cosYcosP)

  return [ex, ey, ez]
}

// Geometry for each rod: midpoint (where Three.js places the cylinder's centre),
// full length, and the Euler rotation to align it toward the electron.
interface RodGeom {
  midpoint: [number, number, number]
  length:   number
  rotation: [number, number, number]
}

// Recomputed reactively whenever electronPositions changes (i.e. every frame).
const rods = computed<RodGeom[]>(() =>
  electronPositions.value.map(([ex, ey, ez]) => {
    const len = Math.sqrt(ex * ex + ey * ey + ez * ez)
    return {
      midpoint: [ex / 2, ey / 2, ez / 2] as [number, number, number],
      length:   len,
      rotation: eulerFromYUp(ex, ey, ez, len),
    }
  }),
)
</script>

<template>
  <!-- Central nucleus — sphere at the origin -->
  <TresMesh :position="([0, 0, 0] as any)">
    <TresSphereGeometry :args="[nucleusRadius, 32, 32]" />
    <TresMeshStandardMaterial
      :color="nucleusColor"
      :roughness="0.3"
      :metalness="0.4"
      :emissive="nucleusColor"
      :emissive-intensity="0.3"
    />
  </TresMesh>

  <!--
    Rods — one thin cylinder per electron, drawn from the nucleus to the electron's
    current position. The cylinder is placed at the midpoint and rotated by eulerFromYUp
    so its Y axis points toward the electron. Length matches the electron's orbit radius.
  -->
  <TresMesh
    v-for="(rod, i) in rods"
    :key="`rod-${i}`"
    :position="(rod.midpoint as any)"
    :rotation="(rod.rotation as any)"
  >
    <TresCylinderGeometry :args="[0.025, 0.025, rod.length, 6]" />
    <TresMeshStandardMaterial
      :color="orbitColor"
      :roughness="0.8"
      :metalness="0.0"
      :opacity="0.5"
      :transparent="true"
    />
  </TresMesh>

  <!--
    Electrons — glowing spheres at the computed world-space positions.
    Positions are recalculated each frame by onBeforeRender, so the spheres
    animate smoothly without Vue reactivity overhead on individual coordinates.
  -->
  <TresMesh
    v-for="(pos, i) in electronPositions"
    :key="`e-${i}`"
    :position="(pos as any)"
  >
    <TresSphereGeometry :args="[0.1, 16, 16]" />
    <TresMeshStandardMaterial
      :color="electronColor"
      :roughness="0.2"
      :metalness="0.5"
      :emissive="electronColor"
      :emissive-intensity="0.45"
    />
  </TresMesh>
</template>
