<script setup lang="ts">
import * as d3 from 'd3'
import {
  familyData, personById, childrenOf, parentsOf, partnerOf,
  genderColor, initials, lifespan,
  type Person,
} from '~/composables/useFamilyData'

const { persons, partnerships, parentChild: parentChildEdges } = familyData

// ─── Layout constants ─────────────────────────────────────────────────────────

const NODE_W = 168
const NODE_H = 64
const H_SEP  = 220
const V_SEP  = 130

// ─── D3 bidirectional layout ──────────────────────────────────────────────────

interface TreeNode { id: string; children?: TreeNode[] }

interface PlacedNode {
  id: string; x: number; y: number
  role: 'focus' | 'ancestor' | 'descendant' | 'sibling' | 'partner'
}

interface MarriageBar {
  id: string; x1: number; x2: number; y: number; midX: number; childY: number
}

interface LinkPath { id: string; d: string }

function buildDescendantTree(rootId: string, visited = new Set<string>()): TreeNode {
  if (visited.has(rootId)) return { id: rootId }
  visited.add(rootId)
  const kids = (childrenOf.get(rootId) ?? []).map(k => buildDescendantTree(k, visited))
  return { id: rootId, children: kids.length ? kids : undefined }
}

function buildAncestorTree(rootId: string, visited = new Set<string>()): TreeNode {
  if (visited.has(rootId)) return { id: rootId }
  visited.add(rootId)
  const parents = (parentsOf.get(rootId) ?? []).map(p => buildAncestorTree(p, visited))
  return { id: rootId, children: parents.length ? parents : undefined }
}

function computeLayout(focusId: string) {
  const placed = new Map<string, PlacedNode>()

  const descRoot = d3.hierarchy(buildDescendantTree(focusId))
  d3.tree<TreeNode>().nodeSize([H_SEP, V_SEP])(descRoot)
  for (const node of descRoot.descendants()) {
    if (placed.has(node.data.id)) continue
    placed.set(node.data.id, { id: node.data.id, x: node.x!, y: node.y!, role: node.data.id === focusId ? 'focus' : 'descendant' })
  }

  const ancRoot = d3.hierarchy(buildAncestorTree(focusId))
  d3.tree<TreeNode>().nodeSize([H_SEP, V_SEP])(ancRoot)
  for (const node of ancRoot.descendants()) {
    if (node.data.id === focusId || placed.has(node.data.id)) continue
    placed.set(node.data.id, { id: node.data.id, x: node.x!, y: -node.y!, role: 'ancestor' })
  }

  for (const pId of (parentsOf.get(focusId) ?? [])) {
    for (const sibId of (childrenOf.get(pId) ?? [])) {
      if (sibId !== focusId) { const n = placed.get(sibId); if (n) n.role = 'sibling' }
    }
  }

  for (const [id, node] of placed) {
    for (const partnerId of (partnerOf.get(id) ?? [])) {
      if (!placed.has(partnerId) && personById.has(partnerId)) {
        placed.set(partnerId, { id: partnerId, x: node.x + NODE_W + 24, y: node.y, role: 'partner' })
      }
    }
  }

  return placed
}

function computeMarriageBars(placed: Map<string, PlacedNode>): MarriageBar[] {
  return partnerships.flatMap(p => {
    const a = placed.get(p.personA); const b = placed.get(p.personB)
    if (!a || !b) return []
    const barY = (a.y + b.y) / 2 + NODE_H / 2
    const shared = (childrenOf.get(p.personA) ?? []).filter(c => (childrenOf.get(p.personB) ?? []).includes(c))
    if (!shared.length) return []
    const firstChild = placed.get(shared[0]!)
    return [{
      id: p.id,
      x1: Math.min(a.x, b.x) + NODE_W / 2,
      x2: Math.max(a.x, b.x) + NODE_W / 2,
      y: barY,
      midX: (Math.min(a.x, b.x) + Math.max(a.x, b.x) + NODE_W) / 2,
      childY: firstChild ? firstChild.y : (a.y + b.y) / 2 + V_SEP,
    }]
  })
}

function computeLinks(placed: Map<string, PlacedNode>, bars: MarriageBar[]): LinkPath[] {
  const barForChild = new Map<string, MarriageBar>()
  for (const p of partnerships) {
    const bar = bars.find(b => b.id === p.id)
    if (!bar) continue
    const shared = (childrenOf.get(p.personA) ?? []).filter(c => (childrenOf.get(p.personB) ?? []).includes(c))
    for (const cId of shared) barForChild.set(cId, bar)
  }
  const drawn = new Set<string>()
  return parentChildEdges.flatMap(pc => {
    const child = placed.get(pc.childId); const parent = placed.get(pc.parentId)
    if (!child || !parent) return []
    const bar = barForChild.get(pc.childId)
    const key = bar ? `bar-${bar.id}-${pc.childId}` : `direct-${pc.parentId}-${pc.childId}`
    if (drawn.has(key)) return []
    drawn.add(key)
    const cx = child.x + NODE_W / 2; const cy = child.y
    if (bar) {
      const midY = (bar.y + cy) / 2
      return [{ id: key, d: `M${bar.midX},${bar.y} V${midY} H${cx} V${cy}` }]
    }
    const px = parent.x + NODE_W / 2; const py = parent.y + (cy > parent.y ? NODE_H : 0)
    const midY = (py + cy) / 2
    return [{ id: key, d: `M${px},${py} V${midY} H${cx} V${cy}` }]
  })
}

// ─── Reactive state ───────────────────────────────────────────────────────────

const focusedId   = ref('george')
const placedNodes = computed(() => computeLayout(focusedId.value))
const placedArray = computed(() => Array.from(placedNodes.value.values()))
const bars        = computed(() => computeMarriageBars(placedNodes.value))
const links       = computed(() => computeLinks(placedNodes.value, bars.value))

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

// ─── Canvas pan / zoom ────────────────────────────────────────────────────────

const svgRef = ref<SVGSVGElement>()
const pan    = ref({ x: 0, y: 0 })
const zoom   = ref(0.85)
let panStart: { mx: number; my: number; px: number; py: number } | null = null
let rafId = 0

const onSvgMouseDown = (e: MouseEvent) => {
  if ((e.target as Element).closest('.ft-card-group')) return
  panStart = { mx: e.clientX, my: e.clientY, px: pan.value.x, py: pan.value.y }
}
const onSvgMouseMove = (e: MouseEvent) => {
  if (!panStart) return
  pan.value.x = panStart.px + (e.clientX - panStart.mx)
  pan.value.y = panStart.py + (e.clientY - panStart.my)
}
const onSvgMouseUp = () => { panStart = null }
const onWheel = (e: WheelEvent) => {
  e.preventDefault()
  const rect = svgRef.value!.getBoundingClientRect()
  const mx = e.clientX - rect.left; const my = e.clientY - rect.top
  const nz = Math.min(3, Math.max(0.2, zoom.value * (e.deltaY < 0 ? 1.1 : 0.91)))
  pan.value.x = mx - (mx - pan.value.x) * (nz / zoom.value)
  pan.value.y = my - (my - pan.value.y) * (nz / zoom.value)
  zoom.value = nz
}

const animatePanTo = (tx: number, ty: number) => {
  cancelAnimationFrame(rafId)
  const sx = pan.value.x; const sy = pan.value.y; const t0 = performance.now()
  const tick = (now: number) => {
    const t = Math.min((now - t0) / 420, 1)
    const e = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    pan.value.x = sx + (tx - sx) * e; pan.value.y = sy + (ty - sy) * e
    if (t < 1) rafId = requestAnimationFrame(tick)
  }
  rafId = requestAnimationFrame(tick)
}

const centreOn = (nodeId: string) => {
  const node = placedNodes.value.get(nodeId); const rect = svgRef.value?.getBoundingClientRect()
  if (!node || !rect) return
  animatePanTo(rect.width / 2 - (node.x + NODE_W / 2) * zoom.value, rect.height / 2 - (node.y + NODE_H / 2) * zoom.value)
}

const setFocus = (id: string) => {
  if (id === focusedId.value) return
  focusedId.value = id; nextTick(() => centreOn(id))
}

onMounted(() => nextTick(() => centreOn(focusedId.value)))
onUnmounted(() => cancelAnimationFrame(rafId))

// ─── Minimap ──────────────────────────────────────────────────────────────────

const MM_W = 168; const MM_H = 100

const worldBounds = computed(() => {
  const nodes = placedArray.value
  if (!nodes.length) return { minX: 0, maxX: 600, minY: -300, maxY: 300 }
  return {
    minX: Math.min(...nodes.map(n => n.x)) - 40,
    maxX: Math.max(...nodes.map(n => n.x)) + NODE_W + 40,
    minY: Math.min(...nodes.map(n => n.y)) - 40,
    maxY: Math.max(...nodes.map(n => n.y)) + NODE_H + 40,
  }
})

const mmScale = computed(() => {
  const b = worldBounds.value
  return Math.min(MM_W / (b.maxX - b.minX), MM_H / (b.maxY - b.minY)) * 0.92
})

const mmRect = (n: PlacedNode) => {
  const b = worldBounds.value; const s = mmScale.value
  return { x: (n.x - b.minX) * s + 4, y: (n.y - b.minY) * s + 4, w: Math.max(4, NODE_W * s), h: Math.max(3, NODE_H * s) }
}

const mmViewport = computed(() => {
  const rect = svgRef.value?.getBoundingClientRect()
  if (!rect) return { x: 0, y: 0, w: MM_W, h: MM_H }
  const b = worldBounds.value; const s = mmScale.value
  return {
    x: ((-pan.value.x / zoom.value) - b.minX) * s + 4,
    y: ((-pan.value.y / zoom.value) - b.minY) * s + 4,
    w: (rect.width / zoom.value) * s,
    h: (rect.height / zoom.value) * s,
  }
})
</script>

<template>
  <div class="ft-root">
    <div class="ft-toolbar">
      <div class="d-flex align-center gap-2">
        <v-icon icon="mdi-family-tree" size="18" class="text-medium-emphasis" />
        <span class="text-body-2 font-weight-bold">Bidirectional · D3 Tree Layout</span>
      </div>
      <div class="d-flex align-center gap-2">
        <v-btn size="small" variant="text" density="compact" prepend-icon="mdi-fit-to-screen-outline" @click="centreOn(focusedId)">Centre</v-btn>
        <span class="ft-zoom-pct">{{ Math.round(zoom * 100) }}%</span>
      </div>
    </div>

    <div class="ft-body">
      <!-- Ancestry sidebar -->
      <div class="ft-list">
        <p class="ft-list-heading">Ancestry</p>
        <div
          v-for="person in ancestryList"
          :key="person.id"
          class="ft-list-item"
          :class="{ 'ft-list-item--focus': person.id === focusedId }"
          :style="{ paddingLeft: `${8 + (ancestryDepth.get(person.id) ?? 0) * 14}px` }"
          @click="setFocus(person.id)"
        >
          <div class="ft-list-dot" :style="{ background: genderColor(person.gender) }" />
          <div class="ft-list-text">
            <p class="ft-list-name">{{ person.firstName }} {{ person.lastName }}</p>
            <p class="ft-list-years">{{ lifespan(person) }}</p>
          </div>
        </div>
      </div>

      <!-- Canvas -->
      <div class="ft-canvas-wrap">
        <svg
          ref="svgRef" class="ft-svg"
          @mousedown="onSvgMouseDown" @mousemove="onSvgMouseMove"
          @mouseup="onSvgMouseUp" @mouseleave="onSvgMouseUp" @wheel.prevent="onWheel"
        >
          <defs>
            <pattern id="ft-dots" :x="pan.x % (24*zoom)" :y="pan.y % (24*zoom)" :width="24*zoom" :height="24*zoom" patternUnits="userSpaceOnUse">
              <circle :cx="1.5*zoom" :cy="1.5*zoom" :r="1*zoom" fill="currentColor" opacity=".1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ft-dots)" />

          <g :transform="`translate(${pan.x},${pan.y}) scale(${zoom})`">
            <!-- Marriage bars -->
            <line v-for="bar in bars" :key="`bl-${bar.id}`" :x1="bar.x1" :y1="bar.y" :x2="bar.x2" :y2="bar.y" stroke="rgba(120,120,140,.45)" stroke-width="2" />
            <circle v-for="bar in bars" :key="`bd-${bar.id}`" :cx="bar.midX" :cy="bar.y" r="5" fill="rgba(120,120,140,.3)" stroke="white" stroke-width="1.5" />
            <!-- Links -->
            <path v-for="link in links" :key="link.id" :d="link.d" fill="none" stroke="rgba(120,120,140,.32)" stroke-width="1.5" stroke-linejoin="round" />
            <!-- Nodes via foreignObject -->
            <foreignObject
              v-for="node in placedArray" :key="node.id"
              :x="node.x" :y="node.y" :width="NODE_W" :height="NODE_H"
              class="ft-card-group" style="overflow:visible"
            >
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                class="ft-card"
                :class="{
                  'ft-card--focus':      node.id === focusedId,
                  'ft-card--sibling':    node.role === 'sibling',
                  'ft-card--partner':    node.role === 'partner',
                }"
                :style="{ '--gc': genderColor((personById.get(node.id) ?? persons[0]!).gender) }"
                @click.stop="setFocus(node.id)"
              >
                <div class="ft-avatar" :style="{ background: genderColor((personById.get(node.id) ?? persons[0]!).gender) }">
                  {{ initials(personById.get(node.id) ?? persons[0]!) }}
                </div>
                <div class="ft-text">
                  <p class="ft-name">{{ (personById.get(node.id) ?? persons[0]!).firstName }} {{ (personById.get(node.id) ?? persons[0]!).lastName }}</p>
                  <p class="ft-years">{{ lifespan(personById.get(node.id) ?? persons[0]!) }}</p>
                </div>
              </div>
            </foreignObject>
          </g>
        </svg>

        <!-- Minimap -->
        <div class="ft-minimap">
          <svg :width="MM_W" :height="MM_H">
            <rect width="100%" height="100%" rx="4" fill="rgba(var(--v-theme-surface-variant),.92)" />
            <rect v-for="n in placedArray" :key="`mm-${n.id}`" v-bind="{ x: mmRect(n).x, y: mmRect(n).y, width: mmRect(n).w, height: mmRect(n).h }" rx="1" :fill="n.id === focusedId ? 'rgb(var(--v-theme-primary))' : 'rgba(var(--v-theme-on-surface),.18)'" />
            <rect :x="mmViewport.x" :y="mmViewport.y" :width="Math.max(8,mmViewport.w)" :height="Math.max(8,mmViewport.h)" fill="none" stroke="rgb(var(--v-theme-primary))" stroke-width="1.5" rx="2" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ft-root { border: 1px solid rgba(var(--v-border-color),var(--v-border-opacity)); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; }
.ft-toolbar { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; background: rgb(var(--v-theme-surface)); border-bottom: 1px solid rgba(var(--v-border-color),var(--v-border-opacity)); flex-shrink: 0; }
.ft-zoom-pct { font-size: 11px; color: rgba(var(--v-theme-on-surface),.38); min-width: 36px; text-align: right; }
.ft-body { display: flex; height: 580px; }
.ft-list { width: 196px; flex-shrink: 0; background: rgb(var(--v-theme-surface)); border-right: 1px solid rgba(var(--v-border-color),var(--v-border-opacity)); overflow-y: auto; padding: 12px 6px; }
.ft-list-heading { font-size: 9px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: rgba(var(--v-theme-on-surface),.35); padding: 0 8px; margin-bottom: 8px; }
.ft-list-item { display: flex; align-items: center; gap: 8px; padding: 5px 8px; border-radius: 7px; cursor: pointer; transition: background .1s; }
.ft-list-item:hover { background: rgba(var(--v-theme-on-surface),.06); }
.ft-list-item--focus { background: rgba(var(--v-theme-primary),.1); }
.ft-list-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.ft-list-text { min-width: 0; }
.ft-list-name { font-size: 11px; font-weight: 600; color: rgb(var(--v-theme-on-surface)); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0; }
.ft-list-years { font-size: 9px; color: rgba(var(--v-theme-on-surface),.4); margin: 0; }
.ft-canvas-wrap { flex: 1; position: relative; overflow: hidden; }
.ft-svg { width: 100%; height: 100%; background: rgba(var(--v-theme-on-surface),.015); cursor: grab; display: block; }
.ft-svg:active { cursor: grabbing; }
.ft-card { width: 100%; height: 100%; display: flex; align-items: center; gap: 9px; padding: 0 10px; background: rgb(var(--v-theme-surface)); border: 1.5px solid rgba(var(--v-border-color),var(--v-border-opacity)); border-radius: 10px; box-shadow: 0 2px 6px rgba(0,0,0,.1); cursor: pointer; box-sizing: border-box; transition: border-color .15s, box-shadow .15s; user-select: none; }
.ft-card:hover { border-color: var(--gc); box-shadow: 0 4px 14px rgba(0,0,0,.16); }
.ft-card--focus { border-color: rgb(var(--v-theme-primary)) !important; box-shadow: 0 0 0 3px rgba(var(--v-theme-primary),.18), 0 4px 16px rgba(0,0,0,.14) !important; }
.ft-card--sibling { opacity: .5; }
.ft-card--partner { opacity: .75; }
.ft-avatar { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 11px; font-weight: 800; color: white; }
.ft-text { min-width: 0; }
.ft-name { font-size: 12px; font-weight: 700; color: rgb(var(--v-theme-on-surface)); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.3; margin: 0; }
.ft-years { font-size: 10px; color: rgba(var(--v-theme-on-surface),.45); font-variant-numeric: tabular-nums; margin: 0; }
.ft-minimap { position: absolute; bottom: 12px; right: 12px; border-radius: 6px; overflow: hidden; border: 1px solid rgba(var(--v-border-color),var(--v-border-opacity)); box-shadow: 0 2px 8px rgba(0,0,0,.14); pointer-events: none; }
</style>
