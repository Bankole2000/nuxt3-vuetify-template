<script setup lang="ts">
import type { AuditEntry } from '~/components/common/AuditLog.vue'

definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Audit Log', disabled: true },
  ],
})

useSeo({
  title: 'Audit Log',
  description: 'Append-only activity log with relative timestamps, per-action icons, actor avatars, field-level diff viewer, search and action-type filters.',
})

const tab      = ref('project')
const infoOpen = ref(false)

function ago(ms: number): string {
  return new Date(Date.now() - ms).toISOString()
}

const S  = 1000
const M  = 60 * S
const H  = 60 * M
const D  = 24 * H

const projectEntries: AuditEntry[] = [
  {
    id: 'p1',
    action: 'create',
    actor: { id: 'alice', name: 'Alice Chen', role: 'Project Manager' },
    timestamp: ago(2 * M),
    entity: 'Task: Update homepage hero',
    summary: 'created a new task',
    changes: [],
  },
  {
    id: 'p2',
    action: 'assign',
    actor: { id: 'alice', name: 'Alice Chen', role: 'Project Manager' },
    timestamp: ago(5 * M),
    entity: 'Task: Update homepage hero',
    summary: 'assigned task to Bob Smith',
    changes: [
      { field: 'Assignee', oldValue: 'Unassigned', newValue: 'Bob Smith' },
    ],
  },
  {
    id: 'p3',
    action: 'comment',
    actor: { id: 'bob', name: 'Bob Smith', role: 'Frontend Dev' },
    timestamp: ago(12 * M),
    entity: 'Task: Update homepage hero',
    summary: 'left a comment',
    metadata: { Comment: 'Working on the design, will push a draft tonight.' },
  },
  {
    id: 'p4',
    action: 'update',
    actor: { id: 'bob', name: 'Bob Smith', role: 'Frontend Dev' },
    timestamp: ago(28 * M),
    entity: 'Task: Fix login redirect bug',
    summary: 'updated task details',
    changes: [
      { field: 'Priority', oldValue: 'Medium', newValue: 'High' },
      { field: 'Due Date', oldValue: '2026-07-10', newValue: '2026-07-06' },
    ],
  },
  {
    id: 'p5',
    action: 'complete',
    actor: { id: 'carol', name: 'Carol White', role: 'QA Engineer' },
    timestamp: ago(1 * H + 10 * M),
    entity: 'Task: Write unit tests for auth module',
    summary: 'marked task as complete',
  },
  {
    id: 'p6',
    action: 'reopen',
    actor: { id: 'alice', name: 'Alice Chen', role: 'Project Manager' },
    timestamp: ago(2 * H),
    entity: 'Task: Write unit tests for auth module',
    summary: 're-opened task',
    changes: [
      { field: 'Status', oldValue: 'Complete', newValue: 'In Progress' },
      { field: 'Note', oldValue: '', newValue: 'Missing edge cases for OAuth flow' },
    ],
  },
  {
    id: 'p7',
    action: 'create',
    actor: { id: 'alice', name: 'Alice Chen', role: 'Project Manager' },
    timestamp: ago(3 * H + 20 * M),
    entity: 'Project: Q3 Redesign',
    summary: 'created new project',
    metadata: { Team: 'Product', Sprint: 'Sprint 12', Budget: '$45,000' },
  },
  {
    id: 'p8',
    action: 'update',
    actor: { id: 'carol', name: 'Carol White', role: 'QA Engineer' },
    timestamp: ago(5 * H),
    entity: 'Task: Accessibility audit',
    changes: [
      { field: 'Tags', oldValue: 'qa', newValue: 'qa, a11y, priority' },
      { field: 'Estimate', oldValue: '2h', newValue: '4h' },
    ],
  },
  {
    id: 'p9',
    action: 'assign',
    actor: { id: 'alice', name: 'Alice Chen', role: 'Project Manager' },
    timestamp: ago(7 * H + 30 * M),
    entity: 'Task: Accessibility audit',
    summary: 'reassigned task',
    changes: [
      { field: 'Assignee', oldValue: 'Bob Smith', newValue: 'Carol White' },
    ],
  },
  {
    id: 'p10',
    action: 'delete',
    actor: { id: 'alice', name: 'Alice Chen', role: 'Project Manager' },
    timestamp: ago(1 * D),
    entity: 'Task: Legacy API migration (v1)',
    summary: 'deleted task',
    metadata: { Reason: 'Duplicate of Task #88' },
  },
  {
    id: 'p11',
    action: 'comment',
    actor: { id: 'bob', name: 'Bob Smith', role: 'Frontend Dev' },
    timestamp: ago(1 * D + 2 * H),
    entity: 'Task: Dark mode toggle',
    summary: 'left a comment',
    metadata: { Comment: 'PR is up: github.com/repo/pull/142' },
  },
  {
    id: 'p12',
    action: 'complete',
    actor: { id: 'bob', name: 'Bob Smith', role: 'Frontend Dev' },
    timestamp: ago(1 * D + 4 * H),
    entity: 'Task: Dark mode toggle',
    summary: 'marked task as complete',
  },
  {
    id: 'p13',
    action: 'create',
    actor: { id: 'carol', name: 'Carol White', role: 'QA Engineer' },
    timestamp: ago(2 * D),
    entity: 'Task: Performance regression test',
    summary: 'created task from template',
    metadata: { Template: 'Performance Suite v2', Sprint: 'Sprint 11' },
  },
  {
    id: 'p14',
    action: 'update',
    actor: { id: 'alice', name: 'Alice Chen', role: 'Project Manager' },
    timestamp: ago(2 * D + 6 * H),
    entity: 'Project: Q3 Redesign',
    summary: 'updated project milestones',
    changes: [
      { field: 'Milestone 2 Date', oldValue: '2026-07-20', newValue: '2026-07-28' },
      { field: 'Milestone 3 Date', oldValue: '2026-08-01', newValue: '2026-08-08' },
    ],
  },
  {
    id: 'p15',
    action: 'approve',
    actor: { id: 'alice', name: 'Alice Chen', role: 'Project Manager' },
    timestamp: ago(3 * D),
    entity: 'Task: API documentation update',
    summary: 'approved for release',
  },
  {
    id: 'p16',
    action: 'reject',
    actor: { id: 'carol', name: 'Carol White', role: 'QA Engineer' },
    timestamp: ago(3 * D + 3 * H),
    entity: 'Task: Mobile nav redesign',
    summary: 'rejected — failed accessibility tests',
    changes: [
      { field: 'Status', oldValue: 'Review', newValue: 'Rejected' },
      { field: 'QA Note', oldValue: '', newValue: 'Touch targets < 44px on iPhone SE' },
    ],
  },
  {
    id: 'p17',
    action: 'assign',
    actor: { id: 'bob', name: 'Bob Smith', role: 'Frontend Dev' },
    timestamp: ago(4 * D),
    entity: 'Task: Mobile nav redesign',
    summary: 'self-assigned to fix QA issues',
  },
  {
    id: 'p18',
    action: 'update',
    actor: { id: 'bob', name: 'Bob Smith', role: 'Frontend Dev' },
    timestamp: ago(4 * D + 2 * H),
    entity: 'Task: Mobile nav redesign',
    changes: [
      { field: 'Status', oldValue: 'Rejected', newValue: 'In Progress' },
    ],
  },
  {
    id: 'p19',
    action: 'complete',
    actor: { id: 'bob', name: 'Bob Smith', role: 'Frontend Dev' },
    timestamp: ago(5 * D),
    entity: 'Task: Onboarding flow copy review',
  },
  {
    id: 'p20',
    action: 'create',
    actor: { id: 'alice', name: 'Alice Chen', role: 'Project Manager' },
    timestamp: ago(6 * D),
    entity: 'Task: Onboarding flow copy review',
    summary: 'created from backlog',
    metadata: { Backlog: 'UX Backlog', Priority: 'Low' },
  },
]

const financeEntries: AuditEntry[] = [
  {
    id: 'f1',
    action: 'login',
    actor: { id: 'diana', name: 'Diana Reyes', role: 'Finance Controller' },
    timestamp: ago(8 * M),
    summary: 'logged into Finance Portal',
    ip: '203.0.113.55',
    metadata: { Device: 'Chrome 124 / macOS', MFA: 'TOTP verified' },
  },
  {
    id: 'f2',
    action: 'create',
    actor: { id: 'diana', name: 'Diana Reyes', role: 'Finance Controller' },
    timestamp: ago(10 * M),
    entity: 'Invoice #1093',
    summary: 'created new invoice',
    metadata: { Client: 'Acme Corp', Amount: '$12,500', Due: '2026-07-31' },
  },
  {
    id: 'f3',
    action: 'update',
    actor: { id: 'diana', name: 'Diana Reyes', role: 'Finance Controller' },
    timestamp: ago(15 * M),
    entity: 'Invoice #1090',
    summary: 'updated line items',
    changes: [
      { field: 'Line Item 3 Qty', oldValue: '5', newValue: '8' },
      { field: 'Total', oldValue: '$4,750', newValue: '$7,200' },
    ],
  },
  {
    id: 'f4',
    action: 'approve',
    actor: { id: 'marcus', name: 'Marcus Webb', role: 'CFO' },
    timestamp: ago(30 * M),
    entity: 'Invoice #1088',
    summary: 'approved invoice for payment',
    metadata: { 'Payment Method': 'Bank Transfer', 'PO Number': 'PO-20260612' },
  },
  {
    id: 'f5',
    action: 'export',
    actor: { id: 'diana', name: 'Diana Reyes', role: 'Finance Controller' },
    timestamp: ago(45 * M),
    entity: 'Q2 2026 Expense Report',
    summary: 'exported report as PDF',
    metadata: { Format: 'PDF', Records: '247', Period: 'Q2 2026' },
    ip: '203.0.113.55',
  },
  {
    id: 'f6',
    action: 'reject',
    actor: { id: 'marcus', name: 'Marcus Webb', role: 'CFO' },
    timestamp: ago(2 * H),
    entity: 'Invoice #1087',
    summary: 'rejected — duplicate submission',
    changes: [
      { field: 'Status', oldValue: 'Pending Approval', newValue: 'Rejected' },
      { field: 'Rejection Reason', oldValue: '', newValue: 'Duplicate of Invoice #1082' },
    ],
  },
  {
    id: 'f7',
    action: 'create',
    actor: { id: 'priya', name: 'Priya Nair', role: 'Accounts Payable' },
    timestamp: ago(3 * H),
    entity: 'Expense: Team Off-site Q3',
    summary: 'submitted expense claim',
    metadata: { Amount: '$3,200', Category: 'Team Events', Receipts: '6 files attached' },
  },
  {
    id: 'f8',
    action: 'approve',
    actor: { id: 'diana', name: 'Diana Reyes', role: 'Finance Controller' },
    timestamp: ago(4 * H + 15 * M),
    entity: 'Expense: Team Off-site Q3',
    changes: [
      { field: 'Status', oldValue: 'Submitted', newValue: 'Approved' },
    ],
  },
  {
    id: 'f9',
    action: 'create',
    actor: { id: 'priya', name: 'Priya Nair', role: 'Accounts Payable' },
    timestamp: ago(1 * D),
    entity: 'Contract: Vendor MSA #V-2026-11',
    summary: 'uploaded signed contract',
    metadata: { Vendor: 'CloudOps Ltd', Value: '$120,000/yr', Term: '24 months' },
  },
  {
    id: 'f10',
    action: 'approve',
    actor: { id: 'marcus', name: 'Marcus Webb', role: 'CFO' },
    timestamp: ago(1 * D + 3 * H),
    entity: 'Contract: Vendor MSA #V-2026-11',
    summary: 'approved and countersigned',
    changes: [
      { field: 'Status', oldValue: 'Pending Countersignature', newValue: 'Active' },
      { field: 'Effective Date', oldValue: '', newValue: '2026-07-01' },
    ],
  },
  {
    id: 'f11',
    action: 'export',
    actor: { id: 'marcus', name: 'Marcus Webb', role: 'CFO' },
    timestamp: ago(1 * D + 5 * H),
    entity: 'Board Financials June 2026',
    summary: 'exported board pack',
    metadata: { Format: 'XLSX', Sheets: '12', Confidential: 'Yes' },
    ip: '198.51.100.22',
  },
  {
    id: 'f12',
    action: 'update',
    actor: { id: 'priya', name: 'Priya Nair', role: 'Accounts Payable' },
    timestamp: ago(2 * D),
    entity: 'Invoice #1085',
    summary: 'corrected bank details',
    changes: [
      { field: 'Sort Code', oldValue: '20-30-40', newValue: '20-30-41' },
      { field: 'Account No', oldValue: '12345678', newValue: '12345679' },
    ],
  },
  {
    id: 'f13',
    action: 'logout',
    actor: { id: 'diana', name: 'Diana Reyes', role: 'Finance Controller' },
    timestamp: ago(2 * D + 1 * H),
    summary: 'session ended',
    ip: '203.0.113.55',
    metadata: { 'Session Duration': '3h 42m', 'Actions Performed': '18' },
  },
  {
    id: 'f14',
    action: 'reject',
    actor: { id: 'diana', name: 'Diana Reyes', role: 'Finance Controller' },
    timestamp: ago(3 * D),
    entity: 'Expense: Unapproved Software Licenses',
    summary: 'rejected out-of-policy expense',
    changes: [
      { field: 'Status', oldValue: 'Submitted', newValue: 'Rejected' },
      { field: 'Policy Violation', oldValue: '', newValue: 'Requires pre-approval for software >$500' },
    ],
  },
  {
    id: 'f15',
    action: 'create',
    actor: { id: 'marcus', name: 'Marcus Webb', role: 'CFO' },
    timestamp: ago(4 * D),
    entity: 'Budget: Q3 2026 Forecast',
    summary: 'published Q3 forecast',
    metadata: { Total: '$1,250,000', Departments: '6', Locked: 'No' },
  },
  {
    id: 'f16',
    action: 'comment',
    actor: { id: 'diana', name: 'Diana Reyes', role: 'Finance Controller' },
    timestamp: ago(4 * D + 2 * H),
    entity: 'Invoice #1080',
    summary: 'flagged for audit review',
    metadata: { Comment: 'Discrepancy between PO amount and invoiced amount. Escalated to compliance.' },
  },
  {
    id: 'f17',
    action: 'login',
    actor: { id: 'priya', name: 'Priya Nair', role: 'Accounts Payable' },
    timestamp: ago(5 * D),
    summary: 'logged into Finance Portal',
    ip: '10.0.0.44',
    metadata: { Device: 'Firefox 126 / Windows 11', MFA: 'SMS verified' },
  },
]

const accessEntries: AuditEntry[] = [
  {
    id: 'a1',
    action: 'login',
    actor: { id: 'tyler', name: 'Tyler Brooks', role: 'Admin' },
    timestamp: ago(3 * M),
    summary: 'admin login',
    ip: '192.168.1.101',
    metadata: { Device: 'Chrome 124 / Windows 11', MFA: 'Hardware key (YubiKey)' },
  },
  {
    id: 'a2',
    action: 'assign',
    actor: { id: 'tyler', name: 'Tyler Brooks', role: 'Admin' },
    timestamp: ago(7 * M),
    entity: 'User: sarah.mitchell@company.com',
    summary: 'elevated user role',
    changes: [
      { field: 'Role', oldValue: 'Viewer', newValue: 'Editor' },
      { field: 'Permissions', oldValue: 'Read only', newValue: 'Read, Write' },
    ],
  },
  {
    id: 'a3',
    action: 'create',
    actor: { id: 'tyler', name: 'Tyler Brooks', role: 'Admin' },
    timestamp: ago(20 * M),
    entity: 'User: new.contractor@external.com',
    summary: 'created guest account',
    metadata: { 'Access Level': 'Guest', 'Expiry': '2026-09-30', 'Invited By': 'Tyler Brooks' },
  },
  {
    id: 'a4',
    action: 'export',
    actor: { id: 'tyler', name: 'Tyler Brooks', role: 'Admin' },
    timestamp: ago(35 * M),
    entity: 'User Directory Export',
    summary: 'exported full user list',
    ip: '192.168.1.101',
    metadata: { Records: '142', Format: 'CSV', Reason: 'HR system sync' },
  },
  {
    id: 'a5',
    action: 'login',
    actor: { id: 'sarah', name: 'Sarah Mitchell', role: 'Editor' },
    timestamp: ago(1 * H),
    summary: 'standard login',
    ip: '203.0.113.88',
    metadata: { Device: 'Safari 17 / macOS', MFA: 'TOTP verified' },
  },
  {
    id: 'a6',
    action: 'logout',
    actor: { id: 'sarah', name: 'Sarah Mitchell', role: 'Editor' },
    timestamp: ago(3 * H),
    summary: 'session ended',
    ip: '203.0.113.88',
    metadata: { 'Session Duration': '1h 58m', 'Pages Visited': '24' },
  },
  {
    id: 'a7',
    action: 'update',
    actor: { id: 'tyler', name: 'Tyler Brooks', role: 'Admin' },
    timestamp: ago(4 * H),
    entity: 'Security Policy: Password Requirements',
    summary: 'updated password policy',
    changes: [
      { field: 'Min Length', oldValue: '8', newValue: '12' },
      { field: 'Require Symbol', oldValue: 'No', newValue: 'Yes' },
      { field: 'Expiry Days', oldValue: '180', newValue: '90' },
    ],
  },
  {
    id: 'a8',
    action: 'delete',
    actor: { id: 'tyler', name: 'Tyler Brooks', role: 'Admin' },
    timestamp: ago(6 * H),
    entity: 'User: former.employee@company.com',
    summary: 'deactivated account on offboarding',
    metadata: { Offboarded: '2026-07-03', 'Data Retained': '90 days', 'GDPR Request': 'None' },
  },
  {
    id: 'a9',
    action: 'login',
    actor: { id: 'unknown', name: 'Unknown', role: 'N/A' },
    timestamp: ago(8 * H),
    summary: 'failed login attempt — blocked',
    ip: '45.33.32.156',
    metadata: { Reason: 'Invalid credentials (5 attempts)', Action: 'IP temporarily blocked', Account: 'admin@company.com' },
  },
  {
    id: 'a10',
    action: 'assign',
    actor: { id: 'tyler', name: 'Tyler Brooks', role: 'Admin' },
    timestamp: ago(1 * D),
    entity: 'User: james.okafor@company.com',
    summary: 'assigned department role',
    changes: [
      { field: 'Department', oldValue: 'None', newValue: 'Engineering' },
      { field: 'Team Role', oldValue: 'None', newValue: 'Team Lead' },
    ],
  },
  {
    id: 'a11',
    action: 'export',
    actor: { id: 'sarah', name: 'Sarah Mitchell', role: 'Editor' },
    timestamp: ago(1 * D + 2 * H),
    entity: 'Compliance Audit Trail Q2 2026',
    ip: '203.0.113.88',
    metadata: { Records: '1,842', Format: 'PDF', Requested: 'Legal Dept' },
  },
  {
    id: 'a12',
    action: 'update',
    actor: { id: 'tyler', name: 'Tyler Brooks', role: 'Admin' },
    timestamp: ago(2 * D),
    entity: 'SSO Configuration: Okta',
    summary: 'updated SSO certificate',
    changes: [
      { field: 'Certificate Expiry', oldValue: '2026-06-30', newValue: '2027-06-30' },
      { field: 'IdP Metadata URL', oldValue: 'old.okta.com/saml', newValue: 'company.okta.com/saml' },
    ],
  },
  {
    id: 'a13',
    action: 'logout',
    actor: { id: 'tyler', name: 'Tyler Brooks', role: 'Admin' },
    timestamp: ago(2 * D + 4 * H),
    summary: 'admin session ended',
    ip: '192.168.1.101',
    metadata: { 'Session Duration': '6h 15m', 'Admin Actions': '12' },
  },
  {
    id: 'a14',
    action: 'create',
    actor: { id: 'tyler', name: 'Tyler Brooks', role: 'Admin' },
    timestamp: ago(3 * D),
    entity: 'API Key: mobile-app-prod',
    summary: 'generated new API key',
    metadata: { Scope: 'read:users, write:notifications', 'Expiry': '2027-07-03', Environment: 'Production' },
  },
  {
    id: 'a15',
    action: 'delete',
    actor: { id: 'tyler', name: 'Tyler Brooks', role: 'Admin' },
    timestamp: ago(3 * D + 5 * H),
    entity: 'API Key: legacy-v1-key',
    summary: 'revoked deprecated API key',
    metadata: { Reason: 'Key deprecated after v2 migration', 'Last Used': '2026-05-12' },
  },
  {
    id: 'a16',
    action: 'update',
    actor: { id: 'sarah', name: 'Sarah Mitchell', role: 'Editor' },
    timestamp: ago(4 * D + 2 * H),
    entity: 'User: sarah.mitchell@company.com',
    summary: 'updated own profile',
    changes: [
      { field: 'Display Name', oldValue: 'S. Mitchell', newValue: 'Sarah Mitchell' },
      { field: 'Notification Prefs', oldValue: 'Email only', newValue: 'Email + Slack' },
    ],
  },
]
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between flex-wrap gap-3 mb-2">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Audit Log</h1>
        <p class="text-body-2 text-medium-emphasis">
          Append-only activity history with per-action icons, actor avatars, field-level diff viewer, search and action filters.
        </p>
      </div>
      <v-btn
        variant="tonal"
        prepend-icon="mdi-information-outline"
        @click="infoOpen = true"
      >
        Use cases
      </v-btn>
    </div>

    <v-tabs v-model="tab" class="mb-6">
      <v-tab value="project">Project Management</v-tab>
      <v-tab value="finance">Finance / Contracts</v-tab>
      <v-tab value="access">User &amp; Access</v-tab>
    </v-tabs>

    <v-tabs-window v-model="tab">
      <v-tabs-window-item value="project">
        <CommonAuditLog
          :entries="projectEntries"
          title="Project Activity"
          max-height="560px"
        />
      </v-tabs-window-item>

      <v-tabs-window-item value="finance">
        <CommonAuditLog
          :entries="financeEntries"
          title="Finance Audit Trail"
          max-height="560px"
        />
      </v-tabs-window-item>

      <v-tabs-window-item value="access">
        <CommonAuditLog
          :entries="accessEntries"
          title="User &amp; Access Log"
          max-height="560px"
        />
      </v-tabs-window-item>
    </v-tabs-window>

    <h2 class="text-overline text-medium-emphasis mt-8 mb-4">Compact mode</h2>
    <CommonAuditLog
      :entries="projectEntries.slice(0, 6)"
      title="Recent Activity"
      max-height="300px"
      compact
      :show-filter="false"
    />

    <h2 class="text-overline text-medium-emphasis mt-8 mb-4">Usage</h2>
    <v-card rounded="lg" class="pa-5">
      <v-sheet rounded="lg" color="surface-variant" class="pa-4">
        <pre v-pre class="text-body-2"><code>import type { AuditEntry } from '~/components/common/AuditLog.vue'

const entries: AuditEntry[] = [
  {
    id: '1',
    action: 'update',
    actor: { id: 'u1', name: 'Alice Chen', role: 'Project Manager' },
    timestamp: new Date().toISOString(),
    entity: 'Invoice #1042',
    changes: [
      { field: 'Amount', oldValue: '$1,000', newValue: '$1,200' },
    ],
  },
]

&lt;CommonAuditLog
  :entries="entries"
  title="Activity Log"
  max-height="520px"
  :show-filter="true"
  :show-search="true"
  :compact="false"
/&gt;</code></pre>
      </v-sheet>
      <div class="d-flex flex-wrap gap-4 mt-4 text-caption text-medium-emphasis">
        <span><code>entries</code>: AuditEntry[] — required</span>
        <span><code>title</code>: string (default 'Activity Log')</span>
        <span><code>maxHeight</code>: CSS string (default '520px')</span>
        <span><code>showFilter</code>: boolean (default true)</span>
        <span><code>showSearch</code>: boolean (default true)</span>
        <span><code>compact</code>: boolean (default false)</span>
      </div>
    </v-card>

    <v-dialog v-model="infoOpen" max-width="620">
      <v-card rounded="lg">
        <v-card-title class="pa-5 pb-2">Use Cases</v-card-title>
        <v-card-text class="pa-5 pt-2">
          <p class="text-body-2 text-medium-emphasis mb-4">
            The Audit Log component provides an append-only, scrollable history view for any domain that requires accountability or compliance.
          </p>
          <v-list density="compact" class="pa-0">
            <v-list-item prepend-icon="mdi-briefcase-outline" title="Portfolio Manager (#1)" subtitle="Track task creation, assignments, status changes and comments across projects." />
            <v-list-item prepend-icon="mdi-swap-horizontal" title="Workflow Engine (#3)" subtitle="Record every state transition, approval, rejection and actor in automated pipelines." />
            <v-list-item prepend-icon="mdi-file-sign" title="Verifiable Contracts (#14)" subtitle="Immutable record of who viewed, signed or modified a contract and when." />
            <v-list-item prepend-icon="mdi-receipt-text-outline" title="Expense Tracker (#5)" subtitle="Full trail of submissions, approvals, rejections and policy notes for finance." />
            <v-list-item prepend-icon="mdi-heart-pulse" title="HEAM (#9)" subtitle="Audit sensitive health record access and modifications for regulatory compliance." />
            <v-list-item prepend-icon="mdi-shield-check-outline" title="Compliance / Regulatory" subtitle="Generate evidence of controls for SOC 2, ISO 27001, GDPR and internal audits." />
            <v-list-item prepend-icon="mdi-bug-outline" title="Debugging & Accountability" subtitle="Reconstruct the sequence of events that led to a bug or data discrepancy." />
          </v-list>
        </v-card-text>
        <v-card-actions class="pa-5 pt-0">
          <v-spacer />
          <v-btn @click="infoOpen = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
