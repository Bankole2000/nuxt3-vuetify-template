<script setup lang="ts" generic="T extends TreeNode = TreeNode">
// Generic recursive tree view.
// Supports: expand/collapse, single/multi select, search filter, drag-to-reorder,
// lazy children (async load on expand), badges, icons, custom slot per node,
// and programmatic expand/collapse/select from the parent.
//
// The component is recursive — it renders itself for child nodes via
// a "TreeViewNode" sub-component defined below the main export.

export interface TreeNode {
  id:        string
  label:     string
  icon?:     string
  iconColor?: string
  badge?:    string | number
  badgeColor?: string
  disabled?: boolean
  children?: TreeNode[]
  // Set to true to indicate children exist but haven't loaded yet
  hasChildren?: boolean
  // Any app-specific data; the tree never reads this
  data?: unknown
}

// ─── Props / emits ────────────────────────────────────────────────────────────

const props = withDefaults(defineProps<{
  nodes:          TreeNode[]
  // IDs of currently expanded nodes
  expanded?:      Set<string>
  // IDs of currently selected nodes
  selected?:      Set<string>
  // IDs of nodes currently loading async children — shared across all recursive levels
  loading?:       Set<string>
  multiSelect?:   boolean
  // Show checkboxes instead of highlight selection
  checkboxes?:    boolean
  // Filter string — hides non-matching nodes (ancestors of matches stay visible)
  filter?:        string
  // Allow drag to reorder siblings
  draggable?:     boolean
  // Indent per level in px
  indent?:        number
  // Current depth (used internally by recursive render — do not set from outside)
  _depth?:        number
}>(), {
  expanded:    () => new Set<string>(),
  selected:    () => new Set<string>(),
  loading:     () => new Set<string>(),
  multiSelect: false,
  checkboxes:  false,
  filter:      '',
  draggable:   false,
  indent:      20,
  _depth:      0,
})

const emit = defineEmits<{
  // Node toggled open/closed
  toggle:   [id: string, open: boolean]
  // Selection changed — emits the full new Set
  select:   [ids: Set<string>]
  // Async children requested — parent should load and add children to node
  load:     [id: string]
  // Reorder: node `id` moved to position `index` within parent `parentId` (null = root)
  reorder:  [id: string, parentId: string | null, index: number]
  // Right-click context
  contextmenu: [id: string, event: MouseEvent]
}>()

// ─── Filtering ────────────────────────────────────────────────────────────────

// Returns true if this node or any descendant matches the filter
function nodeVisible(node: TreeNode, q: string): boolean {
  if (!q) return true
  if (node.label.toLowerCase().includes(q)) return true
  return (node.children ?? []).some(c => nodeVisible(c, q))
}

const q = computed(() => props.filter.toLowerCase().trim())

const visibleNodes = computed(() =>
  props.nodes.filter(n => nodeVisible(n, q.value))
)

// ─── Expand / collapse ────────────────────────────────────────────────────────

const isExpanded = (id: string) => props.expanded!.has(id)

const toggle = (node: TreeNode) => {
  if (node.disabled) return
  const willOpen = !isExpanded(node.id)
  emit('toggle', node.id, willOpen)
  if (willOpen && node.hasChildren && !(node.children?.length)) {
    emit('load', node.id)
  }
}

// ─── Selection ────────────────────────────────────────────────────────────────

const isSelected = (id: string) => props.selected!.has(id)

const selectNode = (node: TreeNode, e: MouseEvent) => {
  if (node.disabled) return
  let next: Set<string>

  if (props.multiSelect && (e.metaKey || e.ctrlKey || props.checkboxes)) {
    next = new Set(props.selected)
    if (next.has(node.id)) next.delete(node.id)
    else next.add(node.id)
  } else {
    next = isSelected(node.id) && props.selected!.size === 1
      ? new Set()
      : new Set([node.id])
  }
  emit('select', next)
}

// ─── Drag-to-reorder ──────────────────────────────────────────────────────────

const dragOver  = ref<string | null>(null)
const dragId    = ref<string | null>(null)

const onDragStart = (e: DragEvent, id: string) => {
  dragId.value = id
  e.dataTransfer!.effectAllowed = 'move'
  e.dataTransfer!.setData('text/plain', id)
}

const onDragEnter = (id: string) => { dragOver.value = id }
const onDragLeave = () => { dragOver.value = null }

const onDrop = (e: DragEvent, targetId: string, index: number) => {
  e.preventDefault()
  dragOver.value = null
  const id = e.dataTransfer!.getData('text/plain') || dragId.value
  if (!id || id === targetId) return
  emit('reorder', id, null, index)
  dragId.value = null
}

// ─── Keyboard nav ─────────────────────────────────────────────────────────────

const onKeyDown = (e: KeyboardEvent, node: TreeNode) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    selectNode(node, e as unknown as MouseEvent)
  }
  if (e.key === 'ArrowRight' && !isExpanded(node.id)) toggle(node)
  if (e.key === 'ArrowLeft'  &&  isExpanded(node.id)) toggle(node)
}
</script>

<template>
  <ul class="tv-list" role="tree" :aria-multiselectable="multiSelect || undefined">
    <li
      v-for="(node, idx) in visibleNodes"
      :key="node.id"
      role="treeitem"
      :aria-expanded="(node.children?.length || node.hasChildren) ? isExpanded(node.id) : undefined"
      :aria-selected="isSelected(node.id)"
      :aria-disabled="node.disabled || undefined"
      :draggable="draggable && !node.disabled"
      @dragstart="onDragStart($event, node.id)"
      @dragenter.prevent="onDragEnter(node.id)"
      @dragleave="onDragLeave"
      @dragover.prevent
      @drop="onDrop($event, node.id, idx)"
    >
      <!-- Row -->
      <div
        class="tv-row"
        :class="{
          'tv-row--selected':  isSelected(node.id),
          'tv-row--disabled':  node.disabled,
          'tv-row--dragover':  dragOver === node.id,
          'tv-row--filtered':  q && node.label.toLowerCase().includes(q),
        }"
        :style="{ paddingLeft: `${_depth * indent + 8}px` }"
        tabindex="0"
        @click="selectNode(node, $event)"
        @keydown="onKeyDown($event, node)"
        @contextmenu.prevent="emit('contextmenu', node.id, $event)"
      >
        <!-- Expand toggle -->
        <button
          v-if="node.children?.length || node.hasChildren"
          class="tv-toggle"
          :aria-label="isExpanded(node.id) ? 'Collapse' : 'Expand'"
          tabindex="-1"
          @click.stop="toggle(node)"
        >
          <v-icon
            :icon="loading!.has(node.id) ? 'mdi-loading' : isExpanded(node.id) ? 'mdi-chevron-down' : 'mdi-chevron-right'"
            :class="{ 'tv-spin': loading!.has(node.id) }"
            size="16"
          />
        </button>
        <span v-else class="tv-toggle-spacer" />

        <!-- Checkbox -->
        <v-checkbox-btn
          v-if="checkboxes"
          :model-value="isSelected(node.id)"
          :disabled="node.disabled"
          density="compact"
          class="tv-checkbox"
          tabindex="-1"
          @click.stop="selectNode(node, $event as unknown as MouseEvent)"
        />

        <!-- Node icon -->
        <v-icon
          v-if="node.icon"
          :icon="node.icon"
          :color="node.iconColor"
          size="16"
          class="tv-icon"
        />

        <!-- Label — highlight matching chars when filtering -->
        <span class="tv-label">
          <template v-if="q && node.label.toLowerCase().includes(q)">
            <span
              v-for="(part, pi) in node.label.split(new RegExp(`(${q})`, 'i'))"
              :key="pi"
              :class="part.toLowerCase() === q ? 'tv-match' : ''"
            >{{ part }}</span>
          </template>
          <template v-else>{{ node.label }}</template>
        </span>

        <!-- Badge -->
        <v-chip
          v-if="node.badge !== undefined"
          :color="node.badgeColor ?? 'default'"
          size="x-small"
          variant="tonal"
          class="tv-badge"
        >{{ node.badge }}</v-chip>

        <!-- Drag handle -->
        <v-icon
          v-if="draggable && !node.disabled"
          icon="mdi-drag-vertical"
          size="14"
          class="tv-drag-handle"
        />

        <!-- Custom slot content -->
        <slot :node="node" :depth="_depth" :selected="isSelected(node.id)" />
      </div>

      <!-- Children (recursive) -->
      <CommonTreeView
        v-if="(node.children?.length || node.hasChildren) && isExpanded(node.id)"
        :nodes="node.children ?? []"
        :expanded="expanded"
        :selected="selected"
        :loading="loading"
        :multi-select="multiSelect"
        :checkboxes="checkboxes"
        :filter="filter"
        :draggable="draggable"
        :indent="indent"
        :_depth="_depth + 1"
        @toggle="(id: string, open: boolean) => emit('toggle', id, open)"
        @select="(ids: Set<string>) => emit('select', ids)"
        @load="(id: string) => emit('load', id)"
        @reorder="(id: string, parentId: string | null, index: number) => emit('reorder', id, parentId, index)"
        @contextmenu="(id: string, ev: MouseEvent) => emit('contextmenu', id, ev)"
      />
    </li>
  </ul>
</template>

<style scoped>
.tv-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tv-row {
  display: flex;
  align-items: center;
  gap: 4px;
  padding-top: 3px;
  padding-bottom: 3px;
  padding-right: 8px;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
  transition: background .1s;
  min-height: 32px;
  outline: none;
  position: relative;
}
.tv-row:hover { background: rgba(var(--v-theme-on-surface), .06); }
.tv-row:focus-visible { box-shadow: inset 0 0 0 2px rgba(var(--v-theme-primary), .5); }
.tv-row--selected { background: rgba(var(--v-theme-primary), .1); }
.tv-row--selected .tv-label { color: rgb(var(--v-theme-primary)); font-weight: 600; }
.tv-row--disabled { opacity: .4; cursor: not-allowed; }
.tv-row--dragover { background: rgba(var(--v-theme-primary), .15); outline: 2px dashed rgba(var(--v-theme-primary), .4); }
.tv-row--filtered .tv-label { color: rgb(var(--v-theme-on-surface)); }

.tv-toggle {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  cursor: pointer;
  padding: 0;
  color: rgba(var(--v-theme-on-surface), .5);
  border-radius: 4px;
  transition: background .1s, color .1s;
}
.tv-toggle:hover { background: rgba(var(--v-theme-on-surface), .08); color: rgb(var(--v-theme-on-surface)); }
.tv-toggle-spacer { width: 20px; flex-shrink: 0; }

.tv-checkbox { margin: 0; flex-shrink: 0; }
.tv-icon     { flex-shrink: 0; }

.tv-label {
  flex: 1;
  font-size: 13px;
  color: rgb(var(--v-theme-on-surface));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
}
.tv-match {
  background: rgba(var(--v-theme-warning), .35);
  border-radius: 2px;
  padding: 0 1px;
}

.tv-badge { flex-shrink: 0; margin-left: auto; }

.tv-drag-handle {
  flex-shrink: 0;
  opacity: 0;
  cursor: grab;
  transition: opacity .1s;
  color: rgba(var(--v-theme-on-surface), .4);
}
.tv-row:hover .tv-drag-handle { opacity: 1; }

@keyframes tv-spin { to { transform: rotate(360deg); } }
.tv-spin { animation: tv-spin .7s linear infinite; }
</style>
