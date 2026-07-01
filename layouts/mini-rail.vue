<script setup lang="ts">
import { useDisplay } from 'vuetify'

const rail = ref(true)
const { mobile } = useDisplay()
const drawer = ref(true)

watch(mobile, (isMobile) => {
  if (isMobile) {
    rail.value = false
    drawer.value = false
  } else {
    rail.value = true
    drawer.value = true
  }
}, { immediate: true })
</script>

<template>
  <div>
    <LayoutAppBar show-menu-btn @toggle-drawer="drawer = !drawer" />

    <v-navigation-drawer v-model="drawer" :rail="!mobile && rail" :temporary="mobile" @mouseenter="rail = false" @mouseleave="rail = true">
      <v-list-item
        prepend-icon="mdi-layers-outline"
        :title="rail ? undefined : 'MyApp'"
        nav
        class="py-4"
      />
      <v-divider />
      <v-list density="compact" nav class="mt-2">
        <LayoutNavItems :rail="!mobile && rail" />
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid class="pa-6">
        <LayoutBreadcrumbs />
        <slot />
      </v-container>
    </v-main>
  </div>
</template>
