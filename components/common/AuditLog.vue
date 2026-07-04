<script setup lang="ts">
export type AuditAction =
  | 'create' | 'update' | 'delete' | 'approve' | 'reject'
  | 'login' | 'logout' | 'export' | 'comment' | 'assign'
  | 'complete' | 'reopen'

export interface AuditActor {
  id:      string
  name:    string
  avatar?: string
  role?:   string
}

export interface AuditChange {
  field:    string
  oldValue: string
  newValue: string
}

export interface AuditEntry {
  id:        string
  action:    AuditAction
  actor:     AuditActor
  timestamp: string
  entity?:   string
  summary?:  string
  changes?:  AuditChange[]
  metadata?: Record<string, string>
  ip?:       string
}

const props = withDefaults(defineProps<{
  entries:     AuditEntry[]
  title?:      string
  maxHeight?:  string
  showFilter?: boolean
  showSearch?: boolean
  compact?:    boolean
}>(), {
  title:      'Activity Log',
  maxHeight:  '520px',
  showFilter: true,
  showSearch: true,
  compact:    false,
})

const actionConfig: Record<AuditAction, { icon: string; color: string; label: string }> = {
  create:   { icon: 'mdi-plus-circle',         color: 'success',   label: 'Created'   },
  update:   { icon: 'mdi-pencil-circle',        color: 'primary',   label: 'Updated'   },
  delete:   { icon: 'mdi-delete-circle',        color: 'error',     label: 'Deleted'   },
  approve:  { icon: 'mdi-check-circle',         color: 'success',   label: 'Approved'  },
  reject:   { icon: 'mdi-close-circle',         color: 'error',     label: 'Rejected'  },
  login:    { icon: 'mdi-account-circle',       color: 'secondary', label: 'Logged in' },
  logout:   { icon: 'mdi-account-circle',       color: 'secondary', label: 'Logged out'},
  export:   { icon: 'mdi-download-circle',      color: 'info',      label: 'Exported'  },
  comment:  { icon: 'mdi-comment-circle',       color: 'teal',      label: 'Commented' },
  assign:   { icon: 'mdi-account-arrow-right',  color: 'warning',   label: 'Assigned'  },
  complete: { icon: 'mdi-check-all',            color: 'success',   label: 'Completed' },
  reopen:   { icon: 'mdi-refresh-circle',       color: 'warning',   label: 'Reopened'  },
}

const allActions: AuditAction[] = [
  'create', 'update', 'delete', 'approve', 'reject',
  'login', 'logout', 'export', 'comment', 'assign', 'complete', 'reopen',
]

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const secs  = Math.floor(diff / 1000)
  const mins  = Math.floor(secs / 60)
  const hours = Math.floor(mins / 60)
  const days  = Math.floor(hours / 24)

  if (secs < 60)  return 'just now'
  if (mins < 60)  return `${mins} minute${mins === 1 ? '' : 's'} ago`
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  if (days === 1) return 'yesterday'
  if (days < 7)   return `${days} days ago`
  if (days < 14)  return 'last week'
  if (days < 30)  return `${Math.floor(days / 7)} weeks ago`
  if (days < 60)  return 'last month'
  return `${Math.floor(days / 30)} months ago`
}

function actorInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0] ?? '')
    .join('')
    .toUpperCase()
}

const avatarColors = ['indigo', 'teal', 'deep-purple', 'blue', 'green', 'orange', 'pink', 'brown']
function avatarColor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + (hash << 5) - hash
  return avatarColors[Math.abs(hash) % avatarColors.length]!
}

function defaultSummary(entry: AuditEntry): string {
  const cfg = actionConfig[entry.action]
  const entity = entry.entity ? ` on ${entry.entity}` : ''
  return `${cfg.label}${entity}`
}

const searchQuery   = ref('')
const activeFilters = ref<AuditAction[]>([])
const expandedIds   = ref<Set<string>>(new Set())

function toggleExpand(id: string) {
  if (expandedIds.value.has(id)) {
    expandedIds.value.delete(id)
  } else {
    expandedIds.value.add(id)
  }
  expandedIds.value = new Set(expandedIds.value)
}

function toggleFilter(action: AuditAction) {
  const idx = activeFilters.value.indexOf(action)
  if (idx === -1) activeFilters.value.push(action)
  else activeFilters.value.splice(idx, 1)
}

const filtered = computed(() => {
  let list = [...props.entries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )

  if (activeFilters.value.length) {
    list = list.filter(e => activeFilters.value.includes(e.action))
  }

  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(e =>
      e.actor.name.toLowerCase().includes(q) ||
      (e.entity ?? '').toLowerCase().includes(q) ||
      (e.summary ?? '').toLowerCase().includes(q),
    )
  }

  return list
})

const usedActions = computed(() =>
  allActions.filter(a => props.entries.some(e => e.action === a)),
)
</script>

<template>
  <v-card rounded="lg" border elevation="0">
    <div class="d-flex align-center justify-space-between px-4 pt-4 pb-2 flex-wrap gap-2">
      <span class="text-subtitle-1 font-weight-bold">{{ title }}</span>
      <v-text-field
        v-if="showSearch"
        v-model="searchQuery"
        placeholder="Search actor or entity…"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        rounded="lg"
        clearable
        hide-details
        style="max-width: 260px; min-width: 160px"
      />
    </div>

    <div v-if="showFilter && usedActions.length" class="px-4 pb-3 d-flex flex-wrap gap-1">
      <v-chip
        v-for="action in usedActions"
        :key="action"
        :color="activeFilters.includes(action) ? actionConfig[action].color : undefined"
        :variant="activeFilters.includes(action) ? 'tonal' : 'outlined'"
        size="small"
        class="cursor-pointer"
        @click="toggleFilter(action)"
      >
        <v-icon :icon="actionConfig[action].icon" size="14" start />
        {{ actionConfig[action].label }}
      </v-chip>
    </div>

    <v-divider />

    <div :style="{ maxHeight: maxHeight, overflowY: 'auto' }">
      <template v-if="filtered.length">
        <div
          v-for="entry in filtered"
          :key="entry.id"
          class="audit-row"
          :class="{ 'audit-row--compact': compact }"
        >
          <div
            class="d-flex align-start gap-3 px-4 cursor-pointer"
            :class="compact ? 'py-2' : 'py-3'"
            @click="entry.changes?.length || entry.metadata || entry.ip ? toggleExpand(entry.id) : undefined"
          >
            <div class="flex-shrink-0 mt-1">
              <v-avatar
                v-if="entry.actor.avatar"
                :image="entry.actor.avatar"
                :size="compact ? 28 : 36"
              />
              <v-avatar
                v-else
                :color="avatarColor(entry.actor.id)"
                :size="compact ? 28 : 36"
                variant="tonal"
              >
                <span :class="compact ? 'text-caption' : 'text-body-2'" style="font-weight:600">
                  {{ actorInitials(entry.actor.name) }}
                </span>
              </v-avatar>
            </div>

            <div class="flex-grow-1 min-width-0">
              <div class="d-flex align-center gap-2 flex-wrap">
                <v-icon
                  :icon="actionConfig[entry.action].icon"
                  :color="actionConfig[entry.action].color"
                  :size="compact ? 16 : 18"
                />
                <span :class="compact ? 'text-body-2' : 'text-body-2'" class="font-weight-medium">
                  {{ entry.actor.name }}
                </span>
                <span :class="compact ? 'text-caption' : 'text-body-2'" class="text-medium-emphasis">
                  {{ entry.summary ?? defaultSummary(entry) }}
                </span>
                <v-chip
                  v-if="entry.entity"
                  size="x-small"
                  variant="tonal"
                  :color="actionConfig[entry.action].color"
                  class="flex-shrink-0"
                >
                  {{ entry.entity }}
                </v-chip>
                <v-icon
                  v-if="entry.changes?.length || entry.metadata || entry.ip"
                  :icon="expandedIds.has(entry.id) ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                  size="16"
                  class="text-medium-emphasis ml-auto flex-shrink-0"
                />
              </div>
              <div class="text-caption text-medium-emphasis mt-1">
                {{ relativeTime(entry.timestamp) }}
                <span v-if="entry.actor.role"> · {{ entry.actor.role }}</span>
              </div>
            </div>
          </div>

          <div v-if="expandedIds.has(entry.id)" class="px-4 pb-3 pl-16">
            <v-sheet rounded="lg" color="surface-variant" class="pa-3">
              <template v-if="entry.changes?.length">
                <p class="text-caption font-weight-bold text-medium-emphasis mb-2 text-uppercase">
                  Field Changes
                </p>
                <div class="overflow-x-auto mb-3">
                  <table class="audit-diff-table text-body-2" style="width:100%; border-collapse:collapse">
                    <thead>
                      <tr class="text-caption text-medium-emphasis">
                        <th class="text-left pb-1" style="width:30%">Field</th>
                        <th class="text-left pb-1" style="width:35%">Before</th>
                        <th class="text-left pb-1" style="width:35%">After</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="change in entry.changes" :key="change.field">
                        <td class="py-1 pr-3 font-weight-medium">{{ change.field }}</td>
                        <td class="py-1 pr-3 text-error">{{ change.oldValue }}</td>
                        <td class="py-1 text-success">{{ change.newValue }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </template>

              <template v-if="entry.metadata && Object.keys(entry.metadata).length">
                <p class="text-caption font-weight-bold text-medium-emphasis mb-2 text-uppercase">
                  Metadata
                </p>
                <div class="d-flex flex-wrap gap-2 mb-2">
                  <div
                    v-for="(val, key) in entry.metadata"
                    :key="key"
                    class="text-caption"
                  >
                    <span class="text-medium-emphasis">{{ key }}:</span>
                    <span class="ml-1 font-weight-medium">{{ val }}</span>
                  </div>
                </div>
              </template>

              <template v-if="entry.ip">
                <p class="text-caption text-medium-emphasis">
                  IP Address: <span class="font-weight-medium text-on-surface">{{ entry.ip }}</span>
                </p>
              </template>

              <p class="text-caption text-medium-emphasis mb-0">
                {{ new Date(entry.timestamp).toLocaleString() }}
              </p>
            </v-sheet>
          </div>

          <v-divider />
        </div>
      </template>

      <div v-else class="text-center py-12 text-medium-emphasis">
        <v-icon icon="mdi-history" size="48" class="mb-3 opacity-30" />
        <p class="text-body-2">No audit entries match your filters</p>
      </div>
    </div>
  </v-card>
</template>

<style scoped>
.audit-row {
  transition: background-color 0.15s;
}
.audit-row:hover {
  background: rgba(var(--v-theme-on-surface), 0.04);
}
.min-width-0 {
  min-width: 0;
}
.audit-diff-table th,
.audit-diff-table td {
  vertical-align: top;
}
</style>
