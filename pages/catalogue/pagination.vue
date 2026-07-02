<script setup lang="ts">
definePageMeta({ layout: 'catalogue' })

interface Item {
  id: number
  name: string
  email: string
  role: string
  status: string
}

const ALL_ITEMS: Item[] = Array.from({ length: 87 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: (['Admin', 'Editor', 'Viewer'] as const)[i % 3]!,
  status: (['Active', 'Inactive', 'Pending'] as const)[i % 3]!,
}))

const mockFetch = async (page: number, pageSize: number) => {
  await new Promise(r => setTimeout(r, 400))
  const start = (page - 1) * pageSize
  return {
    items: ALL_ITEMS.slice(start, start + pageSize),
    total: ALL_ITEMS.length,
  }
}

// --- Traditional pagination ---
const {
  items: pageItems,
  page,
  totalPages,
  total: pageTotal,
  loading: pageLoading,
  hasNext,
  hasPrev,
  goToPage,
  nextPage,
  prevPage,
  setPageSize,
} = usePagination(mockFetch, { initialPage: 1, initialPageSize: 8 })

// --- Infinite scroll ---
const {
  items: scrollItems,
  total: scrollTotal,
  loading: scrollLoading,
  hasMore,
  sentinel,
  reset,
} = useInfiniteScroll(mockFetch, { pageSize: 10 })

const statusColor: Record<string, string> = {
  Active: 'success', Inactive: 'default', Pending: 'warning',
}

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Name', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Role', key: 'role' },
  { title: 'Status', key: 'status' },
]
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">Pagination & Infinite Scroll</h1>
    <p class="text-body-2 text-medium-emphasis mb-8">
      Two composables for server-side data loading — page-based and append-on-scroll.
    </p>

    <!-- Traditional pagination -->
    <h2 class="text-overline text-medium-emphasis mb-4">usePagination — page-based</h2>
    <v-card rounded="lg" class="mb-8">
      <v-data-table
        :headers="headers"
        :items="pageItems"
        :loading="pageLoading"
        hide-default-footer
        class="pa-2"
      >
        <template #item.status="{ item }">
          <v-chip :color="statusColor[item.status]" size="small" variant="tonal">{{ item.status }}</v-chip>
        </template>
      </v-data-table>

      <div class="d-flex align-center justify-space-between px-4 py-3 border-t">
        <div class="d-flex align-center gap-2">
          <span class="text-body-2 text-medium-emphasis">Rows per page:</span>
          <v-select
            :model-value="8"
            :items="[5, 8, 10, 20]"
            density="compact"
            variant="outlined"
            hide-details
            style="width: 80px;"
            @update:model-value="setPageSize"
          />
        </div>
        <div class="d-flex align-center gap-2">
          <span class="text-body-2 text-medium-emphasis">
            Page {{ page }} of {{ totalPages }} · {{ pageTotal }} total
          </span>
          <v-btn-group density="compact" variant="tonal">
            <v-btn icon="mdi-chevron-left" :disabled="!hasPrev || pageLoading" @click="prevPage" />
            <v-btn icon="mdi-chevron-right" :disabled="!hasNext || pageLoading" @click="nextPage" />
          </v-btn-group>
        </div>
      </div>
    </v-card>

    <!-- Infinite scroll -->
    <h2 class="text-overline text-medium-emphasis mb-4">useInfiniteScroll — append on scroll</h2>
    <v-card rounded="lg" class="mb-2">
      <v-card-text class="pa-4 pb-2 d-flex align-center justify-space-between">
        <span class="text-body-2 text-medium-emphasis">
          Showing {{ scrollItems.length }} of {{ scrollTotal }}
        </span>
        <v-btn size="small" variant="text" prepend-icon="mdi-refresh" @click="reset">Reset</v-btn>
      </v-card-text>

      <v-list class="pa-2" style="max-height: 420px; overflow-y: auto;">
        <v-list-item
          v-for="item in scrollItems"
          :key="item.id"
          rounded="lg"
          class="mb-1"
        >
          <template #prepend>
            <v-avatar color="primary" variant="tonal" size="36" class="mr-3">
              <span class="text-caption font-weight-bold">{{ item.id }}</span>
            </v-avatar>
          </template>
          <v-list-item-title class="text-body-2 font-weight-medium">{{ item.name }}</v-list-item-title>
          <v-list-item-subtitle class="text-caption">{{ item.email }}</v-list-item-subtitle>
          <template #append>
            <v-chip :color="statusColor[item.status]" size="x-small" variant="tonal">{{ item.status }}</v-chip>
          </template>
        </v-list-item>

        <!-- Sentinel triggers the next page load -->
        <div ref="sentinel" class="text-center py-3">
          <v-progress-circular v-if="scrollLoading" indeterminate color="primary" size="24" />
          <span v-else-if="!hasMore" class="text-caption text-medium-emphasis">All items loaded</span>
        </div>
      </v-list>
    </v-card>
  </div>
</template>
