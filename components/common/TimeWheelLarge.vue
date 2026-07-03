<script setup lang="ts">
interface TimeBlock {
  id: string
  label: string
  color: string
  startMin: number  // 0–720 within the ring's 12-hr window
  endMin: number
}

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#f97316', '#8b5cf6', '#14b8a6']

const SIZE   = 420
const CX     = SIZE / 2
const CY     = SIZE / 2

// Two thin ring bands
const PM_OUT = SIZE / 2 - 6
const PM_IN  = PM_OUT - 18
const AM_OUT = PM_IN - 4
const AM_IN  = AM_OUT - 18
const CLOCK  = AM_IN - 8   // large clock face uses the remaining space

// ─── Clock ────────────────────────────────────────────────────────────────────
const now = ref(new Date())
let timer: ReturnType<typeof setInterval>
onMounted(() => { timer = setInterval(() => { now.value = new Date() }, 1000) })
onUnmounted(() => clearInterval(timer))

const sec = computed(() => now.value.getSeconds())
const min = computed(() => now.value.getMinutes())
const hr  = computed(() => now.value.getHours() % 12)

const mDeg = computed(() => (min.value + sec.value / 60) * 6)
const hDeg = computed(() => (hr.value + min.value / 60 + sec.value / 3600) * 30)
const sDeg = computed(() => sec.value * 6)

const handEnd = (deg: number, len: number) => {
  const rad = (deg - 90) * Math.PI / 180
  return { x: CX + Math.cos(rad) * len, y: CY + Math.sin(rad) * len }
}
const hHand = computed(() => handEnd(hDeg.value, CLOCK * 0.50))
const mHand = computed(() => handEnd(mDeg.value, CLOCK * 0.70))
const sHand = computed(() => handEnd(sDeg.value, CLOCK * 0.82))
const sTail = computed(() => handEnd(sDeg.value + 180, CLOCK * 0.16))

// 60 second/minute ticks
const ticks60 = Array.from({ length: 60 }, (_, i) => {
  const isMajor = i % 5 === 0
  const angle = (i * 6 - 90) * Math.PI / 180
  const outer = CLOCK - 3
  const inner = outer - (isMajor ? 14 : 7)
  return {
    x1: CX + Math.cos(angle) * outer,
    y1: CY + Math.sin(angle) * outer,
    x2: CX + Math.cos(angle) * inner,
    y2: CY + Math.sin(angle) * inner,
    major: isMajor,
  }
})

// 12 hour numerals
const numerals = Array.from({ length: 12 }, (_, i) => {
  const n = i + 1
  const angle = (n * 30 - 90) * Math.PI / 180
  const r = CLOCK - 30
  return { n, x: CX + Math.cos(angle) * r, y: CY + Math.sin(angle) * r }
})

// ─── Blocks ───────────────────────────────────────────────────────────────────
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

// ─── Controls ─────────────────────────────────────────────────────────────────
const showHandles = ref(true)
const activeTab   = ref<'am' | 'pm'>('am')
const SNAP_OPTIONS = [5, 10, 15, 20, 30, 60]
const snap = ref(5)

// ─── Current / next / upcoming ────────────────────────────────────────────────
const nowMin = computed(() => now.value.getHours() * 60 + now.value.getMinutes())
const currentRing = computed(() => nowMin.value < 720 ? 'am' : 'pm')

const currentTask = computed(() =>
  allBlocksAbs.value.find(b => nowMin.value >= b.absStart && nowMin.value < b.absEnd) ?? null,
)

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
  if (diff < 60) return `in ${diff}m`
  const h = Math.floor(diff / 60)
  const m = diff % 60
  return m ? `in ${h}h ${m}m` : `in ${h}h`
}

// ─── Arc helpers ──────────────────────────────────────────────────────────────
// 0–720 min maps to full 360°
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

// ─── Drag resize ──────────────────────────────────────────────────────────────
const svgRef = ref<SVGSVGElement>()
type Ring = 'am' | 'pm'
type DragTarget = { ring: Ring; blockId: string; handle: 'start' | 'end' } | null
let drag: DragTarget = null

const svgPoint = (e: MouseEvent) => {
  const rect = svgRef.value!.getBoundingClientRect()
  return { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

// Convert canvas XY → minutes snapped to the current quantization grid
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

const handlePos = (b: TimeBlock, handle: 'start' | 'end', outerR: number) => {
  const deg = minToDeg12(handle === 'start' ? b.startMin : b.endMin)
  const r = outerR + 8
  return { x: CX + Math.cos(deg * Math.PI / 180) * r, y: CY + Math.sin(deg * Math.PI / 180) * r }
}

// ─── Block management ─────────────────────────────────────────────────────────
const editing  = ref<string | null>(null)
const editLabel = ref('')
const newLabel  = ref('')
const newColor  = ref(COLORS[1]!)

const startEdit = (b: TimeBlock) => { editing.value = b.id; editLabel.value = b.label }

const commitEdit = (ring: Ring) => {
  const list = ring === 'am' ? amBlocks : pmBlocks
  const b = list.value.find(b => b.id === editing.value)
  if (b && editLabel.value.trim()) b.label = editLabel.value.trim()
  editing.value = null
}

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

const fmtRingTime = (min12: number, ring: Ring) => {
  const absMin = ring === 'am' ? min12 : min12 + 720
  const h = Math.floor(absMin / 60) % 24
  const mm = absMin % 60
  const ampm = h >= 12 ? 'pm' : 'am'
  return `${h % 12 || 12}:${String(mm).padStart(2, '0')}${ampm}`
}
</script>

<template>
  <div class="twl-root">
    <!-- SVG wheel -->
    <div class="twl-svg-wrap">
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
        <!-- Ring tracks -->
        <circle :cx="CX" :cy="CY" :r="(PM_OUT + PM_IN) / 2" fill="none" :stroke-width="PM_OUT - PM_IN + 1" stroke="rgba(var(--v-theme-on-surface), .06)" />
        <circle :cx="CX" :cy="CY" :r="(AM_OUT + AM_IN) / 2" fill="none" :stroke-width="AM_OUT - AM_IN + 1" stroke="rgba(var(--v-theme-on-surface), .06)" />

        <!-- PM blocks -->
        <path
          v-for="b in pmBlocks"
          :key="b.id"
          :d="arcPath(b.startMin, b.endMin, PM_OUT, PM_IN)"
          :fill="b.color"
          fill-opacity=".9"
          style="cursor:pointer"
          @click="activeTab = 'pm'"
        />

        <!-- AM blocks -->
        <path
          v-for="b in amBlocks"
          :key="b.id"
          :d="arcPath(b.startMin, b.endMin, AM_OUT, AM_IN)"
          :fill="b.color"
          fill-opacity=".9"
          style="cursor:pointer"
          @click="activeTab = 'am'"
        />

        <!-- PM drag handles -->
        <g v-if="showHandles">
          <g v-for="b in pmBlocks" :key="`ph-${b.id}`">
            <circle
              :cx="handlePos(b, 'start', PM_OUT).x" :cy="handlePos(b, 'start', PM_OUT).y"
              r="6" :fill="b.color" stroke="white" stroke-width="2" style="cursor:ew-resize"
              @mousedown="onHandleDown($event, 'pm', b.id, 'start')"
            />
            <circle
              :cx="handlePos(b, 'end', PM_OUT).x" :cy="handlePos(b, 'end', PM_OUT).y"
              r="6" :fill="b.color" stroke="white" stroke-width="2" style="cursor:ew-resize"
              @mousedown="onHandleDown($event, 'pm', b.id, 'end')"
            />
          </g>
        </g>

        <!-- AM drag handles -->
        <g v-if="showHandles">
          <g v-for="b in amBlocks" :key="`ah-${b.id}`">
            <circle
              :cx="handlePos(b, 'start', AM_OUT).x" :cy="handlePos(b, 'start', AM_OUT).y"
              r="5.5" :fill="b.color" stroke="white" stroke-width="2" style="cursor:ew-resize"
              @mousedown="onHandleDown($event, 'am', b.id, 'start')"
            />
            <circle
              :cx="handlePos(b, 'end', AM_OUT).x" :cy="handlePos(b, 'end', AM_OUT).y"
              r="5.5" :fill="b.color" stroke="white" stroke-width="2" style="cursor:ew-resize"
              @mousedown="onHandleDown($event, 'am', b.id, 'end')"
            />
          </g>
        </g>

        <!-- Clock face -->
        <circle :cx="CX" :cy="CY" :r="CLOCK" class="twl-face" />

        <!-- 60 tick marks -->
        <line
          v-for="(t, i) in ticks60"
          :key="`tk${i}`"
          :x1="t.x1" :y1="t.y1"
          :x2="t.x2" :y2="t.y2"
          :stroke-width="t.major ? 2 : 1"
          :class="t.major ? 'twl-tick--major' : 'twl-tick'"
        />

        <!-- Hour numerals -->
        <text
          v-for="n in numerals"
          :key="`n${n.n}`"
          :x="n.x" :y="n.y"
          text-anchor="middle"
          dominant-baseline="central"
          class="twl-numeral"
        >{{ n.n }}</text>

        <!-- Hour hand -->
        <line
          :x1="CX" :y1="CY" :x2="hHand.x" :y2="hHand.y"
          stroke-linecap="round" stroke-width="5"
          class="twl-hand twl-hand--hour"
        />
        <!-- Minute hand -->
        <line
          :x1="CX" :y1="CY" :x2="mHand.x" :y2="mHand.y"
          stroke-linecap="round" stroke-width="3"
          class="twl-hand twl-hand--minute"
        />
        <!-- Second hand -->
        <line
          :x1="sTail.x" :y1="sTail.y" :x2="sHand.x" :y2="sHand.y"
          stroke-linecap="round" stroke-width="1.5"
          class="twl-second"
        />
        <circle :cx="CX" :cy="CY" r="4" class="twl-second" />
        <circle :cx="CX" :cy="CY" r="2" class="twl-face" />

        <!-- AM / PM band labels at 12 o'clock -->
        <text
          :x="CX + (AM_OUT + AM_IN) / 2 * Math.cos(-Math.PI / 2)"
          :y="CY + (AM_OUT + AM_IN) / 2 * Math.sin(-Math.PI / 2) - 1"
          text-anchor="middle" dominant-baseline="central"
          font-size="6" font-weight="800" class="twl-band-lbl"
        >AM</text>
        <text
          :x="CX + (PM_OUT + PM_IN) / 2 * Math.cos(-Math.PI / 2)"
          :y="CY + (PM_OUT + PM_IN) / 2 * Math.sin(-Math.PI / 2) - 1"
          text-anchor="middle" dominant-baseline="central"
          font-size="6" font-weight="800" class="twl-band-lbl"
        >PM</text>
      </svg>
    </div>

    <!-- Side panel -->
    <div class="twl-panel">
      <!-- Schedule strip -->
      <div class="twl-schedule">
        <div class="twl-sched-row twl-sched-row--now" :style="currentTask ? { borderLeftColor: currentTask.color } : {}">
          <span class="twl-sched-label">Now</span>
          <template v-if="currentTask">
            <span class="twl-sched-dot" :style="{ background: currentTask.color }" />
            <span class="twl-sched-name" :style="{ color: currentTask.color }">{{ currentTask.label }}</span>
            <span class="twl-sched-time">{{ fmtAbsMin(currentTask.absStart) }}–{{ fmtAbsMin(currentTask.absEnd) }}</span>
            <span class="twl-sched-ring">{{ currentRing.toUpperCase() }}</span>
          </template>
          <span v-else class="twl-sched-empty">No block at this time</span>
        </div>
        <div
          v-for="(b, i) in upcomingBlocks"
          :key="b.id"
          class="twl-sched-row"
          :style="i === 0 ? { borderLeftColor: b.color } : {}"
        >
          <span class="twl-sched-label">{{ i === 0 ? 'Next' : '' }}</span>
          <span class="twl-sched-dot" :style="{ background: b.color }" />
          <span class="twl-sched-name">{{ b.label }}</span>
          <span class="twl-sched-time">{{ fmtAbsMin(b.absStart) }}–{{ fmtAbsMin(b.absEnd) }}</span>
          <span class="twl-sched-ring">{{ b.ring.toUpperCase() }}</span>
          <span class="twl-sched-delta">{{ startsIn(b.absStart) }}</span>
        </div>
      </div>

      <!-- Handle toggle -->
      <div class="twl-toggle-row mb-4">
        <span class="text-body-2 font-weight-medium">Drag handles</span>
        <v-switch
          v-model="showHandles"
          density="compact"
          color="primary"
          hide-details
          class="ml-auto"
        />
      </div>

      <!-- AM / PM tab -->
      <div class="twl-tabs mb-3">
        <button class="twl-tab" :class="{ 'twl-tab--active': activeTab === 'am' }" @click="activeTab = 'am'">
          <span class="twl-tab-dot" style="background:#3b82f6" />
          AM
          <span class="twl-tab-count">{{ amBlocks.length }}</span>
        </button>
        <button class="twl-tab" :class="{ 'twl-tab--active': activeTab === 'pm' }" @click="activeTab = 'pm'">
          <span class="twl-tab-dot" style="background:#f97316" />
          PM
          <span class="twl-tab-count">{{ pmBlocks.length }}</span>
        </button>
      </div>

      <!-- Block list -->
      <div class="twl-list">
        <template v-if="activeTab === 'am'">
          <div v-for="b in amBlocks" :key="b.id" class="twl-row">
            <div class="twl-swatch" :style="{ background: b.color }" />
            <div class="twl-info">
              <div v-if="editing === b.id">
                <input v-model="editLabel" class="twl-input" autofocus
                  @keydown.enter="commitEdit('am')" @keydown.escape="editing = null" @blur="commitEdit('am')" />
              </div>
              <p v-else class="text-body-2 font-weight-medium text-truncate" style="cursor:text" @click="startEdit(b)">{{ b.label }}</p>
              <p class="text-caption text-medium-emphasis">{{ fmtRingTime(b.startMin, 'am') }} – {{ fmtRingTime(b.endMin, 'am') }}</p>
            </div>
            <span class="text-caption text-medium-emphasis twl-dur">{{ Math.round((b.endMin - b.startMin) / 60 * 10) / 10 }}h</span>
            <v-btn icon="mdi-close" size="x-small" variant="text" density="compact" @click="removeBlock('am', b.id)" />
          </div>
        </template>
        <template v-else>
          <div v-for="b in pmBlocks" :key="b.id" class="twl-row">
            <div class="twl-swatch" :style="{ background: b.color }" />
            <div class="twl-info">
              <div v-if="editing === b.id">
                <input v-model="editLabel" class="twl-input" autofocus
                  @keydown.enter="commitEdit('pm')" @keydown.escape="editing = null" @blur="commitEdit('pm')" />
              </div>
              <p v-else class="text-body-2 font-weight-medium text-truncate" style="cursor:text" @click="startEdit(b)">{{ b.label }}</p>
              <p class="text-caption text-medium-emphasis">{{ fmtRingTime(b.startMin, 'pm') }} – {{ fmtRingTime(b.endMin, 'pm') }}</p>
            </div>
            <span class="text-caption text-medium-emphasis twl-dur">{{ Math.round((b.endMin - b.startMin) / 60 * 10) / 10 }}h</span>
            <v-btn icon="mdi-close" size="x-small" variant="text" density="compact" @click="removeBlock('pm', b.id)" />
          </div>
        </template>
      </div>

      <v-divider class="my-3" />

      <p class="text-caption text-medium-emphasis font-weight-medium mb-2">Add to {{ activeTab.toUpperCase() }}</p>
      <div class="d-flex gap-2 align-center">
        <input v-model="newLabel" class="twl-input flex-1" :placeholder="activeTab === 'am' ? 'Morning block' : 'Evening block'" @keydown.enter="addBlock(activeTab)" />
        <input v-model="newColor" type="color" class="twl-color-pick" />
        <v-btn size="small" variant="tonal" color="primary" icon="mdi-plus" @click="addBlock(activeTab)" />
      </div>

      <v-divider class="my-3" />

      <!-- Snap / quantization -->
      <div class="d-flex align-center gap-2">
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

      <!-- Legend -->
      <div class="twl-legend mt-4">
        <div v-for="b in (activeTab === 'am' ? amBlocks : pmBlocks)" :key="`leg-${b.id}`" class="twl-legend-item">
          <div class="twl-legend-dot" :style="{ background: b.color }" />
          <span class="text-caption text-truncate">{{ b.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.twl-root {
  display: flex;
  align-items: flex-start;
  gap: 28px;
  flex-wrap: wrap;
}
.twl-svg-wrap { flex-shrink: 0; }

/* Clock face */
.twl-face    { fill: rgb(var(--v-theme-surface)); filter: drop-shadow(0 3px 10px rgba(0,0,0,.12)); }
.twl-tick    { stroke: rgba(var(--v-theme-on-surface), .15); }
.twl-tick--major { stroke: rgba(var(--v-theme-on-surface), .4); }
.twl-numeral {
  font-size: 13px;
  font-weight: 700;
  fill: rgba(var(--v-theme-on-surface), .65);
  font-family: inherit;
}
.twl-hand         { stroke: rgb(var(--v-theme-on-surface)); }
.twl-hand--hour   { opacity: .9; }
.twl-hand--minute { opacity: .75; }
.twl-second { stroke: rgb(var(--v-theme-error)); fill: rgb(var(--v-theme-error)); }
.twl-band-lbl { fill: rgba(var(--v-theme-on-surface), .3); font-family: inherit; }

/* Panel */
.twl-panel { flex: 1; min-width: 220px; max-width: 280px; }

/* Schedule strip */
.twl-schedule {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  margin-bottom: 14px;
}
.twl-sched-row {
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
.twl-sched-row:first-child { border-top: none; }
.twl-sched-row--now { background: rgba(var(--v-theme-on-surface), .05); }

.twl-sched-label {
  font-size: 8px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), .38);
  width: 28px;
  flex-shrink: 0;
}
.twl-sched-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.twl-sched-name {
  font-size: 11px;
  font-weight: 700;
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.twl-sched-time {
  font-size: 9px;
  font-variant-numeric: tabular-nums;
  color: rgba(var(--v-theme-on-surface), .45);
  white-space: nowrap;
  flex-shrink: 0;
}
.twl-sched-ring {
  font-size: 8px;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), .3);
  background: rgba(var(--v-theme-on-surface), .07);
  padding: 1px 4px;
  border-radius: 3px;
  flex-shrink: 0;
}
.twl-sched-delta {
  font-size: 8px;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), .35);
  white-space: nowrap;
  flex-shrink: 0;
}
.twl-sched-empty {
  font-size: 10px;
  color: rgba(var(--v-theme-on-surface), .35);
  font-style: italic;
}

.twl-toggle-row {
  display: flex;
  align-items: center;
  background: rgba(var(--v-theme-on-surface), .04);
  border-radius: 8px;
  padding: 6px 12px;
}

/* Tabs */
.twl-tabs {
  display: flex;
  gap: 4px;
  background: rgba(var(--v-theme-on-surface), .06);
  border-radius: 8px;
  padding: 3px;
}
.twl-tab {
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
  color: rgba(var(--v-theme-on-surface), .45);
  transition: background .15s, color .15s;
}
.twl-tab--active {
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  box-shadow: 0 1px 4px rgba(0,0,0,.1);
}
.twl-tab-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.twl-tab-count { font-size: 10px; background: rgba(var(--v-theme-on-surface), .1); padding: 1px 5px; border-radius: 10px; }

/* Block list */
.twl-list { display: flex; flex-direction: column; gap: 2px; max-height: 200px; overflow-y: auto; }
.twl-row  { display: flex; align-items: center; gap: 8px; padding: 5px 0; border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); }
.twl-swatch { width: 6px; height: 30px; border-radius: 3px; flex-shrink: 0; }
.twl-info { flex: 1; min-width: 0; }
.twl-dur { white-space: nowrap; }

.twl-input {
  background: rgba(var(--v-theme-on-surface), .06);
  border: 1px solid rgba(var(--v-border-color), calc(var(--v-border-opacity) * 2));
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
  color: rgb(var(--v-theme-on-surface));
  outline: none;
  width: 100%;
}
.twl-input:focus { border-color: rgb(var(--v-theme-primary)); }
.twl-color-pick { width: 30px; height: 30px; border: none; border-radius: 6px; cursor: pointer; padding: 0; background: none; flex-shrink: 0; }

/* Legend */
.twl-legend { display: flex; flex-direction: column; gap: 4px; }
.twl-legend-item { display: flex; align-items: center; gap: 8px; }
.twl-legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

.flex-1 { flex: 1; }
</style>
