<script setup lang="ts">
definePageMeta({ layout: 'catalogue' })

const sections = [
  { title: 'Typography', description: 'Text styles, headings, color utilities and weight variants.', to: '/catalogue/typography', icon: 'mdi-format-text', color: 'primary' },
  { title: 'Components', description: 'Buttons, chips, badges, avatars, icons and cards.', to: '/catalogue/components', icon: 'mdi-puzzle-outline', color: 'secondary' },
  { title: 'Forms', description: 'Text fields, selects, checkboxes, switches and validation.', to: '/catalogue/forms', icon: 'mdi-form-select', color: 'info' },
  { title: 'Feedback', description: 'Toasts (all types + positions), loading overlay, confirm dialog.', to: '/catalogue/feedback', icon: 'mdi-bell-outline', color: 'warning' },
  { title: 'Data Display', description: 'Data tables, lists, sparklines and stat cards.', to: '/catalogue/data-display', icon: 'mdi-table', color: 'success' },
  { title: 'Layouts', description: 'All four available layouts with usage instructions.', to: '/catalogue/layouts', icon: 'mdi-page-layout-sidebar-left', color: 'error' },
  { title: 'File Upload', description: 'Drag-and-drop upload with progress, validation, and image crop/rotate.', to: '/catalogue/file-upload', icon: 'mdi-upload-outline', color: 'primary' },
  { title: 'Pagination', description: 'Page-based and infinite scroll composables with mock data.', to: '/catalogue/pagination', icon: 'mdi-format-list-numbered', color: 'info' },
  { title: 'WebSocket', description: 'socket.io-client wrapped in useSocket() with live chat demo.', to: '/catalogue/websocket', icon: 'mdi-access-point', color: 'success' },
  { title: 'UX Patterns', description: 'Breadcrumbs, page transitions, empty states and skeleton loaders.', to: '/catalogue/ux-patterns', icon: 'mdi-layers-outline', color: 'warning' },
  { title: 'Geolocation', description: 'Browser GPS, Leaflet map, reverse geocoding, OSRM routing and TSP optimizer.', to: '/catalogue/geolocation', icon: 'mdi-map-marker-radius-outline', color: 'error' },
  { title: 'Sortable List', description: 'Drag-and-drop reorderable list using the HTML5 DnD API — no extra packages.', to: '/catalogue/sortable', icon: 'mdi-drag-vertical', color: 'secondary' },
  { title: 'Rich Text Editor', description: 'Tiptap-powered WYSIWYG editor with a full toolbar, link support and placeholder.', to: '/catalogue/rich-text-editor', icon: 'mdi-format-letter-case', color: 'primary' },
  { title: 'Date & Time', description: 'Date picker, time picker and date-range picker wired with text-field activators.', to: '/catalogue/date-time', icon: 'mdi-calendar-clock', color: 'info' },
  { title: 'Color Picker', description: 'Inline, swatch and menu-activator color pickers in hex, RGB and HSL modes.', to: '/catalogue/color-picker', icon: 'mdi-palette-outline', color: 'warning' },
  { title: 'Virtual Scroll', description: 'Render 50 000 rows at 60 fps using v-virtual-scroll with live filtering.', to: '/catalogue/virtual-scroll', icon: 'mdi-view-list-outline', color: 'success' },
  { title: 'Stepper', description: 'Multi-step form with per-step validation using v-stepper and reactive state.', to: '/catalogue/stepper', icon: 'mdi-stairs', color: 'error' },
  { title: 'Command Palette', description: 'Global ⌘K palette with keyboard navigation, grouped commands and shortcuts.', to: '/catalogue/command-palette', icon: 'mdi-magnify', color: 'secondary' },
  { title: 'Notifications', description: 'Bell-icon panel with read/unread state, grouped by date and mark-all-read.', to: '/catalogue/notifications', icon: 'mdi-bell-badge-outline', color: 'primary' },
  { title: 'Data Export', description: 'Download table data as CSV or JSON with no extra packages.', to: '/catalogue/data-export', icon: 'mdi-download-outline', color: 'info' },
  { title: 'Clipboard & Share', description: 'Copy-to-clipboard and Web Share API with fallbacks for unsupported browsers.', to: '/catalogue/clipboard-share', icon: 'mdi-share-variant-outline', color: 'success' },
  { title: 'Tag Input', description: 'Chip-based multi-value tag input with Enter/comma delimiters and backspace removal.', to: '/catalogue/tag-input', icon: 'mdi-tag-multiple-outline', color: 'warning' },
  { title: 'Async Autocomplete', description: 'Debounced v-autocomplete wrapper — pass any async fetcher function.', to: '/catalogue/autocomplete', icon: 'mdi-text-search', color: 'error' },
  { title: 'Timeline', description: 'Activity feed, order tracking and release changelog using v-timeline with configurable side and density.', to: '/catalogue/timeline', icon: 'mdi-timeline-outline', color: 'secondary' },
  { title: 'Link Preview', description: 'Rich URL preview cards in three variants: server-side OG parsing, client-side API, and static prop-driven.', to: '/catalogue/link-preview', icon: 'mdi-link-box-outline', color: 'info' },
  { title: 'Video Player', description: 'Custom HTML5 player with full controls and a YouTube embed with thumbnail-first loading.', to: '/catalogue/video-player', icon: 'mdi-play-circle-outline', color: 'error' },
  { title: 'Kanban Board', description: 'Drag cards between columns with priorities, tags and assignees — HTML5 DnD, no packages.', to: '/catalogue/kanban', icon: 'mdi-view-column-outline', color: 'primary' },
  { title: 'Image Gallery', description: 'Responsive grid with fullscreen lightbox, keyboard navigation and thumbnail strip.', to: '/catalogue/image-gallery', icon: 'mdi-image-multiple-outline', color: 'secondary' },
  { title: 'Chat / Messaging', description: 'Message bubbles, typing indicator, read receipts and avatar headers. Pair with useSocket.', to: '/catalogue/chat', icon: 'mdi-chat-outline', color: 'success' },
  { title: 'Pricing Table', description: 'Plan comparison cards with monthly/annual toggle, feature lists and a highlighted featured tier.', to: '/catalogue/pricing', icon: 'mdi-currency-usd', color: 'warning' },
  { title: 'QR Code', description: 'Client-side QR generation with custom colours, size and error correction — no API needed.', to: '/catalogue/qr-code', icon: 'mdi-qrcode', color: 'info' },
  { title: 'PDF Viewer', description: 'In-browser PDF rendering with page navigation and zoom using pdfjs-dist.', to: '/catalogue/pdf-viewer', icon: 'mdi-file-pdf-box', color: 'error' },
  { title: 'Onboarding Tour', description: 'Step-by-step spotlight overlay that highlights any element by CSS selector.', to: '/catalogue/onboarding-tour', icon: 'mdi-compass-outline', color: 'secondary' },
]
</script>

<template>
  <div>
    <h1 class="text-h4 font-weight-bold mb-2">Component Catalogue</h1>
    <p class="text-body-1 text-medium-emphasis mb-8">
      An interactive reference for every UI pattern in this template. No extra packages — powered by the real app theme and composables.
    </p>

    <v-row>
      <v-col v-for="section in sections" :key="section.to" cols="12" sm="6" md="4">
        <v-card :to="section.to" rounded="lg" hover height="100%">
          <v-card-text class="pa-6">
            <v-avatar :color="section.color" variant="tonal" size="48" rounded="lg" class="mb-4">
              <v-icon :icon="section.icon" size="24" />
            </v-avatar>
            <p class="text-body-1 font-weight-bold mb-1">{{ section.title }}</p>
            <p class="text-body-2 text-medium-emphasis">{{ section.description }}</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
