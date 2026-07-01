import { io } from 'socket.io-client'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const socket = io(config.public.wsUrl as string, {
    autoConnect: false, // connect explicitly via useSocket().connect()
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  })

  return {
    provide: { socket },
  }
})
