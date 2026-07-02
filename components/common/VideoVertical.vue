<script setup lang="ts">
/**
 * Vertical video player (9:16) — TikTok / Instagram Reels / YouTube Shorts style.
 * Drop your video files in /public/assets/video/vertical/
 */
const props = withDefaults(defineProps<{
  src: string
  poster?: string
  title?: string
  caption?: string
  /** Show TikTok-style action buttons on the side */
  showActions?: boolean
  autoplay?: boolean
  loop?: boolean
  muted?: boolean
}>(), {
  showActions: true,
  autoplay: false,
  loop: true,
  muted: true,
})

const videoRef = ref<HTMLVideoElement | null>(null)
const isPlaying = ref(props.autoplay)
const isMuted = ref(props.muted)
const progress = ref(0)
const liked = ref(false)
const likeCount = ref(Math.floor(Math.random() * 9000) + 1000)
const commentCount = ref(Math.floor(Math.random() * 500) + 50)
const shareCount = ref(Math.floor(Math.random() * 200) + 20)

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

const onTimeUpdate = () => {
  const v = videoRef.value
  if (!v || !v.duration) return
  progress.value = (v.currentTime / v.duration) * 100
}

const toggleLike = () => {
  liked.value = !liked.value
  likeCount.value += liked.value ? 1 : -1
}

const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)

onMounted(() => {
  if (videoRef.value) {
    videoRef.value.muted = isMuted.value
    if (props.autoplay) videoRef.value.play().catch(() => {})
  }
})
</script>

<template>
  <div class="video-vertical d-flex align-end gap-3" style="max-width: 340px;">
    <!-- Video container -->
    <div
      class="position-relative rounded-xl overflow-hidden bg-black flex-shrink-0"
      style="width: 100%; aspect-ratio: 9/16; cursor: pointer;"
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

      <!-- Tap to play overlay -->
      <Transition name="fade">
        <div
          v-if="!isPlaying"
          class="position-absolute d-flex align-center justify-center"
          style="inset: 0; background: rgba(0,0,0,0.25); pointer-events: none;"
        >
          <v-icon icon="mdi-play" color="white" size="56" style="opacity: 0.9;" />
        </div>
      </Transition>

      <!-- Bottom gradient + info -->
      <div
        class="position-absolute d-flex flex-column justify-end pa-3"
        style="inset: 0; background: linear-gradient(transparent 40%, rgba(0,0,0,0.7)); pointer-events: none;"
      >
        <p v-if="title" class="text-body-2 font-weight-bold text-white mb-1">{{ title }}</p>
        <p v-if="caption" class="text-caption text-white mb-2" style="opacity: 0.85;">{{ caption }}</p>

        <!-- Progress bar -->
        <div class="rounded" style="height: 2px; background: rgba(255,255,255,0.3);">
          <div
            class="rounded bg-white"
            style="height: 100%; transition: width 0.1s;"
            :style="{ width: progress + '%' }"
          />
        </div>
      </div>

      <!-- Mute toggle -->
      <div class="position-absolute" style="top: 12px; right: 12px; pointer-events: all;">
        <v-btn
          :icon="isMuted ? 'mdi-volume-off' : 'mdi-volume-high'"
          size="x-small"
          variant="tonal"
          color="white"
          style="background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);"
          @click.stop="toggleMute"
        />
      </div>
    </div>

    <!-- Side action buttons (TikTok-style) -->
    <div v-if="showActions" class="d-flex flex-column align-center gap-4 pb-6">
      <div class="d-flex flex-column align-center gap-1">
        <v-btn
          :icon="liked ? 'mdi-heart' : 'mdi-heart-outline'"
          :color="liked ? 'error' : 'white'"
          variant="text"
          size="small"
          @click="toggleLike"
        />
        <span class="text-caption text-white" style="font-size: 10px;">{{ fmt(likeCount) }}</span>
      </div>
      <div class="d-flex flex-column align-center gap-1">
        <v-btn icon="mdi-comment-outline" color="white" variant="text" size="small" />
        <span class="text-caption text-white" style="font-size: 10px;">{{ fmt(commentCount) }}</span>
      </div>
      <div class="d-flex flex-column align-center gap-1">
        <v-btn icon="mdi-share-variant-outline" color="white" variant="text" size="small" />
        <span class="text-caption text-white" style="font-size: 10px;">{{ fmt(shareCount) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
