<script setup lang="ts">
import type { PickedLocation } from '~/components/common/LocationPicker.vue'

definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Location Picker', disabled: true },
  ],
})

useSeo({
  title: 'Location Picker',
  description: 'Leaflet-based map picker with address search (Nominatim), click-to-pin, reverse geocoding, and current-location support.',
})

const tab = ref('single')
const infoDialog = ref(false)

// Tab 1 — single venue picker, pre-seeded with London
const venue = ref<PickedLocation | null>({
  lat: 51.505,
  lng: -0.09,
  address: 'London, England, United Kingdom',
})

// Tab 2 — multiple pickers
const pickup = ref<PickedLocation | null>(null)
const stop1 = ref<PickedLocation | null>(null)
const destination = ref<PickedLocation | null>(null)

const allSelected = computed(() => !!pickup.value && !!stop1.value && !!destination.value)

const clearAll = () => {
  pickup.value = null
  stop1.value = null
  destination.value = null
}

const useCases = [
  { icon: 'mdi-calendar-star', label: 'Event Planning (#7)', text: 'Guest arrangements — pin venue, vendor drop-off points and accommodation.' },
  { icon: 'mdi-briefcase-outline', label: 'Portfolio Manager (#1)', text: 'Tag office and client site coordinates against portfolio items.' },
  { icon: 'mdi-hospital-box-outline', label: 'HEAM (#9)', text: 'Store clinic, pharmacy and patient home addresses for scheduling.' },
  { icon: 'mdi-truck-fast-outline', label: 'Delivery Apps', text: 'Pick up and drop-off coordinates for last-mile routing.' },
  { icon: 'mdi-wrench-outline', label: 'Field Service', text: 'Dispatch technicians to precise job-site coordinates.' },
]
</script>

<template>
  <div>
    <div class="d-flex align-start justify-space-between flex-wrap gap-3 mb-1">
      <div>
        <h1 class="text-h5 font-weight-bold">Location Picker</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">
          Leaflet map with Nominatim search, click-to-pin, reverse geocoding and current-location support.
        </p>
      </div>
      <v-btn
        variant="tonal"
        prepend-icon="mdi-information-outline"
        size="small"
        @click="infoDialog = true"
      >
        Use cases
      </v-btn>
    </div>

    <v-tabs v-model="tab" class="mb-6" color="primary">
      <v-tab value="single" prepend-icon="mdi-map-marker">Address Input</v-tab>
      <v-tab value="multi" prepend-icon="mdi-map-marker-multiple">Multiple Locations</v-tab>
    </v-tabs>

    <v-tabs-window v-model="tab">
      <!-- Tab 1: Single venue picker -->
      <v-tabs-window-item value="single">
        <v-card rounded="lg" class="mb-6">
          <v-card-text class="pa-5">
            <p class="text-body-2 font-weight-medium mb-1">Event Venue</p>
            <p class="text-caption text-medium-emphasis mb-4">
              Search for an address, click the map, or use your current location.
            </p>
            <ClientOnly>
              <CommonLocationPicker
                v-model="venue"
                height="400px"
                placeholder="Search for a venue…"
              />
              <template #fallback>
                <v-skeleton-loader type="image" height="400" />
              </template>
            </ClientOnly>
          </v-card-text>
        </v-card>

        <v-card v-if="venue" rounded="lg" class="pa-5">
          <p class="text-overline text-medium-emphasis mb-3">Selected venue details</p>
          <v-row>
            <v-col cols="12" sm="6" md="4">
              <v-card rounded="lg" color="surface-variant" flat class="pa-4 text-center">
                <p class="text-caption text-medium-emphasis mb-1">Latitude</p>
                <p class="text-h6 font-weight-bold">{{ venue.lat.toFixed(6) }}</p>
              </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-card rounded="lg" color="surface-variant" flat class="pa-4 text-center">
                <p class="text-caption text-medium-emphasis mb-1">Longitude</p>
                <p class="text-h6 font-weight-bold">{{ venue.lng.toFixed(6) }}</p>
              </v-card>
            </v-col>
            <v-col v-if="venue.address" cols="12" md="4">
              <v-card rounded="lg" color="surface-variant" flat class="pa-4">
                <p class="text-caption text-medium-emphasis mb-1">Address</p>
                <p class="text-body-2 font-weight-medium">{{ venue.address }}</p>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-tabs-window-item>

      <!-- Tab 2: Multiple pickers -->
      <v-tabs-window-item value="multi">
        <div class="d-flex justify-end mb-4">
          <v-btn
            variant="text"
            size="small"
            prepend-icon="mdi-close-circle-outline"
            :disabled="!pickup && !stop1 && !destination"
            @click="clearAll"
          >
            Clear all
          </v-btn>
        </div>

        <v-row>
          <v-col cols="12" md="4">
            <v-card rounded="lg" class="mb-4">
              <v-card-text class="pa-5">
                <div class="d-flex align-center gap-2 mb-4">
                  <v-avatar color="success" variant="tonal" size="32" rounded="lg">
                    <v-icon icon="mdi-map-marker-up" size="18" />
                  </v-avatar>
                  <p class="text-body-2 font-weight-bold">Pickup</p>
                </div>
                <ClientOnly>
                  <CommonLocationPicker
                    v-model="pickup"
                    height="260px"
                    placeholder="Search pickup location…"
                  />
                  <template #fallback>
                    <v-skeleton-loader type="image" height="260" />
                  </template>
                </ClientOnly>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <v-card rounded="lg" class="mb-4">
              <v-card-text class="pa-5">
                <div class="d-flex align-center gap-2 mb-4">
                  <v-avatar color="warning" variant="tonal" size="32" rounded="lg">
                    <v-icon icon="mdi-map-marker-outline" size="18" />
                  </v-avatar>
                  <p class="text-body-2 font-weight-bold">Stop 1</p>
                </div>
                <ClientOnly>
                  <CommonLocationPicker
                    v-model="stop1"
                    height="260px"
                    placeholder="Search stop location…"
                  />
                  <template #fallback>
                    <v-skeleton-loader type="image" height="260" />
                  </template>
                </ClientOnly>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <v-card rounded="lg" class="mb-4">
              <v-card-text class="pa-5">
                <div class="d-flex align-center gap-2 mb-4">
                  <v-avatar color="error" variant="tonal" size="32" rounded="lg">
                    <v-icon icon="mdi-map-marker-check" size="18" />
                  </v-avatar>
                  <p class="text-body-2 font-weight-bold">Destination</p>
                </div>
                <ClientOnly>
                  <CommonLocationPicker
                    v-model="destination"
                    height="260px"
                    placeholder="Search destination…"
                  />
                  <template #fallback>
                    <v-skeleton-loader type="image" height="260" />
                  </template>
                </ClientOnly>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Summary card -->
        <v-card v-if="allSelected" rounded="lg" color="primary" variant="tonal" class="pa-5 mt-2">
          <p class="text-overline text-medium-emphasis mb-3">Route Summary</p>
          <v-list class="bg-transparent pa-0" density="compact">
            <v-list-item class="px-0">
              <template #prepend>
                <v-avatar color="success" variant="tonal" size="28" rounded="lg" class="mr-3">
                  <v-icon icon="mdi-map-marker-up" size="14" />
                </v-avatar>
              </template>
              <p class="text-body-2 font-weight-medium">Pickup</p>
              <p class="text-caption text-medium-emphasis">
                {{ pickup!.address ?? `${pickup!.lat.toFixed(5)}, ${pickup!.lng.toFixed(5)}` }}
              </p>
            </v-list-item>
            <v-list-item class="px-0">
              <template #prepend>
                <v-avatar color="warning" variant="tonal" size="28" rounded="lg" class="mr-3">
                  <v-icon icon="mdi-map-marker-outline" size="14" />
                </v-avatar>
              </template>
              <p class="text-body-2 font-weight-medium">Stop 1</p>
              <p class="text-caption text-medium-emphasis">
                {{ stop1!.address ?? `${stop1!.lat.toFixed(5)}, ${stop1!.lng.toFixed(5)}` }}
              </p>
            </v-list-item>
            <v-list-item class="px-0">
              <template #prepend>
                <v-avatar color="error" variant="tonal" size="28" rounded="lg" class="mr-3">
                  <v-icon icon="mdi-map-marker-check" size="14" />
                </v-avatar>
              </template>
              <p class="text-body-2 font-weight-medium">Destination</p>
              <p class="text-caption text-medium-emphasis">
                {{ destination!.address ?? `${destination!.lat.toFixed(5)}, ${destination!.lng.toFixed(5)}` }}
              </p>
            </v-list-item>
          </v-list>
        </v-card>

        <v-card v-else rounded="lg" color="surface-variant" flat class="pa-5 mt-2 text-center">
          <v-icon icon="mdi-map-marker-multiple-outline" size="40" class="mb-2 opacity-40" />
          <p class="text-body-2 text-medium-emphasis">
            Select all three locations to see the route summary.
          </p>
        </v-card>
      </v-tabs-window-item>
    </v-tabs-window>

    <!-- Info dialog -->
    <v-dialog v-model="infoDialog" max-width="520">
      <v-card rounded="lg">
        <v-card-title class="d-flex align-center pa-5 pb-3">
          <v-icon icon="mdi-map-marker-plus-outline" class="mr-2" color="green" />
          Location Picker — Use Cases
        </v-card-title>
        <v-card-text class="px-5 pb-2">
          <v-list class="pa-0" lines="two">
            <v-list-item
              v-for="(uc, i) in useCases"
              :key="i"
              :prepend-icon="uc.icon"
              rounded="lg"
              class="px-0"
            >
              <v-list-item-title class="text-body-2 font-weight-medium">{{ uc.label }}</v-list-item-title>
              <v-list-item-subtitle class="text-caption">{{ uc.text }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions class="pa-5 pt-2">
          <v-spacer />
          <v-btn variant="tonal" @click="infoDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
