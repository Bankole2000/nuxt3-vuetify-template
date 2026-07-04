<script setup lang="ts">
definePageMeta({ layout: 'catalogue' })

const allSections = [
  { title: 'Audit Log', description: 'Append-only activity log with relative timestamps, per-action icons, actor avatars, field-level diff viewer, search and action-type filters.', to: '/catalogue/audit-log', icon: 'mdi-history', color: 'blue-grey' },
  { title: 'Animated Counter', description: 'Counts up to a target value on mount with configurable easing, duration, prefix and suffix.', to: '/catalogue/animated-counter', icon: 'mdi-counter', color: 'success' },
  { title: 'Approval Flow', description: 'Multi-step approval widget with status timeline, inline reviewer comments, approve/reject/revision actions and overall status banner.', to: '/catalogue/approval-flow', icon: 'mdi-clipboard-check-outline', color: 'amber' },
  { title: 'Async Autocomplete', description: 'Debounced v-autocomplete wrapper — pass any async fetcher function.', to: '/catalogue/autocomplete', icon: 'mdi-text-search', color: 'error' },
  { title: 'Chat / Messaging', description: 'Message bubbles, typing indicator, read receipts and avatar headers. Pair with useSocket.', to: '/catalogue/chat', icon: 'mdi-chat-outline', color: 'success' },
  { title: 'Budget Ledger', description: 'Categorised income/expense ledger with running balance, donut breakdown chart, filters and inline add/delete.', to: '/catalogue/budget-ledger', icon: 'mdi-cash-multiple', color: 'success' },
  { title: 'Calendar', description: 'Month, week and day views with event creation, colour coding, all-day events, overlapping event layout and a live now-indicator.', to: '/catalogue/calendar', icon: 'mdi-calendar-outline', color: 'primary' },
  { title: 'Charts', description: 'Chart.js wrapper covering line, bar, doughnut, pie, radar and live-updating charts with dark mode support.', to: '/catalogue/charts', icon: 'mdi-chart-line', color: 'primary' },
  { title: 'Clipboard & Share', description: 'Copy-to-clipboard and Web Share API with fallbacks for unsupported browsers.', to: '/catalogue/clipboard-share', icon: 'mdi-share-variant-outline', color: 'success' },
  { title: 'Clock & Timetable', description: 'SVG analog clock, interactive 24-hour time-wheel planner with draggable arcs, and a drag-and-drop weekly timetable grid.', to: '/catalogue/clock', icon: 'mdi-clock-outline', color: 'teal' },
  { title: 'Color Picker', description: 'Inline, swatch and menu-activator color pickers in hex, RGB and HSL modes.', to: '/catalogue/color-picker', icon: 'mdi-palette-outline', color: 'warning' },
  { title: 'Command Palette', description: 'Global ⌘K palette with keyboard navigation, grouped commands and shortcuts.', to: '/catalogue/command-palette', icon: 'mdi-magnify', color: 'secondary' },
  { title: 'Command REPL', description: 'Terminal-style REPL with command history, tab autocomplete, async commands, JSON/table output rendering and configurable command registry.', to: '/catalogue/command-repl', icon: 'mdi-console', color: 'green' },
  { title: 'Critical Thinking', description: 'Decision matrix with weighted scoring, argument map node graph, and pros/cons + SWOT board — structured tools for complex decisions.', to: '/catalogue/critical-thinking', icon: 'mdi-head-lightbulb-outline', color: 'deep-purple' },
  { title: 'Components', description: 'Buttons, chips, badges, avatars, icons and cards.', to: '/catalogue/components', icon: 'mdi-puzzle-outline', color: 'secondary' },
  { title: 'Contract Viewer', description: 'Scrollable contract document with per-party signature capture, progress tracker, and fully-signed banner.', to: '/catalogue/contract-viewer', icon: 'mdi-file-sign', color: 'deep-purple' },
  { title: 'Data Display', description: 'Data tables, lists, sparklines and stat cards.', to: '/catalogue/data-display', icon: 'mdi-table', color: 'success' },
  { title: 'Data Export', description: 'Download table data as CSV or JSON with no extra packages.', to: '/catalogue/data-export', icon: 'mdi-download-outline', color: 'info' },
  { title: 'Data Import', description: 'Three-step CSV/JSON import wizard with drag-and-drop, column mapping, type validation and error reporting.', to: '/catalogue/data-import', icon: 'mdi-upload-outline', color: 'teal' },
  { title: 'Data Grid', description: 'Inline-editable table with row selection, column types (text/number/select) and bulk delete.', to: '/catalogue/data-grid', icon: 'mdi-table-edit', color: 'warning' },
  { title: 'Date & Time', description: 'Date picker, time picker and date-range picker wired with text-field activators.', to: '/catalogue/date-time', icon: 'mdi-calendar-clock', color: 'info' },
  { title: 'Family Tree', description: 'Bidirectional pan/zoom family tree with focus-shifting per person, marriage connectors, animated transitions and an ancestry list sidebar.', to: '/catalogue/family-tree', icon: 'mdi-family-tree', color: 'deep-purple' },
  { title: 'Feedback', description: 'Toasts (all types + positions), loading overlay, confirm dialog.', to: '/catalogue/feedback', icon: 'mdi-bell-outline', color: 'warning' },
  { title: 'File Upload', description: 'Drag-and-drop upload with progress, validation, and image crop/rotate.', to: '/catalogue/file-upload', icon: 'mdi-upload-outline', color: 'primary' },
  { title: 'Emoji Picker', description: 'Searchable emoji grid with category tabs, recent history, skin-tone selector and reaction-bar demo — no external libraries.', to: '/catalogue/emoji-picker', icon: 'mdi-emoticon-outline', color: 'yellow' },
  { title: 'Forms', description: 'Text fields, selects, checkboxes, switches and validation.', to: '/catalogue/forms', icon: 'mdi-form-select', color: 'info' },
  { title: 'Gantt Chart', description: 'Interactive timeline with drag-to-reschedule, resize bars, dependency arrows, milestones, progress, grouped rows and day/week/month zoom.', to: '/catalogue/gantt', icon: 'mdi-chart-gantt', color: 'blue' },
  { title: 'Geolocation', description: 'Browser GPS, Leaflet map, reverse geocoding, OSRM routing and TSP optimizer.', to: '/catalogue/geolocation', icon: 'mdi-map-marker-radius-outline', color: 'error' },
  { title: 'Health Metrics', description: 'Vitals and body tracking dashboard with 90-day line charts, normal range bands, trend indicators and per-metric log forms.', to: '/catalogue/health-metrics', icon: 'mdi-heart-pulse', color: 'error' },
  { title: 'Image Gallery', description: 'Responsive grid with fullscreen lightbox, keyboard navigation and thumbnail strip.', to: '/catalogue/image-gallery', icon: 'mdi-image-multiple-outline', color: 'secondary' },
  { title: 'Interactive Grid', description: 'Generic clickable grid component — one primitive powering memory match, whack-a-mole, seat reservation and chess.', to: '/catalogue/interactive-grid', icon: 'mdi-grid', color: 'teal' },
  { title: 'Isometric Scene', description: 'SVG-based isometric scene builder with painter-algorithm rendering, interactive blocks, data visualisation and city builder demos.', to: '/catalogue/isometric-scene', icon: 'mdi-domain', color: 'teal' },
  { title: 'Invoice', description: 'Print-optimised invoice layout with line items, VAT calculation and PDF export via browser print.', to: '/catalogue/invoice', icon: 'mdi-file-document-outline', color: 'secondary' },
  { title: 'Kanban Board', description: 'Drag cards between columns with priorities, tags and assignees — HTML5 DnD, no packages.', to: '/catalogue/kanban', icon: 'mdi-view-column-outline', color: 'primary' },
  { title: 'KPI Dashboard', description: 'Stat cards with sparklines, % change badges, target progress bars and trend indicators — configurable grid layout.', to: '/catalogue/kpi-dashboard', icon: 'mdi-view-dashboard-outline', color: 'indigo' },
  { title: 'Layouts', description: 'All four available layouts with usage instructions.', to: '/catalogue/layouts', icon: 'mdi-page-layout-sidebar-left', color: 'error' },
  { title: 'Location Picker', description: 'Leaflet-based map picker with address search (Nominatim), click-to-pin, reverse geocoding, and current-location support.', to: '/catalogue/location-picker', icon: 'mdi-map-marker-plus-outline', color: 'green' },
  { title: 'Link Preview', description: 'Rich URL preview cards in three variants: server-side OG parsing, client-side API, and static prop-driven.', to: '/catalogue/link-preview', icon: 'mdi-link-box-outline', color: 'info' },
  { title: 'Markdown Viewer', description: 'Sanitised markdown renderer with syntax-highlighted code blocks, copy buttons, dark-mode-aware styles and a live editor split-pane.', to: '/catalogue/markdown-viewer', icon: 'mdi-language-markdown-outline', color: 'blue-grey' },
  { title: 'Media Recorder', description: 'Browser-native screen, camera and audio recorder using MediaRecorder API with live preview, elapsed timer and download.', to: '/catalogue/media-recorder', icon: 'mdi-record-circle-outline', color: 'red' },
  { title: 'Motion Graphics', description: 'Keyframe animation timeline editor with easing functions and preview, plus a Lottie JSON player with speed and direction controls.', to: '/catalogue/motion-graphics', icon: 'mdi-motion-play-outline', color: 'orange' },
  { title: 'Model Viewer (3D)', description: 'Three.js GLTF/GLB model viewer with orbit controls, wireframe, environment lighting, auto-rotate and screenshot export.', to: '/catalogue/model-viewer', icon: 'mdi-rotate-3d', color: 'deep-purple' },
  { title: 'Node Link Diagram', description: 'Interactive SVG node-link canvas for transit maps, CI/CD pipelines, supply chains and family trees. Pan, zoom, click-to-select, tooltips, directed edges and group legends.', to: '/catalogue/node-link', icon: 'mdi-transit-connection-variant', color: 'indigo' },
  { title: 'Tube Map', description: 'Transit-style diagram built from scratch: compass-direction routing, quadratic bezier corners, interchange circles and station ticks — no third-party map library.', to: '/catalogue/tube-map', icon: 'mdi-subway-variant', color: 'blue' },
  { title: 'Tube Map', description: 'Transit-style diagram with 45°/90° routes and smooth bezier corners, built with d3-tube-map. Three lines, eight stations, interchange markers.', to: '/catalogue/tube-map', icon: 'mdi-subway-variant', color: 'blue' },
  { title: 'Notifications', description: 'Bell-icon panel with read/unread state, grouped by date and mark-all-read.', to: '/catalogue/notifications', icon: 'mdi-bell-badge-outline', color: 'primary' },
  { title: 'Notification Preferences', description: 'Per-channel notification settings with global mute, quiet hours, per-category toggles and frequency selectors.', to: '/catalogue/notification-preferences', icon: 'mdi-bell-cog-outline', color: 'orange' },
  { title: 'Onboarding Tour', description: 'Step-by-step spotlight overlay that highlights any element by CSS selector.', to: '/catalogue/onboarding-tour', icon: 'mdi-compass-outline', color: 'secondary' },
  { title: 'OTP / PIN Input', description: 'Digit-by-digit code entry with paste support, keyboard navigation and error state.', to: '/catalogue/otp-input', icon: 'mdi-numeric', color: 'info' },
  { title: 'Pagination', description: 'Page-based and infinite scroll composables with mock data.', to: '/catalogue/pagination', icon: 'mdi-format-list-numbered', color: 'info' },
  { title: 'Pomodoro Timer', description: 'Animated SVG ring countdown with work/break cycling, Web Audio chime, configurable durations and session history.', to: '/catalogue/pomodoro', icon: 'mdi-timer-outline', color: 'deep-purple' },
  { title: 'PDF Viewer', description: 'In-browser PDF rendering with page navigation and zoom using pdfjs-dist.', to: '/catalogue/pdf-viewer', icon: 'mdi-file-pdf-box', color: 'error' },
  { title: 'Presence & Collaborators', description: 'Stacked online-presence avatars with status dots, overflow count, tooltip, cursor badges and editing pulse animation.', to: '/catalogue/presence', icon: 'mdi-account-group-outline', color: 'cyan' },
  { title: 'Pricing Table', description: 'Plan comparison cards with monthly/annual toggle, feature lists and a highlighted featured tier.', to: '/catalogue/pricing', icon: 'mdi-currency-usd', color: 'warning' },
  { title: 'QR Code', description: 'Client-side QR generation with custom colours, size and error correction — no API needed.', to: '/catalogue/qr-code', icon: 'mdi-qrcode', color: 'info' },
  { title: 'Rich Text Editor', description: 'Tiptap-powered WYSIWYG editor with a full toolbar, link support and placeholder.', to: '/catalogue/rich-text-editor', icon: 'mdi-format-letter-case', color: 'primary' },
  { title: 'Signature Pad', description: 'Canvas-based signature capture with configurable stroke colour, width and PNG export.', to: '/catalogue/signature-pad', icon: 'mdi-draw', color: 'primary' },
  { title: 'Sortable List', description: 'Drag-and-drop reorderable list using the HTML5 DnD API — no extra packages.', to: '/catalogue/sortable', icon: 'mdi-drag-vertical', color: 'secondary' },
  { title: 'Speed Dial', description: 'Floating action button with animated sub-actions, configurable direction, transition, positioning and keyboard navigation.', to: '/catalogue/speed-dial', icon: 'mdi-gesture-tap-button', color: 'pink' },
  { title: 'Split Pane', description: 'Resizable two-panel layout. Drag the divider, double-click to reset, arrow-key nudge, touch support. Horizontal and vertical.', to: '/catalogue/split-pane', icon: 'mdi-view-split-vertical', color: 'indigo' },
  { title: 'Stepper', description: 'Multi-step form with per-step validation using v-stepper and reactive state.', to: '/catalogue/stepper', icon: 'mdi-stairs', color: 'error' },
  { title: 'Tag Input', description: 'Chip-based multi-value tag input with Enter/comma delimiters and backspace removal.', to: '/catalogue/tag-input', icon: 'mdi-tag-multiple-outline', color: 'warning' },
  { title: 'Timeline', description: 'Activity feed, order tracking and release changelog using v-timeline with configurable side and density.', to: '/catalogue/timeline', icon: 'mdi-timeline-outline', color: 'secondary' },
  { title: 'Tree View', description: 'Recursive collapsible tree with single/multi-select, checkboxes, inline search with highlight, lazy async loading, and drag-to-reorder.', to: '/catalogue/tree-view', icon: 'mdi-file-tree-outline', color: 'warning' },
  { title: 'Theme Builder', description: 'Live Vuetify theme colour editor with preset palettes, contrast-aware preview, CSS vars export and one-click apply to the running app.', to: '/catalogue/theme-builder', icon: 'mdi-palette-swatch-outline', color: 'pink' },
  { title: 'Typography', description: 'Text styles, headings, color utilities and weight variants.', to: '/catalogue/typography', icon: 'mdi-format-text', color: 'primary' },
  { title: 'UX Patterns', description: 'Breadcrumbs, page transitions, empty states and skeleton loaders.', to: '/catalogue/ux-patterns', icon: 'mdi-layers-outline', color: 'warning' },
  { title: 'Video Player', description: 'Custom HTML5 player with full controls and a YouTube embed with thumbnail-first loading.', to: '/catalogue/video-player', icon: 'mdi-play-circle-outline', color: 'error' },
  { title: 'Virtual Scroll', description: 'Render 50 000 rows at 60 fps using v-virtual-scroll with live filtering.', to: '/catalogue/virtual-scroll', icon: 'mdi-view-list-outline', color: 'success' },
  { title: 'Vue Flow', description: 'Math operation data-flow graph built with @vue-flow/core — custom node types, useNodeConnections and useNodesData composables.', to: '/catalogue/vue-flow', icon: 'mdi-graph-outline', color: 'pink' },
  { title: 'WebSocket', description: 'socket.io-client wrapped in useSocket() with live chat demo.', to: '/catalogue/websocket', icon: 'mdi-access-point', color: 'success' },
  { title: 'WebGL Canvas', description: 'Raw WebGL2 shader canvas with plasma, raymarching, Mandelbrot and noise demos — u_time/u_resolution/u_mouse uniforms wired automatically.', to: '/catalogue/webgl-canvas', icon: 'mdi-shader', color: 'indigo' },
  { title: 'Workflow Editor', description: 'Node-based visual editor with draggable nodes, bezier edges, pan/zoom canvas, minimap and 8 built-in node types.', to: '/catalogue/workflow', icon: 'mdi-vector-polyline', color: 'indigo' },
]

const query = ref('')

const sections = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return allSections
  return allSections.filter(s =>
    s.title.toLowerCase().includes(q) ||
    s.description.toLowerCase().includes(q)
  )
})
</script>

<template>
  <div>
    <h1 class="text-h4 font-weight-bold mb-2">Component Catalogue</h1>
    <p class="text-body-1 text-medium-emphasis mb-6">
      An interactive reference for every UI pattern in this template. No extra packages — powered by the real app theme and composables.
    </p>

    <v-text-field
      v-model="query"
      placeholder="Search components…"
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      density="compact"
      rounded="lg"
      clearable
      hide-details
      class="mb-8"
      style="max-width: 400px"
    />

    <v-row v-if="sections.length">
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

    <div v-else class="text-center py-16 text-medium-emphasis">
      <v-icon icon="mdi-magnify-close" size="48" class="mb-4 opacity-30" />
      <p class="text-body-1">No components match <strong>{{ query }}</strong></p>
    </div>
  </div>
</template>
