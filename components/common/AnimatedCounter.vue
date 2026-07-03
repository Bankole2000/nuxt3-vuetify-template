<script setup lang="ts">
const props = withDefaults(defineProps<{
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  decimals?: number
  easing?: 'linear' | 'ease-out' | 'ease-in-out'
}>(), {
  duration: 1500,
  prefix: '',
  suffix: '',
  decimals: 0,
  easing: 'ease-out',
})

const displayed = ref(0)
let animFrame: number | null = null
let startTime: number | null = null
let startValue = 0

const easingFns = {
  linear: (t: number) => t,
  'ease-out': (t: number) => 1 - Math.pow(1 - t, 3),
  'ease-in-out': (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
}

const animate = (target: number) => {
  if (animFrame) cancelAnimationFrame(animFrame)
  startValue = displayed.value
  startTime = null

  const step = (ts: number) => {
    if (!startTime) startTime = ts
    const elapsed = ts - startTime
    const progress = Math.min(elapsed / props.duration, 1)
    const eased = easingFns[props.easing](progress)
    displayed.value = startValue + (target - startValue) * eased
    if (progress < 1) animFrame = requestAnimationFrame(step)
    else displayed.value = target
  }

  animFrame = requestAnimationFrame(step)
}

const formatted = computed(() =>
  `${props.prefix}${displayed.value.toLocaleString(undefined, {
    minimumFractionDigits: props.decimals,
    maximumFractionDigits: props.decimals,
  })}${props.suffix}`,
)

onMounted(() => animate(props.value))
watch(() => props.value, animate)
onUnmounted(() => { if (animFrame) cancelAnimationFrame(animFrame) })
</script>

<template>
  <span>{{ formatted }}</span>
</template>
