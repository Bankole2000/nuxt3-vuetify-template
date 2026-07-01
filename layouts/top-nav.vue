<script setup lang="ts">
import { useDisplay } from 'vuetify'

const mobileMenu = ref(false)
const { mobile } = useDisplay()
const { user, logout } = useAuth()
const { theme, toggleTheme } = useAppTheme()

const navItems = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard-outline', to: '/' },
  { title: 'Profile', icon: 'mdi-account-outline', to: '/profile' },
  { title: 'Settings', icon: 'mdi-cog-outline', to: '/settings' },
]
</script>

<template>
  <div>
    <v-app-bar elevation="0" border="b" scroll-behavior="fixed">
      <v-app-bar-title>
        <span class="font-weight-bold">MyApp</span>
      </v-app-bar-title>

      <template v-if="!mobile">
        <v-btn
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :prepend-icon="item.icon"
          variant="text"
          rounded="lg"
          class="mx-1"
        >
          {{ item.title }}
        </v-btn>
      </template>

      <template #append>
        <v-btn
          :icon="theme === 'dark' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          variant="text"
          @click="toggleTheme"
        />

        <v-menu min-width="200" location="bottom end">
          <template #activator="{ props }">
            <v-btn v-bind="props" variant="text" class="ml-1 mr-2">
              <v-avatar size="32" color="primary" class="mr-2">
                <span class="text-caption font-weight-bold text-white">
                  {{ user?.name?.charAt(0).toUpperCase() }}
                </span>
              </v-avatar>
              <span class="text-body-2 d-none d-sm-inline">{{ user?.name }}</span>
              <v-icon size="18" class="ml-1">mdi-chevron-down</v-icon>
            </v-btn>
          </template>

          <v-list density="compact" nav>
            <v-list-item prepend-icon="mdi-account-outline" title="Profile" to="/profile" rounded="lg" />
            <v-list-item prepend-icon="mdi-cog-outline" title="Settings" to="/settings" rounded="lg" />
            <v-divider class="my-1" />
            <v-list-item prepend-icon="mdi-logout" title="Sign out" rounded="lg" base-color="error" @click="logout" />
          </v-list>
        </v-menu>

        <v-app-bar-nav-icon v-if="mobile" @click="mobileMenu = !mobileMenu" />
      </template>
    </v-app-bar>

    <v-navigation-drawer v-if="mobile" v-model="mobileMenu" temporary location="top" height="auto">
      <v-list density="compact" nav class="pa-2">
        <LayoutNavItems />
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
