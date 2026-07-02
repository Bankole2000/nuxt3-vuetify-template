<script setup lang="ts">
import type { TourStep } from '~/components/common/OnboardingTour.vue'

definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Onboarding Tour', disabled: true },
  ],
})

const toast = useToast()
const tourActive = ref(false)

const steps: TourStep[] = [
  {
    target: '#tour-step-1',
    title: 'Welcome to the dashboard',
    description: 'This is your main workspace. Everything you need is accessible from here.',
    placement: 'bottom',
  },
  {
    target: '#tour-step-2',
    title: 'Navigation',
    description: 'Use the sidebar to jump between sections. It collapses on smaller screens.',
    placement: 'right',
  },
  {
    target: '#tour-step-3',
    title: 'Quick stats',
    description: 'These cards give you a real-time overview of your key metrics.',
    placement: 'bottom',
  },
  {
    target: '#tour-step-4',
    title: 'Actions',
    description: 'Use these buttons to create new items or export your data.',
    placement: 'top',
  },
]

const onFinish = () => toast.success('Tour complete! You\'re all set.')
const onSkip = () => toast.info('Tour skipped. You can restart it anytime.')
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">Onboarding Tour</h1>
    <p class="text-body-2 text-medium-emphasis mb-8">
      Step-by-step spotlight overlay that highlights any element by CSS selector.
      Teleports to <code>body</code> so it works across layouts. Press Escape or click the backdrop to skip.
    </p>

    <!-- Fake UI to tour -->
    <v-card rounded="lg" class="pa-5 mb-6">
      <!-- Fake header -->
      <div id="tour-step-1" class="d-flex align-center gap-3 mb-6 pa-3 rounded-lg" style="border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));">
        <v-icon icon="mdi-view-dashboard-outline" color="primary" />
        <span class="text-body-1 font-weight-bold">My Dashboard</span>
        <v-spacer />
        <v-avatar size="32" color="primary" variant="tonal">
          <span class="text-caption font-weight-bold">JD</span>
        </v-avatar>
      </div>

      <v-row class="mb-4">
        <!-- Fake nav -->
        <v-col cols="12" sm="3">
          <div id="tour-step-2" class="d-flex flex-column gap-1 pa-2 rounded-lg" style="border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));">
            <div v-for="item in ['Overview', 'Projects', 'Team', 'Settings']" :key="item" class="px-3 py-2 rounded text-body-2 text-medium-emphasis cursor-pointer">
              {{ item }}
            </div>
          </div>
        </v-col>

        <!-- Fake stats -->
        <v-col cols="12" sm="9">
          <div id="tour-step-3" class="d-flex gap-3 flex-wrap mb-4">
            <v-sheet
              v-for="stat in [{ label: 'Projects', val: '12' }, { label: 'Tasks', val: '84' }, { label: 'Team', val: '6' }]"
              :key="stat.label"
              rounded="lg"
              border
              class="pa-4 flex-1"
              style="min-width: 100px;"
            >
              <p class="text-h5 font-weight-black mb-0">{{ stat.val }}</p>
              <p class="text-caption text-medium-emphasis mb-0">{{ stat.label }}</p>
            </v-sheet>
          </div>

          <!-- Fake actions -->
          <div id="tour-step-4" class="d-flex gap-2">
            <v-btn color="primary" variant="tonal" prepend-icon="mdi-plus" size="small">New project</v-btn>
            <v-btn variant="outlined" prepend-icon="mdi-download-outline" size="small">Export</v-btn>
          </div>
        </v-col>
      </v-row>

      <div class="d-flex justify-center pt-2">
        <v-btn color="primary" prepend-icon="mdi-compass-outline" @click="tourActive = true">
          Start tour
        </v-btn>
      </div>
    </v-card>

    <CommonOnboardingTour
      v-model="tourActive"
      :steps="steps"
      @finish="onFinish"
      @skip="onSkip"
    />

    <h2 class="text-overline text-medium-emphasis mb-4">Usage</h2>
    <v-card rounded="lg" class="pa-5">
      <v-sheet rounded="lg" color="surface-variant" class="pa-4">
        <pre v-pre class="text-body-2"><code>const tourActive = ref(false)

const steps = [
  {
    target: '#my-element',     // any CSS selector
    title: 'Step title',
    description: 'Explanation of this feature.',
    placement: 'bottom',       // top | bottom | left | right
  },
]

// Template:
&lt;v-btn @click="tourActive = true"&gt;Start tour&lt;/v-btn&gt;

&lt;CommonOnboardingTour
  v-model="tourActive"
  :steps="steps"
  @finish="onFinish"
  @skip="onSkip"
/&gt;</code></pre>
      </v-sheet>
    </v-card>
  </div>
</template>
