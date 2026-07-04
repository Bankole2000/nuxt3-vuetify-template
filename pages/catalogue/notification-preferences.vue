<script setup lang="ts">
import type { NotifPreferences } from '~/components/common/NotificationPreferences.vue'

definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Notification Preferences', disabled: true },
  ],
})

useSeo({
  title:       'Notification Preferences',
  description: 'Per-channel notification settings with global mute, quiet hours, per-category toggles and frequency selectors.',
})

const tab      = ref('project')
const infoOpen = ref(false)
const snackbar = ref(false)

// ─── 1. Project Tool ─────────────────────────────────────────────────────────

const projectPrefs = reactive<NotifPreferences>({
  globalMute:        false,
  quietHoursEnabled: false,
  quietStart:        '22:00',
  quietEnd:          '08:00',
  categories: [
    {
      id:          'task-assigned',
      label:       'Task Assigned',
      description: 'When a task is assigned to you',
      icon:        'mdi-account-check-outline',
      channels: {
        email:    { enabled: true,  frequency: 'instant' },
        push:     { enabled: true,  frequency: 'instant' },
        sms:      { enabled: false, frequency: 'instant' },
        'in-app': { enabled: true,  frequency: 'instant' },
      },
    },
    {
      id:          'task-completed',
      label:       'Task Completed',
      description: 'When a task you own is marked done',
      icon:        'mdi-check-circle-outline',
      channels: {
        email:    { enabled: false, frequency: 'daily' },
        push:     { enabled: true,  frequency: 'instant' },
        sms:      { enabled: false, frequency: 'instant' },
        'in-app': { enabled: true,  frequency: 'instant' },
      },
    },
    {
      id:          'comment-added',
      label:       'Comment Added',
      description: 'When someone comments on your task',
      icon:        'mdi-comment-outline',
      channels: {
        email:    { enabled: false, frequency: 'hourly' },
        push:     { enabled: false, frequency: 'instant' },
        sms:      { enabled: false, frequency: 'instant' },
        'in-app': { enabled: true,  frequency: 'instant' },
      },
    },
    {
      id:          'deadline-approaching',
      label:       'Deadline Approaching',
      description: '24 h before a task deadline',
      icon:        'mdi-alarm-outline',
      channels: {
        email:    { enabled: true,  frequency: 'daily' },
        push:     { enabled: true,  frequency: 'instant' },
        sms:      { enabled: false, frequency: 'instant' },
        'in-app': { enabled: true,  frequency: 'instant' },
      },
    },
    {
      id:          'project-status',
      label:       'Project Status Change',
      description: 'When a project moves to a new phase',
      icon:        'mdi-flag-outline',
      channels: {
        email:    { enabled: true,  frequency: 'instant' },
        push:     { enabled: false, frequency: 'instant' },
        sms:      { enabled: false, frequency: 'instant' },
        'in-app': { enabled: true,  frequency: 'instant' },
      },
    },
    {
      id:          'system-alerts',
      label:       'System Alerts',
      description: 'Outages, maintenance and security notices',
      icon:        'mdi-shield-alert-outline',
      channels: {
        email:    { enabled: true,  frequency: 'instant' },
        push:     { enabled: false, frequency: 'instant' },
        sms:      { enabled: false, frequency: 'instant' },
        'in-app': { enabled: false, frequency: 'instant' },
      },
    },
  ],
})

// ─── 2. Health App (HEAM) ────────────────────────────────────────────────────

const healthPrefs = reactive<NotifPreferences>({
  globalMute:        false,
  quietHoursEnabled: true,
  quietStart:        '23:00',
  quietEnd:          '07:00',
  categories: [
    {
      id:          'appointment-reminder',
      label:       'Appointment Reminder',
      description: 'Upcoming doctor or clinic appointments',
      icon:        'mdi-calendar-clock-outline',
      channels: {
        email:    { enabled: true, frequency: 'instant' },
        push:     { enabled: true, frequency: 'instant' },
        sms:      { enabled: true, frequency: 'instant' },
        'in-app': { enabled: true, frequency: 'instant' },
      },
    },
    {
      id:          'medication-reminder',
      label:       'Medication Reminder',
      description: 'Time to take prescribed medication',
      icon:        'mdi-pill-outline',
      channels: {
        email:    { enabled: false, frequency: 'instant' },
        push:     { enabled: true,  frequency: 'instant' },
        sms:      { enabled: true,  frequency: 'instant' },
        'in-app': { enabled: false, frequency: 'instant' },
      },
    },
    {
      id:          'lab-results',
      label:       'Lab Results Ready',
      description: 'Your test results are available to view',
      icon:        'mdi-flask-outline',
      channels: {
        email:    { enabled: true,  frequency: 'instant' },
        push:     { enabled: true,  frequency: 'instant' },
        sms:      { enabled: false, frequency: 'instant' },
        'in-app': { enabled: true,  frequency: 'instant' },
      },
    },
    {
      id:          'health-tip',
      label:       'Health Tip',
      description: 'Personalised wellness recommendations',
      icon:        'mdi-lightbulb-outline',
      channels: {
        email:    { enabled: false, frequency: 'weekly' },
        push:     { enabled: false, frequency: 'weekly' },
        sms:      { enabled: false, frequency: 'instant' },
        'in-app': { enabled: true,  frequency: 'weekly' },
      },
    },
    {
      id:          'account-security',
      label:       'Account Security',
      description: 'Login attempts and password changes',
      icon:        'mdi-lock-outline',
      channels: {
        email:    { enabled: true,  frequency: 'instant' },
        push:     { enabled: true,  frequency: 'instant' },
        sms:      { enabled: false, frequency: 'instant' },
        'in-app': { enabled: true,  frequency: 'instant' },
      },
    },
  ],
})

function onUpdate(updated: NotifPreferences) {
  if (tab.value === 'project') {
    Object.assign(projectPrefs, updated)
  } else {
    Object.assign(healthPrefs, updated)
  }
  snackbar.value = true
}
</script>

<template>
  <div>
    <div class="d-flex align-start justify-space-between gap-3 mb-6 flex-wrap">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Notification Preferences</h1>
        <p class="text-body-2 text-medium-emphasis">
          Per-channel settings with global mute, quiet hours, and per-category frequency selectors.
        </p>
      </div>
      <v-btn
        variant="tonal"
        size="small"
        prepend-icon="mdi-information-outline"
        @click="infoOpen = true"
      >
        Use cases
      </v-btn>
    </div>

    <v-tabs v-model="tab" class="mb-6">
      <v-tab value="project" prepend-icon="mdi-briefcase-outline">Project Tool</v-tab>
      <v-tab value="health" prepend-icon="mdi-heart-pulse">Health App (HEAM)</v-tab>
    </v-tabs>

    <v-tabs-window v-model="tab">
      <v-tabs-window-item value="project">
        <CommonNotificationPreferences
          :preferences="projectPrefs"
          @update="onUpdate"
        />
      </v-tabs-window-item>

      <v-tabs-window-item value="health">
        <CommonNotificationPreferences
          :preferences="healthPrefs"
          @update="onUpdate"
        />
      </v-tabs-window-item>
    </v-tabs-window>

    <!-- Usage code -->
    <h2 class="text-overline text-medium-emphasis mt-8 mb-4">Usage</h2>
    <v-card rounded="lg" class="pa-5">
      <v-sheet rounded="lg" color="surface-variant" class="pa-4 overflow-x-auto">
        <pre v-pre class="text-body-2"><code>&lt;CommonNotificationPreferences
  :preferences="prefs"
  :available-channels="['email', 'push']"
  @update="onUpdate"
/&gt;

// Types
import type {
  NotifPreferences,
  NotifCategory,
  NotifChannel,
  NotifFrequency,
} from '~/components/common/NotificationPreferences.vue'</code></pre>
      </v-sheet>
    </v-card>

    <!-- Info modal -->
    <v-dialog v-model="infoOpen" max-width="560">
      <v-card rounded="xl">
        <v-card-title class="pa-6 pb-3 text-h6 font-weight-bold">Use cases</v-card-title>
        <v-card-text class="pa-6 pt-0">
          <p class="text-body-2 mb-4 text-medium-emphasis">
            <code>CommonNotificationPreferences</code> provides a full per-channel, per-category settings panel with global mute and quiet hours.
          </p>
          <v-list density="compact" class="pa-0">
            <v-list-item prepend-icon="mdi-briefcase-outline" class="px-0 mb-1">
              <p class="text-body-2 mb-0"><strong>Portfolio Manager (#1)</strong> — let users control task, comment and status change emails vs push.</p>
            </v-list-item>
            <v-list-item prepend-icon="mdi-heart-pulse" class="px-0 mb-1">
              <p class="text-body-2 mb-0"><strong>HEAM (#9)</strong> — medication reminders via SMS/push; lab results via email; health tips in-app weekly.</p>
            </v-list-item>
            <v-list-item prepend-icon="mdi-map-outline" class="px-0 mb-1">
              <p class="text-body-2 mb-0"><strong>Roadmap Builder (#2)</strong> — milestone and deadline notifications with daily digest option.</p>
            </v-list-item>
            <v-list-item prepend-icon="mdi-bed-outline" class="px-0 mb-1">
              <p class="text-body-2 mb-0"><strong>Guest Arrangements (#7)</strong> — booking confirmations and reminders across email and SMS.</p>
            </v-list-item>
            <v-list-item prepend-icon="mdi-cog-outline" class="px-0">
              <p class="text-body-2 mb-0"><strong>General SaaS</strong> — any settings page where users manage notification delivery per channel and category.</p>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn variant="tonal" rounded="lg" @click="infoOpen = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Save snackbar -->
    <v-snackbar v-model="snackbar" :timeout="3000" color="success" location="bottom end">
      <v-icon icon="mdi-check-circle-outline" class="mr-2" />
      Preferences saved
    </v-snackbar>
  </div>
</template>
