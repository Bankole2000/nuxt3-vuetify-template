<script setup lang="ts">
type NodeLabel = 'Person' | 'Movie' | 'Product' | 'Company' | 'Tag' | 'Location'
type RelType = 'KNOWS' | 'ACTED_IN' | 'DIRECTED' | 'WORKS_AT' | 'LOCATED_IN' | 'TAGGED_WITH' | 'PURCHASED' | 'REVIEWED'

interface GNode {
  id: string
  label: NodeLabel
  name: string
  props: Record<string, string | number>
}

interface GEdge {
  id: string
  from: string
  to: string
  type: RelType
  props: Record<string, string | number>
}

type Selection = { kind: 'node'; id: string } | { kind: 'edge'; id: string } | null

const NODE_META: Record<NodeLabel, { color: string; icon: string }> = {
  Person:   { color: '#6366f1', icon: 'mdi-account-circle-outline' },
  Movie:    { color: '#ec4899', icon: 'mdi-movie-outline' },
  Product:  { color: '#f59e0b', icon: 'mdi-package-variant-closed' },
  Company:  { color: '#3b82f6', icon: 'mdi-office-building-outline' },
  Tag:      { color: '#10b981', icon: 'mdi-tag-outline' },
  Location: { color: '#f97316', icon: 'mdi-map-marker-outline' },
}

const REL_COLORS: Record<RelType, string> = {
  KNOWS:        '#6366f1',
  ACTED_IN:     '#ec4899',
  DIRECTED:     '#8b5cf6',
  WORKS_AT:     '#3b82f6',
  LOCATED_IN:   '#f97316',
  TAGGED_WITH:  '#10b981',
  PURCHASED:    '#f59e0b',
  REVIEWED:     '#14b8a6',
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const rawNodes: GNode[] = [
  { id: 'alice',    label: 'Person',   name: 'Alice',         props: { age: 34, role: 'Engineer' } },
  { id: 'bob',      label: 'Person',   name: 'Bob',           props: { age: 29, role: 'Designer' } },
  { id: 'carol',    label: 'Person',   name: 'Carol',         props: { age: 41, role: 'Director' } },
  { id: 'dave',     label: 'Person',   name: 'Dave',          props: { age: 36, role: 'Engineer' } },
  { id: 'acme',     label: 'Company',  name: 'Acme Corp',     props: { founded: 2005, size: 'Mid' } },
  { id: 'matrix',   label: 'Movie',    name: 'The Matrix',    props: { year: 1999, rating: 8.7 } },
  { id: 'inception',label: 'Movie',    name: 'Inception',     props: { year: 2010, rating: 8.8 } },
  { id: 'sf',       label: 'Location', name: 'San Francisco', props: { country: 'USA' } },
  { id: 'scifi',    label: 'Tag',      name: 'Sci-Fi',        props: { created: '2010-01-01' } },
  { id: 'laptop',   label: 'Product',  name: 'Pro Laptop X',  props: { price: 1299, stock: 42 } },
]

const rawEdges: GEdge[] = [
  { id: 'e1',  from: 'alice',    to: 'bob',       type: 'KNOWS',       props: { since: 2018 } },
  { id: 'e2',  from: 'alice',    to: 'carol',     type: 'KNOWS',       props: { since: 2015 } },
  { id: 'e3',  from: 'bob',      to: 'dave',      type: 'KNOWS',       props: { since: 2020 } },
  { id: 'e4',  from: 'carol',    to: 'acme',      type: 'WORKS_AT',    props: { title: 'CTO', since: 2019 } },
  { id: 'e5',  from: 'alice',    to: 'acme',      type: 'WORKS_AT',    props: { title: 'Senior SWE', since: 2021 } },
  { id: 'e6',  from: 'bob',      to: 'matrix',    type: 'REVIEWED',    props: { stars: 5, date: '2023-03-12' } },
  { id: 'e7',  from: 'alice',    to: 'inception', type: 'REVIEWED',    props: { stars: 4, date: '2022-11-08' } },
  { id: 'e8',  from: 'carol',    to: 'matrix',    type: 'ACTED_IN',    props: { role: 'Operator' } },
  { id: 'e9',  from: 'dave',     to: 'matrix',    type: 'DIRECTED',    props: {} },
  { id: 'e10', from: 'matrix',   to: 'scifi',     type: 'TAGGED_WITH', props: {} },
  { id: 'e11', from: 'inception',to: 'scifi',     type: 'TAGGED_WITH', props: {} },
  { id: 'e12', from: 'acme',     to: 'sf',        type: 'LOCATED_IN',  props: { since: 2005 } },
  { id: 'e13', from: 'dave',     to: 'sf',        type: 'LOCATED_IN',  props: {} },
  { id: 'e14', from: 'bob',      to: 'laptop',    type: 'PURCHASED',   props: { date: '2024-01-15', qty: 1 } },
]

// ─── State ────────────────────────────────────────────────────────────────────
const mountRef    = ref<HTMLDivElement>()
const selected    = ref<Selection>(null)
const allLabels   = Object.keys(NODE_META) as NodeLabel[]
const visibleLabels = ref<NodeLabel[]>([...allLabels])

const { theme } = useAppTheme()

// ─── Selected data for panel ──────────────────────────────────────────────────
const selectedNode = computed(() =>
  selected.value?.kind === 'node' ? rawNodes.find(n => n.id === selected.value!.id) ?? null : null,
)
const selectedEdge = computed(() => {
  if (selected.value?.kind !== 'edge') return null
  const e = rawEdges.find(e => e.id === selected.value!.id)
  if (!e) return null
  return { edge: e, from: rawNodes.find(n => n.id === e.from), to: rawNodes.find(n => n.id === e.to) }
})

const cypherQuery = computed(() => {
  if (selectedNode.value) {
    return `MATCH (n:${selectedNode.value.label} {name: "${selectedNode.value.name}"})\nRETURN n`
  }
  if (selectedEdge.value) {
    const { edge, from, to } = selectedEdge.value
    return `MATCH (a)-[r:${edge.type}]->(b)\nWHERE a.name = "${from?.name}"\n  AND b.name = "${to?.name}"\nRETURN a, r, b`
  }
  return `MATCH (n)\nRETURN n\nLIMIT 25`
})

const nodeEdges = computed(() => {
  if (!selectedNode.value) return []
  const id = selectedNode.value.id
  return rawEdges.filter(e => e.from === id || e.to === id)
})

// ─── Cytoscape ────────────────────────────────────────────────────────────────
let cy: import('cytoscape').Core | null = null

const buildElements = (labels: NodeLabel[]) => {
  const labelSet = new Set(labels)
  const visibleIds = new Set(rawNodes.filter(n => labelSet.has(n.label)).map(n => n.id))
  return [
    ...rawNodes
      .filter(n => labelSet.has(n.label))
      .map(n => ({
        data: { id: n.id, label: n.name, nodeLabel: n.label, color: NODE_META[n.label].color },
      })),
    ...rawEdges
      .filter(e => visibleIds.has(e.from) && visibleIds.has(e.to))
      .map(e => ({
        data: { id: e.id, source: e.from, target: e.to, type: e.type, color: REL_COLORS[e.type] },
      })),
  ]
}

const isDark = computed(() => theme.value === 'dark')

const cytoscapeStyle = computed(() => [
  {
    selector: 'node',
    style: {
      'width': 56,
      'height': 56,
      'background-color': 'data(color)',
      'label': 'data(label)',
      'color': '#ffffff',
      'font-size': 9,
      'font-weight': 'bold',
      'text-valign': 'bottom' as const,
      'text-margin-y': 6,
      'text-color': isDark.value ? '#e2e8f0' : '#1a202c',
      'border-width': 0,
      'shadow-blur': 10,
      'shadow-color': 'rgba(0,0,0,0.25)',
      'shadow-offset-x': 0,
      'shadow-offset-y': 2,
      'shadow-opacity': 0.6,
    },
  },
  {
    selector: 'node:selected',
    style: {
      'border-width': 3,
      'border-color': '#ffffff',
      'shadow-blur': 20,
      'shadow-opacity': 0.9,
    },
  },
  {
    selector: 'edge',
    style: {
      'width': 1.5,
      'line-color': 'data(color)',
      'target-arrow-color': 'data(color)',
      'target-arrow-shape': 'triangle' as const,
      'curve-style': 'bezier' as const,
      'label': 'data(type)',
      'font-size': 8,
      'font-weight': 'bold',
      'color': 'data(color)',
      'text-background-color': isDark.value ? '#1e293b' : '#f8fafc',
      'text-background-opacity': 0.85,
      'text-background-padding': '2px',
      'text-rotation': 'autorotate' as const,
      'opacity': 0.7,
    },
  },
  {
    selector: 'edge:selected',
    style: {
      'width': 3,
      'opacity': 1,
    },
  },
  {
    selector: 'edge:hover',
    style: { 'opacity': 1, 'width': 2.5 },
  },
])

const initCy = async () => {
  if (!mountRef.value) return
  const cytoscape = (await import('cytoscape')).default

  cy = cytoscape({
    container: mountRef.value,
    elements: buildElements(visibleLabels.value),
    style: cytoscapeStyle.value as never,
    layout: { name: 'cose', animate: true, animationDuration: 600, nodeRepulsion: () => 8000, idealEdgeLength: () => 100 } as never,
    wheelSensitivity: 0.3,
  })

  cy.on('tap', 'node', (e) => {
    selected.value = { kind: 'node', id: e.target.id() }
  })
  cy.on('tap', 'edge', (e) => {
    selected.value = { kind: 'edge', id: e.target.id() }
  })
  cy.on('tap', (e) => {
    if (e.target === cy) selected.value = null
  })
}

// Re-run layout when labels change
watch(visibleLabels, async () => {
  if (!cy) return
  cy.elements().remove()
  cy.add(buildElements(visibleLabels.value) as never)
  cy.layout({ name: 'cose', animate: true, animationDuration: 400, nodeRepulsion: () => 8000, idealEdgeLength: () => 100 } as never).run()
})

// Re-apply style on theme change
watch(isDark, () => {
  if (!cy) return
  cy.style(cytoscapeStyle.value as never)
})

const fitView = () => cy?.fit(undefined, 40)

onMounted(initCy)
onUnmounted(() => { cy?.destroy(); cy = null })
</script>

<template>
  <div class="gx-root">
    <!-- Sidebar -->
    <div class="gx-sidebar">
      <p class="text-caption text-medium-emphasis font-weight-medium px-3 pt-3 pb-1 text-uppercase" style="letter-spacing:.08em">Node labels</p>
      <div class="px-3 pb-2 d-flex flex-column gap-1">
        <label v-for="label in allLabels" :key="label" class="gx-label-row">
          <input
            type="checkbox"
            :checked="visibleLabels.includes(label)"
            @change="visibleLabels.includes(label)
              ? (visibleLabels = visibleLabels.filter(l => l !== label))
              : (visibleLabels = [...visibleLabels, label])"
          />
          <v-avatar :color="NODE_META[label].color" size="20" rounded="sm" style="flex-shrink:0">
            <v-icon :icon="NODE_META[label].icon" size="12" color="white" />
          </v-avatar>
          <span class="text-body-2 ml-1">{{ label }}</span>
          <span class="text-caption text-medium-emphasis ml-auto">{{ rawNodes.filter(n => n.label === label).length }}</span>
        </label>
      </div>

      <v-divider />

      <p class="text-caption text-medium-emphasis font-weight-medium px-3 pt-2 pb-1 text-uppercase" style="letter-spacing:.08em">Relationships</p>
      <div class="px-3 pb-2 d-flex flex-column gap-1">
        <div v-for="(color, type) in REL_COLORS" :key="type" class="d-flex align-center gap-2">
          <div class="gx-rel-swatch" :style="{ background: color }" />
          <span class="text-caption">{{ type }}</span>
          <span class="text-caption text-medium-emphasis ml-auto">{{ rawEdges.filter(e => e.type === type).length }}</span>
        </div>
      </div>

      <v-divider />

      <div class="px-3 py-2 d-flex flex-column gap-2">
        <v-btn size="small" variant="tonal" prepend-icon="mdi-fit-to-screen" block @click="fitView">Fit view</v-btn>
        <div class="d-flex justify-space-between text-caption text-medium-emphasis px-1">
          <span>{{ rawNodes.length }} nodes</span>
          <span>{{ rawEdges.length }} edges</span>
        </div>
      </div>
    </div>

    <!-- Canvas -->
    <div class="gx-canvas-wrap">
      <div ref="mountRef" class="gx-cy" />

      <!-- Properties panel -->
      <transition name="gx-slide">
        <div v-if="selectedNode || selectedEdge" class="gx-panel">
          <template v-if="selectedNode">
            <div class="gx-panel-header" :style="{ borderLeftColor: NODE_META[selectedNode.label].color }">
              <v-avatar :color="NODE_META[selectedNode.label].color" size="32" rounded="md">
                <v-icon :icon="NODE_META[selectedNode.label].icon" size="18" color="white" />
              </v-avatar>
              <div class="ml-2">
                <p class="text-body-2 font-weight-bold" style="line-height:1.2">{{ selectedNode.name }}</p>
                <p class="text-caption text-medium-emphasis">{{ selectedNode.label }}</p>
              </div>
              <v-btn icon="mdi-close" size="x-small" variant="text" class="ml-auto" @click="selected = null" />
            </div>
            <div class="gx-panel-section">
              <p class="text-caption text-medium-emphasis font-weight-medium mb-2 text-uppercase" style="letter-spacing:.06em">Properties</p>
              <div v-for="(val, key) in selectedNode.props" :key="key" class="gx-prop-row">
                <span class="text-caption text-medium-emphasis">{{ key }}</span>
                <span class="text-caption font-weight-medium">{{ val }}</span>
              </div>
            </div>
            <div class="gx-panel-section">
              <p class="text-caption text-medium-emphasis font-weight-medium mb-2 text-uppercase" style="letter-spacing:.06em">Relationships</p>
              <div v-for="e in nodeEdges" :key="e.id" class="gx-rel-row">
                <div class="gx-rel-swatch" :style="{ background: REL_COLORS[e.type] }" />
                <span class="text-caption font-weight-medium" :style="{ color: REL_COLORS[e.type] }">{{ e.type }}</span>
                <span class="text-caption text-medium-emphasis ml-1">
                  {{ e.from === selectedNode.id
                    ? `→ ${rawNodes.find(n => n.id === e.to)?.name}`
                    : `← ${rawNodes.find(n => n.id === e.from)?.name}` }}
                </span>
              </div>
            </div>
          </template>

          <template v-else-if="selectedEdge">
            <div class="gx-panel-header" :style="{ borderLeftColor: REL_COLORS[selectedEdge.edge.type] }">
              <div class="gx-rel-icon" :style="{ background: REL_COLORS[selectedEdge.edge.type] }">
                <v-icon icon="mdi-arrow-right" size="14" color="white" />
              </div>
              <div class="ml-2">
                <p class="text-body-2 font-weight-bold" :style="{ color: REL_COLORS[selectedEdge.edge.type], lineHeight: '1.2' }">{{ selectedEdge.edge.type }}</p>
                <p class="text-caption text-medium-emphasis">Relationship</p>
              </div>
              <v-btn icon="mdi-close" size="x-small" variant="text" class="ml-auto" @click="selected = null" />
            </div>
            <div class="gx-panel-section">
              <p class="text-caption text-medium-emphasis font-weight-medium mb-2 text-uppercase" style="letter-spacing:.06em">Nodes</p>
              <div class="gx-prop-row">
                <span class="text-caption text-medium-emphasis">From</span>
                <span class="text-caption font-weight-medium">{{ selectedEdge.from?.name }}</span>
              </div>
              <div class="gx-prop-row">
                <span class="text-caption text-medium-emphasis">To</span>
                <span class="text-caption font-weight-medium">{{ selectedEdge.to?.name }}</span>
              </div>
            </div>
            <div class="gx-panel-section">
              <p class="text-caption text-medium-emphasis font-weight-medium mb-2 text-uppercase" style="letter-spacing:.06em">Properties</p>
              <div v-for="(val, key) in selectedEdge.edge.props" :key="key" class="gx-prop-row">
                <span class="text-caption text-medium-emphasis">{{ key }}</span>
                <span class="text-caption font-weight-medium">{{ val }}</span>
              </div>
              <p v-if="!Object.keys(selectedEdge.edge.props).length" class="text-caption text-medium-emphasis">No properties</p>
            </div>
          </template>

          <div class="gx-panel-section gx-panel-cypher">
            <p class="text-caption text-medium-emphasis font-weight-medium mb-2 text-uppercase" style="letter-spacing:.06em">Cypher</p>
            <pre class="gx-cypher-pre text-caption">{{ cypherQuery }}</pre>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.gx-root {
  display: flex;
  height: 520px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.gx-sidebar {
  width: 180px;
  flex-shrink: 0;
  background: rgb(var(--v-theme-surface));
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.gx-label-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 0;
  cursor: pointer;
}
.gx-label-row:hover { opacity: .8; }
.gx-rel-swatch { width: 10px; height: 3px; border-radius: 2px; flex-shrink: 0; }

.gx-canvas-wrap {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: rgb(var(--v-theme-surface-variant));
}
.gx-cy { width: 100%; height: 100%; }

/* Properties panel */
.gx-panel {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 220px;
  max-height: calc(100% - 24px);
  overflow-y: auto;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0,0,0,.14);
  display: flex;
  flex-direction: column;
}
.gx-panel-header {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-left: 3px solid transparent;
  border-radius: 10px 10px 0 0;
}
.gx-panel-section {
  padding: 10px 12px;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.gx-panel-section:last-child { border-bottom: none; }
.gx-prop-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 0;
  gap: 8px;
}
.gx-prop-row span:last-child {
  text-align: right;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.gx-rel-row { display: flex; align-items: center; gap: 6px; padding: 2px 0; }
.gx-rel-icon {
  width: 22px; height: 22px; border-radius: 4px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.gx-panel-cypher { background: rgba(var(--v-theme-surface-variant), .6); }
.gx-cypher-pre {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 10px;
  line-height: 1.6;
  opacity: .8;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
}

.gx-slide-enter-active, .gx-slide-leave-active { transition: opacity .2s, transform .2s; }
.gx-slide-enter-from, .gx-slide-leave-to { opacity: 0; transform: translateX(12px); }
</style>
