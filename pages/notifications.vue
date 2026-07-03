<script setup lang="ts">
// definePageMeta({ middleware: 'auth' }) // uncomment to protect this page

useSeo({ title: 'Notifications' })

const { notifications, unreadCount, add, markRead, markAllRead, remove, clear } = useNotifications()
const toast = useToast()

type FilterType = 'all' | 'unread' | 'info' | 'success' | 'warning' | 'error'
const filter = ref<FilterType>('all')

const filters: { label: string; value: FilterType; icon: string }[] = [
  { label: 'All', value: 'all', icon: 'mdi-bell-outline' },
  { label: 'Unread', value: 'unread', icon: 'mdi-bell-badge-outline' },
  { label: 'Info', value: 'info', icon: 'mdi-information-outline' },
  { label: 'Success', value: 'success', icon: 'mdi-check-circle-outline' },
  { label: 'Warning', value: 'warning', icon: 'mdi-alert-outline' },
  { label: 'Error', value: 'error', icon: 'mdi-alert-circle-outline' },
]

const filtered = computed(() => {
  if (filter.value === 'all') return notifications.value
  if (filter.value === 'unread') return notifications.value.filter(n => !n.read)
  return notifications.value.filter(n => n.type === filter.value)
})

const typeColor: Record<string, string> = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error',
}

const typeIcon: Record<string, string> = {
  info: 'mdi-information-outline',
  success: 'mdi-check-circle-outline',
  warning: 'mdi-alert-outline',
  error: 'mdi-alert-circle-outline',
}

const formatTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

// Group by date label
const grouped = computed(() => {
  const groups: Record<string, typeof filtered.value> = {}
  for (const n of filtered.value) {
    const now = new Date()
    const d = new Date(n.timestamp)
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
    const label = diffDays === 0 ? 'Today' : diffDays === 1 ? 'Yesterday' : d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
    if (!groups[label]) groups[label] = []
    groups[label]!.push(n)
  }
  return groups
})

const onMarkRead = (id: string) => {
  markRead(id)
}

const onRemove = (id: string) => {
  remove(id)
  toast.info('Notification dismissed.')
}

const onClear = () => {
  clear()
  toast.info('All notifications cleared.')
}

// Seed some demo notifications if empty
onMounted(() => {
  if (notifications.value.length === 0) {
    add({ type: 'success', title: 'Deployment complete', message: 'Version 2.4.1 was deployed to production successfully.' })
    add({ type: 'warning', title: 'Usage limit approaching', message: 'You have used 85% of your monthly API quota.' })
    add({ type: 'info', title: 'New team member', message: 'Alice Martin has joined your workspace.' })
    add({ type: 'error', title: 'Payment failed', message: 'Your payment method was declined. Please update your billing details.' })
    add({ type: 'info', title: 'Scheduled maintenance', message: 'The service will be unavailable on Sunday 6 July from 02:00–04:00 UTC.' })
    add({ type: 'success', title: 'Export ready', message: 'Your data export is ready to download.' })
  }
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6 flex-wrap gap-3">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Notifications</h1>
        <p class="text-body-2 text-medium-emphasis">
          {{ unreadCount > 0 ? `${unreadCount} unread` : 'All caught up' }}
        </p>
      </div>
      <div class="d-flex gap-2">
        <v-btn
          v-if="unreadCount > 0"
          variant="tonal"
          size="small"
          prepend-icon="mdi-check-all"
          @click="markAllRead"
        >
          Mark all read
        </v-btn>
        <v-btn
          v-if="notifications.length > 0"
          variant="outlined"
          size="small"
          color="error"
          prepend-icon="mdi-delete-sweep-outline"
          @click="onClear"
        >
          Clear all
        </v-btn>
        <v-btn
          variant="tonal"
          size="small"
          color="primary"
          prepend-icon="mdi-plus"
          @click="add({ type: 'info', title: 'Test notification', message: 'This is a test notification added manually.' })"
        >
          Add test
        </v-btn>
      </div>
    </div>

    <!-- Filter tabs -->
    <v-card rounded="lg" class="mb-4" border elevation="0">
      <div class="d-flex overflow-x-auto pa-2 gap-1">
        <v-btn
          v-for="f in filters"
          :key="f.value"
          :color="filter === f.value ? 'primary' : 'default'"
          :variant="filter === f.value ? 'tonal' : 'text'"
          :prepend-icon="f.icon"
          size="small"
          rounded="lg"
          @click="filter = f.value"
        >
          {{ f.label }}
          <v-badge
            v-if="f.value === 'unread' && unreadCount > 0"
            :content="unreadCount"
            color="error"
            inline
            class="ml-1"
          />
        </v-btn>
      </div>
    </v-card>

    <!-- Empty state -->
    <v-card v-if="filtered.length === 0" rounded="lg" border elevation="0">
      <CommonEmptyState
        icon="mdi-bell-off-outline"
        :title="filter === 'unread' ? 'No unread notifications' : 'No notifications'"
        :message="filter === 'unread' ? 'You\'re all caught up! Check back later.' : 'Notifications will appear here when there\'s something to tell you.'"
        color="primary"
      />
    </v-card>

    <!-- Grouped notification list -->
    <div v-else class="d-flex flex-column gap-4">
      <div v-for="(group, label) in grouped" :key="label">
        <p class="text-overline text-medium-emphasis mb-2 px-1">{{ label }}</p>
        <v-card rounded="lg" border elevation="0">
          <div
            v-for="(n, i) in group"
            :key="n.id"
          >
            <v-divider v-if="i > 0" />
            <div
              class="d-flex align-start gap-3 pa-4 notification-row"
              :class="{ 'notification-row--unread': !n.read }"
              @click="onMarkRead(n.id)"
            >
              <!-- Type icon -->
              <v-avatar :color="typeColor[n.type]" variant="tonal" size="38" class="flex-shrink-0 mt-1">
                <v-icon :icon="typeIcon[n.type]" size="18" />
              </v-avatar>

              <!-- Content -->
              <div class="flex-1 overflow-hidden">
                <div class="d-flex align-center gap-2 mb-1">
                  <p class="text-body-2 font-weight-medium mb-0">{{ n.title }}</p>
                  <v-chip
                    v-if="!n.read"
                    color="primary"
                    size="x-small"
                    variant="tonal"
                    class="flex-shrink-0"
                  >
                    New
                  </v-chip>
                </div>
                <p class="text-body-2 text-medium-emphasis mb-1">{{ n.message }}</p>
                <p class="text-caption text-medium-emphasis">{{ formatTime(n.timestamp) }}</p>
              </div>

              <!-- Actions -->
              <div class="d-flex flex-column align-end gap-1 flex-shrink-0">
                <v-btn
                  icon="mdi-close"
                  size="x-small"
                  variant="text"
                  color="default"
                  @click.stop="onRemove(n.id)"
                />
                <v-btn
                  v-if="!n.read"
                  size="x-small"
                  variant="text"
                  color="primary"
                  @click.stop="onMarkRead(n.id)"
                >
                  Mark read
                </v-btn>
              </div>
            </div>
          </div>
        </v-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notification-row {
  cursor: pointer;
  transition: background 0.15s;
}
.notification-row:hover {
  background: rgba(var(--v-theme-on-surface), 0.03);
}
.notification-row--unread {
  background: rgba(var(--v-theme-primary), 0.04);
}
.notification-row--unread:hover {
  background: rgba(var(--v-theme-primary), 0.07);
}
</style>
