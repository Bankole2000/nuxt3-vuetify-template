<script setup lang="ts">
definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Notifications', disabled: true },
  ],
})

const { add } = useNotifications()

const samples = [
  { type: 'success' as const, title: 'Deployment complete', message: 'v2.4.1 deployed to production successfully.' },
  { type: 'error' as const, title: 'Build failed', message: 'The CI pipeline failed on step "run tests".' },
  { type: 'warning' as const, title: 'Storage limit', message: 'You are using 90% of your storage quota.' },
  { type: 'info' as const, title: 'New team member', message: 'Alice Martin has joined your workspace.' },
]

const addRandom = () => {
  const s = samples[Math.floor(Math.random() * samples.length)]
  if (s) add(s)
}
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">Notifications Panel</h1>
    <p class="text-body-2 text-medium-emphasis mb-8">
      A bell-icon menu with read/unread state, grouped by date, mark-all-read and clear-all actions.
      State is shared via the module-level <code>useNotifications</code> composable.
    </p>

    <v-card rounded="lg" class="mb-6 pa-5">
      <p class="text-body-2 text-medium-emphasis mb-4">
        The bell icon in the toolbar below is the real <code>NotificationsPanel</code> component.
        Add notifications and interact with them there.
      </p>

      <div class="d-flex align-center gap-3 pa-3 rounded-lg" style="border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));">
        <span class="text-body-2 font-weight-medium flex-1">Simulated toolbar</span>
        <CommonNotificationsPanel />
      </div>

      <div class="d-flex flex-wrap gap-2 mt-4">
        <v-btn
          v-for="s in samples"
          :key="s.type"
          :color="s.type === 'error' ? 'error' : s.type === 'warning' ? 'warning' : s.type === 'success' ? 'success' : 'info'"
          variant="tonal"
          size="small"
          @click="add(s)"
        >
          Add {{ s.type }}
        </v-btn>
        <v-btn variant="outlined" size="small" @click="addRandom">Add random</v-btn>
      </div>
    </v-card>

    <h2 class="text-overline text-medium-emphasis mb-4">Usage</h2>
    <v-card rounded="lg" class="pa-5">
      <v-sheet rounded="lg" color="surface-variant" class="pa-4">
        <pre v-pre class="text-body-2"><code>// Add to AppBar or any layout
&lt;CommonNotificationsPanel /&gt;

// From anywhere in the app
const { add } = useNotifications()
add({
  type: 'success',
  title: 'Done',
  message: 'Your file was uploaded.',
})</code></pre>
      </v-sheet>
    </v-card>
  </div>
</template>
