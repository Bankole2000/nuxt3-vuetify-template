<script setup lang="ts">
definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Date & Time', disabled: true },
  ],
})

const date = ref<string[]>([])
const time = ref<string>('09:00')
const rangeDate = ref<string[]>([])
const dateMenu = ref(false)
const timeMenu = ref(false)
const rangeMenu = ref(false)

const formattedDate = computed(() => {
  const d = date.value[0]
  return d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'
})
const formattedRange = computed(() => {
  if (rangeDate.value.length < 2) return '—'
  const sorted = [...rangeDate.value].sort()
  const a = sorted[0]!
  const b = sorted[1]!
  return `${new Date(a).toLocaleDateString()} → ${new Date(b).toLocaleDateString()}`
})
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">Date & Time Pickers</h1>
    <p class="text-body-2 text-medium-emphasis mb-8">
      Vuetify's <code>v-date-picker</code> and <code>v-time-picker</code> wired with menu activators and form fields.
    </p>

    <v-row class="mb-6">
      <!-- Single date -->
      <v-col cols="12" md="4">
        <h2 class="text-overline text-medium-emphasis mb-4">Single date</h2>
        <v-menu v-model="dateMenu" :close-on-content-click="false">
          <template #activator="{ props }">
            <v-text-field
              v-bind="props"
              :model-value="formattedDate"
              label="Pick a date"
              variant="outlined"
              density="comfortable"
              readonly
              prepend-inner-icon="mdi-calendar"
              clearable
              @click:clear="date = []"
            />
          </template>
          <v-date-picker
            v-model="date"
            multiple="single"
            @update:model-value="dateMenu = false"
          />
        </v-menu>
      </v-col>

      <!-- Time picker -->
      <v-col cols="12" md="4">
        <h2 class="text-overline text-medium-emphasis mb-4">Time</h2>
        <v-menu v-model="timeMenu" :close-on-content-click="false">
          <template #activator="{ props }">
            <v-text-field
              v-bind="props"
              v-model="time"
              label="Pick a time"
              variant="outlined"
              density="comfortable"
              readonly
              prepend-inner-icon="mdi-clock-outline"
            />
          </template>
          <v-time-picker
            v-model="time"
            format="24hr"
            @update:model-value="timeMenu = false"
          />
        </v-menu>
      </v-col>

      <!-- Date range -->
      <v-col cols="12" md="4">
        <h2 class="text-overline text-medium-emphasis mb-4">Date range</h2>
        <v-menu v-model="rangeMenu" :close-on-content-click="false">
          <template #activator="{ props }">
            <v-text-field
              v-bind="props"
              :model-value="formattedRange"
              label="Pick a range"
              variant="outlined"
              density="comfortable"
              readonly
              prepend-inner-icon="mdi-calendar-range"
              clearable
              @click:clear="rangeDate = []"
            />
          </template>
          <v-date-picker
            v-model="rangeDate"
            multiple="range"
          />
        </v-menu>
      </v-col>
    </v-row>

    <!-- Selected values -->
    <h2 class="text-overline text-medium-emphasis mb-4">Selected values</h2>
    <v-card rounded="lg" class="pa-5">
      <v-row>
        <v-col cols="12" sm="4">
          <p class="text-caption text-medium-emphasis mb-1">Date</p>
          <p class="text-body-1 font-weight-medium">{{ formattedDate }}</p>
        </v-col>
        <v-col cols="12" sm="4">
          <p class="text-caption text-medium-emphasis mb-1">Time</p>
          <p class="text-body-1 font-weight-medium">{{ time || '—' }}</p>
        </v-col>
        <v-col cols="12" sm="4">
          <p class="text-caption text-medium-emphasis mb-1">Range</p>
          <p class="text-body-1 font-weight-medium">{{ formattedRange }}</p>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>
