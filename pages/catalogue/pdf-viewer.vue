<script setup lang="ts">
definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'PDF Viewer', disabled: true },
  ],
})

// Public-domain sample PDF
const defaultPdf = 'https://www.w3.org/WAI/WCAG21/wcag-2.1.pdf'
const customUrl = ref(defaultPdf)
const inputUrl = ref(defaultPdf)
const scale = ref(1.5)

const applyUrl = () => { customUrl.value = inputUrl.value }
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">PDF Viewer</h1>
    <p class="text-body-2 text-medium-emphasis mb-8">
      Renders any PDF in-browser using <code>pdfjs-dist</code> — page navigation, zoom scale and page jump.
      No server required; the worker loads from jsDelivr CDN.
    </p>

    <v-card rounded="lg" class="pa-5 mb-6">
      <div class="d-flex gap-3 mb-6 flex-wrap align-center">
        <v-text-field
          v-model="inputUrl"
          label="PDF URL"
          variant="outlined"
          density="compact"
          hide-details
          clearable
          prepend-inner-icon="mdi-file-pdf-box"
          style="flex: 1; min-width: 280px;"
          @keyup.enter="applyUrl"
        />
        <v-btn color="primary" variant="tonal" @click="applyUrl">Load</v-btn>
        <div class="d-flex align-center gap-2">
          <span class="text-caption text-medium-emphasis">Scale</span>
          <v-btn-toggle v-model="scale" density="compact" variant="outlined" divided mandatory>
            <v-btn :value="1" size="small">1×</v-btn>
            <v-btn :value="1.5" size="small">1.5×</v-btn>
            <v-btn :value="2" size="small">2×</v-btn>
          </v-btn-toggle>
        </div>
      </div>

      <ClientOnly>
        <CommonPdfViewer :src="customUrl" :scale="scale" :key="customUrl + scale" />
        <template #fallback>
          <div class="d-flex justify-center py-12">
            <v-progress-circular indeterminate />
          </div>
        </template>
      </ClientOnly>
    </v-card>

    <h2 class="text-overline text-medium-emphasis mb-4">Usage</h2>
    <v-card rounded="lg" class="pa-5">
      <v-sheet rounded="lg" color="surface-variant" class="pa-4">
        <pre v-pre class="text-body-2"><code>&lt;ClientOnly&gt;
  &lt;CommonPdfViewer
    src="/assets/documents/report.pdf"
    :initial-page="1"
    :scale="1.5"
  /&gt;
&lt;/ClientOnly&gt;</code></pre>
      </v-sheet>
      <v-alert type="info" variant="tonal" density="compact" rounded="lg" class="mt-4">
        Place PDF files in <code>/public/assets/documents/</code> and reference as <code>/assets/documents/file.pdf</code>.
        The pdf.js worker is loaded from CDN — no extra bundler config needed.
      </v-alert>
    </v-card>
  </div>
</template>
