<script setup lang="ts">
import type { KpiMetric } from '~/components/common/KpiDashboard.vue'

definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'KPI Dashboard', disabled: true },
  ],
})

useSeo({ title: 'KPI Dashboard', description: 'Stat cards with sparklines, % change badges, target progress bars and trend indicators — configurable grid layout.' })

const tab      = ref('saas')
const infoOpen = ref(false)

const USECASES = [
  {
    context: 'Portfolio Manager (#1)',
    icon: 'mdi-briefcase-outline',
    color: 'teal',
    items: [
      { label: 'Portfolio health overview', detail: 'Top row shows active projects, tasks completed, team velocity and budget burn — all with sparklines to catch trends early.' },
      { label: 'Risk indicators', detail: 'Incidents and overdue tasks displayed as negative-trend metrics; % change vs last sprint highlights spikes.' },
      { label: 'Cross-project KPIs', detail: 'Aggregate metrics across all projects: total tasks shipped, deploy frequency, SLA compliance.' },
    ],
  },
  {
    context: 'Roadmap Builder (#2)',
    icon: 'mdi-map-outline',
    color: 'blue',
    items: [
      { label: 'Sprint progress', detail: 'Story points completed, velocity trend, sprint burn-down rate — all from the same KPI card grid.' },
      { label: 'Feature flags & adoption', detail: 'Show roll-out % and daily active users per feature; target bar shows % to launch threshold.' },
    ],
  },
  {
    context: 'Workflow Engine (#3)',
    icon: 'mdi-vector-polyline',
    color: 'purple',
    items: [
      { label: 'Pipeline health', detail: 'Jobs run, success rate, avg duration with sparkline. % change vs yesterday surfaces regression instantly.' },
      { label: 'Queue depth & latency', detail: 'Pending jobs and P95 latency as KPIs with target bars; trend arrows show whether backlog is growing.' },
    ],
  },
  {
    context: 'Expense Tracker (#5)',
    icon: 'mdi-cash-multiple',
    color: 'success',
    items: [
      { label: 'Monthly spend overview', detail: 'Total spend, category breakdown KPIs (food, travel, software) with % change vs prior month.' },
      { label: 'Budget utilisation', detail: 'Target bar per category shows % of monthly budget used; sparkline shows daily spend trend.' },
    ],
  },
  {
    context: 'HEAM (#9)',
    icon: 'mdi-heart-pulse',
    color: 'error',
    items: [
      { label: 'Vitals at a glance', detail: 'Resting heart rate, sleep hours, steps, body weight — stat cards with 30-day sparklines and normal-range targets.' },
      { label: 'Trend monitoring', detail: '% change vs prior week lets users spot upward or downward trends without reading a full chart.' },
    ],
  },
]

// ─── SaaS Product ────────────────────────────────────────────────────────────

const saasMetrics: KpiMetric[] = [
  {
    id: 'mrr',
    label: 'Monthly Recurring Revenue',
    value: 48_320,
    prevValue: 44_100,
    unit: '£',
    unitPos: 'prefix',
    icon: 'mdi-cash-multiple',
    color: 'success',
    format: 'currency',
    sparkline: [38200, 39800, 41000, 40200, 42500, 43100, 44100, 46000, 47200, 48320],
    target: 55000,
  },
  {
    id: 'arr',
    label: 'Annual Recurring Revenue',
    value: 579_840,
    prevValue: 529_200,
    unit: '£',
    unitPos: 'prefix',
    icon: 'mdi-trending-up',
    color: 'primary',
    format: 'currency',
    sparkline: [450000, 470000, 490000, 510000, 525000, 529200, 540000, 558000, 570000, 579840],
    target: 660000,
  },
  {
    id: 'churn',
    label: 'Churn Rate',
    value: 2.4,
    prevValue: 3.1,
    unit: '%',
    unitPos: 'suffix',
    icon: 'mdi-account-minus-outline',
    color: 'warning',
    format: 'percent',
    sparkline: [4.2, 3.8, 3.5, 3.6, 3.1, 3.0, 2.8, 2.6, 2.5, 2.4],
  },
  {
    id: 'active-users',
    label: 'Active Users',
    value: 12_480,
    prevValue: 11_200,
    icon: 'mdi-account-group-outline',
    color: 'indigo',
    format: 'number',
    sparkline: [9800, 10200, 10500, 10800, 11200, 11400, 11700, 12000, 12300, 12480],
    target: 15000,
  },
  {
    id: 'nps',
    label: 'NPS Score',
    value: 58,
    prevValue: 52,
    icon: 'mdi-emoticon-happy-outline',
    color: 'teal',
    format: 'number',
    sparkline: [44, 47, 50, 48, 52, 53, 55, 56, 57, 58],
    target: 70,
  },
  {
    id: 'session-duration',
    label: 'Avg Session Duration',
    value: 312,
    prevValue: 285,
    icon: 'mdi-timer-outline',
    color: 'deep-purple',
    format: 'duration',
    sparkline: [240, 255, 270, 262, 285, 290, 298, 304, 308, 312],
  },
]

// ─── E-commerce ──────────────────────────────────────────────────────────────

const ecomMetrics: KpiMetric[] = [
  {
    id: 'revenue',
    label: 'Revenue',
    value: 134_720,
    prevValue: 119_500,
    unit: '£',
    unitPos: 'prefix',
    icon: 'mdi-currency-gbp',
    color: 'success',
    format: 'currency',
    sparkline: [98000, 105000, 112000, 108000, 119500, 122000, 125000, 128000, 132000, 134720],
    target: 150000,
  },
  {
    id: 'orders',
    label: 'Orders',
    value: 2_841,
    prevValue: 2_530,
    icon: 'mdi-package-variant-closed',
    color: 'primary',
    format: 'number',
    sparkline: [2100, 2200, 2300, 2250, 2530, 2580, 2640, 2700, 2780, 2841],
    target: 3000,
  },
  {
    id: 'aov',
    label: 'Avg Order Value',
    value: 47.42,
    prevValue: 47.22,
    unit: '£',
    unitPos: 'prefix',
    icon: 'mdi-cart-outline',
    color: 'indigo',
    format: 'currency',
    sparkline: [43.1, 44.2, 45.0, 44.8, 47.2, 46.9, 47.1, 47.3, 47.4, 47.42],
  },
  {
    id: 'conversion',
    label: 'Conversion Rate',
    value: 3.2,
    prevValue: 2.9,
    unit: '%',
    unitPos: 'suffix',
    icon: 'mdi-account-convert-outline',
    color: 'teal',
    format: 'percent',
    sparkline: [2.4, 2.5, 2.7, 2.6, 2.9, 3.0, 3.1, 3.1, 3.2, 3.2],
    target: 4.0,
  },
  {
    id: 'cart-abandon',
    label: 'Cart Abandonment',
    value: 68.4,
    prevValue: 71.2,
    unit: '%',
    unitPos: 'suffix',
    icon: 'mdi-cart-remove',
    color: 'warning',
    format: 'percent',
    sparkline: [74.1, 73.5, 72.8, 73.0, 71.2, 70.8, 70.2, 69.5, 68.9, 68.4],
  },
  {
    id: 'returns',
    label: 'Returns Rate',
    value: 4.1,
    prevValue: 4.8,
    unit: '%',
    unitPos: 'suffix',
    icon: 'mdi-keyboard-return',
    color: 'error',
    format: 'percent',
    sparkline: [6.2, 5.8, 5.5, 5.3, 4.8, 4.7, 4.5, 4.4, 4.2, 4.1],
    target: 3.0,
  },
]

// ─── Portfolio Manager ────────────────────────────────────────────────────────

const portfolioMetrics: KpiMetric[] = [
  {
    id: 'projects-active',
    label: 'Projects Active',
    value: 8,
    prevValue: 6,
    icon: 'mdi-briefcase-outline',
    color: 'indigo',
    format: 'number',
    sparkline: [4, 4, 5, 5, 6, 6, 7, 7, 8, 8],
    target: 12,
  },
  {
    id: 'tasks-completed',
    label: 'Tasks Completed',
    value: 342,
    prevValue: 298,
    icon: 'mdi-check-circle-outline',
    color: 'success',
    format: 'number',
    sparkline: [210, 230, 248, 260, 275, 290, 298, 310, 328, 342],
    target: 400,
  },
  {
    id: 'budget-used',
    label: 'Budget Used',
    value: 64.3,
    prevValue: 58.1,
    unit: '%',
    unitPos: 'suffix',
    icon: 'mdi-bank-outline',
    color: 'warning',
    format: 'percent',
    sparkline: [40.0, 44.5, 48.2, 51.0, 54.3, 58.1, 59.5, 61.0, 62.8, 64.3],
    target: 80,
  },
  {
    id: 'velocity',
    label: 'Team Velocity',
    value: 87,
    prevValue: 74,
    unit: 'pts',
    unitPos: 'suffix',
    icon: 'mdi-speedometer',
    color: 'primary',
    format: 'number',
    sparkline: [62, 65, 70, 68, 74, 75, 78, 80, 84, 87],
    target: 100,
  },
  {
    id: 'incidents',
    label: 'Incidents (30d)',
    value: 3,
    prevValue: 7,
    icon: 'mdi-alert-circle-outline',
    color: 'error',
    format: 'number',
    sparkline: [12, 10, 9, 8, 7, 6, 5, 5, 4, 3],
  },
  {
    id: 'deploy-freq',
    label: 'Deploy Frequency',
    value: 4.2,
    prevValue: 3.1,
    unit: '/wk',
    unitPos: 'suffix',
    icon: 'mdi-rocket-launch-outline',
    color: 'teal',
    format: 'number',
    sparkline: [1.5, 1.8, 2.2, 2.5, 3.1, 3.3, 3.6, 3.9, 4.0, 4.2],
    target: 5.0,
  },
]

const tabDescriptions: Record<string, string> = {
  saas: 'Tracks subscription health — MRR, ARR, churn, active users, NPS and session duration. All metrics compared against the prior month.',
  ecom: 'Revenue, order volume, average order value, conversion rate, cart abandonment and returns — the core e-commerce performance loop.',
  portfolio: 'Cross-project view: active work, task throughput, budget utilisation, team velocity, incident count and deploy cadence.',
}
</script>

<template>
  <div>
    <div class="d-flex align-start justify-space-between gap-4 mb-1">
      <h1 class="text-h5 font-weight-bold">KPI Dashboard</h1>
      <v-btn icon="mdi-information-outline" variant="text" size="small" @click="infoOpen = true" />
    </div>
    <p class="text-body-2 text-medium-emphasis mb-5">
      Reusable stat cards with hand-rolled SVG sparklines, % change badges vs a previous period, optional
      target progress bars and trend icons — all from a single <code>&lt;CommonKpiDashboard&gt;</code> component.
    </p>

    <!-- Info dialog -->
    <v-dialog v-model="infoOpen" max-width="560" scrollable>
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center justify-space-between pt-5 px-6 pb-2">
          <span class="text-h6">Use cases &amp; project fit</span>
          <v-btn icon="mdi-close" variant="text" size="small" @click="infoOpen = false" />
        </v-card-title>
        <v-card-subtitle class="px-6 pb-3 text-wrap">
          Any domain with measurable metrics tracked over time benefits from this pattern.
        </v-card-subtitle>
        <v-divider />
        <v-card-text class="px-4 py-4">
          <div v-for="group in USECASES" :key="group.context" class="kd-uc-group">
            <div class="kd-uc-header">
              <v-icon :icon="group.icon" :color="group.color" size="16" />
              <span class="kd-uc-title">{{ group.context }}</span>
            </div>
            <ul class="kd-uc-list">
              <li v-for="item in group.items" :key="item.label">
                <span class="kd-uc-label">{{ item.label }}</span>
                <span class="kd-uc-detail">{{ item.detail }}</span>
              </li>
            </ul>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-tabs v-model="tab" density="compact" class="mb-5">
      <v-tab value="saas">
        <v-icon start icon="mdi-cloud-outline" size="16" />
        SaaS Product
      </v-tab>
      <v-tab value="ecom">
        <v-icon start icon="mdi-shopping-outline" size="16" />
        E-commerce
      </v-tab>
      <v-tab value="portfolio">
        <v-icon start icon="mdi-briefcase-outline" size="16" />
        Portfolio Manager
      </v-tab>
    </v-tabs>

    <v-window v-model="tab">

      <!-- ── SaaS Product ──────────────────────────────────────────────────── -->
      <v-window-item value="saas">
        <p class="text-caption text-medium-emphasis mb-5">{{ tabDescriptions.saas }}</p>
        <CommonKpiDashboard :metrics="saasMetrics" :cols="3" />
      </v-window-item>

      <!-- ── E-commerce ────────────────────────────────────────────────────── -->
      <v-window-item value="ecom">
        <p class="text-caption text-medium-emphasis mb-5">{{ tabDescriptions.ecom }}</p>
        <CommonKpiDashboard :metrics="ecomMetrics" :cols="3" />
      </v-window-item>

      <!-- ── Portfolio Manager ─────────────────────────────────────────────── -->
      <v-window-item value="portfolio">
        <p class="text-caption text-medium-emphasis mb-5">{{ tabDescriptions.portfolio }}</p>
        <CommonKpiDashboard :metrics="portfolioMetrics" :cols="3" />
      </v-window-item>

    </v-window>

    <!-- Usage -->
    <h2 class="text-overline text-medium-emphasis mt-10 mb-4">Usage</h2>
    <v-card rounded="lg" class="pa-5">
      <v-sheet rounded="lg" color="surface-variant" class="pa-4 mb-4">
        <pre v-pre class="text-body-2"><code>&lt;CommonKpiDashboard
  :metrics="metrics"
  :cols="3"
/&gt;

// Metric shape:
// {
//   id, label, value,
//   prevValue?,  // enables % change badge
//   unit?,       // '£', '%', 'ms', etc.
//   unitPos?,    // 'prefix' | 'suffix'
//   icon?,       // mdi icon name
//   color?,      // Vuetify color or hex
//   sparkline?,  // number[] — last N data points
//   target?,     // enables progress bar
//   format?      // 'number' | 'currency' | 'percent' | 'duration'
// }</code></pre>
      </v-sheet>
      <p class="text-body-2 font-weight-bold mb-2">Props</p>
      <v-table density="compact">
        <thead>
          <tr>
            <th>Prop</th><th>Type</th><th>Default</th><th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>metrics</code></td><td>KpiMetric[]</td><td>—</td><td>Array of metric objects</td></tr>
          <tr><td><code>cols</code></td><td>number</td><td>3</td><td>Grid columns (1–4)</td></tr>
          <tr><td><code>compact</code></td><td>boolean</td><td>false</td><td>Smaller card padding and sparkline</td></tr>
        </tbody>
      </v-table>
    </v-card>
  </div>
</template>

<style scoped>
.kd-uc-group { margin-bottom: 20px; }
.kd-uc-group:last-child { margin-bottom: 0; }
.kd-uc-header { display: flex; align-items: center; gap: 7px; margin-bottom: 8px; padding: 0 4px; }
.kd-uc-title { font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: rgba(var(--v-theme-on-surface), .55); }
.kd-uc-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 2px; }
.kd-uc-list li { display: flex; flex-direction: column; gap: 1px; padding: 7px 10px 7px 16px; border-radius: 8px; background: rgba(var(--v-theme-on-surface), .03); border-left: 2px solid rgba(var(--v-theme-on-surface), .08); }
.kd-uc-label { font-size: 12px; font-weight: 600; color: rgb(var(--v-theme-on-surface)); line-height: 1.4; }
.kd-uc-detail { font-size: 11px; color: rgba(var(--v-theme-on-surface), .5); line-height: 1.5; }
</style>
