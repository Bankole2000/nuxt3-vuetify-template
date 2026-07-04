<script setup lang="ts">
import type { ImportColumn, ImportResult } from '~/components/common/DataImport.vue'

definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Data Import', disabled: true },
  ],
})

useSeo({
  title: 'Data Import',
  description: 'Three-step CSV/JSON import wizard with drag-and-drop, column mapping, type validation and error reporting.',
})

const toast = useToast()
const tab = ref('contacts')
const importKey = ref(0)
const showInfo = ref(false)

const importedRows = ref<Record<string, unknown>[]>([])
const importedHeaders = ref<{ title: string; key: string }[]>([])

const contactColumns: ImportColumn[] = [
  { key: 'name',    label: 'Name',    type: 'string',  required: true },
  { key: 'email',   label: 'Email',   type: 'string',  required: true },
  { key: 'phone',   label: 'Phone',   type: 'string' },
  { key: 'company', label: 'Company', type: 'string' },
  { key: 'tags',    label: 'Tags',    type: 'string' },
]

const transactionColumns: ImportColumn[] = [
  { key: 'date',        label: 'Date',        type: 'date',   required: true },
  { key: 'description', label: 'Description', type: 'string', required: true },
  { key: 'amount',      label: 'Amount',      type: 'number', required: true },
  { key: 'category',    label: 'Category',    type: 'string' },
  { key: 'type',        label: 'Type',        type: 'string' },
]

const inventoryColumns: ImportColumn[] = [
  { key: 'sku',      label: 'SKU',      type: 'string',  required: true },
  { key: 'name',     label: 'Name',     type: 'string',  required: true },
  { key: 'quantity', label: 'Quantity', type: 'number',  required: true },
  { key: 'price',    label: 'Price',    type: 'number',  required: true },
  { key: 'active',   label: 'Active',   type: 'boolean' },
]

const activeColumns = computed<ImportColumn[]>(() => {
  if (tab.value === 'contacts')     return contactColumns
  if (tab.value === 'transactions') return transactionColumns
  return inventoryColumns
})

const sampleCSVs: Record<string, string> = {
  contacts: [
    'name,email,phone,company,tags',
    'Alice Martin,alice@example.com,+1-555-0100,Acme Corp,"design,ux"',
    'Bob Chen,bob@example.com,+1-555-0101,Beta Ltd,engineering',
    'Carol White,carol@example.com,,Gamma Inc,"hr,admin"',
    'David Kim,david@example.com,+1-555-0103,Delta Co,sales',
    'Eve Johnson,eve@example.com,+1-555-0104,Epsilon LLC,"marketing,social"',
  ].join('\n'),

  transactions: [
    'date,description,amount,category,type',
    '2024-01-05,Office Supplies,-84.50,Operations,expense',
    '2024-01-10,Client Payment,2500.00,Revenue,income',
    '2024-01-15,Software Subscription,-49.99,Software,expense',
    '2024-01-20,Consulting Fee,1200.00,Revenue,income',
    '2024-01-25,Team Lunch,-127.80,Meals,expense',
  ].join('\n'),

  inventory: [
    'sku,name,quantity,price,active',
    'WDG-001,Widget Alpha,250,12.99,true',
    'WDG-002,Widget Beta,180,15.49,true',
    'GAD-010,Gadget Pro,75,89.00,true',
    'GAD-011,Gadget Lite,320,45.00,false',
    'ACC-100,Accessory Kit,500,7.99,true',
  ].join('\n'),
}

const downloadSampleCSV = () => {
  const csv = sampleCSVs[tab.value] ?? ''
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `sample-${tab.value}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const onImport = (result: ImportResult) => {
  importedRows.value = result.rows.slice(0, 10)
  importedHeaders.value = activeColumns.value.map(c => ({ title: c.label, key: c.key }))
  toast.success(`Imported ${result.rows.length} row${result.rows.length !== 1 ? 's' : ''}`)
  importKey.value++
}

const onCancel = () => {
  importKey.value++
}

const onTabChange = () => {
  importedRows.value = []
  importedHeaders.value = []
  importKey.value++
}
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-1">
      <h1 class="text-h5 font-weight-bold">Data Import</h1>
      <v-btn
        icon="mdi-information-outline"
        variant="text"
        size="small"
        @click="showInfo = true"
      />
    </div>
    <p class="text-body-2 text-medium-emphasis mb-6">
      Three-step CSV/JSON import wizard — drag-and-drop upload, column mapping with auto-detection, and per-row type validation.
    </p>

    <v-tabs v-model="tab" class="mb-6" @update:model-value="onTabChange">
      <v-tab value="contacts" prepend-icon="mdi-account-multiple-outline">Contacts</v-tab>
      <v-tab value="transactions" prepend-icon="mdi-bank-transfer">Transactions</v-tab>
      <v-tab value="inventory" prepend-icon="mdi-package-variant-closed">Inventory</v-tab>
    </v-tabs>

    <v-card rounded="lg" class="mb-6">
      <v-card-title class="pa-5 pb-2 d-flex align-center justify-space-between">
        <span class="text-body-1 font-weight-bold">
          Import
          <span v-if="tab === 'contacts'">Contacts</span>
          <span v-else-if="tab === 'transactions'">Transactions</span>
          <span v-else>Inventory</span>
        </span>
        <v-btn
          size="small"
          variant="tonal"
          prepend-icon="mdi-download-outline"
          @click="downloadSampleCSV"
        >
          Download sample CSV
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-5 pt-2">
        <CommonDataImport
          :key="importKey"
          :columns="activeColumns"
          @import="onImport"
          @cancel="onCancel"
        />
      </v-card-text>
    </v-card>

    <div v-if="importedRows.length">
      <h2 class="text-overline text-medium-emphasis mb-3">Imported Rows (first 10)</h2>
      <v-card rounded="lg">
        <v-data-table
          :headers="importedHeaders"
          :items="importedRows"
          :items-per-page="10"
          hide-default-footer
          class="pa-2"
        />
      </v-card>
    </div>

    <v-dialog v-model="showInfo" max-width="560">
      <v-card rounded="xl">
        <v-card-title class="pa-6 pb-2 d-flex align-center justify-space-between">
          <span class="text-h6">About Data Import</span>
          <v-btn icon="mdi-close" variant="text" size="small" @click="showInfo = false" />
        </v-card-title>
        <v-card-text class="pa-6 pt-2">
          <p class="text-body-2 mb-4">
            A reusable three-step wizard for importing structured data from CSV or JSON files — no external parse libraries.
          </p>
          <p class="text-overline text-medium-emphasis mb-2">Use Cases</p>
          <v-list density="compact" class="pa-0">
            <v-list-item prepend-icon="mdi-currency-usd" class="px-0">
              <p class="text-body-2"><strong>Expense Tracker (#5)</strong> — bulk-import transactions from bank CSV exports</p>
            </v-list-item>
            <v-list-item prepend-icon="mdi-chart-line" class="px-0">
              <p class="text-body-2"><strong>Portfolio Manager (#1)</strong> — load historical prices or holdings from broker CSV</p>
            </v-list-item>
            <v-list-item prepend-icon="mdi-hospital-box-outline" class="px-0">
              <p class="text-body-2"><strong>HEAM (#9)</strong> — import patient or appointment records from legacy systems</p>
            </v-list-item>
            <v-list-item prepend-icon="mdi-database-import-outline" class="px-0">
              <p class="text-body-2"><strong>General migration</strong> — onboard data from spreadsheets, CRMs, ERPs, or any CSV/JSON export</p>
            </v-list-item>
          </v-list>
          <v-divider class="my-4" />
          <p class="text-overline text-medium-emphasis mb-2">Features</p>
          <v-list density="compact" class="pa-0">
            <v-list-item v-for="feature in [
              'Drag-and-drop or click-to-browse upload',
              'Hand-rolled CSV parser (handles quoted fields and embedded commas)',
              'JSON array or { data: [...] } format',
              'Auto-maps columns by name (case-insensitive)',
              '3-row preview with current mapping',
              'Per-row type coercion: string, number, date, boolean',
              'Required field validation',
              'Skip-errors toggle or abort-on-errors mode',
            ]" :key="feature" prepend-icon="mdi-check" class="px-0">
              <p class="text-body-2">{{ feature }}</p>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn color="primary" variant="tonal" @click="showInfo = false">Got it</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
