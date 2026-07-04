<script setup lang="ts">
export interface KpiMetric {
  id:         string
  label:      string
  value:      number
  prevValue?: number
  unit?:      string
  unitPos?:   'prefix' | 'suffix'
  icon?:      string
  color?:     string
  sparkline?: number[]
  target?:    number
  format?:    'number' | 'currency' | 'percent' | 'duration'
}

const props = withDefaults(defineProps<{
  metrics: KpiMetric[]
  cols?:    number
  compact?: boolean
}>(), {
  cols:    3,
  compact: false,
})

function formatValue(metric: KpiMetric): string {
  const fmt = metric.format ?? 'number'
  const v   = metric.value

  if (fmt === 'currency') {
    return new Intl.NumberFormat('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v)
  }
  if (fmt === 'percent') {
    return v.toFixed(1)
  }
  if (fmt === 'duration') {
    if (v >= 3600) return `${(v / 3600).toFixed(1)}h`
    if (v >= 60)   return `${Math.round(v / 60)}m`
    return `${Math.round(v)}s`
  }
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000)     return `${(v / 1_000).toFixed(1)}k`
  return v.toLocaleString('en-GB')
}

function displayUnit(metric: KpiMetric): { prefix: string; suffix: string } {
  if (!metric.unit) return { prefix: '', suffix: '' }
  const pos = metric.unitPos ?? 'prefix'
  if (metric.format === 'duration') return { prefix: '', suffix: '' }
  return pos === 'prefix'
    ? { prefix: metric.unit, suffix: '' }
    : { prefix: '', suffix: metric.unit }
}

function pctChange(metric: KpiMetric): number | null {
  if (metric.prevValue == null || metric.prevValue === 0) return null
  return ((metric.value - metric.prevValue) / Math.abs(metric.prevValue)) * 100
}

function changeColor(change: number): string {
  return change >= 0 ? 'success' : 'error'
}

function changeBg(change: number): string {
  return change >= 0 ? 'rgba(var(--v-theme-success), .12)' : 'rgba(var(--v-theme-error), .12)'
}

function targetPct(metric: KpiMetric): number {
  if (!metric.target || metric.target === 0) return 0
  return Math.min(100, Math.round((metric.value / metric.target) * 100))
}

function sparklinePath(data: number[], width: number, height: number): string {
  if (data.length < 2) return ''
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pad = 3
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2)
    const y = height - pad - ((v - min) / range) * (height - pad * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return `M ${pts.join(' L ')}`
}

function sparklineColor(metric: KpiMetric): string {
  if (metric.color) return metric.color
  const change = pctChange(metric)
  if (change === null) return 'rgba(var(--v-theme-primary), 0.7)'
  return change >= 0
    ? 'rgba(var(--v-theme-success), 0.7)'
    : 'rgba(var(--v-theme-error), 0.7)'
}

const colsClass = computed(() => {
  const map: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }
  return map[props.cols] ?? 'grid-cols-3'
})
</script>

<template>
  <div class="kpi-grid" :class="[colsClass, compact && 'kpi-grid--compact']">
    <v-card
      v-for="metric in metrics"
      :key="metric.id"
      rounded="lg"
      class="kpi-card"
    >
      <v-card-text :class="compact ? 'pa-3' : 'pa-4'">

        <!-- Header row: label + icon -->
        <div class="d-flex align-center justify-space-between mb-2">
          <span class="text-caption text-medium-emphasis font-weight-medium kpi-label">
            {{ metric.label }}
          </span>
          <v-avatar
            v-if="metric.icon"
            :color="metric.color ?? 'primary'"
            variant="tonal"
            :size="compact ? 28 : 32"
            rounded="lg"
          >
            <v-icon :icon="metric.icon" :size="compact ? 14 : 16" />
          </v-avatar>
        </div>

        <!-- Value row -->
        <div class="d-flex align-end gap-2 mb-1">
          <div class="kpi-value" :class="compact ? 'text-h6' : 'text-h5'">
            <span class="kpi-unit kpi-unit--pre">{{ displayUnit(metric).prefix }}</span>
            <span class="font-weight-bold">{{ formatValue(metric) }}</span>
            <span class="kpi-unit kpi-unit--suf">{{ displayUnit(metric).suffix }}</span>
          </div>

          <!-- % change badge -->
          <template v-if="pctChange(metric) !== null">
            <div
              class="kpi-badge"
              :style="{ background: changeBg(pctChange(metric)!) }"
            >
              <v-icon
                :icon="pctChange(metric)! >= 0 ? 'mdi-trending-up' : 'mdi-trending-down'"
                :color="changeColor(pctChange(metric)!)"
                size="12"
              />
              <span :class="`text-${changeColor(pctChange(metric)!)}`">
                {{ Math.abs(pctChange(metric)!).toFixed(1) }}%
              </span>
            </div>
          </template>
        </div>

        <!-- Target progress bar -->
        <template v-if="metric.target != null">
          <div class="kpi-target-row">
            <v-progress-linear
              :model-value="targetPct(metric)"
              :color="metric.color ?? 'primary'"
              bg-color="rgba(var(--v-theme-on-surface), .08)"
              height="4"
              rounded
              class="kpi-progress"
            />
            <span class="text-caption text-disabled kpi-target-label">
              {{ targetPct(metric) }}% of target
            </span>
          </div>
        </template>

        <!-- Sparkline -->
        <template v-if="metric.sparkline && metric.sparkline.length > 1">
          <div class="kpi-sparkline-wrap">
            <svg
              class="kpi-sparkline"
              :width="compact ? 72 : 88"
              :height="compact ? 26 : 32"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                :d="sparklinePath(metric.sparkline, compact ? 72 : 88, compact ? 26 : 32)"
                fill="none"
                :stroke="sparklineColor(metric)"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </template>

      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
.kpi-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(3, 1fr);
}
.kpi-grid.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
.kpi-grid.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.kpi-grid.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.kpi-grid.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }

@media (max-width: 767px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
}
@media (max-width: 479px) {
  .kpi-grid { grid-template-columns: 1fr !important; }
}

.kpi-card { overflow: hidden; position: relative; }

.kpi-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: calc(100% - 44px);
  line-height: 1.3;
  letter-spacing: .03em;
}

.kpi-value {
  line-height: 1.1;
  letter-spacing: -.02em;
}

.kpi-unit {
  font-size: .7em;
  font-weight: 500;
  opacity: .7;
  letter-spacing: 0;
}
.kpi-unit--pre { margin-right: 1px; }
.kpi-unit--suf { margin-left: 1px; }

.kpi-badge {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  margin-bottom: 2px;
}

.kpi-target-row {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.kpi-progress { flex: 1; }
.kpi-target-label { white-space: nowrap; font-size: 10px; }

.kpi-sparkline-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 6px;
  opacity: .85;
}
.kpi-sparkline { display: block; }
</style>
