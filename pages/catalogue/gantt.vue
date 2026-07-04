<script setup lang="ts">
import type { GanttTask, GanttGroup } from '~/components/common/GanttChart.vue'

definePageMeta({ layout: 'catalogue' })
useSeo({ title: 'Gantt Chart', description: 'Interactive Gantt chart with drag-to-reschedule, resize bars, dependency arrows, milestones, progress bars, zoom levels and grouped rows.' })

const tab      = ref('roadmap')
const infoOpen = ref(false)
const toast    = ref<{ show: boolean; text: string }>({ show: false, text: '' })

const notify = (text: string) => {
  toast.value = { show: true, text }
  setTimeout(() => { toast.value.show = false }, 2500)
}

const USECASES = [
  {
    context: 'General UI patterns',
    icon: 'mdi-chart-gantt',
    color: 'primary',
    items: [
      { label: 'Project timeline', detail: 'Classic use — phases, tasks, milestones laid out across weeks or months with drag-to-reschedule.' },
      { label: 'Release planning', detail: 'Features mapped to sprints; dependency arrows prevent shipping blocked work first.' },
      { label: 'Resource allocation', detail: 'One row per person; bars show what they\'re assigned to and when, making overloads visible.' },
      { label: 'Campaign calendar', detail: 'Marketing activities (email, social, events) laid out on a shared timeline to spot conflicts.' },
    ],
  },
  {
    context: 'Roadmap Builder (#2)',
    icon: 'mdi-map-outline',
    color: 'blue',
    items: [
      { label: 'Core view', detail: 'The Gantt IS the roadmap. Epics as groups, stories as bars, dependency arrows enforce ordering.' },
      { label: 'Milestone tracking', detail: 'Diamond markers for release dates, go-live events, and external deadlines.' },
      { label: 'Drag-to-reschedule', detail: 'PMs drag bars to adjust dates; emitted update-task events persist changes to the backend.' },
    ],
  },
  {
    context: 'Portfolio Manager (#1)',
    icon: 'mdi-briefcase-outline',
    color: 'teal',
    items: [
      { label: 'Cross-project timeline', detail: 'One row per project; bars span the full project window. Useful for spotting capacity conflicts across the portfolio.' },
      { label: 'Phase planning', detail: 'Grouped rows: each project expands to show its phases and key milestones.' },
    ],
  },
  {
    context: 'Workflow Engine (#3)',
    icon: 'mdi-vector-polyline',
    color: 'purple',
    items: [
      { label: 'Pipeline run timeline', detail: 'Each stage is a bar; duration and start time come from the run logs. Dependency arrows show the execution order.' },
      { label: 'Scheduled job calendar', detail: 'Recurring jobs placed across the week/month — overlaps surface resource contention.' },
    ],
  },
  {
    context: 'Guest Arrangements (#7)',
    icon: 'mdi-account-group-outline',
    color: 'pink',
    items: [
      { label: 'Event schedule', detail: 'One row per venue space or time slot; bars show booked activities. Great for weddings, conferences, multi-day events.' },
      { label: 'Supplier / vendor schedule', detail: 'Caterers, photographers, AV crew — each has a row showing their contracted hours.' },
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// 1. SOFTWARE ROADMAP
// ─────────────────────────────────────────────────────────────────────────────

const roadmapGroups = ref<GanttGroup[]>([
  { id: 'planning',  label: 'Planning',  color: '#6366f1' },
  { id: 'design',    label: 'Design',    color: '#ec4899' },
  { id: 'dev',       label: 'Development', color: '#3b82f6' },
  { id: 'qa',        label: 'QA & Release', color: '#10b981' },
])

const roadmapTasks = ref<GanttTask[]>([
  // Planning
  { id: 'kickoff',    label: 'Kickoff',           start: '2025-01-06', end: '2025-01-10', color: '#6366f1', group: 'planning', progress: 100 },
  { id: 'spec',       label: 'Requirements spec',  start: '2025-01-10', end: '2025-01-24', color: '#6366f1', group: 'planning', progress: 100, dependsOn: ['kickoff'] },
  { id: 'arch',       label: 'Architecture design', start: '2025-01-20', end: '2025-02-07', color: '#6366f1', group: 'planning', progress: 80,  dependsOn: ['spec'] },
  // Design
  { id: 'wireframes', label: 'Wireframes',         start: '2025-01-24', end: '2025-02-07', color: '#ec4899', group: 'design',   progress: 100, dependsOn: ['spec'] },
  { id: 'prototypes', label: 'Interactive prototypes', start: '2025-02-07', end: '2025-02-21', color: '#ec4899', group: 'design', progress: 60, dependsOn: ['wireframes'] },
  { id: 'ds',         label: 'Design system',      start: '2025-02-14', end: '2025-03-07', color: '#ec4899', group: 'design',   progress: 30,  dependsOn: ['wireframes'] },
  // Dev
  { id: 'auth',       label: 'Auth & onboarding',  start: '2025-02-10', end: '2025-02-28', color: '#3b82f6', group: 'dev',      progress: 100, dependsOn: ['arch'] },
  { id: 'core',       label: 'Core features',       start: '2025-03-03', end: '2025-04-11', color: '#3b82f6', group: 'dev',      progress: 50,  dependsOn: ['auth', 'prototypes'] },
  { id: 'api',        label: 'API integration',     start: '2025-03-17', end: '2025-04-11', color: '#3b82f6', group: 'dev',      progress: 20,  dependsOn: ['auth'] },
  { id: 'perf',       label: 'Performance',         start: '2025-04-07', end: '2025-04-25', color: '#3b82f6', group: 'dev',      progress: 0,   dependsOn: ['core'] },
  // QA
  { id: 'uat',        label: 'UAT',                 start: '2025-04-14', end: '2025-04-28', color: '#10b981', group: 'qa',       progress: 0,   dependsOn: ['core', 'api'] },
  { id: 'bugfix',     label: 'Bug fixes',           start: '2025-04-25', end: '2025-05-09', color: '#10b981', group: 'qa',       progress: 0,   dependsOn: ['uat'] },
  { id: 'v1launch',   label: 'v1.0 Launch',         start: '2025-05-12', end: '2025-05-12', color: '#f59e0b', group: 'qa',       milestone: true, dependsOn: ['bugfix'] },
])

const roadmapSelected = ref<string | null>(null)

const roadmapUpdate = (id: string, start: string, end: string) => {
  roadmapTasks.value = roadmapTasks.value.map(t =>
    t.id === id ? { ...t, start, end } : t
  )
  notify(`Updated: ${roadmapTasks.value.find(t => t.id === id)?.label} → ${start} – ${end}`)
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. CONSTRUCTION / EVENT SCHEDULE
// ─────────────────────────────────────────────────────────────────────────────

const eventGroups = ref<GanttGroup[]>([
  { id: 'venue',     label: 'Venue',       color: '#8b5cf6' },
  { id: 'catering',  label: 'Catering',    color: '#f97316' },
  { id: 'av',        label: 'A/V & Tech',  color: '#06b6d4' },
  { id: 'guests',    label: 'Guest Flow',  color: '#10b981' },
])

const eventTasks = ref<GanttTask[]>([
  { id: 'venue-setup',    label: 'Venue setup',       start: '2025-06-14', end: '2025-06-15', color: '#8b5cf6', group: 'venue' },
  { id: 'decor',          label: 'Decoration',        start: '2025-06-15', end: '2025-06-16', color: '#8b5cf6', group: 'venue',   dependsOn: ['venue-setup'] },
  { id: 'rehearsal',      label: 'Rehearsal',         start: '2025-06-13', end: '2025-06-14', color: '#8b5cf6', group: 'venue' },
  { id: 'kitchen-prep',   label: 'Kitchen prep',      start: '2025-06-15', end: '2025-06-16', color: '#f97316', group: 'catering' },
  { id: 'cocktail-hour',  label: 'Cocktail hour',     start: '2025-06-16', end: '2025-06-17', color: '#f97316', group: 'catering', dependsOn: ['kitchen-prep'] },
  { id: 'dinner',         label: 'Dinner service',    start: '2025-06-17', end: '2025-06-18', color: '#f97316', group: 'catering', dependsOn: ['cocktail-hour'] },
  { id: 'av-rig',         label: 'AV rig & test',     start: '2025-06-14', end: '2025-06-16', color: '#06b6d4', group: 'av' },
  { id: 'livestream',     label: 'Livestream setup',  start: '2025-06-15', end: '2025-06-16', color: '#06b6d4', group: 'av',     dependsOn: ['av-rig'] },
  { id: 'arrivals',       label: 'Guest arrivals',    start: '2025-06-16', end: '2025-06-17', color: '#10b981', group: 'guests', dependsOn: ['decor', 'av-rig'] },
  { id: 'ceremony',       label: 'Ceremony',          start: '2025-06-17', end: '2025-06-17', color: '#f59e0b', group: 'guests', milestone: true },
  { id: 'reception',      label: 'Reception',         start: '2025-06-17', end: '2025-06-18', color: '#10b981', group: 'guests', dependsOn: ['ceremony'] },
])

const eventUpdate = (id: string, start: string, end: string) => {
  eventTasks.value = eventTasks.value.map(t =>
    t.id === id ? { ...t, start, end } : t
  )
  notify(`Rescheduled: ${eventTasks.value.find(t => t.id === id)?.label}`)
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. PORTFOLIO — CROSS-PROJECT VIEW
// ─────────────────────────────────────────────────────────────────────────────

const portfolioTasks = ref<GanttTask[]>([
  { id: 'pm',   label: 'Portfolio Manager',       start: '2025-01-01', end: '2025-06-30', color: '#6366f1', progress: 45,  group: 'active' },
  { id: 'rb',   label: 'Roadmap Builder',         start: '2025-03-01', end: '2025-08-31', color: '#3b82f6', progress: 10,  group: 'active' },
  { id: 'et',   label: 'Expense Tracker',         start: '2025-04-01', end: '2025-07-31', color: '#10b981', progress: 0,   group: 'active' },
  { id: 'heam', label: 'HEAM',                    start: '2025-05-01', end: '2025-10-31', color: '#ef4444', progress: 0,   group: 'planned' },
  { id: 'ft',   label: 'Family Tree',             start: '2025-06-01', end: '2025-09-30', color: '#8b5cf6', progress: 0,   group: 'planned' },
  { id: 'vc',   label: 'Verifiable Contracts',    start: '2025-07-01', end: '2025-12-31', color: '#f59e0b', progress: 0,   group: 'planned' },
  { id: 'dc',   label: 'Document Converter',      start: '2025-08-01', end: '2025-11-30', color: '#f97316', progress: 0,   group: 'planned' },
  { id: 'pomo', label: 'Pomodoro',                start: '2025-09-01', end: '2025-10-31', color: '#ec4899', progress: 0,   group: 'planned' },
  // Milestones
  { id: 'ms-q2', label: 'Q2 review',   start: '2025-06-30', end: '2025-06-30', color: '#6366f1', milestone: true },
  { id: 'ms-q3', label: 'Q3 review',   start: '2025-09-30', end: '2025-09-30', color: '#6366f1', milestone: true },
  { id: 'ms-q4', label: 'Year-end',    start: '2025-12-31', end: '2025-12-31', color: '#f59e0b', milestone: true },
])

const portfolioGroups = ref<GanttGroup[]>([
  { id: 'active',  label: 'Active',  color: '#10b981' },
  { id: 'planned', label: 'Planned', color: '#6366f1' },
])

const portfolioUpdate = (id: string, start: string, end: string) => {
  portfolioTasks.value = portfolioTasks.value.map(t =>
    t.id === id ? { ...t, start, end } : t
  )
  notify(`Updated: ${portfolioTasks.value.find(t => t.id === id)?.label}`)
}
</script>

<template>
  <div>
    <div class="d-flex align-start justify-space-between gap-4 mb-1">
      <h1 class="text-h5 font-weight-bold">Gantt Chart</h1>
      <v-btn icon="mdi-information-outline" variant="text" size="small" @click="infoOpen = true" />
    </div>
    <p class="text-body-2 text-medium-emphasis mb-5">
      Interactive timeline with drag-to-reschedule, resize bars, dependency arrows, milestones,
      progress bars, grouped rows, and day/week/month zoom. Ctrl+scroll also changes zoom level.
    </p>

    <!-- Info dialog -->
    <v-dialog v-model="infoOpen" max-width="560" scrollable>
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center justify-space-between pt-5 px-6 pb-2">
          <span class="text-h6">Use cases &amp; project fit</span>
          <v-btn icon="mdi-close" variant="text" size="small" @click="infoOpen = false" />
        </v-card-title>
        <v-card-subtitle class="px-6 pb-3 text-wrap">
          Any work that has a start date, an end date, and depends on other work fits a Gantt.
        </v-card-subtitle>
        <v-divider />
        <v-card-text class="px-4 py-4">
          <div v-for="group in USECASES" :key="group.context" class="gp-uc-group">
            <div class="gp-uc-header">
              <v-icon :icon="group.icon" :color="group.color" size="16" />
              <span class="gp-uc-title">{{ group.context }}</span>
            </div>
            <ul class="gp-uc-list">
              <li v-for="item in group.items" :key="item.label">
                <span class="gp-uc-label">{{ item.label }}</span>
                <span class="gp-uc-detail">{{ item.detail }}</span>
              </li>
            </ul>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Toast -->
    <v-snackbar v-model="toast.show" :timeout="2500" location="bottom right" color="surface" rounded="lg">
      <span class="text-body-2">{{ toast.text }}</span>
    </v-snackbar>

    <v-tabs v-model="tab" density="compact" class="mb-5">
      <v-tab value="roadmap">
        <v-icon start icon="mdi-rocket-launch-outline" size="16" />
        Software Roadmap
      </v-tab>
      <v-tab value="event">
        <v-icon start icon="mdi-calendar-star" size="16" />
        Event Schedule
      </v-tab>
      <v-tab value="portfolio">
        <v-icon start icon="mdi-briefcase-outline" size="16" />
        Portfolio View
      </v-tab>
    </v-tabs>

    <v-window v-model="tab">

      <!-- ── Software roadmap ───────────────────────────────────────────────── -->
      <v-window-item value="roadmap">
        <p class="text-caption text-medium-emphasis mb-3">
          Grouped by phase. Drag bars to reschedule, drag the right edge to extend.
          Dashed arrows show finish-to-start dependencies. Progress overlays show completion.
          The yellow diamond is the v1.0 milestone.
        </p>
        <CommonGanttChart
            :tasks="roadmapTasks"
            :groups="roadmapGroups"
            zoom="week"
            :label-width="200"
            :row-height="38"
            @select-task="roadmapSelected = $event"
            @update-task="roadmapUpdate"
          >
            <template #toolbar-left>
              <div class="d-flex align-center gap-2">
                <v-icon icon="mdi-rocket-launch-outline" size="16" color="primary" />
                <span class="text-body-2 font-weight-bold">Product v1.0 Roadmap</span>
                <v-chip v-if="roadmapSelected" size="x-small" color="primary" variant="tonal" closable @click:close="roadmapSelected = null">
                  {{ roadmapTasks.find(t => t.id === roadmapSelected)?.label }}
                </v-chip>
              </div>
            </template>
        </CommonGanttChart>
        <p class="text-caption text-medium-emphasis mt-3">Use case: Roadmap Builder · Portfolio Manager</p>
      </v-window-item>

      <!-- ── Event schedule ─────────────────────────────────────────────────── -->
      <v-window-item value="event">
        <p class="text-caption text-medium-emphasis mb-3">
          Day-level zoom for a multi-day event. Rows grouped by team. Drag bars to reschedule
          supplier slots. The ceremony diamond marks the fixed event time.
        </p>
        <CommonGanttChart
            :tasks="eventTasks"
            :groups="eventGroups"
            zoom="day"
            :label-width="180"
            :row-height="38"
            @update-task="eventUpdate"
          >
            <template #toolbar-left>
              <div class="d-flex align-center gap-2">
                <v-icon icon="mdi-calendar-star" size="16" color="pink" />
                <span class="text-body-2 font-weight-bold">Wedding Weekend · June 2025</span>
              </div>
            </template>
        </CommonGanttChart>
        <p class="text-caption text-medium-emphasis mt-3">Use case: Guest Arrangements · any multi-day event coordination</p>
      </v-window-item>

      <!-- ── Portfolio view ─────────────────────────────────────────────────── -->
      <v-window-item value="portfolio">
        <p class="text-caption text-medium-emphasis mb-3">
          Month zoom — one bar per project across the full year. Active projects on top,
          planned below. Quarterly review milestones in indigo, year-end in amber.
          Drag to adjust a project's window.
        </p>
        <CommonGanttChart
            :tasks="portfolioTasks"
            :groups="portfolioGroups"
            zoom="month"
            :label-width="220"
            :row-height="38"
            :show-deps="false"
            @update-task="portfolioUpdate"
          >
            <template #toolbar-left>
              <div class="d-flex align-center gap-2">
                <v-icon icon="mdi-briefcase-outline" size="16" color="teal" />
                <span class="text-body-2 font-weight-bold">Project Portfolio · 2025</span>
              </div>
            </template>
        </CommonGanttChart>
        <p class="text-caption text-medium-emphasis mt-3">Use case: Portfolio Manager · cross-team planning</p>
      </v-window-item>

    </v-window>
  </div>
</template>

<style scoped>
.gp-uc-group { margin-bottom: 20px; }
.gp-uc-group:last-child { margin-bottom: 0; }
.gp-uc-header { display: flex; align-items: center; gap: 7px; margin-bottom: 8px; padding: 0 4px; }
.gp-uc-title { font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: rgba(var(--v-theme-on-surface), .55); }
.gp-uc-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 2px; }
.gp-uc-list li { display: flex; flex-direction: column; gap: 1px; padding: 7px 10px 7px 16px; border-radius: 8px; background: rgba(var(--v-theme-on-surface), .03); border-left: 2px solid rgba(var(--v-theme-on-surface), .08); }
.gp-uc-label { font-size: 12px; font-weight: 600; color: rgb(var(--v-theme-on-surface)); line-height: 1.4; }
.gp-uc-detail { font-size: 11px; color: rgba(var(--v-theme-on-surface), .5); line-height: 1.5; }
</style>
