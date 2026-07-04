<script setup lang="ts">
// Resizable split pane — horizontal (side-by-side) or vertical (stacked).
// The divider is dragged to resize; double-click resets to the default split.
// Pane sizes are expressed as a percentage of the container.
//
// Props
//   direction   — 'horizontal' (default) or 'vertical'
//   initialSplit — percentage for the first pane (default 50)
//   minSize      — minimum pane size in px (default 80)
//   gutterSize   — divider thickness in px (default 6)
//   resetOnDblClick — reset to initialSplit on divider double-click (default true)

const props = withDefaults(defineProps<{
  direction?: 'horizontal' | 'vertical'
  initialSplit?: number
  minSize?: number
  gutterSize?: number
  resetOnDblClick?: boolean
}>(), {
  direction: 'horizontal',
  initialSplit: 50,
  minSize: 80,
  gutterSize: 6,
  resetOnDblClick: true,
})

const emit = defineEmits<{
  resize: [split: number]
}>()

const containerRef = ref<HTMLDivElement>()
const split        = ref(props.initialSplit)
const dragging     = ref(false)

const isHorizontal = computed(() => props.direction === 'horizontal')

// ─── Drag logic ───────────────────────────────────────────────────────────────

const clampedSplit = (raw: number): number => {
  const el    = containerRef.value
  if (!el) return raw
  const total = isHorizontal.value ? el.offsetWidth : el.offsetHeight
  const minPct = (props.minSize / total) * 100
  return Math.min(100 - minPct, Math.max(minPct, raw))
}

const onGutterMouseDown = (e: MouseEvent) => {
  e.preventDefault()
  dragging.value = true

  const onMove = (ev: MouseEvent) => {
    const el = containerRef.value
    if (!el) return
    const rect = el.getBoundingClientRect()
    const raw  = isHorizontal.value
      ? ((ev.clientX - rect.left) / rect.width)  * 100
      : ((ev.clientY - rect.top)  / rect.height) * 100
    split.value = clampedSplit(raw)
    emit('resize', split.value)
  }

  const onUp = () => {
    dragging.value = false
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
  }

  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}

// Touch support
const onGutterTouchStart = (e: TouchEvent) => {
  e.preventDefault()
  dragging.value = true

  const onMove = (ev: TouchEvent) => {
    const el    = containerRef.value
    const touch = ev.touches[0]
    if (!el || !touch) return
    const rect = el.getBoundingClientRect()
    const raw  = isHorizontal.value
      ? ((touch.clientX - rect.left) / rect.width)  * 100
      : ((touch.clientY - rect.top)  / rect.height) * 100
    split.value = clampedSplit(raw)
    emit('resize', split.value)
  }

  const onEnd = () => {
    dragging.value = false
    window.removeEventListener('touchmove', onMove)
    window.removeEventListener('touchend', onEnd)
  }

  window.addEventListener('touchmove', onMove, { passive: false })
  window.addEventListener('touchend', onEnd)
}

const onGutterDblClick = () => {
  if (!props.resetOnDblClick) return
  split.value = props.initialSplit
  emit('resize', split.value)
}

// Keyboard: arrow keys nudge the split by 1% while the gutter is focused
const onGutterKeyDown = (e: KeyboardEvent) => {
  const nudgeKeys = isHorizontal.value
    ? ['ArrowLeft', 'ArrowRight']
    : ['ArrowUp', 'ArrowDown']
  if (!nudgeKeys.includes(e.key)) return
  e.preventDefault()
  const delta = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : -1
  split.value = clampedSplit(split.value + delta)
  emit('resize', split.value)
}

// ─── Computed styles ──────────────────────────────────────────────────────────

const containerStyle = computed((): Record<string, string> => ({
  display:       'flex',
  flexDirection: isHorizontal.value ? 'row' : 'column',
  width:         '100%',
  height:        '100%',
  overflow:      'hidden',
  userSelect:    dragging.value ? 'none' : 'auto',
}))

const paneAStyle = computed(() => ({
  flexShrink: '0',
  overflow:   'hidden',
  ...(isHorizontal.value
    ? { width: `calc(${split.value}% - ${props.gutterSize / 2}px)` }
    : { height: `calc(${split.value}% - ${props.gutterSize / 2}px)` }),
}))

const paneBStyle = computed(() => ({
  flex:     '1 1 0',
  overflow: 'hidden',
  minWidth: isHorizontal.value ? `${props.minSize}px` : undefined,
  minHeight: !isHorizontal.value ? `${props.minSize}px` : undefined,
}))

const gutterStyle = computed(() => ({
  flexShrink:      '0',
  width:           isHorizontal.value ? `${props.gutterSize}px` : '100%',
  height:          isHorizontal.value ? '100%'                  : `${props.gutterSize}px`,
  cursor:          isHorizontal.value ? 'col-resize'            : 'row-resize',
  display:         'flex',
  alignItems:      'center',
  justifyContent:  'center',
  zIndex:          10,
}))
</script>

<template>
  <div ref="containerRef" :style="containerStyle" class="sp-root">
    <!-- Pane A -->
    <div :style="paneAStyle" class="sp-pane sp-pane--a">
      <slot name="a" />
    </div>

    <!-- Gutter / divider -->
    <div
      :style="gutterStyle"
      class="sp-gutter"
      :class="[
        isHorizontal ? 'sp-gutter--h' : 'sp-gutter--v',
        { 'sp-gutter--dragging': dragging },
      ]"
      role="separator"
      :aria-orientation="isHorizontal ? 'vertical' : 'horizontal'"
      :aria-valuenow="Math.round(split)"
      aria-valuemin="0"
      aria-valuemax="100"
      tabindex="0"
      @mousedown="onGutterMouseDown"
      @touchstart.prevent="onGutterTouchStart"
      @dblclick="onGutterDblClick"
      @keydown="onGutterKeyDown"
    >
      <div class="sp-gutter-handle">
        <div class="sp-gutter-dots">
          <span /><span /><span />
        </div>
      </div>
    </div>

    <!-- Pane B -->
    <div :style="paneBStyle" class="sp-pane sp-pane--b">
      <slot name="b" />
    </div>
  </div>
</template>

<style scoped>
.sp-root { box-sizing: border-box; }

.sp-pane {
  box-sizing: border-box;
  position: relative;
}

/* Gutter base */
.sp-gutter {
  background: rgba(var(--v-border-color), var(--v-border-opacity));
  transition: background .15s;
  flex-shrink: 0;
  position: relative;
  outline: none;
}
.sp-gutter:hover,
.sp-gutter:focus-visible,
.sp-gutter--dragging {
  background: rgba(var(--v-theme-primary), .35);
}
.sp-gutter:focus-visible {
  outline: 2px solid rgba(var(--v-theme-primary), .6);
  outline-offset: 0;
}

/* Drag handle dots */
.sp-gutter-handle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 4px;
  padding: 4px 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.sp-gutter-dots {
  display: flex;
  gap: 2px;
}
.sp-gutter--h .sp-gutter-dots { flex-direction: column; }
.sp-gutter--v .sp-gutter-dots { flex-direction: row; }

.sp-gutter-dots span {
  display: block;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(var(--v-theme-on-surface), .3);
  transition: background .15s;
}
.sp-gutter:hover .sp-gutter-dots span,
.sp-gutter--dragging .sp-gutter-dots span {
  background: rgba(var(--v-theme-primary), .9);
}
</style>
