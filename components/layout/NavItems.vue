<script setup lang="ts">
defineProps<{ rail?: boolean }>()

const { unreadCount } = useNotifications()

const navGroups = [
  {
    items: [
      { title: 'Dashboard', icon: 'mdi-view-dashboard-outline', to: '/' },
      { title: 'Notifications', icon: 'mdi-bell-outline', to: '/notifications', badge: unreadCount },
    ],
  },
  {
    label: 'Account',
    items: [
      { title: 'Profile', icon: 'mdi-account-outline', to: '/profile' },
      { title: 'Settings', icon: 'mdi-cog-outline', to: '/settings' },
    ],
  },
]
</script>

<template>
  <template v-for="(group, gi) in navGroups" :key="gi">
    <v-divider v-if="gi > 0" class="my-2" />
    <v-list-subheader v-if="group.label && !rail">{{ group.label }}</v-list-subheader>
    <v-list-item
      v-for="item in group.items"
      :key="item.to"
      :to="item.to"
      :prepend-icon="item.icon"
      :title="rail ? undefined : item.title"
      :value="item.to"
      rounded="lg"
      active-class="text-primary"
    >
      <v-tooltip v-if="rail" activator="parent" location="end">{{ item.title }}</v-tooltip>
      <template v-if="'badge' in item && item.badge && !rail" #append>
        <v-chip color="error" size="x-small" variant="flat">{{ item.badge }}</v-chip>
      </template>
    </v-list-item>
  </template>
</template>
