<script setup lang="ts">
type PortType = 'input' | 'output'
type NodeState = 'idle' | 'active' | 'success' | 'error'

interface Port {
  id: string
  type: PortType
  value: boolean | null
}

interface SimNode {
  id: string
  type: 'INPUT' | 'AND' | 'OR' | 'NOT' | 'XOR' | 'NAND' | 'NOR' | 'OUTPUT'
  x: number
  y: number
  ports: Port[]
  state: NodeState
  inputValue?: boolean  // for INPUT nodes — toggled by user
}

interface Edge {
  id: string
  fromNode: string
  fromPort: string
  toNode: string
  toPort: string
  active: boolean | null  // null = not yet evaluated
}

const NODE_W = 120
const NODE_H = 56

// ─── Node type meta ────────────────────────────────────────────────────────────
const NODE_META = {
  INPUT:  { label: 'INPUT',  icon: 'mdi-toggle-switch',      color: '#6366f1', inputs: 0, outputs: 1 },
  AND:    { label: 'AND',    icon: 'mdi-gate-and',           color: '#3b82f6', inputs: 2, outputs: 1 },
  OR:     { label: 'OR',     icon: 'mdi-gate-or',            color: '#8b5cf6', inputs: 2, outputs: 1 },
  NOT:    { label: 'NOT',    icon: 'mdi-gate-not',           color: '#f59e0b', inputs: 1, outputs: 1 },
  XOR:    { label: 'XOR',    icon: 'mdi-gate-xor',           color: '#10b981', inputs: 2, outputs: 1 },
  NAND:   { label: 'NAND',   icon: 'mdi-gate-nand',          color: '#ec4899', inputs: 2, outputs: 1 },
  NOR:    { label: 'NOR',    icon: 'mdi-gate-nor',           color: '#f97316', inputs: 2, outputs: 1 },
  OUTPUT: { label: 'OUTPUT', icon: 'mdi-led-outline',        color: '#14b8a6', inputs: 1, outputs: 0 },
} as const

type NodeTypeName = keyof typeof NODE_META

const stateColor: Record<NodeState, string> = {
  idle:    '',
  active:  '#f59e0b',
  success: '#10b981',
  error:   '#ef4444',
}

// ─── Graph ────────────────────────────────────────────────────────────────────
const nodes = ref<SimNode[]>([])
const edges = ref<Edge[]>([])

// ─── Canvas pan/zoom ──────────────────────────────────────────────────────────
const canvasRef = ref<HTMLDivElement>()
const pan  = ref({ x: 60, y: 60 })
const zoom = ref(1)

let panStart: { mx: number; my: number; px: number; py: number } | null = null
let draggingNode: { id: string; ox: number; oy: number; sx: number; sy: number } | null = null

const onCanvasMouseDown = (e: MouseEvent) => {
  if ((e.target as HTMLElement).closest('.ls-node')) return
  panStart = { mx: e.clientX, my: e.clientY, px: pan.value.x, py: pan.value.y }
}
const onCanvasMouseMove = (e: MouseEvent) => {
  if (panStart) {
    pan.value.x = panStart.px + (e.clientX - panStart.mx)
    pan.value.y = panStart.py + (e.clientY - panStart.my)
  }
  if (draggingNode) {
    const dx = (e.clientX - draggingNode.sx) / zoom.value
    const dy = (e.clientY - draggingNode.sy) / zoom.value
    const n = nodes.value.find(n => n.id === draggingNode!.id)
    if (n) { n.x = draggingNode.ox + dx; n.y = draggingNode.oy + dy }
  }
  if (connecting.value) {
    const rect = canvasRef.value!.getBoundingClientRect()
    connecting.value.x2 = (e.clientX - rect.left - pan.value.x) / zoom.value
    connecting.value.y2 = (e.clientY - rect.top  - pan.value.y) / zoom.value
  }
}
const onCanvasMouseUp = () => {
  panStart = null
  draggingNode = null
  if (connecting.value) connecting.value = null
}
const onWheel = (e: WheelEvent) => {
  e.preventDefault()
  const rect = canvasRef.value!.getBoundingClientRect()
  const mx = e.clientX - rect.left
  const my = e.clientY - rect.top
  const delta = e.deltaY < 0 ? 1.1 : 0.91
  const nz = Math.min(2, Math.max(0.3, zoom.value * delta))
  pan.value.x = mx - (mx - pan.value.x) * (nz / zoom.value)
  pan.value.y = my - (my - pan.value.y) * (nz / zoom.value)
  zoom.value = nz
}

const onNodeMouseDown = (e: MouseEvent, id: string) => {
  e.stopPropagation()
  const n = nodes.value.find(n => n.id === id)!
  draggingNode = { id, ox: n.x, oy: n.y, sx: e.clientX, sy: e.clientY }
}

// ─── Port connection ──────────────────────────────────────────────────────────
const connecting = ref<{ fromNode: string; fromPort: string; fromType: PortType; x1: number; y1: number; x2: number; y2: number } | null>(null)

const portPos = (node: SimNode, port: Port) => {
  const list = node.ports.filter(p => p.type === port.type)
  const idx = list.indexOf(port)
  const x = port.type === 'input' ? node.x : node.x + NODE_W
  const y = node.y + NODE_H / 2 + (idx - (list.length - 1) / 2) * 22
  return { x, y }
}

const onPortMouseDown = (e: MouseEvent, nodeId: string, port: Port) => {
  e.stopPropagation()
  const node = nodes.value.find(n => n.id === nodeId)!
  const { x, y } = portPos(node, port)
  const rect = canvasRef.value!.getBoundingClientRect()
  connecting.value = {
    fromNode: nodeId, fromPort: port.id, fromType: port.type,
    x1: x, y1: y,
    x2: (e.clientX - rect.left - pan.value.x) / zoom.value,
    y2: (e.clientY - rect.top  - pan.value.y) / zoom.value,
  }
}

const onPortMouseUp = (nodeId: string, port: Port) => {
  const c = connecting.value
  if (!c) return
  const compatible = (c.fromType === 'output' && port.type === 'input') ||
                     (c.fromType === 'input'  && port.type === 'output')
  if (!compatible || c.fromNode === nodeId) { connecting.value = null; return }

  const fromNode = c.fromType === 'output' ? c.fromNode : nodeId
  const fromPort = c.fromType === 'output' ? c.fromPort : port.id
  const toNode   = c.fromType === 'input'  ? c.fromNode : nodeId
  const toPort   = c.fromType === 'input'  ? c.fromPort : port.id

  const dupe = edges.value.some(e => e.fromNode === fromNode && e.fromPort === fromPort && e.toNode === toNode && e.toPort === toPort)
  if (!dupe) {
    edges.value.push({ id: `e${edges.value.length}`, fromNode, fromPort, toNode, toPort, active: null })
  }
  connecting.value = null
}

// ─── Bezier path ──────────────────────────────────────────────────────────────
const bezier = (x1: number, y1: number, x2: number, y2: number) => {
  const cx = Math.abs(x2 - x1) * 0.5 + 30
  return `M${x1},${y1} C${x1 + cx},${y1} ${x2 - cx},${y2} ${x2},${y2}`
}

const resolvedEdges = computed(() =>
  edges.value.map(e => {
    const fn = nodes.value.find(n => n.id === e.fromNode)
    const tn = nodes.value.find(n => n.id === e.toNode)
    if (!fn || !tn) return null
    const fp = fn.ports.find(p => p.id === e.fromPort)
    const tp = tn.ports.find(p => p.id === e.toPort)
    if (!fp || !tp) return null
    const { x: x1, y: y1 } = portPos(fn, fp)
    const { x: x2, y: y2 } = portPos(tn, tp)
    return { id: e.id, path: bezier(x1, y1, x2, y2), active: e.active }
  }).filter(Boolean),
)

// ─── Simulation ───────────────────────────────────────────────────────────────
const running = ref(false)
const simDone = ref(false)

const evaluate = (node: SimNode): boolean => {
  const inEdges = edges.value.filter(e => e.toNode === node.id)
  const inputValues = inEdges.map(e => {
    const src = nodes.value.find(n => n.id === e.fromNode)
    const srcPort = src?.ports.find(p => p.id === e.fromPort)
    return srcPort?.value ?? false
  })

  switch (node.type) {
    case 'INPUT':  return node.inputValue ?? false
    case 'AND':    return inputValues.length >= 2 && inputValues.every(Boolean)
    case 'OR':     return inputValues.some(Boolean)
    case 'NOT':    return !inputValues[0]
    case 'XOR':    return inputValues.filter(Boolean).length % 2 === 1
    case 'NAND':   return !(inputValues.length >= 2 && inputValues.every(Boolean))
    case 'NOR':    return !inputValues.some(Boolean)
    case 'OUTPUT': return inputValues[0] ?? false
    default:       return false
  }
}

// Topological sort (Kahn's algorithm)
const topoSort = (): SimNode[] => {
  const inDeg = new globalThis.Map<string, number>()
  const adj   = new globalThis.Map<string, string[]>()
  for (const n of nodes.value) { inDeg.set(n.id, 0); adj.set(n.id, []) }
  for (const e of edges.value) {
    inDeg.set(e.toNode, (inDeg.get(e.toNode) ?? 0) + 1)
    adj.get(e.fromNode)?.push(e.toNode)
  }
  const queue = nodes.value.filter(n => (inDeg.get(n.id) ?? 0) === 0).map(n => n.id)
  const order: string[] = []
  while (queue.length) {
    const id = queue.shift()!
    order.push(id)
    for (const nid of (adj.get(id) ?? [])) {
      const d = (inDeg.get(nid) ?? 1) - 1
      inDeg.set(nid, d)
      if (d === 0) queue.push(nid)
    }
  }
  return order.map(id => nodes.value.find(n => n.id === id)!).filter(Boolean)
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

const resetSim = () => {
  for (const n of nodes.value) {
    n.state = 'idle'
    for (const p of n.ports) p.value = null
  }
  for (const e of edges.value) e.active = null
  simDone.value = false
}

const runSim = async () => {
  if (running.value) return
  running.value = true
  simDone.value = false
  resetSim()
  await sleep(100)

  const order = topoSort()

  for (const node of order) {
    node.state = 'active'
    await sleep(380)

    const result = evaluate(node)
    const outPort = node.ports.find(p => p.type === 'output')
    if (outPort) outPort.value = result

    node.state = result || node.type === 'OUTPUT' ? 'success' : 'success'
    if (node.type === 'OUTPUT') {
      node.state = result ? 'success' : 'error'
    }

    // Light up outgoing edges
    for (const e of edges.value) {
      if (e.fromNode === node.id) {
        e.active = result
      }
    }

    await sleep(120)
  }

  running.value = false
  simDone.value = true
}

// ─── Seed circuit: half-adder ─────────────────────────────────────────────────
const makePorts = (type: NodeTypeName): Port[] => {
  const meta = NODE_META[type]
  const ports: Port[] = []
  for (let i = 0; i < meta.inputs;  i++) ports.push({ id: `in-${i}`,  type: 'input',  value: null })
  for (let i = 0; i < meta.outputs; i++) ports.push({ id: `out-${i}`, type: 'output', value: null })
  return ports
}

let _uid = 0
const mk = (type: NodeTypeName, x: number, y: number, inputValue?: boolean): SimNode => ({
  id: `n${_uid++}`, type, x, y,
  ports: makePorts(type),
  state: 'idle',
  inputValue,
})

const connect = (fromIdx: number, fromPort: string, toIdx: number, toPort: string) => {
  const f = nodes.value[fromIdx]
  const t = nodes.value[toIdx]
  if (!f || !t) return
  edges.value.push({ id: `e${_uid++}`, fromNode: f.id, fromPort, toNode: t.id, toPort, active: null })
}

// Toggle INPUT node value
const toggleInput = (node: SimNode) => {
  if (running.value) return
  node.inputValue = !node.inputValue
  resetSim()
}

// Current preset
type Preset = 'half-adder' | 'sr-latch' | 'majority'
const preset = ref<Preset>('half-adder')

const loadPreset = (p: Preset) => {
  preset.value = p
  nodes.value = []
  edges.value = []
  _uid = 0
  simDone.value = false

  if (p === 'half-adder') {
    // A, B → XOR (Sum), AND (Carry)
    nodes.value.push(
      mk('INPUT',  20,  60, true),   // 0: A
      mk('INPUT',  20, 160, false),  // 1: B
      mk('XOR',   220,  60),         // 2: Sum
      mk('AND',   220, 160),         // 3: Carry
      mk('OUTPUT', 400,  60),        // 4: Sum out
      mk('OUTPUT', 400, 160),        // 5: Carry out
    )
    connect(0, 'out-0', 2, 'in-0')
    connect(0, 'out-0', 3, 'in-0')
    connect(1, 'out-0', 2, 'in-1')
    connect(1, 'out-0', 3, 'in-1')
    connect(2, 'out-0', 4, 'in-0')
    connect(3, 'out-0', 5, 'in-0')
  }

  if (p === 'majority') {
    // 3 inputs → majority vote (output true if ≥2 inputs are true)
    nodes.value.push(
      mk('INPUT',  20,  40, true),   // 0: A
      mk('INPUT',  20, 140, true),   // 1: B
      mk('INPUT',  20, 240, false),  // 2: C
      mk('AND',   200,  40),         // 3: A AND B
      mk('AND',   200, 140),         // 4: A AND C
      mk('AND',   200, 240),         // 5: B AND C
      mk('OR',    380,  90),         // 6: (A∧B) OR (A∧C)
      mk('OR',    380, 190),         // 7: (B∧C)
      mk('OR',    560, 140),         // 8: final
      mk('OUTPUT', 720, 140),        // 9
    )
    connect(0, 'out-0', 3, 'in-0')
    connect(1, 'out-0', 3, 'in-1')
    connect(0, 'out-0', 4, 'in-0')
    connect(2, 'out-0', 4, 'in-1')
    connect(1, 'out-0', 5, 'in-0')
    connect(2, 'out-0', 5, 'in-1')
    connect(3, 'out-0', 6, 'in-0')
    connect(4, 'out-0', 6, 'in-1')
    connect(5, 'out-0', 7, 'in-0')
    connect(6, 'out-0', 8, 'in-0')
    connect(7, 'out-0', 8, 'in-1')
    connect(8, 'out-0', 9, 'in-0')
  }

  if (p === 'sr-latch') {
    // S-R latch using NOR gates
    nodes.value.push(
      mk('INPUT',  20,  60, false),  // 0: S (Set)
      mk('INPUT',  20, 200, false),  // 1: R (Reset)
      mk('NOR',   220,  60),         // 2: Q
      mk('NOR',   220, 200),         // 3: Q̄
      mk('OUTPUT', 420,  60),        // 4: Q
      mk('OUTPUT', 420, 200),        // 5: Q̄
    )
    connect(0, 'out-0', 2, 'in-0')
    connect(3, 'out-0', 2, 'in-1')
    connect(1, 'out-0', 3, 'in-1')
    connect(2, 'out-0', 3, 'in-0')
    connect(2, 'out-0', 4, 'in-0')
    connect(3, 'out-0', 5, 'in-0')
  }
}

onMounted(() => loadPreset('half-adder'))

// Expose input nodes for display
const inputNodes = computed(() => nodes.value.filter(n => n.type === 'INPUT'))
const outputNodes = computed(() => nodes.value.filter(n => n.type === 'OUTPUT'))
</script>

<template>
  <div class="ls-root">
    <!-- Controls bar -->
    <div class="ls-toolbar">
      <div class="d-flex align-center gap-3 flex-wrap">
        <span class="text-body-2 font-weight-medium">Preset circuit:</span>
        <v-btn-toggle
          :model-value="preset"
          density="compact"
          variant="outlined"
          rounded="lg"
          mandatory
          @update:model-value="loadPreset($event as Preset)"
        >
          <v-btn value="half-adder" size="small">Half Adder</v-btn>
          <v-btn value="majority"   size="small">Majority Gate</v-btn>
          <v-btn value="sr-latch"   size="small">SR Latch</v-btn>
        </v-btn-toggle>
      </div>

      <div class="d-flex align-center gap-2">
        <!-- Input toggles -->
        <template v-for="(node, i) in inputNodes" :key="node.id">
          <v-chip
            :color="node.inputValue ? 'success' : 'default'"
            variant="tonal"
            size="small"
            class="cursor-pointer font-weight-bold"
            :prepend-icon="node.inputValue ? 'mdi-toggle-switch' : 'mdi-toggle-switch-off'"
            @click="toggleInput(node)"
          >
            {{ String.fromCharCode(65 + i) }} = {{ node.inputValue ? '1' : '0' }}
          </v-chip>
        </template>

        <v-divider vertical class="mx-1" style="height:24px" />

        <v-btn
          :color="running ? 'warning' : 'success'"
          :prepend-icon="running ? 'mdi-loading mdi-spin' : 'mdi-play'"
          variant="tonal"
          size="small"
          :disabled="running"
          @click="runSim"
        >
          {{ running ? 'Running…' : 'Run' }}
        </v-btn>
        <v-btn
          size="small"
          variant="text"
          prepend-icon="mdi-refresh"
          :disabled="running"
          @click="resetSim"
        >Reset</v-btn>
      </div>
    </div>

    <!-- Canvas -->
    <div
      ref="canvasRef"
      class="ls-canvas"
      @mousedown="onCanvasMouseDown"
      @mousemove="onCanvasMouseMove"
      @mouseup="onCanvasMouseUp"
      @mouseleave="onCanvasMouseUp"
      @wheel.prevent="onWheel"
    >
      <!-- Dot grid -->
      <svg class="ls-grid" width="100%" height="100%">
        <defs>
          <pattern id="ls-dots" :x="pan.x % (20 * zoom)" :y="pan.y % (20 * zoom)" :width="20 * zoom" :height="20 * zoom" patternUnits="userSpaceOnUse">
            <circle :cx="1 * zoom" :cy="1 * zoom" :r="0.8 * zoom" fill="currentColor" opacity=".15" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ls-dots)" />
      </svg>

      <div
        class="ls-world"
        :style="{ transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})`, transformOrigin: '0 0' }"
      >
        <!-- Edges -->
        <svg class="ls-edges" overflow="visible">
          <g v-for="e in resolvedEdges" :key="e!.id">
            <path
              :d="e!.path"
              fill="none"
              :stroke="e!.active === true ? '#10b981' : e!.active === false ? '#ef4444' : 'currentColor'"
              :stroke-opacity="e!.active !== null ? 0.9 : 0.25"
              stroke-width="2.5"
              :class="{ 'ls-edge-animated': e!.active !== null }"
              pointer-events="none"
            />
          </g>
          <!-- In-progress -->
          <path
            v-if="connecting"
            :d="bezier(connecting.x1, connecting.y1, connecting.x2, connecting.y2)"
            fill="none"
            stroke="rgb(var(--v-theme-primary))"
            stroke-width="2"
            stroke-dasharray="5 3"
            pointer-events="none"
          />
        </svg>

        <!-- Nodes -->
        <div
          v-for="node in nodes"
          :key="node.id"
          class="ls-node"
          :class="[`ls-node--${node.state}`]"
          :style="{
            left: node.x + 'px',
            top: node.y + 'px',
            width: NODE_W + 'px',
            height: NODE_H + 'px',
            '--node-color': stateColor[node.state] || NODE_META[node.type].color,
          }"
          @mousedown.stop="onNodeMouseDown($event, node.id)"
        >
          <!-- Input ports -->
          <div class="ls-ports ls-ports--left">
            <div
              v-for="port in node.ports.filter(p => p.type === 'input')"
              :key="port.id"
              class="ls-port"
              :class="port.value === true ? 'ls-port--on' : port.value === false ? 'ls-port--off' : ''"
              @mousedown.stop="onPortMouseDown($event, node.id, port)"
              @mouseup.stop="onPortMouseUp(node.id, port)"
            />
          </div>

          <!-- Body -->
          <div class="ls-node-body">
            <div class="ls-node-icon">
              <v-icon
                :icon="node.type === 'INPUT'
                  ? (node.inputValue ? 'mdi-toggle-switch' : 'mdi-toggle-switch-off-outline')
                  : NODE_META[node.type].icon"
                size="18"
                color="white"
              />
            </div>
            <div class="ml-2 overflow-hidden flex-1">
              <p class="text-caption font-weight-bold text-truncate" style="line-height:1.3;color:white">
                {{ node.type === 'INPUT' ? (node.inputValue ? '1' : '0') : NODE_META[node.type].label }}
              </p>
              <p class="text-caption" style="line-height:1.2;opacity:.75;color:white">
                {{ node.type === 'INPUT'
                    ? (node.inputValue ? 'HIGH' : 'LOW')
                    : node.type === 'OUTPUT'
                      ? (node.ports.find(p => p.type === 'input')?.value === true ? '→ 1' : node.ports.find(p => p.type === 'input')?.value === false ? '→ 0' : '…')
                      : node.type }}
              </p>
            </div>
            <!-- State pulse ring -->
            <div v-if="node.state === 'active'" class="ls-pulse" />
          </div>

          <!-- Output ports -->
          <div class="ls-ports ls-ports--right">
            <div
              v-for="port in node.ports.filter(p => p.type === 'output')"
              :key="port.id"
              class="ls-port ls-port--out"
              :class="port.value === true ? 'ls-port--on' : port.value === false ? 'ls-port--off' : ''"
              @mousedown.stop="onPortMouseDown($event, node.id, port)"
              @mouseup.stop="onPortMouseUp(node.id, port)"
            />
          </div>
        </div>
      </div>

      <!-- Result banner -->
      <transition name="fade">
        <div v-if="simDone" class="ls-result-bar">
          <template v-for="(node, i) in outputNodes" :key="node.id">
            <v-chip
              :color="node.ports.find(p => p.type === 'input')?.value ? 'success' : 'error'"
              variant="flat"
              size="small"
              class="font-weight-bold"
            >
              {{ preset === 'half-adder' ? (i === 0 ? 'Sum' : 'Carry') : preset === 'sr-latch' ? (i === 0 ? 'Q' : 'Q̄') : `Out ${i + 1}` }}
              = {{ node.ports.find(p => p.type === 'input')?.value ? '1' : '0' }}
            </v-chip>
          </template>
        </div>
      </transition>

      <div class="ls-zoom-badge">{{ Math.round(zoom * 100) }}%</div>
    </div>
  </div>
</template>

<style scoped>
.ls-root {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

/* Toolbar */
.ls-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 10px 16px;
  background: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

/* Canvas */
.ls-canvas {
  position: relative;
  height: 360px;
  overflow: hidden;
  background: rgb(var(--v-theme-surface-variant));
  cursor: grab;
  user-select: none;
}
.ls-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.ls-world {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.ls-edges {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}
.ls-edge-animated {
  stroke-dasharray: none;
  filter: drop-shadow(0 0 3px currentColor);
}

/* Nodes */
.ls-node {
  position: absolute;
  display: flex;
  align-items: center;
  border-radius: 10px;
  background: var(--node-color, #6366f1);
  box-shadow: 0 2px 8px rgba(0,0,0,.2);
  cursor: grab;
  pointer-events: all;
  transition: box-shadow .2s, transform .1s;
}
.ls-node:hover { box-shadow: 0 4px 16px rgba(0,0,0,.28); }
.ls-node--active {
  box-shadow: 0 0 0 3px #f59e0b, 0 4px 20px rgba(245,158,11,.4);
  transform: scale(1.03);
}
.ls-node--success { box-shadow: 0 0 0 2px #10b981, 0 4px 16px rgba(16,185,129,.25); }
.ls-node--error   { box-shadow: 0 0 0 2px #ef4444, 0 4px 16px rgba(239,68,68,.25); }

.ls-node-body {
  display: flex;
  align-items: center;
  padding: 0 10px;
  width: 100%;
  min-width: 0;
  position: relative;
}
.ls-node-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: rgba(255,255,255,.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Ports */
.ls-ports {
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: absolute;
}
.ls-ports--left  { left: -8px;  top: 50%; transform: translateY(-50%); }
.ls-ports--right { right: -8px; top: 50%; transform: translateY(-50%); }

.ls-port {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: rgba(255,255,255,.3);
  border: 2px solid rgba(255,255,255,.6);
  cursor: crosshair;
  pointer-events: all;
  transition: background .2s, transform .1s;
}
.ls-port--out { background: rgba(255,255,255,.5); }
.ls-port--on  { background: #10b981; border-color: #10b981; box-shadow: 0 0 6px #10b981; }
.ls-port--off { background: #ef4444; border-color: #ef4444; }
.ls-port:hover { transform: scale(1.3); }

/* Pulse ring for active node */
.ls-pulse {
  position: absolute;
  inset: -4px;
  border-radius: 14px;
  border: 2px solid #f59e0b;
  animation: ls-ping .7s ease-out infinite;
  pointer-events: none;
}
@keyframes ls-ping {
  0%   { opacity: .8; transform: scale(1); }
  100% { opacity: 0;  transform: scale(1.12); }
}

/* Result bar */
.ls-result-bar {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  background: rgba(var(--v-theme-surface), .9);
  padding: 6px 12px;
  border-radius: 20px;
  backdrop-filter: blur(6px);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  pointer-events: none;
}

/* Zoom badge */
.ls-zoom-badge {
  position: absolute;
  bottom: 12px;
  right: 12px;
  font-size: 11px;
  color: rgba(var(--v-theme-on-surface), .4);
  background: rgba(var(--v-theme-surface), .7);
  padding: 2px 8px;
  border-radius: 20px;
  pointer-events: none;
}

.fade-enter-active, .fade-leave-active { transition: opacity .3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.cursor-pointer { cursor: pointer; }
.flex-1 { flex: 1; }
</style>
