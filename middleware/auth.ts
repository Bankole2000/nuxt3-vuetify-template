// import { useAuthStore } from '~/stores/auth'

// To enable auth protection, uncomment this middleware body and add
// `definePageMeta({ middleware: 'auth' })` to any page you want to protect.
export default defineNuxtRouteMiddleware((_to) => {
  // const authStore = useAuthStore()
  // if (!authStore.isAuthenticated) {
  //   return navigateTo(`/auth/login?redirect=${encodeURIComponent(_to.fullPath)}`)
  // }
})
