import { useAuthStore } from '~/stores/auth'

export const useApiFetch = <T>(path: string, options: Parameters<typeof $fetch<T>>[1] = {}) => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const headers: Record<string, string> = {}
  if (authStore.accessToken) {
    headers['Authorization'] = `Bearer ${authStore.accessToken}`
  }

  return $fetch<T>(`${config.public.apiBaseUrl}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers as Record<string, string> ?? {}),
    },
  })
}
