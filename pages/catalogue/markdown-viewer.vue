<script setup lang="ts">
definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Markdown Viewer', disabled: true },
  ],
})

useSeo({
  title: 'Markdown Viewer',
  description: 'Sanitised markdown renderer with syntax-highlighted code blocks, copy buttons, dark-mode-aware styles and a live editor split-pane.',
})

const tab = ref('docs')
const infoDialog = ref(false)

const docsMarkdown = `# MarkdownViewer

A lightweight, dependency-free markdown renderer built for Nuxt 3 + Vuetify 4.
Renders sanitised markdown to HTML with syntax-aware code blocks, dark mode support
and per-block copy buttons — no external parser required.

---

## Installation

No extra packages needed. The component is part of the \`components/common/\` directory
and is auto-imported by Nuxt.

\`\`\`bash
# Already included — no install step
npx nuxt dev
\`\`\`

---

## Usage

\`\`\`vue
<CommonMarkdownViewer
  :content="markdownString"
  :show-copy="true"
  :show-raw="true"
  code-theme="auto"
/>
\`\`\`

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`content\` | \`string\` | — | Raw markdown string to render |
| \`sanitize\` | \`boolean\` | \`true\` | Strip potentially dangerous HTML from output |
| \`codeTheme\` | \`'light' \\| 'dark' \\| 'auto'\` | \`'auto'\` | Code block background theme |
| \`maxHeight\` | \`string\` | \`undefined\` | CSS max-height; enables vertical scroll when set |
| \`showCopy\` | \`boolean\` | \`true\` | Show copy-to-clipboard button on code blocks |
| \`showRaw\` | \`boolean\` | \`false\` | Adds a Raw / Rendered toggle above the content |

---

## Supported syntax

The renderer handles all common Markdown constructs:

- **Headings** — \`#\` through \`######\`
- **Inline formatting** — \`**bold**\`, \`*italic*\`, \`~~strikethrough~~\`, \`\`inline code\`\`
- **Fenced code blocks** with language label
- **Blockquotes** with left-border accent
- **Unordered and ordered lists**
- **Task lists** — \`- [ ] unchecked\` / \`- [x] checked\`
- **Tables** with header row and alternating row highlight
- **Horizontal rules** — \`---\`
- **Links** — \`[text](url)\` — open in new tab
- **Images** — \`![alt](src)\` — responsive, rounded

---

## Examples

### TypeScript composable

\`\`\`typescript
import { ref, computed } from 'vue'

const markdown = ref('# Hello')

const wordCount = computed(() =>
  markdown.value.trim().split(/\\s+/).length
)
\`\`\`

### Bash install

\`\`\`bash
pnpm add nuxt vuetify vite-plugin-vuetify
npx nuxi init my-app
cd my-app && pnpm dev
\`\`\`

### Dark-mode code theme

\`\`\`typescript
// Force dark code blocks regardless of system theme
const props = defineProps<{ codeTheme: 'light' | 'dark' | 'auto' }>()
\`\`\`

---

## Task list example

- [x] Hand-rolled parser — zero dependencies
- [x] Copy buttons on code blocks
- [x] Dark mode aware
- [x] Tables with horizontal scroll
- [ ] Syntax colouring via highlight.js (opt-in)
- [ ] Mermaid diagram support

---

> **Note:** The sanitizer strips \`<script>\`, \`<iframe>\` and event handler attributes from
> any raw HTML embedded in the markdown source. This prevents XSS when rendering
> user-supplied content.
`

const releaseNotesMarkdown = `# Release Notes

---

## v3.2.0 — 2026-06-15

### Added
- \`showRaw\` prop — toggle between rendered output and raw markdown source
- Language label badge on fenced code blocks (\`\`\`typescript, \`\`\`vue, etc.)
- Task list checkboxes (\`- [ ] / - [x]\`) now rendered as native disabled inputs
- \`maxHeight\` prop for constrained-height scrollable regions
- Strikethrough support via \`~~text~~\`

### Fixed
- Tables no longer overflow their container on narrow screens (now \`display: block; overflow-x: auto\`)
- Copy button now correctly unescapes HTML entities before writing to clipboard
- Blockquote nesting renders correctly when a blockquote contains another blockquote

---

## v3.1.0 — 2026-05-03

### Added
- \`codeTheme\` prop with \`'light'\`, \`'dark'\` and \`'auto'\` modes
- Copy-to-clipboard button on every fenced code block — appears on hover, shows checkmark on success
- Ordered list (\`1. 2. 3.\`) rendering
- Image support — \`![alt](src)\` renders with \`max-width: 100%\` and rounded corners

### Breaking changes
- Renamed prop \`theme\` → \`codeTheme\` to avoid conflict with Vuetify's theme injection

---

## v3.0.0 — 2026-04-01

### Added
- Initial release as a standalone \`CommonMarkdownViewer\` component
- Headings \`h1\`–\`h6\`, paragraphs, \`**bold**\`, \`*italic*\`, \`\`inline code\`\`
- Fenced code blocks with background styling
- Blockquotes with primary-colour left border
- Unordered lists and horizontal rules
- Link handling — all links open in \`_blank\` with \`rel="noopener noreferrer"\`
- \`sanitize\` prop to strip \`<script>\` and event handlers from raw HTML pass-throughs

### Breaking changes
- Replaced \`v-html\` passthrough mode with the built-in renderer — raw HTML in markdown
  is now sanitised by default; set \`:sanitize="false"\` only for fully trusted sources
`

const LIVE_SEED = `# Live Editor

Edit this markdown and see it render in real time on the right.

## Features to try

- **Bold**, *italic*, ~~strikethrough~~
- \`inline code\` snippets
- [Links](https://vuetifyjs.com) open in new tabs

## Code block

\`\`\`typescript
const greet = (name: string) => \`Hello, \${name}!\`
console.log(greet('world'))
\`\`\`

## Task list

- [x] Hand-rolled parser
- [x] Dark mode
- [ ] Your feature here

## Table

| Language | Paradigm | Type system |
|----------|----------|-------------|
| TypeScript | Multi | Static |
| Vue | Reactive | Dynamic |
| Rust | Systems | Static |

> Tip: Switch to **Raw** mode above to inspect the markdown source.
`

const liveContent = ref(LIVE_SEED)

const useCases = [
  {
    number: '#1',
    app: 'Portfolio Manager',
    icon: 'mdi-briefcase-outline',
    color: 'primary',
    description: 'Render project README files, case study write-ups and integration docs directly in the portfolio without a separate CMS.',
  },
  {
    number: '#2',
    app: 'Roadmap Builder',
    icon: 'mdi-map-outline',
    color: 'blue',
    description: 'Display feature descriptions, acceptance criteria and release notes written in Markdown by product managers.',
  },
  {
    number: '#3',
    app: 'Workflow Engine',
    icon: 'mdi-vector-polyline',
    color: 'indigo',
    description: 'Render step documentation, node descriptions and inline help text authored in Markdown inside workflow node editors.',
  },
  {
    number: 'General',
    app: 'Docs Sites',
    icon: 'mdi-book-open-outline',
    color: 'teal',
    description: 'Any page that surfaces documentation, help articles or onboarding guides stored as Markdown files in a repo or CMS.',
  },
  {
    number: 'General',
    app: 'CMS Content',
    icon: 'mdi-text-box-outline',
    color: 'warning',
    description: 'Blog posts, changelogs and knowledge-base articles written in Markdown and served from a headless CMS or flat-file store.',
  },
  {
    number: 'General',
    app: 'README Rendering',
    icon: 'mdi-github',
    color: 'blue-grey',
    description: 'Fetch and display GitHub or GitLab README files inside an app dashboard so users never leave the product to read docs.',
  },
]
</script>

<template>
  <div>
    <div class="d-flex align-center gap-3 mb-1">
      <h1 class="text-h5 font-weight-bold">Markdown Viewer</h1>
      <v-btn
        icon="mdi-information-outline"
        variant="text"
        size="small"
        @click="infoDialog = true"
      />
    </div>
    <p class="text-body-2 text-medium-emphasis mb-6">
      Dependency-free markdown renderer with fenced code blocks, copy buttons, table support,
      task lists, blockquotes and full dark-mode awareness. No external parser — hand-rolled
      for zero bundle overhead.
    </p>

    <v-tabs v-model="tab" density="compact" class="mb-6">
      <v-tab value="docs">
        <v-icon start icon="mdi-file-document-outline" size="16" />
        Documentation
      </v-tab>
      <v-tab value="release-notes">
        <v-icon start icon="mdi-tag-outline" size="16" />
        Release Notes
      </v-tab>
      <v-tab value="live">
        <v-icon start icon="mdi-pencil-outline" size="16" />
        Live Editor
      </v-tab>
    </v-tabs>

    <v-window v-model="tab">

      <v-window-item value="docs">
        <v-card rounded="lg" class="pa-6">
          <CommonMarkdownViewer
            :content="docsMarkdown"
            :show-copy="true"
            :show-raw="false"
            code-theme="auto"
          />
        </v-card>
      </v-window-item>

      <v-window-item value="release-notes">
        <v-card rounded="lg" class="pa-6">
          <CommonMarkdownViewer
            :content="releaseNotesMarkdown"
            :show-copy="true"
            :show-raw="false"
            code-theme="auto"
          />
        </v-card>
      </v-window-item>

      <v-window-item value="live">
        <p class="text-caption text-medium-emphasis mb-3">
          Type markdown on the left — the rendered output updates live on the right.
          Drag the divider to resize. Toggle to Raw mode above the preview to inspect the parsed source.
        </p>
        <CommonSplitPane :initial-split="50" :min-size="240" style="height: 560px; border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); border-radius: 8px; overflow: hidden;">
          <template #a>
            <div class="d-flex flex-column" style="height: 100%;">
              <div class="mv-pane-header">
                <v-icon icon="mdi-pencil-outline" size="14" class="mr-1" />
                Markdown source
              </div>
              <v-textarea
                v-model="liveContent"
                variant="plain"
                hide-details
                no-resize
                rows="24"
                class="mv-textarea flex-grow-1"
                style="font-size: 0.8125rem; line-height: 1.65; overflow-y: auto;"
              />
            </div>
          </template>
          <template #b>
            <div class="d-flex flex-column" style="height: 100%; overflow: hidden;">
              <div class="mv-pane-header">
                <v-icon icon="mdi-eye-outline" size="14" class="mr-1" />
                Preview
              </div>
              <div class="pa-5 flex-grow-1" style="overflow-y: auto;">
                <CommonMarkdownViewer
                  :content="liveContent"
                  :show-copy="true"
                  :show-raw="true"
                  code-theme="auto"
                />
              </div>
            </div>
          </template>
        </CommonSplitPane>
      </v-window-item>

    </v-window>

    <v-dialog v-model="infoDialog" max-width="640">
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center gap-2 pa-5 pb-2">
          <v-icon icon="mdi-language-markdown-outline" color="blue-grey" />
          Use Cases
        </v-card-title>
        <v-card-text class="pa-5 pt-3">
          <p class="text-body-2 text-medium-emphasis mb-5">
            The Markdown Viewer component works across these apps in the template ecosystem.
          </p>
          <v-row>
            <v-col v-for="uc in useCases" :key="uc.app" cols="12" sm="6">
              <div class="d-flex gap-3">
                <v-avatar :color="uc.color" variant="tonal" size="36" rounded="lg" class="flex-shrink-0">
                  <v-icon :icon="uc.icon" size="18" />
                </v-avatar>
                <div>
                  <div class="d-flex align-center gap-1 mb-1">
                    <span class="text-body-2 font-weight-bold">{{ uc.app }}</span>
                    <v-chip :color="uc.color" variant="flat" size="x-small">{{ uc.number }}</v-chip>
                  </div>
                  <p class="text-caption text-medium-emphasis">{{ uc.description }}</p>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-5 pt-0">
          <v-spacer />
          <v-btn variant="tonal" rounded="lg" @click="infoDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.mv-pane-header {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  padding: 7px 14px;
  background: rgba(var(--v-theme-on-surface), 0.03);
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  color: rgba(var(--v-theme-on-surface), 0.55);
}

.mv-textarea :deep(textarea) {
  font-family: 'Roboto Mono', 'Courier New', monospace !important;
  padding: 16px !important;
  resize: none;
}

</style>
