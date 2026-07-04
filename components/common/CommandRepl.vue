<script setup lang="ts">
import { useTheme } from 'vuetify'

export interface ReplCommand {
  name: string
  aliases?: string[]
  description: string
  usage?: string
  handler: (args: string[], context: ReplContext) => ReplOutput | Promise<ReplOutput>
}

export interface ReplOutput {
  type: 'text' | 'success' | 'error' | 'warning' | 'json' | 'table'
  content: string | Record<string, unknown>[] | Record<string, unknown>
  raw?: string
}

export interface ReplContext {
  history: string[]
  env: Record<string, string>
  print: (output: ReplOutput) => void
}

interface LogEntry {
  id: number
  kind: 'input' | 'output' | 'welcome'
  text?: string
  output?: ReplOutput
}

const props = withDefaults(defineProps<{
  commands: ReplCommand[]
  prompt?: string
  welcomeMessage?: string
  maxHistory?: number
  theme?: 'dark' | 'light' | 'auto'
  height?: string
  env?: Record<string, string>
}>(), {
  prompt: '$ ',
  maxHistory: 100,
  theme: 'dark',
  height: '400px',
})

const emit = defineEmits<{
  command: [name: string, args: string[], output: ReplOutput]
}>()

const vuetifyTheme = useTheme()
const isDark = computed(() => {
  if (props.theme === 'auto') return vuetifyTheme.global.current.value.dark
  return props.theme === 'dark'
})

const log = ref<LogEntry[]>([])
const cmdHistory = ref<string[]>([])
const historyIndex = ref(-1)
const inputValue = ref('')
const isRunning = ref(false)
const outputEl = ref<HTMLElement | null>(null)
const inputEl = ref<HTMLInputElement | null>(null)
const envVars = ref<Record<string, string>>({ ...props.env })
let tabMatches: string[] = []
let tabIndex = 0
let entryId = 0

const allCommands = computed((): ReplCommand[] => {
  const builtins: ReplCommand[] = [
    {
      name: 'help',
      description: 'List all available commands',
      handler: (_args, ctx) => {
        const lines: string[] = []
        const cmds = [...builtins, ...props.commands]
        const maxLen = Math.max(...cmds.map(c => c.name.length))
        for (const c of cmds) {
          const aliases = c.aliases?.length ? ` (${c.aliases.join(', ')})` : ''
          lines.push(`  ${c.name.padEnd(maxLen + 2)}${c.description}${aliases}`)
        }
        void ctx
        return { type: 'text', content: lines.join('\n') }
      },
    },
    {
      name: 'clear',
      description: 'Clear the output',
      handler: () => {
        log.value = []
        return { type: 'text', content: '' }
      },
    },
    {
      name: 'history',
      description: 'Show command history',
      handler: (_args, ctx) => {
        if (!ctx.history.length) return { type: 'text', content: 'No history yet.' }
        return {
          type: 'text',
          content: ctx.history.map((h, i) => `  ${String(i + 1).padStart(3)}  ${h}`).join('\n'),
        }
      },
    },
    {
      name: 'env',
      description: 'Show environment variables',
      handler: (_args, ctx) => {
        const entries = Object.entries(ctx.env)
        if (!entries.length) return { type: 'text', content: 'No env vars set.' }
        return {
          type: 'text',
          content: entries.map(([k, v]) => `  ${k}=${v}`).join('\n'),
        }
      },
    },
  ]
  return [...builtins, ...props.commands]
})

function parseArgs(raw: string): string[] {
  const args: string[] = []
  let current = ''
  let inQuote = false
  let quoteChar = ''
  for (const ch of raw) {
    if (inQuote) {
      if (ch === quoteChar) { inQuote = false }
      else { current += ch }
    }
    else if (ch === '"' || ch === "'") {
      inQuote = true
      quoteChar = ch
    }
    else if (ch === ' ') {
      if (current) { args.push(current); current = '' }
    }
    else {
      current += ch
    }
  }
  if (current) args.push(current)
  return args
}

function appendEntry(entry: Omit<LogEntry, 'id'>) {
  log.value.push({ ...entry, id: entryId++ })
  nextTick(() => {
    if (outputEl.value) outputEl.value.scrollTop = outputEl.value.scrollHeight
  })
}

async function runCommand(raw: string) {
  const trimmed = raw.trim()
  if (!trimmed) return

  appendEntry({ kind: 'input', text: props.prompt + trimmed })

  if (cmdHistory.value[0] !== trimmed) {
    cmdHistory.value.unshift(trimmed)
    if (cmdHistory.value.length > props.maxHistory) cmdHistory.value.length = props.maxHistory
  }
  historyIndex.value = -1

  const parts = parseArgs(trimmed)
  const cmdName = parts[0] ?? ''
  const args = parts.slice(1)

  const found = allCommands.value.find(
    c => c.name === cmdName || c.aliases?.includes(cmdName),
  )

  if (!found) {
    appendEntry({
      kind: 'output',
      output: { type: 'error', content: `Command not found: ${cmdName}. Type 'help' for a list of commands.` },
    })
    nextTick(() => focusInput())
    return
  }

  const ctx: ReplContext = {
    history: [...cmdHistory.value],
    env: envVars.value,
    print: (out) => {
      if (out.content !== '') appendEntry({ kind: 'output', output: out })
    },
  }

  isRunning.value = true
  try {
    const result = await found.handler(args, ctx)
    if (result.content !== '' || result.type !== 'text') {
      appendEntry({ kind: 'output', output: result })
    }
    emit('command', cmdName, args, result)
  }
  catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    appendEntry({ kind: 'output', output: { type: 'error', content: msg } })
  }
  finally {
    isRunning.value = false
    nextTick(() => focusInput())
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (historyIndex.value < cmdHistory.value.length - 1) {
      historyIndex.value++
      inputValue.value = cmdHistory.value[historyIndex.value] ?? ''
    }
    return
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (historyIndex.value > 0) {
      historyIndex.value--
      inputValue.value = cmdHistory.value[historyIndex.value] ?? ''
    }
    else if (historyIndex.value === 0) {
      historyIndex.value = -1
      inputValue.value = ''
    }
    return
  }
  if (e.key === 'Tab') {
    e.preventDefault()
    const partial = inputValue.value.trimStart()
    if (!partial.includes(' ')) {
      if (tabMatches.length === 0 || !partial.startsWith(tabMatches[0]?.split('')[0] ?? '')) {
        tabMatches = allCommands.value
          .map(c => c.name)
          .filter(n => n.startsWith(partial))
        tabIndex = 0
      }
      if (tabMatches.length > 0) {
        inputValue.value = tabMatches[tabIndex % tabMatches.length] ?? partial
        tabIndex++
      }
    }
    return
  }
  tabMatches = []
  tabIndex = 0

  if (e.key === 'Enter') {
    e.preventDefault()
    const val = inputValue.value
    inputValue.value = ''
    runCommand(val)
    return
  }
  if (e.ctrlKey && e.key === 'c') {
    e.preventDefault()
    inputValue.value = ''
    appendEntry({ kind: 'input', text: props.prompt + '^C' })
    nextTick(() => focusInput())
    return
  }
  if (e.ctrlKey && e.key === 'l') {
    e.preventDefault()
    log.value = []
    return
  }
}

function focusInput() {
  inputEl.value?.focus()
}

function renderJson(val: unknown, indent = 0): { html: string } {
  const pad = '  '.repeat(indent)
  const childPad = '  '.repeat(indent + 1)
  if (val === null) return { html: '<span class="repl-json-null">null</span>' }
  if (typeof val === 'boolean') return { html: `<span class="repl-json-bool">${val}</span>` }
  if (typeof val === 'number') return { html: `<span class="repl-json-num">${val}</span>` }
  if (typeof val === 'string') return { html: `<span class="repl-json-str">"${escapeHtml(val)}"</span>` }
  if (Array.isArray(val)) {
    if (!val.length) return { html: '[]' }
    const items = val.map(v => `${childPad}${renderJson(v, indent + 1).html}`)
    return { html: `[\n${items.join(',\n')}\n${pad}]` }
  }
  if (typeof val === 'object') {
    const entries = Object.entries(val as Record<string, unknown>)
    if (!entries.length) return { html: '{}' }
    const items = entries.map(([k, v]) => {
      return `${childPad}<span class="repl-json-key">"${escapeHtml(k)}"</span>: ${renderJson(v, indent + 1).html}`
    })
    return { html: `{\n${items.join(',\n')}\n${pad}}` }
  }
  return { html: escapeHtml(String(val)) }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function renderTable(rows: Record<string, unknown>[]): string {
  if (!rows.length) return '(empty table)'
  const keys = Object.keys(rows[0]!)
  const widths = keys.map(k => {
    const vals = rows.map(r => String(r[k] ?? ''))
    return Math.max(k.length, ...vals.map(v => v.length))
  })
  const sep = '+' + widths.map(w => '-'.repeat(w + 2)).join('+') + '+'
  const header = '|' + keys.map((k, i) => ` ${k.padEnd(widths[i]!)} `).join('|') + '|'
  const dataRows = rows.map(
    row => '|' + keys.map((k, i) => ` ${String(row[k] ?? '').padEnd(widths[i]!)} `).join('|') + '|',
  )
  return [sep, header, sep, ...dataRows, sep].join('\n')
}

onMounted(() => {
  if (props.welcomeMessage) {
    appendEntry({ kind: 'welcome', text: props.welcomeMessage })
  }
  focusInput()
})
</script>

<template>
  <div
    class="repl-root"
    :class="isDark ? 'repl-dark' : 'repl-light'"
    :style="{ height: props.height, fontFamily: 'monospace' }"
    @click="focusInput"
  >
    <div ref="outputEl" class="repl-output">
      <div v-for="entry in log" :key="entry.id" class="repl-entry">
        <template v-if="entry.kind === 'welcome'">
          <span class="repl-welcome">{{ entry.text }}</span>
        </template>
        <template v-else-if="entry.kind === 'input'">
          <span class="repl-input-echo">{{ entry.text }}</span>
        </template>
        <template v-else-if="entry.kind === 'output' && entry.output">
          <template v-if="entry.output.type === 'text'">
            <pre class="repl-text">{{ entry.output.content }}</pre>
          </template>
          <template v-else-if="entry.output.type === 'success'">
            <pre class="repl-success">{{ entry.output.content }}</pre>
          </template>
          <template v-else-if="entry.output.type === 'error'">
            <pre class="repl-error">{{ entry.output.content }}</pre>
          </template>
          <template v-else-if="entry.output.type === 'warning'">
            <pre class="repl-warning">{{ entry.output.content }}</pre>
          </template>
          <template v-else-if="entry.output.type === 'json'">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <pre class="repl-json" v-html="renderJson(entry.output.content).html" />
          </template>
          <template v-else-if="entry.output.type === 'table' && Array.isArray(entry.output.content)">
            <pre class="repl-table">{{ renderTable(entry.output.content as Record<string, unknown>[]) }}</pre>
          </template>
        </template>
      </div>

      <div v-if="isRunning" class="repl-running">
        <span class="repl-spinner">⠋</span> running…
      </div>
    </div>

    <div class="repl-inputline">
      <span class="repl-prompt">{{ prompt }}</span>
      <input
        ref="inputEl"
        v-model="inputValue"
        class="repl-input"
        type="text"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        :disabled="isRunning"
        @keydown="onKeydown"
      >
    </div>
  </div>
</template>

<style scoped>
.repl-root {
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
  cursor: text;
  user-select: text;
}

.repl-dark {
  background: #0d1117;
  color: #c9d1d9;
  border: 1px solid #30363d;
}

.repl-light {
  background: #f6f8fa;
  color: #24292f;
  border: 1px solid #d0d7de;
}

.repl-output {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px 4px;
  font-size: 13px;
  line-height: 1.6;
}

.repl-entry {
  margin-bottom: 2px;
}

pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: inherit;
  font-size: inherit;
}

.repl-welcome { color: #58a6ff; font-style: italic; }
.repl-input-echo { color: #8b949e; }
.repl-text { color: inherit; }
.repl-success { color: #3fb950; }
.repl-error { color: #f85149; }
.repl-warning { color: #d29922; }
.repl-json { color: inherit; }
.repl-table { color: #8b949e; }

.repl-dark .repl-welcome { color: #58a6ff; }
.repl-light .repl-welcome { color: #0550ae; }
.repl-dark .repl-input-echo { color: #8b949e; }
.repl-light .repl-input-echo { color: #57606a; }
.repl-light .repl-text { color: #24292f; }
.repl-light .repl-success { color: #1a7f37; }
.repl-light .repl-error { color: #cf222e; }
.repl-light .repl-warning { color: #9a6700; }
.repl-light .repl-table { color: #57606a; }

.repl-running {
  color: #8b949e;
  font-size: 13px;
  padding: 2px 0;
}

.repl-spinner {
  display: inline-block;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  0%  { content: '⠋'; }
  14% { content: '⠙'; }
  28% { content: '⠹'; }
  43% { content: '⠸'; }
  57% { content: '⠼'; }
  71% { content: '⠴'; }
  85% { content: '⠦'; }
}

.repl-inputline {
  display: flex;
  align-items: center;
  padding: 6px 16px 10px;
  border-top: 1px solid transparent;
  gap: 4px;
  flex-shrink: 0;
}

.repl-dark .repl-inputline { border-color: #21262d; }
.repl-light .repl-inputline { border-color: #d0d7de; }

.repl-prompt {
  color: #58a6ff;
  flex-shrink: 0;
  font-size: 13px;
}
.repl-light .repl-prompt { color: #0550ae; }

.repl-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: inherit;
  font-family: monospace;
  font-size: 13px;
  caret-color: #58a6ff;
}
.repl-light .repl-input { caret-color: #0550ae; }
.repl-input:disabled { opacity: 0.5; }
</style>

<style>
.repl-json .repl-json-key  { color: #79c0ff; }
.repl-json .repl-json-str  { color: #a5d6ff; }
.repl-json .repl-json-num  { color: #d29922; }
.repl-json .repl-json-bool { color: #f47067; }
.repl-json .repl-json-null { color: #8b949e; }

.repl-light .repl-json .repl-json-key  { color: #0550ae; }
.repl-light .repl-json .repl-json-str  { color: #0a3069; }
.repl-light .repl-json .repl-json-num  { color: #953800; }
.repl-light .repl-json .repl-json-bool { color: #cf222e; }
.repl-light .repl-json .repl-json-null { color: #57606a; }
</style>
