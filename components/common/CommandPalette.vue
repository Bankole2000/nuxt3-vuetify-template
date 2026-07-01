<script setup lang="ts">
const { open, commands, hide } = useCommandPalette()

const query = ref('')

const filtered = computed(() => {
  const q = query.value.toLowerCase().trim()
  const list = q
    ? commands.value.filter(c =>
        c.label.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.group?.toLowerCase().includes(q),
      )
    : commands.value

  // Group results
  const groups: Record<string, typeof commands.value> = {}
  for (const cmd of list) {
    const g = cmd.group ?? 'General'
    if (!groups[g]) groups[g] = []
    groups[g].push(cmd)
  }
  return groups
})

const activeIndex = ref(0)
const flatList = computed(() =>
  Object.values(filtered.value).flat(),
)

const run = (index: number) => {
  const cmd = flatList.value[index]
  if (!cmd) return
  cmd.action()
  hide()
  query.value = ''
  activeIndex.value = 0
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = (activeIndex.value + 1) % flatList.value.length
  }
  else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = (activeIndex.value - 1 + flatList.value.length) % flatList.value.length
  }
  else if (e.key === 'Enter') {
    e.preventDefault()
    run(activeIndex.value)
  }
  else if (e.key === 'Escape') {
    hide()
  }
}

watch(query, () => { activeIndex.value = 0 })
watch(open, (val) => { if (!val) { query.value = ''; activeIndex.value = 0 } })

// Global keyboard shortcut: Cmd/Ctrl+K
onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      open.value = !open.value
    }
  })
})
</script>

<template>
  <v-dialog
    v-model="open"
    max-width="560"
    :scrim="true"
    content-class="command-palette-dialog"
  >
    <v-card rounded="xl" elevation="24">
      <!-- Search input -->
      <div class="d-flex align-center px-4 py-3 border-b">
        <v-icon icon="mdi-magnify" class="text-medium-emphasis mr-3" />
        <input
          v-model="query"
          class="command-palette-input text-body-1 flex-1"
          placeholder="Search commands…"
          autofocus
          @keydown="onKeydown"
        />
        <v-kbd class="text-caption">Esc</v-kbd>
      </div>

      <!-- Results -->
      <div style="max-height: 380px; overflow-y: auto;">
        <template v-if="flatList.length === 0">
          <div class="pa-8 text-center">
            <p class="text-body-2 text-medium-emphasis">No commands found</p>
          </div>
        </template>

        <template v-for="(cmds, group) in filtered" :key="group">
          <v-list-subheader class="text-caption font-weight-bold px-4 pt-3">
            {{ group }}
          </v-list-subheader>
          <v-list density="compact" class="pa-1 pt-0">
            <v-list-item
              v-for="cmd in cmds"
              :key="cmd.id"
              rounded="lg"
              class="mb-1"
              :class="flatList.indexOf(cmd) === activeIndex ? 'bg-primary text-on-primary' : ''"
              @click="run(flatList.indexOf(cmd))"
              @mouseenter="activeIndex = flatList.indexOf(cmd)"
            >
              <template v-if="cmd.icon" #prepend>
                <v-icon :icon="cmd.icon" size="18" class="mr-2" />
              </template>
              <v-list-item-title class="text-body-2">{{ cmd.label }}</v-list-item-title>
              <v-list-item-subtitle v-if="cmd.description" class="text-caption">
                {{ cmd.description }}
              </v-list-item-subtitle>
              <template v-if="cmd.shortcut" #append>
                <v-kbd class="text-caption">{{ cmd.shortcut }}</v-kbd>
              </template>
            </v-list-item>
          </v-list>
        </template>
      </div>

      <div class="d-flex align-center gap-3 px-4 py-2 border-t">
        <span class="text-caption text-medium-emphasis d-flex align-center gap-1">
          <v-kbd class="text-caption">↑↓</v-kbd> navigate
        </span>
        <span class="text-caption text-medium-emphasis d-flex align-center gap-1">
          <v-kbd class="text-caption">↵</v-kbd> select
        </span>
        <span class="text-caption text-medium-emphasis d-flex align-center gap-1">
          <v-kbd class="text-caption">⌘K</v-kbd> toggle
        </span>
      </div>
    </v-card>
  </v-dialog>
</template>

<style>
.command-palette-input {
  border: none;
  outline: none;
  background: transparent;
  color: inherit;
  width: 100%;
}
.command-palette-dialog {
  align-self: flex-start;
  margin-top: 80px;
}
</style>
