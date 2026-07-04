<script setup lang="ts">
// Pomodoro / focus timer.
// Animated SVG ring countdown with work → short break → long break cycling.
// Completion chime uses the Web Audio API — no audio files required.

export type PomodoroPhase = 'work' | 'short-break' | 'long-break'

export interface PomodoroSession {
  phase:       PomodoroPhase
  durationMin: number
  completedAt: string   // ISO timestamp
}

// ─── Props / emits ────────────────────────────────────────────────────────────

const props = withDefaults(defineProps<{
  workMins?:            number
  shortBreakMins?:      number
  longBreakMins?:       number
  sessionsBeforeLong?:  number
  autoStart?:           boolean   // auto-start next phase after completion
}>(), {
  workMins:            25,
  shortBreakMins:      5,
  longBreakMins:       15,
  sessionsBeforeLong:  4,
  autoStart:           false,
})

const emit = defineEmits<{
  'session-complete': [session: PomodoroSession]
  'break-complete':   [session: PomodoroSession]
  'tick':             [remaining: number]
}>()

// ─── State ────────────────────────────────────────────────────────────────────

const phase          = ref<PomodoroPhase>('work')
const running        = ref(false)
const workCount      = ref(0)        // completed work sessions this cycle
const totalSessions  = ref(0)        // total work sessions ever
const remaining      = ref(props.workMins * 60)
const history        = ref<PomodoroSession[]>([])

let ticker: ReturnType<typeof setInterval> | null = null

// ─── Derived ──────────────────────────────────────────────────────────────────

const totalSecs = computed(() => {
  if (phase.value === 'work')        return props.workMins * 60
  if (phase.value === 'short-break') return props.shortBreakMins * 60
  return props.longBreakMins * 60
})

const progress = computed(() => remaining.value / totalSecs.value)

const mins = computed(() => Math.floor(remaining.value / 60).toString().padStart(2, '0'))
const secs = computed(() => (remaining.value % 60).toString().padStart(2, '0'))

const phaseLabel = computed(() => {
  if (phase.value === 'work')        return 'Focus'
  if (phase.value === 'short-break') return 'Short break'
  return 'Long break'
})

const phaseColor = computed(() => {
  if (phase.value === 'work')        return '#6366f1'
  if (phase.value === 'short-break') return '#10b981'
  return '#3b82f6'
})

// SVG ring geometry
const R    = 90
const CIRC = 2 * Math.PI * R
const dash = computed(() => CIRC * progress.value)

// ─── Controls ─────────────────────────────────────────────────────────────────

const start = () => {
  if (running.value) return
  running.value = true
  ticker = setInterval(() => {
    remaining.value--
    emit('tick', remaining.value)
    if (remaining.value <= 0) complete()
  }, 1000)
}

const pause = () => {
  running.value = false
  if (ticker) { clearInterval(ticker); ticker = null }
}

const toggle = () => running.value ? pause() : start()

const reset = () => {
  pause()
  remaining.value = totalSecs.value
}

const skip = () => {
  pause()
  advance()
}

// ─── Phase cycling ────────────────────────────────────────────────────────────

const complete = () => {
  pause()
  chime(phase.value === 'work')

  const session: PomodoroSession = {
    phase:       phase.value,
    durationMin: phase.value === 'work' ? props.workMins : phase.value === 'short-break' ? props.shortBreakMins : props.longBreakMins,
    completedAt: new Date().toISOString(),
  }
  history.value.unshift(session)

  if (phase.value === 'work') {
    emit('session-complete', session)
    workCount.value++
    totalSessions.value++
  } else {
    emit('break-complete', session)
  }

  advance()
}

const advance = () => {
  if (phase.value === 'work') {
    phase.value = workCount.value >= props.sessionsBeforeLong ? 'long-break' : 'short-break'
    if (phase.value === 'long-break') workCount.value = 0
  } else {
    phase.value = 'work'
  }
  remaining.value = totalSecs.value
  if (props.autoStart) start()
}

// ─── Web Audio chime (no audio files) ────────────────────────────────────────

const chime = (isWork: boolean) => {
  try {
    const ctx  = new AudioContext()
    const gain = ctx.createGain()
    gain.connect(ctx.destination)
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2)

    const freqs = isWork
      ? [523, 659, 784]   // C5 E5 G5 — upward "done" chord
      : [784, 659, 523]   // G5 E5 C5 — downward "relax" chord

    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15)
      osc.connect(gain)
      osc.start(ctx.currentTime + i * 0.15)
      osc.stop(ctx.currentTime + i * 0.15 + 0.4)
    })
  } catch {
    // AudioContext not available (SSR / restricted environment) — silent
  }
}

// ─── Sync remaining when props change ────────────────────────────────────────

watch(() => [props.workMins, props.shortBreakMins, props.longBreakMins], () => {
  if (!running.value) remaining.value = totalSecs.value
})

// ─── Cleanup ──────────────────────────────────────────────────────────────────

onUnmounted(() => { if (ticker) clearInterval(ticker) })

// ─── Session history helpers ──────────────────────────────────────────────────

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })

const sessionIcon  = (p: PomodoroPhase) =>
  p === 'work' ? 'mdi-brain' : p === 'short-break' ? 'mdi-coffee-outline' : 'mdi-sleep'

const sessionColor = (p: PomodoroPhase) =>
  p === 'work' ? 'primary' : p === 'short-break' ? 'success' : 'info'

const sessionLabel = (p: PomodoroPhase) =>
  p === 'work' ? 'Focus' : p === 'short-break' ? 'Short break' : 'Long break'

// Expose for parent if needed
defineExpose({ start, pause, toggle, reset, skip, phase, running, remaining, workCount, totalSessions })
</script>

<template>
  <div class="pt-root">

    <!-- ── Ring + controls ──────────────────────────────────────────────── -->
    <div class="pt-ring-wrap">

      <!-- Phase label pill -->
      <div class="pt-phase-pill" :style="{ background: phaseColor + '22', color: phaseColor }">
        <span class="pt-phase-dot" :style="{ background: phaseColor }" />
        {{ phaseLabel }}
      </div>

      <!-- SVG ring -->
      <svg class="pt-ring" viewBox="0 0 200 200" width="220" height="220">
        <!-- Track -->
        <circle
          cx="100" cy="100" :r="R"
          fill="none"
          stroke="rgba(var(--v-theme-on-surface),.08)"
          stroke-width="10"
        />
        <!-- Progress arc -->
        <circle
          cx="100" cy="100" :r="R"
          fill="none"
          :stroke="phaseColor"
          stroke-width="10"
          stroke-linecap="round"
          :stroke-dasharray="`${dash} ${CIRC}`"
          stroke-dashoffset="0"
          transform="rotate(-90 100 100)"
          style="transition: stroke-dasharray .9s linear, stroke .4s ease"
        />
        <!-- Time display -->
        <text x="100" y="88" text-anchor="middle" class="pt-time-text" :fill="phaseColor">
          {{ mins }}:{{ secs }}
        </text>
        <text x="100" y="114" text-anchor="middle" class="pt-sub-text" fill="rgba(var(--v-theme-on-surface),.4)">
          remaining
        </text>
        <!-- Session dots -->
        <g>
          <circle
            v-for="i in sessionsBeforeLong"
            :key="i"
            :cx="100 + (i - (sessionsBeforeLong + 1) / 2) * 14"
            cy="134"
            r="4"
            :fill="i <= workCount ? phaseColor : 'rgba(var(--v-theme-on-surface),.12)'"
            style="transition: fill .3s"
          />
        </g>
      </svg>

      <!-- Controls -->
      <div class="pt-controls">
        <v-btn icon="mdi-skip-previous" variant="tonal" size="small" :disabled="running" @click="reset" />
        <v-btn
          :icon="running ? 'mdi-pause' : 'mdi-play'"
          variant="flat"
          size="large"
          :color="phaseColor"
          rounded="xl"
          style="width:64px;height:64px"
          @click="toggle"
        />
        <v-btn icon="mdi-skip-next" variant="tonal" size="small" @click="skip" />
      </div>

      <!-- Session counter -->
      <p class="text-caption text-medium-emphasis mt-1">
        {{ totalSessions }} session{{ totalSessions !== 1 ? 's' : '' }} completed today
      </p>

    </div>

    <!-- ── Session history ───────────────────────────────────────────────── -->
    <div v-if="history.length" class="pt-history">
      <p class="pt-history-title">Session log</p>
      <div class="pt-history-list">
        <div v-for="(s, i) in history" :key="i" class="pt-history-row">
          <v-icon :icon="sessionIcon(s.phase)" :color="sessionColor(s.phase)" size="16" />
          <span class="pt-history-label">{{ sessionLabel(s.phase) }}</span>
          <span class="pt-history-dur">{{ s.durationMin }}m</span>
          <span class="pt-history-time">{{ fmtTime(s.completedAt) }}</span>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.pt-root {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  padding: 32px 16px 24px;
}

/* Ring area */
.pt-ring-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.pt-phase-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .04em;
  text-transform: uppercase;
}
.pt-phase-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.pt-ring { overflow: visible; }

.pt-time-text {
  font-size: 38px;
  font-weight: 800;
  font-family: system-ui, monospace;
  letter-spacing: -.02em;
}
.pt-sub-text {
  font-size: 11px;
  font-family: system-ui, sans-serif;
}

.pt-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* History */
.pt-history {
  width: 100%;
  max-width: 360px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 12px;
  overflow: hidden;
}
.pt-history-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), .4);
  padding: 10px 14px 8px;
  margin: 0;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgba(var(--v-theme-on-surface), .02);
}
.pt-history-list { max-height: 220px; overflow-y: auto; }
.pt-history-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  font-size: 12px;
}
.pt-history-row:last-child { border-bottom: none; }
.pt-history-label { flex: 1; font-weight: 500; color: rgb(var(--v-theme-on-surface)); }
.pt-history-dur   { color: rgba(var(--v-theme-on-surface), .45); font-variant-numeric: tabular-nums; }
.pt-history-time  { color: rgba(var(--v-theme-on-surface), .35); font-size: 11px; font-variant-numeric: tabular-nums; min-width: 48px; text-align: right; }
</style>
