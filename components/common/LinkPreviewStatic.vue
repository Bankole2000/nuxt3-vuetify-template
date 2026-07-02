<script setup lang="ts">
const props = withDefaults(defineProps<{
  url: string
  title?: string
  description?: string
  image?: string
  siteName?: string
  favicon?: string
  compact?: boolean
}>(), {
  compact: false,
})

const imageError = ref(false)

const hostname = computed(() => {
  try { return new URL(props.url).hostname }
  catch { return props.url }
})
</script>

<template>
  <a
    :href="url"
    target="_blank"
    rel="noopener noreferrer"
    class="link-preview-static text-decoration-none d-block"
  >
    <v-card rounded="lg" border elevation="0" :class="['overflow-hidden', compact ? 'd-flex align-stretch' : '']">
      <!-- Hero image (full) -->
      <v-img
        v-if="!compact && image && !imageError"
        :src="image"
        height="180"
        cover
        @error="imageError = true"
      />

      <div :class="compact ? 'd-flex align-stretch flex-1 overflow-hidden' : ''">
        <!-- Thumbnail (compact) -->
        <v-img
          v-if="compact && image && !imageError"
          :src="image"
          width="100"
          height="80"
          cover
          class="flex-shrink-0"
          @error="imageError = true"
        />

        <v-card-text :class="compact ? 'pa-3 flex-1 overflow-hidden' : 'pa-4'">
          <!-- Site / hostname -->
          <div class="d-flex align-center gap-2 mb-2">
            <img
              v-if="favicon"
              :src="favicon"
              width="14"
              height="14"
              alt=""
              style="object-fit: contain;"
              @error="($event.target as HTMLImageElement).style.display = 'none'"
            >
            <span class="text-caption text-medium-emphasis">
              {{ siteName ?? hostname }}
            </span>
          </div>

          <p class="text-body-2 font-weight-bold text-on-surface mb-1" :class="compact ? 'text-truncate' : ''">
            {{ title ?? url }}
          </p>
          <p
            v-if="description"
            class="text-caption text-medium-emphasis mb-0"
            :class="compact ? 'text-truncate' : 'link-preview-desc'"
          >
            {{ description }}
          </p>
        </v-card-text>
      </div>
    </v-card>
  </a>
</template>

<style scoped>
.link-preview-desc {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
