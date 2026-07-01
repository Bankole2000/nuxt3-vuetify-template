export interface GeoCoords {
  lat: number
  lng: number
  accuracy: number
  altitude: number | null
  altitudeAccuracy: number | null
  heading: number | null
  speed: number | null
  timestamp: number
}

export const useGeolocation = () => {
  const coords = ref<GeoCoords | null>(null)
  const error = ref<string | null>(null)
  const loading = ref(false)
  const isWatching = ref(false)

  let watchId: number | null = null

  const toGeoCoords = (pos: GeolocationPosition): GeoCoords => ({
    lat: pos.coords.latitude,
    lng: pos.coords.longitude,
    accuracy: pos.coords.accuracy,
    altitude: pos.coords.altitude,
    altitudeAccuracy: pos.coords.altitudeAccuracy,
    heading: pos.coords.heading,
    speed: pos.coords.speed,
    timestamp: pos.timestamp,
  })

  const onError = (e: GeolocationPositionError) => {
    loading.value = false
    const messages: Record<number, string> = {
      1: 'Location permission denied.',
      2: 'Position unavailable.',
      3: 'Location request timed out.',
    }
    error.value = messages[e.code] ?? 'Unknown geolocation error.'
  }

  /** One-shot position fetch */
  const locate = (): Promise<GeoCoords> => {
    error.value = null
    loading.value = true
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        loading.value = false
        error.value = 'Geolocation is not supported by this browser.'
        return reject(new Error(error.value))
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          loading.value = false
          coords.value = toGeoCoords(pos)
          resolve(coords.value)
        },
        (e) => { onError(e); reject(e) },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      )
    })
  }

  /** Start continuous watch */
  const startWatch = () => {
    if (isWatching.value || !navigator.geolocation) return
    error.value = null
    isWatching.value = true
    watchId = navigator.geolocation.watchPosition(
      (pos) => { coords.value = toGeoCoords(pos) },
      onError,
      { enableHighAccuracy: true, maximumAge: 5000 },
    )
  }

  /** Stop continuous watch */
  const stopWatch = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      watchId = null
    }
    isWatching.value = false
  }

  onUnmounted(stopWatch)

  return { coords, error, loading, isWatching, locate, startWatch, stopWatch }
}
