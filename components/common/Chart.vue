<script setup lang="ts">
import type {
  ChartType,
  ChartData,
  ChartOptions,
  Chart as ChartInstance,
} from 'chart.js'

const props = withDefaults(defineProps<{
  type: ChartType
  data: ChartData
  options?: ChartOptions
  height?: number
  version?: number
}>(), {
  height: 300,
  version: 0,
})

const canvasRef = ref<HTMLCanvasElement>()
let chart: ChartInstance | null = null

const { theme } = useAppTheme()

const gridColor = computed(() =>
  theme.value === 'dark'
    ? 'rgba(255,255,255,0.08)'
    : 'rgba(0,0,0,0.06)',
)
const tickColor = computed(() =>
  theme.value === 'dark'
    ? 'rgba(255,255,255,0.45)'
    : 'rgba(0,0,0,0.45)',
)

const buildOptions = (): ChartOptions => {
  const isCartesian = props.type !== 'pie' && props.type !== 'doughnut' && props.type !== 'radar'
  const userScales = (props.options as ChartOptions<'line'>)?.scales ?? {}

  const scales = isCartesian ? {
    x: {
      grid: { color: gridColor.value },
      ticks: { color: tickColor.value, font: { size: 11 } },
      ...userScales.x,
    },
    y: {
      grid: { color: gridColor.value },
      ticks: { color: tickColor.value, font: { size: 11 } },
      beginAtZero: true,
      ...userScales.y,
    },
  } : undefined

  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 600 },
    ...props.options,
    plugins: {
      legend: {
        labels: { color: tickColor.value, boxWidth: 12, padding: 16, font: { size: 12 } },
      },
      tooltip: { mode: 'index', intersect: false },
      ...props.options?.plugins,
    },
    ...(scales ? { scales } : {}),
  } as ChartOptions
}

const initChart = async () => {
  if (!canvasRef.value) return

  const {
    Chart,
    LineElement, BarElement, PointElement, ArcElement,
    LineController, BarController, DoughnutController, PieController, RadarController,
    CategoryScale, LinearScale, RadialLinearScale,
    Filler, Legend, Tooltip,
  } = await import('chart.js')

  Chart.register(
    LineElement, BarElement, PointElement, ArcElement,
    LineController, BarController, DoughnutController, PieController, RadarController,
    CategoryScale, LinearScale, RadialLinearScale,
    Filler, Legend, Tooltip,
  )

  chart = new Chart(canvasRef.value, {
    type: props.type,
    data: JSON.parse(JSON.stringify(toRaw(props.data))),
    options: buildOptions(),
  })
}

const destroyChart = () => {
  chart?.destroy()
  chart = null
}

watch(() => props.version, () => {
  if (!chart) return
  const raw = JSON.parse(JSON.stringify(toRaw(props.data)))
  chart.data.labels = raw.labels
  raw.datasets.forEach((ds: ChartData['datasets'][number], i: number) => {
    if (chart!.data.datasets[i]) {
      Object.assign(chart!.data.datasets[i], ds)
    } else {
      chart!.data.datasets.push(ds as never)
    }
  })
  chart.data.datasets.splice(raw.datasets.length)
  chart.update('none')
})

watch(() => props.options, () => {
  if (!chart) return
  chart.options = buildOptions()
  chart.update('none')
})

watch(theme, () => {
  if (!chart) return
  chart.options = buildOptions()
  chart.update()
})

onMounted(initChart)
onUnmounted(destroyChart)
</script>

<template>
  <div :style="{ position: 'relative', height: `${height}px` }">
    <canvas ref="canvasRef" />
  </div>
</template>
