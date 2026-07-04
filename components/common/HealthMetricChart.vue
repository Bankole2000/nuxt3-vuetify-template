<script setup lang="ts">
// Reusable health metric panel.
// Shows a line chart of readings over time with a latest-value badge,
// trend indicator, normal range band, and an inline log form.

export interface HealthReading {
  date:  string   // 'YYYY-MM-DD'
  value: number
  note?: string
}

export interface NormalRange {
  min: number
  max: number
  label?: string
}

const props = withDefaults(defineProps<{
  label:        string
  unit:         string
  readings:     HealthReading[]
  color?:       string
  range?:       NormalRange     // green band on the chart
  icon?:        string
  decimals?:    number
  minY?:        number
  maxY?:        number
  readonly?:    boolean
}>(), {
  color:    '#6366f1',
  icon:     'mdi-chart-line',
  decimals: 1,
  readonly: false,
})

const emit = defineEmits<{
  'add': [reading: HealthReading]
}>()

// ─── Trend ────────────────────────────────────────────────────────────────────

const sorted = computed(() =>
  [...props.readings].sort((a, b) => a.date.localeCompare(b.date))
)

const latest = computed(() => sorted.value[sorted.value.length - 1])
const prev   = computed(() => sorted.value[sorted.value.length - 2])

const trend = computed((): 'up' | 'down' | 'flat' | null => {
  if (!latest.value || !prev.value) return null
  const diff = latest.value.value - prev.value.value
  if (Math.abs(diff) < 0.05) return 'flat'
  return diff > 0 ? 'up' : 'down'
})

const trendIcon = computed(() => {
  if (trend.value === 'up')   return 'mdi-trending-up'
  if (trend.value === 'down') return 'mdi-trending-down'
  return 'mdi-trending-neutral'
})

const inRange = computed(() => {
  if (!props.range || !latest.value) return null
  return latest.value.value >= props.range.min && latest.value.value <= props.range.max
})

const statusColor = computed(() => {
  if (inRange.value === null) return 'default'
  return inRange.value ? 'success' : 'error'
})

// ─── Chart data ───────────────────────────────────────────────────────────────

const chartVersion = ref(0)
watch(() => props.readings.length, () => { chartVersion.value++ })

const chartData = computed(() => ({
  labels: sorted.value.map(r => {
    const d = new Date(r.date + 'T00:00:00')
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }),
  datasets: [
    {
      label:           props.label,
      data:            sorted.value.map(r => r.value),
      borderColor:     props.color,
      backgroundColor: props.color + '18',
      borderWidth:     2,
      pointRadius:     sorted.value.length < 20 ? 3 : 0,
      pointHoverRadius:5,
      tension:         0.35,
      fill:            true,
    },
    // Normal range upper bound (invisible line for annotation effect)
    ...(props.range ? [{
      label:           'Range max',
      data:            sorted.value.map(() => props.range!.max),
      borderColor:     'rgba(16,185,129,.25)',
      backgroundColor: 'rgba(16,185,129,.07)',
      borderWidth:     1,
      borderDash:      [4, 4],
      pointRadius:     0,
      fill:            '+1',
      tension:         0,
    }, {
      label:           'Range min',
      data:            sorted.value.map(() => props.range!.min),
      borderColor:     'rgba(16,185,129,.25)',
      backgroundColor: 'transparent',
      borderWidth:     1,
      borderDash:      [4, 4],
      pointRadius:     0,
      fill:            false,
      tension:         0,
    }] : []),
  ],
}))

const chartOptions = computed(() => ({
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: { dataset: { label?: string }; parsed: { y: number | null } }) => {
          if (ctx.dataset.label === 'Range max' || ctx.dataset.label === 'Range min') return ''
          return `${(ctx.parsed.y ?? 0).toFixed(props.decimals)} ${props.unit}`
        },
      },
      filter: (item: { dataset: { label?: string } }) =>
        item.dataset.label !== 'Range max' && item.dataset.label !== 'Range min',
    },
  },
  scales: {
    y: {
      min: props.minY,
      max: props.maxY,
    },
  },
}))

// ─── Inline log form ──────────────────────────────────────────────────────────

const logOpen   = ref(false)
const newDate   = ref(new Date().toISOString().slice(0, 10))
const newValue  = ref<number | null>(null)
const newNote   = ref('')

const openLog = () => {
  newDate.value  = new Date().toISOString().slice(0, 10)
  newValue.value = latest.value?.value ?? null
  newNote.value  = ''
  logOpen.value  = true
}

const confirmLog = () => {
  if (newValue.value === null) return
  emit('add', { date: newDate.value, value: newValue.value, note: newNote.value || undefined })
  logOpen.value = false
}

const fmt = (v: number) => v.toFixed(props.decimals)
</script>

<template>
  <v-card rounded="xl" elevation="0" border>
    <!-- Header -->
    <div class="hm-header">
      <div class="d-flex align-center gap-2">
        <v-avatar :color="color" variant="tonal" size="32" rounded="lg">
          <v-icon :icon="icon" size="16" />
        </v-avatar>
        <div>
          <p class="hm-label">{{ label }}</p>
          <p class="hm-unit">{{ unit }}</p>
        </div>
      </div>
      <div class="d-flex align-center gap-2 ml-auto">
        <!-- Latest value -->
        <div v-if="latest" class="hm-latest">
          <span class="hm-latest-val" :style="{ color }">{{ fmt(latest.value) }}</span>
          <v-chip
            v-if="inRange !== null"
            :color="statusColor"
            size="x-small"
            variant="tonal"
            class="ml-1"
          >
            {{ inRange ? 'Normal' : 'Out of range' }}
          </v-chip>
        </div>
        <!-- Trend -->
        <v-icon
          v-if="trend"
          :icon="trendIcon"
          :color="trend === 'flat' ? 'default' : trend === 'up' ? color : color"
          size="18"
          class="text-medium-emphasis"
        />
        <!-- Log button -->
        <v-btn
          v-if="!readonly"
          icon="mdi-plus"
          variant="text"
          size="small"
          density="compact"
          @click="openLog"
        />
      </div>
    </div>

    <!-- Chart -->
    <div class="hm-chart-wrap">
      <ClientOnly>
        <CommonChart
          v-if="sorted.length"
          type="line"
          :data="chartData"
          :options="chartOptions"
          :height="140"
          :version="chartVersion"
        />
        <div v-else class="hm-empty">
          <v-icon icon="mdi-chart-line-variant" size="32" class="mb-2 opacity-30" />
          <p class="text-caption text-medium-emphasis">No readings yet</p>
          <v-btn v-if="!readonly" size="x-small" variant="tonal" class="mt-2" @click="openLog">Add first reading</v-btn>
        </div>
      </ClientOnly>
    </div>

    <!-- Recent readings list (last 5) -->
    <div v-if="sorted.length" class="hm-recents">
      <div
        v-for="r in [...sorted].reverse().slice(0, 5)"
        :key="r.date + r.value"
        class="hm-reading-row"
      >
        <span class="hm-reading-date">{{ new Date(r.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) }}</span>
        <span class="hm-reading-val" :style="{ color }">{{ fmt(r.value) }} <span class="hm-reading-unit">{{ unit }}</span></span>
        <span v-if="r.note" class="hm-reading-note">{{ r.note }}</span>
      </div>
    </div>

    <!-- Log dialog -->
    <v-dialog v-model="logOpen" max-width="340">
      <v-card rounded="xl">
        <v-card-title class="pt-5 px-5 pb-2 text-body-1 font-weight-bold">Log {{ label }}</v-card-title>
        <v-card-text class="px-5 pb-2 d-flex flex-column gap-3">
          <v-text-field
            v-model="newDate"
            type="date"
            label="Date"
            variant="outlined"
            density="compact"
            hide-details
          />
          <v-text-field
            v-model.number="newValue"
            :label="`${label} (${unit})`"
            type="number"
            step="0.1"
            variant="outlined"
            density="compact"
            hide-details
            autofocus
            @keydown.enter="confirmLog"
          />
          <v-text-field
            v-model="newNote"
            label="Note (optional)"
            variant="outlined"
            density="compact"
            hide-details
          />
          <v-chip v-if="range" size="small" variant="tonal" color="success">
            Normal range: {{ range.min }}–{{ range.max }} {{ unit }}
          </v-chip>
        </v-card-text>
        <v-card-actions class="px-5 pb-5 pt-2">
          <v-btn variant="text" size="small" @click="logOpen = false">Cancel</v-btn>
          <v-spacer />
          <v-btn
            variant="flat"
            size="small"
            :color="color"
            :disabled="newValue === null"
            @click="confirmLog"
          >Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<style scoped>
.hm-header {
  display: flex;
  align-items: center;
  padding: 14px 16px 8px;
  gap: 8px;
}
.hm-label {
  font-size: 13px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
  line-height: 1.3;
}
.hm-unit {
  font-size: 11px;
  color: rgba(var(--v-theme-on-surface), .4);
  margin: 0;
  line-height: 1.2;
}
.hm-latest {
  display: flex;
  align-items: center;
}
.hm-latest-val {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -.02em;
  font-variant-numeric: tabular-nums;
}

.hm-chart-wrap {
  padding: 0 8px 4px;
}
.hm-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 120px;
  color: rgba(var(--v-theme-on-surface), .35);
}

.hm-recents {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  padding: 4px 0;
}
.hm-reading-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 16px;
  font-size: 12px;
  border-bottom: 1px solid rgba(var(--v-border-color), .5);
}
.hm-reading-row:last-child { border-bottom: none; }
.hm-reading-date { color: rgba(var(--v-theme-on-surface), .4); min-width: 60px; }
.hm-reading-val  { font-weight: 700; font-variant-numeric: tabular-nums; }
.hm-reading-unit { font-weight: 400; font-size: 10px; opacity: .6; }
.hm-reading-note { color: rgba(var(--v-theme-on-surface), .45); font-style: italic; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
