<script setup lang="ts">
export interface ModelViewerConfig {
  autoRotate:       boolean
  wireframe:        boolean
  showAxes:         boolean
  showGrid:         boolean
  environment:      'studio' | 'sunset' | 'dawn' | 'night'
  backgroundColor:  string
}

const props = withDefaults(defineProps<{
  src?:             string
  config?:          Partial<ModelViewerConfig>
  height?:          string
  autoRotateSpeed?: number
}>(), {
  height:          '480px',
  autoRotateSpeed: 1.0,
})

const emit = defineEmits<{
  (e: 'load'): void
  (e: 'error', message: string): void
}>()

const mergedConfig = computed<ModelViewerConfig>(() => ({
  autoRotate:      props.config?.autoRotate      ?? true,
  wireframe:       props.config?.wireframe       ?? false,
  showAxes:        props.config?.showAxes        ?? false,
  showGrid:        props.config?.showGrid        ?? true,
  environment:     props.config?.environment     ?? 'studio',
  backgroundColor: props.config?.backgroundColor ?? '#1a1a2e',
}))

interface LightPreset {
  ambientColor:     number
  ambientIntensity: number
  dirColor:         number
  dirIntensity:     number
}

const lightPresets: Record<ModelViewerConfig['environment'], LightPreset> = {
  studio: { ambientColor: 0xffffff, ambientIntensity: 1.5, dirColor: 0xffffff, dirIntensity: 2.5 },
  sunset: { ambientColor: 0xff9966, ambientIntensity: 0.8, dirColor: 0xff6633, dirIntensity: 2.0 },
  dawn:   { ambientColor: 0xaaccff, ambientIntensity: 1.0, dirColor: 0x99bbff, dirIntensity: 1.8 },
  night:  { ambientColor: 0x112244, ambientIntensity: 0.3, dirColor: 0x334466, dirIntensity: 0.6 },
}

const lights = computed(() => lightPresets[mergedConfig.value.environment]!)

// ── GLTF loading ──────────────────────────────────────────────────────────

const gltfScene = ref<any>(null)
const isLoading = ref(false)
const loadError = ref('')

async function loadGltf(url: string) {
  isLoading.value = true
  loadError.value = ''
  gltfScene.value = null
  try {
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
    const loader = new (GLTFLoader as any)()
    const gltf: any = await new Promise((resolve, reject) => {
      loader.load(url, resolve, undefined, reject)
    })
    gltfScene.value = gltf.scene
    emit('load')
  } catch (err: any) {
    loadError.value = err?.message ?? 'Failed to load model'
    emit('error', loadError.value)
  } finally {
    isLoading.value = false
  }
}

watch(() => props.src, (url) => { if (url) loadGltf(url) }, { immediate: true })

// ── Screenshot via querySelector on the wrapper ───────────────────────────

const rootRef = ref<HTMLElement | null>(null)

function takeScreenshot() {
  const canvas = rootRef.value?.querySelector('canvas')
  if (!canvas) return
  const link    = document.createElement('a')
  link.download = 'model-screenshot.png'
  link.href     = canvas.toDataURL('image/png')
  link.click()
}

defineExpose({ takeScreenshot })
</script>

<template>
  <div ref="rootRef" class="mv-root" :style="{ height }">
    <!-- Loading overlay -->
    <div v-if="isLoading" class="mv-overlay">
      <v-progress-circular indeterminate color="primary" size="48" />
      <p class="text-body-2 mt-3 text-white">Loading model…</p>
    </div>

    <!-- Error overlay -->
    <div v-else-if="loadError" class="mv-overlay">
      <v-icon icon="mdi-alert-circle-outline" color="error" size="48" class="mb-2" />
      <p class="text-body-2 font-weight-bold text-white">Failed to load</p>
      <p class="text-caption text-white opacity-70 mt-1 text-center px-4">{{ loadError }}</p>
    </div>

    <!-- Screenshot button -->
    <div class="mv-toolbar">
      <v-btn size="x-small" variant="tonal" icon="mdi-camera" title="Screenshot" @click="takeScreenshot" />
    </div>

    <TresCanvas
      :clear-color="mergedConfig.backgroundColor"
      :antialias="true"
      :preserve-drawing-buffer="true"
      class="mv-canvas"
    >
      <TresPerspectiveCamera :position="([0, 2, 7] as any)" :look-at="([0, 0, 0] as any)" />
      <OrbitControls :enable-damping="true" :damping-factor="0.05" />

      <TresAmbientLight :color="lights.ambientColor" :intensity="lights.ambientIntensity" />
      <TresDirectionalLight
        :color="lights.dirColor"
        :intensity="lights.dirIntensity"
        :position="([5, 10, 7] as any)"
      />

      <TresAxesHelper v-if="mergedConfig.showAxes" :args="[3]" />
      <TresGridHelper v-if="mergedConfig.showGrid" :args="[10, 20]" />

      <!-- Scene logic lives in a child component so useLoop() has TresCanvas context -->
      <CommonModelViewerScene
        :config="mergedConfig"
        :gltf-scene="gltfScene"
        :auto-rotate-speed="autoRotateSpeed"
      />
    </TresCanvas>
  </div>
</template>

<style scoped>
.mv-root {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 8px;
}

.mv-canvas {
  position: absolute !important;
  inset: 0;
  width: 100% !important;
  height: 100% !important;
}

.mv-overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
}

.mv-toolbar {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  display: flex;
  gap: 4px;
}
</style>
