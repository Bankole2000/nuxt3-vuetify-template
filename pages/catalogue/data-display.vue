<script setup lang="ts">
definePageMeta({ layout: 'catalogue' })

const toast = useToast()

const tableHeaders = [
  { title: 'Name', key: 'name' },
  { title: 'Role', key: 'role' },
  { title: 'Status', key: 'status' },
  { title: 'Joined', key: 'joined' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const tableItems = [
  { name: 'Alice Martin', role: 'Admin', status: 'Active', joined: '2024-01-12' },
  { name: 'Bob Chen', role: 'Editor', status: 'Active', joined: '2024-02-03' },
  { name: 'Carol White', role: 'Viewer', status: 'Inactive', joined: '2024-03-18' },
  { name: 'David Kim', role: 'Editor', status: 'Pending', joined: '2024-04-05' },
  { name: 'Eve Johnson', role: 'Viewer', status: 'Active', joined: '2024-05-22' },
  { name: 'Frank Lee', role: 'Admin', status: 'Active', joined: '2024-06-10' },
]

const statusColor: Record<string, string> = {
  Active: 'success',
  Inactive: 'default',
  Pending: 'warning',
}

const sparklineData = {
  line: [4, 8, 5, 12, 9, 14, 11, 16, 13, 18],
  bar: [28, 42, 35, 58, 44, 62, 55, 70, 65, 80],
  area: [10, 15, 8, 20, 14, 22, 18, 25, 20, 28],
}

const statCards = [
  { label: 'Total Users', value: '12,430', change: '+8.2%', positive: true, icon: 'mdi-account-group-outline', color: 'primary', data: [4, 8, 6, 10, 9, 14, 12] },
  { label: 'Revenue', value: '$48,295', change: '+12.5%', positive: true, icon: 'mdi-currency-usd', color: 'success', data: [10, 14, 12, 18, 15, 20, 19] },
  { label: 'Sessions', value: '1,893', change: '-3.1%', positive: false, icon: 'mdi-monitor-dashboard', color: 'info', data: [8, 7, 9, 6, 10, 8, 7] },
]

const listItems = [
  { title: 'Alice Martin', subtitle: 'Updated billing info', time: '2 min ago', avatar: 'AM', color: 'primary' },
  { title: 'Bob Chen', subtitle: 'Submitted a ticket', time: '1 hr ago', avatar: 'BC', color: 'success' },
  { title: 'Carol White', subtitle: 'Invited team members', time: '3 hr ago', avatar: 'CW', color: 'warning' },
]
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">Data Display</h1>
    <p class="text-body-2 text-medium-emphasis mb-8">Tables, lists, sparklines and stat cards.</p>

    <!-- Stat cards -->
    <h2 class="text-overline text-medium-emphasis mb-4">Stat cards with sparklines</h2>
    <v-row class="mb-6">
      <v-col v-for="stat in statCards" :key="stat.label" cols="12" sm="4">
        <v-card rounded="lg">
          <v-card-text class="pa-5">
            <div class="d-flex align-start justify-space-between mb-4">
              <div>
                <p class="text-body-2 text-medium-emphasis mb-1">{{ stat.label }}</p>
                <p class="text-h5 font-weight-bold">{{ stat.value }}</p>
              </div>
              <v-avatar :color="stat.color" variant="tonal" size="44" rounded="lg">
                <v-icon :icon="stat.icon" />
              </v-avatar>
            </div>
            <div class="d-flex align-center justify-space-between">
              <v-chip :color="stat.positive ? 'success' : 'error'" size="small" variant="tonal"
                :prepend-icon="stat.positive ? 'mdi-trending-up' : 'mdi-trending-down'">
                {{ stat.change }}
              </v-chip>
              <v-sparkline :model-value="stat.data" :color="stat.color" line-width="2" smooth width="80" height="30" auto-draw />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Sparklines -->
    <h2 class="text-overline text-medium-emphasis mb-4">Sparkline types</h2>
    <v-row class="mb-6">
      <v-col cols="12" sm="4">
        <v-card rounded="lg" class="pa-5">
          <p class="text-caption text-medium-emphasis mb-2">Line</p>
          <v-sparkline :model-value="sparklineData.line" color="primary" line-width="2" smooth auto-draw height="60" />
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card rounded="lg" class="pa-5">
          <p class="text-caption text-medium-emphasis mb-2">Bar</p>
          <v-sparkline :model-value="sparklineData.bar" color="success" type="bar" auto-draw height="60" />
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card rounded="lg" class="pa-5">
          <p class="text-caption text-medium-emphasis mb-2">Area (fill)</p>
          <v-sparkline :model-value="sparklineData.area" color="info" line-width="2" smooth fill auto-draw height="60" />
        </v-card>
      </v-col>
    </v-row>

    <!-- Activity list -->
    <h2 class="text-overline text-medium-emphasis mb-4">Activity list</h2>
    <v-card rounded="lg" class="mb-6">
      <v-list lines="two" class="pa-2">
        <v-list-item v-for="item in listItems" :key="item.title" rounded="lg" class="mb-1">
          <template #prepend>
            <v-avatar :color="item.color" size="36" variant="tonal" class="mr-3">
              <span class="text-caption font-weight-bold">{{ item.avatar }}</span>
            </v-avatar>
          </template>
          <v-list-item-title class="text-body-2 font-weight-medium">{{ item.title }}</v-list-item-title>
          <v-list-item-subtitle class="text-caption">{{ item.subtitle }}</v-list-item-subtitle>
          <template #append>
            <span class="text-caption text-medium-emphasis">{{ item.time }}</span>
          </template>
        </v-list-item>
      </v-list>
    </v-card>

    <!-- Data table -->
    <h2 class="text-overline text-medium-emphasis mb-4">Data table</h2>
    <v-card rounded="lg">
      <v-card-title class="pa-5 pb-0 d-flex align-center justify-space-between">
        <span class="text-body-1 font-weight-bold">Users</span>
        <v-btn size="small" variant="tonal" prepend-icon="mdi-plus" @click="toast.info('Add user flow')">Add user</v-btn>
      </v-card-title>
      <v-data-table :headers="tableHeaders" :items="tableItems" :items-per-page="5" class="pa-2">
        <template #item.status="{ item }">
          <v-chip :color="statusColor[item.status]" size="small" variant="tonal">{{ item.status }}</v-chip>
        </template>
        <template #item.actions="{ item }">
          <v-btn icon="mdi-pencil-outline" size="small" variant="text" @click="toast.info(`Edit ${item.name}`)" />
          <v-btn icon="mdi-delete-outline" size="small" variant="text" color="error" @click="toast.warning(`Delete ${item.name}?`)" />
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>
