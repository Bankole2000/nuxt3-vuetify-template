<script setup lang="ts">
definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Signature Pad', disabled: true },
  ],
})

const toast = useToast()
const padRef = ref<{ clear: () => void; toDataURL: () => string; isEmpty: boolean }>()
const savedSignature = ref<string | null>(null)
const strokeColor = ref('#000000')
const strokeWidth = ref(2)
const darkBackground = ref(false)

const save = () => {
  if (padRef.value?.isEmpty) {
    toast.warning('Please sign before saving.')
    return
  }
  savedSignature.value = padRef.value!.toDataURL()
  toast.success('Signature saved.')
}

const clear = () => {
  padRef.value?.clear()
  savedSignature.value = null
}

const download = () => {
  if (!savedSignature.value) return
  const a = document.createElement('a')
  a.href = savedSignature.value
  a.download = 'signature.png'
  a.click()
}
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">Signature Pad</h1>
    <p class="text-body-2 text-medium-emphasis mb-8">
      Canvas-based signature capture with configurable stroke, colour and export.
    </p>

    <!-- Controls -->
    <h2 class="text-overline text-medium-emphasis mb-4">Basic signature pad</h2>
    <v-card rounded="lg" class="mb-6 pa-6">
      <div class="d-flex flex-wrap gap-4 align-center mb-4">
        <div class="d-flex align-center gap-2">
          <span class="text-body-2">Stroke colour</span>
          <input v-model="strokeColor" type="color" style="width: 36px; height: 36px; border: none; cursor: pointer; background: none;" />
        </div>
        <div class="d-flex align-center gap-2" style="min-width: 200px;">
          <span class="text-body-2 text-no-wrap">Width: {{ strokeWidth }}px</span>
          <v-slider v-model="strokeWidth" :min="1" :max="8" :step="1" hide-details density="compact" color="primary" />
        </div>
        <v-switch v-model="darkBackground" label="Dark background" density="compact" hide-details color="primary" />
      </div>

      <CommonSignaturePad
        ref="padRef"
        :stroke-color="strokeColor"
        :stroke-width="strokeWidth"
        :background-color="darkBackground ? '#1e1e1e' : '#ffffff'"
        :height="180"
        @change="savedSignature = null"
      />

      <div class="d-flex gap-3 mt-4">
        <v-btn color="primary" variant="tonal" prepend-icon="mdi-content-save-outline" @click="save">Save</v-btn>
        <v-btn color="default" variant="outlined" prepend-icon="mdi-eraser" @click="clear">Clear</v-btn>
        <v-btn
          v-if="savedSignature"
          color="success"
          variant="tonal"
          prepend-icon="mdi-download-outline"
          @click="download"
        >
          Download PNG
        </v-btn>
      </div>
    </v-card>

    <!-- Saved preview -->
    <template v-if="savedSignature">
      <h2 class="text-overline text-medium-emphasis mb-4">Saved signature</h2>
      <v-card rounded="lg" class="mb-6 pa-6">
        <img :src="savedSignature" alt="Saved signature" style="max-width: 100%; border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); border-radius: 8px;" />
      </v-card>
    </template>

    <!-- Sign-off form example -->
    <h2 class="text-overline text-medium-emphasis mb-4">Sign-off form example</h2>
    <v-card rounded="lg" class="mb-6 pa-6">
      <p class="text-body-2 text-medium-emphasis mb-4">
        Typical use-case: terms acceptance or approval flow with a signature field.
      </p>
      <v-text-field label="Full name" variant="outlined" density="comfortable" class="mb-3" />
      <v-text-field label="Job title" variant="outlined" density="comfortable" class="mb-4" />
      <p class="text-caption text-medium-emphasis mb-2">Signature *</p>
      <CommonSignaturePad :height="140" />
      <v-checkbox label="I agree to the terms and conditions" density="compact" color="primary" class="mt-3" />
      <v-btn color="primary" class="mt-2" @click="toast.success('Form submitted!')">Submit</v-btn>
    </v-card>
  </div>
</template>
