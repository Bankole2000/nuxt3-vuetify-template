export interface GeoAddress {
  display: string
  road: string | null
  suburb: string | null
  city: string | null
  state: string | null
  country: string | null
  postcode: string | null
}

export const useReverseGeocode = () => {
  const address = ref<GeoAddress | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const lookup = async (lat: number, lng: number): Promise<GeoAddress | null> => {
    loading.value = true
    error.value = null
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      const data = await $fetch<{
        display_name: string
        address: {
          road?: string
          suburb?: string
          city?: string
          town?: string
          village?: string
          state?: string
          country?: string
          postcode?: string
        }
      }>(url, {
        headers: { 'Accept-Language': 'en' },
      })

      address.value = {
        display: data.display_name,
        road: data.address.road ?? null,
        suburb: data.address.suburb ?? null,
        city: data.address.city ?? data.address.town ?? data.address.village ?? null,
        state: data.address.state ?? null,
        country: data.address.country ?? null,
        postcode: data.address.postcode ?? null,
      }
      return address.value
    }
    catch {
      error.value = 'Failed to fetch address.'
      return null
    }
    finally {
      loading.value = false
    }
  }

  return { address, loading, error, lookup }
}
