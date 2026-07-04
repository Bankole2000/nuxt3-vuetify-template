<script setup lang="ts">
useSeo({ title: 'Tube Map Editor', description: 'Interactive grid editor for building tube-style transit maps.' })
definePageMeta({ layout: 'catalogue' })

const COLS = 50
const ROWS = 50

const {
  lines, stations, activeLineId, activeLine, activeLineValidation,
  addLine, removeLine,
  addStation, removeStation,
  appendNode, removeLastNode, removeNodeAt, setNodeStation,
  validations, isValid,
  toTubeMapData,
} = useTubeMapEditor()

// ── Grid helpers ──────────────────────────────────────────────────────────────

// Row 0 in DOM = y=49 (y-up convention matches TubeMap)
function displayY(row: number) { return ROWS - 1 - row }

// Map each grid cell to the line colours passing through it
const cellLineColors = computed(() => {
  const map = new Map<string, string[]>()
  for (const line of lines.value) {
    for (const node of line.nodes) {
      const k = `${node.x},${node.y}`
      if (!map.has(k)) map.set(k, [])
      map.get(k)!.push(line.color)
    }
  }
  return map
})

function cellColors(x: number, y: number): string[] {
  return cellLineColors.value.get(`${x},${y}`) ?? []
}

function cellHasStation(x: number, y: number): boolean {
  for (const line of lines.value) {
    if (line.nodes.some(n => n.x === x && n.y === y && n.stationId)) return true
  }
  return false
}

// ── Drag-to-append support ───────────────────────────────────────────────────

const isPainting = ref(false)
const lastPainted = ref<string | null>(null)

function onCellMouseDown(x: number, y: number) {
  if (!activeLineId.value) return
  isPainting.value = true
  lastPainted.value = `${x},${y}`
  appendNode(activeLineId.value, x, y)
}

function onCellMouseEnter(x: number, y: number) {
  if (!isPainting.value || !activeLineId.value) return
  const k = `${x},${y}`
  if (k === lastPainted.value) return  // avoid duplicates on same cell
  lastPainted.value = k
  appendNode(activeLineId.value, x, y)
}

function onMouseUp() { isPainting.value = false }

// ── Add-line dialog ───────────────────────────────────────────────────────────

const LINE_COLORS = [
  '#1e88e5', '#e53935', '#43a047', '#fb8c00', '#8e24aa',
  '#00acc1', '#6d4c41', '#546e7a', '#f06292', '#ffb300',
]

const newLineDialog = ref(false)
const newLineName = ref('')
const newLineColor = ref(LINE_COLORS[0]!)

function openNewLine() {
  newLineName.value = ''
  newLineColor.value = LINE_COLORS[lines.value.length % LINE_COLORS.length]!
  newLineDialog.value = true
}

function confirmNewLine() {
  if (!newLineName.value.trim()) return
  const line = addLine(newLineName.value.trim(), newLineColor.value)
  activeLineId.value = line.id
  newLineDialog.value = false
}

// ── Add-station dialog (triggered by right-clicking a node) ──────────────────

const stationDialog = ref(false)
const stationDialogCoord = ref<{ x: number; y: number; lineId: string; nodeIndex: number } | null>(null)
const stationName = ref('')
const stationLabel = ref('')
const stationLabelPos = ref('E')

const LABEL_POSITIONS = ['N','NE','E','SE','S','SW','W','NW']

function openStationDialog(x: number, y: number, lineId: string, nodeIndex: number) {
  stationDialogCoord.value = { x, y, lineId, nodeIndex }
  // Pre-fill if a station already exists here
  const existing = lines.value
    .find(l => l.id === lineId)
    ?.nodes[nodeIndex]?.stationId
  if (existing && stations.value[existing]) {
    const st = stations.value[existing]!
    stationName.value = existing
    stationLabel.value = st.label
    stationLabelPos.value = st.labelPos
  } else {
    stationName.value = ''
    stationLabel.value = ''
    stationLabelPos.value = 'E'
  }
  stationDialog.value = true
}

function confirmStation() {
  if (!stationDialogCoord.value || !stationLabel.value.trim()) return
  const { lineId, nodeIndex } = stationDialogCoord.value
  const id = stationName.value.trim() || `station_${Date.now()}`
  addStation(id, stationLabel.value.trim(), stationLabelPos.value)
  setNodeStation(lineId, nodeIndex, id)
  stationDialog.value = false
}

function clearNodeStation(lineId: string, nodeIndex: number, stationId: string | null) {
  setNodeStation(lineId, nodeIndex, null)
  if (stationId && !lines.value.some(l => l.nodes.some(n => n.stationId === stationId))) {
    removeStation(stationId)
  }
}

// ── Preview panel ─────────────────────────────────────────────────────────────

const showPreview = ref(false)
const previewData = computed(() => toTubeMapData())

// ── Export ────────────────────────────────────────────────────────────────────

const exportDialog = ref(false)
const exportJson = ref('')

function openExport() {
  exportJson.value = JSON.stringify(previewData.value, null, 2)
  exportDialog.value = true
}

async function copyExport() {
  await navigator.clipboard.writeText(exportJson.value)
}
</script>

<template>
  <v-container fluid class="pa-4">

    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-4 flex-wrap gap-2">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Tube Map Editor</h1>
        <p class="text-body-2 text-medium-emphasis">
          Select a line, then click or drag cells to place nodes. Right-click a node to name it as a station.
        </p>
      </div>
      <div class="d-flex gap-2 flex-wrap">
        <v-btn
          size="small" variant="tonal"
          :color="showPreview ? 'primary' : 'default'"
          prepend-icon="mdi-eye-outline"
          @click="showPreview = !showPreview"
        >Preview</v-btn>
        <v-btn
          size="small" variant="tonal" color="secondary"
          prepend-icon="mdi-export-variant"
          :disabled="lines.length === 0"
          @click="openExport"
        >Export JSON</v-btn>
      </div>
    </div>

    <v-row>
      <!-- ── Left: grid ─────────────────────────────────────────────────────── -->
      <v-col cols="12" xl="8" lg="7">
        <v-card rounded="lg" elevation="1" class="overflow-auto">
          <!-- Column axis -->
          <div class="grid-axis-row">
            <div class="grid-corner" />
            <div v-for="x in COLS" :key="x" class="grid-axis-cell">{{ x - 1 }}</div>
          </div>

          <!-- Rows -->
          <div class="grid-wrapper" @mouseleave="onMouseUp" @mouseup="onMouseUp">
            <div v-for="row in ROWS" :key="row" class="grid-row">
              <div class="grid-axis-cell grid-axis-y">{{ displayY(row - 1) }}</div>
              <div
                v-for="col in COLS"
                :key="col"
                class="grid-cell"
                :class="{
                  'grid-cell--active': cellColors(col - 1, displayY(row - 1)).length > 0,
                  'grid-cell--station': cellHasStation(col - 1, displayY(row - 1)),
                  'grid-cell--paintable': !!activeLineId,
                }"
                :style="cellColors(col - 1, displayY(row - 1)).length === 1
                  ? { backgroundColor: cellColors(col - 1, displayY(row - 1))[0] + 'cc' }
                  : {}"
                @mousedown.prevent="onCellMouseDown(col - 1, displayY(row - 1))"
                @mouseenter="onCellMouseEnter(col - 1, displayY(row - 1))"
              />
            </div>
          </div>
        </v-card>

        <!-- Active line validation error -->
        <v-alert
          v-if="activeLineValidation?.error"
          type="warning" variant="tonal" density="compact"
          class="mt-2" rounded="lg"
          :text="activeLineValidation.error"
        />
      </v-col>

      <!-- ── Right: sidebar ─────────────────────────────────────────────────── -->
      <v-col cols="12" xl="4" lg="5">
        <div style="position: sticky; top: 72px; display: flex; flex-direction: column; gap: 12px;">

          <!-- Lines panel -->
          <v-card rounded="lg" elevation="1">
            <v-card-title class="text-body-1 font-weight-bold pa-4 pb-2">
              <v-icon start size="18">mdi-transit-connection-variant</v-icon>
              Lines
            </v-card-title>

            <v-list density="compact" class="pa-2 pt-0">
              <v-list-item
                v-for="line in lines"
                :key="line.id"
                :active="activeLineId === line.id"
                active-color="primary"
                rounded="lg"
                @click="activeLineId = activeLineId === line.id ? null : line.id"
              >
                <template #prepend>
                  <v-sheet
                    :color="line.color"
                    width="14" height="14"
                    rounded="circle"
                    class="mr-3 flex-shrink-0"
                  />
                </template>
                <v-list-item-title class="text-body-2">{{ line.name }}</v-list-item-title>
                <v-list-item-subtitle class="text-caption">
                  {{ line.nodes.length }} node{{ line.nodes.length !== 1 ? 's' : '' }}
                  <v-icon
                    v-if="validations.find(v => v.lineId === line.id)?.error"
                    color="warning" size="14" class="ml-1"
                  >mdi-alert-circle-outline</v-icon>
                </v-list-item-subtitle>
                <template #append>
                  <v-btn
                    icon="mdi-undo" size="x-small" variant="text"
                    title="Remove last node"
                    @click.stop="removeLastNode(line.id)"
                  />
                  <v-btn
                    icon="mdi-delete-outline" size="x-small" variant="text" color="error"
                    @click.stop="removeLine(line.id)"
                  />
                </template>
              </v-list-item>

              <div v-if="!lines.length" class="text-caption text-medium-emphasis pa-2">
                No lines yet. Add one to start drawing.
              </div>
            </v-list>

            <v-card-actions class="pa-3 pt-0">
              <v-btn
                block variant="tonal" color="primary" size="small"
                prepend-icon="mdi-plus"
                @click="openNewLine"
              >Add Line</v-btn>
            </v-card-actions>
          </v-card>

          <!-- Active line nodes -->
          <v-card v-if="activeLine" rounded="lg" elevation="1">
            <v-card-title class="text-body-1 font-weight-bold pa-4 pb-2">
              <v-sheet :color="activeLine.color" width="12" height="12" rounded="circle" class="mr-2 d-inline-block" />
              {{ activeLine.name }} — Nodes
            </v-card-title>

            <div class="node-list pa-2 pt-0">
              <div
                v-for="(node, i) in activeLine.nodes"
                :key="i"
                class="node-row d-flex align-center gap-2 pa-1 rounded"
              >
                <span class="text-caption text-medium-emphasis" style="min-width:18px">{{ i }}</span>
                <v-chip size="x-small" variant="tonal" color="primary" class="font-weight-medium">
                  {{ node.x }}, {{ node.y }}
                </v-chip>
                <v-chip
                  v-if="node.stationId && stations[node.stationId]"
                  size="x-small" variant="tonal" color="secondary"
                  closable
                  @click:close="clearNodeStation(activeLine.id, i, node.stationId)"
                >{{ stations[node.stationId]!.label.replace('\n', ' ') }}</v-chip>
                <v-btn
                  v-else
                  icon="mdi-map-marker-plus-outline"
                  size="x-small" variant="text" color="secondary"
                  title="Name as station"
                  @click="openStationDialog(node.x, node.y, activeLine.id, i)"
                />
                <v-spacer />
                <v-btn
                  icon="mdi-close" size="x-small" variant="text"
                  @click="removeNodeAt(activeLine.id, i)"
                />
              </div>
              <div v-if="!activeLine.nodes.length" class="text-caption text-medium-emphasis pa-2">
                Click cells on the grid to add nodes to this line.
              </div>
            </div>
          </v-card>

          <!-- Stations summary -->
          <v-card v-if="Object.keys(stations).length" rounded="lg" elevation="0" variant="tonal">
            <v-card-title class="text-body-2 font-weight-bold pa-3 pb-1">
              <v-icon start size="16">mdi-map-marker-outline</v-icon>
              Stations ({{ Object.keys(stations).length }})
            </v-card-title>
            <div class="pa-3 pt-1 d-flex flex-wrap gap-1">
              <v-chip
                v-for="(st, id) in stations"
                :key="id"
                size="x-small"
                variant="tonal"
                color="secondary"
              >{{ st.label.replace('\n', ' ') }}</v-chip>
            </div>
          </v-card>

        </div>
      </v-col>
    </v-row>

    <!-- ── Preview sheet ──────────────────────────────────────────────────── -->
    <v-expand-transition>
      <div v-if="showPreview" class="mt-4">
        <v-card rounded="lg" elevation="1" color="grey-lighten-5">
          <v-card-title class="text-body-2 font-weight-bold pa-3 pb-0">
            Live Preview
            <v-chip
              v-if="!isValid"
              size="x-small" color="warning" variant="tonal" class="ml-2"
            >Has errors — preview may be incomplete</v-chip>
          </v-card-title>
          <CommonTubeMap
            v-if="lines.length"
            :data="previewData"
            :width="900"
            :height="400"
            :margin="{ top: 60, right: 140, bottom: 60, left: 140 }"
          />
          <div v-else class="pa-6 text-caption text-medium-emphasis text-center">
            Add at least one line with 2+ nodes to see the preview.
          </div>
        </v-card>
      </div>
    </v-expand-transition>

    <!-- ── Add-line dialog ────────────────────────────────────────────────── -->
    <v-dialog v-model="newLineDialog" max-width="400">
      <v-card rounded="lg">
        <v-card-title class="pa-4 pb-2">New Line</v-card-title>
        <v-card-text class="pa-4 pt-2">
          <v-text-field
            v-model="newLineName"
            label="Line name"
            variant="outlined"
            density="compact"
            autofocus
            @keydown.enter="confirmNewLine"
          />
          <p class="text-caption text-medium-emphasis mb-2">Colour</p>
          <div class="d-flex flex-wrap gap-2">
            <v-sheet
              v-for="c in LINE_COLORS"
              :key="c"
              :color="c"
              width="28" height="28"
              rounded="circle"
              class="color-swatch"
              :class="{ 'color-swatch--selected': newLineColor === c }"
              @click="newLineColor = c"
            />
          </div>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0 gap-2">
          <v-spacer />
          <v-btn variant="text" @click="newLineDialog = false">Cancel</v-btn>
          <v-btn
            variant="flat" color="primary"
            :disabled="!newLineName.trim()"
            @click="confirmNewLine"
          >Create</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── Station dialog ─────────────────────────────────────────────────── -->
    <v-dialog v-model="stationDialog" max-width="380">
      <v-card rounded="lg">
        <v-card-title class="pa-4 pb-2">Name Station</v-card-title>
        <v-card-text class="pa-4 pt-2 d-flex flex-column gap-3">
          <v-text-field
            v-model="stationLabel"
            label="Display label"
            variant="outlined"
            density="compact"
            hint="Use \n for a line break"
            autofocus
            @keydown.enter="confirmStation"
          />
          <v-select
            v-model="stationLabelPos"
            label="Label position"
            :items="LABEL_POSITIONS"
            variant="outlined"
            density="compact"
          />
        </v-card-text>
        <v-card-actions class="pa-4 pt-0 gap-2">
          <v-spacer />
          <v-btn variant="text" @click="stationDialog = false">Cancel</v-btn>
          <v-btn
            variant="flat" color="secondary"
            :disabled="!stationLabel.trim()"
            @click="confirmStation"
          >Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── Export dialog ──────────────────────────────────────────────────── -->
    <v-dialog v-model="exportDialog" max-width="640">
      <v-card rounded="lg">
        <v-card-title class="pa-4 pb-2">Export TubeMapData JSON</v-card-title>
        <v-card-text class="pa-4 pt-2">
          <v-sheet rounded="lg" color="surface-variant" class="pa-3">
            <pre class="text-caption export-pre">{{ exportJson }}</pre>
          </v-sheet>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0 gap-2">
          <v-spacer />
          <v-btn variant="text" @click="exportDialog = false">Close</v-btn>
          <v-btn variant="flat" color="primary" prepend-icon="mdi-content-copy" @click="copyExport">
            Copy
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<style scoped>
/* ── Grid ── */
.grid-axis-row {
  display: flex;
  position: sticky;
  top: 0;
  z-index: 2;
  background: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.grid-corner { width: 28px; flex-shrink: 0; }
.grid-axis-cell {
  width: 18px;
  flex-shrink: 0;
  font-size: 8px;
  text-align: center;
  color: rgba(var(--v-theme-on-surface), 0.4);
  line-height: 18px;
  user-select: none;
}
.grid-axis-y {
  width: 28px;
  font-size: 8px;
  text-align: right;
  padding-right: 3px;
  color: rgba(var(--v-theme-on-surface), 0.4);
  user-select: none;
}
.grid-wrapper { display: flex; flex-direction: column; }
.grid-row { display: flex; }
.grid-cell {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  border-right: 1px solid rgba(var(--v-border-color), 0.3);
  border-bottom: 1px solid rgba(var(--v-border-color), 0.3);
  transition: background-color 0.06s;
}
.grid-cell--paintable { cursor: crosshair; }
.grid-cell--paintable:hover { background-color: rgba(var(--v-theme-primary), 0.15); }
.grid-cell--active { /* colour set inline per line */ }
.grid-cell--station { outline: 2px solid white; outline-offset: -3px; }

/* ── Node list ── */
.node-list { max-height: 260px; overflow-y: auto; }
.node-row:hover { background: rgba(var(--v-theme-on-surface), 0.04); }

/* ── Color swatches ── */
.color-swatch { cursor: pointer; transition: transform 0.1s; }
.color-swatch:hover { transform: scale(1.15); }
.color-swatch--selected { outline: 3px solid white; outline-offset: 2px; box-shadow: 0 0 0 4px rgba(0,0,0,0.3); }

/* ── Export ── */
.export-pre { white-space: pre-wrap; word-break: break-all; max-height: 340px; overflow-y: auto; }
</style>
