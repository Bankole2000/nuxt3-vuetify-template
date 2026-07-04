<script setup lang="ts">
// Classic D3 tree — top-down hierarchy rendered entirely in SVG.
// No foreignObject: nodes are SVG <rect> + <text>.
// d3.tree() computes positions; d3.linkVertical() draws smooth cubic bezier links.
// Marriage connector nodes (diamonds) sit between co-parents; children drop from them.
// Pan via mouse drag on background; zoom via scroll wheel.

import * as d3 from 'd3'
import {
  familyData, personById, childrenOf, parentsOf,
  genderColor, lifespan,
  type Person,
} from '~/composables/useFamilyData'

const { persons, partnerships } = familyData

// ─── Node dimensions ──────────────────────────────────────────────────────────

const NW  = 140    // node card width
const NH  = 54     // node card height
const NR  = 7      // corner radius
const DW  = 12     // diamond connector half-width
const DH  = 8      // diamond connector half-height
const HSP = 180    // horizontal spacing (d3 tree nodeSize x)
const VSP = 120    // vertical spacing (d3 tree nodeSize y)

// ─── Build strict top-down hierarchy from eldest ancestor roots ───────────────
// Root nodes = persons with no parents in the dataset.
// We need a single virtual root to feed d3.hierarchy(), then hide it in the SVG.

interface HNode {
  id: string
  type: 'person' | 'couple' | 'virtual-root'
  children?: HNode[]
}

function buildTopDownTree(): HNode {
  // Couple nodes sit between two parents; children attach to the couple node.
  // We build the tree so that each couple node is a child of the "first" parent
  // and the second parent is a sibling-like leaf.
  // For simplicity we build person-centric: each person node has couple children,
  // each couple node has child-person children.

  const visited = new Set<string>()

  function personNode(id: string): HNode {
    if (visited.has(id)) return { id, type: 'person' }
    visited.add(id)

    // Find all partnerships this person is the "primary" of
    // (personA = primary so we don't double-render each couple)
    const couplePrimary = partnerships.filter(p => p.personA === id)

    const coupleChildren: HNode[] = couplePrimary.map(ps => {
      const sharedKids = (childrenOf.get(ps.personA) ?? [])
        .filter(c => (childrenOf.get(ps.personB) ?? []).includes(c))

      const partnerNode: HNode = { id: ps.personB, type: 'person' }

      const kidNodes: HNode[] = sharedKids.map(k => personNode(k))

      return {
        id: `couple-${ps.id}`,
        type: 'couple',
        children: [partnerNode, ...kidNodes].length ? [partnerNode, ...kidNodes] : undefined,
      }
    })

    return {
      id,
      type: 'person',
      children: coupleChildren.length ? coupleChildren : undefined,
    }
  }

  // Roots = persons with no parents
  const roots = persons
    .filter(p => (parentsOf.get(p.id) ?? []).length === 0)
    .map(p => personNode(p.id))

  return { id: '__root__', type: 'virtual-root', children: roots }
}

// ─── Layout computation ───────────────────────────────────────────────────────

interface LayoutNode {
  id: string
  type: 'person' | 'couple' | 'virtual-root'
  x: number
  y: number
  person?: Person
  partnershipId?: string
  depth: number
}

interface LayoutLink {
  id: string
  d: string
}

function computeLayout() {
  const root    = d3.hierarchy(buildTopDownTree())
  const treeLayout = d3.tree<HNode>()
    .nodeSize([HSP, VSP])
    .separation((a, b) => {
      // Give person nodes more space than couple diamonds
      if (a.data.type === 'couple' || b.data.type === 'couple') return 0.6
      return a.parent === b.parent ? 1 : 1.4
    })
  treeLayout(root)

  const nodes: LayoutNode[] = []
  const links: LayoutLink[] = []

  for (const d of root.descendants()) {
    if (d.data.type === 'virtual-root') continue
    const isPerson  = d.data.type === 'person'
    const isCouple  = d.data.type === 'couple'
    const personId  = isPerson ? d.data.id : undefined
    const coupleId  = isCouple ? d.data.id.replace('couple-', '') : undefined

    nodes.push({
      id: d.data.id,
      type: d.data.type,
      x: d.x!,
      y: d.y!,
      person: personId ? personById.get(personId) : undefined,
      partnershipId: coupleId,
      depth: d.depth,
    })
  }

  // Links — cubic bezier from parent bottom-centre to child top-centre
  const bezier = (sx: number, sy: number, tx: number, ty: number) => {
    const my = (sy + ty) / 2
    return `M${sx},${sy} C${sx},${my} ${tx},${my} ${tx},${ty}`
  }

  for (const d of root.descendants()) {
    if (!d.parent || d.data.type === 'virtual-root' || d.parent.data.type === 'virtual-root') continue
    const srcY = d.parent.data.type === 'person' ? d.parent.y! + NH / 2 : d.parent.y!
    const tgtY = d.data.type    === 'person'     ? d.y! - NH / 2       : d.y! - DH
    links.push({
      id: `link-${d.parent.data.id}-${d.data.id}`,
      d: bezier(d.parent.x!, srcY, d.x!, tgtY),
    })
  }

  return { nodes, links }
}

// ─── Reactive state ───────────────────────────────────────────────────────────

const svgRef    = ref<SVGSVGElement>()
const pan       = ref({ x: 0, y: 0 })
const zoom      = ref(0.7)
const highlight = ref<string | null>(null)

const { nodes, links } = computeLayout()

// Pre-compute bounding box to centre on mount
const xs = nodes.map(n => n.x)
const ys = nodes.map(n => n.y)
const bboxMinX = Math.min(...xs) - NW
const bboxMaxX = Math.max(...xs) + NW
const bboxMinY = Math.min(...ys)
const bboxMaxY = Math.max(...ys) + NH

// ─── Pan / zoom ───────────────────────────────────────────────────────────────

let panStart: { mx: number; my: number; px: number; py: number } | null = null

const onMouseDown = (e: MouseEvent) => {
  if ((e.target as Element).closest('.ftd-node')) return
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
  const rect = svgRef.value!.getBoundingClientRect()
  const mx = e.clientX - rect.left
  const my = e.clientY - rect.top
  const nz = Math.min(3, Math.max(0.15, zoom.value * (e.deltaY < 0 ? 1.1 : 0.91)))
  pan.value.x = mx - (mx - pan.value.x) * (nz / zoom.value)
  pan.value.y = my - (my - pan.value.y) * (nz / zoom.value)
  zoom.value = nz
}

const fitAll = () => {
  const rect = svgRef.value?.getBoundingClientRect()
  if (!rect) return
  const scaleX = rect.width  / (bboxMaxX - bboxMinX)
  const scaleY = rect.height / (bboxMaxY - bboxMinY)
  const s = Math.min(scaleX, scaleY) * 0.88
  zoom.value = s
  pan.value.x = rect.width  / 2 - ((bboxMinX + bboxMaxX) / 2) * s
  pan.value.y = rect.height / 2 - ((bboxMinY + bboxMaxY) / 2) * s
}

onMounted(() => nextTick(fitAll))

// ─── Ancestry list (static from George) ──────────────────────────────────────

const ANCHOR = 'george'

const ancestryList = computed(() => {
  const list: Person[] = []; const seen = new Set<string>(); const queue = [ANCHOR]
  while (queue.length) {
    const id = queue.shift()!; if (seen.has(id)) continue; seen.add(id)
    const p = personById.get(id); if (p) list.push(p)
    for (const pId of (parentsOf.get(id) ?? [])) if (!seen.has(pId)) queue.push(pId)
  }
  return list
})

const ancestryDepth = computed(() => {
  const depth = new Map<string, number>(); const seen = new Set<string>()
  const queue: Array<{ id: string; d: number }> = [{ id: ANCHOR, d: 0 }]
  while (queue.length) {
    const item = queue.shift()!; if (seen.has(item.id)) continue; seen.add(item.id)
    depth.set(item.id, item.d)
    for (const pId of (parentsOf.get(item.id) ?? [])) if (!seen.has(pId)) queue.push({ id: pId, d: item.d + 1 })
  }
  return depth
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

const nodeColor = (n: LayoutNode) => {
  if (!n.person) return '#9ca3af'
  return genderColor(n.person.gender)
}

const isHighlighted = (id: string) => !highlight.value || highlight.value === id

const partnershipLabel = (psId: string) => {
  const ps = partnerships.find(p => p.id === psId)
  return ps?.marriageYear ? `${ps.marriageYear}` : '♥'
}

// Diamond SVG path centred at (cx, cy)
const diamondPath = (cx: number, cy: number) =>
  `M${cx},${cy - DH} L${cx + DW},${cy} L${cx},${cy + DH} L${cx - DW},${cy} Z`
</script>

<template>
  <div class="ftd-root">
    <!-- Toolbar -->
    <div class="ftd-toolbar">
      <div class="d-flex align-center gap-2">
        <v-icon icon="mdi-sitemap" size="18" class="text-medium-emphasis" />
        <span class="text-body-2 font-weight-bold">Top-down · D3 Tree + SVG</span>
      </div>
      <div class="d-flex align-center gap-2">
        <v-btn size="small" variant="text" density="compact" prepend-icon="mdi-fit-to-screen-outline" @click="fitAll">Fit</v-btn>
        <span class="ftd-zoom-pct">{{ Math.round(zoom * 100) }}%</span>
      </div>
    </div>

    <div class="ftd-body">
      <!-- Ancestry sidebar -->
      <div class="ftd-list">
        <p class="ftd-list-heading">George's Ancestry</p>
        <div
          v-for="person in ancestryList"
          :key="person.id"
          class="ftd-list-item"
          :class="{ 'ftd-list-item--hl': highlight === person.id }"
          :style="{ paddingLeft: `${8 + (ancestryDepth.get(person.id) ?? 0) * 14}px` }"
          @mouseenter="highlight = person.id"
          @mouseleave="highlight = null"
        >
          <div class="ftd-list-dot" :style="{ background: genderColor(person.gender) }" />
          <div class="ftd-list-text">
            <p class="ftd-list-name">{{ person.firstName }} {{ person.lastName }}</p>
            <p class="ftd-list-years">{{ lifespan(person) }}</p>
          </div>
        </div>
      </div>

      <!-- SVG canvas -->
      <div class="ftd-canvas-wrap">
        <svg
          ref="svgRef"
          class="ftd-svg"
          @mousedown="onMouseDown"
          @mousemove="onMouseMove"
          @mouseup="onMouseUp"
          @mouseleave="onMouseUp"
          @wheel.prevent="onWheel"
        >
          <!-- Dot grid -->
          <defs>
            <pattern id="ftd-grid" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1" fill="currentColor" opacity=".07" />
            </pattern>

            <!-- Drop shadow filter for hovered nodes -->
            <filter id="ftd-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="4" flood-opacity=".18" />
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="url(#ftd-grid)" />

          <!-- World -->
          <g :transform="`translate(${pan.x},${pan.y}) scale(${zoom})`">

            <!-- Links -->
            <g class="ftd-links">
              <path
                v-for="link in links"
                :key="link.id"
                :d="link.d"
                fill="none"
                stroke="rgba(140,140,160,.35)"
                stroke-width="1.8"
              />
            </g>

            <!-- Nodes -->
            <g class="ftd-nodes">
              <!-- Person cards -->
              <g
                v-for="n in nodes.filter(n => n.type === 'person' && n.person)"
                :key="n.id"
                class="ftd-node"
                :style="{ cursor: 'default' }"
                :opacity="isHighlighted(n.id) ? 1 : 0.3"
                @mouseenter="highlight = n.id"
                @mouseleave="highlight = null"
              >
                <!-- Card background -->
                <rect
                  :x="n.x - NW / 2"
                  :y="n.y - NH / 2"
                  :width="NW"
                  :height="NH"
                  :rx="NR"
                  fill="var(--ftd-surface)"
                  :stroke="nodeColor(n)"
                  stroke-width="2"
                  :filter="highlight === n.id ? 'url(#ftd-shadow)' : undefined"
                />

                <!-- Colour accent bar on left -->
                <rect
                  :x="n.x - NW / 2"
                  :y="n.y - NH / 2"
                  :width="6"
                  :height="NH"
                  :rx="NR"
                  :fill="nodeColor(n)"
                />
                <!-- Cover sharp right corners of accent bar -->
                <rect
                  :x="n.x - NW / 2 + 3"
                  :y="n.y - NH / 2"
                  :width="4"
                  :height="NH"
                  :fill="nodeColor(n)"
                />

                <!-- Avatar circle -->
                <circle
                  :cx="n.x - NW / 2 + 24"
                  :cy="n.y"
                  r="14"
                  :fill="nodeColor(n)"
                />
                <text
                  :x="n.x - NW / 2 + 24"
                  :y="n.y + 4"
                  text-anchor="middle"
                  fill="white"
                  font-size="9"
                  font-weight="800"
                  font-family="system-ui, sans-serif"
                >
                  {{ (n.person!.firstName[0] ?? '') + (n.person!.lastName[0] ?? '') }}
                </text>

                <!-- Name -->
                <text
                  :x="n.x - NW / 2 + 46"
                  :y="n.y - 7"
                  fill="var(--ftd-text)"
                  font-size="11"
                  font-weight="700"
                  font-family="system-ui, sans-serif"
                >
                  {{ n.person!.firstName }} {{ n.person!.lastName }}
                </text>

                <!-- Years -->
                <text
                  :x="n.x - NW / 2 + 46"
                  :y="n.y + 9"
                  fill="var(--ftd-muted)"
                  font-size="9"
                  font-family="system-ui, sans-serif"
                >
                  {{ lifespan(n.person!) }}
                </text>

                <!-- Deceased strike -->
                <line
                  v-if="n.person!.deathYear"
                  :x1="n.x - NW / 2 + 44"
                  :y1="n.y - NH / 2 + 2"
                  :x2="n.x + NW / 2 - 4"
                  :y2="n.y + NH / 2 - 2"
                  stroke="rgba(180,180,180,.35)"
                  stroke-width="1"
                />
              </g>

              <!-- Couple diamond connectors -->
              <g
                v-for="n in nodes.filter(n => n.type === 'couple')"
                :key="n.id"
              >
                <path
                  :d="diamondPath(n.x, n.y)"
                  :fill="partnerships.find(p => p.id === n.partnershipId)?.ended ? '#ef4444' : '#10b981'"
                  stroke="var(--ftd-surface)"
                  stroke-width="2"
                />
                <text
                  :x="n.x"
                  :y="n.y + DH + 10"
                  text-anchor="middle"
                  fill="var(--ftd-muted)"
                  font-size="8"
                  font-family="system-ui, sans-serif"
                >
                  {{ n.partnershipId ? partnershipLabel(n.partnershipId) : '' }}
                </text>
              </g>
            </g>
          </g>

          <!-- Generation labels (outside world transform — fixed to left edge) -->
          <g v-if="zoom > 0.3">
            <text
              v-for="(label, i) in ['Great-grandparents', 'Grandparents', 'Parents', 'Focus gen.', 'Children', 'Grandchildren']"
              :key="i"
              x="8"
              :y="10 + i * VSP * zoom + pan.y"
              fill="rgba(140,140,160,.45)"
              font-size="9"
              font-family="system-ui, sans-serif"
            >{{ label }}</text>
          </g>
        </svg>

        <!-- Legend -->
        <div class="ftd-legend">
          <div class="ftd-leg-item">
            <svg width="12" height="12"><rect x="0" y="0" width="12" height="12" rx="2" fill="#3b82f6"/></svg>
            Male
          </div>
          <div class="ftd-leg-item">
            <svg width="12" height="12"><rect x="0" y="0" width="12" height="12" rx="2" fill="#ec4899"/></svg>
            Female
          </div>
          <div class="ftd-leg-item">
            <svg width="14" height="12"><path d="M7,0 L14,6 L7,12 L0,6 Z" fill="#10b981"/></svg>
            Partnership (active)
          </div>
          <div class="ftd-leg-item">
            <svg width="14" height="12"><path d="M7,0 L14,6 L7,12 L0,6 Z" fill="#ef4444"/></svg>
            Ended
          </div>
          <div class="ftd-leg-item">
            <svg width="20" height="12">
              <rect x="0" y="2" width="20" height="8" rx="2" fill="none" stroke="#9ca3af" stroke-width="1.5"/>
              <line x1="1" y1="2" x2="19" y2="10" stroke="rgba(180,180,180,.5)" stroke-width="1"/>
            </svg>
            Deceased
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ftd-root {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.ftd-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  flex-shrink: 0;
}
.ftd-zoom-pct {
  font-size: 11px;
  color: rgba(var(--v-theme-on-surface), .38);
  min-width: 36px;
  text-align: right;
}

.ftd-body {
  display: flex;
  height: 580px;
}

/* Ancestry list */
.ftd-list {
  width: 196px;
  flex-shrink: 0;
  background: rgb(var(--v-theme-surface));
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  overflow-y: auto;
  padding: 12px 6px;
}
.ftd-list-heading {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), .35);
  padding: 0 8px;
  margin-bottom: 8px;
}
.ftd-list-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 8px;
  border-radius: 7px;
  cursor: default;
  transition: background .1s;
}
.ftd-list-item:hover,
.ftd-list-item--hl { background: rgba(var(--v-theme-primary), .08); }
.ftd-list-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.ftd-list-text { min-width: 0; }
.ftd-list-name {
  font-size: 11px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}
.ftd-list-years { font-size: 9px; color: rgba(var(--v-theme-on-surface), .4); margin: 0; }

/* Canvas */
.ftd-canvas-wrap {
  flex: 1;
  position: relative;
  overflow: hidden;
}
.ftd-svg {
  width: 100%;
  height: 100%;
  background: rgba(var(--v-theme-on-surface), .012);
  cursor: grab;
  display: block;
  /* CSS vars tunnelled into SVG fill attributes */
  --ftd-surface: rgb(var(--v-theme-surface));
  --ftd-text:    rgb(var(--v-theme-on-surface));
  --ftd-muted:   rgba(var(--v-theme-on-surface), .45);
}
.ftd-svg:active { cursor: grabbing; }

/* Legend */
.ftd-legend {
  position: absolute;
  bottom: 12px;
  left: 12px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  background: rgba(var(--v-theme-surface), .92);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 10px;
  color: rgba(var(--v-theme-on-surface), .6);
  backdrop-filter: blur(4px);
  pointer-events: none;
  align-items: center;
}
.ftd-leg-item {
  display: flex;
  align-items: center;
  gap: 5px;
}
</style>
