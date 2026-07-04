<script lang="ts">
import { defineComponent, h } from 'vue'

export type PresenceStatus = 'online' | 'idle' | 'offline' | 'editing' | 'viewing'

export interface Collaborator {
  id:        string
  name:      string
  avatar?:   string
  color?:    string
  status:    PresenceStatus
  location?: string
  lastSeen?: string
}

export const PresenceCursor = defineComponent({
  name: 'PresenceCursor',
  props: {
    collaborator: { type: Object as () => Collaborator, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  setup(props) {
    return () => h('div', {
      style: {
        position: 'absolute',
        left: `${props.x}%`,
        top: `${props.y}%`,
        transform: 'translate(-2px, -100%)',
        pointerEvents: 'none',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '2px',
      },
    }, [
      h('svg', {
        width: 16,
        height: 16,
        viewBox: '0 0 16 16',
        style: { display: 'block', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' },
      }, [
        h('path', {
          d: 'M0 0 L0 12 L3.5 8.5 L6 14 L7.5 13.3 L5 7.5 L9 7.5 Z',
          fill: props.collaborator.color ?? '#2196F3',
          stroke: 'white',
          'stroke-width': '1',
        }),
      ]),
      h('span', {
        style: {
          background: props.collaborator.color ?? '#2196F3',
          color: '#fff',
          fontSize: '11px',
          fontWeight: 600,
          padding: '1px 6px',
          borderRadius: '4px',
          whiteSpace: 'nowrap',
          boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
          lineHeight: '18px',
        },
      }, props.collaborator.name.split(' ')[0] ?? props.collaborator.name),
    ])
  },
})
</script>

<script setup lang="ts">

const props = withDefaults(defineProps<{
  collaborators:  Collaborator[]
  maxVisible?:    number
  size?:          'small' | 'default' | 'large'
  showStatus?:    boolean
  showNames?:     boolean
  showTooltips?:  boolean
  variant?:       'stack' | 'row'
}>(), {
  maxVisible:   5,
  size:         'default',
  showStatus:   true,
  showNames:    false,
  showTooltips: true,
  variant:      'stack',
})

const emit = defineEmits<{
  click: [collaborator: Collaborator]
}>()

const avatarSize = computed(() => {
  if (props.size === 'small') return 28
  if (props.size === 'large') return 48
  return 36
})

const statusDotSize = computed(() => {
  if (props.size === 'small') return 8
  if (props.size === 'large') return 14
  return 10
})

const statusDotOffset = computed(() => {
  const d = statusDotSize.value
  return -(d / 2)
})

const negativeMargin = computed(() => {
  if (!props.showNames && props.variant === 'stack') return `-${Math.floor(avatarSize.value * 0.35)}px`
  return '4px'
})

const visible = computed(() => props.collaborators.slice(0, props.maxVisible))
const overflow = computed(() => Math.max(0, props.collaborators.length - props.maxVisible))

const statusColor: Record<PresenceStatus, string> = {
  online:  '#4CAF50',
  idle:    '#FF9800',
  offline: '#9E9E9E',
  editing: '#2196F3',
  viewing: '#009688',
}

const statusLabel: Record<PresenceStatus, string> = {
  online:  'Online',
  idle:    'Idle',
  offline: 'Offline',
  editing: 'Editing',
  viewing: 'Viewing',
}

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0] ?? '')
    .join('')
    .toUpperCase()
}

function formatLastSeen(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function tooltipText(c: Collaborator): string {
  const parts = [c.name, statusLabel[c.status]]
  if (c.location) parts.push(`At: ${c.location}`)
  if (c.status === 'offline' && c.lastSeen) parts.push(`Last seen: ${formatLastSeen(c.lastSeen)}`)
  return parts.join('\n')
}
</script>

<template>
  <div class="presence-avatars" :class="[`presence-avatars--${variant}`, `presence-avatars--${size}`]">
    <TransitionGroup name="presence-avatar" tag="div" class="presence-avatars__list">
      <div
        v-for="collaborator in visible"
        :key="collaborator.id"
        class="presence-avatar-wrap"
        :style="variant === 'stack' ? { marginLeft: negativeMargin } : {}"
        @click="emit('click', collaborator)"
      >
        <v-tooltip
          v-if="showTooltips"
          :text="tooltipText(collaborator)"
          location="top"
        >
          <template #activator="{ props: tipProps }">
            <div
              v-bind="tipProps"
              class="presence-avatar-inner"
              :style="{
                width: `${avatarSize}px`,
                height: `${avatarSize}px`,
                borderRadius: '50%',
                border: `2px solid ${collaborator.color ?? statusColor[collaborator.status]}`,
                cursor: 'pointer',
                position: 'relative',
                flexShrink: 0,
              }"
              :class="{ 'presence-avatar--editing': collaborator.status === 'editing' }"
            >
              <v-avatar
                :size="avatarSize - 4"
                :image="collaborator.avatar"
                :color="collaborator.color ?? 'primary'"
              >
                <span
                  v-if="!collaborator.avatar"
                  :style="{ fontSize: `${Math.floor((avatarSize - 4) * 0.38)}px` }"
                >{{ initials(collaborator.name) }}</span>
              </v-avatar>

              <span
                v-if="showStatus"
                class="presence-status-dot"
                :class="{ 'presence-status-dot--pulse': collaborator.status === 'editing' }"
                :style="{
                  width: `${statusDotSize}px`,
                  height: `${statusDotSize}px`,
                  background: statusColor[collaborator.status],
                  bottom: `${statusDotOffset}px`,
                  right: `${statusDotOffset}px`,
                }"
              />
            </div>
          </template>
        </v-tooltip>

        <div
          v-else
          class="presence-avatar-inner"
          :style="{
            width: `${avatarSize}px`,
            height: `${avatarSize}px`,
            borderRadius: '50%',
            border: `2px solid ${collaborator.color ?? statusColor[collaborator.status]}`,
            cursor: 'pointer',
            position: 'relative',
            flexShrink: 0,
          }"
          :class="{ 'presence-avatar--editing': collaborator.status === 'editing' }"
          @click="emit('click', collaborator)"
        >
          <v-avatar
            :size="avatarSize - 4"
            :image="collaborator.avatar"
            :color="collaborator.color ?? 'primary'"
          >
            <span
              v-if="!collaborator.avatar"
              :style="{ fontSize: `${Math.floor((avatarSize - 4) * 0.38)}px` }"
            >{{ initials(collaborator.name) }}</span>
          </v-avatar>

          <span
            v-if="showStatus"
            class="presence-status-dot"
            :class="{ 'presence-status-dot--pulse': collaborator.status === 'editing' }"
            :style="{
              width: `${statusDotSize}px`,
              height: `${statusDotSize}px`,
              background: statusColor[collaborator.status],
              bottom: `${statusDotOffset}px`,
              right: `${statusDotOffset}px`,
            }"
          />
        </div>

        <span
          v-if="showNames"
          class="presence-avatar-name text-caption ml-1"
        >{{ collaborator.name.split(' ')[0] }}</span>
      </div>
    </TransitionGroup>

    <div
      v-if="overflow > 0"
      class="presence-overflow"
      :style="{
        width: `${avatarSize}px`,
        height: `${avatarSize}px`,
        marginLeft: variant === 'stack' ? negativeMargin : '4px',
      }"
    >
      <v-chip
        :size="size === 'small' ? 'x-small' : size === 'large' ? 'default' : 'small'"
        color="surface-variant"
        class="presence-overflow-chip"
        :style="{ width: `${avatarSize}px`, height: `${avatarSize}px`, borderRadius: '50%', padding: 0 }"
      >
        <span :style="{ fontSize: `${Math.floor(avatarSize * 0.33)}px`, fontWeight: 600 }">+{{ overflow }}</span>
      </v-chip>
    </div>
  </div>
</template>

<style scoped>
.presence-avatars {
  display: inline-flex;
  align-items: center;
  flex-wrap: nowrap;
}

.presence-avatars__list {
  display: inline-flex;
  align-items: center;
}

.presence-avatar-wrap {
  display: inline-flex;
  align-items: center;
  position: relative;
  z-index: 1;
}

.presence-avatar-wrap:first-child {
  margin-left: 0 !important;
}

.presence-avatar-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: content-box;
}

.presence-status-dot {
  position: absolute;
  border-radius: 50%;
  border: 2px solid rgb(var(--v-theme-surface));
  box-sizing: content-box;
}

.presence-status-dot--pulse {
  animation: status-pulse 1.4s ease-in-out infinite;
}

.presence-avatar--editing {
  animation: editing-ring 1.4s ease-in-out infinite;
}

.presence-avatar-name {
  white-space: nowrap;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.presence-overflow {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.presence-overflow-chip {
  display: flex;
  align-items: center;
  justify-content: center;
}

.presence-avatar-enter-active,
.presence-avatar-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.presence-avatar-enter-from,
.presence-avatar-leave-to {
  opacity: 0;
  transform: scale(0.5);
}

@keyframes status-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50%       { transform: scale(1.4); opacity: 0.6; }
}

@keyframes editing-ring {
  0%, 100% { box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.4); }
  50%       { box-shadow: 0 0 0 4px rgba(33, 150, 243, 0); }
}
</style>
