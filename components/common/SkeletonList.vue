<script setup lang="ts">
withDefaults(defineProps<{
  count?: number
  avatar?: boolean
}>(), {
  count: 5,
  avatar: true,
})
</script>

<template>
  <v-list>
    <v-skeleton-loader
      v-for="i in count"
      :key="i"
      :type="avatar ? 'list-item-avatar-two-line' : 'list-item-two-line'"
      class="mb-1"
    />
  </v-list>
</template>
