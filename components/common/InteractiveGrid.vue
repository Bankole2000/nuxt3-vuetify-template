<script setup lang="ts" generic="T extends string = string">
// Generic clickable grid. Each cell carries a variant string (T) that drives
// its visual appearance. All game / booking / puzzle logic lives outside the
// component — callers pass in cell definitions and respond to events.
//
// Props
//   cols        — number of columns
//   rows        — number of rows
//   cells       — flat row-major array of GridCell<T>; length must equal cols×rows
//   cellSize    — px square size of each cell (default 56)
//   gap         — px gap between cells (default 4)
//   variants    — map from variant string → visual style overrides
//   disabled    — make all cells non-interactive
//   showCoords  — render (col,row) label inside each cell
//
// Events
//   click(index, cell)          — left-click on a cell
//   rightclick(index, cell)     — right-click (e.preventDefault called)
//   hover(index | null, cell?)  — mouseenter / mouseleave (null on leave)

export interface GridCell<V extends string = string> {
  variant: V
  label?: string
  disabled?: boolean
  data?: unknown      // any app-specific payload; grid never reads this
}

export interface VariantStyle {
  background?: string
  color?: string
  border?: string
  borderRadius?: string
  opacity?: number | string
  icon?: string        // mdi icon name drawn in the centre if set
  iconColor?: string
  fontSize?: string
  fontWeight?: string | number
  cursor?: string
  class?: string       // extra CSS class(es) applied to the cell div
}

const props = withDefaults(defineProps<{
  cols: number
  rows: number
  cells: GridCell<T>[]
  cellSize?: number
  gap?: number
  variants?: Record<string, VariantStyle>
  disabled?: boolean
  showCoords?: boolean
}>(), {
  cellSize: 56,
  gap: 4,
  variants: () => ({}),
  disabled: false,
  showCoords: false,
})

const emit = defineEmits<{
  click:       [index: number, cell: GridCell<T>]
  rightclick:  [index: number, cell: GridCell<T>]
  hover:       [index: number | null, cell?: GridCell<T>]
}>()

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toColRow = (i: number) => ({ col: i % props.cols, row: Math.floor(i / props.cols) })

const resolvedStyle = (cell: GridCell<T>, _index: number): Record<string, string | number> => {
  const vStyle = (props.variants as Record<string, VariantStyle>)[cell.variant] ?? {}
  const isDisabled = props.disabled || cell.disabled
  return {
    width:        `${props.cellSize}px`,
    height:       `${props.cellSize}px`,
    background:   vStyle.background ?? 'rgba(var(--v-theme-on-surface), .06)',
    color:        vStyle.color      ?? 'rgb(var(--v-theme-on-surface))',
    border:       vStyle.border     ?? '1.5px solid rgba(var(--v-theme-on-surface), .1)',
    borderRadius: vStyle.borderRadius ?? '6px',
    opacity:      isDisabled ? 0.4 : (vStyle.opacity ?? 1),
    cursor:       isDisabled ? 'not-allowed' : (vStyle.cursor ?? 'pointer'),
    fontSize:     vStyle.fontSize   ?? '11px',
    fontWeight:   vStyle.fontWeight ?? 600,
    transition:   'background .12s, transform .08s, opacity .12s',
    userSelect:   'none',
  }
}

const extraClass = (cell: GridCell<T>): string => {
  const vStyle = (props.variants as Record<string, VariantStyle>)[cell.variant] ?? {}
  return vStyle.class ?? ''
}

const iconFor = (cell: GridCell<T>): string | undefined => {
  const vStyle = (props.variants as Record<string, VariantStyle>)[cell.variant] ?? {}
  return vStyle.icon
}

const iconColorFor = (cell: GridCell<T>): string | undefined => {
  const vStyle = (props.variants as Record<string, VariantStyle>)[cell.variant] ?? {}
  return vStyle.iconColor
}

// ─── Event handlers ───────────────────────────────────────────────────────────

const onClick = (_e: MouseEvent, index: number) => {
  const cell = props.cells[index]
  if (!cell || props.disabled || cell.disabled) return
  emit('click', index, cell)
}

const onRightClick = (e: MouseEvent, index: number) => {
  e.preventDefault()
  const cell = props.cells[index]
  if (!cell || props.disabled || cell.disabled) return
  emit('rightclick', index, cell)
}

const onEnter = (index: number) => {
  const cell = props.cells[index]
  if (cell) emit('hover', index, cell)
}
const onLeave = () => emit('hover', null)

// ─── Grid container style ─────────────────────────────────────────────────────

const gridStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${props.cols}, ${props.cellSize}px)`,
  gridTemplateRows:    `repeat(${props.rows}, ${props.cellSize}px)`,
  gap:                 `${props.gap}px`,
  width:               'fit-content',
}))
</script>

<template>
  <div :style="gridStyle" role="grid" :aria-colcount="cols" :aria-rowcount="rows">
    <div
      v-for="(cell, i) in cells"
      :key="i"
      role="gridcell"
      :aria-label="cell.label ?? `Cell ${toColRow(i).col},${toColRow(i).row}`"
      :aria-disabled="disabled || cell.disabled || undefined"
      :style="resolvedStyle(cell, i)"
      :class="['ig-cell', extraClass(cell)]"
      tabindex="0"
      @click="onClick($event, i)"
      @contextmenu="onRightClick($event, i)"
      @mouseenter="onEnter(i)"
      @mouseleave="onLeave"
      @keydown.enter="onClick($event as unknown as MouseEvent, i)"
      @keydown.space.prevent="onClick($event as unknown as MouseEvent, i)"
    >
      <!-- Icon layer -->
      <v-icon
        v-if="iconFor(cell)"
        :icon="iconFor(cell)"
        :color="iconColorFor(cell)"
        size="22"
        class="ig-icon"
      />

      <!-- Label — shown if no icon, or always if showCoords -->
      <span v-if="!iconFor(cell) && cell.label" class="ig-label">{{ cell.label }}</span>

      <!-- Coordinate overlay for debugging / dev -->
      <span v-if="showCoords" class="ig-coords">
        {{ toColRow(i).col }},{{ toColRow(i).row }}
      </span>

      <!-- Default slot — callers can inject arbitrary content per cell -->
      <slot :cell="cell" :index="i" :col="toColRow(i).col" :row="toColRow(i).row" />
    </div>
  </div>
</template>

<style scoped>
.ig-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-direction: column;
  gap: 2px;
  outline: none;
  box-sizing: border-box;
}
.ig-cell:focus-visible {
  box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), .7);
  z-index: 1;
}
.ig-cell:not([aria-disabled]):hover {
  transform: scale(1.06);
  z-index: 2;
}
.ig-label {
  font-size: inherit;
  font-weight: inherit;
  line-height: 1;
  pointer-events: none;
}
.ig-icon {
  pointer-events: none;
}
.ig-coords {
  position: absolute;
  bottom: 2px;
  right: 3px;
  font-size: 8px;
  opacity: .4;
  pointer-events: none;
  line-height: 1;
}
</style>
