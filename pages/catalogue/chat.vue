<script setup lang="ts">
import type { ChatMessage } from '~/components/common/ChatWindow.vue'

definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Chat', disabled: true },
  ],
})

let msgId = 10
const mkId = () => `msg-${++msgId}`

const messages = ref<ChatMessage[]>([
  { id: 'msg-1', sender: 'other', text: 'Hey! How\'s the template coming along?', timestamp: new Date(Date.now() - 8 * 60000), status: 'read' },
  { id: 'msg-2', sender: 'me', text: 'Really well! Just added a Kanban board and image gallery.', timestamp: new Date(Date.now() - 7 * 60000), status: 'read' },
  { id: 'msg-3', sender: 'other', text: 'Nice! What\'s next?', timestamp: new Date(Date.now() - 6 * 60000), status: 'read' },
  { id: 'msg-4', sender: 'me', text: 'Chat UI, PDF viewer, QR codes and a pricing table.', timestamp: new Date(Date.now() - 5 * 60000), status: 'read' },
  { id: 'msg-5', sender: 'other', text: 'This is shaping up to be a pretty complete template 🔥', timestamp: new Date(Date.now() - 2 * 60000), status: 'read' },
])

const isTyping = ref(false)

const botReplies = [
  'Sounds great!',
  'Let me think about that…',
  'Interesting point!',
  'I agree completely.',
  'Can you tell me more?',
  'That makes sense.',
  '👍',
  'On it!',
]

const onSend = (text: string) => {
  messages.value.push({
    id: mkId(),
    sender: 'me',
    text,
    timestamp: new Date(),
    status: 'sent',
  })

  // Simulate reply
  isTyping.value = true
  setTimeout(() => {
    isTyping.value = false
    messages.value.push({
      id: mkId(),
      sender: 'other',
      text: botReplies[Math.floor(Math.random() * botReplies.length)],
      timestamp: new Date(),
    })
    // Mark sent as read
    messages.value = messages.value.map(m =>
      m.sender === 'me' ? { ...m, status: 'read' } : m,
    )
  }, 1200 + Math.random() * 800)
}
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">Chat / Messaging</h1>
    <p class="text-body-2 text-medium-emphasis mb-8">
      Message bubbles, typing indicator, read receipts and avatar headers.
      Wire to <code>useSocket</code> for real-time messaging — see the WebSocket catalogue page.
    </p>

    <v-row>
      <v-col cols="12" md="7">
        <CommonChatWindow
          v-model="messages"
          current-user="You"
          recipient-name="Alex"
          :is-typing="isTyping"
          @send="onSend"
        />
      </v-col>
      <v-col cols="12" md="5">
        <h2 class="text-overline text-medium-emphasis mb-4">Usage</h2>
        <v-card rounded="lg" class="pa-5 mb-4">
          <v-sheet rounded="lg" color="surface-variant" class="pa-4">
            <pre v-pre class="text-body-2"><code>&lt;CommonChatWindow
  v-model="messages"
  current-user="Alice"
  recipient-name="Bob"
  :is-typing="isTyping"
  @send="onSend"
/&gt;

// Message shape:
// {
//   id: string
//   sender: 'me' | 'other'
//   text: string
//   timestamp: Date
//   status?: 'sending' | 'sent' | 'read'
//   username?: string
//   avatar?: string
// }</code></pre>
          </v-sheet>
        </v-card>
        <v-alert type="info" variant="tonal" density="compact" rounded="lg">
          Pair with <code>useSocket</code> for real-time. The bot in this demo simulates a reply with a random delay and a typing indicator.
        </v-alert>
      </v-col>
    </v-row>
  </div>
</template>
