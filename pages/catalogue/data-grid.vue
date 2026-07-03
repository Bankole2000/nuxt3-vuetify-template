<script setup lang="ts">
import type { GridColumn, GridRow } from '~/components/common/DataGrid.vue'

definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Data Grid', disabled: true },
  ],
})

const toast = useToast()

const columns: GridColumn[] = [
  { key: 'name', title: 'Name', editable: true, type: 'text', width: 180 },
  { key: 'role', title: 'Role', editable: true, type: 'select', options: ['Admin', 'Editor', 'Viewer'], width: 120 },
  { key: 'email', title: 'Email', editable: true, type: 'text', width: 220 },
  { key: 'department', title: 'Department', editable: true, type: 'text', width: 160 },
  { key: 'score', title: 'Score', editable: true, type: 'number', width: 90 },
]

const rows = ref<GridRow[]>([
  { id: 1, name: 'Alice Martin', role: 'Admin', email: 'alice@example.com', department: 'Engineering', score: 94 },
  { id: 2, name: 'Bob Chen', role: 'Editor', email: 'bob@example.com', department: 'Design', score: 87 },
  { id: 3, name: 'Carol White', role: 'Viewer', email: 'carol@example.com', department: 'Marketing', score: 76 },
  { id: 4, name: 'David Kim', role: 'Editor', email: 'david@example.com', department: 'Sales', score: 82 },
  { id: 5, name: 'Eva Rossi', role: 'Admin', email: 'eva@example.com', department: 'Engineering', score: 91 },
  { id: 6, name: 'Frank Osei', role: 'Viewer', email: 'frank@example.com', department: 'Support', score: 68 },
])

const onRowDelete = (ids: (string | number)[]) => {
  toast.info(`Deleted ${ids.length} row${ids.length > 1 ? 's' : ''}.`)
}
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">Data Grid</h1>
    <p class="text-body-2 text-medium-emphasis mb-8">
      Inline-editable table with row selection, column types and delete. Double-click any editable cell to edit.
    </p>

    <!-- Editable grid -->
    <h2 class="text-overline text-medium-emphasis mb-4">Editable data grid</h2>
    <v-card rounded="lg" class="mb-6 pa-4">
      <p class="text-caption text-medium-emphasis mb-4">
        <v-icon icon="mdi-pencil-outline" size="14" /> Double-click an editable cell to edit inline.
        Press <kbd>Enter</kbd> to confirm or <kbd>Esc</kbd> to cancel.
      </p>
      <CommonDataGrid
        v-model:rows="rows"
        :columns="columns"
        selectable
        @row-delete="onRowDelete"
      />
    </v-card>

    <!-- Live preview -->
    <h2 class="text-overline text-medium-emphasis mb-4">Current data</h2>
    <v-card rounded="lg" class="mb-6 pa-4">
      <pre class="text-caption" style="overflow-x: auto;">{{ JSON.stringify(rows, null, 2) }}</pre>
    </v-card>

    <!-- Usage -->
    <h2 class="text-overline text-medium-emphasis mb-4">Usage</h2>
    <v-card rounded="lg" class="pa-6">
      <v-sheet rounded="lg" color="surface-variant" class="pa-4 mb-4">
        <pre class="text-body-2"><code v-pre>&lt;CommonDataGrid
  v-model:rows="rows"
  :columns="columns"
  selectable
  @row-delete="onDelete"
/&gt;</code></pre>
      </v-sheet>
      <p class="text-body-2 font-weight-bold mb-2">Column definition</p>
      <v-table density="compact">
        <thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>key</code></td><td>string</td><td>Row data key</td></tr>
          <tr><td><code>title</code></td><td>string</td><td>Column header label</td></tr>
          <tr><td><code>editable</code></td><td>boolean</td><td>Enable inline editing</td></tr>
          <tr><td><code>type</code></td><td>text | number | select</td><td>Input type when editing</td></tr>
          <tr><td><code>options</code></td><td>string[]</td><td>Dropdown options (type=select)</td></tr>
          <tr><td><code>width</code></td><td>number</td><td>Column width in px</td></tr>
        </tbody>
      </v-table>
    </v-card>
  </div>
</template>
