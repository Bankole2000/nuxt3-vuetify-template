<script setup lang="ts">
definePageMeta({ layout: 'catalogue' })

const toast = useToast()
const { confirm } = useConfirm()
const loader = useLoadingState()

type ToastLocation = 'bottom center' | 'bottom end' | 'bottom start' | 'top center' | 'top end' | 'top start'

const locations: ToastLocation[] = [
  'bottom center', 'bottom end', 'bottom start',
  'top center', 'top end', 'top start',
]

const fireToast = (location: ToastLocation) => {
  toast.setLocation(location)
  toast.success(`Toast at ${location}`)
}

const triggerOverlay = async () => {
  loader.start('Processing request...')
  await new Promise(r => setTimeout(r, 2500))
  loader.stop()
  toast.success('Done!')
}

const triggerConfirm = async () => {
  const ok = await confirm({
    title: 'Confirm action',
    message: 'Are you sure you want to proceed with this action?',
    confirmText: 'Yes, proceed',
    cancelText: 'Cancel',
    color: 'primary',
  })
  if (ok) toast.success('Confirmed!')
  else toast.info('Cancelled.')
}

const triggerDangerConfirm = async () => {
  const ok = await confirm({
    title: 'Delete item',
    message: 'This will permanently delete the item. This action cannot be undone.',
    confirmText: 'Delete',
    cancelText: 'Keep it',
    color: 'error',
  })
  if (ok) toast.error('Item deleted.')
  else toast.info('Cancelled.')
}
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">Feedback</h1>
    <p class="text-body-2 text-medium-emphasis mb-8">Toasts, loading indicators and confirmation dialogs — all wired to real composables.</p>

    <!-- Toast types -->
    <h2 class="text-overline text-medium-emphasis mb-4">Toast types</h2>
    <v-card rounded="lg" class="mb-6 pa-6">
      <div class="d-flex flex-wrap gap-3">
        <v-btn color="success" variant="tonal" prepend-icon="mdi-check-circle-outline" @click="toast.success('Profile saved successfully.')">
          Success
        </v-btn>
        <v-btn color="error" variant="tonal" prepend-icon="mdi-alert-circle-outline" @click="toast.error('Failed to save. Please try again.')">
          Error
        </v-btn>
        <v-btn color="warning" variant="tonal" prepend-icon="mdi-alert-outline" @click="toast.warning('Your session expires in 5 minutes.')">
          Warning
        </v-btn>
        <v-btn color="info" variant="tonal" prepend-icon="mdi-information-outline" @click="toast.info('A new version is available.')">
          Info
        </v-btn>
      </div>
    </v-card>

    <!-- Toast positions -->
    <h2 class="text-overline text-medium-emphasis mb-4">Toast positions</h2>
    <v-card rounded="lg" class="mb-6 pa-6">
      <div class="d-flex flex-wrap gap-3">
        <v-btn
          v-for="loc in locations"
          :key="loc"
          variant="outlined"
          size="small"
          @click="fireToast(loc)"
        >
          {{ loc }}
        </v-btn>
      </div>
      <p class="text-caption text-medium-emphasis mt-3">Each button fires a toast at that position and sets it as the active location.</p>
    </v-card>

    <!-- Custom toast -->
    <h2 class="text-overline text-medium-emphasis mb-4">Custom toast</h2>
    <v-card rounded="lg" class="mb-6 pa-6">
      <div class="d-flex flex-wrap gap-3">
        <v-btn variant="tonal" color="primary" prepend-icon="mdi-upload" @click="toast.show({
          text: 'Uploading file...',
          color: 'primary',
          prependIcon: 'mdi-upload',
          timeout: 3000,
          timer: 'bottom',
        })">
          Custom with timer
        </v-btn>
        <v-btn variant="tonal" prepend-icon="mdi-star-outline" @click="toast.show({
          text: 'You earned a badge!',
          color: 'secondary',
          prependIcon: 'mdi-star',
          timeout: 5000,
          timer: 'bottom',
        })">
          Custom secondary
        </v-btn>
      </div>
    </v-card>

    <!-- Loading overlay -->
    <h2 class="text-overline text-medium-emphasis mb-4">Loading overlay</h2>
    <v-card rounded="lg" class="mb-6 pa-6">
      <p class="text-body-2 text-medium-emphasis mb-4">Triggers a full-screen overlay for 2.5 seconds, then shows a success toast.</p>
      <v-btn color="primary" variant="tonal" prepend-icon="mdi-loading" @click="triggerOverlay">
        Trigger overlay (2.5s)
      </v-btn>
    </v-card>

    <!-- Confirm dialogs -->
    <h2 class="text-overline text-medium-emphasis mb-4">Confirmation dialogs</h2>
    <v-card rounded="lg" class="pa-6">
      <div class="d-flex flex-wrap gap-3">
        <v-btn color="primary" variant="tonal" prepend-icon="mdi-help-circle-outline" @click="triggerConfirm">
          Standard confirm
        </v-btn>
        <v-btn color="error" variant="tonal" prepend-icon="mdi-delete-outline" @click="triggerDangerConfirm">
          Danger confirm
        </v-btn>
      </div>
    </v-card>
  </div>
</template>
