export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: Date
  read: boolean
}

const notifications = ref<AppNotification[]>([])

export const useNotifications = () => {
  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

  const add = (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    notifications.value.unshift({
      ...n,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false,
    })
  }

  const markRead = (id: string) => {
    const n = notifications.value.find(n => n.id === id)
    if (n) n.read = true
  }

  const markAllRead = () => {
    notifications.value.forEach(n => { n.read = true })
  }

  const remove = (id: string) => {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  const clear = () => { notifications.value = [] }

  return { notifications, unreadCount, add, markRead, markAllRead, remove, clear }
}
