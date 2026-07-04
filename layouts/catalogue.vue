<script setup lang="ts">
const { theme, toggleTheme } = useAppTheme()

const allSections = [
  { title: 'Audit Log', to: '/catalogue/audit-log', icon: 'mdi-history' },
  { title: 'Animated Counter', to: '/catalogue/animated-counter', icon: 'mdi-counter' },
  { title: 'Approval Flow', to: '/catalogue/approval-flow', icon: 'mdi-clipboard-check-outline' },
  { title: 'Async Autocomplete', to: '/catalogue/autocomplete', icon: 'mdi-text-search' },
  { title: 'Chat', to: '/catalogue/chat', icon: 'mdi-chat-outline' },
  { title: 'Budget Ledger', to: '/catalogue/budget-ledger', icon: 'mdi-cash-multiple' },
  { title: 'Calendar', to: '/catalogue/calendar', icon: 'mdi-calendar-outline' },
  { title: 'Charts', to: '/catalogue/charts', icon: 'mdi-chart-line' },
  { title: 'Clipboard & Share', to: '/catalogue/clipboard-share', icon: 'mdi-share-variant-outline' },
  { title: 'Clock & Timetable', to: '/catalogue/clock', icon: 'mdi-clock-outline' },
  { title: 'Color Picker', to: '/catalogue/color-picker', icon: 'mdi-palette-outline' },
  { title: 'Command Palette', to: '/catalogue/command-palette', icon: 'mdi-magnify' },
  { title: 'Command REPL', to: '/catalogue/command-repl', icon: 'mdi-console' },
  { title: 'Critical Thinking', to: '/catalogue/critical-thinking', icon: 'mdi-head-lightbulb-outline' },
  { title: 'Components', to: '/catalogue/components', icon: 'mdi-puzzle-outline' },
  { title: 'Contract Viewer', to: '/catalogue/contract-viewer', icon: 'mdi-file-sign' },
  { title: 'Data Display', to: '/catalogue/data-display', icon: 'mdi-table' },
  { title: 'Data Export', to: '/catalogue/data-export', icon: 'mdi-download-outline' },
  { title: 'Data Import', to: '/catalogue/data-import', icon: 'mdi-upload-outline' },
  { title: 'Data Grid', to: '/catalogue/data-grid', icon: 'mdi-table-edit' },
  { title: 'Date & Time', to: '/catalogue/date-time', icon: 'mdi-calendar-clock' },
  { title: 'Family Tree', to: '/catalogue/family-tree', icon: 'mdi-family-tree' },
  { title: 'Feedback', to: '/catalogue/feedback', icon: 'mdi-bell-outline' },
  { title: 'File Upload', to: '/catalogue/file-upload', icon: 'mdi-upload-outline' },
  { title: 'Emoji Picker', to: '/catalogue/emoji-picker', icon: 'mdi-emoticon-outline' },
  { title: 'Forms', to: '/catalogue/forms', icon: 'mdi-form-select' },
  { title: 'Gantt Chart', to: '/catalogue/gantt', icon: 'mdi-chart-gantt' },
  { title: 'Geolocation', to: '/catalogue/geolocation', icon: 'mdi-map-marker-radius-outline' },
  { title: 'Health Metrics', to: '/catalogue/health-metrics', icon: 'mdi-heart-pulse' },
  { title: 'Image Gallery', to: '/catalogue/image-gallery', icon: 'mdi-image-multiple-outline' },
  { title: 'Interactive Grid', to: '/catalogue/interactive-grid', icon: 'mdi-grid' },
  { title: 'Isometric Scene', to: '/catalogue/isometric-scene', icon: 'mdi-domain' },
  { title: 'Invoice', to: '/catalogue/invoice', icon: 'mdi-file-document-outline' },
  { title: 'Kanban Board', to: '/catalogue/kanban', icon: 'mdi-view-column-outline' },
  { title: 'KPI Dashboard', to: '/catalogue/kpi-dashboard', icon: 'mdi-view-dashboard-outline' },
  { title: 'Layouts', to: '/catalogue/layouts', icon: 'mdi-page-layout-sidebar-left' },
  { title: 'Location Picker', to: '/catalogue/location-picker', icon: 'mdi-map-marker-plus-outline' },
  { title: 'Link Preview', to: '/catalogue/link-preview', icon: 'mdi-link-box-outline' },
  { title: 'Markdown Viewer', to: '/catalogue/markdown-viewer', icon: 'mdi-language-markdown-outline' },
  { title: 'Media Recorder', to: '/catalogue/media-recorder', icon: 'mdi-record-circle-outline' },
  { title: 'Motion Graphics', to: '/catalogue/motion-graphics', icon: 'mdi-motion-play-outline' },
  { title: 'Model Viewer (3D)', to: '/catalogue/model-viewer', icon: 'mdi-rotate-3d' },
  { title: 'Node Link Diagram', to: '/catalogue/node-link', icon: 'mdi-graph-outline' },
  { title: 'Tube Map', to: '/catalogue/tube-map', icon: 'mdi-subway-variant' },
  { title: 'Tube Map Editor', to: '/catalogue/tube-map-editor', icon: 'mdi-map-plus' },
  { title: 'Notifications', to: '/catalogue/notifications', icon: 'mdi-bell-badge-outline' },
  { title: 'Notification Preferences', to: '/catalogue/notification-preferences', icon: 'mdi-bell-cog-outline' },
  { title: 'Onboarding Tour', to: '/catalogue/onboarding-tour', icon: 'mdi-compass-outline' },
  { title: 'OTP / PIN Input', to: '/catalogue/otp-input', icon: 'mdi-numeric' },
  { title: 'Pagination', to: '/catalogue/pagination', icon: 'mdi-format-list-numbered' },
  { title: 'Pomodoro Timer', to: '/catalogue/pomodoro', icon: 'mdi-timer-outline' },
  { title: 'PDF Viewer', to: '/catalogue/pdf-viewer', icon: 'mdi-file-pdf-box' },
  { title: 'Presence & Collaborators', to: '/catalogue/presence', icon: 'mdi-account-group-outline' },
  { title: 'Pricing Table', to: '/catalogue/pricing', icon: 'mdi-currency-usd' },
  { title: 'QR Code', to: '/catalogue/qr-code', icon: 'mdi-qrcode' },
  { title: 'Rich Text Editor', to: '/catalogue/rich-text-editor', icon: 'mdi-format-letter-case' },
  { title: 'Signature Pad', to: '/catalogue/signature-pad', icon: 'mdi-draw' },
  { title: 'Social Media', to: '/catalogue/social-media', icon: 'mdi-instagram' },
  { title: 'Sortable List', to: '/catalogue/sortable', icon: 'mdi-drag-vertical' },
  { title: 'Speed Dial', to: '/catalogue/speed-dial', icon: 'mdi-gesture-tap-button' },
  { title: 'Split Pane', to: '/catalogue/split-pane', icon: 'mdi-view-split-vertical' },
  { title: 'Stepper', to: '/catalogue/stepper', icon: 'mdi-stairs' },
  { title: 'Tag Input', to: '/catalogue/tag-input', icon: 'mdi-tag-multiple-outline' },
  { title: 'Timeline', to: '/catalogue/timeline', icon: 'mdi-timeline-outline' },
  { title: 'Tree View', to: '/catalogue/tree-view', icon: 'mdi-file-tree-outline' },
  { title: 'Theme Builder', to: '/catalogue/theme-builder', icon: 'mdi-palette-swatch-outline' },
  { title: 'Typography', to: '/catalogue/typography', icon: 'mdi-format-text' },
  { title: 'UX Patterns', to: '/catalogue/ux-patterns', icon: 'mdi-layers-outline' },
  { title: 'Video Player', to: '/catalogue/video-player', icon: 'mdi-play-circle-outline' },
  { title: 'Virtual Scroll', to: '/catalogue/virtual-scroll', icon: 'mdi-view-list-outline' },
  { title: 'Vue Flow', to: '/catalogue/vue-flow', icon: 'mdi-graph-outline' },
  { title: 'WebSocket', to: '/catalogue/websocket', icon: 'mdi-access-point' },
  { title: 'WebGL Canvas', to: '/catalogue/webgl-canvas', icon: 'mdi-shader' },
  { title: 'Workflow Editor', to: '/catalogue/workflow', icon: 'mdi-vector-polyline' },
]

const navQuery = ref('')

const sections = computed(() => {
  const q = navQuery.value.trim().toLowerCase()
  if (!q) return allSections
  return allSections.filter(s => s.title.toLowerCase().includes(q))
})
</script>

<template>
  <div>
    <v-app-bar elevation="0" border="b" scroll-behavior="fixed">
      <v-app-bar-title>
        <span class="font-weight-bold">Component Catalogue</span>
      </v-app-bar-title>
      <template #append>
        <v-btn
          :icon="theme === 'dark' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          variant="text"
          @click="toggleTheme"
        />
        <v-btn to="/" variant="text" prepend-icon="mdi-arrow-left" class="mr-2">
          Back to app
        </v-btn>
      </template>
    </v-app-bar>

    <v-navigation-drawer permanent>
      <div class="pa-2 pt-3">
        <v-list-item
          to="/catalogue"
          prepend-icon="mdi-view-grid-outline"
          title="Overview"
          rounded="lg"
          active-class="text-primary"
          exact
          class="mb-1"
        />

        <v-text-field
          v-model="navQuery"
          placeholder="Filter…"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          rounded="lg"
          clearable
          hide-details
          class="my-2"
        />

        <v-divider class="mb-2" />

        <v-list density="compact" nav class="pa-0">
          <v-list-item
            v-for="section in sections"
            :key="section.to"
            :to="section.to"
            :prepend-icon="section.icon"
            :title="section.title"
            rounded="lg"
            active-class="text-primary"
          />
          <div v-if="!sections.length" class="text-center py-4 text-caption text-medium-emphasis">
            No match
          </div>
        </v-list>
      </div>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid class="pa-8" style="max-width: 1100px;">
        <slot />
      </v-container>
    </v-main>
  </div>
</template>
