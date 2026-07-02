<script setup lang="ts">
/**
 * Square video player (1:1) — Instagram feed / social media post style.
 * Drop your video files in /public/assets/video/square/
 */
const props = withDefaults(defineProps<{
  src: string
  poster?: string
  title?: string
  username?: string
  avatar?: string
  caption?: string
  autoplay?: boolean
  loop?: boolean
  muted?: boolean
}>(), {
  username: '@username',
  autoplay: false,
  loop: true,
  muted: true,
})

const videoRef = ref<HTMLVideoElement | null>(null)
const isPlaying = ref(props.autoplay)
const isMuted = ref(props.muted)
const progress = ref(0)
const liked = ref(false)
const likeCount = ref(Math.floor(Math.random() * 5000) + 200)
const saved = ref(false)
const showPlayIcon = ref(false)
let playIconTimer: ReturnType<typeof setTimeout> | null = null

const togglePlay = () => {
  const v = videoRef.value
  if (!v) return
  if (isPlaying.value) {
    v.pause()
  }
  else {
    v.play()
    showPlayIcon.value = true
    if (playIconTimer) clearTimeout(playIconTimer)
    playIconTimer = setTimeout(() => { showPlayIcon.value = false }, 600)
  }
}

const toggleMute = () => {
  if (!videoRef.value) return
  isMuted.value = !isMuted.value
  videoRef.value.muted = isMuted.value
}

const onTimeUpdate = () => {
  const v = videoRef.value
  if (!v || !v.duration) return
  progress.value = (v.currentTime / v.duration) * 100
}

const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)

onMounted(() => {
  if (videoRef.value) {
    videoRef.value.muted = isMuted.value
    if (props.autoplay) videoRef.value.play().catch(() => {})
  }
})
onUnmounted(() => { if (playIconTimer) clearTimeout(playIconTimer) })
</script>

<template>
  <div class="video-square" style="max-width: 480px;">
    <!-- Post header -->
    <div class="d-flex align-center gap-3 pa-3">
      <v-avatar size="36" :color="avatar ? undefined : 'primary'" :image="avatar">
        <span v-if="!avatar" class="text-body-2 font-weight-bold text-white">
          {{ username.replace('@', '').charAt(0).toUpperCase() }}
        </span>
      </v-avatar>
      <div class="flex-1">
        <p class="text-body-2 font-weight-bold mb-0">{{ username }}</p>
      </div>
      <v-btn icon="mdi-dots-horizontal" variant="text" size="small" />
    </div>

    <!-- Square video -->
    <div
      class="position-relative overflow-hidden bg-black"
      style="aspect-ratio: 1/1; cursor: pointer;"
      @click="togglePlay"
    >
      <video
        ref="videoRef"
        :src="src"
        :poster="poster"
        :loop="loop"
        :muted="muted"
        class="d-block w-100 h-100"
        style="object-fit: cover;"
        playsinline
        preload="metadata"
        @play="isPlaying = true"
        @pause="isPlaying = false"
        @timeupdate="onTimeUpdate"
      />

      <!-- Tap flash icon -->
      <Transition name="pop">
        <v-icon
          v-if="showPlayIcon"
          icon="mdi-play"
          color="white"
          size="64"
          class="position-absolute"
          style="inset: 0; margin: auto; pointer-events: none; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.5));"
        />
      </Transition>

      <!-- Mute toggle -->
      <div class="position-absolute" style="bottom: 10px; right: 10px;">
        <v-btn
          :icon="isMuted ? 'mdi-volume-off' : 'mdi-volume-high'"
          size="x-small"
          variant="tonal"
          color="white"
          style="background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);"
          @click.stop="toggleMute"
        />
      </div>

      <!-- Progress bar -->
      <div
        class="position-absolute"
        style="bottom: 0; left: 0; right: 0; height: 2px; background: rgba(255,255,255,0.2);"
      >
        <div
          class="bg-white"
          style="height: 100%; transition: width 0.1s;"
          :style="{ width: progress + '%' }"
        />
      </div>
    </div>

    <!-- Action bar -->
    <div class="d-flex align-center pa-2 gap-1">
      <v-btn
        :icon="liked ? 'mdi-heart' : 'mdi-heart-outline'"
        :color="liked ? 'error' : 'default'"
        variant="text"
        size="small"
        @click="liked = !liked; likeCount += liked ? 1 : -1"
      />
      <v-btn icon="mdi-comment-outline" variant="text" size="small" />
      <v-btn icon="mdi-send-outline" variant="text" size="small" />
      <v-spacer />
      <v-btn
        :icon="saved ? 'mdi-bookmark' : 'mdi-bookmark-outline'"
        variant="text"
        size="small"
        @click="saved = !saved"
      />
    </div>

    <!-- Likes + caption -->
    <div class="px-3 pb-3">
      <p class="text-body-2 font-weight-bold mb-1">{{ fmt(likeCount) }} likes</p>
      <p v-if="caption || title" class="text-body-2 mb-0">
        <span class="font-weight-bold mr-1">{{ username }}</span>
        <span class="text-medium-emphasis">{{ caption ?? title }}</span>
      </p>
    </div>
  </div>
</template>

<style scoped>
.pop-enter-active { transition: opacity 0.15s, transform 0.15s; }
.pop-leave-active { transition: opacity 0.4s, transform 0.4s; }
.pop-enter-from { opacity: 0; transform: scale(0.5); }
.pop-leave-to { opacity: 0; transform: scale(1.4); }
</style>
