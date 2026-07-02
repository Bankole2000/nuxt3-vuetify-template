<script setup lang="ts">
import { haversineDistance, bearing, cardinalDirection, formatDistance, optimizeRoute } from '~/utils/geo'
import type { LatLng } from '~/utils/geo'
import type { MapMarker } from '~/components/map/MapView.vue'

definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Geolocation', disabled: true },
  ],
})

// ── 1. Current position ──────────────────────────────────────────────────────
const { coords, error: geoError, loading: geoLoading, isWatching, locate, startWatch, stopWatch } = useGeolocation()
const { address, loading: geocodeLoading, lookup } = useReverseGeocode()

const onLocate = async () => {
  const c = await locate()
  if (c) lookup(c.lat, c.lng)
}

const onWatchToggle = () => {
  if (isWatching.value) { stopWatch(); return }
  startWatch()
  watch(coords, (c) => { if (c) lookup(c.lat, c.lng) }, { once: true })
}

// ── 2. Interactive map with click-to-add waypoints ───────────────────────────
const { route, loading: routeLoading, error: routeError, fetchRoute, clearRoute } = useRouting()

const waypoints = ref<(LatLng & { label: string })[]>([])
const tspEnabled = ref(false)

const mapMarkers = computed<MapMarker[]>(() => {
  const wps: MapMarker[] = waypoints.value.map((w, i) => ({
    id: `wp-${i}`,
    lat: w.lat,
    lng: w.lng,
    label: w.label,
  }))
  if (coords.value) {
    wps.unshift({
      id: 'user',
      lat: coords.value.lat,
      lng: coords.value.lng,
      label: 'You',
      isUser: true,
    })
  }
  return wps
})

const routeGeometry = computed<LatLng[]>(() => route.value?.geometry ?? [])

const mapCenter = computed<LatLng | undefined>(() =>
  coords.value ? { lat: coords.value.lat, lng: coords.value.lng } : undefined,
)

const onMapClick = (coords: LatLng) => {
  const n = waypoints.value.length + 1
  waypoints.value.push({ ...coords, label: `Stop ${n}` })
}

const removeWaypoint = (i: number) => {
  waypoints.value.splice(i, 1)
  waypoints.value.forEach((w, idx) => { w.label = `Stop ${idx + 1}` })
  if (waypoints.value.length < 2) clearRoute()
}

const onFetchRoute = () => {
  const points = waypoints.value.map(w => ({ lat: w.lat, lng: w.lng }))
  if (coords.value) points.unshift({ lat: coords.value.lat, lng: coords.value.lng })
  fetchRoute(points, tspEnabled.value)
}

const onClear = () => {
  waypoints.value = []
  clearRoute()
}

// ── 3. Distance & bearing demo ───────────────────────────────────────────────
const pointA = ref<LatLng>({ lat: 51.5074, lng: -0.1278 })  // London
const pointB = ref<LatLng>({ lat: 48.8566, lng: 2.3522 })   // Paris

const distResult = computed(() => {
  if (!pointA.value || !pointB.value) return null
  const d = haversineDistance(pointA.value, pointB.value)
  const b = bearing(pointA.value, pointB.value)
  return {
    distance: formatDistance(d),
    bearing: b.toFixed(1),
    cardinal: cardinalDirection(b),
  }
})

// ── 4. TSP demo with preset cities ───────────────────────────────────────────
interface City { name: string; lat: number; lng: number }
const cities: City[] = [
  { name: 'London', lat: 51.5074, lng: -0.1278 },
  { name: 'Paris', lat: 48.8566, lng: 2.3522 },
  { name: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
  { name: 'Berlin', lat: 52.5200, lng: 13.4050 },
  { name: 'Brussels', lat: 50.8503, lng: 4.3517 },
]
const tspResult = computed(() => {
  const { ordered, totalDistance } = optimizeRoute(cities.map(c => ({ lat: c.lat, lng: c.lng })))
  return {
    order: ordered.map(p => cities.find(c => c.lat === p.lat)?.name ?? '?'),
    distance: formatDistance(totalDistance),
  }
})
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">Geolocation</h1>
    <p class="text-body-2 text-medium-emphasis mb-8">
      Browser Geolocation API, Leaflet maps, reverse geocoding via Nominatim,
      OSRM routing, and TSP route optimization.
    </p>

    <!-- 1. Current position -->
    <h2 class="text-overline text-medium-emphasis mb-4">Current position</h2>
    <v-card rounded="lg" class="mb-6 pa-5">
      <div class="d-flex gap-3 flex-wrap mb-4">
        <v-btn
          color="primary"
          prepend-icon="mdi-crosshairs-gps"
          :loading="geoLoading"
          @click="onLocate"
        >
          Get my location
        </v-btn>
        <v-btn
          :color="isWatching ? 'error' : 'default'"
          :prepend-icon="isWatching ? 'mdi-stop' : 'mdi-radar'"
          variant="tonal"
          @click="onWatchToggle"
        >
          {{ isWatching ? 'Stop watching' : 'Watch position' }}
        </v-btn>
      </div>

      <v-alert v-if="geoError" type="error" variant="tonal" rounded="lg" class="mb-4">
        {{ geoError }}
      </v-alert>

      <v-row v-if="coords">
        <v-col cols="12" sm="6" md="3">
          <v-card rounded="lg" color="surface-variant" flat class="pa-4 text-center">
            <p class="text-caption text-medium-emphasis mb-1">Latitude</p>
            <p class="text-h6 font-weight-bold">{{ coords.lat.toFixed(6) }}</p>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card rounded="lg" color="surface-variant" flat class="pa-4 text-center">
            <p class="text-caption text-medium-emphasis mb-1">Longitude</p>
            <p class="text-h6 font-weight-bold">{{ coords.lng.toFixed(6) }}</p>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card rounded="lg" color="surface-variant" flat class="pa-4 text-center">
            <p class="text-caption text-medium-emphasis mb-1">Accuracy</p>
            <p class="text-h6 font-weight-bold">{{ formatDistance(coords.accuracy) }}</p>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card rounded="lg" color="surface-variant" flat class="pa-4 text-center">
            <p class="text-caption text-medium-emphasis mb-1">Speed</p>
            <p class="text-h6 font-weight-bold">
              {{ coords.speed != null ? `${(coords.speed * 3.6).toFixed(1)} km/h` : '—' }}
            </p>
          </v-card>
        </v-col>
      </v-row>

      <!-- Reverse geocode -->
      <div v-if="coords" class="mt-4">
        <v-skeleton-loader v-if="geocodeLoading" type="list-item-two-line" />
        <v-list-item v-else-if="address" rounded="lg" class="pa-0">
          <template #prepend>
            <v-avatar color="primary" variant="tonal" size="40" rounded="lg" class="mr-3">
              <v-icon icon="mdi-map-marker-outline" />
            </v-avatar>
          </template>
          <v-list-item-title class="text-body-2 font-weight-medium">
            {{ [address.road, address.suburb, address.city].filter(Boolean).join(', ') }}
          </v-list-item-title>
          <v-list-item-subtitle class="text-caption">
            {{ [address.state, address.country, address.postcode].filter(Boolean).join(' · ') }}
          </v-list-item-subtitle>
        </v-list-item>
      </div>
    </v-card>

    <!-- 2. Map + routing -->
    <h2 class="text-overline text-medium-emphasis mb-4">Interactive map & routing</h2>
    <v-card rounded="lg" class="mb-6">
      <v-card-text class="pa-5 pb-3">
        <p class="text-body-2 text-medium-emphasis mb-3">
          Click the map to add waypoints. Get your location first to use it as the route start.
        </p>
        <div class="d-flex flex-wrap gap-2 align-center mb-4">
          <v-btn
            color="primary"
            size="small"
            prepend-icon="mdi-directions"
            :loading="routeLoading"
            :disabled="waypoints.length < 1"
            @click="onFetchRoute"
          >
            Get route
          </v-btn>
          <v-btn
            size="small"
            variant="text"
            prepend-icon="mdi-close"
            :disabled="!waypoints.length && !route"
            @click="onClear"
          >
            Clear
          </v-btn>
          <v-spacer />
          <v-switch
            v-model="tspEnabled"
            label="Optimize stops (TSP)"
            density="compact"
            hide-details
            color="primary"
            class="flex-grow-0"
          />
        </div>

        <v-alert v-if="routeError" type="error" variant="tonal" rounded="lg" density="compact" class="mb-3">
          {{ routeError }}
        </v-alert>
      </v-card-text>

      <!-- Map -->
      <ClientOnly>
        <MapView
          ref="mapRef"
          :markers="mapMarkers"
          :route-geometry="routeGeometry"
          :center="mapCenter"
          height="380px"
          style="border-radius: 0 0 12px 12px; overflow: hidden;"
          @map-click="onMapClick"
        />
        <template #fallback>
          <v-skeleton-loader type="image" height="380" />
        </template>
      </ClientOnly>

      <!-- Waypoints list -->
      <v-card-text v-if="waypoints.length" class="pa-5 pt-4">
        <p class="text-caption text-overline text-medium-emphasis mb-2">Waypoints</p>
        <v-list density="compact" rounded="lg" border class="pa-1">
          <v-list-item
            v-if="coords"
            prepend-icon="mdi-circle"
            class="text-primary"
          >
            <v-list-item-title class="text-body-2">
              Start: {{ coords.lat.toFixed(5) }}, {{ coords.lng.toFixed(5) }} (your location)
            </v-list-item-title>
          </v-list-item>
          <v-list-item
            v-for="(wp, i) in waypoints"
            :key="i"
            :prepend-icon="i === waypoints.length - 1 ? 'mdi-map-marker' : 'mdi-map-marker-outline'"
          >
            <v-list-item-title class="text-body-2">
              {{ wp.label }}: {{ wp.lat.toFixed(5) }}, {{ wp.lng.toFixed(5) }}
            </v-list-item-title>
            <template #append>
              <v-btn icon="mdi-close" size="x-small" variant="text" @click="removeWaypoint(i)" />
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>

      <!-- Route summary -->
      <v-card-text v-if="route" class="pa-5 pt-0">
        <v-divider class="mb-4" />
        <div class="d-flex gap-4 mb-4">
          <v-chip prepend-icon="mdi-map-marker-distance" color="primary" variant="tonal">
            {{ route.totalDistanceText }}
          </v-chip>
          <v-chip prepend-icon="mdi-clock-outline" color="info" variant="tonal">
            {{ route.totalDurationText }}
          </v-chip>
        </div>
        <p class="text-caption text-overline text-medium-emphasis mb-2">Turn-by-turn directions</p>
        <v-list density="compact" class="pa-0">
          <v-list-item
            v-for="(step, i) in route.steps.slice(0, 8)"
            :key="i"
            class="px-0"
          >
            <template #prepend>
              <span class="text-caption text-medium-emphasis mr-3" style="min-width: 28px;">{{ i + 1 }}.</span>
            </template>
            <v-list-item-title class="text-body-2">{{ step.instruction }}</v-list-item-title>
            <template #append>
              <span class="text-caption text-medium-emphasis">{{ step.distanceText }}</span>
            </template>
          </v-list-item>
          <v-list-item v-if="route.steps.length > 8" class="px-0">
            <v-list-item-title class="text-caption text-medium-emphasis">
              + {{ route.steps.length - 8 }} more steps
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>

    <!-- 3. Distance & bearing calculator -->
    <h2 class="text-overline text-medium-emphasis mb-4">Distance & bearing calculator</h2>
    <v-card rounded="lg" class="mb-6 pa-5">
      <v-row>
        <v-col cols="12" sm="6">
          <p class="text-body-2 font-weight-medium mb-3">Point A</p>
          <v-row dense>
            <v-col cols="6">
              <v-text-field
                v-model.number="pointA.lat"
                label="Latitude"
                type="number"
                density="compact"
                variant="outlined"
                step="0.0001"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.number="pointA.lng"
                label="Longitude"
                type="number"
                density="compact"
                variant="outlined"
                step="0.0001"
              />
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12" sm="6">
          <p class="text-body-2 font-weight-medium mb-3">Point B</p>
          <v-row dense>
            <v-col cols="6">
              <v-text-field
                v-model.number="pointB.lat"
                label="Latitude"
                type="number"
                density="compact"
                variant="outlined"
                step="0.0001"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.number="pointB.lng"
                label="Longitude"
                type="number"
                density="compact"
                variant="outlined"
                step="0.0001"
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <v-row v-if="distResult" class="mt-2">
        <v-col cols="12" sm="4">
          <v-card rounded="lg" color="surface-variant" flat class="pa-4 text-center">
            <p class="text-caption text-medium-emphasis mb-1">Distance</p>
            <p class="text-h6 font-weight-bold">{{ distResult.distance }}</p>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card rounded="lg" color="surface-variant" flat class="pa-4 text-center">
            <p class="text-caption text-medium-emphasis mb-1">Bearing</p>
            <p class="text-h6 font-weight-bold">{{ distResult.bearing }}°</p>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card rounded="lg" color="surface-variant" flat class="pa-4 text-center">
            <p class="text-caption text-medium-emphasis mb-1">Direction</p>
            <p class="text-h6 font-weight-bold">{{ distResult.cardinal }}</p>
          </v-card>
        </v-col>
      </v-row>
    </v-card>

    <!-- 4. TSP demo -->
    <h2 class="text-overline text-medium-emphasis mb-4">TSP route optimizer</h2>
    <v-card rounded="lg" class="pa-5">
      <p class="text-body-2 text-medium-emphasis mb-4">
        Nearest-neighbour heuristic applied to 5 European cities. Always starts from London.
        The algorithm runs instantly in the browser — no API call needed.
      </p>
      <div class="d-flex flex-wrap gap-2 mb-4">
        <v-chip
          v-for="(city, i) in cities"
          :key="city.name"
          :color="i === 0 ? 'primary' : 'default'"
          variant="tonal"
          size="small"
        >
          {{ city.name }}
        </v-chip>
      </div>
      <v-divider class="mb-4" />
      <p class="text-caption text-overline text-medium-emphasis mb-2">Optimized order</p>
      <div class="d-flex align-center flex-wrap gap-1 mb-4">
        <template v-for="(name, i) in tspResult.order" :key="i">
          <v-chip color="primary" variant="tonal" size="small">{{ name }}</v-chip>
          <v-icon v-if="i < tspResult.order.length - 1" icon="mdi-arrow-right" size="14" class="text-medium-emphasis" />
        </template>
      </div>
      <p class="text-body-2">
        Estimated total (straight-line):
        <strong>{{ tspResult.distance }}</strong>
      </p>
      <v-alert type="info" variant="tonal" density="compact" rounded="lg" class="mt-4">
        The nearest-neighbour heuristic gives a good approximation but not always the global optimum.
        For exact TSP, integrate OR-Tools or a dedicated solver.
      </v-alert>
    </v-card>
  </div>
</template>
