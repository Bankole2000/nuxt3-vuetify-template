<script setup lang="ts">
import type { ChartData, ChartOptions } from 'chart.js'

definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Charts', disabled: true },
  ],
})

// ── Shared palette ────────────────────────────────────────────────────────────
const palette = [
  'rgba(25, 118, 210, 1)',   // primary blue
  'rgba(46, 125, 50, 1)',    // success green
  'rgba(251, 140, 0, 1)',    // warning orange
  'rgba(211, 47, 47, 1)',    // error red
  'rgba(123, 31, 162, 1)',   // purple
  'rgba(0, 131, 143, 1)',    // teal
]
const paletteAlpha = (alpha: number) => palette.map(c => c.replace(', 1)', `, ${alpha})`))

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// ── Line chart — multi-series ─────────────────────────────────────────────────
const lineData: ChartData<'line'> = {
  labels: months,
  datasets: [
    {
      label: 'Revenue',
      data: [42, 58, 51, 74, 63, 85, 77, 96, 88, 110, 102, 128],
      borderColor: palette[0],
      backgroundColor: paletteAlpha(0.1)[0],
      fill: true,
      tension: 0.4,
      pointRadius: 3,
    },
    {
      label: 'Expenses',
      data: [30, 42, 38, 50, 48, 60, 55, 68, 62, 75, 70, 88],
      borderColor: palette[2],
      backgroundColor: paletteAlpha(0.08)[2],
      fill: true,
      tension: 0.4,
      pointRadius: 3,
    },
  ],
}

// ── Bar chart — grouped ───────────────────────────────────────────────────────
const barData: ChartData<'bar'> = {
  labels: ['Q1', 'Q2', 'Q3', 'Q4'],
  datasets: [
    {
      label: '2023',
      data: [120, 145, 138, 160],
      backgroundColor: paletteAlpha(0.7)[0],
      borderColor: palette[0],
      borderWidth: 1,
      borderRadius: 6,
    },
    {
      label: '2024',
      data: [151, 168, 172, 195],
      backgroundColor: paletteAlpha(0.7)[1],
      borderColor: palette[1],
      borderWidth: 1,
      borderRadius: 6,
    },
  ],
}

// ── Horizontal bar ────────────────────────────────────────────────────────────
const hBarData: ChartData<'bar'> = {
  labels: ['Organic', 'Direct', 'Referral', 'Social', 'Email', 'Paid'],
  datasets: [
    {
      label: 'Sessions',
      data: [4200, 3100, 2400, 1800, 1200, 900],
      backgroundColor: paletteAlpha(0.75),
      borderColor: palette,
      borderWidth: 1,
      borderRadius: 4,
    },
  ],
}
const hBarOptions: ChartOptions<'bar'> = {
  indexAxis: 'y',
  plugins: { legend: { display: false } },
}

// ── Doughnut ──────────────────────────────────────────────────────────────────
const doughnutData: ChartData<'doughnut'> = {
  labels: ['Pro', 'Starter', 'Enterprise', 'Free'],
  datasets: [
    {
      data: [42, 28, 18, 12],
      backgroundColor: paletteAlpha(0.85),
      borderColor: palette,
      borderWidth: 2,
      hoverOffset: 8,
    },
  ],
}

// ── Pie ───────────────────────────────────────────────────────────────────────
const pieData: ChartData<'pie'> = {
  labels: ['Desktop', 'Mobile', 'Tablet'],
  datasets: [
    {
      data: [54, 38, 8],
      backgroundColor: [paletteAlpha(0.85)[0], paletteAlpha(0.85)[2], paletteAlpha(0.85)[4]],
      borderColor: [palette[0], palette[2], palette[4]],
      borderWidth: 2,
      hoverOffset: 8,
    },
  ],
}

// ── Stacked bar ───────────────────────────────────────────────────────────────
const stackedData: ChartData<'bar'> = {
  labels: days,
  datasets: [
    {
      label: 'New',
      data: [65, 80, 55, 90, 75, 40, 30],
      backgroundColor: paletteAlpha(0.8)[0],
      borderRadius: 4,
    },
    {
      label: 'Returning',
      data: [120, 135, 110, 145, 130, 80, 60],
      backgroundColor: paletteAlpha(0.8)[1],
      borderRadius: 4,
    },
    {
      label: 'Guests',
      data: [30, 25, 40, 20, 35, 50, 45],
      backgroundColor: paletteAlpha(0.8)[2],
      borderRadius: 4,
    },
  ],
}
const stackedOptions: ChartOptions<'bar'> = {
  scales: { x: { stacked: true }, y: { stacked: true } },
}

// ── Radar ─────────────────────────────────────────────────────────────────────
const radarData: ChartData<'radar'> = {
  labels: ['Performance', 'Reliability', 'Security', 'Usability', 'Scalability', 'Support'],
  datasets: [
    {
      label: 'Our product',
      data: [88, 92, 85, 90, 78, 95],
      borderColor: palette[0],
      backgroundColor: paletteAlpha(0.15)[0],
      pointBackgroundColor: palette[0],
    },
    {
      label: 'Competitor',
      data: [72, 80, 78, 75, 85, 70],
      borderColor: palette[2],
      backgroundColor: paletteAlpha(0.1)[2],
      pointBackgroundColor: palette[2],
    },
  ],
}

// ── Realtime ──────────────────────────────────────────────────────────────────
const WINDOW = 20
const liveRunning = ref(true)
const liveVersion = ref(0)
const liveInterval = ref(1000)
const liveIntervalOptions = [
  { label: '0.5s', value: 500 },
  { label: '1s', value: 1000 },
  { label: '2s', value: 2000 },
]

// Scrolling line — 3 series (CPU, memory, network)
const liveLabels = ref<string[]>([])
const liveCpu = ref<number[]>([])
const liveMem = ref<number[]>([])
const liveNet = ref<number[]>([])

// Smooth random walk clamped to 0–100
const walk = (prev: number, step = 12, min = 5, max = 95) =>
  Math.min(max, Math.max(min, prev + (Math.random() - 0.5) * step))

const liveLineData = computed<ChartData<'line'>>(() => ({
  labels: liveLabels.value,
  datasets: [
    { label: 'CPU %', data: liveCpu.value, borderColor: palette[0], backgroundColor: 'transparent', tension: 0.4, pointRadius: 0, borderWidth: 2 },
    { label: 'Memory %', data: liveMem.value, borderColor: palette[2], backgroundColor: 'transparent', tension: 0.4, pointRadius: 0, borderWidth: 2 },
    { label: 'Network %', data: liveNet.value, borderColor: palette[1], backgroundColor: 'transparent', tension: 0.4, pointRadius: 0, borderWidth: 2 },
  ],
}))
const liveLineOptions: ChartOptions<'line'> = {
  animation: { duration: 200 },
  scales: { y: { min: 0, max: 100 } },
  plugins: { tooltip: { mode: 'index', intersect: false } },
}

// Rolling bar — requests per second
const liveBarLabels = ref<string[]>([])
const liveBarValues = ref<number[]>([])
const liveBarData = computed<ChartData<'bar'>>(() => ({
  labels: liveBarLabels.value,
  datasets: [{
    label: 'Req/s',
    data: liveBarValues.value,
    backgroundColor: liveBarValues.value.map(v =>
      v > 80 ? paletteAlpha(0.8)[3] : v > 50 ? paletteAlpha(0.8)[2] : paletteAlpha(0.8)[1],
    ),
    borderRadius: 4,
    borderWidth: 0,
  }],
}))
const liveBarOptions: ChartOptions<'bar'> = {
  animation: { duration: 200 },
  plugins: { legend: { display: false } },
  scales: { y: { min: 0, max: 120 } },
}

// Live horizontal bar — endpoint latency
const endpointLabels = ['/api/users', '/api/orders', '/api/products', '/api/auth', '/api/reports', '/api/search']
const liveHBarValues = ref<number[]>([45, 120, 67, 23, 210, 88])
const liveHBarData = computed<ChartData<'bar'>>(() => ({
  labels: endpointLabels,
  datasets: [{
    label: 'Latency (ms)',
    data: liveHBarValues.value,
    backgroundColor: liveHBarValues.value.map(v =>
      v > 150 ? paletteAlpha(0.8)[3] : v > 80 ? paletteAlpha(0.8)[2] : paletteAlpha(0.8)[1],
    ),
    borderRadius: 4,
    borderWidth: 0,
  }],
}))
const liveHBarOptions: ChartOptions<'bar'> = {
  indexAxis: 'y',
  animation: { duration: 200 },
  plugins: { legend: { display: false } },
  scales: { x: { min: 0, max: 300, ticks: { callback: (v) => `${v}ms` } } },
}

// Live doughnut — shifting distribution
const liveDonutValues = ref([40, 30, 20, 10])
const liveDonutData = computed<ChartData<'doughnut'>>(() => ({
  labels: ['Active', 'Idle', 'Waiting', 'Error'],
  datasets: [{
    data: liveDonutValues.value,
    backgroundColor: [paletteAlpha(0.85)[1], paletteAlpha(0.85)[0], paletteAlpha(0.85)[2], paletteAlpha(0.85)[3]],
    borderColor: [palette[1], palette[0], palette[2], palette[3]],
    borderWidth: 2,
    hoverOffset: 6,
  }],
}))

// KPI stat refs
const liveKpiCpu = computed(() => Math.round(liveCpu.value[liveCpu.value.length - 1] ?? 0))
const liveKpiMem = computed(() => Math.round(liveMem.value[liveMem.value.length - 1] ?? 0))
const liveKpiReq = computed(() => liveBarValues.value[liveBarValues.value.length - 1] ?? 0)
const liveKpiErr = computed(() => liveDonutValues.value[3] ?? 0)

// Tick function
const tick = () => {
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  // Scrolling line
  liveLabels.value.push(now)
  liveCpu.value.push(walk(liveCpu.value[liveCpu.value.length - 1] ?? 50))
  liveMem.value.push(walk(liveMem.value[liveMem.value.length - 1] ?? 60, 6))
  liveNet.value.push(walk(liveNet.value[liveNet.value.length - 1] ?? 30, 15))
  if (liveLabels.value.length > WINDOW) {
    liveLabels.value.shift(); liveCpu.value.shift(); liveMem.value.shift(); liveNet.value.shift()
  }

  // Rolling bar
  liveBarLabels.value.push(now)
  liveBarValues.value.push(Math.round(20 + Math.random() * 100))
  if (liveBarLabels.value.length > 12) { liveBarLabels.value.shift(); liveBarValues.value.shift() }

  // Shifting donut
  liveDonutValues.value = liveDonutValues.value.map((v, i) =>
    Math.max(2, Math.min(70, v + (Math.random() - 0.5) * (i === 3 ? 4 : 8))),
  ) as [number, number, number, number]

  // Endpoint latency — each endpoint drifts independently
  liveHBarValues.value = liveHBarValues.value.map(v =>
    Math.round(Math.max(5, Math.min(280, v + (Math.random() - 0.45) * 20))),
  )

  liveVersion.value++
}

// Seed initial data
const seed = () => {
  let cpu = 50, mem = 60, net = 30
  for (let i = WINDOW - 1; i >= 0; i--) {
    const t = new Date(Date.now() - i * liveInterval.value)
    liveLabels.value.push(t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    cpu = walk(cpu); liveCpu.value.push(cpu)
    mem = walk(mem, 6); liveMem.value.push(mem)
    net = walk(net, 15); liveNet.value.push(net)
    liveBarLabels.value.push(t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    liveBarValues.value.push(Math.round(20 + Math.random() * 100))
  }
}

let timer: ReturnType<typeof setInterval> | null = null

const startTimer = () => {
  if (timer) clearInterval(timer)
  timer = setInterval(() => { if (liveRunning.value) tick() }, liveInterval.value)
}

watch(liveInterval, startTimer)

onMounted(() => { seed(); startTimer() })
onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">Charts</h1>
    <p class="text-body-2 text-medium-emphasis mb-8">
      Chart.js wrapper with automatic dark mode support, dynamic import (no SSR bundle cost) and reactive data updates.
    </p>

    <!-- Line — multi-series -->
    <h2 class="text-overline text-medium-emphasis mb-4">Line chart — multi-series with fill</h2>
    <v-card rounded="lg" class="mb-6 pa-5">
      <p class="text-body-2 font-weight-medium mb-4">Revenue vs Expenses · 2024</p>
      <ClientOnly>
        <CommonChart type="line" :data="lineData" :height="260" />
      </ClientOnly>
    </v-card>

    <!-- Bar grouped + Horizontal bar -->
    <v-row class="mb-2">
      <v-col cols="12" md="6">
        <h2 class="text-overline text-medium-emphasis mb-4">Bar chart — grouped</h2>
        <v-card rounded="lg" class="pa-5" height="100%">
          <p class="text-body-2 font-weight-medium mb-4">Quarterly revenue · 2023 vs 2024</p>
          <ClientOnly>
            <CommonChart type="bar" :data="barData" :height="220" />
          </ClientOnly>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <h2 class="text-overline text-medium-emphasis mb-4">Bar chart — horizontal</h2>
        <v-card rounded="lg" class="pa-5" height="100%">
          <p class="text-body-2 font-weight-medium mb-4">Traffic sources · sessions</p>
          <ClientOnly>
            <CommonChart type="bar" :data="hBarData" :options="hBarOptions" :height="220" />
          </ClientOnly>
        </v-card>
      </v-col>
    </v-row>

    <!-- Doughnut + Pie -->
    <v-row class="mb-2">
      <v-col cols="12" md="6">
        <h2 class="text-overline text-medium-emphasis mb-4">Doughnut chart</h2>
        <v-card rounded="lg" class="pa-5" height="100%">
          <p class="text-body-2 font-weight-medium mb-4">Users by plan</p>
          <ClientOnly>
            <CommonChart type="doughnut" :data="doughnutData" :height="240" />
          </ClientOnly>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <h2 class="text-overline text-medium-emphasis mb-4">Pie chart</h2>
        <v-card rounded="lg" class="pa-5" height="100%">
          <p class="text-body-2 font-weight-medium mb-4">Sessions by device</p>
          <ClientOnly>
            <CommonChart type="pie" :data="pieData" :height="240" />
          </ClientOnly>
        </v-card>
      </v-col>
    </v-row>

    <!-- Stacked bar + Radar -->
    <v-row class="mb-2">
      <v-col cols="12" md="7">
        <h2 class="text-overline text-medium-emphasis mb-4">Stacked bar chart</h2>
        <v-card rounded="lg" class="pa-5" height="100%">
          <p class="text-body-2 font-weight-medium mb-4">Daily user types · this week</p>
          <ClientOnly>
            <CommonChart type="bar" :data="stackedData" :options="stackedOptions" :height="240" />
          </ClientOnly>
        </v-card>
      </v-col>
      <v-col cols="12" md="5">
        <h2 class="text-overline text-medium-emphasis mb-4">Radar chart</h2>
        <v-card rounded="lg" class="pa-5" height="100%">
          <p class="text-body-2 font-weight-medium mb-4">Product comparison</p>
          <ClientOnly>
            <CommonChart type="radar" :data="radarData" :height="240" />
          </ClientOnly>
        </v-card>
      </v-col>
    </v-row>

    <!-- ── Realtime section ── -->
    <h2 class="text-overline text-medium-emphasis mb-4">Realtime charts</h2>

    <!-- Controls bar -->
    <v-card rounded="lg" class="mb-4 pa-4" border elevation="0">
      <div class="d-flex align-center flex-wrap gap-4">
        <div class="d-flex align-center gap-2">
          <v-icon :icon="liveRunning ? 'mdi-circle' : 'mdi-circle-outline'" :color="liveRunning ? 'success' : 'default'" size="10" />
          <span class="text-body-2 font-weight-medium">{{ liveRunning ? 'Live' : 'Paused' }}</span>
        </div>
        <v-btn
          :color="liveRunning ? 'warning' : 'success'"
          :prepend-icon="liveRunning ? 'mdi-pause' : 'mdi-play'"
          variant="tonal"
          size="small"
          @click="liveRunning = !liveRunning"
        >
          {{ liveRunning ? 'Pause' : 'Resume' }}
        </v-btn>
        <div class="d-flex align-center gap-2">
          <span class="text-body-2 text-medium-emphasis">Interval</span>
          <v-btn-toggle v-model="liveInterval" density="compact" variant="outlined" divided mandatory>
            <v-btn v-for="opt in liveIntervalOptions" :key="opt.value" :value="opt.value" size="small">
              {{ opt.label }}
            </v-btn>
          </v-btn-toggle>
        </div>
      </div>
    </v-card>

    <!-- KPI strip -->
    <v-row class="mb-4">
      <v-col v-for="(kpi, i) in [
        { label: 'CPU', value: liveKpiCpu, suffix: '%', color: 'primary', icon: 'mdi-cpu-64-bit', warn: liveKpiCpu > 80 },
        { label: 'Memory', value: liveKpiMem, suffix: '%', color: 'warning', icon: 'mdi-memory', warn: liveKpiMem > 75 },
        { label: 'Req/s', value: liveKpiReq, suffix: '', color: 'success', icon: 'mdi-swap-horizontal', warn: liveKpiReq > 80 },
        { label: 'Error rate', value: liveKpiErr, suffix: '%', color: 'error', icon: 'mdi-alert-circle-outline', warn: liveKpiErr > 15 },
      ]" :key="i" cols="6" md="3">
        <v-card rounded="lg" border elevation="0" :color="kpi.warn ? `${kpi.color}-darken-4` : undefined">
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between mb-1">
              <span class="text-caption text-medium-emphasis">{{ kpi.label }}</span>
              <v-icon :icon="kpi.icon" :color="kpi.color" size="18" />
            </div>
            <p class="text-h5 font-weight-bold mb-0" :class="`text-${kpi.color}`">
              {{ kpi.value }}{{ kpi.suffix }}
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Scrolling line — server metrics -->
    <v-card rounded="lg" class="mb-4 pa-5">
      <p class="text-body-2 font-weight-medium mb-1">Server metrics — scrolling window ({{ WINDOW }} points)</p>
      <p class="text-caption text-medium-emphasis mb-4">CPU, memory and network utilisation over time</p>
      <ClientOnly>
        <CommonChart type="line" :data="liveLineData" :options="liveLineOptions" :height="220" :version="liveVersion" />
      </ClientOnly>
    </v-card>

    <!-- Live horizontal bar — endpoint latency -->
    <v-card rounded="lg" class="mb-4 pa-5">
      <p class="text-body-2 font-weight-medium mb-1">API endpoint latency</p>
      <p class="text-caption text-medium-emphasis mb-4">Each endpoint drifts independently · green &lt; 80 ms · orange 80–150 ms · red &gt; 150 ms</p>
      <ClientOnly>
        <CommonChart type="bar" :data="liveHBarData" :options="liveHBarOptions" :height="220" :version="liveVersion" />
      </ClientOnly>
    </v-card>

    <!-- Rolling bar + live donut -->
    <v-row class="mb-6">
      <v-col cols="12" md="7">
        <v-card rounded="lg" class="pa-5" height="100%">
          <p class="text-body-2 font-weight-medium mb-1">Requests per second</p>
          <p class="text-caption text-medium-emphasis mb-4">Bars turn orange above 50 and red above 80</p>
          <ClientOnly>
            <CommonChart type="bar" :data="liveBarData" :options="liveBarOptions" :height="220" :version="liveVersion" />
          </ClientOnly>
        </v-card>
      </v-col>
      <v-col cols="12" md="5">
        <v-card rounded="lg" class="pa-5" height="100%">
          <p class="text-body-2 font-weight-medium mb-1">Worker state distribution</p>
          <p class="text-caption text-medium-emphasis mb-4">Segments shift on every tick</p>
          <ClientOnly>
            <CommonChart type="doughnut" :data="liveDonutData" :height="220" :version="liveVersion" />
          </ClientOnly>
        </v-card>
      </v-col>
    </v-row>

    <!-- Usage -->
    <h2 class="text-overline text-medium-emphasis mb-4">Usage</h2>
    <v-card rounded="lg" class="pa-6">
      <v-sheet rounded="lg" color="surface-variant" class="pa-4 mb-4">
        <pre class="text-body-2"><code v-pre>&lt;ClientOnly&gt;
  &lt;CommonChart
    type="line"
    :data="chartData"
    :options="chartOptions"
    :height="300"
  /&gt;
&lt;/ClientOnly&gt;</code></pre>
      </v-sheet>
      <p class="text-body-2 font-weight-bold mb-2">Props</p>
      <v-table density="compact">
        <thead><tr><th>Prop</th><th>Type</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>type</code></td><td>ChartType</td><td>line | bar | doughnut | pie | radar</td></tr>
          <tr><td><code>data</code></td><td>ChartData</td><td>Chart.js data object (reactive)</td></tr>
          <tr><td><code>options</code></td><td>ChartOptions</td><td>Chart.js options (merged with defaults)</td></tr>
          <tr><td><code>height</code></td><td>number</td><td>Canvas height in px (default 300)</td></tr>
        </tbody>
      </v-table>
      <v-alert type="info" variant="tonal" density="compact" class="mt-4" icon="mdi-information-outline">
        Wrap in <code>&lt;ClientOnly&gt;</code> — Chart.js requires a browser canvas and cannot render server-side.
      </v-alert>
    </v-card>
  </div>
</template>
