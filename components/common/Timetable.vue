<script setup lang="ts">
import type { TimetableTask, TimetableGran } from '~/types/timetable'

// ─── Constants ────────────────────────────────────────────────────────────────
const DAYS   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#f97316', '#8b5cf6', '#14b8a6', '#ef4444']

// ─── View window ──────────────────────────────────────────────────────────────
const viewRange = ref<[number, number]>([0, 24])
const viewStart = computed(() => viewRange.value[0]!)
const viewEnd   = computed(() => viewRange.value[1]!)
const viewHours = computed(() => viewEnd.value - viewStart.value)
const fmtHourLabel = (h: number) => `${String(h).padStart(2, '0')}:00`

// ─── Granularity ─────────────────────────────────────────────────────────────
const GRAN_OPTIONS: { label: string; value: TimetableGran }[] = [
  { label: '1 hr',   value: 60 },
  { label: '30 min', value: 30 },
  { label: '15 min', value: 15 },
  { label: '10 min', value: 10 },
]
const gran = ref<TimetableGran>(60)

// ─── Derived slot geometry ────────────────────────────────────────────────────
const slotsPerHour = computed(() => 60 / gran.value)
const totalSlots   = computed(() => (viewHours.value * 60) / gran.value)
const slots        = computed(() => Array.from({ length: totalSlots.value }, (_, i) => i))
const HOUR_PX      = 52
const slotPx       = computed(() => (HOUR_PX * gran.value) / 60)

// ─── Tasks ───────────────────────────────────────────────────────────────────
let _uid = 0
const uid = () => `t${_uid++}`

// slot ↔ absolute-minute helpers (use current viewStart + gran)
const slotToMin = (slot: number) => viewStart.value * 60 + slot * gran.value
const minToSlot = (min: number)  => (min - viewStart.value * 60) / gran.value

const tasks = ref<TimetableTask[]>([])

const makeTask = (title: string, color: string, day: number, startHour: number, spanHours: number): TimetableTask => {
  const startMin = startHour * 60
  const spanMin  = spanHours * 60
  return { id: uid(), title, color, day, startMin, spanMin, startSlot: minToSlot(startMin), span: spanMin / gran.value }
}

// Recompute slot fields whenever viewStart or gran changes (startMin/spanMin are the truth)
watch([viewStart, gran], () => {
  tasks.value = tasks.value.map(t => ({
    ...t,
    startSlot: minToSlot(t.startMin),
    span: t.spanMin / gran.value,
  }))
})

onMounted(() => {
  tasks.value = [
    makeTask('Stand-up',     '#6366f1', 0,  9,  1),
    makeTask('Deep work',    '#3b82f6', 0, 10,  3),
    makeTask('Lunch',        '#10b981', 0, 13,  1),
    makeTask('Design sync',  '#ec4899', 1, 10,  2),
    makeTask('Code review',  '#f59e0b', 1, 14,  1),
    makeTask('Sprint plan',  '#8b5cf6', 2,  9,  2),
    makeTask('Lunch',        '#10b981', 2, 13,  1),
    makeTask('1:1',          '#f97316', 3, 11,  1),
    makeTask('Deep work',    '#3b82f6', 3, 14,  3),
    makeTask('Retro',        '#14b8a6', 4, 10,  1),
    makeTask('Gym',          '#ef4444', 5,  9,  2),
    makeTask('Side project', '#6366f1', 6, 10,  4),
  ]
})

// Only pass tasks visible within the current window to children
const visibleTasks = computed(() =>
  tasks.value.filter(t => {
    const endMin = t.startMin + t.spanMin
    return endMin > viewStart.value * 60 && t.startMin < viewEnd.value * 60
  }),
)

// ─── Current task ─────────────────────────────────────────────────────────────
const now = ref(new Date())
let nowTimer: ReturnType<typeof setTimeout>

// Align to the next minute boundary so "Now" flips exactly on the minute
const scheduleNowTick = () => {
  const msToNextMinute = (60 - new Date().getSeconds()) * 1000 - new Date().getMilliseconds()
  nowTimer = setTimeout(() => {
    now.value = new Date()
    nowTimer  = setInterval(() => { now.value = new Date() }, 60_000)
  }, msToNextMinute)
}

onMounted(scheduleNowTick)
onUnmounted(() => clearInterval(nowTimer))

// Day index: Date.getDay() returns 0=Sun…6=Sat; our DAYS is 0=Mon…6=Sun
const todayIndex = computed(() => (now.value.getDay() + 6) % 7)
const nowMin     = computed(() => now.value.getHours() * 60 + now.value.getMinutes())

const currentTask = computed(() =>
  tasks.value.find(t =>
    t.day === todayIndex.value &&
    nowMin.value >= t.startMin &&
    nowMin.value <  t.startMin + t.spanMin,
  ) ?? null,
)

// Upcoming: all tasks that start after now this week, sorted chronologically
// Sort key: day * 1440 + startMin so cross-day ordering works correctly
const nowWeekMin = computed(() => todayIndex.value * 1440 + nowMin.value)

const upcomingTasks = computed(() =>
  tasks.value
    .filter(t => t.day * 1440 + t.startMin > nowWeekMin.value)
    .sort((a, b) => (a.day * 1440 + a.startMin) - (b.day * 1440 + b.startMin))
    .slice(0, 4),
)

const fmtMin = (min: number) => {
  const h = Math.floor(min / 60) % 24
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// Human-readable "starts in X" label
const startsIn = (t: TimetableTask) => {
  const diffMin = t.day * 1440 + t.startMin - nowWeekMin.value
  if (diffMin < 60)  return `in ${diffMin}m`
  if (diffMin < 1440) return `in ${Math.floor(diffMin / 60)}h ${diffMin % 60 ? (diffMin % 60) + 'm' : ''}`.trim()
  const days = Math.floor(diffMin / 1440)
  return `in ${days}d`
}

// ─── Task mutations (children emit these up) ──────────────────────────────────
const onUpdateTask = (updated: TimetableTask) => {
  const idx = tasks.value.findIndex(t => t.id === updated.id)
  if (idx !== -1) tasks.value[idx] = updated
}

const onDeleteTask = (id: string) => {
  tasks.value = tasks.value.filter(t => t.id !== id)
}

// ─── Add task dialog ──────────────────────────────────────────────────────────
const addTarget = ref<{ day: number; slot: number } | null>(null)
const newTitle  = ref('')
const newColor  = ref(COLORS[0]!)

const onAddTask = (day: number, slot: number) => {
  addTarget.value = { day, slot }
  newTitle.value  = ''
  newColor.value  = COLORS[_uid % COLORS.length] ?? COLORS[0]!
}

const confirmAdd = () => {
  if (!addTarget.value || !newTitle.value.trim()) { addTarget.value = null; return }
  const startSlot = addTarget.value.slot
  tasks.value.push({
    id: uid(), title: newTitle.value.trim(), color: newColor.value,
    day: addTarget.value.day,
    startSlot, span: slotsPerHour.value,
    startMin: slotToMin(startSlot), spanMin: gran.value,
  })
  addTarget.value = null
}

// ─── Layout ───────────────────────────────────────────────────────────────────
type Layout = 'vertical' | 'horizontal'
const layout = ref<Layout>('vertical')

// Shared props passed to both child components
const gridProps = computed(() => ({
  tasks:        visibleTasks.value,
  days:         DAYS,
  slots:        slots.value,
  gran:         gran.value,
  slotsPerHour: slotsPerHour.value,
  totalSlots:   totalSlots.value,
  slotPx:       slotPx.value,
  viewStart:    viewStart.value,
}))

// Add-dialog label helper
const slotToTime = (slot: number) => {
  const totalMin = viewStart.value * 60 + slot * gran.value
  const h  = Math.floor(totalMin / 60) % 24
  const mm = totalMin % 60
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}
</script>

<template>
  <div class="tt-root">
    <!-- ── Toolbar ── -->
    <div class="tt-toolbar">
      <!-- Layout toggle -->
      <v-btn-toggle
        :model-value="layout"
        density="compact"
        variant="outlined"
        rounded="lg"
        mandatory
        @update:model-value="layout = $event as Layout"
      >
        <v-btn value="vertical" size="small" title="Days across top, hours down">
          <v-icon icon="mdi-view-week-outline" size="16" />
          <span class="d-none d-sm-inline ml-1">Vertical</span>
        </v-btn>
        <v-btn value="horizontal" size="small" title="Days down left, hours across">
          <v-icon icon="mdi-view-agenda-outline" size="16" />
          <span class="d-none d-sm-inline ml-1">Horizontal</span>
        </v-btn>
      </v-btn-toggle>

      <v-divider vertical class="mx-1" style="height:24px" />

      <!-- Granularity -->
      <div class="d-flex align-center gap-1">
        <v-icon icon="mdi-clock-outline" size="16" class="text-medium-emphasis" />
        <v-btn-toggle
          :model-value="gran"
          density="compact"
          variant="outlined"
          rounded="lg"
          mandatory
          @update:model-value="gran = $event as TimetableGran"
        >
          <v-btn v-for="opt in GRAN_OPTIONS" :key="opt.value" :value="opt.value" size="small">
            {{ opt.label }}
          </v-btn>
        </v-btn-toggle>
      </div>

      <v-divider vertical class="mx-1" style="height:24px" />

      <!-- Time window -->
      <div class="tt-range-wrap">
        <v-icon icon="mdi-clock-start" size="15" class="text-medium-emphasis" />
        <v-range-slider
          v-model="viewRange"
          :min="0" :max="24" :step="1"
          density="compact"
          color="primary"
          track-color="rgba(var(--v-theme-on-surface),.12)"
          hide-details
          thumb-size="14"
          class="tt-range-slider"
        />
        <v-icon icon="mdi-clock-end" size="15" class="text-medium-emphasis" />
        <span class="tt-range-label">{{ fmtHourLabel(viewStart) }}–{{ fmtHourLabel(viewEnd) }}</span>
      </div>
    </div>

    <!-- ── Now + Upcoming ── -->
    <div class="tt-schedule">
      <!-- Now -->
      <div class="tt-now" :style="currentTask ? { borderLeftColor: currentTask.color } : {}">
        <span class="tt-sched-label">Now</span>
        <template v-if="currentTask">
          <span class="tt-now-dot" :style="{ background: currentTask.color }" />
          <span class="tt-now-name" :style="{ color: currentTask.color }">{{ currentTask.title }}</span>
          <span class="tt-sched-time">
            {{ fmtMin(currentTask.startMin) }}–{{ fmtMin(currentTask.startMin + currentTask.spanMin) }}
          </span>
          <span class="tt-sched-day">{{ DAYS[currentTask.day] }}</span>
        </template>
        <span v-else class="tt-sched-empty">Nothing scheduled right now</span>
      </div>

      <!-- Upcoming -->
      <div v-if="upcomingTasks.length" class="tt-upcoming">
        <div
          v-for="(t, i) in upcomingTasks"
          :key="t.id"
          class="tt-up-row"
          :class="{ 'tt-up-row--next': i === 0 }"
          :style="i === 0 ? { borderLeftColor: t.color } : {}"
        >
          <span class="tt-sched-label">{{ i === 0 ? 'Next' : '' }}</span>
          <span class="tt-up-dot" :style="{ background: t.color }" />
          <span class="tt-up-name">{{ t.title }}</span>
          <span class="tt-sched-time">{{ fmtMin(t.startMin) }}–{{ fmtMin(t.startMin + t.spanMin) }}</span>
          <span class="tt-sched-day">{{ DAYS[t.day] }}</span>
          <span class="tt-up-delta">{{ startsIn(t) }}</span>
        </div>
      </div>
    </div>

    <!-- ── Grid views ── -->
    <CommonTimetableVertical
      v-if="layout === 'vertical'"
      v-bind="gridProps"
      @update:task="onUpdateTask"
      @delete:task="onDeleteTask"
      @add:task="onAddTask"
    />
    <CommonTimetableHorizontal
      v-else
      v-bind="gridProps"
      @update:task="onUpdateTask"
      @delete:task="onDeleteTask"
      @add:task="onAddTask"
    />

    <!-- ── Add task dialog ── -->
    <v-dialog
      :model-value="!!addTarget"
      :max-width="320"
      @update:model-value="v => { if (!v) addTarget = null }"
    >
      <v-card rounded="lg" class="pa-4">
        <p class="text-body-2 font-weight-bold mb-3">
          Add task — {{ addTarget ? DAYS[addTarget.day] : '' }} {{ addTarget ? slotToTime(addTarget.slot) : '' }}
        </p>
        <v-text-field
          v-model="newTitle" label="Task title" variant="outlined" density="compact"
          autofocus class="mb-3"
          @keydown.enter="confirmAdd"
          @keydown.escape="addTarget = null"
        />
        <div class="d-flex align-center gap-3 mb-4">
          <span class="text-body-2 text-medium-emphasis">Colour</span>
          <div class="d-flex gap-2 flex-wrap">
            <div
              v-for="c in COLORS" :key="c"
              class="tt-color-dot"
              :style="{ background: c, outline: newColor === c ? `2px solid ${c}` : 'none', outlineOffset: '2px' }"
              @click="newColor = c"
            />
          </div>
        </div>
        <div class="d-flex gap-2 justify-end">
          <v-btn variant="text" @click="addTarget = null">Cancel</v-btn>
          <v-btn color="primary" variant="tonal" :disabled="!newTitle.trim()" @click="confirmAdd">Add</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- ── Hint ── -->
    <p class="text-caption text-medium-emphasis mt-3">
      <v-icon icon="mdi-drag" size="14" /> Drag to move &nbsp;·&nbsp;
      <v-icon icon="mdi-arrow-expand" size="14" /> Drag edge to resize &nbsp;·&nbsp;
      <v-icon icon="mdi-plus" size="14" /> Double-click cell to add
    </p>
  </div>
</template>

<style scoped>
.tt-root { width: 100%; }

.tt-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

/* ── Schedule strip (Now + Upcoming) ── */
.tt-schedule {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 10px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

/* Shared row base */
.tt-now,
.tt-up-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  border-left: 3px solid rgba(var(--v-theme-on-surface), .1);
  background: rgba(var(--v-theme-on-surface), .03);
  transition: border-color .3s;
  min-height: 36px;
  overflow: hidden;
}
.tt-now {
  background: rgba(var(--v-theme-on-surface), .055);
}
.tt-up-row {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.tt-up-row--next {
  background: rgba(var(--v-theme-on-surface), .04);
}

/* Shared label column — fixed width keeps all rows aligned */
.tt-sched-label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), .38);
  flex-shrink: 0;
  width: 32px;
}

/* Colour dots */
.tt-now-dot,
.tt-up-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Task names */
.tt-now-name {
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}
.tt-up-name {
  font-size: 12px;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), .8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

/* Time range */
.tt-sched-time {
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  color: rgba(var(--v-theme-on-surface), .45);
  white-space: nowrap;
  flex-shrink: 0;
}

/* Day badge */
.tt-sched-day {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .04em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), .35);
  background: rgba(var(--v-theme-on-surface), .07);
  padding: 1px 5px;
  border-radius: 4px;
  flex-shrink: 0;
}

/* "starts in X" delta */
.tt-up-delta {
  font-size: 9px;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), .38);
  white-space: nowrap;
  flex-shrink: 0;
}

.tt-sched-empty {
  font-size: 11px;
  color: rgba(var(--v-theme-on-surface), .35);
  font-style: italic;
}

.tt-range-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 200px;
  max-width: 340px;
}
.tt-range-slider { flex: 1; }
.tt-range-label {
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: rgba(var(--v-theme-on-surface), .6);
  white-space: nowrap;
  min-width: 88px;
}

.tt-color-dot {
  width: 18px; height: 18px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform .1s;
}
.tt-color-dot:hover { transform: scale(1.2); }
</style>
