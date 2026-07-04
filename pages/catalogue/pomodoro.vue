<script setup lang="ts">
import type { PomodoroSession } from '~/components/common/PomodoroTimer.vue'

definePageMeta({ layout: 'catalogue' })
useSeo({ title: 'Pomodoro Timer', description: 'Animated SVG ring countdown timer with work/break cycling, Web Audio chime, configurable durations, and session history log.' })

// ── Settings ─────────────────────────────────────────────────────────────────

const workMins           = ref(25)
const shortBreakMins     = ref(5)
const longBreakMins      = ref(15)
const sessionsBeforeLong = ref(4)
const autoStart          = ref(false)
const settingsOpen       = ref(false)
const infoOpen           = ref(false)

// Staged values while the settings panel is open
const draftWork      = ref(25)
const draftShort     = ref(5)
const draftLong      = ref(15)
const draftSessions  = ref(4)
const draftAutoStart = ref(false)

const openSettings = () => {
  draftWork.value      = workMins.value
  draftShort.value     = shortBreakMins.value
  draftLong.value      = longBreakMins.value
  draftSessions.value  = sessionsBeforeLong.value
  draftAutoStart.value = autoStart.value
  settingsOpen.value   = true
}

const applySettings = () => {
  workMins.value           = draftWork.value
  shortBreakMins.value     = draftShort.value
  longBreakMins.value      = draftLong.value
  sessionsBeforeLong.value = draftSessions.value
  autoStart.value          = draftAutoStart.value
  settingsOpen.value       = false
}

// ── Session events ────────────────────────────────────────────────────────────

const lastSession = ref<PomodoroSession | null>(null)
const snackbar    = ref(false)
const snackText   = ref('')

const onSessionComplete = (s: PomodoroSession) => {
  lastSession.value = s
  snackText.value   = `Focus session done! Time for a ${shortBreakMins.value}-min break.`
  snackbar.value    = true
}

const onBreakComplete = (s: PomodoroSession) => {
  lastSession.value = s
  snackText.value   = 'Break over — back to focus!'
  snackbar.value    = true
}

// ── Info ─────────────────────────────────────────────────────────────────────

const USECASES = [
  {
    context: 'General UI patterns',
    icon: 'mdi-timer-outline',
    color: 'primary',
    items: [
      { label: 'Focus / deep work', detail: 'The classic Pomodoro Technique: 25-min sprints with enforced breaks to maintain flow and avoid burnout.' },
      { label: 'Exam / study timer', detail: 'Students use a countdown ring to pace revision sessions. Configurable durations suit different study lengths.' },
      { label: 'Exercise intervals', detail: 'HIIT-style work/rest cycles — shorten durations and loop automatically with autoStart.' },
      { label: 'Meeting timekeeper', detail: 'A large visible countdown during time-boxed meetings. Skip button lets the facilitator advance to the next agenda item.' },
    ],
  },
  {
    context: 'Promodoro (#19)',
    icon: 'mdi-clock-outline',
    color: 'indigo',
    items: [
      { label: 'Core UI', detail: 'This component IS the Promodoro app\'s primary screen. Configure durations, cycle through phases, and log sessions.' },
      { label: 'Session history', detail: 'The history log becomes a persistent productivity record — connect it to a Pinia store or server route to save across sessions.' },
      { label: 'Settings panel', detail: 'The settings dialog pattern (draft → apply) prevents mid-session disruption when changing durations.' },
    ],
  },
  {
    context: 'Workflow Engine (#3)',
    icon: 'mdi-vector-polyline',
    color: 'purple',
    items: [
      { label: 'Time-boxed pipeline stages', detail: 'A stage in a workflow can have a maximum duration. The ring gives operators a visible countdown before auto-escalation.' },
      { label: 'SLA countdown', detail: 'Mount the timer against an SLA deadline; red ring when time is nearly up triggers an alert.' },
    ],
  },
  {
    context: 'Portfolio Manager (#1)',
    icon: 'mdi-briefcase-outline',
    color: 'teal',
    items: [
      { label: 'Focus blocks on task view', detail: 'Link a Pomodoro to a specific task. Each completed session increments the task\'s logged time.' },
    ],
  },
]

const PRESETS = [
  { label: 'Classic',      work: 25, short: 5,  long: 15, sessions: 4 },
  { label: 'Short sprints',work: 15, short: 3,  long: 10, sessions: 4 },
  { label: 'Deep work',    work: 50, short: 10, long: 30, sessions: 2 },
  { label: 'Study blocks', work: 45, short: 5,  long: 20, sessions: 3 },
]

const applyPreset = (p: typeof PRESETS[0]) => {
  draftWork.value     = p.work
  draftShort.value    = p.short
  draftLong.value     = p.long
  draftSessions.value = p.sessions
}
</script>

<template>
  <div>
    <div class="d-flex align-start justify-space-between gap-4 mb-1">
      <h1 class="text-h5 font-weight-bold">Pomodoro Timer</h1>
      <div class="d-flex gap-1">
        <v-btn icon="mdi-cog-outline" variant="text" size="small" @click="openSettings" />
        <v-btn icon="mdi-information-outline" variant="text" size="small" @click="infoOpen = true" />
      </div>
    </div>
    <p class="text-body-2 text-medium-emphasis mb-6">
      Animated SVG ring countdown with work → short break → long break cycling.
      Completion chime via Web Audio API. Click the cog to adjust durations or choose a preset.
    </p>

    <!-- Timer -->
    <div class="d-flex justify-center">
      <v-card rounded="xl" elevation="0" border style="max-width:480px;width:100%">
        <CommonPomodoroTimer
          :work-mins="workMins"
          :short-break-mins="shortBreakMins"
          :long-break-mins="longBreakMins"
          :sessions-before-long="sessionsBeforeLong"
          :auto-start="autoStart"
          @session-complete="onSessionComplete"
          @break-complete="onBreakComplete"
        />
      </v-card>
    </div>

    <!-- Settings dialog -->
    <v-dialog v-model="settingsOpen" max-width="400">
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center justify-space-between pt-5 px-5 pb-2">
          <span class="text-body-1 font-weight-bold">Timer settings</span>
          <v-btn icon="mdi-close" variant="text" size="small" @click="settingsOpen = false" />
        </v-card-title>

        <v-card-text class="px-5 pb-2">
          <!-- Presets -->
          <p class="text-caption text-medium-emphasis mb-2">Presets</p>
          <div class="d-flex flex-wrap gap-2 mb-5">
            <v-btn
              v-for="p in PRESETS"
              :key="p.label"
              size="small"
              variant="tonal"
              @click="applyPreset(p)"
            >{{ p.label }}</v-btn>
          </div>

          <!-- Duration sliders -->
          <p class="text-caption text-medium-emphasis mb-1">Focus duration</p>
          <div class="d-flex align-center gap-3 mb-3">
            <v-slider
              v-model="draftWork"
              :min="5" :max="60" :step="5"
              hide-details thumb-label="always"
              color="primary"
            />
            <span class="text-body-2 font-weight-bold" style="min-width:40px">{{ draftWork }}m</span>
          </div>

          <p class="text-caption text-medium-emphasis mb-1">Short break</p>
          <div class="d-flex align-center gap-3 mb-3">
            <v-slider
              v-model="draftShort"
              :min="1" :max="15" :step="1"
              hide-details thumb-label="always"
              color="success"
            />
            <span class="text-body-2 font-weight-bold" style="min-width:40px">{{ draftShort }}m</span>
          </div>

          <p class="text-caption text-medium-emphasis mb-1">Long break</p>
          <div class="d-flex align-center gap-3 mb-3">
            <v-slider
              v-model="draftLong"
              :min="5" :max="45" :step="5"
              hide-details thumb-label="always"
              color="info"
            />
            <span class="text-body-2 font-weight-bold" style="min-width:40px">{{ draftLong }}m</span>
          </div>

          <p class="text-caption text-medium-emphasis mb-1">Sessions before long break</p>
          <div class="d-flex align-center gap-3 mb-4">
            <v-slider
              v-model="draftSessions"
              :min="2" :max="8" :step="1"
              hide-details thumb-label="always"
              color="warning"
            />
            <span class="text-body-2 font-weight-bold" style="min-width:40px">{{ draftSessions }}</span>
          </div>

          <v-switch
            v-model="draftAutoStart"
            label="Auto-start next phase"
            color="primary"
            density="compact"
            hide-details
          />
        </v-card-text>

        <v-card-actions class="px-5 pb-5 pt-2">
          <v-btn variant="text" size="small" @click="settingsOpen = false">Cancel</v-btn>
          <v-spacer />
          <v-btn variant="flat" color="primary" size="small" @click="applySettings">Apply</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Info dialog -->
    <v-dialog v-model="infoOpen" max-width="560" scrollable>
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center justify-space-between pt-5 px-6 pb-2">
          <span class="text-h6">Use cases &amp; project fit</span>
          <v-btn icon="mdi-close" variant="text" size="small" @click="infoOpen = false" />
        </v-card-title>
        <v-card-subtitle class="px-6 pb-3 text-wrap">
          Any UI that needs a visible countdown with phase cycling and a session log benefits from this component.
        </v-card-subtitle>
        <v-divider />
        <v-card-text class="px-4 py-4">
          <div v-for="group in USECASES" :key="group.context" class="pm-uc-group">
            <div class="pm-uc-header">
              <v-icon :icon="group.icon" :color="group.color" size="16" />
              <span class="pm-uc-title">{{ group.context }}</span>
            </div>
            <ul class="pm-uc-list">
              <li v-for="item in group.items" :key="item.label">
                <span class="pm-uc-label">{{ item.label }}</span>
                <span class="pm-uc-detail">{{ item.detail }}</span>
              </li>
            </ul>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Completion snackbar -->
    <v-snackbar v-model="snackbar" :timeout="3500" location="bottom center" color="surface" rounded="lg">
      <div class="d-flex align-center gap-2">
        <v-icon icon="mdi-check-circle-outline" color="success" size="18" />
        <span class="text-body-2">{{ snackText }}</span>
      </div>
    </v-snackbar>
  </div>
</template>

<style scoped>
.pm-uc-group { margin-bottom: 20px; }
.pm-uc-group:last-child { margin-bottom: 0; }
.pm-uc-header { display: flex; align-items: center; gap: 7px; margin-bottom: 8px; padding: 0 4px; }
.pm-uc-title { font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: rgba(var(--v-theme-on-surface), .55); }
.pm-uc-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 2px; }
.pm-uc-list li { display: flex; flex-direction: column; gap: 1px; padding: 7px 10px 7px 16px; border-radius: 8px; background: rgba(var(--v-theme-on-surface), .03); border-left: 2px solid rgba(var(--v-theme-on-surface), .08); }
.pm-uc-label { font-size: 12px; font-weight: 600; color: rgb(var(--v-theme-on-surface)); line-height: 1.4; }
.pm-uc-detail { font-size: 11px; color: rgba(var(--v-theme-on-surface), .5); line-height: 1.5; }
</style>
