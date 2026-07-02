<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const { login } = useAuth()

const form = ref<{ email: string; password: string }>({ email: '', password: '' })
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

const rules = {
  required: (v: string) => !!v || 'Required',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Must be a valid email',
  minLength: (min: number) => (v: string) => v.length >= min || `Minimum ${min} characters`,
}

const submit = async () => {
  error.value = ''
  loading.value = true
  try {
    await login(form.value.email, form.value.password)
  } catch (e: any) {
    error.value = e?.data?.message ?? 'Invalid email or password'
  } finally {
    loading.value = false
  }
}

</script>

<template>
  <v-card rounded="lg" elevation="4" class="pa-2">
    <v-card-title class="text-h5 font-weight-bold text-center pt-6 pb-2">
      Sign in
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
          autocomplete="current-password"
          prepend-inner-icon="mdi-lock-outline"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          :rules="[rules.required, rules.minLength(8)]"
          variant="outlined"
          class="mb-1"
          @click:append-inner="showPassword = !showPassword"
        />

        <div class="text-right mb-4">
          <NuxtLink to="/auth/forgot-password" class="text-primary text-caption">
            Forgot password?
          </NuxtLink>
        </div>

        <v-btn
          type="submit"
          color="primary"
          block
          size="large"
          :loading="loading"
        >
          Sign in
        </v-btn>
      </v-form>
    </v-card-text>

    <v-card-actions class="justify-center pb-6">
      <span class="text-body-2 text-medium-emphasis">Don't have an account?</span>
      <NuxtLink to="/auth/register" class="text-primary text-body-2 ml-1 font-weight-medium">
        Sign up
      </NuxtLink>
    </v-card-actions>
  </v-card>
</template>
