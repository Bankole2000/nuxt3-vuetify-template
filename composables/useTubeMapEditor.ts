import type { TubeMapData, TubeLine, TubeNode, TubeStation } from '~/components/common/TubeMap.vue'

// ── Public types ──────────────────────────────────────────────────────────────

export interface EditorStation {
  id: string
  label: string
  labelPos: string
  isInterchange: boolean
  closed: boolean
}

export interface EditorNode {
  // grid coords
  x: number
  y: number
  // if this node anchors a named station
  stationId: string | null
  // suppress the marker on this line (waypoint only)
  hide: boolean
  canonical: boolean
}

export interface EditorLine {
  id: string
  name: string
  color: string
  shiftNormal: number
  nodes: EditorNode[]
}

export interface LineValidation {
  lineId: string
  error: string | null
}

// ── Direction helpers (same as TubeMap.vue — duplicated here so the composable
//    is self-contained and has no import dependency on the component) ──────────

const DIR: Record<string, [number, number]> = {
  N:  [ 0,  1], NE: [ 1,  1], E:  [ 1,  0], SE: [ 1, -1],
  S:  [ 0, -1], SW: [-1, -1], W:  [-1,  0], NW: [-1,  1],
}

function cross2d(a: [number, number], b: [number, number]) {
  return a[0] * b[1] - a[1] * b[0]
}
function areParallel(a: [number, number], b: [number, number]) {
  return (
    cross2d(a, b) === 0 &&
    Math.sign(a[0]) === Math.sign(b[0]) &&
    Math.sign(a[1]) === Math.sign(b[1])
  )
}
function compassBearing(v: [number, number]): string | null {
  const entry = Object.entries(DIR).find(([, vec]) =>
    areParallel(vec as [number, number], v),
  )
  return entry ? entry[0] : null
}

function validateLineNodes(nodes: EditorNode[]): string | null {
  if (nodes.length < 2) return null
  let prevDir: string | null = null

  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i - 1]!
    const curr = nodes[i]!
    const dx = curr.x - prev.x
    const dy = curr.y - prev.y

    if (dx === 0 && dy === 0) return `Repeated coordinate at node ${i}`

    const bearing = compassBearing([dx, dy])
    if (!bearing) return `Step from (${prev.x},${prev.y}) to (${curr.x},${curr.y}) is not a valid compass direction`

    if (i === 1) {
      prevDir = bearing
      continue
    }

    const prevVec = DIR[prevDir!]!
    const diff: [number, number] = [dx, dy]

    if (!areParallel(prevVec, diff)) {
      const cornerOk =
        (Math.abs(dx) === 1 && Math.abs(dy) === 1) ||
        (Math.abs(dx) === 1 && Math.abs(dy) === 2) ||
        (Math.abs(dx) === 2 && Math.abs(dy) === 1)
      if (!cornerOk) {
        return `Invalid corner between (${prev.x},${prev.y}) and (${curr.x},${curr.y}) — incoming direction ${prevDir}, step [${dx},${dy}]. Corner step must equal dirVec(A)+dirVec(B).`
      }
      const nextVec: [number, number] = [dx - prevVec[0], dy - prevVec[1]]
      prevDir = compassBearing(nextVec)
      if (!prevDir) return `Cannot resolve exit direction after corner at (${curr.x},${curr.y})`
    } else {
      prevDir = bearing
    }
  }
  return null
}

// ── Composable ────────────────────────────────────────────────────────────────

export function useTubeMapEditor() {
  const lines = ref<EditorLine[]>([])
  const stations = ref<Record<string, EditorStation>>({})
  const activeLineId = ref<string | null>(null)

  // ── Stations ────────────────────────────────────────────────────────────────

  function addStation(id: string, label: string, labelPos = 'E'): EditorStation {
    const st: EditorStation = {
      id,
      label,
      labelPos,
      isInterchange: false,
      closed: false,
    }
    stations.value[id] = st
    return st
  }

  function updateStation(id: string, patch: Partial<Omit<EditorStation, 'id'>>) {
    const st = stations.value[id]
    if (st) Object.assign(st, patch)
  }

  function removeStation(id: string) {
    delete stations.value[id]
    // Detach from any nodes that reference it
    for (const line of lines.value) {
      for (const node of line.nodes) {
        if (node.stationId === id) node.stationId = null
      }
    }
  }

  // ── Lines ───────────────────────────────────────────────────────────────────

  function addLine(name: string, color: string): EditorLine {
    const line: EditorLine = {
      id: crypto.randomUUID(),
      name,
      color,
      shiftNormal: 0,
      nodes: [],
    }
    lines.value.push(line)
    return line
  }

  function updateLine(id: string, patch: Partial<Omit<EditorLine, 'id' | 'nodes'>>) {
    const line = lines.value.find(l => l.id === id)
    if (line) Object.assign(line, patch)
  }

  function removeLine(id: string) {
    const idx = lines.value.findIndex(l => l.id === id)
    if (idx !== -1) lines.value.splice(idx, 1)
    if (activeLineId.value === id) activeLineId.value = null
  }

  // ── Nodes ───────────────────────────────────────────────────────────────────

  function appendNode(lineId: string, x: number, y: number, stationId: string | null = null) {
    const line = lines.value.find(l => l.id === lineId)
    if (!line) return
    line.nodes.push({ x, y, stationId, hide: false, canonical: false })
  }

  function removeLastNode(lineId: string) {
    const line = lines.value.find(l => l.id === lineId)
    if (line && line.nodes.length > 0) line.nodes.pop()
  }

  function removeNodeAt(lineId: string, index: number) {
    const line = lines.value.find(l => l.id === lineId)
    if (line) line.nodes.splice(index, 1)
  }

  function setNodeStation(lineId: string, index: number, stationId: string | null) {
    const line = lines.value.find(l => l.id === lineId)
    const node = line?.nodes[index]
    if (node) node.stationId = stationId
  }

  // ── Validation ──────────────────────────────────────────────────────────────

  const validations = computed<LineValidation[]>(() =>
    lines.value.map(line => ({
      lineId: line.id,
      error: validateLineNodes(line.nodes),
    })),
  )

  const isValid = computed(() => validations.value.every(v => v.error === null))

  // ── Output ──────────────────────────────────────────────────────────────────

  function toTubeMapData(): TubeMapData {
    // Build station record — only include stations referenced by at least one node
    const usedStationIds = new Set<string>()
    for (const line of lines.value) {
      for (const node of line.nodes) {
        if (node.stationId) usedStationIds.add(node.stationId)
      }
    }

    const stationRecord: Record<string, TubeStation> = {}
    for (const id of usedStationIds) {
      const st = stations.value[id]
      if (st) stationRecord[id] = { label: st.label, closed: st.closed || undefined }
    }

    // Count how many lines pass through each station to auto-detect interchanges
    const stationLineCount: Record<string, Set<string>> = {}
    for (const line of lines.value) {
      for (const node of line.nodes) {
        if (!node.stationId) continue
        if (!stationLineCount[node.stationId]) stationLineCount[node.stationId] = new Set()
        stationLineCount[node.stationId]!.add(line.id)
      }
    }

    const tubeLines: TubeLine[] = lines.value.map(line => {
      const nodes: TubeNode[] = line.nodes.map(node => {
        const tubeNode: TubeNode = { coords: [node.x, node.y] }
        if (node.stationId) {
          const st = stations.value[node.stationId]
          tubeNode.name = node.stationId
          tubeNode.labelPos = st?.labelPos ?? 'E'
          // Auto-interchange: station on 2+ lines, or explicitly marked
          const lineCount = stationLineCount[node.stationId]?.size ?? 0
          const isInterchange = (st?.isInterchange ?? false) || lineCount > 1
          if (isInterchange) tubeNode.marker = 'interchange'
        }
        if (node.hide) tubeNode.hide = true
        if (node.canonical) tubeNode.canonical = true
        return tubeNode
      })

      return {
        name: line.name,
        color: line.color,
        shiftCoords: [0, 0],
        shiftNormal: line.shiftNormal || undefined,
        nodes,
      }
    })

    return { stations: stationRecord, lines: tubeLines }
  }

  // ── Serialise / restore ─────────────────────────────────────────────────────

  function toJSON(): string {
    return JSON.stringify({ lines: lines.value, stations: stations.value }, null, 2)
  }

  function fromJSON(json: string) {
    const parsed = JSON.parse(json)
    lines.value = parsed.lines ?? []
    stations.value = parsed.stations ?? {}
    activeLineId.value = null
  }

  // ── Convenience: get the active line ────────────────────────────────────────

  const activeLine = computed(() =>
    lines.value.find(l => l.id === activeLineId.value) ?? null,
  )

  const activeLineValidation = computed(() =>
    validations.value.find(v => v.lineId === activeLineId.value) ?? null,
  )

  return {
    // State
    lines,
    stations,
    activeLineId,
    activeLine,
    // Station ops
    addStation,
    updateStation,
    removeStation,
    // Line ops
    addLine,
    updateLine,
    removeLine,
    // Node ops
    appendNode,
    removeLastNode,
    removeNodeAt,
    setNodeStation,
    // Validation
    validations,
    isValid,
    activeLineValidation,
    // Output
    toTubeMapData,
    toJSON,
    fromJSON,
  }
}
