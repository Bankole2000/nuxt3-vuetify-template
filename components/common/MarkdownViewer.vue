<script setup lang="ts">
import { useTheme } from 'vuetify'

const props = withDefaults(defineProps<{
  content: string
  sanitize?: boolean
  codeTheme?: 'light' | 'dark' | 'auto'
  maxHeight?: string
  showCopy?: boolean
  showRaw?: boolean
}>(), {
  sanitize: true,
  codeTheme: 'auto',
  maxHeight: undefined,
  showCopy: true,
  showRaw: false,
})

const vuetifyTheme = useTheme()
const rawMode = ref(false)
const copiedEl = ref<HTMLElement | null>(null)

const isDark = computed(() => {
  if (props.codeTheme === 'light') return false
  if (props.codeTheme === 'dark') return true
  return vuetifyTheme.global.current.value.dark
})

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function parseInline(text: string): string {
  let out = escapeHtml(text)
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>')
  out = out.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  out = out.replace(/__(.+?)__/g, '<strong>$1</strong>')
  out = out.replace(/\*(.+?)\*/g, '<em>$1</em>')
  out = out.replace(/_(.+?)_/g, '<em>$1</em>')
  out = out.replace(/~~(.+?)~~/g, '<del>$1</del>')
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
  out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
  return out
}

function renderList(lines: string[], ordered: boolean): string {
  const items: string[] = []
  for (let j = 0; j < lines.length; j++) {
    const line = lines[j]!
    const match = ordered
      ? line.match(/^(\s*)\d+\.\s(.*)$/)
      : line.match(/^(\s*)[-*+]\s(.*)$/)
    if (match) {
      let text = match[2]!
      const isChecked = text.startsWith('[x] ') || text.startsWith('[X] ')
      const isUnchecked = text.startsWith('[ ] ')
      if (isChecked) text = `<input type="checkbox" checked disabled class="md-checkbox" /> ${parseInline(text.slice(4))}`
      else if (isUnchecked) text = `<input type="checkbox" disabled class="md-checkbox" /> ${parseInline(text.slice(4))}`
      else text = parseInline(text)
      items.push(`<li>${text}</li>`)
    }
  }
  const tag = ordered ? 'ol' : 'ul'
  return `<${tag}>${items.join('')}</${tag}>`
}

function renderTable(lines: string[]): string {
  if (lines.length < 2) return ''
  const header = lines[0]!
  const headerCells = header.split('|')
    .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
    .map(c => `<th>${parseInline(c.trim())}</th>`)
    .join('')
  const bodyLines = lines.slice(2)
  const bodyRows = bodyLines.map(row => {
    const cells = row.split('|')
      .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
      .map(c => `<td>${parseInline(c.trim())}</td>`)
      .join('')
    return `<tr>${cells}</tr>`
  }).join('')
  return `<table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`
}

function renderMarkdown(src: string): string {
  const lines = src.split('\n')
  const blocks: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]!

    if (line.startsWith('```')) {
      const lang = line.slice(3).trim()
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i]!.startsWith('```')) {
        codeLines.push(lines[i]!)
        i++
      }
      const codeContent = codeLines.map(escapeHtml).join('\n')
      const langAttr = lang ? ` data-lang="${escapeHtml(lang)}"` : ''
      const copyBtn = props.showCopy
        ? `<button class="md-copy-btn" data-code="${escapeHtml(codeLines.join('\n'))}" title="Copy code" aria-label="Copy code"><span class="md-copy-icon">⧉</span></button>`
        : ''
      blocks.push(`<div class="md-pre-wrap">${copyBtn}<pre${langAttr}><code>${codeContent}</code></pre></div>`)
      i++
      continue
    }

    if (/^#{1,6}\s/.test(line)) {
      const match = line.match(/^(#{1,6})\s+(.+)$/)
      if (match) {
        const level = match[1]!.length
        const text = parseInline(match[2]!)
        const slug = match[2]!.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
        blocks.push(`<h${level} id="${slug}">${text}</h${level}>`)
      }
      i++
      continue
    }

    if (/^---+$/.test(line.trim()) || /^\*\*\*+$/.test(line.trim())) {
      blocks.push('<hr />')
      i++
      continue
    }

    if (line.startsWith('> ') || line === '>') {
      const quoteLines: string[] = []
      while (i < lines.length && (lines[i]!.startsWith('> ') || lines[i] === '>')) {
        quoteLines.push(lines[i]!.replace(/^>\s?/, ''))
        i++
      }
      const inner = renderMarkdown(quoteLines.join('\n'))
      blocks.push(`<blockquote>${inner}</blockquote>`)
      continue
    }

    if (/^(\s*)[-*+]\s/.test(line)) {
      const listLines: string[] = []
      while (i < lines.length && (/^(\s*)[-*+]\s/.test(lines[i]!) || (listLines.length > 0 && /^\s+/.test(lines[i]!)))) {
        listLines.push(lines[i]!)
        i++
      }
      blocks.push(renderList(listLines, false))
      continue
    }

    if (/^\d+\.\s/.test(line)) {
      const listLines: string[] = []
      while (i < lines.length && (/^\d+\.\s/.test(lines[i]!) || (listLines.length > 0 && /^\s+/.test(lines[i]!)))) {
        listLines.push(lines[i]!)
        i++
      }
      blocks.push(renderList(listLines, true))
      continue
    }

    if (/^\|.+\|/.test(line)) {
      const tableLines: string[] = []
      while (i < lines.length && /^\|/.test(lines[i]!)) {
        tableLines.push(lines[i]!)
        i++
      }
      blocks.push(renderTable(tableLines))
      continue
    }

    if (line.trim() === '') {
      i++
      continue
    }

    const isBlockStart = (l: string) =>
      /^#{1,6}\s/.test(l) ||
      l.startsWith('```') ||
      l.startsWith('> ') ||
      l === '>' ||
      /^(\s*)[-*+]\s/.test(l) ||
      /^\d+\.\s/.test(l) ||
      /^\|/.test(l) ||
      /^---+$/.test(l.trim()) ||
      /^\*\*\*+$/.test(l.trim())

    const paraLines: string[] = []
    while (i < lines.length && lines[i]!.trim() !== '' && !isBlockStart(lines[i]!)) {
      paraLines.push(lines[i]!)
      i++
    }
    if (paraLines.length) {
      const paraHtml = paraLines.map(parseInline).join('<br />')
      blocks.push(`<p>${paraHtml}</p>`)
    }
  }

  return blocks.join('\n')
}

const rendered = computed(() => renderMarkdown(props.content))

let copyTimeout: ReturnType<typeof setTimeout> | null = null

const handleBodyClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  const btn = target.closest('.md-copy-btn') as HTMLElement | null
  if (!btn) return
  const code = btn.getAttribute('data-code') ?? ''
  navigator.clipboard.writeText(code).then(() => {
    if (copiedEl.value) copiedEl.value.classList.remove('md-copy-btn--copied')
    btn.classList.add('md-copy-btn--copied')
    copiedEl.value = btn
    if (copyTimeout) clearTimeout(copyTimeout)
    copyTimeout = setTimeout(() => {
      btn.classList.remove('md-copy-btn--copied')
      copiedEl.value = null
    }, 2000)
  })
}

onUnmounted(() => { if (copyTimeout) clearTimeout(copyTimeout) })
</script>

<template>
  <div class="md-viewer">
    <div v-if="showRaw" class="d-flex justify-end mb-2">
      <v-btn-toggle
        v-model="rawMode"
        density="compact"
        variant="outlined"
        rounded="lg"
      >
        <v-btn :value="false" size="small" prepend-icon="mdi-eye-outline">Rendered</v-btn>
        <v-btn :value="true" size="small" prepend-icon="mdi-code-braces">Raw</v-btn>
      </v-btn-toggle>
    </div>

    <div
      v-if="rawMode"
      class="md-raw pa-4 rounded-lg text-body-2"
      :style="maxHeight ? `max-height: ${maxHeight}; overflow-y: auto;` : ''"
    >
      <pre style="white-space: pre-wrap; word-break: break-word; margin: 0;">{{ content }}</pre>
    </div>

    <div
      v-else
      class="md-body"
      :class="isDark ? 'md-dark' : 'md-light'"
      :style="maxHeight ? `max-height: ${maxHeight}; overflow-y: auto;` : ''"
      @click="handleBodyClick"
    >
      <div v-html="rendered" />
    </div>
  </div>
</template>

<style scoped>
.md-viewer {
  position: relative;
}

.md-raw {
  background: rgba(0, 0, 0, 0.04);
  font-family: 'Roboto Mono', 'Courier New', monospace;
}

.md-body :deep(h1),
.md-body :deep(h2),
.md-body :deep(h3),
.md-body :deep(h4),
.md-body :deep(h5),
.md-body :deep(h6) {
  font-weight: 700;
  line-height: 1.3;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.md-body :deep(h1) { font-size: 1.875rem; }
.md-body :deep(h2) {
  font-size: 1.5rem;
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
  padding-bottom: 0.25em;
}
.md-body :deep(h3) { font-size: 1.25rem; }
.md-body :deep(h4) { font-size: 1.125rem; }
.md-body :deep(h5) { font-size: 1rem; }
.md-body :deep(h6) { font-size: 0.875rem; opacity: 0.8; }

.md-body :deep(h1:first-child),
.md-body :deep(h2:first-child),
.md-body :deep(h3:first-child) {
  margin-top: 0;
}

.md-body :deep(p) {
  margin-bottom: 0.875em;
  line-height: 1.7;
}

.md-body :deep(a) {
  color: rgb(var(--v-theme-primary));
  text-decoration: underline;
}

.md-body :deep(strong) { font-weight: 700; }
.md-body :deep(em) { font-style: italic; }
.md-body :deep(del) { text-decoration: line-through; }

.md-body :deep(code) {
  font-family: 'Roboto Mono', 'Courier New', monospace;
  font-size: 0.875em;
  padding: 0.15em 0.35em;
  border-radius: 4px;
}

.md-light :deep(code) {
  background: rgba(0, 0, 0, 0.07);
}

.md-dark :deep(code) {
  background: rgba(255, 255, 255, 0.1);
}

.md-body :deep(.md-pre-wrap) {
  position: relative;
  margin: 1em 0;
}

.md-body :deep(pre) {
  position: relative;
  border-radius: 8px;
  padding: 1rem 1.25rem;
  overflow-x: auto;
  margin: 0;
  font-family: 'Roboto Mono', 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
}

.md-light :deep(pre) {
  background: #f5f5f5;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.md-dark :deep(pre) {
  background: #1e1e2e;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.md-body :deep(pre code) {
  background: transparent;
  padding: 0;
  border-radius: 0;
  font-size: inherit;
}

.md-body :deep(pre[data-lang]::before) {
  content: attr(data-lang);
  position: absolute;
  top: 0.4rem;
  right: 2.75rem;
  font-size: 0.7rem;
  font-family: sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.4;
  pointer-events: none;
}

.md-body :deep(.md-copy-btn) {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 1;
  background: rgba(128, 128, 128, 0.15);
  border: none;
  border-radius: 6px;
  width: 28px;
  height: 28px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s, background 0.15s;
  font-size: 0.875rem;
  color: inherit;
}

.md-body :deep(.md-pre-wrap:hover .md-copy-btn) {
  opacity: 1;
}

.md-body :deep(.md-copy-btn:hover) {
  background: rgba(128, 128, 128, 0.3);
}

.md-body :deep(.md-copy-btn--copied) {
  opacity: 1;
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.md-body :deep(blockquote) {
  border-left: 4px solid rgb(var(--v-theme-primary));
  margin: 1em 0;
  padding: 0.5em 1em;
  opacity: 0.85;
  border-radius: 0 4px 4px 0;
}

.md-light :deep(blockquote) {
  background: rgba(0, 0, 0, 0.03);
}

.md-dark :deep(blockquote) {
  background: rgba(255, 255, 255, 0.04);
}

.md-body :deep(ul),
.md-body :deep(ol) {
  padding-left: 1.5em;
  margin-bottom: 0.875em;
}

.md-body :deep(li) {
  margin-bottom: 0.25em;
  line-height: 1.65;
}

.md-body :deep(.md-checkbox) {
  margin-right: 0.4em;
  cursor: default;
}

.md-body :deep(hr) {
  border: none;
  border-top: 1px solid rgba(128, 128, 128, 0.25);
  margin: 1.5em 0;
}

.md-body :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
  display: block;
  overflow-x: auto;
}

.md-body :deep(th),
.md-body :deep(td) {
  padding: 0.5em 0.75em;
  text-align: left;
  white-space: nowrap;
}

.md-light :deep(th),
.md-light :deep(td) {
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.md-dark :deep(th),
.md-dark :deep(td) {
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.md-light :deep(th) {
  background: rgba(0, 0, 0, 0.05);
  font-weight: 600;
}

.md-dark :deep(th) {
  background: rgba(255, 255, 255, 0.06);
  font-weight: 600;
}

.md-light :deep(tr:nth-child(even)) {
  background: rgba(0, 0, 0, 0.02);
}

.md-dark :deep(tr:nth-child(even)) {
  background: rgba(255, 255, 255, 0.02);
}

.md-body :deep(img) {
  max-width: 100%;
  border-radius: 6px;
}
</style>
