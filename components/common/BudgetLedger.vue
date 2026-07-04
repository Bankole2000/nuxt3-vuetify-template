<script setup lang="ts">
// Budget / expense ledger.
// Displays a categorised list of transactions (income + expenses) with
// a running balance column, summary totals, and a donut breakdown chart.
// All mutations are handled via emits — parent owns the data.

// ─── Public types ─────────────────────────────────────────────────────────────

export interface Transaction {
  id:          string
  date:        string        // 'YYYY-MM-DD'
  description: string
  category:    string
  type:        'income' | 'expense'
  amount:      number        // always positive
}

export interface BudgetCategory {
  name:  string
  color: string
  icon?: string
}

// ─── Props / emits ────────────────────────────────────────────────────────────

const props = withDefaults(defineProps<{
  transactions:  Transaction[]
  categories:    BudgetCategory[]
  currency?:     string    // e.g. '£', '$', '€'
  title?:        string
  readonly?:     boolean
}>(), {
  currency: '£',
  title:    'Budget',
  readonly: false,
})

const emit = defineEmits<{
  'add':    [tx: Omit<Transaction, 'id'>]
  'delete': [id: string]
}>()

// ─── Filters / sort ───────────────────────────────────────────────────────────

const filterType     = ref<'all' | 'income' | 'expense'>('all')
const filterCategory = ref<string>('all')
const sortKey        = ref<'date' | 'amount'>('date')
const sortDir        = ref<1 | -1>(1)
const search         = ref('')

const toggleSort = (key: 'date' | 'amount') => {
  if (sortKey.value === key) sortDir.value = sortDir.value === 1 ? -1 : 1
  else { sortKey.value = key; sortDir.value = 1 }
}

const filtered = computed(() => {
  let rows = [...props.transactions]
  if (filterType.value !== 'all') rows = rows.filter(t => t.type === filterType.value)
  if (filterCategory.value !== 'all') rows = rows.filter(t => t.category === filterCategory.value)
  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase()
    rows = rows.filter(t => t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q))
  }
  rows.sort((a, b) => {
    if (sortKey.value === 'date') return sortDir.value * a.date.localeCompare(b.date)
    return sortDir.value * (a.amount - b.amount)
  })
  return rows
})

// Running balance (always over full unfiltered set, sorted by date)
const runningBalances = computed(() => {
  const sorted = [...props.transactions].sort((a, b) => a.date.localeCompare(b.date))
  let bal = 0
  const map = new Map<string, number>()
  for (const tx of sorted) {
    bal += tx.type === 'income' ? tx.amount : -tx.amount
    map.set(tx.id, bal)
  }
  return map
})

// ─── Totals ───────────────────────────────────────────────────────────────────

const totalIncome  = computed(() => props.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0))
const totalExpense = computed(() => props.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0))
const netBalance   = computed(() => totalIncome.value - totalExpense.value)

// ─── Donut chart data ─────────────────────────────────────────────────────────

const chartData = computed(() => {
  const byCategory: Record<string, number> = {}
  for (const tx of props.transactions.filter(t => t.type === 'expense')) {
    byCategory[tx.category] = (byCategory[tx.category] ?? 0) + tx.amount
  }
  const labels  = Object.keys(byCategory)
  const amounts = labels.map(l => byCategory[l]!)
  const colors  = labels.map(l => props.categories.find(c => c.name === l)?.color ?? '#94a3b8')
  return {
    labels,
    datasets: [{ data: amounts, backgroundColor: colors, borderWidth: 0, hoverOffset: 6 }],
  }
})

const chartOptions = {
  plugins: { legend: { display: false } },
  cutout: '72%',
}

// ─── Add dialog ───────────────────────────────────────────────────────────────

const addOpen    = ref(false)
const newType    = ref<'income' | 'expense'>('expense')
const newDate    = ref(new Date().toISOString().slice(0, 10))
const newDesc    = ref('')
const newCat     = ref('')
const newAmount  = ref<number | null>(null)

const openAdd = (type: 'income' | 'expense' = 'expense') => {
  newType.value   = type
  newDate.value   = new Date().toISOString().slice(0, 10)
  newDesc.value   = ''
  newCat.value    = props.categories[0]?.name ?? ''
  newAmount.value = null
  addOpen.value   = true
}

const confirmAdd = () => {
  if (!newDesc.value.trim() || !newAmount.value || newAmount.value <= 0) return
  emit('add', {
    date:        newDate.value,
    description: newDesc.value.trim(),
    category:    newCat.value,
    type:        newType.value,
    amount:      newAmount.value,
  })
  addOpen.value = false
}

// ─── Format helpers ───────────────────────────────────────────────────────────

const fmt = (n: number) => `${props.currency}${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const fmtDate = (s: string) => new Date(s + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

const catColor = (name: string) => props.categories.find(c => c.name === name)?.color ?? '#94a3b8'
const catIcon  = (name: string) => props.categories.find(c => c.name === name)?.icon ?? 'mdi-tag-outline'

// ─── Confirm delete ───────────────────────────────────────────────────────────

const deleteId   = ref<string | null>(null)
const deleteOpen = ref(false)

const askDelete = (id: string) => { deleteId.value = id; deleteOpen.value = true }
const confirmDelete = () => {
  if (deleteId.value) emit('delete', deleteId.value)
  deleteOpen.value = false
}
</script>

<template>
  <div class="bl-root">

    <!-- ── Summary cards ─────────────────────────────────────────────────── -->
    <div class="bl-summary">
      <div class="bl-stat bl-stat--income">
        <v-icon icon="mdi-arrow-down-circle-outline" color="success" size="20" />
        <div>
          <p class="bl-stat-label">Total income</p>
          <p class="bl-stat-value text-success">{{ fmt(totalIncome) }}</p>
        </div>
      </div>
      <div class="bl-stat bl-stat--expense">
        <v-icon icon="mdi-arrow-up-circle-outline" color="error" size="20" />
        <div>
          <p class="bl-stat-label">Total expenses</p>
          <p class="bl-stat-value text-error">{{ fmt(totalExpense) }}</p>
        </div>
      </div>
      <div class="bl-stat" :class="netBalance >= 0 ? 'bl-stat--income' : 'bl-stat--expense'">
        <v-icon icon="mdi-scale-balance" :color="netBalance >= 0 ? 'success' : 'error'" size="20" />
        <div>
          <p class="bl-stat-label">Net balance</p>
          <p class="bl-stat-value" :class="netBalance >= 0 ? 'text-success' : 'text-error'">
            {{ netBalance < 0 ? '-' : '' }}{{ fmt(netBalance) }}
          </p>
        </div>
      </div>

      <!-- Donut chart -->
      <div class="bl-donut" v-if="totalExpense > 0">
        <ClientOnly>
          <CommonChart type="doughnut" :data="chartData" :options="chartOptions" :height="130" />
        </ClientOnly>
        <div class="bl-donut-legend">
          <div
            v-for="(label, i) in chartData.labels"
            :key="label as string"
            class="bl-legend-item"
          >
            <span class="bl-legend-dot" :style="{ background: (chartData.datasets[0]!.backgroundColor as string[])[i] }" />
            <span class="bl-legend-label">{{ label }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Toolbar ───────────────────────────────────────────────────────── -->
    <div class="bl-toolbar">
      <v-text-field
        v-model="search"
        placeholder="Search…"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        rounded="lg"
        hide-details
        clearable
        style="max-width:200px"
      />

      <v-btn-toggle v-model="filterType" density="compact" variant="outlined" divided mandatory>
        <v-btn value="all"     size="small">All</v-btn>
        <v-btn value="income"  size="small">Income</v-btn>
        <v-btn value="expense" size="small">Expenses</v-btn>
      </v-btn-toggle>

      <v-select
        v-model="filterCategory"
        :items="['all', ...categories.map(c => c.name)]"
        :item-title="(v: string) => v === 'all' ? 'All categories' : v"
        density="compact"
        variant="outlined"
        rounded="lg"
        hide-details
        style="max-width:170px"
      />

      <div class="ml-auto d-flex gap-2" v-if="!readonly">
        <v-btn size="small" color="success" variant="tonal" prepend-icon="mdi-plus" @click="openAdd('income')">Income</v-btn>
        <v-btn size="small" color="error"   variant="tonal" prepend-icon="mdi-minus" @click="openAdd('expense')">Expense</v-btn>
      </div>
    </div>

    <!-- ── Table ─────────────────────────────────────────────────────────── -->
    <div class="bl-table-wrap">
      <table class="bl-table">
        <thead>
          <tr>
            <th class="bl-th bl-th--date" @click="toggleSort('date')">
              Date
              <v-icon v-if="sortKey === 'date'" :icon="sortDir === 1 ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="14" />
            </th>
            <th class="bl-th">Description</th>
            <th class="bl-th">Category</th>
            <th class="bl-th bl-th--right" @click="toggleSort('amount')">
              Amount
              <v-icon v-if="sortKey === 'amount'" :icon="sortDir === 1 ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="14" />
            </th>
            <th class="bl-th bl-th--right">Balance</th>
            <th v-if="!readonly" class="bl-th bl-th--action" />
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="tx in filtered"
            :key="tx.id"
            class="bl-tr"
            :class="tx.type === 'income' ? 'bl-tr--income' : 'bl-tr--expense'"
          >
            <td class="bl-td bl-td--date">{{ fmtDate(tx.date) }}</td>
            <td class="bl-td">
              <span class="bl-desc">{{ tx.description }}</span>
            </td>
            <td class="bl-td">
              <div class="bl-cat-chip" :style="{ '--cat-color': catColor(tx.category) }">
                <v-icon :icon="catIcon(tx.category)" size="12" />
                {{ tx.category }}
              </div>
            </td>
            <td class="bl-td bl-td--right">
              <span :class="tx.type === 'income' ? 'bl-amount--income' : 'bl-amount--expense'">
                {{ tx.type === 'income' ? '+' : '−' }}{{ fmt(tx.amount) }}
              </span>
            </td>
            <td class="bl-td bl-td--right bl-td--balance">
              <span :class="(runningBalances.get(tx.id) ?? 0) >= 0 ? 'text-success' : 'text-error'">
                {{ fmt(runningBalances.get(tx.id) ?? 0) }}
              </span>
            </td>
            <td v-if="!readonly" class="bl-td bl-td--action">
              <v-btn icon="mdi-delete-outline" size="x-small" variant="text" color="error" @click="askDelete(tx.id)" />
            </td>
          </tr>
          <tr v-if="!filtered.length">
            <td :colspan="readonly ? 5 : 6" class="bl-empty">No transactions match the current filter.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ── Add dialog ─────────────────────────────────────────────────────── -->
    <v-dialog v-model="addOpen" max-width="400">
      <v-card rounded="xl">
        <v-card-title class="pt-5 px-5 pb-2 text-body-1 font-weight-bold">
          Add {{ newType }}
        </v-card-title>
        <v-card-text class="px-5 pb-2 d-flex flex-column gap-3">
          <v-btn-toggle v-model="newType" density="compact" variant="outlined" divided mandatory>
            <v-btn value="expense" size="small" color="error">Expense</v-btn>
            <v-btn value="income"  size="small" color="success">Income</v-btn>
          </v-btn-toggle>

          <v-text-field
            v-model="newDate"
            type="date"
            label="Date"
            variant="outlined"
            density="compact"
            hide-details
          />
          <v-text-field
            v-model="newDesc"
            label="Description"
            variant="outlined"
            density="compact"
            hide-details
            autofocus
          />
          <v-select
            v-model="newCat"
            :items="categories.map(c => c.name)"
            label="Category"
            variant="outlined"
            density="compact"
            hide-details
          />
          <v-text-field
            v-model.number="newAmount"
            :label="`Amount (${currency})`"
            type="number"
            min="0"
            step="0.01"
            variant="outlined"
            density="compact"
            hide-details
            @keydown.enter="confirmAdd"
          />
        </v-card-text>
        <v-card-actions class="px-5 pb-5 pt-2">
          <v-btn variant="text" size="small" @click="addOpen = false">Cancel</v-btn>
          <v-spacer />
          <v-btn
            variant="flat"
            size="small"
            :color="newType === 'income' ? 'success' : 'error'"
            :disabled="!newDesc.trim() || !newAmount || newAmount <= 0"
            @click="confirmAdd"
          >
            Add
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── Confirm delete dialog ──────────────────────────────────────────── -->
    <v-dialog v-model="deleteOpen" max-width="320">
      <v-card rounded="xl">
        <v-card-text class="pt-5 px-5 pb-2">
          <p class="text-body-2">Delete this transaction? This cannot be undone.</p>
        </v-card-text>
        <v-card-actions class="px-5 pb-5 pt-2">
          <v-btn variant="text" size="small" @click="deleteOpen = false">Cancel</v-btn>
          <v-spacer />
          <v-btn variant="flat" color="error" size="small" @click="confirmDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<style scoped>
.bl-root {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 12px;
  overflow: hidden;
  background: rgb(var(--v-theme-surface));
}

/* Summary row */
.bl-summary {
  display: flex;
  align-items: center;
  gap: 0;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  flex-wrap: wrap;
}
.bl-stat {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  flex: 1;
  min-width: 140px;
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.bl-stat:last-child { border-right: none; }
.bl-stat--income { background: rgba(var(--v-theme-success), .04); }
.bl-stat--expense { background: rgba(var(--v-theme-error), .04); }
.bl-stat-label {
  font-size: 11px;
  color: rgba(var(--v-theme-on-surface), .5);
  font-weight: 600;
  letter-spacing: .04em;
  text-transform: uppercase;
  margin: 0;
  line-height: 1.3;
}
.bl-stat-value {
  font-size: 18px;
  font-weight: 800;
  margin: 0;
  line-height: 1.3;
  letter-spacing: -.01em;
}

/* Donut */
.bl-donut {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  flex: 0 0 auto;
  border-left: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.bl-donut-legend {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.bl-legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.bl-legend-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.bl-legend-label {
  font-size: 11px;
  color: rgba(var(--v-theme-on-surface), .65);
  white-space: nowrap;
}

/* Toolbar */
.bl-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  flex-wrap: wrap;
  background: rgba(var(--v-theme-on-surface), .01);
}

/* Table */
.bl-table-wrap {
  overflow-x: auto;
}
.bl-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.bl-th {
  padding: 9px 14px;
  text-align: left;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .05em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), .45);
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  background: rgba(var(--v-theme-on-surface), .02);
}
.bl-th:hover { color: rgba(var(--v-theme-on-surface), .75); }
.bl-th--right  { text-align: right; }
.bl-th--action { width: 40px; cursor: default; }
.bl-th--date   { width: 130px; }

.bl-tr {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  transition: background .1s;
}
.bl-tr:last-child { border-bottom: none; }
.bl-tr:hover { background: rgba(var(--v-theme-on-surface), .03); }
.bl-tr--income { border-left: 2px solid rgba(var(--v-theme-success), .5); }
.bl-tr--expense { border-left: 2px solid rgba(var(--v-theme-error), .3); }

.bl-td {
  padding: 9px 14px;
  color: rgb(var(--v-theme-on-surface));
  vertical-align: middle;
}
.bl-td--date    { white-space: nowrap; color: rgba(var(--v-theme-on-surface), .55); font-size: 12px; }
.bl-td--right   { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
.bl-td--balance { color: rgba(var(--v-theme-on-surface), .6); font-size: 12px; }
.bl-td--action  { text-align: center; padding: 4px 8px; }

.bl-desc { font-weight: 500; }

.bl-cat-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
  background: color-mix(in srgb, var(--cat-color) 15%, transparent);
  color: var(--cat-color);
  white-space: nowrap;
}

.bl-amount--income  { color: rgb(var(--v-theme-success)); font-weight: 700; }
.bl-amount--expense { color: rgb(var(--v-theme-error));   font-weight: 700; }

.bl-empty {
  text-align: center;
  padding: 32px;
  color: rgba(var(--v-theme-on-surface), .35);
  font-size: 13px;
}
</style>
