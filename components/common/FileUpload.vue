<script setup lang="ts">
export interface UploadFile {
  id: string
  file: File
  preview: string | null
  progress: number
  status: 'pending' | 'uploading' | 'done' | 'error'
  error: string | null
}

const props = withDefaults(defineProps<{
  accept?: string
  multiple?: boolean
  maxSizeMb?: number
  maxFiles?: number
}>(), {
  accept: '*/*',
  multiple: true,
  maxSizeMb: 10,
  maxFiles: 10,
})

const emit = defineEmits<{
  (e: 'upload', files: UploadFile[]): void
  (e: 'preview', file: UploadFile): void
}>()

const files = ref<UploadFile[]>([])
const isDragging = ref(false)
const inputRef = ref<HTMLInputElement>()

const toast = useToast()

const isImage = (file: File) => file.type.startsWith('image/')

const buildEntry = (file: File): UploadFile => ({
  id: crypto.randomUUID(),
  file,
  preview: isImage(file) ? URL.createObjectURL(file) : null,
  progress: 0,
  status: 'pending',
  error: null,
})

const validate = (file: File): string | null => {
  if (props.maxSizeMb && file.size > props.maxSizeMb * 1024 * 1024) {
    return `File exceeds ${props.maxSizeMb}MB limit`
  }
  if (props.accept !== '*/*') {
    const accepted = props.accept.split(',').map(s => s.trim())
    const matched = accepted.some(type => {
      if (type.startsWith('.')) return file.name.toLowerCase().endsWith(type)
      if (type.endsWith('/*')) return file.type.startsWith(type.replace('/*', '/'))
      return file.type === type
    })
    if (!matched) return `File type not allowed`
  }
  return null
}

const addFiles = (incoming: FileList | File[]) => {
  const list = Array.from(incoming)
  if (!props.multiple && list.length > 1) {
    toast.warning('Only one file allowed.')
    return
  }
  if (files.value.length + list.length > props.maxFiles) {
    toast.warning(`Maximum ${props.maxFiles} files allowed.`)
    return
  }

  const entries: UploadFile[] = []
  for (const file of list) {
    const error = validate(file)
    if (error) {
      toast.error(`${file.name}: ${error}`)
      continue
    }
    entries.push(buildEntry(file))
  }
  files.value.push(...entries)
}

const onDrop = (e: DragEvent) => {
  isDragging.value = false
  if (e.dataTransfer?.files) addFiles(e.dataTransfer.files)
}

const onInputChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files) addFiles(input.files)
  input.value = ''
}

const openPicker = () => inputRef.value?.click()

const remove = (id: string) => {
  const entry = files.value.find(f => f.id === id)
  if (entry?.preview) URL.revokeObjectURL(entry.preview)
  files.value = files.value.filter(f => f.id !== id)
}

// Simulates upload progress — replace the body with your real $api call
const simulateUpload = async (entry: UploadFile) => {
  entry.status = 'uploading'
  for (let p = 0; p <= 100; p += 20) {
    await new Promise(r => setTimeout(r, 150))
    entry.progress = p
  }
  entry.status = 'done'
  entry.progress = 100
}

const uploadAll = async () => {
  const pending = files.value.filter(f => f.status === 'pending')
  if (!pending.length) return
  await Promise.all(pending.map(simulateUpload))
  emit('upload', files.value.filter(f => f.status === 'done'))
  toast.success(`${pending.length} file${pending.length > 1 ? 's' : ''} uploaded successfully.`)
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const statusColor: Record<UploadFile['status'], string> = {
  pending: 'default',
  uploading: 'primary',
  done: 'success',
  error: 'error',
}

onUnmounted(() => {
  files.value.forEach(f => { if (f.preview) URL.revokeObjectURL(f.preview) })
})
</script>

<template>
  <div>
    <!-- Hidden file input -->
    <input
      ref="inputRef"
      type="file"
      :accept="accept"
      :multiple="multiple"
      class="d-none"
      @change="onInputChange"
    />

    <!-- Drop zone -->
    <v-sheet
      :color="isDragging ? 'primary' : 'surface-variant'"
      rounded="lg"
      :border="isDragging ? 'primary md' : 'md'"
      class="d-flex flex-column align-center justify-center pa-8 cursor-pointer"
      style="border-style: dashed; min-height: 180px; transition: all 0.2s;"
      @click="openPicker"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
    >
      <v-icon
        :icon="isDragging ? 'mdi-cloud-download-outline' : 'mdi-upload-outline'"
        :color="isDragging ? 'primary' : 'medium-emphasis'"
        size="40"
        class="mb-3"
      />
      <p class="text-body-1 font-weight-medium mb-1">
        {{ isDragging ? 'Drop files here' : 'Drag & drop files here' }}
      </p>
      <p class="text-body-2 text-medium-emphasis">
        or <span class="text-primary">click to browse</span>
        <span v-if="accept !== '*/*'"> · {{ accept }}</span>
        · max {{ maxSizeMb }}MB
      </p>
    </v-sheet>

    <!-- File list -->
    <div v-if="files.length" class="mt-4">
      <v-list rounded="lg" border class="pa-1">
        <v-list-item
          v-for="entry in files"
          :key="entry.id"
          rounded="lg"
          class="mb-1"
        >
          <template #prepend>
            <v-avatar
              v-if="entry.preview"
              rounded="md"
              size="40"
              class="mr-3 cursor-pointer"
              @click.stop="emit('preview', entry)"
            >
              <v-img :src="entry.preview" cover />
            </v-avatar>
            <v-avatar v-else rounded="md" size="40" color="surface-variant" class="mr-3">
              <v-icon icon="mdi-file-outline" />
            </v-avatar>
          </template>

          <v-list-item-title class="text-body-2 font-weight-medium">{{ entry.file.name }}</v-list-item-title>
          <v-list-item-subtitle class="text-caption">{{ formatSize(entry.file.size) }}</v-list-item-subtitle>

          <v-progress-linear
            v-if="entry.status === 'uploading'"
            :model-value="entry.progress"
            color="primary"
            height="2"
            class="mt-1"
          />

          <template #append>
            <v-chip :color="statusColor[entry.status]" size="x-small" variant="tonal" class="mr-2">
              {{ entry.status }}
            </v-chip>
            <v-btn
              icon="mdi-close"
              size="x-small"
              variant="text"
              :disabled="entry.status === 'uploading'"
              @click.stop="remove(entry.id)"
            />
          </template>
        </v-list-item>
      </v-list>

      <div class="d-flex justify-end mt-3 gap-2">
        <v-btn variant="text" @click="files = []">Clear all</v-btn>
        <v-btn
          color="primary"
          :disabled="files.every(f => f.status !== 'pending')"
          @click="uploadAll"
        >
          Upload {{ files.filter(f => f.status === 'pending').length || '' }} file{{ files.filter(f => f.status === 'pending').length !== 1 ? 's' : '' }}
        </v-btn>
      </div>
    </div>
  </div>
</template>
