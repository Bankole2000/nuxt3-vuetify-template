<script setup lang="ts">
const props = withDefaults(defineProps<{
  size?: number
  showSeconds?: boolean
  showDigital?: boolean
  timezone?: string
}>(), {
  size: 240,
  showSeconds: true,
  showDigital: true,
})

const now = ref(new Date())
let timer: ReturnType<typeof setInterval>

onMounted(() => { timer = setInterval(() => { now.value = new Date() }, 1000) })
onUnmounted(() => clearInterval(timer))

const toLocal = (d: Date) => {
  if (!props.timezone) return d
  try {
    const str = d.toLocaleString('en-US', { timeZone: props.timezone })
    return new Date(str)
  } catch {
    return d
  }
}

const local = computed(() => toLocal(now.value))

const s  = computed(() => local.value.getSeconds())
const m  = computed(() => local.value.getMinutes())
const h  = computed(() => local.value.getHours() % 12)

// Smooth sub-second interpolation for minute and hour hands
const mDeg = computed(() => (m.value + s.value / 60) * 6)
const hDeg = computed(() => (h.value + m.value / 60 + s.value / 3600) * 30)
const sDeg = computed(() => s.value * 6)

const digitalTime = computed(() =>
  local.value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: props.showSeconds ? '2-digit' : undefined }),
)

const r  = computed(() => props.size / 2)
const cx = computed(() => r.value)
const cy = computed(() => r.value)

// Tick marks
const ticks = Array.from({ length: 60 }, (_, i) => {
  const isMajor = i % 5 === 0
  const angle = (i * 6 - 90) * (Math.PI / 180)
  const outer = r.value - 6
  const inner = outer - (isMajor ? 12 : 6)
  return {
    x1: cx.value + Math.cos(angle) * outer,
    y1: cy.value + Math.sin(angle) * outer,
    x2: cx.value + Math.cos(angle) * inner,
    y2: cy.value + Math.sin(angle) * inner,
    major: isMajor,
  }
})

// Hour numerals (1–12)
const numerals = Array.from({ length: 12 }, (_, i) => {
  const n = i + 1
  const angle = (n * 30 - 90) * (Math.PI / 180)
  const nr = r.value - 30
  return { n, x: cx.value + Math.cos(angle) * nr, y: cy.value + Math.sin(angle) * nr }
})

// Hand endpoint helper
const handEnd = (deg: number, length: number) => {
  const rad = (deg - 90) * (Math.PI / 180)
  return { x: cx.value + Math.cos(rad) * length, y: cy.value + Math.sin(rad) * length }
}

const hHand = computed(() => handEnd(hDeg.value, r.value * 0.52))
const mHand = computed(() => handEnd(mDeg.value, r.value * 0.70))
const sHand = computed(() => handEnd(sDeg.value, r.value * 0.80))
const sTail = computed(() => handEnd(sDeg.value + 180, r.value * 0.18))
</script>

<template>
  <div class="ac-wrap" :style="{ width: size + 'px' }">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`">
      <!-- Face -->
      <circle :cx="cx" :cy="cy" :r="r - 2" class="ac-face" />
      <circle :cx="cx" :cy="cy" :r="r - 2" class="ac-face-ring" fill="none" />

      <!-- Tick marks -->
      <line
        v-for="(t, i) in ticks"
        :key="i"
        :x1="t.x1" :y1="t.y1"
        :x2="t.x2" :y2="t.y2"
        :stroke-width="t.major ? 2 : 1"
        class="ac-tick"
        :class="{ 'ac-tick--major': t.major }"
      />

      <!-- Hour numerals -->
      <text
        v-for="n in numerals"
        :key="n.n"
        :x="n.x" :y="n.y"
        text-anchor="middle"
        dominant-baseline="central"
        class="ac-numeral"
      >{{ n.n }}</text>

      <!-- Hour hand -->
      <line
        :x1="cx" :y1="cy"
        :x2="hHand.x" :y2="hHand.y"
        stroke-linecap="round"
        stroke-width="5"
        class="ac-hand ac-hand--hour"
      />

      <!-- Minute hand -->
      <line
        :x1="cx" :y1="cy"
        :x2="mHand.x" :y2="mHand.y"
        stroke-linecap="round"
        stroke-width="3.5"
        class="ac-hand ac-hand--minute"
      />

      <!-- Second hand -->
      <g v-if="showSeconds">
        <line
          :x1="sTail.x" :y1="sTail.y"
          :x2="sHand.x" :y2="sHand.y"
          stroke-linecap="round"
          stroke-width="1.5"
          class="ac-hand ac-hand--second"
        />
        <circle :cx="cx" :cy="cy" r="3.5" class="ac-hand ac-hand--second" />
        <circle :cx="cx" :cy="cy" r="2" class="ac-center-dot" />
      </g>
      <circle v-else :cx="cx" :cy="cy" r="4" class="ac-center-dot-solid" />
    </svg>

    <!-- Digital readout -->
    <div v-if="showDigital" class="ac-digital text-caption font-weight-medium text-medium-emphasis">
      {{ digitalTime }}
    </div>
  </div>
</template>

<style scoped>
.ac-wrap {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.ac-face {
  fill: rgb(var(--v-theme-surface));
  filter: drop-shadow(0 4px 12px rgba(0,0,0,.15));
}
.ac-face-ring {
  stroke: rgba(var(--v-theme-on-surface), .1);
  stroke-width: 1.5;
}
.ac-tick {
  stroke: rgba(var(--v-theme-on-surface), .18);
}
.ac-tick--major {
  stroke: rgba(var(--v-theme-on-surface), .45);
}
.ac-numeral {
  font-size: 11px;
  font-weight: 600;
  fill: rgba(var(--v-theme-on-surface), .6);
  font-family: inherit;
}
.ac-hand {
  stroke: rgb(var(--v-theme-on-surface));
}
.ac-hand--hour   { stroke: rgb(var(--v-theme-on-surface)); }
.ac-hand--minute { stroke: rgb(var(--v-theme-on-surface)); opacity: .85; }
.ac-hand--second { stroke: rgb(var(--v-theme-error)); }
.ac-center-dot      { fill: rgb(var(--v-theme-surface)); }
.ac-center-dot-solid { fill: rgb(var(--v-theme-on-surface)); }
.ac-digital {
  letter-spacing: .06em;
  font-variant-numeric: tabular-nums;
}
</style>
