<script setup lang="ts">
import type { TreeNode } from '~/components/common/TreeView.vue'

definePageMeta({ layout: 'catalogue' })
useSeo({ title: 'Tree View', description: 'Generic recursive tree view with expand/collapse, single/multi-select, checkboxes, search filter, lazy loading, drag-to-reorder, and a custom node slot.' })

const tab      = ref('filesystem')
const infoOpen = ref(false)

const USECASES = [
  {
    context: 'General UI patterns',
    icon: 'mdi-file-tree-outline',
    color: 'primary',
    items: [
      { label: 'Collapsible sidebar navigation', detail: 'Multi-level app menu where sections expand to reveal sub-pages.' },
      { label: 'Settings panel', detail: 'Grouped preferences that expand per category — appearance, notifications, integrations.' },
      { label: 'Category / tag browser', detail: 'Hierarchical taxonomy where clicking a leaf filters a list or grid.' },
      { label: 'Permission editor', detail: 'Role → resource → action tree where checkboxes grant or revoke access.' },
    ],
  },
  {
    context: 'Portfolio Manager (#1)',
    icon: 'mdi-briefcase-outline',
    color: 'teal',
    items: [
      { label: 'Project → phase → task hierarchy', detail: 'Each project expands to reveal its phases; each phase expands to list tasks. Click a task to load its detail in a split pane.' },
      { label: 'Integration tree', detail: 'SDK connections grouped by service type (Auth, Data, Payments) with status badges showing active/error.' },
    ],
  },
  {
    context: 'Roadmap Builder (#2)',
    icon: 'mdi-map-outline',
    color: 'blue',
    items: [
      { label: 'Epic → story → task breakdown', detail: 'Work items in a collapsible WBS (Work Breakdown Structure). Selecting a story highlights its bar on the Gantt.' },
      { label: 'Dependency tree', detail: 'Each milestone expands to show what it blocks and what blocks it — useful for critical path analysis.' },
    ],
  },
  {
    context: 'Workflow Engine (#3)',
    icon: 'mdi-vector-polyline',
    color: 'purple',
    items: [
      { label: 'Pipeline step tree', detail: 'Workflow → stage → step hierarchy. Selecting a step opens its config in the right split pane.' },
      { label: 'Run history tree', detail: 'Date → workflow → run. Expand a run to see each step\'s status, duration, and output.' },
    ],
  },
  {
    context: 'Family Tree (#10)',
    icon: 'mdi-family-tree',
    color: 'deep-purple',
    items: [
      { label: 'Ancestry list', detail: 'Indented descendant/ancestor tree as a navigable sidebar alongside the graph canvas. Click to pan the graph to that person.' },
      { label: 'Source citations', detail: 'Each person expands to reveal their linked documents, photos, and census records.' },
    ],
  },
  {
    context: 'Verifiable Contracts (#14)',
    icon: 'mdi-file-sign',
    color: 'green',
    items: [
      { label: 'Contract → clause → sub-clause', detail: 'Full document structure in a sidebar tree. Clicking a clause jumps the editor to that section.' },
      { label: 'Version history tree', detail: 'Each contract expands to show its version chain — click any version to diff it against current.' },
    ],
  },
  {
    context: 'HEAM / Symptom Tool (#9, #16)',
    icon: 'mdi-heart-pulse',
    color: 'red',
    items: [
      { label: 'Symptom taxonomy', detail: 'Body system → organ → symptom hierarchy for structured data entry. Checkboxes let patients tick multiple symptoms at once.' },
      { label: 'Medical history tree', detail: 'Chronological grouping: year → visit → diagnoses. Lazy-load past records on expand.' },
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// 1. FILE SYSTEM
// ─────────────────────────────────────────────────────────────────────────────

const fsNodes = ref<TreeNode[]>([
  { id: 'src', label: 'src', icon: 'mdi-folder', iconColor: '#f59e0b', children: [
    { id: 'components', label: 'components', icon: 'mdi-folder', iconColor: '#f59e0b', children: [
      { id: 'common', label: 'common', icon: 'mdi-folder', iconColor: '#f59e0b', children: [
        { id: 'TreeView.vue',    label: 'TreeView.vue',    icon: 'mdi-vuejs',                    iconColor: '#42b883' },
        { id: 'SplitPane.vue',   label: 'SplitPane.vue',   icon: 'mdi-vuejs',                    iconColor: '#42b883' },
        { id: 'DataGrid.vue',    label: 'DataGrid.vue',    icon: 'mdi-vuejs',                    iconColor: '#42b883' },
        { id: 'WorkflowEditor.vue', label: 'WorkflowEditor.vue', icon: 'mdi-vuejs',              iconColor: '#42b883' },
      ]},
      { id: 'layout', label: 'layout', icon: 'mdi-folder', iconColor: '#f59e0b', children: [
        { id: 'NavItems.vue', label: 'NavItems.vue', icon: 'mdi-vuejs', iconColor: '#42b883' },
      ]},
    ]},
    { id: 'pages', label: 'pages', icon: 'mdi-folder', iconColor: '#f59e0b', children: [
      { id: 'index.vue',    label: 'index.vue',    icon: 'mdi-vuejs', iconColor: '#42b883' },
      { id: 'catalogue', label: 'catalogue', icon: 'mdi-folder', iconColor: '#f59e0b', children: [
        { id: 'tree-view.vue',   label: 'tree-view.vue',   icon: 'mdi-vuejs', iconColor: '#42b883' },
        { id: 'split-pane.vue',  label: 'split-pane.vue',  icon: 'mdi-vuejs', iconColor: '#42b883' },
      ]},
    ]},
    { id: 'composables', label: 'composables', icon: 'mdi-folder', iconColor: '#f59e0b', children: [
      { id: 'useSeo.ts',       label: 'useSeo.ts',       icon: 'mdi-language-typescript', iconColor: '#3178c6' },
      { id: 'useAppTheme.ts',  label: 'useAppTheme.ts',  icon: 'mdi-language-typescript', iconColor: '#3178c6' },
      { id: 'useFamilyData.ts',label: 'useFamilyData.ts',icon: 'mdi-language-typescript', iconColor: '#3178c6' },
    ]},
    { id: 'stores', label: 'stores', icon: 'mdi-folder', iconColor: '#f59e0b', children: [
      { id: 'auth.ts', label: 'auth.ts', icon: 'mdi-language-typescript', iconColor: '#3178c6' },
    ]},
  ]},
  { id: 'public', label: 'public', icon: 'mdi-folder', iconColor: '#f59e0b', children: [
    { id: 'icons', label: 'icons', icon: 'mdi-folder', iconColor: '#f59e0b', children: [
      { id: 'icon-192.png', label: 'icon-192.png', icon: 'mdi-image', iconColor: '#ec4899' },
      { id: 'icon-512.png', label: 'icon-512.png', icon: 'mdi-image', iconColor: '#ec4899' },
    ]},
  ]},
  { id: 'nuxt.config.ts', label: 'nuxt.config.ts', icon: 'mdi-language-typescript', iconColor: '#3178c6' },
  { id: 'package.json',   label: 'package.json',   icon: 'mdi-code-json',            iconColor: '#f97316' },
  { id: 'tsconfig.json',  label: 'tsconfig.json',  icon: 'mdi-code-json',            iconColor: '#f97316' },
])

const fsExpanded = ref<Set<string>>(new Set(['src', 'components', 'common']))
const fsSelected = ref<Set<string>>(new Set())
const fsFilter   = ref('')

const fsToggle = (id: string, open: boolean) => {
  const next = new Set(fsExpanded.value)
  open ? next.add(id) : next.delete(id)
  fsExpanded.value = next
}
const fsSelect = (ids: Set<string>) => { fsSelected.value = ids }

// ─────────────────────────────────────────────────────────────────────────────
// 2. TASK HIERARCHY with badges + checkboxes
// ─────────────────────────────────────────────────────────────────────────────

const taskNodes = ref<TreeNode[]>([
  { id: 'p1', label: 'Portfolio Manager', icon: 'mdi-briefcase-outline', iconColor: '#6366f1', badge: '12', badgeColor: 'primary', children: [
    { id: 'p1-ph1', label: 'Phase 1 · Foundation', icon: 'mdi-flag-outline', iconColor: '#10b981', badge: '4', badgeColor: 'success', children: [
      { id: 'p1-t1', label: 'Set up Nuxt 3 + Vuetify', icon: 'mdi-check-circle', iconColor: '#10b981' },
      { id: 'p1-t2', label: 'Configure Pinia stores', icon: 'mdi-check-circle', iconColor: '#10b981' },
      { id: 'p1-t3', label: 'Auth middleware', icon: 'mdi-check-circle', iconColor: '#10b981' },
      { id: 'p1-t4', label: 'Deploy to Vercel', icon: 'mdi-check-circle', iconColor: '#10b981' },
    ]},
    { id: 'p1-ph2', label: 'Phase 2 · Core UI', icon: 'mdi-flag-outline', iconColor: '#f59e0b', badge: '5', badgeColor: 'warning', children: [
      { id: 'p1-t5', label: 'Dashboard layout', icon: 'mdi-circle-outline', iconColor: '#9ca3af' },
      { id: 'p1-t6', label: 'Project list view', icon: 'mdi-circle-outline', iconColor: '#9ca3af' },
      { id: 'p1-t7', label: 'Task detail panel', icon: 'mdi-circle-outline', iconColor: '#9ca3af' },
      { id: 'p1-t8', label: 'Gantt component', icon: 'mdi-circle-outline', iconColor: '#9ca3af' },
      { id: 'p1-t9', label: 'Notifications', icon: 'mdi-circle-outline', iconColor: '#9ca3af' },
    ]},
    { id: 'p1-ph3', label: 'Phase 3 · SDK', icon: 'mdi-flag-outline', iconColor: '#ef4444', badge: '3', badgeColor: 'error', children: [
      { id: 'p1-t10', label: 'API integration layer', icon: 'mdi-circle-outline', iconColor: '#9ca3af' },
      { id: 'p1-t11', label: 'Webhook handler', icon: 'mdi-circle-outline', iconColor: '#9ca3af' },
      { id: 'p1-t12', label: 'OAuth2 token refresh', icon: 'mdi-circle-outline', iconColor: '#9ca3af' },
    ]},
  ]},
  { id: 'p2', label: 'Roadmap Builder', icon: 'mdi-map-outline', iconColor: '#3b82f6', badge: '6', badgeColor: 'info', children: [
    { id: 'p2-ph1', label: 'Phase 1 · MVP', icon: 'mdi-flag-outline', iconColor: '#10b981', badge: '3', badgeColor: 'success', children: [
      { id: 'p2-t1', label: 'Gantt chart component', icon: 'mdi-circle-outline', iconColor: '#9ca3af' },
      { id: 'p2-t2', label: 'Milestone CRUD', icon: 'mdi-circle-outline', iconColor: '#9ca3af' },
      { id: 'p2-t3', label: 'Dependency arrows', icon: 'mdi-circle-outline', iconColor: '#9ca3af' },
    ]},
    { id: 'p2-ph2', label: 'Phase 2 · Collaboration', icon: 'mdi-flag-outline', iconColor: '#ef4444', badge: '3', badgeColor: 'error', children: [
      { id: 'p2-t4', label: 'Share roadmap link', icon: 'mdi-circle-outline', iconColor: '#9ca3af' },
      { id: 'p2-t5', label: 'Comment threads', icon: 'mdi-circle-outline', iconColor: '#9ca3af' },
      { id: 'p2-t6', label: 'Role-based access', icon: 'mdi-circle-outline', iconColor: '#9ca3af' },
    ]},
  ]},
  { id: 'p3', label: 'Expense Tracker', icon: 'mdi-cash-multiple', iconColor: '#10b981', badge: '4', badgeColor: 'success', children: [
    { id: 'p3-t1', label: 'Transaction import (CSV)', icon: 'mdi-circle-outline', iconColor: '#9ca3af' },
    { id: 'p3-t2', label: 'Category management', icon: 'mdi-circle-outline', iconColor: '#9ca3af' },
    { id: 'p3-t3', label: 'Monthly report charts', icon: 'mdi-circle-outline', iconColor: '#9ca3af' },
    { id: 'p3-t4', label: 'Budget alerts', icon: 'mdi-circle-outline', iconColor: '#9ca3af' },
  ]},
])

const taskExpanded = ref<Set<string>>(new Set(['p1', 'p1-ph1', 'p1-ph2']))
const taskSelected = ref<Set<string>>(new Set(['p1-t1', 'p1-t2', 'p1-t3', 'p1-t4']))
const taskFilter   = ref('')

const taskToggle = (id: string, open: boolean) => {
  const next = new Set(taskExpanded.value)
  open ? next.add(id) : next.delete(id)
  taskExpanded.value = next
}
const taskSelect = (ids: Set<string>) => { taskSelected.value = ids }

// ─────────────────────────────────────────────────────────────────────────────
// 3. PERMISSION TREE with checkboxes
// ─────────────────────────────────────────────────────────────────────────────

const permNodes = ref<TreeNode[]>([
  { id: 'projects', label: 'Projects', icon: 'mdi-briefcase-outline', iconColor: '#6366f1', children: [
    { id: 'projects.view',   label: 'View projects',   icon: 'mdi-eye-outline' },
    { id: 'projects.create', label: 'Create projects', icon: 'mdi-plus-circle-outline' },
    { id: 'projects.edit',   label: 'Edit projects',   icon: 'mdi-pencil-outline' },
    { id: 'projects.delete', label: 'Delete projects', icon: 'mdi-delete-outline', iconColor: '#ef4444' },
  ]},
  { id: 'tasks', label: 'Tasks', icon: 'mdi-checkbox-marked-circle-outline', iconColor: '#10b981', children: [
    { id: 'tasks.view',   label: 'View tasks',   icon: 'mdi-eye-outline' },
    { id: 'tasks.create', label: 'Create tasks', icon: 'mdi-plus-circle-outline' },
    { id: 'tasks.edit',   label: 'Edit tasks',   icon: 'mdi-pencil-outline' },
    { id: 'tasks.delete', label: 'Delete tasks', icon: 'mdi-delete-outline', iconColor: '#ef4444' },
    { id: 'tasks.assign', label: 'Assign tasks', icon: 'mdi-account-arrow-right-outline' },
  ]},
  { id: 'billing', label: 'Billing', icon: 'mdi-credit-card-outline', iconColor: '#f59e0b', children: [
    { id: 'billing.view',    label: 'View invoices',    icon: 'mdi-eye-outline' },
    { id: 'billing.pay',     label: 'Make payments',    icon: 'mdi-cash' },
    { id: 'billing.export',  label: 'Export statements',icon: 'mdi-download-outline' },
  ]},
  { id: 'admin', label: 'Administration', icon: 'mdi-shield-outline', iconColor: '#ef4444', children: [
    { id: 'admin.users',     label: 'Manage users',    icon: 'mdi-account-multiple-outline' },
    { id: 'admin.roles',     label: 'Manage roles',    icon: 'mdi-account-key-outline' },
    { id: 'admin.settings',  label: 'System settings', icon: 'mdi-cog-outline' },
    { id: 'admin.audit',     label: 'Audit log',       icon: 'mdi-history', disabled: true },
  ]},
])

const permExpanded = ref<Set<string>>(new Set(['projects', 'tasks', 'billing', 'admin']))
const permSelected = ref<Set<string>>(new Set([
  'projects.view', 'projects.create', 'projects.edit',
  'tasks.view', 'tasks.create', 'tasks.edit', 'tasks.assign',
  'billing.view',
]))
const permFilter   = ref('')

const permToggle = (id: string, open: boolean) => {
  const next = new Set(permExpanded.value)
  open ? next.add(id) : next.delete(id)
  permExpanded.value = next
}
const permSelect = (ids: Set<string>) => { permSelected.value = ids }

// ─────────────────────────────────────────────────────────────────────────────
// 4. LAZY-LOAD — simulated async children
// ─────────────────────────────────────────────────────────────────────────────

interface OrgNode extends TreeNode {
  children?: OrgNode[]
}

const orgNodes = ref<OrgNode[]>([
  { id: 'ceo',  label: 'Alice Chen · CEO',       icon: 'mdi-account-tie', iconColor: '#6366f1', hasChildren: true },
])

const orgExpanded = ref<Set<string>>(new Set())
const orgSelected = ref<Set<string>>(new Set())
const orgLoading  = ref<Set<string>>(new Set())

const ORG_CHILDREN: Record<string, OrgNode[]> = {
  ceo: [
    { id: 'cto',  label: 'Bob Okafor · CTO',     icon: 'mdi-account-tie', iconColor: '#3b82f6', hasChildren: true },
    { id: 'cfo',  label: 'Sara Lee · CFO',        icon: 'mdi-account-tie', iconColor: '#10b981', hasChildren: true },
    { id: 'cmo',  label: 'James Park · CMO',      icon: 'mdi-account-tie', iconColor: '#f59e0b', hasChildren: true },
  ],
  cto: [
    { id: 'eng1', label: 'Emma Davis · Lead Eng', icon: 'mdi-account', iconColor: '#6366f1', hasChildren: true },
    { id: 'eng2', label: 'Tom Wilson · DevOps',   icon: 'mdi-account', iconColor: '#6366f1' },
    { id: 'eng3', label: 'Mia Zhang · QA Lead',   icon: 'mdi-account', iconColor: '#6366f1' },
  ],
  cfo: [
    { id: 'fin1', label: 'Liam Brown · Analyst',  icon: 'mdi-account', iconColor: '#10b981' },
    { id: 'fin2', label: 'Ava Moore · Controller', icon: 'mdi-account', iconColor: '#10b981' },
  ],
  cmo: [
    { id: 'mkt1', label: 'Noah Taylor · Growth',  icon: 'mdi-account', iconColor: '#f59e0b' },
    { id: 'mkt2', label: 'Lily White · Content',  icon: 'mdi-account', iconColor: '#f59e0b' },
  ],
  eng1: [
    { id: 'dev1', label: 'Oscar Hill · Frontend', icon: 'mdi-account', iconColor: '#8b5cf6' },
    { id: 'dev2', label: 'Zoe Clark · Backend',   icon: 'mdi-account', iconColor: '#8b5cf6' },
    { id: 'dev3', label: 'Leo Scott · Mobile',    icon: 'mdi-account', iconColor: '#8b5cf6' },
  ],
}

const injectChildren = (nodes: OrgNode[], parentId: string, children: OrgNode[]): OrgNode[] =>
  nodes.map(n => {
    if (n.id === parentId) return { ...n, children, hasChildren: false }
    if (n.children) return { ...n, children: injectChildren(n.children, parentId, children) }
    return n
  })

const orgToggle = (id: string, open: boolean) => {
  const next = new Set(orgExpanded.value)
  open ? next.add(id) : next.delete(id)
  orgExpanded.value = next
}
const orgSelect = (ids: Set<string>) => { orgSelected.value = ids }

const orgToggleLoading = (id: string, on: boolean) => {
  const next = new Set(orgLoading.value)
  on ? next.add(id) : next.delete(id)
  orgLoading.value = next
}

const orgLoad = (id: string) => {
  orgToggleLoading(id, true)
  setTimeout(() => {
    orgNodes.value = injectChildren(orgNodes.value, id, ORG_CHILDREN[id] ?? [])
    orgToggleLoading(id, false)
  }, 800)
}
</script>

<template>
  <div>
    <div class="d-flex align-start justify-space-between gap-4 mb-1">
      <h1 class="text-h5 font-weight-bold">Tree View</h1>
      <v-btn icon="mdi-information-outline" variant="text" size="small" @click="infoOpen = true" />
    </div>
    <p class="text-body-2 text-medium-emphasis mb-5">
      Generic recursive tree with expand/collapse, single and multi-select, checkboxes, inline search,
      lazy async loading, drag-to-reorder, and a custom slot for per-node actions.
    </p>

    <!-- Use-cases dialog -->
    <v-dialog v-model="infoOpen" max-width="560" scrollable>
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center justify-space-between pt-5 px-6 pb-2">
          <span class="text-h6">Use cases &amp; project fit</span>
          <v-btn icon="mdi-close" variant="text" size="small" @click="infoOpen = false" />
        </v-card-title>
        <v-card-subtitle class="px-6 pb-3 text-wrap">
          Any data with a parent–child relationship can be rendered and navigated with this component.
        </v-card-subtitle>
        <v-divider />
        <v-card-text class="px-4 py-4">
          <div v-for="group in USECASES" :key="group.context" class="tv-uc-group">
            <div class="tv-uc-group-header">
              <v-icon :icon="group.icon" :color="group.color" size="16" />
              <span class="tv-uc-group-title">{{ group.context }}</span>
            </div>
            <ul class="tv-uc-list">
              <li v-for="item in group.items" :key="item.label">
                <span class="tv-uc-label">{{ item.label }}</span>
                <span class="tv-uc-detail">{{ item.detail }}</span>
              </li>
            </ul>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-tabs v-model="tab" density="compact" class="mb-5">
      <v-tab value="filesystem">
        <v-icon start icon="mdi-folder-outline" size="16" />
        File System
      </v-tab>
      <v-tab value="tasks">
        <v-icon start icon="mdi-checkbox-marked-circle-outline" size="16" />
        Task Hierarchy
      </v-tab>
      <v-tab value="permissions">
        <v-icon start icon="mdi-shield-outline" size="16" />
        Permissions
      </v-tab>
      <v-tab value="org">
        <v-icon start icon="mdi-account-group-outline" size="16" />
        Org Chart (lazy)
      </v-tab>
    </v-tabs>

    <v-window v-model="tab">

      <!-- ── File system ────────────────────────────────────────────────────── -->
      <v-window-item value="filesystem">
        <p class="text-caption text-medium-emphasis mb-4">
          Single-select with file-type icons. Type in the search box to filter — matching text is highlighted,
          ancestor folders stay visible. Keyboard: arrows expand/collapse, Enter selects.
        </p>
        <div class="tv-demo-wrap">
          <div class="tv-demo-panel">
            <v-text-field
              v-model="fsFilter"
              placeholder="Filter files…"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              class="mb-3"
            />
            <div class="tv-scroll">
              <CommonTreeView
                :nodes="fsNodes"
                :expanded="fsExpanded"
                :selected="fsSelected"
                :filter="fsFilter"
                @toggle="fsToggle"
                @select="fsSelect"
              />
            </div>
          </div>
          <div class="tv-demo-detail">
            <template v-if="fsSelected.size">
              <p class="text-overline text-medium-emphasis mb-2">Selected</p>
              <v-chip
                v-for="id in fsSelected"
                :key="id"
                size="small"
                variant="tonal"
                color="primary"
                class="mr-1 mb-1"
              >{{ id }}</v-chip>
            </template>
            <p v-else class="text-body-2 text-medium-emphasis">Click a file to select it.</p>
          </div>
        </div>
      </v-window-item>

      <!-- ── Task hierarchy ─────────────────────────────────────────────────── -->
      <v-window-item value="tasks">
        <p class="text-caption text-medium-emphasis mb-4">
          Multi-select with Ctrl/Cmd+click. Badges show task counts per phase.
          Completed tasks shown with a green check icon; pending with a grey circle.
        </p>
        <div class="tv-demo-wrap">
          <div class="tv-demo-panel">
            <v-text-field
              v-model="taskFilter"
              placeholder="Filter tasks…"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              class="mb-3"
            />
            <div class="tv-scroll">
              <CommonTreeView
                :nodes="taskNodes"
                :expanded="taskExpanded"
                :selected="taskSelected"
                :filter="taskFilter"
                :multi-select="true"
                @toggle="taskToggle"
                @select="taskSelect"
              />
            </div>
          </div>
          <div class="tv-demo-detail">
            <p class="text-overline text-medium-emphasis mb-2">Selected ({{ taskSelected.size }})</p>
            <v-chip
              v-for="id in taskSelected"
              :key="id"
              size="small"
              variant="tonal"
              color="primary"
              class="mr-1 mb-1"
            >{{ id }}</v-chip>
            <p v-if="!taskSelected.size" class="text-body-2 text-medium-emphasis">Ctrl+click to select multiple.</p>
          </div>
        </div>
      </v-window-item>

      <!-- ── Permissions ────────────────────────────────────────────────────── -->
      <v-window-item value="permissions">
        <p class="text-caption text-medium-emphasis mb-4">
          Checkbox multi-select — ideal for role/permission editors. The "Audit log" permission
          is disabled to show a locked state. Filter to find a specific permission quickly.
        </p>
        <div class="tv-demo-wrap">
          <div class="tv-demo-panel">
            <v-text-field
              v-model="permFilter"
              placeholder="Filter permissions…"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              class="mb-3"
            />
            <div class="tv-scroll">
              <CommonTreeView
                :nodes="permNodes"
                :expanded="permExpanded"
                :selected="permSelected"
                :filter="permFilter"
                :multi-select="true"
                :checkboxes="true"
                @toggle="permToggle"
                @select="permSelect"
              />
            </div>
          </div>
          <div class="tv-demo-detail">
            <p class="text-overline text-medium-emphasis mb-2">Granted ({{ permSelected.size }})</p>
            <div class="tv-perm-chips">
              <v-chip
                v-for="id in permSelected"
                :key="id"
                size="x-small"
                variant="tonal"
                color="success"
                class="mr-1 mb-1"
              >{{ id }}</v-chip>
            </div>
          </div>
        </div>
      </v-window-item>

      <!-- ── Lazy org chart ─────────────────────────────────────────────────── -->
      <v-window-item value="org">
        <p class="text-caption text-medium-emphasis mb-4">
          Async lazy loading — children are fetched on first expand (simulated 800ms delay).
          A spinner appears on the node while loading. Expand the CEO to load the executive team,
          then expand further to load their reports.
        </p>
        <div class="tv-demo-wrap">
          <div class="tv-demo-panel">
            <div class="tv-scroll">
              <CommonTreeView
                :nodes="orgNodes"
                :expanded="orgExpanded"
                :selected="orgSelected"
                :loading="orgLoading"
                @toggle="orgToggle"
                @select="orgSelect"
                @load="orgLoad"
              />
            </div>
          </div>
          <div class="tv-demo-detail">
            <template v-if="orgSelected.size">
              <p class="text-overline text-medium-emphasis mb-2">Selected</p>
              <v-chip
                v-for="id in orgSelected"
                :key="id"
                size="small"
                variant="tonal"
                color="primary"
                class="mr-1 mb-1"
              >{{ id }}</v-chip>
            </template>
            <p v-else class="text-body-2 text-medium-emphasis">
              Click a person to select them.<br>
              Expand nodes to lazy-load their reports.
            </p>
          </div>
        </div>
      </v-window-item>

    </v-window>
  </div>
</template>

<style scoped>
.tv-demo-wrap {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
.tv-demo-panel {
  flex: 1;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 12px;
  padding: 12px;
  background: rgb(var(--v-theme-surface));
  min-width: 0;
}
.tv-scroll {
  max-height: 380px;
  overflow-y: auto;
}
.tv-demo-detail {
  width: 220px;
  flex-shrink: 0;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 12px;
  padding: 14px;
  background: rgb(var(--v-theme-surface));
}
.tv-perm-chips { display: flex; flex-wrap: wrap; }

/* Use-cases dialog */
.tv-uc-group { margin-bottom: 20px; }
.tv-uc-group:last-child { margin-bottom: 0; }
.tv-uc-group-header { display: flex; align-items: center; gap: 7px; margin-bottom: 8px; padding: 0 4px; }
.tv-uc-group-title { font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: rgba(var(--v-theme-on-surface), .55); }
.tv-uc-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 2px; }
.tv-uc-list li { display: flex; flex-direction: column; gap: 1px; padding: 7px 10px 7px 16px; border-radius: 8px; background: rgba(var(--v-theme-on-surface), .03); border-left: 2px solid rgba(var(--v-theme-on-surface), .08); }
.tv-uc-label { font-size: 12px; font-weight: 600; color: rgb(var(--v-theme-on-surface)); line-height: 1.4; }
.tv-uc-detail { font-size: 11px; color: rgba(var(--v-theme-on-surface), .5); line-height: 1.5; }
</style>
