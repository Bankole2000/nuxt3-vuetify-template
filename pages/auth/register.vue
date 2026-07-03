<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const { register } = useAuth()

const form = ref({ name: '', email: '', password: '', confirmPassword: '' })
const showPassword = ref(false)
const showConfirm = ref(false)
const loading = ref(false)
const error = ref('')

const rules = {
  required: (v: string) => !!v || 'Required',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Must be a valid email',
  minLength: (min: number) => (v: string) => v.length >= min || `Minimum ${min} characters`,
  matchPassword: (v: string) => v === form.value.password || 'Passwords do not match',
}

const submit = async () => {
  error.value = ''
  loading.value = true
  try {
    await register(form.value.name, form.value.email, form.value.password)
  } catch (e: any) {
    error.value = e?.data?.message ?? 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-card rounded="lg" elevation="4" class="pa-2">
    <v-card-title class="text-h5 font-weight-bold text-center pt-6 pb-2">
      Create account
    </v-card-title>

    <v-card-text>
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
          v-model="form.name"
          label="Full name"
          autocomplete="name"
          prepend-inner-icon="mdi-account-outline"
          :rules="[rules.required]"
          variant="outlined"
          class="mb-2"
        />

        <v-text-field
          v-model="form.email"
          label="Email"
          type="email"
          autocomplete="email"
          prepend-inner-icon="mdi-email-outline"
          :rules="[rules.required, rules.email]"
          variant="outlined"
          class="mb-2"
        />

        <v-text-field
          v-model="form.password"
          label="Password"
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
          label="Confirm password"
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
          Create account
        </v-btn>
      </v-form>
    </v-card-text>

    <v-card-actions class="justify-center pb-2">
      <span class="text-body-2 text-medium-emphasis">Already have an account?</span>
      <NuxtLink to="/auth/login" class="text-primary text-body-2 ml-1 font-weight-medium">
        Sign in
      </NuxtLink>
    </v-card-actions>
    <p class="text-caption text-medium-emphasis text-center pb-5">
      By registering you agree to our
      <NuxtLink to="/terms" class="text-primary">Terms</NuxtLink>
      and
      <NuxtLink to="/privacy" class="text-primary">Privacy Policy</NuxtLink>.
    </p>
  </v-card>
</template>
