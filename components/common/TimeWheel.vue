<script setup lang="ts">
interface TimeBlock {
  id: string
  label: string
  color: string
  startMin: number  // within the ring's 12-hour window: 0–720
  endMin: number
}

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#f97316', '#8b5cf6', '#14b8a6']

const SIZE   = 300
const CX     = SIZE / 2
const CY     = SIZE / 2
// PM ring (outer)
const PM_OUT = SIZE / 2 - 6
const PM_IN  = PM_OUT - 38
// AM ring (inner)
const AM_OUT = PM_IN - 6
const AM_IN  = AM_OUT - 38
// Clock face
const CLOCK  = AM_IN - 6

// ─── Clock ────────────────────────────────────────────────────────────────────
const now = ref(new Date())
let timer: ReturnType<typeof setInterval>
onMounted(() => { timer = setInterval(() => { now.value = new Date() }, 1000) })
onUnmounted(() => clearInterval(timer))

const sec = computed(() => now.value.getSeconds())
const min = computed(() => now.value.getMinutes())
const hr  = computed(() => now.value.getHours() % 12)

const mDeg = computed(() => (min.value + sec.value / 60) * 6)
const hDeg = computed(() => (hr.value + min.value / 60) * 30)
const sDeg = computed(() => sec.value * 6)

const handEnd = (deg: number, len: number) => {
  const rad = (deg - 90) * Math.PI / 180
  return { x: CX + Math.cos(rad) * len, y: CY + Math.sin(rad) * len }
}
const hHand = computed(() => handEnd(hDeg.value, CLOCK * 0.52))
const mHand = computed(() => handEnd(mDeg.value, CLOCK * 0.72))
const sHand = computed(() => handEnd(sDeg.value, CLOCK * 0.82))
const sTail = computed(() => handEnd(sDeg.value + 180, CLOCK * 0.20))

const ticks = Array.from({ length: 12 }, (_, i) => {
  const angle = (i * 30 - 90) * Math.PI / 180
  const o = CLOCK - 3
  return { x1: CX + Math.cos(angle) * o, y1: CY + Math.sin(angle) * o, x2: CX + Math.cos(angle) * (o - 9), y2: CY + Math.sin(angle) * (o - 9) }
})

// ─── Blocks (separate AM / PM) ────────────────────────────────────────────────
// startMin / endMin are 0–720 relative to each ring's 12-hr window
const amBlocks = ref<TimeBlock[]>([
  { id: 'am1', label: 'Sleep',   color: COLORS[4]!, startMin: 0,   endMin: 360 },
  { id: 'am2', label: 'Morning', color: COLORS[2]!, startMin: 360, endMin: 480 },
  { id: 'am3', label: 'Work AM', color: COLORS[0]!, startMin: 480, endMin: 720 },
])

const pmBlocks = ref<TimeBlock[]>([
  { id: 'pm1', label: 'Work PM',   color: COLORS[0]!, startMin: 0,   endMin: 300 },
  { id: 'pm2', label: 'Evening',   color: COLORS[3]!, startMin: 300, endMin: 540 },
  { id: 'pm3', label: 'Wind down', color: COLORS[6]!, startMin: 540, endMin: 720 },
])

// ─── SVG arc helpers (12-hr window: 0–720 min maps to full 360°) ─────────────
const minToDeg12 = (m: number) => (m / 720) * 360 - 90

const arcPath = (startMin: number, endMin: number, outerR: number, innerR: number) => {
  const s = minToDeg12(startMin)
  const e = minToDeg12(endMin)
  const large = (endMin - startMin) > 360 ? 1 : 0
  const pt = (deg: number, r: number) => ({
    x: CX + Math.cos(deg * Math.PI / 180) * r,
    y: CY + Math.sin(deg * Math.PI / 180) * r,
  })
  const o1 = pt(s, outerR); const o2 = pt(e, outerR)
  const i1 = pt(e, innerR); const i2 = pt(s, innerR)
  return `M${o1.x},${o1.y} A${outerR},${outerR} 0 ${large},1 ${o2.x},${o2.y} L${i1.x},${i1.y} A${innerR},${innerR} 0 ${large},0 ${i2.x},${i2.y} Z`
}

const labelPos = (b: TimeBlock, outerR: number, innerR: number) => {
  const mid = minToDeg12((b.startMin + b.endMin) / 2)
  const r = (outerR + innerR) / 2
  return { x: CX + Math.cos(mid * Math.PI / 180) * r, y: CY + Math.sin(mid * Math.PI / 180) * r }
}

// ─── Drag resize ──────────────────────────────────────────────────────────────
const svgRef = ref<SVGSVGElement>()
type Ring = 'am' | 'pm'
type DragTarget = { ring: Ring; blockId: string; handle: 'start' | 'end' } | null
let drag: DragTarget = null

const svgPoint = (e: MouseEvent) => {
  const rect = svgRef.value!.getBoundingClientRect()
  return { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

// Convert canvas XY → minutes within a 12-hr window (0–720), snapped to quantization grid
const xyToMin12 = (x: number, y: number) => {
  const dx = x - CX; const dy = y - CY
  let deg = Math.atan2(dy, dx) * 180 / Math.PI + 90
  if (deg < 0) deg += 360
  const raw = (deg / 360) * 720
  return Math.round(raw / snap.value) * snap.value
}

const onHandleDown = (e: MouseEvent, ring: Ring, blockId: string, handle: 'start' | 'end') => {
  e.stopPropagation()
  drag = { ring, blockId, handle }
}

const onSvgMove = (e: MouseEvent) => {
  if (!drag) return
  const { x, y } = svgPoint(e)
  const min12 = xyToMin12(x, y)
  const list  = drag.ring === 'am' ? amBlocks : pmBlocks
  const idx   = list.value.findIndex(b => b.id === drag!.blockId)
  if (idx === -1) return
  const b    = list.value[idx]!
  const prev = list.value[idx - 1]
  const next = list.value[idx + 1]

  if (drag.handle === 'start') {
    const floor = prev ? prev.endMin : 0
    b.startMin = Math.max(floor, Math.min(b.endMin - snap.value, min12))
  } else {
    const ceil = next ? next.startMin : 720
    b.endMin = Math.min(ceil, Math.max(b.startMin + snap.value, min12))
  }
}

const onSvgUp = () => { drag = null }

// Handle dot — placed just outside the ring's outer edge
const handlePos = (b: TimeBlock, handle: 'start' | 'end', outerR: number) => {
  const deg = minToDeg12(handle === 'start' ? b.startMin : b.endMin)
  const r = outerR + 7
  return { x: CX + Math.cos(deg * Math.PI / 180) * r, y: CY + Math.sin(deg * Math.PI / 180) * r }
}

// ─── Current / next / upcoming ────────────────────────────────────────────────
const nowMin = computed(() => now.value.getHours() * 60 + now.value.getMinutes())
const currentRing = computed(() => nowMin.value < 720 ? 'am' : 'pm')

// AM ring covers 00:00–11:59 (nowMin 0–719), PM ring covers 12:00–23:59 (nowMin 720–1439)
const currentTask = computed(() =>
  allBlocksAbs.value.find(b => nowMin.value >= b.absStart && nowMin.value < b.absEnd) ?? null,
)

// Build a flat chronological list of all blocks with their absolute start minute
// AM blocks: absStart = startMin (0–720 maps to 0–719 real minutes)
// PM blocks: absStart = startMin + 720
const allBlocksAbs = computed(() => [
  ...amBlocks.value.map(b => ({ ...b, absStart: b.startMin,       absEnd: b.endMin,       ring: 'am' as const })),
  ...pmBlocks.value.map(b => ({ ...b, absStart: b.startMin + 720, absEnd: b.endMin + 720, ring: 'pm' as const })),
].sort((a, b) => a.absStart - b.absStart))

const upcomingBlocks = computed(() =>
  allBlocksAbs.value.filter(b => b.absStart > nowMin.value).slice(0, 4),
)

const fmtAbsMin = (min: number) => {
  const h = Math.floor(min / 60) % 24
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

const startsIn = (absStart: number) => {
  const diff = absStart - nowMin.value
  if (diff < 60)   return `in ${diff}m`
  const h = Math.floor(diff / 60)
  const m = diff % 60
  return m ? `in ${h}h ${m}m` : `in ${h}h`
}

// ─── Snap / quantization ─────────────────────────────────────────────────────
const SNAP_OPTIONS = [5, 10, 15, 20, 30, 60]
const snap = ref(5)

// ─── Panel: tabs ─────────────────────────────────────────────────────────────
const activeTab = ref<Ring>('am')

// ─── Block editing ────────────────────────────────────────────────────────────
const editing = ref<string | null>(null)
const editLabel = ref('')
const startEdit = (b: TimeBlock) => { editing.value = b.id; editLabel.value = b.label }
const commitEdit = (ring: Ring) => {
  const list = ring === 'am' ? amBlocks : pmBlocks
  const b = list.value.find(b => b.id === editing.value)
  if (b && editLabel.value.trim()) b.label = editLabel.value.trim()
  editing.value = null
}

const newLabel = ref('')
const newColor = ref(COLORS[1]!)

const addBlock = (ring: Ring) => {
  const list = ring === 'am' ? amBlocks : pmBlocks
  const used = list.value.reduce((a, b) => a + (b.endMin - b.startMin), 0)
  if (used >= 720) return
  const start = list.value[list.value.length - 1]?.endMin ?? 0
  const end = Math.min(720, start + 60)
  list.value.push({ id: `${ring}${Date.now()}`, label: newLabel.value || 'Block', color: newColor.value, startMin: start, endMin: end })
  newLabel.value = ''
}

const removeBlock = (ring: Ring, id: string) => {
  if (ring === 'am') amBlocks.value = amBlocks.value.filter(b => b.id !== id)
  else               pmBlocks.value = pmBlocks.value.filter(b => b.id !== id)
}

// ─── Format time label (relative to ring start) ───────────────────────────────
const fmtRingTime = (min12: number, ring: Ring) => {
  const absMin = ring === 'am' ? min12 : min12 + 720
  const h = Math.floor(absMin / 60) % 24
  const mm = absMin % 60
  const ampm = h >= 12 ? 'pm' : 'am'
  return `${h % 12 || 12}:${String(mm).padStart(2, '0')}${ampm}`
}

const arcSpan = (b: TimeBlock) => b.endMin - b.startMin
</script>

<template>
  <div class="tw-root">
    <!-- SVG -->
    <div class="tw-svg-wrap">
      <svg
        ref="svgRef"
        :width="SIZE"
        :height="SIZE"
        :viewBox="`0 0 ${SIZE} ${SIZE}`"
        style="overflow:visible; user-select:none"
        @mousemove="onSvgMove"
        @mouseup="onSvgUp"
        @mouseleave="onSvgUp"
      >
        <!-- PM track (outer) -->
        <circle :cx="CX" :cy="CY" :r="(PM_OUT + PM_IN) / 2" fill="none" :stroke-width="PM_OUT - PM_IN" stroke="rgba(var(--v-theme-on-surface), .05)" />
        <!-- AM track (inner) -->
        <circle :cx="CX" :cy="CY" :r="(AM_OUT + AM_IN) / 2" fill="none" :stroke-width="AM_OUT - AM_IN" stroke="rgba(var(--v-theme-on-surface), .05)" />

        <!-- PM ring label markers (12, 3, 6, 9 o'clock positions) -->
        <text v-for="(lbl, i) in ['12', '3', '6', '9']" :key="`pm-m${i}`"
          :x="CX + Math.cos((i * 90 - 90) * Math.PI / 180) * (PM_OUT + 14)"
          :y="CY + Math.sin((i * 90 - 90) * Math.PI / 180) * (PM_OUT + 14)"
          text-anchor="middle" dominant-baseline="central"
          font-size="7" font-weight="700" class="tw-ring-lbl"
        >{{ lbl === '12' ? 'PM' : lbl === '6' ? 'MN' : lbl }}</text>

        <!-- AM ring label markers -->
        <text v-for="(lbl, i) in ['12', '3', '6', '9']" :key="`am-m${i}`"
          :x="CX + Math.cos((i * 90 - 90) * Math.PI / 180) * (AM_IN - 10)"
          :y="CY + Math.sin((i * 90 - 90) * Math.PI / 180) * (AM_IN - 10)"
          text-anchor="middle" dominant-baseline="central"
          font-size="6" font-weight="700" class="tw-ring-lbl tw-ring-lbl--inner"
        >{{ lbl === '12' ? 'AM' : lbl === '6' ? '6p' : lbl }}</text>

        <!-- PM blocks -->
        <path
          v-for="b in pmBlocks"
          :key="b.id"
          :d="arcPath(b.startMin, b.endMin, PM_OUT, PM_IN)"
          :fill="b.color"
          fill-opacity=".85"
          :class="{ 'tw-arc--active': activeTab === 'pm' }"
          style="cursor:pointer"
          @click="activeTab = 'pm'"
        />

        <!-- PM block labels -->
        <text
          v-for="b in pmBlocks"
          :key="`lbl-pm-${b.id}`"
          :x="labelPos(b, PM_OUT, PM_IN).x"
          :y="labelPos(b, PM_OUT, PM_IN).y"
          text-anchor="middle"
          dominant-baseline="central"
          :font-size="arcSpan(b) > 60 ? 7.5 : 0"
          fill="white"
          font-weight="700"
          style="pointer-events:none"
        >{{ b.label }}</text>

        <!-- PM drag handles -->
        <g v-for="b in pmBlocks" :key="`ph-${b.id}`">
          <circle
            :cx="handlePos(b, 'start', PM_OUT).x" :cy="handlePos(b, 'start', PM_OUT).y"
            r="5.5" :fill="b.color" stroke="white" stroke-width="1.5" style="cursor:ew-resize"
            @mousedown="onHandleDown($event, 'pm', b.id, 'start')"
          />
          <circle
            :cx="handlePos(b, 'end', PM_OUT).x" :cy="handlePos(b, 'end', PM_OUT).y"
            r="5.5" :fill="b.color" stroke="white" stroke-width="1.5" style="cursor:ew-resize"
            @mousedown="onHandleDown($event, 'pm', b.id, 'end')"
          />
        </g>

        <!-- AM blocks -->
        <path
          v-for="b in amBlocks"
          :key="b.id"
          :d="arcPath(b.startMin, b.endMin, AM_OUT, AM_IN)"
          :fill="b.color"
          fill-opacity=".85"
          :class="{ 'tw-arc--active': activeTab === 'am' }"
          style="cursor:pointer"
          @click="activeTab = 'am'"
        />

        <!-- AM block labels -->
        <text
          v-for="b in amBlocks"
          :key="`lbl-am-${b.id}`"
          :x="labelPos(b, AM_OUT, AM_IN).x"
          :y="labelPos(b, AM_OUT, AM_IN).y"
          text-anchor="middle"
          dominant-baseline="central"
          :font-size="arcSpan(b) > 60 ? 7 : 0"
          fill="white"
          font-weight="700"
          style="pointer-events:none"
        >{{ b.label }}</text>

        <!-- AM drag handles -->
        <g v-for="b in amBlocks" :key="`ah-${b.id}`">
          <circle
            :cx="handlePos(b, 'start', AM_OUT).x" :cy="handlePos(b, 'start', AM_OUT).y"
            r="5" :fill="b.color" stroke="white" stroke-width="1.5" style="cursor:ew-resize"
            @mousedown="onHandleDown($event, 'am', b.id, 'start')"
          />
          <circle
            :cx="handlePos(b, 'end', AM_OUT).x" :cy="handlePos(b, 'end', AM_OUT).y"
            r="5" :fill="b.color" stroke="white" stroke-width="1.5" style="cursor:ew-resize"
            @mousedown="onHandleDown($event, 'am', b.id, 'end')"
          />
        </g>

        <!-- Clock face -->
        <circle :cx="CX" :cy="CY" :r="CLOCK" class="tw-face" />

        <!-- Clock ticks -->
        <line
          v-for="(t, i) in ticks" :key="`ck${i}`"
          :x1="t.x1" :y1="t.y1" :x2="t.x2" :y2="t.y2"
          stroke-width="1.5" class="tw-tick"
        />

        <!-- Hands -->
        <line :x1="CX" :y1="CY" :x2="hHand.x" :y2="hHand.y" stroke-linecap="round" stroke-width="3.5" class="tw-hand" />
        <line :x1="CX" :y1="CY" :x2="mHand.x" :y2="mHand.y" stroke-linecap="round" stroke-width="2.5" class="tw-hand" />
        <line :x1="sTail.x" :y1="sTail.y" :x2="sHand.x" :y2="sHand.y" stroke-linecap="round" stroke-width="1.5" class="tw-second" />
        <circle :cx="CX" :cy="CY" r="3" class="tw-second" />
        <circle :cx="CX" :cy="CY" r="1.5" class="tw-face" />

        <!-- Ring badges -->
        <text :x="CX" :y="CY - CLOCK + 22" text-anchor="middle" font-size="8" font-weight="800" class="tw-ring-lbl">AM</text>
      </svg>
    </div>

    <!-- Panel -->
    <div class="tw-panel">
      <!-- Schedule strip -->
      <div class="tw-schedule">
        <!-- Now -->
        <div class="tw-sched-row tw-sched-row--now" :style="currentTask ? { borderLeftColor: currentTask.color } : {}">
          <span class="tw-sched-label">Now</span>
          <template v-if="currentTask">
            <span class="tw-sched-dot" :style="{ background: currentTask.color }" />
            <span class="tw-sched-name" :style="{ color: currentTask.color }">{{ currentTask.label }}</span>
            <span class="tw-sched-time">{{ fmtAbsMin(currentTask.absStart) }}–{{ fmtAbsMin(currentTask.absEnd) }}</span>
            <span class="tw-sched-ring">{{ currentRing.toUpperCase() }}</span>
          </template>
          <span v-else class="tw-sched-empty">No block at this time</span>
        </div>
        <!-- Upcoming -->
        <div
          v-for="(b, i) in upcomingBlocks"
          :key="b.id"
          class="tw-sched-row"
          :style="i === 0 ? { borderLeftColor: b.color } : {}"
        >
          <span class="tw-sched-label">{{ i === 0 ? 'Next' : '' }}</span>
          <span class="tw-sched-dot" :style="{ background: b.color }" />
          <span class="tw-sched-name">{{ b.label }}</span>
          <span class="tw-sched-time">{{ fmtAbsMin(b.absStart) }}–{{ fmtAbsMin(b.absEnd) }}</span>
          <span class="tw-sched-ring">{{ b.ring.toUpperCase() }}</span>
          <span class="tw-sched-delta">{{ startsIn(b.absStart) }}</span>
        </div>
      </div>

      <!-- Tab switcher -->
      <div class="tw-tabs">
        <button
          class="tw-tab"
          :class="{ 'tw-tab--active': activeTab === 'am' }"
          @click="activeTab = 'am'"
        >
          <span class="tw-tab-dot" style="background:#3b82f6" />
          AM
          <span class="tw-tab-count">{{ amBlocks.length }}</span>
        </button>
        <button
          class="tw-tab"
          :class="{ 'tw-tab--active': activeTab === 'pm' }"
          @click="activeTab = 'pm'"
        >
          <span class="tw-tab-dot" style="background:#f97316" />
          PM
          <span class="tw-tab-count">{{ pmBlocks.length }}</span>
        </button>
      </div>

      <!-- Block list -->
      <div class="tw-list-items">
        <template v-if="activeTab === 'am'">
          <div v-for="b in amBlocks" :key="b.id" class="tw-list-row">
            <div class="tw-swatch" :style="{ background: b.color }" />
            <div class="tw-list-info">
              <div v-if="editing === b.id">
                <input
                  v-model="editLabel" class="tw-input" autofocus
                  @keydown.enter="commitEdit('am')"
                  @keydown.escape="editing = null"
                  @blur="commitEdit('am')"
                />
              </div>
              <p v-else class="text-body-2 font-weight-medium text-truncate" style="cursor:text" @click="startEdit(b)">{{ b.label }}</p>
              <p class="text-caption text-medium-emphasis">{{ fmtRingTime(b.startMin, 'am') }} – {{ fmtRingTime(b.endMin, 'am') }}</p>
            </div>
            <span class="text-caption text-medium-emphasis tw-dur">{{ Math.round((b.endMin - b.startMin) / 60 * 10) / 10 }}h</span>
            <v-btn icon="mdi-close" size="x-small" variant="text" density="compact" @click="removeBlock('am', b.id)" />
          </div>
        </template>
        <template v-else>
          <div v-for="b in pmBlocks" :key="b.id" class="tw-list-row">
            <div class="tw-swatch" :style="{ background: b.color }" />
            <div class="tw-list-info">
              <div v-if="editing === b.id">
                <input
                  v-model="editLabel" class="tw-input" autofocus
                  @keydown.enter="commitEdit('pm')"
                  @keydown.escape="editing = null"
                  @blur="commitEdit('pm')"
                />
              </div>
              <p v-else class="text-body-2 font-weight-medium text-truncate" style="cursor:text" @click="startEdit(b)">{{ b.label }}</p>
              <p class="text-caption text-medium-emphasis">{{ fmtRingTime(b.startMin, 'pm') }} – {{ fmtRingTime(b.endMin, 'pm') }}</p>
            </div>
            <span class="text-caption text-medium-emphasis tw-dur">{{ Math.round((b.endMin - b.startMin) / 60 * 10) / 10 }}h</span>
            <v-btn icon="mdi-close" size="x-small" variant="text" density="compact" @click="removeBlock('pm', b.id)" />
          </div>
        </template>
      </div>

      <v-divider class="my-3" />

      <!-- Add block -->
      <p class="text-caption text-medium-emphasis font-weight-medium mb-2">
        Add to {{ activeTab.toUpperCase() }} ring
      </p>
      <div class="d-flex gap-2 align-center">
        <input v-model="newLabel" class="tw-input flex-1" :placeholder="`${activeTab === 'am' ? 'Morning' : 'Evening'} block`" @keydown.enter="addBlock(activeTab)" />
        <input v-model="newColor" type="color" class="tw-color-pick" />
        <v-btn size="small" variant="tonal" color="primary" icon="mdi-plus" @click="addBlock(activeTab)" />
      </div>

      <v-divider class="my-3" />

      <!-- Snap / quantization -->
      <div class="d-flex align-center gap-2 mb-1">
        <v-icon icon="mdi-magnet-on" size="14" class="text-medium-emphasis" />
        <span class="text-caption font-weight-medium">Snap</span>
        <v-btn-toggle
          v-model="snap"
          density="compact"
          variant="outlined"
          rounded="lg"
          mandatory
          class="ml-auto"
        >
          <v-btn
            v-for="s in SNAP_OPTIONS"
            :key="s"
            :value="s"
            size="x-small"
            style="min-width:34px"
          >{{ s }}m</v-btn>
        </v-btn-toggle>
      </div>

      <p class="text-caption text-medium-emphasis mt-3" style="line-height:1.5">
        <v-icon icon="mdi-gesture-tap" size="12" /> Click a ring to switch tabs<br>
        <v-icon icon="mdi-circle-small" size="12" /> Drag handle dots to resize blocks<br>
        <v-icon icon="mdi-pencil-outline" size="12" /> Click a label to rename
      </p>
    </div>
  </div>
</template>

<style scoped>
.tw-root {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  flex-wrap: wrap;
}
.tw-svg-wrap { flex-shrink: 0; }

.tw-face   { fill: rgb(var(--v-theme-surface)); }
.tw-tick   { stroke: rgba(var(--v-theme-on-surface), .28); }
.tw-hand   { stroke: rgb(var(--v-theme-on-surface)); }
.tw-second { stroke: rgb(var(--v-theme-error)); fill: rgb(var(--v-theme-error)); }
.tw-ring-lbl        { fill: rgba(var(--v-theme-on-surface), .35); font-family: inherit; }
.tw-ring-lbl--inner { fill: rgba(var(--v-theme-on-surface), .28); }

.tw-arc--active { filter: drop-shadow(0 0 3px rgba(0,0,0,.2)); }

/* Panel */
.tw-panel {
  flex: 1;
  min-width: 220px;
  max-width: 300px;
}

/* Schedule strip */
.tw-schedule {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  margin-bottom: 12px;
}
.tw-sched-row {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 8px;
  border-left: 3px solid rgba(var(--v-theme-on-surface), .1);
  background: rgba(var(--v-theme-on-surface), .025);
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  transition: border-color .3s;
  min-height: 32px;
  overflow: hidden;
}
.tw-sched-row:first-child { border-top: none; }
.tw-sched-row--now { background: rgba(var(--v-theme-on-surface), .05); }

.tw-sched-label {
  font-size: 8px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), .38);
  width: 28px;
  flex-shrink: 0;
}
.tw-sched-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.tw-sched-name {
  font-size: 11px;
  font-weight: 700;
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tw-sched-time {
  font-size: 9px;
  font-variant-numeric: tabular-nums;
  color: rgba(var(--v-theme-on-surface), .45);
  white-space: nowrap;
  flex-shrink: 0;
}
.tw-sched-ring {
  font-size: 8px;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), .3);
  background: rgba(var(--v-theme-on-surface), .07);
  padding: 1px 4px;
  border-radius: 3px;
  flex-shrink: 0;
}
.tw-sched-delta {
  font-size: 8px;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), .35);
  white-space: nowrap;
  flex-shrink: 0;
}
.tw-sched-empty {
  font-size: 10px;
  color: rgba(var(--v-theme-on-surface), .35);
  font-style: italic;
}

/* Tabs */
.tw-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
  background: rgba(var(--v-theme-on-surface), .06);
  border-radius: 8px;
  padding: 3px;
}
.tw-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 5px 10px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  background: transparent;
  color: rgba(var(--v-theme-on-surface), .5);
  transition: background .15s, color .15s;
}
.tw-tab--active {
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  box-shadow: 0 1px 4px rgba(0,0,0,.1);
}
.tw-tab-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.tw-tab-count {
  font-size: 10px;
  background: rgba(var(--v-theme-on-surface), .1);
  padding: 1px 5px;
  border-radius: 10px;
}

/* Block list */
.tw-list-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 220px;
  overflow-y: auto;
}
.tw-list-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.tw-swatch { width: 10px; height: 32px; border-radius: 3px; flex-shrink: 0; }
.tw-list-info { flex: 1; min-width: 0; }
.tw-dur { white-space: nowrap; }

.tw-input {
  background: rgba(var(--v-theme-on-surface), .06);
  border: 1px solid rgba(var(--v-border-color), calc(var(--v-border-opacity) * 2));
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
  color: rgb(var(--v-theme-on-surface));
  outline: none;
  width: 100%;
}
.tw-input:focus { border-color: rgb(var(--v-theme-primary)); }

.tw-color-pick {
  width: 30px; height: 30px;
  border: none; border-radius: 6px;
  cursor: pointer; padding: 0; background: none; flex-shrink: 0;
}

.flex-1 { flex: 1; }
</style>
