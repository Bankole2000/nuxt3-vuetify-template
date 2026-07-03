<script setup lang="ts">
export interface GridColumn {
  key: string
  title: string
  width?: number
  editable?: boolean
  type?: 'text' | 'number' | 'select'
  options?: string[]
}

export interface GridRow {
  id: string | number
  [key: string]: unknown
}

const props = withDefaults(defineProps<{
  columns: GridColumn[]
  rows: GridRow[]
  selectable?: boolean
}>(), {
  selectable: false,
})

const emit = defineEmits<{
  (e: 'update:rows', rows: GridRow[]): void
  (e: 'row-delete', ids: (string | number)[]): void
}>()

const editing = ref<{ rowId: string | number; key: string } | null>(null)
const editValue = ref<string>('')
const selected = ref<Set<string | number>>(new Set())
const inputRef = ref<HTMLInputElement | HTMLSelectElement>()

const startEdit = (row: GridRow, col: GridColumn) => {
  if (!col.editable) return
  editing.value = { rowId: row.id, key: col.key }
  editValue.value = String(row[col.key] ?? '')
  nextTick(() => inputRef.value?.focus())
}

const commitEdit = () => {
  if (!editing.value) return
  const { rowId, key } = editing.value
  const col = props.columns.find(c => c.key === key)
  const updated = props.rows.map(r => {
    if (r.id !== rowId) return r
    const raw = editValue.value
    return { ...r, [key]: col?.type === 'number' ? Number(raw) : raw }
  })
  emit('update:rows', updated)
  editing.value = null
}

const onEditKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') commitEdit()
  if (e.key === 'Escape') editing.value = null
}

const toggleSelect = (id: string | number) => {
  if (selected.value.has(id)) selected.value.delete(id)
  else selected.value.add(id)
}

const toggleAll = () => {
  if (selected.value.size === props.rows.length) selected.value.clear()
  else props.rows.forEach(r => selected.value.add(r.id))
}

const deleteSelected = () => {
  const ids = [...selected.value]
  emit('row-delete', ids)
  emit('update:rows', props.rows.filter(r => !selected.value.has(r.id)))
  selected.value.clear()
}

const allSelected = computed(() => props.rows.length > 0 && selected.value.size === props.rows.length)
const someSelected = computed(() => selected.value.size > 0 && !allSelected.value)

const isEditing = (rowId: string | number, key: string) =>
  editing.value?.rowId === rowId && editing.value?.key === key
</script>

<template>
  <div>
    <div v-if="selectable && selected.size > 0" class="d-flex align-center gap-3 mb-3">
      <span class="text-body-2 text-medium-emphasis">{{ selected.size }} selected</span>
      <v-btn size="x-small" color="error" variant="tonal" prepend-icon="mdi-delete-outline" @click="deleteSelected">
        Delete
      </v-btn>
      <v-btn size="x-small" variant="text" @click="selected.clear()">Clear</v-btn>
    </div>

    <div class="data-grid-wrapper rounded-lg overflow-hidden" style="border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));">
      <div style="overflow-x: auto;">
        <table class="data-grid-table" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr class="data-grid-header">
              <th v-if="selectable" class="data-grid-cell data-grid-cell--checkbox" style="width: 48px;">
                <v-checkbox-btn
                  :model-value="allSelected"
                  :indeterminate="someSelected"
                  density="compact"
                  @update:model-value="toggleAll"
                />
              </th>
              <th
                v-for="col in columns"
                :key="col.key"
                class="data-grid-cell text-body-2 font-weight-bold text-left"
                :style="col.width ? `width: ${col.width}px` : ''"
              >
                {{ col.title }}
                <v-icon v-if="col.editable" icon="mdi-pencil-outline" size="12" class="ml-1 text-medium-emphasis" />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in rows"
              :key="row.id"
              class="data-grid-row"
              :class="{ 'data-grid-row--selected': selected.has(row.id) }"
            >
              <td v-if="selectable" class="data-grid-cell data-grid-cell--checkbox">
                <v-checkbox-btn
                  :model-value="selected.has(row.id)"
                  density="compact"
                  @update:model-value="toggleSelect(row.id)"
                />
              </td>
              <td
                v-for="col in columns"
                :key="col.key"
                class="data-grid-cell text-body-2"
                :class="{ 'data-grid-cell--editable': col.editable }"
                @dblclick="startEdit(row, col)"
              >
                <template v-if="isEditing(row.id, col.key)">
                  <select
                    v-if="col.type === 'select' && col.options"
                    ref="inputRef"
                    :value="editValue"
                    class="data-grid-input"
                    @change="editValue = ($event.target as HTMLSelectElement).value; commitEdit()"
                    @blur="commitEdit"
                    @keydown="onEditKeydown"
                  >
                    <option v-for="opt in col.options" :key="opt" :value="opt">{{ opt }}</option>
                  </select>
                  <input
                    v-else
                    ref="inputRef"
                    v-model="editValue"
                    :type="col.type === 'number' ? 'number' : 'text'"
                    class="data-grid-input"
                    @blur="commitEdit"
                    @keydown="onEditKeydown"
                  />
                </template>
                <template v-else>
                  {{ row[col.key] ?? '—' }}
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <p v-if="rows.length === 0" class="text-caption text-medium-emphasis text-center py-6">No rows</p>
  </div>
</template>

<style scoped>
.data-grid-header {
  background: rgb(var(--v-theme-surface-variant));
}
.data-grid-cell {
  padding: 10px 14px;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  white-space: nowrap;
}
.data-grid-cell--checkbox { padding: 4px 8px; }
.data-grid-cell--editable { cursor: cell; }
.data-grid-cell--editable:hover { background: rgba(var(--v-theme-primary), 0.04); }
.data-grid-row--selected { background: rgba(var(--v-theme-primary), 0.06); }
.data-grid-row:last-child td { border-bottom: none; }
.data-grid-input {
  width: 100%;
  background: transparent;
  border: none;
  outline: 2px solid rgb(var(--v-theme-primary));
  border-radius: 4px;
  padding: 2px 6px;
  font-size: inherit;
  color: inherit;
}
</style>
