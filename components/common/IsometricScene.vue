<script setup lang="ts">

export type IsoBlockType = 'cube' | 'flat' | 'ramp-n' | 'ramp-s' | 'ramp-e' | 'ramp-w'

export interface IsoBlock {
  x:      number
  y:      number
  z:      number
  type:   IsoBlockType
  color:  string
  label?: string
  data?:  unknown
}

export interface IsoScene {
  blocks:     IsoBlock[]
  gridWidth:  number
  gridDepth:  number
  blockSize:  number
}

const props = withDefaults(defineProps<{
  scene:        IsoScene
  height?:      string
  interactive?: boolean
  showGrid?:    boolean
  animated?:    boolean
}>(), {
  height:       '500px',
  interactive:  true,
  showGrid:     true,
  animated:     false,
})

const emit = defineEmits<{
  'block-click':  [block: IsoBlock]
  'block-hover':  [block: IsoBlock | null]
}>()

function darkenHex(hex: string, amount: number): string {
  const clean = hex.replace('#', '')
  const r = Math.max(0, parseInt(clean.slice(0, 2), 16) - amount)
  const g = Math.max(0, parseInt(clean.slice(2, 4), 16) - amount)
  const b = Math.max(0, parseInt(clean.slice(4, 6), 16) - amount)
  return '#' + [r, g, b].map(v => Math.min(255, v).toString(16).padStart(2, '0')).join('')
}

function toScreen(x: number, y: number, z: number, bs: number, originX: number, originY: number) {
  return {
    sx: (x - y) * (bs / 2) + originX,
    sy: (x + y) * (bs / 4) - z * (bs / 2) + originY,
  }
}

interface RenderedPolygon {
  points:  string
  fill:    string
  stroke:  string
  block:   IsoBlock
  face:    'top' | 'left' | 'right' | 'flat'
  key:     string
}

interface RenderedLabel {
  x:     number
  y:     number
  text:  string
  block: IsoBlock
}

const hoveredBlock = ref<IsoBlock | null>(null)
const mounted      = ref(false)

onMounted(() => {
  if (props.animated) {
    requestAnimationFrame(() => { mounted.value = true })
  } else {
    mounted.value = true
  }
})

const svgWidth  = computed(() => {
  const { gridWidth, gridDepth, blockSize } = props.scene
  return (gridWidth + gridDepth) * (blockSize / 2) + blockSize * 2
})

const svgHeight = computed(() => {
  const { gridWidth, gridDepth, blockSize } = props.scene
  const maxZ = props.scene.blocks.reduce((m, b) => Math.max(m, b.z + 1), 1)
  return (gridWidth + gridDepth) * (blockSize / 4) + maxZ * (blockSize / 2) + blockSize * 2
})

const originX = computed(() => svgWidth.value / 2)
const originY = computed(() => {
  const { blockSize } = props.scene
  const maxZ = props.scene.blocks.reduce((m, b) => Math.max(m, b.z + 1), 1)
  return maxZ * (blockSize / 2) + blockSize
})

function buildCubePolygons(block: IsoBlock): RenderedPolygon[] {
  const bs = props.scene.blockSize
  const ox = originX.value
  const oy = originY.value
  const { x, y, z } = block
  const isHovered = hoveredBlock.value === block

  const top   = block.color
  const left  = darkenHex(block.color, isHovered ? 10 : 30)
  const right = darkenHex(block.color, isHovered ? 20 : 50)

  const tl = toScreen(x,     y,     z + 1, bs, ox, oy)
  const tr = toScreen(x + 1, y,     z + 1, bs, ox, oy)
  const bl = toScreen(x,     y + 1, z + 1, bs, ox, oy)
  const br = toScreen(x + 1, y + 1, z + 1, bs, ox, oy)

  const tl0 = toScreen(x,     y,     z, bs, ox, oy)
  const tr0 = toScreen(x + 1, y,     z, bs, ox, oy)
  const bl0 = toScreen(x,     y + 1, z, bs, ox, oy)
  const br0 = toScreen(x + 1, y + 1, z, bs, ox, oy)

  const pt = (p: { sx: number; sy: number }) => `${p.sx},${p.sy}`
  const key = `${block.x}-${block.y}-${block.z}`

  return [
    {
      points: `${pt(tl)} ${pt(tr)} ${pt(br)} ${pt(bl)}`,
      fill:   top,
      stroke: darkenHex(top, 15),
      block,
      face:   'top',
      key:    `${key}-top`,
    },
    {
      points: `${pt(tl)} ${pt(tl0)} ${pt(bl0)} ${pt(bl)}`,
      fill:   left,
      stroke: darkenHex(left, 10),
      block,
      face:   'left',
      key:    `${key}-left`,
    },
    {
      points: `${pt(tr)} ${pt(tr0)} ${pt(br0)} ${pt(br)}`,
      fill:   right,
      stroke: darkenHex(right, 10),
      block,
      face:   'right',
      key:    `${key}-right`,
    },
  ]
}

function buildFlatPolygons(block: IsoBlock): RenderedPolygon[] {
  const bs = props.scene.blockSize
  const ox = originX.value
  const oy = originY.value
  const { x, y, z } = block
  const isHovered = hoveredBlock.value === block
  const fill = isHovered ? darkenHex(block.color, -15) : block.color

  const tl = toScreen(x,     y,     z + 0.2, bs, ox, oy)
  const tr = toScreen(x + 1, y,     z + 0.2, bs, ox, oy)
  const bl = toScreen(x,     y + 1, z + 0.2, bs, ox, oy)
  const br = toScreen(x + 1, y + 1, z + 0.2, bs, ox, oy)

  const pt = (p: { sx: number; sy: number }) => `${p.sx},${p.sy}`
  const key = `${block.x}-${block.y}-${block.z}`

  return [
    {
      points: `${pt(tl)} ${pt(tr)} ${pt(br)} ${pt(bl)}`,
      fill,
      stroke:  darkenHex(fill, 20),
      block,
      face:    'flat',
      key:     `${key}-flat`,
    },
  ]
}

function buildRampPolygons(block: IsoBlock): RenderedPolygon[] {
  const bs = props.scene.blockSize
  const ox = originX.value
  const oy = originY.value
  const { x, y, z, type } = block
  const isHovered = hoveredBlock.value === block
  const topColor  = isHovered ? darkenHex(block.color, -10) : block.color
  const leftColor = darkenHex(block.color, isHovered ? 10 : 30)
  const rightColor = darkenHex(block.color, isHovered ? 20 : 50)

  const tl  = toScreen(x,     y,     z + 1, bs, ox, oy)
  const tr  = toScreen(x + 1, y,     z + 1, bs, ox, oy)
  const bl  = toScreen(x,     y + 1, z + 1, bs, ox, oy)
  const br  = toScreen(x + 1, y + 1, z + 1, bs, ox, oy)
  const tl0 = toScreen(x,     y,     z,     bs, ox, oy)
  const tr0 = toScreen(x + 1, y,     z,     bs, ox, oy)
  const bl0 = toScreen(x,     y + 1, z,     bs, ox, oy)
  const br0 = toScreen(x + 1, y + 1, z,     bs, ox, oy)

  const pt = (p: { sx: number; sy: number }) => `${p.sx},${p.sy}`
  const key = `${block.x}-${block.y}-${block.z}`

  if (type === 'ramp-n') {
    return [
      { points: `${pt(tl0)} ${pt(tr0)} ${pt(br)} ${pt(bl)}`, fill: topColor, stroke: darkenHex(topColor, 15), block, face: 'top', key: `${key}-top` },
      { points: `${pt(tl0)} ${pt(bl0)} ${pt(bl)}`,           fill: leftColor, stroke: darkenHex(leftColor, 10), block, face: 'left', key: `${key}-left` },
      { points: `${pt(tr0)} ${pt(br0)} ${pt(br)}`,           fill: rightColor, stroke: darkenHex(rightColor, 10), block, face: 'right', key: `${key}-right` },
    ]
  }
  if (type === 'ramp-s') {
    return [
      { points: `${pt(tl)} ${pt(tr)} ${pt(br0)} ${pt(bl0)}`, fill: topColor, stroke: darkenHex(topColor, 15), block, face: 'top', key: `${key}-top` },
      { points: `${pt(tl)} ${pt(tl0)} ${pt(bl0)}`,           fill: leftColor, stroke: darkenHex(leftColor, 10), block, face: 'left', key: `${key}-left` },
      { points: `${pt(tr)} ${pt(tr0)} ${pt(br0)}`,           fill: rightColor, stroke: darkenHex(rightColor, 10), block, face: 'right', key: `${key}-right` },
    ]
  }
  if (type === 'ramp-e') {
    return [
      { points: `${pt(tl)} ${pt(tr0)} ${pt(br0)} ${pt(bl)}`, fill: topColor, stroke: darkenHex(topColor, 15), block, face: 'top', key: `${key}-top` },
      { points: `${pt(tl)} ${pt(tl0)} ${pt(bl0)} ${pt(bl)}`, fill: leftColor, stroke: darkenHex(leftColor, 10), block, face: 'left', key: `${key}-left` },
      { points: `${pt(tr0)} ${pt(br0)}`,                      fill: rightColor, stroke: 'none', block, face: 'right', key: `${key}-right` },
    ]
  }
  if (type === 'ramp-w') {
    return [
      { points: `${pt(tl0)} ${pt(tr)} ${pt(br)} ${pt(bl0)}`, fill: topColor, stroke: darkenHex(topColor, 15), block, face: 'top', key: `${key}-top` },
      { points: `${pt(tl0)} ${pt(bl0)}`,                      fill: leftColor, stroke: 'none', block, face: 'left', key: `${key}-left` },
      { points: `${pt(tr)} ${pt(tr0)} ${pt(br0)} ${pt(br)}`, fill: rightColor, stroke: darkenHex(rightColor, 10), block, face: 'right', key: `${key}-right` },
    ]
  }
  return buildCubePolygons(block)
}

const sortedBlocks = computed(() =>
  [...props.scene.blocks].sort((a, b) => (a.x + a.y + a.z) - (b.x + b.y + b.z))
)

const polygons = computed((): RenderedPolygon[] => {
  const result: RenderedPolygon[] = []
  for (const block of sortedBlocks.value) {
    if (block.type === 'cube')   result.push(...buildCubePolygons(block))
    else if (block.type === 'flat') result.push(...buildFlatPolygons(block))
    else                         result.push(...buildRampPolygons(block))
  }
  return result
})

const labels = computed((): RenderedLabel[] => {
  const bs = props.scene.blockSize
  const ox = originX.value
  const oy = originY.value
  return sortedBlocks.value
    .filter(b => b.label)
    .map(b => {
      const cx = toScreen(b.x + 0.5, b.y + 0.5, b.z + 1, bs, ox, oy)
      return { x: cx.sx, y: cx.sy - bs * 0.05, text: b.label!, block: b }
    })
})

function gridLines() {
  const { gridWidth, gridDepth, blockSize } = props.scene
  const bs  = blockSize
  const ox  = originX.value
  const oy  = originY.value
  const lines: { x1: number; y1: number; x2: number; y2: number }[] = []

  for (let xi = 0; xi <= gridWidth; xi++) {
    const s = toScreen(xi, 0,          0, bs, ox, oy)
    const e = toScreen(xi, gridDepth,  0, bs, ox, oy)
    lines.push({ x1: s.sx, y1: s.sy, x2: e.sx, y2: e.sy })
  }
  for (let yi = 0; yi <= gridDepth; yi++) {
    const s = toScreen(0,          yi, 0, bs, ox, oy)
    const e = toScreen(gridWidth,  yi, 0, bs, ox, oy)
    lines.push({ x1: s.sx, y1: s.sy, x2: e.sx, y2: e.sy })
  }
  return lines
}

function onPolyClick(block: IsoBlock) {
  if (!props.interactive) return
  emit('block-click', block)
}

function onPolyEnter(block: IsoBlock) {
  if (!props.interactive) return
  hoveredBlock.value = block
  emit('block-hover', block)
}

function onPolyLeave() {
  if (!props.interactive) return
  hoveredBlock.value = null
  emit('block-hover', null)
}
</script>

<template>
  <div class="iso-scene-wrapper" :style="{ height: props.height, overflow: 'auto' }">
    <svg
      :width="svgWidth"
      :height="svgHeight"
      :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
      class="iso-svg"
    >
      <g v-if="showGrid" class="iso-grid">
        <line
          v-for="(line, i) in gridLines()"
          :key="i"
          :x1="line.x1"
          :y1="line.y1"
          :x2="line.x2"
          :y2="line.y2"
          stroke="currentColor"
          stroke-width="0.5"
          opacity="0.15"
        />
      </g>

      <g class="iso-blocks">
        <polygon
          v-for="poly in polygons"
          :key="poly.key"
          :points="poly.points"
          :fill="poly.fill"
          :stroke="poly.stroke"
          stroke-width="0.5"
          :class="[
            'iso-poly',
            { 'iso-poly--interactive': interactive },
            { 'iso-poly--animated': animated },
            { 'iso-poly--visible': mounted },
          ]"
          @click="onPolyClick(poly.block)"
          @mouseenter="onPolyEnter(poly.block)"
          @mouseleave="onPolyLeave"
        />
      </g>

      <g class="iso-labels">
        <text
          v-for="lbl in labels"
          :key="`${lbl.block.x}-${lbl.block.y}-${lbl.block.z}-label`"
          :x="lbl.x"
          :y="lbl.y"
          text-anchor="middle"
          dominant-baseline="middle"
          class="iso-label"
          :font-size="scene.blockSize * 0.22"
          fill="currentColor"
          opacity="0.85"
          pointer-events="none"
        >{{ lbl.text }}</text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.iso-scene-wrapper {
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.iso-svg {
  display: block;
  max-width: 100%;
}

.iso-poly--interactive {
  cursor: pointer;
}

.iso-poly--animated {
  transform-origin: center bottom;
  opacity: 0;
  transform: translateY(-20px);
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.iso-poly--animated.iso-poly--visible {
  opacity: 1;
  transform: translateY(0);
}

.iso-label {
  font-family: system-ui, sans-serif;
  font-weight: 600;
  pointer-events: none;
  user-select: none;
}
</style>
