import { useAuthStore } from '~/stores/auth'

interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: { id: string; name: string; email: string }
}

export const useAuth = () => {
  const authStore = useAuthStore()
  const router = useRouter()
  const route = useRoute()

  const $api = () => useNuxtApp().$api as typeof $fetch

  const redirectAfterAuth = async () => {
    const redirect = route.query.redirect as string | undefined
    await router.push(redirect && redirect.startsWith('/') ? redirect : '/')
  }

  const login = async (email: string, password: string) => {
    const data = await $api()<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    authStore.setTokens(data.accessToken, data.refreshToken)
    authStore.setUser(data.user)
    await redirectAfterAuth()
  }

  const register = async (name: string, email: string, password: string) => {
    const data = await $api()<AuthResponse>('/auth/register', {
      method: 'POST',
      body: { name, email, password },
    })
    authStore.setTokens(data.accessToken, data.refreshToken)
    authStore.setUser(data.user)
    await redirectAfterAuth()
  }

  const logout = async () => {
    authStore.logout()
    await router.push('/auth/login')
  }

  const forgotPassword = async (email: string) => {
    await $api()('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    })
  }

  const resetPassword = async (token: string, password: string) => {
    await $api()('/auth/reset-password', {
      method: 'POST',
      body: { token, password },
    })
    await router.push('/auth/login')
  }

  return {
    user: computed(() => authStore.currentUser),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
  }
}
