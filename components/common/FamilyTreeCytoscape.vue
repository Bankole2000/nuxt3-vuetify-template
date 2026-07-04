<script setup lang="ts">
// Cytoscape.js with breadthfirst layout — hierarchical top-down family graph.
// Partnership nodes (diamonds) act as connectors between co-parents.
// Polygamous scenarios show naturally: Frank has two partnership nodes (one per partner).

import cytoscape from 'cytoscape'
import {
  familyData, personById, childrenOf, parentsOf,
  genderColor, initials, lifespan,
  type Person,
} from '~/composables/useFamilyData'

const { persons, partnerships } = familyData

const containerRef = ref<HTMLDivElement>()
let cy: cytoscape.Core | null = null

const focusedId = ref('george')

// ─── Ancestry list ────────────────────────────────────────────────────────────

const ancestryList = computed(() => {
  const list: Person[] = []; const seen = new Set<string>(); const queue = [focusedId.value]
  while (queue.length) {
    const id = queue.shift()!; if (seen.has(id)) continue; seen.add(id)
    const p = personById.get(id); if (p) list.push(p)
    for (const pId of (parentsOf.get(id) ?? [])) if (!seen.has(pId)) queue.push(pId)
  }
  return list
})

const ancestryDepth = computed(() => {
  const depth = new Map<string, number>(); const seen = new Set<string>()
  const queue: Array<{ id: string; d: number }> = [{ id: focusedId.value, d: 0 }]
  while (queue.length) {
    const item = queue.shift()!; if (seen.has(item.id)) continue; seen.add(item.id)
    depth.set(item.id, item.d)
    for (const pId of (parentsOf.get(item.id) ?? [])) if (!seen.has(pId)) queue.push({ id: pId, d: item.d + 1 })
  }
  return depth
})

// ─── Build Cytoscape elements ─────────────────────────────────────────────────
// We create:
//   • A person node for each person (type: 'person')
//   • A partnership node for each partnership that has children (type: 'couple')
//   • Edges: personA → couple, personB → couple, couple → child

function buildElements(): cytoscape.ElementDefinition[] {
  const elements: cytoscape.ElementDefinition[] = []

  // Person nodes
  for (const p of persons) {
    elements.push({
      data: {
        id: p.id,
        label: `${p.firstName}\n${p.lastName}`,
        sublabel: lifespan(p),
        gender: p.gender,
        color: genderColor(p.gender),
        initials: initials(p),
        type: 'person',
        deceased: !!p.deathYear,
      },
      classes: ['person', p.gender === 'M' ? 'male' : p.gender === 'F' ? 'female' : 'other', p.deathYear ? 'deceased' : ''],
    })
  }

  // Partnership nodes + edges
  for (const ps of partnerships) {
    const sharedChildren = (childrenOf.get(ps.personA) ?? [])
      .filter(c => (childrenOf.get(ps.personB) ?? []).includes(c))

    // Always create the couple node (even without shared children in this view)
    const coupleId = `couple-${ps.id}`
    elements.push({
      data: {
        id: coupleId,
        type: 'couple',
        ended: ps.ended ?? false,
        year: ps.marriageYear,
        label: ps.marriageYear ? `${ps.marriageYear}` : '',
      },
      classes: ['couple', ps.ended ? 'ended' : ''],
    })

    // Edges from each parent to the couple node
    elements.push({ data: { id: `e-${ps.personA}-${coupleId}`, source: ps.personA, target: coupleId, type: 'partner' } })
    elements.push({ data: { id: `e-${ps.personB}-${coupleId}`, source: ps.personB, target: coupleId, type: 'partner' } })

    // Edges from couple node to each shared child
    for (const childId of sharedChildren) {
      elements.push({ data: { id: `e-${coupleId}-${childId}`, source: coupleId, target: childId, type: 'child' } })
    }
  }

  return elements
}

// ─── Cytoscape stylesheet ─────────────────────────────────────────────────────

const styleSheet = (): cytoscape.StylesheetStyle[] => {
  const surface  = getComputedStyle(document.documentElement).getPropertyValue('--v-theme-surface').trim() || '255 255 255'
  const onSurf   = getComputedStyle(document.documentElement).getPropertyValue('--v-theme-on-surface').trim() || '0 0 0'

  return [
    {
      selector: 'node.person',
      style: {
        'width': 130,
        'height': 56,
        'shape': 'round-rectangle',
        'background-color': `rgb(${surface})`,
        'border-width': 2,
        'border-color': (ele: cytoscape.NodeSingular) => ele.data('color'),
        'label': (ele: cytoscape.NodeSingular) => ele.data('label'),
        'text-valign': 'center',
        'text-halign': 'center',
        'font-size': 10,
        'font-weight': '700' as unknown as number,
        'color': `rgb(${onSurf})`,
        'text-wrap': 'wrap',
        'text-max-width': '110',
        'line-height': 1.3,
      } as cytoscape.Css.Node,
    },
    {
      selector: 'node.person.deceased',
      style: {
        'border-style': 'dashed',
        'opacity': 0.65,
      } as cytoscape.Css.Node,
    },
    {
      selector: 'node.person:selected',
      style: {
        'border-width': 3,
        'border-color': '#6366f1',
        'box-shadow': '0 0 0 4px rgba(99,102,241,.3)',
      } as cytoscape.Css.Node,
    },
    {
      selector: 'node.couple',
      style: {
        'width': 14,
        'height': 14,
        'shape': 'diamond',
        'background-color': (ele: cytoscape.NodeSingular) => ele.data('ended') ? '#ef4444' : '#10b981',
        'border-width': 2,
        'border-color': `rgb(${surface})`,
        'label': (ele: cytoscape.NodeSingular) => ele.data('label') ?? '',
        'font-size': 8,
        'color': `rgb(${onSurf})`,
        'text-valign': 'bottom',
        'text-margin-y': 4,
      } as cytoscape.Css.Node,
    },
    {
      selector: 'edge[type = "partner"]',
      style: {
        'width': 1.5,
        'line-color': 'rgba(120,120,140,.4)',
        'line-style': 'solid',
        'curve-style': 'bezier',
        'target-arrow-shape': 'none',
      } as cytoscape.Css.Edge,
    },
    {
      selector: 'edge[type = "child"]',
      style: {
        'width': 1.5,
        'line-color': 'rgba(120,120,140,.35)',
        'line-style': 'solid',
        'curve-style': 'bezier',
        'target-arrow-shape': 'triangle',
        'target-arrow-color': 'rgba(120,120,140,.35)',
        'arrow-scale': 0.8,
      } as cytoscape.Css.Edge,
    },
  ]
}

// ─── Init / teardown ──────────────────────────────────────────────────────────

const initCy = () => {
  if (!containerRef.value) return
  if (cy) { cy.destroy(); cy = null }

  cy = cytoscape({
    container: containerRef.value,
    elements: buildElements(),
    style: styleSheet(),
    layout: {
      name: 'breadthfirst',
      directed: true,
      roots: persons.filter(p => (parentsOf.get(p.id) ?? []).length === 0).map(p => `#${p.id}`),
      spacingFactor: 1.4,
      avoidOverlap: true,
      nodeDimensionsIncludeLabels: true,
    } as cytoscape.BreadthFirstLayoutOptions,
    minZoom: 0.1,
    maxZoom: 3,
    wheelSensitivity: 0.3,
  })

  // Highlight focused person
  highlightFocus()

  // Click to shift focus
  cy.on('tap', 'node.person', evt => {
    const id = evt.target.id()
    if (id !== focusedId.value) {
      focusedId.value = id
      highlightFocus()
      centreOnFocus()
    }
  })
}

const highlightFocus = () => {
  if (!cy) return
  cy.nodes('.person').forEach(n => {
    n.style('border-width', n.id() === focusedId.value ? 3 : 2)
    n.style('border-color', n.id() === focusedId.value ? '#6366f1' : n.data('color'))
    n.style('opacity', 1)
  })
}

const centreOnFocus = () => {
  if (!cy) return
  const node = cy.$(`#${focusedId.value}`)
  if (node.length) cy.animate({ center: { eles: node }, duration: 400, easing: 'ease-in-out-quad' })
}

const fitView = () => cy?.fit(undefined, 40)

const setFocus = (id: string) => {
  if (id === focusedId.value) return
  focusedId.value = id
  highlightFocus()
  centreOnFocus()
}

onMounted(() => { nextTick(initCy) })
onUnmounted(() => { cy?.destroy(); cy = null })
</script>

<template>
  <div class="ftc-root">
    <div class="ftc-toolbar">
      <div class="d-flex align-center gap-2">
        <v-icon icon="mdi-graph" size="18" class="text-medium-emphasis" />
        <span class="text-body-2 font-weight-bold">Hierarchical · Cytoscape.js</span>
      </div>
      <div class="d-flex align-center gap-2">
        <v-btn size="small" variant="text" density="compact" prepend-icon="mdi-fit-to-screen-outline" @click="fitView">Fit</v-btn>
        <v-btn size="small" variant="text" density="compact" prepend-icon="mdi-crosshairs" @click="centreOnFocus">Centre</v-btn>
      </div>
    </div>

    <div class="ftc-body">
      <!-- Ancestry sidebar -->
      <div class="ftc-list">
        <p class="ftc-list-heading">Ancestry</p>
        <div
          v-for="person in ancestryList"
          :key="person.id"
          class="ftc-list-item"
          :class="{ 'ftc-list-item--focus': person.id === focusedId }"
          :style="{ paddingLeft: `${8 + (ancestryDepth.get(person.id) ?? 0) * 14}px` }"
          @click="setFocus(person.id)"
        >
          <div class="ftc-list-dot" :style="{ background: genderColor(person.gender) }" />
          <div class="ftc-list-text">
            <p class="ftc-list-name">{{ person.firstName }} {{ person.lastName }}</p>
            <p class="ftc-list-years">{{ lifespan(person) }}</p>
          </div>
        </div>
      </div>

      <!-- Cytoscape container -->
      <div class="ftc-canvas-wrap">
        <div ref="containerRef" class="ftc-cy" />

        <!-- Legend -->
        <div class="ftc-legend">
          <div class="ftc-leg-item"><span class="ftc-leg-dot" style="background:#3b82f6"/> Male</div>
          <div class="ftc-leg-item"><span class="ftc-leg-dot" style="background:#ec4899"/> Female</div>
          <div class="ftc-leg-item"><span class="ftc-leg-diamond ftc-leg-diamond--active"/> Partnership</div>
          <div class="ftc-leg-item"><span class="ftc-leg-diamond ftc-leg-diamond--ended"/> Ended</div>
          <div class="ftc-leg-item">
            <span class="ftc-leg-node ftc-leg-node--dashed" /> Deceased
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ftc-root { border: 1px solid rgba(var(--v-border-color),var(--v-border-opacity)); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; }
.ftc-toolbar { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; background: rgb(var(--v-theme-surface)); border-bottom: 1px solid rgba(var(--v-border-color),var(--v-border-opacity)); flex-shrink: 0; }
.ftc-body { display: flex; height: 580px; }
.ftc-list { width: 196px; flex-shrink: 0; background: rgb(var(--v-theme-surface)); border-right: 1px solid rgba(var(--v-border-color),var(--v-border-opacity)); overflow-y: auto; padding: 12px 6px; }
.ftc-list-heading { font-size: 9px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: rgba(var(--v-theme-on-surface),.35); padding: 0 8px; margin-bottom: 8px; }
.ftc-list-item { display: flex; align-items: center; gap: 8px; padding: 5px 8px; border-radius: 7px; cursor: pointer; transition: background .1s; }
.ftc-list-item:hover { background: rgba(var(--v-theme-on-surface),.06); }
.ftc-list-item--focus { background: rgba(var(--v-theme-primary),.1); }
.ftc-list-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.ftc-list-text { min-width: 0; }
.ftc-list-name { font-size: 11px; font-weight: 600; color: rgb(var(--v-theme-on-surface)); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0; }
.ftc-list-years { font-size: 9px; color: rgba(var(--v-theme-on-surface),.4); margin: 0; }
.ftc-canvas-wrap { flex: 1; position: relative; overflow: hidden; }
.ftc-cy { width: 100%; height: 100%; background: rgba(var(--v-theme-on-surface),.012); }
.ftc-legend { position: absolute; bottom: 12px; left: 12px; display: flex; gap: 10px; background: rgba(var(--v-theme-surface),.92); border: 1px solid rgba(var(--v-border-color),var(--v-border-opacity)); border-radius: 8px; padding: 6px 12px; font-size: 10px; color: rgba(var(--v-theme-on-surface),.6); backdrop-filter: blur(4px); pointer-events: none; align-items: center; flex-wrap: wrap; }
.ftc-leg-item { display: flex; align-items: center; gap: 5px; }
.ftc-leg-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.ftc-leg-diamond { width: 10px; height: 10px; display: inline-block; transform: rotate(45deg); border-radius: 2px; }
.ftc-leg-diamond--active { background: #10b981; }
.ftc-leg-diamond--ended  { background: #ef4444; }
.ftc-leg-node { display: inline-block; width: 18px; height: 10px; border: 2px dashed rgba(120,120,140,.6); border-radius: 2px; }
</style>
