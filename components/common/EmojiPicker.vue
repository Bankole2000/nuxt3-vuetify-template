<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue?: string
  showSearch?: boolean
  showSkinTones?: boolean
  maxRecent?: number
  size?: 'small' | 'default' | 'large'
}>(), {
  modelValue: undefined,
  showSearch: true,
  showSkinTones: true,
  maxRecent: 16,
  size: 'default',
})

const emit = defineEmits<{
  'update:modelValue': [emoji: string]
  'select': [emoji: string]
}>()

interface EmojiEntry {
  emoji: string
  skinnable?: boolean
}

interface Category {
  id: string
  label: string
  icon: string
  emojis: EmojiEntry[]
}

const CATEGORIES: Category[] = [
  {
    id: 'smileys',
    label: 'Smileys',
    icon: '😀',
    emojis: [
      { emoji: '😀' }, { emoji: '😃' }, { emoji: '😄' }, { emoji: '😁' }, { emoji: '😆' },
      { emoji: '😅' }, { emoji: '🤣' }, { emoji: '😂' }, { emoji: '🙂' }, { emoji: '🙃' },
      { emoji: '😉' }, { emoji: '😊' }, { emoji: '😇' }, { emoji: '🥰' }, { emoji: '😍' },
      { emoji: '🤩' }, { emoji: '😘' }, { emoji: '😗' }, { emoji: '😚' }, { emoji: '😙' },
      { emoji: '🥲' }, { emoji: '😋' }, { emoji: '😛' }, { emoji: '😜' }, { emoji: '🤪' },
      { emoji: '😝' }, { emoji: '🤑' }, { emoji: '🤗' }, { emoji: '🤭' }, { emoji: '🤫' },
      { emoji: '🤔' }, { emoji: '🤐' }, { emoji: '🤨' }, { emoji: '😐' }, { emoji: '😑' },
      { emoji: '😶' }, { emoji: '😏' }, { emoji: '😒' }, { emoji: '🙄' }, { emoji: '😬' },
      { emoji: '🤥' }, { emoji: '😌' }, { emoji: '😔' }, { emoji: '😪' }, { emoji: '🤤' },
      { emoji: '😴' }, { emoji: '😷' }, { emoji: '🤒' }, { emoji: '🤕' }, { emoji: '🤢' },
      { emoji: '🤧' }, { emoji: '🥵' }, { emoji: '🥶' }, { emoji: '🥴' }, { emoji: '😵' },
      { emoji: '🤯' }, { emoji: '😎' }, { emoji: '🥸' }, { emoji: '🤓' }, { emoji: '🧐' },
    ],
  },
  {
    id: 'people',
    label: 'People',
    icon: '👋',
    emojis: [
      { emoji: '👋', skinnable: true }, { emoji: '🤚', skinnable: true }, { emoji: '🖐️', skinnable: true },
      { emoji: '✋', skinnable: true }, { emoji: '🖖', skinnable: true }, { emoji: '👌', skinnable: true },
      { emoji: '🤌', skinnable: true }, { emoji: '🤏', skinnable: true }, { emoji: '✌️', skinnable: true },
      { emoji: '🤞', skinnable: true }, { emoji: '🤟', skinnable: true }, { emoji: '🤘', skinnable: true },
      { emoji: '🤙', skinnable: true }, { emoji: '👈', skinnable: true }, { emoji: '👉', skinnable: true },
      { emoji: '👆', skinnable: true }, { emoji: '🖕', skinnable: true }, { emoji: '👇', skinnable: true },
      { emoji: '☝️', skinnable: true }, { emoji: '👍', skinnable: true }, { emoji: '👎', skinnable: true },
      { emoji: '✊', skinnable: true }, { emoji: '👊', skinnable: true }, { emoji: '🤛', skinnable: true },
      { emoji: '🤜', skinnable: true }, { emoji: '👏', skinnable: true }, { emoji: '🙌', skinnable: true },
      { emoji: '👐', skinnable: true }, { emoji: '🤲', skinnable: true }, { emoji: '🤝', skinnable: true },
      { emoji: '🙏', skinnable: true }, { emoji: '✍️', skinnable: true }, { emoji: '💪', skinnable: true },
      { emoji: '🦾' }, { emoji: '🦿' }, { emoji: '🦵', skinnable: true }, { emoji: '🦶', skinnable: true },
      { emoji: '👂', skinnable: true }, { emoji: '🦻', skinnable: true }, { emoji: '👃', skinnable: true },
      { emoji: '👤' }, { emoji: '👥' }, { emoji: '🫂' }, { emoji: '💆', skinnable: true }, { emoji: '💇', skinnable: true },
    ],
  },
  {
    id: 'nature',
    label: 'Nature',
    icon: '🐶',
    emojis: [
      { emoji: '🐶' }, { emoji: '🐱' }, { emoji: '🐭' }, { emoji: '🐹' }, { emoji: '🐰' },
      { emoji: '🦊' }, { emoji: '🐻' }, { emoji: '🐼' }, { emoji: '🐨' }, { emoji: '🐯' },
      { emoji: '🦁' }, { emoji: '🐮' }, { emoji: '🐷' }, { emoji: '🐸' }, { emoji: '🐵' },
      { emoji: '🙈' }, { emoji: '🙉' }, { emoji: '🙊' }, { emoji: '🐔' }, { emoji: '🐧' },
      { emoji: '🐦' }, { emoji: '🐤' }, { emoji: '🦆' }, { emoji: '🦅' }, { emoji: '🦉' },
      { emoji: '🦇' }, { emoji: '🐺' }, { emoji: '🐗' }, { emoji: '🐴' }, { emoji: '🦄' },
      { emoji: '🐝' }, { emoji: '🐛' }, { emoji: '🦋' }, { emoji: '🐌' }, { emoji: '🐞' },
      { emoji: '🐜' }, { emoji: '🦟' }, { emoji: '🦗' }, { emoji: '🦂' }, { emoji: '🐢' },
      { emoji: '🐍' }, { emoji: '🦎' }, { emoji: '🦖' }, { emoji: '🦕' }, { emoji: '🐙' },
      { emoji: '🦑' }, { emoji: '🦐' }, { emoji: '🦞' }, { emoji: '🦀' }, { emoji: '🐡' },
      { emoji: '🌸' }, { emoji: '🌺' }, { emoji: '🌻' }, { emoji: '🌹' }, { emoji: '🌿' },
    ],
  },
  {
    id: 'food',
    label: 'Food',
    icon: '🍎',
    emojis: [
      { emoji: '🍎' }, { emoji: '🍊' }, { emoji: '🍋' }, { emoji: '🍇' }, { emoji: '🍓' },
      { emoji: '🫐' }, { emoji: '🍈' }, { emoji: '🍒' }, { emoji: '🍑' }, { emoji: '🥭' },
      { emoji: '🍍' }, { emoji: '🥥' }, { emoji: '🥝' }, { emoji: '🍅' }, { emoji: '🍆' },
      { emoji: '🥑' }, { emoji: '🥦' }, { emoji: '🥬' }, { emoji: '🥒' }, { emoji: '🌶️' },
      { emoji: '🫑' }, { emoji: '🧄' }, { emoji: '🧅' }, { emoji: '🥔' }, { emoji: '🍠' },
      { emoji: '🥐' }, { emoji: '🥖' }, { emoji: '🍞' }, { emoji: '🥨' }, { emoji: '🥯' },
      { emoji: '🧀' }, { emoji: '🥚' }, { emoji: '🍳' }, { emoji: '🥞' }, { emoji: '🧇' },
      { emoji: '🥓' }, { emoji: '🥩' }, { emoji: '🍗' }, { emoji: '🍖' }, { emoji: '🌭' },
      { emoji: '🍔' }, { emoji: '🍟' }, { emoji: '🍕' }, { emoji: '🥪' }, { emoji: '🥙' },
      { emoji: '🧆' }, { emoji: '🌮' }, { emoji: '🌯' }, { emoji: '🫔' }, { emoji: '🥗' },
      { emoji: '🍜' }, { emoji: '🍱' }, { emoji: '🍣' }, { emoji: '🍦' }, { emoji: '🎂' },
    ],
  },
  {
    id: 'activities',
    label: 'Activities',
    icon: '⚽',
    emojis: [
      { emoji: '⚽' }, { emoji: '🏀' }, { emoji: '🏈' }, { emoji: '⚾' }, { emoji: '🎾' },
      { emoji: '🏐' }, { emoji: '🏉' }, { emoji: '🎱' }, { emoji: '🥏' }, { emoji: '🎳' },
      { emoji: '🏓' }, { emoji: '🏸' }, { emoji: '🥊' }, { emoji: '🥋' }, { emoji: '🎽' },
      { emoji: '🛹' }, { emoji: '🛷' }, { emoji: '⛸️' }, { emoji: '🥌' }, { emoji: '🎿' },
      { emoji: '⛷️' }, { emoji: '🏂' }, { emoji: '🪂' }, { emoji: '🏋️' }, { emoji: '⛹️' },
      { emoji: '🤸' }, { emoji: '🤺' }, { emoji: '🏇' }, { emoji: '🧘' }, { emoji: '🏄' },
      { emoji: '🏊' }, { emoji: '🤽' }, { emoji: '🚣' }, { emoji: '🧗' }, { emoji: '🚵' },
      { emoji: '🚴' }, { emoji: '🏆' }, { emoji: '🥇' }, { emoji: '🥈' }, { emoji: '🥉' },
      { emoji: '🏅' }, { emoji: '🎖️' }, { emoji: '🎗️' }, { emoji: '🎫' }, { emoji: '🎟️' },
      { emoji: '🎪' }, { emoji: '🎭' }, { emoji: '🎨' }, { emoji: '🎬' }, { emoji: '🎤' },
    ],
  },
  {
    id: 'travel',
    label: 'Travel',
    icon: '✈️',
    emojis: [
      { emoji: '🚗' }, { emoji: '🚕' }, { emoji: '🚙' }, { emoji: '🚌' }, { emoji: '🚎' },
      { emoji: '🏎️' }, { emoji: '🚓' }, { emoji: '🚑' }, { emoji: '🚒' }, { emoji: '🚐' },
      { emoji: '🚚' }, { emoji: '🚛' }, { emoji: '🚜' }, { emoji: '🛻' }, { emoji: '🚲' },
      { emoji: '🛵' }, { emoji: '🏍️' }, { emoji: '🚨' }, { emoji: '🚔' }, { emoji: '🚍' },
      { emoji: '🚘' }, { emoji: '🚖' }, { emoji: '✈️' }, { emoji: '🛫' }, { emoji: '🛬' },
      { emoji: '🛩️' }, { emoji: '🚀' }, { emoji: '🛸' }, { emoji: '🚁' }, { emoji: '🛶' },
      { emoji: '⛵' }, { emoji: '🚤' }, { emoji: '🛥️' }, { emoji: '🛳️' }, { emoji: '⛴️' },
      { emoji: '🚂' }, { emoji: '🚃' }, { emoji: '🚄' }, { emoji: '🚅' }, { emoji: '🚆' },
      { emoji: '🚇' }, { emoji: '🚈' }, { emoji: '🚉' }, { emoji: '🚊' }, { emoji: '🚝' },
      { emoji: '🚞' }, { emoji: '🗺️' }, { emoji: '🏔️' }, { emoji: '⛰️' }, { emoji: '🌋' },
    ],
  },
  {
    id: 'objects',
    label: 'Objects',
    icon: '📱',
    emojis: [
      { emoji: '📱' }, { emoji: '💻' }, { emoji: '⌨️' }, { emoji: '🖥️' }, { emoji: '🖨️' },
      { emoji: '🖱️' }, { emoji: '🕹️' }, { emoji: '💾' }, { emoji: '💿' }, { emoji: '📀' },
      { emoji: '📷' }, { emoji: '📸' }, { emoji: '📹' }, { emoji: '🎥' }, { emoji: '📽️' },
      { emoji: '🎞️' }, { emoji: '📞' }, { emoji: '☎️' }, { emoji: '📟' }, { emoji: '📠' },
      { emoji: '📺' }, { emoji: '📻' }, { emoji: '🎙️' }, { emoji: '🎚️' }, { emoji: '🎛️' },
      { emoji: '⏱️' }, { emoji: '⏲️' }, { emoji: '⏰' }, { emoji: '🕰️' }, { emoji: '⏳' },
      { emoji: '📡' }, { emoji: '🔋' }, { emoji: '🔌' }, { emoji: '💡' }, { emoji: '🔦' },
      { emoji: '🕯️' }, { emoji: '🪔' }, { emoji: '🗑️' }, { emoji: '💰' }, { emoji: '💵' },
      { emoji: '💴' }, { emoji: '💷' }, { emoji: '💸' }, { emoji: '💳' }, { emoji: '🧾' },
      { emoji: '🔑' }, { emoji: '🗝️' }, { emoji: '🔐' }, { emoji: '🔒' }, { emoji: '🔓' },
    ],
  },
  {
    id: 'symbols',
    label: 'Symbols',
    icon: '❤️',
    emojis: [
      { emoji: '❤️' }, { emoji: '🧡' }, { emoji: '💛' }, { emoji: '💚' }, { emoji: '💙' },
      { emoji: '💜' }, { emoji: '🖤' }, { emoji: '🤍' }, { emoji: '🤎' }, { emoji: '💔' },
      { emoji: '❤️‍🔥' }, { emoji: '❤️‍🩹' }, { emoji: '💕' }, { emoji: '💞' }, { emoji: '💓' },
      { emoji: '💗' }, { emoji: '💖' }, { emoji: '💘' }, { emoji: '💝' }, { emoji: '💟' },
      { emoji: '☮️' }, { emoji: '✝️' }, { emoji: '☪️' }, { emoji: '🕉️' }, { emoji: '✡️' },
      { emoji: '🔯' }, { emoji: '🕎' }, { emoji: '☯️' }, { emoji: '☦️' }, { emoji: '🛐' },
      { emoji: '⛎' }, { emoji: '♈' }, { emoji: '♉' }, { emoji: '♊' }, { emoji: '♋' },
      { emoji: '♌' }, { emoji: '♍' }, { emoji: '♎' }, { emoji: '♏' }, { emoji: '♐' },
      { emoji: '♑' }, { emoji: '♒' }, { emoji: '♓' }, { emoji: '⛔' }, { emoji: '🚫' },
      { emoji: '❌' }, { emoji: '⭕' }, { emoji: '🔞' }, { emoji: '📵' }, { emoji: '✅' },
      { emoji: '☑️' }, { emoji: '🔴' }, { emoji: '🟠' }, { emoji: '🟡' }, { emoji: '🟢' },
    ],
  },
]

const SKIN_TONES = ['', '\u{1F3FB}', '\u{1F3FC}', '\u{1F3FD}', '\u{1F3FE}', '\u{1F3FF}']
const SKIN_TONE_LABELS = ['Default', 'Light', 'Medium-Light', 'Medium', 'Medium-Dark', 'Dark']
const SKIN_SWATCH_COLORS = ['#FFCC4D', '#FFDBB4', '#EFD0B4', '#C9A97A', '#8D5524', '#4A2912']

const RECENT_KEY = 'emoji-picker-recent'

const activeCategory = ref('smileys')
const searchQuery = ref('')
const selectedSkinTone = ref(0)

const recentEmojis = ref<string[]>([])

onMounted(() => {
  try {
    const stored = localStorage.getItem(RECENT_KEY)
    if (stored) {
      recentEmojis.value = JSON.parse(stored) as string[]
    }
  } catch {
    recentEmojis.value = []
  }
})

const buttonSize = computed(() => {
  if (props.size === 'small') return 28
  if (props.size === 'large') return 44
  return 36
})

const fontSize = computed(() => {
  if (props.size === 'small') return '16px'
  if (props.size === 'large') return '24px'
  return '20px'
})

const filteredEmojis = computed(() => {
  const q = searchQuery.value.trim()
  if (!q) return null
  const all: EmojiEntry[] = CATEGORIES.flatMap(c => c.emojis)
  return all.filter(e => e.emoji.includes(q))
})

const activeEmojis = computed((): EmojiEntry[] => {
  if (filteredEmojis.value !== null) return filteredEmojis.value
  if (activeCategory.value === 'recent') {
    return recentEmojis.value.map(e => ({ emoji: e }))
  }
  const cat = CATEGORIES.find(c => c.id === activeCategory.value)
  return cat ? cat.emojis : []
})

const allCategories = computed(() => {
  const base = [{ id: 'recent', label: 'Recent', icon: '🕐' }, ...CATEGORIES]
  return base
})

function applyEmoji(entry: EmojiEntry): string {
  if (entry.skinnable && selectedSkinTone.value > 0) {
    const tone = SKIN_TONES[selectedSkinTone.value]
    if (tone !== undefined) {
      return entry.emoji + tone
    }
  }
  return entry.emoji
}

function selectEmoji(entry: EmojiEntry) {
  const final = applyEmoji(entry)
  addToRecent(final)
  emit('update:modelValue', final)
  emit('select', final)
}

function addToRecent(emoji: string) {
  const list = recentEmojis.value.filter(e => e !== emoji)
  list.unshift(emoji)
  recentEmojis.value = list.slice(0, props.maxRecent)
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recentEmojis.value))
  } catch {
    // ignore
  }
}
</script>

<template>
  <div class="emoji-picker">
    <div v-if="showSearch" class="emoji-picker__search pa-2">
      <v-text-field
        v-model="searchQuery"
        placeholder="Search emoji…"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        hide-details
        rounded="lg"
        clearable
        :autofocus="false"
      />
    </div>

    <div v-if="!searchQuery" class="emoji-picker__tabs d-flex overflow-x-auto px-1 pt-1 gap-0">
      <v-btn
        v-for="cat in allCategories"
        :key="cat.id"
        variant="text"
        size="small"
        :title="cat.label"
        :class="['emoji-picker__tab-btn', activeCategory === cat.id ? 'active' : '']"
        min-width="36"
        width="36"
        height="36"
        @click="activeCategory = cat.id"
      >
        <span style="font-size: 18px; line-height: 1;">{{ cat.icon }}</span>
      </v-btn>
    </div>

    <v-divider v-if="!searchQuery" />

    <div
      class="emoji-picker__grid pa-2"
      style="max-height: 300px; overflow-y: auto;"
    >
      <div
        v-if="activeEmojis.length === 0"
        class="d-flex align-center justify-center py-8 text-medium-emphasis text-body-2"
      >
        {{ searchQuery ? 'No results' : 'No recent emojis yet' }}
      </div>

      <div
        v-else
        class="emoji-picker__grid-inner"
        :style="{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '2px' }"
      >
        <v-tooltip
          v-for="(entry, idx) in activeEmojis"
          :key="`${entry.emoji}-${idx}`"
          :text="entry.emoji"
          location="top"
          :open-delay="400"
        >
          <template #activator="{ props: ttProps }">
            <button
              v-bind="ttProps"
              class="emoji-picker__emoji-btn"
              :class="{ selected: modelValue === applyEmoji(entry) }"
              :style="{ width: `${buttonSize}px`, height: `${buttonSize}px`, fontSize }"
              :title="entry.emoji"
              type="button"
              @click="selectEmoji(entry)"
            >
              {{ applyEmoji(entry) }}
            </button>
          </template>
        </v-tooltip>
      </div>
    </div>

    <template v-if="showSkinTones">
      <v-divider />
      <div class="d-flex align-center gap-2 pa-2">
        <span class="text-caption text-medium-emphasis">Tone:</span>
        <button
          v-for="(tone, idx) in SKIN_TONES"
          :key="tone"
          type="button"
          class="emoji-picker__tone-btn"
          :class="{ active: selectedSkinTone === idx }"
          :title="SKIN_TONE_LABELS[idx]"
          :style="{ background: SKIN_SWATCH_COLORS[idx] }"
          @click="selectedSkinTone = idx"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.emoji-picker {
  border-radius: 12px;
  overflow: hidden;
  width: 320px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.emoji-picker__tabs {
  scrollbar-width: none;
}
.emoji-picker__tabs::-webkit-scrollbar {
  display: none;
}

.emoji-picker__tab-btn {
  opacity: 0.6;
  border-radius: 8px !important;
  transition: opacity 0.15s, background 0.15s;
  flex-shrink: 0;
}
.emoji-picker__tab-btn:hover {
  opacity: 1;
  background: rgba(var(--v-border-color), 0.1);
}
.emoji-picker__tab-btn.active {
  opacity: 1;
  background: rgba(var(--v-theme-primary), 0.12);
}

.emoji-picker__emoji-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 8px;
  border: none;
  background: transparent;
  transition: background 0.1s, transform 0.1s;
  line-height: 1;
  padding: 0;
}
.emoji-picker__emoji-btn:hover {
  background: rgba(var(--v-border-color), 0.15);
  transform: scale(1.15);
}
.emoji-picker__emoji-btn.selected {
  background: rgba(var(--v-theme-primary), 0.2);
}

.emoji-picker__tone-btn {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: border-color 0.15s, transform 0.15s;
  flex-shrink: 0;
}
.emoji-picker__tone-btn:hover {
  transform: scale(1.15);
}
.emoji-picker__tone-btn.active {
  border-color: rgba(var(--v-theme-primary), 1);
  transform: scale(1.15);
}

.emoji-picker__grid {
  scrollbar-width: thin;
}
</style>
