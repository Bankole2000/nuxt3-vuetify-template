<script setup lang="ts">
definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Clipboard & Share', disabled: true },
  ],
})

const { copy, copied } = useClipboard()
const { share, isSupported, shared } = useShare()
const toast = useToast()

const snippets = [
  { label: 'API key', value: 'your_api_key_here' },
  { label: 'Invite link', value: 'https://app.example.com/invite/abc123xyz' },
  { label: 'Color hex', value: '#1976D2' },
]

const customText = ref('Copy me to the clipboard!')

const onCopy = async (text: string) => {
  await copy(text)
  toast.success('Copied to clipboard')
}

const onShare = async () => {
  await share({
    title: 'Nuxt 3 Vuetify Template',
    text: 'Check out this starter template!',
    url: window.location.href,
  })
}
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">Clipboard & Share</h1>
    <p class="text-body-2 text-medium-emphasis mb-8">
      <code>useClipboard</code> wraps the Clipboard API with an execCommand fallback.
      <code>useShare</code> uses the Web Share API with a copy-URL fallback for unsupported browsers.
    </p>

    <!-- Copy snippets -->
    <h2 class="text-overline text-medium-emphasis mb-4">Copy to clipboard</h2>
    <v-card rounded="lg" class="mb-6 pa-5">
      <div class="d-flex flex-column ga-3">
        <div
          v-for="s in snippets"
          :key="s.label"
          class="d-flex align-center gap-3 pa-3 rounded-lg"
          style="border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));"
        >
          <div class="flex-1 min-width-0">
            <p class="text-caption text-medium-emphasis mb-0">{{ s.label }}</p>
            <p class="text-body-2 font-weight-medium font-monospace text-truncate">{{ s.value }}</p>
          </div>
          <v-btn
            :icon="copied ? 'mdi-check' : 'mdi-content-copy'"
            :color="copied ? 'success' : 'default'"
            variant="text"
            size="small"
            @click="onCopy(s.value)"
          />
        </div>
      </div>
    </v-card>

    <!-- Custom text -->
    <h2 class="text-overline text-medium-emphasis mb-4">Custom text</h2>
    <v-card rounded="lg" class="mb-6 pa-5">
      <div class="d-flex gap-3">
        <v-text-field
          v-model="customText"
          variant="outlined"
          density="comfortable"
          hide-details
          class="flex-1"
        />
        <v-btn
          :color="copied ? 'success' : 'primary'"
          :prepend-icon="copied ? 'mdi-check' : 'mdi-content-copy'"
          variant="tonal"
          @click="onCopy(customText)"
        >
          {{ copied ? 'Copied!' : 'Copy' }}
        </v-btn>
      </div>
    </v-card>

    <!-- Web Share -->
    <h2 class="text-overline text-medium-emphasis mb-4">Web Share API</h2>
    <v-card rounded="lg" class="pa-5">
      <p class="text-body-2 text-medium-emphasis mb-4">
        Uses <code>navigator.share()</code> on supported browsers (mobile, Chrome 89+).
        Falls back to copying the URL on desktop.
        <span v-if="!isSupported" class="text-warning"> — Share API not supported in this browser; will copy URL instead.</span>
      </p>
      <v-btn
        :color="shared ? 'success' : 'primary'"
        :prepend-icon="shared ? 'mdi-check' : 'mdi-share-variant-outline'"
        variant="tonal"
        @click="onShare"
      >
        {{ shared ? 'Shared!' : isSupported ? 'Share this page' : 'Copy page URL' }}
      </v-btn>
    </v-card>
  </div>
</template>
