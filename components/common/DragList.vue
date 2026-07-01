<script setup lang="ts">
const props = withDefaults(defineProps<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  modelValue: any[]
  itemKey?: string
  disabled?: boolean
  handle?: boolean
}>(), {
  itemKey: 'id',
  disabled: false,
  handle: true,
})

const emit = defineEmits<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (e: 'update:modelValue', value: any[]): void
  (e: 'change', from: number, to: number): void
}>()

const items = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const dragSrcIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)
const dropPosition = ref<'before' | 'after'>('after')

const onDragStart = (e: DragEvent, index: number) => {
  dragSrcIndex.value = index
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }
}

const onDragOver = (e: DragEvent, index: number) => {
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
  dragOverIndex.value = index
  const target = e.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  dropPosition.value = e.clientY < rect.top + rect.height / 2 ? 'before' : 'after'
}

const onDragLeave = () => {
  dragOverIndex.value = null
}

const onDrop = (e: DragEvent, toIndex: number) => {
  e.preventDefault()
  const fromIndex = dragSrcIndex.value
  if (fromIndex === null || fromIndex === toIndex) {
    reset()
    return
  }

  const adjusted = dropPosition.value === 'after' && toIndex < fromIndex
    ? toIndex + 1
    : dropPosition.value === 'before' && toIndex > fromIndex
      ? toIndex - 1
      : toIndex

  const next = [...items.value]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(adjusted, 0, moved)
  emit('update:modelValue', next)
  emit('change', fromIndex, adjusted)
  reset()
}

const onDragEnd = reset

function reset() {
  dragSrcIndex.value = null
  dragOverIndex.value = null
}
</script>

<template>
  <div role="list">
    <div
      v-for="(item, index) in items"
      :key="String(item[itemKey])"
      role="listitem"
      :draggable="!disabled && !handle"
      class="sortable-item"
      :class="{
        'sortable-item--dragging': dragSrcIndex === index,
        'sortable-item--over-before': dragOverIndex === index && dropPosition === 'before',
        'sortable-item--over-after': dragOverIndex === index && dropPosition === 'after',
      }"
      @dragover="onDragOver($event, index)"
      @dragleave="onDragLeave"
      @drop="onDrop($event, index)"
      @dragend="onDragEnd"
    >
      <v-icon
        v-if="handle && !disabled"
        icon="mdi-drag-vertical"
        class="sortable-handle mr-2"
        size="20"
        :draggable="true"
        @dragstart="onDragStart($event, index)"
      />

      <div
        class="sortable-content"
        :draggable="!disabled && !handle ? true : undefined"
        @dragstart="!handle && !disabled ? onDragStart($event, index) : undefined"
      >
        <slot v-bind="{ item, index }" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.sortable-item {
  display: flex;
  align-items: center;
  position: relative;
  transition: opacity 0.15s ease;
  user-select: none;
}

.sortable-item--dragging {
  opacity: 0.35;
}

.sortable-item--over-before::before,
.sortable-item--over-after::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: rgb(var(--v-theme-primary));
  border-radius: 2px;
  pointer-events: none;
}

.sortable-item--over-before::before {
  top: 0;
}

.sortable-item--over-after::after {
  bottom: 0;
}

.sortable-handle {
  cursor: grab;
  opacity: 0.4;
  flex-shrink: 0;
  touch-action: none;
}

.sortable-handle:active {
  cursor: grabbing;
  opacity: 0.8;
}

.sortable-content {
  flex: 1;
  min-width: 0;
}
</style>
