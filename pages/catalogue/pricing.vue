<script setup lang="ts">
import type { PricingPlan } from '~/components/common/PricingTable.vue'

definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Pricing Table', disabled: true },
  ],
})

const toast = useToast()

const plans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for solo projects and experiments.',
    price: { monthly: 0, annually: 0 },
    cta: 'Get started free',
    features: [
      { label: '1 user', included: true },
      { label: '3 projects', included: true },
      { label: '5 GB storage', included: true },
      { label: 'Community support', included: true },
      { label: 'Custom domain', included: false },
      { label: 'Analytics', included: false },
      { label: 'Priority support', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For growing teams that need more power.',
    price: { monthly: 29, annually: 279 },
    badge: 'Most popular',
    color: 'primary',
    cta: 'Start free trial',
    features: [
      { label: 'Up to 10 users', included: true },
      { label: 'Unlimited projects', included: true },
      { label: '50 GB storage', included: true },
      { label: 'Email support', included: true },
      { label: 'Custom domain', included: true },
      { label: 'Analytics', included: true },
      { label: 'Priority support', included: false },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organisations with complex needs.',
    price: { monthly: 99, annually: 950 },
    color: 'secondary',
    cta: 'Contact sales',
    features: [
      { label: 'Unlimited users', included: true },
      { label: 'Unlimited projects', included: true },
      { label: 'Unlimited storage', included: true },
      { label: '24/7 dedicated support', included: true },
      { label: 'Custom domain', included: true },
      { label: 'Advanced analytics', included: true },
      { label: 'Priority support', included: true },
    ],
  },
]

const onSelect = (id: string) => {
  const plan = plans.find(p => p.id === id)
  toast.success(`Selected: ${plan?.name} plan`)
}
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">Pricing Table</h1>
    <p class="text-body-2 text-medium-emphasis mb-8">
      Plan comparison cards with monthly/annual billing toggle, feature lists and a highlighted featured tier.
    </p>

    <CommonPricingTable :plans="plans" featured="pro" @select="onSelect" />

    <h2 class="text-overline text-medium-emphasis mt-10 mb-4">Usage</h2>
    <v-card rounded="lg" class="pa-5">
      <v-sheet rounded="lg" color="surface-variant" class="pa-4">
        <pre v-pre class="text-body-2"><code>&lt;CommonPricingTable
  :plans="plans"
  featured="pro"
  @select="onPlanSelected"
/&gt;

// Plan shape:
// {
//   id, name, description?,
//   price: { monthly: number | string, annually: number | string },
//   badge?, color?, cta?,
//   features: [{ label: string, included: boolean | string }]
// }</code></pre>
      </v-sheet>
    </v-card>
  </div>
</template>
