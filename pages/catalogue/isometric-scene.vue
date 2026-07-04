<script setup lang="ts">
import type { IsoBlock, IsoScene } from '~/components/common/IsometricScene.vue'

definePageMeta({ layout: 'catalogue' })
useSeo({ title: 'Isometric Scene', description: 'SVG-based isometric scene builder with painter-algorithm rendering, interactive blocks, data visualisation and city builder demos.' })

// ─── Tab state ────────────────────────────────────────────────────────────────
const activeTab = ref<'city' | 'data' | 'builder'>('city')

// ─── Info modal ───────────────────────────────────────────────────────────────
const showInfo = ref(false)

// ────────────────────────────────────────────────────────────────────────────────
// TAB 1 — City Blocks
// ────────────────────────────────────────────────────────────────────────────────

const cityScene = computed((): IsoScene => {
  const blocks: IsoBlock[] = []

  // Layout legend:
  // R = road (flat, grey)
  // P = park (flat, green)
  // numbers = building height
  // Coordinates: x = column (0-7), y = row (0-7)

  const layout: Array<{ x: number; y: number; type: 'road' | 'park' | 'building'; height: number; color: string }> = [
    // Roads (horizontal & vertical arteries)
    ...generateRoad(0, 3, 'x', 8), // horizontal road row 3
    ...generateRoad(0, 6, 'x', 8), // horizontal road row 6
    ...generateRoad(3, 0, 'y', 8), // vertical road col 3
    ...generateRoad(6, 0, 'y', 8), // vertical road col 6

    // Parks
    { x: 0, y: 0, type: 'park', height: 0, color: '#4caf50' },
    { x: 1, y: 0, type: 'park', height: 0, color: '#388e3c' },
    { x: 0, y: 1, type: 'park', height: 0, color: '#388e3c' },
    { x: 1, y: 1, type: 'park', height: 0, color: '#4caf50' },
    { x: 0, y: 2, type: 'park', height: 0, color: '#4caf50' },
    { x: 1, y: 2, type: 'park', height: 0, color: '#2e7d32' },
    { x: 2, y: 0, type: 'park', height: 0, color: '#66bb6a' },
    { x: 2, y: 1, type: 'park', height: 0, color: '#4caf50' },
    { x: 2, y: 2, type: 'park', height: 0, color: '#388e3c' },

    // Block A (top-right of first road intersection) — office towers
    { x: 4, y: 0, type: 'building', height: 3, color: '#90caf9' },
    { x: 5, y: 0, type: 'building', height: 4, color: '#64b5f6' },
    { x: 4, y: 1, type: 'building', height: 2, color: '#90caf9' },
    { x: 5, y: 1, type: 'building', height: 5, color: '#1565c0' },  // landmark
    { x: 4, y: 2, type: 'building', height: 3, color: '#42a5f5' },
    { x: 5, y: 2, type: 'building', height: 2, color: '#64b5f6' },

    // Block B (middle-left) — residential
    { x: 0, y: 4, type: 'building', height: 2, color: '#ffcc80' },
    { x: 1, y: 4, type: 'building', height: 1, color: '#ffb74d' },
    { x: 2, y: 4, type: 'building', height: 2, color: '#ffa726' },
    { x: 0, y: 5, type: 'building', height: 1, color: '#ffcc80' },
    { x: 1, y: 5, type: 'building', height: 2, color: '#ffb74d' },
    { x: 2, y: 5, type: 'building', height: 1, color: '#ffcc80' },

    // Block C (middle-centre) — mixed
    { x: 4, y: 4, type: 'building', height: 3, color: '#ce93d8' },
    { x: 5, y: 4, type: 'building', height: 2, color: '#ba68c8' },
    { x: 4, y: 5, type: 'building', height: 4, color: '#8e24aa' },  // landmark
    { x: 5, y: 5, type: 'building', height: 2, color: '#ce93d8' },

    // Block D (bottom-left)
    { x: 0, y: 7, type: 'building', height: 1, color: '#ef9a9a' },
    { x: 1, y: 7, type: 'building', height: 2, color: '#e57373' },
    { x: 2, y: 7, type: 'building', height: 1, color: '#ef9a9a' },

    // Block E (bottom-centre)
    { x: 4, y: 7, type: 'building', height: 2, color: '#80cbc4' },
    { x: 5, y: 7, type: 'building', height: 3, color: '#26a69a' },

    // Block F (right column)
    { x: 7, y: 0, type: 'building', height: 2, color: '#a5d6a7' },
    { x: 7, y: 1, type: 'building', height: 3, color: '#66bb6a' },
    { x: 7, y: 2, type: 'building', height: 1, color: '#a5d6a7' },
    { x: 7, y: 4, type: 'building', height: 2, color: '#80deea' },
    { x: 7, y: 5, type: 'building', height: 4, color: '#00acc1' },  // landmark
    { x: 7, y: 7, type: 'building', height: 2, color: '#80deea' },
  ]

  for (const cell of layout) {
    if (cell.type === 'road') {
      blocks.push({ x: cell.x, y: cell.y, z: 0, type: 'flat', color: cell.color })
    } else if (cell.type === 'park') {
      blocks.push({ x: cell.x, y: cell.y, z: 0, type: 'flat', color: cell.color })
    } else {
      for (let h = 0; h < cell.height; h++) {
        blocks.push({ x: cell.x, y: cell.y, z: h, type: 'cube', color: cell.color })
      }
    }
  }

  return { blocks, gridWidth: 8, gridDepth: 8, blockSize: 52 }
})

function generateRoad(
  startX: number, startY: number,
  axis: 'x' | 'y',
  count: number,
): Array<{ x: number; y: number; type: 'road'; height: number; color: string }> {
  const result = []
  for (let i = 0; i < count; i++) {
    result.push({
      x: axis === 'x' ? startX + i : startX,
      y: axis === 'y' ? startY + i : startY,
      type: 'road' as const,
      height: 0,
      color: '#78909c',
    })
  }
  return result
}

const hoveredCityBlock = ref<IsoBlock | null>(null)
const clickedCityBlock = ref<IsoBlock | null>(null)

function onCityBlockClick(block: IsoBlock) { clickedCityBlock.value = block }
function onCityBlockHover(block: IsoBlock | null) { hoveredCityBlock.value = block }

// ────────────────────────────────────────────────────────────────────────────────
// TAB 2 — Data Visualisation
// ────────────────────────────────────────────────────────────────────────────────

const dataGrid = 5
const dataValues: number[][] = [
  [8,  3,  6,  9,  4],
  [2,  7,  5,  1,  8],
  [5,  9,  2,  7,  3],
  [1,  4,  8,  5,  6],
  [7,  6,  3,  2,  9],
]

function valueToColor(value: number, min: number, max: number): string {
  const t = (value - min) / (max - min)
  const r = Math.round(33  + t * (244 - 33))
  const g = Math.round(150 - t * (150 - 67))
  const b = Math.round(243 - t * (243 - 54))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

const allValues = dataValues.flat()
const dataMin = Math.min(...allValues)
const dataMax = Math.max(...allValues)

const highlightedDataBlock = ref<IsoBlock | null>(null)
const hoveredDataBlock     = ref<IsoBlock | null>(null)

const dataScene = computed((): IsoScene => {
  const blocks: IsoBlock[] = []
  for (let row = 0; row < dataGrid; row++) {
    for (let col = 0; col < dataGrid; col++) {
      const rowData = dataValues[row]
      const value   = rowData ? (rowData[col] ?? 1) : 1
      const isHighlighted = highlightedDataBlock.value?.x === col && highlightedDataBlock.value?.y === row
      const baseColor = valueToColor(value, dataMin, dataMax)
      const color = isHighlighted ? '#ffffff' : baseColor
      for (let h = 0; h < value; h++) {
        blocks.push({
          x: col,
          y: row,
          z: h,
          type: 'cube',
          color,
          label: h === value - 1 ? String(value) : undefined,
          data: { value, row, col },
        })
      }
    }
  }
  return { blocks, gridWidth: dataGrid, gridDepth: dataGrid, blockSize: 48 }
})

const dataTooltip = computed(() => {
  const b = hoveredDataBlock.value
  if (!b) return null
  const d = b.data as { value: number; row: number; col: number } | undefined
  if (!d) return null
  return { value: d.value, row: d.row + 1, col: d.col + 1 }
})

function onDataBlockClick(block: IsoBlock) {
  const isCurrentlyHighlighted = highlightedDataBlock.value?.x === block.x && highlightedDataBlock.value?.y === block.y
  highlightedDataBlock.value = isCurrentlyHighlighted ? null : block
}

function onDataBlockHover(block: IsoBlock | null) {
  hoveredDataBlock.value = block
}

// ────────────────────────────────────────────────────────────────────────────────
// TAB 3 — Interactive Builder
// ────────────────────────────────────────────────────────────────────────────────

const builderGridSize = 6
const builderBlockSize = 60
const builderColor     = ref('#5c6bc0')
const builderHeight    = ref(2)

interface BuilderCell {
  color:  string
  height: number
}

const builderGrid = ref<Record<string, BuilderCell>>({})

const builderScene = computed((): IsoScene => {
  const blocks: IsoBlock[] = []
  for (const [key, cell] of Object.entries(builderGrid.value)) {
    const [xStr, yStr] = key.split(',')
    const x = Number(xStr)
    const y = Number(yStr)
    for (let h = 0; h < cell.height; h++) {
      blocks.push({ x, y, z: h, type: 'cube', color: cell.color })
    }
  }
  return { blocks, gridWidth: builderGridSize, gridDepth: builderGridSize, blockSize: builderBlockSize }
})

const builderBlockCount = computed(() => Object.keys(builderGrid.value).length)

function onBuilderBlockClick(block: IsoBlock) {
  const key = `${block.x},${block.y}`
  if (builderGrid.value[key]) {
    const { [key]: _, ...rest } = builderGrid.value
    builderGrid.value = rest
  } else {
    builderGrid.value = { ...builderGrid.value, [key]: { color: builderColor.value, height: builderHeight.value } }
  }
}

function clearBuilder() {
  builderGrid.value = {}
}

// We also need to allow clicking on the empty grid — the component doesn't emit
// clicks on empty cells, only on blocks. So we overlay a transparent click grid.
function onBuilderGridCellClick(x: number, y: number) {
  const key = `${x},${y}`
  if (!builderGrid.value[key]) {
    builderGrid.value = { ...builderGrid.value, [key]: { color: builderColor.value, height: builderHeight.value } }
  }
}

const builderCellOverlays = computed(() => {
  const cells = []
  for (let y = 0; y < builderGridSize; y++) {
    for (let x = 0; x < builderGridSize; x++) {
      cells.push({ x, y })
    }
  }
  return cells
})

// Preset colour swatches for the builder
const colorSwatches = [
  '#5c6bc0', '#42a5f5', '#26a69a', '#66bb6a',
  '#ffca28', '#ef5350', '#ab47bc', '#ff7043',
]
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="d-flex align-center justify-space-between mb-2 flex-wrap gap-2">
      <div>
        <h1 class="text-h4 font-weight-bold">Isometric Scene</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">
          SVG painter-algorithm renderer — city builder, data viz and interactive block editor.
        </p>
      </div>
      <v-btn variant="tonal" prepend-icon="mdi-information-outline" @click="showInfo = true">
        Use cases
      </v-btn>
    </div>

    <v-tabs v-model="activeTab" class="mb-6" color="primary">
      <v-tab value="city">
        <v-icon start>mdi-city-variant-outline</v-icon>
        City Blocks
      </v-tab>
      <v-tab value="data">
        <v-icon start>mdi-chart-bar</v-icon>
        Data Visualisation
      </v-tab>
      <v-tab value="builder">
        <v-icon start>mdi-cube-outline</v-icon>
        Interactive Builder
      </v-tab>
    </v-tabs>

    <v-tabs-window v-model="activeTab">
      <!-- ──────────────────────────────────────────────────────────────────── -->
      <!-- TAB 1 — City Blocks -->
      <!-- ──────────────────────────────────────────────────────────────────── -->
      <v-tabs-window-item value="city">
        <v-card rounded="lg" border flat>
          <v-card-title class="text-body-1 font-weight-bold pa-4 pb-2">
            Mini City (8×8)
          </v-card-title>
          <v-card-subtitle class="px-4 pb-3">
            Buildings, roads and parks. Hover or click any block.
          </v-card-subtitle>

          <v-card-text class="pa-0">
            <CommonIsometricScene
              :scene="cityScene"
              height="520px"
              :interactive="true"
              :show-grid="true"
              @block-click="onCityBlockClick"
              @block-hover="onCityBlockHover"
            />
          </v-card-text>

          <v-divider />

          <v-card-text class="d-flex gap-4 flex-wrap">
            <v-chip prepend-icon="mdi-road-variant" color="blue-grey" variant="tonal" size="small">
              Roads
            </v-chip>
            <v-chip prepend-icon="mdi-tree-outline" color="success" variant="tonal" size="small">
              Parks
            </v-chip>
            <v-chip prepend-icon="mdi-office-building-outline" color="primary" variant="tonal" size="small">
              Buildings (h 1–5)
            </v-chip>
            <v-chip prepend-icon="mdi-domain" color="error" variant="tonal" size="small">
              Landmarks (h 5)
            </v-chip>

            <v-spacer />

            <div v-if="clickedCityBlock" class="text-caption text-medium-emphasis">
              Last clicked: ({{ clickedCityBlock.x }}, {{ clickedCityBlock.y }}) z={{ clickedCityBlock.z }} &nbsp;
              <span
                class="d-inline-block rounded"
                :style="{ background: clickedCityBlock.color, width: '12px', height: '12px', verticalAlign: 'middle' }"
              />
            </div>
          </v-card-text>
        </v-card>
      </v-tabs-window-item>

      <!-- ──────────────────────────────────────────────────────────────────── -->
      <!-- TAB 2 — Data Visualisation -->
      <!-- ──────────────────────────────────────────────────────────────────── -->
      <v-tabs-window-item value="data">
        <v-row>
          <v-col cols="12" md="8">
            <v-card rounded="lg" border flat height="100%">
              <v-card-title class="text-body-1 font-weight-bold pa-4 pb-2">
                Isometric Bar Chart (5×5)
              </v-card-title>
              <v-card-subtitle class="px-4 pb-3">
                Height = value (1–9). Hover to inspect, click to highlight.
              </v-card-subtitle>

              <v-card-text class="pa-0 position-relative">
                <CommonIsometricScene
                  :scene="dataScene"
                  height="420px"
                  :interactive="true"
                  :show-grid="true"
                  @block-click="onDataBlockClick"
                  @block-hover="onDataBlockHover"
                />

                <!-- Tooltip -->
                <v-fade-transition>
                  <v-card
                    v-if="dataTooltip"
                    class="position-absolute pa-2"
                    style="top: 12px; right: 12px; min-width: 120px; pointer-events: none;"
                    elevation="4"
                    rounded="lg"
                  >
                    <p class="text-caption text-medium-emphasis mb-1">Cell ({{ dataTooltip.col }}, {{ dataTooltip.row }})</p>
                    <p class="text-h6 font-weight-bold">{{ dataTooltip.value }}</p>
                  </v-card>
                </v-fade-transition>
              </v-card-text>

              <v-divider />
              <v-card-text class="text-caption text-medium-emphasis">
                Click a bar to highlight its column. Click again to deselect.
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <v-card rounded="lg" border flat height="100%">
              <v-card-title class="text-body-1 font-weight-bold pa-4 pb-2">
                Legend
              </v-card-title>
              <v-card-text>
                <!-- Gradient bar -->
                <div
                  class="rounded mb-2"
                  style="height: 16px; background: linear-gradient(to right, #2196f3, #ef4336);"
                />
                <div class="d-flex justify-space-between text-caption text-medium-emphasis mb-6">
                  <span>Low ({{ dataMin }})</span>
                  <span>High ({{ dataMax }})</span>
                </div>

                <v-divider class="mb-4" />

                <!-- Data table -->
                <p class="text-caption font-weight-bold text-medium-emphasis mb-2 text-uppercase">Values</p>
                <div
                  v-for="(row, rIdx) in dataValues"
                  :key="rIdx"
                  class="d-flex gap-1 mb-1"
                >
                  <div
                    v-for="(val, cIdx) in row"
                    :key="cIdx"
                    class="d-flex align-center justify-center rounded text-caption font-weight-bold"
                    style="width: 32px; height: 32px; cursor: default; transition: transform 0.15s;"
                    :style="{
                      background: valueToColor(val, dataMin, dataMax),
                      color: val > 5 ? '#fff' : '#000',
                      transform: highlightedDataBlock?.x === cIdx && highlightedDataBlock?.y === rIdx ? 'scale(1.15)' : 'scale(1)',
                      outline: highlightedDataBlock?.x === cIdx && highlightedDataBlock?.y === rIdx ? '2px solid white' : 'none',
                    }"
                  >{{ val }}</div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-tabs-window-item>

      <!-- ──────────────────────────────────────────────────────────────────── -->
      <!-- TAB 3 — Interactive Builder -->
      <!-- ──────────────────────────────────────────────────────────────────── -->
      <v-tabs-window-item value="builder">
        <v-row>
          <v-col cols="12" md="8">
            <v-card rounded="lg" border flat>
              <v-card-title class="text-body-1 font-weight-bold pa-4 pb-2 d-flex align-center gap-2">
                Builder (6×6)
                <v-chip size="x-small" color="primary" variant="tonal">
                  {{ builderBlockCount }} block{{ builderBlockCount !== 1 ? 's' : '' }}
                </v-chip>
              </v-card-title>
              <v-card-subtitle class="px-4 pb-3">
                Click a block to remove it. Use the grid overlay below to place new blocks.
              </v-card-subtitle>

              <v-card-text class="pa-0">
                <CommonIsometricScene
                  :scene="builderScene"
                  height="440px"
                  :interactive="true"
                  :show-grid="true"
                  @block-click="onBuilderBlockClick"
                />
              </v-card-text>

              <v-divider />

              <!-- Cell placement overlay grid -->
              <v-card-text>
                <p class="text-caption text-medium-emphasis mb-2">
                  Click a cell below to place a block at that grid position:
                </p>
                <div
                  :style="{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${builderGridSize}, 1fr)`,
                    gap: '4px',
                    maxWidth: '240px',
                  }"
                >
                  <div
                    v-for="cell in builderCellOverlays"
                    :key="`${cell.x},${cell.y}`"
                    class="rounded"
                    style="aspect-ratio: 1; cursor: pointer; transition: background 0.15s;"
                    :style="{
                      background: builderGrid[`${cell.x},${cell.y}`]?.color ?? 'rgba(128,128,128,0.12)',
                      outline: builderGrid[`${cell.x},${cell.y}`] ? '2px solid rgba(255,255,255,0.3)' : 'none',
                    }"
                    :title="`(${cell.x}, ${cell.y})`"
                    @click="onBuilderGridCellClick(cell.x, cell.y)"
                  />
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <v-card rounded="lg" border flat>
              <v-card-title class="text-body-1 font-weight-bold pa-4 pb-2">
                Block Settings
              </v-card-title>
              <v-card-text>
                <!-- Height slider -->
                <p class="text-caption font-weight-medium text-medium-emphasis mb-1">Height: {{ builderHeight }}</p>
                <v-slider
                  v-model="builderHeight"
                  :min="1"
                  :max="6"
                  :step="1"
                  color="primary"
                  thumb-label
                  show-ticks="always"
                  tick-size="3"
                  class="mb-4"
                />

                <!-- Color picker -->
                <p class="text-caption font-weight-medium text-medium-emphasis mb-2">Colour</p>
                <div class="d-flex flex-wrap gap-2 mb-4">
                  <div
                    v-for="swatch in colorSwatches"
                    :key="swatch"
                    class="rounded-circle"
                    style="width: 28px; height: 28px; cursor: pointer; transition: transform 0.15s, outline 0.15s;"
                    :style="{
                      background: swatch,
                      transform: builderColor === swatch ? 'scale(1.25)' : 'scale(1)',
                      outline: builderColor === swatch ? '3px solid white' : '2px solid transparent',
                    }"
                    @click="builderColor = swatch"
                  />
                </div>

                <v-text-field
                  v-model="builderColor"
                  label="Custom hex"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="mb-4"
                  :style="{ borderLeft: `4px solid ${builderColor}` }"
                />

                <v-divider class="mb-4" />

                <!-- Stats -->
                <div class="d-flex flex-column gap-2 mb-4">
                  <div class="d-flex justify-space-between text-body-2">
                    <span class="text-medium-emphasis">Blocks placed</span>
                    <span class="font-weight-bold">{{ builderBlockCount }}</span>
                  </div>
                  <div class="d-flex justify-space-between text-body-2">
                    <span class="text-medium-emphasis">Grid size</span>
                    <span class="font-weight-bold">{{ builderGridSize }}×{{ builderGridSize }}</span>
                  </div>
                  <div class="d-flex justify-space-between text-body-2">
                    <span class="text-medium-emphasis">Cells empty</span>
                    <span class="font-weight-bold">{{ builderGridSize * builderGridSize - builderBlockCount }}</span>
                  </div>
                </div>

                <v-btn
                  block
                  variant="tonal"
                  color="error"
                  prepend-icon="mdi-delete-sweep-outline"
                  :disabled="builderBlockCount === 0"
                  @click="clearBuilder"
                >
                  Clear all
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-tabs-window-item>
    </v-tabs-window>

    <!-- ──────────────────────────────────────────────────────────────────────── -->
    <!-- Info modal -->
    <!-- ──────────────────────────────────────────────────────────────────────── -->
    <v-dialog v-model="showInfo" max-width="560">
      <v-card rounded="lg">
        <v-card-title class="pa-6 pb-2 d-flex align-center gap-2">
          <v-icon color="teal">mdi-domain</v-icon>
          Use Cases — Isometric Scene
        </v-card-title>
        <v-card-text class="px-6 pb-4">
          <v-list lines="two" class="pa-0">
            <v-list-item class="px-0">
              <template #prepend>
                <v-avatar color="primary" variant="tonal" rounded="lg" class="mr-3">
                  <span class="text-caption font-weight-bold">#1</span>
                </v-avatar>
              </template>
              <p class="text-body-2 font-weight-bold mb-0">Portfolio Manager</p>
              <p class="text-body-2 text-medium-emphasis">
                Visualise project portfolios as a city — tower height = budget, colour = status.
                Stakeholders see the whole landscape at a glance.
              </p>
            </v-list-item>

            <v-divider class="my-2" />

            <v-list-item class="px-0">
              <template #prepend>
                <v-avatar color="warning" variant="tonal" rounded="lg" class="mr-3">
                  <span class="text-caption font-weight-bold">#2</span>
                </v-avatar>
              </template>
              <p class="text-body-2 font-weight-bold mb-0">Roadmap Builder</p>
              <p class="text-body-2 text-medium-emphasis">
                Map milestones across time × team axes. Bar height = effort,
                colour = priority. Drag blocks to reschedule.
              </p>
            </v-list-item>

            <v-divider class="my-2" />

            <v-list-item class="px-0">
              <template #prepend>
                <v-avatar color="success" variant="tonal" rounded="lg" class="mr-3">
                  <v-icon size="18">mdi-gamepad-variant-outline</v-icon>
                </v-avatar>
              </template>
              <p class="text-body-2 font-weight-bold mb-0">Game UIs</p>
              <p class="text-body-2 text-medium-emphasis">
                City builders, strategy games, dungeon editors — pure SVG, no canvas or WebGL required.
              </p>
            </v-list-item>

            <v-divider class="my-2" />

            <v-list-item class="px-0">
              <template #prepend>
                <v-avatar color="info" variant="tonal" rounded="lg" class="mr-3">
                  <v-icon size="18">mdi-chart-bar</v-icon>
                </v-avatar>
              </template>
              <p class="text-body-2 font-weight-bold mb-0">Data Visualisation</p>
              <p class="text-body-2 text-medium-emphasis">
                Turn flat tables into spatial bar charts — memorable and presentation-ready.
              </p>
            </v-list-item>

            <v-divider class="my-2" />

            <v-list-item class="px-0">
              <template #prepend>
                <v-avatar color="deep-purple" variant="tonal" rounded="lg" class="mr-3">
                  <v-icon size="18">mdi-floor-plan</v-icon>
                </v-avatar>
              </template>
              <p class="text-body-2 font-weight-bold mb-0">Architectural Diagrams</p>
              <p class="text-body-2 text-medium-emphasis">
                Sketch floor plans and building layouts without dedicated CAD tooling.
              </p>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions class="px-6 pb-5">
          <v-spacer />
          <v-btn variant="tonal" @click="showInfo = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
