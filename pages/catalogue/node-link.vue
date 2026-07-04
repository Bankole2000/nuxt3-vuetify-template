<script setup lang="ts">
import type { NLNode, NLEdge, NLGroup } from '~/components/common/NodeLinkDiagram.vue'

definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Node Link Diagram', disabled: true },
  ],
})

useSeo({ title: 'Node Link Diagram', description: 'Interactive node-link diagram demos: transit map, CI/CD pipeline, supply chain, and family tree.' })

const tab = ref('transit')
const showGrid = ref(false)
const animatedEdges = ref(false)

// ─── Tab 1: Transit Map ───────────────────────────────────────────────────────

const transitNodes: NLNode[] = [
  // Red Line
  { id: 'central', label: 'Central', x: 400, y: 300, shape: 'circle', radius: 20, color: '#9c27b0', meta: { Zone: '1', Lines: 'Red/Blue/Green' } },
  { id: 'westgate', label: 'Westgate', x: 180, y: 300, shape: 'circle', radius: 14, color: '#e53935', meta: { Zone: '2', Line: 'Red' } },
  { id: 'west-end', label: 'West End', x: 80, y: 300, shape: 'circle', radius: 14, color: '#e53935', meta: { Zone: '3', Line: 'Red' } },
  { id: 'eastgate', label: 'Eastgate', x: 620, y: 300, shape: 'circle', radius: 14, color: '#e53935', meta: { Zone: '2', Line: 'Red' } },
  { id: 'airport', label: 'Airport', x: 760, y: 280, shape: 'circle', radius: 14, color: '#e53935', meta: { Zone: '3', Line: 'Red' } },
  // Blue Line
  { id: 'northgate', label: 'Northgate', x: 400, y: 120, shape: 'circle', radius: 14, color: '#1e88e5', meta: { Zone: '2', Line: 'Blue' } },
  { id: 'university', label: 'University', x: 420, y: 60, shape: 'circle', radius: 14, color: '#1e88e5', meta: { Zone: '3', Line: 'Blue' } },
  { id: 'southgate', label: 'Southgate', x: 400, y: 480, shape: 'circle', radius: 14, color: '#1e88e5', meta: { Zone: '2', Line: 'Blue' } },
  { id: 'riverside', label: 'Riverside', x: 380, y: 560, shape: 'circle', radius: 14, color: '#1e88e5', meta: { Zone: '3', Line: 'Blue' } },
  // Green Line
  { id: 'market', label: 'Market', x: 550, y: 180, shape: 'circle', radius: 14, color: '#43a047', meta: { Zone: '2', Line: 'Green' } },
  { id: 'stadium', label: 'Stadium', x: 650, y: 120, shape: 'circle', radius: 14, color: '#43a047', meta: { Zone: '2', Line: 'Green' } },
  { id: 'tech-park', label: 'Tech Park', x: 520, y: 420, shape: 'circle', radius: 14, color: '#43a047', meta: { Zone: '2', Line: 'Green' } },
  { id: 'harbour', label: 'Harbour', x: 600, y: 500, shape: 'circle', radius: 14, color: '#43a047', meta: { Zone: '3', Line: 'Green' } },
]

const transitEdges: NLEdge[] = [
  // Red Line
  { id: 're1', from: 'west-end', to: 'westgate', color: '#e53935', width: 4 },
  { id: 're2', from: 'westgate', to: 'central', color: '#e53935', width: 4 },
  { id: 're3', from: 'central', to: 'eastgate', color: '#e53935', width: 4 },
  { id: 're4', from: 'eastgate', to: 'airport', color: '#e53935', width: 4 },
  // Blue Line
  { id: 'be1', from: 'university', to: 'northgate', color: '#1e88e5', width: 4 },
  { id: 'be2', from: 'northgate', to: 'central', color: '#1e88e5', width: 4 },
  { id: 'be3', from: 'central', to: 'southgate', color: '#1e88e5', width: 4 },
  { id: 'be4', from: 'southgate', to: 'riverside', color: '#1e88e5', width: 4 },
  // Green Line
  { id: 'ge1', from: 'central', to: 'market', color: '#43a047', width: 4 },
  { id: 'ge2', from: 'market', to: 'stadium', color: '#43a047', width: 4 },
  { id: 'ge3', from: 'central', to: 'tech-park', color: '#43a047', width: 4 },
  { id: 'ge4', from: 'tech-park', to: 'harbour', color: '#43a047', width: 4 },
]

const transitGroups: NLGroup[] = [
  { id: 'red', label: 'Red Line', color: '#e53935' },
  { id: 'blue', label: 'Blue Line', color: '#1e88e5' },
  { id: 'green', label: 'Green Line', color: '#43a047' },
]

// ─── Tab 2: CI/CD Pipeline ────────────────────────────────────────────────────

const pipelineNodes: NLNode[] = [
  { id: 'push', label: 'Code Push', x: 80, y: 200, shape: 'rect', width: 100, height: 44, color: '#546e7a', meta: { Status: 'trigger', Type: 'Source' } },
  { id: 'lint', label: 'Lint', x: 220, y: 140, shape: 'rect', width: 90, height: 44, color: '#43a047', meta: { Status: 'passed', Duration: '12s' } },
  { id: 'unit-tests', label: 'Unit Tests', x: 220, y: 260, shape: 'rect', width: 100, height: 44, color: '#43a047', meta: { Status: 'passed', Duration: '45s' } },
  { id: 'build', label: 'Build', x: 370, y: 200, shape: 'rect', width: 90, height: 44, color: '#43a047', meta: { Status: 'passed', Duration: '1m 30s' } },
  { id: 'integration', label: 'Integration', x: 510, y: 140, shape: 'rect', width: 110, height: 44, color: '#e53935', meta: { Status: 'failed', Duration: '2m 12s' } },
  { id: 'security', label: 'Security Scan', x: 510, y: 260, shape: 'rect', width: 120, height: 44, color: '#43a047', meta: { Status: 'passed', Duration: '55s' } },
  { id: 'staging', label: 'Staging Deploy', x: 670, y: 200, shape: 'rect', width: 120, height: 44, color: '#fb8c00', meta: { Status: 'pending', Duration: '—' } },
  { id: 'smoke', label: 'Smoke Tests', x: 820, y: 140, shape: 'rect', width: 110, height: 44, color: '#78909c', meta: { Status: 'pending', Duration: '—' } },
  { id: 'prod', label: 'Prod Deploy', x: 820, y: 260, shape: 'rect', width: 110, height: 44, color: '#78909c', meta: { Status: 'pending', Duration: '—' } },
]

const pipelineEdges: NLEdge[] = [
  { id: 'pe1', from: 'push', to: 'lint', color: '#90a4ae', width: 2, directed: true, label: 'on push' },
  { id: 'pe2', from: 'push', to: 'unit-tests', color: '#90a4ae', width: 2, directed: true, label: 'on push' },
  { id: 'pe3', from: 'lint', to: 'build', color: '#90a4ae', width: 2, directed: true, label: 'on pass' },
  { id: 'pe4', from: 'unit-tests', to: 'build', color: '#90a4ae', width: 2, directed: true, label: 'on pass' },
  { id: 'pe5', from: 'build', to: 'integration', color: '#90a4ae', width: 2, directed: true, label: 'on pass' },
  { id: 'pe6', from: 'build', to: 'security', color: '#90a4ae', width: 2, directed: true, label: 'on pass' },
  { id: 'pe7', from: 'integration', to: 'staging', color: '#e53935', width: 2, directed: true, dashed: true, label: 'blocked' },
  { id: 'pe8', from: 'security', to: 'staging', color: '#90a4ae', width: 2, directed: true, label: 'on pass' },
  { id: 'pe9', from: 'staging', to: 'smoke', color: '#90a4ae', width: 2, directed: true, label: 'on deploy' },
  { id: 'pe10', from: 'smoke', to: 'prod', color: '#90a4ae', width: 2, directed: true, label: 'on pass' },
]

// ─── Tab 3: Supply Chain ──────────────────────────────────────────────────────

const supplyNodes: NLNode[] = [
  // Suppliers (left, circles)
  { id: 'sup-a', label: 'Supplier A', x: 80, y: 160, shape: 'circle', radius: 22, color: '#5c6bc0', meta: { Type: 'Supplier', Region: 'Asia' } },
  { id: 'sup-b', label: 'Supplier B', x: 80, y: 300, shape: 'circle', radius: 22, color: '#5c6bc0', meta: { Type: 'Supplier', Region: 'Europe' } },
  { id: 'sup-c', label: 'Supplier C', x: 80, y: 440, shape: 'circle', radius: 22, color: '#5c6bc0', meta: { Type: 'Supplier', Region: 'Americas' } },
  // Factories (middle-left, rects)
  { id: 'factory-1', label: 'Factory 1', x: 260, y: 220, shape: 'rect', width: 110, height: 44, color: '#00897b', meta: { Type: 'Factory', Capacity: '5000/day' } },
  { id: 'factory-2', label: 'Factory 2', x: 260, y: 380, shape: 'rect', width: 110, height: 44, color: '#00897b', meta: { Type: 'Factory', Capacity: '3500/day' } },
  // Warehouse (centre, rect)
  { id: 'warehouse', label: 'Warehouse', x: 450, y: 300, shape: 'rect', width: 110, height: 44, color: '#f57c00', meta: { Type: 'Warehouse', Stock: '25000 units' } },
  // Distribution centres (middle-right, rects)
  { id: 'dc-north', label: 'DC North', x: 640, y: 200, shape: 'rect', width: 100, height: 44, color: '#8e24aa', meta: { Type: 'Distribution', Region: 'North' } },
  { id: 'dc-south', label: 'DC South', x: 640, y: 400, shape: 'rect', width: 100, height: 44, color: '#8e24aa', meta: { Type: 'Distribution', Region: 'South' } },
  // Retailers (right, circles)
  { id: 'ret-a', label: 'Retailer A', x: 820, y: 120, shape: 'circle', radius: 22, color: '#e53935', meta: { Type: 'Retailer', Channel: 'Online' } },
  { id: 'ret-b', label: 'Retailer B', x: 820, y: 240, shape: 'circle', radius: 22, color: '#e53935', meta: { Type: 'Retailer', Channel: 'In-store' } },
  { id: 'ret-c', label: 'Retailer C', x: 820, y: 360, shape: 'circle', radius: 22, color: '#e53935', meta: { Type: 'Retailer', Channel: 'In-store' } },
  { id: 'ret-d', label: 'Retailer D', x: 820, y: 480, shape: 'circle', radius: 22, color: '#e53935', meta: { Type: 'Retailer', Channel: 'Wholesale' } },
]

const supplyEdges: NLEdge[] = [
  { id: 'se1', from: 'sup-a', to: 'factory-1', color: '#90a4ae', width: 2, directed: true, label: '800 units/day' },
  { id: 'se2', from: 'sup-b', to: 'factory-1', color: '#90a4ae', width: 2, directed: true, label: '600 units/day' },
  { id: 'se3', from: 'sup-b', to: 'factory-2', color: '#90a4ae', width: 2, directed: true, label: '500 units/day' },
  { id: 'se4', from: 'sup-c', to: 'factory-2', color: '#90a4ae', width: 2, directed: true, label: '700 units/day' },
  { id: 'se5', from: 'factory-1', to: 'warehouse', color: '#90a4ae', width: 2, directed: true, label: '1400 units/day' },
  { id: 'se6', from: 'factory-2', to: 'warehouse', color: '#90a4ae', width: 2, directed: true, label: '1200 units/day' },
  { id: 'se7', from: 'warehouse', to: 'dc-north', color: '#90a4ae', width: 2, directed: true, label: '1300 units/day' },
  { id: 'se8', from: 'warehouse', to: 'dc-south', color: '#90a4ae', width: 2, directed: true, label: '1100 units/day' },
  { id: 'se9', from: 'dc-north', to: 'ret-a', color: '#90a4ae', width: 2, directed: true, label: '600/day' },
  { id: 'se10', from: 'dc-north', to: 'ret-b', color: '#90a4ae', width: 2, directed: true, label: '700/day' },
  { id: 'se11', from: 'dc-south', to: 'ret-c', color: '#90a4ae', width: 2, directed: true, label: '550/day' },
  { id: 'se12', from: 'dc-south', to: 'ret-d', color: '#90a4ae', width: 2, directed: true, label: '550/day' },
]

// ─── Tab 4: Family Tree ───────────────────────────────────────────────────────

const familyNodes: NLNode[] = [
  // Grandparents (gen 1)
  { id: 'gf1', label: 'George', x: 200, y: 80, shape: 'circle', radius: 22, color: '#6a1b9a', meta: { Generation: '1', Role: 'Grandfather' } },
  { id: 'gm1', label: 'Helen', x: 340, y: 80, shape: 'circle', radius: 22, color: '#6a1b9a', meta: { Generation: '1', Role: 'Grandmother' } },
  { id: 'gf2', label: 'Robert', x: 560, y: 80, shape: 'circle', radius: 22, color: '#6a1b9a', meta: { Generation: '1', Role: 'Grandfather' } },
  { id: 'gm2', label: 'Alice', x: 700, y: 80, shape: 'circle', radius: 22, color: '#6a1b9a', meta: { Generation: '1', Role: 'Grandmother' } },
  // Parents (gen 2)
  { id: 'dad', label: 'Thomas', x: 270, y: 240, shape: 'circle', radius: 22, color: '#1565c0', meta: { Generation: '2', Role: 'Father' } },
  { id: 'mom', label: 'Susan', x: 410, y: 240, shape: 'circle', radius: 22, color: '#1565c0', meta: { Generation: '2', Role: 'Mother' } },
  { id: 'uncle', label: 'David', x: 570, y: 240, shape: 'circle', radius: 22, color: '#1565c0', meta: { Generation: '2', Role: 'Uncle' } },
  { id: 'aunt', label: 'Carol', x: 700, y: 240, shape: 'circle', radius: 22, color: '#1565c0', meta: { Generation: '2', Role: 'Aunt' } },
  // Children (gen 3)
  { id: 'child1', label: 'Emma', x: 160, y: 400, shape: 'circle', radius: 20, color: '#00695c', meta: { Generation: '3', Role: 'Child' } },
  { id: 'child2', label: 'Liam', x: 290, y: 400, shape: 'circle', radius: 20, color: '#00695c', meta: { Generation: '3', Role: 'Child' } },
  { id: 'child3', label: 'Olivia', x: 420, y: 400, shape: 'circle', radius: 20, color: '#00695c', meta: { Generation: '3', Role: 'Child' } },
  { id: 'child4', label: 'Noah', x: 570, y: 400, shape: 'circle', radius: 20, color: '#26a69a', meta: { Generation: '3', Role: 'Child' } },
  { id: 'child5', label: 'Ava', x: 700, y: 400, shape: 'circle', radius: 20, color: '#26a69a', meta: { Generation: '3', Role: 'Child' } },
]

const familyEdges: NLEdge[] = [
  // Marriages
  { id: 'fe-m1', from: 'gf1', to: 'gm1', color: '#ab47bc', width: 2, label: 'married' },
  { id: 'fe-m2', from: 'gf2', to: 'gm2', color: '#ab47bc', width: 2, label: 'married' },
  { id: 'fe-m3', from: 'dad', to: 'mom', color: '#42a5f5', width: 2, label: 'married' },
  { id: 'fe-m4', from: 'uncle', to: 'aunt', color: '#42a5f5', width: 2, label: 'married' },
  // Parent → child (gen 1 → gen 2)
  { id: 'fe-p1', from: 'gf1', to: 'dad', color: '#ce93d8', width: 2, label: 'parent of' },
  { id: 'fe-p2', from: 'gm1', to: 'dad', color: '#ce93d8', width: 2, label: 'parent of' },
  { id: 'fe-p3', from: 'gf2', to: 'mom', color: '#ce93d8', width: 2, label: 'parent of' },
  { id: 'fe-p4', from: 'gm2', to: 'mom', color: '#ce93d8', width: 2, label: 'parent of' },
  { id: 'fe-p5', from: 'gf2', to: 'uncle', color: '#ce93d8', width: 2, label: 'parent of' },
  { id: 'fe-p6', from: 'gm2', to: 'uncle', color: '#ce93d8', width: 2, label: 'parent of' },
  // Parent → child (gen 2 → gen 3)
  { id: 'fe-c1', from: 'dad', to: 'child1', color: '#80cbc4', width: 2, label: 'parent of' },
  { id: 'fe-c2', from: 'dad', to: 'child2', color: '#80cbc4', width: 2, label: 'parent of' },
  { id: 'fe-c3', from: 'mom', to: 'child2', color: '#80cbc4', width: 2, label: 'parent of' },
  { id: 'fe-c4', from: 'mom', to: 'child3', color: '#80cbc4', width: 2, label: 'parent of' },
  { id: 'fe-c5', from: 'uncle', to: 'child4', color: '#80cbc4', width: 2, label: 'parent of' },
  { id: 'fe-c6', from: 'aunt', to: 'child4', color: '#80cbc4', width: 2, label: 'parent of' },
  { id: 'fe-c7', from: 'uncle', to: 'child5', color: '#80cbc4', width: 2, label: 'parent of' },
  { id: 'fe-c8', from: 'aunt', to: 'child5', color: '#80cbc4', width: 2, label: 'parent of' },
]

// ─── Selection state ──────────────────────────────────────────────────────────

const selectedNode = ref<NLNode | null>(null)

function onNodeClick(node: NLNode) {
  selectedNode.value = selectedNode.value?.id === node.id ? null : node
}

function connectedEdgeCount(node: NLNode, edges: NLEdge[]): number {
  return edges.filter(e => e.from === node.id || e.to === node.id).length
}

// ─── Diagram refs for fitView ─────────────────────────────────────────────────

const transitDiagram = ref<{ fitView: () => void } | null>(null)
const pipelineDiagram = ref<{ fitView: () => void } | null>(null)
const supplyDiagram = ref<{ fitView: () => void } | null>(null)
const familyDiagram = ref<{ fitView: () => void } | null>(null)

function fitView() {
  if (tab.value === 'transit') transitDiagram.value?.fitView()
  else if (tab.value === 'pipeline') pipelineDiagram.value?.fitView()
  else if (tab.value === 'supply') supplyDiagram.value?.fitView()
  else familyDiagram.value?.fitView()
}

// Reset selection when switching tabs
watch(tab, () => {
  selectedNode.value = null
})
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">Node Link Diagram</h1>
    <p class="text-body-2 text-medium-emphasis mb-5">
      Interactive network diagrams — pan by dragging, zoom with scroll, click any node to inspect it.
      Four demos: transit map, CI/CD pipeline, supply chain, and family tree.
    </p>

    <v-tabs v-model="tab" density="compact" class="mb-4">
      <v-tab value="transit">
        <v-icon start icon="mdi-train" size="16" />
        Transit Map
      </v-tab>
      <v-tab value="pipeline">
        <v-icon start icon="mdi-pipe" size="16" />
        Pipeline
      </v-tab>
      <v-tab value="supply">
        <v-icon start icon="mdi-truck-outline" size="16" />
        Supply Chain
      </v-tab>
      <v-tab value="family">
        <v-icon start icon="mdi-account-group-outline" size="16" />
        Family Tree
      </v-tab>
    </v-tabs>

    <v-window v-model="tab">

      <!-- ── Tab 1: Transit Map ── -->
      <v-window-item value="transit">
        <v-row>
          <v-col cols="12" md="9">
            <v-card rounded="lg" class="overflow-hidden" elevation="1">
              <CommonNodeLinkDiagram
                ref="transitDiagram"
                :nodes="transitNodes"
                :edges="transitEdges"
                :groups="transitGroups"
                :show-grid="showGrid"
                :animated="animatedEdges"
                background="rgba(248,249,252,1)"
                height="520px"
                @node-click="onNodeClick"
              />
            </v-card>

            <div class="d-flex align-center gap-3 mt-3 flex-wrap">
              <v-btn
                size="small"
                variant="tonal"
                prepend-icon="mdi-fit-to-screen-outline"
                @click="fitView"
              >
                Fit View
              </v-btn>
              <v-switch
                v-model="showGrid"
                label="Show Grid"
                density="compact"
                color="primary"
                hide-details
                inset
              />
              <v-switch
                v-model="animatedEdges"
                label="Animated edges"
                density="compact"
                color="primary"
                hide-details
                inset
              />
            </div>
          </v-col>

          <v-col cols="12" md="3">
            <v-card rounded="lg" variant="outlined" class="pa-4" style="min-height: 180px">
              <template v-if="selectedNode">
                <p class="text-body-2 font-weight-bold mb-3 d-flex align-center gap-2">
                  <v-icon size="16" icon="mdi-train-car" />
                  {{ selectedNode.label }}
                </p>
                <v-divider class="mb-3" />
                <div
                  v-for="[k, v] in Object.entries(selectedNode.meta ?? {})"
                  :key="k"
                  class="d-flex justify-space-between mb-1"
                >
                  <span class="text-caption text-medium-emphasis">{{ k }}</span>
                  <span class="text-caption font-weight-medium">{{ v }}</span>
                </div>
                <div class="d-flex justify-space-between mt-2">
                  <span class="text-caption text-medium-emphasis">Connections</span>
                  <span class="text-caption font-weight-medium">{{ connectedEdgeCount(selectedNode, transitEdges) }}</span>
                </div>
              </template>
              <template v-else>
                <p class="text-caption text-medium-emphasis text-center mt-6">
                  Click a station to inspect it
                </p>
              </template>
            </v-card>

            <v-card rounded="lg" variant="tonal" color="purple" class="pa-3 mt-3">
              <p class="text-caption font-weight-bold mb-1">Hub station</p>
              <p class="text-caption">Central (purple) is shared across all 3 lines. Regular stations are colour-coded by their line.</p>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>

      <!-- ── Tab 2: Pipeline ── -->
      <v-window-item value="pipeline">
        <v-row>
          <v-col cols="12" md="9">
            <v-card rounded="lg" class="overflow-hidden" elevation="1">
              <CommonNodeLinkDiagram
                ref="pipelineDiagram"
                :nodes="pipelineNodes"
                :edges="pipelineEdges"
                :show-grid="showGrid"
                :animated="animatedEdges"
                background="rgba(248,249,252,1)"
                height="520px"
                @node-click="onNodeClick"
              />
            </v-card>

            <div class="d-flex align-center gap-3 mt-3 flex-wrap">
              <v-btn
                size="small"
                variant="tonal"
                prepend-icon="mdi-fit-to-screen-outline"
                @click="fitView"
              >
                Fit View
              </v-btn>
              <v-switch
                v-model="showGrid"
                label="Show Grid"
                density="compact"
                color="primary"
                hide-details
                inset
              />
              <v-switch
                v-model="animatedEdges"
                label="Animated edges"
                density="compact"
                color="primary"
                hide-details
                inset
              />
            </div>
          </v-col>

          <v-col cols="12" md="3">
            <v-card rounded="lg" variant="outlined" class="pa-4" style="min-height: 180px">
              <template v-if="selectedNode">
                <p class="text-body-2 font-weight-bold mb-3 d-flex align-center gap-2">
                  <v-icon size="16" icon="mdi-cog-outline" />
                  {{ selectedNode.label }}
                </p>
                <v-divider class="mb-3" />
                <div
                  v-for="[k, v] in Object.entries(selectedNode.meta ?? {})"
                  :key="k"
                  class="d-flex justify-space-between mb-1"
                >
                  <span class="text-caption text-medium-emphasis">{{ k }}</span>
                  <span class="text-caption font-weight-medium">{{ v }}</span>
                </div>
                <div class="d-flex justify-space-between mt-2">
                  <span class="text-caption text-medium-emphasis">Connections</span>
                  <span class="text-caption font-weight-medium">{{ connectedEdgeCount(selectedNode, pipelineEdges) }}</span>
                </div>
              </template>
              <template v-else>
                <p class="text-caption text-medium-emphasis text-center mt-6">
                  Click a stage to inspect it
                </p>
              </template>
            </v-card>

            <v-card rounded="lg" variant="tonal" color="error" class="pa-3 mt-3">
              <p class="text-caption font-weight-bold mb-1">Blocked by Integration Tests</p>
              <p class="text-caption">The dashed red edge shows a blocked path. Staging Deploy is pending until the failure is resolved.</p>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>

      <!-- ── Tab 3: Supply Chain ── -->
      <v-window-item value="supply">
        <v-row>
          <v-col cols="12" md="9">
            <v-card rounded="lg" class="overflow-hidden" elevation="1">
              <CommonNodeLinkDiagram
                ref="supplyDiagram"
                :nodes="supplyNodes"
                :edges="supplyEdges"
                :show-grid="showGrid"
                :animated="animatedEdges"
                background="rgba(248,249,252,1)"
                height="520px"
                @node-click="onNodeClick"
              />
            </v-card>

            <div class="d-flex align-center gap-3 mt-3 flex-wrap">
              <v-btn
                size="small"
                variant="tonal"
                prepend-icon="mdi-fit-to-screen-outline"
                @click="fitView"
              >
                Fit View
              </v-btn>
              <v-switch
                v-model="showGrid"
                label="Show Grid"
                density="compact"
                color="primary"
                hide-details
                inset
              />
              <v-switch
                v-model="animatedEdges"
                label="Animated edges"
                density="compact"
                color="primary"
                hide-details
                inset
              />
            </div>
          </v-col>

          <v-col cols="12" md="3">
            <v-card rounded="lg" variant="outlined" class="pa-4" style="min-height: 180px">
              <template v-if="selectedNode">
                <p class="text-body-2 font-weight-bold mb-3 d-flex align-center gap-2">
                  <v-icon size="16" icon="mdi-factory" />
                  {{ selectedNode.label }}
                </p>
                <v-divider class="mb-3" />
                <div
                  v-for="[k, v] in Object.entries(selectedNode.meta ?? {})"
                  :key="k"
                  class="d-flex justify-space-between mb-1"
                >
                  <span class="text-caption text-medium-emphasis">{{ k }}</span>
                  <span class="text-caption font-weight-medium">{{ v }}</span>
                </div>
                <div class="d-flex justify-space-between mt-2">
                  <span class="text-caption text-medium-emphasis">Connections</span>
                  <span class="text-caption font-weight-medium">{{ connectedEdgeCount(selectedNode, supplyEdges) }}</span>
                </div>
              </template>
              <template v-else>
                <p class="text-caption text-medium-emphasis text-center mt-6">
                  Click a node to inspect it
                </p>
              </template>
            </v-card>

            <v-card rounded="lg" variant="tonal" color="warning" class="pa-3 mt-3">
              <p class="text-caption font-weight-bold mb-1">Flow direction</p>
              <p class="text-caption">Arrows show supply direction. Edge labels indicate daily throughput between each tier.</p>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>

      <!-- ── Tab 4: Family Tree ── -->
      <v-window-item value="family">
        <v-row>
          <v-col cols="12" md="9">
            <v-card rounded="lg" class="overflow-hidden" elevation="1">
              <CommonNodeLinkDiagram
                ref="familyDiagram"
                :nodes="familyNodes"
                :edges="familyEdges"
                :show-grid="showGrid"
                :animated="animatedEdges"
                background="rgba(248,249,252,1)"
                height="520px"
                @node-click="onNodeClick"
              />
            </v-card>

            <div class="d-flex align-center gap-3 mt-3 flex-wrap">
              <v-btn
                size="small"
                variant="tonal"
                prepend-icon="mdi-fit-to-screen-outline"
                @click="fitView"
              >
                Fit View
              </v-btn>
              <v-switch
                v-model="showGrid"
                label="Show Grid"
                density="compact"
                color="primary"
                hide-details
                inset
              />
              <v-switch
                v-model="animatedEdges"
                label="Animated edges"
                density="compact"
                color="primary"
                hide-details
                inset
              />
            </div>
          </v-col>

          <v-col cols="12" md="3">
            <v-card rounded="lg" variant="outlined" class="pa-4" style="min-height: 180px">
              <template v-if="selectedNode">
                <p class="text-body-2 font-weight-bold mb-3 d-flex align-center gap-2">
                  <v-icon size="16" icon="mdi-account-outline" />
                  {{ selectedNode.label }}
                </p>
                <v-divider class="mb-3" />
                <div
                  v-for="[k, v] in Object.entries(selectedNode.meta ?? {})"
                  :key="k"
                  class="d-flex justify-space-between mb-1"
                >
                  <span class="text-caption text-medium-emphasis">{{ k }}</span>
                  <span class="text-caption font-weight-medium">{{ v }}</span>
                </div>
                <div class="d-flex justify-space-between mt-2">
                  <span class="text-caption text-medium-emphasis">Connections</span>
                  <span class="text-caption font-weight-medium">{{ connectedEdgeCount(selectedNode, familyEdges) }}</span>
                </div>
              </template>
              <template v-else>
                <p class="text-caption text-medium-emphasis text-center mt-6">
                  Click a person to inspect them
                </p>
              </template>
            </v-card>

            <v-card rounded="lg" class="pa-3 mt-3">
              <p class="text-caption font-weight-bold mb-2">Generations</p>
              <div class="d-flex align-center gap-2 mb-1">
                <v-sheet width="12" height="12" rounded="circle" color="#6a1b9a" />
                <span class="text-caption">Grandparents</span>
              </div>
              <div class="d-flex align-center gap-2 mb-1">
                <v-sheet width="12" height="12" rounded="circle" color="#1565c0" />
                <span class="text-caption">Parents</span>
              </div>
              <div class="d-flex align-center gap-2">
                <v-sheet width="12" height="12" rounded="circle" color="#00695c" />
                <span class="text-caption">Children</span>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>

    </v-window>

    <h2 class="text-overline text-medium-emphasis mt-8 mb-4">Usage</h2>
    <v-card rounded="lg" class="pa-6">
      <v-sheet rounded="lg" color="surface-variant" class="pa-4">
        <pre class="text-body-2"><code v-pre>&lt;script setup lang="ts"&gt;
import type { NLNode, NLEdge, NLGroup } from '~/components/common/NodeLinkDiagram.vue'

const nodes: NLNode[] = [
  { id: 'a', label: 'Node A', x: 100, y: 200, shape: 'circle', radius: 20, color: '#1e88e5' },
  { id: 'b', label: 'Node B', x: 300, y: 200, shape: 'rect', width: 100, height: 44, color: '#43a047' },
]
const edges: NLEdge[] = [
  { id: 'e1', from: 'a', to: 'b', color: '#90a4ae', width: 2, directed: true, label: 'connects' },
]
&lt;/script&gt;

&lt;template&gt;
  &lt;CommonNodeLinkDiagram
    :nodes="nodes"
    :edges="edges"
    height="400px"
    :show-grid="true"
    :animated="true"
    @node-click="onNodeClick"
  /&gt;
&lt;/template&gt;</code></pre>
      </v-sheet>
    </v-card>
  </div>
</template>
