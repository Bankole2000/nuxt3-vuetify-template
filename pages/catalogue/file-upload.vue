<script setup lang="ts">
import type { UploadFile } from '~/components/common/FileUpload.vue'

definePageMeta({ layout: 'catalogue' })

const toast = useToast()

const previewOpen = ref(false)
const previewFile = ref<UploadFile | null>(null)
const confirmedImages = ref<{ name: string; dataUrl: string }[]>([])

const onPreview = (file: UploadFile) => {
  previewFile.value = file
  previewOpen.value = true
}

const onConfirm = (dataUrl: string, file: UploadFile) => {
  const existing = confirmedImages.value.findIndex(i => i.name === file.file.name)
  if (existing !== -1) confirmedImages.value[existing]!.dataUrl = dataUrl
  else confirmedImages.value.push({ name: file.file.name, dataUrl })
  toast.success(`Image "${file.file.name}" processed.`)
}

const onUpload = (files: UploadFile[]) => {
  toast.success(`${files.length} file${files.length > 1 ? 's' : ''} uploaded.`)
}
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">File Upload</h1>
    <p class="text-body-2 text-medium-emphasis mb-8">
      Drag-and-drop upload zone with progress, validation, and an image preview/crop/rotate dialog.
    </p>

    <h2 class="text-overline text-medium-emphasis mb-4">Any file type — up to 10MB each</h2>
    <v-card rounded="lg" class="pa-6 mb-6">
      <CommonFileUpload
        multiple
        :max-size-mb="10"
        :max-files="8"
        @upload="onUpload"
        @preview="onPreview"
      />
    </v-card>

    <h2 class="text-overline text-medium-emphasis mb-4">Images only — with preview & crop</h2>
    <v-card rounded="lg" class="pa-6 mb-6">
      <CommonFileUpload
        accept="image/*"
        multiple
        :max-size-mb="5"
        :max-files="4"
        @upload="onUpload"
        @preview="onPreview"
      />
    </v-card>

    <h2 class="text-overline text-medium-emphasis mb-4">Single PDF only</h2>
    <v-card rounded="lg" class="pa-6 mb-6">
      <CommonFileUpload
        accept=".pdf"
        :multiple="false"
        :max-size-mb="20"
        :max-files="1"
        @upload="onUpload"
        @preview="onPreview"
      />
    </v-card>

    <!-- Confirmed processed images -->
    <template v-if="confirmedImages.length">
      <h2 class="text-overline text-medium-emphasis mb-4">Processed images</h2>
      <v-card rounded="lg" class="pa-6">
        <v-row>
          <v-col v-for="img in confirmedImages" :key="img.name" cols="6" sm="4" md="3">
            <v-card rounded="lg" border>
              <v-img :src="img.dataUrl" aspect-ratio="1" cover />
              <v-card-text class="pa-2">
                <p class="text-caption text-truncate">{{ img.name }}</p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card>
    </template>

    <CommonImagePreview
      v-model="previewOpen"
      :file="previewFile"
      @confirm="onConfirm"
    />
  </div>
</template>
