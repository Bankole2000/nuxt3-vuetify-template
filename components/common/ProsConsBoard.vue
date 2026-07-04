<script setup lang="ts">
// ─── Public types ──────────────────────────────────────────────────────────────
export interface BoardItem { id: string; text: string; impact: 1 | 2 | 3 }
export type BoardMode = 'pros-cons' | 'swot'
export interface ProsConsData {
  title: string
  mode: BoardMode
  pros:          BoardItem[]
  cons:          BoardItem[]
  strengths:     BoardItem[]
  weaknesses:    BoardItem[]
  opportunities: BoardItem[]
  threats:       BoardItem[]
}

// ─── Props / emits ─────────────────────────────────────────────────────────────
const props = withDefaults(defineProps<{
  data: ProsConsData
  readonly?: boolean
}>(), {
  readonly: false,
})

const emit = defineEmits<{
  (e: 'update', data: ProsConsData): void
}>()

// ─── Local copy ────────────────────────────────────────────────────────────────
const local = ref<ProsConsData>(JSON.parse(JSON.stringify(props.data)))

watch(() => props.data, (v) => {
  local.value = JSON.parse(JSON.stringify(v))
}, { deep: true })

function push() {
  emit('update', JSON.parse(JSON.stringify(local.value)))
}

// ─── Mode ──────────────────────────────────────────────────────────────────────
const activeMode = ref<BoardMode>(local.value.mode)
watch(activeMode, (m) => {
  local.value.mode = m
  push()
})

// ─── Column config ─────────────────────────────────────────────────────────────
type ColKey = 'pros' | 'cons' | 'strengths' | 'weaknesses' | 'opportunities' | 'threats'

interface ColConfig {
  key: ColKey
  label: string
  color: string
  icon: string
}

const prosCols: ColConfig[] = [
  { key: 'pros',  label: 'Pros',  color: 'success', icon: 'mdi-thumb-up-outline'   },
  { key: 'cons',  label: 'Cons',  color: 'error',   icon: 'mdi-thumb-down-outline' },
]

const swotCols: ColConfig[] = [
  { key: 'strengths',     label: 'Strengths',     color: 'success',  icon: 'mdi-arm-flex-outline'       },
  { key: 'weaknesses',    label: 'Weaknesses',    color: 'error',    icon: 'mdi-shield-off-outline'     },
  { key: 'opportunities', label: 'Opportunities', color: 'info',     icon: 'mdi-lightbulb-on-outline'   },
  { key: 'threats',       label: 'Threats',       color: 'warning',  icon: 'mdi-alert-outline'          },
]

const activeCols = computed(() =>
  activeMode.value === 'pros-cons' ? prosCols : swotCols,
)

// ─── Items access ──────────────────────────────────────────────────────────────
function itemsOf(key: ColKey): BoardItem[] {
  return local.value[key] as BoardItem[]
}

// ─── Add item ──────────────────────────────────────────────────────────────────
const newTexts = ref<Record<string, string>>({})
const newImpacts = ref<Record<string, 1 | 2 | 3>>({})

function newText(key: string): string {
  return newTexts.value[key] ?? ''
}

function setNewText(key: string, v: string) {
  newTexts.value[key] = v
}

function newImpact(key: string): 1 | 2 | 3 {
  return newImpacts.value[key] ?? 2
}

function setNewImpact(key: string, v: 1 | 2 | 3) {
  newImpacts.value[key] = v
}

function addItem(key: ColKey) {
  const text = newText(key).trim()
  if (!text) return
  const impact = newImpact(key)
  const items = local.value[key] as BoardItem[]
  items.push({ id: `${key}_${Date.now()}`, text, impact })
  setNewText(key, '')
  push()
}

// ─── Remove / edit item ────────────────────────────────────────────────────────
function removeItem(key: ColKey, id: string) {
  local.value[key] = (local.value[key] as BoardItem[]).filter(i => i.id !== id) as BoardItem[] & ProsConsData[typeof key]
  push()
}

const editingId = ref<string | null>(null)
const editingText = ref('')

function startEdit(item: BoardItem) {
  if (props.readonly) return
  editingId.value = item.id
  editingText.value = item.text
}

function commitEdit(_key: ColKey, item: BoardItem) {
  item.text = editingText.value
  editingId.value = null
  push()
}

// ─── Drag & drop reorder ───────────────────────────────────────────────────────
const dragSrcKey = ref<ColKey | null>(null)
const dragSrcId = ref<string | null>(null)
const dragOverKey = ref<ColKey | null>(null)
const dragOverId = ref<string | null>(null)

function onDragStart(e: DragEvent, key: ColKey, id: string) {
  if (props.readonly) return
  dragSrcKey.value = key
  dragSrcId.value = id
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }
}

function onDragOver(e: DragEvent, key: ColKey, id: string) {
  e.preventDefault()
  dragOverKey.value = key
  dragOverId.value = id
}

function onDragLeave() {
  dragOverKey.value = null
  dragOverId.value = null
}

function onDrop(e: DragEvent, key: ColKey, targetId: string) {
  e.preventDefault()
  const srcKey = dragSrcKey.value
  const srcId = dragSrcId.value
  if (!srcKey || !srcId) return

  const srcItems = local.value[srcKey] as BoardItem[]
  const srcIdx = srcItems.findIndex(i => i.id === srcId)
  if (srcIdx === -1) return

  const [moved] = srcItems.splice(srcIdx, 1)

  const targetItems = local.value[key] as BoardItem[]
  const targetIdx = targetItems.findIndex(i => i.id === targetId)
  if (targetIdx === -1) {
    targetItems.push(moved!)
  }
  else {
    targetItems.splice(targetIdx, 0, moved!)
  }

  dragSrcKey.value = null
  dragSrcId.value = null
  dragOverKey.value = null
  dragOverId.value = null
  push()
}

function onDragEnd() {
  dragSrcKey.value = null
  dragSrcId.value = null
  dragOverKey.value = null
  dragOverId.value = null
}

// ─── Summary ───────────────────────────────────────────────────────────────────
interface SummaryItem { label: string; count: number; color: string }

const summary = computed<SummaryItem[]>(() => {
  return activeCols.value.map(c => ({
    label: c.label,
    count: itemsOf(c.key).length,
    color: c.color,
  }))
})

const sentimentRatio = computed<string>(() => {
  if (activeMode.value === 'pros-cons') {
    const p = local.value.pros.length
    const c = local.value.cons.length
    if (p + c === 0) return 'N/A'
    return `${Math.round((p / (p + c)) * 100)}% positive`
  }
  else {
    const pos = local.value.strengths.length + local.value.opportunities.length
    const neg = local.value.weaknesses.length + local.value.threats.length
    if (pos + neg === 0) return 'N/A'
    return `${Math.round((pos / (pos + neg)) * 100)}% positive`
  }
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-4 flex-wrap gap-2">
      <span class="text-subtitle-1 font-weight-bold">{{ local.title }}</span>
      <v-btn-toggle
        v-model="activeMode"
        density="compact"
        variant="outlined"
        color="primary"
        mandatory
      >
        <v-btn value="pros-cons" size="small">Pros / Cons</v-btn>
        <v-btn value="swot" size="small">SWOT</v-btn>
      </v-btn-toggle>
    </div>

    <!-- Summary bar -->
    <div class="d-flex align-center gap-3 mb-4 flex-wrap">
      <v-chip
        v-for="s in summary"
        :key="s.label"
        :color="s.color"
        variant="tonal"
        size="small"
      >
        {{ s.label }}: {{ s.count }}
      </v-chip>
      <v-chip variant="tonal" size="small" color="primary">
        {{ sentimentRatio }}
      </v-chip>
    </div>

    <!-- Columns grid -->
    <div
      class="pcb-grid"
      :class="activeMode === 'swot' ? 'pcb-grid--swot' : 'pcb-grid--pc'"
    >
      <div
        v-for="col in activeCols"
        :key="col.key"
        class="pcb-col"
      >
        <!-- column header -->
        <div class="pcb-col-header d-flex align-center gap-2 mb-3 pa-3 rounded-lg" :class="`bg-${col.color}-lighten-5`">
          <v-icon :icon="col.icon" :color="col.color" size="20" />
          <span class="text-body-2 font-weight-bold" :class="`text-${col.color}`">{{ col.label }}</span>
          <v-chip size="x-small" :color="col.color" variant="tonal" class="ml-auto">
            {{ itemsOf(col.key).length }}
          </v-chip>
        </div>

        <!-- items list -->
        <div class="pcb-items">
          <div
            v-for="item in itemsOf(col.key)"
            :key="item.id"
            class="pcb-item mb-2 rounded-lg pa-2"
            :class="{ 'pcb-item--drag-over': dragOverKey === col.key && dragOverId === item.id }"
            :draggable="!readonly"
            @dragstart="onDragStart($event, col.key, item.id)"
            @dragover="onDragOver($event, col.key, item.id)"
            @dragleave="onDragLeave"
            @drop="onDrop($event, col.key, item.id)"
            @dragend="onDragEnd"
          >
            <div class="d-flex align-start gap-2">
              <v-icon
                v-if="!readonly"
                icon="mdi-drag-vertical"
                size="16"
                class="mt-1 opacity-40"
                style="cursor:grab; flex-shrink:0"
              />
              <!-- impact dots -->
              <div class="d-flex gap-1 mt-1" style="flex-shrink:0">
                <span
                  v-for="n in item.impact"
                  :key="n"
                  class="pcb-dot"
                  :class="`bg-${col.color}`"
                />
              </div>
              <div class="flex-1 min-width-0">
                <textarea
                  v-if="editingId === item.id"
                  v-model="editingText"
                  class="pcb-edit-input"
                  rows="2"
                  @blur="commitEdit(col.key, item)"
                  @keyup.enter.prevent="commitEdit(col.key, item)"
                />
                <p
                  v-else
                  class="text-body-2 ma-0"
                  style="cursor:text; word-break:break-word;"
                  @click="startEdit(item)"
                >
                  {{ item.text }}
                </p>
              </div>
              <v-btn
                v-if="!readonly"
                icon="mdi-close"
                size="x-small"
                variant="text"
                color="error"
                style="flex-shrink:0"
                @click="removeItem(col.key, item.id)"
              />
            </div>
          </div>
        </div>

        <!-- Add row -->
        <div v-if="!readonly" class="pcb-add mt-2 d-flex gap-2 align-center">
          <v-text-field
            :model-value="newText(col.key)"
            placeholder="Add item…"
            density="compact"
            variant="outlined"
            hide-details
            @update:model-value="setNewText(col.key, $event)"
            @keyup.enter="addItem(col.key)"
          />
          <v-btn-toggle
            :model-value="newImpact(col.key)"
            mandatory
            density="compact"
            variant="outlined"
            @update:model-value="setNewImpact(col.key, $event as 1 | 2 | 3)"
          >
            <v-btn :value="1" size="x-small">1</v-btn>
            <v-btn :value="2" size="x-small">2</v-btn>
            <v-btn :value="3" size="x-small">3</v-btn>
          </v-btn-toggle>
          <v-btn icon="mdi-plus" variant="tonal" :color="col.color" size="small" @click="addItem(col.key)" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pcb-grid {
  display: grid;
  gap: 16px;
}

.pcb-grid--pc {
  grid-template-columns: 1fr 1fr;
}

.pcb-grid--swot {
  grid-template-columns: 1fr 1fr;
}

@media (max-width: 600px) {
  .pcb-grid--pc,
  .pcb-grid--swot {
    grid-template-columns: 1fr;
  }
}

.pcb-col {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 12px;
  padding: 12px;
}

.pcb-col-header {
  border-radius: 8px !important;
}

.pcb-item {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgba(var(--v-theme-surface-variant), 0.3);
  user-select: none;
  transition: background 0.15s;
}

.pcb-item--drag-over {
  background: rgba(var(--v-theme-primary), 0.1);
  border-style: dashed;
}

.pcb-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  opacity: 0.85;
}

.pcb-edit-input {
  width: 100%;
  background: transparent;
  border: 1px solid rgba(var(--v-theme-primary), 0.5);
  border-radius: 4px;
  color: inherit;
  font-size: 0.875rem;
  padding: 4px 6px;
  outline: none;
  resize: none;
  font-family: inherit;
}

.min-width-0 {
  min-width: 0;
}
</style>
