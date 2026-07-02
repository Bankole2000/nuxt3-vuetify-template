<script setup lang="ts">
const props = withDefaults(defineProps<{
  src: string
  title?: string
  artist?: string
  album?: string
  cover?: string
  /** Show compact single-row layout */
  compact?: boolean
  autoplay?: boolean
  loop?: boolean
}>(), {
  title: 'Unknown track',
  compact: false,
  autoplay: false,
  loop: false,
})

const emit = defineEmits<{
  (e: 'play'): void
  (e: 'pause'): void
  (e: 'ended'): void
}>()

const audioRef = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const isMuted = ref(false)
const volume = ref(0.8)
const currentTime = ref(0)
const duration = ref(0)
const isLoading = ref(true)
const hasError = ref(false)
const showVolumeSlider = ref(false)

const progressPct = computed(() => duration.value ? (currentTime.value / duration.value) * 100 : 0)

const fmt = (s: number) => {
  if (!isFinite(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

const volumeIcon = computed(() => {
  if (isMuted.value || volume.value === 0) return 'mdi-volume-off'
  if (volume.value < 0.5) return 'mdi-volume-medium'
  return 'mdi-volume-high'
})

const togglePlay = () => {
  const a = audioRef.value
  if (!a) return
  if (isPlaying.value) { a.pause() }
  else { a.play() }
}

const toggleMute = () => {
  if (!audioRef.value) return
  isMuted.value = !isMuted.value
  audioRef.value.muted = isMuted.value
}

const setVolume = (val: number) => {
  if (!audioRef.value) return
  volume.value = val
  audioRef.value.volume = val
  isMuted.value = val === 0
  audioRef.value.muted = isMuted.value
}

const seek = (e: MouseEvent) => {
  const bar = e.currentTarget as HTMLElement
  const pct = e.offsetX / bar.clientWidth
  if (audioRef.value) audioRef.value.currentTime = pct * duration.value
}

const skip = (secs: number) => {
  if (audioRef.value) audioRef.value.currentTime = Math.max(0, Math.min(duration.value, audioRef.value.currentTime + secs))
}

onMounted(() => {
  if (!audioRef.value) return
  audioRef.value.volume = volume.value
  if (props.autoplay) audioRef.value.play().catch(() => {})
})
</script>

<template>
  <div>
    <audio
      ref="audioRef"
      :src="src"
      :loop="loop"
      preload="metadata"
      @play="isPlaying = true; emit('play')"
      @pause="isPlaying = false; emit('pause')"
      @ended="isPlaying = false; emit('ended')"
      @timeupdate="currentTime = audioRef?.currentTime ?? 0"
      @loadedmetadata="duration = audioRef?.duration ?? 0; isLoading = false"
      @waiting="isLoading = true"
      @canplay="isLoading = false"
      @error="hasError = true; isLoading = false"
    />

    <!-- Full layout -->
    <v-card v-if="!compact" rounded="xl" elevation="0" border>
      <div class="d-flex flex-column align-center pa-6 gap-4">
        <!-- Cover art -->
        <v-avatar size="160" rounded="xl" color="surface-variant">
          <v-img v-if="cover" :src="cover" cover />
          <v-icon v-else icon="mdi-music" size="64" color="medium-emphasis" />
        </v-avatar>

        <!-- Track info -->
        <div class="text-center">
          <p class="text-body-1 font-weight-bold mb-0">{{ title }}</p>
          <p v-if="artist" class="text-body-2 text-medium-emphasis mb-0">{{ artist }}</p>
          <p v-if="album" class="text-caption text-disabled mb-0">{{ album }}</p>
        </div>

        <!-- Error -->
        <v-alert v-if="hasError" type="error" variant="tonal" density="compact" rounded="lg">
          Could not load audio
        </v-alert>

        <!-- Progress -->
        <div class="w-100">
          <div
            class="progress-track rounded cursor-pointer position-relative mb-1"
            style="height: 4px; background: rgba(var(--v-border-color), 0.2);"
            @click="seek"
          >
            <div
              class="rounded bg-primary position-absolute"
              style="top: 0; left: 0; height: 100; transition: width 0.1s;"
              :style="{ width: progressPct + '%', height: '100%' }"
            />
            <div
              class="rounded-circle bg-primary position-absolute"
              style="top: 50%; transform: translate(-50%, -50%); width: 12px; height: 12px;"
              :style="{ left: progressPct + '%' }"
            />
          </div>
          <div class="d-flex justify-space-between">
            <span class="text-caption text-medium-emphasis">{{ fmt(currentTime) }}</span>
            <span class="text-caption text-medium-emphasis">{{ fmt(duration) }}</span>
          </div>
        </div>

        <!-- Controls -->
        <div class="d-flex align-center gap-2">
          <v-btn icon="mdi-rewind-10" variant="text" size="small" @click="skip(-10)" />
          <v-btn
            :icon="isPlaying ? 'mdi-pause-circle' : 'mdi-play-circle'"
            :loading="isLoading"
            color="primary"
            variant="tonal"
            size="x-large"
            :disabled="hasError"
            @click="togglePlay"
          />
          <v-btn icon="mdi-fast-forward-10" variant="text" size="small" @click="skip(10)" />
        </div>

        <!-- Volume -->
        <div
          class="d-flex align-center gap-2 w-100"
          style="max-width: 240px;"
          @mouseenter="showVolumeSlider = true"
          @mouseleave="showVolumeSlider = false"
        >
          <v-btn :icon="volumeIcon" variant="text" size="small" density="compact" @click="toggleMute" />
          <v-slider
            :model-value="isMuted ? 0 : volume"
            min="0"
            max="1"
            step="0.02"
            density="compact"
            hide-details
            color="primary"
            @update:model-value="setVolume"
          />
        </div>
      </div>
    </v-card>

    <!-- Compact layout -->
    <v-card v-else rounded="lg" elevation="0" border>
      <div class="d-flex align-center pa-3 gap-3">
        <!-- Cover -->
        <v-avatar size="44" rounded="lg" color="surface-variant" class="flex-shrink-0">
          <v-img v-if="cover" :src="cover" cover />
          <v-icon v-else icon="mdi-music" size="20" color="medium-emphasis" />
        </v-avatar>

        <!-- Info + progress -->
        <div class="flex-1 overflow-hidden">
          <p class="text-body-2 font-weight-bold text-truncate mb-0">{{ title }}</p>
          <p v-if="artist" class="text-caption text-medium-emphasis text-truncate mb-1">{{ artist }}</p>
          <div
            class="progress-track rounded cursor-pointer position-relative"
            style="height: 3px; background: rgba(var(--v-border-color), 0.2);"
            @click="seek"
          >
            <div
              class="rounded bg-primary position-absolute"
              style="top: 0; left: 0; height: 100%; transition: width 0.1s;"
              :style="{ width: progressPct + '%' }"
            />
          </div>
          <div class="d-flex justify-space-between mt-1">
            <span class="text-caption text-disabled">{{ fmt(currentTime) }}</span>
            <span class="text-caption text-disabled">{{ fmt(duration) }}</span>
          </div>
        </div>

        <!-- Controls -->
        <div class="d-flex align-center gap-0 flex-shrink-0">
          <v-btn icon="mdi-rewind-10" variant="text" size="x-small" @click="skip(-10)" />
          <v-btn
            :icon="isPlaying ? 'mdi-pause-circle' : 'mdi-play-circle'"
            :loading="isLoading"
            color="primary"
            variant="text"
            size="small"
            :disabled="hasError"
            @click="togglePlay"
          />
          <v-btn icon="mdi-fast-forward-10" variant="text" size="x-small" @click="skip(10)" />
        </div>

        <!-- Volume icon only in compact -->
        <v-btn :icon="volumeIcon" variant="text" size="x-small" @click="toggleMute" />
      </div>
    </v-card>
  </div>
</template>

<style scoped>
.progress-track:hover { height: 5px !important; }
</style>
