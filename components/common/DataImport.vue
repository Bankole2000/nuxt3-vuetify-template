<script setup lang="ts">
export interface ImportColumn {
  key:       string
  label:     string
  type:      'string' | 'number' | 'date' | 'boolean'
  required?: boolean
}

export interface ImportResult {
  rows:    Record<string, unknown>[]
  errors:  { row: number; field: string; message: string }[]
  skipped: number
}

const props = withDefaults(defineProps<{
  columns:        ImportColumn[]
  maxRows?:       number
  maxFileSizeMb?: number
  dateFormat?:    string
}>(), {
  maxRows:       5000,
  maxFileSizeMb: 10,
  dateFormat:    'YYYY-MM-DD',
})

const emit = defineEmits<{
  (e: 'import', result: ImportResult): void
  (e: 'cancel'): void
}>()

const step = ref(1)
const isDragging = ref(false)
const inputRef = ref<HTMLInputElement>()
const parseError = ref<string | null>(null)
const fileName = ref('')
const fileSize = ref(0)

type RawRow = Record<string, string>

const rawHeaders = ref<string[]>([])
const rawRows = ref<RawRow[]>([])

const mapping = ref<Record<string, string>>({})
const skipInvalid = ref(true)

interface ValidationError {
  row: number
  field: string
  message: string
}

const validRows = ref<Record<string, unknown>[]>([])
const validationErrors = ref<ValidationError[]>([])

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function parseCSV(text: string): RawRow[] {
  const lines: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === '\n' && !inQuotes) {
      lines.push(current)
      current = ''
    } else if (ch === '\r' && !inQuotes) {
      if (text[i + 1] === '\n') i++
      lines.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  if (current.length) lines.push(current)

  const nonEmpty = lines.filter(l => l.trim().length > 0)
  if (nonEmpty.length < 2) return []

  const parseFields = (line: string): string[] => {
    const fields: string[] = []
    let field = ''
    let q = false
    for (let i = 0; i < line.length; i++) {
      const c = line[i]!
      if (c === '"') {
        if (q && line[i + 1] === '"') { field += '"'; i++ }
        else q = !q
      } else if (c === ',' && !q) {
        fields.push(field)
        field = ''
      } else {
        field += c
      }
    }
    fields.push(field)
    return fields
  }

  const headers = parseFields(nonEmpty[0]!)
  const rows: RawRow[] = []

  for (let i = 1; i < nonEmpty.length; i++) {
    const fields = parseFields(nonEmpty[i]!)
    const row: RawRow = {}
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]!] = fields[j] ?? ''
    }
    rows.push(row)
  }

  return rows
}

function parseJSON(text: string): RawRow[] {
  const parsed = JSON.parse(text) as unknown
  let arr: unknown[]
  if (Array.isArray(parsed)) {
    arr = parsed
  } else if (parsed && typeof parsed === 'object' && 'data' in parsed && Array.isArray((parsed as { data: unknown }).data)) {
    arr = (parsed as { data: unknown[] }).data
  } else {
    throw new Error('JSON must be an array or { data: [...] }')
  }
  return arr.map(item => {
    if (item && typeof item === 'object') {
      const row: RawRow = {}
      for (const [k, v] of Object.entries(item as Record<string, unknown>)) {
        row[k] = v == null ? '' : String(v)
      }
      return row
    }
    return {}
  })
}

function processFile(file: File) {
  parseError.value = null
  fileName.value = file.name
  fileSize.value = file.size

  if (file.size > props.maxFileSizeMb * 1024 * 1024) {
    parseError.value = `File exceeds ${props.maxFileSizeMb} MB limit`
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const text = e.target?.result as string
    try {
      let rows: RawRow[]
      if (file.name.toLowerCase().endsWith('.json')) {
        rows = parseJSON(text)
      } else {
        rows = parseCSV(text)
      }

      if (rows.length === 0) {
        parseError.value = 'No data rows found in file'
        return
      }

      if (rows.length > props.maxRows) {
        parseError.value = `File has ${rows.length} rows which exceeds the ${props.maxRows} row limit`
        return
      }

      rawRows.value = rows
      rawHeaders.value = Object.keys(rows[0]!)

      const defaultMapping: Record<string, string> = {}
      for (const col of props.columns) {
        const match = rawHeaders.value.find(h => h.toLowerCase() === col.key.toLowerCase())
        defaultMapping[col.key] = match ?? ''
      }
      mapping.value = defaultMapping

      step.value = 2
    } catch (err) {
      parseError.value = err instanceof Error ? err.message : 'Failed to parse file'
    }
  }
  reader.readAsText(file)
}

const onDrop = (e: DragEvent) => {
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file) processFile(file)
}

const onInputChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) processFile(file)
  input.value = ''
}

const openPicker = () => inputRef.value?.click()

const previewRows = computed(() => {
  return rawRows.value.slice(0, 3).map(raw => {
    const mapped: Record<string, string> = {}
    for (const col of props.columns) {
      const srcKey = mapping.value[col.key]
      mapped[col.key] = srcKey ? (raw[srcKey] ?? '') : ''
    }
    return mapped
  })
})

function coerceValue(raw: string, col: ImportColumn): { value: unknown; error: string | null } {
  const trimmed = raw.trim()

  if (col.required && trimmed === '') {
    return { value: null, error: `${col.label} is required` }
  }

  if (trimmed === '') return { value: null, error: null }

  if (col.type === 'number') {
    const n = Number(trimmed)
    if (isNaN(n)) return { value: null, error: `${col.label} must be a number` }
    return { value: n, error: null }
  }

  if (col.type === 'date') {
    const d = Date.parse(trimmed)
    if (isNaN(d)) return { value: null, error: `${col.label} must be a valid date` }
    return { value: trimmed, error: null }
  }

  if (col.type === 'boolean') {
    const lower = trimmed.toLowerCase()
    if (['true', '1', 'yes'].includes(lower)) return { value: true, error: null }
    if (['false', '0', 'no'].includes(lower)) return { value: false, error: null }
    return { value: null, error: `${col.label} must be true/false/1/0/yes/no` }
  }

  return { value: trimmed, error: null }
}

function runValidation() {
  const errors: ValidationError[] = []
  const valid: Record<string, unknown>[] = []

  for (let i = 0; i < rawRows.value.length; i++) {
    const raw = rawRows.value[i]!
    const row: Record<string, unknown> = {}
    let hasError = false

    for (const col of props.columns) {
      const srcKey = mapping.value[col.key]
      const rawVal = srcKey ? (raw[srcKey] ?? '') : ''
      const { value, error } = coerceValue(rawVal, col)
      if (error) {
        errors.push({ row: i + 2, field: col.label, message: error })
        hasError = true
      } else {
        row[col.key] = value
      }
    }

    if (!hasError) valid.push(row)
  }

  validRows.value = valid
  validationErrors.value = errors
}

const goToStep3 = () => {
  runValidation()
  step.value = 3
}

const skippedCount = computed(() => {
  if (!skipInvalid.value) return 0
  const errorRows = new Set(validationErrors.value.map(e => e.row))
  return errorRows.size
})

const importableCount = computed(() => {
  if (skipInvalid.value) return validRows.value.length
  return validationErrors.value.length === 0 ? validRows.value.length : 0
})

const canImport = computed(() => {
  if (skipInvalid.value) return importableCount.value > 0
  return validationErrors.value.length === 0
})

const doImport = () => {
  const result: ImportResult = {
    rows:    skipInvalid.value ? validRows.value : (validationErrors.value.length === 0 ? validRows.value : []),
    errors:  validationErrors.value,
    skipped: skippedCount.value,
  }
  emit('import', result)
}

const reset = () => {
  step.value = 1
  fileName.value = ''
  fileSize.value = 0
  parseError.value = null
  rawHeaders.value = []
  rawRows.value = []
  mapping.value = {}
  validRows.value = []
  validationErrors.value = []
}

const fileColumnOptions = computed(() => [
  { title: 'Skip', value: '' },
  ...rawHeaders.value.map(h => ({ title: h, value: h })),
])

const firstTenErrors = computed(() => validationErrors.value.slice(0, 10))
</script>

<template>
  <div>
    <v-stepper v-model="step" flat>
      <v-stepper-header>
        <v-stepper-item :value="1" title="Upload" :complete="step > 1" />
        <v-divider />
        <v-stepper-item :value="2" title="Map Columns" :complete="step > 2" />
        <v-divider />
        <v-stepper-item :value="3" title="Validate & Import" :complete="step > 3" />
      </v-stepper-header>

      <v-stepper-window>
        <v-stepper-window-item :value="1">
          <div class="pa-2">
            <input
              ref="inputRef"
              type="file"
              accept=".csv,.json"
              class="d-none"
              @change="onInputChange"
            />

            <v-sheet
              :color="isDragging ? 'primary' : 'surface-variant'"
              rounded="lg"
              :border="isDragging ? 'primary md' : 'md'"
              class="d-flex flex-column align-center justify-center pa-10 cursor-pointer"
              style="border-style: dashed; min-height: 200px; transition: all 0.2s;"
              @click="openPicker"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="onDrop"
            >
              <v-icon
                :icon="isDragging ? 'mdi-cloud-download-outline' : 'mdi-file-upload-outline'"
                :color="isDragging ? 'primary' : 'medium-emphasis'"
                size="48"
                class="mb-3"
              />
              <p class="text-body-1 font-weight-medium mb-1">
                {{ isDragging ? 'Drop file here' : 'Drag & drop a file here' }}
              </p>
              <p class="text-body-2 text-medium-emphasis">
                or <span class="text-primary">click to browse</span>
                · .csv or .json · max {{ maxFileSizeMb }}MB
              </p>
            </v-sheet>

            <v-alert
              v-if="parseError"
              type="error"
              variant="tonal"
              rounded="lg"
              class="mt-4"
              closable
              @click:close="parseError = null"
            >
              {{ parseError }}
            </v-alert>

            <v-card v-if="fileName && !parseError" rounded="lg" border class="mt-4 pa-4 d-flex align-center gap-3">
              <v-icon icon="mdi-file-check-outline" color="success" size="28" />
              <div class="flex-grow-1">
                <p class="text-body-2 font-weight-medium">{{ fileName }}</p>
                <p class="text-caption text-medium-emphasis">{{ formatSize(fileSize) }}</p>
              </div>
            </v-card>

            <div class="d-flex justify-end gap-2 mt-6">
              <v-btn variant="text" @click="emit('cancel')">Cancel</v-btn>
            </div>
          </div>
        </v-stepper-window-item>

        <v-stepper-window-item :value="2">
          <div class="pa-2">
            <p class="text-body-2 text-medium-emphasis mb-4">
              Map file columns to the expected fields. Unmatched fields will be skipped.
            </p>

            <v-row>
              <v-col
                v-for="col in columns"
                :key="col.key"
                cols="12"
                sm="6"
              >
                <v-select
                  v-model="mapping[col.key]"
                  :label="col.label + (col.required ? ' *' : '')"
                  :items="fileColumnOptions"
                  variant="outlined"
                  density="compact"
                  rounded="lg"
                  hide-details
                />
              </v-col>
            </v-row>

            <div v-if="previewRows.length" class="mt-6">
              <p class="text-overline text-medium-emphasis mb-2">Preview (first 3 rows)</p>
              <div style="overflow-x: auto;">
                <table class="text-body-2" style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr>
                      <th
                        v-for="col in columns"
                        :key="col.key"
                        class="text-left pa-2 text-medium-emphasis"
                        style="border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); white-space: nowrap;"
                      >
                        {{ col.label }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, i) in previewRows" :key="i">
                      <td
                        v-for="col in columns"
                        :key="col.key"
                        class="pa-2"
                        style="border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                      >
                        {{ row[col.key] || '—' }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="d-flex justify-space-between gap-2 mt-6">
              <v-btn variant="text" @click="reset">Back</v-btn>
              <div class="d-flex gap-2">
                <v-btn variant="text" @click="emit('cancel')">Cancel</v-btn>
                <v-btn color="primary" @click="goToStep3">Next</v-btn>
              </div>
            </div>
          </div>
        </v-stepper-window-item>

        <v-stepper-window-item :value="3">
          <div class="pa-2">
            <v-row class="mb-4">
              <v-col cols="12" sm="4">
                <v-card rounded="lg" color="success" variant="tonal" class="pa-4 text-center">
                  <p class="text-h5 font-weight-bold">{{ validRows.length }}</p>
                  <p class="text-caption">Valid rows</p>
                </v-card>
              </v-col>
              <v-col cols="12" sm="4">
                <v-card rounded="lg" color="error" variant="tonal" class="pa-4 text-center">
                  <p class="text-h5 font-weight-bold">{{ validationErrors.length }}</p>
                  <p class="text-caption">Errors</p>
                </v-card>
              </v-col>
              <v-col cols="12" sm="4">
                <v-card rounded="lg" color="info" variant="tonal" class="pa-4 text-center">
                  <p class="text-h5 font-weight-bold">{{ rawRows.length }}</p>
                  <p class="text-caption">Total rows</p>
                </v-card>
              </v-col>
            </v-row>

            <div v-if="firstTenErrors.length">
              <p class="text-overline text-medium-emphasis mb-2">First {{ firstTenErrors.length }} errors</p>
              <div style="overflow-x: auto;">
                <table class="text-body-2" style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr>
                      <th class="text-left pa-2 text-medium-emphasis" style="border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));">Row</th>
                      <th class="text-left pa-2 text-medium-emphasis" style="border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));">Field</th>
                      <th class="text-left pa-2 text-medium-emphasis" style="border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(err, i) in firstTenErrors" :key="i">
                      <td class="pa-2" style="border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));">{{ err.row }}</td>
                      <td class="pa-2" style="border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));">{{ err.field }}</td>
                      <td class="pa-2 text-error" style="border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));">{{ err.message }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <v-switch
                v-model="skipInvalid"
                label="Skip rows with errors"
                color="primary"
                hide-details
                class="mt-4"
              />
            </div>

            <v-alert
              v-if="!canImport && !skipInvalid"
              type="warning"
              variant="tonal"
              rounded="lg"
              class="mt-4"
            >
              There are validation errors. Enable "Skip rows with errors" to import only valid rows.
            </v-alert>

            <div class="d-flex justify-space-between gap-2 mt-6">
              <v-btn variant="text" @click="step = 2">Back</v-btn>
              <div class="d-flex gap-2">
                <v-btn variant="text" @click="emit('cancel')">Cancel</v-btn>
                <v-btn
                  color="primary"
                  :disabled="!canImport"
                  @click="doImport"
                >
                  Import {{ importableCount }} row{{ importableCount !== 1 ? 's' : '' }}
                </v-btn>
              </div>
            </div>
          </div>
        </v-stepper-window-item>
      </v-stepper-window>
    </v-stepper>
  </div>
</template>
