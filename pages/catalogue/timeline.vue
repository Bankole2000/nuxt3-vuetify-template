<script setup lang="ts">
definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Timeline', disabled: true },
  ],
})

const activityEvents = [
  {
    id: 1,
    icon: 'mdi-account-plus-outline',
    color: 'primary',
    title: 'New user registered',
    subtitle: 'alice@example.com joined the workspace',
    time: '2 min ago',
  },
  {
    id: 2,
    icon: 'mdi-rocket-launch-outline',
    color: 'success',
    title: 'Deployment complete',
    subtitle: 'v2.4.1 deployed to production',
    time: '18 min ago',
  },
  {
    id: 3,
    icon: 'mdi-alert-circle-outline',
    color: 'error',
    title: 'Build failed',
    subtitle: 'CI pipeline failed on step "run tests"',
    time: '1 hr ago',
  },
  {
    id: 4,
    icon: 'mdi-comment-text-outline',
    color: 'info',
    title: 'New comment on PR #142',
    subtitle: '"Looks good, merging."',
    time: '3 hr ago',
  },
  {
    id: 5,
    icon: 'mdi-lock-reset',
    color: 'warning',
    title: 'Password reset requested',
    subtitle: 'bob@example.com requested a reset link',
    time: 'Yesterday',
  },
]

const orderEvents = [
  { status: 'Order placed', detail: 'Order #8821 confirmed', date: 'Mon 2 Jun, 09:14', done: true },
  { status: 'Payment received', detail: 'Visa •••• 4242', date: 'Mon 2 Jun, 09:15', done: true },
  { status: 'Processing', detail: 'Items being picked & packed', date: 'Tue 3 Jun, 11:00', done: true },
  { status: 'Dispatched', detail: 'Royal Mail Tracked 48', date: 'Wed 4 Jun, 08:30', done: false },
  { status: 'Out for delivery', detail: 'Estimated between 10am – 2pm', date: 'Thu 5 Jun', done: false },
  { status: 'Delivered', detail: '', date: '', done: false },
]

const releaseEvents = [
  {
    version: 'v3.0.0',
    date: 'June 2024',
    tag: 'Major',
    tagColor: 'error',
    changes: ['Breaking: removed legacy auth endpoint', 'New drag-and-drop file upload', 'Vuetify 4 upgrade'],
  },
  {
    version: 'v2.5.0',
    date: 'March 2024',
    tag: 'Minor',
    tagColor: 'primary',
    changes: ['Command palette (⌘K)', 'Virtual scroll for large datasets', 'Dark mode persistence'],
  },
  {
    version: 'v2.4.1',
    date: 'January 2024',
    tag: 'Patch',
    tagColor: 'success',
    changes: ['Fixed breadcrumb auto-generation on dynamic routes', 'Improved skeleton loader timing'],
  },
  {
    version: 'v2.4.0',
    date: 'December 2023',
    tag: 'Minor',
    tagColor: 'primary',
    changes: ['Geolocation + Leaflet map', 'OSRM routing integration', 'TSP route optimizer'],
  },
]

const side = ref<'start' | 'end' | 'alternating'>('alternating')
const dense = ref(false)

const roadmapItems = [
  { quarter: 'Q1 2024', label: 'Foundation', icon: 'mdi-flag-outline', color: 'success', done: true, items: ['Auth flow', 'Layout system', 'Dark mode'] },
  { quarter: 'Q2 2024', label: 'Data layer', icon: 'mdi-database-outline', color: 'success', done: true, items: ['REST composables', 'Pagination', 'WebSocket'] },
  { quarter: 'Q3 2024', label: 'Rich UI', icon: 'mdi-palette-outline', color: 'primary', done: false, items: ['Rich text editor', 'Geolocation', 'Virtual scroll'] },
  { quarter: 'Q4 2024', label: 'Polish', icon: 'mdi-star-outline', color: 'warning', done: false, items: ['Accessibility audit', 'E2E tests', 'Docs site'] },
]

const pipelineSteps = [
  { label: 'Source', icon: 'mdi-source-branch', color: 'default', status: 'passed' },
  { label: 'Install', icon: 'mdi-package-down', color: 'success', status: 'passed' },
  { label: 'Lint', icon: 'mdi-check-all', color: 'success', status: 'passed' },
  { label: 'Test', icon: 'mdi-test-tube', color: 'error', status: 'failed' },
  { label: 'Build', icon: 'mdi-hammer-wrench', color: 'default', status: 'skipped' },
  { label: 'Deploy', icon: 'mdi-rocket-launch-outline', color: 'default', status: 'skipped' },
]

const statusColor: Record<string, string> = { passed: 'success', failed: 'error', skipped: 'default' }
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">Timeline</h1>
    <p class="text-body-2 text-medium-emphasis mb-8">
      Vuetify's <code>v-timeline</code> in several real-world configurations: activity feed, order tracking and a
      release changelog. Side and density are configurable.
    </p>

    <!-- Activity feed -->
    <h2 class="text-overline text-medium-emphasis mb-4">Activity feed</h2>
    <v-card rounded="lg" class="mb-2 pa-2">
      <div class="d-flex gap-3 mb-4 px-3 pt-3 flex-wrap align-center">
        <v-btn-toggle v-model="side" density="compact" variant="outlined" divided mandatory>
          <v-btn value="start" size="small">Left</v-btn>
          <v-btn value="alternating" size="small">Alternating</v-btn>
          <v-btn value="end" size="small">Right</v-btn>
        </v-btn-toggle>
        <v-switch v-model="dense" label="Compact" density="compact" hide-details color="primary" />
      </div>

      <v-timeline :side="side" :density="dense ? 'compact' : 'default'" class="pa-2">
        <v-timeline-item
          v-for="event in activityEvents"
          :key="event.id"
          :dot-color="event.color"
          size="small"
        >
          <template #icon>
            <v-icon :icon="event.icon" size="16" />
          </template>
          <v-card rounded="lg" elevation="0" border>
            <v-card-text class="pa-3">
              <div class="d-flex align-center justify-space-between gap-2 mb-1">
                <span class="text-body-2 font-weight-bold">{{ event.title }}</span>
                <span class="text-caption text-medium-emphasis flex-shrink-0">{{ event.time }}</span>
              </div>
              <p class="text-body-2 text-medium-emphasis mb-0">{{ event.subtitle }}</p>
            </v-card-text>
          </v-card>
        </v-timeline-item>
      </v-timeline>
    </v-card>

    <!-- Order tracking -->
    <h2 class="text-overline text-medium-emphasis mt-8 mb-4">Order tracking</h2>
    <v-card rounded="lg" class="mb-2 pa-5">
      <v-timeline side="end" density="compact" truncate-line="both">
        <v-timeline-item
          v-for="(step, i) in orderEvents"
          :key="i"
          :dot-color="step.done ? 'success' : 'default'"
          size="x-small"
        >
          <template #icon>
            <v-icon
              :icon="step.done ? 'mdi-check' : 'mdi-circle-outline'"
              size="12"
              :color="step.done ? 'white' : 'medium-emphasis'"
            />
          </template>
          <div class="d-flex align-baseline gap-3">
            <div>
              <p :class="['text-body-2 font-weight-bold', !step.done && 'text-medium-emphasis']">
                {{ step.status }}
              </p>
              <p v-if="step.detail" class="text-caption text-medium-emphasis mb-0">{{ step.detail }}</p>
            </div>
            <p v-if="step.date" class="text-caption text-disabled ml-auto flex-shrink-0">{{ step.date }}</p>
          </div>
        </v-timeline-item>
      </v-timeline>
    </v-card>

    <!-- Release changelog -->
    <h2 class="text-overline text-medium-emphasis mt-8 mb-4">Release changelog</h2>
    <v-card rounded="lg" class="mb-2 pa-2">
      <v-timeline side="end" density="compact" truncate-line="start">
        <v-timeline-item
          v-for="release in releaseEvents"
          :key="release.version"
          size="small"
          :dot-color="release.tagColor"
        >
          <template #opposite>
            <div class="text-right">
              <span class="text-body-2 font-weight-bold">{{ release.version }}</span><br>
              <span class="text-caption text-medium-emphasis">{{ release.date }}</span>
            </div>
          </template>

          <v-card rounded="lg" elevation="0" border class="mb-2">
            <v-card-text class="pa-3">
              <div class="d-flex align-center gap-2 mb-2">
                <span class="text-body-2 font-weight-bold">{{ release.version }}</span>
                <v-chip :color="release.tagColor" size="x-small" variant="tonal">{{ release.tag }}</v-chip>
                <span class="text-caption text-medium-emphasis ml-auto">{{ release.date }}</span>
              </div>
              <ul class="pl-4 mb-0">
                <li v-for="(change, ci) in release.changes" :key="ci" class="text-body-2 text-medium-emphasis">
                  {{ change }}
                </li>
              </ul>
            </v-card-text>
          </v-card>
        </v-timeline-item>
      </v-timeline>
    </v-card>

    <!-- Horizontal: product roadmap -->
    <h2 class="text-overline text-medium-emphasis mt-8 mb-4">Horizontal — product roadmap</h2>
    <v-card rounded="lg" class="mb-2 pa-4 overflow-x-auto">
      <v-timeline direction="horizontal" truncate-line="both" side="end">
        <v-timeline-item
          v-for="item in roadmapItems"
          :key="item.quarter"
          :dot-color="item.done ? item.color : 'surface-variant'"
          size="small"
          width="200"
        >
          <template #icon>
            <v-icon
              :icon="item.icon"
              size="14"
              :color="item.done ? 'white' : 'medium-emphasis'"
            />
          </template>
          <template #opposite>
            <span class="text-caption text-medium-emphasis">{{ item.quarter }}</span>
          </template>
          <div class="pb-2">
            <p class="text-body-2 font-weight-bold mb-1">{{ item.label }}</p>
            <p
              v-for="(li, i) in item.items"
              :key="i"
              class="text-caption text-medium-emphasis mb-0"
            >
              {{ li }}
            </p>
          </div>
        </v-timeline-item>
      </v-timeline>
    </v-card>

    <!-- Horizontal: CI pipeline status -->
    <h2 class="text-overline text-medium-emphasis mt-8 mb-4">Horizontal — CI pipeline</h2>
    <v-card rounded="lg" class="mb-2 pa-4 overflow-x-auto">
      <v-timeline direction="horizontal" truncate-line="both" density="compact" side="end">
        <v-timeline-item
          v-for="step in pipelineSteps"
          :key="step.label"
          :dot-color="statusColor[step.status]"
          size="x-small"
        >
          <template #icon>
            <v-icon :icon="step.icon" size="12" :color="step.status === 'skipped' ? 'medium-emphasis' : 'white'" />
          </template>
          <div class="text-center pb-1" style="min-width: 72px;">
            <p class="text-body-2 font-weight-bold mb-0">{{ step.label }}</p>
            <v-chip
              :color="statusColor[step.status]"
              size="x-small"
              variant="tonal"
              class="mt-1"
            >
              {{ step.status }}
            </v-chip>
          </div>
        </v-timeline-item>
      </v-timeline>
    </v-card>

    <!-- Usage -->
    <h2 class="text-overline text-medium-emphasis mt-8 mb-4">Usage</h2>
    <v-card rounded="lg" class="pa-5">
      <v-sheet rounded="lg" color="surface-variant" class="pa-4">
        <pre v-pre class="text-body-2"><code>&lt;v-timeline side="end" density="compact"&gt;
  &lt;v-timeline-item
    v-for="event in events"
    :key="event.id"
    :dot-color="event.color"
    size="small"
  &gt;
    &lt;template #icon&gt;
      &lt;v-icon :icon="event.icon" size="16" /&gt;
    &lt;/template&gt;

    &lt;v-card rounded="lg" elevation="0" border&gt;
      &lt;v-card-text class="pa-3"&gt;
        {{ event.title }}
      &lt;/v-card-text&gt;
    &lt;/v-card&gt;
  &lt;/v-timeline-item&gt;
&lt;/v-timeline&gt;</code></pre>
      </v-sheet>
      <div class="d-flex flex-wrap gap-4 mt-4 text-caption text-medium-emphasis">
        <span><code>direction</code>: vertical (default) | horizontal</span>
        <span><code>side</code>: start | end | alternating</span>
        <span><code>density</code>: default | compact</span>
        <span><code>truncate-line</code>: start | end | both</span>
        <span><code>size</code>: x-small | small | default | large | x-large</span>
      </div>
    </v-card>
  </div>
</template>
