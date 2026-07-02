<script setup lang="ts">
const props = withDefaults(defineProps<{
  url: string
  compact?: boolean
}>(), {
  compact: false,
})

interface PreviewData {
  url: string
  title: string | null
  description: string | null
  image: string | null
  siteName: string | null
  favicon: string | null
  hostname: string
}

const { data, status, error, refresh } = await useFetch<PreviewData>('/api/link-preview', {
  query: { url: props.url },
  lazy: true,
  server: false,
})

const loading = computed(() => status.value === 'pending')
const imageError = ref(false)
</script>

<template>
  <a
    :href="url"
    target="_blank"
    rel="noopener noreferrer"
    class="link-preview-server text-decoration-none d-block"
  >
    <v-card rounded="lg" border elevation="0" :class="['overflow-hidden', compact ? 'd-flex align-stretch' : '']">
      <!-- Loading skeleton -->
      <template v-if="loading">
        <v-img v-if="!compact" height="180" :src="undefined">
          <template #default>
            <v-skeleton-loader type="image" height="180" />
          </template>
        </v-img>
        <v-card-text :class="compact ? 'flex-1 pa-3' : 'pa-4'">
          <v-skeleton-loader type="text" width="60%" class="mb-2" />
          <v-skeleton-loader type="text" width="90%" class="mb-1" />
          <v-skeleton-loader type="text" width="40%" />
        </v-card-text>
      </template>

      <!-- Error state -->
      <template v-else-if="error">
        <v-card-text :class="compact ? 'pa-3 d-flex align-center gap-3' : 'pa-4'">
          <v-icon icon="mdi-link-off" color="error" :size="compact ? 20 : 24" />
          <div>
            <p class="text-body-2 font-weight-medium text-error mb-0">Preview unavailable</p>
            <p class="text-caption text-medium-emphasis mb-0 text-truncate">{{ url }}</p>
          </div>
          <v-btn
            v-if="!compact"
            size="x-small"
            variant="text"
            icon="mdi-refresh"
            class="ml-auto"
            @click.prevent="refresh"
          />
        </v-card-text>
      </template>

      <!-- Loaded -->
      <template v-else-if="data">
        <!-- Hero image (full card only) -->
        <v-img
          v-if="!compact && data.image && !imageError"
          :src="data.image"
          height="180"
          cover
          @error="imageError = true"
        />

        <div :class="compact ? 'd-flex align-stretch flex-1 overflow-hidden' : ''">
          <!-- Thumbnail (compact) -->
          <v-img
            v-if="compact && data.image && !imageError"
            :src="data.image"
            width="100"
            height="80"
            cover
            class="flex-shrink-0"
            @error="imageError = true"
          />

          <v-card-text :class="compact ? 'pa-3 flex-1 overflow-hidden' : 'pa-4'">
            <!-- Site name / hostname -->
            <div class="d-flex align-center gap-2 mb-2">
              <img
                v-if="data.favicon"
                :src="data.favicon"
                width="14"
                height="14"
                alt=""
                style="object-fit: contain;"
                @error="($event.target as HTMLImageElement).style.display = 'none'"
              >
              <span class="text-caption text-medium-emphasis">
                {{ data.siteName ?? data.hostname }}
              </span>
            </div>

            <p class="text-body-2 font-weight-bold text-on-surface mb-1" :class="compact ? 'text-truncate' : ''">
              {{ data.title ?? url }}
            </p>
            <p
              v-if="data.description"
              class="text-caption text-medium-emphasis mb-0"
              :class="compact ? 'text-truncate' : 'link-preview-desc'"
            >
              {{ data.description }}
            </p>
          </v-card-text>
        </div>
      </template>
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
