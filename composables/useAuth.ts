import { useAuthStore } from '~/stores/auth'

export const useAuth = () => {
  const authStore = useAuthStore()
  const router = useRouter()

  const login = async (email: string, password: string) => {
    const data = await useApiFetch<{ accessToken: string; refreshToken: string; user: { id: string; name: string; email: string } }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    authStore.setTokens(data.accessToken, data.refreshToken)
    authStore.setUser(data.user)
    await router.push('/')
  }

  const register = async (name: string, email: string, password: string) => {
    const data = await useApiFetch<{ accessToken: string; refreshToken: string; user: { id: string; name: string; email: string } }>('/auth/register', {
      method: 'POST',
      body: { name, email, password },
    })
    authStore.setTokens(data.accessToken, data.refreshToken)
    authStore.setUser(data.user)
    await router.push('/')
  }

  const logout = async () => {
    authStore.logout()
    await router.push('/auth/login')
  }

  const forgotPassword = async (email: string) => {
    await useApiFetch('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    })
  }

  const resetPassword = async (token: string, password: string) => {
    await useApiFetch('/auth/reset-password', {
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
