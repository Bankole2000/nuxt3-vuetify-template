<script setup lang="ts">
export interface GalleryImage {
  src: string
  thumb?: string
  alt?: string
  caption?: string
}

const props = withDefaults(defineProps<{
  images: GalleryImage[]
  columns?: number
  gap?: number
}>(), {
  columns: 3,
  gap: 8,
})

const open = ref(false)
const activeIndex = ref(0)

const active = computed(() => props.images[activeIndex.value] as GalleryImage)

const openAt = (i: number) => { activeIndex.value = i; open.value = true }
const prev = () => { activeIndex.value = (activeIndex.value - 1 + props.images.length) % props.images.length }
const next = () => { activeIndex.value = (activeIndex.value + 1) % props.images.length }

const onKeydown = (e: KeyboardEvent) => {
  if (!open.value) return
  if (e.key === 'ArrowLeft') prev()
  if (e.key === 'ArrowRight') next()
  if (e.key === 'Escape') open.value = false
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div>
    <!-- Grid -->
    <div
      class="image-gallery"
      :style="{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`,
      }"
    >
      <div
        v-for="(img, i) in images"
        :key="i"
        class="gallery-thumb rounded-lg overflow-hidden position-relative cursor-pointer"
        style="aspect-ratio: 1/1;"
        @click="openAt(i)"
      >
        <v-img
          :src="img.thumb ?? img.src"
          :alt="img.alt ?? `Image ${i + 1}`"
          cover
          height="100%"
          class="gallery-thumb-img"
        >
          <template #placeholder>
            <v-skeleton-loader type="image" height="100%" />
          </template>
          <template #error>
            <div class="d-flex align-center justify-center h-100 bg-surface-variant">
              <v-icon icon="mdi-image-broken-variant" color="medium-emphasis" />
            </div>
          </template>
        </v-img>

        <!-- Hover overlay -->
        <div class="gallery-thumb-overlay position-absolute d-flex align-end pa-2" style="inset: 0;">
          <v-icon icon="mdi-magnify-plus-outline" color="white" size="20" />
          <span v-if="img.caption" class="text-caption text-white ml-1 text-truncate">{{ img.caption }}</span>
        </div>
      </div>
    </div>

    <!-- Lightbox dialog -->
    <v-dialog v-model="open" max-width="960" scrim="black" :scrim-opacity="0.9">
      <div class="position-relative" style="outline: none;" @click.self="open = false">
        <!-- Close -->
        <v-btn
          icon="mdi-close"
          variant="tonal"
          color="white"
          size="small"
          class="position-absolute"
          style="top: -44px; right: 0; z-index: 1;"
          @click="open = false"
        />

        <!-- Counter -->
        <div
          class="position-absolute text-white text-caption"
          style="top: -36px; left: 0;"
        >
          {{ activeIndex + 1 }} / {{ images.length }}
        </div>

        <!-- Image -->
        <v-img
          :src="active.src"
          :alt="active.alt"
          max-height="80vh"
          contain
          class="rounded-lg"
        >
          <template #placeholder>
            <div class="d-flex align-center justify-center" style="height: 400px;">
              <v-progress-circular indeterminate color="white" />
            </div>
          </template>
        </v-img>

        <!-- Caption -->
        <p v-if="active.caption" class="text-center text-white text-body-2 mt-3 mb-0">
          {{ active.caption }}
        </p>

        <!-- Prev / Next -->
        <v-btn
          v-if="images.length > 1"
          icon="mdi-chevron-left"
          variant="tonal"
          color="white"
          size="large"
          class="position-absolute"
          style="top: 50%; left: -56px; transform: translateY(-50%);"
          @click="prev"
        />
        <v-btn
          v-if="images.length > 1"
          icon="mdi-chevron-right"
          variant="tonal"
          color="white"
          size="large"
          class="position-absolute"
          style="top: 50%; right: -56px; transform: translateY(-50%);"
          @click="next"
        />
      </div>

      <!-- Thumbnail strip -->
      <div v-if="images.length > 1" class="d-flex gap-2 justify-center mt-4 flex-wrap">
        <div
          v-for="(img, i) in images"
          :key="i"
          class="rounded cursor-pointer overflow-hidden"
          :style="{
            width: '52px',
            height: '52px',
            outline: i === activeIndex ? '2px solid white' : '2px solid transparent',
            outlineOffset: '2px',
            opacity: i === activeIndex ? 1 : 0.55,
            transition: 'opacity 0.2s, outline-color 0.2s',
          }"
          @click="activeIndex = i"
        >
          <v-img :src="img.thumb ?? img.src" cover height="52" width="52" />
        </div>
      </div>
    </v-dialog>
  </div>
</template>

<style scoped>
.gallery-thumb-overlay {
  background: linear-gradient(transparent 50%, rgba(0,0,0,0.5));
  opacity: 0;
  transition: opacity 0.2s;
}
.gallery-thumb:hover .gallery-thumb-overlay { opacity: 1; }
.gallery-thumb-img { transition: transform 0.3s; }
.gallery-thumb:hover .gallery-thumb-img { transform: scale(1.05); }
</style>
