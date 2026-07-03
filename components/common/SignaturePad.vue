<script setup lang="ts">
const props = withDefaults(defineProps<{
  width?: number
  height?: number
  strokeColor?: string
  strokeWidth?: number
  backgroundColor?: string
}>(), {
  width: 600,
  height: 200,
  strokeColor: '#000000',
  strokeWidth: 2,
  backgroundColor: '#ffffff',
})

const emit = defineEmits<{
  (e: 'change', dataUrl: string): void
  (e: 'clear'): void
}>()

const canvasRef = ref<HTMLCanvasElement>()
const isDrawing = ref(false)
const isEmpty = ref(true)

let ctx: CanvasRenderingContext2D | null = null

const getPos = (e: MouseEvent | TouchEvent) => {
  const canvas = canvasRef.value!
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  if (e instanceof TouchEvent) {
    const touch = e.touches[0]!
    return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY }
  }
  return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY }
}

const startDraw = (e: MouseEvent | TouchEvent) => {
  e.preventDefault()
  if (!ctx) return
  isDrawing.value = true
  const { x, y } = getPos(e)
  ctx.beginPath()
  ctx.moveTo(x, y)
}

const draw = (e: MouseEvent | TouchEvent) => {
  e.preventDefault()
  if (!isDrawing.value || !ctx) return
  const { x, y } = getPos(e)
  ctx.lineTo(x, y)
  ctx.stroke()
  isEmpty.value = false
}

const endDraw = () => {
  if (!isDrawing.value) return
  isDrawing.value = false
  emit('change', canvasRef.value!.toDataURL())
}

const clear = () => {
  if (!ctx || !canvasRef.value) return
  ctx.fillStyle = props.backgroundColor
  ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  isEmpty.value = true
  emit('clear')
}

const toDataURL = () => canvasRef.value?.toDataURL() ?? ''

onMounted(() => {
  const canvas = canvasRef.value!
  ctx = canvas.getContext('2d')!
  ctx.strokeStyle = props.strokeColor
  ctx.lineWidth = props.strokeWidth
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.fillStyle = props.backgroundColor
  ctx.fillRect(0, 0, canvas.width, canvas.height)
})

watch(() => props.strokeColor, (v) => { if (ctx) ctx.strokeStyle = v })
watch(() => props.strokeWidth, (v) => { if (ctx) ctx.lineWidth = v })

defineExpose({ clear, toDataURL, isEmpty })
</script>

<template>
  <div class="signature-pad-wrapper">
    <canvas
      ref="canvasRef"
      :width="width"
      :height="height"
      class="signature-pad-canvas rounded-lg"
      :style="{ cursor: 'crosshair', touchAction: 'none', width: '100%', display: 'block' }"
      @mousedown="startDraw"
      @mousemove="draw"
      @mouseup="endDraw"
      @mouseleave="endDraw"
      @touchstart="startDraw"
      @touchmove="draw"
      @touchend="endDraw"
    />
    <p v-if="isEmpty" class="signature-pad-hint text-caption text-medium-emphasis text-center mt-2">
      Sign above
    </p>
  </div>
</template>

<style scoped>
.signature-pad-canvas {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
