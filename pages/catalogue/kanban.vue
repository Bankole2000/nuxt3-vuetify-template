<script setup lang="ts">
import type { KanbanColumn } from '~/components/common/Kanban.vue'

definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Kanban', disabled: true },
  ],
})

const toast = useToast()

const board = ref<KanbanColumn[]>([
  {
    id: 'backlog',
    title: 'Backlog',
    color: '#9E9E9E',
    cards: [
      { id: 'c1', title: 'Research competitors', description: 'Analyse top 5 competing products.', tags: ['research'], priority: 'low', assignee: 'Alice' },
      { id: 'c2', title: 'Define color tokens', description: 'Set up design system foundations.', tags: ['design'], priority: 'medium', assignee: 'Bob' },
    ],
  },
  {
    id: 'todo',
    title: 'To Do',
    color: '#2196F3',
    cards: [
      { id: 'c3', title: 'Auth flow', description: 'Login, register and password reset.', tags: ['backend', 'auth'], priority: 'high', assignee: 'Carol' },
      { id: 'c4', title: 'API error handling', description: 'Global 401/403/5xx interceptor.', tags: ['backend'], priority: 'medium' },
      { id: 'c5', title: 'Write unit tests', tags: ['testing'], priority: 'low', assignee: 'Alice' },
    ],
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    color: '#FF9800',
    cards: [
      { id: 'c6', title: 'Kanban board component', description: 'Drag-and-drop columns with HTML5 DnD.', tags: ['frontend'], priority: 'high', assignee: 'Dave' },
      { id: 'c7', title: 'Dark mode persistence', tags: ['frontend', 'ux'], priority: 'medium', assignee: 'Carol' },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    color: '#4CAF50',
    cards: [
      { id: 'c8', title: 'Project scaffold', description: 'Nuxt 3 + Vuetify 4 base setup.', tags: ['infra'], priority: 'high', assignee: 'Bob' },
      { id: 'c9', title: 'CI pipeline', tags: ['infra'], priority: 'medium', assignee: 'Dave' },
    ],
  },
])

const onCardMoved = ({ card, fromColumn, toColumn }: { card: { title: string }; fromColumn: string; toColumn: string }) => {
  if (fromColumn !== toColumn) {
    toast.info(`"${card.title}" moved to ${board.value.find(c => c.id === toColumn)?.title}`)
  }
}
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">Kanban Board</h1>
    <p class="text-body-2 text-medium-emphasis mb-8">
      Drag cards between columns using the HTML5 DnD API — no extra packages. Supports priority badges, tags, and assignees.
    </p>

    <CommonKanban v-model="board" @card-moved="onCardMoved" />

    <h2 class="text-overline text-medium-emphasis mt-10 mb-4">Usage</h2>
    <v-card rounded="lg" class="pa-5">
      <v-sheet rounded="lg" color="surface-variant" class="pa-4">
        <pre v-pre class="text-body-2"><code>&lt;CommonKanban
  v-model="columns"
  @card-moved="({ card, fromColumn, toColumn }) => {}"
/&gt;

// Column shape:
// { id, title, color?, cards: [{ id, title, description?, tags?, priority?, assignee? }] }</code></pre>
      </v-sheet>
    </v-card>
  </div>
</template>
