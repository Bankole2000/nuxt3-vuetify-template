<script setup lang="ts">
import type { ModelViewerConfig } from '~/components/common/ModelViewer.vue'
import type { MoleculeDef } from '~/components/common/MoleculeScene.vue'

definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Model Viewer (3D)', disabled: true },
  ],
})

useSeo({
  title: 'Model Viewer (3D)',
  description: 'Three.js GLTF/GLB model viewer with orbit controls, wireframe, environment lighting, auto-rotate and screenshot export.',
})

const activeTab     = ref('builtin')
const infoDialog    = ref(false)
const snackbarText  = ref('')
const snackbarShow  = ref(false)
const customUrl     = ref('https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb')
const loadedUrl     = ref('')
const viewerRef     = ref<{ takeScreenshot(): void } | null>(null)

const builtinConfig = ref<Partial<ModelViewerConfig>>({
  autoRotate:      true,
  wireframe:       false,
  showAxes:        false,
  showGrid:        true,
  environment:     'studio',
  backgroundColor: '#1a1a2e',
})

const environments: { value: ModelViewerConfig['environment']; label: string }[] = [
  { value: 'studio', label: 'Studio' },
  { value: 'sunset', label: 'Sunset' },
  { value: 'dawn',   label: 'Dawn'   },
  { value: 'night',  label: 'Night'  },
]

const autoRotateSpeed = ref(1.0)

function onModelLoad() {
  snackbarText.value = 'Model loaded successfully'
  snackbarShow.value = true
}

function onModelError(msg: string) {
  snackbarText.value = `Error: ${msg}`
  snackbarShow.value = true
}

function loadCustomUrl() {
  loadedUrl.value = customUrl.value.trim()
}

// ── Atom tab ──────────────────────────────────────────────────────────────

interface ElementPreset {
  element:       string
  protons:       number
  neutrons:      number
  shells:        number[]
  nucleusColor:  string
  electronColor: string
  label:         string
}

const elementPresets: ElementPreset[] = [
  { element: 'H',  protons: 1,  neutrons: 0,  shells: [1],       nucleusColor: '#ff6b6b', electronColor: '#74c0fc', label: 'Hydrogen (H)' },
  { element: 'He', protons: 2,  neutrons: 2,  shells: [2],       nucleusColor: '#ff9f43', electronColor: '#a8edea', label: 'Helium (He)' },
  { element: 'Li', protons: 3,  neutrons: 4,  shells: [2, 1],    nucleusColor: '#ee5a24', electronColor: '#ffd32a', label: 'Lithium (Li)' },
  { element: 'C',  protons: 6,  neutrons: 6,  shells: [2, 4],    nucleusColor: '#555', electronColor: '#48dbfb', label: 'Carbon (C)' },
  { element: 'O',  protons: 8,  neutrons: 8,  shells: [2, 6],    nucleusColor: '#e74c3c', electronColor: '#6c5ce7', label: 'Oxygen (O)' },
  { element: 'Na', protons: 11, neutrons: 12, shells: [2, 8, 1], nucleusColor: '#f9ca24', electronColor: '#badc58', label: 'Sodium (Na)' },
  { element: 'Fe', protons: 26, neutrons: 30, shells: [2, 8, 14, 2], nucleusColor: '#b7950b', electronColor: '#f0b27a', label: 'Iron (Fe)' },
]

const selectedElement = ref(elementPresets[3]!)  // Carbon default
const atomSpeed       = ref(1.2)
const atomOrbitColor  = ref('#4a4a6a')
const atomBgColor     = ref('#0d0d1a')
const atomShowGrid    = ref(false)

// ── Molecule tab ──────────────────────────────────────────────────────────

const molecules: MoleculeDef[] = [
  {
    name: 'Water',
    formula: 'H₂O',
    atoms: [
      { id: 'O',  label: 'O', color: '#e74c3c', position: [0,    0,    0   ], radius: 0.38 },
      { id: 'H1', label: 'H', color: '#74c0fc', position: [-0.8, 0.6,  0   ], radius: 0.25 },
      { id: 'H2', label: 'H', color: '#74c0fc', position: [ 0.8, 0.6,  0   ], radius: 0.25 },
    ],
    bonds: [
      { from: 'O', to: 'H1', order: 1 },
      { from: 'O', to: 'H2', order: 1 },
    ],
  },
  {
    name: 'Carbon Dioxide',
    formula: 'CO₂',
    atoms: [
      { id: 'C',  label: 'C', color: '#636e72', position: [0,    0, 0], radius: 0.35 },
      { id: 'O1', label: 'O', color: '#e74c3c', position: [-1.2, 0, 0], radius: 0.38 },
      { id: 'O2', label: 'O', color: '#e74c3c', position: [ 1.2, 0, 0], radius: 0.38 },
    ],
    bonds: [
      { from: 'C', to: 'O1', order: 2 },
      { from: 'C', to: 'O2', order: 2 },
    ],
  },
  {
    name: 'Methane',
    formula: 'CH₄',
    atoms: [
      { id: 'C',  label: 'C', color: '#636e72', position: [0,     0,     0    ], radius: 0.35 },
      { id: 'H1', label: 'H', color: '#74c0fc', position: [ 0.9,  0.9,   0.9  ], radius: 0.25 },
      { id: 'H2', label: 'H', color: '#74c0fc', position: [-0.9, -0.9,   0.9  ], radius: 0.25 },
      { id: 'H3', label: 'H', color: '#74c0fc', position: [-0.9,  0.9,  -0.9  ], radius: 0.25 },
      { id: 'H4', label: 'H', color: '#74c0fc', position: [ 0.9, -0.9,  -0.9  ], radius: 0.25 },
    ],
    bonds: [
      { from: 'C', to: 'H1', order: 1 },
      { from: 'C', to: 'H2', order: 1 },
      { from: 'C', to: 'H3', order: 1 },
      { from: 'C', to: 'H4', order: 1 },
    ],
  },
  {
    name: 'Ammonia',
    formula: 'NH₃',
    atoms: [
      { id: 'N',  label: 'N', color: '#3498db', position: [0,     0.4,  0    ], radius: 0.36 },
      { id: 'H1', label: 'H', color: '#74c0fc', position: [ 0.9, -0.3,  0.5  ], radius: 0.25 },
      { id: 'H2', label: 'H', color: '#74c0fc', position: [-0.9, -0.3,  0.5  ], radius: 0.25 },
      { id: 'H3', label: 'H', color: '#74c0fc', position: [0,    -0.3, -1.0  ], radius: 0.25 },
    ],
    bonds: [
      { from: 'N', to: 'H1', order: 1 },
      { from: 'N', to: 'H2', order: 1 },
      { from: 'N', to: 'H3', order: 1 },
    ],
  },
  {
    name: 'Ethanol',
    formula: 'C₂H₅OH',
    atoms: [
      { id: 'C1', label: 'C', color: '#636e72', position: [-0.75, 0,    0   ], radius: 0.35 },
      { id: 'C2', label: 'C', color: '#636e72', position: [ 0.75, 0,    0   ], radius: 0.35 },
      { id: 'O',  label: 'O', color: '#e74c3c', position: [ 1.55, 0.9,  0   ], radius: 0.38 },
      { id: 'H1', label: 'H', color: '#74c0fc', position: [-1.2,  0.9,  0.5 ], radius: 0.22 },
      { id: 'H2', label: 'H', color: '#74c0fc', position: [-1.2, -0.9,  0.5 ], radius: 0.22 },
      { id: 'H3', label: 'H', color: '#74c0fc', position: [-1.2,  0,   -0.9 ], radius: 0.22 },
      { id: 'H4', label: 'H', color: '#74c0fc', position: [ 1.2,  0.9, -0.7 ], radius: 0.22 },
      { id: 'H5', label: 'H', color: '#74c0fc', position: [ 1.2, -0.9,  0.5 ], radius: 0.22 },
      { id: 'HO', label: 'H', color: '#74c0fc', position: [ 2.45, 0.9,  0   ], radius: 0.22 },
    ],
    bonds: [
      { from: 'C1', to: 'C2', order: 1 },
      { from: 'C2', to: 'O',  order: 1 },
      { from: 'C1', to: 'H1', order: 1 },
      { from: 'C1', to: 'H2', order: 1 },
      { from: 'C1', to: 'H3', order: 1 },
      { from: 'C2', to: 'H4', order: 1 },
      { from: 'C2', to: 'H5', order: 1 },
      { from: 'O',  to: 'HO', order: 1 },
    ],
  },
]

const selectedMolecule = ref(molecules[0]!)
const molSpeed         = ref(0.6)
const molWireframe     = ref(false)
const molBgColor       = ref('#0d0d1a')

const useCases = [
  {
    number: '#1',
    app: 'Portfolio Manager',
    icon: 'mdi-briefcase-outline',
    color: 'deep-purple',
    description: 'Showcase 3D product renders, design mockups and interactive prototypes directly in the browser.',
  },
  {
    number: 'General',
    app: 'E-commerce',
    icon: 'mdi-shopping-outline',
    color: 'primary',
    description: 'Let customers inspect products from every angle before purchasing — reduce returns and boost confidence.',
  },
  {
    number: 'General',
    app: 'Architecture',
    icon: 'mdi-office-building-outline',
    color: 'indigo',
    description: 'Embed BIM/CAD exports as interactive walkthroughs in client-facing proposals and project dashboards.',
  },
  {
    number: 'General',
    app: 'Gaming Assets',
    icon: 'mdi-gamepad-variant-outline',
    color: 'success',
    description: 'Preview character models, props and environment meshes in your asset pipeline or store.',
  },
  {
    number: 'General',
    app: 'CAD Viewer',
    icon: 'mdi-cog-outline',
    color: 'warning',
    description: 'Inspect engineering parts, assemblies and mechanical designs without installing desktop software.',
  },
  {
    number: 'General',
    app: 'Education',
    icon: 'mdi-school-outline',
    color: 'teal',
    description: 'Display 3D anatomical models, molecular structures or historical artefacts for interactive learning.',
  },
]
</script>

<template>
  <div>
    <div class="d-flex align-center gap-3 mb-1">
      <h1 class="text-h5 font-weight-bold">Model Viewer (3D)</h1>
      <v-btn
        icon="mdi-information-outline"
        variant="text"
        size="small"
        @click="infoDialog = true"
      />
    </div>
    <p class="text-body-2 text-medium-emphasis mb-6">
      Three.js GLTF/GLB viewer with OrbitControls, PBR lighting, wireframe, environment presets and screenshot export.
      Drop any <code>.glb</code> URL into the Custom URL tab to load external models.
    </p>

    <v-tabs v-model="activeTab" class="mb-6">
      <v-tab value="builtin">Built-in Scene</v-tab>
      <v-tab value="atom">Atom</v-tab>
      <v-tab value="molecule">Molecule</v-tab>
      <v-tab value="custom">Custom URL</v-tab>
    </v-tabs>

    <v-tabs-window v-model="activeTab">
      <v-tabs-window-item value="builtin">
        <v-row>
          <v-col cols="12" md="8">
            <ClientOnly>
              <CommonModelViewer
                ref="viewerRef"
                :config="builtinConfig"
                :auto-rotate-speed="autoRotateSpeed"
                height="460px"
                @load="onModelLoad"
                @error="onModelError"
              />
              <template #fallback>
                <v-card rounded="lg" class="pa-8 text-center" height="460px" style="display:flex;align-items:center;justify-content:center;">
                  <v-progress-circular indeterminate color="primary" />
                </v-card>
              </template>
            </ClientOnly>

            <v-card rounded="lg" variant="tonal" color="deep-purple" class="mt-3 pa-3">
              <div class="d-flex align-center gap-2">
                <v-icon icon="mdi-information-outline" size="18" />
                <span class="text-caption">
                  This tab renders a built-in demo scene (box, sphere, torus knot) — no external file needed.
                  Paste any <code>.glb</code> URL in the <strong>Custom URL</strong> tab to load real models.
                </span>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <v-card rounded="lg" class="pa-4">
              <p class="text-body-2 font-weight-bold mb-4">Scene Controls</p>

              <v-switch
                v-model="builtinConfig.autoRotate"
                label="Auto-rotate"
                color="deep-purple"
                density="compact"
                hide-details
                class="mb-2"
              />

              <v-slider
                v-model="autoRotateSpeed"
                label="Rotate speed"
                :min="0.1"
                :max="5"
                :step="0.1"
                color="deep-purple"
                density="compact"
                thumb-label
                class="mb-2"
              />

              <v-switch
                v-model="builtinConfig.wireframe"
                label="Wireframe"
                color="deep-purple"
                density="compact"
                hide-details
                class="mb-2"
              />

              <v-switch
                v-model="builtinConfig.showAxes"
                label="Show axes"
                color="deep-purple"
                density="compact"
                hide-details
                class="mb-2"
              />

              <v-switch
                v-model="builtinConfig.showGrid"
                label="Show grid"
                color="deep-purple"
                density="compact"
                hide-details
                class="mb-4"
              />

              <p class="text-caption text-medium-emphasis mb-1">Environment</p>
              <v-select
                v-model="builtinConfig.environment"
                :items="environments"
                item-title="label"
                item-value="value"
                variant="outlined"
                density="compact"
                rounded="lg"
                hide-details
                class="mb-4"
              />

              <p class="text-caption text-medium-emphasis mb-1">Background colour</p>
              <v-text-field
                v-model="builtinConfig.backgroundColor"
                type="color"
                variant="outlined"
                density="compact"
                rounded="lg"
                hide-details
                class="mb-4"
              />

              <v-btn
                color="deep-purple"
                variant="tonal"
                prepend-icon="mdi-camera"
                rounded="lg"
                block
                @click="viewerRef?.takeScreenshot()"
              >
                Screenshot
              </v-btn>
            </v-card>
          </v-col>
        </v-row>
      </v-tabs-window-item>

      <!-- ── Atom tab ──────────────────────────────────────────────────── -->
      <v-tabs-window-item value="atom">
        <v-row>
          <v-col cols="12" md="8">
            <div style="position: relative; height: 460px; border-radius: 8px; overflow: hidden;">
              <ClientOnly>
                <TresCanvas
                  :clear-color="atomBgColor"
                  :antialias="true"
                  style="position: absolute; inset: 0; width: 100%; height: 100%;"
                >
                  <TresPerspectiveCamera :position="([0, 0, 5] as any)" :look-at="([0, 0, 0] as any)" />
                  <OrbitControls :enable-damping="true" :damping-factor="0.05" />
                  <TresAmbientLight :intensity="1.2" />
                  <TresDirectionalLight :position="([5, 8, 6] as any)" :intensity="2.0" />
                  <TresGridHelper v-if="atomShowGrid" :args="[10, 20]" />
                  <CommonAtomScene
                    :protons="selectedElement.protons"
                    :neutrons="selectedElement.neutrons"
                    :shells="selectedElement.shells"
                    :nucleus-color="selectedElement.nucleusColor"
                    :orbit-color="atomOrbitColor"
                    :electron-color="selectedElement.electronColor"
                    :speed="atomSpeed"
                  />
                </TresCanvas>
                <template #fallback>
                  <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;">
                    <v-progress-circular indeterminate color="primary" />
                  </div>
                </template>
              </ClientOnly>
            </div>

            <v-card rounded="lg" variant="tonal" color="deep-purple" class="mt-3 pa-3">
              <div class="d-flex align-center gap-2">
                <v-icon icon="mdi-atom" size="18" />
                <span class="text-caption">
                  Bohr model with animated electrons orbiting a nucleus. Shells and electron counts follow actual atomic configuration.
                </span>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <v-card rounded="lg" class="pa-4">
              <p class="text-body-2 font-weight-bold mb-4">Atom Controls</p>

              <p class="text-caption text-medium-emphasis mb-1">Element</p>
              <v-select
                v-model="selectedElement"
                :items="elementPresets"
                item-title="label"
                return-object
                variant="outlined"
                density="compact"
                rounded="lg"
                hide-details
                class="mb-4"
              />

              <div class="mb-3">
                <p class="text-caption text-medium-emphasis mb-1">
                  {{ selectedElement.protons }} proton{{ selectedElement.protons !== 1 ? 's' : '' }},
                  {{ selectedElement.neutrons }} neutron{{ selectedElement.neutrons !== 1 ? 's' : '' }}
                </p>
                <p class="text-caption text-medium-emphasis">
                  Shells: {{ selectedElement.shells.join(' / ') }}
                  ({{ selectedElement.shells.reduce((a, b) => a + b, 0) }} electrons)
                </p>
              </div>

              <v-slider
                v-model="atomSpeed"
                label="Orbit speed"
                :min="0.1"
                :max="4"
                :step="0.1"
                color="deep-purple"
                density="compact"
                thumb-label
                class="mb-2"
              />

              <p class="text-caption text-medium-emphasis mb-1">Orbit ring colour</p>
              <v-text-field
                v-model="atomOrbitColor"
                type="color"
                variant="outlined"
                density="compact"
                rounded="lg"
                hide-details
                class="mb-4"
              />

              <p class="text-caption text-medium-emphasis mb-1">Background colour</p>
              <v-text-field
                v-model="atomBgColor"
                type="color"
                variant="outlined"
                density="compact"
                rounded="lg"
                hide-details
                class="mb-4"
              />

              <v-switch
                v-model="atomShowGrid"
                label="Show grid"
                color="deep-purple"
                density="compact"
                hide-details
              />
            </v-card>
          </v-col>
        </v-row>
      </v-tabs-window-item>

      <!-- ── Molecule tab ───────────────────────────────────────────────── -->
      <v-tabs-window-item value="molecule">
        <v-row>
          <v-col cols="12" md="8">
            <div style="position: relative; height: 460px; border-radius: 8px; overflow: hidden;">
              <ClientOnly>
                <TresCanvas
                  :clear-color="molBgColor"
                  :antialias="true"
                  style="position: absolute; inset: 0; width: 100%; height: 100%;"
                >
                  <TresPerspectiveCamera :position="([0, 0, 7] as any)" :look-at="([0, 0, 0] as any)" />
                  <OrbitControls :enable-damping="true" :damping-factor="0.05" />
                  <TresAmbientLight :intensity="1.4" />
                  <TresDirectionalLight :position="([5, 8, 6] as any)" :intensity="2.2" />
                  <TresDirectionalLight :position="([-5, -4, -6] as any)" :intensity="0.6" />
                  <CommonMoleculeScene
                    :molecule="selectedMolecule"
                    :speed="molSpeed"
                    :wireframe="molWireframe"
                  />
                </TresCanvas>
                <template #fallback>
                  <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;">
                    <v-progress-circular indeterminate color="primary" />
                  </div>
                </template>
              </ClientOnly>
            </div>

            <v-card rounded="lg" variant="tonal" color="teal" class="mt-3 pa-3">
              <div class="d-flex align-center gap-2">
                <v-icon icon="mdi-molecule" size="18" />
                <span class="text-caption">
                  Ball-and-stick model. Atom radii are proportional to van der Waals radii.
                  Double bonds render a second cylinder offset alongside the first.
                </span>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <v-card rounded="lg" class="pa-4">
              <p class="text-body-2 font-weight-bold mb-4">Molecule Controls</p>

              <p class="text-caption text-medium-emphasis mb-1">Molecule</p>
              <v-select
                v-model="selectedMolecule"
                :items="molecules"
                item-title="name"
                return-object
                variant="outlined"
                density="compact"
                rounded="lg"
                hide-details
                class="mb-2"
              />

              <div class="mb-4 mt-1">
                <v-chip size="small" color="teal" variant="tonal" class="mr-1">{{ selectedMolecule.formula }}</v-chip>
                <v-chip size="x-small" variant="tonal" class="mr-1">
                  {{ selectedMolecule.atoms.length }} atoms
                </v-chip>
                <v-chip size="x-small" variant="tonal">
                  {{ selectedMolecule.bonds.length }} bonds
                </v-chip>
              </div>

              <!-- Atom legend -->
              <div class="mb-4">
                <p class="text-caption text-medium-emphasis mb-2">Atom legend</p>
                <div class="d-flex flex-wrap gap-2">
                  <div
                    v-for="atom in [...new Map(selectedMolecule.atoms.map(a => [a.label, a])).values()]"
                    :key="atom.label"
                    class="d-flex align-center gap-1"
                  >
                    <div
                      class="rounded-circle"
                      :style="{ width: '12px', height: '12px', background: atom.color, flexShrink: 0 }"
                    />
                    <span class="text-caption">{{ atom.label }}</span>
                  </div>
                </div>
              </div>

              <v-slider
                v-model="molSpeed"
                label="Rotation speed"
                :min="0.05"
                :max="3"
                :step="0.05"
                color="teal"
                density="compact"
                thumb-label
                class="mb-2"
              />

              <v-switch
                v-model="molWireframe"
                label="Wireframe"
                color="teal"
                density="compact"
                hide-details
                class="mb-2"
              />

              <p class="text-caption text-medium-emphasis mb-1">Background colour</p>
              <v-text-field
                v-model="molBgColor"
                type="color"
                variant="outlined"
                density="compact"
                rounded="lg"
                hide-details
              />
            </v-card>
          </v-col>
        </v-row>
      </v-tabs-window-item>

      <v-tabs-window-item value="custom">
        <v-card rounded="lg" class="pa-5 mb-5">
          <p class="text-body-2 font-weight-bold mb-3">Load a GLTF / GLB model</p>
          <v-row align="center">
            <v-col>
              <v-text-field
                v-model="customUrl"
                label="Model URL (.glb or .gltf)"
                placeholder="https://example.com/model.glb"
                variant="outlined"
                density="compact"
                rounded="lg"
                prepend-inner-icon="mdi-link"
                hide-details
              />
            </v-col>
            <v-col cols="auto">
              <v-btn
                color="deep-purple"
                variant="tonal"
                rounded="lg"
                prepend-icon="mdi-upload"
                @click="loadCustomUrl"
              >
                Load
              </v-btn>
            </v-col>
          </v-row>
          <p class="text-caption text-medium-emphasis mt-2">
            Pre-filled with the KhronosGroup Damaged Helmet sample. The URL must be CORS-accessible.
          </p>
        </v-card>

        <ClientOnly>
          <CommonModelViewer
            v-if="loadedUrl"
            :src="loadedUrl"
            :config="{ autoRotate: true, showGrid: true, backgroundColor: '#0f0f1a' }"
            height="480px"
            @load="onModelLoad"
            @error="onModelError"
          />
          <div v-else class="model-placeholder text-center py-16">
            <v-icon icon="mdi-cube-outline" size="64" class="mb-3 opacity-30" />
            <p class="text-body-1 text-medium-emphasis">Enter a URL above and click Load</p>
          </div>
          <template #fallback>
            <v-card rounded="lg" class="pa-8 text-center">
              <v-progress-circular indeterminate color="primary" />
            </v-card>
          </template>
        </ClientOnly>
      </v-tabs-window-item>
    </v-tabs-window>

    <v-dialog v-model="infoDialog" max-width="640">
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center gap-2 pa-5 pb-2">
          <v-icon icon="mdi-rotate-3d" color="deep-purple" />
          Use Cases
        </v-card-title>
        <v-card-text class="pa-5 pt-3">
          <p class="text-body-2 text-medium-emphasis mb-5">
            The Model Viewer component works across these apps in the template ecosystem.
          </p>
          <v-row>
            <v-col v-for="uc in useCases" :key="uc.app" cols="12" sm="6">
              <div class="d-flex gap-3">
                <v-avatar :color="uc.color" variant="tonal" size="36" rounded="lg" class="flex-shrink-0">
                  <v-icon :icon="uc.icon" size="18" />
                </v-avatar>
                <div>
                  <div class="d-flex align-center gap-1 mb-1">
                    <span class="text-body-2 font-weight-bold">{{ uc.app }}</span>
                    <v-chip :color="uc.color" variant="flat" size="x-small">{{ uc.number }}</v-chip>
                  </div>
                  <p class="text-caption text-medium-emphasis">{{ uc.description }}</p>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-5 pt-0">
          <v-spacer />
          <v-btn variant="tonal" rounded="lg" @click="infoDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbarShow" rounded="lg" :timeout="4000">
      {{ snackbarText }}
      <template #actions>
        <v-btn variant="text" @click="snackbarShow = false">Dismiss</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>
