<script setup lang="ts">
const props = withDefaults(defineProps<{
  /** Full YouTube URL or video ID */
  src: string
  title?: string
  /** Show thumbnail overlay until user clicks play */
  thumbnail?: boolean
  autoplay?: boolean
  /** Start time in seconds */
  start?: number
  /** Aspect ratio (default 16/9) */
  aspectRatio?: string
}>(), {
  thumbnail: true,
  autoplay: false,
  start: 0,
  aspectRatio: '16/9',
})

// Extract video ID from URL or use raw ID
const videoId = computed(() => {
  const s = props.src
  // youtu.be/ID
  const short = s.match(/youtu\.be\/([^?&]+)/)
  if (short) return short[1]
  // youtube.com/watch?v=ID
  const watch = s.match(/[?&]v=([^&]+)/)
  if (watch) return watch[1]
  // youtube.com/embed/ID
  const embed = s.match(/embed\/([^?&]+)/)
  if (embed) return embed[1]
  // youtube.com/shorts/ID
  const shorts = s.match(/shorts\/([^?&]+)/)
  if (shorts) return shorts[1]
  // Assume raw ID
  return s
})

const embedUrl = computed(() => {
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    ...(props.autoplay ? { autoplay: '1' } : {}),
    ...(props.start ? { start: String(props.start) } : {}),
  })
  return `https://www.youtube.com/embed/${videoId.value}?${params}`
})

const thumbnailUrl = computed(() =>
  `https://img.youtube.com/vi/${videoId.value}/maxresdefault.jpg`,
)
const thumbnailFallback = computed(() =>
  `https://img.youtube.com/vi/${videoId.value}/hqdefault.jpg`,
)

const playing = ref(false)
const thumbError = ref(false)

const play = () => { playing.value = true }
</script>

<template>
  <div class="youtube-player rounded-lg overflow-hidden bg-black position-relative" :style="{ aspectRatio }">
    <!-- Thumbnail overlay (before play is clicked) -->
    <template v-if="thumbnail && !playing && !autoplay">
      <img
        :src="thumbError ? thumbnailFallback : thumbnailUrl"
        :alt="title ?? 'YouTube video thumbnail'"
        class="d-block w-100 h-100"
        style="object-fit: cover;"
        @error="thumbError ? null : (thumbError = true)"
      >

      <!-- Dark overlay + play button -->
      <div
        class="position-absolute d-flex flex-column align-center justify-center gap-3"
        style="inset: 0; background: rgba(0,0,0,0.35); cursor: pointer;"
        @click="play"
      >
        <div
          class="d-flex align-center justify-center rounded-circle"
          style="width: 68px; height: 68px; background: #FF0000; transition: transform 0.15s;"
          onmouseenter="this.style.transform='scale(1.1)'"
          onmouseleave="this.style.transform='scale(1)'"
        >
          <v-icon icon="mdi-play" color="white" size="32" />
        </div>
        <span v-if="title" class="text-body-2 text-white font-weight-medium" style="text-shadow: 0 1px 3px rgba(0,0,0,0.8);">
          {{ title }}
        </span>
      </div>
    </template>

    <!-- Iframe (always mounted when autoplay, or after click) -->
    <iframe
      v-if="autoplay || playing"
      :src="embedUrl + (playing ? '&autoplay=1' : '')"
      :title="title ?? 'YouTube video'"
      class="d-block w-100 h-100"
      style="border: none;"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
    />
  </div>
</template>
