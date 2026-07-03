<script setup lang="ts">
definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Clock & Timetable', disabled: true },
  ],
})

useSeo({ title: 'Clock & Timetable', description: 'Analog clock, interactive time-wheel planner and drag-and-drop weekly timetable.' })

const clockSize = ref(220)
const showSeconds = ref(true)
const showDigital = ref(true)
</script>

<template>
  <div>
    <h1 class="text-h4 font-weight-bold mb-2">Clock &amp; Timetable</h1>
    <p class="text-body-1 text-medium-emphasis mb-8">
      Three components that build on each other — a ticking clock face, an interactive day-planner wheel, and a drag-and-drop weekly timetable.
    </p>

    <!-- ── 1. Analog Clock ── -->
    <h2 class="text-overline text-medium-emphasis mb-4">Analog clock</h2>
    <v-card rounded="lg" class="pa-6 mb-2">
      <v-row align="center">
        <v-col cols="12" md="5" class="d-flex flex-column align-center justify-center" style="gap:16px">
          <CommonAnalogClock :size="clockSize" :show-seconds="showSeconds" :show-digital="showDigital" />
        </v-col>
        <v-col cols="12" md="7">
          <p class="text-body-2 font-weight-bold mb-4">Options</p>
          <v-slider v-model="clockSize" label="Size" :min="120" :max="320" :step="8" thumb-label class="mb-2" />
          <v-switch v-model="showSeconds" label="Show second hand" density="compact" color="primary" />
          <v-switch v-model="showDigital" label="Show digital readout" density="compact" color="primary" />

          <v-divider class="my-4" />

          <p class="text-body-2 font-weight-bold mb-3">World clocks</p>
          <div class="d-flex flex-wrap gap-6">
            <div class="d-flex flex-column align-center gap-1">
              <CommonAnalogClock :size="100" :show-seconds="false" :show-digital="true" timezone="America/New_York" />
              <span class="text-caption text-medium-emphasis">New York</span>
            </div>
            <div class="d-flex flex-column align-center gap-1">
              <CommonAnalogClock :size="100" :show-seconds="false" :show-digital="true" timezone="Europe/London" />
              <span class="text-caption text-medium-emphasis">London</span>
            </div>
            <div class="d-flex flex-column align-center gap-1">
              <CommonAnalogClock :size="100" :show-seconds="false" :show-digital="true" timezone="Asia/Tokyo" />
              <span class="text-caption text-medium-emphasis">Tokyo</span>
            </div>
            <div class="d-flex flex-column align-center gap-1">
              <CommonAnalogClock :size="100" :show-seconds="false" :show-digital="true" timezone="Australia/Sydney" />
              <span class="text-caption text-medium-emphasis">Sydney</span>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card>

    <v-sheet rounded="lg" color="surface-variant" class="pa-4 mb-10">
      <pre class="text-body-2"><code v-pre>&lt;CommonAnalogClock
  :size="220"
  :show-seconds="true"
  :show-digital="true"
  timezone="Asia/Tokyo"
/&gt;</code></pre>
    </v-sheet>

    <!-- ── 2. Time Wheel ── -->
    <h2 class="text-overline text-medium-emphasis mb-2">Time wheel</h2>
    <p class="text-body-2 text-medium-emphasis mb-4">
      Concentric AM/PM donut rings over the clock face. Drag the edge handles to resize blocks, click a label to rename it, or add new blocks from the panel.
    </p>
    <v-card rounded="lg" class="pa-6 mb-2">
      <CommonTimeWheel />
    </v-card>

    <v-sheet rounded="lg" color="surface-variant" class="pa-4 mb-10">
      <pre class="text-body-2"><code v-pre>&lt;CommonTimeWheel /&gt;</code></pre>
    </v-sheet>

    <!-- ── 3. Time Wheel Large ── -->
    <h2 class="text-overline text-medium-emphasis mb-2">Time wheel — large face</h2>
    <p class="text-body-2 text-medium-emphasis mb-4">
      A larger clock face with all 60 second/minute tick marks and hour numerals visible. The AM/PM rings are thin colour bands with no inside text. Toggle the drag handles on or off.
    </p>
    <v-card rounded="lg" class="pa-6 mb-2">
      <CommonTimeWheelLarge />
    </v-card>

    <v-sheet rounded="lg" color="surface-variant" class="pa-4 mb-10">
      <pre class="text-body-2"><code v-pre>&lt;CommonTimeWheelLarge /&gt;</code></pre>
    </v-sheet>

    <!-- ── 4. Timetable ── -->
    <h2 class="text-overline text-medium-emphasis mb-2">Weekly timetable</h2>
    <p class="text-body-2 text-medium-emphasis mb-4">
      Drag tasks between slots, drag the bottom edge to resize, double-click any empty cell to add a new task.
    </p>
    <v-card rounded="lg" class="pa-4 mb-2">
      <CommonTimetable />
    </v-card>

    <v-sheet rounded="lg" color="surface-variant" class="pa-4 mb-6">
      <pre class="text-body-2"><code v-pre>&lt;CommonTimetable /&gt;</code></pre>
    </v-sheet>
  </div>
</template>
