<script setup lang="ts">
import type { CalendarEvent } from '~/components/common/CalendarView.vue'

definePageMeta({ layout: 'catalogue' })
useSeo({ title: 'Calendar', description: 'Month, week and day calendar views with event creation, colour coding, all-day events, overlapping event layout and a live now-indicator.' })

const tab      = ref('personal')
const infoOpen = ref(false)

// ── Shared helpers ────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 9)

const d = (offsetDays: number, h: number, m = 0) => {
  const r = new Date()
  r.setDate(r.getDate() + offsetDays)
  r.setHours(h, m, 0, 0)
  return r.toISOString()
}

// ── 1. Personal calendar ──────────────────────────────────────────────────────

const personalEvents = ref<CalendarEvent[]>([
  { id: uid(), title: 'Morning run',        start: d(-2, 7),    end: d(-2, 8),    color: '#10b981' },
  { id: uid(), title: 'Team standup',       start: d(0, 9, 30), end: d(0, 9, 45), color: '#6366f1' },
  { id: uid(), title: 'Lunch with Sarah',   start: d(0, 12, 30),end: d(0, 13, 30),color: '#f59e0b' },
  { id: uid(), title: 'Deep work block',    start: d(0, 14),    end: d(0, 17),    color: '#3b82f6' },
  { id: uid(), title: 'Gym',               start: d(1, 18),    end: d(1, 19, 30),color: '#10b981' },
  { id: uid(), title: 'Dentist',           start: d(2, 10),    end: d(2, 11),    color: '#ef4444' },
  { id: uid(), title: 'Birthday party',    start: d(3, 19),    end: d(3, 23),    color: '#ec4899' },
  { id: uid(), title: 'Weekend hike',      start: d(5, 8),     end: d(5, 13),    color: '#10b981' },
  { id: uid(), title: 'Family dinner',     start: d(6, 18, 30),end: d(6, 21),    color: '#f59e0b' },
  { id: uid(), title: 'Bank holiday',      start: d(7, 0),     end: d(7, 23, 59),color: '#6366f1', allDay: true },
])

const addPersonal = (start: string, end: string) => {
  personalEvents.value.push({ id: uid(), title: 'New event', start, end, color: '#6366f1' })
}
const deletePersonal = (id: string) => {
  personalEvents.value = personalEvents.value.filter(e => e.id !== id)
}

// ── 2. Event / Wedding planner ────────────────────────────────────────────────

const weddingEvents = ref<CalendarEvent[]>([
  // Setup days
  { id: uid(), title: 'Venue walkthrough',   start: d(-14, 10), end: d(-14, 12),   color: '#8b5cf6' },
  { id: uid(), title: 'Florist briefing',    start: d(-10, 14), end: d(-10, 15),   color: '#ec4899' },
  { id: uid(), title: 'Catering tasting',    start: d(-7, 12),  end: d(-7, 14),    color: '#f97316' },
  { id: uid(), title: 'Final guest RSVP',    start: d(-5, 0),   end: d(-5, 23, 59),color: '#ef4444', allDay: true },
  { id: uid(), title: 'Rehearsal dinner',    start: d(-1, 18),  end: d(-1, 21),    color: '#6366f1' },
  // Wedding day
  { id: uid(), title: 'Bridal prep',         start: d(0, 7),    end: d(0, 10),     color: '#ec4899' },
  { id: uid(), title: 'Photographer arrives',start: d(0, 10),   end: d(0, 11),     color: '#8b5cf6' },
  { id: uid(), title: 'Guest arrivals',      start: d(0, 11),   end: d(0, 12),     color: '#10b981' },
  { id: uid(), title: 'Ceremony',            start: d(0, 12),   end: d(0, 13),     color: '#f59e0b' },
  { id: uid(), title: 'Cocktail hour',       start: d(0, 13),   end: d(0, 14),     color: '#f97316' },
  { id: uid(), title: 'Reception',           start: d(0, 14),   end: d(0, 22),     color: '#6366f1' },
  // Honeymoon
  { id: uid(), title: '✈ Honeymoon departs', start: d(2, 0),   end: d(9, 23, 59), color: '#10b981', allDay: true },
])

const addWedding = (start: string, end: string) => {
  weddingEvents.value.push({ id: uid(), title: 'New appointment', start, end, color: '#8b5cf6' })
}
const deleteWedding = (id: string) => {
  weddingEvents.value = weddingEvents.value.filter(e => e.id !== id)
}

// ── 3. Work / sprint calendar ─────────────────────────────────────────────────

const workEvents = ref<CalendarEvent[]>([
  { id: uid(), title: 'Sprint 12 start',   start: d(-6, 0),    end: d(-6, 23, 59), color: '#6366f1', allDay: true },
  { id: uid(), title: 'Daily standup',     start: d(-6, 9, 30),end: d(-6, 9, 45),  color: '#3b82f6' },
  { id: uid(), title: 'Daily standup',     start: d(-5, 9, 30),end: d(-5, 9, 45),  color: '#3b82f6' },
  { id: uid(), title: 'Daily standup',     start: d(-4, 9, 30),end: d(-4, 9, 45),  color: '#3b82f6' },
  { id: uid(), title: 'Daily standup',     start: d(-3, 9, 30),end: d(-3, 9, 45),  color: '#3b82f6' },
  { id: uid(), title: 'Daily standup',     start: d(-2, 9, 30),end: d(-2, 9, 45),  color: '#3b82f6' },
  { id: uid(), title: 'Daily standup',     start: d(0, 9, 30), end: d(0, 9, 45),   color: '#3b82f6' },
  { id: uid(), title: 'Daily standup',     start: d(1, 9, 30), end: d(1, 9, 45),   color: '#3b82f6' },
  { id: uid(), title: 'Daily standup',     start: d(2, 9, 30), end: d(2, 9, 45),   color: '#3b82f6' },
  { id: uid(), title: 'Daily standup',     start: d(3, 9, 30), end: d(3, 9, 45),   color: '#3b82f6' },
  { id: uid(), title: 'Daily standup',     start: d(4, 9, 30), end: d(4, 9, 45),   color: '#3b82f6' },
  { id: uid(), title: '1:1 with manager',  start: d(-5, 14),   end: d(-5, 14, 30), color: '#8b5cf6' },
  { id: uid(), title: 'Design review',     start: d(-3, 14),   end: d(-3, 15),     color: '#ec4899' },
  { id: uid(), title: 'Backend sync',      start: d(-3, 15, 30),end: d(-3, 16),    color: '#f97316' },
  { id: uid(), title: 'Sprint review',     start: d(5, 14),    end: d(5, 16),      color: '#10b981' },
  { id: uid(), title: 'Sprint retro',      start: d(5, 16),    end: d(5, 17),      color: '#f59e0b' },
  { id: uid(), title: 'Sprint 13 start',   start: d(7, 0),     end: d(7, 23, 59),  color: '#6366f1', allDay: true },
  { id: uid(), title: 'On-call rotation',  start: d(0, 0),     end: d(3, 23, 59),  color: '#ef4444', allDay: true },
])

const addWork = (start: string, end: string) => {
  workEvents.value.push({ id: uid(), title: 'Meeting', start, end, color: '#3b82f6' })
}
const deleteWork = (id: string) => {
  workEvents.value = workEvents.value.filter(e => e.id !== id)
}

// ── Info modal ────────────────────────────────────────────────────────────────

const USECASES = [
  {
    context: 'General UI patterns',
    icon: 'mdi-calendar-outline',
    color: 'primary',
    items: [
      { label: 'Personal calendar', detail: 'Month/week/day views for individual event tracking — appointments, reminders, recurring tasks.' },
      { label: 'Team scheduling', detail: 'Shared calendar showing who is busy when. Great for booking meetings across time zones.' },
      { label: 'Resource booking', detail: 'Rooms, equipment, vehicles — each resource has a calendar; users book slots.' },
      { label: 'Class / course timetable', detail: 'Weekly view with recurring lessons, teacher names, room numbers.' },
    ],
  },
  {
    context: 'Guest Arrangements (#7)',
    icon: 'mdi-party-popper',
    color: 'pink',
    items: [
      { label: 'Event day timeline', detail: 'Day view showing the ceremony, cocktail hour, reception in sequence. Drag to reschedule supplier slots.' },
      { label: 'Pre-event planning', detail: 'Month view showing vendor meetings, tastings, RSVP deadlines, and rehearsal dinner in the weeks before.' },
    ],
  },
  {
    context: 'Timeline App (#11)',
    icon: 'mdi-timeline-outline',
    color: 'teal',
    items: [
      { label: 'Core view', detail: 'The calendar IS the timeline UI. Month view for macro overview, week/day for granular scheduling.' },
      { label: 'Milestone dates', detail: 'All-day events mark key milestones — deadlines, launches, review dates — visible across the month grid.' },
    ],
  },
  {
    context: 'Roadmap Builder (#2)',
    icon: 'mdi-map-outline',
    color: 'blue',
    items: [
      { label: 'Release calendar', detail: 'Month view overlays release windows and sprint boundaries as all-day events alongside feature work.' },
      { label: 'Sprint schedule', detail: 'Week view showing daily standups, sprint ceremonies and blockers for the current iteration.' },
    ],
  },
  {
    context: 'Workflow Engine (#3)',
    icon: 'mdi-vector-polyline',
    color: 'purple',
    items: [
      { label: 'Scheduled jobs', detail: 'Recurring jobs and scheduled triggers displayed on the calendar so teams spot overlap and resource contention.' },
      { label: 'SLA tracking', detail: 'Deadline dates shown as all-day events; day view shows hourly SLA windows for time-sensitive workflows.' },
    ],
  },
  {
    context: 'HEAM (#9)',
    icon: 'mdi-heart-pulse',
    color: 'red',
    items: [
      { label: 'Appointment tracking', detail: 'Medical appointments, medication schedules, and check-up reminders in a personal health calendar.' },
      { label: 'Symptom log', detail: 'Day view entries for when symptoms occurred, making patterns visible over the month grid.' },
    ],
  },
]
</script>

<template>
  <div>
    <div class="d-flex align-start justify-space-between gap-4 mb-1">
      <h1 class="text-h5 font-weight-bold">Calendar</h1>
      <v-btn icon="mdi-information-outline" variant="text" size="small" @click="infoOpen = true" />
    </div>
    <p class="text-body-2 text-medium-emphasis mb-5">
      Month, week and day views with event creation, colour coding, all-day events,
      overlapping event layout and a live now-indicator. Click any empty slot to add an event;
      click an event to view or delete it.
    </p>

    <!-- Info dialog -->
    <v-dialog v-model="infoOpen" max-width="560" scrollable>
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center justify-space-between pt-5 px-6 pb-2">
          <span class="text-h6">Use cases &amp; project fit</span>
          <v-btn icon="mdi-close" variant="text" size="small" @click="infoOpen = false" />
        </v-card-title>
        <v-card-subtitle class="px-6 pb-3 text-wrap">
          Any feature that schedules work, tracks appointments, or shows time-bounded events benefits from a calendar.
        </v-card-subtitle>
        <v-divider />
        <v-card-text class="px-4 py-4">
          <div v-for="group in USECASES" :key="group.context" class="cv-uc-group">
            <div class="cv-uc-header">
              <v-icon :icon="group.icon" :color="group.color" size="16" />
              <span class="cv-uc-title">{{ group.context }}</span>
            </div>
            <ul class="cv-uc-list">
              <li v-for="item in group.items" :key="item.label">
                <span class="cv-uc-label">{{ item.label }}</span>
                <span class="cv-uc-detail">{{ item.detail }}</span>
              </li>
            </ul>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-tabs v-model="tab" density="compact" class="mb-5">
      <v-tab value="personal">
        <v-icon start icon="mdi-account-outline" size="16" />
        Personal
      </v-tab>
      <v-tab value="wedding">
        <v-icon start icon="mdi-party-popper" size="16" />
        Event Planning
      </v-tab>
      <v-tab value="work">
        <v-icon start icon="mdi-briefcase-outline" size="16" />
        Work / Sprint
      </v-tab>
    </v-tabs>

    <v-window v-model="tab">

      <v-window-item value="personal">
        <p class="text-caption text-medium-emphasis mb-3">
          Personal schedule. Switch between month, week, and day views. Click any empty slot
          to create an event; click an event to see details or delete it.
        </p>
        <CommonCalendarView
          :events="personalEvents"
          initial-view="month"
          @event-create="addPersonal"
          @event-delete="deletePersonal"
        />
        <p class="text-caption text-medium-emphasis mt-3">Use case: Timeline App · personal productivity</p>
      </v-window-item>

      <v-window-item value="wedding">
        <p class="text-caption text-medium-emphasis mb-3">
          Wedding/event planner calendar. All-day events mark deadlines and travel. Day view
          is ideal for the wedding day itself — try switching to it to see the schedule hour by hour.
        </p>
        <CommonCalendarView
          :events="weddingEvents"
          initial-view="week"
          @event-create="addWedding"
          @event-delete="deleteWedding"
        />
        <p class="text-caption text-medium-emphasis mt-3">Use case: Guest Arrangements (#7)</p>
      </v-window-item>

      <v-window-item value="work">
        <p class="text-caption text-medium-emphasis mb-3">
          Sprint calendar with recurring standups, on-call markers (all-day), and sprint
          ceremonies. Week view shows the density of meetings at a glance.
        </p>
        <CommonCalendarView
          :events="workEvents"
          initial-view="week"
          @event-create="addWork"
          @event-delete="deleteWork"
        />
        <p class="text-caption text-medium-emphasis mt-3">Use case: Roadmap Builder (#2) · Workflow Engine (#3)</p>
      </v-window-item>

    </v-window>
  </div>
</template>

<style scoped>
.cv-uc-group { margin-bottom: 20px; }
.cv-uc-group:last-child { margin-bottom: 0; }
.cv-uc-header { display: flex; align-items: center; gap: 7px; margin-bottom: 8px; padding: 0 4px; }
.cv-uc-title { font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: rgba(var(--v-theme-on-surface), .55); }
.cv-uc-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 2px; }
.cv-uc-list li { display: flex; flex-direction: column; gap: 1px; padding: 7px 10px 7px 16px; border-radius: 8px; background: rgba(var(--v-theme-on-surface), .03); border-left: 2px solid rgba(var(--v-theme-on-surface), .08); }
.cv-uc-label { font-size: 12px; font-weight: 600; color: rgb(var(--v-theme-on-surface)); line-height: 1.4; }
.cv-uc-detail { font-size: 11px; color: rgba(var(--v-theme-on-surface), .5); line-height: 1.5; }
</style>
