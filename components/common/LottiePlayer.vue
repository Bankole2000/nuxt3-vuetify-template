<script setup lang="ts">
export interface LottieConfig {
  loop:      boolean
  autoplay:  boolean
  speed:     number
  direction: 1 | -1
}

const props = withDefaults(defineProps<{
  src?:           string
  animationData?: object
  config?:        Partial<LottieConfig>
  height?:        string
}>(), {
  height: '300px',
})

const emit = defineEmits<{
  (e: 'complete'): void
  (e: 'loop-complete'): void
  (e: 'enter-frame', frame: number): void
}>()

const mergedConfig = computed<LottieConfig>(() => ({
  loop:      props.config?.loop      ?? true,
  autoplay:  props.config?.autoplay  ?? true,
  speed:     props.config?.speed     ?? 1,
  direction: props.config?.direction ?? 1,
}))

const isPlaying  = ref(false)
const loop       = ref(mergedConfig.value.loop)
const speed      = ref(mergedConfig.value.speed)
const direction  = ref<1 | -1>(mergedConfig.value.direction)
const totalFrames = ref(60)
const currentFrame = ref(0)

const containerEl = ref<HTMLElement | null>(null)
let lottieInstance: {
  play: () => void
  pause: () => void
  stop: () => void
  destroy: () => void
  setSpeed: (s: number) => void
  setDirection: (d: 1 | -1) => void
  goToAndStop: (frame: number, isFrame: boolean) => void
  totalFrames: number
  addEventListener: (evt: string, cb: (...args: any[]) => void) => void
  removeEventListener: (evt: string, cb: (...args: any[]) => void) => void
} | null = null

const loaded = ref(false)
const lottieAvailable = ref(false)

async function tryLoadLottie() {
  try {
    const mod = await new Function('return import("lottie-web")')()
    lottieAvailable.value = true
    return (mod as any).default ?? mod
  }
  catch {
    lottieAvailable.value = false
    return null
  }
}

async function mountLottie() {
  const lottie = await tryLoadLottie()
  if (!lottie || !containerEl.value) return

  lottieInstance?.destroy()

  const params: Record<string, unknown> = {
    container: containerEl.value,
    renderer:  'svg',
    loop:      loop.value,
    autoplay:  mergedConfig.value.autoplay,
  }

  if (props.animationData) {
    params.animationData = props.animationData
  } else if (props.src) {
    params.path = props.src
  } else {
    return
  }

  lottieInstance = lottie.loadAnimation(params as any)
  if (!lottieInstance) return

  lottieInstance.setSpeed(speed.value)
  lottieInstance.setDirection(direction.value)

  lottieInstance.addEventListener('config_ready', () => {
    totalFrames.value = lottieInstance?.totalFrames ?? 60
    loaded.value = true
    isPlaying.value = mergedConfig.value.autoplay
  })

  lottieInstance.addEventListener('complete', () => {
    isPlaying.value = false
    emit('complete')
  })

  lottieInstance.addEventListener('loopComplete', () => {
    emit('loop-complete')
  })

  lottieInstance.addEventListener('enterFrame', (e: any) => {
    currentFrame.value = Math.floor(e?.currentTime ?? 0)
    emit('enter-frame', currentFrame.value)
  })
}

onMounted(() => {
  mountLottie()
})

onUnmounted(() => {
  lottieInstance?.destroy()
  lottieInstance = null
})

watch([() => props.src, () => props.animationData], () => {
  loaded.value = false
  mountLottie()
})

function play() {
  lottieInstance?.play()
  isPlaying.value = true
}

function pause() {
  lottieInstance?.pause()
  isPlaying.value = false
}

function stop() {
  lottieInstance?.stop()
  isPlaying.value = false
  currentFrame.value = 0
}

function toggleDirection() {
  direction.value = direction.value === 1 ? -1 : 1
  lottieInstance?.setDirection(direction.value)
}

function toggleLoop() {
  loop.value = !loop.value
  if (lottieInstance) {
    lottieInstance.destroy()
    mountLottie()
  }
}

function onSpeedChange(val: number | string) {
  speed.value = Number(val)
  lottieInstance?.setSpeed(speed.value)
}

function onFrameScrub(val: number | string) {
  const frame = Number(val)
  currentFrame.value = frame
  lottieInstance?.goToAndStop(frame, true)
  isPlaying.value = false
}

const framePercent = computed(() =>
  totalFrames.value === 0 ? 0 : Math.round((currentFrame.value / totalFrames.value) * 100),
)

const speedLabels: Record<number, string> = {
  0.25: '0.25×',
  0.5:  '0.5×',
  0.75: '0.75×',
  1:    '1×',
  1.5:  '1.5×',
  2:    '2×',
  3:    '3×',
}

const cssShapes = [
  { cls: 'shape-circle',   color: 'rgb(var(--v-theme-primary))',   delay: '0s',    size: '48px' },
  { cls: 'shape-square',   color: 'rgb(var(--v-theme-secondary))', delay: '0.4s',  size: '40px' },
  { cls: 'shape-triangle', color: 'rgb(var(--v-theme-error))',     delay: '0.8s',  size: '44px' },
  { cls: 'shape-circle',   color: 'rgb(var(--v-theme-success))',   delay: '1.2s',  size: '32px' },
]
</script>

<template>
  <div>
    <v-card rounded="xl" elevation="0" border>
      <v-card-text class="pa-0">

        <div
          class="position-relative d-flex align-center justify-center overflow-hidden"
          :style="{ minHeight: height, background: 'rgba(var(--v-border-color), 0.04)' }"
        >
          <div
            v-if="lottieAvailable"
            ref="containerEl"
            class="w-100 h-100 position-absolute"
            style="top: 0; left: 0;"
          />

          <div v-if="!lottieAvailable" class="d-flex flex-column align-center justify-center pa-6 text-center" style="gap: 16px;">
            <div class="css-anim-stage d-flex align-center justify-center" style="gap: 20px; height: 80px;">
              <div
                v-for="(shape, i) in cssShapes"
                :key="i"
                class="css-shape"
                :class="shape.cls"
                :style="{
                  width:  shape.size,
                  height: shape.size,
                  background: shape.color,
                  '--delay': shape.delay,
                }"
              />
            </div>
            <v-alert
              type="info"
              variant="tonal"
              density="compact"
              icon="mdi-package-variant-plus"
              class="mt-2 text-left"
              style="max-width: 380px;"
            >
              <strong>lottie-web not installed.</strong>
              <br>
              <code class="text-caption">npm install lottie-web</code>
            </v-alert>
          </div>

          <div v-if="lottieAvailable && !loaded && (src || animationData)" class="d-flex align-center justify-center">
            <v-progress-circular indeterminate color="primary" />
          </div>
        </div>

        <div v-if="lottieAvailable" class="pa-4 border-t">
          <div class="d-flex align-center gap-2 mb-3">
            <v-btn icon="mdi-stop" variant="text" size="small" density="compact" @click="stop" />
            <v-btn
              :icon="isPlaying ? 'mdi-pause' : 'mdi-play'"
              color="primary"
              variant="tonal"
              size="small"
              @click="isPlaying ? pause() : play()"
            />
            <v-btn
              :icon="direction === 1 ? 'mdi-play-speed' : 'mdi-rewind'"
              :color="direction === -1 ? 'secondary' : 'default'"
              variant="text"
              size="small"
              density="compact"
              :title="direction === 1 ? 'Forward' : 'Reverse'"
              @click="toggleDirection"
            />
            <v-btn
              :icon="loop ? 'mdi-repeat' : 'mdi-repeat-off'"
              :color="loop ? 'primary' : 'default'"
              variant="text"
              size="small"
              density="compact"
              @click="toggleLoop"
            />
            <v-spacer />
            <span class="text-caption text-medium-emphasis font-weight-medium">
              {{ currentFrame }} / {{ totalFrames }} frames
            </span>
          </div>

          <div class="mb-3">
            <p class="text-caption text-medium-emphasis mb-1">Frame scrubber ({{ framePercent }}%)</p>
            <v-slider
              :model-value="currentFrame"
              :min="0"
              :max="totalFrames"
              :step="1"
              density="compact"
              hide-details
              color="primary"
              track-color="surface-variant"
              @update:model-value="onFrameScrub"
            />
          </div>

          <div>
            <p class="text-caption text-medium-emphasis mb-1">Speed: {{ speedLabels[speed] ?? `${speed}×` }}</p>
            <v-slider
              :model-value="speed"
              :min="0.25"
              :max="3"
              :step="0.25"
              density="compact"
              hide-details
              color="primary"
              track-color="surface-variant"
              :ticks="speedLabels"
              show-ticks="always"
              tick-size="3"
              @update:model-value="onSpeedChange"
            />
          </div>
        </div>

        <div v-else class="pa-4 border-t">
          <div class="d-flex align-center gap-2 flex-wrap">
            <v-chip size="small" variant="tonal">CSS animation fallback active</v-chip>
            <v-chip size="small" variant="tonal" color="info">Shapes animate infinitely via @keyframes</v-chip>
          </div>
        </div>

      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
.css-shape {
  border-radius: 8px;
  animation: float-shape 2s ease-in-out infinite alternate;
  animation-delay: var(--delay, 0s);
}

.shape-circle {
  border-radius: 50%;
}

.shape-triangle {
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  border-radius: 0;
}

@keyframes float-shape {
  0%   { transform: translateY(0)    scale(1)    rotate(0deg); }
  100% { transform: translateY(-20px) scale(1.15) rotate(20deg); }
}
</style>
