<script setup lang="ts">
definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Sortable List', disabled: true },
  ],
})

// ── 1. Simple list ────────────────────────────────────────────────────────────
const simpleItems = ref([
  { id: 1, label: 'First item' },
  { id: 2, label: 'Second item' },
  { id: 3, label: 'Third item' },
  { id: 4, label: 'Fourth item' },
  { id: 5, label: 'Fifth item' },
])

// ── 2. Rich cards ─────────────────────────────────────────────────────────────
const cards = ref([
  { id: 'a', title: 'Design system', description: 'Define tokens, typography and spacing.', icon: 'mdi-palette-outline', color: 'primary', priority: 'High' },
  { id: 'b', title: 'API integration', description: 'Wire up REST endpoints to the store.', icon: 'mdi-api', color: 'info', priority: 'Medium' },
  { id: 'c', title: 'Auth flow', description: 'Login, register and refresh token logic.', icon: 'mdi-lock-outline', color: 'success', priority: 'High' },
  { id: 'd', title: 'Dashboard', description: 'Build stats cards and data tables.', icon: 'mdi-view-dashboard-outline', color: 'warning', priority: 'Low' },
  { id: 'e', title: 'Deploy pipeline', description: 'Set up CI/CD and environment configs.', icon: 'mdi-rocket-launch-outline', color: 'error', priority: 'Medium' },
])

const priorityColor: Record<string, string> = {
  High: 'error',
  Medium: 'warning',
  Low: 'success',
}

// ── 3. To-do list with whole-row drag ─────────────────────────────────────────
const todos = ref([
  { id: 10, text: 'Review pull requests', done: false },
  { id: 11, text: 'Update dependencies', done: true },
  { id: 12, text: 'Write unit tests', done: false },
  { id: 13, text: 'Fix accessibility issues', done: false },
  { id: 14, text: 'Publish release notes', done: true },
])

const lastChange = ref<string | null>(null)

const onSimpleChange = (from: number, to: number) => {
  lastChange.value = `Moved item from position ${from + 1} → ${to + 1}`
}
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">Sortable List</h1>
    <p class="text-body-2 text-medium-emphasis mb-8">
      Drag-and-drop reordering using the HTML5 Drag and Drop API — no extra packages.
      Supports a drag handle or whole-row dragging, with a live drop-indicator line.
    </p>

    <!-- 1. Simple list -->
    <h2 class="text-overline text-medium-emphasis mb-4">Simple list — drag handle</h2>
    <v-card rounded="lg" class="mb-2">
      <v-list class="pa-2">
        <CommonDragList v-model="simpleItems" item-key="id" @change="onSimpleChange">
          <template #default="{ item }">
            <v-list-item rounded="lg" class="py-1">
              <v-list-item-title>{{ item.label }}</v-list-item-title>
            </v-list-item>
          </template>
        </CommonDragList>
      </v-list>
    </v-card>
    <p v-if="lastChange" class="text-caption text-medium-emphasis mb-6 px-1">
      <v-icon icon="mdi-information-outline" size="14" class="mr-1" />{{ lastChange }}
    </p>
    <div v-else class="mb-6" />

    <!-- 2. Rich cards -->
    <h2 class="text-overline text-medium-emphasis mb-4">Rich cards — drag handle</h2>
    <v-card rounded="lg" class="mb-6 pa-3">
      <CommonDragList v-model="cards" item-key="id">
        <template #default="{ item }">
          <div class="rounded-lg border mb-2 pa-3 d-flex align-center ga-3 w-100" style="border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));">
            <div
              class="rounded-lg d-flex align-center justify-center flex-shrink-0"
              :class="`bg-${item.color}-lighten-5 text-${item.color}`"
              style="width:40px;height:40px;"
            >
              <v-icon :icon="item.icon" size="20" />
            </div>
            <div class="flex-1" style="min-width:0;">
              <p class="text-body-2 font-weight-medium mb-0">{{ item.title }}</p>
              <p class="text-caption text-medium-emphasis mb-0">{{ item.description }}</p>
            </div>
            <span
              class="text-caption font-weight-medium px-2 py-1 rounded"
              :class="`bg-${priorityColor[item.priority]}-lighten-5 text-${priorityColor[item.priority]}`"
            >{{ item.priority }}</span>
          </div>
        </template>
      </CommonDragList>
    </v-card>

    <!-- 3. To-do with whole-row drag -->
    <h2 class="text-overline text-medium-emphasis mb-4">To-do list — whole row draggable</h2>
    <v-card rounded="lg" class="mb-6 pa-2">
      <CommonDragList v-model="todos" item-key="id" :handle="false">
        <template #default="{ item, index }">
          <div class="w-100">
            <div class="d-flex align-center px-3 py-2 w-100" style="cursor: grab; min-height: 48px;">
              <v-checkbox-btn v-model="item.done" color="primary" class="mr-2 flex-shrink-0" density="compact" />
              <span
                class="text-body-2 flex-1"
                :class="item.done ? 'text-decoration-line-through text-medium-emphasis' : ''"
              >{{ item.text }}</span>
              <v-icon icon="mdi-drag" size="16" class="text-medium-emphasis flex-shrink-0" />
            </div>
            <v-divider v-if="index < todos.length - 1" />
          </div>
        </template>
      </CommonDragList>
      <div class="px-3 pb-2">
        <p class="text-caption text-medium-emphasis mb-0">
          {{ todos.filter(t => t.done).length }} of {{ todos.length }} completed
        </p>
      </div>
    </v-card>

    <!-- Usage -->
    <h2 class="text-overline text-medium-emphasis mb-4">Usage</h2>
    <v-card rounded="lg" class="pa-5">
      <v-sheet rounded="lg" color="surface-variant" class="pa-4">
        <pre v-pre class="text-body-2"><code>&lt;CommonDragList
  v-model="items"
  item-key="id"
  :handle="true"
  @change="(from, to) => console.log(from, to)"
&gt;
  &lt;template #default="{ item, index }"&gt;
    &lt;div&gt;{{ item.label }}&lt;/div&gt;
  &lt;/template&gt;
&lt;/CommonDragList&gt;</code></pre>
      </v-sheet>
      <v-table class="mt-4" density="compact">
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>Default</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>v-model</code></td><td><code>T[]</code></td><td>—</td><td>Array of items (must each have a unique id field)</td></tr>
          <tr><td><code>item-key</code></td><td><code>keyof T</code></td><td><code>'id'</code></td><td>Field used as the unique key</td></tr>
          <tr><td><code>handle</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Show a drag handle icon; false makes the whole row draggable</td></tr>
          <tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td><td>Disables all drag interactions</td></tr>
        </tbody>
      </v-table>
      <p class="text-caption text-medium-emphasis mt-3">
        Slot: <code>#default="{ item, index }"</code> — render any content inside each row.
        The <code>@change</code> event emits <code>(from: number, to: number)</code> after each drop.
      </p>
    </v-card>
  </div>
</template>
