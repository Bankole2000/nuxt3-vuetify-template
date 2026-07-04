<script setup lang="ts">
import { useTheme } from 'vuetify'

export interface ThemeColours {
  primary:    string
  secondary:  string
  accent:     string
  error:      string
  warning:    string
  info:       string
  success:    string
  background: string
  surface:    string
}

export interface ThemePreset {
  name:  string
  light: ThemeColours
  dark:  ThemeColours
}

const props = withDefaults(defineProps<{
  modelValue: ThemeColours
  mode: 'light' | 'dark'
  presets?: ThemePreset[]
  readonly?: boolean
}>(), {
  presets: () => [],
  readonly: false,
})

const emit = defineEmits<{
  'update:modelValue': [colours: ThemeColours]
  'apply': []
}>()

const vuetifyTheme = useTheme()

const colourKeys: (keyof ThemeColours)[] = [
  'primary', 'secondary', 'accent', 'error', 'warning', 'info', 'success', 'background', 'surface',
]

const originalColours = ref<ThemeColours>({ ...props.modelValue })

function luminance(hex: string): number {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16) / 255
  const g = parseInt(clean.substring(2, 4), 16) / 255
  const b = parseInt(clean.substring(4, 6), 16) / 255
  const toLinear = (c: number) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

function contrastText(hex: string): string {
  return luminance(hex) > 0.4 ? '#000000' : '#ffffff'
}

function updateKey(key: keyof ThemeColours, value: string) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

function applyToApp() {
  const themeName = vuetifyTheme.global.name.value
  const themeColors = vuetifyTheme.themes.value[themeName]?.colors
  if (themeColors) {
    for (const key of colourKeys) {
      themeColors[key] = props.modelValue[key]!
    }
  }
  emit('apply')
}

function loadPreset(preset: ThemePreset) {
  emit('update:modelValue', { ...(props.mode === 'light' ? preset.light : preset.dark) })
}

function resetColours() {
  emit('update:modelValue', { ...originalColours.value })
}

async function copyCssVars() {
  const lines = colourKeys.map(k => `  --color-${k}: ${props.modelValue[k]!};`)
  const css = `:root {\n${lines.join('\n')}\n}`
  await navigator.clipboard.writeText(css)
}

async function copyJsConfig() {
  const entries = colourKeys.map(k => `      ${k}: '${props.modelValue[k]!}',`)
  const js = `// vuetify theme colors\ncolors: {\n${entries.join('\n')}\n}`
  await navigator.clipboard.writeText(js)
}

const previewSurfaceText = computed(() => contrastText(props.modelValue.surface))

const labelFor: Record<keyof ThemeColours, string> = {
  primary: 'Primary',
  secondary: 'Secondary',
  accent: 'Accent',
  error: 'Error',
  warning: 'Warning',
  info: 'Info',
  success: 'Success',
  background: 'Background',
  surface: 'Surface',
}
</script>

<template>
  <div>
    <div v-if="presets && presets.length" class="d-flex flex-wrap gap-2 mb-5">
      <v-chip
        v-for="preset in presets"
        :key="preset.name"
        :disabled="readonly"
        variant="outlined"
        size="small"
        class="cursor-pointer"
        @click="loadPreset(preset)"
      >
        <template #prepend>
          <span
            class="rounded-circle mr-1"
            :style="{
              width: '10px',
              height: '10px',
              background: mode === 'light' ? preset.light.primary : preset.dark.primary,
              display: 'inline-block',
            }"
          />
        </template>
        {{ preset.name }}
      </v-chip>
    </div>

    <v-row class="mb-4">
      <v-col
        v-for="key in colourKeys"
        :key="key"
        cols="6"
        sm="4"
        md="3"
        lg="2"
      >
        <v-card rounded="lg" variant="outlined" class="pa-3">
          <div
            class="rounded-lg mb-2"
            :style="{
              background: modelValue[key],
              height: '48px',
              border: '1px solid rgba(0,0,0,0.08)',
            }"
          />
          <p class="text-caption font-weight-medium mb-2">{{ labelFor[key] }}</p>
          <div class="d-flex align-center gap-1">
            <input
              type="color"
              :value="modelValue[key]"
              :disabled="readonly"
              style="width: 28px; height: 28px; border: none; background: none; cursor: pointer; padding: 0; flex-shrink: 0;"
              @input="(e) => updateKey(key, (e.target as HTMLInputElement).value)"
            />
            <v-text-field
              :model-value="modelValue[key]"
              :readonly="readonly"
              density="compact"
              variant="plain"
              hide-details
              class="text-caption font-monospace"
              style="min-width: 0; font-size: 11px;"
              @update:model-value="(v) => updateKey(key, v)"
            />
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-card rounded="lg" variant="tonal" class="pa-4 mb-5">
      <p class="text-overline text-medium-emphasis mb-3">Live preview</p>
      <div
        class="rounded-lg pa-4"
        :style="{ background: modelValue.surface, color: previewSurfaceText }"
      >
        <p class="text-body-2 font-weight-medium mb-3" :style="{ color: previewSurfaceText }">
          Sample content on surface
        </p>
        <div class="d-flex flex-wrap gap-2 align-center mb-3">
          <button
            class="rounded px-3 py-1 text-body-2 font-weight-medium"
            :style="{ background: modelValue.primary, color: contrastText(modelValue.primary), border: 'none', cursor: 'default' }"
          >
            Primary
          </button>
          <button
            class="rounded px-3 py-1 text-body-2 font-weight-medium"
            :style="{ background: modelValue.secondary, color: contrastText(modelValue.secondary), border: 'none', cursor: 'default' }"
          >
            Secondary
          </button>
        </div>
        <div class="d-flex flex-wrap gap-2 mb-3">
          <span
            class="rounded-pill px-3 py-1 text-caption font-weight-medium"
            :style="{ background: modelValue.success, color: contrastText(modelValue.success) }"
          >
            Success
          </span>
          <span
            class="rounded-pill px-3 py-1 text-caption font-weight-medium"
            :style="{ background: modelValue.error, color: contrastText(modelValue.error) }"
          >
            Error
          </span>
          <span
            class="rounded-pill px-3 py-1 text-caption font-weight-medium"
            :style="{ background: modelValue.info, color: contrastText(modelValue.info) }"
          >
            Info
          </span>
        </div>
        <div
          class="rounded pa-3 text-body-2"
          :style="{ background: modelValue.warning, color: contrastText(modelValue.warning) }"
        >
          Warning alert — check your settings before proceeding.
        </div>
      </div>
    </v-card>

    <div class="d-flex flex-wrap gap-2">
      <v-btn
        :disabled="readonly"
        color="primary"
        variant="flat"
        prepend-icon="mdi-palette-advanced"
        size="small"
        @click="applyToApp"
      >
        Apply to app
      </v-btn>
      <v-btn
        variant="outlined"
        size="small"
        prepend-icon="mdi-code-braces"
        @click="copyJsConfig"
      >
        Copy JS config
      </v-btn>
      <v-btn
        variant="outlined"
        size="small"
        prepend-icon="mdi-language-css3"
        @click="copyCssVars"
      >
        Copy CSS vars
      </v-btn>
      <v-btn
        :disabled="readonly"
        variant="text"
        size="small"
        prepend-icon="mdi-restore"
        @click="resetColours"
      >
        Reset
      </v-btn>
    </div>
  </div>
</template>
