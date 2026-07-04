<script setup lang="ts">
definePageMeta({ layout: 'catalogue' })
useSeo({ title: 'Split Pane', description: 'Resizable split pane component — drag the divider, double-click to reset, full keyboard support. Horizontal and vertical layouts.' })

const tab      = ref('editor')
const infoOpen = ref(false)

const USECASES = [
  {
    context: 'General UI patterns',
    icon: 'mdi-view-split-vertical',
    color: 'indigo',
    items: [
      { label: 'Editor + live preview', detail: 'Type on the left, see the rendered result on the right. No context-switching.' },
      { label: 'Master / detail', detail: 'List or tree on the left; clicking an item loads its full detail in the right pane.' },
      { label: 'Side-by-side comparison', detail: 'Two versions of the same document or dataset displayed simultaneously.' },
      { label: 'Resizable sidebar', detail: 'Persistent navigation or filter panel the user can shrink when they need more canvas space.' },
      { label: 'Log / detail inspector', detail: 'Scrollable event list on top; selected entry\'s full stack trace or payload shown below.' },
    ],
  },
  {
    context: 'Portfolio Manager (#1)',
    icon: 'mdi-briefcase-outline',
    color: 'teal',
    items: [
      { label: 'Project tree ↔ detail panel', detail: 'Left pane shows the project/task hierarchy; right pane shows the selected item\'s full metadata, status history, and linked resources.' },
      { label: 'Code / config viewer', detail: 'SDK integration snippets on the left, live response preview on the right — useful for the integration layer view.' },
    ],
  },
  {
    context: 'Roadmap Builder (#2)',
    icon: 'mdi-map-outline',
    color: 'blue',
    items: [
      { label: 'Gantt ↔ milestone detail', detail: 'Roadmap chart fills the wider right pane; a narrower left pane lists epics and lets users click to highlight the corresponding bar.' },
      { label: 'Timeline ↔ dependency graph', detail: 'Vertical split: schedule on top, dependency diagram below — both scroll independently.' },
    ],
  },
  {
    context: 'Workflow Engine (#3)',
    icon: 'mdi-vector-polyline',
    color: 'purple',
    items: [
      { label: 'Node canvas ↔ config panel', detail: 'The Vue Flow canvas takes the wide pane; selecting a node opens its configuration form in the narrower pane without a modal.' },
      { label: 'Run log ↔ step output', detail: 'Vertical split inside a run view: execution log on top, the selected step\'s stdout/stderr and payload below.' },
    ],
  },
  {
    context: 'Verifiable Contracts (#14)',
    icon: 'mdi-file-sign',
    color: 'green',
    items: [
      { label: 'Source ↔ rendered contract', detail: 'Raw Markdown or clause editor on the left, formatted legal document preview on the right — parties see the final look as they type.' },
      { label: 'Version diff', detail: 'V1 on the left, V2 on the right, changed lines highlighted in red/green — reviewers approve changes without downloading files.' },
      { label: 'Clause library ↔ editor', detail: 'Searchable clause snippets on the left; drag or click to insert into the active contract on the right.' },
    ],
  },
  {
    context: 'Document Converter (#15)',
    icon: 'mdi-file-swap-outline',
    color: 'orange',
    items: [
      { label: 'Input ↔ output preview', detail: 'Upload or paste source content on the left; converted output (PDF, HTML, Markdown) renders on the right in real time.' },
      { label: 'Before / after diff', detail: 'Original document on the left, converted result on the right — users spot formatting loss instantly.' },
    ],
  },
  {
    context: 'Family Tree Information System (#10)',
    icon: 'mdi-family-tree',
    color: 'deep-purple',
    items: [
      { label: 'Tree canvas ↔ person profile', detail: 'The interactive graph fills the wide pane; clicking a node loads that person\'s full profile — dates, notes, sources, relationships — in the narrower pane.' },
      { label: 'Search results ↔ tree highlight', detail: 'Search panel on the left narrows results; selecting one pans the tree in the right pane to that node.' },
    ],
  },
]

// ── Editor / preview demo ─────────────────────────────────────────────────────

const editorContent = ref(`# Project Brief

## Overview
A **resizable split pane** that adapts to any two-panel layout need.

## Features
- Drag the divider to resize
- Double-click divider to reset
- Arrow keys nudge the split while gutter is focused
- Touch support on mobile
- Horizontal *and* vertical layouts
- Respects \`minSize\` on both panes

## Usage
\`\`\`vue
<CommonSplitPane direction="horizontal" :initial-split="40">
  <template #a>Left pane</template>
  <template #b>Right pane</template>
</CommonSplitPane>
\`\`\`
`)

const renderedMarkdown = computed(() => {
  return editorContent.value
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`{3}[\w]*\n([\s\S]*?)`{3}/g, '<pre><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]+?<\/li>)/g, '<ul>$1</ul>')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/^(?!<[hupco])/gm, '')
    .trim()
})

// ── File browser demo ─────────────────────────────────────────────────────────

interface FileNode {
  name: string
  type: 'folder' | 'file'
  ext?: string
  children?: FileNode[]
  content?: string
}

const fileTree: FileNode[] = [
  { name: 'src', type: 'folder', children: [
    { name: 'components', type: 'folder', children: [
      { name: 'SplitPane.vue', type: 'file', ext: 'vue', content: '<!-- Resizable split pane -->\n' + '<script setup lang="ts">\nconst split = ref(50)\n' + '<\/script>' },
      { name: 'DataGrid.vue',  type: 'file', ext: 'vue', content: '<!-- Inline-editable data grid -->\n' + '<script setup lang="ts">\nexport interface GridColumn { key: string; title: string }\n' + '<\/script>' },
    ]},
    { name: 'pages', type: 'folder', children: [
      { name: 'index.vue',  type: 'file', ext: 'vue', content: '<!-- Home page -->\n' + '<script setup>\nuseSeo({ title: "Home" })\n' + '<\/script>' },
      { name: 'about.vue', type: 'file', ext: 'vue', content: '<!-- About page -->\n' + '<script setup>\nuseSeo({ title: "About" })\n' + '<\/script>' },
    ]},
    { name: 'composables', type: 'folder', children: [
      { name: 'useSeo.ts',        type: 'file', ext: 'ts', content: 'export const useSeo = (opts: { title: string }) => {\n  useHead({ title: opts.title })\n}' },
      { name: 'useAppTheme.ts',   type: 'file', ext: 'ts', content: 'export const useAppTheme = () => {\n  const theme = ref("light")\n  return { theme }\n}' },
    ]},
  ]},
  { name: 'public', type: 'folder', children: [
    { name: 'assets', type: 'folder', children: [
      { name: 'logo.svg', type: 'file', ext: 'svg', content: '<svg viewBox="0 0 100 100">\n  <circle cx="50" cy="50" r="40" fill="#6366f1"/>\n</svg>' },
    ]},
  ]},
  { name: 'nuxt.config.ts', type: 'file', ext: 'ts', content: 'export default defineNuxtConfig({\n  modules: ["vuetify-nuxt-module"],\n  ssr: true,\n})' },
  { name: 'package.json',   type: 'file', ext: 'json', content: '{\n  "name": "my-app",\n  "version": "1.0.0",\n  "dependencies": {\n    "nuxt": "^3.0.0"\n  }\n}' },
]

const expandedFolders = ref<Set<string>>(new Set(['src', 'src/components']))
const selectedFile    = ref<FileNode | null>(fileTree[0]!.children![0]!.children![0]!)

const toggleFolder = (path: string) => {
  if (expandedFolders.value.has(path)) expandedFolders.value.delete(path)
  else expandedFolders.value.add(path)
}

const extColor: Record<string, string> = {
  vue: '#42b883', ts: '#3178c6', js: '#f7df1e',
  json: '#f97316', svg: '#ec4899', md: '#6366f1',
}
const extIcon: Record<string, string> = {
  vue: 'mdi-vuejs', ts: 'mdi-language-typescript', js: 'mdi-language-javascript',
  json: 'mdi-code-json', svg: 'mdi-svg', md: 'mdi-language-markdown',
}

// ── Contract diff demo ────────────────────────────────────────────────────────

const contractV1 = `SERVICES AGREEMENT

Effective Date: 1 January 2025
Party A: Acme Corp
Party B: BuildCo Ltd

1. SCOPE OF WORK
BuildCo shall deliver the platform
by 30 June 2025.

2. PAYMENT
Total fee: £40,000 payable in
two equal instalments.

3. TERMINATION
Either party may terminate with
30 days written notice.`

const contractV2 = `SERVICES AGREEMENT

Effective Date: 1 March 2025
Party A: Acme Corp
Party B: BuildCo Ltd

1. SCOPE OF WORK
BuildCo shall deliver the platform
by 31 December 2025.

2. PAYMENT
Total fee: £55,000 payable in
four equal instalments.

3. TERMINATION
Either party may terminate with
60 days written notice.

4. DISPUTE RESOLUTION
Disputes shall be resolved by
binding arbitration.`

// ── Vertical / log + detail demo ──────────────────────────────────────────────

const logs = [
  { id: 1, level: 'info',  time: '09:41:02', msg: 'Server started on port 3000' },
  { id: 2, level: 'info',  time: '09:41:03', msg: 'Connected to database' },
  { id: 3, level: 'warn',  time: '09:41:05', msg: 'Cache miss for key user:1042' },
  { id: 4, level: 'error', time: '09:41:07', msg: 'Failed to send email: SMTP timeout' },
  { id: 5, level: 'info',  time: '09:41:09', msg: 'GET /api/users 200 12ms' },
  { id: 6, level: 'info',  time: '09:41:11', msg: 'GET /api/projects 200 8ms' },
  { id: 7, level: 'warn',  time: '09:41:14', msg: 'Rate limit approaching for IP 192.168.1.5' },
  { id: 8, level: 'error', time: '09:41:18', msg: 'Unhandled rejection: Cannot read property of undefined' },
  { id: 9, level: 'info',  time: '09:41:20', msg: 'POST /api/auth/login 200 43ms' },
]

const logDetail: Record<string, { stack?: string; context?: string }> = {
  'Failed to send email: SMTP timeout': {
    stack: 'Error: SMTP connection timed out\n  at SMTPTransport.send (/app/lib/mailer.js:42)\n  at EmailService.dispatch (/app/services/email.js:18)',
    context: 'User ID: 2091 · Action: registration confirmation',
  },
  'Unhandled rejection: Cannot read property of undefined': {
    stack: 'TypeError: Cannot read properties of undefined (reading "id")\n  at ProjectController.getById (/app/controllers/project.js:87)\n  at Layer.handle [as handle_request]',
    context: 'Route: GET /api/projects/9999 · No matching record found',
  },
}

interface LogEntry { id: number; level: string; time: string; msg: string }
const selectedLog = ref<LogEntry | null>(null)

const levelColor: Record<string, string> = { info: 'success', warn: 'warning', error: 'error' }
const levelIcon:  Record<string, string> = { info: 'mdi-information-outline', warn: 'mdi-alert-outline', error: 'mdi-close-circle-outline' }
</script>

<template>
  <div>
    <div class="d-flex align-start justify-space-between gap-4 mb-1">
      <h1 class="text-h5 font-weight-bold">Split Pane</h1>
      <v-btn icon="mdi-information-outline" variant="text" size="small" @click="infoOpen = true" />
    </div>
    <p class="text-body-2 text-medium-emphasis mb-5">
      Drag the divider to resize either pane. Double-click to reset to the default split.
      Arrow keys nudge it while the divider is focused. Works in both horizontal and vertical orientations.
    </p>

    <!-- Use-cases dialog -->
    <v-dialog v-model="infoOpen" max-width="560" scrollable>
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center justify-space-between pt-5 px-6 pb-2">
          <span class="text-h6">Use cases &amp; project fit</span>
          <v-btn icon="mdi-close" variant="text" size="small" @click="infoOpen = false" />
        </v-card-title>
        <v-card-subtitle class="px-6 pb-3 text-wrap">
          Anywhere two panels of content need to coexist without one obscuring the other.
        </v-card-subtitle>
        <v-divider />
        <v-card-text class="px-4 py-4">
          <div v-for="group in USECASES" :key="group.context" class="sp-uc-group">
            <div class="sp-uc-group-header">
              <v-icon :icon="group.icon" :color="group.color" size="16" />
              <span class="sp-uc-group-title">{{ group.context }}</span>
            </div>
            <ul class="sp-uc-list">
              <li v-for="item in group.items" :key="item.label">
                <span class="sp-uc-label">{{ item.label }}</span>
                <span class="sp-uc-detail">{{ item.detail }}</span>
              </li>
            </ul>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-tabs v-model="tab" density="compact" class="mb-5">
      <v-tab value="editor">
        <v-icon start icon="mdi-file-document-edit-outline" size="16" />
        Editor + Preview
      </v-tab>
      <v-tab value="files">
        <v-icon start icon="mdi-folder-outline" size="16" />
        File Browser
      </v-tab>
      <v-tab value="diff">
        <v-icon start icon="mdi-source-diff" size="16" />
        Contract Diff
      </v-tab>
      <v-tab value="logs">
        <v-icon start icon="mdi-console" size="16" />
        Logs + Detail
      </v-tab>
    </v-tabs>

    <v-window v-model="tab">

      <!-- ── Editor + preview ───────────────────────────────────────────────── -->
      <v-window-item value="editor">
        <p class="text-caption text-medium-emphasis mb-3">
          Markdown editor on the left, live preview on the right — the pattern used by document editors, contract platforms, and README editors.
        </p>
        <div style="height:460px; border:1px solid rgba(var(--v-border-color),var(--v-border-opacity)); border-radius:12px; overflow:hidden;">
          <CommonSplitPane direction="horizontal" :initial-split="45" :min-size="160">
            <template #a>
              <div class="sp-demo-pane">
                <div class="sp-demo-pane-header">
                  <v-icon icon="mdi-pencil-outline" size="14" class="mr-1" />
                  Markdown
                </div>
                <textarea
                  v-model="editorContent"
                  class="sp-textarea"
                  spellcheck="false"
                />
              </div>
            </template>
            <template #b>
              <div class="sp-demo-pane">
                <div class="sp-demo-pane-header">
                  <v-icon icon="mdi-eye-outline" size="14" class="mr-1" />
                  Preview
                </div>
                <div class="sp-preview" v-html="renderedMarkdown" />
              </div>
            </template>
          </CommonSplitPane>
        </div>
        <p class="text-caption text-medium-emphasis mt-3">Use case: Document Converter · Verifiable Contracts · Rich text tools</p>
      </v-window-item>

      <!-- ── File browser ───────────────────────────────────────────────────── -->
      <v-window-item value="files">
        <p class="text-caption text-medium-emphasis mb-3">
          File tree on the left, file contents on the right. The pattern used by IDEs and portfolio managers showing project structure.
        </p>
        <div style="height:460px; border:1px solid rgba(var(--v-border-color),var(--v-border-opacity)); border-radius:12px; overflow:hidden;">
          <CommonSplitPane direction="horizontal" :initial-split="30" :min-size="140">
            <template #a>
              <div class="sp-demo-pane">
                <div class="sp-demo-pane-header">
                  <v-icon icon="mdi-folder-outline" size="14" class="mr-1" />
                  Project
                </div>
                <div class="sp-file-tree">
                  <template v-for="node in fileTree" :key="node.name">
                    <div
                      class="sp-tree-row"
                      :class="{ 'sp-tree-row--selected': selectedFile === node }"
                      @click="node.type === 'folder' ? toggleFolder(node.name) : (selectedFile = node)"
                    >
                      <v-icon
                        :icon="node.type === 'folder' ? (expandedFolders.has(node.name) ? 'mdi-chevron-down' : 'mdi-chevron-right') : (extIcon[node.ext ?? ''] ?? 'mdi-file-outline')"
                        :color="node.type === 'file' ? extColor[node.ext ?? ''] : undefined"
                        size="15"
                        class="mr-1"
                      />
                      <span>{{ node.name }}</span>
                    </div>
                    <template v-if="node.type === 'folder' && expandedFolders.has(node.name)">
                      <template v-for="child in node.children ?? []" :key="child.name">
                        <div
                          class="sp-tree-row sp-tree-row--l1"
                          :class="{ 'sp-tree-row--selected': selectedFile === child }"
                          @click="child.type === 'folder' ? toggleFolder(`${node.name}/${child.name}`) : (selectedFile = child)"
                        >
                          <v-icon
                            :icon="child.type === 'folder' ? (expandedFolders.has(`${node.name}/${child.name}`) ? 'mdi-chevron-down' : 'mdi-chevron-right') : (extIcon[child.ext ?? ''] ?? 'mdi-file-outline')"
                            :color="child.type === 'file' ? extColor[child.ext ?? ''] : undefined"
                            size="15"
                            class="mr-1"
                          />
                          <span>{{ child.name }}</span>
                        </div>
                        <template v-if="child.type === 'folder' && expandedFolders.has(`${node.name}/${child.name}`)">
                          <div
                            v-for="grandchild in child.children ?? []"
                            :key="grandchild.name"
                            class="sp-tree-row sp-tree-row--l2"
                            :class="{ 'sp-tree-row--selected': selectedFile === grandchild }"
                            @click="selectedFile = grandchild"
                          >
                            <v-icon
                              :icon="extIcon[grandchild.ext ?? ''] ?? 'mdi-file-outline'"
                              :color="extColor[grandchild.ext ?? '']"
                              size="15"
                              class="mr-1"
                            />
                            <span>{{ grandchild.name }}</span>
                          </div>
                        </template>
                      </template>
                    </template>
                  </template>
                </div>
              </div>
            </template>
            <template #b>
              <div class="sp-demo-pane">
                <div class="sp-demo-pane-header">
                  <v-icon
                    v-if="selectedFile"
                    :icon="extIcon[selectedFile.ext ?? ''] ?? 'mdi-file-outline'"
                    :color="extColor[selectedFile.ext ?? '']"
                    size="14"
                    class="mr-1"
                  />
                  {{ selectedFile ? selectedFile.name : 'No file selected' }}
                </div>
                <pre v-if="selectedFile" class="sp-code">{{ selectedFile.content }}</pre>
                <div v-else class="sp-empty">Select a file to view its contents</div>
              </div>
            </template>
          </CommonSplitPane>
        </div>
        <p class="text-caption text-medium-emphasis mt-3">Use case: Portfolio Manager · SDK / Integration Layer · Workflow Engine</p>
      </v-window-item>

      <!-- ── Contract diff ──────────────────────────────────────────────────── -->
      <v-window-item value="diff">
        <p class="text-caption text-medium-emphasis mb-3">
          Side-by-side document comparison — ideal for contract versioning where stakeholders need to see exactly what changed between drafts.
        </p>
        <div style="height:460px; border:1px solid rgba(var(--v-border-color),var(--v-border-opacity)); border-radius:12px; overflow:hidden;">
          <CommonSplitPane direction="horizontal" :initial-split="50" :min-size="160">
            <template #a>
              <div class="sp-demo-pane">
                <div class="sp-demo-pane-header sp-diff-header--old">
                  <v-icon icon="mdi-file-document-outline" size="14" class="mr-1" />
                  Version 1 · Jan 2025
                </div>
                <div class="sp-diff-body">
                  <div
                    v-for="(line, i) in contractV1.split('\n')"
                    :key="i"
                    class="sp-diff-line"
                    :class="{
                      'sp-diff-line--removed': !contractV2.split('\n').includes(line) && line.trim()
                    }"
                  >
                    <span class="sp-diff-ln">{{ i + 1 }}</span>
                    <span>{{ line || '&nbsp;' }}</span>
                  </div>
                </div>
              </div>
            </template>
            <template #b>
              <div class="sp-demo-pane">
                <div class="sp-demo-pane-header sp-diff-header--new">
                  <v-icon icon="mdi-file-document-outline" size="14" class="mr-1" />
                  Version 2 · Mar 2025
                </div>
                <div class="sp-diff-body">
                  <div
                    v-for="(line, i) in contractV2.split('\n')"
                    :key="i"
                    class="sp-diff-line"
                    :class="{
                      'sp-diff-line--added': !contractV1.split('\n').includes(line) && line.trim()
                    }"
                  >
                    <span class="sp-diff-ln">{{ i + 1 }}</span>
                    <span>{{ line || '&nbsp;' }}</span>
                  </div>
                </div>
              </div>
            </template>
          </CommonSplitPane>
        </div>
        <p class="text-caption text-medium-emphasis mt-3">Use case: Verifiable Contracts · Document Converter · SDK / Integration Layer</p>
      </v-window-item>

      <!-- ── Logs + detail ──────────────────────────────────────────────────── -->
      <v-window-item value="logs">
        <p class="text-caption text-medium-emphasis mb-3">
          Vertical split — log list on top, selected entry detail below. The pattern used in monitoring dashboards, CI runners, and deployment tools.
        </p>
        <div style="height:460px; border:1px solid rgba(var(--v-border-color),var(--v-border-opacity)); border-radius:12px; overflow:hidden;">
          <CommonSplitPane direction="vertical" :initial-split="55" :min-size="80">
            <template #a>
              <div class="sp-demo-pane">
                <div class="sp-demo-pane-header">
                  <v-icon icon="mdi-console" size="14" class="mr-1" />
                  Application Logs
                </div>
                <div class="sp-log-list">
                  <div
                    v-for="log in logs"
                    :key="log.id"
                    class="sp-log-row"
                    :class="{ 'sp-log-row--selected': selectedLog?.id === log.id }"
                    @click="selectedLog = log"
                  >
                    <v-icon
                      :icon="levelIcon[log.level] ?? 'mdi-information-outline'"
                      :color="levelColor[log.level]"
                      size="14"
                      class="sp-log-icon"
                    />
                    <span class="sp-log-time">{{ log.time }}</span>
                    <span class="sp-log-msg" :class="`sp-log-msg--${log.level}`">{{ log.msg }}</span>
                  </div>
                </div>
              </div>
            </template>
            <template #b>
              <div class="sp-demo-pane">
                <div class="sp-demo-pane-header">
                  <v-icon icon="mdi-information-outline" size="14" class="mr-1" />
                  {{ selectedLog ? `Detail — ${selectedLog.time}` : 'Detail' }}
                </div>
                <div v-if="selectedLog" class="sp-log-detail">
                  <v-chip
                    :color="levelColor[selectedLog.level]"
                    size="x-small"
                    variant="tonal"
                    class="mb-3"
                  >{{ selectedLog.level.toUpperCase() }}</v-chip>
                  <p class="text-body-2 font-weight-medium mb-3">{{ selectedLog.msg }}</p>
                  <template v-if="logDetail[selectedLog.msg]">
                    <p v-if="logDetail[selectedLog.msg]!.context" class="text-caption text-medium-emphasis mb-2">
                      {{ logDetail[selectedLog.msg]!.context }}
                    </p>
                    <pre v-if="logDetail[selectedLog.msg]!.stack" class="sp-stack">{{ logDetail[selectedLog.msg]!.stack }}</pre>
                  </template>
                  <p v-else class="text-caption text-medium-emphasis">No additional detail for this entry.</p>
                </div>
                <div v-else class="sp-empty">Select a log entry to inspect it</div>
              </div>
            </template>
          </CommonSplitPane>
        </div>
        <p class="text-caption text-medium-emphasis mt-3">Use case: Workflow Engine · Portfolio Manager · any monitoring dashboard</p>
      </v-window-item>

    </v-window>
  </div>
</template>

<style scoped>
/* Shared pane chrome */
.sp-demo-pane {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
.sp-demo-pane-header {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .04em;
  padding: 7px 12px;
  background: rgba(var(--v-theme-on-surface), .03);
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  color: rgba(var(--v-theme-on-surface), .55);
}

.sp-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 13px;
  color: rgba(var(--v-theme-on-surface), .3);
}

/* Markdown editor */
.sp-textarea {
  flex: 1;
  resize: none;
  border: none;
  outline: none;
  padding: 16px;
  font-family: 'Fira Code', 'Cascadia Code', monospace;
  font-size: 12px;
  line-height: 1.7;
  background: transparent;
  color: rgb(var(--v-theme-on-surface));
  overflow-y: auto;
}

/* Markdown preview */
.sp-preview {
  flex: 1;
  padding: 16px 20px;
  overflow-y: auto;
  font-size: 13px;
  line-height: 1.7;
  color: rgb(var(--v-theme-on-surface));
}
.sp-preview :deep(h1) { font-size: 18px; font-weight: 700; margin: 0 0 12px; }
.sp-preview :deep(h2) { font-size: 14px; font-weight: 700; margin: 16px 0 8px; }
.sp-preview :deep(h3) { font-size: 13px; font-weight: 700; margin: 12px 0 6px; }
.sp-preview :deep(p)  { margin: 0 0 10px; }
.sp-preview :deep(ul) { padding-left: 20px; margin: 0 0 10px; }
.sp-preview :deep(code) { font-family: monospace; font-size: 11px; background: rgba(var(--v-theme-on-surface),.08); padding: 1px 5px; border-radius: 3px; }
.sp-preview :deep(pre) { background: rgba(var(--v-theme-on-surface),.06); padding: 12px; border-radius: 6px; overflow-x: auto; margin: 0 0 12px; }
.sp-preview :deep(pre code) { background: none; padding: 0; }
.sp-preview :deep(strong) { font-weight: 700; }
.sp-preview :deep(em) { font-style: italic; }

/* File tree */
.sp-file-tree {
  flex: 1;
  overflow-y: auto;
  padding: 6px 0;
}
.sp-tree-row {
  display: flex;
  align-items: center;
  padding: 4px 12px;
  font-size: 12px;
  cursor: pointer;
  border-radius: 0;
  color: rgb(var(--v-theme-on-surface));
  transition: background .1s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sp-tree-row:hover { background: rgba(var(--v-theme-on-surface), .06); }
.sp-tree-row--selected { background: rgba(var(--v-theme-primary), .1); color: rgb(var(--v-theme-primary)); }
.sp-tree-row--l1 { padding-left: 24px; }
.sp-tree-row--l2 { padding-left: 40px; }

/* File code view */
.sp-code {
  flex: 1;
  overflow: auto;
  padding: 16px;
  margin: 0;
  font-family: 'Fira Code', 'Cascadia Code', monospace;
  font-size: 11px;
  line-height: 1.7;
  color: rgb(var(--v-theme-on-surface));
  background: transparent;
  white-space: pre;
}

/* Diff */
.sp-diff-header--old { color: #ef4444; }
.sp-diff-header--new { color: #10b981; }
.sp-diff-body { flex: 1; overflow-y: auto; font-family: monospace; font-size: 11px; line-height: 1.6; }
.sp-diff-line {
  display: flex;
  gap: 12px;
  padding: 0 12px;
  transition: background .1s;
}
.sp-diff-line--removed { background: rgba(239, 68, 68, .1); color: #ef4444; }
.sp-diff-line--added   { background: rgba(16, 185, 129, .1); color: #10b981; }
.sp-diff-ln { min-width: 24px; text-align: right; opacity: .3; user-select: none; flex-shrink: 0; }

/* Logs */
.sp-log-list { flex: 1; overflow-y: auto; }
.sp-log-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  cursor: pointer;
  font-size: 12px;
  font-family: monospace;
  transition: background .1s;
  border-bottom: 1px solid rgba(var(--v-border-color), .5);
}
.sp-log-row:hover { background: rgba(var(--v-theme-on-surface), .04); }
.sp-log-row--selected { background: rgba(var(--v-theme-primary), .08); }
.sp-log-icon { flex-shrink: 0; }
.sp-log-time { flex-shrink: 0; color: rgba(var(--v-theme-on-surface), .35); font-size: 11px; }
.sp-log-msg  { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sp-log-msg--error { color: #ef4444; }
.sp-log-msg--warn  { color: #f59e0b; }

.sp-log-detail { padding: 14px 16px; overflow-y: auto; flex: 1; }
.sp-stack {
  background: rgba(var(--v-theme-on-surface), .05);
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 10px;
  font-family: monospace;
  line-height: 1.6;
  color: #ef4444;
  overflow-x: auto;
  white-space: pre;
  margin: 0;
}

/* Use-cases dialog */
.sp-uc-group {
  margin-bottom: 20px;
}
.sp-uc-group:last-child {
  margin-bottom: 0;
}
.sp-uc-group-header {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 8px;
  padding: 0 4px;
}
.sp-uc-group-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), .55);
}
.sp-uc-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.sp-uc-list li {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 7px 10px 7px 16px;
  border-radius: 8px;
  background: rgba(var(--v-theme-on-surface), .03);
  border-left: 2px solid rgba(var(--v-theme-on-surface), .08);
}
.sp-uc-label {
  font-size: 12px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  line-height: 1.4;
}
.sp-uc-detail {
  font-size: 11px;
  color: rgba(var(--v-theme-on-surface), .5);
  line-height: 1.5;
}
</style>
