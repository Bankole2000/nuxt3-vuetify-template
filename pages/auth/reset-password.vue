<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const { resetPassword } = useAuth()
const route = useRoute()

const token = computed(() => route.query.token as string ?? '')
const form = ref({ password: '', confirmPassword: '' })
const showPassword = ref(false)
const showConfirm = ref(false)
const loading = ref(false)
const error = ref('')

const rules = {
  required: (v: string) => !!v || 'Required',
  minLength: (min: number) => (v: string) => v.length >= min || `Minimum ${min} characters`,
  matchPassword: (v: string) => v === form.value.password || 'Passwords do not match',
}

const submit = async () => {
  if (!token.value) {
    error.value = 'Invalid or missing reset token.'
    return
  }
  error.value = ''
  loading.value = true
  try {
    await resetPassword(token.value, form.value.password)
  } catch (e: any) {
    error.value = e?.data?.message ?? 'Failed to reset password. The link may have expired.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-card rounded="lg" elevation="4" class="pa-2">
    <v-card-title class="text-h5 font-weight-bold text-center pt-6 pb-2">
      Reset password
    </v-card-title>

    <v-card-text>
      <p class="text-body-2 text-medium-emphasis text-center mb-6">
        Enter your new password below.
      </p>

      <v-alert
        v-if="error"
        type="error"
        variant="tonal"
        class="mb-4"
        density="compact"
        :text="error"
      />

      <v-form @submit.prevent="submit">
        <v-text-field
          v-model="form.password"
          label="New password"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="new-password"
          prepend-inner-icon="mdi-lock-outline"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          :rules="[rules.required, rules.minLength(8)]"
          variant="outlined"
          class="mb-2"
          @click:append-inner="showPassword = !showPassword"
        />

        <v-text-field
          v-model="form.confirmPassword"
          label="Confirm new password"
          :type="showConfirm ? 'text' : 'password'"
          autocomplete="new-password"
          prepend-inner-icon="mdi-lock-check-outline"
          :append-inner-icon="showConfirm ? 'mdi-eye-off' : 'mdi-eye'"
          :rules="[rules.required, rules.matchPassword]"
          variant="outlined"
          class="mb-4"
          @click:append-inner="showConfirm = !showConfirm"
        />

        <v-btn
          type="submit"
          color="primary"
          block
          size="large"
          :loading="loading"
        >
          Reset password
        </v-btn>
      </v-form>
    </v-card-text>

    <v-card-actions class="justify-center pb-6">
      <NuxtLink to="/auth/login" class="text-primary text-body-2 font-weight-medium">
        <v-icon size="16" class="mr-1">mdi-arrow-left</v-icon>Back to sign in
      </NuxtLink>
    </v-card-actions>
  </v-card>
</template>
