<script setup lang="ts">
/**
 * Fetches Open Graph metadata via a free third-party API (jsonlink.io).
 * No server route required — works entirely client-side.
 * Rate limits apply on the free tier; swap the API_URL for your preferred provider.
 *
 * Alternatives:
 *   - https://api.linkpreview.net  (requires free API key)
 *   - https://opengraph.io/api/1.1/site/<encoded-url>  (requires free API key)
 *   - https://jsonlink.io/api/extract?url=<url>  (no key, limited rate)
 */
const API_URL = "https://jsonlink.io/api/extract";

const props = withDefaults(
  defineProps<{
    url: string;
    compact?: boolean;
  }>(),
  {
    compact: false,
  }
);

interface JsonLinkResponse {
  title?: string;
  description?: string;
  images?: string[];
  favicon?: string;
  domain?: string;
  url?: string;
}

const loading = ref(false);
const error = ref<string | null>(null);
const data = ref<JsonLinkResponse | null>(null);
const imageError = ref(false);
const apiKey = useRuntimeConfig().public.linkPreviewKey;

const load = async () => {
  loading.value = true;
  error.value = null;
  data.value = null;
  imageError.value = false;
  try {
    const res = await fetch(
      // `${API_URL}?url=${encodeURIComponent(props.url)}&api_key=${apiKey}`
      `${API_URL}?url=${props.url}&api_key=${apiKey}`
    );
    if (!res.ok) throw new Error(`API error ${res.status}`);
    data.value = await res.json();
  } catch (e: unknown) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
};

onMounted(load);
watch(() => props.url, load);
</script>

<template>
  <a
    :href="url"
    target="_blank"
    rel="noopener noreferrer"
    class="link-preview-client text-decoration-none d-block"
  >
    <v-card
      rounded="lg"
      border
      elevation="0"
      :class="['overflow-hidden', compact ? 'd-flex align-stretch' : '']"
    >
      <!-- Loading -->
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

      <!-- Error -->
      <template v-else-if="error">
        <v-card-text class="pa-3 d-flex align-center gap-3">
          <v-icon icon="mdi-link-off" color="error" size="20" />
          <div class="flex-1 overflow-hidden">
            <p class="text-body-2 font-weight-medium text-error mb-0">
              Preview unavailable: API Key {{ apiKey }}
            </p>
            <p class="text-caption text-medium-emphasis mb-0 text-truncate">
              {{ url }}
            </p>
          </div>
          <v-btn
            size="x-small"
            variant="text"
            icon="mdi-refresh"
            @click.prevent="load"
          />
        </v-card-text>
      </template>

      <!-- Loaded -->
      <template v-else-if="data">
        <v-img
          v-if="!compact && data.images?.[0] && !imageError"
          :src="data.images[0]"
          height="180"
          cover
          @error="imageError = true"
        />

        <div
          :class="compact ? 'd-flex align-stretch flex-1 overflow-hidden' : ''"
        >
          <v-img
            v-if="compact && data.images?.[0] && !imageError"
            :src="data.images[0]"
            width="100"
            height="80"
            cover
            class="flex-shrink-0"
            @error="imageError = true"
          />

          <v-card-text
            :class="compact ? 'pa-3 flex-1 overflow-hidden' : 'pa-4'"
          >
            <div class="d-flex align-center gap-2 mb-2">
              <img
                v-if="data.favicon"
                :src="data.favicon"
                width="14"
                height="14"
                alt=""
                style="object-fit: contain"
                @error="($event.target as HTMLImageElement).style.display = 'none'"
              />
              <span class="text-caption text-medium-emphasis">{{
                data.domain ?? url
              }}</span>
            </div>

            <p
              class="text-body-2 font-weight-bold text-on-surface mb-1"
              :class="compact ? 'text-truncate' : ''"
            >
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
