export interface ShareData {
  title?: string
  text?: string
  url?: string
}

export const useShare = () => {
  const isSupported = computed(() => typeof navigator !== 'undefined' && 'share' in navigator)
  const shared = ref(false)
  const error = ref<string | null>(null)

  const share = async (data: ShareData) => {
    error.value = null
    if (isSupported.value) {
      try {
        await navigator.share(data)
        shared.value = true
      }
      catch (e) {
        if ((e as DOMException).name !== 'AbortError') {
          error.value = 'Share failed.'
        }
      }
    }
    else {
      // Fallback: copy URL to clipboard
      const { copy } = useClipboard()
      await copy(data.url ?? window.location.href)
      shared.value = true
    }
    setTimeout(() => { shared.value = false }, 2000)
  }

  return { share, isSupported, shared, error }
}
