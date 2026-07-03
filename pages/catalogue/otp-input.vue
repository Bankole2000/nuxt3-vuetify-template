<script setup lang="ts">
definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'OTP Input', disabled: true },
  ],
})

const toast = useToast()

const otp6 = ref('')
const otp4 = ref('')
const otpPassword = ref('')
const otpError = ref(false)

const verify = () => {
  if (otp6.value === '123456') {
    otpError.value = false
    toast.success('Code verified!')
  } else {
    otpError.value = true
    toast.error('Invalid code. Try 123456.')
  }
}

const onComplete = (val: string) => {
  toast.info(`Complete: ${val}`)
}
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">OTP / PIN Input</h1>
    <p class="text-body-2 text-medium-emphasis mb-8">
      Digit-by-digit code entry with paste support, keyboard navigation and error state.
    </p>

    <!-- 6-digit verify -->
    <h2 class="text-overline text-medium-emphasis mb-4">6-digit verification code</h2>
    <v-card rounded="lg" class="mb-6 pa-6">
      <p class="text-body-2 text-medium-emphasis mb-4">
        Enter the code sent to your email. (Hint: <code>123456</code>)
      </p>
      <CommonOtpInput
        v-model="otp6"
        :length="6"
        :error="otpError"
        autofocus
        class="mb-4"
        @complete="verify"
      />
      <p v-if="otpError" class="text-caption text-error mb-3">Invalid verification code. Please try again.</p>
      <div class="d-flex gap-3">
        <v-btn color="primary" variant="tonal" :disabled="otp6.length < 6" @click="verify">Verify</v-btn>
        <v-btn variant="text" size="small" @click="otp6 = ''; otpError = false">Clear</v-btn>
      </div>
    </v-card>

    <!-- 4-digit PIN -->
    <h2 class="text-overline text-medium-emphasis mb-4">4-digit PIN</h2>
    <v-card rounded="lg" class="mb-6 pa-6">
      <p class="text-body-2 text-medium-emphasis mb-4">Compact PIN entry — fires <code>@complete</code> when all digits are filled.</p>
      <CommonOtpInput
        v-model="otp4"
        :length="4"
        class="mb-3"
        @complete="onComplete"
      />
      <p class="text-caption text-medium-emphasis">Value: <code>{{ otp4 || '—' }}</code></p>
    </v-card>

    <!-- Password mode -->
    <h2 class="text-overline text-medium-emphasis mb-4">Password / masked mode</h2>
    <v-card rounded="lg" class="mb-6 pa-6">
      <p class="text-body-2 text-medium-emphasis mb-4">Set <code>type="password"</code> to mask each digit.</p>
      <CommonOtpInput
        v-model="otpPassword"
        :length="6"
        type="password"
        class="mb-3"
      />
      <p class="text-caption text-medium-emphasis">Raw value: <code>{{ otpPassword || '—' }}</code></p>
    </v-card>

    <!-- Usage -->
    <h2 class="text-overline text-medium-emphasis mb-4">Usage</h2>
    <v-card rounded="lg" class="pa-6">
      <v-sheet rounded="lg" color="surface-variant" class="pa-4">
        <pre class="text-body-2"><code v-pre>&lt;CommonOtpInput
  v-model="code"
  :length="6"
  @complete="verify"
/&gt;</code></pre>
      </v-sheet>
      <v-divider class="my-4" />
      <p class="text-body-2 font-weight-bold mb-2">Props</p>
      <v-table density="compact">
        <thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
        <tbody>
          <tr><td><code>length</code></td><td>number</td><td>6</td></tr>
          <tr><td><code>type</code></td><td>text | number | password</td><td>number</td></tr>
          <tr><td><code>error</code></td><td>boolean</td><td>false</td></tr>
          <tr><td><code>autofocus</code></td><td>boolean</td><td>false</td></tr>
          <tr><td><code>disabled</code></td><td>boolean</td><td>false</td></tr>
        </tbody>
      </v-table>
    </v-card>
  </div>
</template>
