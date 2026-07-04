<script setup lang="ts">
import type { Transaction, BudgetCategory } from '~/components/common/BudgetLedger.vue'

definePageMeta({ layout: 'catalogue' })
useSeo({ title: 'Budget Ledger', description: 'Categorised income/expense ledger with running balance, donut breakdown chart, filters and inline add/delete.' })

const tab      = ref('personal')
const infoOpen = ref(false)

const uid = () => Math.random().toString(36).slice(2, 9)

const d = (offset: number) => {
  const r = new Date()
  r.setDate(r.getDate() + offset)
  return r.toISOString().slice(0, 10)
}

// ─── 1. Personal budget ───────────────────────────────────────────────────────

const personalCats: BudgetCategory[] = [
  { name: 'Salary',       color: '#10b981', icon: 'mdi-briefcase-outline' },
  { name: 'Freelance',    color: '#6366f1', icon: 'mdi-laptop' },
  { name: 'Housing',      color: '#ef4444', icon: 'mdi-home-outline' },
  { name: 'Groceries',    color: '#f97316', icon: 'mdi-cart-outline' },
  { name: 'Transport',    color: '#3b82f6', icon: 'mdi-car-outline' },
  { name: 'Eating out',   color: '#ec4899', icon: 'mdi-food-outline' },
  { name: 'Utilities',    color: '#f59e0b', icon: 'mdi-lightning-bolt-outline' },
  { name: 'Entertainment',color: '#8b5cf6', icon: 'mdi-movie-outline' },
  { name: 'Health',       color: '#14b8a6', icon: 'mdi-heart-outline' },
  { name: 'Savings',      color: '#22c55e', icon: 'mdi-piggy-bank-outline' },
]

const personalTx = ref<Transaction[]>([
  { id: uid(), date: d(-29), description: 'Monthly salary',        category: 'Salary',        type: 'income',  amount: 3800 },
  { id: uid(), date: d(-28), description: 'Rent',                  category: 'Housing',       type: 'expense', amount: 1200 },
  { id: uid(), date: d(-27), description: 'Electricity bill',      category: 'Utilities',     type: 'expense', amount: 68 },
  { id: uid(), date: d(-26), description: 'Internet',              category: 'Utilities',     type: 'expense', amount: 35 },
  { id: uid(), date: d(-25), description: 'Freelance project',     category: 'Freelance',     type: 'income',  amount: 650 },
  { id: uid(), date: d(-24), description: 'Weekly shop',           category: 'Groceries',     type: 'expense', amount: 87 },
  { id: uid(), date: d(-22), description: 'Bus pass',              category: 'Transport',     type: 'expense', amount: 42 },
  { id: uid(), date: d(-21), description: 'Dinner out',            category: 'Eating out',    type: 'expense', amount: 56 },
  { id: uid(), date: d(-20), description: 'Netflix',               category: 'Entertainment', type: 'expense', amount: 15.99 },
  { id: uid(), date: d(-18), description: 'Weekly shop',           category: 'Groceries',     type: 'expense', amount: 91 },
  { id: uid(), date: d(-16), description: 'Gym membership',        category: 'Health',        type: 'expense', amount: 35 },
  { id: uid(), date: d(-14), description: 'Cinema tickets',        category: 'Entertainment', type: 'expense', amount: 24 },
  { id: uid(), date: d(-13), description: 'Takeaway',              category: 'Eating out',    type: 'expense', amount: 28 },
  { id: uid(), date: d(-11), description: 'Weekly shop',           category: 'Groceries',     type: 'expense', amount: 79 },
  { id: uid(), date: d(-10), description: 'Freelance top-up',      category: 'Freelance',     type: 'income',  amount: 200 },
  { id: uid(), date: d(-8),  description: 'Petrol',                category: 'Transport',     type: 'expense', amount: 60 },
  { id: uid(), date: d(-7),  description: 'Weekly shop',           category: 'Groceries',     type: 'expense', amount: 94 },
  { id: uid(), date: d(-5),  description: 'Doctor visit',          category: 'Health',        type: 'expense', amount: 20 },
  { id: uid(), date: d(-4),  description: 'Restaurant birthday',   category: 'Eating out',    type: 'expense', amount: 72 },
  { id: uid(), date: d(-2),  description: 'Transfer to savings',   category: 'Savings',       type: 'expense', amount: 400 },
  { id: uid(), date: d(-1),  description: 'Weekly shop',           category: 'Groceries',     type: 'expense', amount: 83 },
])

const addPersonal = (tx: Omit<Transaction, 'id'>) => {
  personalTx.value.push({ ...tx, id: uid() })
}
const deletePersonal = (id: string) => {
  personalTx.value = personalTx.value.filter(t => t.id !== id)
}

// ─── 2. Business P&L ──────────────────────────────────────────────────────────

const bizCats: BudgetCategory[] = [
  { name: 'Revenue',       color: '#10b981', icon: 'mdi-cash-multiple' },
  { name: 'Consulting',    color: '#6366f1', icon: 'mdi-account-tie-outline' },
  { name: 'Payroll',       color: '#ef4444', icon: 'mdi-account-group-outline' },
  { name: 'Software',      color: '#3b82f6', icon: 'mdi-application-outline' },
  { name: 'Marketing',     color: '#ec4899', icon: 'mdi-bullhorn-outline' },
  { name: 'Infrastructure',color: '#f97316', icon: 'mdi-server-outline' },
  { name: 'Office',        color: '#f59e0b', icon: 'mdi-office-building-outline' },
  { name: 'Legal & Admin', color: '#8b5cf6', icon: 'mdi-scale-balance' },
  { name: 'Travel',        color: '#14b8a6', icon: 'mdi-airplane-outline' },
]

const bizTx = ref<Transaction[]>([
  { id: uid(), date: d(-30), description: 'Client A — invoice #1042', category: 'Revenue',        type: 'income',  amount: 12000 },
  { id: uid(), date: d(-29), description: 'Payroll — March',          category: 'Payroll',         type: 'expense', amount: 6800 },
  { id: uid(), date: d(-28), description: 'AWS monthly bill',          category: 'Infrastructure',  type: 'expense', amount: 320 },
  { id: uid(), date: d(-27), description: 'Google Workspace',          category: 'Software',        type: 'expense', amount: 84 },
  { id: uid(), date: d(-25), description: 'Client B — invoice #2031', category: 'Revenue',        type: 'income',  amount: 4500 },
  { id: uid(), date: d(-24), description: 'LinkedIn Ads',              category: 'Marketing',       type: 'expense', amount: 450 },
  { id: uid(), date: d(-22), description: 'Office rent',               category: 'Office',          type: 'expense', amount: 900 },
  { id: uid(), date: d(-20), description: 'Consulting retainer',       category: 'Consulting',      type: 'income',  amount: 2000 },
  { id: uid(), date: d(-18), description: 'Legal review',              category: 'Legal & Admin',   type: 'expense', amount: 350 },
  { id: uid(), date: d(-16), description: 'Conference travel',         category: 'Travel',          type: 'expense', amount: 680 },
  { id: uid(), date: d(-14), description: 'Client C — milestone pmt', category: 'Revenue',        type: 'income',  amount: 7500 },
  { id: uid(), date: d(-12), description: 'Figma & design tools',      category: 'Software',        type: 'expense', amount: 75 },
  { id: uid(), date: d(-10), description: 'Payroll — mid-month',       category: 'Payroll',         type: 'expense', amount: 3200 },
  { id: uid(), date: d(-8),  description: 'Social media ads',          category: 'Marketing',       type: 'expense', amount: 280 },
  { id: uid(), date: d(-6),  description: 'Consulting retainer',       category: 'Consulting',      type: 'income',  amount: 2000 },
  { id: uid(), date: d(-4),  description: 'Notion & project tools',    category: 'Software',        type: 'expense', amount: 32 },
  { id: uid(), date: d(-2),  description: 'Accountant fee',            category: 'Legal & Admin',   type: 'expense', amount: 200 },
  { id: uid(), date: d(-1),  description: 'Client D — deposit',        category: 'Revenue',        type: 'income',  amount: 3000 },
])

const addBiz = (tx: Omit<Transaction, 'id'>) => { bizTx.value.push({ ...tx, id: uid() }) }
const deleteBiz = (id: string) => { bizTx.value = bizTx.value.filter(t => t.id !== id) }

// ─── 3. HEAM — health spending ────────────────────────────────────────────────

const heamCats: BudgetCategory[] = [
  { name: 'Insurance',      color: '#6366f1', icon: 'mdi-shield-outline' },
  { name: 'GP visit',       color: '#3b82f6', icon: 'mdi-stethoscope' },
  { name: 'Specialist',     color: '#8b5cf6', icon: 'mdi-doctor' },
  { name: 'Prescriptions',  color: '#ec4899', icon: 'mdi-pill' },
  { name: 'Dental',         color: '#f97316', icon: 'mdi-tooth-outline' },
  { name: 'Optical',        color: '#f59e0b', icon: 'mdi-glasses' },
  { name: 'Gym & fitness',  color: '#10b981', icon: 'mdi-dumbbell' },
  { name: 'Mental health',  color: '#14b8a6', icon: 'mdi-brain' },
  { name: 'Supplements',    color: '#22c55e', icon: 'mdi-leaf-maple' },
  { name: 'Reimbursement',  color: '#10b981', icon: 'mdi-cash-refund' },
]

const heamTx = ref<Transaction[]>([
  { id: uid(), date: d(-60), description: 'Annual health insurance', category: 'Insurance',     type: 'expense', amount: 480 },
  { id: uid(), date: d(-55), description: 'GP consultation',         category: 'GP visit',      type: 'expense', amount: 20 },
  { id: uid(), date: d(-52), description: 'Blood test prescription', category: 'Prescriptions', type: 'expense', amount: 12.40 },
  { id: uid(), date: d(-48), description: 'Insurance reimbursement', category: 'Reimbursement', type: 'income',  amount: 20 },
  { id: uid(), date: d(-45), description: 'Gym membership',          category: 'Gym & fitness', type: 'expense', amount: 35 },
  { id: uid(), date: d(-42), description: 'Vitamin D & omega-3',     category: 'Supplements',   type: 'expense', amount: 28 },
  { id: uid(), date: d(-38), description: 'Dental check-up',         category: 'Dental',        type: 'expense', amount: 55 },
  { id: uid(), date: d(-35), description: 'Dentist reimbursement',   category: 'Reimbursement', type: 'income',  amount: 40 },
  { id: uid(), date: d(-30), description: 'Gym membership',          category: 'Gym & fitness', type: 'expense', amount: 35 },
  { id: uid(), date: d(-28), description: 'Physio session',          category: 'Specialist',    type: 'expense', amount: 65 },
  { id: uid(), date: d(-25), description: 'Physio session',          category: 'Specialist',    type: 'expense', amount: 65 },
  { id: uid(), date: d(-22), description: 'Antibiotic prescription', category: 'Prescriptions', type: 'expense', amount: 9.90 },
  { id: uid(), date: d(-20), description: 'Therapy session',         category: 'Mental health', type: 'expense', amount: 80 },
  { id: uid(), date: d(-18), description: 'Eye test',                category: 'Optical',       type: 'expense', amount: 25 },
  { id: uid(), date: d(-15), description: 'Gym membership',          category: 'Gym & fitness', type: 'expense', amount: 35 },
  { id: uid(), date: d(-14), description: 'Therapy session',         category: 'Mental health', type: 'expense', amount: 80 },
  { id: uid(), date: d(-12), description: 'New glasses',             category: 'Optical',       type: 'expense', amount: 140 },
  { id: uid(), date: d(-10), description: 'Optical reimbursement',   category: 'Reimbursement', type: 'income',  amount: 100 },
  { id: uid(), date: d(-8),  description: 'Supplements restock',     category: 'Supplements',   type: 'expense', amount: 32 },
  { id: uid(), date: d(-7),  description: 'Therapy session',         category: 'Mental health', type: 'expense', amount: 80 },
  { id: uid(), date: d(-5),  description: 'Physio session',          category: 'Specialist',    type: 'expense', amount: 65 },
  { id: uid(), date: d(-3),  description: 'GP follow-up',            category: 'GP visit',      type: 'expense', amount: 20 },
  { id: uid(), date: d(-1),  description: 'Gym membership',          category: 'Gym & fitness', type: 'expense', amount: 35 },
])

const addHeam = (tx: Omit<Transaction, 'id'>) => { heamTx.value.push({ ...tx, id: uid() }) }
const deleteHeam = (id: string) => { heamTx.value = heamTx.value.filter(t => t.id !== id) }

// ─── Info modal ───────────────────────────────────────────────────────────────

const USECASES = [
  {
    context: 'General UI patterns',
    icon: 'mdi-cash-multiple',
    color: 'success',
    items: [
      { label: 'Personal budget', detail: 'Track monthly income and expenses by category. Running balance column shows cash position after every transaction.' },
      { label: 'Shared household', detail: 'Multiple income sources (salaries, freelance) alongside shared expenses (rent, utilities, groceries).' },
      { label: 'Project cost tracking', detail: 'Log costs and payments against a project; net balance shows budget remaining.' },
      { label: 'Subscription tracker', detail: 'Every recurring SaaS, utility, or membership in one filterable ledger.' },
    ],
  },
  {
    context: 'Expense Tracker (#5)',
    icon: 'mdi-receipt-outline',
    color: 'orange',
    items: [
      { label: 'Core ledger view', detail: 'This IS the expense tracker\'s primary screen. Categories, donut breakdown, add/delete, and running balance are all built in.' },
      { label: 'Monthly filter', detail: 'The date filter and category filter let users drill into specific months or spending areas instantly.' },
    ],
  },
  {
    context: 'HEAM (#9)',
    icon: 'mdi-heart-pulse',
    color: 'red',
    items: [
      { label: 'Health spend ledger', detail: 'Track all health costs (GP, prescriptions, gym, therapy) alongside insurance reimbursements. Net shows true out-of-pocket cost.' },
      { label: 'Insurance claim tracking', detail: 'Income rows for reimbursements pair with expense rows for the original cost, making gaps in coverage visible.' },
    ],
  },
  {
    context: 'Double-Entry Bookkeeping (#18)',
    icon: 'mdi-book-open-outline',
    color: 'purple',
    items: [
      { label: 'P&L statement view', detail: 'Revenue rows vs. operating expense rows grouped by account. Net balance = profit/loss for the period.' },
      { label: 'Category drill-down', detail: 'Filter by "Payroll" or "Marketing" to see all spend in that account across the period.' },
    ],
  },
  {
    context: 'Portfolio Manager (#1)',
    icon: 'mdi-briefcase-outline',
    color: 'teal',
    items: [
      { label: 'Per-project cost view', detail: 'Each project has its own ledger: dev costs, tooling, infra. Net balance shows spend vs. allocated budget.' },
    ],
  },
]
</script>

<template>
  <div>
    <div class="d-flex align-start justify-space-between gap-4 mb-1">
      <h1 class="text-h5 font-weight-bold">Budget Ledger</h1>
      <v-btn icon="mdi-information-outline" variant="text" size="small" @click="infoOpen = true" />
    </div>
    <p class="text-body-2 text-medium-emphasis mb-5">
      Categorised income/expense ledger with running balance, donut breakdown chart,
      type and category filters, search, and inline add/delete. Parent owns the data —
      the component only emits.
    </p>

    <!-- Info dialog -->
    <v-dialog v-model="infoOpen" max-width="560" scrollable>
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center justify-space-between pt-5 px-6 pb-2">
          <span class="text-h6">Use cases &amp; project fit</span>
          <v-btn icon="mdi-close" variant="text" size="small" @click="infoOpen = false" />
        </v-card-title>
        <v-card-subtitle class="px-6 pb-3 text-wrap">
          Any feature that tracks money in vs. money out, and needs to know the running position, fits this component.
        </v-card-subtitle>
        <v-divider />
        <v-card-text class="px-4 py-4">
          <div v-for="group in USECASES" :key="group.context" class="bl-uc-group">
            <div class="bl-uc-header">
              <v-icon :icon="group.icon" :color="group.color" size="16" />
              <span class="bl-uc-title">{{ group.context }}</span>
            </div>
            <ul class="bl-uc-list">
              <li v-for="item in group.items" :key="item.label">
                <span class="bl-uc-label">{{ item.label }}</span>
                <span class="bl-uc-detail">{{ item.detail }}</span>
              </li>
            </ul>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-tabs v-model="tab" density="compact" class="mb-5">
      <v-tab value="personal">
        <v-icon start icon="mdi-account-outline" size="16" />
        Personal
      </v-tab>
      <v-tab value="business">
        <v-icon start icon="mdi-briefcase-outline" size="16" />
        Business P&amp;L
      </v-tab>
      <v-tab value="heam">
        <v-icon start icon="mdi-heart-pulse" size="16" />
        Health (HEAM)
      </v-tab>
    </v-tabs>

    <v-window v-model="tab">

      <v-window-item value="personal">
        <p class="text-caption text-medium-emphasis mb-3">
          Monthly personal budget. Income from salary and freelance work balanced against
          housing, groceries, transport, and leisure. Use the Income / Expenses toggle to
          filter, or search by description.
        </p>
        <CommonBudgetLedger
          :transactions="personalTx"
          :categories="personalCats"
          currency="£"
          title="Personal budget"
          @add="addPersonal"
          @delete="deletePersonal"
        />
        <p class="text-caption text-medium-emphasis mt-3">Use case: Expense Tracker (#5)</p>
      </v-window-item>

      <v-window-item value="business">
        <p class="text-caption text-medium-emphasis mb-3">
          Business profit &amp; loss. Revenue from clients and consulting vs. payroll,
          software, marketing and office costs. Filter by "Payroll" to see staffing spend
          at a glance.
        </p>
        <CommonBudgetLedger
          :transactions="bizTx"
          :categories="bizCats"
          currency="£"
          title="Business P&L"
          @add="addBiz"
          @delete="deleteBiz"
        />
        <p class="text-caption text-medium-emphasis mt-3">Use case: Double-Entry Bookkeeping (#18) · Portfolio Manager (#1)</p>
      </v-window-item>

      <v-window-item value="heam">
        <p class="text-caption text-medium-emphasis mb-3">
          Health expenditure tracker. Every GP visit, prescription, therapy session, and
          gym fee logged alongside insurance reimbursements. Net balance shows true out-of-pocket
          health cost over the period.
        </p>
        <CommonBudgetLedger
          :transactions="heamTx"
          :categories="heamCats"
          currency="£"
          title="Health spending"
          @add="addHeam"
          @delete="deleteHeam"
        />
        <p class="text-caption text-medium-emphasis mt-3">Use case: HEAM (#9)</p>
      </v-window-item>

    </v-window>
  </div>
</template>

<style scoped>
.bl-uc-group { margin-bottom: 20px; }
.bl-uc-group:last-child { margin-bottom: 0; }
.bl-uc-header { display: flex; align-items: center; gap: 7px; margin-bottom: 8px; padding: 0 4px; }
.bl-uc-title { font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: rgba(var(--v-theme-on-surface), .55); }
.bl-uc-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 2px; }
.bl-uc-list li { display: flex; flex-direction: column; gap: 1px; padding: 7px 10px 7px 16px; border-radius: 8px; background: rgba(var(--v-theme-on-surface), .03); border-left: 2px solid rgba(var(--v-theme-on-surface), .08); }
.bl-uc-label { font-size: 12px; font-weight: 600; color: rgb(var(--v-theme-on-surface)); line-height: 1.4; }
.bl-uc-detail { font-size: 11px; color: rgba(var(--v-theme-on-surface), .5); line-height: 1.5; }
</style>
