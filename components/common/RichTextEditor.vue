<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  minHeight?: string
}>(), {
  modelValue: '',
  placeholder: 'Start typing…',
  disabled: false,
  minHeight: '160px',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const editor = useEditor({
  content: props.modelValue,
  editable: !props.disabled,
  extensions: [
    StarterKit,
    Link.configure({ openOnClick: false }),
    Placeholder.configure({ placeholder: props.placeholder }),
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

watch(() => props.modelValue, (val) => {
  if (editor.value && editor.value.getHTML() !== val) {
    editor.value.commands.setContent(val, false)
  }
})

watch(() => props.disabled, (val) => {
  editor.value?.setEditable(!val)
})

onBeforeUnmount(() => editor.value?.destroy())

const setLink = () => {
  const url = window.prompt('URL', editor.value?.getAttributes('link').href ?? '')
  if (url === null) return
  if (url === '') {
    editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  editor.value?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

const tools = [
  { icon: 'mdi-format-bold', title: 'Bold', action: () => editor.value?.chain().focus().toggleBold().run(), isActive: () => editor.value?.isActive('bold') },
  { icon: 'mdi-format-italic', title: 'Italic', action: () => editor.value?.chain().focus().toggleItalic().run(), isActive: () => editor.value?.isActive('italic') },
  { icon: 'mdi-format-strikethrough', title: 'Strike', action: () => editor.value?.chain().focus().toggleStrike().run(), isActive: () => editor.value?.isActive('strike') },
  { icon: 'mdi-code-tags', title: 'Code', action: () => editor.value?.chain().focus().toggleCode().run(), isActive: () => editor.value?.isActive('code') },
  null,
  { icon: 'mdi-format-header-1', title: 'H1', action: () => editor.value?.chain().focus().toggleHeading({ level: 1 }).run(), isActive: () => editor.value?.isActive('heading', { level: 1 }) },
  { icon: 'mdi-format-header-2', title: 'H2', action: () => editor.value?.chain().focus().toggleHeading({ level: 2 }).run(), isActive: () => editor.value?.isActive('heading', { level: 2 }) },
  { icon: 'mdi-format-header-3', title: 'H3', action: () => editor.value?.chain().focus().toggleHeading({ level: 3 }).run(), isActive: () => editor.value?.isActive('heading', { level: 3 }) },
  null,
  { icon: 'mdi-format-list-bulleted', title: 'Bullet list', action: () => editor.value?.chain().focus().toggleBulletList().run(), isActive: () => editor.value?.isActive('bulletList') },
  { icon: 'mdi-format-list-numbered', title: 'Ordered list', action: () => editor.value?.chain().focus().toggleOrderedList().run(), isActive: () => editor.value?.isActive('orderedList') },
  { icon: 'mdi-code-block-tags', title: 'Code block', action: () => editor.value?.chain().focus().toggleCodeBlock().run(), isActive: () => editor.value?.isActive('codeBlock') },
  { icon: 'mdi-format-quote-close', title: 'Blockquote', action: () => editor.value?.chain().focus().toggleBlockquote().run(), isActive: () => editor.value?.isActive('blockquote') },
  null,
  { icon: 'mdi-link', title: 'Link', action: setLink, isActive: () => editor.value?.isActive('link') },
  { icon: 'mdi-link-off', title: 'Remove link', action: () => editor.value?.chain().focus().unsetLink().run(), isActive: () => false },
  null,
  { icon: 'mdi-undo', title: 'Undo', action: () => editor.value?.chain().focus().undo().run(), isActive: () => false },
  { icon: 'mdi-redo', title: 'Redo', action: () => editor.value?.chain().focus().redo().run(), isActive: () => false },
]
</script>

<template>
  <div class="rte-wrapper rounded-lg border">
    <div class="rte-toolbar d-flex flex-wrap align-center gap-1 pa-2 border-b">
      <template v-for="(tool, i) in tools" :key="i">
        <v-divider v-if="tool === null" vertical class="mx-1" style="height:24px;" />
        <v-btn
          v-else
          :icon="tool.icon"
          :title="tool.title"
          :color="tool.isActive() ? 'primary' : undefined"
          :variant="tool.isActive() ? 'tonal' : 'text'"
          size="x-small"
          density="comfortable"
          :disabled="disabled"
          @click="tool.action"
        />
      </template>
    </div>
    <EditorContent
      :editor="editor"
      class="rte-content pa-3"
      :style="{ minHeight }"
    />
  </div>
</template>

<style>
.rte-wrapper {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.rte-toolbar {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.rte-content .tiptap {
  outline: none;
  min-height: inherit;
}
.rte-content .tiptap p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  color: rgba(var(--v-theme-on-surface), 0.38);
  pointer-events: none;
  float: left;
  height: 0;
}
.rte-content .tiptap blockquote {
  border-left: 3px solid rgba(var(--v-theme-primary), 0.5);
  padding-left: 1rem;
  margin: 0.5rem 0;
  color: rgba(var(--v-theme-on-surface), 0.7);
}
.rte-content .tiptap pre {
  background: rgba(var(--v-theme-on-surface), 0.06);
  border-radius: 6px;
  padding: 0.75rem 1rem;
  font-family: monospace;
}
.rte-content .tiptap code {
  background: rgba(var(--v-theme-on-surface), 0.06);
  border-radius: 3px;
  padding: 0.1em 0.3em;
  font-family: monospace;
  font-size: 0.9em;
}
.rte-content .tiptap a {
  color: rgb(var(--v-theme-primary));
  text-decoration: underline;
  cursor: pointer;
}
.rte-content .tiptap ul,
.rte-content .tiptap ol {
  padding-left: 1.5rem;
}
.rte-content .tiptap h1 { font-size: 1.6em; font-weight: 700; margin: 0.5em 0; }
.rte-content .tiptap h2 { font-size: 1.3em; font-weight: 700; margin: 0.5em 0; }
.rte-content .tiptap h3 { font-size: 1.1em; font-weight: 700; margin: 0.5em 0; }
</style>
