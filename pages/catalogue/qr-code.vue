<script setup lang="ts">
definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'QR Code', disabled: true },
  ],
})

const value = ref('https://nuxt.com')
const size = ref(200)
const fgColor = ref('#000000')
const bgColor = ref('#ffffff')
const ecLevel = ref<'L' | 'M' | 'Q' | 'H'>('M')
const ecLevels = ['L', 'M', 'Q', 'H'] as const
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">QR Code Generator</h1>
    <p class="text-body-2 text-medium-emphasis mb-8">
      Client-side QR code generation using the <code>qrcode</code> package — no API, no server.
      Supports custom colours, sizes and error correction levels.
    </p>

    <v-row>
      <v-col cols="12" md="5">
        <h2 class="text-overline text-medium-emphasis mb-4">Configuration</h2>
        <v-card rounded="lg" class="pa-5 d-flex flex-column gap-4">
          <v-text-field
            v-model="value"
            label="Content (URL, text, email…)"
            variant="outlined"
            density="comfortable"
            hide-details
            clearable
            prepend-inner-icon="mdi-qrcode"
          />

          <div>
            <p class="text-caption text-medium-emphasis mb-2">Size: {{ size }}px</p>
            <v-slider v-model="size" min="100" max="400" step="10" hide-details color="primary" thumb-label />
          </div>

          <v-row>
            <v-col cols="6">
              <p class="text-caption text-medium-emphasis mb-2">Foreground</p>
              <v-menu :close-on-content-click="false">
                <template #activator="{ props }">
                  <div
                    v-bind="props"
                    class="rounded-lg cursor-pointer d-flex align-center gap-2 pa-2"
                    style="border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));"
                  >
                    <div class="rounded" :style="{ background: fgColor, width: '24px', height: '24px' }" />
                    <span class="text-body-2 font-monospace">{{ fgColor }}</span>
                  </div>
                </template>
                <v-color-picker v-model="fgColor" mode="hex" elevation="4" rounded="lg" />
              </v-menu>
            </v-col>
            <v-col cols="6">
              <p class="text-caption text-medium-emphasis mb-2">Background</p>
              <v-menu :close-on-content-click="false">
                <template #activator="{ props }">
                  <div
                    v-bind="props"
                    class="rounded-lg cursor-pointer d-flex align-center gap-2 pa-2"
                    style="border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));"
                  >
                    <div class="rounded" :style="{ background: bgColor, width: '24px', height: '24px', border: '1px solid #ddd' }" />
                    <span class="text-body-2 font-monospace">{{ bgColor }}</span>
                  </div>
                </template>
                <v-color-picker v-model="bgColor" mode="hex" elevation="4" rounded="lg" />
              </v-menu>
            </v-col>
          </v-row>

          <div>
            <p class="text-caption text-medium-emphasis mb-2">Error correction level</p>
            <v-btn-toggle v-model="ecLevel" density="compact" variant="outlined" divided mandatory>
              <v-btn v-for="l in ecLevels" :key="l" :value="l" size="small">{{ l }}</v-btn>
            </v-btn-toggle>
            <p class="text-caption text-disabled mt-1">L=7% M=15% Q=25% H=30% data recovery</p>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="7">
        <h2 class="text-overline text-medium-emphasis mb-4">Preview</h2>
        <v-card rounded="lg" class="pa-6 d-flex align-center justify-center">
          <ClientOnly>
            <CommonQrCode
              :value="value || 'https://nuxt.com'"
              :size="size"
              :color="fgColor"
              :background="bgColor"
              :error-correction-level="ecLevel"
              :downloadable="true"
              download-filename="qrcode"
            />
            <template #fallback>
              <v-skeleton-loader type="image" :width="size" :height="size" />
            </template>
          </ClientOnly>
        </v-card>

        <h2 class="text-overline text-medium-emphasis mt-6 mb-4">Usage</h2>
        <v-card rounded="lg" class="pa-5">
          <v-sheet rounded="lg" color="surface-variant" class="pa-4">
            <pre v-pre class="text-body-2"><code>&lt;ClientOnly&gt;
  &lt;CommonQrCode
    value="https://example.com"
    :size="200"
    color="#000000"
    background="#ffffff"
    error-correction-level="M"
    :downloadable="true"
    download-filename="my-qr"
  /&gt;
&lt;/ClientOnly&gt;</code></pre>
          </v-sheet>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
