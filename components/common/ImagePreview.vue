<script setup lang="ts">
import type { UploadFile } from './FileUpload.vue'

const props = defineProps<{
  modelValue: boolean
  file: UploadFile | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'confirm', dataUrl: string, file: UploadFile): void
}>()

const canvasRef = ref<HTMLCanvasElement>()
const rotation = ref(0)
const cropMode = ref(false)

// Crop state
const cropBox = reactive({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 })
const dragging = ref<null | 'move' | 'br'>(null)
const dragStart = reactive({ mx: 0, my: 0, bx: 0, by: 0, bw: 0, bh: 0 })

const imgEl = ref<HTMLImageElement | null>(null)
const naturalW = ref(0)
const naturalH = ref(0)
const canvasSize = 480

const loadImage = () => {
  if (!props.file?.preview) return
  const img = new Image()
  img.onload = () => {
    imgEl.value = img
    naturalW.value = img.naturalWidth
    naturalH.value = img.naturalHeight
    rotation.value = 0
    cropMode.value = false
    cropBox.x = 0.1; cropBox.y = 0.1; cropBox.w = 0.8; cropBox.h = 0.8
    draw()
  }
  img.src = props.file.preview!
}

watch(() => props.file, loadImage)
watch(() => props.modelValue, (v) => { if (v) loadImage() })

const draw = () => {
  const canvas = canvasRef.value
  const img = imgEl.value
  if (!canvas || !img) return
  const ctx = canvas.getContext('2d')!
  canvas.width = canvasSize
  canvas.height = canvasSize
  ctx.clearRect(0, 0, canvasSize, canvasSize)

  ctx.save()
  ctx.translate(canvasSize / 2, canvasSize / 2)
  ctx.rotate((rotation.value * Math.PI) / 180)

  const scale = Math.min(canvasSize / img.naturalWidth, canvasSize / img.naturalHeight) * 0.9
  const w = img.naturalWidth * scale
  const h = img.naturalHeight * scale
  ctx.drawImage(img, -w / 2, -h / 2, w, h)
  ctx.restore()

  if (cropMode.value) {
    const cx = cropBox.x * canvasSize
    const cy = cropBox.y * canvasSize
    const cw = cropBox.w * canvasSize
    const ch = cropBox.h * canvasSize

    ctx.fillStyle = 'rgba(0,0,0,0.45)'
    ctx.fillRect(0, 0, canvasSize, cy)
    ctx.fillRect(0, cy + ch, canvasSize, canvasSize - cy - ch)
    ctx.fillRect(0, cy, cx, ch)
    ctx.fillRect(cx + cw, cy, canvasSize - cx - cw, ch)

    ctx.strokeStyle = 'white'
    ctx.lineWidth = 2
    ctx.strokeRect(cx, cy, cw, ch)

    ctx.fillStyle = 'white'
    const hs = 8
    ctx.fillRect(cx + cw - hs / 2, cy + ch - hs / 2, hs, hs)
  }
}

watch([rotation, cropMode, cropBox], draw, { deep: true })

const rotate = (deg: number) => {
  rotation.value = (rotation.value + deg + 360) % 360
}

const onMouseDown = (e: MouseEvent) => {
  if (!cropMode.value) return
  const canvas = canvasRef.value!
  const rect = canvas.getBoundingClientRect()
  const mx = (e.clientX - rect.left) / rect.width
  const my = (e.clientY - rect.top) / rect.height
  const cx = cropBox.x, cy = cropBox.y, cw = cropBox.w, ch = cropBox.h
  const handleZone = 0.04
  if (Math.abs(mx - (cx + cw)) < handleZone && Math.abs(my - (cy + ch)) < handleZone) {
    dragging.value = 'br'
  } else if (mx > cx && mx < cx + cw && my > cy && my < cy + ch) {
    dragging.value = 'move'
  }
  Object.assign(dragStart, { mx, my, bx: cx, by: cy, bw: cw, bh: ch })
}

const onMouseMove = (e: MouseEvent) => {
  if (!dragging.value) return
  const canvas = canvasRef.value!
  const rect = canvas.getBoundingClientRect()
  const mx = (e.clientX - rect.left) / rect.width
  const my = (e.clientY - rect.top) / rect.height
  const dx = mx - dragStart.mx
  const dy = my - dragStart.my

  if (dragging.value === 'move') {
    cropBox.x = Math.max(0, Math.min(1 - cropBox.w, dragStart.bx + dx))
    cropBox.y = Math.max(0, Math.min(1 - cropBox.h, dragStart.by + dy))
  } else if (dragging.value === 'br') {
    cropBox.w = Math.max(0.1, Math.min(1 - cropBox.x, dragStart.bw + dx))
    cropBox.h = Math.max(0.1, Math.min(1 - cropBox.y, dragStart.bh + dy))
  }
}

const onMouseUp = () => { dragging.value = null }

const confirm = () => {
  const canvas = canvasRef.value!
  const img = imgEl.value!
  const out = document.createElement('canvas')

  if (cropMode.value) {
    out.width = Math.round(cropBox.w * canvasSize)
    out.height = Math.round(cropBox.h * canvasSize)
    out.getContext('2d')!.drawImage(canvas, cropBox.x * canvasSize, cropBox.y * canvasSize, out.width, out.height, 0, 0, out.width, out.height)
  } else {
    out.width = canvasSize
    out.height = canvasSize
    out.getContext('2d')!.drawImage(canvas, 0, 0)
  }

  emit('confirm', out.toDataURL('image/jpeg', 0.92), props.file!)
  emit('update:modelValue', false)
}
</script>

<template>
  <v-dialog :model-value="modelValue" max-width="560" @update:model-value="emit('update:modelValue', $event)">
    <v-card rounded="lg">
      <v-card-title class="pa-5 pb-2 d-flex align-center justify-space-between">
        <span>Preview image</span>
        <v-btn icon="mdi-close" variant="text" size="small" @click="emit('update:modelValue', false)" />
      </v-card-title>

      <v-card-text class="pa-5 pt-2">
        <div class="d-flex justify-center mb-3">
          <canvas
            ref="canvasRef"
            :width="canvasSize"
            :height="canvasSize"
            style="max-width: 100%; border-radius: 8px; cursor: crosshair;"
            @mousedown="onMouseDown"
            @mousemove="onMouseMove"
            @mouseup="onMouseUp"
            @mouseleave="onMouseUp"
          />
        </div>

        <div class="d-flex justify-center gap-2 flex-wrap">
          <v-btn-group variant="tonal" density="compact">
            <v-btn icon="mdi-rotate-left" @click="rotate(-90)" />
            <v-btn icon="mdi-rotate-right" @click="rotate(90)" />
          </v-btn-group>

          <v-btn
            :color="cropMode ? 'primary' : 'default'"
            :variant="cropMode ? 'tonal' : 'outlined'"
            prepend-icon="mdi-crop"
            density="compact"
            @click="cropMode = !cropMode"
          >
            {{ cropMode ? 'Cropping' : 'Crop' }}
          </v-btn>
        </div>

        <p v-if="cropMode" class="text-caption text-medium-emphasis text-center mt-2">
          Drag the box to move · drag the corner handle to resize
        </p>
      </v-card-text>

      <v-card-actions class="pa-5 pt-0">
        <v-spacer />
        <v-btn variant="text" @click="emit('update:modelValue', false)">Cancel</v-btn>
        <v-btn color="primary" variant="tonal" @click="confirm">Use this image</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
