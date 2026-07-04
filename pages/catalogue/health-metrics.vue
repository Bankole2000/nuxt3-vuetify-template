<script setup lang="ts">
import type { HealthReading } from '~/components/common/HealthMetricChart.vue'

definePageMeta({ layout: 'catalogue' })
useSeo({ title: 'Health Metrics', description: 'Vitals and health metric dashboard with time-series charts, normal range bands, trend indicators and a log-entry form per metric.' })

const tab      = ref('body')
const infoOpen = ref(false)

// ─── Seed helpers ─────────────────────────────────────────────────────────────

const d = (offsetDays: number) => {
  const r = new Date()
  r.setDate(r.getDate() + offsetDays)
  return r.toISOString().slice(0, 10)
}

// Gaussian noise for realistic data
const jitter = (base: number, std: number) =>
  Math.round((base + (Math.random() - 0.5) * std * 2) * 10) / 10

// Generate a series of readings over the past N days, every `step` days
const series = (days: number, step: number, base: number, std: number): HealthReading[] =>
  Array.from({ length: Math.floor(days / step) }, (_, i) => ({
    date:  d(-(days - i * step)),
    value: jitter(base, std),
  }))

// ─── Body metrics ─────────────────────────────────────────────────────────────

const weight = ref<HealthReading[]>([
  ...series(90, 3, 82.5, 0.6),
  { date: d(-2), value: 81.8, note: 'After gym' },
  { date: d(0),  value: 81.4 },
])

const bodyFat = ref<HealthReading[]>([
  ...series(90, 7, 19.5, 0.4),
  { date: d(-7), value: 19.1 },
  { date: d(0),  value: 18.8 },
])

const bmi = ref<HealthReading[]>([
  ...series(90, 7, 25.3, 0.2),
  { date: d(0), value: 25.0 },
])

// ─── Vitals ───────────────────────────────────────────────────────────────────

const heartRate = ref<HealthReading[]>([
  ...series(60, 2, 68, 5),
  { date: d(-1), value: 64, note: 'Resting AM' },
  { date: d(0),  value: 66 },
])

const systolic = ref<HealthReading[]>([
  ...series(60, 3, 122, 6),
  { date: d(-1), value: 118 },
  { date: d(0),  value: 120 },
])

const diastolic = ref<HealthReading[]>([
  ...series(60, 3, 78, 4),
  { date: d(-1), value: 76 },
  { date: d(0),  value: 77 },
])

const spo2 = ref<HealthReading[]>([
  ...series(30, 2, 98.2, 0.5),
  { date: d(0), value: 98.5 },
])

// ─── Activity ─────────────────────────────────────────────────────────────────

const steps = ref<HealthReading[]>([
  ...series(30, 1, 8200, 2000),
  { date: d(-2), value: 11430, note: 'Long walk' },
  { date: d(-1), value: 7840 },
  { date: d(0),  value: 9100 },
])

const sleep = ref<HealthReading[]>([
  ...series(30, 1, 7.2, 0.8),
  { date: d(-1), value: 6.5, note: 'Late night' },
  { date: d(0),  value: 7.8 },
])

const calories = ref<HealthReading[]>([
  ...series(30, 1, 2150, 300),
  { date: d(-1), value: 1980 },
  { date: d(0),  value: 2230 },
])

// ─── Add handlers ─────────────────────────────────────────────────────────────

const addWeight    = (r: HealthReading) => { weight.value    = [...weight.value,    r] }
const addBodyFat   = (r: HealthReading) => { bodyFat.value   = [...bodyFat.value,   r] }
const addBmi       = (r: HealthReading) => { bmi.value       = [...bmi.value,       r] }
const addHeartRate = (r: HealthReading) => { heartRate.value = [...heartRate.value, r] }
const addSystolic  = (r: HealthReading) => { systolic.value  = [...systolic.value,  r] }
const addDiastolic = (r: HealthReading) => { diastolic.value = [...diastolic.value, r] }
const addSpo2      = (r: HealthReading) => { spo2.value      = [...spo2.value,      r] }
const addSteps     = (r: HealthReading) => { steps.value     = [...steps.value,     r] }
const addSleep     = (r: HealthReading) => { sleep.value     = [...sleep.value,     r] }
const addCalories  = (r: HealthReading) => { calories.value  = [...calories.value,  r] }

// ─── Info modal ───────────────────────────────────────────────────────────────

const USECASES = [
  {
    context: 'General UI patterns',
    icon: 'mdi-heart-pulse',
    color: 'red',
    items: [
      { label: 'Personal health tracking', detail: 'Log weight, BP, heart rate over time. Normal range bands make it immediately obvious when a reading is outside the healthy zone.' },
      { label: 'Post-op / recovery monitoring', detail: 'Clinicians or patients log vitals daily after surgery; the trend line shows recovery progress.' },
      { label: 'Fitness progress', detail: 'Body fat %, VO2 max, resting heart rate tracked over weeks. Trend badges (↑↓) show whether training is working.' },
      { label: 'Sleep quality log', detail: 'Hours slept per night plotted over 30 days with notes. Patterns emerge around lifestyle changes.' },
    ],
  },
  {
    context: 'HEAM (#9)',
    icon: 'mdi-hospital-box-outline',
    color: 'pink',
    items: [
      { label: 'Core dashboard', detail: 'Each metric panel maps directly to a HEAM health record category — weight, BP, heart rate, SpO2, activity.' },
      { label: 'Normal range alerts', detail: 'The out-of-range chip triggers a review prompt in HEAM. Connect to a notification or flag system.' },
      { label: 'Appointment prep', detail: 'Before a GP visit, the chart gives a 90-day summary the user can screenshot or export.' },
    ],
  },
  {
    context: 'Symptom-Based Medical Guidance (#16)',
    icon: 'mdi-stethoscope',
    color: 'blue',
    items: [
      { label: 'Vitals context for triage', detail: 'When a user reports symptoms, their recent heart rate and BP readings provide context for the guidance engine.' },
      { label: 'Trend-based severity', detail: 'A rising BP trend over 7 days alongside reported headaches triggers a different recommendation than a one-off high reading.' },
    ],
  },
  {
    context: 'Portfolio Manager (#1)',
    icon: 'mdi-briefcase-outline',
    color: 'teal',
    items: [
      { label: 'Generic metric panel', detail: 'The HealthMetricChart component is reusable for any time-series KPI — not just health. Swap unit/label/color for business metrics.' },
    ],
  },
]
</script>

<template>
  <div>
    <div class="d-flex align-start justify-space-between gap-4 mb-1">
      <h1 class="text-h5 font-weight-bold">Health Metrics</h1>
      <v-btn icon="mdi-information-outline" variant="text" size="small" @click="infoOpen = true" />
    </div>
    <p class="text-body-2 text-medium-emphasis mb-5">
      Vitals and health tracking dashboard. Each panel shows a 90-day line chart, latest
      reading, normal range band (green dashed), trend indicator, and a log form.
      Click <strong>+</strong> on any panel to add a new reading.
    </p>

    <!-- Info dialog -->
    <v-dialog v-model="infoOpen" max-width="560" scrollable>
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center justify-space-between pt-5 px-6 pb-2">
          <span class="text-h6">Use cases &amp; project fit</span>
          <v-btn icon="mdi-close" variant="text" size="small" @click="infoOpen = false" />
        </v-card-title>
        <v-card-subtitle class="px-6 pb-3 text-wrap">
          Any feature that logs discrete measurements over time and needs to show trends and normal ranges benefits from this component.
        </v-card-subtitle>
        <v-divider />
        <v-card-text class="px-4 py-4">
          <div v-for="group in USECASES" :key="group.context" class="hm-uc-group">
            <div class="hm-uc-header">
              <v-icon :icon="group.icon" :color="group.color" size="16" />
              <span class="hm-uc-title">{{ group.context }}</span>
            </div>
            <ul class="hm-uc-list">
              <li v-for="item in group.items" :key="item.label">
                <span class="hm-uc-label">{{ item.label }}</span>
                <span class="hm-uc-detail">{{ item.detail }}</span>
              </li>
            </ul>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-tabs v-model="tab" density="compact" class="mb-5">
      <v-tab value="body">
        <v-icon start icon="mdi-human" size="16" />
        Body
      </v-tab>
      <v-tab value="vitals">
        <v-icon start icon="mdi-heart-pulse" size="16" />
        Vitals
      </v-tab>
      <v-tab value="activity">
        <v-icon start icon="mdi-run" size="16" />
        Activity
      </v-tab>
    </v-tabs>

    <v-window v-model="tab">

      <!-- ── Body metrics ───────────────────────────────────────────────── -->
      <v-window-item value="body">
        <p class="text-caption text-medium-emphasis mb-4">
          90-day body composition trends. Green dashed band = healthy range. Click + to log a new reading.
        </p>
        <v-row>
          <v-col cols="12" md="4">
            <CommonHealthMetricChart
              label="Weight"
              unit="kg"
              :readings="weight"
              color="#6366f1"
              icon="mdi-scale-bathroom"
              :range="{ min: 65, max: 85, label: 'Healthy range' }"
              :decimals="1"
              :min-y="70"
              @add="addWeight"
            />
          </v-col>
          <v-col cols="12" md="4">
            <CommonHealthMetricChart
              label="Body Fat"
              unit="%"
              :readings="bodyFat"
              color="#f97316"
              icon="mdi-human-male"
              :range="{ min: 10, max: 20 }"
              :decimals="1"
              :min-y="10"
              :max-y="35"
              @add="addBodyFat"
            />
          </v-col>
          <v-col cols="12" md="4">
            <CommonHealthMetricChart
              label="BMI"
              unit="kg/m²"
              :readings="bmi"
              color="#8b5cf6"
              icon="mdi-human-handsup"
              :range="{ min: 18.5, max: 24.9 }"
              :decimals="1"
              :min-y="15"
              :max-y="35"
              @add="addBmi"
            />
          </v-col>
        </v-row>
        <p class="text-caption text-medium-emphasis mt-3">Use case: HEAM (#9) · fitness tracking</p>
      </v-window-item>

      <!-- ── Vitals ─────────────────────────────────────────────────────── -->
      <v-window-item value="vitals">
        <p class="text-caption text-medium-emphasis mb-4">
          Cardiovascular vitals over 60 days. Blood pressure split into systolic and diastolic panels.
          Normal range bands help spot patterns before a GP visit.
        </p>
        <v-row>
          <v-col cols="12" md="6">
            <CommonHealthMetricChart
              label="Heart Rate"
              unit="bpm"
              :readings="heartRate"
              color="#ef4444"
              icon="mdi-heart-pulse"
              :range="{ min: 60, max: 100 }"
              :decimals="0"
              :min-y="40"
              :max-y="120"
              @add="addHeartRate"
            />
          </v-col>
          <v-col cols="12" md="6">
            <CommonHealthMetricChart
              label="SpO₂"
              unit="%"
              :readings="spo2"
              color="#3b82f6"
              icon="mdi-water-percent"
              :range="{ min: 95, max: 100 }"
              :decimals="1"
              :min-y="88"
              :max-y="100"
              @add="addSpo2"
            />
          </v-col>
          <v-col cols="12" md="6">
            <CommonHealthMetricChart
              label="Systolic BP"
              unit="mmHg"
              :readings="systolic"
              color="#ec4899"
              icon="mdi-heart"
              :range="{ min: 90, max: 130 }"
              :decimals="0"
              :min-y="80"
              :max-y="160"
              @add="addSystolic"
            />
          </v-col>
          <v-col cols="12" md="6">
            <CommonHealthMetricChart
              label="Diastolic BP"
              unit="mmHg"
              :readings="diastolic"
              color="#f59e0b"
              icon="mdi-heart-outline"
              :range="{ min: 60, max: 80 }"
              :decimals="0"
              :min-y="50"
              :max-y="110"
              @add="addDiastolic"
            />
          </v-col>
        </v-row>
        <p class="text-caption text-medium-emphasis mt-3">Use case: HEAM (#9) · Symptom Guidance (#16)</p>
      </v-window-item>

      <!-- ── Activity ───────────────────────────────────────────────────── -->
      <v-window-item value="activity">
        <p class="text-caption text-medium-emphasis mb-4">
          Daily activity and recovery metrics over 30 days. Steps target band at 8,000–12,000;
          sleep target 7–9 hours. Calorie range based on TDEE estimate.
        </p>
        <v-row>
          <v-col cols="12" md="4">
            <CommonHealthMetricChart
              label="Steps"
              unit="steps"
              :readings="steps"
              color="#10b981"
              icon="mdi-walk"
              :range="{ min: 8000, max: 12000 }"
              :decimals="0"
              :min-y="0"
              @add="addSteps"
            />
          </v-col>
          <v-col cols="12" md="4">
            <CommonHealthMetricChart
              label="Sleep"
              unit="hrs"
              :readings="sleep"
              color="#6366f1"
              icon="mdi-sleep"
              :range="{ min: 7, max: 9 }"
              :decimals="1"
              :min-y="4"
              :max-y="11"
              @add="addSleep"
            />
          </v-col>
          <v-col cols="12" md="4">
            <CommonHealthMetricChart
              label="Calories"
              unit="kcal"
              :readings="calories"
              color="#f97316"
              icon="mdi-fire"
              :range="{ min: 1800, max: 2400 }"
              :decimals="0"
              :min-y="1200"
              @add="addCalories"
            />
          </v-col>
        </v-row>
        <p class="text-caption text-medium-emphasis mt-3">Use case: HEAM (#9) · fitness &amp; wellness apps</p>
      </v-window-item>

    </v-window>
  </div>
</template>

<style scoped>
.hm-uc-group { margin-bottom: 20px; }
.hm-uc-group:last-child { margin-bottom: 0; }
.hm-uc-header { display: flex; align-items: center; gap: 7px; margin-bottom: 8px; padding: 0 4px; }
.hm-uc-title { font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: rgba(var(--v-theme-on-surface), .55); }
.hm-uc-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 2px; }
.hm-uc-list li { display: flex; flex-direction: column; gap: 1px; padding: 7px 10px 7px 16px; border-radius: 8px; background: rgba(var(--v-theme-on-surface), .03); border-left: 2px solid rgba(var(--v-theme-on-surface), .08); }
.hm-uc-label { font-size: 12px; font-weight: 600; color: rgb(var(--v-theme-on-surface)); line-height: 1.4; }
.hm-uc-detail { font-size: 11px; color: rgba(var(--v-theme-on-surface), .5); line-height: 1.5; }
</style>
