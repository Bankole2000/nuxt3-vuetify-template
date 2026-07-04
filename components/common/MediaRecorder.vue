<script setup lang="ts">
export interface RecordingResult {
  blob: Blob
  url: string
  mimeType: string
  duration: number
  type: 'screen' | 'camera' | 'audio'
}

const props = withDefaults(defineProps<{
  mode?: 'screen' | 'camera' | 'audio'
  maxDuration?: number
  showPreview?: boolean
}>(), {
  mode: 'screen',
  maxDuration: 300,
  showPreview: true,
})

const emit = defineEmits<{
  (e: 'recording-start'): void
  (e: 'recording-stop', result: RecordingResult): void
  (e: 'error', message: string): void
}>()

const selectedMode = ref<'screen' | 'camera' | 'audio'>(props.mode)
const isRecording = ref(false)
const isReady = ref(false)
const permissionError = ref('')
const elapsedSeconds = ref(0)
const recordingResult = ref<RecordingResult | null>(null)

const previewVideoRef = ref<HTMLVideoElement | null>(null)
const playbackVideoRef = ref<HTMLVideoElement | null>(null)
const playbackAudioRef = ref<HTMLAudioElement | null>(null)

let mediaRecorderInstance: MediaRecorder | null = null
let stream: MediaStream | null = null
let chunks: Blob[] = []
let timerInterval: ReturnType<typeof setInterval> | null = null
let startTime = 0
let maxDurationTimeout: ReturnType<typeof setTimeout> | null = null

const elapsedFormatted = computed(() => {
  const m = Math.floor(elapsedSeconds.value / 60)
  const s = elapsedSeconds.value % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

const remainingSeconds = computed(() => props.maxDuration - elapsedSeconds.value)

const showCountdown = computed(() => isRecording.value && remainingSeconds.value <= 10)

const countdownFormatted = computed(() => {
  const s = remainingSeconds.value
  return `${String(s).padStart(2, '0')}s`
})

const mimeType = computed(() =>
  selectedMode.value === 'audio' ? 'audio/webm' : 'video/webm'
)

const startTimer = () => {
  startTime = Date.now()
  timerInterval = setInterval(() => {
    elapsedSeconds.value = Math.floor((Date.now() - startTime) / 1000)
  }, 500)
}

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

const stopStream = () => {
  if (stream) {
    stream.getTracks().forEach(t => t.stop())
    stream = null
  }
  if (previewVideoRef.value) {
    previewVideoRef.value.srcObject = null
  }
}

const stopRecording = () => {
  if (maxDurationTimeout) {
    clearTimeout(maxDurationTimeout)
    maxDurationTimeout = null
  }
  if (mediaRecorderInstance && mediaRecorderInstance.state !== 'inactive') {
    mediaRecorderInstance.stop()
  }
}

const startRecording = async () => {
  permissionError.value = ''
  recordingResult.value = null
  chunks = []
  elapsedSeconds.value = 0

  try {
    if (selectedMode.value === 'screen') {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      })
    } else if (selectedMode.value === 'camera') {
      stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
    } else {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      })
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Permission denied'
    permissionError.value = msg
    emit('error', msg)
    return
  }

  if (props.showPreview && selectedMode.value !== 'audio' && previewVideoRef.value) {
    previewVideoRef.value.srcObject = stream
    previewVideoRef.value.play().catch(() => undefined)
  }

  let recorderOptions: MediaRecorderOptions = {}
  try {
    const preferred = selectedMode.value === 'audio'
      ? 'audio/webm;codecs=opus'
      : 'video/webm;codecs=vp9'
    if (MediaRecorder.isTypeSupported(preferred)) {
      recorderOptions = { mimeType: preferred }
    }
  } catch {
    recorderOptions = {}
  }

  try {
    mediaRecorderInstance = new MediaRecorder(stream, recorderOptions)
  } catch {
    mediaRecorderInstance = new MediaRecorder(stream)
  }

  mediaRecorderInstance.ondataavailable = (e: BlobEvent) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data)
    }
  }

  mediaRecorderInstance.onstop = () => {
    stopTimer()
    stopStream()

    const actualMime = mediaRecorderInstance?.mimeType || mimeType.value
    const blob = new Blob(chunks, { type: actualMime })
    const url = URL.createObjectURL(blob)
    const duration = elapsedSeconds.value

    const result: RecordingResult = {
      blob,
      url,
      mimeType: actualMime,
      duration,
      type: selectedMode.value,
    }

    recordingResult.value = result
    isRecording.value = false
    emit('recording-stop', result)

    nextTick(() => {
      if (selectedMode.value === 'audio' && playbackAudioRef.value) {
        playbackAudioRef.value.src = url
      } else if (playbackVideoRef.value) {
        playbackVideoRef.value.src = url
      }
    })
  }

  stream.getTracks().forEach(track => {
    track.addEventListener('ended', () => {
      if (isRecording.value) stopRecording()
    })
  })

  mediaRecorderInstance.start(250)
  isRecording.value = true
  startTimer()
  emit('recording-start')

  maxDurationTimeout = setTimeout(() => {
    if (isRecording.value) stopRecording()
  }, props.maxDuration * 1000)
}

const downloadRecording = () => {
  if (!recordingResult.value) return
  const ext = recordingResult.value.type === 'audio' ? 'webm' : 'webm'
  const a = document.createElement('a')
  a.href = recordingResult.value.url
  a.download = `recording-${recordingResult.value.type}-${Date.now()}.${ext}`
  a.click()
}

const discardRecording = () => {
  if (recordingResult.value) {
    URL.revokeObjectURL(recordingResult.value.url)
    recordingResult.value = null
  }
}

onMounted(() => {
  isReady.value = typeof MediaRecorder !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices
})

onUnmounted(() => {
  stopTimer()
  stopStream()
  if (maxDurationTimeout) clearTimeout(maxDurationTimeout)
  if (recordingResult.value) {
    URL.revokeObjectURL(recordingResult.value.url)
  }
})
</script>

<template>
  <div>
    <div v-if="!isReady" class="d-flex align-center justify-center pa-8">
      <v-alert type="warning" variant="tonal" rounded="lg">
        MediaRecorder API is not available in this environment.
      </v-alert>
    </div>

    <div v-else>
      <v-btn-toggle
        v-model="selectedMode"
        :disabled="isRecording"
        mandatory
        density="compact"
        variant="outlined"
        divided
        rounded="lg"
        class="mb-5"
      >
        <v-btn value="screen" prepend-icon="mdi-monitor-screenshot" size="small">Screen</v-btn>
        <v-btn value="camera" prepend-icon="mdi-webcam" size="small">Camera</v-btn>
        <v-btn value="audio" prepend-icon="mdi-microphone" size="small">Audio</v-btn>
      </v-btn-toggle>

      <v-alert
        v-if="permissionError"
        type="error"
        variant="tonal"
        density="compact"
        rounded="lg"
        closable
        class="mb-4"
        @click:close="permissionError = ''"
      >
        Permission denied: {{ permissionError }}
      </v-alert>

      <v-card rounded="lg" variant="outlined" class="mb-5">
        <div v-if="isRecording && showPreview && selectedMode !== 'audio'" class="position-relative">
          <video
            ref="previewVideoRef"
            muted
            autoplay
            playsinline
            class="d-block w-100 rounded-t-lg"
            style="max-height: 320px; object-fit: contain; background: #000;"
          />
          <div
            class="position-absolute d-flex align-center gap-2 pa-2 rounded-lg"
            style="top: 8px; left: 8px; background: rgba(0,0,0,0.6);"
          >
            <span
              class="rounded-circle bg-error"
              style="width: 10px; height: 10px; display: inline-block; animation: blink 1s step-start infinite;"
            />
            <span class="text-caption text-white font-weight-bold">REC</span>
          </div>
        </div>

        <div v-else-if="!isRecording && !recordingResult" class="d-flex align-center justify-center" style="min-height: 200px;">
          <div class="text-center text-medium-emphasis">
            <v-icon
              :icon="selectedMode === 'screen' ? 'mdi-monitor-screenshot' : selectedMode === 'camera' ? 'mdi-webcam' : 'mdi-microphone'"
              size="64"
              class="mb-3 opacity-30"
            />
            <p class="text-body-2">
              {{ selectedMode === 'screen' ? 'Click Start to capture your screen' : selectedMode === 'camera' ? 'Click Start to record from camera' : 'Click Start to record audio' }}
            </p>
          </div>
        </div>

        <div v-if="isRecording" class="pa-4 d-flex align-center gap-4 flex-wrap">
          <div class="d-flex align-center gap-2">
            <span
              class="rounded-circle bg-error"
              style="width: 10px; height: 10px; display: inline-block; animation: blink 1s step-start infinite;"
            />
            <span class="text-body-2 font-weight-bold" style="font-variant-numeric: tabular-nums;">
              {{ elapsedFormatted }}
            </span>
            <span class="text-caption text-medium-emphasis">
              / {{ Math.floor(maxDuration / 60) }}:{{ String(maxDuration % 60).padStart(2, '0') }}
            </span>
          </div>

          <v-chip
            v-if="showCountdown"
            color="error"
            variant="flat"
            size="small"
            prepend-icon="mdi-clock-alert-outline"
          >
            Stops in {{ countdownFormatted }}
          </v-chip>

          <v-spacer />

          <v-btn
            color="error"
            variant="flat"
            size="small"
            prepend-icon="mdi-stop"
            rounded="lg"
            @click="stopRecording"
          >
            Stop
          </v-btn>
        </div>

        <div v-if="!isRecording && !recordingResult" class="pa-4 d-flex justify-center">
          <v-btn
            color="error"
            variant="flat"
            prepend-icon="mdi-record-circle-outline"
            rounded="lg"
            @click="startRecording"
          >
            Start Recording
          </v-btn>
        </div>
      </v-card>

      <v-card v-if="recordingResult" rounded="lg" class="pa-4">
        <div class="d-flex align-center gap-2 mb-3">
          <v-icon icon="mdi-check-circle" color="success" />
          <span class="text-body-1 font-weight-bold">Recording complete</span>
        </div>

        <div class="d-flex gap-3 text-caption text-medium-emphasis mb-4 flex-wrap">
          <span>
            <v-icon size="14" icon="mdi-clock-outline" class="mr-1" />
            {{ Math.floor(recordingResult.duration / 60) }}:{{ String(recordingResult.duration % 60).padStart(2, '0') }}
          </span>
          <span>
            <v-icon size="14" icon="mdi-harddisk" class="mr-1" />
            {{ (recordingResult.blob.size / 1024 / 1024).toFixed(2) }} MB
          </span>
          <span>
            <v-icon size="14" icon="mdi-format-list-text" class="mr-1" />
            {{ recordingResult.mimeType }}
          </span>
          <v-chip size="x-small" color="primary" variant="tonal">{{ recordingResult.type }}</v-chip>
        </div>

        <audio
          v-if="recordingResult.type === 'audio'"
          ref="playbackAudioRef"
          controls
          class="w-100 mb-4"
          style="display: block;"
        />

        <video
          v-else
          ref="playbackVideoRef"
          controls
          class="d-block w-100 rounded-lg mb-4"
          style="max-height: 320px; background: #000;"
        />

        <div class="d-flex gap-3 flex-wrap">
          <v-btn
            color="primary"
            variant="tonal"
            prepend-icon="mdi-download"
            size="small"
            rounded="lg"
            @click="downloadRecording"
          >
            Download
          </v-btn>
          <v-btn
            color="default"
            variant="outlined"
            prepend-icon="mdi-record-circle-outline"
            size="small"
            rounded="lg"
            @click="discardRecording"
          >
            Record Again
          </v-btn>
        </div>
      </v-card>
    </div>
  </div>
</template>

<style scoped>
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
</style>
