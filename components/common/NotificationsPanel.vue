<script setup lang="ts">
const { notifications, unreadCount, markRead, markAllRead, remove, clear } = useNotifications()

const typeIcon: Record<string, string> = {
  info: 'mdi-information-outline',
  success: 'mdi-check-circle-outline',
  warning: 'mdi-alert-outline',
  error: 'mdi-alert-circle-outline',
}

const typeColor: Record<string, string> = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error',
}

const formatTime = (date: Date) => {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return date.toLocaleDateString()
}

const grouped = computed(() => {
  const today: typeof notifications.value = []
  const earlier: typeof notifications.value = []
  const now = new Date()
  for (const n of notifications.value) {
    const d = new Date(n.timestamp)
    if (d.toDateString() === now.toDateString()) today.push(n)
    else earlier.push(n)
  }
  return { today, earlier }
})
</script>

<template>
  <v-menu
    location="bottom end"
    :close-on-content-click="false"
    min-width="360"
    max-width="420"
  >
    <template #activator="{ props }">
      <v-btn v-bind="props" icon variant="text">
        <v-badge
          :content="unreadCount"
          :model-value="unreadCount > 0"
          color="error"
          floating
        >
          <v-icon icon="mdi-bell-outline" />
        </v-badge>
      </v-btn>
    </template>

    <v-card rounded="lg" elevation="8">
      <v-card-title class="d-flex align-center justify-space-between pa-4 pb-2">
        <span class="text-body-1 font-weight-bold">Notifications</span>
        <div class="d-flex gap-1">
          <v-btn
            v-if="unreadCount > 0"
            size="x-small"
            variant="text"
            @click="markAllRead"
          >
            Mark all read
          </v-btn>
          <v-btn
            v-if="notifications.length > 0"
            size="x-small"
            variant="text"
            color="error"
            @click="clear"
          >
            Clear all
          </v-btn>
        </div>
      </v-card-title>

      <v-divider />

      <v-list
        v-if="notifications.length"
        lines="two"
        class="pa-1"
        style="max-height: 420px; overflow-y: auto;"
      >
        <template v-if="grouped.today.length">
          <v-list-subheader>Today</v-list-subheader>
          <v-list-item
            v-for="n in grouped.today"
            :key="n.id"
            rounded="lg"
            class="mb-1"
            :class="n.read ? '' : 'bg-surface-variant'"
            @click="markRead(n.id)"
          >
            <template #prepend>
              <v-avatar :color="typeColor[n.type]" variant="tonal" size="36" class="mr-2">
                <v-icon :icon="typeIcon[n.type]" size="18" />
              </v-avatar>
            </template>
            <v-list-item-title class="text-body-2 font-weight-medium">{{ n.title }}</v-list-item-title>
            <v-list-item-subtitle class="text-caption">{{ n.message }}</v-list-item-subtitle>
            <template #append>
              <div class="d-flex flex-column align-end ga-1">
                <span class="text-caption text-medium-emphasis">{{ formatTime(n.timestamp) }}</span>
                <v-btn icon="mdi-close" size="x-small" variant="text" @click.stop="remove(n.id)" />
              </div>
            </template>
          </v-list-item>
        </template>

        <template v-if="grouped.earlier.length">
          <v-list-subheader>Earlier</v-list-subheader>
          <v-list-item
            v-for="n in grouped.earlier"
            :key="n.id"
            rounded="lg"
            class="mb-1"
            :class="n.read ? '' : 'bg-surface-variant'"
            @click="markRead(n.id)"
          >
            <template #prepend>
              <v-avatar :color="typeColor[n.type]" variant="tonal" size="36" class="mr-2">
                <v-icon :icon="typeIcon[n.type]" size="18" />
              </v-avatar>
            </template>
            <v-list-item-title class="text-body-2 font-weight-medium">{{ n.title }}</v-list-item-title>
            <v-list-item-subtitle class="text-caption">{{ n.message }}</v-list-item-subtitle>
            <template #append>
              <div class="d-flex flex-column align-end ga-1">
                <span class="text-caption text-medium-emphasis">{{ formatTime(n.timestamp) }}</span>
                <v-btn icon="mdi-close" size="x-small" variant="text" @click.stop="remove(n.id)" />
              </div>
            </template>
          </v-list-item>
        </template>
      </v-list>

      <div v-else class="pa-8 text-center">
        <v-icon icon="mdi-bell-off-outline" size="40" class="text-medium-emphasis mb-2" style="opacity:0.4" />
        <p class="text-body-2 text-medium-emphasis">No notifications</p>
      </div>
    </v-card>
  </v-menu>
</template>
