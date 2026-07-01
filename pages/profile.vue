<script setup lang="ts">
// definePageMeta({ middleware: 'auth' }) // uncomment to protect this page

const { user } = useAuth()
const toast = useToast()

const form = reactive({
  name: user.value?.name ?? '',
  email: user.value?.email ?? '',
})

const saving = ref(false)

const save = async () => {
  saving.value = true
  await new Promise(r => setTimeout(r, 1000))
  saving.value = false
  toast.success('Profile updated successfully.')
}
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-6">Profile</h1>

    <v-row>
      <v-col cols="12" md="4" class="text-center">
        <v-card rounded="lg" class="pa-6">
          <v-avatar color="primary" size="80" class="mb-4">
            <span class="text-h5 font-weight-bold text-white">
              {{ user?.name?.charAt(0).toUpperCase() }}
            </span>
          </v-avatar>
          <p class="text-body-1 font-weight-bold">{{ user?.name }}</p>
          <p class="text-body-2 text-medium-emphasis mb-4">{{ user?.email }}</p>
          <v-btn variant="tonal" prepend-icon="mdi-camera-outline" block>
            Change Avatar
          </v-btn>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <v-card rounded="lg">
          <v-card-title class="pa-6 pb-2 text-body-1 font-weight-bold">Personal Information</v-card-title>
          <v-card-text class="pa-6 pt-4">
            <v-form @submit.prevent="save">
              <v-text-field
                v-model="form.name"
                label="Full name"
                variant="outlined"
                prepend-inner-icon="mdi-account-outline"
                class="mb-3"
              />
              <v-text-field
                v-model="form.email"
                label="Email"
                type="email"
                variant="outlined"
                prepend-inner-icon="mdi-email-outline"
                class="mb-4"
              />
              <v-btn type="submit" color="primary" :loading="saving">Save changes</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
