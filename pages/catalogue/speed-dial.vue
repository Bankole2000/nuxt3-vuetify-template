<script setup lang="ts">
import type { SpeedDialAction } from '~/components/common/SpeedDial.vue'

definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Speed Dial', disabled: true },
  ],
})

useSeo({
  title: 'Speed Dial',
  description: 'Floating action button with animated sub-actions, configurable direction, transition, positioning and keyboard navigation.',
})

const snackbar = ref(false)
const snackbarText = ref('')

const showAction = (label: string) => {
  snackbarText.value = `Action: ${label}`
  snackbar.value = true
}

const demo1Actions: SpeedDialAction[] = [
  { id: 'new-task', label: 'New Task', icon: 'mdi-checkbox-marked-circle-plus-outline' },
  { id: 'upload', label: 'Upload File', icon: 'mdi-upload-outline' },
  { id: 'message', label: 'Send Message', icon: 'mdi-message-outline' },
  { id: 'schedule', label: 'Schedule Meeting', icon: 'mdi-calendar-plus' },
]

const demo2Actions: SpeedDialAction[] = [
  { id: 'copy', label: 'Copy', icon: 'mdi-content-copy' },
  { id: 'edit', label: 'Edit', icon: 'mdi-pencil-outline' },
  { id: 'share', label: 'Share', icon: 'mdi-share-variant-outline' },
  { id: 'delete', label: 'Delete', icon: 'mdi-delete-outline' },
]

const demo3Actions: SpeedDialAction[] = [
  { id: 'camera', label: 'Camera', icon: 'mdi-camera-outline' },
  { id: 'gallery', label: 'Gallery', icon: 'mdi-image-multiple-outline' },
  { id: 'video', label: 'Video', icon: 'mdi-video-outline' },
  { id: 'audio', label: 'Audio', icon: 'mdi-microphone-outline' },
]

const demo4Actions: SpeedDialAction[] = [
  { id: 'tweet', label: 'Tweet', icon: 'mdi-twitter' },
  { id: 'post', label: 'Post', icon: 'mdi-newspaper-variant-outline' },
  { id: 'story', label: 'Story', icon: 'mdi-circle-slice-8' },
  { id: 'reel', label: 'Reel', icon: 'mdi-film' },
]

const getLabel = (id: string, actions: SpeedDialAction[]): string => {
  return actions.find(a => a.id === id)?.label ?? id
}

const liveDirection = ref<'up' | 'left' | 'right'>('up')
const liveTransition = ref<'slide' | 'scale' | 'fade'>('slide')
const liveLocation = ref<'bottom-right' | 'bottom-left' | 'bottom-center'>('bottom-right')
const liveOverlay = ref(false)

const liveActions: SpeedDialAction[] = [
  { id: 'add', label: 'Add Item', icon: 'mdi-plus-circle-outline' },
  { id: 'star', label: 'Favourite', icon: 'mdi-star-outline' },
  { id: 'flag', label: 'Flag', icon: 'mdi-flag-outline' },
]

const infoDialog = ref(false)

const useCases = [
  {
    title: 'Portfolio Manager',
    description: 'Quick-add task or note from any screen. Direction: up. Actions: New Task, Add Note, Upload Attachment.',
  },
  {
    title: 'Roadmap Builder',
    description: 'Add feature, epic or milestone inline. Direction: up, location: bottom-right.',
  },
  {
    title: 'Workflow Engine',
    description: 'Add step, branch or trigger in the visual editor. Direction: right for horizontal canvas.',
  },
  {
    title: 'Chat / Messaging',
    description: 'Compose message, attach file or schedule send. Overlay backdrop focuses user.',
  },
  {
    title: 'Mobile-first UX',
    description: 'General bottom-right FAB with 3–5 sub-actions; always contained in a card for in-page placement.',
  },
]
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-1">
      <h1 class="text-h5 font-weight-bold">Speed Dial</h1>
      <v-btn
        variant="text"
        size="small"
        prepend-icon="mdi-information-outline"
        @click="infoDialog = true"
      >
        Use cases
      </v-btn>
    </div>
    <p class="text-body-2 text-medium-emphasis mb-8">
      Floating action button with animated sub-actions, configurable direction, transition, positioning and keyboard navigation.
    </p>

    <!-- Demo cards -->
    <v-row class="mb-8">
      <!-- Demo 1: Direction Up -->
      <v-col cols="12" sm="6" md="3">
        <v-card rounded="lg" height="280" style="position: relative; overflow: hidden;">
          <div
            class="fill-height d-flex align-center justify-center"
            style="background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.08) 0%, rgba(var(--v-theme-primary), 0.02) 100%);"
          >
            <div class="text-center">
              <v-icon icon="mdi-arrow-up" size="32" class="text-medium-emphasis mb-2" />
              <p class="text-overline text-medium-emphasis">Direction: Up</p>
            </div>
          </div>
          <CommonSpeedDial
            :actions="demo1Actions"
            direction="up"
            location="bottom-right"
            contained
            @action="(id) => showAction(getLabel(id, demo1Actions))"
          />
        </v-card>
      </v-col>

      <!-- Demo 2: Direction Left -->
      <v-col cols="12" sm="6" md="3">
        <v-card rounded="lg" height="280" style="position: relative; overflow: hidden;">
          <div
            class="fill-height d-flex align-center justify-center"
            style="background: linear-gradient(135deg, rgba(var(--v-theme-secondary), 0.08) 0%, rgba(var(--v-theme-secondary), 0.02) 100%);"
          >
            <div class="text-center">
              <v-icon icon="mdi-arrow-left" size="32" class="text-medium-emphasis mb-2" />
              <p class="text-overline text-medium-emphasis">Direction: Left</p>
            </div>
          </div>
          <CommonSpeedDial
            :actions="demo2Actions"
            direction="left"
            location="bottom-right"
            color="secondary"
            contained
            @action="(id) => showAction(getLabel(id, demo2Actions))"
          />
        </v-card>
      </v-col>

      <!-- Demo 3: Direction Right, Scale transition -->
      <v-col cols="12" sm="6" md="3">
        <v-card rounded="lg" height="280" style="position: relative; overflow: hidden;">
          <div
            class="fill-height d-flex align-center justify-center"
            style="background: linear-gradient(135deg, rgba(var(--v-theme-info), 0.08) 0%, rgba(var(--v-theme-info), 0.02) 100%);"
          >
            <div class="text-center">
              <v-icon icon="mdi-arrow-right" size="32" class="text-medium-emphasis mb-2" />
              <p class="text-overline text-medium-emphasis">Direction: Right</p>
              <p class="text-caption text-medium-emphasis">Transition: Scale</p>
            </div>
          </div>
          <CommonSpeedDial
            :actions="demo3Actions"
            direction="right"
            location="bottom-left"
            transition="scale"
            color="info"
            contained
            @action="(id) => showAction(getLabel(id, demo3Actions))"
          />
        </v-card>
      </v-col>

      <!-- Demo 4: Bottom Center with overlay -->
      <v-col cols="12" sm="6" md="3">
        <v-card rounded="lg" height="280" style="position: relative; overflow: hidden;">
          <div
            class="fill-height d-flex align-center justify-center"
            style="background: linear-gradient(135deg, rgba(103,58,183, 0.12) 0%, rgba(103,58,183, 0.02) 100%);"
          >
            <div class="text-center">
              <v-icon icon="mdi-arrow-collapse-down" size="32" class="text-medium-emphasis mb-2" />
              <p class="text-overline text-medium-emphasis">Bottom Center</p>
              <p class="text-caption text-medium-emphasis">With overlay</p>
            </div>
          </div>
          <CommonSpeedDial
            :actions="demo4Actions"
            direction="up"
            location="bottom-center"
            color="deep-purple"
            overlay
            contained
            @action="(id) => showAction(getLabel(id, demo4Actions))"
          />
        </v-card>
      </v-col>
    </v-row>

    <!-- Live configurator -->
    <h2 class="text-overline text-medium-emphasis mb-4">Live Configurator</h2>
    <v-row>
      <v-col cols="12" md="5">
        <v-card rounded="lg" class="pa-5">
          <p class="text-body-2 font-weight-medium mb-4">Configuration</p>

          <p class="text-caption text-medium-emphasis mb-1">Direction</p>
          <v-btn-toggle
            v-model="liveDirection"
            mandatory
            variant="outlined"
            density="compact"
            class="mb-4"
          >
            <v-btn value="up" size="small">Up</v-btn>
            <v-btn value="left" size="small">Left</v-btn>
            <v-btn value="right" size="small">Right</v-btn>
          </v-btn-toggle>

          <v-select
            v-model="liveTransition"
            label="Transition"
            :items="['slide', 'scale', 'fade']"
            variant="outlined"
            density="compact"
            rounded="lg"
            hide-details
            class="mb-4"
          />

          <v-select
            v-model="liveLocation"
            label="Location"
            :items="['bottom-right', 'bottom-left', 'bottom-center']"
            variant="outlined"
            density="compact"
            rounded="lg"
            hide-details
            class="mb-4"
          />

          <v-switch
            v-model="liveOverlay"
            label="Overlay backdrop"
            color="primary"
            density="compact"
            hide-details
          />
        </v-card>
      </v-col>

      <v-col cols="12" md="7">
        <v-card rounded="lg" height="280" style="position: relative; overflow: hidden;">
          <div
            class="fill-height d-flex align-center justify-center"
            style="background: linear-gradient(135deg, rgba(var(--v-theme-surface-variant), 0.5) 0%, transparent 100%);"
          >
            <div class="text-center text-medium-emphasis">
              <v-icon icon="mdi-gesture-tap-button" size="40" class="mb-2 opacity-30" />
              <p class="text-body-2">Interact with the FAB</p>
              <p class="text-caption opacity-60">Press Escape to close · Arrow keys to navigate</p>
            </div>
          </div>
          <CommonSpeedDial
            :actions="liveActions"
            :direction="liveDirection"
            :transition="liveTransition"
            :location="liveLocation"
            :overlay="liveOverlay"
            contained
            @action="(id) => showAction(getLabel(id, liveActions))"
          />
        </v-card>
      </v-col>
    </v-row>

    <!-- Usage reference -->
    <h2 class="text-overline text-medium-emphasis mb-4 mt-8">Usage</h2>
    <v-card rounded="lg" class="pa-5">
      <v-sheet rounded="lg" color="surface-variant" class="pa-4 mb-4">
        <pre v-pre class="text-body-2"><code>&lt;CommonSpeedDial
  :actions="actions"
  direction="up"
  location="bottom-right"
  transition="slide"
  color="primary"
  :overlay="false"
  :contained="false"
  @action="handleAction"
  @open="onOpen"
  @close="onClose"
/&gt;</code></pre>
      </v-sheet>

      <v-table density="compact">
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>Default</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>actions</code></td><td><code>SpeedDialAction[]</code></td><td>—</td><td>Sub-action buttons</td></tr>
          <tr><td><code>icon</code></td><td><code>string</code></td><td><code>mdi-plus</code></td><td>Main FAB icon (closed state)</td></tr>
          <tr><td><code>openIcon</code></td><td><code>string</code></td><td><code>mdi-close</code></td><td>Main FAB icon (open state)</td></tr>
          <tr><td><code>color</code></td><td><code>string</code></td><td><code>primary</code></td><td>Main FAB color</td></tr>
          <tr><td><code>location</code></td><td><code>'bottom-right' | 'bottom-left' | 'bottom-center'</code></td><td><code>bottom-right</code></td><td>Anchor position</td></tr>
          <tr><td><code>direction</code></td><td><code>'up' | 'left' | 'right'</code></td><td><code>up</code></td><td>Sub-action expansion direction</td></tr>
          <tr><td><code>transition</code></td><td><code>'slide' | 'scale' | 'fade'</code></td><td><code>slide</code></td><td>Sub-action animation style</td></tr>
          <tr><td><code>contained</code></td><td><code>boolean</code></td><td><code>false</code></td><td>Position absolute (relative to parent) vs fixed (viewport)</td></tr>
          <tr><td><code>overlay</code></td><td><code>boolean</code></td><td><code>false</code></td><td>Show semi-transparent backdrop when open</td></tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar" :timeout="2500" location="bottom center">
      {{ snackbarText }}
    </v-snackbar>

    <!-- Info dialog -->
    <v-dialog v-model="infoDialog" max-width="560">
      <v-card rounded="lg">
        <v-card-title class="text-h6 pa-5 pb-2">Speed Dial Use Cases</v-card-title>
        <v-card-text class="px-5 pb-5">
          <v-list lines="two" class="pa-0">
            <v-list-item
              v-for="(uc, i) in useCases"
              :key="i"
              class="px-0"
            >
              <template #prepend>
                <v-avatar color="primary" variant="tonal" size="36" rounded="lg" class="mr-3">
                  <span class="text-body-2 font-weight-bold">{{ i + 1 }}</span>
                </v-avatar>
              </template>
              <p class="text-body-2 font-weight-medium mb-0">{{ uc.title }}</p>
              <p class="text-caption text-medium-emphasis mb-0">{{ uc.description }}</p>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions class="px-5 pb-5 pt-0">
          <v-spacer />
          <v-btn variant="tonal" @click="infoDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
