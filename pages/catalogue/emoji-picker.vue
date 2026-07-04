<script setup lang="ts">
definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Emoji Picker', disabled: true },
  ],
})

useSeo({ title: 'Emoji Picker', description: 'Searchable emoji grid with category tabs, recent history, skin-tone selector and reaction-bar demo.' })

const tab = ref('chat')

// ---- Tab 1: Chat Input ----
interface ChatMsg {
  id: number
  author: string
  text: string
  avatar: string
  mine: boolean
  reactions: ReactionData[]
}

interface ReactionData {
  emoji: string
  count: number
  mine: boolean
}

let msgIdCounter = 4
const chatInput = ref('')
const chatMenuOpen = ref(false)
const chatInputEl = ref<HTMLInputElement | null>(null)

const chatMessages = ref<ChatMsg[]>([
  {
    id: 1,
    author: 'Alex',
    text: 'Hey! Just shipped the new feature 🚀',
    avatar: 'A',
    mine: false,
    reactions: [
      { emoji: '🎉', count: 3, mine: false },
      { emoji: '🚀', count: 2, mine: true },
    ],
  },
  {
    id: 2,
    author: 'Sam',
    text: 'Looks great! The UI is really clean.',
    avatar: 'S',
    mine: false,
    reactions: [],
  },
  {
    id: 3,
    author: 'You',
    text: 'Thanks, working on the emoji picker next 😄',
    avatar: 'Y',
    mine: true,
    reactions: [{ emoji: '👍', count: 1, mine: false }],
  },
])

function insertEmojiAtCursor(emoji: string) {
  chatMenuOpen.value = false
  const input = chatInputEl.value
  if (!input) {
    chatInput.value += emoji
    return
  }
  const start = input.selectionStart ?? chatInput.value.length
  const end = input.selectionEnd ?? chatInput.value.length
  chatInput.value = chatInput.value.slice(0, start) + emoji + chatInput.value.slice(end)
  nextTick(() => {
    input.setSelectionRange(start + emoji.length, start + emoji.length)
    input.focus()
  })
}

function sendChatMessage() {
  const text = chatInput.value.trim()
  if (!text) return
  chatMessages.value.push({
    id: ++msgIdCounter,
    author: 'You',
    text,
    avatar: 'Y',
    mine: true,
    reactions: [],
  })
  chatInput.value = ''
}

function toggleChatReaction(msg: ChatMsg, emoji: string) {
  const existing = msg.reactions.find(r => r.emoji === emoji)
  if (existing) {
    if (existing.mine) {
      existing.count--
      existing.mine = false
      if (existing.count === 0) {
        msg.reactions = msg.reactions.filter(r => r.emoji !== emoji)
      }
    } else {
      existing.count++
      existing.mine = true
    }
  } else {
    msg.reactions.push({ emoji, count: 1, mine: true })
  }
}

const chatReactionMenuOpen = ref<number | null>(null)

function addChatReaction(msgId: number, emoji: string) {
  const msg = chatMessages.value.find(m => m.id === msgId)
  if (msg) toggleChatReaction(msg, emoji)
  chatReactionMenuOpen.value = null
}

// ---- Tab 2: Reaction Bar ----
interface PostReaction {
  emoji: string
  count: number
  mine: boolean
}

const postReactions = ref<PostReaction[]>([
  { emoji: '❤️', count: 24, mine: false },
  { emoji: '😂', count: 11, mine: false },
  { emoji: '🔥', count: 8, mine: true },
  { emoji: '👀', count: 3, mine: false },
])

const reactionMenuOpen = ref(false)
const reactionAnimating = ref<string | null>(null)

function togglePostReaction(emoji: string) {
  const r = postReactions.value.find(x => x.emoji === emoji)
  if (r) {
    if (r.mine) {
      r.count--
      r.mine = false
      if (r.count === 0) {
        postReactions.value = postReactions.value.filter(x => x.emoji !== emoji)
      }
    } else {
      r.count++
      r.mine = true
    }
  } else {
    postReactions.value.push({ emoji, count: 1, mine: true })
  }
  reactionAnimating.value = emoji
  setTimeout(() => { reactionAnimating.value = null }, 400)
}

function addPostReaction(emoji: string) {
  reactionMenuOpen.value = false
  togglePostReaction(emoji)
}

// ---- Tab 3: Inline Picker ----
const inlineSelected = ref('😀')

function getCodePoints(emoji: string): string {
  return [...emoji].map(c => {
    const cp = c.codePointAt(0)
    if (cp === undefined) return ''
    return 'U+' + cp.toString(16).toUpperCase().padStart(4, '0')
  }).filter(Boolean).join(' ')
}

// ---- Info modal ----
const infoOpen = ref(false)
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-1 flex-wrap gap-2">
      <h1 class="text-h5 font-weight-bold">Emoji Picker</h1>
      <v-btn
        variant="tonal"
        size="small"
        prepend-icon="mdi-information-outline"
        @click="infoOpen = true"
      >
        Use cases
      </v-btn>
    </div>
    <p class="text-body-2 text-medium-emphasis mb-6">
      Searchable emoji grid with category tabs, recent history, skin-tone selector and reaction-bar demo — no external libraries.
    </p>

    <v-tabs v-model="tab" class="mb-6">
      <v-tab value="chat">Chat Input</v-tab>
      <v-tab value="reaction">Reaction Bar</v-tab>
      <v-tab value="inline">Inline Picker</v-tab>
    </v-tabs>

    <v-tabs-window v-model="tab">

      <!-- ==================== TAB 1: Chat Input ==================== -->
      <v-tabs-window-item value="chat">
        <v-row>
          <v-col cols="12" md="7">
            <v-card rounded="lg" style="overflow: hidden;">
              <!-- Chat thread header -->
              <v-card-item class="border-b pa-3">
                <template #prepend>
                  <v-avatar color="primary" size="36">
                    <span class="text-body-2 font-weight-bold">T</span>
                  </v-avatar>
                </template>
                <v-card-title class="text-body-1 font-weight-bold pa-0">Team Chat</v-card-title>
                <v-card-subtitle class="pa-0">3 members</v-card-subtitle>
              </v-card-item>

              <!-- Messages -->
              <div
                class="pa-4 d-flex flex-column gap-3"
                style="min-height: 320px; max-height: 360px; overflow-y: auto;"
              >
                <div
                  v-for="msg in chatMessages"
                  :key="msg.id"
                  :class="['d-flex gap-2', msg.mine ? 'flex-row-reverse' : 'flex-row']"
                >
                  <v-avatar :color="msg.mine ? 'primary' : 'secondary'" size="32" class="flex-shrink-0 mt-1">
                    <span class="text-caption font-weight-bold">{{ msg.avatar }}</span>
                  </v-avatar>

                  <div :class="['d-flex flex-column', msg.mine ? 'align-end' : 'align-start']" style="max-width: 70%;">
                    <p class="text-caption text-medium-emphasis mb-1">{{ msg.author }}</p>
                    <div
                      :class="[
                        'px-3 py-2 rounded-lg text-body-2',
                        msg.mine ? 'bg-primary text-on-primary' : 'bg-surface-variant'
                      ]"
                    >
                      {{ msg.text }}
                    </div>

                    <!-- Reactions on message -->
                    <div v-if="msg.reactions.length" class="d-flex flex-wrap gap-1 mt-1">
                      <button
                        v-for="r in msg.reactions"
                        :key="r.emoji"
                        type="button"
                        :class="['chat-reaction-chip', r.mine ? 'active' : '']"
                        @click="toggleChatReaction(msg, r.emoji)"
                      >
                        {{ r.emoji }} <span class="text-caption">{{ r.count }}</span>
                      </button>

                      <v-menu
                        :model-value="chatReactionMenuOpen === msg.id"
                        :close-on-content-click="false"
                        location="top start"
                        @update:model-value="(v: boolean) => { chatReactionMenuOpen = v ? msg.id : null }"
                      >
                        <template #activator="{ props: menuProps }">
                          <button v-bind="menuProps" type="button" class="chat-reaction-chip add-btn">
                            <v-icon icon="mdi-plus" size="12" />
                          </button>
                        </template>
                        <CommonEmojiPicker
                          size="small"
                          :show-skin-tones="false"
                          @select="addChatReaction(msg.id, $event)"
                        />
                      </v-menu>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Input bar -->
              <v-divider />
              <div class="d-flex align-center gap-2 pa-3">
                <v-menu
                  v-model="chatMenuOpen"
                  :close-on-content-click="false"
                  location="top start"
                >
                  <template #activator="{ props: menuProps }">
                    <v-btn v-bind="menuProps" icon variant="text" size="small">
                      <v-icon icon="mdi-emoticon-outline" />
                    </v-btn>
                  </template>
                  <CommonEmojiPicker @select="insertEmojiAtCursor" />
                </v-menu>

                <input
                  ref="chatInputEl"
                  v-model="chatInput"
                  class="chat-input flex-grow-1 text-body-2"
                  placeholder="Type a message…"
                  type="text"
                  @keydown.enter.prevent="sendChatMessage"
                />

                <v-btn
                  icon
                  variant="text"
                  size="small"
                  color="primary"
                  :disabled="!chatInput.trim()"
                  @click="sendChatMessage"
                >
                  <v-icon icon="mdi-send" />
                </v-btn>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" md="5">
            <h2 class="text-overline text-medium-emphasis mb-3">What's in this demo</h2>
            <v-card rounded="lg" class="pa-4">
              <v-list density="compact" class="pa-0">
                <v-list-item class="px-0 py-1">
                  <template #prepend>
                    <v-icon icon="mdi-emoticon-outline" size="16" class="mr-2" />
                  </template>
                  <p class="text-body-2">Smiley button opens picker in a <code>v-menu</code></p>
                </v-list-item>
                <v-list-item class="px-0 py-1">
                  <template #prepend>
                    <v-icon icon="mdi-cursor-text" size="16" class="mr-2" />
                  </template>
                  <p class="text-body-2">Emoji inserted at cursor position</p>
                </v-list-item>
                <v-list-item class="px-0 py-1">
                  <template #prepend>
                    <v-icon icon="mdi-heart-outline" size="16" class="mr-2" />
                  </template>
                  <p class="text-body-2">Click reactions to toggle your own</p>
                </v-list-item>
                <v-list-item class="px-0 py-1">
                  <template #prepend>
                    <v-icon icon="mdi-plus-circle-outline" size="16" class="mr-2" />
                  </template>
                  <p class="text-body-2">+ button adds a new reaction from picker</p>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </v-tabs-window-item>

      <!-- ==================== TAB 2: Reaction Bar ==================== -->
      <v-tabs-window-item value="reaction">
        <v-row>
          <v-col cols="12" md="7">
            <v-card rounded="lg" class="pa-5">
              <!-- Mock post -->
              <div class="d-flex gap-3 mb-4">
                <v-avatar color="success" size="40">
                  <span class="text-body-2 font-weight-bold">JD</span>
                </v-avatar>
                <div>
                  <p class="text-body-2 font-weight-bold mb-0">Jordan Davis</p>
                  <p class="text-caption text-medium-emphasis">2 hours ago</p>
                </div>
              </div>

              <p class="text-body-2 mb-4">
                Just finished the Q3 retrospective. Great team effort this sprint — we shipped 12 features and resolved 43 bugs. Really proud of what we built together 🙌
              </p>

              <v-divider class="mb-4" />

              <!-- Reaction bar -->
              <div class="d-flex flex-wrap align-center gap-2">
                <button
                  v-for="r in postReactions"
                  :key="r.emoji"
                  type="button"
                  :class="['post-reaction-btn', r.mine ? 'active' : '', reactionAnimating === r.emoji ? 'pop' : '']"
                  @click="togglePostReaction(r.emoji)"
                >
                  <span class="reaction-emoji">{{ r.emoji }}</span>
                  <span class="reaction-count text-body-2 font-weight-medium">{{ r.count }}</span>
                </button>

                <v-menu
                  v-model="reactionMenuOpen"
                  :close-on-content-click="false"
                  location="bottom start"
                >
                  <template #activator="{ props: menuProps }">
                    <button v-bind="menuProps" type="button" class="post-reaction-btn add-reaction">
                      <v-icon icon="mdi-emoticon-plus-outline" size="20" />
                    </button>
                  </template>
                  <CommonEmojiPicker :show-skin-tones="false" @select="addPostReaction" />
                </v-menu>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" md="5">
            <h2 class="text-overline text-medium-emphasis mb-3">How it works</h2>
            <v-card rounded="lg" class="pa-4">
              <v-list density="compact" class="pa-0">
                <v-list-item class="px-0 py-1">
                  <template #prepend>
                    <v-icon icon="mdi-gesture-tap" size="16" class="mr-2" />
                  </template>
                  <p class="text-body-2">Click a reaction to toggle your vote</p>
                </v-list-item>
                <v-list-item class="px-0 py-1">
                  <template #prepend>
                    <v-icon icon="mdi-counter" size="16" class="mr-2" />
                  </template>
                  <p class="text-body-2">Count animates with a pop effect on change</p>
                </v-list-item>
                <v-list-item class="px-0 py-1">
                  <template #prepend>
                    <v-icon icon="mdi-trash-can-outline" size="16" class="mr-2" />
                  </template>
                  <p class="text-body-2">Reaction removed when count reaches 0</p>
                </v-list-item>
                <v-list-item class="px-0 py-1">
                  <template #prepend>
                    <v-icon icon="mdi-plus" size="16" class="mr-2" />
                  </template>
                  <p class="text-body-2">+ button adds new reaction via picker</p>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </v-tabs-window-item>

      <!-- ==================== TAB 3: Inline Picker ==================== -->
      <v-tabs-window-item value="inline">
        <v-row>
          <v-col cols="12" md="6">
            <h2 class="text-overline text-medium-emphasis mb-3">Inline picker</h2>
            <CommonEmojiPicker
              v-model="inlineSelected"
              size="default"
              :show-search="true"
              :show-skin-tones="true"
            />
          </v-col>

          <v-col cols="12" md="6">
            <h2 class="text-overline text-medium-emphasis mb-3">Selected emoji</h2>
            <v-card rounded="lg" class="pa-6 text-center mb-4">
              <div style="font-size: 72px; line-height: 1; margin-bottom: 12px;">
                {{ inlineSelected }}
              </div>
              <p class="text-body-2 font-weight-medium mb-1">{{ inlineSelected }}</p>
              <p class="text-caption text-medium-emphasis font-monospace">{{ getCodePoints(inlineSelected) }}</p>
            </v-card>

            <h2 class="text-overline text-medium-emphasis mb-3">Props</h2>
            <v-card rounded="lg" class="pa-4">
              <v-sheet rounded="lg" color="surface-variant" class="pa-3">
                <pre v-pre class="text-caption font-monospace" style="overflow-x: auto; white-space: pre-wrap;">&lt;CommonEmojiPicker
  v-model="emoji"
  size="default"       <!-- small | default | large -->
  :show-search="true"
  :show-skin-tones="true"
  :max-recent="16"
  @select="onSelect"
/&gt;</pre>
              </v-sheet>
            </v-card>
          </v-col>
        </v-row>
      </v-tabs-window-item>

    </v-tabs-window>

    <!-- ==================== Info Modal ==================== -->
    <v-dialog v-model="infoOpen" max-width="560">
      <v-card rounded="lg">
        <v-card-title class="pa-5 pb-2 d-flex align-center gap-2">
          <v-icon icon="mdi-emoticon-outline" color="yellow-darken-2" />
          Emoji Picker — Use Cases
        </v-card-title>
        <v-card-text class="pa-5 pt-2">
          <v-list lines="two" class="pa-0">
            <v-list-item class="px-0">
              <template #prepend>
                <v-avatar color="primary" variant="tonal" size="36" rounded="lg" class="mr-3">
                  <v-icon icon="mdi-chat-outline" size="18" />
                </v-avatar>
              </template>
              <p class="text-body-2 font-weight-bold mb-0">Chat & Messaging</p>
              <p class="text-caption text-medium-emphasis">Insert emoji in message text at cursor position. Reaction bar under messages.</p>
            </v-list-item>
            <v-list-item class="px-0">
              <template #prepend>
                <v-avatar color="success" variant="tonal" size="36" rounded="lg" class="mr-3">
                  <v-icon icon="mdi-briefcase-outline" size="18" />
                </v-avatar>
              </template>
              <p class="text-body-2 font-weight-bold mb-0">Portfolio Manager — Task Comments (#1)</p>
              <p class="text-caption text-medium-emphasis">Add emoji reactions to task comments; express sentiment without extra text.</p>
            </v-list-item>
            <v-list-item class="px-0">
              <template #prepend>
                <v-avatar color="warning" variant="tonal" size="36" rounded="lg" class="mr-3">
                  <v-icon icon="mdi-vector-polyline" size="18" />
                </v-avatar>
              </template>
              <p class="text-body-2 font-weight-bold mb-0">Workflow Engine — Step Annotations (#3)</p>
              <p class="text-caption text-medium-emphasis">Label workflow steps or nodes with an emoji for quick visual scanning.</p>
            </v-list-item>
            <v-list-item class="px-0">
              <template #prepend>
                <v-avatar color="secondary" variant="tonal" size="36" rounded="lg" class="mr-3">
                  <v-icon icon="mdi-emoticon-happy-outline" size="18" />
                </v-avatar>
              </template>
              <p class="text-body-2 font-weight-bold mb-0">Any app with comments or reactions</p>
              <p class="text-caption text-medium-emphasis">Social feeds, code reviews, document comments, survey responses, product ratings.</p>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="tonal" @click="infoOpen = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.chat-input {
  border: none;
  outline: none;
  background: transparent;
  color: inherit;
  font-family: inherit;
  padding: 4px 0;
}

.chat-reaction-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 7px;
  border-radius: 20px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgba(var(--v-border-color), 0.06);
  cursor: pointer;
  font-size: 13px;
  transition: background 0.15s, border-color 0.15s;
  line-height: 1.5;
}
.chat-reaction-chip:hover {
  background: rgba(var(--v-theme-primary), 0.1);
  border-color: rgba(var(--v-theme-primary), 0.3);
}
.chat-reaction-chip.active {
  background: rgba(var(--v-theme-primary), 0.15);
  border-color: rgba(var(--v-theme-primary), 0.5);
}
.chat-reaction-chip.add-btn {
  padding: 2px 6px;
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.6;
}
.chat-reaction-chip.add-btn:hover {
  opacity: 1;
}

.post-reaction-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  border: 1.5px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgba(var(--v-border-color), 0.06);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, transform 0.15s;
  font-size: 14px;
  line-height: 1;
}
.post-reaction-btn:hover {
  background: rgba(var(--v-theme-primary), 0.08);
  border-color: rgba(var(--v-theme-primary), 0.3);
}
.post-reaction-btn.active {
  background: rgba(var(--v-theme-primary), 0.15);
  border-color: rgba(var(--v-theme-primary), 0.5);
}
.post-reaction-btn.add-reaction {
  padding: 6px 10px;
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.7;
}
.post-reaction-btn.add-reaction:hover {
  opacity: 1;
}
.post-reaction-btn.pop {
  animation: reactionPop 0.4s ease-out;
}

.reaction-emoji {
  font-size: 18px;
}
.reaction-count {
  min-width: 14px;
  text-align: center;
}

@keyframes reactionPop {
  0% { transform: scale(1); }
  40% { transform: scale(1.3); }
  100% { transform: scale(1); }
}
</style>
