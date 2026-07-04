<script setup lang="ts">
// D3 radial cluster layout — focus person at centre, ancestors/descendants radiating outward.
// Each ring = one generation. Click any node to re-focus.

import * as d3 from 'd3'
import {
  familyData, personById, childrenOf, parentsOf,
  genderColor, initials, lifespan,
  type Person,
} from '~/composables/useFamilyData'

const { partnerships } = familyData

// ─── Build a radial "ego" tree from focusId ───────────────────────────────────
// Strategy: root = focus. depth 1 = parents + children (labelled).
// depth 2 = grandparents + grandchildren. etc.
// We merge both directions into one d3.hierarchy tree where
// "up" branches are parents and "down" branches are children.

interface EgoNode {
  id: string
  dir: 'up' | 'down' | 'root'
  children?: EgoNode[]
}

function buildEgoTree(focusId: string): EgoNode {
  const visitedUp   = new Set<string>([focusId])
  const visitedDown = new Set<string>([focusId])

  function upBranch(id: string, depth: number): EgoNode[] {
    if (depth <= 0) return []
    return (parentsOf.get(id) ?? []).map(pId => {
      if (visitedUp.has(pId)) return { id: pId, dir: 'up' as const }
      visitedUp.add(pId)
      return { id: pId, dir: 'up' as const, children: upBranch(pId, depth - 1) }
    })
  }

  function downBranch(id: string, depth: number): EgoNode[] {
    if (depth <= 0) return []
    return (childrenOf.get(id) ?? []).map(cId => {
      if (visitedDown.has(cId)) return { id: cId, dir: 'down' as const }
      visitedDown.add(cId)
      return { id: cId, dir: 'down' as const, children: downBranch(cId, depth - 1) }
    })
  }

  const upChildren   = upBranch(focusId, 3)
  const downChildren = downBranch(focusId, 3)

  return {
    id: focusId,
    dir: 'root',
    children: [...upChildren, ...downChildren].length
      ? [...upChildren, ...downChildren]
      : undefined,
  }
}

// ─── Computed positions ───────────────────────────────────────────────────────

interface RadialNode {
  id: string
  x: number   // screen x (already projected from polar)
  y: number   // screen y
  dir: 'up' | 'down' | 'root'
  depth: number
  person: Person
}

interface RadialLink {
  id: string
  d: string
}

const RADIUS = 200   // pixels per ring

function computeRadial(focusId: string, cx: number, cy: number): { nodes: RadialNode[]; links: RadialLink[] } {
  const tree = buildEgoTree(focusId)
  const root = d3.hierarchy(tree)

  // cluster() keeps leaves at equal radius; tree() is more compact — cluster better for radial
  const layout = d3.cluster<EgoNode>().size([2 * Math.PI, RADIUS * root.height || RADIUS])
  layout(root)

  const project = (angle: number, r: number) => ({
    x: cx + r * Math.cos(angle - Math.PI / 2),
    y: cy + r * Math.sin(angle - Math.PI / 2),
  })

  const nodes: RadialNode[] = []
  const links: RadialLink[] = []

  for (const d of root.descendants()) {
    const pos  = project(d.x!, d.y!)
    const person = personById.get(d.data.id)
    if (!person) continue
    nodes.push({ id: d.data.id, x: pos.x, y: pos.y, dir: d.data.dir, depth: d.depth, person })
  }

  for (const d of root.descendants()) {
    if (!d.parent) continue
    const src = project(d.parent.x!, d.parent.y!)
    const tgt = project(d.x!, d.y!)
    // Curved radial link
    const path = d3.linkRadial<{ x: number; y: number }, { x: number; y: number }>()
      .angle(n => n.x)
      .radius(n => n.y)
    const linkGen = d3.linkRadial<d3.HierarchyPointLink<EgoNode>, d3.HierarchyPointNode<EgoNode>>()
      .angle(n => n.x!)
      .radius(n => n.y!)

    // Build curved path manually for screen coords
    const r1 = d.parent.y!; const a1 = d.parent.x!
    const r2 = d.y!;        const a2 = d.x!
    const x1 = cx + r1 * Math.cos(a1 - Math.PI / 2)
    const y1 = cy + r1 * Math.sin(a1 - Math.PI / 2)
    const x2 = cx + r2 * Math.cos(a2 - Math.PI / 2)
    const y2 = cy + r2 * Math.sin(a2 - Math.PI / 2)
    // Midpoint at average radius, average angle for smooth arc
    const rM = (r1 + r2) / 2; const aM = (a1 + a2) / 2
    const xM = cx + rM * Math.cos(aM - Math.PI / 2)
    const yM = cy + rM * Math.sin(aM - Math.PI / 2)

    links.push({
      id: `${d.parent.data.id}-${d.data.id}`,
      d: `M${x1},${y1} Q${xM},${yM} ${x2},${y2}`,
    })
    void src; void tgt; void path; void linkGen
  }

  return { nodes, links }
}

// ─── SVG dimensions ───────────────────────────────────────────────────────────

const svgRef  = ref<SVGSVGElement>()
const svgW    = ref(800)
const svgH    = ref(580)

const cx = computed(() => svgW.value / 2 + pan.value.x)
const cy = computed(() => svgH.value / 2 + pan.value.y)

const pan  = ref({ x: 0, y: 0 })
const zoom = ref(1)

// ─── Reactive layout ──────────────────────────────────────────────────────────

const focusedId = ref('george')

const layout = computed(() => computeRadial(focusedId.value, cx.value, cy.value))

// ─── Pan / zoom ───────────────────────────────────────────────────────────────

let panStart: { mx: number; my: number; px: number; py: number } | null = null
let rafId = 0

const onMouseDown = (e: MouseEvent) => {
  if ((e.target as Element).closest('.ftr-card-group')) return
  panStart = { mx: e.clientX, my: e.clientY, px: pan.value.x, py: pan.value.y }
}
const onMouseMove = (e: MouseEvent) => {
  if (!panStart) return
  pan.value.x = panStart.px + (e.clientX - panStart.mx)
  pan.value.y = panStart.py + (e.clientY - panStart.my)
}
const onMouseUp = () => { panStart = null }
const onWheel = (e: WheelEvent) => {
  e.preventDefault()
  const nz = Math.min(3, Math.max(0.2, zoom.value * (e.deltaY < 0 ? 1.1 : 0.91)))
  zoom.value = nz
}

// ─── Focus ────────────────────────────────────────────────────────────────────

const setFocus = (id: string) => {
  if (id === focusedId.value) return
  focusedId.value = id
  // animate pan back to 0,0 to re-centre
  cancelAnimationFrame(rafId)
  const sx = pan.value.x; const sy = pan.value.y; const t0 = performance.now()
  const tick = (now: number) => {
    const t = Math.min((now - t0) / 400, 1)
    const e = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    pan.value.x = sx * (1 - e); pan.value.y = sy * (1 - e)
    if (t < 1) rafId = requestAnimationFrame(tick)
  }
  rafId = requestAnimationFrame(tick)
}

onMounted(() => {
  const rect = svgRef.value?.getBoundingClientRect()
  if (rect) { svgW.value = rect.width; svgH.value = rect.height }
})
onUnmounted(() => cancelAnimationFrame(rafId))

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

// ─── Node card dimensions ─────────────────────────────────────────────────────
const CARD_W = 120
const CARD_H = 52
</script>

<template>
  <div class="ftr-root">
    <div class="ftr-toolbar">
      <div class="d-flex align-center gap-2">
        <v-icon icon="mdi-chart-bubble" size="18" class="text-medium-emphasis" />
        <span class="text-body-2 font-weight-bold">Radial · D3 Cluster Layout</span>
      </div>
      <div class="d-flex align-center gap-2">
        <v-btn size="small" variant="text" density="compact" prepend-icon="mdi-fit-to-screen-outline" @click="() => { pan.x = 0; pan.y = 0; zoom = 1 }">Reset</v-btn>
        <span class="ftr-zoom-pct">{{ Math.round(zoom * 100) }}%</span>
      </div>
    </div>

    <div class="ftr-body">
      <!-- Ancestry sidebar -->
      <div class="ftr-list">
        <p class="ftr-list-heading">Ancestry</p>
        <div
          v-for="person in ancestryList"
          :key="person.id"
          class="ftr-list-item"
          :class="{ 'ftr-list-item--focus': person.id === focusedId }"
          :style="{ paddingLeft: `${8 + (ancestryDepth.get(person.id) ?? 0) * 14}px` }"
          @click="setFocus(person.id)"
        >
          <div class="ftr-list-dot" :style="{ background: genderColor(person.gender) }" />
          <div class="ftr-list-text">
            <p class="ftr-list-name">{{ person.firstName }} {{ person.lastName }}</p>
            <p class="ftr-list-years">{{ lifespan(person) }}</p>
          </div>
        </div>
      </div>

      <!-- Radial SVG canvas -->
      <div class="ftr-canvas-wrap">
        <svg
          ref="svgRef"
          class="ftr-svg"
          @mousedown="onMouseDown"
          @mousemove="onMouseMove"
          @mouseup="onMouseUp"
          @mouseleave="onMouseUp"
          @wheel.prevent="onWheel"
        >
          <defs>
            <pattern id="ftr-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1" fill="currentColor" opacity=".08" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ftr-dots)" />

          <g :transform="`scale(${zoom})`" style="transform-origin: center">
            <!-- Links -->
            <path
              v-for="link in layout.links"
              :key="link.id"
              :d="link.d"
              fill="none"
              stroke="rgba(120,120,140,.3)"
              stroke-width="1.5"
            />

            <!-- Ring labels -->
            <circle
              v-for="r in [RADIUS, RADIUS*2, RADIUS*3]"
              :key="r"
              :cx="cx"
              :cy="cy"
              :r="r"
              fill="none"
              stroke="rgba(120,120,140,.08)"
              stroke-width="1"
              stroke-dasharray="4 4"
            />

            <!-- Partner links (horizontal bars between partners at same radius) -->
            <g v-for="p in partnerships" :key="`pl-${p.id}`">
              <template
                v-if="layout.nodes.find(n => n.id === p.personA) && layout.nodes.find(n => n.id === p.personB)"
              >
                <line
                  :x1="layout.nodes.find(n => n.id === p.personA)!.x + CARD_W/2"
                  :y1="layout.nodes.find(n => n.id === p.personA)!.y + CARD_H/2"
                  :x2="layout.nodes.find(n => n.id === p.personB)!.x + CARD_W/2"
                  :y2="layout.nodes.find(n => n.id === p.personB)!.y + CARD_H/2"
                  stroke="rgba(236,72,153,.35)"
                  stroke-width="1.5"
                  stroke-dasharray="4 3"
                />
              </template>
            </g>

            <!-- Node cards -->
            <foreignObject
              v-for="node in layout.nodes"
              :key="node.id"
              :x="node.x - CARD_W/2"
              :y="node.y - CARD_H/2"
              :width="CARD_W"
              :height="CARD_H"
              class="ftr-card-group"
              style="overflow:visible"
            >
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                class="ftr-card"
                :class="{
                  'ftr-card--focus': node.id === focusedId,
                  'ftr-card--up':    node.dir === 'up',
                  'ftr-card--down':  node.dir === 'down',
                }"
                :style="{ '--gc': genderColor(node.person.gender) }"
                @click.stop="setFocus(node.id)"
              >
                <div class="ftr-avatar" :style="{ background: genderColor(node.person.gender) }">
                  {{ initials(node.person) }}
                </div>
                <div class="ftr-text">
                  <p class="ftr-name">{{ node.person.firstName }}<br>{{ node.person.lastName }}</p>
                  <p class="ftr-years">{{ node.person.birthYear }}</p>
                </div>
              </div>
            </foreignObject>
          </g>
        </svg>

        <!-- Legend -->
        <div class="ftr-legend">
          <div class="ftr-legend-item"><span class="ftr-legend-dot" style="background:#3b82f6" /> Male</div>
          <div class="ftr-legend-item"><span class="ftr-legend-dot" style="background:#ec4899" /> Female</div>
          <div class="ftr-legend-item">
            <svg width="20" height="8"><line x1="0" y1="4" x2="20" y2="4" stroke="rgba(236,72,153,.5)" stroke-width="1.5" stroke-dasharray="4 3"/></svg>
            Partnership
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ftr-root { border: 1px solid rgba(var(--v-border-color),var(--v-border-opacity)); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; }
.ftr-toolbar { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; background: rgb(var(--v-theme-surface)); border-bottom: 1px solid rgba(var(--v-border-color),var(--v-border-opacity)); flex-shrink: 0; }
.ftr-zoom-pct { font-size: 11px; color: rgba(var(--v-theme-on-surface),.38); min-width: 36px; text-align: right; }
.ftr-body { display: flex; height: 580px; }
.ftr-list { width: 196px; flex-shrink: 0; background: rgb(var(--v-theme-surface)); border-right: 1px solid rgba(var(--v-border-color),var(--v-border-opacity)); overflow-y: auto; padding: 12px 6px; }
.ftr-list-heading { font-size: 9px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: rgba(var(--v-theme-on-surface),.35); padding: 0 8px; margin-bottom: 8px; }
.ftr-list-item { display: flex; align-items: center; gap: 8px; padding: 5px 8px; border-radius: 7px; cursor: pointer; transition: background .1s; }
.ftr-list-item:hover { background: rgba(var(--v-theme-on-surface),.06); }
.ftr-list-item--focus { background: rgba(var(--v-theme-primary),.1); }
.ftr-list-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.ftr-list-text { min-width: 0; }
.ftr-list-name { font-size: 11px; font-weight: 600; color: rgb(var(--v-theme-on-surface)); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0; }
.ftr-list-years { font-size: 9px; color: rgba(var(--v-theme-on-surface),.4); margin: 0; }
.ftr-canvas-wrap { flex: 1; position: relative; overflow: hidden; }
.ftr-svg { width: 100%; height: 100%; background: rgba(var(--v-theme-on-surface),.012); cursor: grab; display: block; }
.ftr-svg:active { cursor: grabbing; }
.ftr-card { width: 100%; height: 100%; display: flex; align-items: center; gap: 6px; padding: 0 7px; background: rgb(var(--v-theme-surface)); border: 1.5px solid rgba(var(--v-border-color),var(--v-border-opacity)); border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,.1); cursor: pointer; box-sizing: border-box; transition: border-color .15s, box-shadow .15s; user-select: none; }
.ftr-card:hover { border-color: var(--gc); box-shadow: 0 3px 12px rgba(0,0,0,.16); }
.ftr-card--focus { border-color: rgb(var(--v-theme-primary)) !important; box-shadow: 0 0 0 3px rgba(var(--v-theme-primary),.18) !important; }
.ftr-card--up   { border-left: 3px solid #f59e0b; }
.ftr-card--down { border-left: 3px solid #10b981; }
.ftr-avatar { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 9px; font-weight: 800; color: white; }
.ftr-text { min-width: 0; }
.ftr-name { font-size: 10px; font-weight: 700; color: rgb(var(--v-theme-on-surface)); line-height: 1.2; margin: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.ftr-years { font-size: 9px; color: rgba(var(--v-theme-on-surface),.4); margin: 0; }
.ftr-legend { position: absolute; bottom: 12px; left: 12px; display: flex; gap: 12px; background: rgba(var(--v-theme-surface),.9); border: 1px solid rgba(var(--v-border-color),var(--v-border-opacity)); border-radius: 8px; padding: 6px 12px; font-size: 10px; color: rgba(var(--v-theme-on-surface),.6); backdrop-filter: blur(4px); pointer-events: none; align-items: center; }
.ftr-legend-item { display: flex; align-items: center; gap: 5px; }
.ftr-legend-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
</style>
