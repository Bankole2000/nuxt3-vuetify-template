<script setup lang="ts">
definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Color Picker', disabled: true },
  ],
})

const color = ref('#1976D2')
const swatchColor = ref('#4CAF50')
const menuColor = ref('#9C27B0')
const menuOpen = ref(false)

const swatches = [
  ['#F44336', '#E91E63', '#9C27B0', '#673AB7'],
  ['#3F51B5', '#2196F3', '#03A9F4', '#00BCD4'],
  ['#009688', '#4CAF50', '#8BC34A', '#CDDC39'],
  ['#FFC107', '#FF9800', '#FF5722', '#795548'],
]

const mode = ref<'hex' | 'rgb' | 'hsl'>('hex')
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">Color Picker</h1>
    <p class="text-body-2 text-medium-emphasis mb-8">
      Vuetify's <code>v-color-picker</code> in hex, RGB and HSL modes, with a swatch palette and menu-activator pattern.
    </p>

    <v-row class="mb-6">
      <!-- Inline full picker -->
      <v-col cols="12" md="6">
        <h2 class="text-overline text-medium-emphasis mb-4">Inline picker</h2>
        <v-card rounded="lg" class="pa-5">
          <div class="d-flex gap-2 mb-4 flex-wrap">
            <v-btn
              v-for="m in ['hex', 'rgb', 'hsl']"
              :key="m"
              :color="mode === m ? 'primary' : 'default'"
              :variant="mode === m ? 'tonal' : 'outlined'"
              size="small"
              @click="mode = m as 'hex' | 'rgb' | 'hsl'"
            >
              {{ m.toUpperCase() }}
            </v-btn>
          </div>
          <v-color-picker
            v-model="color"
            :mode="mode"
            elevation="0"
            rounded="lg"
          />
          <div class="d-flex align-center gap-3 mt-4">
            <div class="rounded-lg flex-shrink-0" :style="{ background: color, width: '40px', height: '40px' }" />
            <p class="text-body-2 font-weight-medium font-monospace">{{ color }}</p>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <!-- Swatch picker -->
        <h2 class="text-overline text-medium-emphasis mb-4">Swatch palette</h2>
        <v-card rounded="lg" class="pa-5 mb-6">
          <v-color-picker
            v-model="swatchColor"
            :swatches="swatches"
            show-swatches
            mode="hex"
            elevation="0"
            hide-canvas
            hide-inputs
            hide-sliders
          />
          <div class="d-flex align-center gap-3 mt-2">
            <div class="rounded-lg flex-shrink-0" :style="{ background: swatchColor, width: '40px', height: '40px' }" />
            <p class="text-body-2 font-weight-medium font-monospace">{{ swatchColor }}</p>
          </div>
        </v-card>

        <!-- Menu activator -->
        <h2 class="text-overline text-medium-emphasis mb-4">Menu activator</h2>
        <v-card rounded="lg" class="pa-5">
          <p class="text-body-2 text-medium-emphasis mb-4">Click the swatch to open the color picker in a menu.</p>
          <div class="d-flex align-center gap-4">
            <v-menu v-model="menuOpen" :close-on-content-click="false" location="bottom start">
              <template #activator="{ props }">
                <div
                  v-bind="props"
                  class="rounded-lg cursor-pointer"
                  :style="{ background: menuColor, width: '44px', height: '44px', border: '2px solid rgba(var(--v-border-color), var(--v-border-opacity))' }"
                  title="Pick colour"
                />
              </template>
              <v-color-picker v-model="menuColor" mode="hex" elevation="4" rounded="lg" />
            </v-menu>
            <div>
              <p class="text-body-2 font-weight-medium font-monospace">{{ menuColor }}</p>
              <p class="text-caption text-medium-emphasis">Click swatch to change</p>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
