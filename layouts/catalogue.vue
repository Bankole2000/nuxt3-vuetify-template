<script setup lang="ts">
const { theme, toggleTheme } = useAppTheme()

const sections = [
  { title: 'Typography', to: '/catalogue/typography', icon: 'mdi-format-text' },
  { title: 'Components', to: '/catalogue/components', icon: 'mdi-puzzle-outline' },
  { title: 'Forms', to: '/catalogue/forms', icon: 'mdi-form-select' },
  { title: 'Feedback', to: '/catalogue/feedback', icon: 'mdi-bell-outline' },
  { title: 'Data Display', to: '/catalogue/data-display', icon: 'mdi-table' },
  { title: 'Layouts', to: '/catalogue/layouts', icon: 'mdi-page-layout-sidebar-left' },
  { title: 'File Upload', to: '/catalogue/file-upload', icon: 'mdi-upload-outline' },
  { title: 'Pagination', to: '/catalogue/pagination', icon: 'mdi-format-list-numbered' },
  { title: 'WebSocket', to: '/catalogue/websocket', icon: 'mdi-access-point' },
  { title: 'UX Patterns', to: '/catalogue/ux-patterns', icon: 'mdi-layers-outline' },
  { title: 'Geolocation', to: '/catalogue/geolocation', icon: 'mdi-map-marker-radius-outline' },
  { title: 'Sortable List', to: '/catalogue/sortable', icon: 'mdi-drag-vertical' },
  { title: 'Rich Text Editor', to: '/catalogue/rich-text-editor', icon: 'mdi-format-letter-case' },
  { title: 'Date & Time', to: '/catalogue/date-time', icon: 'mdi-calendar-clock' },
  { title: 'Color Picker', to: '/catalogue/color-picker', icon: 'mdi-palette-outline' },
  { title: 'Virtual Scroll', to: '/catalogue/virtual-scroll', icon: 'mdi-view-list-outline' },
  { title: 'Stepper', to: '/catalogue/stepper', icon: 'mdi-stairs' },
  { title: 'Command Palette', to: '/catalogue/command-palette', icon: 'mdi-magnify' },
  { title: 'Notifications', to: '/catalogue/notifications', icon: 'mdi-bell-badge-outline' },
  { title: 'Data Export', to: '/catalogue/data-export', icon: 'mdi-download-outline' },
  { title: 'Clipboard & Share', to: '/catalogue/clipboard-share', icon: 'mdi-share-variant-outline' },
  { title: 'Tag Input', to: '/catalogue/tag-input', icon: 'mdi-tag-multiple-outline' },
  { title: 'Async Autocomplete', to: '/catalogue/autocomplete', icon: 'mdi-text-search' },
  { title: 'Timeline', to: '/catalogue/timeline', icon: 'mdi-timeline-outline' },
  { title: 'Link Preview', to: '/catalogue/link-preview', icon: 'mdi-link-box-outline' },
  { title: 'Video Player', to: '/catalogue/video-player', icon: 'mdi-play-circle-outline' },
  { title: 'Kanban Board', to: '/catalogue/kanban', icon: 'mdi-view-column-outline' },
  { title: 'Image Gallery', to: '/catalogue/image-gallery', icon: 'mdi-image-multiple-outline' },
  { title: 'Chat', to: '/catalogue/chat', icon: 'mdi-chat-outline' },
  { title: 'Pricing Table', to: '/catalogue/pricing', icon: 'mdi-currency-usd' },
  { title: 'QR Code', to: '/catalogue/qr-code', icon: 'mdi-qrcode' },
  { title: 'PDF Viewer', to: '/catalogue/pdf-viewer', icon: 'mdi-file-pdf-box' },
  { title: 'Onboarding Tour', to: '/catalogue/onboarding-tour', icon: 'mdi-compass-outline' },
  { title: 'Signature Pad', to: '/catalogue/signature-pad', icon: 'mdi-draw' },
  { title: 'OTP / PIN Input', to: '/catalogue/otp-input', icon: 'mdi-numeric' },
  { title: 'Animated Counter', to: '/catalogue/animated-counter', icon: 'mdi-counter' },
  { title: 'Data Grid', to: '/catalogue/data-grid', icon: 'mdi-table-edit' },
  { title: 'Invoice', to: '/catalogue/invoice', icon: 'mdi-file-document-outline' },
  { title: 'Charts', to: '/catalogue/charts', icon: 'mdi-chart-line' },
  { title: 'Workflow Editor', to: '/catalogue/workflow', icon: 'mdi-vector-polyline' },
  { title: 'Vue Flow', to: '/catalogue/vue-flow', icon: 'mdi-graph-outline' },
  { title: 'Clock & Timetable', to: '/catalogue/clock', icon: 'mdi-clock-outline' },
]
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
      <v-list density="compact" nav class="mt-2 pa-2">
        <v-list-item
          to="/catalogue"
          prepend-icon="mdi-view-grid-outline"
          title="Overview"
          rounded="lg"
          active-class="text-primary"
          exact
        />
        <v-divider class="my-2" />
        <v-list-item
          v-for="section in sections"
          :key="section.to"
          :to="section.to"
          :prepend-icon="section.icon"
          :title="section.title"
          rounded="lg"
          active-class="text-primary"
        />
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid class="pa-8" style="max-width: 1100px;">
        <slot />
      </v-container>
    </v-main>
  </div>
</template>
