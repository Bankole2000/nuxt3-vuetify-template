<script setup lang="ts">
definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Data Export', disabled: true },
  ],
})

const { exportCSV, exportJSON } = useDataExport()
const toast = useToast()

const data = [
  { id: 1, name: 'Alice Martin', email: 'alice@example.com', role: 'Admin', status: 'Active', joined: '2024-01-12' },
  { id: 2, name: 'Bob Chen', email: 'bob@example.com', role: 'Editor', status: 'Active', joined: '2024-02-03' },
  { id: 3, name: 'Carol White', email: 'carol@example.com', role: 'Viewer', status: 'Inactive', joined: '2024-03-18' },
  { id: 4, name: 'David Kim', email: 'david@example.com', role: 'Editor', status: 'Active', joined: '2024-04-05' },
  { id: 5, name: 'Eve Johnson', email: 'eve@example.com', role: 'Viewer', status: 'Pending', joined: '2024-05-22' },
]

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Role', key: 'role' },
  { title: 'Status', key: 'status' },
  { title: 'Joined', key: 'joined' },
]

const onExportCSV = () => {
  exportCSV(data, 'users.csv')
  toast.success('CSV downloaded')
}

const onExportJSON = () => {
  exportJSON(data, 'users.json')
  toast.success('JSON downloaded')
}
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">Data Export</h1>
    <p class="text-body-2 text-medium-emphasis mb-8">
      Export any array to CSV or JSON using <code>useDataExport</code> — no packages, just Blob + URL.createObjectURL.
    </p>

    <v-card rounded="lg" class="mb-6">
      <v-card-title class="pa-5 pb-0 d-flex align-center justify-space-between">
        <span class="text-body-1 font-weight-bold">Users</span>
        <div class="d-flex gap-2">
          <v-btn size="small" variant="tonal" prepend-icon="mdi-file-delimited-outline" @click="onExportCSV">
            Export CSV
          </v-btn>
          <v-btn size="small" variant="tonal" prepend-icon="mdi-code-json" @click="onExportJSON">
            Export JSON
          </v-btn>
        </div>
      </v-card-title>
      <v-data-table :headers="headers" :items="data" :items-per-page="5" hide-default-footer class="pa-2" />
    </v-card>

    <h2 class="text-overline text-medium-emphasis mb-4">Usage</h2>
    <v-card rounded="lg" class="pa-5">
      <v-sheet rounded="lg" color="surface-variant" class="pa-4">
        <pre v-pre class="text-body-2"><code>const { exportCSV, exportJSON } = useDataExport()

// Export array of objects as CSV
exportCSV(rows, 'report.csv')

// Export anything as formatted JSON
exportJSON({ users: rows, total: rows.length }, 'data.json')</code></pre>
      </v-sheet>
      <p class="text-caption text-medium-emphasis mt-3">
        CSV values containing commas, quotes or newlines are automatically escaped per RFC 4180.
      </p>
    </v-card>
  </div>
</template>
