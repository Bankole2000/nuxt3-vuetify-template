<script setup lang="ts">
definePageMeta({ layout: 'catalogue' })

const layouts = [
  {
    name: 'default',
    title: 'Side Drawer',
    description: 'Persistent sidebar on desktop, collapsible hamburger drawer on mobile. Best for apps with many navigation sections.',
    icon: 'mdi-page-layout-sidebar-left',
    color: 'primary',
    features: ['Persistent sidebar', 'Responsive collapse', 'Section dividers', 'App bar with user menu'],
  },
  {
    name: 'top-nav',
    title: 'Top Navigation',
    description: 'Horizontal nav links in the app bar. Collapses to a top-slide drawer on mobile. Best for apps with few top-level sections.',
    icon: 'mdi-dock-top',
    color: 'secondary',
    features: ['Inline nav links', 'Mobile top drawer', 'Clean minimal look', 'App bar with user menu'],
  },
  {
    name: 'mini-rail',
    title: 'Mini Rail',
    description: 'Icon-only collapsed sidebar that expands to full labels on hover. Saves horizontal space while keeping nav accessible.',
    icon: 'mdi-page-layout-sidebar-left',
    color: 'info',
    features: ['Icon-only rail', 'Hover to expand', 'Tooltip on hover in rail mode', 'Collapses to drawer on mobile'],
  },
  {
    name: 'blank',
    title: 'Blank',
    description: 'Centered column layout with no navigation. Used for auth pages (login, register, etc.) and standalone flows.',
    icon: 'mdi-fullscreen',
    color: 'success',
    features: ['No navigation', 'Vertically centered content', 'Responsive column width', 'Used by all auth pages'],
  },
]
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">Layouts</h1>
    <p class="text-body-2 text-medium-emphasis mb-8">
      Four layouts available. Set via <code>definePageMeta({ layout: '...' })</code> on any page.
    </p>

    <v-row class="mb-8">
      <v-col v-for="layout in layouts" :key="layout.name" cols="12" sm="6">
        <v-card rounded="lg" height="100%">
          <v-card-text class="pa-6">
            <div class="d-flex align-center gap-3 mb-4">
              <v-avatar :color="layout.color" variant="tonal" size="44" rounded="lg">
                <v-icon :icon="layout.icon" />
              </v-avatar>
              <div>
                <p class="text-body-1 font-weight-bold">{{ layout.title }}</p>
                <code class="text-caption text-medium-emphasis">layout: '{{ layout.name }}'</code>
              </div>
            </div>
            <p class="text-body-2 text-medium-emphasis mb-4">{{ layout.description }}</p>
            <div class="d-flex flex-column gap-1">
              <div v-for="feature in layout.features" :key="feature" class="d-flex align-center gap-2">
                <v-icon icon="mdi-check" size="14" color="success" />
                <span class="text-body-2">{{ feature }}</span>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <h2 class="text-overline text-medium-emphasis mb-4">Usage</h2>
    <v-card rounded="lg" class="pa-6">
      <p class="text-body-2 font-weight-bold mb-3">Set on any page:</p>
      <v-sheet rounded="lg" color="surface-variant" class="pa-4 mb-6">
        <pre class="text-body-2"><code>&lt;script setup lang="ts"&gt;
definePageMeta({ layout: 'default' })   // side drawer
definePageMeta({ layout: 'top-nav' })   // top navigation
definePageMeta({ layout: 'mini-rail' }) // icon rail
definePageMeta({ layout: 'blank' })     // no navigation
&lt;/script&gt;</code></pre>
      </v-sheet>

      <p class="text-body-2 font-weight-bold mb-3">All layouts share:</p>
      <div class="d-flex flex-column gap-1">
        <div v-for="feature in ['Dark mode toggle (persisted to localStorage)', 'User avatar with dropdown menu (Profile, Settings, Sign out)', 'Responsive behaviour — all layouts adapt to mobile', 'Same nav items from components/layout/NavItems.vue']"
          :key="feature" class="d-flex align-center gap-2">
          <v-icon icon="mdi-check" size="14" color="success" />
          <span class="text-body-2">{{ feature }}</span>
        </div>
      </div>
    </v-card>
  </div>
</template>
