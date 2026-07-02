<script setup lang="ts">
export interface TourStep {
  /** CSS selector of the element to highlight */
  target: string
  title: string
  description: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
}

const props = withDefaults(defineProps<{
  steps: TourStep[]
  modelValue: boolean
}>(), {})

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'finish'): void
  (e: 'skip'): void
}>()

const step = ref(0)
const highlight = ref<DOMRect | null>(null)
const tooltipStyle = ref<Record<string, string>>({})
const PADDING = 8

const current = computed(() => props.steps[step.value])

const updatePosition = () => {
  const target = document.querySelector(current.value?.target ?? '')
  if (!target) { highlight.value = null; return }

  const rect = target.getBoundingClientRect()
  highlight.value = rect

  const placement = current.value?.placement ?? 'bottom'
  const TOOLTIP_W = 300
  const TOOLTIP_H = 160

  const styles: Record<string, string> = {
    position: 'fixed',
    width: `${TOOLTIP_W}px`,
    zIndex: '10001',
  }

  if (placement === 'bottom') {
    styles.top = `${rect.bottom + PADDING + window.scrollY}px`
    styles.left = `${Math.max(8, rect.left + rect.width / 2 - TOOLTIP_W / 2)}px`
  }
  else if (placement === 'top') {
    styles.top = `${rect.top - TOOLTIP_H - PADDING + window.scrollY}px`
    styles.left = `${Math.max(8, rect.left + rect.width / 2 - TOOLTIP_W / 2)}px`
  }
  else if (placement === 'right') {
    styles.top = `${rect.top + rect.height / 2 - TOOLTIP_H / 2 + window.scrollY}px`
    styles.left = `${rect.right + PADDING}px`
  }
  else {
    styles.top = `${rect.top + rect.height / 2 - TOOLTIP_H / 2 + window.scrollY}px`
    styles.left = `${rect.left - TOOLTIP_W - PADDING}px`
  }

  tooltipStyle.value = styles
}

const next = () => {
  if (step.value < props.steps.length - 1) { step.value++; nextTick(updatePosition) }
  else { finish() }
}
const back = () => { if (step.value > 0) { step.value--; nextTick(updatePosition) } }
const finish = () => { emit('update:modelValue', false); emit('finish') }
const skip = () => { emit('update:modelValue', false); emit('skip') }

watch(() => props.modelValue, (v) => {
  if (v) { step.value = 0; nextTick(updatePosition) }
})
watch(step, () => nextTick(updatePosition))

onMounted(() => window.addEventListener('resize', updatePosition))
onUnmounted(() => window.removeEventListener('resize', updatePosition))
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue">
        <!-- Scrim with cutout via box-shadow trick -->
        <div
          class="position-fixed"
          style="inset: 0; z-index: 10000; pointer-events: all;"
          @click.self="skip"
        >
          <!-- Highlight box -->
          <div
            v-if="highlight"
            class="position-fixed"
            :style="{
              top: `${highlight.top - PADDING}px`,
              left: `${highlight.left - PADDING}px`,
              width: `${highlight.width + PADDING * 2}px`,
              height: `${highlight.height + PADDING * 2}px`,
              borderRadius: '8px',
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
              pointerEvents: 'none',
              zIndex: 10000,
            }"
          />
        </div>

        <!-- Tooltip -->
        <v-card
          v-if="current"
          rounded="lg"
          elevation="8"
          :style="tooltipStyle"
        >
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between mb-2">
              <span class="text-body-2 font-weight-bold">{{ current.title }}</span>
              <span class="text-caption text-medium-emphasis">{{ step + 1 }} / {{ steps.length }}</span>
            </div>
            <p class="text-body-2 text-medium-emphasis mb-3">{{ current.description }}</p>

            <!-- Step dots -->
            <div class="d-flex gap-1 mb-3">
              <div
                v-for="(_, i) in steps"
                :key="i"
                class="rounded-circle"
                :style="{
                  width: '6px', height: '6px',
                  background: i === step ? 'rgb(var(--v-theme-primary))' : 'rgba(var(--v-border-color), 0.4)',
                  transition: 'background 0.2s',
                }"
              />
            </div>

            <div class="d-flex gap-2">
              <v-btn v-if="step > 0" size="small" variant="text" @click="back">Back</v-btn>
              <v-btn size="small" variant="text" color="medium-emphasis" @click="skip">Skip</v-btn>
              <v-spacer />
              <v-btn size="small" color="primary" variant="tonal" @click="next">
                {{ step < steps.length - 1 ? 'Next' : 'Finish' }}
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
