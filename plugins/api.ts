import { useAuthStore } from '~/stores/auth'
import { useUiStore } from '~/stores/ui'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()
  const ui = useUiStore()
  const router = useRouter()

  // Queue of resolvers waiting for an in-progress token refresh to complete.
  // When multiple requests 401 simultaneously, only one refresh fires; the
  // rest wait here and are replayed once new tokens are available.
  let refreshQueue: Array<(token: string | null) => void> = []

  const waitForRefresh = (): Promise<string | null> =>
    new Promise((resolve) => refreshQueue.push(resolve))

  const drainQueue = (token: string | null) => {
    refreshQueue.forEach((resolve) => resolve(token))
    refreshQueue = []
  }

  const attemptRefresh = async (): Promise<string | null> => {
    if (!authStore.refreshToken) return null

    try {
      const data = await $fetch<{ accessToken: string; refreshToken: string }>(
        `${config.public.apiBaseUrl}/auth/refresh`,
        {
          method: 'POST',
          body: { refreshToken: authStore.refreshToken },
        },
      )
      authStore.setTokens(data.accessToken, data.refreshToken)
      return data.accessToken
    } catch {
      return null
    }
  }

  const $api = $fetch.create({
    baseURL: config.public.apiBaseUrl,

    onRequest({ options }) {
      if (authStore.accessToken) {
        const headers = (options.headers as Record<string, string>) ?? {}
        headers['Authorization'] = `Bearer ${authStore.accessToken}`
        options.headers = headers
      }
    },

    async onResponseError({ response, options, request }) {
      if (response.status === 401) {
        // Don't retry refresh calls themselves — avoids infinite loops
        const url = typeof request === 'string' ? request : request.toString()
        if (url.includes('/auth/refresh') || url.includes('/auth/login')) {
          authStore.logout()
          await router.push('/auth/login')
          return
        }

        let newToken: string | null

        if (authStore.isRefreshing) {
          // Another request is already refreshing — wait for it
          newToken = await waitForRefresh()
        } else {
          authStore.isRefreshing = true
          newToken = await attemptRefresh()
          authStore.isRefreshing = false
          drainQueue(newToken)
        }

        if (!newToken) {
          authStore.logout()
          await router.push('/auth/login')
          return
        }

        // Retry the original request with the new token
        const headers = (options.headers as Record<string, string>) ?? {}
        headers['Authorization'] = `Bearer ${newToken}`
        await $fetch(request, { ...options, headers })
        return
      }

      if (response.status >= 500) {
        ui.error('Something went wrong. Please try again later.')
      }
    },
  })

  return {
    provide: { api: $api },
  }
})
