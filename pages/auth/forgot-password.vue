<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const { forgotPassword } = useAuth()

const email = ref('')
const loading = ref(false)
const error = ref('')
const submitted = ref(false)

const rules = {
  required: (v: string) => !!v || 'Required',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Must be a valid email',
}

const submit = async () => {
  error.value = ''
  loading.value = true
  try {
    await forgotPassword(email.value)
    submitted.value = true
  } catch (e: any) {
    error.value = e?.data?.message ?? 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-card rounded="lg" elevation="4" class="pa-2">
    <v-card-title class="text-h5 font-weight-bold text-center pt-6 pb-2">
      Forgot password
    </v-card-title>

    <v-card-text>
      <template v-if="!submitted">
        <p class="text-body-2 text-medium-emphasis text-center mb-6">
          Enter your email and we'll send you a link to reset your password.
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
            v-model="email"
            label="Email"
            type="email"
            autocomplete="email"
            prepend-inner-icon="mdi-email-outline"
            :rules="[rules.required, rules.email]"
            variant="outlined"
            class="mb-4"
          />

          <v-btn
            type="submit"
            color="primary"
            block
            size="large"
            :loading="loading"
          >
            Send reset link
          </v-btn>
        </v-form>
      </template>

      <template v-else>
        <div class="text-center py-4">
          <v-icon size="56" color="success" class="mb-4">mdi-email-check-outline</v-icon>
          <p class="text-body-1 mb-2">Check your inbox</p>
          <p class="text-body-2 text-medium-emphasis">
            We sent a password reset link to <strong>{{ email }}</strong>
          </p>
        </div>
      </template>
    </v-card-text>

    <v-card-actions class="justify-center pb-6">
      <NuxtLink to="/auth/login" class="text-primary text-body-2 font-weight-medium">
        <v-icon size="16" class="mr-1">mdi-arrow-left</v-icon>Back to sign in
      </NuxtLink>
    </v-card-actions>
  </v-card>
</template>
