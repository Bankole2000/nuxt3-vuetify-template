<script setup lang="ts">
const props = withDefaults(defineProps<{
  src: string
  poster?: string
  title?: string
  autoplay?: boolean
  loop?: boolean
  muted?: boolean
  /** show download button in controls */
  downloadable?: boolean
}>(), {
  autoplay: false,
  loop: false,
  muted: false,
  downloadable: false,
})

const emit = defineEmits<{
  (e: 'play'): void
  (e: 'pause'): void
  (e: 'ended'): void
  (e: 'timeupdate', time: number): void
}>()

const videoRef = ref<HTMLVideoElement | null>(null)
const isPlaying = ref(false)
const isMuted = ref(props.muted)
const volume = ref(1)
const currentTime = ref(0)
const duration = ref(0)
const buffered = ref(0)
const isFullscreen = ref(false)
const showControls = ref(true)
const isLoading = ref(true)
const hasError = ref(false)
const showVolumeSlider = ref(false)

let hideControlsTimer: ReturnType<typeof setTimeout> | null = null

// Time formatting
const fmt = (s: number) => {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

const progressPct = computed(() => duration.value ? (currentTime.value / duration.value) * 100 : 0)
const bufferedPct = computed(() => duration.value ? (buffered.value / duration.value) * 100 : 0)

const volumeIcon = computed(() => {
  if (isMuted.value || volume.value === 0) return 'mdi-volume-off'
  if (volume.value < 0.5) return 'mdi-volume-medium'
  return 'mdi-volume-high'
})

// Controls auto-hide
const resetHideTimer = () => {
  showControls.value = true
  if (hideControlsTimer) clearTimeout(hideControlsTimer)
  if (isPlaying.value) {
    hideControlsTimer = setTimeout(() => { showControls.value = false }, 3000)
  }
}

const togglePlay = () => {
  const v = videoRef.value
  if (!v) return
  if (isPlaying.value) { v.pause() }
  else { v.play() }
}

const toggleMute = () => {
  if (!videoRef.value) return
  isMuted.value = !isMuted.value
  videoRef.value.muted = isMuted.value
}

const setVolume = (val: number) => {
  if (!videoRef.value) return
  volume.value = val
  videoRef.value.volume = val
  isMuted.value = val === 0
  videoRef.value.muted = isMuted.value
}

const seek = (e: MouseEvent) => {
  const bar = (e.currentTarget as HTMLElement)
  const pct = e.offsetX / bar.clientWidth
  if (videoRef.value) videoRef.value.currentTime = pct * duration.value
}

const toggleFullscreen = async () => {
  const el = videoRef.value?.parentElement
  if (!el) return
  if (!document.fullscreenElement) {
    await el.requestFullscreen()
    isFullscreen.value = true
  }
  else {
    await document.exitFullscreen()
    isFullscreen.value = false
  }
}

const download = () => {
  const a = document.createElement('a')
  a.href = props.src
  a.download = props.title ?? 'video'
  a.click()
}

// Video event handlers
const onPlay = () => { isPlaying.value = true; emit('play'); resetHideTimer() }
const onPause = () => { isPlaying.value = false; showControls.value = true; emit('pause') }
const onEnded = () => { isPlaying.value = false; showControls.value = true; emit('ended') }
const onTimeUpdate = () => {
  if (!videoRef.value) return
  currentTime.value = videoRef.value.currentTime
  emit('timeupdate', currentTime.value)
  const buf = videoRef.value.buffered
  if (buf.length) buffered.value = buf.end(buf.length - 1)
}
const onLoadedMetadata = () => {
  if (!videoRef.value) return
  duration.value = videoRef.value.duration
  isLoading.value = false
}
const onWaiting = () => { isLoading.value = true }
const onCanPlay = () => { isLoading.value = false }
const onError = () => { isLoading.value = false; hasError.value = true }
const onFullscreenChange = () => { isFullscreen.value = !!document.fullscreenElement }

onMounted(() => {
  document.addEventListener('fullscreenchange', onFullscreenChange)
  if (videoRef.value) {
    videoRef.value.volume = volume.value
    videoRef.value.muted = isMuted.value
  }
})
onUnmounted(() => {
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  if (hideControlsTimer) clearTimeout(hideControlsTimer)
})
</script>

<template>
  <div
    class="video-player rounded-lg overflow-hidden bg-black position-relative"
    @mousemove="resetHideTimer"
    @mouseleave="showControls = !isPlaying || true"
    @click.self="togglePlay"
  >
    <!-- Video element -->
    <video
      ref="videoRef"
      :src="src"
      :poster="poster"
      :autoplay="autoplay"
      :loop="loop"
      :muted="muted"
      class="d-block w-100"
      style="max-height: 480px; object-fit: contain;"
      preload="metadata"
      @play="onPlay"
      @pause="onPause"
      @ended="onEnded"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @waiting="onWaiting"
      @canplay="onCanPlay"
      @error="onError"
      @click="togglePlay"
    />

    <!-- Buffering spinner -->
    <div
      v-if="isLoading && !hasError"
      class="position-absolute d-flex align-center justify-center"
      style="inset: 0; pointer-events: none;"
    >
      <v-progress-circular indeterminate color="white" size="48" />
    </div>

    <!-- Error state -->
    <div
      v-if="hasError"
      class="position-absolute d-flex flex-column align-center justify-center gap-3"
      style="inset: 0; background: rgba(0,0,0,0.7);"
    >
      <v-icon icon="mdi-alert-circle-outline" color="error" size="48" />
      <p class="text-body-2 text-white">Could not load video</p>
    </div>

    <!-- Big play button (paused, not loading) -->
    <Transition name="fade-btn">
      <div
        v-if="!isPlaying && !isLoading && !hasError"
        class="position-absolute d-flex align-center justify-center"
        style="inset: 0; pointer-events: none;"
      >
        <v-btn
          icon="mdi-play"
          color="white"
          variant="tonal"
          size="x-large"
          style="pointer-events: all; background: rgba(0,0,0,0.45); backdrop-filter: blur(4px);"
          @click="togglePlay"
        />
      </div>
    </Transition>

    <!-- Controls bar -->
    <Transition name="slide-controls">
      <div
        v-show="showControls || !isPlaying"
        class="video-controls position-absolute d-flex flex-column pa-3 gap-1"
        style="bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.75)); pointer-events: all;"
      >
        <!-- Progress bar -->
        <div
          class="progress-bar position-relative rounded cursor-pointer"
          style="height: 4px; background: rgba(255,255,255,0.25);"
          @click="seek"
        >
          <!-- Buffered -->
          <div
            class="position-absolute rounded"
            style="top: 0; left: 0; height: 100%; background: rgba(255,255,255,0.35); transition: width 0.2s;"
            :style="{ width: bufferedPct + '%' }"
          />
          <!-- Played -->
          <div
            class="position-absolute rounded bg-primary"
            style="top: 0; left: 0; height: 100%; transition: width 0.1s;"
            :style="{ width: progressPct + '%' }"
          />
          <!-- Thumb -->
          <div
            class="position-absolute rounded-circle bg-white"
            style="top: 50%; transform: translate(-50%, -50%); width: 12px; height: 12px; transition: left 0.1s;"
            :style="{ left: progressPct + '%' }"
          />
        </div>

        <!-- Buttons row -->
        <div class="d-flex align-center gap-1">
          <!-- Play/Pause -->
          <v-btn
            :icon="isPlaying ? 'mdi-pause' : 'mdi-play'"
            variant="text"
            color="white"
            size="small"
            density="comfortable"
            @click="togglePlay"
          />

          <!-- Volume -->
          <div
            class="d-flex align-center gap-2"
            @mouseenter="showVolumeSlider = true"
            @mouseleave="showVolumeSlider = false"
          >
            <v-btn
              :icon="volumeIcon"
              variant="text"
              color="white"
              size="small"
              density="comfortable"
              @click="toggleMute"
            />
            <Transition name="fade-btn">
              <v-slider
                v-if="showVolumeSlider"
                :model-value="isMuted ? 0 : volume"
                min="0"
                max="1"
                step="0.05"
                density="compact"
                hide-details
                color="white"
                track-color="rgba(255,255,255,0.3)"
                style="width: 80px;"
                @update:model-value="setVolume"
              />
            </Transition>
          </div>

          <!-- Time -->
          <span class="text-caption text-white ml-1" style="white-space: nowrap; font-variant-numeric: tabular-nums;">
            {{ fmt(currentTime) }} / {{ fmt(duration) }}
          </span>

          <v-spacer />

          <!-- Title -->
          <span v-if="title" class="text-caption text-white text-truncate mx-2" style="max-width: 200px;">
            {{ title }}
          </span>

          <!-- Download -->
          <v-btn
            v-if="downloadable"
            icon="mdi-download"
            variant="text"
            color="white"
            size="small"
            density="comfortable"
            @click="download"
          />

          <!-- Fullscreen -->
          <v-btn
            :icon="isFullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'"
            variant="text"
            color="white"
            size="small"
            density="comfortable"
            @click="toggleFullscreen"
          />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.video-player { user-select: none; }

.progress-bar:hover { height: 6px; }
.progress-bar:hover .position-absolute.rounded-circle { width: 14px; height: 14px; }

.fade-btn-enter-active, .fade-btn-leave-active { transition: opacity 0.2s; }
.fade-btn-enter-from, .fade-btn-leave-to { opacity: 0; }

.slide-controls-enter-active, .slide-controls-leave-active { transition: opacity 0.3s, transform 0.3s; }
.slide-controls-enter-from, .slide-controls-leave-to { opacity: 0; transform: translateY(8px); }
</style>
