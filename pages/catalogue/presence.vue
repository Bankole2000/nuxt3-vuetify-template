<script setup lang="ts">
import { PresenceCursor } from '~/components/common/PresenceAvatars.vue'
import type { Collaborator, PresenceStatus } from '~/components/common/PresenceAvatars.vue'

definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Presence & Collaborators', disabled: true },
  ],
})

useSeo({
  title: 'Presence & Collaborators',
  description: 'Stacked online-presence avatars with status dots, overflow count, tooltip, cursor badges and editing pulse animation.',
})

const tab      = ref('document')
const infoOpen = ref(false)

const PRESET_USERS: Collaborator[] = [
  { id: 'u1', name: 'Alice Chen',   color: '#E91E63', status: 'online',  location: 'Introduction' },
  { id: 'u2', name: 'Bob Smith',    color: '#2196F3', status: 'editing', location: 'Section 2' },
  { id: 'u3', name: 'Carol Davis',  color: '#4CAF50', status: 'viewing', location: 'Section 3' },
  { id: 'u4', name: 'Dave Wu',      color: '#FF9800', status: 'idle',    location: 'Summary' },
  { id: 'u5', name: 'Eve Torres',   color: '#9C27B0', status: 'online',  location: 'Introduction' },
  { id: 'u6', name: 'Frank Lee',    color: '#00BCD4', status: 'offline', lastSeen: new Date(Date.now() - 7 * 60000).toISOString() },
  { id: 'u7', name: 'Grace Kim',    color: '#FF5722', status: 'editing', location: 'Section 1' },
  { id: 'u8', name: 'Henry Park',   color: '#795548', status: 'viewing', location: 'Section 4' },
]

const STATUSES: PresenceStatus[] = ['online', 'idle', 'offline', 'editing', 'viewing']

// ─── Tab 1: Document Editor ────────────────────────────────────────────────

const docCollaborators = ref<Collaborator[]>([
  { ...PRESET_USERS[0]! },
  { ...PRESET_USERS[1]! },
  { ...PRESET_USERS[2]! },
])

let docUserIndex = 3

function addDocCollaborator() {
  const next = PRESET_USERS[docUserIndex % PRESET_USERS.length]
  if (!next) return
  if (!docCollaborators.value.find(c => c.id === next.id)) {
    docCollaborators.value.push({ ...next })
  }
  docUserIndex++
}

function removeRandomDocCollaborator() {
  if (docCollaborators.value.length === 0) return
  const idx = Math.floor(Math.random() * docCollaborators.value.length)
  docCollaborators.value.splice(idx, 1)
}

function changeRandomDocStatus() {
  if (docCollaborators.value.length === 0) return
  const idx = Math.floor(Math.random() * docCollaborators.value.length)
  const collab = docCollaborators.value[idx]
  if (!collab) return
  const newStatus = STATUSES[Math.floor(Math.random() * STATUSES.length)]!
  docCollaborators.value[idx] = {
    ...collab,
    status: newStatus,
    lastSeen: newStatus === 'offline' ? new Date(Date.now() - Math.random() * 3600000).toISOString() : collab.lastSeen,
  }
}

interface CursorPos { id: string; x: number; y: number }

const cursorPositions = ref<CursorPos[]>([])

function updateCursorPositions() {
  const editors = docCollaborators.value.filter(c => c.status === 'editing')
  cursorPositions.value = editors.map(c => {
    const existing = cursorPositions.value.find(p => p.id === c.id)
    if (existing) {
      return {
        id: c.id,
        x: Math.max(5, Math.min(90, existing.x + (Math.random() - 0.5) * 8)),
        y: Math.max(5, Math.min(90, existing.y + (Math.random() - 0.5) * 8)),
      }
    }
    return { id: c.id, x: 10 + Math.random() * 70, y: 10 + Math.random() * 70 }
  })
}

// ─── Tab 2: Kanban ─────────────────────────────────────────────────────────

interface KanbanCol { id: string; label: string; cards: string[]; color: string }

const kanbanCols = ref<KanbanCol[]>([
  { id: 'todo',        label: 'To Do',       color: '#9E9E9E', cards: ['Design system tokens', 'Auth middleware', 'Unit tests'] },
  { id: 'in-progress', label: 'In Progress', color: '#FF9800', cards: ['Presence component', 'Dark mode'] },
  { id: 'done',        label: 'Done',        color: '#4CAF50', cards: ['Project scaffold', 'CI pipeline', 'Kanban board'] },
])

const kanbanUsers = ref<Collaborator[]>([
  { ...PRESET_USERS[0]!, location: 'todo' },
  { ...PRESET_USERS[1]!, location: 'in-progress' },
  { ...PRESET_USERS[2]!, location: 'done' },
  { ...PRESET_USERS[3]!, location: 'todo' },
  { ...PRESET_USERS[4]!, location: 'in-progress' },
])

function colPresence(colId: string): Collaborator[] {
  return kanbanUsers.value.filter(c => c.location === colId)
}

// ─── Tab 3: Presence List ──────────────────────────────────────────────────

const listCollaborators = ref<Collaborator[]>(PRESET_USERS.map(u => ({ ...u })))
const listVariant = ref<'stack' | 'row'>('row')

// ─── Simulation ────────────────────────────────────────────────────────────

let driftTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  updateCursorPositions()
  driftTimer = setInterval(updateCursorPositions, 2000)
})

onUnmounted(() => {
  if (driftTimer) clearInterval(driftTimer)
})

function cursorForCollaborator(c: Collaborator): CursorPos | undefined {
  return cursorPositions.value.find(p => p.id === c.id)
}

const docText = ref(`Project Vision

This document outlines the high-level vision and guiding principles for the product.

Section 1: Goals
Our primary goal is to build a collaborative, real-time platform that empowers distributed teams. We aim to deliver an experience that feels immediate and responsive.

Section 2: Architecture
The system is built on Nuxt 3 and communicates with a REST + WebSocket backend. The front-end is structured around Pinia stores and composables.

Section 3: Roadmap
Phase 1 covers the core editing experience. Phase 2 adds presence and collaboration features. Phase 3 introduces AI-assisted tooling.

Summary
By combining thoughtful UX with a scalable architecture, we can deliver a tool that teams genuinely enjoy using.`)

const useCases = [
  { icon: 'mdi-briefcase-outline',          title: 'Portfolio Manager (#1)',        body: 'Show team presence on tasks — who\'s looking, who\'s editing a milestone.' },
  { icon: 'mdi-vector-polyline',            title: 'Workflow Engine (#3)',           body: 'Display who\'s editing a node or reviewing a flow in real time.' },
  { icon: 'mdi-map-check-outline',          title: 'Roadmap Builder (#2)',           body: 'Concurrent editing indicators on roadmap cards and timeline items.' },
  { icon: 'mdi-chat-outline',               title: 'Chat / Messaging',              body: 'Show which users are active in a channel or reading a thread.' },
  { icon: 'mdi-file-sign',                  title: 'Verifiable Contracts (#14)',     body: 'Display who\'s currently reviewing or signing a document.' },
]
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-2 flex-wrap gap-2">
      <div>
        <h1 class="text-h4 font-weight-bold">Presence &amp; Collaborators</h1>
        <p class="text-body-1 text-medium-emphasis mt-1">
          Stacked online-presence avatars with status dots, overflow, tooltips, cursor badges and editing pulse.
        </p>
      </div>
      <v-btn
        variant="tonal"
        color="cyan"
        prepend-icon="mdi-information-outline"
        @click="infoOpen = true"
      >Use cases</v-btn>
    </div>

    <v-tabs v-model="tab" class="mb-6">
      <v-tab value="document">Document Editor</v-tab>
      <v-tab value="kanban">Kanban Board</v-tab>
      <v-tab value="list">Presence List</v-tab>
    </v-tabs>

    <v-tabs-window v-model="tab">

      <!-- ─── Tab 1: Document Editor ──────────────────────────────────── -->
      <v-tabs-window-item value="document">
        <v-row>
          <v-col cols="12">
            <v-card rounded="lg" border>
              <v-card-text class="pa-4">
                <div class="d-flex align-center justify-space-between flex-wrap gap-3 mb-4">
                  <div class="d-flex align-center gap-3">
                    <CommonPresenceAvatars
                      :collaborators="docCollaborators"
                      :max-visible="6"
                      size="default"
                      show-status
                      show-tooltips
                      variant="stack"
                      @click="() => {}"
                    />
                    <span class="text-caption text-medium-emphasis">
                      {{ docCollaborators.length }} collaborator{{ docCollaborators.length !== 1 ? 's' : '' }}
                    </span>
                  </div>
                  <div class="d-flex gap-2 flex-wrap">
                    <v-btn
                      size="small"
                      variant="tonal"
                      color="success"
                      prepend-icon="mdi-account-plus-outline"
                      @click="addDocCollaborator"
                    >Add</v-btn>
                    <v-btn
                      size="small"
                      variant="tonal"
                      color="error"
                      prepend-icon="mdi-account-minus-outline"
                      :disabled="docCollaborators.length === 0"
                      @click="removeRandomDocCollaborator"
                    >Remove random</v-btn>
                    <v-btn
                      size="small"
                      variant="tonal"
                      color="warning"
                      prepend-icon="mdi-shuffle-variant"
                      :disabled="docCollaborators.length === 0"
                      @click="changeRandomDocStatus"
                    >Change status</v-btn>
                  </div>
                </div>

                <div style="position: relative;">
                  <v-textarea
                    v-model="docText"
                    variant="outlined"
                    auto-grow
                    rows="14"
                    hide-details
                    style="font-family: 'Georgia', serif; font-size: 14px; line-height: 1.7;"
                  />

                  <div
                    style="position: absolute; inset: 0; pointer-events: none; overflow: hidden; border-radius: 4px;"
                  >
                    <component
                      :is="PresenceCursor"
                      v-for="c in docCollaborators.filter(col => col.status === 'editing')"
                      :key="c.id"
                      :collaborator="c"
                      :x="cursorForCollaborator(c)?.x ?? 50"
                      :y="cursorForCollaborator(c)?.y ?? 50"
                    />
                  </div>
                </div>

                <div class="mt-4">
                  <p class="text-caption text-medium-emphasis mb-2 font-weight-medium">Status legend</p>
                  <div class="d-flex flex-wrap gap-3">
                    <div v-for="s in ['online', 'idle', 'offline', 'editing', 'viewing']" :key="s" class="d-flex align-center gap-1">
                      <span
                        class="d-inline-block rounded-circle"
                        :style="{
                          width: '10px', height: '10px',
                          background: s === 'online' ? '#4CAF50' : s === 'idle' ? '#FF9800' : s === 'offline' ? '#9E9E9E' : s === 'editing' ? '#2196F3' : '#009688',
                        }"
                      />
                      <span class="text-caption text-capitalize">{{ s }}</span>
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-tabs-window-item>

      <!-- ─── Tab 2: Kanban ──────────────────────────────────────────── -->
      <v-tabs-window-item value="kanban">
        <v-row>
          <v-col
            v-for="col in kanbanCols"
            :key="col.id"
            cols="12"
            md="4"
          >
            <v-card rounded="lg" border height="100%">
              <v-card-title class="d-flex align-center justify-space-between pa-4 pb-2">
                <div class="d-flex align-center gap-2">
                  <span
                    class="d-inline-block rounded-circle"
                    :style="{ width: '10px', height: '10px', background: col.color, flexShrink: 0 }"
                  />
                  <span class="text-body-2 font-weight-bold">{{ col.label }}</span>
                </div>
                <CommonPresenceAvatars
                  :collaborators="colPresence(col.id)"
                  :max-visible="2"
                  size="small"
                  show-status
                  show-tooltips
                  variant="stack"
                />
              </v-card-title>

              <v-card-text class="pa-4 pt-2">
                <div class="d-flex flex-column gap-2">
                  <v-card
                    v-for="card in col.cards"
                    :key="card"
                    variant="tonal"
                    rounded="lg"
                    class="pa-3"
                  >
                    <p class="text-body-2">{{ card }}</p>
                  </v-card>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-card rounded="lg" border class="mt-4 pa-4">
          <p class="text-caption text-medium-emphasis mb-3 font-weight-medium">Column presence breakdown</p>
          <div class="d-flex flex-wrap gap-6">
            <div v-for="col in kanbanCols" :key="col.id">
              <p class="text-caption font-weight-medium mb-2">{{ col.label }}</p>
              <CommonPresenceAvatars
                :collaborators="colPresence(col.id)"
                :max-visible="5"
                size="default"
                show-status
                show-names
                show-tooltips
                variant="row"
              />
              <p v-if="colPresence(col.id).length === 0" class="text-caption text-medium-emphasis">None</p>
            </div>
          </div>
        </v-card>
      </v-tabs-window-item>

      <!-- ─── Tab 3: Presence List ───────────────────────────────────── -->
      <v-tabs-window-item value="list">
        <v-card rounded="lg" border class="mb-4 pa-4">
          <div class="d-flex align-center gap-4 flex-wrap">
            <p class="text-body-2 font-weight-medium">Display variant:</p>
            <v-btn-toggle v-model="listVariant" mandatory rounded="lg" density="compact" color="cyan">
              <v-btn value="stack" size="small">Stack</v-btn>
              <v-btn value="row" size="small">Row</v-btn>
            </v-btn-toggle>

            <div class="ml-auto">
              <CommonPresenceAvatars
                :collaborators="listCollaborators"
                :max-visible="5"
                size="default"
                show-status
                show-tooltips
                :variant="listVariant"
              />
            </div>
          </div>
        </v-card>

        <v-card rounded="lg" border>
          <v-list lines="two">
            <v-list-item
              v-for="collab in listCollaborators"
              :key="collab.id"
            >
              <template #prepend>
                <div style="position: relative; margin-right: 16px;">
                  <v-avatar
                    :size="40"
                    :color="collab.color ?? 'primary'"
                    :image="collab.avatar"
                    :style="{ border: `2px solid ${collab.color ?? '#2196F3'}` }"
                  >
                    <span v-if="!collab.avatar" style="font-size: 14px;">
                      {{ collab.name.split(' ').slice(0, 2).map((w: string) => w[0] ?? '').join('').toUpperCase() }}
                    </span>
                  </v-avatar>
                  <span
                    class="d-inline-block rounded-circle"
                    :style="{
                      position: 'absolute',
                      bottom: '-2px',
                      right: '-2px',
                      width: '12px',
                      height: '12px',
                      border: '2px solid rgb(var(--v-theme-surface))',
                      background:
                        collab.status === 'online' ? '#4CAF50' :
                        collab.status === 'idle' ? '#FF9800' :
                        collab.status === 'offline' ? '#9E9E9E' :
                        collab.status === 'editing' ? '#2196F3' : '#009688',
                    }"
                  />
                </div>
              </template>

              <p class="text-body-2 font-weight-medium">{{ collab.name }}</p>
              <p class="text-caption text-medium-emphasis">
                <span class="text-capitalize">{{ collab.status }}</span>
                <template v-if="collab.location"> · {{ collab.location }}</template>
                <template v-if="collab.status === 'offline' && collab.lastSeen">
                  · Last seen {{ formatLastSeen(collab.lastSeen) }}
                </template>
              </p>
            </v-list-item>
          </v-list>
        </v-card>
      </v-tabs-window-item>

    </v-tabs-window>

    <!-- ─── Info Modal ────────────────────────────────────────────────── -->
    <v-dialog v-model="infoOpen" max-width="560">
      <v-card rounded="xl">
        <v-card-title class="pa-6 pb-2 text-h6">Use Cases</v-card-title>
        <v-card-text class="pa-6 pt-2">
          <div class="d-flex flex-column gap-4">
            <div v-for="uc in useCases" :key="uc.title" class="d-flex gap-3">
              <v-avatar color="cyan" variant="tonal" size="40" rounded="lg">
                <v-icon :icon="uc.icon" size="20" />
              </v-avatar>
              <div>
                <p class="text-body-2 font-weight-bold">{{ uc.title }}</p>
                <p class="text-body-2 text-medium-emphasis">{{ uc.body }}</p>
              </div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn variant="tonal" color="cyan" @click="infoOpen = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
function formatLastSeen(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
</script>
