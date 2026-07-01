<script setup lang="ts">
definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Command Palette', disabled: true },
  ],
})

const { register, unregister, show } = useCommandPalette()
const toast = useToast()
const router = useRouter()

const commands = [
  { id: 'nav-home', label: 'Go to Dashboard', icon: 'mdi-view-dashboard-outline', group: 'Navigation', action: () => router.push('/') },
  { id: 'nav-profile', label: 'Go to Profile', icon: 'mdi-account-outline', group: 'Navigation', action: () => router.push('/profile') },
  { id: 'nav-settings', label: 'Go to Settings', icon: 'mdi-cog-outline', group: 'Navigation', action: () => router.push('/settings') },
  { id: 'toast-success', label: 'Show success toast', icon: 'mdi-check-circle-outline', group: 'Actions', action: () => toast.success('Success!') },
  { id: 'toast-error', label: 'Show error toast', icon: 'mdi-alert-circle-outline', group: 'Actions', action: () => toast.error('Something went wrong.') },
  { id: 'copy-url', label: 'Copy current URL', icon: 'mdi-link', group: 'Actions', shortcut: '⌘⇧C', action: () => { navigator.clipboard.writeText(window.location.href); toast.info('URL copied!') } },
  { id: 'theme-toggle', label: 'Toggle dark mode', icon: 'mdi-theme-light-dark', group: 'Appearance', action: () => { const { toggleTheme } = useAppTheme(); toggleTheme(); toast.info('Theme toggled') } },
]

onMounted(() => register(commands))
onUnmounted(() => unregister(commands.map(c => c.id)))
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">Command Palette</h1>
    <p class="text-body-2 text-medium-emphasis mb-8">
      Global <kbd>⌘K</kbd> / <kbd>Ctrl+K</kbd> command palette. Registered commands are searchable and keyboard navigable.
      The palette is mounted globally in <code>UiProvider</code>.
    </p>

    <v-card rounded="lg" class="mb-6 pa-5">
      <p class="text-body-2 text-medium-emphasis mb-4">
        Press <kbd>⌘K</kbd> or click the button below to open the palette.
        Use <kbd>↑↓</kbd> to navigate and <kbd>↵</kbd> to run a command.
      </p>
      <v-btn color="primary" prepend-icon="mdi-magnify" @click="show">
        Open command palette
        <v-kbd class="ml-2 text-caption">⌘K</v-kbd>
      </v-btn>
    </v-card>

    <h2 class="text-overline text-medium-emphasis mb-4">Registered commands on this page</h2>
    <v-card rounded="lg" class="pa-2">
      <v-list density="compact">
        <v-list-item
          v-for="cmd in commands"
          :key="cmd.id"
          :prepend-icon="cmd.icon"
          rounded="lg"
          @click="cmd.action"
        >
          <v-list-item-title class="text-body-2">{{ cmd.label }}</v-list-item-title>
          <v-list-item-subtitle class="text-caption">{{ cmd.group }}</v-list-item-subtitle>
          <template v-if="cmd.shortcut" #append>
            <v-kbd class="text-caption">{{ cmd.shortcut }}</v-kbd>
          </template>
        </v-list-item>
      </v-list>
    </v-card>

    <h2 class="text-overline text-medium-emphasis mt-8 mb-4">Usage</h2>
    <v-card rounded="lg" class="pa-5">
      <v-sheet rounded="lg" color="surface-variant" class="pa-4">
        <pre v-pre class="text-body-2"><code>const { register, unregister } = useCommandPalette()

onMounted(() => register([
  {
    id: 'my-action',
    label: 'Do something',
    icon: 'mdi-star',
    group: 'Actions',
    shortcut: '⌘⇧A',
    action: () => console.log('done'),
  },
]))

onUnmounted(() => unregister(['my-action']))</code></pre>
      </v-sheet>
    </v-card>
  </div>
</template>
