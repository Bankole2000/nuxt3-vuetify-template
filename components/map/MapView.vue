<script setup lang="ts">
import type { Map as LeafletMap, Marker, Polyline, CircleMarker } from 'leaflet'
import type { LatLng } from '~/utils/geo'

export interface MapMarker {
  id: string | number
  lat: number
  lng: number
  label?: string
  color?: string
  isUser?: boolean
}

const props = withDefaults(defineProps<{
  markers?: MapMarker[]
  routeGeometry?: LatLng[]
  center?: LatLng
  zoom?: number
  height?: string
}>(), {
  markers: () => [],
  routeGeometry: () => [],
  zoom: 13,
  height: '400px',
})

const emit = defineEmits<{
  (e: 'map-click', coords: LatLng): void
}>()

const mapContainer = ref<HTMLDivElement>()
let map: LeafletMap | null = null
const markerInstances = new globalThis.Map<string | number, Marker | CircleMarker>()
let routePolyline: Polyline | null = null
let userPulse: CircleMarker | null = null

const initMap = async () => {
  if (!mapContainer.value) return
  const L = await import('leaflet')
  await import('leaflet/dist/leaflet.css')

  // Fix default icon path broken by bundlers
  delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })

  const initialCenter = props.center ?? props.markers[0] ?? { lat: 51.505, lng: -0.09 }
  map = L.map(mapContainer.value).setView([initialCenter.lat, initialCenter.lng], props.zoom)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map)

  map.on('click', (e) => {
    emit('map-click', { lat: e.latlng.lat, lng: e.latlng.lng })
  })

  syncMarkers()
  syncRoute()
}

const syncMarkers = async () => {
  if (!map) return
  const L = await import('leaflet')

  const currentIds = new Set(props.markers.map(m => m.id))

  // Remove stale
  for (const [id, instance] of markerInstances) {
    if (!currentIds.has(id)) {
      instance.remove()
      markerInstances.delete(id)
    }
  }

  for (const m of props.markers) {
    if (m.isUser) {
      // Pulsing accuracy circle for user location
      if (userPulse) userPulse.remove()
      userPulse = L.circleMarker([m.lat, m.lng], {
        radius: 10,
        color: '#1565C0',
        fillColor: '#1976D2',
        fillOpacity: 0.9,
        weight: 3,
      }).addTo(map)
      if (m.label) userPulse.bindTooltip(m.label, { permanent: false })
      markerInstances.set(m.id, userPulse)
    }
    else if (!markerInstances.has(m.id)) {
      const marker = L.marker([m.lat, m.lng]).addTo(map)
      if (m.label) marker.bindTooltip(m.label, { permanent: true, direction: 'top', offset: [0, -10] })
      markerInstances.set(m.id, marker)
    }
  }
}

const syncRoute = async () => {
  if (!map) return
  const L = await import('leaflet')

  if (routePolyline) { routePolyline.remove(); routePolyline = null }

  if (props.routeGeometry.length > 1) {
    routePolyline = L.polyline(
      props.routeGeometry.map(p => [p.lat, p.lng]),
      { color: '#1976D2', weight: 4, opacity: 0.8 },
    ).addTo(map)
    map.fitBounds(routePolyline.getBounds(), { padding: [40, 40] })
  }
}

const fitToMarkers = async () => {
  if (!map || !props.markers.length) return
  const L = await import('leaflet')
  const bounds = L.latLngBounds(props.markers.map(m => [m.lat, m.lng]))
  map.fitBounds(bounds, { padding: [50, 50] })
}

watch(() => props.markers, syncMarkers, { deep: true })
watch(() => props.routeGeometry, syncRoute, { deep: true })
watch(() => props.center, (c) => {
  if (map && c) map.setView([c.lat, c.lng], props.zoom)
})

onMounted(initMap)
onUnmounted(() => {
  map?.remove()
  map = null
})

defineExpose({ fitToMarkers })
</script>

<template>
  <div ref="mapContainer" :style="{ height, width: '100%', borderRadius: '12px', zIndex: 0 }" />
</template>
