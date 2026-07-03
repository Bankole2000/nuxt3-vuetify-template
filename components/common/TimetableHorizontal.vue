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

// ─── Layout constants ─────────────────────────────────────────────────────────
const ROW_H    = 56   // px per day row
const LABEL_W  = 72   // px for the day-label column
const HEADER_H = 44   // px for the time header row

// ─── Effective column width ───────────────────────────────────────────────────
// Grows to fill the viewport when the natural slotPx would leave blank space
const viewportRef  = ref<HTMLDivElement>()
const viewportW    = ref(0)

const effectiveColPx = computed(() => {
  if (!props.totalSlots) return props.slotPx
  const available = viewportW.value - LABEL_W
  return Math.max(props.slotPx, available / props.totalSlots)
})

let ro: ResizeObserver | undefined
onMounted(() => {
  ro = new ResizeObserver(entries => {
    viewportW.value = entries[0]?.contentRect.width ?? 0
  })
  if (viewportRef.value) ro.observe(viewportRef.value)
})
onUnmounted(() => ro?.disconnect())

// ─── Helpers ─────────────────────────────────────────────────────────────────
const slotToTime = (slot: number) => {
  const totalMin = props.viewStart * 60 + slot * props.gran
  const h  = Math.floor(totalMin / 60) % 24
  const mm = totalMin % 60
  // Compact label: show only hour at hour boundaries, skip minutes when 0
  if (mm === 0) return `${h}:00`
  return `${h}:${String(mm).padStart(2, '0')}`
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
const draggingId     = ref<string | null>(null)
const dragSlotOffset = ref(0)

const onTaskDragStart = (e: DragEvent, task: TimetableTask, cellEl: HTMLElement) => {
  draggingId.value = task.id
  // Calculate which slot within the task the user grabbed so the drop position
  // is anchored to the grab point, not the task's leading edge
  const rect      = cellEl.getBoundingClientRect()
  const offsetPx  = e.clientX - rect.left
  dragSlotOffset.value = Math.floor(offsetPx / effectiveColPx.value)
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
  const newSlot = Math.max(0, Math.min(props.totalSlots - task.span, slot - dragSlotOffset.value))
  const newMin  = props.viewStart * 60 + newSlot * props.gran
  emit('update:task', { ...task, day, startSlot: newSlot, startMin: newMin })
  draggingId.value = null
}

// ─── Resize (east edge — extends task duration rightward) ─────────────────────
let resizingTask  : TimetableTask | null = null
let resizeStartX  = 0
let resizeStartSpan = 0

const onResizeMouseDown = (e: MouseEvent, task: TimetableTask) => {
  e.stopPropagation()
  e.preventDefault()
  resizingTask    = task
  resizeStartX    = e.clientX
  resizeStartSpan = task.span
}

const onMouseMove = (e: MouseEvent) => {
  if (!resizingTask) return
  const delta   = Math.round((e.clientX - resizeStartX) / effectiveColPx.value)
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
  <div ref="viewportRef" class="tth-viewport">
    <div
      class="tth-grid"
      :style="{
        gridTemplateColumns: `${LABEL_W}px repeat(${totalSlots}, ${effectiveColPx}px)`,
        gridTemplateRows: `${HEADER_H}px repeat(${days.length}, ${ROW_H}px)`,
      }"
    >
      <!-- Corner -->
      <div class="tth-corner" />

      <!-- Time headers (one per slot) -->
      <div
        v-for="slot in slots"
        :key="slot"
        class="tth-time-head"
        :class="{
          'tth-time-head--hour':    slot % slotsPerHour === 0,
          'tth-time-head--subslot': slot % slotsPerHour !== 0,
        }"
      >
        <span v-if="showSlotLabel(slot)" class="tth-time-head-label">
          {{ slotToTime(slot) }}
        </span>
      </div>

      <!-- Day rows -->
      <template v-for="(day, di) in days" :key="day">
        <!-- Day label -->
        <div class="tth-day-label" :class="{ 'tth-day-label--weekend': di >= 5 }">
          {{ day }}
        </div>

        <!-- Cells (one per slot) -->
        <div
          v-for="slot in slots"
          :key="`${di}-${slot}`"
          class="tth-cell"
          :class="{
            'tth-cell--hour':    slot % slotsPerHour === 0,
            'tth-cell--subslot': slot % slotsPerHour !== 0,
            'tth-cell--weekend': di >= 5,
          }"
          @dragover="onCellDragOver"
          @drop="onCellDrop($event, di, slot)"
          @dblclick="emit('add:task', di, slot)"
        >
          <!-- Task pill — spans multiple cells via absolute width -->
          <div
            v-for="task in cellTasks(di, slot)"
            :key="task.id"
            class="tth-task"
            :class="{ 'tth-task--dragging': draggingId === task.id }"
            :style="{
              background: task.color,
              width: `calc(${task.span} * ${effectiveColPx}px - 4px)`,
            }"
            draggable="true"
            @dragstart="onTaskDragStart($event, task, $el as HTMLElement)"
          >
            <div class="tth-task-body">
              <span class="tth-title">{{ task.title }}</span>
              <span class="tth-time">{{ fmtRange(task) }}</span>
              <v-btn
                icon="mdi-close" size="x-small" variant="text"
                color="white" density="compact" class="tth-del"
                @click.stop="emit('delete:task', task.id)"
              />
            </div>
            <!-- East-edge resize handle -->
            <div class="tth-resize" @mousedown="onResizeMouseDown($event, task)" />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* ── Viewport ── */
.tth-viewport {
  width: 100%;
  height: 460px;          /* shorter — only 7 rows, scrolls horizontally for time */
  overflow: auto;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 10px;
}

/* ── Grid ── */
.tth-grid { display: grid; }

/* ── Corner ── */
.tth-corner {
  background: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-right:  1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  position: sticky;
  left: 0;
  top: 0;
  z-index: 4;
}

/* ── Time header row ── */
.tth-time-head {
  display: flex;
  align-items: flex-end;
  padding-bottom: 6px;
  padding-left: 4px;
  background: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-right:  1px solid rgba(var(--v-border-color), calc(var(--v-border-opacity) * .2));
  position: sticky;
  top: 0;
  z-index: 3;
  overflow: visible;
}
.tth-time-head--hour {
  border-right-color: rgba(var(--v-border-color), var(--v-border-opacity));
}
.tth-time-head-label {
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  color: rgba(var(--v-theme-on-surface), .45);
  white-space: nowrap;
  /* Shift label left so it appears centred over the boundary line */
  transform: translateX(-50%);
  display: inline-block;
}

/* ── Day label column ── */
.tth-day-label {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 12px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), .5);
  background: rgb(var(--v-theme-surface));
  border-right:  1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-bottom: 1px solid rgba(var(--v-border-color), calc(var(--v-border-opacity) * .4));
  position: sticky;
  left: 0;
  z-index: 2;
}
.tth-day-label--weekend {
  color: rgba(var(--v-theme-primary), .6);
}

/* ── Cells ── */
.tth-cell {
  position: relative;
  border-right:  1px solid rgba(var(--v-border-color), calc(var(--v-border-opacity) * .2));
  border-bottom: 1px solid rgba(var(--v-border-color), calc(var(--v-border-opacity) * .4));
  background: rgb(var(--v-theme-surface-variant));
  overflow: visible;        /* tasks can spill rightward across cells */
  box-sizing: border-box;
}
.tth-cell--hour    { border-left: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); }
.tth-cell--subslot { border-right-color: rgba(var(--v-border-color), calc(var(--v-border-opacity) * .1)); }
.tth-cell--weekend { background: rgba(var(--v-theme-on-surface), .015); }
.tth-cell:hover    { background: rgba(var(--v-theme-primary), .05); }

/* ── Tasks ── */
.tth-task {
  position: absolute;
  top: 4px;
  left: 2px;
  height: calc(100% - 8px);
  min-width: 24px;
  border-radius: 6px;
  z-index: 1;
  cursor: grab;
  overflow: hidden;
  user-select: none;
  box-shadow: 0 1px 4px rgba(0,0,0,.2);
  transition: opacity .15s, box-shadow .15s;
}
.tth-task:hover     { box-shadow: 0 2px 10px rgba(0,0,0,.28); }
.tth-task--dragging { opacity: .35; }

.tth-task-body {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  padding: 4px 8px;
  gap: 1px;
  overflow: hidden;
  position: relative;
}
.tth-title {
  font-size: 11px;
  font-weight: 700;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tth-time {
  font-size: 9px;
  color: rgba(255,255,255,.68);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.tth-del {
  position: absolute;
  top: 2px; right: 2px;
  opacity: 0;
  transition: opacity .15s;
  flex-shrink: 0;
}
.tth-task:hover .tth-del { opacity: 1; }

/* ── Resize handle (east edge) ── */
.tth-resize {
  position: absolute;
  top: 0; bottom: 0; right: 0;
  width: 8px;
  cursor: e-resize;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tth-resize::after {
  content: '';
  width: 2px; height: 18px;
  border-radius: 1px;
  background: rgba(255,255,255,.45);
}
</style>
