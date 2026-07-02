<script setup lang="ts">
definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Link Preview', disabled: true },
  ],
})

// Server-side demo
const serverUrl = ref('https://vuejs.org')
const serverInputUrl = ref('https://vuejs.org')
const serverCompact = ref(false)
const applyServerUrl = () => { serverUrl.value = serverInputUrl.value }

// Client-side demo
const clientUrl = ref('https://github.com/nuxt/nuxt')
const clientInputUrl = ref('https://github.com/nuxt/nuxt')
const clientCompact = ref(false)
const applyClientUrl = () => { clientUrl.value = clientInputUrl.value }

// Static / manual props demo
const staticCompact = ref(false)
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">Link Preview</h1>
    <p class="text-body-2 text-medium-emphasis mb-8">
      Three variants for displaying rich URL previews. Pick whichever suits your architecture.
    </p>

    <!-- 1. Server-side -->
    <h2 class="text-overline text-medium-emphasis mb-1">1. Server-side (recommended)</h2>
    <p class="text-body-2 text-medium-emphasis mb-4">
      A Nuxt server route (<code>/api/link-preview</code>) fetches and parses Open Graph tags on the server.
      No CORS issues, no third-party dependency, works for any public URL.
    </p>
    <v-card rounded="lg" class="pa-5 mb-2">
      <div class="d-flex gap-3 mb-5 flex-wrap align-center">
        <v-text-field
          v-model="serverInputUrl"
          label="URL"
          variant="outlined"
          density="compact"
          hide-details
          clearable
          prepend-inner-icon="mdi-link"
          style="min-width: 280px; flex: 1;"
          @keyup.enter="applyServerUrl"
        />
        <v-btn color="primary" variant="tonal" @click="applyServerUrl">Preview</v-btn>
        <v-switch v-model="serverCompact" label="Compact" density="compact" hide-details color="primary" />
      </div>
      <CommonLinkPreviewServer :url="serverUrl" :compact="serverCompact" />
    </v-card>
    <v-card rounded="lg" class="pa-5 mb-8">
      <v-sheet rounded="lg" color="surface-variant" class="pa-4">
        <pre v-pre class="text-body-2"><code>&lt;!-- Uses /api/link-preview?url=... Nuxt server route --&gt;
&lt;CommonLinkPreviewServer
  url="https://vuejs.org"
  :compact="false"
/&gt;</code></pre>
      </v-sheet>
    </v-card>

    <!-- 2. Client-side -->
    <h2 class="text-overline text-medium-emphasis mb-1">2. Client-side (third-party API)</h2>
    <p class="text-body-2 text-medium-emphasis mb-4">
      Calls <code>jsonlink.io</code> directly from the browser — no server route needed.
      Swap the <code>API_URL</code> constant in the component for your preferred provider
      (linkpreview.net, opengraph.io, etc.).
    </p>
    <v-card rounded="lg" class="pa-5 mb-2">
      <div class="d-flex gap-3 mb-5 flex-wrap align-center">
        <v-text-field
          v-model="clientInputUrl"
          label="URL"
          variant="outlined"
          density="compact"
          hide-details
          clearable
          prepend-inner-icon="mdi-link"
          style="min-width: 280px; flex: 1;"
          @keyup.enter="applyClientUrl"
        />
        <v-btn color="primary" variant="tonal" @click="applyClientUrl">Preview</v-btn>
        <v-switch v-model="clientCompact" label="Compact" density="compact" hide-details color="primary" />
      </div>
      <ClientOnly>
        <CommonLinkPreviewClient :url="clientUrl" :compact="clientCompact" />
        <template #fallback>
          <v-skeleton-loader type="card" />
        </template>
      </ClientOnly>
    </v-card>
    <v-card rounded="lg" class="pa-5 mb-8">
      <v-sheet rounded="lg" color="surface-variant" class="pa-4">
        <pre v-pre class="text-body-2"><code>&lt;!-- No server route needed; calls jsonlink.io from the browser --&gt;
&lt;ClientOnly&gt;
  &lt;CommonLinkPreviewClient
    url="https://github.com/nuxt/nuxt"
    :compact="false"
  /&gt;
&lt;/ClientOnly&gt;</code></pre>
      </v-sheet>
    </v-card>

    <!-- 3. Static / prop-driven -->
    <h2 class="text-overline text-medium-emphasis mb-1">3. Static / prop-driven</h2>
    <p class="text-body-2 text-medium-emphasis mb-4">
      No network calls — all metadata is passed as props.
      Use this when the metadata is already available (e.g. stored in a database, returned by your API).
    </p>
    <v-card rounded="lg" class="pa-5 mb-2">
      <div class="d-flex justify-end mb-5">
        <v-switch v-model="staticCompact" label="Compact" density="compact" hide-details color="primary" />
      </div>
      <CommonLinkPreviewStatic
        url="https://nuxt.com"
        title="Nuxt: The Intuitive Vue Framework"
        description="Nuxt is an open source framework that makes web development intuitive and powerful. Create performant and production-grade full-stack web apps and websites with confidence."
        image="https://nuxt.com/assets/design-kit/og-image.png"
        site-name="Nuxt"
        favicon="https://nuxt.com/favicon.ico"
        :compact="staticCompact"
      />
    </v-card>
    <v-card rounded="lg" class="pa-5">
      <v-sheet rounded="lg" color="surface-variant" class="pa-4">
        <pre v-pre class="text-body-2"><code>&lt;!-- All metadata supplied as props — no fetching --&gt;
&lt;CommonLinkPreviewStatic
  url="https://nuxt.com"
  title="Nuxt: The Intuitive Vue Framework"
  description="Create performant and production-grade full-stack web apps."
  image="https://nuxt.com/assets/design-kit/og-image.png"
  site-name="Nuxt"
  favicon="https://nuxt.com/favicon.ico"
  :compact="false"
/&gt;</code></pre>
      </v-sheet>
      <v-alert type="info" variant="tonal" density="compact" class="mt-4" rounded="lg">
        <strong>Tip:</strong> store <code>{ title, description, image, siteName, favicon }</code> alongside the URL in your database
        when the link is first saved, then render with this component — zero runtime fetching.
      </v-alert>
    </v-card>
  </div>
</template>
