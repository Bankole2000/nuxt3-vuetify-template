<script setup lang="ts">
defineProps<{
  showMenuBtn?: boolean
  title?: string
}>()

defineEmits<{ (e: 'toggle-drawer'): void }>()

const { user, logout } = useAuth()
const { theme, toggleTheme } = useAppTheme()
</script>

<template>
  <v-app-bar elevation="0" border="b" scroll-behavior="fixed">
    <v-app-bar-nav-icon v-if="showMenuBtn" @click="$emit('toggle-drawer')" />

    <v-app-bar-title>
      <span class="font-weight-bold">MyApp</span>
      <span v-if="title" class="text-medium-emphasis font-weight-regular ml-2 text-body-1">
        / {{ title }}
      </span>
    </v-app-bar-title>

    <template #append>
      <v-btn
        v-if="$config.public.isDev"
        icon="mdi-puzzle-outline"
        variant="text"
        to="/catalogue"
        title="Component catalogue"
      />

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
          <v-list-item
            prepend-icon="mdi-account-outline"
            title="Profile"
            to="/profile"
            rounded="lg"
          />
          <v-list-item
            prepend-icon="mdi-cog-outline"
            title="Settings"
            to="/settings"
            rounded="lg"
          />
          <v-divider class="my-1" />
          <v-list-item
            prepend-icon="mdi-logout"
            title="Sign out"
            rounded="lg"
            base-color="error"
            @click="logout"
          />
        </v-list>
      </v-menu>
    </template>
  </v-app-bar>
</template>
