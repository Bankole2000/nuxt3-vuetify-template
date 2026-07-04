<script setup lang="ts">
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'needs-revision'

export interface ApprovalStep {
  id:           string
  label:        string
  status:       ApprovalStatus
  approver?:    string
  comment?:     string
  completedAt?: string
}

export interface ApprovalRequest {
  id:           string
  title:        string
  description:  string
  requestedBy:  string
  requestedAt:  string
  amount?:      number
  currency?:    string
  attachments?: { name: string; size: string }[]
  steps:        ApprovalStep[]
  status:       ApprovalStatus | 'draft'
}

const props = withDefaults(defineProps<{
  request:        ApprovalRequest
  currentStepId?: string
  readonly?:      boolean
}>(), {
  currentStepId: undefined,
  readonly:      false,
})

const emit = defineEmits<{
  'approve':          [stepId: string, comment: string]
  'reject':           [stepId: string, comment: string]
  'request-revision': [stepId: string, comment: string]
}>()

const actionComment = ref('')

const statusConfig: Record<ApprovalStatus | 'draft', { color: string; icon: string; label: string; bannerColor: string }> = {
  pending:          { color: 'amber',   icon: 'mdi-clock-outline',          label: 'Pending',           bannerColor: 'amber-lighten-5' },
  approved:         { color: 'success', icon: 'mdi-check-circle-outline',   label: 'Approved',          bannerColor: 'green-lighten-5' },
  rejected:         { color: 'error',   icon: 'mdi-close-circle-outline',   label: 'Rejected',          bannerColor: 'red-lighten-5' },
  'needs-revision': { color: 'orange',  icon: 'mdi-refresh-circle',         label: 'Needs Revision',    bannerColor: 'orange-lighten-5' },
  draft:            { color: 'default', icon: 'mdi-pencil-outline',         label: 'Draft',             bannerColor: 'grey-lighten-5' },
}

const stepStatusConfig: Record<ApprovalStatus, { color: string; icon: string }> = {
  pending:          { color: 'amber',   icon: 'mdi-clock-outline' },
  approved:         { color: 'success', icon: 'mdi-check' },
  rejected:         { color: 'error',   icon: 'mdi-close' },
  'needs-revision': { color: 'orange',  icon: 'mdi-keyboard-return' },
}

const overallConfig = computed(() => statusConfig[props.request.status])

const isActionStep = (step: ApprovalStep) =>
  !props.readonly &&
  step.id === props.currentStepId &&
  step.status === 'pending'

const formatDate = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatCurrency = (amount: number, currency?: string) => {
  const sym = currency ?? '£'
  return `${sym}${amount.toLocaleString('en-GB', { minimumFractionDigits: 0 })}`
}

const onApprove = (stepId: string) => {
  emit('approve', stepId, actionComment.value)
  actionComment.value = ''
}

const onReject = (stepId: string) => {
  emit('reject', stepId, actionComment.value)
  actionComment.value = ''
}

const onRequestRevision = (stepId: string) => {
  emit('request-revision', stepId, actionComment.value)
  actionComment.value = ''
}
</script>

<template>
  <div class="af-root">
    <!-- Overall status banner -->
    <v-alert
      :color="overallConfig.color"
      :icon="overallConfig.icon"
      variant="tonal"
      density="compact"
      rounded="lg"
      class="mb-4"
    >
      <template #title>
        <span class="text-body-2 font-weight-bold">{{ overallConfig.label }}</span>
      </template>
      <span v-if="request.status === 'approved'" class="text-body-2">Request fully approved.</span>
      <span v-else-if="request.status === 'rejected'" class="text-body-2">Request has been rejected.</span>
      <span v-else-if="request.status === 'needs-revision'" class="text-body-2">Revision requested — awaiting resubmission.</span>
      <span v-else-if="request.status === 'pending'" class="text-body-2">Awaiting approval.</span>
    </v-alert>

    <!-- Request summary card -->
    <v-card rounded="lg" border elevation="0" class="mb-6">
      <v-card-text class="pa-5">
        <div class="d-flex align-start justify-space-between gap-4 flex-wrap mb-3">
          <div>
            <p class="text-h6 font-weight-bold mb-1">{{ request.title }}</p>
            <p class="text-body-2 text-medium-emphasis">{{ request.description }}</p>
          </div>
          <v-chip
            v-if="request.amount != null"
            :color="overallConfig.color"
            variant="tonal"
            size="small"
            class="flex-shrink-0 font-weight-bold"
          >
            {{ formatCurrency(request.amount!, request.currency) }}
          </v-chip>
        </div>

        <div class="d-flex flex-wrap gap-4 text-caption text-medium-emphasis">
          <span>
            <v-icon icon="mdi-account-outline" size="14" class="mr-1" />
            {{ request.requestedBy }}
          </span>
          <span>
            <v-icon icon="mdi-calendar-outline" size="14" class="mr-1" />
            {{ formatDate(request.requestedAt) }}
          </span>
        </div>

        <div v-if="request.attachments && request.attachments.length" class="d-flex flex-wrap gap-2 mt-3">
          <v-chip
            v-for="att in request.attachments"
            :key="att.name"
            size="x-small"
            variant="outlined"
            prepend-icon="mdi-paperclip"
          >
            {{ att.name }} <span class="text-disabled ml-1">({{ att.size }})</span>
          </v-chip>
        </div>
      </v-card-text>
    </v-card>

    <!-- Step timeline -->
    <div class="af-steps">
      <div
        v-for="(step, idx) in request.steps"
        :key="step.id"
        class="af-step"
        :class="{ 'af-step--last': idx === request.steps.length - 1 }"
      >
        <!-- Connector line + dot column -->
        <div class="af-step-track">
          <div
            class="af-step-dot"
            :class="`bg-${stepStatusConfig[step.status].color}`"
          >
            <v-icon
              :icon="stepStatusConfig[step.status].icon"
              size="14"
              color="white"
            />
          </div>
          <div v-if="idx < request.steps.length - 1" class="af-step-line" />
        </div>

        <!-- Content column -->
        <div class="af-step-content">
          <div class="d-flex align-center justify-space-between gap-2 flex-wrap mb-1">
            <div class="d-flex align-center gap-2">
              <span class="text-body-2 font-weight-bold">{{ step.label }}</span>
              <v-chip
                :color="stepStatusConfig[step.status].color"
                size="x-small"
                variant="tonal"
              >
                {{ step.status.replace('-', ' ') }}
              </v-chip>
            </div>
            <span v-if="step.completedAt" class="text-caption text-disabled flex-shrink-0">
              {{ formatDate(step.completedAt) }}
            </span>
          </div>

          <p v-if="step.approver" class="text-caption text-medium-emphasis mb-1">
            <v-icon icon="mdi-account-outline" size="12" class="mr-1" />
            {{ step.approver }}
          </p>

          <p v-if="step.comment" class="text-body-2 text-medium-emphasis mb-2 af-step-comment">
            <v-icon icon="mdi-comment-text-outline" size="14" class="mr-1 align-middle" />
            {{ step.comment }}
          </p>

          <!-- Action area: only for the current pending step -->
          <div v-if="isActionStep(step)" class="af-action-area mt-3">
            <v-textarea
              v-model="actionComment"
              label="Comment (optional)"
              variant="outlined"
              density="compact"
              rows="2"
              hide-details
              rounded="lg"
              class="mb-3"
            />
            <div class="d-flex gap-2 flex-wrap">
              <v-btn
                color="success"
                variant="tonal"
                size="small"
                prepend-icon="mdi-check"
                @click="onApprove(step.id)"
              >
                Approve
              </v-btn>
              <v-btn
                color="orange"
                variant="tonal"
                size="small"
                prepend-icon="mdi-keyboard-return"
                @click="onRequestRevision(step.id)"
              >
                Request Revision
              </v-btn>
              <v-btn
                color="error"
                variant="tonal"
                size="small"
                prepend-icon="mdi-close"
                @click="onReject(step.id)"
              >
                Reject
              </v-btn>
            </div>
          </div>

          <div
            v-if="idx < request.steps.length - 1"
            class="af-step-spacer"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.af-root {
  container-type: inline-size;
}

.af-steps {
  display: flex;
  flex-direction: column;
}

.af-step {
  display: flex;
  gap: 16px;
  position: relative;
}

.af-step-track {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 28px;
}

.af-step-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  z-index: 1;
}

.af-step-line {
  width: 2px;
  flex: 1;
  min-height: 16px;
  background: rgba(var(--v-border-color), var(--v-border-opacity));
  margin-top: 4px;
  margin-bottom: 4px;
}

.af-step-content {
  flex: 1;
  min-width: 0;
  padding-bottom: 4px;
}

.af-step-spacer {
  height: 8px;
}

.af-step-comment {
  background: rgba(var(--v-theme-on-surface), .03);
  border-left: 2px solid rgba(var(--v-theme-on-surface), .1);
  padding: 6px 10px;
  border-radius: 0 6px 6px 0;
  line-height: 1.5;
}

.af-action-area {
  background: rgba(var(--v-theme-on-surface), .02);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 10px;
  padding: 12px;
}
</style>
