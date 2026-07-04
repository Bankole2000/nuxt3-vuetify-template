<script setup lang="ts">
import { useDisplay } from 'vuetify'

export type NotifChannel = 'email' | 'push' | 'sms' | 'in-app'

export type NotifFrequency = 'instant' | 'hourly' | 'daily' | 'weekly' | 'never'

export interface NotifCategory {
  id:          string
  label:       string
  description: string
  icon:        string
  channels:    Partial<Record<NotifChannel, {
    enabled:   boolean
    frequency: NotifFrequency
  }>>
}

export interface NotifPreferences {
  globalMute:        boolean
  quietHoursEnabled: boolean
  quietStart:        string
  quietEnd:          string
  categories:        NotifCategory[]
}

const props = withDefaults(defineProps<{
  preferences:       NotifPreferences
  availableChannels?: NotifChannel[]
  readonly?:         boolean
}>(), {
  availableChannels: () => ['email', 'push', 'sms', 'in-app'] as NotifChannel[],
  readonly:          false,
})

const emit = defineEmits<{
  update: [prefs: NotifPreferences]
}>()

const { mdAndUp } = useDisplay()

const channelMeta: Record<NotifChannel, { icon: string; label: string }> = {
  email:  { icon: 'mdi-email-outline',   label: 'Email' },
  push:   { icon: 'mdi-bell-outline',    label: 'Push' },
  sms:    { icon: 'mdi-message-outline', label: 'SMS' },
  'in-app': { icon: 'mdi-monitor-outline', label: 'In-App' },
}

const frequencyOptions: { title: string; value: NotifFrequency }[] = [
  { title: 'Instant', value: 'instant' },
  { title: 'Hourly',  value: 'hourly' },
  { title: 'Daily',   value: 'daily' },
  { title: 'Weekly',  value: 'weekly' },
]

function deepClone(p: NotifPreferences): NotifPreferences {
  return JSON.parse(JSON.stringify(p)) as NotifPreferences
}

const local = ref<NotifPreferences>(deepClone(props.preferences))
const saved = ref<NotifPreferences>(deepClone(props.preferences))

watch(() => props.preferences, (next) => {
  local.value = deepClone(next)
  saved.value = deepClone(next)
}, { deep: true })

const isDirty = computed(() =>
  JSON.stringify(local.value) !== JSON.stringify(saved.value)
)

function ensureChannel(cat: NotifCategory, ch: NotifChannel) {
  if (!cat.channels[ch]) {
    cat.channels[ch] = { enabled: false, frequency: 'instant' }
  }
}

function onToggleChannel(catIdx: number, ch: NotifChannel) {
  const cat = local.value.categories[catIdx]
  if (!cat) return
  ensureChannel(cat, ch)
  const entry = cat.channels[ch]!
  entry.enabled = !entry.enabled
}

function onFrequency(catIdx: number, ch: NotifChannel, freq: NotifFrequency) {
  const cat = local.value.categories[catIdx]
  if (!cat) return
  ensureChannel(cat, ch)
  cat.channels[ch]!.frequency = freq
}

function save() {
  const clone = deepClone(local.value)
  saved.value = deepClone(clone)
  emit('update', clone)
}
</script>

<template>
  <div>
    <!-- Global mute -->
    <v-card rounded="lg" border elevation="0" class="mb-4">
      <v-card-text class="pa-4">
        <div class="d-flex align-center justify-space-between gap-4">
          <div class="d-flex align-center gap-3">
            <v-avatar color="primary" variant="tonal" size="40" rounded="lg">
              <v-icon icon="mdi-bell-off-outline" size="20" />
            </v-avatar>
            <div>
              <p class="text-body-2 font-weight-medium mb-0">Global mute</p>
              <p class="text-caption text-medium-emphasis mb-0">Pause all notifications across every channel</p>
            </div>
          </div>
          <v-switch
            v-model="local.globalMute"
            color="primary"
            hide-details
            :disabled="readonly"
            density="compact"
          />
        </div>
      </v-card-text>
    </v-card>

    <!-- Global mute banner -->
    <v-alert
      v-if="local.globalMute"
      type="warning"
      variant="tonal"
      rounded="lg"
      icon="mdi-bell-off-outline"
      class="mb-4"
    >
      All notifications paused. Toggle global mute off to resume delivery.
    </v-alert>

    <!-- Quiet hours -->
    <v-card rounded="lg" border elevation="0" class="mb-4" :class="{ 'opacity-50': local.globalMute }">
      <v-card-text class="pa-4">
        <div class="d-flex align-center justify-space-between gap-4 mb-3">
          <div class="d-flex align-center gap-3">
            <v-avatar color="secondary" variant="tonal" size="40" rounded="lg">
              <v-icon icon="mdi-moon-waning-crescent" size="20" />
            </v-avatar>
            <div>
              <p class="text-body-2 font-weight-medium mb-0">Quiet hours</p>
              <p class="text-caption text-medium-emphasis mb-0">Silence notifications during these hours</p>
            </div>
          </div>
          <v-switch
            v-model="local.quietHoursEnabled"
            color="primary"
            hide-details
            :disabled="readonly || local.globalMute"
            density="compact"
          />
        </div>

        <div v-if="local.quietHoursEnabled" class="d-flex align-center gap-4 flex-wrap">
          <div>
            <p class="text-caption text-medium-emphasis mb-1">Start</p>
            <input
              v-model="local.quietStart"
              type="time"
              class="time-input"
              :disabled="readonly || local.globalMute"
            />
          </div>
          <v-icon icon="mdi-arrow-right" size="16" class="text-medium-emphasis mt-4" />
          <div>
            <p class="text-caption text-medium-emphasis mb-1">End</p>
            <input
              v-model="local.quietEnd"
              type="time"
              class="time-input"
              :disabled="readonly || local.globalMute"
            />
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Category table -->
    <v-card rounded="lg" border elevation="0" class="mb-4" :class="{ 'opacity-50': local.globalMute }">
      <!-- Desktop header row -->
      <div v-if="mdAndUp" class="d-flex align-center px-4 py-3 border-b channel-header">
        <div style="min-width: 240px" class="text-caption text-medium-emphasis font-weight-medium text-uppercase">
          Category
        </div>
        <div class="d-flex gap-2 flex-1">
          <div
            v-for="ch in availableChannels"
            :key="ch"
            class="d-flex flex-column align-center"
            style="min-width: 110px"
          >
            <v-icon :icon="channelMeta[ch].icon" size="18" class="mb-1" />
            <span class="text-caption text-medium-emphasis">{{ channelMeta[ch].label }}</span>
          </div>
        </div>
      </div>

      <!-- Category rows -->
      <div
        v-for="(cat, catIdx) in local.categories"
        :key="cat.id"
        :class="catIdx > 0 ? 'border-t' : ''"
      >
        <!-- Desktop layout -->
        <div v-if="mdAndUp" class="d-flex align-start px-4 py-3">
          <div class="d-flex align-center gap-3" style="min-width: 240px">
            <v-avatar color="primary" variant="tonal" size="36" rounded="lg">
              <v-icon :icon="cat.icon" size="18" />
            </v-avatar>
            <div>
              <p class="text-body-2 font-weight-medium mb-0">{{ cat.label }}</p>
              <p class="text-caption text-medium-emphasis mb-0">{{ cat.description }}</p>
            </div>
          </div>
          <div class="d-flex gap-2 flex-1 flex-wrap">
            <div
              v-for="ch in availableChannels"
              :key="ch"
              class="d-flex flex-column align-center pt-1"
              style="min-width: 110px"
            >
              <v-switch
                :model-value="cat.channels[ch]?.enabled ?? false"
                color="primary"
                hide-details
                density="compact"
                :disabled="readonly || local.globalMute"
                @update:model-value="() => onToggleChannel(catIdx, ch)"
              />
              <v-select
                v-if="cat.channels[ch]?.enabled"
                :model-value="cat.channels[ch]?.frequency ?? 'instant'"
                :items="frequencyOptions"
                item-title="title"
                item-value="value"
                variant="outlined"
                density="compact"
                hide-details
                rounded="lg"
                style="min-width: 100px; max-width: 110px;"
                class="mt-1"
                :disabled="readonly || local.globalMute"
                @update:model-value="(v) => onFrequency(catIdx, ch, v as NotifFrequency)"
              />
            </div>
          </div>
        </div>

        <!-- Mobile layout -->
        <div v-else class="pa-4">
          <div class="d-flex align-center gap-3 mb-3">
            <v-avatar color="primary" variant="tonal" size="36" rounded="lg">
              <v-icon :icon="cat.icon" size="18" />
            </v-avatar>
            <div>
              <p class="text-body-2 font-weight-medium mb-0">{{ cat.label }}</p>
              <p class="text-caption text-medium-emphasis mb-0">{{ cat.description }}</p>
            </div>
          </div>

          <div class="d-flex flex-column gap-2 pl-1">
            <div
              v-for="ch in availableChannels"
              :key="ch"
              class="d-flex align-center gap-3"
            >
              <v-icon :icon="channelMeta[ch].icon" size="16" class="text-medium-emphasis" style="min-width:16px" />
              <span class="text-caption text-medium-emphasis" style="min-width: 50px">{{ channelMeta[ch].label }}</span>
              <v-switch
                :model-value="cat.channels[ch]?.enabled ?? false"
                color="primary"
                hide-details
                density="compact"
                :disabled="readonly || local.globalMute"
                @update:model-value="() => onToggleChannel(catIdx, ch)"
              />
              <v-select
                v-if="cat.channels[ch]?.enabled"
                :model-value="cat.channels[ch]?.frequency ?? 'instant'"
                :items="frequencyOptions"
                item-title="title"
                item-value="value"
                variant="outlined"
                density="compact"
                hide-details
                rounded="lg"
                style="min-width: 100px"
                :disabled="readonly || local.globalMute"
                @update:model-value="(v) => onFrequency(catIdx, ch, v as NotifFrequency)"
              />
            </div>
          </div>
        </div>
      </div>
    </v-card>

    <!-- Footer: dirty indicator + save -->
    <div v-if="!readonly" class="d-flex align-center justify-space-between gap-3 flex-wrap">
      <div class="d-flex align-center gap-2">
        <v-icon
          v-if="isDirty"
          icon="mdi-circle-medium"
          color="warning"
          size="16"
        />
        <span v-if="isDirty" class="text-caption text-medium-emphasis">Unsaved changes</span>
        <span v-else class="text-caption text-medium-emphasis">All changes saved</span>
      </div>
      <v-btn
        color="primary"
        variant="flat"
        rounded="lg"
        :disabled="!isDirty"
        prepend-icon="mdi-content-save-outline"
        @click="save"
      >
        Save preferences
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
.border-b {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.border-t {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.channel-header {
  background: rgba(var(--v-theme-on-surface), 0.02);
}
.time-input {
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: transparent;
  color: inherit;
  font-size: 0.875rem;
  outline: none;
}
.time-input:focus {
  border-color: rgb(var(--v-theme-primary));
}
.time-input:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
