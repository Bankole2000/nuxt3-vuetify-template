<script setup lang="ts">
/**
 * PDF viewer using pdf.js (pdfjs-dist).
 * Install: npm install pdfjs-dist
 * The worker is loaded from the jsDelivr CDN to avoid bundler complexity.
 */
const props = withDefaults(defineProps<{
  src: string
  /** Initial page (1-indexed) */
  initialPage?: number
  /** Canvas scale — 1.5 gives ~96dpi on standard screens */
  scale?: number
}>(), {
  initialPage: 1,
  scale: 1.5,
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
const page = ref(props.initialPage)
const totalPages = ref(0)
const loading = ref(true)
const error = ref('')
const pageLoading = ref(false)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pdfDoc: any = null

const loadPage = async (num: number) => {
  if (!pdfDoc || !canvasRef.value) return
  pageLoading.value = true
  try {
    const pdfPage = await pdfDoc.getPage(num)
    const viewport = pdfPage.getViewport({ scale: props.scale })
    const canvas = canvasRef.value
    canvas.width = viewport.width
    canvas.height = viewport.height
    const ctx = canvas.getContext('2d')!
    await pdfPage.render({ canvasContext: ctx, viewport }).promise
  }
  finally {
    pageLoading.value = false
  }
}

const loadPdf = async () => {
  loading.value = true
  error.value = ''
  try {
    const pdfjsLib = await import('pdfjs-dist')
    // Use CDN worker to avoid bundler issues
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`
    pdfDoc = await pdfjsLib.getDocument({ url: props.src }).promise
    totalPages.value = pdfDoc.numPages
    page.value = Math.min(props.initialPage, totalPages.value)
    await loadPage(page.value)
  }
  catch (e: unknown) {
    error.value = (e as Error).message
  }
  finally {
    loading.value = false
  }
}

const goTo = async (n: number) => {
  page.value = n
  await loadPage(n)
}

const prev = () => { if (page.value > 1) goTo(page.value - 1) }
const next = () => { if (page.value < totalPages.value) goTo(page.value + 1) }

watch(() => props.src, loadPdf)
onMounted(loadPdf)
</script>

<template>
  <div class="pdf-viewer d-flex flex-column align-center gap-3">
    <!-- Toolbar -->
    <v-card rounded="lg" border elevation="0" class="pa-2 d-flex align-center gap-2 w-100" style="max-width: 640px;">
      <v-btn icon="mdi-chevron-left" size="small" variant="text" :disabled="page <= 1 || loading" @click="prev" />
      <span class="text-body-2 text-medium-emphasis flex-1 text-center">
        Page {{ page }} of {{ totalPages || '—' }}
      </span>
      <v-btn icon="mdi-chevron-right" size="small" variant="text" :disabled="page >= totalPages || loading" @click="next" />
    </v-card>

    <!-- Canvas area -->
    <div
      class="pdf-canvas-wrap position-relative rounded-lg overflow-hidden"
      style="max-width: 640px; width: 100%; border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));"
    >
      <!-- Loading overlay -->
      <div
        v-if="loading || pageLoading"
        class="position-absolute d-flex align-center justify-center bg-surface"
        style="inset: 0; z-index: 1; min-height: 400px;"
      >
        <v-progress-circular indeterminate />
      </div>

      <!-- Error -->
      <v-alert v-if="error && !loading" type="error" variant="tonal" density="compact" rounded="0">
        {{ error }}
      </v-alert>

      <canvas ref="canvasRef" class="d-block w-100" style="background: white;" />
    </div>

    <!-- Page jump -->
    <div v-if="totalPages > 1" class="d-flex align-center gap-2">
      <span class="text-caption text-medium-emphasis">Go to page</span>
      <v-text-field
        :model-value="page"
        type="number"
        :min="1"
        :max="totalPages"
        density="compact"
        variant="outlined"
        hide-details
        style="width: 72px;"
        @change="goTo(Math.max(1, Math.min(totalPages, Number(($event.target as HTMLInputElement).value))))"
      />
    </div>
  </div>
</template>
