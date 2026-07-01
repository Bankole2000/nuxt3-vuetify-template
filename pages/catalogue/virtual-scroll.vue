<script setup lang="ts">
definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Virtual Scroll', disabled: true },
  ],
})

const COUNT = 50_000

interface Row { id: number; name: string; email: string; status: string; score: number }

const statusOptions = ['Active', 'Inactive', 'Pending', 'Suspended']
const statusColor: Record<string, string> = {
  Active: 'success', Inactive: 'default', Pending: 'warning', Suspended: 'error',
}

const rows = Array.from({ length: COUNT }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  status: statusOptions[i % statusOptions.length],
  score: Math.floor(Math.random() * 100),
})) as Row[]

const search = ref('')
const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return q ? rows.filter(r => r.name.toLowerCase().includes(q) || r.email.includes(q)) : rows
})
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">Virtual Scroll</h1>
    <p class="text-body-2 text-medium-emphasis mb-8">
      <code>v-virtual-scroll</code> renders only visible rows — {{ COUNT.toLocaleString() }} items with no performance issues.
    </p>

    <v-card rounded="lg">
      <v-card-text class="pa-4 pb-2">
        <div class="d-flex align-center gap-4">
          <v-text-field
            v-model="search"
            placeholder="Filter by name or email…"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            style="max-width: 360px;"
          />
          <p class="text-caption text-medium-emphasis">
            Showing {{ filtered.length.toLocaleString() }} of {{ COUNT.toLocaleString() }} rows
          </p>
        </div>
      </v-card-text>

      <!-- Header -->
      <v-table density="compact">
        <thead>
          <tr>
            <th style="width:80px">#</th>
            <th>Name</th>
            <th class="d-none d-sm-table-cell">Email</th>
            <th style="width:120px">Status</th>
            <th style="width:80px" class="text-right">Score</th>
          </tr>
        </thead>
      </v-table>

      <v-virtual-scroll :items="filtered" height="480" item-height="48">
        <template #default="{ item }">
          <v-table density="compact">
            <tbody>
              <tr>
                <td style="width:80px" class="text-medium-emphasis text-caption">{{ item.id }}</td>
                <td class="text-body-2 font-weight-medium">{{ item.name }}</td>
                <td class="d-none d-sm-table-cell text-caption text-medium-emphasis">{{ item.email }}</td>
                <td style="width:120px">
                  <v-chip :color="statusColor[item.status]" size="x-small" variant="tonal">
                    {{ item.status }}
                  </v-chip>
                </td>
                <td style="width:80px" class="text-right text-body-2">{{ item.score }}</td>
              </tr>
            </tbody>
          </v-table>
        </template>
      </v-virtual-scroll>
    </v-card>
  </div>
</template>
