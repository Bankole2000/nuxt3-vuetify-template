<script setup lang="ts">
import { useTheme } from 'vuetify'
import type { ReplCommand, ReplOutput } from '~/components/common/CommandRepl.vue'

definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Command REPL', disabled: true },
  ],
})

useSeo({
  title: 'Command REPL',
  description: 'Terminal-style REPL with command history, tab autocomplete, async commands, JSON/table output rendering and configurable command registry.',
})

const activeTab = ref(0)
const infoDialog = ref(false)

interface Task {
  id: number
  title: string
  done: boolean
  createdAt: string
}

const tasks = ref<Task[]>([
  { id: 1, title: 'Review pull requests', done: false, createdAt: '2026-07-01' },
  { id: 2, title: 'Update documentation', done: true, createdAt: '2026-07-01' },
  { id: 3, title: 'Fix authentication bug', done: false, createdAt: '2026-07-02' },
  { id: 4, title: 'Deploy to staging', done: false, createdAt: '2026-07-02' },
  { id: 5, title: 'Team standup', done: true, createdAt: '2026-07-03' },
])
let nextTaskId = 6

const taskCommands: ReplCommand[] = [
  {
    name: 'list',
    description: 'Show all tasks as a table',
    handler: () => {
      const rows = tasks.value.map(t => ({
        id: t.id,
        title: t.title,
        status: t.done ? 'done' : 'pending',
        created: t.createdAt,
      }))
      return { type: 'table', content: rows } satisfies ReplOutput
    },
  },
  {
    name: 'add',
    description: 'Add a new task',
    usage: 'add <title>',
    handler: (args) => {
      const title = args.join(' ').trim()
      if (!title) return { type: 'error', content: 'Usage: add <title>' }
      const task: Task = {
        id: nextTaskId++,
        title,
        done: false,
        createdAt: new Date().toISOString().split('T')[0]!,
      }
      tasks.value.push(task)
      return { type: 'success', content: `Task #${task.id} added: "${task.title}"` }
    },
  },
  {
    name: 'done',
    description: 'Mark a task as complete',
    usage: 'done <id>',
    handler: (args) => {
      const id = parseInt(args[0] ?? '', 10)
      if (isNaN(id)) return { type: 'error', content: 'Usage: done <id>' }
      const task = tasks.value.find(t => t.id === id)
      if (!task) return { type: 'error', content: `Task #${id} not found.` }
      task.done = true
      return { type: 'success', content: `Task #${id} marked as done.` }
    },
  },
  {
    name: 'delete',
    aliases: ['rm'],
    description: 'Remove a task',
    usage: 'delete <id>',
    handler: (args) => {
      const id = parseInt(args[0] ?? '', 10)
      if (isNaN(id)) return { type: 'error', content: 'Usage: delete <id>' }
      const idx = tasks.value.findIndex(t => t.id === id)
      if (idx === -1) return { type: 'error', content: `Task #${id} not found.` }
      tasks.value.splice(idx, 1)
      return { type: 'warning', content: `Task #${id} deleted.` }
    },
  },
  {
    name: 'stats',
    description: 'Show task statistics as JSON',
    handler: () => {
      const total = tasks.value.length
      const done = tasks.value.filter(t => t.done).length
      const pending = total - done
      return {
        type: 'json',
        content: {
          total,
          done,
          pending,
          completionRate: total ? `${Math.round((done / total) * 100)}%` : '0%',
        },
      } satisfies ReplOutput
    },
  },
]

let apiRequestCount = 0
const apiStartTime = Date.now()

const mockApiData: Record<string, unknown> = {
  '/users': [
    { id: 1, name: 'Alice Chen', role: 'admin', email: 'alice@example.com' },
    { id: 2, name: 'Bob Smith', role: 'editor', email: 'bob@example.com' },
    { id: 3, name: 'Carol Diaz', role: 'viewer', email: 'carol@example.com' },
  ],
  '/projects': [
    { id: 1, name: 'Alpha', status: 'active', progress: 72 },
    { id: 2, name: 'Beta', status: 'paused', progress: 45 },
    { id: 3, name: 'Gamma', status: 'complete', progress: 100 },
  ],
  '/tasks': [
    { id: 1, title: 'Setup CI/CD', assignee: 'alice', priority: 'high' },
    { id: 2, title: 'Write tests', assignee: 'bob', priority: 'medium' },
    { id: 3, title: 'Deploy v2', assignee: 'carol', priority: 'low' },
  ],
  '/health': { status: 'ok', version: '2.3.0', uptime: '14d 6h 22m' },
}

function fakeDelay() {
  return new Promise<void>(resolve => setTimeout(resolve, 200 + Math.random() * 400))
}

const apiCommands: ReplCommand[] = [
  {
    name: 'get',
    description: 'Simulate a GET request to an endpoint',
    usage: 'get <endpoint>',
    handler: async (args) => {
      const endpoint = args[0] ?? ''
      if (!endpoint) return { type: 'error', content: 'Usage: get <endpoint>' }
      await fakeDelay()
      apiRequestCount++
      const data = mockApiData[endpoint]
      if (!data) return { type: 'error', content: `404 Not Found: ${endpoint}` }
      return { type: 'json', content: data as Record<string, unknown> | Record<string, unknown>[] }
    },
  },
  {
    name: 'post',
    description: 'Simulate a POST request',
    usage: 'post <endpoint> <data>',
    handler: async (args) => {
      const endpoint = args[0] ?? ''
      const body = args.slice(1).join(' ')
      if (!endpoint) return { type: 'error', content: 'Usage: post <endpoint> <data>' }
      await fakeDelay()
      apiRequestCount++
      return {
        type: 'json',
        content: {
          status: 201,
          endpoint,
          body: body || '{}',
          id: Math.floor(Math.random() * 1000) + 100,
          createdAt: new Date().toISOString(),
        },
      } satisfies ReplOutput
    },
  },
  {
    name: 'status',
    description: 'Show API status (uptime, version, requests)',
    handler: async () => {
      await fakeDelay()
      const uptimeSec = Math.floor((Date.now() - apiStartTime) / 1000)
      return {
        type: 'json',
        content: {
          status: 'ok',
          version: '2.3.0',
          uptime: `${uptimeSec}s`,
          totalRequests: apiRequestCount,
          rateLimit: '1000 req/min',
          region: 'eu-west-1',
        },
      } satisfies ReplOutput
    },
  },
  {
    name: 'endpoints',
    description: 'List available API endpoints',
    handler: () => {
      const rows = [
        { endpoint: '/users', method: 'GET/POST', description: 'User accounts' },
        { endpoint: '/projects', method: 'GET/POST', description: 'Projects' },
        { endpoint: '/tasks', method: 'GET/POST', description: 'Task items' },
        { endpoint: '/health', method: 'GET', description: 'Service health' },
      ]
      return { type: 'table', content: rows } satisfies ReplOutput
    },
  },
]

const vuetifyTheme = useTheme()

const systemCommands: ReplCommand[] = [
  {
    name: 'sysinfo',
    description: 'Show browser/system info as JSON',
    handler: () => {
      return {
        type: 'json',
        content: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          languages: navigator.languages.slice(0, 3),
          screenWidth: screen.width,
          screenHeight: screen.height,
          colorDepth: screen.colorDepth,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          online: navigator.onLine,
          cookieEnabled: navigator.cookieEnabled,
        },
      } satisfies ReplOutput
    },
  },
  {
    name: 'perf',
    description: 'Show performance metrics',
    handler: () => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
      const mem = (performance as unknown as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory
      return {
        type: 'json',
        content: {
          ...(nav ? {
            domContentLoaded: `${Math.round(nav.domContentLoadedEventEnd - nav.startTime)}ms`,
            loadComplete: `${Math.round(nav.loadEventEnd - nav.startTime)}ms`,
          } : {}),
          ...(mem ? {
            heapUsed: `${Math.round(mem.usedJSHeapSize / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(mem.totalJSHeapSize / 1024 / 1024)}MB`,
            heapLimit: `${Math.round(mem.jsHeapSizeLimit / 1024 / 1024)}MB`,
          } : { memoryAPI: 'not available in this browser' }),
          now: `${Math.round(performance.now())}ms since page load`,
        },
      } satisfies ReplOutput
    },
  },
  {
    name: 'storage',
    description: 'Show localStorage/sessionStorage usage',
    handler: () => {
      let lsKeys = 0
      let lsBytes = 0
      let ssKeys = 0
      let ssBytes = 0
      try {
        lsKeys = localStorage.length
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i) ?? ''
          lsBytes += k.length + (localStorage.getItem(k)?.length ?? 0)
        }
        ssKeys = sessionStorage.length
        for (let i = 0; i < sessionStorage.length; i++) {
          const k = sessionStorage.key(i) ?? ''
          ssBytes += k.length + (sessionStorage.getItem(k)?.length ?? 0)
        }
      }
      catch { /* storage blocked */ }
      return {
        type: 'json',
        content: {
          localStorage: { keys: lsKeys, estimatedBytes: lsBytes },
          sessionStorage: { keys: ssKeys, estimatedBytes: ssBytes },
        },
      } satisfies ReplOutput
    },
  },
  {
    name: 'theme',
    description: 'Show current Vuetify theme',
    handler: () => {
      return {
        type: 'json',
        content: {
          name: vuetifyTheme.global.name.value,
          dark: vuetifyTheme.global.current.value.dark,
          availableThemes: Object.keys(vuetifyTheme.themes.value),
        },
      } satisfies ReplOutput
    },
  },
  {
    name: 'date',
    description: 'Show current date/time in multiple formats',
    handler: () => {
      const now = new Date()
      return {
        type: 'json',
        content: {
          iso: now.toISOString(),
          utc: now.toUTCString(),
          local: now.toLocaleString(),
          unix: Math.floor(now.getTime() / 1000),
          day: now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
          time: now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        },
      } satisfies ReplOutput
    },
  },
]

const useCases = [
  {
    icon: 'mdi-pipe',
    title: 'Workflow Engine (#3 — pipeline control)',
    body: 'Drop a REPL into a data-pipeline UI so operators can inspect, pause, retry or re-route jobs without leaving the dashboard.',
  },
  {
    icon: 'mdi-briefcase-outline',
    title: 'Portfolio Manager (#1 — admin console)',
    body: 'Give portfolio managers a command console to bulk-update asset allocations, run queries and trigger rebalancing from a familiar terminal UX.',
  },
  {
    icon: 'mdi-tools',
    title: 'Developer tools',
    body: 'Embed alongside documentation so developers can try API calls, inspect state, or run canned queries directly in the browser.',
  },
  {
    icon: 'mdi-view-dashboard-outline',
    title: 'Admin dashboards',
    body: 'Pair with a Kanban or data table for a hybrid UI: mouse for browsing, keyboard for power operations.',
  },
  {
    icon: 'mdi-account-star-outline',
    title: 'Power-user UX',
    body: 'For apps with a power-user segment, a REPL provides a shortcut surface with scriptable repeatability that GUIs cannot match.',
  },
]
</script>

<template>
  <div>
    <div class="d-flex align-center mb-1 gap-3">
      <h1 class="text-h5 font-weight-bold">Command REPL</h1>
      <v-btn
        size="small"
        variant="tonal"
        prepend-icon="mdi-information-outline"
        @click="infoDialog = true"
      >
        Use cases
      </v-btn>
    </div>
    <p class="text-body-2 text-medium-emphasis mb-6">
      Terminal-style REPL with command history, tab autocomplete, async commands, and JSON/table output rendering.
      Press <kbd>↑↓</kbd> for history, <kbd>Tab</kbd> to autocomplete, <kbd>Ctrl+C</kbd> to clear input, <kbd>Ctrl+L</kbd> to clear screen.
    </p>

    <v-tabs v-model="activeTab" class="mb-6">
      <v-tab value="0" prepend-icon="mdi-checkbox-marked-circle-outline">Task Manager</v-tab>
      <v-tab value="1" prepend-icon="mdi-api">API Explorer</v-tab>
      <v-tab value="2" prepend-icon="mdi-information-outline">System Info</v-tab>
    </v-tabs>

    <v-window v-model="activeTab">
      <v-window-item value="0">
        <v-card rounded="lg" class="overflow-hidden" style="padding:0">
          <div class="repl-tab-bar d-flex align-center px-3 py-2 gap-2">
            <div class="repl-dot bg-red-lighten-1 rounded-circle" style="width:12px;height:12px" />
            <div class="repl-dot bg-amber-lighten-1 rounded-circle" style="width:12px;height:12px" />
            <div class="repl-dot bg-green-lighten-1 rounded-circle" style="width:12px;height:12px" />
            <span class="text-caption text-medium-emphasis ml-2">task-manager</span>
          </div>
          <CommonCommandRepl
            :commands="taskCommands"
            prompt="task> "
            welcome-message="Task Manager v1.0 — type 'help' for commands"
            height="380px"
            theme="dark"
          />
        </v-card>
        <p class="text-caption text-medium-emphasis mt-3">
          Try: <code>list</code> · <code>add Fix the login page</code> · <code>done 1</code> · <code>stats</code> · <code>delete 2</code>
        </p>
      </v-window-item>

      <v-window-item value="1">
        <v-card rounded="lg" class="overflow-hidden" style="padding:0">
          <div class="repl-tab-bar d-flex align-center px-3 py-2 gap-2">
            <div class="repl-dot bg-red-lighten-1 rounded-circle" style="width:12px;height:12px" />
            <div class="repl-dot bg-amber-lighten-1 rounded-circle" style="width:12px;height:12px" />
            <div class="repl-dot bg-green-lighten-1 rounded-circle" style="width:12px;height:12px" />
            <span class="text-caption text-medium-emphasis ml-2">api-explorer</span>
          </div>
          <CommonCommandRepl
            :commands="apiCommands"
            prompt="api> "
            welcome-message="API Explorer — Connected to mock API v2.3"
            height="380px"
            theme="dark"
          />
        </v-card>
        <p class="text-caption text-medium-emphasis mt-3">
          Try: <code>endpoints</code> · <code>get /users</code> · <code>post /projects name=Delta</code> · <code>status</code>
        </p>
      </v-window-item>

      <v-window-item value="2">
        <v-card rounded="lg" class="overflow-hidden" style="padding:0">
          <div class="repl-tab-bar d-flex align-center px-3 py-2 gap-2">
            <div class="repl-dot bg-red-lighten-1 rounded-circle" style="width:12px;height:12px" />
            <div class="repl-dot bg-amber-lighten-1 rounded-circle" style="width:12px;height:12px" />
            <div class="repl-dot bg-green-lighten-1 rounded-circle" style="width:12px;height:12px" />
            <span class="text-caption text-medium-emphasis ml-2">system-info</span>
          </div>
          <CommonCommandRepl
            :commands="systemCommands"
            prompt="sys> "
            welcome-message="System Info Console"
            height="380px"
            theme="dark"
          />
        </v-card>
        <p class="text-caption text-medium-emphasis mt-3">
          Try: <code>sysinfo</code> · <code>perf</code> · <code>storage</code> · <code>theme</code> · <code>date</code>
        </p>
      </v-window-item>
    </v-window>

    <v-dialog v-model="infoDialog" max-width="560">
      <v-card rounded="lg">
        <v-card-title class="pt-5 px-6 text-h6 font-weight-bold">
          <v-icon icon="mdi-console" class="mr-2" />
          Command REPL — Use Cases
        </v-card-title>
        <v-card-text class="px-6">
          <v-list lines="two" class="pa-0">
            <v-list-item
              v-for="uc in useCases"
              :key="uc.title"
              :prepend-icon="uc.icon"
              rounded="lg"
              class="mb-1 px-0"
            >
              <v-list-item-title class="text-body-2 font-weight-medium">{{ uc.title }}</v-list-item-title>
              <v-list-item-subtitle class="text-caption" style="white-space: normal;">{{ uc.body }}</v-list-item-subtitle>
            </v-list-item>
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

<style scoped>
.repl-tab-bar {
  background: #161b22;
  border-bottom: 1px solid #30363d;
}
</style>
