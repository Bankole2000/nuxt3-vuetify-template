<script setup lang="ts">
definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Invoice', disabled: true },
  ],
})

const invoice = reactive({
  number: 'INV-2026-0042',
  date: '2026-07-03',
  dueDate: '2026-08-03',
  from: {
    name: 'Acme Studio Ltd.',
    address: '12 Design Street',
    city: 'London, EC1A 1BB',
    country: 'United Kingdom',
    email: 'billing@acmestudio.io',
    vatNumber: 'GB 123 456 789',
  },
  to: {
    name: 'TechCorp Inc.',
    address: '500 Innovation Avenue',
    city: 'San Francisco, CA 94105',
    country: 'United States',
    email: 'accounts@techcorp.com',
  },
  items: [
    { description: 'UI/UX Design — Dashboard Redesign', qty: 1, rate: 4800 },
    { description: 'Frontend Development (Nuxt 3)', qty: 80, rate: 95 },
    { description: 'Design System Components', qty: 1, rate: 2200 },
    { description: 'QA & Accessibility Audit', qty: 1, rate: 800 },
  ],
  taxRate: 20,
  notes: 'Payment due within 30 days. Please include the invoice number in your payment reference. Bank transfer details will be sent separately.',
  currency: 'USD',
})

const subtotal = computed(() => invoice.items.reduce((s, i) => s + i.qty * i.rate, 0))
const tax = computed(() => subtotal.value * (invoice.taxRate / 100))
const total = computed(() => subtotal.value + tax.value)

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(n)

const print = () => window.print()
</script>

<template>
  <div>
    <!-- Screen controls (hidden on print) -->
    <div class="d-flex align-center justify-space-between mb-6 no-print">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Invoice</h1>
        <p class="text-body-2 text-medium-emphasis">Print-optimised invoice layout. Use the print button or <kbd>Ctrl+P</kbd>.</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-printer-outline" @click="print">Print / Save PDF</v-btn>
    </div>

    <!-- Invoice document -->
    <v-card rounded="lg" class="invoice-card pa-10 mb-6">

      <!-- Header -->
      <div class="d-flex justify-space-between align-start mb-10">
        <div>
          <p class="text-h4 font-weight-black text-primary mb-1">INVOICE</p>
          <p class="text-body-2 text-medium-emphasis">{{ invoice.number }}</p>
        </div>
        <div class="text-right">
          <p class="text-h6 font-weight-bold mb-1">{{ invoice.from.name }}</p>
          <p class="text-body-2 text-medium-emphasis">{{ invoice.from.address }}</p>
          <p class="text-body-2 text-medium-emphasis">{{ invoice.from.city }}</p>
          <p class="text-body-2 text-medium-emphasis">{{ invoice.from.country }}</p>
          <p class="text-body-2 text-medium-emphasis">{{ invoice.from.email }}</p>
          <p class="text-caption text-medium-emphasis mt-1">VAT: {{ invoice.from.vatNumber }}</p>
        </div>
      </div>

      <!-- Bill to + dates -->
      <div class="d-flex justify-space-between mb-10">
        <div>
          <p class="text-overline text-medium-emphasis mb-2">Bill to</p>
          <p class="text-body-1 font-weight-bold mb-1">{{ invoice.to.name }}</p>
          <p class="text-body-2 text-medium-emphasis">{{ invoice.to.address }}</p>
          <p class="text-body-2 text-medium-emphasis">{{ invoice.to.city }}</p>
          <p class="text-body-2 text-medium-emphasis">{{ invoice.to.country }}</p>
          <p class="text-body-2 text-medium-emphasis">{{ invoice.to.email }}</p>
        </div>
        <div class="text-right">
          <div class="mb-2">
            <p class="text-overline text-medium-emphasis">Issue date</p>
            <p class="text-body-2 font-weight-medium">{{ invoice.date }}</p>
          </div>
          <div class="mb-2">
            <p class="text-overline text-medium-emphasis">Due date</p>
            <p class="text-body-2 font-weight-medium text-warning">{{ invoice.dueDate }}</p>
          </div>
          <div>
            <p class="text-overline text-medium-emphasis">Status</p>
            <v-chip color="warning" size="small" class="no-print">Unpaid</v-chip>
            <p class="text-body-2 font-weight-medium d-none print-only">Unpaid</p>
          </div>
        </div>
      </div>

      <v-divider class="mb-6" />

      <!-- Line items -->
      <table class="invoice-table mb-6" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th class="invoice-th text-left text-body-2 font-weight-bold pb-3" style="width: 50%;">Description</th>
            <th class="invoice-th text-right text-body-2 font-weight-bold pb-3" style="width: 15%;">Qty</th>
            <th class="invoice-th text-right text-body-2 font-weight-bold pb-3" style="width: 17.5%;">Rate</th>
            <th class="invoice-th text-right text-body-2 font-weight-bold pb-3" style="width: 17.5%;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in invoice.items" :key="item.description">
            <td class="invoice-td text-body-2 py-3">{{ item.description }}</td>
            <td class="invoice-td text-body-2 py-3 text-right">{{ item.qty }}</td>
            <td class="invoice-td text-body-2 py-3 text-right text-medium-emphasis">{{ fmt(item.rate) }}</td>
            <td class="invoice-td text-body-2 py-3 text-right font-weight-medium">{{ fmt(item.qty * item.rate) }}</td>
          </tr>
        </tbody>
      </table>

      <v-divider class="mb-4" />

      <!-- Totals -->
      <div class="d-flex justify-end mb-8">
        <div style="min-width: 260px;">
          <div class="d-flex justify-space-between text-body-2 mb-2">
            <span class="text-medium-emphasis">Subtotal</span>
            <span>{{ fmt(subtotal) }}</span>
          </div>
          <div class="d-flex justify-space-between text-body-2 mb-3">
            <span class="text-medium-emphasis">VAT ({{ invoice.taxRate }}%)</span>
            <span>{{ fmt(tax) }}</span>
          </div>
          <v-divider class="mb-3" />
          <div class="d-flex justify-space-between">
            <span class="text-body-1 font-weight-bold">Total</span>
            <span class="text-h6 font-weight-black text-primary">{{ fmt(total) }}</span>
          </div>
        </div>
      </div>

      <!-- Notes -->
      <v-sheet rounded="lg" color="surface-variant" class="pa-4">
        <p class="text-overline text-medium-emphasis mb-1">Notes</p>
        <p class="text-body-2 text-medium-emphasis mb-0">{{ invoice.notes }}</p>
      </v-sheet>
    </v-card>
  </div>
</template>

<style scoped>
.invoice-th {
  border-bottom: 2px solid rgba(var(--v-border-color), var(--v-border-opacity));
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.75rem;
}
.invoice-td {
  border-bottom: 1px solid rgba(var(--v-border-color), calc(var(--v-border-opacity) * 0.5));
}

@media print {
  .no-print { display: none !important; }
  .print-only { display: block !important; }

  .invoice-card {
    box-shadow: none !important;
    border: none !important;
  }

  body, html {
    background: white !important;
  }
}

.print-only { display: none; }
</style>
