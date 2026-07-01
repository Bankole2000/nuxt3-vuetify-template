<script setup lang="ts">
definePageMeta({ layout: 'catalogue' })

const typeScale = [
  { class: 'text-h1', label: 'h1', sample: 'Heading 1' },
  { class: 'text-h2', label: 'h2', sample: 'Heading 2' },
  { class: 'text-h3', label: 'h3', sample: 'Heading 3' },
  { class: 'text-h4', label: 'h4', sample: 'Heading 4' },
  { class: 'text-h5', label: 'h5', sample: 'Heading 5' },
  { class: 'text-h6', label: 'h6', sample: 'Heading 6' },
  { class: 'text-subtitle-1', label: 'subtitle-1', sample: 'Subtitle 1 — supporting text' },
  { class: 'text-subtitle-2', label: 'subtitle-2', sample: 'Subtitle 2 — supporting text' },
  { class: 'text-body-1', label: 'body-1', sample: 'Body 1 — the default paragraph style used across the app.' },
  { class: 'text-body-2', label: 'body-2', sample: 'Body 2 — smaller body text for dense UI.' },
  { class: 'text-caption', label: 'caption', sample: 'Caption — metadata, timestamps, helper text.' },
  { class: 'text-overline', label: 'overline', sample: 'Overline label' },
]

const colors = [
  { label: 'primary', class: 'text-primary' },
  { label: 'secondary', class: 'text-secondary' },
  { label: 'success', class: 'text-success' },
  { label: 'error', class: 'text-error' },
  { label: 'warning', class: 'text-warning' },
  { label: 'info', class: 'text-info' },
  { label: 'medium-emphasis', class: 'text-medium-emphasis' },
  { label: 'disabled', class: 'text-disabled' },
]

const weights = [
  { label: 'thin', class: 'font-weight-thin' },
  { label: 'light', class: 'font-weight-light' },
  { label: 'regular', class: 'font-weight-regular' },
  { label: 'medium', class: 'font-weight-medium' },
  { label: 'bold', class: 'font-weight-bold' },
  { label: 'black', class: 'font-weight-black' },
]
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">Typography</h1>
    <p class="text-body-2 text-medium-emphasis mb-8">Vuetify typography utility classes available throughout the app.</p>

    <h2 class="text-body-1 font-weight-bold text-medium-emphasis text-uppercase mb-4 text-caption text-overline">Type scale</h2>
    <v-card rounded="lg" class="mb-8">
      <v-list>
        <template v-for="(item, i) in typeScale" :key="item.class">
          <v-divider v-if="i > 0" />
          <v-list-item class="py-4 px-6">
            <template #prepend>
              <code class="text-caption text-medium-emphasis mr-6" style="min-width: 90px;">{{ item.label }}</code>
            </template>
            <span :class="item.class">{{ item.sample }}</span>
          </v-list-item>
        </template>
      </v-list>
    </v-card>

    <h2 class="text-overline text-medium-emphasis mb-4">Color utilities</h2>
    <v-card rounded="lg" class="mb-8 pa-6">
      <div class="d-flex flex-wrap gap-4">
        <div v-for="color in colors" :key="color.label" class="text-center">
          <p :class="[color.class, 'text-h6', 'font-weight-bold', 'mb-1']">Aa</p>
          <code class="text-caption">{{ color.class }}</code>
        </div>
      </div>
    </v-card>

    <h2 class="text-overline text-medium-emphasis mb-4">Font weights</h2>
    <v-card rounded="lg" class="pa-6">
      <div class="d-flex flex-wrap gap-6 align-end">
        <div v-for="weight in weights" :key="weight.label">
          <p :class="[weight.class, 'text-h5', 'mb-1']">Ag</p>
          <code class="text-caption">{{ weight.class }}</code>
        </div>
      </div>
    </v-card>
  </div>
</template>
