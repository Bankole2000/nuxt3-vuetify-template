import { useTheme } from 'vuetify'
import { useLocalStorage } from '@vueuse/core'

export const useAppTheme = () => {
  const vuetifyTheme = useTheme()
  const stored = useLocalStorage<'light' | 'dark'>('app:theme', 'light')

  vuetifyTheme.change(stored.value)

  const theme = computed(() => vuetifyTheme.global.current.value.dark ? 'dark' : 'light')

  const toggleTheme = () => {
    const next = theme.value === 'light' ? 'dark' : 'light'
    vuetifyTheme.change(next)
    stored.value = next
  }

  return { theme, toggleTheme }
}
