<script setup lang="ts">
definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'UX Patterns', disabled: true },
  ],
})

const { currentTransition, setTransition } = usePageTransition()
const toast = useToast()

type TransitionName = 'fade' | 'slide' | 'fade-slide' | 'none'
const transitions: { label: string; value: TransitionName }[] = [
  { label: 'Fade + Slide (default)', value: 'fade-slide' },
  { label: 'Fade', value: 'fade' },
  { label: 'Slide', value: 'slide' },
  { label: 'None', value: 'none' },
]

// Empty state scenarios
const emptyScenarios = [
  { icon: 'mdi-inbox-outline', title: 'No messages', message: 'When your inbox is empty, new messages will appear here.', color: 'primary', action: 'Compose message' },
  { icon: 'mdi-magnify', title: 'No results', message: 'Try adjusting your search or filters to find what you\'re looking for.', color: 'warning', action: 'Clear filters' },
  { icon: 'mdi-folder-open-outline', title: 'No files', message: 'Upload your first file to get started.', color: 'info', action: 'Upload file' },
  { icon: 'mdi-alert-circle-outline', title: 'Something went wrong', message: 'We couldn\'t load your data. Please try again.', color: 'error', action: 'Retry' },
]

// Skeletons
const showSkeletons = ref(true)
const skeletonLoading = ref(false)

const simulateLoad = async () => {
  showSkeletons.value = true
  skeletonLoading.value = true
  await new Promise(r => setTimeout(r, 2000))
  showSkeletons.value = false
  skeletonLoading.value = false
  toast.success('Content loaded!')
}
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">UX Patterns</h1>
    <p class="text-body-2 text-medium-emphasis mb-8">
      Breadcrumbs, page transitions, empty states and skeleton loaders.
    </p>

    <!-- Breadcrumbs -->
    <h2 class="text-overline text-medium-emphasis mb-4">Breadcrumbs</h2>
    <v-card rounded="lg" class="mb-6 pa-6">
      <p class="text-body-2 text-medium-emphasis mb-4">
        Auto-generated from the URL. This page uses a manual override via <code>definePageMeta({ breadcrumbs: [...] })</code>.
        The breadcrumb above this card is live.
      </p>

      <p class="text-body-2 font-weight-bold mb-2">Auto-generated example (from path):</p>
      <v-breadcrumbs
        :items="[
          { title: 'Home', to: '/' },
          { title: 'Catalogue', to: '/catalogue' },
          { title: 'UX Patterns', disabled: true },
        ]"
        density="compact"
        class="pa-0"
      >
        <template #divider><v-icon icon="mdi-chevron-right" size="16" /></template>
        <template #title="{ item }">
          <span :class="item.disabled ? 'text-medium-emphasis' : 'text-primary'" class="text-body-2">{{ item.title }}</span>
        </template>
      </v-breadcrumbs>

      <v-divider class="my-4" />
      <p class="text-body-2 font-weight-bold mb-2">Manual override in any page:</p>
      <v-sheet rounded="lg" color="surface-variant" class="pa-4">
        <pre class="text-body-2"><code>definePageMeta({
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Orders', to: '/orders' },
    { title: 'Order #1042', disabled: true },
  ],
})</code></pre>
      </v-sheet>
    </v-card>

    <!-- Page transitions -->
    <h2 class="text-overline text-medium-emphasis mb-4">Page transitions</h2>
    <v-card rounded="lg" class="mb-6 pa-6">
      <p class="text-body-2 text-medium-emphasis mb-4">
        Select a transition. Navigate between pages to see it in action.
        The setting is global and persists while the app is running.
      </p>
      <div class="d-flex flex-wrap gap-3">
        <v-btn
          v-for="t in transitions"
          :key="t.value"
          :color="currentTransition === t.value ? 'primary' : 'default'"
          :variant="currentTransition === t.value ? 'tonal' : 'outlined'"
          size="small"
          @click="setTransition(t.value)"
        >
          {{ t.label }}
        </v-btn>
      </div>
      <p class="text-caption text-medium-emphasis mt-3">
        Active: <strong>{{ currentTransition }}</strong> — navigate to another page to preview it.
      </p>
    </v-card>

    <!-- Empty states -->
    <h2 class="text-overline text-medium-emphasis mb-4">Empty states</h2>
    <v-row class="mb-6">
      <v-col v-for="scenario in emptyScenarios" :key="scenario.title" cols="12" sm="6">
        <v-card rounded="lg" border>
          <CommonEmptyState
            :icon="scenario.icon"
            :title="scenario.title"
            :message="scenario.message"
            :color="scenario.color"
          >
            <v-btn :color="scenario.color" variant="tonal" size="small" @click="toast.info(scenario.action)">
              {{ scenario.action }}
            </v-btn>
          </CommonEmptyState>
        </v-card>
      </v-col>
    </v-row>

    <!-- Skeleton loaders -->
    <h2 class="text-overline text-medium-emphasis mb-4">Skeleton loaders</h2>
    <v-card rounded="lg" class="mb-4 pa-6">
      <div class="d-flex align-center justify-space-between mb-4">
        <p class="text-body-2 text-medium-emphasis">Simulates a 2-second load. Click to toggle.</p>
        <v-btn
          :color="showSkeletons ? 'default' : 'primary'"
          variant="tonal"
          size="small"
          :loading="skeletonLoading"
          @click="simulateLoad"
        >
          {{ showSkeletons ? 'Loading…' : 'Reload' }}
        </v-btn>
      </div>

      <p class="text-caption text-overline text-medium-emphasis mb-2">SkeletonCard</p>
      <template v-if="showSkeletons">
        <CommonSkeletonCard :count="3" :cols="3" class="mb-6" />
      </template>
      <template v-else>
        <v-row class="mb-6">
          <v-col v-for="i in 3" :key="i" cols="12" sm="4">
            <v-card rounded="lg">
              <v-card-title class="pa-4 pb-2">Card {{ i }}</v-card-title>
              <v-card-text class="px-4 pb-4 text-body-2 text-medium-emphasis">Content loaded successfully.</v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </template>

      <p class="text-caption text-overline text-medium-emphasis mb-2">SkeletonList</p>
      <v-card rounded="lg" border class="mb-6">
        <CommonSkeletonList v-if="showSkeletons" :count="4" />
        <v-list v-else class="pa-2">
          <v-list-item v-for="i in 4" :key="i" rounded="lg" class="mb-1">
            <template #prepend>
              <v-avatar color="primary" variant="tonal" size="36" class="mr-3">{{ i }}</v-avatar>
            </template>
            <v-list-item-title class="text-body-2 font-weight-medium">List item {{ i }}</v-list-item-title>
            <v-list-item-subtitle class="text-caption">Subtitle text</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card>

      <p class="text-caption text-overline text-medium-emphasis mb-2">SkeletonTable</p>
      <v-card rounded="lg" border>
        <CommonSkeletonTable v-if="showSkeletons" :rows="4" :columns="4" />
        <v-data-table
          v-else
          :headers="[{ title: 'Name', key: 'name' }, { title: 'Role', key: 'role' }, { title: 'Status', key: 'status' }, { title: 'Joined', key: 'joined' }]"
          :items="[
            { name: 'Alice Martin', role: 'Admin', status: 'Active', joined: '2024-01-12' },
            { name: 'Bob Chen', role: 'Editor', status: 'Active', joined: '2024-02-03' },
            { name: 'Carol White', role: 'Viewer', status: 'Inactive', joined: '2024-03-18' },
            { name: 'David Kim', role: 'Editor', status: 'Pending', joined: '2024-04-05' },
          ]"
          :items-per-page="4"
          hide-default-footer
        />
      </v-card>
    </v-card>
  </div>
</template>
