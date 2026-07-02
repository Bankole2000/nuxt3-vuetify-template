/**
 * Register global API response interceptors.
 * Call once in app.vue — handles 401 redirect, 403 toast, 5xx error overlay.
 *
 * Works by hooking into $fetch via a Nuxt plugin pattern exposed as a composable
 * so it can be called from setup context (app.vue).
 */
export const useApiInterceptor = () => {
  const router = useRouter()
  const toast = useToast()
  const { showLoader, hideLoader } = useLoader()
  const authStore = useAuthStore()

  const interceptFetch = (fetchFn: typeof $fetch) => {
    return new Proxy(fetchFn, {
      apply(target, thisArg, args) {
        return Reflect.apply(target, thisArg, args).catch((error: { status?: number; statusCode?: number; message?: string }) => {
          const status = error?.status ?? error?.statusCode

          if (status === 401) {
            authStore.clearTokens()
            router.push(`/auth/login?redirect=${encodeURIComponent(router.currentRoute.value.fullPath)}`)
            toast.warning('Your session has expired. Please log in again.')
          }
          else if (status === 403) {
            toast.error('You don\'t have permission to perform this action.')
          }
          else if (status && status >= 500) {
            toast.error('A server error occurred. Please try again later.')
          }

          throw error
        })
      },
    })
  }

  return { interceptFetch }
}
