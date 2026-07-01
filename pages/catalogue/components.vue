<script setup lang="ts">
definePageMeta({ layout: 'catalogue' })

const colors = ['primary', 'secondary', 'success', 'error', 'warning', 'info']
const variants = ['elevated', 'flat', 'tonal', 'outlined', 'text', 'plain'] as const
const sizes = ['x-small', 'small', 'default', 'large', 'x-large'] as const
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">Components</h1>
    <p class="text-body-2 text-medium-emphasis mb-8">Buttons, chips, badges, avatars, icons and cards.</p>

    <!-- Buttons by variant -->
    <h2 class="text-overline text-medium-emphasis mb-4">Button variants</h2>
    <v-card rounded="lg" class="mb-6 pa-6">
      <div v-for="variant in variants" :key="variant" class="d-flex flex-wrap gap-3 mb-4 align-center">
        <code class="text-caption text-medium-emphasis mr-2" style="min-width: 80px;">{{ variant }}</code>
        <v-btn v-for="color in colors" :key="color" :variant="variant" :color="color" size="small">
          {{ color }}
        </v-btn>
      </div>
    </v-card>

    <!-- Button sizes -->
    <h2 class="text-overline text-medium-emphasis mb-4">Button sizes</h2>
    <v-card rounded="lg" class="mb-6 pa-6">
      <div class="d-flex flex-wrap gap-3 align-center">
        <v-btn v-for="size in sizes" :key="size" :size="size" color="primary">{{ size }}</v-btn>
      </div>
    </v-card>

    <!-- Icon buttons -->
    <h2 class="text-overline text-medium-emphasis mb-4">Icon buttons</h2>
    <v-card rounded="lg" class="mb-6 pa-6">
      <div class="d-flex flex-wrap gap-3 align-center">
        <v-btn v-for="color in colors" :key="color" :color="color" icon="mdi-heart" variant="tonal" />
        <v-btn icon="mdi-dots-vertical" variant="text" />
        <v-btn icon="mdi-share-variant" variant="outlined" color="primary" />
      </div>
    </v-card>

    <!-- Chips -->
    <h2 class="text-overline text-medium-emphasis mb-4">Chips</h2>
    <v-card rounded="lg" class="mb-6 pa-6">
      <div class="d-flex flex-wrap gap-3 mb-4">
        <v-chip v-for="color in colors" :key="color" :color="color" variant="tonal">{{ color }}</v-chip>
      </div>
      <div class="d-flex flex-wrap gap-3 mb-4">
        <v-chip v-for="color in colors" :key="color" :color="color" variant="outlined">{{ color }}</v-chip>
      </div>
      <div class="d-flex flex-wrap gap-3">
        <v-chip prepend-icon="mdi-check-circle" color="success" variant="tonal">Completed</v-chip>
        <v-chip prepend-icon="mdi-clock-outline" color="warning" variant="tonal">Pending</v-chip>
        <v-chip prepend-icon="mdi-close-circle" color="error" variant="tonal">Failed</v-chip>
        <v-chip closable color="primary" variant="tonal">Closable</v-chip>
      </div>
    </v-card>

    <!-- Avatars -->
    <h2 class="text-overline text-medium-emphasis mb-4">Avatars</h2>
    <v-card rounded="lg" class="mb-6 pa-6">
      <div class="d-flex flex-wrap gap-4 align-center mb-4">
        <v-avatar v-for="color in colors" :key="color" :color="color" variant="tonal" size="40">
          <span class="text-body-2 font-weight-bold">{{ color.charAt(0).toUpperCase() }}</span>
        </v-avatar>
      </div>
      <div class="d-flex flex-wrap gap-4 align-center">
        <v-avatar v-for="size in [24, 32, 40, 48, 56, 64]" :key="size" color="primary" variant="tonal" :size="size">
          <v-icon icon="mdi-account" :size="size * 0.6" />
        </v-avatar>
      </div>
    </v-card>

    <!-- Badges -->
    <h2 class="text-overline text-medium-emphasis mb-4">Badges</h2>
    <v-card rounded="lg" class="mb-6 pa-6">
      <div class="d-flex flex-wrap gap-6 align-center">
        <v-badge v-for="color in colors" :key="color" :color="color" content="9">
          <v-icon icon="mdi-bell-outline" size="28" />
        </v-badge>
        <v-badge color="error" dot>
          <v-icon icon="mdi-account-outline" size="28" />
        </v-badge>
      </div>
    </v-card>

    <!-- Cards -->
    <h2 class="text-overline text-medium-emphasis mb-4">Cards</h2>
    <v-row>
      <v-col cols="12" sm="4">
        <v-card rounded="lg">
          <v-card-title class="pa-5 pb-2">Default card</v-card-title>
          <v-card-text class="px-5 pb-5 text-body-2 text-medium-emphasis">
            Standard elevated card with title and content area.
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card rounded="lg" variant="outlined">
          <v-card-title class="pa-5 pb-2">Outlined card</v-card-title>
          <v-card-text class="px-5 pb-5 text-body-2 text-medium-emphasis">
            Border only, no elevation. Good for secondary content.
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card rounded="lg" color="primary" variant="tonal">
          <v-card-title class="pa-5 pb-2">Tonal card</v-card-title>
          <v-card-text class="px-5 pb-5 text-body-2">
            Tinted with a theme color. Good for callouts.
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
