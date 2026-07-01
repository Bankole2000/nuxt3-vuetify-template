<script setup lang="ts">
// definePageMeta({ middleware: 'auth' }) // uncomment to protect this page

const toast = useToast()
const { confirm } = useConfirm()
const { theme, toggleTheme } = useAppTheme()
const { logout } = useAuth()

const passwordForm = reactive({
  current: '',
  password: '',
  confirm: '',
})
const showCurrent = ref(false)
const showNew = ref(false)
const showConfirmPw = ref(false)
const savingPassword = ref(false)

const notificationToggles = reactive({
  emailUpdates: true,
  securityAlerts: true,
  marketingEmails: false,
  weeklyDigest: true,
  activitySummary: false,
})

const privacyToggles = reactive({
  profileVisible: true,
  analyticsOptIn: true,
  twoFactor: false,
})

const rules = {
  required: (v: string) => !!v || 'Required',
  minLength: (min: number) => (v: string) => v.length >= min || `Minimum ${min} characters`,
  matchPassword: (v: string) => v === passwordForm.password || 'Passwords do not match',
}

const savePassword = async () => {
  savingPassword.value = true
  await new Promise(r => setTimeout(r, 1000))
  savingPassword.value = false
  toast.success('Password updated successfully.')
  passwordForm.current = ''
  passwordForm.password = ''
  passwordForm.confirm = ''
}

const deleteAccount = async () => {
  const ok = await confirm({
    title: 'Delete account',
    message: 'This will permanently delete your account and all associated data. This action cannot be undone.',
    confirmText: 'Delete my account',
    cancelText: 'Keep account',
    color: 'error',
  })
  if (ok) {
    toast.error('Account deletion is not implemented in this template.')
  }
}
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-6">Settings</h1>

    <v-row>
      <v-col cols="12" lg="8">

        <!-- Password -->
        <v-card rounded="lg" class="mb-4">
          <v-card-title class="pa-6 pb-2 text-body-1 font-weight-bold">Change Password</v-card-title>
          <v-card-text class="pa-6 pt-4">
            <v-form @submit.prevent="savePassword">
              <v-text-field
                v-model="passwordForm.current"
                label="Current password"
                :type="showCurrent ? 'text' : 'password'"
                variant="outlined"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="showCurrent ? 'mdi-eye-off' : 'mdi-eye'"
                :rules="[rules.required]"
                class="mb-3"
                @click:append-inner="showCurrent = !showCurrent"
              />
              <v-text-field
                v-model="passwordForm.password"
                label="New password"
                :type="showNew ? 'text' : 'password'"
                variant="outlined"
                prepend-inner-icon="mdi-lock-reset"
                :append-inner-icon="showNew ? 'mdi-eye-off' : 'mdi-eye'"
                :rules="[rules.required, rules.minLength(8)]"
                class="mb-3"
                @click:append-inner="showNew = !showNew"
              />
              <v-text-field
                v-model="passwordForm.confirm"
                label="Confirm new password"
                :type="showConfirmPw ? 'text' : 'password'"
                variant="outlined"
                prepend-inner-icon="mdi-lock-check-outline"
                :append-inner-icon="showConfirmPw ? 'mdi-eye-off' : 'mdi-eye'"
                :rules="[rules.required, rules.matchPassword]"
                class="mb-4"
                @click:append-inner="showConfirmPw = !showConfirmPw"
              />
              <v-btn type="submit" color="primary" :loading="savingPassword">Update password</v-btn>
            </v-form>
          </v-card-text>
        </v-card>

        <!-- Notifications -->
        <v-card rounded="lg" class="mb-4">
          <v-card-title class="pa-6 pb-2 text-body-1 font-weight-bold">Notifications</v-card-title>
          <v-list lines="two" class="pa-2">
            <v-list-item rounded="lg" class="mb-1">
              <v-list-item-title>Email updates</v-list-item-title>
              <v-list-item-subtitle>Receive emails about your account activity</v-list-item-subtitle>
              <template #append>
                <v-switch v-model="notificationToggles.emailUpdates" color="primary" hide-details inset />
              </template>
            </v-list-item>
            <v-list-item rounded="lg" class="mb-1">
              <v-list-item-title>Security alerts</v-list-item-title>
              <v-list-item-subtitle>Get notified about sign-ins and security events</v-list-item-subtitle>
              <template #append>
                <v-switch v-model="notificationToggles.securityAlerts" color="primary" hide-details inset />
              </template>
            </v-list-item>
            <v-list-item rounded="lg" class="mb-1">
              <v-list-item-title>Marketing emails</v-list-item-title>
              <v-list-item-subtitle>Product news, tips, and special offers</v-list-item-subtitle>
              <template #append>
                <v-switch v-model="notificationToggles.marketingEmails" color="primary" hide-details inset />
              </template>
            </v-list-item>
            <v-list-item rounded="lg" class="mb-1">
              <v-list-item-title>Weekly digest</v-list-item-title>
              <v-list-item-subtitle>A weekly summary of your activity</v-list-item-subtitle>
              <template #append>
                <v-switch v-model="notificationToggles.weeklyDigest" color="primary" hide-details inset />
              </template>
            </v-list-item>
            <v-list-item rounded="lg">
              <v-list-item-title>Activity summary</v-list-item-title>
              <v-list-item-subtitle>Daily breakdown of actions taken in your account</v-list-item-subtitle>
              <template #append>
                <v-switch v-model="notificationToggles.activitySummary" color="primary" hide-details inset />
              </template>
            </v-list-item>
          </v-list>
        </v-card>

        <!-- Privacy -->
        <v-card rounded="lg" class="mb-4">
          <v-card-title class="pa-6 pb-2 text-body-1 font-weight-bold">Privacy & Security</v-card-title>
          <v-list lines="two" class="pa-2">
            <v-list-item rounded="lg" class="mb-1">
              <v-list-item-title>Public profile</v-list-item-title>
              <v-list-item-subtitle>Allow others to view your profile</v-list-item-subtitle>
              <template #append>
                <v-switch v-model="privacyToggles.profileVisible" color="primary" hide-details inset />
              </template>
            </v-list-item>
            <v-list-item rounded="lg" class="mb-1">
              <v-list-item-title>Analytics opt-in</v-list-item-title>
              <v-list-item-subtitle>Help us improve by sharing anonymous usage data</v-list-item-subtitle>
              <template #append>
                <v-switch v-model="privacyToggles.analyticsOptIn" color="primary" hide-details inset />
              </template>
            </v-list-item>
            <v-list-item rounded="lg">
              <v-list-item-title>Two-factor authentication</v-list-item-title>
              <v-list-item-subtitle>Add an extra layer of security to your account</v-list-item-subtitle>
              <template #append>
                <v-switch v-model="privacyToggles.twoFactor" color="primary" hide-details inset />
              </template>
            </v-list-item>
          </v-list>
        </v-card>

        <!-- Danger zone -->
        <v-card rounded="lg" border="error">
          <v-card-title class="pa-6 pb-2 text-body-1 font-weight-bold text-error">Danger Zone</v-card-title>
          <v-card-text class="pa-6 pt-2">
            <p class="text-body-2 text-medium-emphasis mb-4">
              Once you delete your account all of your data will be permanently removed. This action cannot be undone.
            </p>
            <v-btn color="error" variant="tonal" prepend-icon="mdi-delete-forever-outline" @click="deleteAccount">
              Delete my account
            </v-btn>
          </v-card-text>
        </v-card>

      </v-col>

      <!-- Sidebar -->
      <v-col cols="12" lg="4">
        <v-card rounded="lg" class="mb-4">
          <v-card-title class="pa-6 pb-2 text-body-1 font-weight-bold">Appearance</v-card-title>
          <v-list lines="two" class="pa-2">
            <v-list-item rounded="lg">
              <v-list-item-title>Dark mode</v-list-item-title>
              <v-list-item-subtitle>Switch between light and dark theme</v-list-item-subtitle>
              <template #append>
                <v-switch
                  :model-value="theme === 'dark'"
                  color="primary"
                  hide-details
                  inset
                  @update:model-value="toggleTheme"
                />
              </template>
            </v-list-item>
          </v-list>
        </v-card>

        <v-card rounded="lg">
          <v-card-title class="pa-6 pb-2 text-body-1 font-weight-bold">Quick Actions</v-card-title>
          <v-card-text class="pa-4 pt-2 d-flex flex-column gap-2">
            <v-btn variant="tonal" prepend-icon="mdi-download-outline" block @click="toast.info('Export started...')">
              Export data
            </v-btn>
            <v-btn variant="tonal" prepend-icon="mdi-help-circle-outline" block @click="toast.info('Help centre coming soon')">
              Help centre
            </v-btn>
            <v-btn variant="tonal" color="error" prepend-icon="mdi-logout" block @click="logout">
              Sign out
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
