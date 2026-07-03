<script setup lang="ts">
// definePageMeta({ middleware: 'auth' }) // uncomment to protect this page

useSeo({ title: 'Dashboard', description: 'Your application dashboard.' })

const { user } = useAuth()
const toast = useToast()

// ── KPI stats ─────────────────────────────────────────────────────────────────
const stats = [
  {
    label: 'Total Users',
    value: 48291,
    change: '+8.2%',
    positive: true,
    icon: 'mdi-account-group-outline',
    color: 'primary',
    prefix: '',
    suffix: '',
    decimals: 0,
    sparkline: [32, 38, 35, 44, 41, 50, 48],
  },
  {
    label: 'Monthly Revenue',
    value: 128540,
    change: '+12.5%',
    positive: true,
    icon: 'mdi-cash-multiple',
    color: 'success',
    prefix: '$',
    suffix: '',
    decimals: 0,
    sparkline: [60, 72, 68, 85, 79, 96, 91],
  },
  {
    label: 'Active Sessions',
    value: 1893,
    change: '-3.1%',
    positive: false,
    icon: 'mdi-monitor-dashboard',
    color: 'info',
    prefix: '',
    suffix: '',
    decimals: 0,
    sparkline: [50, 48, 52, 44, 46, 42, 40],
  },
  {
    label: 'Open Tickets',
    value: 24,
    change: '+2 today',
    positive: false,
    icon: 'mdi-ticket-outline',
    color: 'warning',
    prefix: '',
    suffix: '',
    decimals: 0,
    sparkline: [10, 14, 12, 18, 16, 22, 24],
  },
]

// ── Revenue chart ─────────────────────────────────────────────────────────────
const revenueData = [42, 58, 51, 74, 63, 85, 77, 96, 88, 110, 102, 128]
const revenueLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// ── Traffic breakdown ─────────────────────────────────────────────────────────
const trafficSources = [
  { label: 'Organic search', value: 42, color: 'primary' },
  { label: 'Direct', value: 24, color: 'success' },
  { label: 'Referral', value: 18, color: 'info' },
  { label: 'Social', value: 16, color: 'warning' },
]

// ── Tasks ─────────────────────────────────────────────────────────────────────
const tasks = ref([
  { id: 1, title: 'Finalise Q3 report', done: false, priority: 'high', assignee: 'AM' },
  { id: 2, title: 'Review pull request #142', done: false, priority: 'medium', assignee: 'BC' },
  { id: 3, title: 'Update onboarding flow', done: true, priority: 'low', assignee: 'CW' },
  { id: 4, title: 'Fix mobile nav regression', done: false, priority: 'high', assignee: 'DK' },
  { id: 5, title: 'Write release notes v2.4', done: true, priority: 'low', assignee: 'EJ' },
])

const priorityColor: Record<string, string> = { high: 'error', medium: 'warning', low: 'success' }
const pendingTasks = computed(() => tasks.value.filter(t => !t.done).length)

// ── Activity feed ─────────────────────────────────────────────────────────────
const activity = [
  { id: 1, user: 'Alice Martin', initials: 'AM', color: 'primary', action: 'created project', target: 'Design System v3', time: '2 min ago', icon: 'mdi-folder-plus-outline' },
  { id: 2, user: 'Bob Chen', initials: 'BC', color: 'success', action: 'merged', target: 'PR #142 — auth refactor', time: '18 min ago', icon: 'mdi-source-merge' },
  { id: 3, user: 'Carol White', initials: 'CW', color: 'warning', action: 'opened ticket', target: 'Mobile nav broken on iOS 17', time: '1 hr ago', icon: 'mdi-ticket-outline' },
  { id: 4, user: 'David Kim', initials: 'DK', color: 'info', action: 'invited', target: '3 new team members', time: '3 hr ago', icon: 'mdi-account-plus-outline' },
  { id: 5, user: 'Eve Johnson', initials: 'EJ', color: 'secondary', action: 'upgraded to', target: 'Pro plan', time: '5 hr ago', icon: 'mdi-star-outline' },
  { id: 6, user: 'Frank Osei', initials: 'FO', color: 'error', action: 'deleted', target: 'Legacy API endpoints', time: '8 hr ago', icon: 'mdi-delete-outline' },
]

// ── Quick actions ─────────────────────────────────────────────────────────────
const quickActions = [
  { label: 'New project', icon: 'mdi-folder-plus-outline', color: 'primary' },
  { label: 'Invite user', icon: 'mdi-account-plus-outline', color: 'success' },
  { label: 'Generate report', icon: 'mdi-file-chart-outline', color: 'info' },
  { label: 'Open support', icon: 'mdi-headset', color: 'warning' },
]

// ── Users table ───────────────────────────────────────────────────────────────
const tableHeaders = [
  { title: 'Name', key: 'name' },
  { title: 'Role', key: 'role' },
  { title: 'Status', key: 'status' },
  { title: 'Joined', key: 'joined' },
  { title: '', key: 'actions', sortable: false, align: 'end' as const },
]

const tableItems = [
  { name: 'Alice Martin', status: 'Active', role: 'Admin', joined: '12 Jan 2024' },
  { name: 'Bob Chen', status: 'Active', role: 'Editor', joined: '3 Feb 2024' },
  { name: 'Carol White', status: 'Inactive', role: 'Viewer', joined: '18 Mar 2024' },
  { name: 'David Kim', status: 'Active', role: 'Editor', joined: '5 Apr 2024' },
  { name: 'Eve Johnson', status: 'Pending', role: 'Viewer', joined: '22 May 2024' },
]

const statusColor: Record<string, string> = { Active: 'success', Inactive: 'default', Pending: 'warning' }

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
})
</script>

<template>
  <div>
    <!-- Welcome banner -->
    <v-card rounded="lg" class="mb-6 overflow-hidden" style="background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgba(var(--v-theme-primary), 0.7) 100%);">
      <v-card-text class="pa-6 d-flex align-center justify-space-between flex-wrap gap-4">
        <div>
          <p class="text-h5 font-weight-bold text-white mb-1">
            {{ greeting }}, {{ user?.name?.split(' ')[0] }} 👋
          </p>
          <p class="text-body-2 text-white" style="opacity: 0.85;">
            Here's what's happening with your app today.
          </p>
        </div>
        <div class="d-flex gap-2 flex-wrap">
          <v-btn
            color="white"
            variant="tonal"
            prepend-icon="mdi-plus"
            @click="toast.success('New project created!')"
          >
            New Project
          </v-btn>
          <v-btn
            variant="outlined"
            color="white"
            prepend-icon="mdi-download-outline"
            @click="toast.info('Export started…')"
          >
            Export
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- KPI cards -->
    <v-row class="mb-2">
      <v-col v-for="stat in stats" :key="stat.label" cols="12" sm="6" lg="3">
        <v-card rounded="lg" height="100%">
          <v-card-text class="pa-5">
            <div class="d-flex align-start justify-space-between mb-3">
              <div>
                <p class="text-body-2 text-medium-emphasis mb-1">{{ stat.label }}</p>
                <p class="text-h5 font-weight-bold">
                  <CommonAnimatedCounter
                    :value="stat.value"
                    :prefix="stat.prefix"
                    :suffix="stat.suffix"
                    :decimals="stat.decimals"
                    :duration="1200"
                    easing="ease-out"
                  />
                </p>
              </div>
              <v-avatar :color="stat.color" variant="tonal" size="44" rounded="lg">
                <v-icon :icon="stat.icon" />
              </v-avatar>
            </div>
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center gap-1">
                <v-icon
                  :icon="stat.positive ? 'mdi-trending-up' : 'mdi-trending-down'"
                  :color="stat.positive ? 'success' : 'error'"
                  size="16"
                />
                <span class="text-caption" :class="stat.positive ? 'text-success' : 'text-error'">
                  {{ stat.change }}
                </span>
                <span class="text-caption text-medium-emphasis">vs last month</span>
              </div>
              <v-sparkline
                :model-value="stat.sparkline"
                :color="stat.color"
                line-width="2"
                smooth
                width="72"
                height="28"
                auto-draw
              />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Revenue chart + Traffic breakdown -->
    <v-row class="mb-2">
      <v-col cols="12" md="8">
        <v-card rounded="lg" height="100%">
          <v-card-text class="pa-5">
            <div class="d-flex align-center justify-space-between mb-1">
              <div>
                <p class="text-body-1 font-weight-bold">Revenue trend</p>
                <p class="text-caption text-medium-emphasis">Monthly revenue · 2024</p>
              </div>
              <v-chip color="success" size="small" variant="tonal" prepend-icon="mdi-trending-up">
                +28.4% YoY
              </v-chip>
            </div>
            <v-sparkline
              :model-value="revenueData"
              :labels="revenueLabels"
              color="primary"
              line-width="2"
              smooth
              fill
              auto-draw
              height="160"
              show-labels
              label-size="3"
              padding="12"
            />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card rounded="lg" height="100%">
          <v-card-text class="pa-5">
            <p class="text-body-1 font-weight-bold mb-1">Traffic sources</p>
            <p class="text-caption text-medium-emphasis mb-4">Last 30 days</p>
            <div class="d-flex flex-column gap-3">
              <div v-for="source in trafficSources" :key="source.label">
                <div class="d-flex justify-space-between text-body-2 mb-1">
                  <span>{{ source.label }}</span>
                  <span class="font-weight-medium">{{ source.value }}%</span>
                </div>
                <v-progress-linear
                  :model-value="source.value"
                  :color="source.color"
                  rounded
                  height="6"
                  bg-color="surface-variant"
                />
              </div>
            </div>
            <v-divider class="my-4" />
            <div class="d-flex justify-space-between text-caption text-medium-emphasis">
              <span>Total sessions</span>
              <span class="font-weight-medium text-on-surface">
                <CommonAnimatedCounter :value="24871" :duration="1400" />
              </span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tasks + Activity -->
    <v-row class="mb-2">
      <!-- Tasks -->
      <v-col cols="12" md="5">
        <v-card rounded="lg" height="100%">
          <v-card-text class="pa-5">
            <div class="d-flex align-center justify-space-between mb-4">
              <div>
                <p class="text-body-1 font-weight-bold">Tasks</p>
                <p class="text-caption text-medium-emphasis">{{ pendingTasks }} pending</p>
              </div>
              <v-btn size="x-small" variant="tonal" color="primary" prepend-icon="mdi-plus" @click="toast.info('Add task')">
                Add
              </v-btn>
            </div>
            <div class="d-flex flex-column gap-2">
              <div
                v-for="task in tasks"
                :key="task.id"
                class="d-flex align-center gap-3 pa-3 rounded-lg"
                style="border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));"
              >
                <v-checkbox-btn
                  v-model="task.done"
                  density="compact"
                  color="primary"
                />
                <div class="flex-1 overflow-hidden">
                  <p
                    class="text-body-2 text-truncate"
                    :class="task.done ? 'text-decoration-line-through text-medium-emphasis' : ''"
                  >
                    {{ task.title }}
                  </p>
                </div>
                <div class="d-flex align-center gap-2 flex-shrink-0">
                  <v-chip :color="priorityColor[task.priority]" size="x-small" variant="tonal">
                    {{ task.priority }}
                  </v-chip>
                  <v-avatar size="22" color="primary" variant="tonal">
                    <span style="font-size: 9px; font-weight: 700;">{{ task.assignee }}</span>
                  </v-avatar>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Activity feed -->
      <v-col cols="12" md="7">
        <v-card rounded="lg" height="100%">
          <v-card-text class="pa-5">
            <p class="text-body-1 font-weight-bold mb-4">Recent activity</p>
            <div class="d-flex flex-column">
              <div
                v-for="(item, activityIndex) in activity"
                :key="item.id"
                class="d-flex gap-3"
              >
                <!-- Avatar + timeline line -->
                <div class="d-flex flex-column align-center" style="width: 36px; flex-shrink: 0;">
                  <v-avatar :color="item.color" size="32" variant="tonal">
                    <span class="font-weight-bold" style="font-size: 10px;">{{ item.initials }}</span>
                  </v-avatar>
                  <div
                    v-if="activityIndex < activity.length - 1"
                    style="width: 2px; flex: 1; min-height: 16px; background: rgba(var(--v-border-color), var(--v-border-opacity)); margin: 4px 0;"
                  />
                </div>

                <!-- Content -->
                <div class="pb-4 flex-1 overflow-hidden">
                  <p class="text-body-2 mb-0">
                    <span class="font-weight-medium">{{ item.user }}</span>
                    <span class="text-medium-emphasis"> {{ item.action }} </span>
                    <span class="font-weight-medium">{{ item.target }}</span>
                  </p>
                  <p class="text-caption text-medium-emphasis mt-0">{{ item.time }}</p>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Quick actions + Users table -->
    <v-row>
      <!-- Quick actions -->
      <v-col cols="12" md="4">
        <v-card rounded="lg" height="100%">
          <v-card-text class="pa-5">
            <p class="text-body-1 font-weight-bold mb-4">Quick actions</p>
            <div class="d-flex flex-column gap-2">
              <v-btn
                v-for="action in quickActions"
                :key="action.label"
                :color="action.color"
                variant="tonal"
                :prepend-icon="action.icon"
                justify="start"
                class="justify-start"
                @click="toast.info(action.label)"
              >
                {{ action.label }}
              </v-btn>
            </div>
            <v-divider class="my-4" />
            <v-btn
              variant="text"
              size="small"
              prepend-icon="mdi-puzzle-outline"
              to="/catalogue"
              block
              class="text-medium-emphasis"
            >
              Browse component catalogue
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Users table -->
      <v-col cols="12" md="8">
        <v-card rounded="lg">
          <v-card-text class="pa-5 pb-0">
            <div class="d-flex align-center justify-space-between">
              <div>
                <p class="text-body-1 font-weight-bold">Users</p>
                <p class="text-caption text-medium-emphasis">{{ tableItems.length }} total members</p>
              </div>
              <v-btn
                size="small"
                color="primary"
                variant="tonal"
                prepend-icon="mdi-account-plus-outline"
                @click="toast.info('Invite user')"
              >
                Invite
              </v-btn>
            </div>
          </v-card-text>
          <v-data-table
            :headers="tableHeaders"
            :items="tableItems"
            :items-per-page="5"
            hide-default-footer
          >
            <template #item.name="{ item }">
              <div class="d-flex align-center gap-2 py-1">
                <v-avatar size="30" color="primary" variant="tonal">
                  <span class="font-weight-bold" style="font-size: 10px;">
                    {{ item.name.split(' ').map((n: string) => n[0]).join('') }}
                  </span>
                </v-avatar>
                <span class="text-body-2 font-weight-medium">{{ item.name }}</span>
              </div>
            </template>
            <template #item.status="{ item }">
              <v-chip :color="statusColor[item.status]" size="small" variant="tonal">
                {{ item.status }}
              </v-chip>
            </template>
            <template #item.actions="{ item }">
              <v-btn icon="mdi-pencil-outline" size="small" variant="text" @click="toast.info(`Edit ${item.name}`)" />
              <v-btn icon="mdi-dots-vertical" size="small" variant="text" @click="toast.info(`More options for ${item.name}`)" />
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
