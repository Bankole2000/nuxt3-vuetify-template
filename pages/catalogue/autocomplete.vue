<script setup lang="ts">
definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Autocomplete', disabled: true },
  ],
})

interface User { id: number; name: string; email: string; avatar: string }
interface Country { id: string; name: string; flag: string }

const selectedUser = ref(null)
const selectedCountry = ref(null)
const selectedUsers = ref([])

// Simulated async user search (replace with real $api call)
const fetchUsers = async (query: string): Promise<User[]> => {
  await new Promise(r => setTimeout(r, 350))
  const all: User[] = [
    { id: 1, name: 'Alice Martin', email: 'alice@example.com', avatar: 'AM' },
    { id: 2, name: 'Bob Chen', email: 'bob@example.com', avatar: 'BC' },
    { id: 3, name: 'Carol White', email: 'carol@example.com', avatar: 'CW' },
    { id: 4, name: 'David Kim', email: 'david@example.com', avatar: 'DK' },
    { id: 5, name: 'Eve Johnson', email: 'eve@example.com', avatar: 'EJ' },
    { id: 6, name: 'Frank Lee', email: 'frank@example.com', avatar: 'FL' },
    { id: 7, name: 'Grace Park', email: 'grace@example.com', avatar: 'GP' },
  ]
  return all.filter(u =>
    u.name.toLowerCase().includes(query.toLowerCase()) ||
    u.email.includes(query.toLowerCase()),
  )
}

// Simulated country search
const fetchCountries = async (query: string): Promise<Country[]> => {
  await new Promise(r => setTimeout(r, 200))
  const all: Country[] = [
    { id: 'gb', name: 'United Kingdom', flag: '🇬🇧' },
    { id: 'us', name: 'United States', flag: '🇺🇸' },
    { id: 'de', name: 'Germany', flag: '🇩🇪' },
    { id: 'fr', name: 'France', flag: '🇫🇷' },
    { id: 'jp', name: 'Japan', flag: '🇯🇵' },
    { id: 'ng', name: 'Nigeria', flag: '🇳🇬' },
    { id: 'br', name: 'Brazil', flag: '🇧🇷' },
    { id: 'au', name: 'Australia', flag: '🇦🇺' },
    { id: 'ca', name: 'Canada', flag: '🇨🇦' },
    { id: 'za', name: 'South Africa', flag: '🇿🇦' },
  ]
  return all.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
}
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">Async Autocomplete</h1>
    <p class="text-body-2 text-medium-emphasis mb-8">
      Debounced remote search wired to <code>v-autocomplete</code>.
      Pass any async <code>fetcher</code> function — simulated here with a 300ms delay.
    </p>

    <v-row>
      <v-col cols="12" md="6">
        <h2 class="text-overline text-medium-emphasis mb-4">User search</h2>
        <v-card rounded="lg" class="pa-5 mb-6">
          <CommonAsyncAutocomplete
            v-model="selectedUser"
            label="Search users"
            placeholder="Type a name or email…"
            item-title="name"
            item-value="id"
            :fetcher="fetchUsers"
          />
          <p v-if="selectedUser" class="text-caption text-medium-emphasis mt-2">
            Selected ID: {{ selectedUser }}
          </p>
        </v-card>

        <h2 class="text-overline text-medium-emphasis mb-4">Multi-select</h2>
        <v-card rounded="lg" class="pa-5">
          <CommonAsyncAutocomplete
            v-model="selectedUsers"
            label="Search users (multi)"
            placeholder="Type to search…"
            item-title="name"
            item-value="id"
            :fetcher="fetchUsers"
            multiple
          />
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <h2 class="text-overline text-medium-emphasis mb-4">Country search</h2>
        <v-card rounded="lg" class="pa-5 mb-6">
          <CommonAsyncAutocomplete
            v-model="selectedCountry"
            label="Search countries"
            placeholder="Type a country name…"
            item-title="name"
            item-value="id"
            :fetcher="fetchCountries"
          />
        </v-card>

        <h2 class="text-overline text-medium-emphasis mb-4">Usage</h2>
        <v-card rounded="lg" class="pa-5">
          <v-sheet rounded="lg" color="surface-variant" class="pa-4">
            <pre v-pre class="text-body-2"><code>&lt;CommonAsyncAutocomplete
  v-model="selected"
  label="Search"
  item-title="name"
  item-value="id"
  :debounce-ms="300"
  :min-chars="1"
  :fetcher="async (q) => {
    return await $api('/search?q=' + q)
  }"
/&gt;</code></pre>
          </v-sheet>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
