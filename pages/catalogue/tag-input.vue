<script setup lang="ts">
definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Tag Input', disabled: true },
  ],
})

const basicTags = ref(['vue', 'nuxt'])
const skillTags = ref(['TypeScript', 'Vue 3', 'Pinia'])
const limitedTags = ref<string[]>([])
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">Tag Input</h1>
    <p class="text-body-2 text-medium-emphasis mb-8">
      Chip-based multi-value input. Press <kbd>Enter</kbd> or <kbd>,</kbd> to add a tag.
      Backspace removes the last tag when the input is empty.
    </p>

    <v-row>
      <v-col cols="12" md="6">
        <h2 class="text-overline text-medium-emphasis mb-4">Basic</h2>
        <v-card rounded="lg" class="pa-5 mb-6">
          <CommonTagInput v-model="basicTags" label="Topics" placeholder="Add a topic…" />
          <p class="text-caption text-medium-emphasis mt-3">Value: {{ JSON.stringify(basicTags) }}</p>
        </v-card>

        <h2 class="text-overline text-medium-emphasis mb-4">Limited to 3 tags</h2>
        <v-card rounded="lg" class="pa-5">
          <CommonTagInput
            v-model="limitedTags"
            label="Select up to 3"
            :max-tags="3"
            placeholder="Add a tag…"
          />
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <h2 class="text-overline text-medium-emphasis mb-4">Skills</h2>
        <v-card rounded="lg" class="pa-5 mb-6">
          <CommonTagInput
            v-model="skillTags"
            label="Skills"
            placeholder="Add a skill…"
            :max-tags="10"
          />
        </v-card>

        <h2 class="text-overline text-medium-emphasis mb-4">Usage</h2>
        <v-card rounded="lg" class="pa-5">
          <v-sheet rounded="lg" color="surface-variant" class="pa-4">
            <pre v-pre class="text-body-2"><code>&lt;CommonTagInput
  v-model="tags"
  label="Tags"
  placeholder="Add a tag…"
  :max-tags="10"
  :allow-duplicates="false"
  :delimiters="['Enter', ',']"
/&gt;</code></pre>
          </v-sheet>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
