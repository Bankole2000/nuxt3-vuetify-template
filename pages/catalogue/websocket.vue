<script setup lang="ts">
definePageMeta({ layout: 'catalogue' })

const toast = useToast()
const { status, on, emit: socketEmit, connect, disconnect } = useSocket()

interface ChatMessage { user: string; text: string; ts: number }
interface Notification { title: string; body: string; type: 'success' | 'error' | 'warning' | 'info' }

const messages = ref<ChatMessage[]>([])
const messageText = ref('')
const username = ref('You')

const statusConfig = computed(() => ({
  connected:    { color: 'success', icon: 'mdi-wifi', label: 'Connected' },
  connecting:   { color: 'warning', icon: 'mdi-wifi-sync', label: 'Connecting…' },
  disconnected: { color: 'error',   icon: 'mdi-wifi-off', label: 'Disconnected' },
  error:        { color: 'error',   icon: 'mdi-wifi-alert', label: 'Connection error' },
}[status.value]))

// Listen for incoming chat messages from the server
on<ChatMessage>('chat:message', (msg) => {
  messages.value.push(msg)
})

// Live notification example — server pushes a notification event
on<Notification>('notification', (n) => {
  toast[n.type](`${n.title}: ${n.body}`)
})

const sendMessage = () => {
  if (!messageText.value.trim()) return
  const msg: ChatMessage = { user: username.value, text: messageText.value.trim(), ts: Date.now() }
  socketEmit('chat:message', msg)
  messages.value.push(msg) // optimistic
  messageText.value = ''
}

// Simulate a server-pushed notification for demo purposes
const simulateNotification = () => {
  const types = ['success', 'info', 'warning', 'error'] as const
  const type = types[Math.floor(Math.random() * types.length)]
  toast[type](`Server event: sample ${type} notification`)
}

const formatTime = (ts: number) =>
  new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">WebSocket</h1>
    <p class="text-body-2 text-medium-emphasis mb-8">
      <code>socket.io-client</code> wrapped in <code>useSocket()</code> — connection management, typed events, auto-reconnect.
    </p>

    <!-- Connection status -->
    <h2 class="text-overline text-medium-emphasis mb-4">Connection</h2>
    <v-card rounded="lg" class="mb-6 pa-5">
      <div class="d-flex align-center justify-space-between flex-wrap gap-4">
        <div class="d-flex align-center gap-3">
          <v-icon :icon="statusConfig.icon" :color="statusConfig.color" size="28" />
          <div>
            <p class="text-body-1 font-weight-bold">{{ statusConfig.label }}</p>
            <p class="text-caption text-medium-emphasis">{{ $config.public.wsUrl }}</p>
          </div>
          <v-chip :color="statusConfig.color" variant="tonal" size="small">{{ status }}</v-chip>
        </div>
        <div class="d-flex gap-2">
          <v-btn
            color="success"
            variant="tonal"
            prepend-icon="mdi-wifi"
            :disabled="status === 'connected' || status === 'connecting'"
            @click="connect"
          >
            Connect
          </v-btn>
          <v-btn
            color="error"
            variant="tonal"
            prepend-icon="mdi-wifi-off"
            :disabled="status === 'disconnected'"
            @click="disconnect"
          >
            Disconnect
          </v-btn>
        </div>
      </div>

      <v-alert
        v-if="status !== 'connected'"
        type="info"
        variant="tonal"
        density="compact"
        class="mt-4"
        text="Connect to a Socket.IO server to use the chat and events below. Set NUXT_PUBLIC_WS_URL in your .env to point to your server."
      />
    </v-card>

    <!-- Live notifications -->
    <h2 class="text-overline text-medium-emphasis mb-4">Live notifications</h2>
    <v-card rounded="lg" class="mb-6 pa-5">
      <p class="text-body-2 text-medium-emphasis mb-4">
        The server emits a <code>notification</code> event — the client listens and forwards it to <code>useToast()</code>.
        Use the button below to simulate one locally.
      </p>
      <v-btn color="primary" variant="tonal" prepend-icon="mdi-bell-ring-outline" @click="simulateNotification">
        Simulate server notification
      </v-btn>
    </v-card>

    <!-- Chat demo -->
    <h2 class="text-overline text-medium-emphasis mb-4">Event emit & receive — chat example</h2>
    <v-card rounded="lg">
      <v-card-text class="pa-4 pb-2">
        <v-text-field
          v-model="username"
          label="Your name"
          variant="outlined"
          density="compact"
          hide-details
          style="max-width: 220px;"
          class="mb-3"
        />
      </v-card-text>

      <v-divider />

      <div style="height: 280px; overflow-y: auto;" class="pa-4">
        <div v-if="!messages.length" class="text-center text-medium-emphasis text-body-2 py-8">
          No messages yet. Connect and send one.
        </div>
        <div
          v-for="(msg, i) in messages"
          :key="i"
          class="d-flex gap-2 mb-3"
          :class="msg.user === username ? 'flex-row-reverse' : ''"
        >
          <v-avatar color="primary" variant="tonal" size="32">
            <span class="text-caption font-weight-bold">{{ msg.user.charAt(0).toUpperCase() }}</span>
          </v-avatar>
          <div :class="msg.user === username ? 'text-right' : ''">
            <v-sheet
              :color="msg.user === username ? 'primary' : 'surface-variant'"
              rounded="lg"
              class="pa-3 d-inline-block"
              style="max-width: 320px;"
            >
              <p class="text-body-2">{{ msg.text }}</p>
            </v-sheet>
            <p class="text-caption text-medium-emphasis mt-1">{{ msg.user }} · {{ formatTime(msg.ts) }}</p>
          </div>
        </div>
      </div>

      <v-divider />

      <v-card-actions class="pa-3">
        <v-text-field
          v-model="messageText"
          placeholder="Type a message…"
          variant="outlined"
          density="compact"
          hide-details
          :disabled="status !== 'connected'"
          @keydown.enter="sendMessage"
        />
        <v-btn
          icon="mdi-send"
          color="primary"
          variant="tonal"
          class="ml-2"
          :disabled="status !== 'connected' || !messageText.trim()"
          @click="sendMessage"
        />
      </v-card-actions>
    </v-card>
  </div>
</template>
