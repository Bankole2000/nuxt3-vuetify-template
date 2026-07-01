import { optimizeRoute, formatDistance } from '~/utils/geo'
import type { LatLng } from '~/utils/geo'

export interface RouteStep {
  instruction: string
  distance: number
  duration: number
  distanceText: string
}

export interface RouteResult {
  waypoints: LatLng[]
  geometry: LatLng[]       // full polyline coordinates
  steps: RouteStep[]
  totalDistance: number
  totalDuration: number
  totalDistanceText: string
  totalDurationText: string
}

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving'

const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m} min`
}

const decodePolyline = (encoded: string): LatLng[] => {
  const coords: LatLng[] = []
  let index = 0, lat = 0, lng = 0

  while (index < encoded.length) {
    let b: number, shift = 0, result = 0
    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    lat += result & 1 ? ~(result >> 1) : result >> 1

    shift = 0; result = 0
    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    lng += result & 1 ? ~(result >> 1) : result >> 1

    coords.push({ lat: lat / 1e5, lng: lng / 1e5 })
  }
  return coords
}

export const useRouting = () => {
  const route = ref<RouteResult | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch a driving route between ordered waypoints via OSRM.
   * Pass tsp: true to run the nearest-neighbour optimizer first.
   */
  const fetchRoute = async (waypoints: LatLng[], tsp = false): Promise<RouteResult | null> => {
    if (waypoints.length < 2) {
      error.value = 'At least 2 waypoints required.'
      return null
    }

    loading.value = true
    error.value = null

    const ordered = tsp ? optimizeRoute(waypoints).ordered : waypoints
    const coords = ordered.map(p => `${p.lng},${p.lat}`).join(';')
    const url = `${OSRM_BASE}/${coords}?overview=full&geometries=polyline&steps=true`

    try {
      const data = await $fetch<{
        code: string
        routes: Array<{
          distance: number
          duration: number
          geometry: string
          legs: Array<{
            steps: Array<{
              maneuver: { instruction?: string; type: string; modifier?: string }
              distance: number
              duration: number
            }>
          }>
        }>
      }>(url)

      if (data.code !== 'Ok' || !data.routes.length) {
        error.value = 'No route found.'
        return null
      }

      const r = data.routes[0]
      const steps: RouteStep[] = r.legs.flatMap(leg =>
        leg.steps
          .filter(s => s.maneuver.type !== 'arrive' || leg === r.legs[r.legs.length - 1])
          .map(s => ({
            instruction: s.maneuver.instruction
              ?? `${s.maneuver.type}${s.maneuver.modifier ? ' ' + s.maneuver.modifier : ''}`,
            distance: s.distance,
            duration: s.duration,
            distanceText: formatDistance(s.distance),
          })),
      )

      route.value = {
        waypoints: ordered,
        geometry: decodePolyline(r.geometry),
        steps,
        totalDistance: r.distance,
        totalDuration: r.duration,
        totalDistanceText: formatDistance(r.distance),
        totalDurationText: formatDuration(r.duration),
      }
      return route.value
    }
    catch {
      error.value = 'Failed to fetch route. Check your internet connection.'
      return null
    }
    finally {
      loading.value = false
    }
  }

  const clearRoute = () => { route.value = null; error.value = null }

  return { route, loading, error, fetchRoute, clearRoute }
}
