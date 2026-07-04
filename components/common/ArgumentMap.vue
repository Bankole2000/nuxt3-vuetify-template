<script setup lang="ts">
// ─── Public types ──────────────────────────────────────────────────────────────
export type ArgumentNodeType = 'claim' | 'support' | 'rebuttal' | 'qualifier' | 'evidence'
export type ArgumentEdgeType = 'supports' | 'rebuts' | 'qualifies'
export interface ArgumentNode { id: string; type: ArgumentNodeType; text: string; x?: number; y?: number }
export interface ArgumentEdge { id: string; from: string; to: string; type: ArgumentEdgeType }
export interface ArgumentMapData { nodes: ArgumentNode[]; edges: ArgumentEdge[] }

// ─── Props / emits ─────────────────────────────────────────────────────────────
const props = withDefaults(defineProps<{
  data: ArgumentMapData
  readonly?: boolean
}>(), {
  readonly: false,
})

const emit = defineEmits<{
  (e: 'update', data: ArgumentMapData): void
}>()

// ─── Local state ───────────────────────────────────────────────────────────────
const local = ref<ArgumentMapData>(JSON.parse(JSON.stringify(props.data)))

watch(() => props.data, (v) => {
  local.value = JSON.parse(JSON.stringify(v))
}, { deep: true })

function push() {
  emit('update', JSON.parse(JSON.stringify(local.value)))
}

// ─── Canvas state ──────────────────────────────────────────────────────────────
const svgRef = ref<SVGSVGElement | null>(null)

const pan = ref({ x: 0, y: 0 })
const zoom = ref(1)
const MIN_ZOOM = 0.25
const MAX_ZOOM = 3

// panning
let isPanning = false
let panStart = { x: 0, y: 0 }
let panOrigin = { x: 0, y: 0 }

// dragging a node
const draggingId = ref<string | null>(null)
let dragOffset = { x: 0, y: 0 }

// selection
const selectedNodeId = ref<string | null>(null)
const selectedEdgeId = ref<string | null>(null)

// edit panel
const editText = ref('')
const editType = ref<ArgumentNodeType>('claim')

// ─── Colour maps ───────────────────────────────────────────────────────────────
const NODE_COLORS: Record<ArgumentNodeType, string> = {
  claim:    '#1976D2',
  support:  '#388E3C',
  rebuttal: '#D32F2F',
  qualifier:'#F57F17',
  evidence: '#00695C',
}

const EDGE_COLORS: Record<ArgumentEdgeType, string> = {
  supports: '#388E3C',
  rebuts:   '#D32F2F',
  qualifies:'#F57F17',
}

const EDGE_DASH: Record<ArgumentEdgeType, string> = {
  supports: 'none',
  rebuts:   '6,4',
  qualifies:'2,4',
}

// ─── Coordinate helpers ────────────────────────────────────────────────────────
const NODE_W = 160
const NODE_H = 52

function svgPoint(clientX: number, clientY: number): { x: number; y: number } {
  const svg = svgRef.value
  if (!svg) return { x: 0, y: 0 }
  const rect = svg.getBoundingClientRect()
  return {
    x: (clientX - rect.left - pan.value.x) / zoom.value,
    y: (clientY - rect.top  - pan.value.y) / zoom.value,
  }
}

function nodeById(id: string): ArgumentNode | undefined {
  return local.value.nodes.find(n => n.id === id)
}

function ensurePositions() {
  local.value.nodes.forEach((n, i) => {
    if (n.x === undefined || n.y === undefined) {
      n.x = 100 + (i % 4) * 220
      n.y = 80  + Math.floor(i / 4) * 120
    }
  })
}

// ─── Wheel zoom ────────────────────────────────────────────────────────────────
function onWheel(e: WheelEvent) {
  e.preventDefault()
  const factor = e.deltaY < 0 ? 1.1 : 0.9
  const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom.value * factor))
  // zoom toward cursor
  const svg = svgRef.value
  if (svg) {
    const rect = svg.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    pan.value.x = mx - (mx - pan.value.x) * (next / zoom.value)
    pan.value.y = my - (my - pan.value.y) * (next / zoom.value)
  }
  zoom.value = next
}

// ─── Background pan ────────────────────────────────────────────────────────────
function onBgMouseDown(e: MouseEvent) {
  if (props.readonly) return
  if ((e.target as SVGElement).closest('.am-node')) return
  isPanning = true
  panStart = { x: e.clientX, y: e.clientY }
  panOrigin = { x: pan.value.x, y: pan.value.y }
}

function onMouseMove(e: MouseEvent) {
  if (draggingId.value) {
    const pt = svgPoint(e.clientX, e.clientY)
    const node = local.value.nodes.find(n => n.id === draggingId.value)
    if (node) {
      node.x = pt.x - dragOffset.x
      node.y = pt.y - dragOffset.y
    }
    return
  }
  if (isPanning) {
    pan.value.x = panOrigin.x + (e.clientX - panStart.x)
    pan.value.y = panOrigin.y + (e.clientY - panStart.y)
  }
}

function onMouseUp() {
  if (draggingId.value) {
    push()
    draggingId.value = null
  }
  isPanning = false
}

// ─── Node drag ─────────────────────────────────────────────────────────────────
function onNodeMouseDown(e: MouseEvent, node: ArgumentNode) {
  if (props.readonly) return
  e.stopPropagation()
  const pt = svgPoint(e.clientX, e.clientY)
  draggingId.value = node.id
  dragOffset = {
    x: pt.x - (node.x ?? 0),
    y: pt.y - (node.y ?? 0),
  }
}

// ─── Selection ─────────────────────────────────────────────────────────────────
function selectNode(id: string) {
  selectedNodeId.value = id
  selectedEdgeId.value = null
  const n = nodeById(id)
  if (n) {
    editText.value = n.text
    editType.value = n.type
  }
}

function selectEdge(id: string) {
  selectedEdgeId.value = id
  selectedNodeId.value = null
}

// ─── Double-click to add node ──────────────────────────────────────────────────
function onBgDblClick(e: MouseEvent) {
  if (props.readonly) return
  const pt = svgPoint(e.clientX, e.clientY)
  const id = `n_${Date.now()}`
  local.value.nodes.push({
    id,
    type: 'support',
    text: 'New node',
    x: pt.x - NODE_W / 2,
    y: pt.y - NODE_H / 2,
  })
  push()
  selectNode(id)
}

// ─── Delete key ────────────────────────────────────────────────────────────────
function onKeyDown(e: KeyboardEvent) {
  if (props.readonly) return
  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (selectedNodeId.value) {
      const id = selectedNodeId.value
      local.value.nodes = local.value.nodes.filter(n => n.id !== id)
      local.value.edges = local.value.edges.filter(ed => ed.from !== id && ed.to !== id)
      selectedNodeId.value = null
      push()
    }
    else if (selectedEdgeId.value) {
      const id = selectedEdgeId.value
      local.value.edges = local.value.edges.filter(ed => ed.id !== id)
      selectedEdgeId.value = null
      push()
    }
  }
}

// ─── Edit panel save ───────────────────────────────────────────────────────────
function saveEdit() {
  const node = local.value.nodes.find(n => n.id === selectedNodeId.value)
  if (node) {
    node.text = editText.value
    node.type = editType.value
    push()
  }
}

// ─── Auto layout ───────────────────────────────────────────────────────────────
function autoLayout() {
  const nodes = local.value.nodes
  if (!nodes.length) return

  const claimNode = nodes.find(n => n.type === 'claim') ?? nodes[0]!
  const others = nodes.filter(n => n.id !== claimNode.id)

  // get svg size
  const svg = svgRef.value
  const W = svg?.clientWidth ?? 800
  const H = svg?.clientHeight ?? 500

  const cx = (W / zoom.value) / 2 - pan.value.x / zoom.value
  const cy = (H / zoom.value) / 2 - pan.value.y / zoom.value

  claimNode.x = cx - NODE_W / 2
  claimNode.y = cy - NODE_H / 2

  const radius = Math.min(W, H) * 0.32 / zoom.value + 120
  others.forEach((n, i) => {
    const angle = (2 * Math.PI * i) / others.length - Math.PI / 2
    n.x = cx + Math.cos(angle) * radius - NODE_W / 2
    n.y = cy + Math.sin(angle) * radius - NODE_H / 2
  })

  push()
}

// ─── Edge path helpers ─────────────────────────────────────────────────────────
function edgePath(edge: ArgumentEdge): string {
  const from = nodeById(edge.from)
  const to   = nodeById(edge.to)
  if (!from || !to) return ''
  const fx = (from.x ?? 0) + NODE_W / 2
  const fy = (from.y ?? 0) + NODE_H / 2
  const tx = (to.x ?? 0) + NODE_W / 2
  const ty = (to.y ?? 0) + NODE_H / 2
  const dx = tx - fx
  const cx1 = fx + dx * 0.4
  const cy1 = fy
  const cx2 = tx - dx * 0.4
  const cy2 = ty
  return `M ${fx} ${fy} C ${cx1} ${cy1} ${cx2} ${cy2} ${tx} ${ty}`
}

function edgeMidPoint(edge: ArgumentEdge): { x: number; y: number } {
  const from = nodeById(edge.from)
  const to   = nodeById(edge.to)
  if (!from || !to) return { x: 0, y: 0 }
  return {
    x: ((from.x ?? 0) + (to.x ?? 0)) / 2 + NODE_W / 2,
    y: ((from.y ?? 0) + (to.y ?? 0)) / 2 + NODE_H / 2,
  }
}

const nodeTypeOptions: { value: ArgumentNodeType; label: string }[] = [
  { value: 'claim',    label: 'Claim'    },
  { value: 'support',  label: 'Support'  },
  { value: 'rebuttal', label: 'Rebuttal' },
  { value: 'qualifier',label: 'Qualifier'},
  { value: 'evidence', label: 'Evidence' },
]

// ─── Initialise ────────────────────────────────────────────────────────────────
onMounted(() => {
  ensurePositions()
})
</script>

<template>
  <div ref="containerRef" class="am-container" tabindex="0" @keydown="onKeyDown">
    <!-- toolbar -->
    <div class="d-flex align-center gap-2 mb-2 flex-wrap">
      <v-btn
        size="small"
        variant="tonal"
        prepend-icon="mdi-auto-fix"
        @click="autoLayout"
      >
        Auto Layout
      </v-btn>
      <v-btn
        size="small"
        variant="text"
        icon="mdi-magnify-plus-outline"
        @click="zoom = Math.min(MAX_ZOOM, zoom * 1.2)"
      />
      <v-btn
        size="small"
        variant="text"
        icon="mdi-magnify-minus-outline"
        @click="zoom = Math.max(MIN_ZOOM, zoom / 1.2)"
      />
      <v-btn
        size="small"
        variant="text"
        icon="mdi-fit-to-screen-outline"
        @click="zoom = 1; pan = { x: 0, y: 0 }"
      />
      <v-chip
        v-for="(color, type) in NODE_COLORS"
        :key="type"
        size="x-small"
        variant="tonal"
        class="text-capitalize"
        :style="{ background: color + '22', color }"
      >
        {{ type }}
      </v-chip>
      <span v-if="!readonly" class="text-caption text-medium-emphasis">
        Double-click canvas to add node · Delete key removes selected
      </span>
    </div>

    <div class="am-layout">
      <!-- SVG canvas -->
      <svg
        ref="svgRef"
        class="am-svg"
        @wheel.prevent="onWheel"
        @mousedown="onBgMouseDown"
        @mousemove="onMouseMove"
        @mouseup="onMouseUp"
        @mouseleave="onMouseUp"
        @dblclick="onBgDblClick"
      >
        <defs>
          <marker
            v-for="(color, type) in EDGE_COLORS"
            :key="`arrow-${type}`"
            :id="`arrow-${type}`"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L0,6 L8,3 z" :fill="color" />
          </marker>
        </defs>

        <g :transform="`translate(${pan.x}, ${pan.y}) scale(${zoom})`">
          <!-- edges -->
          <g v-for="edge in local.edges" :key="edge.id" class="am-edge-group">
            <path
              :d="edgePath(edge)"
              :stroke="EDGE_COLORS[edge.type]"
              stroke-width="2"
              fill="none"
              :stroke-dasharray="EDGE_DASH[edge.type]"
              :marker-end="`url(#arrow-${edge.type})`"
              :class="{ 'am-edge--selected': selectedEdgeId === edge.id }"
              style="cursor:pointer"
              @click.stop="selectEdge(edge.id)"
            />
            <!-- edge label -->
            <text
              :x="edgeMidPoint(edge).x"
              :y="edgeMidPoint(edge).y - 6"
              text-anchor="middle"
              class="am-edge-label"
              :fill="EDGE_COLORS[edge.type]"
            >
              {{ edge.type }}
            </text>
          </g>

          <!-- nodes -->
          <g
            v-for="node in local.nodes"
            :key="node.id"
            class="am-node"
            :transform="`translate(${node.x ?? 0}, ${node.y ?? 0})`"
            :class="{ 'am-node--selected': selectedNodeId === node.id }"
            style="cursor:grab"
            @mousedown.stop="onNodeMouseDown($event, node)"
            @click.stop="selectNode(node.id)"
          >
            <rect
              :width="NODE_W"
              :height="NODE_H"
              rx="8"
              ry="8"
              :fill="NODE_COLORS[node.type] + '22'"
              :stroke="NODE_COLORS[node.type]"
              :stroke-width="selectedNodeId === node.id ? 3 : 1.5"
            />
            <foreignObject :width="NODE_W" :height="NODE_H">
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                class="am-node-text"
                :style="{ color: NODE_COLORS[node.type] }"
              >
                {{ node.text }}
              </div>
            </foreignObject>
          </g>
        </g>
      </svg>

      <!-- edit panel -->
      <div v-if="selectedNodeId && !readonly" class="am-edit-panel">
        <p class="text-caption text-medium-emphasis mb-2">Edit Node</p>
        <v-textarea
          v-model="editText"
          label="Text"
          density="compact"
          variant="outlined"
          rows="3"
          auto-grow
          hide-details
          class="mb-2"
        />
        <v-select
          v-model="editType"
          :items="nodeTypeOptions"
          item-title="label"
          item-value="value"
          label="Type"
          density="compact"
          variant="outlined"
          hide-details
          class="mb-2"
        />
        <div class="d-flex gap-2">
          <v-btn
            size="small"
            color="primary"
            variant="tonal"
            block
            @click="saveEdit"
          >
            Save
          </v-btn>
        </div>
        <v-divider class="my-3" />
        <v-btn
          size="small"
          color="error"
          variant="text"
          block
          prepend-icon="mdi-delete-outline"
          @click="() => {
            const id = selectedNodeId!
            local.nodes = local.nodes.filter(n => n.id !== id)
            local.edges = local.edges.filter(e => e.from !== id && e.to !== id)
            selectedNodeId = null
            push()
          }"
        >
          Delete Node
        </v-btn>
      </div>
    </div>
  </div>
</template>

<style scoped>
.am-container {
  outline: none;
}

.am-layout {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.am-svg {
  flex: 1;
  min-width: 0;
  height: 460px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 12px;
  background: rgba(var(--v-theme-surface-variant), 0.3);
  cursor: default;
  user-select: none;
}

.am-edit-panel {
  width: 200px;
  flex-shrink: 0;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 12px;
  padding: 12px;
  background: rgb(var(--v-theme-surface));
}

.am-edge--selected {
  stroke-width: 3 !important;
  filter: drop-shadow(0 0 4px currentColor);
}

.am-node--selected rect {
  filter: drop-shadow(0 0 6px rgba(0,0,0,0.4));
}

.am-edge-label {
  font-size: 9px;
  font-family: sans-serif;
  pointer-events: none;
}

.am-node-text {
  font-size: 11px;
  font-weight: 600;
  font-family: sans-serif;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4px 8px;
  box-sizing: border-box;
  word-break: break-word;
  line-height: 1.3;
}
</style>
