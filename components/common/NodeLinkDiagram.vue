<script setup lang="ts">
import { useTheme } from 'vuetify'

export interface NLNode {
  id: string
  label: string
  x: number
  y: number
  color?: string
  textColor?: string
  shape?: 'circle' | 'rect' | 'diamond'
  radius?: number
  width?: number
  height?: number
  meta?: Record<string, string>
  group?: string
}

export interface NLEdge {
  id: string
  from: string
  to: string
  label?: string
  color?: string
  width?: number
  dashed?: boolean
  bidirectional?: boolean
  directed?: boolean
  via?: [number, number][]
}

export interface NLGroup {
  id: string
  label: string
  color: string
}

const props = withDefaults(defineProps<{
  nodes: NLNode[]
  edges: NLEdge[]
  groups?: NLGroup[]
  width?: string
  height?: string
  viewBox?: string
  background?: string
  minZoom?: number
  maxZoom?: number
  showGrid?: boolean
  showTooltip?: boolean
  animated?: boolean
}>(), {
  width: '100%',
  height: '500px',
  minZoom: 0.3,
  maxZoom: 3,
  showGrid: false,
  showTooltip: true,
  animated: false,
})

const emit = defineEmits<{
  'node-click': [node: NLNode]
  'edge-click': [edge: NLEdge]
  'node-hover': [node: NLNode | null]
}>()

const vuetifyTheme = useTheme()

const containerEl = ref<HTMLDivElement | null>(null)

const panX = ref(0)
const panY = ref(0)
const zoom = ref(1)

const hoveredNodeId = ref<string | null>(null)
const selectedNodeId = ref<string | null>(null)

const tooltipVisible = ref(false)
const tooltipX = ref(0)
const tooltipY = ref(0)
const tooltipNode = ref<NLNode | null>(null)

const isPanning = ref(false)
const panStartX = ref(0)
const panStartY = ref(0)
const panStartPanX = ref(0)
const panStartPanY = ref(0)

const edgesAnimated = ref(false)

const primaryColor = computed(() => {
  const colors = vuetifyTheme.current.value.colors
  return (colors as Record<string, string>)['primary'] ?? '#6366f1'
})

const nodeMap = computed(() => {
  const m = new Map<string, NLNode>()
  for (const n of props.nodes) m.set(n.id, n)
  return m
})

const computedViewBox = computed(() => {
  if (props.viewBox) return props.viewBox
  if (props.nodes.length === 0) return '0 0 800 500'

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const n of props.nodes) {
    const r = nodeRadius(n)
    if (n.x - r < minX) minX = n.x - r
    if (n.y - r < minY) minY = n.y - r
    if (n.x + r > maxX) maxX = n.x + r
    if (n.y + r > maxY) maxY = n.y + r
  }
  const pad = 40
  return `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`
})

const parsedViewBox = computed(() => {
  const parts = computedViewBox.value.split(' ').map(Number)
  return {
    x: parts[0] ?? 0,
    y: parts[1] ?? 0,
    w: parts[2] ?? 800,
    h: parts[3] ?? 500,
  }
})

const activeViewBox = computed(() => {
  const { x, y, w, h } = parsedViewBox.value
  const vw = w / zoom.value
  const vh = h / zoom.value
  const cx = x + w / 2 - panX.value / zoom.value
  const cy = y + h / 2 - panY.value / zoom.value
  return `${cx - vw / 2} ${cy - vh / 2} ${vw} ${vh}`
})

function nodeRadius(n: NLNode): number {
  const shape = n.shape ?? 'circle'
  if (shape === 'circle') return n.radius ?? 22
  const w = n.width ?? 60
  const h = n.height ?? 36
  return Math.sqrt(w * w + h * h) / 2
}

// Border color comes from node.color; fill is always white (light) / dark-surface (dark).
// The page passes color as the accent/line color which becomes the border.
function nodeBorderColor(n: NLNode): string {
  return n.color ?? primaryColor.value
}

function edgeColor(e: NLEdge): string {
  return e.color ?? '#94a3b8'
}

function markerId(color: string, tip: 'end' | 'start'): string {
  return `arrow-${tip}-${color.replace('#', '')}`
}

const uniqueEdgeColors = computed(() => {
  const colors = new Set<string>()
  for (const e of props.edges) {
    if (e.directed || e.bidirectional) {
      colors.add(edgeColor(e))
    }
  }
  return [...colors]
})

// ── Orthogonal edge router ────────────────────────────────────────────────
//
// Produces an SVG path string that travels in axis-aligned (H/V) segments
// with rounded 45°-arc corners. The route:
//   1. Exits the source node horizontally (or vertically if dx < dy).
//   2. Turns with a smooth arc (radius = cornerR) at each bend.
//   3. Arrives at the target node.
//
// If the edge has explicit `via` waypoints those are used as the segment
// vertices and the same corner-rounding is applied.

const CORNER_R = 14  // arc radius at each bend, in SVG units

function sign(v: number): number { return v > 0 ? 1 : v < 0 ? -1 : 0 }

// Build a rounded-corner SVG path through an ordered list of [x,y] points.
function roundedPath(pts: [number, number][]): string {
  if (pts.length < 2) return ''
  if (pts.length === 2) {
    const [ax, ay] = pts[0]!
    const [bx, by] = pts[1]!
    return `M${ax},${ay} L${bx},${by}`
  }

  let d = `M${pts[0]![0]},${pts[0]![1]}`

  for (let i = 1; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i - 1]!
    const [x1, y1] = pts[i]!
    const [x2, y2] = pts[i + 1]!

    const seg1Len = Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2)
    const seg2Len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
    const r = Math.min(CORNER_R, seg1Len / 2, seg2Len / 2)

    // Point just before the corner on incoming segment
    const t1x = x1 - sign(x1 - x0) * r
    const t1y = y1 - sign(y1 - y0) * r
    // Point just after the corner on outgoing segment
    const t2x = x1 + sign(x2 - x1) * r
    const t2y = y1 + sign(y2 - y1) * r

    // sweep-flag: 1 = clockwise arc
    const cross = (x1 - x0) * (y2 - y1) - (y1 - y0) * (x2 - x1)
    const sweep = cross > 0 ? 1 : 0

    d += ` L${t1x},${t1y} A${r},${r} 0 0,${sweep} ${t2x},${t2y}`
  }

  const last = pts[pts.length - 1]!
  d += ` L${last[0]},${last[1]}`
  return d
}

// Compute waypoints for an edge that has no explicit `via`.
// Prefers horizontal-first routing; falls back to vertical-first when
// the nodes are stacked more vertically than horizontally.
function autoRoute(from: NLNode, to: NLNode): [number, number][] {
  const fx = from.x, fy = from.y
  const tx = to.x,   ty = to.y
  const dx = tx - fx, dy = ty - fy

  // Straight line — same position (degenerate)
  if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return [[fx, fy], [tx, ty]]

  // Purely horizontal or vertical — no bend needed
  if (Math.abs(dy) < 2) return [[fx, fy], [tx, ty]]
  if (Math.abs(dx) < 2) return [[fx, fy], [tx, ty]]

  // Horizontal-first: go right/left to midpoint X, then up/down
  const midX = fx + dx / 2
  return [[fx, fy], [midX, fy], [midX, ty], [tx, ty]]
}

function edgePath(e: NLEdge): string {
  const from = nodeMap.value.get(e.from)
  const to = nodeMap.value.get(e.to)
  if (!from || !to) return ''

  let pts: [number, number][]
  if (e.via && e.via.length > 0) {
    pts = [[from.x, from.y], ...e.via, [to.x, to.y]]
  } else {
    pts = autoRoute(from, to)
  }
  return roundedPath(pts)
}

function edgeMidpoint(e: NLEdge): { x: number; y: number; angle: number } {
  const from = nodeMap.value.get(e.from)
  const to = nodeMap.value.get(e.to)
  if (!from || !to) return { x: 0, y: 0, angle: 0 }

  // Use the midpoint of the longest segment for label placement
  let pts: [number, number][]
  if (e.via && e.via.length > 0) {
    pts = [[from.x, from.y], ...e.via, [to.x, to.y]]
  } else {
    pts = autoRoute(from, to)
  }

  // Find the longest segment
  let bestLen = -1, bestMx = 0, bestMy = 0, bestAngle = 0
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i]!
    const [bx, by] = pts[i + 1]!
    const len = Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2)
    if (len > bestLen) {
      bestLen = len
      bestMx = (ax + bx) / 2
      bestMy = (ay + by) / 2
      bestAngle = Math.atan2(by - ay, bx - ax) * 180 / Math.PI
    }
  }
  return { x: bestMx, y: bestMy, angle: bestAngle }
}

function getMarkerEnd(e: NLEdge): string {
  if (e.directed || e.bidirectional) return `url(#${markerId(edgeColor(e), 'end')})`
  return ''
}

function getMarkerStart(e: NLEdge): string {
  if (e.bidirectional) return `url(#${markerId(edgeColor(e), 'start')})`
  return ''
}

function edgeDashArray(e: NLEdge): string {
  return e.dashed ? '8 4' : 'none'
}

function nodeShape(n: NLNode): string {
  return n.shape ?? 'circle'
}

function nodeWidth(n: NLNode): number {
  return n.width ?? 80
}

function nodeHeight(n: NLNode): number {
  return n.height ?? 44
}

function nodeRadius2(n: NLNode): number {
  return n.radius ?? 22
}

function diamondPoints(n: NLNode): string {
  const w = nodeWidth(n) / 2
  const h = nodeHeight(n) / 2
  return `${n.x},${n.y - h} ${n.x + w},${n.y} ${n.x},${n.y + h} ${n.x - w},${n.y}`
}

function onNodeEnter(n: NLNode) {
  hoveredNodeId.value = n.id
  emit('node-hover', n)
  if (props.showTooltip) tooltipNode.value = n
}

function onNodeLeave() {
  hoveredNodeId.value = null
  emit('node-hover', null)
  tooltipVisible.value = false
  tooltipNode.value = null
}

function onNodeClick(n: NLNode) {
  selectedNodeId.value = selectedNodeId.value === n.id ? null : n.id
  emit('node-click', n)
}

function onEdgeClick(e: NLEdge) {
  emit('edge-click', e)
}

function onMouseMove(e: MouseEvent) {
  if (isPanning.value) {
    panX.value = panStartPanX.value + (e.clientX - panStartX.value)
    panY.value = panStartPanY.value + (e.clientY - panStartY.value)
    return
  }
  if (tooltipNode.value && props.showTooltip) {
    const rect = containerEl.value?.getBoundingClientRect()
    if (rect) {
      tooltipX.value = e.clientX - rect.left + 12
      tooltipY.value = e.clientY - rect.top + 12
      tooltipVisible.value = true
    }
  }
}

function onMouseDown(e: MouseEvent) {
  if ((e.target as SVGElement).closest('.nl-node')) return
  isPanning.value = true
  panStartX.value = e.clientX
  panStartY.value = e.clientY
  panStartPanX.value = panX.value
  panStartPanY.value = panY.value
  e.preventDefault()
}

function onMouseUp() {
  isPanning.value = false
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  const factor = e.deltaY < 0 ? 1.1 : 0.9
  const newZoom = Math.min(props.maxZoom, Math.max(props.minZoom, zoom.value * factor))

  if (!containerEl.value) {
    zoom.value = newZoom
    return
  }

  const rect = containerEl.value.getBoundingClientRect()
  const mx = e.clientX - rect.left
  const my = e.clientY - rect.top

  // Scale pan offset so the SVG point under the cursor stays fixed
  panX.value = mx - (mx - panX.value) * (newZoom / zoom.value)
  panY.value = my - (my - panY.value) * (newZoom / zoom.value)
  zoom.value = newZoom
}

function fitView() {
  panX.value = 0
  panY.value = 0
  zoom.value = 1
}

function edgeAnimClass(e: NLEdge): string {
  return props.animated && edgesAnimated.value ? `nl-edge-animated nl-edge-${e.id}` : ''
}

onMounted(() => {
  if (props.animated) {
    requestAnimationFrame(() => {
      edgesAnimated.value = true
    })
  }
})

const tooltipMetaEntries = computed(() => {
  if (!tooltipNode.value?.meta) return []
  return Object.entries(tooltipNode.value.meta)
})

defineExpose({ fitView })
</script>

<template>
  <div
    ref="containerEl"
    class="nl-container"
    :style="{ width: props.width, height: props.height, position: 'relative', overflow: 'hidden' }"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
    @mouseleave="onMouseUp"
  >
    <svg
      :viewBox="activeViewBox"
      :style="{
        width: '100%',
        height: '100%',
        background: props.background ?? 'transparent',
        cursor: isPanning ? 'grabbing' : 'grab',
        display: 'block',
      }"
      @mousedown="onMouseDown"
      @wheel.prevent="onWheel"
    >
      <defs>
        <!-- Drop shadow for nodes so white fill reads on any background -->
        <filter id="nl-node-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="rgba(0,0,0,0.18)" />
        </filter>

        <!-- Dot grid pattern -->
        <pattern
          v-if="props.showGrid"
          id="nl-dot-grid"
          x="0"
          y="0"
          width="30"
          height="30"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1" cy="1" r="1" fill="currentColor" opacity="0.15" />
        </pattern>

        <!-- Arrow markers for each unique edge color -->
        <marker
          v-for="color in uniqueEdgeColors"
          :key="`end-${color}`"
          :id="markerId(color, 'end')"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L8,3 z" :fill="color" />
        </marker>
        <marker
          v-for="color in uniqueEdgeColors"
          :key="`start-${color}`"
          :id="markerId(color, 'start')"
          markerWidth="8"
          markerHeight="8"
          refX="2"
          refY="3"
          orient="auto-start-reverse"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L8,3 z" :fill="color" />
        </marker>
      </defs>

      <!-- Grid background -->
      <rect
        v-if="props.showGrid"
        :x="parsedViewBox.x - 1000"
        :y="parsedViewBox.y - 1000"
        width="10000"
        height="10000"
        fill="url(#nl-dot-grid)"
      />

      <!-- Edges (drawn before nodes) -->
      <g class="nl-edges">
        <g
          v-for="edge in props.edges"
          :key="edge.id"
          class="nl-edge-group"
          @click="onEdgeClick(edge)"
        >
          <path
            :d="edgePath(edge)"
            :stroke="edgeColor(edge)"
            :stroke-width="edge.width ?? 3"
            :stroke-dasharray="edgeDashArray(edge)"
            :marker-end="getMarkerEnd(edge)"
            :marker-start="getMarkerStart(edge)"
            fill="none"
            :class="['nl-edge', edgeAnimClass(edge)]"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <!-- Invisible wider stroke for easier click target -->
          <path
            :d="edgePath(edge)"
            stroke="transparent"
            stroke-width="12"
            fill="none"
            style="cursor: pointer"
          />
          <!-- Edge label -->
          <text
            v-if="edge.label"
            :x="edgeMidpoint(edge).x"
            :y="edgeMidpoint(edge).y - 6"
            :transform="`rotate(${edgeMidpoint(edge).angle}, ${edgeMidpoint(edge).x}, ${edgeMidpoint(edge).y - 6})`"
            text-anchor="middle"
            font-size="11"
            fill="currentColor"
            opacity="0.7"
            style="pointer-events: none; user-select: none"
          >{{ edge.label }}</text>
        </g>
      </g>

      <!-- Nodes -->
      <g class="nl-nodes">
        <g
          v-for="node in props.nodes"
          :key="node.id"
          class="nl-node"
          :style="{
            cursor: 'pointer',
            transform: hoveredNodeId === node.id ? `scale(1.15)` : 'scale(1)',
            transformOrigin: `${node.x}px ${node.y}px`,
            transformBox: 'fill-box',
            transition: 'transform 0.15s ease',
          }"
          @mouseenter="onNodeEnter(node)"
          @mouseleave="onNodeLeave"
          @click.stop="onNodeClick(node)"
        >
          <!-- Selected ring — outer halo in the node's accent color -->
          <circle
            v-if="selectedNodeId === node.id && nodeShape(node) === 'circle'"
            :cx="node.x"
            :cy="node.y"
            :r="nodeRadius2(node) + 6"
            fill="none"
            :stroke="nodeBorderColor(node)"
            stroke-width="2"
            opacity="0.45"
          />
          <rect
            v-if="selectedNodeId === node.id && nodeShape(node) === 'rect'"
            :x="node.x - nodeWidth(node) / 2 - 6"
            :y="node.y - nodeHeight(node) / 2 - 6"
            :width="nodeWidth(node) + 12"
            :height="nodeHeight(node) + 12"
            rx="8"
            fill="none"
            :stroke="nodeBorderColor(node)"
            stroke-width="2"
            opacity="0.45"
          />
          <polygon
            v-if="selectedNodeId === node.id && nodeShape(node) === 'diamond'"
            :points="`${node.x},${node.y - nodeHeight(node) / 2 - 8} ${node.x + nodeWidth(node) / 2 + 8},${node.y} ${node.x},${node.y + nodeHeight(node) / 2 + 8} ${node.x - nodeWidth(node) / 2 - 8},${node.y}`"
            fill="none"
            :stroke="nodeBorderColor(node)"
            stroke-width="2"
            opacity="0.45"
          />

          <!-- Circle shape -->
          <circle
            v-if="nodeShape(node) === 'circle'"
            :cx="node.x"
            :cy="node.y"
            :r="nodeRadius2(node)"
            fill="white"
            :stroke="nodeBorderColor(node)"
            stroke-width="3"
            filter="url(#nl-node-shadow)"
          />

          <!-- Rect shape -->
          <rect
            v-if="nodeShape(node) === 'rect'"
            :x="node.x - nodeWidth(node) / 2"
            :y="node.y - nodeHeight(node) / 2"
            :width="nodeWidth(node)"
            :height="nodeHeight(node)"
            rx="6"
            fill="white"
            :stroke="nodeBorderColor(node)"
            stroke-width="3"
            filter="url(#nl-node-shadow)"
          />

          <!-- Diamond shape -->
          <polygon
            v-if="nodeShape(node) === 'diamond'"
            :points="diamondPoints(node)"
            fill="white"
            :stroke="nodeBorderColor(node)"
            stroke-width="3"
            filter="url(#nl-node-shadow)"
          />

          <!-- Node label — dark text on white fill; use textColor override if provided -->
          <text
            :x="node.x"
            :y="node.y"
            text-anchor="middle"
            dominant-baseline="central"
            font-size="11"
            font-weight="700"
            :fill="node.textColor ?? nodeBorderColor(node)"
            style="pointer-events: none; user-select: none"
          >
            {{ node.label.length > 12 ? node.label.slice(0, 11) + '…' : node.label }}
            <title>{{ node.label }}</title>
          </text>
        </g>
      </g>

      <!-- Group legend -->
      <g v-if="props.groups && props.groups.length > 0" class="nl-legend">
        <rect
          :x="parsedViewBox.x + parsedViewBox.w - 160"
          :y="parsedViewBox.y + 12"
          width="148"
          :height="24 + (props.groups?.length ?? 0) * 24"
          rx="6"
          fill="rgba(0,0,0,0.45)"
        />
        <g
          v-for="(group, i) in props.groups"
          :key="group.id"
        >
          <circle
            :cx="parsedViewBox.x + parsedViewBox.w - 144"
            :cy="parsedViewBox.y + 26 + i * 22"
            r="6"
            :fill="group.color"
          />
          <text
            :x="parsedViewBox.x + parsedViewBox.w - 132"
            :y="parsedViewBox.y + 26 + i * 22"
            dominant-baseline="central"
            font-size="11"
            fill="white"
            style="pointer-events: none; user-select: none"
          >{{ group.label }}</text>
        </g>
      </g>
    </svg>

    <!-- HTML Tooltip -->
    <div
      v-if="tooltipVisible && tooltipNode && props.showTooltip"
      class="nl-tooltip"
      :style="{
        position: 'absolute',
        left: `${tooltipX}px`,
        top: `${tooltipY}px`,
        pointerEvents: 'none',
        zIndex: 10,
      }"
    >
      <div class="nl-tooltip-title">{{ tooltipNode.label }}</div>
      <div
        v-for="[k, v] in tooltipMetaEntries"
        :key="k"
        class="nl-tooltip-row"
      >
        <span class="nl-tooltip-key">{{ k }}</span>
        <span class="nl-tooltip-val">{{ v }}</span>
      </div>
    </div>

    <!-- Fit-view button -->
    <button class="nl-fit-btn" title="Fit view" @click="fitView">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 3 21 3 21 9" />
        <polyline points="9 21 3 21 3 15" />
        <line x1="21" y1="3" x2="14" y2="10" />
        <line x1="3" y1="21" x2="10" y2="14" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.nl-container {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
}

.nl-node {
  will-change: transform;
}

.nl-edge {
  transition: opacity 0.2s;
}

.nl-edge-group:hover .nl-edge {
  opacity: 0.8;
}

@keyframes nl-dash-in {
  from { stroke-dashoffset: 1000; stroke-dasharray: 1000; }
  to   { stroke-dashoffset: 0; stroke-dasharray: 1000; }
}

.nl-edge-animated {
  animation: nl-dash-in 1.2s ease forwards;
}

.nl-tooltip {
  background: rgba(15, 23, 42, 0.92);
  color: #f8fafc;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  min-width: 120px;
  max-width: 240px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  backdrop-filter: blur(4px);
}

.nl-tooltip-title {
  font-weight: 700;
  font-size: 13px;
  margin-bottom: 4px;
  border-bottom: 1px solid rgba(255,255,255,0.15);
  padding-bottom: 4px;
}

.nl-tooltip-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 2px;
}

.nl-tooltip-key {
  opacity: 0.65;
  font-size: 11px;
}

.nl-tooltip-val {
  font-weight: 500;
  font-size: 11px;
}

.nl-fit-btn {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(15, 23, 42, 0.7);
  color: #f8fafc;
  border: none;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
  backdrop-filter: blur(4px);
}

.nl-fit-btn:hover {
  background: rgba(15, 23, 42, 0.9);
}

@media (prefers-color-scheme: dark) {
  .nl-tooltip {
    background: rgba(30, 41, 59, 0.95);
    border: 1px solid rgba(255,255,255,0.08);
  }
}

:root[data-theme="dark"] .nl-tooltip {
  background: rgba(30, 41, 59, 0.95);
  border: 1px solid rgba(255,255,255,0.08);
}
</style>
