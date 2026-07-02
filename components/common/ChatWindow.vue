<script setup lang="ts">
export interface ChatMessage {
  id: string
  text: string
  sender: 'me' | 'other'
  username?: string
  avatar?: string
  timestamp: Date
  status?: 'sending' | 'sent' | 'read'
}

const props = withDefaults(defineProps<{
  modelValue: ChatMessage[]
  currentUser?: string
  recipientName?: string
  recipientAvatar?: string
  isTyping?: boolean
  loading?: boolean
}>(), {
  currentUser: 'You',
  recipientName: 'Them',
  isTyping: false,
  loading: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', messages: ChatMessage[]): void
  (e: 'send', text: string): void
}>()

const draft = ref('')
const listRef = ref<HTMLElement | null>(null)

const fmt = (d: Date) =>
  d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

const send = () => {
  const text = draft.value.trim()
  if (!text) return
  emit('send', text)
  draft.value = ''
}

const scrollToBottom = () => {
  nextTick(() => {
    if (listRef.value) listRef.value.scrollTop = listRef.value.scrollHeight
  })
}

watch(() => props.modelValue.length, scrollToBottom)
watch(() => props.isTyping, scrollToBottom)
onMounted(scrollToBottom)
</script>

<template>
  <v-card rounded="xl" border elevation="0" class="d-flex flex-column" style="height: 520px;">
    <!-- Header -->
    <v-card-title class="pa-4 d-flex align-center gap-3" style="border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));">
      <v-avatar size="36" color="primary" variant="tonal" :image="recipientAvatar">
        <span v-if="!recipientAvatar" class="text-body-2 font-weight-bold">
          {{ recipientName.charAt(0).toUpperCase() }}
        </span>
      </v-avatar>
      <div class="flex-1">
        <p class="text-body-2 font-weight-bold mb-0">{{ recipientName }}</p>
        <p class="text-caption text-success mb-0" style="font-size: 11px;">Online</p>
      </div>
      <v-btn icon="mdi-dots-vertical" variant="text" size="small" />
    </v-card-title>

    <!-- Messages -->
    <div
      ref="listRef"
      class="flex-1 overflow-y-auto pa-4 d-flex flex-column gap-3"
    >
      <v-progress-circular v-if="loading" indeterminate size="32" class="ma-auto" />

      <template v-for="msg in modelValue" :key="msg.id">
        <div
          class="d-flex gap-2"
          :class="msg.sender === 'me' ? 'flex-row-reverse' : 'flex-row'"
        >
          <!-- Avatar (other only) -->
          <v-avatar
            v-if="msg.sender === 'other'"
            size="28"
            color="secondary"
            variant="tonal"
            :image="msg.avatar"
            class="flex-shrink-0 mt-1"
          >
            <span v-if="!msg.avatar" style="font-size: 11px;">
              {{ (msg.username ?? recipientName).charAt(0).toUpperCase() }}
            </span>
          </v-avatar>

          <div
            class="d-flex flex-column"
            :class="msg.sender === 'me' ? 'align-end' : 'align-start'"
            style="max-width: 72%;"
          >
            <div
              class="px-3 py-2 rounded-xl text-body-2"
              :class="msg.sender === 'me'
                ? 'bg-primary text-white'
                : 'bg-surface-variant'"
              :style="msg.sender === 'me'
                ? 'border-bottom-right-radius: 4px !important;'
                : 'border-bottom-left-radius: 4px !important;'"
            >
              {{ msg.text }}
            </div>
            <div class="d-flex align-center gap-1 mt-1 px-1">
              <span class="text-caption text-disabled">{{ fmt(msg.timestamp) }}</span>
              <v-icon
                v-if="msg.sender === 'me' && msg.status"
                :icon="msg.status === 'read' ? 'mdi-check-all' : msg.status === 'sent' ? 'mdi-check' : 'mdi-clock-outline'"
                :color="msg.status === 'read' ? 'primary' : 'disabled'"
                size="12"
              />
            </div>
          </div>
        </div>
      </template>

      <!-- Typing indicator -->
      <div v-if="isTyping" class="d-flex align-center gap-2">
        <v-avatar size="28" color="secondary" variant="tonal" class="flex-shrink-0">
          <span style="font-size: 11px;">{{ recipientName.charAt(0).toUpperCase() }}</span>
        </v-avatar>
        <div class="typing-bubble px-3 py-2 rounded-xl bg-surface-variant d-flex align-center gap-1">
          <span class="typing-dot" />
          <span class="typing-dot" />
          <span class="typing-dot" />
        </div>
      </div>
    </div>

    <!-- Input -->
    <div class="pa-3" style="border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));">
      <div class="d-flex align-center gap-2">
        <v-btn icon="mdi-paperclip" variant="text" size="small" />
        <v-text-field
          v-model="draft"
          placeholder="Type a message…"
          variant="solo-filled"
          density="compact"
          hide-details
          rounded="xl"
          flat
          class="flex-1"
          @keydown.enter.exact.prevent="send"
        />
        <v-btn
          icon="mdi-send"
          :color="draft.trim() ? 'primary' : 'default'"
          :variant="draft.trim() ? 'tonal' : 'text'"
          size="small"
          :disabled="!draft.trim()"
          @click="send"
        />
      </div>
    </div>
  </v-card>
</template>

<style scoped>
.typing-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: rgb(var(--v-theme-on-surface));
  opacity: 0.4;
  animation: typing-bounce 1.2s infinite ease-in-out;
}
.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing-bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
  40% { transform: translateY(-5px); opacity: 1; }
}
</style>
