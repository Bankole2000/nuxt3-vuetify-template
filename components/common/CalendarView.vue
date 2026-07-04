<script setup lang="ts">
// Full calendar component: month / week / day views.
// Pure date math — no external calendar package.
//
// Events span arbitrary date/time ranges. Overlapping events in week/day view
// are laid out side-by-side using a simple column-stacking algorithm.

// ─── Public types ─────────────────────────────────────────────────────────────

export interface CalendarEvent {
  id:        string
  title:     string
  start:     string   // ISO datetime or date string
  end:       string   // ISO datetime or date string
  color?:    string   // hex or Vuetify colour name
  allDay?:   boolean
  data?:     unknown
}

type CalView = 'month' | 'week' | 'day'

// ─── Props / emits ────────────────────────────────────────────────────────────

const props = withDefaults(defineProps<{
  events?:       CalendarEvent[]
  initialView?:  CalView
  initialDate?:  string   // ISO date; defaults to today
  firstDayMon?:  boolean  // week starts Monday
  minHour?:      number   // visible hour range start (0–23)
  maxHour?:      number   // visible hour range end   (1–24)
  hourHeight?:   number   // px per hour in week/day view
  readonly?:     boolean
}>(), {
  events:       () => [],
  initialView:  'month',
  firstDayMon:  true,
  minHour:      7,
  maxHour:      21,
  hourHeight:   56,
  readonly:     false,
})

const emit = defineEmits<{
  'event-click':   [event: CalendarEvent]
  'slot-click':    [date: string, hour?: number]
  'event-create':  [start: string, end: string]
  'event-delete':  [id: string]
}>()

// ─── Refs ─────────────────────────────────────────────────────────────────────

const view        = ref<CalView>(props.initialView)
const cursor      = ref<Date>(props.initialDate ? new Date(props.initialDate) : new Date())
const detailOpen  = ref(false)
const detailEvent = ref<CalendarEvent | null>(null)
const createOpen  = ref(false)
const createSlot  = ref<{ date: string; hour?: number } | null>(null)
const newTitle    = ref('')
const newColor    = ref('#6366f1')

// ─── Date helpers ─────────────────────────────────────────────────────────────

const today = new Date()
today.setHours(0, 0, 0, 0)

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth()    === b.getMonth()    &&
  a.getDate()     === b.getDate()

const startOfDay = (d: Date) => {
  const r = new Date(d); r.setHours(0,0,0,0); return r
}
const endOfDay = (d: Date) => {
  const r = new Date(d); r.setHours(23,59,59,999); return r
}
const addDays = (d: Date, n: number) => {
  const r = new Date(d); r.setDate(r.getDate() + n); return r
}
const addMonths = (d: Date, n: number) => {
  const r = new Date(d)
  r.setMonth(r.getMonth() + n)
  return r
}

const fmtMonth   = (d: Date) => d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
const fmtDate    = (d: Date) => d.toISOString().slice(0, 10)
const fmtDateISO = (d: Date, h = 0, m = 0) => {
  const r = new Date(d)
  r.setHours(h, m, 0, 0)
  return r.toISOString()
}

const parseEvent = (e: CalendarEvent) => ({
  start: new Date(e.start),
  end:   new Date(e.end),
})

// ─── Navigation ───────────────────────────────────────────────────────────────

const navigate = (dir: -1 | 1) => {
  if (view.value === 'month') cursor.value = addMonths(cursor.value, dir)
  else if (view.value === 'week') cursor.value = addDays(cursor.value, 7 * dir)
  else cursor.value = addDays(cursor.value, dir)
}

const goToday = () => { cursor.value = new Date() }

// ─── Month view ───────────────────────────────────────────────────────────────

interface MonthDay { date: Date; inMonth: boolean; isToday: boolean }

const monthGrid = computed((): MonthDay[][] => {
  const year  = cursor.value.getFullYear()
  const month = cursor.value.getMonth()
  const first = new Date(year, month, 1)
  // Offset so week starts Mon (1) or Sun (0)
  let offset = first.getDay()
  if (props.firstDayMon) offset = (offset + 6) % 7
  const days: MonthDay[] = []
  for (let i = -offset; i < 42 - offset; i++) {
    const d = new Date(year, month, 1 + i)
    days.push({ date: d, inMonth: d.getMonth() === month, isToday: isSameDay(d, today) })
  }
  const weeks: MonthDay[][] = []
  for (let w = 0; w < 6; w++) weeks.push(days.slice(w * 7, w * 7 + 7))
  return weeks
})

const dayHeaders = computed(() => {
  const base = props.firstDayMon
    ? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
    : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  return base
})

const eventsOnDay = (date: Date) => {
  const s = startOfDay(date).getTime()
  const e = endOfDay(date).getTime()
  return props.events.filter(ev => {
    const { start, end } = parseEvent(ev)
    return start.getTime() <= e && end.getTime() >= s
  })
}

// ─── Week view ────────────────────────────────────────────────────────────────

const weekDays = computed((): Date[] => {
  const d = new Date(cursor.value)
  let dow = d.getDay()
  if (props.firstDayMon) dow = (dow + 6) % 7
  const mon = addDays(d, -dow)
  return Array.from({ length: 7 }, (_, i) => addDays(mon, i))
})

const hours = computed((): number[] => {
  const out: number[] = []
  for (let h = props.minHour; h <= props.maxHour; h++) out.push(h)
  return out
})

const gridHeight = computed(() =>
  (props.maxHour - props.minHour) * props.hourHeight
)

// Returns events visible on a given day, with their y/height layout
interface WeekBlock {
  event:   CalendarEvent
  top:     number
  height:  number
  left:    string
  width:   string
  col:     number
  cols:    number
}

const weekBlocks = (day: Date): WeekBlock[] => {
  const dayStart = startOfDay(day).getTime()
  const dayEnd   = endOfDay(day).getTime()
  const dayEvents = props.events
    .filter(ev => {
      if (ev.allDay) return false
      const { start, end } = parseEvent(ev)
      return start.getTime() < dayEnd && end.getTime() > dayStart
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

  if (!dayEvents.length) return []

  // Simple column-stacking: group overlapping events
  const cols: CalendarEvent[][] = []
  for (const ev of dayEvents) {
    const { start } = parseEvent(ev)
    let placed = false
    for (const col of cols) {
      const last = col[col.length - 1]!
      if (new Date(last.end).getTime() <= start.getTime()) {
        col.push(ev)
        placed = true
        break
      }
    }
    if (!placed) cols.push([ev])
  }

  const blocks: WeekBlock[] = []
  cols.forEach((col, ci) => {
    col.forEach(ev => {
      const { start, end } = parseEvent(ev)
      const clampStart = Math.max(start.getTime(), dayStart)
      const clampEnd   = Math.min(end.getTime(), dayEnd)
      const startH = (clampStart - dayStart) / 3600000
      const durH   = (clampEnd - clampStart) / 3600000
      const top    = (startH - props.minHour) * props.hourHeight
      const height = Math.max(durH * props.hourHeight, 20)
      blocks.push({
        event:  ev,
        top,
        height,
        col:    ci,
        cols:   cols.length,
        left:   `calc(${(ci / cols.length) * 100}% + 2px)`,
        width:  `calc(${(1 / cols.length) * 100}% - 4px)`,
      })
    })
  })
  return blocks
}

const allDayEventsOnDay = (day: Date) =>
  props.events.filter(ev => {
    if (!ev.allDay) return false
    const { start, end } = parseEvent(ev)
    return start.getTime() <= endOfDay(day).getTime() && end.getTime() >= startOfDay(day).getTime()
  })

// ─── Day view ─────────────────────────────────────────────────────────────────

const dayBlocks = computed(() => weekBlocks(cursor.value))

// Current-time indicator
const nowMinutes = ref(new Date().getHours() * 60 + new Date().getMinutes())
onMounted(() => {
  const tick = setInterval(() => {
    nowMinutes.value = new Date().getHours() * 60 + new Date().getMinutes()
  }, 60000)
  onUnmounted(() => clearInterval(tick))
})
const nowTop = computed(() =>
  ((nowMinutes.value / 60) - props.minHour) * props.hourHeight
)
const showNow = computed(() => {
  const h = nowMinutes.value / 60
  return h >= props.minHour && h <= props.maxHour
})

// ─── Header label ─────────────────────────────────────────────────────────────

const headerLabel = computed(() => {
  if (view.value === 'month') return fmtMonth(cursor.value)
  if (view.value === 'week') {
    const days = weekDays.value
    const first = days[0]!
    const last  = days[6]!
    if (first.getMonth() === last.getMonth())
      return first.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    return `${first.toLocaleDateString(undefined, { month: 'short' })} – ${last.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}`
  }
  return cursor.value.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
})

// ─── Event interaction ────────────────────────────────────────────────────────

const openDetail = (ev: CalendarEvent) => {
  detailEvent.value = ev
  detailOpen.value  = true
  emit('event-click', ev)
}

const openCreate = (date: Date, hour?: number) => {
  if (props.readonly) return
  createSlot.value = { date: fmtDate(date), hour }
  newTitle.value   = ''
  newColor.value   = '#6366f1'
  createOpen.value = true
  emit('slot-click', fmtDate(date), hour)
}

const confirmCreate = () => {
  if (!newTitle.value.trim() || !createSlot.value) return
  const { date, hour } = createSlot.value
  const h     = hour ?? 9
  const start = fmtDateISO(new Date(date), h, 0)
  const end   = fmtDateISO(new Date(date), h + 1, 0)
  emit('event-create', start, end)
  createOpen.value = false
}

const deleteEvent = () => {
  if (!detailEvent.value) return
  emit('event-delete', detailEvent.value.id)
  detailOpen.value = false
}

// ─── Colour helper ────────────────────────────────────────────────────────────

const eventBg = (color?: string) => color ?? '#6366f1'

const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
const fmtFullDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
</script>

<template>
  <div class="cal-root">

    <!-- ── Toolbar ────────────────────────────────────────────────────────── -->
    <div class="cal-toolbar">
      <div class="d-flex align-center gap-2">
        <v-btn icon="mdi-chevron-left"  variant="text" density="compact" @click="navigate(-1)" />
        <v-btn icon="mdi-chevron-right" variant="text" density="compact" @click="navigate(1)" />
        <v-btn size="small" variant="tonal" @click="goToday">Today</v-btn>
        <span class="cal-header-label">{{ headerLabel }}</span>
      </div>
      <v-btn-toggle v-model="view" density="compact" variant="outlined" divided mandatory class="ml-auto">
        <v-btn value="month" size="small">Month</v-btn>
        <v-btn value="week"  size="small">Week</v-btn>
        <v-btn value="day"   size="small">Day</v-btn>
      </v-btn-toggle>
    </div>

    <!-- ════════════════════════════════════════════════════════════════════ -->
    <!-- MONTH VIEW                                                           -->
    <!-- ════════════════════════════════════════════════════════════════════ -->
    <div v-if="view === 'month'" class="cal-month">
      <!-- Day-of-week headers -->
      <div class="cal-month-head">
        <div v-for="h in dayHeaders" :key="h" class="cal-month-head-cell">{{ h }}</div>
      </div>
      <!-- Weeks -->
      <div class="cal-month-body">
        <div v-for="(week, wi) in monthGrid" :key="wi" class="cal-month-week">
          <div
            v-for="day in week"
            :key="day.date.toISOString()"
            class="cal-month-day"
            :class="{
              'cal-month-day--out':   !day.inMonth,
              'cal-month-day--today': day.isToday,
            }"
            @click="openCreate(day.date)"
          >
            <span class="cal-month-day-num">{{ day.date.getDate() }}</span>
            <div class="cal-month-events">
              <div
                v-for="ev in eventsOnDay(day.date).slice(0, 3)"
                :key="ev.id"
                class="cal-month-event"
                :style="{ background: eventBg(ev.color) }"
                @click.stop="openDetail(ev)"
              >
                <span class="cal-month-event-dot" />
                {{ ev.title }}
              </div>
              <div
                v-if="eventsOnDay(day.date).length > 3"
                class="cal-month-more"
              >+{{ eventsOnDay(day.date).length - 3 }} more</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════════════════════════════════════════════ -->
    <!-- WEEK VIEW                                                            -->
    <!-- ════════════════════════════════════════════════════════════════════ -->
    <div v-else-if="view === 'week'" class="cal-week-root">
      <!-- Column headers -->
      <div class="cal-week-head">
        <div class="cal-time-gutter" />
        <div
          v-for="day in weekDays"
          :key="day.toISOString()"
          class="cal-week-head-col"
          :class="{ 'cal-week-head-col--today': isSameDay(day, today) }"
        >
          <span class="cal-week-dow">{{ day.toLocaleDateString(undefined, { weekday: 'short' }) }}</span>
          <span class="cal-week-date" :class="{ 'cal-week-date--today': isSameDay(day, today) }">
            {{ day.getDate() }}
          </span>
        </div>
      </div>
      <!-- All-day strip -->
      <div class="cal-allday-row">
        <div class="cal-time-gutter cal-allday-label">All day</div>
        <div
          v-for="day in weekDays"
          :key="`ad-${day.toISOString()}`"
          class="cal-allday-col"
        >
          <div
            v-for="ev in allDayEventsOnDay(day)"
            :key="ev.id"
            class="cal-allday-event"
            :style="{ background: eventBg(ev.color) }"
            @click.stop="openDetail(ev)"
          >{{ ev.title }}</div>
        </div>
      </div>
      <!-- Time grid -->
      <div class="cal-week-grid-wrap">
        <div class="cal-week-grid" :style="{ height: `${gridHeight}px` }">
          <!-- Hour gutters -->
          <div class="cal-time-gutter-col">
            <div
              v-for="h in hours"
              :key="h"
              class="cal-hour-label"
              :style="{ height: `${hourHeight}px` }"
            >
              {{ h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM` }}
            </div>
          </div>
          <!-- Day columns -->
          <div
            v-for="day in weekDays"
            :key="`col-${day.toISOString()}`"
            class="cal-week-col"
            :class="{ 'cal-week-col--today': isSameDay(day, today) }"
            @click="openCreate(day)"
          >
            <!-- Hour dividers -->
            <div
              v-for="h in hours"
              :key="h"
              class="cal-hour-cell"
              :style="{ height: `${hourHeight}px` }"
              @click.stop="openCreate(day, h)"
            />
            <!-- Event blocks -->
            <div
              v-for="block in weekBlocks(day)"
              :key="block.event.id"
              class="cal-event-block"
              :style="{
                top:    `${block.top}px`,
                height: `${block.height}px`,
                left:   block.left,
                width:  block.width,
                background: eventBg(block.event.color),
              }"
              @click.stop="openDetail(block.event)"
            >
              <span class="cal-event-block-title">{{ block.event.title }}</span>
              <span class="cal-event-block-time">{{ fmtTime(block.event.start) }}</span>
            </div>
            <!-- Now indicator -->
            <div
              v-if="isSameDay(day, today) && showNow"
              class="cal-now-line"
              :style="{ top: `${nowTop}px` }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════════════════════════════════════════════ -->
    <!-- DAY VIEW                                                             -->
    <!-- ════════════════════════════════════════════════════════════════════ -->
    <div v-else class="cal-week-root">
      <!-- Header -->
      <div class="cal-week-head">
        <div class="cal-time-gutter" />
        <div
          class="cal-week-head-col cal-week-head-col--single"
          :class="{ 'cal-week-head-col--today': isSameDay(cursor, today) }"
        >
          <span class="cal-week-dow">{{ cursor.toLocaleDateString(undefined, { weekday: 'long' }) }}</span>
          <span class="cal-week-date" :class="{ 'cal-week-date--today': isSameDay(cursor, today) }">
            {{ cursor.getDate() }}
          </span>
        </div>
      </div>
      <!-- All-day strip -->
      <div class="cal-allday-row">
        <div class="cal-time-gutter cal-allday-label">All day</div>
        <div class="cal-allday-col cal-allday-col--single">
          <div
            v-for="ev in allDayEventsOnDay(cursor)"
            :key="ev.id"
            class="cal-allday-event"
            :style="{ background: eventBg(ev.color) }"
            @click.stop="openDetail(ev)"
          >{{ ev.title }}</div>
        </div>
      </div>
      <!-- Time grid -->
      <div class="cal-week-grid-wrap">
        <div class="cal-week-grid" :style="{ height: `${gridHeight}px` }">
          <div class="cal-time-gutter-col">
            <div
              v-for="h in hours"
              :key="h"
              class="cal-hour-label"
              :style="{ height: `${hourHeight}px` }"
            >
              {{ h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM` }}
            </div>
          </div>
          <div
            class="cal-week-col cal-week-col--single"
            :class="{ 'cal-week-col--today': isSameDay(cursor, today) }"
          >
            <div
              v-for="h in hours"
              :key="h"
              class="cal-hour-cell"
              :style="{ height: `${hourHeight}px` }"
              @click.stop="openCreate(cursor, h)"
            />
            <div
              v-for="block in dayBlocks"
              :key="block.event.id"
              class="cal-event-block"
              :style="{
                top:    `${block.top}px`,
                height: `${block.height}px`,
                left:   block.left,
                width:  block.width,
                background: eventBg(block.event.color),
              }"
              @click.stop="openDetail(block.event)"
            >
              <span class="cal-event-block-title">{{ block.event.title }}</span>
              <span class="cal-event-block-time">{{ fmtTime(block.event.start) }}</span>
            </div>
            <div v-if="isSameDay(cursor, today) && showNow" class="cal-now-line" :style="{ top: `${nowTop}px` }" />
          </div>
        </div>
      </div>
    </div>

    <!-- ── Event detail dialog ──────────────────────────────────────────── -->
    <v-dialog v-model="detailOpen" max-width="380">
      <v-card v-if="detailEvent" rounded="xl">
        <div class="cal-detail-header" :style="{ background: eventBg(detailEvent.color) }">
          <span class="cal-detail-title">{{ detailEvent.title }}</span>
          <v-btn icon="mdi-close" variant="text" size="small" color="white" @click="detailOpen = false" />
        </div>
        <v-card-text class="pt-4">
          <div class="d-flex align-center gap-2 mb-1">
            <v-icon icon="mdi-calendar-outline" size="16" class="text-medium-emphasis" />
            <span class="text-body-2">{{ fmtFullDate(detailEvent.start) }}</span>
          </div>
          <div v-if="!detailEvent.allDay" class="d-flex align-center gap-2">
            <v-icon icon="mdi-clock-outline" size="16" class="text-medium-emphasis" />
            <span class="text-body-2">{{ fmtTime(detailEvent.start) }} – {{ fmtTime(detailEvent.end) }}</span>
          </div>
          <v-chip v-if="detailEvent.allDay" size="small" variant="tonal" color="primary" class="mt-2">All day</v-chip>
        </v-card-text>
        <v-card-actions v-if="!readonly" class="px-4 pb-4 pt-0">
          <v-spacer />
          <v-btn color="error" variant="tonal" size="small" prepend-icon="mdi-delete-outline" @click="deleteEvent">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── Create event dialog ──────────────────────────────────────────── -->
    <v-dialog v-model="createOpen" max-width="340">
      <v-card rounded="xl">
        <v-card-title class="pt-5 px-5 pb-2 text-body-1 font-weight-bold">New event</v-card-title>
        <v-card-text class="px-5 pb-2">
          <p v-if="createSlot" class="text-caption text-medium-emphasis mb-3">
            {{ createSlot.date }}{{ createSlot.hour !== undefined ? ` · ${createSlot.hour}:00` : '' }}
          </p>
          <v-text-field
            v-model="newTitle"
            label="Event title"
            variant="outlined"
            density="compact"
            autofocus
            hide-details
            class="mb-3"
            @keydown.enter="confirmCreate"
          />
          <div class="d-flex align-center gap-2">
            <span class="text-caption text-medium-emphasis">Color</span>
            <div
              v-for="c in ['#6366f1','#3b82f6','#10b981','#f59e0b','#ef4444','#ec4899','#8b5cf6']"
              :key="c"
              class="cal-color-swatch"
              :class="{ 'cal-color-swatch--active': newColor === c }"
              :style="{ background: c }"
              @click="newColor = c"
            />
          </div>
        </v-card-text>
        <v-card-actions class="px-5 pb-5 pt-2">
          <v-btn variant="text" size="small" @click="createOpen = false">Cancel</v-btn>
          <v-spacer />
          <v-btn
            variant="flat"
            size="small"
            :color="newColor"
            :disabled="!newTitle.trim()"
            @click="confirmCreate"
          >
            Add event
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<style scoped>
/* Root */
.cal-root {
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 12px;
  overflow: hidden;
  background: rgb(var(--v-theme-surface));
}

/* Toolbar */
.cal-toolbar {
  display: flex;
  align-items: center;
  padding: 8px 14px;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  flex-shrink: 0;
  gap: 8px;
  flex-wrap: wrap;
}
.cal-header-label {
  font-size: 14px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  white-space: nowrap;
}

/* ── Month view ── */
.cal-month { display: flex; flex-direction: column; }
.cal-month-head {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.cal-month-head-cell {
  padding: 8px 0;
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), .5);
}
.cal-month-body { display: flex; flex-direction: column; }
.cal-month-week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.cal-month-week:last-child { border-bottom: none; }
.cal-month-day {
  min-height: 96px;
  padding: 6px 6px 4px;
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  cursor: pointer;
  transition: background .1s;
  overflow: hidden;
}
.cal-month-day:last-child { border-right: none; }
.cal-month-day:hover { background: rgba(var(--v-theme-on-surface), .03); }
.cal-month-day--out .cal-month-day-num { color: rgba(var(--v-theme-on-surface), .25); }
.cal-month-day--today .cal-month-day-num {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  border-radius: 50%;
  width: 24px; height: 24px;
  display: flex; align-items: center; justify-content: center;
}
.cal-month-day-num {
  font-size: 12px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin-bottom: 3px;
  line-height: 1;
  width: 24px; height: 24px;
  display: flex; align-items: center; justify-content: center;
}
.cal-month-events { display: flex; flex-direction: column; gap: 2px; }
.cal-month-event {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 600;
  color: #fff;
  padding: 2px 5px;
  border-radius: 3px;
  cursor: pointer;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  line-height: 1.4;
}
.cal-month-event-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: rgba(255,255,255,.6);
  flex-shrink: 0;
}
.cal-month-more {
  font-size: 10px;
  color: rgba(var(--v-theme-on-surface), .5);
  padding: 1px 5px;
}

/* ── Week / Day shared ── */
.cal-week-root { display: flex; flex-direction: column; overflow: hidden; }

.cal-week-head {
  display: flex;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgba(var(--v-theme-on-surface), .02);
  flex-shrink: 0;
}
.cal-time-gutter {
  width: 56px;
  flex-shrink: 0;
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.cal-week-head-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 4px;
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  gap: 4px;
  cursor: pointer;
}
.cal-week-head-col:last-child { border-right: none; }
.cal-week-head-col--single { flex: 1; }
.cal-week-head-col--today { background: rgba(var(--v-theme-primary), .05); }
.cal-week-dow { font-size: 11px; font-weight: 600; color: rgba(var(--v-theme-on-surface), .5); letter-spacing: .04em; text-transform: uppercase; }
.cal-week-date {
  font-size: 20px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  line-height: 1;
  width: 34px; height: 34px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
}
.cal-week-date--today {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}

/* All-day strip */
.cal-allday-row {
  display: flex;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  min-height: 28px;
  flex-shrink: 0;
}
.cal-allday-label {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8px;
  font-size: 10px;
  color: rgba(var(--v-theme-on-surface), .4);
}
.cal-allday-col {
  flex: 1;
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  padding: 2px 3px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.cal-allday-col:last-child { border-right: none; }
.cal-allday-col--single { flex: 1; }
.cal-allday-event {
  font-size: 10px;
  font-weight: 600;
  color: #fff;
  padding: 1px 5px;
  border-radius: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

/* Time grid */
.cal-week-grid-wrap {
  overflow-y: auto;
  flex: 1;
}
.cal-week-grid {
  display: flex;
  position: relative;
}
.cal-time-gutter-col {
  width: 56px;
  flex-shrink: 0;
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  position: sticky;
  left: 0;
  z-index: 2;
  background: rgb(var(--v-theme-surface));
}
.cal-hour-label {
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 0 8px;
  padding-top: 2px;
  font-size: 10px;
  color: rgba(var(--v-theme-on-surface), .4);
  box-sizing: border-box;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.cal-week-col {
  flex: 1;
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  position: relative;
}
.cal-week-col:last-child { border-right: none; }
.cal-week-col--single { flex: 1; }
.cal-week-col--today { background: rgba(var(--v-theme-primary), .025); }
.cal-hour-cell {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  box-sizing: border-box;
  cursor: pointer;
  transition: background .1s;
}
.cal-hour-cell:hover { background: rgba(var(--v-theme-primary), .04); }

/* Event blocks (week/day) */
.cal-event-block {
  position: absolute;
  border-radius: 5px;
  padding: 3px 6px;
  overflow: hidden;
  cursor: pointer;
  transition: opacity .1s, filter .1s;
  display: flex;
  flex-direction: column;
  gap: 1px;
  box-shadow: 0 1px 3px rgba(0,0,0,.15);
  z-index: 1;
}
.cal-event-block:hover { filter: brightness(1.1); }
.cal-event-block-title {
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  line-height: 1.3;
}
.cal-event-block-time {
  font-size: 10px;
  color: rgba(255,255,255,.8);
  line-height: 1.2;
}

/* Now line */
.cal-now-line {
  position: absolute;
  left: 0; right: 0;
  height: 2px;
  background: #ef4444;
  z-index: 2;
  pointer-events: none;
}
.cal-now-line::before {
  content: '';
  position: absolute;
  left: -4px;
  top: -4px;
  width: 10px; height: 10px;
  border-radius: 50%;
  background: #ef4444;
}

/* Event detail dialog */
.cal-detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-radius: 12px 12px 0 0;
}
.cal-detail-title {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Color swatches */
.cal-color-swatch {
  width: 20px; height: 20px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform .1s, box-shadow .1s;
}
.cal-color-swatch:hover { transform: scale(1.15); }
.cal-color-swatch--active { box-shadow: 0 0 0 2px rgb(var(--v-theme-surface)), 0 0 0 4px currentColor; }
</style>
