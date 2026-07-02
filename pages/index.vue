<script setup lang="ts">
// definePageMeta({ middleware: 'auth' }) // uncomment to protect this page

useSeo({ title: 'Dashboard', description: 'Your application dashboard.' })

const { user } = useAuth()
const toast = useToast()

const stats = [
  { label: 'Total Users', value: '12,430', change: '+8.2%', positive: true, icon: 'mdi-account-group-outline', color: 'primary' },
  { label: 'Revenue', value: '$48,295', change: '+12.5%', positive: true, icon: 'mdi-currency-usd', color: 'success' },
  { label: 'Active Sessions', value: '1,893', change: '-3.1%', positive: false, icon: 'mdi-monitor-dashboard', color: 'info' },
  { label: 'Open Tickets', value: '24', change: '+2', positive: false, icon: 'mdi-ticket-outline', color: 'warning' },
]

const sparklines = [
  [4, 8, 6, 10, 9, 14, 12],
  [10, 14, 12, 18, 15, 20, 19],
  [8, 7, 9, 6, 10, 8, 7],
  [2, 3, 5, 4, 6, 7, 9],
]

const recentActivity = [
  { id: 1, user: 'Alice Martin', action: 'Created a new project', time: '2 min ago', avatar: 'AM', color: 'primary' },
  { id: 2, user: 'Bob Chen', action: 'Updated billing information', time: '14 min ago', avatar: 'BC', color: 'success' },
  { id: 3, user: 'Carol White', action: 'Submitted a support ticket', time: '1 hr ago', avatar: 'CW', color: 'warning' },
  { id: 4, user: 'David Kim', action: 'Invited 3 team members', time: '3 hr ago', avatar: 'DK', color: 'info' },
  { id: 5, user: 'Eve Johnson', action: 'Upgraded to Pro plan', time: '5 hr ago', avatar: 'EJ', color: 'secondary' },
]

const tableHeaders = [
  { title: 'Name', key: 'name' },
  { title: 'Status', key: 'status' },
  { title: 'Role', key: 'role' },
  { title: 'Joined', key: 'joined' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const tableItems = [
  { name: 'Alice Martin', status: 'Active', role: 'Admin', joined: '2024-01-12' },
  { name: 'Bob Chen', status: 'Active', role: 'Editor', joined: '2024-02-03' },
  { name: 'Carol White', status: 'Inactive', role: 'Viewer', joined: '2024-03-18' },
  { name: 'David Kim', status: 'Active', role: 'Editor', joined: '2024-04-05' },
  { name: 'Eve Johnson', status: 'Pending', role: 'Viewer', joined: '2024-05-22' },
]

const statusColor: Record<string, string> = {
  Active: 'success',
  Inactive: 'default',
  Pending: 'warning',
}

const chartData = [28, 42, 35, 58, 44, 62, 55, 70, 65, 80, 72, 90]
const chartLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
</script>

<template>
  <div>
    <!-- Welcome banner -->
    <v-card color="primary" rounded="lg" class="mb-6 pa-2" variant="tonal">
      <v-card-text class="d-flex align-center justify-space-between flex-wrap gap-4">
        <div>
          <p class="text-h5 font-weight-bold mb-1">Welcome back, {{ user?.name }} 👋</p>
          <p class="text-body-2 text-medium-emphasis">Here's what's happening with your app today.</p>
        </div>
        <div class="d-flex gap-2">
          <v-btn color="primary" prepend-icon="mdi-plus" @click="toast.success('New item created!')">
            New Item
          </v-btn>
          <v-btn variant="tonal" prepend-icon="mdi-download-outline" @click="toast.info('Export started...')">
            Export
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Stats cards -->
    <v-row class="mb-2">
      <v-col v-for="(stat, i) in stats" :key="stat.label" cols="12" sm="6" lg="3">
        <v-card rounded="lg" height="100%">
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
              <v-chip
                :color="stat.positive ? 'success' : 'error'"
                size="small"
                variant="tonal"
                :prepend-icon="stat.positive ? 'mdi-trending-up' : 'mdi-trending-down'"
              >
                {{ stat.change }}
              </v-chip>
              <v-sparkline
                :model-value="sparklines[i]"
                :color="stat.color"
                line-width="2"
                smooth
                width="80"
                height="30"
                auto-draw
              />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Chart + Activity -->
    <v-row class="mb-2">
      <v-col cols="12" md="8">
        <v-card rounded="lg" height="100%">
          <v-card-title class="pa-5 pb-2 text-body-1 font-weight-bold">Monthly Revenue</v-card-title>
          <v-card-text class="pa-5 pt-2">
            <v-sparkline
              :model-value="chartData"
              :labels="chartLabels"
              color="primary"
              line-width="2"
              smooth
              auto-draw
              height="180"
              show-labels
              label-size="3"
              type="bar"
            />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card rounded="lg" height="100%">
          <v-card-title class="pa-5 pb-2 text-body-1 font-weight-bold">Recent Activity</v-card-title>
          <v-list lines="two" class="pa-2">
            <v-list-item
              v-for="item in recentActivity"
              :key="item.id"
              rounded="lg"
              class="mb-1"
            >
              <template #prepend>
                <v-avatar :color="item.color" size="36" variant="tonal" class="mr-3">
                  <span class="text-caption font-weight-bold">{{ item.avatar }}</span>
                </v-avatar>
              </template>
              <v-list-item-title class="text-body-2 font-weight-medium">{{ item.user }}</v-list-item-title>
              <v-list-item-subtitle class="text-caption">{{ item.action }}</v-list-item-subtitle>
              <template #append>
                <span class="text-caption text-medium-emphasis">{{ item.time }}</span>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <!-- Data table -->
    <v-card rounded="lg">
      <v-card-title class="pa-5 pb-0 d-flex align-center justify-space-between">
        <span class="text-body-1 font-weight-bold">Users</span>
        <v-btn size="small" variant="tonal" prepend-icon="mdi-plus" @click="toast.info('Add user flow coming soon')">
          Add User
        </v-btn>
      </v-card-title>
      <v-data-table
        :headers="tableHeaders"
        :items="tableItems"
        :items-per-page="5"
        class="pa-2"
      >
        <template #item.status="{ item }">
          <v-chip :color="statusColor[item.status]" size="small" variant="tonal">
            {{ item.status }}
          </v-chip>
        </template>
        <template #item.actions="{ item }">
          <v-btn icon="mdi-pencil-outline" size="small" variant="text" @click="toast.info(`Edit ${item.name}`)" />
          <v-btn icon="mdi-delete-outline" size="small" variant="text" color="error" @click="toast.warning(`Delete ${item.name}?`)" />
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>
