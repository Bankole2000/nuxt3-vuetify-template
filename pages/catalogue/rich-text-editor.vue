<script setup lang="ts">
definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Rich Text Editor', disabled: true },
  ],
})

const content = ref('<p>Start editing this text. Try <strong>bold</strong>, <em>italic</em>, or add a <a href="https://example.com">link</a>.</p>')
const readonlyContent = '<h2>Read-only mode</h2><p>This editor instance is <strong>disabled</strong>. Content can be displayed but not edited.</p>'
const disabled = ref(false)
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">Rich Text Editor</h1>
    <p class="text-body-2 text-medium-emphasis mb-8">
      Powered by Tiptap with StarterKit, link and placeholder extensions. No additional UI library required.
    </p>

    <h2 class="text-overline text-medium-emphasis mb-4">Editable</h2>
    <v-card rounded="lg" class="mb-4 pa-5">
      <div class="d-flex align-center justify-space-between mb-4">
        <p class="text-body-2 text-medium-emphasis">Full toolbar with all formatting options.</p>
        <v-switch v-model="disabled" label="Disabled" density="compact" hide-details color="primary" class="flex-grow-0" />
      </div>
      <CommonRichTextEditor v-model="content" :disabled="disabled" />
    </v-card>

    <h2 class="text-overline text-medium-emphasis mb-4">HTML output</h2>
    <v-card rounded="lg" class="mb-8 pa-5">
      <v-sheet rounded="lg" color="surface-variant" class="pa-4">
        <pre class="text-caption" style="white-space: pre-wrap; word-break: break-all;">{{ content }}</pre>
      </v-sheet>
    </v-card>

    <h2 class="text-overline text-medium-emphasis mb-4">Read-only instance</h2>
    <v-card rounded="lg" class="pa-5">
      <CommonRichTextEditor :model-value="readonlyContent" :disabled="true" />
    </v-card>
  </div>
</template>
