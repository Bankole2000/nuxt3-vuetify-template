<script setup lang="ts">
defineProps<{ rail?: boolean }>()

const navGroups = [
  {
    items: [
      { title: 'Dashboard', icon: 'mdi-view-dashboard-outline', to: '/' },
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
    </v-list-item>
  </template>
</template>
