import type { Socket } from 'socket.io-client'

export type SocketStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export const useSocket = () => {
  const { $socket } = useNuxtApp() as { $socket: Socket }

  const status = ref<SocketStatus>(
    $socket.connected ? 'connected' : 'disconnected',
  )

  const on = <T = unknown>(event: string, handler: (data: T) => void) => {
    $socket.on(event, handler)
    onUnmounted(() => $socket.off(event, handler))
  }

  const emit = <T = unknown>(event: string, data?: T) => {
    $socket.emit(event, data)
  }

  const connect = () => {
    if (!$socket.connected) $socket.connect()
  }

  const disconnect = () => {
    $socket.disconnect()
  }

  // Sync status from socket events
  const onConnect = () => (status.value = 'connected')
  const onDisconnect = () => (status.value = 'disconnected')
  const onConnectError = () => (status.value = 'error')
  const onReconnectAttempt = () => (status.value = 'connecting')

  $socket.on('connect', onConnect)
  $socket.on('disconnect', onDisconnect)
  $socket.on('connect_error', onConnectError)
  $socket.io.on('reconnect_attempt', onReconnectAttempt)
  $socket.io.on('reconnect', onConnect)

  onUnmounted(() => {
    $socket.off('connect', onConnect)
    $socket.off('disconnect', onDisconnect)
    $socket.off('connect_error', onConnectError)
    $socket.io.off('reconnect_attempt', onReconnectAttempt)
    $socket.io.off('reconnect', onConnect)
  })

  return { status, on, emit, connect, disconnect, socket: $socket }
}
