import { defineStore } from 'pinia'

interface User {
  id: string
  name: string
  email: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isRefreshing: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    isRefreshing: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    currentUser: (state) => state.user,
  },

  actions: {
    setTokens(accessToken: string, refreshToken: string) {
      this.accessToken = accessToken
      this.refreshToken = refreshToken
    },

    setUser(user: User) {
      this.user = user
    },

    logout() {
      this.user = null
      this.accessToken = null
      this.refreshToken = null
      this.isRefreshing = false
    },
  },
})
