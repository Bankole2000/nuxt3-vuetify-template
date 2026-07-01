<script setup lang="ts">
definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Stepper', disabled: true },
  ],
})

const step = ref(1)
const toast = useToast()

const form = reactive({
  name: '',
  email: '',
  plan: '',
  billing: 'monthly',
  cardNumber: '',
  expiry: '',
  cvv: '',
})

const errors = reactive<Record<string, string>>({})

const plans = [
  { value: 'starter', label: 'Starter', price: '$9/mo', description: '1 user, 5 projects' },
  { value: 'pro', label: 'Pro', price: '$29/mo', description: '10 users, unlimited projects' },
  { value: 'enterprise', label: 'Enterprise', price: '$99/mo', description: 'Unlimited everything' },
]

const validate = (s: number) => {
  if (s === 1) {
    errors.name = form.name.trim() ? '' : 'Name is required'
    errors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? '' : 'Valid email required'
    return !errors.name && !errors.email
  }
  if (s === 2) {
    errors.plan = form.plan ? '' : 'Please select a plan'
    return !errors.plan
  }
  if (s === 3) {
    errors.cardNumber = form.cardNumber.replace(/\s/g, '').length === 16 ? '' : 'Enter a valid 16-digit card number'
    errors.expiry = /^\d{2}\/\d{2}$/.test(form.expiry) ? '' : 'Format: MM/YY'
    errors.cvv = /^\d{3,4}$/.test(form.cvv) ? '' : 'Invalid CVV'
    return !errors.cardNumber && !errors.expiry && !errors.cvv
  }
  return true
}

const next = () => {
  if (validate(step.value)) step.value++
}

const submit = () => {
  if (validate(3)) {
    toast.success('Account created successfully!')
    step.value = 5
  }
}

const reset = () => {
  step.value = 1
  Object.assign(form, { name: '', email: '', plan: '', billing: 'monthly', cardNumber: '', expiry: '', cvv: '' })
  Object.keys(errors).forEach(k => { errors[k] = '' })
}
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">Stepper / Multi-step Form</h1>
    <p class="text-body-2 text-medium-emphasis mb-8">
      <code>v-stepper</code> with per-step validation before advancing.
    </p>

    <v-card rounded="lg" class="pa-2">
      <v-stepper v-model="step" flat>
        <v-stepper-header>
          <v-stepper-item title="Account" value="1" :complete="step > 1" />
          <v-divider />
          <v-stepper-item title="Plan" value="2" :complete="step > 2" />
          <v-divider />
          <v-stepper-item title="Payment" value="3" :complete="step > 3" />
          <v-divider />
          <v-stepper-item title="Review" value="4" :complete="step > 4" />
        </v-stepper-header>

        <v-stepper-window>
          <!-- Step 1: Account -->
          <v-stepper-window-item value="1">
            <div class="pa-4" style="max-width: 480px;">
              <p class="text-body-1 font-weight-bold mb-4">Create your account</p>
              <v-text-field
                v-model="form.name"
                label="Full name"
                variant="outlined"
                density="comfortable"
                :error-messages="errors.name"
                class="mb-3"
              />
              <v-text-field
                v-model="form.email"
                label="Email address"
                type="email"
                variant="outlined"
                density="comfortable"
                :error-messages="errors.email"
              />
            </div>
          </v-stepper-window-item>

          <!-- Step 2: Plan -->
          <v-stepper-window-item value="2">
            <div class="pa-4">
              <p class="text-body-1 font-weight-bold mb-1">Choose a plan</p>
              <p v-if="errors.plan" class="text-caption text-error mb-3">{{ errors.plan }}</p>
              <v-row class="mt-2">
                <v-col v-for="plan in plans" :key="plan.value" cols="12" sm="4">
                  <v-card
                    rounded="lg"
                    :border="form.plan === plan.value ? 'primary md' : 'md'"
                    :color="form.plan === plan.value ? 'primary' : undefined"
                    :variant="form.plan === plan.value ? 'tonal' : 'outlined'"
                    class="cursor-pointer"
                    @click="form.plan = plan.value; errors.plan = ''"
                  >
                    <v-card-text class="pa-4">
                      <p class="text-body-1 font-weight-bold mb-1">{{ plan.label }}</p>
                      <p class="text-h6 font-weight-black mb-1">{{ plan.price }}</p>
                      <p class="text-caption text-medium-emphasis">{{ plan.description }}</p>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              <v-btn-toggle v-model="form.billing" density="compact" variant="outlined" divided class="mt-4" mandatory>
                <v-btn value="monthly" size="small">Monthly</v-btn>
                <v-btn value="annually" size="small">Annually <v-chip size="x-small" color="success" class="ml-1">-20%</v-chip></v-btn>
              </v-btn-toggle>
            </div>
          </v-stepper-window-item>

          <!-- Step 3: Payment -->
          <v-stepper-window-item value="3">
            <div class="pa-4" style="max-width: 480px;">
              <p class="text-body-1 font-weight-bold mb-4">Payment details</p>
              <v-text-field
                v-model="form.cardNumber"
                label="Card number"
                variant="outlined"
                density="comfortable"
                placeholder="1234 5678 9012 3456"
                :error-messages="errors.cardNumber"
                class="mb-3"
              />
              <v-row>
                <v-col cols="6">
                  <v-text-field
                    v-model="form.expiry"
                    label="Expiry"
                    variant="outlined"
                    density="comfortable"
                    placeholder="MM/YY"
                    :error-messages="errors.expiry"
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="form.cvv"
                    label="CVV"
                    variant="outlined"
                    density="comfortable"
                    placeholder="123"
                    :error-messages="errors.cvv"
                  />
                </v-col>
              </v-row>
            </div>
          </v-stepper-window-item>

          <!-- Step 4: Review -->
          <v-stepper-window-item value="4">
            <div class="pa-4" style="max-width: 480px;">
              <p class="text-body-1 font-weight-bold mb-4">Review your order</p>
              <v-list density="compact" rounded="lg" border class="mb-4">
                <v-list-item>
                  <v-list-item-title class="text-caption text-medium-emphasis">Name</v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 font-weight-medium">{{ form.name }}</v-list-item-subtitle>
                </v-list-item>
                <v-divider />
                <v-list-item>
                  <v-list-item-title class="text-caption text-medium-emphasis">Email</v-list-item-title>
                  <v-list-item-subtitle class="text-body-2">{{ form.email }}</v-list-item-subtitle>
                </v-list-item>
                <v-divider />
                <v-list-item>
                  <v-list-item-title class="text-caption text-medium-emphasis">Plan</v-list-item-title>
                  <v-list-item-subtitle class="text-body-2">{{ form.plan }} · {{ form.billing }}</v-list-item-subtitle>
                </v-list-item>
                <v-divider />
                <v-list-item>
                  <v-list-item-title class="text-caption text-medium-emphasis">Card</v-list-item-title>
                  <v-list-item-subtitle class="text-body-2">•••• •••• •••• {{ form.cardNumber.slice(-4) }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </div>
          </v-stepper-window-item>

          <!-- Step 5: Done -->
          <v-stepper-window-item value="5">
            <div class="pa-8 text-center">
              <v-icon icon="mdi-check-circle-outline" color="success" size="64" class="mb-4" />
              <p class="text-h6 font-weight-bold mb-2">You're all set!</p>
              <p class="text-body-2 text-medium-emphasis mb-6">Your account has been created. Welcome aboard.</p>
              <v-btn color="primary" @click="reset">Start over</v-btn>
            </div>
          </v-stepper-window-item>
        </v-stepper-window>

        <v-card-actions v-if="step < 5" class="pa-4 pt-0">
          <v-btn v-if="step > 1" variant="text" @click="step--">Back</v-btn>
          <v-spacer />
          <v-btn v-if="step < 4" color="primary" variant="tonal" @click="next">Continue</v-btn>
          <v-btn v-else color="primary" @click="submit">Create account</v-btn>
        </v-card-actions>
      </v-stepper>
    </v-card>
  </div>
</template>
