<script setup lang="ts">
import type { RecordingResult } from '~/components/common/MediaRecorder.vue'

definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Media Recorder', disabled: true },
  ],
})

useSeo({
  title: 'Media Recorder',
  description: 'Browser-native screen, camera and audio recorder using the MediaRecorder API with live preview, elapsed timer and download.',
})

const latestRecording = ref<RecordingResult | null>(null)
const snackbarVisible = ref(false)
const snackbarMessage = ref('')
const infoDialog = ref(false)

const onRecordingStop = (result: RecordingResult) => {
  latestRecording.value = result
}

const onError = (message: string) => {
  snackbarMessage.value = message
  snackbarVisible.value = true
}

const modes = [
  {
    icon: 'mdi-monitor-screenshot',
    color: 'primary',
    title: 'Screen',
    description: 'Captures your screen, a tab, or a window including system audio. Requires HTTPS or localhost.',
  },
  {
    icon: 'mdi-webcam',
    color: 'secondary',
    title: 'Camera',
    description: 'Captures webcam video and microphone audio simultaneously. Great for talking-head recordings.',
  },
  {
    icon: 'mdi-microphone',
    color: 'success',
    title: 'Audio Only',
    description: 'Captures microphone audio only. Perfect for voice memos and podcast draft recordings.',
  },
]

const useCases = [
  {
    number: '#6',
    app: 'Loom Online',
    icon: 'mdi-video-outline',
    color: 'error',
    description: 'Record and share screen walkthroughs, product demos, and async video messages directly in the browser.',
  },
  {
    number: '#1',
    app: 'Portfolio Manager',
    icon: 'mdi-briefcase-outline',
    color: 'primary',
    description: 'Capture project demos and feature walkthroughs to embed in portfolio entries or client presentations.',
  },
  {
    number: '#3',
    app: 'Workflow Engine',
    icon: 'mdi-vector-polyline',
    color: 'indigo',
    description: 'Record screen captures for bug reports — attach video evidence directly to workflow issue tickets.',
  },
  {
    number: '#9',
    app: 'HEAM',
    icon: 'mdi-heart-pulse',
    color: 'error',
    description: 'Enable video consultation recordings for patient follow-up and appointment summaries.',
  },
  {
    number: 'General',
    app: 'Async Communication',
    icon: 'mdi-chat-outline',
    color: 'teal',
    description: 'Replace long-form text explanations with short screen or camera recordings for async team communication.',
  },
  {
    number: 'General',
    app: 'Tutorial Creation',
    icon: 'mdi-school-outline',
    color: 'warning',
    description: 'Create step-by-step tutorial videos or voice-over guides without leaving the browser.',
  },
]

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const formatSize = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}
</script>

<template>
  <div>
    <div class="d-flex align-center gap-3 mb-1">
      <h1 class="text-h5 font-weight-bold">Media Recorder</h1>
      <v-btn
        icon="mdi-information-outline"
        variant="text"
        size="small"
        @click="infoDialog = true"
      />
    </div>
    <p class="text-body-2 text-medium-emphasis mb-6">
      Browser-native screen, camera and audio recording using the <code>MediaRecorder</code> API.
      Screen capture requires HTTPS or localhost; camera and audio require microphone permission.
      No server upload — recordings stay local until you download them.
    </p>

    <v-row class="mb-6">
      <v-col v-for="mode in modes" :key="mode.title" cols="12" sm="4">
        <v-card rounded="lg" variant="tonal" :color="mode.color" height="100%">
          <v-card-text class="pa-4">
            <v-icon :icon="mode.icon" :color="mode.color" class="mb-2" size="28" />
            <p class="text-body-2 font-weight-bold mb-1">{{ mode.title }}</p>
            <p class="text-caption text-medium-emphasis">{{ mode.description }}</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <ClientOnly>
      <CommonMediaRecorder
        mode="screen"
        :max-duration="300"
        :show-preview="true"
        @recording-stop="onRecordingStop"
        @error="onError"
      />
      <template #fallback>
        <v-card rounded="lg" class="pa-8 text-center">
          <v-progress-circular indeterminate color="primary" class="mb-4" />
          <p class="text-body-2 text-medium-emphasis">Loading recorder…</p>
        </v-card>
      </template>
    </ClientOnly>

    <v-card v-if="latestRecording" rounded="lg" class="pa-5 mt-6">
      <div class="d-flex align-center gap-2 mb-4">
        <v-icon icon="mdi-history" color="primary" />
        <span class="text-body-1 font-weight-bold">Latest Recording</span>
        <v-chip :color="latestRecording.type === 'screen' ? 'primary' : latestRecording.type === 'camera' ? 'secondary' : 'success'" variant="tonal" size="small">
          {{ latestRecording.type }}
        </v-chip>
      </div>

      <v-row class="mb-3">
        <v-col cols="auto">
          <div class="text-caption text-medium-emphasis">Duration</div>
          <div class="text-body-2 font-weight-bold">{{ formatDuration(latestRecording.duration) }}</div>
        </v-col>
        <v-col cols="auto">
          <div class="text-caption text-medium-emphasis">Size</div>
          <div class="text-body-2 font-weight-bold">{{ formatSize(latestRecording.blob.size) }}</div>
        </v-col>
        <v-col cols="auto">
          <div class="text-caption text-medium-emphasis">Format</div>
          <div class="text-body-2 font-weight-bold">{{ latestRecording.mimeType.split(';')[0] }}</div>
        </v-col>
      </v-row>

      <audio
        v-if="latestRecording.type === 'audio'"
        :src="latestRecording.url"
        controls
        class="w-100 mb-4"
        style="display: block;"
      />
      <video
        v-else
        :src="latestRecording.url"
        controls
        class="d-block w-100 rounded-lg mb-4"
        style="max-height: 280px; background: #000;"
      />

      <v-btn
        color="primary"
        variant="tonal"
        prepend-icon="mdi-download"
        size="small"
        rounded="lg"
        :href="latestRecording.url"
        :download="`recording-${latestRecording.type}-${Date.now()}.webm`"
      >
        Download
      </v-btn>
    </v-card>

    <v-dialog v-model="infoDialog" max-width="640">
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center gap-2 pa-5 pb-2">
          <v-icon icon="mdi-record-circle-outline" color="error" />
          Use Cases
        </v-card-title>
        <v-card-text class="pa-5 pt-3">
          <p class="text-body-2 text-medium-emphasis mb-5">
            The Media Recorder component works across these apps in the template ecosystem.
          </p>
          <v-row>
            <v-col v-for="uc in useCases" :key="uc.app" cols="12" sm="6">
              <div class="d-flex gap-3">
                <v-avatar :color="uc.color" variant="tonal" size="36" rounded="lg" class="flex-shrink-0">
                  <v-icon :icon="uc.icon" size="18" />
                </v-avatar>
                <div>
                  <div class="d-flex align-center gap-1 mb-1">
                    <span class="text-body-2 font-weight-bold">{{ uc.app }}</span>
                    <v-chip :color="uc.color" variant="flat" size="x-small">{{ uc.number }}</v-chip>
                  </div>
                  <p class="text-caption text-medium-emphasis">{{ uc.description }}</p>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-5 pt-0">
          <v-spacer />
          <v-btn variant="tonal" rounded="lg" @click="infoDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbarVisible" color="error" rounded="lg" :timeout="5000">
      {{ snackbarMessage }}
      <template #actions>
        <v-btn variant="text" @click="snackbarVisible = false">Dismiss</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>
