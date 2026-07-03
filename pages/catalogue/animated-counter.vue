<script setup lang="ts">
definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Animated Counter', disabled: true },
  ],
})

const stats = ref([
  { label: 'Total users', value: 0, target: 48291, prefix: '', suffix: '', decimals: 0, color: 'primary', icon: 'mdi-account-group-outline' },
  { label: 'Monthly revenue', value: 0, target: 128540, prefix: '$', suffix: '', decimals: 0, color: 'success', icon: 'mdi-cash-multiple' },
  { label: 'Uptime', value: 0, target: 99.97, prefix: '', suffix: '%', decimals: 2, color: 'info', icon: 'mdi-server-outline' },
  { label: 'Open tickets', value: 0, target: 7, prefix: '', suffix: '', decimals: 0, color: 'warning', icon: 'mdi-ticket-outline' },
])

const easing = ref<'linear' | 'ease-out' | 'ease-in-out'>('ease-out')
const duration = ref(1500)
const triggered = ref(false)

const trigger = () => {
  triggered.value = false
  nextTick(() => { triggered.value = true })
}

onMounted(() => { triggered.value = true })
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">Animated Counter</h1>
    <p class="text-body-2 text-medium-emphasis mb-8">
      Counts up (or down) to a target value on mount, with configurable easing and duration.
    </p>

    <!-- Stat cards -->
    <h2 class="text-overline text-medium-emphasis mb-4">Stat cards</h2>
    <v-row class="mb-6">
      <v-col v-for="stat in stats" :key="stat.label" cols="12" sm="6" md="3">
        <v-card rounded="lg" border>
          <v-card-text class="pa-5">
            <div class="d-flex align-center justify-space-between mb-3">
              <span class="text-body-2 text-medium-emphasis">{{ stat.label }}</span>
              <v-icon :icon="stat.icon" :color="stat.color" size="22" />
            </div>
            <p class="text-h4 font-weight-bold mb-0" :class="`text-${stat.color}`">
              <CommonAnimatedCounter
                v-if="triggered"
                :value="stat.target"
                :prefix="stat.prefix"
                :suffix="stat.suffix"
                :decimals="stat.decimals"
                :duration="duration"
                :easing="easing"
              />
              <span v-else>{{ stat.prefix }}0{{ stat.suffix }}</span>
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Controls -->
    <h2 class="text-overline text-medium-emphasis mb-4">Controls</h2>
    <v-card rounded="lg" class="mb-6 pa-6">
      <v-row align="center">
        <v-col cols="12" sm="4">
          <p class="text-body-2 mb-2">Easing</p>
          <v-btn-toggle v-model="easing" density="compact" variant="outlined" divided mandatory>
            <v-btn value="linear" size="small">Linear</v-btn>
            <v-btn value="ease-out" size="small">Ease out</v-btn>
            <v-btn value="ease-in-out" size="small">Ease in-out</v-btn>
          </v-btn-toggle>
        </v-col>
        <v-col cols="12" sm="4">
          <p class="text-body-2 mb-1">Duration: {{ duration }}ms</p>
          <v-slider v-model="duration" :min="300" :max="4000" :step="100" hide-details density="compact" color="primary" />
        </v-col>
        <v-col cols="12" sm="4">
          <v-btn color="primary" variant="tonal" prepend-icon="mdi-replay" @click="trigger">Replay</v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- Inline examples -->
    <h2 class="text-overline text-medium-emphasis mb-4">Inline examples</h2>
    <v-card rounded="lg" class="mb-6 pa-6">
      <div class="d-flex flex-wrap gap-8">
        <div class="text-center">
          <p class="text-h3 font-weight-black text-primary">
            <CommonAnimatedCounter v-if="triggered" :value="2500" suffix="+" :duration="duration" :easing="easing" />
          </p>
          <p class="text-caption text-medium-emphasis">Customers</p>
        </div>
        <div class="text-center">
          <p class="text-h3 font-weight-black text-success">
            <CommonAnimatedCounter v-if="triggered" :value="4.8" suffix="/5" :decimals="1" :duration="duration" :easing="easing" />
          </p>
          <p class="text-caption text-medium-emphasis">Avg rating</p>
        </div>
        <div class="text-center">
          <p class="text-h3 font-weight-black text-warning">
            <CommonAnimatedCounter v-if="triggered" :value="99" suffix="%" :duration="duration" :easing="easing" />
          </p>
          <p class="text-caption text-medium-emphasis">Satisfaction</p>
        </div>
      </div>
    </v-card>

    <!-- Usage -->
    <h2 class="text-overline text-medium-emphasis mb-4">Usage</h2>
    <v-card rounded="lg" class="pa-6">
      <v-sheet rounded="lg" color="surface-variant" class="pa-4">
        <pre class="text-body-2"><code v-pre>&lt;CommonAnimatedCounter
  :value="48291"
  prefix="$"
  suffix=" users"
  :decimals="0"
  :duration="1500"
  easing="ease-out"
/&gt;</code></pre>
      </v-sheet>
    </v-card>
  </div>
</template>
