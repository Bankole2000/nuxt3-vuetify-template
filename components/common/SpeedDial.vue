<script setup lang="ts">
export interface SpeedDialAction {
  id: string
  label: string
  icon: string
  color?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<{
  actions: SpeedDialAction[]
  icon?: string
  openIcon?: string
  color?: string
  location?: 'bottom-right' | 'bottom-left' | 'bottom-center'
  direction?: 'up' | 'left' | 'right'
  transition?: 'slide' | 'scale' | 'fade'
  contained?: boolean
  overlay?: boolean
}>(), {
  icon: 'mdi-plus',
  openIcon: 'mdi-close',
  color: 'primary',
  location: 'bottom-right',
  direction: 'up',
  transition: 'slide',
  contained: false,
  overlay: false,
})

const emit = defineEmits<{
  action: [id: string]
  open: []
  close: []
}>()

const isOpen = ref(false)
const wrapperRef = ref<HTMLElement | null>(null)

const toggle = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) emit('open')
  else emit('close')
}

const handleAction = (action: SpeedDialAction) => {
  if (action.disabled) return
  emit('action', action.id)
  isOpen.value = false
  emit('close')
}

const close = () => {
  if (!isOpen.value) return
  isOpen.value = false
  emit('close')
}

const onMousedown = (e: MouseEvent) => {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target as Node)) {
    close()
  }
}

const onKeydown = (e: KeyboardEvent) => {
  if (!isOpen.value) return
  if (e.key === 'Escape') {
    close()
    return
  }
  const focusable = wrapperRef.value?.querySelectorAll<HTMLElement>('[data-action-btn]')
  if (!focusable || focusable.length === 0) return
  const current = document.activeElement
  const arr = Array.from(focusable)
  const idx = arr.indexOf(current as HTMLElement)
  if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
    e.preventDefault()
    const prev = idx <= 0 ? arr[arr.length - 1]! : arr[idx - 1]!
    prev.focus()
  } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
    e.preventDefault()
    const next = idx >= arr.length - 1 ? arr[0]! : arr[idx + 1]!
    next.focus()
  }
}

onMounted(() => {
  document.addEventListener('mousedown', onMousedown)
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', onMousedown)
  document.removeEventListener('keydown', onKeydown)
})

const positionStyle = computed(() => {
  const base = props.contained ? 'position: absolute;' : 'position: fixed;'
  const bottom = 'bottom: 20px;'
  if (props.location === 'bottom-right') return `${base} ${bottom} right: 20px;`
  if (props.location === 'bottom-left') return `${base} ${bottom} left: 20px;`
  return `${base} ${bottom} left: 50%; transform: translateX(-50%);`
})

const overlayStyle = computed(() => {
  const base = props.contained ? 'position: absolute;' : 'position: fixed;'
  return `${base} inset: 0; background: rgba(0,0,0,0.32); z-index: 999;`
})

const actionStyle = (index: number): string => {
  if (!isOpen.value) {
    if (props.direction === 'up') return `opacity: 0; transform: translateY(10px) scale(0.8); transition: opacity 0.2s ease ${index * 30}ms, transform 0.2s ease ${index * 30}ms; pointer-events: none;`
    if (props.direction === 'left') return `opacity: 0; transform: translateX(10px) scale(0.8); transition: opacity 0.2s ease ${index * 30}ms, transform 0.2s ease ${index * 30}ms; pointer-events: none;`
    return `opacity: 0; transform: translateX(-10px) scale(0.8); transition: opacity 0.2s ease ${index * 30}ms, transform 0.2s ease ${index * 30}ms; pointer-events: none;`
  }
  const delay = (props.actions.length - 1 - index) * 30
  if (props.transition === 'scale') {
    return `opacity: 1; transform: scale(1); transition: opacity 0.2s ease ${delay}ms, transform 0.2s ease ${delay}ms;`
  }
  if (props.transition === 'fade') {
    return `opacity: 1; transform: none; transition: opacity 0.25s ease ${delay}ms;`
  }
  return `opacity: 1; transform: translateY(0) scale(1); transition: opacity 0.2s ease ${delay}ms, transform 0.2s ease ${delay}ms;`
}

const actionsContainerStyle = computed(() => {
  if (props.direction === 'up') return 'display: flex; flex-direction: column-reverse; align-items: center; gap: 8px; margin-bottom: 8px;'
  if (props.direction === 'left') return 'display: flex; flex-direction: row-reverse; align-items: center; gap: 8px; margin-right: 8px;'
  return 'display: flex; flex-direction: row; align-items: center; gap: 8px; margin-left: 8px;'
})

const wrapperContainerStyle = computed(() => {
  if (props.location === 'bottom-center') {
    return 'display: flex; flex-direction: column; align-items: center;'
  }
  if (props.direction === 'up') return 'display: flex; flex-direction: column; align-items: flex-end;'
  if (props.direction === 'left') return 'display: flex; flex-direction: row; align-items: center;'
  return 'display: flex; flex-direction: row-reverse; align-items: center;'
})

const labelPosition = computed(() => {
  if (props.direction === 'up') return 'left'
  if (props.direction === 'left') return 'above'
  return 'above'
})

const mainBtnStyle = computed(() => {
  if (props.location === 'bottom-center') return 'align-self: center;'
  return ''
})
</script>

<template>
  <div ref="wrapperRef" :style="`${positionStyle} z-index: 1000;`">
    <div v-if="overlay && isOpen" :style="overlayStyle" @click="close" />

    <div :style="wrapperContainerStyle">
      <div :style="actionsContainerStyle">
        <div
          v-for="(action, index) in actions"
          :key="action.id"
          class="d-flex"
          :class="direction === 'up' ? 'align-center' : 'flex-column align-center'"
          :style="`gap: 6px; ${actionStyle(index)}`"
        >
          <span
            v-if="labelPosition === 'left'"
            class="text-caption font-weight-medium px-2 py-1 rounded"
            style="background: rgba(0,0,0,0.7); color: #fff; white-space: nowrap; pointer-events: none;"
          >{{ action.label }}</span>

          <span
            v-if="labelPosition === 'above'"
            class="text-caption font-weight-medium px-2 py-1 rounded mb-1"
            style="background: rgba(0,0,0,0.7); color: #fff; white-space: nowrap; pointer-events: none;"
          >{{ action.label }}</span>

          <v-btn
            :icon="action.icon"
            :color="action.color ?? 'primary'"
            :disabled="action.disabled"
            size="small"
            elevation="2"
            data-action-btn
            @click="handleAction(action)"
          />
        </div>
      </div>

      <v-btn
        :icon="isOpen ? openIcon : icon"
        :color="color"
        size="large"
        elevation="4"
        :style="mainBtnStyle"
        @click="toggle"
      />
    </div>
  </div>
</template>
