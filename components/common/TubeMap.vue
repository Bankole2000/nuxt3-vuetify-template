<script setup lang="ts">
import * as d3 from 'd3'

/**
 * TubeMap — SVG transit map component.
 *
 * Replicates the rendering approach from d3-tube-map (johnwalley/d3-tube-map):
 *   - Grid coordinate system (integer x/y, y-up)
 *   - Lines travel only in 8 compass directions (N/NE/E/SE/S/SW/W/NW)
 *   - Direction changes are drawn as quadratic bezier curves
 *   - Station tick marks perpendicular to line direction
 *   - Interchange stations drawn as circles
 *   - Labels positioned by compass bearing from the station
 *
 * Corner rule (from the original library):
 *   At a turn from direction A to direction B, the corner node must be
 *   exactly (vecA + vecB) steps away from the previous node.
 *   Valid corner steps: |dx|=1,|dy|=1  OR  |dx|=1,|dy|=2  OR  |dx|=2,|dy|=1
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TubeStation {
  label: string
  closed?: boolean
}

export interface TubeNode {
  /** Integer grid coordinate [x, y] */
  coords: [number, number]
  /** Station key — omit for waypoint-only nodes */
  name?: string
  /** Label placement compass bearing: N/NE/E/SE/S/SW/W/NW */
  labelPos?: string
  /** Suppress station marker (still sets label position if canonical) */
  hide?: boolean
  /** Mark as the canonical label-position node when station is on multiple lines */
  canonical?: boolean
  /** Override the default shiftCoords for this node */
  shiftCoords?: [number, number]
  /** 'station' (tick) | 'interchange' (circle) — default 'station' */
  marker?: 'station' | 'interchange'
}

export interface TubeLine {
  name: string
  label?: string
  color: string
  /** [dx, dy] pixel shift so parallel lines don't overlap */
  shiftCoords: [number, number]
  shiftNormal?: number
  nodes: TubeNode[]
}

export interface TubeMapData {
  stations: Record<string, TubeStation>
  lines: TubeLine[]
}

const props = withDefaults(defineProps<{
  data: TubeMapData
  width?: number
  height?: number
  margin?: { top: number; right: number; bottom: number; left: number }
}>(), {
  width: 800,
  height: 520,
  margin: () => ({ top: 70, right: 120, bottom: 50, left: 120 }),
})

const emit = defineEmits<{ stationClick: [name: string] }>()

const containerRef = ref<HTMLDivElement | null>(null)

// ── Direction helpers (ported from directions.js) ─────────────────────────────

const DIR: Record<string, [number, number]> = {
  N:  [ 0,  1], NE: [ 1,  1], E:  [ 1,  0], SE: [ 1, -1],
  S:  [ 0, -1], SW: [-1, -1], W:  [-1,  0], NW: [-1,  1],
}

function cross2d(a: [number,number], b: [number,number]) {
  return a[0]*b[1] - a[1]*b[0]
}
function areParallel(a: [number,number], b: [number,number]) {
  return cross2d(a,b) === 0 && Math.sign(a[0]) === Math.sign(b[0]) && Math.sign(a[1]) === Math.sign(b[1])
}
function norm2d(v: [number,number]) {
  return Math.sqrt(v[0]*v[0] + v[1]*v[1])
}
function normalize(v: [number,number]): [number,number] {
  const n = norm2d(v)
  return [v[0]/n, v[1]/n]
}
function compassBearing(v: [number,number]): string {
  const entry = Object.entries(DIR).find(([, vec]) => areParallel(vec as [number,number], v))
  if (!entry) throw new Error(`No compass bearing for [${v}]`)
  return entry[0]
}
function dirVec(bearing: string): [number,number] {
  const v = DIR[bearing.toUpperCase()]
  if (!v) throw new Error(`Unknown bearing: ${bearing}`)
  return v
}

// ── Populate directions along each line (ported from curve.js) ────────────────

interface ProcessedNode extends TubeNode {
  _dir: string
}

function populateDirections(nodes: TubeNode[]): ProcessedNode[] {
  const out: ProcessedNode[] = nodes.map(n => ({ ...n, _dir: '' }))
  for (let i = 1; i < out.length; i++) {
    const prev = out[i-1]!
    const curr = out[i]!
    const dx = Math.round(curr.coords[0]) - Math.round(prev.coords[0])
    const dy = Math.round(curr.coords[1]) - Math.round(prev.coords[1])
    if (dx === 0 && dy === 0) throw new Error(`Repeated coords at node ${i}`)

    const diff: [number,number] = [dx, dy]
    if (i === 1) prev._dir = compassBearing(diff)

    const prevVec = dirVec(prev._dir)
    if (areParallel(prevVec, diff)) {
      curr._dir = compassBearing(diff)
    } else {
      const cornerOk =
        (Math.abs(dx)===1 && Math.abs(dy)===1) ||
        (Math.abs(dx)===1 && Math.abs(dy)===2) ||
        (Math.abs(dx)===2 && Math.abs(dy)===1)
      if (!cornerOk) throw new Error(
        `Cannot draw corner between [${prev.coords}] and [${curr.coords}] (dx=${dx},dy=${dy}, incoming ${prev._dir})`
      )
      const nextVec: [number,number] = [dx - prevVec[0], dy - prevVec[1]]
      curr._dir = compassBearing(nextVec)
    }
  }
  return out
}

// ── Coordinate transform: grid → SVG pixels ───────────────────────────────────

interface Scales { minX: number; minY: number; unitPx: number; lineW: number }

function toSVG(
  gx: number, gy: number,
  s: Scales,
  margin: { top: number; left: number },
  shiftCoords: [number,number],
  shiftNormal: number,
  tangent: [number,number],
  tangentialShift = 0,
): [number, number] {
  const shiftScale = s.lineW / s.unitPx
  const sx = shiftCoords[0] + shiftNormal * tangent[1]
  const sy = shiftCoords[1] - shiftNormal * tangent[0]
  const px = margin.left + (gx + tangentialShift * tangent[0] + shiftScale * sx - s.minX) * s.unitPx
  // SVG y-axis is flipped vs grid y-axis
  const py = margin.top  + (s.minY - gy - tangentialShift * tangent[1] - shiftScale * sy) * s.unitPx
  return [px, py]
}

// ── Build SVG path for one line (ported from curve.js `line()`) ───────────────

interface LinePath {
  d: string
  color: string
  width: number
}

function buildLinePath(
  nodes: ProcessedNode[],
  line: TubeLine,
  s: Scales,
  margin: { top: number; left: number },
): LinePath {
  const lw = s.lineW
  const endCorr = lw / (2 * 1.5 * s.unitPx)
  const shiftN = line.shiftNormal ?? 0
  const shiftC = line.shiftCoords

  const pt = (node: ProcessedNode, tangentialShift = 0): [number,number] => {
    const tan = normalize(dirVec(node._dir))
    return toSVG(node.coords[0], node.coords[1], s, margin, shiftC, shiftN, tan, tangentialShift)
  }

  let d = ''
  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i-1]!
    const curr = nodes[i]!
    const prevTan = normalize(dirVec(prev._dir))
    const currTan = normalize(dirVec(curr._dir))

    if (i === 1) {
      const start = pt(prev, -endCorr)
      d += `M${start[0]},${start[1]}`
    }

    const prevPt = toSVG(prev.coords[0], prev.coords[1], s, margin, shiftC, shiftN, prevTan, 0)
    const isLast = i === nodes.length - 1
    const nextPt = toSVG(curr.coords[0], curr.coords[1], s, margin, shiftC, shiftN, currTan, isLast ? endCorr : 0)

    if (curr._dir !== prev._dir) {
      const pv = prevTan
      const nv = currTan
      const cp: [number,number] = [0, 0]
      for (const ax of [0, 1] as (0|1)[]) {
        const denom = pv[ax] + nv[ax]
        if (Math.abs(denom) > 1e-9) {
          cp[ax] = (prevPt[ax] * nv[ax] + nextPt[ax] * pv[ax]) / denom
        } else {
          cp[ax] = (prevPt[ax] + nextPt[ax]) / 2
        }
      }
      d += ` Q${cp[0]},${cp[1]},${nextPt[0]},${nextPt[1]}`
    } else {
      d += ` L${nextPt[0]},${nextPt[1]}`
    }
  }

  return { d, color: line.color, width: lw }
}

// ── Interfaces for renderable primitives ─────────────────────────────────────

interface InterchangeCircle {
  cx: number; cy: number; r: number
  name: string
}

interface StationTick {
  x1: number; y1: number; x2: number; y2: number
  color: string
  name: string
}

interface StationLabel {
  name: string
  lines: string[]
  x: number; y: number
  anchor: 'start' | 'middle' | 'end'
  baseline: 'auto' | 'hanging' | 'middle'
  closed: boolean
  fontSize: number
}

// ── D3 render function ────────────────────────────────────────────────────────

function render() {
  const container = containerRef.value
  if (!container) return

  d3.select(container).selectAll('*').remove()

  try {
    const { data, width, height, margin } = props
    const m = margin

    // Step 1 — populate directions on each line
    const processedLines = data.lines.map(line => ({
      line,
      nodes: populateDirections(line.nodes),
    }))

    // Step 2 — compute scale from bounding box of all coords
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    for (const { nodes } of processedLines) {
      for (const n of nodes) {
        minX = Math.min(minX, n.coords[0])
        maxX = Math.max(maxX, n.coords[0])
        minY = Math.min(minY, n.coords[1])
        maxY = Math.max(maxY, n.coords[1])
      }
    }
    minX -= 1; maxX += 1; minY -= 1; maxY += 1

    const innerW = width  - m.left - m.right
    const innerH = height - m.top  - m.bottom
    const desired = (maxX - minX) / (maxY - minY)
    const actual  = innerW / innerH
    const unitPx  = desired > actual
      ? innerW  / (maxX - minX)
      : innerH  / (maxY - minY)

    const LWM = 0.8
    const lineW = LWM * unitPx

    // Store flipped minY as maxY so the top of the map is maxY (highest grid y)
    const s: Scales = { minX, minY: maxY, unitPx, lineW }

    // Step 3 — line paths
    const linePaths: LinePath[] = processedLines.map(({ line, nodes }) =>
      buildLinePath(nodes, line, s, m)
    )

    // Step 4 — collect station data from all lines
    type MarkerEntry = {
      line: string; color: string; labelPos: string; dir: string
      shiftX: number; shiftY: number; shiftNormal: number; marker: string
    }
    const stationMap = new Map<string, {
      x: number; y: number; markers: MarkerEntry[]
      labelPos: string; dir: string
      shiftX: number; shiftY: number; shiftNormal: number
    }>()

    for (const { line, nodes } of processedLines) {
      for (const node of nodes) {
        if (!node.name) continue
        const stDef = data.stations[node.name]
        if (!stDef) continue
        if (node.hide) continue

        const existing = stationMap.get(node.name)
        const shiftX = node.shiftCoords ? node.shiftCoords[0] : line.shiftCoords[0]
        const shiftY = node.shiftCoords ? node.shiftCoords[1] : line.shiftCoords[1]
        const shiftNormal = line.shiftNormal ?? 0

        const marker: MarkerEntry = {
          line: line.name,
          color: line.color,
          labelPos: node.labelPos ?? 'E',
          dir: node._dir,
          shiftX, shiftY, shiftNormal,
          marker: node.marker ?? 'station',
        }

        if (!existing || node.canonical) {
          stationMap.set(node.name, {
            x: node.coords[0],
            y: node.coords[1],
            markers: existing ? [...existing.markers, marker] : [marker],
            labelPos: node.labelPos ?? 'E',
            dir: node._dir,
            shiftX, shiftY, shiftNormal,
          })
        } else {
          existing.markers.push(marker)
        }
      }
    }

    // Step 5 — collect interchanges, ticks, labels
    const interchanges: InterchangeCircle[] = []
    const ticks: StationTick[] = []
    const labels: StationLabel[] = []
    const sqrt2 = Math.sqrt(2)
    const offset = lineW * 1.8

    for (const [name, st] of stationMap.entries()) {
      const stDef = data.stations[name]!
      const isInterchange = st.markers.some(mk => mk.marker === 'interchange')
      const tan = normalize(dirVec(st.dir))
      const shiftScale = lineW / unitPx

      const svgX = m.left + (st.x + (st.shiftX + st.shiftNormal * tan[1]) * shiftScale - s.minX) * unitPx
      const svgY = m.top  + (s.minY - st.y - (st.shiftY - st.shiftNormal * tan[0]) * shiftScale) * unitPx

      if (isInterchange) {
        interchanges.push({ cx: svgX, cy: svgY, r: 1.25 * lineW, name })
      } else {
        const LWR = 1.5
        const labelVec = normalize(dirVec(st.labelPos))
        const color = st.markers[0]?.color ?? '#000'

        ticks.push({
          x1: svgX + labelVec[0] * lineW * 0.5,
          y1: svgY - labelVec[1] * lineW * 0.5,
          x2: svgX + labelVec[0] * lineW * (0.5 + 1.0 / LWR),
          y2: svgY - labelVec[1] * lineW * (0.5 + 1.0 / LWR),
          color, name,
        })
      }

      // Label positioning
      const lp = (st.labelPos ?? 'E').toLowerCase()
      const numLines = stDef.label.split('\n').length

      let dx = 0, dy = 0
      let anchor: 'start' | 'middle' | 'end' = 'middle'
      let baseline: 'auto' | 'hanging' | 'middle' = 'auto'

      switch (lp) {
        case 'n':  dx=0;                          dy=-(2.1*lineW*(numLines-1)+offset); anchor='middle'; baseline='auto';    break
        case 'ne': dx=offset/sqrt2;               dy=-(lineW*(numLines-1)+offset)/sqrt2; anchor='start'; baseline='auto'; break
        case 'e':  dx=offset;                     dy=0;              anchor='start';  baseline='middle'; break
        case 'se': dx=offset/sqrt2;               dy=offset/sqrt2;   anchor='start';  baseline='hanging'; break
        case 's':  dx=0;                          dy=LWM*offset;     anchor='middle'; baseline='hanging'; break
        case 'sw': dx=-offset/sqrt2;              dy=offset/sqrt2;   anchor='end';    baseline='hanging'; break
        case 'w':  dx=-offset;                    dy=0;              anchor='end';    baseline='middle';  break
        case 'nw': dx=-(lineW+offset)/sqrt2;      dy=-(lineW+offset)/sqrt2-lineW*(numLines-1); anchor='end'; baseline='auto'; break
      }

      labels.push({
        name,
        lines: stDef.label.split('\n'),
        x: svgX + dx,
        y: svgY + dy,
        anchor,
        baseline,
        closed: stDef.closed ?? false,
        fontSize: lineW * 1.96,
      })
    }

    // Step 6 — build SVG with d3
    const svg = d3.select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', width)
      .attr('height', height)
      .style('width', '100%')
      .style('height', '100%')

    // Lines
    const gLines = svg.append('g').attr('class', 'tm-lines')
    linePaths.forEach(lp => {
      gLines.append('path')
        .attr('d', lp.d)
        .attr('stroke', lp.color)
        .attr('stroke-width', lp.width)
        .attr('fill', 'none')
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
    })

    // Interchange circles
    const gInterchanges = svg.append('g').attr('class', 'tm-interchanges')
    interchanges.forEach(ic => {
      gInterchanges.append('circle')
        .attr('cx', ic.cx)
        .attr('cy', ic.cy)
        .attr('r', ic.r)
        .attr('fill', '#fff')
        .attr('stroke', '#000')
        .attr('stroke-width', lineW / 2)
        .attr('class', 'tm-interchange')
        .style('cursor', 'pointer')
        .style('user-select', 'none')
        .on('click', () => emit('stationClick', ic.name))
    })

    // Station tick marks
    const gStations = svg.append('g').attr('class', 'tm-stations')
    ticks.forEach(tk => {
      gStations.append('line')
        .attr('x1', tk.x1)
        .attr('y1', tk.y1)
        .attr('x2', tk.x2)
        .attr('y2', tk.y2)
        .attr('stroke', tk.color)
        .attr('stroke-width', lineW / 1.5)
        .attr('stroke-linecap', 'round')
        .attr('class', 'tm-station')
        .style('cursor', 'pointer')
        .style('user-select', 'none')
        .on('click', () => emit('stationClick', tk.name))
    })

    // Labels
    const gLabels = svg.append('g').attr('class', 'tm-labels')
    labels.forEach(lb => {
      const textEl = gLabels.append('text')
        .attr('x', lb.x)
        .attr('y', lb.y)
        .attr('text-anchor', lb.anchor)
        .attr('dominant-baseline', lb.baseline)
        .attr('font-size', lb.fontSize)
        .attr('text-decoration', lb.closed ? 'line-through' : 'none')
        .attr('fill', '#10137E')
        .attr('font-family', "'Hammersmith One', 'Segoe UI', sans-serif")
        .attr('class', 'tm-label')
        .style('cursor', 'pointer')
        .style('user-select', 'none')
        .on('click', () => emit('stationClick', lb.name))

      lb.lines.forEach((lineText, li) => {
        textEl.append('tspan')
          .attr('x', lb.x)
          .attr('dy', li === 0 ? 0 : '1.1em')
          .attr('dominant-baseline', lb.baseline)
          .text(lineText)
      })
    })

  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    d3.select(container)
      .append('div')
      .attr('class', 'tube-map-error')
      .html(`<strong>Map error:</strong> ${msg}`)
  }
}

onMounted(() => render())

watch(
  () => props.data,
  () => render(),
  { deep: true },
)

watch(
  [() => props.width, () => props.height, () => props.margin],
  () => render(),
)
</script>

<template>
  <div ref="containerRef" class="tube-map-wrap" />
</template>

<style scoped>
.tube-map-wrap {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
:deep(.tube-map-error) {
  padding: 16px;
  color: #b00020;
  font-size: 13px;
  font-family: monospace;
}
</style>
