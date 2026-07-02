<script setup lang="ts">
export interface PricingFeature {
  label: string
  included: boolean | string
}

export interface PricingPlan {
  id: string
  name: string
  description?: string
  price: { monthly: number | string; annually: number | string }
  currency?: string
  badge?: string
  color?: string
  features: PricingFeature[]
  cta?: string
}

const props = withDefaults(defineProps<{
  plans: PricingPlan[]
  /** Which plan id to highlight */
  featured?: string
}>(), {})

const billing = ref<'monthly' | 'annually'>('monthly')

const emit = defineEmits<{
  (e: 'select', planId: string): void
}>()

const displayPrice = (plan: PricingPlan) => {
  const p = plan.price[billing.value]
  if (typeof p === 'string') return p
  return p === 0 ? 'Free' : `${plan.currency ?? '$'}${p}`
}

const billingLabel = (plan: PricingPlan) => {
  const p = plan.price[billing.value]
  if (typeof p === 'string' || p === 0) return ''
  return `/ ${billing.value === 'monthly' ? 'mo' : 'yr'}`
}
</script>

<template>
  <div>
    <!-- Billing toggle -->
    <div class="d-flex justify-center mb-8">
      <v-btn-toggle v-model="billing" density="compact" variant="outlined" divided mandatory rounded="pill">
        <v-btn value="monthly" size="small" class="px-5">Monthly</v-btn>
        <v-btn value="annually" size="small" class="px-5">
          Annually
          <v-chip size="x-small" color="success" variant="tonal" class="ml-2">Save 20%</v-chip>
        </v-btn>
      </v-btn-toggle>
    </div>

    <!-- Plan cards -->
    <v-row justify="center">
      <v-col
        v-for="plan in plans"
        :key="plan.id"
        cols="12"
        sm="6"
        :md="Math.min(4, Math.floor(12 / plans.length))"
      >
        <v-card
          rounded="xl"
          :elevation="featured === plan.id ? 4 : 0"
          :border="featured !== plan.id"
          :color="featured === plan.id ? plan.color ?? 'primary' : undefined"
          :variant="featured === plan.id ? 'tonal' : 'outlined'"
          height="100%"
          class="d-flex flex-column"
        >
          <!-- Badge -->
          <div v-if="plan.badge" class="d-flex justify-center pt-4">
            <v-chip
              :color="plan.color ?? 'primary'"
              size="small"
              variant="tonal"
            >
              {{ plan.badge }}
            </v-chip>
          </div>

          <v-card-text class="pa-6 flex-1">
            <p class="text-body-1 font-weight-bold mb-1">{{ plan.name }}</p>
            <p v-if="plan.description" class="text-caption text-medium-emphasis mb-4">
              {{ plan.description }}
            </p>

            <!-- Price -->
            <div class="d-flex align-baseline gap-1 mb-6">
              <span class="text-h4 font-weight-black">{{ displayPrice(plan) }}</span>
              <span class="text-body-2 text-medium-emphasis">{{ billingLabel(plan) }}</span>
            </div>

            <!-- Features -->
            <div class="d-flex flex-column gap-3">
              <div
                v-for="feature in plan.features"
                :key="feature.label"
                class="d-flex align-center gap-3"
              >
                <v-icon
                  :icon="feature.included ? 'mdi-check-circle' : 'mdi-minus-circle-outline'"
                  :color="feature.included ? (plan.color ?? 'primary') : 'disabled'"
                  size="18"
                  class="flex-shrink-0"
                />
                <span
                  class="text-body-2"
                  :class="feature.included ? '' : 'text-disabled'"
                >
                  {{ typeof feature.included === 'string' ? feature.included : feature.label }}
                </span>
              </div>
            </div>
          </v-card-text>

          <v-card-actions class="pa-6 pt-0">
            <v-btn
              :color="plan.color ?? 'primary'"
              :variant="featured === plan.id ? 'elevated' : 'tonal'"
              block
              rounded="lg"
              @click="emit('select', plan.id)"
            >
              {{ plan.cta ?? 'Get started' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
