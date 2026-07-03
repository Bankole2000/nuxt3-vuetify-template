<script setup lang="ts">
import type { TimetableTask, TimetableGran } from '~/types/timetable'

const props = defineProps<{
  tasks: TimetableTask[]
  days: string[]
  slots: number[]
  gran: TimetableGran
  slotsPerHour: number
  totalSlots: number
  slotPx: number
  viewStart: number
}>()

const emit = defineEmits<{
  (e: 'update:task', task: TimetableTask): void
  (e: 'delete:task', id: string): void
  (e: 'add:task', day: number, slot: number): void
}>()

// ─── Helpers ─────────────────────────────────────────────────────────────────
const slotToTime = (slot: number) => {
  const totalMin = props.viewStart * 60 + slot * props.gran
  const h  = Math.floor(totalMin / 60) % 24
  const mm = totalMin % 60
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

const fmtMin = (min: number) => {
  const h = Math.floor(min / 60) % 24
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
const fmtRange = (t: TimetableTask) => `${fmtMin(t.startMin)}–${fmtMin(t.startMin + t.spanMin)}`

const showSlotLabel = (slot: number) => slot % props.slotsPerHour === 0

const cellTasks = (day: number, slot: number) =>
  props.tasks.filter(t => t.day === day && Math.round(t.startSlot) === slot)

// ─── DnD ─────────────────────────────────────────────────────────────────────
const draggingId    = ref<string | null>(null)
const dragSlotOffset = ref(0)

const onTaskDragStart = (e: DragEvent, task: TimetableTask) => {
  draggingId.value    = task.id
  dragSlotOffset.value = 0
  e.dataTransfer!.effectAllowed = 'move'
  e.dataTransfer!.setData('text/plain', task.id)
}

const onCellDragOver = (e: DragEvent) => {
  e.preventDefault()
  e.dataTransfer!.dropEffect = 'move'
}

const onCellDrop = (e: DragEvent, day: number, slot: number) => {
  e.preventDefault()
  const task = props.tasks.find(t => t.id === e.dataTransfer!.getData('text/plain'))
  if (!task) return
  const newSlot  = Math.max(0, Math.min(props.totalSlots - task.span, slot - dragSlotOffset.value))
  const newMin   = props.viewStart * 60 + newSlot * props.gran
  emit('update:task', { ...task, day, startSlot: newSlot, startMin: newMin })
  draggingId.value = null
}

// ─── Resize ───────────────────────────────────────────────────────────────────
let resizingTask : TimetableTask | null = null
let resizeStartY = 0
let resizeStartSpan = 0

const onResizeMouseDown = (e: MouseEvent, task: TimetableTask) => {
  e.stopPropagation()
  e.preventDefault()
  resizingTask    = task
  resizeStartY    = e.clientY
  resizeStartSpan = task.span
}

const onMouseMove = (e: MouseEvent) => {
  if (!resizingTask) return
  const delta   = Math.round((e.clientY - resizeStartY) / props.slotPx)
  const max     = props.totalSlots - resizingTask.startSlot
  const newSpan = Math.max(1, Math.min(max, resizeStartSpan + delta))
  emit('update:task', { ...resizingTask, span: newSpan, spanMin: newSpan * props.gran })
}
const onMouseUp = () => { resizingTask = null }

onMounted(() => {
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup',   onMouseUp)
})
onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup',   onMouseUp)
})
</script>

<template>
  <div class="ttv-viewport">
    <div
      class="ttv-grid"
      :style="{
        gridTemplateColumns: `56px repeat(${days.length}, minmax(100px, 1fr))`,
        gridTemplateRows: `40px repeat(${totalSlots}, ${slotPx}px)`,
      }"
    >
      <!-- Corner -->
      <div class="ttv-corner" />

      <!-- Day headers -->
      <div v-for="d in days" :key="d" class="ttv-head">{{ d }}</div>

      <!-- Slot rows -->
      <template v-for="slot in slots" :key="slot">
        <!-- Time label -->
        <div class="ttv-time-label" :style="{ height: slotPx + 'px' }">
          <span v-if="showSlotLabel(slot)">{{ slotToTime(slot) }}</span>
        </div>

        <!-- Cells (one per day) -->
        <div
          v-for="(_, di) in days"
          :key="`${di}-${slot}`"
          class="ttv-cell"
          :class="{
            'ttv-cell--hour':    slot % slotsPerHour === 0,
            'ttv-cell--subslot': slot % slotsPerHour !== 0,
            'ttv-cell--weekend': di >= 5,
          }"
          @dragover="onCellDragOver"
          @drop="onCellDrop($event, di, slot)"
          @dblclick="emit('add:task', di, slot)"
        >
          <div
            v-for="task in cellTasks(di, slot)"
            :key="task.id"
            class="ttv-task"
            :class="{ 'ttv-task--dragging': draggingId === task.id }"
            :style="{
              background: task.color,
              height: `calc(${task.span} * ${slotPx}px - 3px)`,
            }"
            draggable="true"
            @dragstart="onTaskDragStart($event, task)"
          >
            <div class="ttv-task-body">
              <span class="ttv-title">{{ task.title }}</span>
              <span class="ttv-time">{{ fmtRange(task) }}</span>
              <v-btn
                icon="mdi-close" size="x-small" variant="text"
                color="white" density="compact" class="ttv-del"
                @click.stop="emit('delete:task', task.id)"
              />
            </div>
            <div class="ttv-resize" @mousedown="onResizeMouseDown($event, task)" />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* ── Viewport ── */
.ttv-viewport {
  width: 100%;
  height: 560px;
  overflow: auto;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 10px;
}

/* ── Grid ── */
.ttv-grid { display: grid; }

/* ── Corner ── */
.ttv-corner {
  background: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-right:  1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  position: sticky;
  left: 0;
  top: 0;
  z-index: 4;
}

/* ── Day headers ── */
.ttv-head {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), .5);
  background: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-right:  1px solid rgba(var(--v-border-color), calc(var(--v-border-opacity) * .4));
  position: sticky;
  top: 0;
  z-index: 3;
}

/* ── Time labels ── */
.ttv-time-label {
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 2px 6px 0 0;
  font-size: 9px;
  font-variant-numeric: tabular-nums;
  color: rgba(var(--v-theme-on-surface), .38);
  background: rgb(var(--v-theme-surface));
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  position: sticky;
  left: 0;
  z-index: 2;
  box-sizing: border-box;
}

/* ── Cells ── */
.ttv-cell {
  position: relative;
  border-right:  1px solid rgba(var(--v-border-color), calc(var(--v-border-opacity) * .3));
  border-bottom: 1px solid rgba(var(--v-border-color), calc(var(--v-border-opacity) * .25));
  background: rgb(var(--v-theme-surface-variant));
  box-sizing: border-box;
}
.ttv-cell--hour    { border-bottom-color: rgba(var(--v-border-color), var(--v-border-opacity)); }
.ttv-cell--subslot { border-right-color: rgba(var(--v-border-color), calc(var(--v-border-opacity) * .15)); }
.ttv-cell--weekend { background: rgba(var(--v-theme-on-surface), .015); }
.ttv-cell:hover    { background: rgba(var(--v-theme-primary), .05); }

/* ── Tasks ── */
.ttv-task {
  position: absolute;
  inset: 1px 3px auto 3px;
  border-radius: 5px;
  z-index: 1;
  cursor: grab;
  overflow: hidden;
  user-select: none;
  box-shadow: 0 1px 4px rgba(0,0,0,.2);
  transition: opacity .15s, box-shadow .15s;
}
.ttv-task:hover         { box-shadow: 0 3px 10px rgba(0,0,0,.28); }
.ttv-task--dragging     { opacity: .35; }

.ttv-task-body {
  padding: 4px 6px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}
.ttv-title {
  font-size: 11px;
  font-weight: 700;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}
.ttv-time {
  font-size: 9px;
  color: rgba(255,255,255,.72);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  line-height: 1.3;
}
.ttv-del {
  position: absolute;
  top: 2px; right: 2px;
  opacity: 0;
  transition: opacity .15s;
}
.ttv-task:hover .ttv-del { opacity: 1; }

/* ── Resize handle (south edge) ── */
.ttv-resize {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 8px;
  cursor: s-resize;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ttv-resize::after {
  content: '';
  width: 22px; height: 2px;
  border-radius: 1px;
  background: rgba(255,255,255,.45);
}
</style>
