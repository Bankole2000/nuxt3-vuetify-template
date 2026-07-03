<script setup lang="ts">
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background }          from '@vue-flow/background'
import type { Node, Edge }     from '@vue-flow/core'

interface NodeTypeDef {
  type: string
  label: string
  icon: string
  color: string
  inputs: number
  outputs: number
}

const NODE_TYPES: NodeTypeDef[] = [
  { type: 'trigger',   label: 'Trigger',   icon: 'mdi-lightning-bolt',  color: '#f59e0b', inputs: 0, outputs: 1 },
  { type: 'webhook',   label: 'Webhook',   icon: 'mdi-webhook',          color: '#8b5cf6', inputs: 0, outputs: 1 },
  { type: 'http',      label: 'HTTP',      icon: 'mdi-web',              color: '#3b82f6', inputs: 1, outputs: 1 },
  { type: 'filter',    label: 'Filter',    icon: 'mdi-filter-outline',   color: '#10b981', inputs: 1, outputs: 2 },
  { type: 'transform', label: 'Transform', icon: 'mdi-swap-horizontal',  color: '#6366f1', inputs: 1, outputs: 1 },
  { type: 'email',     label: 'Email',     icon: 'mdi-email-outline',    color: '#ec4899', inputs: 1, outputs: 0 },
  { type: 'database',  label: 'Database',  icon: 'mdi-database-outline', color: '#14b8a6', inputs: 1, outputs: 1 },
  { type: 'code',      label: 'Code',      icon: 'mdi-code-braces',      color: '#f97316', inputs: 1, outputs: 1 },
]

let _uid = 0
const uid = () => `n${++_uid}`

// ─── Graph state ──────────────────────────────────────────────────────────────
const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])

const { fitView, removeNodes, removeEdges, getSelectedNodes, getSelectedEdges } = useVueFlow()

// Seed a starter workflow
onMounted(() => {
  nodes.value = [
    { id: uid(), type: 'workflow', position: { x: 60,  y: 120 }, data: { label: 'Trigger',   icon: 'mdi-lightning-bolt',  color: '#f59e0b', inputs: 0, outputs: 1 } },
    { id: uid(), type: 'workflow', position: { x: 260, y: 60  }, data: { label: 'HTTP',       icon: 'mdi-web',              color: '#3b82f6', inputs: 1, outputs: 1 } },
    { id: uid(), type: 'workflow', position: { x: 260, y: 180 }, data: { label: 'Webhook',    icon: 'mdi-webhook',          color: '#8b5cf6', inputs: 0, outputs: 1 } },
    { id: uid(), type: 'workflow', position: { x: 460, y: 120 }, data: { label: 'Filter',     icon: 'mdi-filter-outline',   color: '#10b981', inputs: 1, outputs: 2 } },
    { id: uid(), type: 'workflow', position: { x: 660, y: 60  }, data: { label: 'Transform',  icon: 'mdi-swap-horizontal',  color: '#6366f1', inputs: 1, outputs: 1 } },
    { id: uid(), type: 'workflow', position: { x: 660, y: 200 }, data: { label: 'Database',   icon: 'mdi-database-outline', color: '#14b8a6', inputs: 1, outputs: 1 } },
    { id: uid(), type: 'workflow', position: { x: 860, y: 120 }, data: { label: 'Email',      icon: 'mdi-email-outline',    color: '#ec4899', inputs: 1, outputs: 0 } },
  ]
  edges.value = [
    { id: 'e1', source: 'n1', target: 'n2', animated: true },
    { id: 'e2', source: 'n1', target: 'n3', animated: true },
    { id: 'e3', source: 'n2', target: 'n4', animated: true },
    { id: 'e4', source: 'n4', target: 'n5', animated: true },
    { id: 'e5', source: 'n4', target: 'n6', animated: true },
    { id: 'e6', source: 'n5', target: 'n7', animated: true },
    { id: 'e7', source: 'n6', target: 'n7', animated: true },
  ]
  setTimeout(() => fitView({ padding: 0.2 }), 50)
})

// ─── Palette drop ─────────────────────────────────────────────────────────────
const onPaletteDragStart = (e: DragEvent, def: NodeTypeDef) => {
  e.dataTransfer!.setData('application/wf-node', JSON.stringify(def))
  e.dataTransfer!.effectAllowed = 'copy'
}

const onFlowDragOver = (e: DragEvent) => {
  e.preventDefault()
  e.dataTransfer!.dropEffect = 'copy'
}

const { screenToFlowCoordinate } = useVueFlow()

const onFlowDrop = (e: DragEvent) => {
  const raw = e.dataTransfer?.getData('application/wf-node')
  if (!raw) return
  const def: NodeTypeDef = JSON.parse(raw)
  const pos = screenToFlowCoordinate({ x: e.clientX, y: e.clientY })
  nodes.value.push({
    id: uid(),
    type: 'workflow',
    position: pos,
    data: { label: def.label, icon: def.icon, color: def.color, inputs: def.inputs, outputs: def.outputs },
  })
}

// ─── Delete selected ──────────────────────────────────────────────────────────
const deleteSelected = () => {
  removeNodes(getSelectedNodes.value.map(n => n.id))
  removeEdges(getSelectedEdges.value.map(e => e.id))
}

onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && (e.target as HTMLElement).tagName !== 'INPUT') {
      deleteSelected()
    }
  })
})
</script>

<template>
  <div class="wf-root">
    <!-- ── Palette ── -->
    <div class="wf-palette">
      <p class="wf-palette-title">Nodes</p>
      <div
        v-for="def in NODE_TYPES"
        :key="def.type"
        class="wf-palette-item"
        draggable="true"
        @dragstart="onPaletteDragStart($event, def)"
      >
        <div class="wf-palette-icon" :style="{ background: def.color }">
          <v-icon :icon="def.icon" size="14" color="white" />
        </div>
        <span class="wf-palette-label">{{ def.label }}</span>
      </div>

      <v-divider class="my-3" />

      <v-btn
        size="small"
        variant="text"
        prepend-icon="mdi-fit-to-screen-outline"
        density="compact"
        block
        @click="fitView({ padding: 0.2 })"
      >
        Fit view
      </v-btn>
      <v-btn
        size="small"
        variant="text"
        prepend-icon="mdi-delete-outline"
        density="compact"
        color="error"
        block
        class="mt-1"
        @click="deleteSelected"
      >
        Delete selected
      </v-btn>

      <p class="wf-hint mt-3">
        <v-icon icon="mdi-drag" size="12" /> Drag nodes onto canvas<br>
        <v-icon icon="mdi-vector-line" size="12" /> Drag handle → handle to connect<br>
        <v-icon icon="mdi-delete-outline" size="12" /> Select + Delete to remove
      </p>
    </div>

    <!-- ── Canvas ── -->
    <div
      class="wf-canvas"
      @dragover="onFlowDragOver"
      @drop="onFlowDrop"
    >
      <VueFlow
        v-model:nodes="nodes"
        v-model:edges="edges"
        :default-edge-options="{ animated: true, type: 'smoothstep' }"
        fit-view-on-init
        :min-zoom="0.25"
        :max-zoom="2"
        class="wf-flow"
      >
        <Background pattern-color="rgba(var(--v-theme-on-surface), .08)" :gap="20" />

        <!-- Custom node type -->
        <template #node-workflow="nodeProps">
          <FlowWorkflowNode v-bind="nodeProps" />
        </template>
      </VueFlow>
    </div>
  </div>
</template>

<style>
/* Vue Flow base styles — must be non-scoped to reach shadow DOM */
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
</style>

<style scoped>
.wf-root {
  display: flex;
  height: 560px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 12px;
  overflow: hidden;
}

/* ── Palette ── */
.wf-palette {
  width: 148px;
  flex-shrink: 0;
  padding: 12px 10px;
  background: rgb(var(--v-theme-surface));
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.wf-palette-title {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), .38);
  margin-bottom: 6px;
}
.wf-palette-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 7px;
  cursor: grab;
  transition: background .12s;
}
.wf-palette-item:hover {
  background: rgba(var(--v-theme-on-surface), .06);
}
.wf-palette-icon {
  width: 24px; height: 24px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.wf-palette-label {
  font-size: 11px;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), .75);
  white-space: nowrap;
}
.wf-hint {
  font-size: 9px;
  line-height: 1.7;
  color: rgba(var(--v-theme-on-surface), .35);
  margin-top: auto;
}

/* ── Canvas ── */
.wf-canvas {
  flex: 1;
  position: relative;
  background: rgba(var(--v-theme-on-surface), .02);
}
.wf-flow {
  width: 100%;
  height: 100%;
}

/* Override Vue Flow edge / selection colours to match theme */
:deep(.vue-flow__edge-path)         { stroke: rgba(var(--v-theme-on-surface), .35); }
:deep(.vue-flow__edge.selected .vue-flow__edge-path) { stroke: rgb(var(--v-theme-primary)); }
:deep(.vue-flow__selection)         { border-color: rgb(var(--v-theme-primary)); background: rgba(var(--v-theme-primary), .05); }
:deep(.vue-flow__controls)          { box-shadow: none; border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); border-radius: 8px; }
</style>
