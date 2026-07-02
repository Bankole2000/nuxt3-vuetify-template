<script setup lang="ts">
/**
 * QR code generator using the qrcode package.
 * Install: npm install qrcode && npm install -D @types/qrcode
 */
const props = withDefaults(defineProps<{
  value: string
  size?: number
  color?: string
  background?: string
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
  downloadable?: boolean
  downloadFilename?: string
}>(), {
  size: 200,
  color: '#000000',
  background: '#ffffff',
  errorCorrectionLevel: 'M',
  downloadable: false,
  downloadFilename: 'qrcode',
})

const dataUrl = ref('')
const error = ref('')

const generate = async () => {
  if (!props.value) { dataUrl.value = ''; return }
  try {
    const QRCode = (await import('qrcode')).default
    dataUrl.value = await QRCode.toDataURL(props.value, {
      width: props.size,
      color: { dark: props.color, light: props.background },
      errorCorrectionLevel: props.errorCorrectionLevel,
      margin: 2,
    })
    error.value = ''
  }
  catch (e: unknown) {
    error.value = (e as Error).message
  }
}

watch(() => [props.value, props.size, props.color, props.background, props.errorCorrectionLevel], generate, { immediate: true })

const download = () => {
  const a = document.createElement('a')
  a.href = dataUrl.value
  a.download = `${props.downloadFilename}.png`
  a.click()
}
</script>

<template>
  <div class="qr-code d-inline-flex flex-column align-center gap-3">
    <div
      v-if="!dataUrl && !error"
      :style="{ width: `${size}px`, height: `${size}px` }"
      class="d-flex align-center justify-center rounded-lg"
      style="background: rgba(var(--v-border-color), 0.06);"
    >
      <v-progress-circular indeterminate size="32" />
    </div>

    <v-alert v-else-if="error" type="error" variant="tonal" density="compact" rounded="lg">
      {{ error }}
    </v-alert>

    <img
      v-else
      :src="dataUrl"
      :alt="`QR code for: ${value}`"
      :width="size"
      :height="size"
      class="rounded-lg d-block"
      style="image-rendering: pixelated;"
    >

    <v-btn
      v-if="downloadable && dataUrl"
      size="small"
      variant="tonal"
      prepend-icon="mdi-download"
      @click="download"
    >
      Download PNG
    </v-btn>
  </div>
</template>
