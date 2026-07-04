<script setup lang="ts">
import type { Map as LeafletMap, Marker } from 'leaflet'

export interface PickedLocation {
  lat: number
  lng: number
  address?: string
  raw?: object
}

interface NominatimSearchResult {
  lat: string
  lon: string
  display_name: string
  [key: string]: unknown
}

interface NominatimReverseResult {
  display_name: string
  [key: string]: unknown
}

const props = withDefaults(defineProps<{
  modelValue?: PickedLocation | null
  height?: string
  zoom?: number
  placeholder?: string
  readonly?: boolean
}>(), {
  modelValue: null,
  height: '400px',
  zoom: 13,
  placeholder: 'Search for a location…',
  readonly: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', location: PickedLocation | null): void
}>()

const mapContainer = ref<HTMLDivElement>()
let map: LeafletMap | null = null
let marker: Marker | null = null

const searchQuery = ref('')
const searchResults = ref<NominatimSearchResult[]>([])
const searchLoading = ref(false)
const searchOpen = ref(false)
const reverseLoading = ref(false)
const geoLoading = ref(false)
const geoError = ref<string | null>(null)
const copied = ref(false)

let searchTimer: ReturnType<typeof setTimeout> | null = null

const initMap = async () => {
  if (!mapContainer.value) return
  const L = (await import('leaflet')).default
  await import('leaflet/dist/leaflet.css')

  delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })

  const initialCenter = props.modelValue
    ? { lat: props.modelValue.lat, lng: props.modelValue.lng }
    : { lat: 51.505, lng: -0.09 }

  map = L.map(mapContainer.value).setView([initialCenter.lat, initialCenter.lng], props.zoom)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map)

  if (props.modelValue) {
    placeMarker(props.modelValue.lat, props.modelValue.lng)
  }

  if (!props.readonly) {
    map.on('click', async (e) => {
      await placeMarkerAndGeocode(e.latlng.lat, e.latlng.lng)
    })
  }
}

const placeMarker = async (lat: number, lng: number) => {
  if (!map) return
  const L = (await import('leaflet')).default
  if (marker) marker.remove()
  marker = L.marker([lat, lng]).addTo(map)
}

const placeMarkerAndGeocode = async (lat: number, lng: number) => {
  await placeMarker(lat, lng)
  reverseLoading.value = true
  try {
    const data = await $fetch<NominatimReverseResult>(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'en' } },
    )
    emit('update:modelValue', {
      lat,
      lng,
      address: data.display_name,
      raw: data as object,
    })
  }
  catch {
    emit('update:modelValue', { lat, lng })
  }
  finally {
    reverseLoading.value = false
  }
}

const onSearchInput = () => {
  if (searchTimer) clearTimeout(searchTimer)
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    searchOpen.value = false
    return
  }
  searchTimer = setTimeout(doSearch, 400)
}

const doSearch = async () => {
  if (!searchQuery.value.trim()) return
  searchLoading.value = true
  try {
    const results = await $fetch<NominatimSearchResult[]>(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery.value)}&format=json&limit=5`,
      { headers: { 'Accept-Language': 'en' } },
    )
    searchResults.value = results
    searchOpen.value = results.length > 0
  }
  catch {
    searchResults.value = []
  }
  finally {
    searchLoading.value = false
  }
}

const selectSearchResult = async (result: NominatimSearchResult) => {
  searchQuery.value = result.display_name
  searchOpen.value = false
  const lat = parseFloat(result.lat)
  const lng = parseFloat(result.lon)
  if (map) map.flyTo([lat, lng], props.zoom)
  await placeMarker(lat, lng)
  emit('update:modelValue', {
    lat,
    lng,
    address: result.display_name,
    raw: result as unknown as object,
  })
}

const useMyLocation = () => {
  if (!navigator.geolocation) {
    geoError.value = 'Geolocation is not supported by your browser.'
    return
  }
  geoLoading.value = true
  geoError.value = null
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      geoLoading.value = false
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      if (map) map.flyTo([lat, lng], props.zoom)
      await placeMarkerAndGeocode(lat, lng)
    },
    (err) => {
      geoLoading.value = false
      geoError.value = err.message
    },
    { enableHighAccuracy: true, timeout: 10000 },
  )
}

const clearLocation = async () => {
  if (marker) {
    marker.remove()
    marker = null
  }
  searchQuery.value = ''
  searchResults.value = []
  emit('update:modelValue', null)
}

const copyCoords = async () => {
  if (!props.modelValue) return
  const text = `${props.modelValue.lat.toFixed(6)}, ${props.modelValue.lng.toFixed(6)}`
  await navigator.clipboard.writeText(text)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

watch(() => props.modelValue, async (val) => {
  if (!map) return
  if (!val) {
    if (marker) { marker.remove(); marker = null }
    return
  }
  if (marker) {
    marker.setLatLng([val.lat, val.lng])
  }
  else {
    await placeMarker(val.lat, val.lng)
  }
  map.setView([val.lat, val.lng], props.zoom)
})

onMounted(initMap)
onUnmounted(() => {
  map?.remove()
  map = null
  marker = null
})
</script>

<template>
  <div>
    <v-alert
      v-if="geoError"
      type="warning"
      variant="tonal"
      density="compact"
      rounded="lg"
      closable
      class="mb-2"
      @click:close="geoError = null"
    >
      {{ geoError }}
    </v-alert>

    <!-- Search bar -->
    <div v-if="!readonly" class="position-relative mb-2">
      <v-text-field
        v-model="searchQuery"
        :placeholder="placeholder"
        prepend-inner-icon="mdi-magnify"
        :loading="searchLoading"
        density="compact"
        variant="outlined"
        rounded="lg"
        hide-details
        clearable
        @input="onSearchInput"
        @click:clear="() => { searchResults = []; searchOpen = false }"
      >
        <template #append-inner>
          <v-btn
            icon="mdi-crosshairs-gps"
            size="x-small"
            variant="text"
            :loading="geoLoading"
            density="compact"
            @click.stop="useMyLocation"
          />
        </template>
      </v-text-field>

      <v-card
        v-if="searchOpen && searchResults.length"
        class="position-absolute w-100"
        style="top: calc(100% + 4px); z-index: 1000;"
        elevation="4"
        rounded="lg"
      >
        <v-list density="compact" class="pa-1">
          <v-list-item
            v-for="(result, i) in searchResults"
            :key="i"
            rounded="lg"
            class="cursor-pointer"
            @click="selectSearchResult(result)"
          >
            <template #prepend>
              <v-icon icon="mdi-map-marker-outline" size="18" class="mr-2" />
            </template>
            <p class="text-body-2">{{ result.display_name }}</p>
          </v-list-item>
        </v-list>
      </v-card>
    </div>

    <!-- Map -->
    <div
      ref="mapContainer"
      :style="{ height, width: '100%', borderRadius: '12px', zIndex: 0, position: 'relative' }"
    />

    <!-- Loading overlay for reverse geocode -->
    <div v-if="reverseLoading" class="d-flex align-center gap-2 mt-2 text-caption text-medium-emphasis">
      <v-progress-circular size="14" width="2" indeterminate />
      <span>Looking up address…</span>
    </div>

    <!-- Selected location card -->
    <v-card
      v-if="modelValue"
      rounded="lg"
      color="surface-variant"
      flat
      class="mt-3 pa-4"
    >
      <div class="d-flex align-start justify-space-between gap-2">
        <div class="flex-grow-1 min-w-0">
          <div class="d-flex align-center gap-1 mb-1">
            <v-icon icon="mdi-map-marker" size="16" color="primary" />
            <p class="text-caption text-medium-emphasis">Selected location</p>
          </div>
          <p v-if="modelValue.address" class="text-body-2 font-weight-medium mb-1" style="word-break: break-word;">
            {{ modelValue.address }}
          </p>
          <div class="d-flex align-center gap-2 flex-wrap">
            <v-chip size="x-small" variant="tonal" color="primary">
              {{ modelValue.lat.toFixed(6) }}, {{ modelValue.lng.toFixed(6) }}
            </v-chip>
            <v-btn
              :icon="copied ? 'mdi-check' : 'mdi-content-copy'"
              size="x-small"
              variant="text"
              :color="copied ? 'success' : undefined"
              @click="copyCoords"
            />
          </div>
        </div>
        <v-btn
          v-if="!readonly"
          icon="mdi-close"
          size="x-small"
          variant="text"
          @click="clearLocation"
        />
      </div>
    </v-card>

    <p v-else-if="!readonly" class="text-caption text-medium-emphasis mt-2">
      Click on the map or search to pick a location.
    </p>
  </div>
</template>
