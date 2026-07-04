<script setup lang="ts">
import type { ThemeColours, ThemePreset } from '~/components/common/ThemeBuilder.vue'

definePageMeta({ layout: 'catalogue' })

useSeo({
  title: 'Theme Builder',
  description: 'Live Vuetify theme colour editor with preset palettes, contrast-aware preview, CSS vars export and one-click apply to the running app.',
})

const mode = ref<'light' | 'dark'>('light')

const defaultLight: ThemeColours = {
  primary:    '#1867C0',
  secondary:  '#48A9A6',
  accent:     '#82B1FF',
  error:      '#B00020',
  warning:    '#FB8C00',
  info:       '#2196F3',
  success:    '#4CAF50',
  background: '#FAFAFA',
  surface:    '#FFFFFF',
}

const defaultDark: ThemeColours = {
  primary:    '#2196F3',
  secondary:  '#54B6B2',
  accent:     '#FF4081',
  error:      '#FF5252',
  warning:    '#FB8C00',
  info:       '#2196F3',
  success:    '#4CAF50',
  background: '#121212',
  surface:    '#1E1E1E',
}

const lightColours = ref<ThemeColours>({ ...defaultLight })
const darkColours  = ref<ThemeColours>({ ...defaultDark })

const colours = computed({
  get: () => mode.value === 'light' ? lightColours.value : darkColours.value,
  set: (v: ThemeColours) => {
    if (mode.value === 'light') lightColours.value = v
    else darkColours.value = v
  },
})

const presets: ThemePreset[] = [
  {
    name: 'Ocean',
    light: {
      primary:    '#006994',
      secondary:  '#0099CC',
      accent:     '#00BCD4',
      error:      '#D32F2F',
      warning:    '#F57C00',
      info:       '#0288D1',
      success:    '#00796B',
      background: '#F0F8FF',
      surface:    '#FFFFFF',
    },
    dark: {
      primary:    '#29B6F6',
      secondary:  '#26C6DA',
      accent:     '#80DEEA',
      error:      '#EF9A9A',
      warning:    '#FFB74D',
      info:       '#4FC3F7',
      success:    '#80CBC4',
      background: '#0A1929',
      surface:    '#0D2137',
    },
  },
  {
    name: 'Sunset',
    light: {
      primary:    '#E64A19',
      secondary:  '#7B1FA2',
      accent:     '#FF6F00',
      error:      '#C62828',
      warning:    '#FF8F00',
      info:       '#1565C0',
      success:    '#2E7D32',
      background: '#FFF8F0',
      surface:    '#FFFFFF',
    },
    dark: {
      primary:    '#FF7043',
      secondary:  '#CE93D8',
      accent:     '#FFCA28',
      error:      '#EF9A9A',
      warning:    '#FFB74D',
      info:       '#90CAF9',
      success:    '#A5D6A7',
      background: '#1A0A00',
      surface:    '#2C1100',
    },
  },
  {
    name: 'Forest',
    light: {
      primary:    '#2E7D32',
      secondary:  '#6D4C41',
      accent:     '#8BC34A',
      error:      '#C62828',
      warning:    '#E65100',
      info:       '#1565C0',
      success:    '#1B5E20',
      background: '#F1F8E9',
      surface:    '#FFFFFF',
    },
    dark: {
      primary:    '#66BB6A',
      secondary:  '#A1887F',
      accent:     '#AED581',
      error:      '#EF9A9A',
      warning:    '#FFCC80',
      info:       '#90CAF9',
      success:    '#C8E6C9',
      background: '#0A1200',
      surface:    '#141E0A',
    },
  },
  {
    name: 'Monochrome',
    light: {
      primary:    '#212121',
      secondary:  '#616161',
      accent:     '#9E9E9E',
      error:      '#B71C1C',
      warning:    '#795548',
      info:       '#424242',
      success:    '#37474F',
      background: '#F5F5F5',
      surface:    '#FFFFFF',
    },
    dark: {
      primary:    '#EEEEEE',
      secondary:  '#BDBDBD',
      accent:     '#9E9E9E',
      error:      '#EF9A9A',
      warning:    '#BCAAA4',
      info:       '#E0E0E0',
      success:    '#B0BEC5',
      background: '#0D0D0D',
      surface:    '#1A1A1A',
    },
  },
]

const snackbar = ref(false)
const infoDialog = ref(false)

function onApply() {
  snackbar.value = true
}
</script>

<template>
  <div>
    <div class="d-flex align-start justify-space-between flex-wrap gap-4 mb-2">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Theme Builder</h1>
        <p class="text-body-2 text-medium-emphasis">
          Edit colours for each Vuetify theme role, preview contrast in real time, then apply to the running app or export for your config.
        </p>
      </div>
      <v-btn
        variant="text"
        size="small"
        prepend-icon="mdi-information-outline"
        @click="infoDialog = true"
      >
        Use cases
      </v-btn>
    </div>

    <div class="d-flex gap-2 mb-6 mt-4">
      <v-btn
        :color="mode === 'light' ? 'primary' : 'default'"
        :variant="mode === 'light' ? 'tonal' : 'outlined'"
        size="small"
        prepend-icon="mdi-weather-sunny"
        @click="mode = 'light'"
      >
        Light
      </v-btn>
      <v-btn
        :color="mode === 'dark' ? 'primary' : 'default'"
        :variant="mode === 'dark' ? 'tonal' : 'outlined'"
        size="small"
        prepend-icon="mdi-weather-night"
        @click="mode = 'dark'"
      >
        Dark
      </v-btn>
    </div>

    <CommonThemeBuilder
      v-model="colours"
      :mode="mode"
      :presets="presets"
      @apply="onApply"
    />

    <v-card rounded="lg" variant="outlined" class="mt-8">
      <v-card-title class="text-body-2 font-weight-bold pa-4 pb-0">Current colour config</v-card-title>
      <v-card-text>
        <pre class="text-caption font-monospace" style="overflow-x: auto; white-space: pre-wrap; word-break: break-all;">{{ JSON.stringify(colours, null, 2) }}</pre>
      </v-card-text>
    </v-card>

    <v-snackbar v-model="snackbar" :timeout="2500" color="success">
      Theme applied to app
      <template #actions>
        <v-btn variant="text" @click="snackbar = false">Dismiss</v-btn>
      </template>
    </v-snackbar>

    <v-dialog v-model="infoDialog" max-width="520">
      <v-card rounded="lg">
        <v-card-title class="text-h6 pa-6 pb-2">Theme Builder — use cases</v-card-title>
        <v-card-text class="pa-6 pt-2">
          <v-list density="compact" class="pa-0">
            <v-list-item prepend-icon="mdi-brush-variant" title="Brand onboarding" subtitle="Let clients input their brand hex colours and immediately see a branded UI preview before any code is written." />
            <v-list-item prepend-icon="mdi-contrast-circle" title="Accessibility checks" subtitle="Verify WCAG contrast for every colour role in light and dark mode before shipping the design." />
            <v-list-item prepend-icon="mdi-palette-swatch" title="Multi-tenant theming" subtitle="Store a ThemeColours object per tenant in the database and inject it at runtime via useTheme()." />
            <v-list-item prepend-icon="mdi-code-json" title="Config generation" subtitle="Copy the JS config block straight into nuxt.config.ts — no manual colour hunting." />
            <v-list-item prepend-icon="mdi-moon-waning-crescent" title="Dark mode parity" subtitle="Edit light and dark variants side-by-side to ensure balanced tone contrast across modes." />
          </v-list>
        </v-card-text>
        <v-card-actions class="px-6 pb-5">
          <v-spacer />
          <v-btn variant="tonal" @click="infoDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
