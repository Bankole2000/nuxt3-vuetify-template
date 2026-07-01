<script setup lang="ts">
definePageMeta({ layout: 'catalogue' })

const text = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const selected = ref<string | null>(null)
const multiSelected = ref<string[]>([])
const checked = ref(false)
const indeterminate = ref(true)
const switchVal = ref(true)
const radioVal = ref('option1')
const sliderVal = ref(40)
const rangeVal = ref([20, 70])
const textarea = ref('')

const items = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape']
const rules = {
  required: (v: string) => !!v || 'Required',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Must be a valid email',
  minLength: (v: string) => v.length >= 8 || 'Minimum 8 characters',
}
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">Forms</h1>
    <p class="text-body-2 text-medium-emphasis mb-8">Input components, validation states and selection controls.</p>

    <!-- Text fields -->
    <h2 class="text-overline text-medium-emphasis mb-4">Text fields</h2>
    <v-card rounded="lg" class="mb-6 pa-6">
      <v-row>
        <v-col cols="12" sm="6">
          <v-text-field v-model="text" label="Default" variant="outlined" class="mb-3" />
          <v-text-field v-model="email" label="With validation" variant="outlined" type="email"
            :rules="[rules.required, rules.email]" prepend-inner-icon="mdi-email-outline" class="mb-3" />
          <v-text-field
            v-model="password"
            label="Password"
            variant="outlined"
            :type="showPassword ? 'text' : 'password'"
            prepend-inner-icon="mdi-lock-outline"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            :rules="[rules.required, rules.minLength]"
            @click:append-inner="showPassword = !showPassword"
          />
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field label="Filled" variant="filled" class="mb-3" />
          <v-text-field label="Disabled" variant="outlined" disabled value="Disabled value" class="mb-3" />
          <v-text-field label="With hint" variant="outlined" hint="This is a hint" persistent-hint />
        </v-col>
      </v-row>
    </v-card>

    <!-- Textarea -->
    <h2 class="text-overline text-medium-emphasis mb-4">Textarea</h2>
    <v-card rounded="lg" class="mb-6 pa-6">
      <v-textarea v-model="textarea" label="Message" variant="outlined" rows="3" auto-grow />
    </v-card>

    <!-- Selects -->
    <h2 class="text-overline text-medium-emphasis mb-4">Selects</h2>
    <v-card rounded="lg" class="mb-6 pa-6">
      <v-row>
        <v-col cols="12" sm="6">
          <v-select v-model="selected" :items="items" label="Single select" variant="outlined" class="mb-3" />
          <v-autocomplete v-model="selected" :items="items" label="Autocomplete" variant="outlined" />
        </v-col>
        <v-col cols="12" sm="6">
          <v-select v-model="multiSelected" :items="items" label="Multi select" variant="outlined" multiple chips class="mb-3" />
          <v-combobox v-model="multiSelected" :items="items" label="Combobox" variant="outlined" multiple chips />
        </v-col>
      </v-row>
    </v-card>

    <!-- Checkboxes & Switches -->
    <h2 class="text-overline text-medium-emphasis mb-4">Checkboxes & switches</h2>
    <v-card rounded="lg" class="mb-6 pa-6">
      <v-row>
        <v-col cols="12" sm="6">
          <v-checkbox v-model="checked" label="Checkbox" color="primary" />
          <v-checkbox :model-value="true" label="Checked" color="primary" />
          <v-checkbox :indeterminate="indeterminate" label="Indeterminate" color="primary" @click="indeterminate = false" />
          <v-checkbox :model-value="false" label="Disabled" disabled />
        </v-col>
        <v-col cols="12" sm="6">
          <v-switch v-model="switchVal" label="Switch" color="primary" inset />
          <v-switch :model-value="false" label="Off" color="primary" inset />
          <v-switch :model-value="true" label="Disabled" disabled inset />
        </v-col>
      </v-row>
    </v-card>

    <!-- Radio -->
    <h2 class="text-overline text-medium-emphasis mb-4">Radio buttons</h2>
    <v-card rounded="lg" class="mb-6 pa-6">
      <v-radio-group v-model="radioVal" inline>
        <v-radio label="Option 1" value="option1" color="primary" />
        <v-radio label="Option 2" value="option2" color="primary" />
        <v-radio label="Option 3" value="option3" color="primary" />
        <v-radio label="Disabled" value="option4" disabled />
      </v-radio-group>
    </v-card>

    <!-- Sliders -->
    <h2 class="text-overline text-medium-emphasis mb-4">Sliders</h2>
    <v-card rounded="lg" class="pa-6">
      <v-slider v-model="sliderVal" label="Slider" color="primary" thumb-label class="mb-4" />
      <v-range-slider v-model="rangeVal" label="Range" color="primary" thumb-label />
    </v-card>
  </div>
</template>
