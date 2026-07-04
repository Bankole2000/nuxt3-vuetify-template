<script setup lang="ts">
// Gantt chart — horizontal bar timeline rendered in SVG via D3 scales.
//
// Features:
//   • Day / week / month zoom levels (toggle with buttons or scroll wheel)
//   • Drag bars left/right to reschedule (emits update-task)
//   • Drag the right edge to resize duration (emits update-task)
//   • Dependency arrows between tasks (finish-to-start)
//   • Today marker line
//   • Milestone diamonds
//   • Row hover highlight
//   • Frozen left panel (task labels) + scrollable right panel (timeline)
//   • Click a bar to select / emit select-task

import * as d3 from 'd3'

// ─── Public types ─────────────────────────────────────────────────────────────

export interface GanttTask {
  id:         string
  label:      string
  start:      string          // ISO date string 'YYYY-MM-DD'
  end:        string          // ISO date string 'YYYY-MM-DD' (exclusive)
  color?:     string
  progress?:  number          // 0–100
  milestone?: boolean
  group?:     string
  dependsOn?: string[]        // IDs of predecessor tasks
  disabled?:  boolean
}

export interface GanttGroup {
  id:    string
  label: string
  color?: string
}

type ZoomLevel = 'day' | 'week' | 'month'

// ─── Props / emits ────────────────────────────────────────────────────────────

const props = withDefaults(defineProps<{
  tasks:       GanttTask[]
  groups?:     GanttGroup[]
  startDate?:  string          // chart window start (ISO); defaults to earliest task
  endDate?:    string          // chart window end   (ISO); defaults to latest task + buffer
  zoom?:       ZoomLevel
  rowHeight?:  number
  labelWidth?: number
  showToday?:  boolean
  showDeps?:   boolean
  editable?:   boolean
}>(), {
  groups:      () => [],
  zoom:        'week',
  rowHeight:   40,
  labelWidth:  220,
  showToday:   true,
  showDeps:    true,
  editable:    true,
})

const emit = defineEmits<{
  'select-task':  [id: string]
  'update-task':  [id: string, start: string, end: string]
}>()

// ─── Refs ─────────────────────────────────────────────────────────────────────

const wrapRef    = ref<HTMLDivElement>()
const scrollLeft = ref(0)
const wrapWidth    = ref(800)
const zoom         = ref<ZoomLevel>(props.zoom)
const selectedId   = ref<string | null>(null)
const hoveredId    = ref<string | null>(null)
const dragging     = ref(false)

// ─── Date helpers ─────────────────────────────────────────────────────────────

const parser    = d3.timeParse('%Y-%m-%d')
const parseDate = (s: string): Date => parser(s) ?? new Date()
const fmtDate   = (d: Date)   => d3.timeFormat('%Y-%m-%d')(d)

const chartStart = computed((): Date => {
  if (props.startDate) return parseDate(props.startDate)
  const dates = props.tasks.map(t => parseDate(t.start))
  const min   = d3.min(dates) ?? new Date()
  return d3.timeDay.offset(min, -3)
})

const chartEnd = computed((): Date => {
  if (props.endDate) return parseDate(props.endDate)
  const dates = props.tasks.map(t => parseDate(t.end))
  const max   = d3.max(dates) ?? new Date()
  return d3.timeDay.offset(max, 7)
})

// ─── D3 scale ─────────────────────────────────────────────────────────────────

const DAY_PX: Record<ZoomLevel, number> = { day: 40, week: 20, month: 8 }

const totalDays = computed(() =>
  d3.timeDay.count(chartStart.value, chartEnd.value)
)

const totalWidth = computed(() =>
  totalDays.value * DAY_PX[zoom.value]
)

const xScale = computed(() =>
  d3.scaleTime()
    .domain([chartStart.value, chartEnd.value])
    .range([0, totalWidth.value])
)

// ─── Row layout ───────────────────────────────────────────────────────────────

// Rows: group header rows + task rows
interface Row { type: 'group' | 'task'; id: string; label: string; color?: string; groupId?: string }

const rows = computed((): Row[] => {
  const out: Row[] = []
  if (props.groups.length) {
    for (const g of props.groups) {
      out.push({ type: 'group', id: g.id, label: g.label, color: g.color })
      for (const t of props.tasks.filter(t => t.group === g.id))
        out.push({ type: 'task', id: t.id, label: t.label, color: t.color, groupId: g.id })
    }
    // Ungrouped tasks
    for (const t of props.tasks.filter(t => !t.group))
      out.push({ type: 'task', id: t.id, label: t.label, color: t.color })
  } else {
    for (const t of props.tasks)
      out.push({ type: 'task', id: t.id, label: t.label, color: t.color })
  }
  return out
})

const totalHeight = computed(() => rows.value.length * props.rowHeight)

const rowY = (rowIndex: number) => rowIndex * props.rowHeight

const taskRow = (taskId: string) => rows.value.findIndex(r => r.id === taskId)

// ─── Tick / header grid ───────────────────────────────────────────────────────

interface Tick { date: Date; label: string; major: boolean }

const ticks = computed((): Tick[] => {
  const z = zoom.value
  const result: Tick[] = []

  if (z === 'day') {
    const days = d3.timeDays(chartStart.value, chartEnd.value)
    for (const d of days) {
      const isMon = d.getDay() === 1
      result.push({ date: d, label: d3.timeFormat('%d')(d), major: isMon })
    }
  } else if (z === 'week') {
    const weeks = d3.timeMondays(chartStart.value, chartEnd.value)
    const months = d3.timeMonths(chartStart.value, chartEnd.value)
    // Minor: each week, Major: each month
    for (const d of d3.timeDays(chartStart.value, chartEnd.value)) {
      const isMon   = d.getDay() === 1
      const isMonth = d.getDate() === 1
      if (isMon || isMonth)
        result.push({ date: d, label: isMonth ? d3.timeFormat('%b %Y')(d) : d3.timeFormat('W%W')(d), major: isMonth })
    }
    void weeks; void months
  } else {
    // month zoom: minor = month, major = year
    for (const d of d3.timeMonths(chartStart.value, chartEnd.value)) {
      const isJan = d.getMonth() === 0
      result.push({ date: d, label: isJan ? d3.timeFormat('%Y')(d) : d3.timeFormat('%b')(d), major: isJan })
    }
  }
  return result
})

// ─── Bar geometry ─────────────────────────────────────────────────────────────

const BAR_PAD = 6  // vertical padding inside a row

interface BarGeom {
  task:    GanttTask
  x:       number
  y:       number
  width:   number
  height:  number
  rowIdx:  number
}

const bars = computed((): BarGeom[] => {
  const out: BarGeom[] = []
  for (const task of props.tasks) {
    if (task.milestone) continue
    const rowIdx = taskRow(task.id)
    if (rowIdx < 0) continue
    const x  = xScale.value(parseDate(task.start))
    const x2 = xScale.value(parseDate(task.end))
    out.push({
      task,
      x,
      y:      rowY(rowIdx) + BAR_PAD,
      width:  Math.max(x2 - x, 2),
      height: props.rowHeight - BAR_PAD * 2,
      rowIdx,
    })
  }
  return out
})

const milestones = computed(() =>
  props.tasks
    .filter(t => t.milestone)
    .map(t => {
      const rowIdx = taskRow(t.id)
      const cx = xScale.value(parseDate(t.start))
      const cy = rowY(rowIdx) + props.rowHeight / 2
      return { task: t, cx, cy, rowIdx }
    })
    .filter(m => m.rowIdx >= 0)
)

// ─── Dependency arrows (finish-to-start elbow) ────────────────────────────────

interface Arrow { id: string; d: string }

const arrows = computed((): Arrow[] => {
  if (!props.showDeps) return []
  const out: Arrow[] = []
  for (const task of props.tasks) {
    for (const predId of (task.dependsOn ?? [])) {
      const pred    = props.tasks.find(t => t.id === predId)
      if (!pred) continue
      const fromRow = taskRow(predId)
      const toRow   = taskRow(task.id)
      if (fromRow < 0 || toRow < 0) continue

      const x1 = xScale.value(parseDate(pred.end))
      const y1 = rowY(fromRow) + props.rowHeight / 2
      const x2 = xScale.value(parseDate(task.start))
      const y2 = rowY(toRow)   + props.rowHeight / 2
      const mx = x1 + Math.max(8, (x2 - x1) / 2)

      out.push({
        id: `${predId}->${task.id}`,
        d:  `M${x1},${y1} H${mx} V${y2} H${x2}`,
      })
    }
  }
  return out
})

// ─── Today marker ─────────────────────────────────────────────────────────────

const todayX = computed(() => xScale.value(new Date()))

// ─── Drag to move / resize ────────────────────────────────────────────────────

let dragState: {
  type:      'move' | 'resize'
  taskId:    string
  startX:    number
  origStart: Date
  origEnd:   Date
} | null = null

const onBarMouseDown = (e: MouseEvent, bar: BarGeom, type: 'move' | 'resize') => {
  if (!props.editable || bar.task.disabled) return
  e.preventDefault()
  dragging.value = true
  dragState = {
    type,
    taskId:    bar.task.id,
    startX:    e.clientX,
    origStart: parseDate(bar.task.start),
    origEnd:   parseDate(bar.task.end),
  }

  const onMove = (ev: MouseEvent) => {
    if (!dragState) return
    const dx      = ev.clientX - dragState.startX
    const daysDx  = dx / DAY_PX[zoom.value]

    if (dragState.type === 'move') {
      const newStart = d3.timeDay.offset(dragState.origStart, Math.round(daysDx))
      const dur      = d3.timeDay.count(dragState.origStart, dragState.origEnd)
      const newEnd   = d3.timeDay.offset(newStart, dur)
      emit('update-task', dragState.taskId, fmtDate(newStart), fmtDate(newEnd))
    } else {
      const newEnd = d3.timeDay.offset(dragState.origEnd, Math.round(daysDx))
      if (d3.timeDay.count(dragState.origStart, newEnd) >= 1)
        emit('update-task', dragState.taskId, fmtDate(dragState.origStart), fmtDate(newEnd))
    }
  }

  const onUp = () => {
    dragging.value = false
    dragState = null
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
  }

  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}

// ─── Scroll sync ──────────────────────────────────────────────────────────────

const onScroll = (e: Event) => {
  scrollLeft.value = (e.target as HTMLDivElement).scrollLeft
}

// ─── Zoom via scroll wheel on the timeline ────────────────────────────────────

const ZOOM_ORDER: ZoomLevel[] = ['day', 'week', 'month']

const onWheel = (e: WheelEvent) => {
  if (!e.ctrlKey && !e.metaKey) return
  e.preventDefault()
  const idx  = ZOOM_ORDER.indexOf(zoom.value)
  const next = e.deltaY < 0 ? idx - 1 : idx + 1
  if (next >= 0 && next < ZOOM_ORDER.length) zoom.value = ZOOM_ORDER[next]!
}

// ─── Resize observer ─────────────────────────────────────────────────────────

onMounted(() => {
  const ro = new ResizeObserver(entries => {
    wrapWidth.value = entries[0]?.contentRect.width ?? 800
  })
  if (wrapRef.value) ro.observe(wrapRef.value)
  onUnmounted(() => ro.disconnect())
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

const barColor = (task: GanttTask) =>
  task.color ?? '#6366f1'

const labelColor = (task: GanttTask) => {
  // pick contrast colour based on background luminance
  const c   = task.color ?? '#6366f1'
  const hex = c.replace('#', '')
  const r   = parseInt(hex.substring(0,2), 16) / 255
  const g   = parseInt(hex.substring(2,4), 16) / 255
  const b   = parseInt(hex.substring(4,6), 16) / 255
  const lum = 0.299*r + 0.587*g + 0.114*b
  return lum > 0.55 ? '#1a1a1a' : '#ffffff'
}

const progressWidth = (bar: BarGeom) =>
  bar.width * ((bar.task.progress ?? 0) / 100)

const selectTask = (id: string) => {
  selectedId.value = selectedId.value === id ? null : id
  emit('select-task', id)
}

const HEADER_H = 52
</script>

<template>
  <div ref="wrapRef" class="gc-root" :style="{ cursor: dragging ? 'grabbing' : 'default' }">

    <!-- ── Toolbar ──────────────────────────────────────────────────────────── -->
    <div class="gc-toolbar">
      <slot name="toolbar-left" />
      <div class="d-flex align-center gap-2 ml-auto">
        <span class="text-caption text-medium-emphasis">Zoom</span>
        <v-btn-toggle v-model="zoom" density="compact" variant="outlined" divided mandatory>
          <v-btn value="day"   size="small">Day</v-btn>
          <v-btn value="week"  size="small">Week</v-btn>
          <v-btn value="month" size="small">Month</v-btn>
        </v-btn-toggle>
        <v-tooltip text="Ctrl+scroll to zoom" location="bottom">
          <template #activator="{ props: tp }">
            <v-icon v-bind="tp" icon="mdi-information-outline" size="16" class="text-medium-emphasis" />
          </template>
        </v-tooltip>
      </div>
    </div>

    <!-- ── Main layout ──────────────────────────────────────────────────────── -->
    <!--
      Single scroll container (.gc-scroll) scrolls both X and Y.
      Inside it, .gc-inner is sized to (labelWidth + totalWidth) wide and auto tall.
      .gc-header-row is position:sticky top:0 so the date axis stays visible on scroll.
      .gc-labels is position:sticky left:0 so task labels stay visible on horizontal scroll.
    -->
    <div class="gc-scroll" @scroll="onScroll" @wheel.passive="onWheel">
      <div class="gc-inner" :style="{ width: `${labelWidth + totalWidth}px` }">

        <!-- Sticky date-axis header -->
        <div class="gc-header-row" :style="{ height: `${HEADER_H}px` }">
          <div class="gc-header-corner" :style="{ width: `${labelWidth}px`, minWidth: `${labelWidth}px` }" />
          <svg :width="totalWidth" :height="HEADER_H" style="display:block;overflow:visible">
            <template v-for="tick in ticks.filter(t => t.major)" :key="`mj-${tick.date.getTime()}`">
              <line :x1="xScale(tick.date)" :x2="xScale(tick.date)" y1="0" :y2="HEADER_H"
                stroke="rgba(var(--v-border-color),var(--v-border-opacity))" stroke-width="1" />
              <text :x="xScale(tick.date) + 4" :y="18"
                fill="rgba(var(--v-theme-on-surface),.7)" font-size="11" font-weight="700" font-family="system-ui,sans-serif">{{ tick.label }}</text>
            </template>
            <template v-for="tick in ticks.filter(t => !t.major)" :key="`mn-${tick.date.getTime()}`">
              <line :x1="xScale(tick.date)" :x2="xScale(tick.date)" y1="30" :y2="HEADER_H"
                stroke="rgba(var(--v-border-color),var(--v-border-opacity))" stroke-width="1" />
              <text :x="xScale(tick.date) + 3" :y="44"
                fill="rgba(var(--v-theme-on-surface),.45)" font-size="10" font-family="system-ui,sans-serif">{{ tick.label }}</text>
            </template>
            <line v-if="showToday" :x1="todayX" :x2="todayX" y1="0" :y2="HEADER_H"
              stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3,3" />
          </svg>
        </div>

        <!-- Body row: sticky label column + timeline SVG -->
        <div class="gc-body-row">
          <!-- Sticky label column -->
          <div class="gc-labels" :style="{ width: `${labelWidth}px`, minWidth: `${labelWidth}px` }">
            <div
              v-for="row in rows"
              :key="row.id"
              class="gc-label-row"
              :class="{
                'gc-label-row--group':    row.type === 'group',
                'gc-label-row--task':     row.type === 'task',
                'gc-label-row--hovered':  hoveredId === row.id,
                'gc-label-row--selected': selectedId === row.id,
              }"
              :style="{ height: `${rowHeight}px` }"
              @mouseenter="hoveredId = row.id"
              @mouseleave="hoveredId = null"
              @click="row.type === 'task' && selectTask(row.id)"
            >
              <div v-if="row.type === 'task' && row.color" class="gc-label-swatch" :style="{ background: row.color }" />
              <v-icon v-if="row.type === 'group'" icon="mdi-chevron-down" size="14" class="mr-1 text-medium-emphasis" />
              <span class="gc-label-text" :class="row.type === 'group' ? 'gc-label-text--group' : ''">
                {{ row.label }}
              </span>
            </div>
          </div>

          <!-- Timeline SVG -->
          <div class="gc-timeline-wrap">
            <svg
              class="gc-timeline-svg"
              :width="totalWidth"
              :height="totalHeight"
            >
          <!-- Row backgrounds + grid lines -->
          <g>
            <template v-for="(row, ri) in rows" :key="`row-${row.id}`">
              <!-- Row background -->
              <rect
                x="0"
                :y="rowY(ri)"
                :width="totalWidth"
                :height="rowHeight"
                :fill="
                  row.type === 'group'
                    ? 'rgba(var(--v-theme-on-surface),.04)'
                    : hoveredId === row.id
                      ? 'rgba(var(--v-theme-primary),.05)'
                      : ri % 2 === 0
                        ? 'rgba(var(--v-theme-on-surface),.015)'
                        : 'transparent'
                "
                @mouseenter="hoveredId = row.id"
                @mouseleave="hoveredId = null"
              />
              <!-- Row bottom border -->
              <line
                x1="0"
                :x2="totalWidth"
                :y1="rowY(ri) + rowHeight"
                :y2="rowY(ri) + rowHeight"
                stroke="rgba(var(--v-border-color),var(--v-border-opacity))"
                stroke-width="0.5"
              />
            </template>
          </g>

          <!-- Vertical grid lines at major ticks -->
          <g>
            <line
              v-for="tick in ticks.filter(t => t.major)"
              :key="`vg-${tick.date.getTime()}`"
              :x1="xScale(tick.date)"
              :x2="xScale(tick.date)"
              y1="0"
              :y2="totalHeight"
              stroke="rgba(var(--v-border-color),var(--v-border-opacity))"
              stroke-width="0.75"
            />
          </g>

          <!-- Dependency arrows -->
          <g v-if="showDeps" class="gc-arrows">
            <path
              v-for="arrow in arrows"
              :key="arrow.id"
              :d="arrow.d"
              fill="none"
              stroke="rgba(var(--v-theme-on-surface),.2)"
              stroke-width="1.5"
              stroke-dasharray="4,3"
              marker-end="url(#gc-arrow)"
            />
          </g>

          <!-- Arrow marker -->
          <defs>
            <marker
              id="gc-arrow"
              markerWidth="6" markerHeight="6"
              refX="5" refY="3"
              orient="auto"
            >
              <path d="M0,0 L0,6 L6,3 Z" fill="rgba(var(--v-theme-on-surface),.3)" />
            </marker>
          </defs>

          <!-- Task bars -->
          <g class="gc-bars">
            <g
              v-for="bar in bars"
              :key="bar.task.id"
              class="gc-bar-group"
              @mouseenter="hoveredId = bar.task.id"
              @mouseleave="hoveredId = null"
              @click="selectTask(bar.task.id)"
            >
              <!-- Shadow on selected -->
              <rect
                v-if="selectedId === bar.task.id"
                :x="bar.x - 2"
                :y="bar.y - 2"
                :width="bar.width + 4"
                :height="bar.height + 4"
                :rx="6"
                fill="none"
                stroke="rgba(var(--v-theme-primary),.6)"
                stroke-width="2"
              />

              <!-- Main bar -->
              <rect
                :x="bar.x"
                :y="bar.y"
                :width="bar.width"
                :height="bar.height"
                :rx="4"
                :fill="barColor(bar.task)"
                :opacity="bar.task.disabled ? 0.4 : 0.85"
                :style="{ cursor: editable && !bar.task.disabled ? 'grab' : 'default' }"
                @mousedown="onBarMouseDown($event, bar, 'move')"
              />

              <!-- Progress fill -->
              <rect
                v-if="(bar.task.progress ?? 0) > 0"
                :x="bar.x"
                :y="bar.y"
                :width="progressWidth(bar)"
                :height="bar.height"
                :rx="4"
                fill="rgba(255,255,255,.3)"
              />

              <!-- Progress text -->
              <text
                v-if="bar.width > 36 && (bar.task.progress ?? 0) > 0"
                :x="bar.x + bar.width / 2"
                :y="bar.y + bar.height / 2 + 4"
                text-anchor="middle"
                :fill="labelColor(bar.task)"
                font-size="10"
                font-weight="700"
                font-family="system-ui,sans-serif"
                pointer-events="none"
              >{{ bar.task.progress }}%</text>

              <!-- Label (when wide enough) -->
              <text
                v-else-if="bar.width > 50"
                :x="bar.x + 7"
                :y="bar.y + bar.height / 2 + 4"
                :fill="labelColor(bar.task)"
                font-size="10"
                font-weight="600"
                font-family="system-ui,sans-serif"
                pointer-events="none"
              >
                <tspan>{{ bar.task.label.length > 18 ? bar.task.label.slice(0, 16) + '…' : bar.task.label }}</tspan>
              </text>

              <!-- Resize handle (right edge) -->
              <rect
                v-if="editable && !bar.task.disabled"
                :x="bar.x + bar.width - 6"
                :y="bar.y"
                width="6"
                :height="bar.height"
                :rx="4"
                fill="rgba(255,255,255,.25)"
                style="cursor:col-resize"
                @mousedown.stop="onBarMouseDown($event, bar, 'resize')"
              />
            </g>
          </g>

          <!-- Milestones (diamonds) -->
          <g class="gc-milestones">
            <g
              v-for="ms in milestones"
              :key="ms.task.id"
              @click="selectTask(ms.task.id)"
              style="cursor:pointer"
            >
              <path
                :d="`M${ms.cx},${ms.cy - 10} L${ms.cx + 9},${ms.cy} L${ms.cx},${ms.cy + 10} L${ms.cx - 9},${ms.cy} Z`"
                :fill="ms.task.color ?? '#f59e0b'"
                :stroke="selectedId === ms.task.id ? 'rgba(var(--v-theme-primary),.8)' : 'none'"
                stroke-width="2"
              />
              <text
                :x="ms.cx + 12"
                :y="ms.cy + 4"
                fill="rgba(var(--v-theme-on-surface),.7)"
                font-size="10"
                font-family="system-ui,sans-serif"
              >{{ ms.task.label }}</text>
            </g>
          </g>

          <!-- Today line -->
          <g v-if="showToday">
            <line
              :x1="todayX" :x2="todayX"
              y1="0" :y2="totalHeight"
              stroke="#ef4444"
              stroke-width="1.5"
            />
            <circle :cx="todayX" cy="0" r="4" fill="#ef4444" />
          </g>
        </svg>
          </div><!-- /.gc-timeline-wrap -->
        </div><!-- /.gc-body-row -->
      </div><!-- /.gc-inner -->
    </div><!-- /.gc-scroll -->
  </div><!-- /.gc-root -->
</template>

<style scoped>
/* Root card */
.gc-root {
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 12px;
  overflow: hidden;
  background: rgb(var(--v-theme-surface));
  user-select: none;
}

/* Toolbar */
.gc-toolbar {
  display: flex;
  align-items: center;
  padding: 8px 14px;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  flex-shrink: 0;
  gap: 8px;
}

/*
  Single scroll container — scrolls both X and Y.
  max-height caps the visible area so the page itself stays
  at a readable height; content taller than this scrolls inside.
*/
.gc-scroll {
  overflow: auto;
  max-height: 500px;
  position: relative;
}

/* Wide inner wrapper sets the total scrollable width */
.gc-inner {
  position: relative;
}

/* Sticky header: sticks to the top of .gc-scroll when scrolling vertically */
.gc-header-row {
  position: sticky;
  top: 0;
  z-index: 4;
  display: flex;
  align-items: stretch;
  background: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.gc-header-corner {
  flex-shrink: 0;
  background: rgba(var(--v-theme-on-surface), .02);
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  position: sticky;
  left: 0;
  z-index: 5;
}

/* Body row: label column + timeline side by side */
.gc-body-row {
  display: flex;
  align-items: flex-start;
}

/* Sticky label column: sticks to the left of .gc-scroll when scrolling horizontally */
.gc-labels {
  position: sticky;
  left: 0;
  z-index: 3;
  flex-shrink: 0;
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  display: flex;
  flex-direction: column;
  background: rgb(var(--v-theme-surface));
}

.gc-label-row {
  display: flex;
  align-items: center;
  padding: 0 10px 0 12px;
  gap: 6px;
  cursor: default;
  transition: background .1s;
  border-bottom: 1px solid rgba(var(--v-border-color), .4);
  flex-shrink: 0;
}
.gc-label-row--task    { cursor: pointer; }
.gc-label-row--group   { background: rgba(var(--v-theme-on-surface), .03); }
.gc-label-row--hovered { background: rgba(var(--v-theme-primary), .05); }
.gc-label-row--selected .gc-label-text { color: rgb(var(--v-theme-primary)); font-weight: 700; }

.gc-label-swatch {
  width: 8px; height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.gc-label-text {
  font-size: 12px;
  color: rgb(var(--v-theme-on-surface));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.3;
}
.gc-label-text--group {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .05em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), .5);
}

/* Timeline SVG wrapper */
.gc-timeline-wrap {
  flex: 1;
  overflow: visible;
}
.gc-timeline-svg { display: block; }

.gc-bar-group { cursor: pointer; }
</style>
