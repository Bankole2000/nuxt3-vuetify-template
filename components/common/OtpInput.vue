<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue?: string
  length?: number
  type?: 'text' | 'number' | 'password'
  disabled?: boolean
  error?: boolean
  autofocus?: boolean
}>(), {
  modelValue: '',
  length: 6,
  type: 'number',
  disabled: false,
  error: false,
  autofocus: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'complete', value: string): void
}>()

const inputs = ref<HTMLInputElement[]>([])
const digits = ref<string[]>(Array.from({ length: props.length }, () => ''))

const syncFromModel = () => {
  const chars = props.modelValue.split('')
  digits.value = Array.from({ length: props.length }, (_, i) => chars[i] ?? '')
}

watch(() => props.modelValue, syncFromModel, { immediate: true })

const focusAt = (i: number) => {
  inputs.value[i]?.focus()
}

const onInput = (i: number, e: Event) => {
  const target = e.target as HTMLInputElement
  const val = target.value.slice(-1)
  digits.value[i] = val
  const joined = digits.value.join('')
  emit('update:modelValue', joined)
  if (val && i < props.length - 1) focusAt(i + 1)
  if (joined.length === props.length && !joined.includes('')) emit('complete', joined)
}

const onKeydown = (i: number, e: KeyboardEvent) => {
  if (e.key === 'Backspace') {
    if (digits.value[i]) {
      digits.value[i] = ''
      emit('update:modelValue', digits.value.join(''))
    } else if (i > 0) {
      focusAt(i - 1)
    }
  }
  if (e.key === 'ArrowLeft' && i > 0) focusAt(i - 1)
  if (e.key === 'ArrowRight' && i < props.length - 1) focusAt(i + 1)
}

const onPaste = (e: ClipboardEvent) => {
  e.preventDefault()
  const text = e.clipboardData?.getData('text/plain').replace(/\D/g, '').slice(0, props.length) ?? ''
  digits.value = Array.from({ length: props.length }, (_, i) => text[i] ?? '')
  const joined = digits.value.join('')
  emit('update:modelValue', joined)
  if (joined.length === props.length) emit('complete', joined)
  focusAt(Math.min(text.length, props.length - 1))
}

onMounted(() => { if (props.autofocus) focusAt(0) })
</script>

<template>
  <div class="d-flex gap-2">
    <input
      v-for="(_, i) in digits"
      :key="i"
      :ref="el => { if (el) inputs[i] = el as HTMLInputElement }"
      :value="digits[i]"
      :type="type === 'number' ? 'text' : type"
      :inputmode="type === 'number' ? 'numeric' : 'text'"
      :disabled="disabled"
      maxlength="1"
      class="otp-input text-center text-h6 font-weight-bold rounded-lg"
      :class="{ 'otp-input--error': error, 'otp-input--filled': !!digits[i] }"
      autocomplete="one-time-code"
      @input="onInput(i, $event)"
      @keydown="onKeydown(i, $event)"
      @paste="onPaste"
      @focus="($event.target as HTMLInputElement).select()"
    />
  </div>
</template>

<style scoped>
.otp-input {
  width: 48px;
  height: 56px;
  border: 2px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  font-size: 1.25rem;
}
.otp-input:focus {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 3px rgba(var(--v-theme-primary), 0.15);
}
.otp-input--filled {
  border-color: rgba(var(--v-theme-primary), 0.6);
}
.otp-input--error {
  border-color: rgb(var(--v-theme-error));
}
.otp-input--error:focus {
  box-shadow: 0 0 0 3px rgba(var(--v-theme-error), 0.15);
}
</style>
