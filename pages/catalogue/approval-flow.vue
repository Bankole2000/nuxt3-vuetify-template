<script setup lang="ts">
import type { ApprovalRequest, ApprovalStep, ApprovalStatus } from '~/components/common/ApprovalFlow.vue'

definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Approval Flow', disabled: true },
  ],
})

useSeo({
  title: 'Approval Flow',
  description: 'Multi-step approval widget with status timeline, inline reviewer comments, approve/reject/revision actions and overall status banner.',
})

const tab      = ref('expense')
const infoOpen = ref(false)

const computeStatus = (steps: ApprovalStep[]): ApprovalStatus | 'draft' => {
  if (steps.some(s => s.status === 'rejected')) return 'rejected'
  if (steps.some(s => s.status === 'needs-revision')) return 'needs-revision'
  if (steps.every(s => s.status === 'approved')) return 'approved'
  return 'pending'
}

const handleAction = (
  request: ApprovalRequest,
  action: 'approve' | 'reject' | 'request-revision',
  stepId: string,
  comment: string,
) => {
  const step = request.steps.find(s => s.id === stepId)
  if (!step) return
  const statusMap: Record<typeof action, ApprovalStatus> = {
    'approve':          'approved',
    'reject':           'rejected',
    'request-revision': 'needs-revision',
  }
  step.status      = statusMap[action]
  step.comment     = comment || undefined
  step.completedAt = new Date().toISOString()
  request.status   = computeStatus(request.steps)
}

// ─── 1. Expense Claim ─────────────────────────────────────────────────────────

const expenseRequest = reactive<ApprovalRequest>({
  id:          'exp-001',
  title:       'Travel Expense Claim — Q2 Conference',
  description: 'Flights, hotel and transport costs for attending the AWS re:Invent conference in Las Vegas (3–7 June).',
  requestedBy: 'Sarah Mitchell',
  requestedAt: '2026-06-08T09:15:00Z',
  amount:      2340,
  currency:    '£',
  attachments: [
    { name: 'receipts.pdf',       size: '1.2 MB' },
    { name: 'itinerary.pdf',      size: '340 KB' },
  ],
  status: 'pending',
  steps: [
    {
      id:          'line-manager',
      label:       'Line Manager',
      status:      'approved',
      approver:    'James Okafor',
      comment:     'Verified against the travel policy. Approved.',
      completedAt: '2026-06-09T14:22:00Z',
    },
    {
      id:       'finance',
      label:    'Finance',
      status:   'pending',
      approver: 'Priya Sharma',
    },
    {
      id:    'legal',
      label: 'Legal',
      status: 'pending',
    },
  ],
})

const expenseCurrentStep = ref('finance')

const onExpense = (action: 'approve' | 'reject' | 'request-revision', stepId: string, comment: string) => {
  handleAction(expenseRequest, action, stepId, comment)
  if (action === 'approve') {
    const nextIdx = expenseRequest.steps.findIndex(s => s.id === stepId) + 1
    const next = expenseRequest.steps[nextIdx]
    expenseCurrentStep.value = next ? next.id : ''
  } else {
    expenseCurrentStep.value = ''
  }
}

// ─── 2. Leave Request ─────────────────────────────────────────────────────────

const leaveRequest = reactive<ApprovalRequest>({
  id:          'leave-001',
  title:       'Annual Leave Request — 10 Days',
  description: 'Annual leave from 14 July to 25 July 2026 (inclusive). No projects at critical stage during this period.',
  requestedBy: 'Tom Bergström',
  requestedAt: '2026-06-30T10:00:00Z',
  status:      'pending',
  steps: [
    {
      id:       'hr',
      label:    'HR',
      status:   'pending',
      approver: 'Natasha Reed',
    },
    {
      id:    'director',
      label: 'Director',
      status: 'pending',
    },
  ],
})

const leaveCurrentStep = ref('hr')

const onLeave = (action: 'approve' | 'reject' | 'request-revision', stepId: string, comment: string) => {
  handleAction(leaveRequest, action, stepId, comment)
  if (action === 'approve') {
    const nextIdx = leaveRequest.steps.findIndex(s => s.id === stepId) + 1
    const next = leaveRequest.steps[nextIdx]
    leaveCurrentStep.value = next ? next.id : ''
  } else {
    leaveCurrentStep.value = ''
  }
}

// ─── 3. Contract Sign-off ─────────────────────────────────────────────────────

const contractRequest = reactive<ApprovalRequest>({
  id:          'contract-001',
  title:       'Vendor Contract Sign-off — Acme Cloud Services',
  description: 'Annual SaaS agreement with Acme Cloud Services for infrastructure monitoring tooling. 3-year term with break clause at year 1.',
  requestedBy: 'David Chen',
  requestedAt: '2026-05-20T08:30:00Z',
  amount:      45000,
  currency:    '£',
  attachments: [
    { name: 'contract-v3.pdf',     size: '2.8 MB' },
    { name: 'vendor-assessment.pdf', size: '890 KB' },
    { name: 'data-processing-agreement.pdf', size: '450 KB' },
  ],
  status: 'needs-revision',
  steps: [
    {
      id:          'legal',
      label:       'Legal',
      status:      'approved',
      approver:    'Amanda Foster',
      comment:     'GDPR clauses reviewed and acceptable. DPA is in order.',
      completedAt: '2026-05-22T16:05:00Z',
    },
    {
      id:          'finance',
      label:       'Finance',
      status:      'approved',
      approver:    'Priya Sharma',
      comment:     'Budget confirmed. Capex pre-approved in Q2 planning.',
      completedAt: '2026-05-24T11:30:00Z',
    },
    {
      id:          'cto',
      label:       'CTO',
      status:      'needs-revision',
      approver:    'Marcus Webb',
      comment:     'SLA terms need tightening — 99.9% uptime is insufficient for our use case. Require 99.95% with financial penalties. Please renegotiate before CEO sign-off.',
      completedAt: '2026-05-27T14:10:00Z',
    },
    {
      id:    'ceo',
      label: 'CEO',
      status: 'pending',
    },
  ],
})

const contractCurrentStep = ref('ceo')

const onContract = (action: 'approve' | 'reject' | 'request-revision', stepId: string, comment: string) => {
  handleAction(contractRequest, action, stepId, comment)
  if (action === 'approve') {
    const nextIdx = contractRequest.steps.findIndex(s => s.id === stepId) + 1
    const next = contractRequest.steps[nextIdx]
    contractCurrentStep.value = next ? next.id : ''
  } else {
    contractCurrentStep.value = ''
  }
}

// ─── Use cases ────────────────────────────────────────────────────────────────

const USECASES = [
  {
    context: 'Verifiable Contracts (#14)',
    icon:    'mdi-file-sign',
    color:   'indigo',
    items: [
      { label: 'Contract sign-off flow',  detail: 'Legal, Finance, and C-suite steps mirror a real vendor contract approval chain. Each step captures reviewer identity, timestamp and comment for audit trail.' },
      { label: 'Multi-party sign-off',    detail: 'Sequential step gating ensures no stage is skipped — CEO only sees the action area once all preceding steps are resolved.' },
    ],
  },
  {
    context: 'Expense Tracker (#5)',
    icon:    'mdi-receipt-outline',
    color:   'orange',
    items: [
      { label: 'Expense claim approval',  detail: 'Line manager approves first, then Finance reviews receipts and amounts. The monetary badge makes the claim value immediately visible to every reviewer.' },
      { label: 'Attachment visibility',   detail: 'Compact attachment chips let reviewers see which supporting documents were submitted without needing a separate file list view.' },
    ],
  },
  {
    context: 'Portfolio Manager (#1)',
    icon:    'mdi-briefcase-outline',
    color:   'teal',
    items: [
      { label: 'Project budget requests',  detail: 'Gate capital expenditure behind a multi-step sign-off — proposal author, project sponsor, and finance controller each have a dedicated step.' },
    ],
  },
  {
    context: 'Workflow Engine (#3)',
    icon:    'mdi-vector-polyline',
    color:   'blue',
    items: [
      { label: 'Human-in-the-loop step',  detail: 'Drop ApprovalFlow into any workflow node that requires human review before continuing. Emit events feed back into the workflow state machine.' },
      { label: 'Needs-revision loop',     detail: 'The needs-revision status allows a rejected-but-correctable request to re-enter the flow, modelling real feedback loops.' },
    ],
  },
  {
    context: 'Guest Arrangements (#7)',
    icon:    'mdi-account-group-outline',
    color:   'pink',
    items: [
      { label: 'Vendor sign-off',         detail: 'Venue and catering vendor contracts follow the same Legal → Finance → CTO → CEO chain shown in the Contract tab demo.' },
    ],
  },
]
</script>

<template>
  <div>
    <div class="d-flex align-start justify-space-between gap-4 mb-1">
      <h1 class="text-h5 font-weight-bold">Approval Flow</h1>
      <v-btn icon="mdi-information-outline" variant="text" size="small" @click="infoOpen = true" />
    </div>
    <p class="text-body-2 text-medium-emphasis mb-6">
      Multi-step approval widget with an overall status banner, request summary card, vertical step
      timeline and inline reviewer actions (Approve / Request Revision / Reject). Parent owns
      all state — the component only emits.
    </p>

    <!-- Info dialog -->
    <v-dialog v-model="infoOpen" max-width="560" scrollable>
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center justify-space-between pt-5 px-6 pb-2">
          <span class="text-h6">Use cases &amp; project fit</span>
          <v-btn icon="mdi-close" variant="text" size="small" @click="infoOpen = false" />
        </v-card-title>
        <v-card-subtitle class="px-6 pb-3 text-wrap">
          Any feature that routes a document or request through sequential human reviewers fits this widget.
        </v-card-subtitle>
        <v-divider />
        <v-card-text class="px-4 py-4">
          <div v-for="group in USECASES" :key="group.context" class="af-uc-group">
            <div class="af-uc-header">
              <v-icon :icon="group.icon" :color="group.color" size="16" />
              <span class="af-uc-title">{{ group.context }}</span>
            </div>
            <ul class="af-uc-list">
              <li v-for="item in group.items" :key="item.label">
                <span class="af-uc-label">{{ item.label }}</span>
                <span class="af-uc-detail">{{ item.detail }}</span>
              </li>
            </ul>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Tabs -->
    <v-tabs v-model="tab" density="compact" class="mb-6">
      <v-tab value="expense">
        <v-icon start icon="mdi-receipt-outline" size="16" />
        Expense Claim
      </v-tab>
      <v-tab value="leave">
        <v-icon start icon="mdi-calendar-check-outline" size="16" />
        Leave Request
      </v-tab>
      <v-tab value="contract">
        <v-icon start icon="mdi-file-sign" size="16" />
        Contract Sign-off
      </v-tab>
    </v-tabs>

    <v-window v-model="tab">

      <!-- Expense Claim -->
      <v-window-item value="expense">
        <p class="text-caption text-medium-emphasis mb-4">
          A £2,340 travel expense claim. Line Manager has already approved; Finance is the current
          active reviewer. Try approving, rejecting or requesting a revision below.
        </p>
        <CommonApprovalFlow
          :request="expenseRequest"
          :current-step-id="expenseCurrentStep"
          @approve="(id, comment) => onExpense('approve', id, comment)"
          @reject="(id, comment) => onExpense('reject', id, comment)"
          @request-revision="(id, comment) => onExpense('request-revision', id, comment)"
        />
        <p class="text-caption text-medium-emphasis mt-4">Use case: Expense Tracker (#5)</p>
      </v-window-item>

      <!-- Leave Request -->
      <v-window-item value="leave">
        <p class="text-caption text-medium-emphasis mb-4">
          A 10-day annual leave request. HR is the first reviewer — act on it here.
          After HR approves, the Director step becomes the active one.
        </p>
        <CommonApprovalFlow
          :request="leaveRequest"
          :current-step-id="leaveCurrentStep"
          @approve="(id, comment) => onLeave('approve', id, comment)"
          @reject="(id, comment) => onLeave('reject', id, comment)"
          @request-revision="(id, comment) => onLeave('request-revision', id, comment)"
        />
        <p class="text-caption text-medium-emphasis mt-4">Use case: Guest Arrangements (#7)</p>
      </v-window-item>

      <!-- Contract Sign-off -->
      <v-window-item value="contract">
        <p class="text-caption text-medium-emphasis mb-4">
          A £45,000 vendor contract with a complex mixed-status flow. Legal and Finance have
          approved; the CTO requested a revision with detailed feedback. CEO is the current active
          step — they can approve, reject, or request another revision.
        </p>
        <CommonApprovalFlow
          :request="contractRequest"
          :current-step-id="contractCurrentStep"
          @approve="(id, comment) => onContract('approve', id, comment)"
          @reject="(id, comment) => onContract('reject', id, comment)"
          @request-revision="(id, comment) => onContract('request-revision', id, comment)"
        />
        <p class="text-caption text-medium-emphasis mt-4">Use cases: Verifiable Contracts (#14) · Workflow Engine (#3)</p>
      </v-window-item>

    </v-window>

    <!-- Usage -->
    <h2 class="text-overline text-medium-emphasis mt-10 mb-4">Usage</h2>
    <v-card rounded="lg" class="pa-5">
      <v-sheet rounded="lg" color="surface-variant" class="pa-4">
        <pre v-pre class="text-body-2"><code>&lt;CommonApprovalFlow
  :request="approvalRequest"
  current-step-id="finance"
  @approve="(stepId, comment) => handleApprove(stepId, comment)"
  @reject="(stepId, comment) => handleReject(stepId, comment)"
  @request-revision="(stepId, comment) => handleRevision(stepId, comment)"
/&gt;</code></pre>
      </v-sheet>
    </v-card>
  </div>
</template>

<style scoped>
.af-uc-group { margin-bottom: 20px; }
.af-uc-group:last-child { margin-bottom: 0; }
.af-uc-header { display: flex; align-items: center; gap: 7px; margin-bottom: 8px; padding: 0 4px; }
.af-uc-title { font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: rgba(var(--v-theme-on-surface), .55); }
.af-uc-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 2px; }
.af-uc-list li { display: flex; flex-direction: column; gap: 1px; padding: 7px 10px 7px 16px; border-radius: 8px; background: rgba(var(--v-theme-on-surface), .03); border-left: 2px solid rgba(var(--v-theme-on-surface), .08); }
.af-uc-label { font-size: 12px; font-weight: 600; color: rgb(var(--v-theme-on-surface)); line-height: 1.4; }
.af-uc-detail { font-size: 11px; color: rgba(var(--v-theme-on-surface), .5); line-height: 1.5; }
</style>
