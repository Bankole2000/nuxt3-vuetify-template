<script setup lang="ts">
import type { ContractDoc } from '~/components/common/ContractViewer.vue'

definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Contract Viewer', disabled: true },
  ],
})

useSeo({
  title: 'Contract Viewer',
  description: 'Scrollable contract document with per-party signature capture, progress tracker, and fully-signed banner.',
})

const tab = ref('service')
const infoOpen = ref(false)

// ─── 1. Service Agreement ─────────────────────────────────────────────────────

const serviceAgreement = ref<ContractDoc>({
  title: 'Freelance Service Agreement',
  status: 'draft',
  createdAt: '2026-06-01T09:00:00Z',
  clauses: [
    {
      heading: 'Scope of Services',
      body: 'Bankole Digital Ltd ("Service Provider") agrees to design and develop a web application dashboard for Acme Corp ("Client") as described in the attached project brief dated 1 June 2026. All deliverables shall be provided in a timely and professional manner consistent with industry standards.',
    },
    {
      heading: 'Payment Terms',
      body: 'The Client agrees to pay a fixed fee of £12,000 (twelve thousand pounds sterling) for the agreed deliverables. A deposit of 40% (£4,800) is due upon execution of this agreement. The remaining 60% (£7,200) is due within 14 days of final delivery. Late payments shall accrue interest at 2% per month.',
    },
    {
      heading: 'Intellectual Property',
      body: 'Upon receipt of full and final payment, all intellectual property rights in the deliverables shall be assigned to the Client. Prior to full payment, the Service Provider retains all rights. The Service Provider reserves the right to display work in their portfolio unless the Client requests confidentiality in writing.',
    },
    {
      heading: 'Confidentiality',
      body: 'Both parties agree to keep confidential any proprietary information disclosed during the course of this engagement. This obligation shall survive termination of this agreement for a period of three (3) years. Neither party shall disclose such information to third parties without prior written consent.',
    },
    {
      heading: 'Termination',
      body: 'Either party may terminate this agreement with 14 days written notice. In the event of termination, the Client shall pay for all work completed to date, calculated on a pro-rata basis of the total contract value. The Service Provider shall deliver all completed work upon receipt of final payment.',
    },
  ],
  parties: [
    {
      id: 'provider',
      name: 'Bankole Digital Ltd',
      role: 'Service Provider',
      email: 'hello@bankole.digital',
      signed: false,
    },
    {
      id: 'client',
      name: 'Acme Corp',
      role: 'Client',
      email: 'legal@acmecorp.com',
      signed: false,
    },
    {
      id: 'witness',
      name: 'Jordan Mitchell',
      role: 'Witness',
      email: 'j.mitchell@notary.co.uk',
      signed: false,
    },
  ],
})

const handleServiceSign = (partyId: string, signatureDataUrl: string) => {
  serviceAgreement.value = {
    ...serviceAgreement.value,
    parties: serviceAgreement.value.parties.map(p =>
      p.id === partyId
        ? { ...p, signed: true, signedAt: new Date().toISOString(), signature: signatureDataUrl }
        : p
    ),
    status: serviceAgreement.value.parties.every(p =>
      p.id === partyId ? true : p.signed
    ) ? 'fully-signed' : 'pending',
  }
}

const handleServiceVoid = () => {
  serviceAgreement.value = { ...serviceAgreement.value, status: 'void' }
}

// ─── 2. Mutual NDA ────────────────────────────────────────────────────────────

const nda = ref<ContractDoc>({
  title: 'Mutual Non-Disclosure Agreement',
  status: 'pending',
  createdAt: '2026-06-15T14:30:00Z',
  clauses: [
    {
      heading: 'Definition of Confidential Information',
      body: 'For purposes of this Agreement, "Confidential Information" means any data or information that is proprietary to either party and not generally known to the public, whether in tangible or intangible form, including but not limited to business plans, financial information, technical data, trade secrets, customer lists, and marketing strategies.',
    },
    {
      heading: 'Obligations of Receiving Party',
      body: 'Each party agrees to: (a) hold the Confidential Information of the other party in strict confidence; (b) not disclose such Confidential Information to any third parties; (c) use the Confidential Information solely for the purpose of evaluating a potential business relationship between the parties; and (d) protect the Confidential Information using at least the same degree of care used to protect its own confidential information.',
    },
    {
      heading: 'Exclusions',
      body: 'Obligations of confidentiality shall not apply to information that: (a) is or becomes publicly known through no breach of this Agreement; (b) was rightfully known before receipt from the disclosing party; (c) is independently developed without use of or reference to the Confidential Information; or (d) is required to be disclosed by law or court order, provided the receiving party gives prompt written notice.',
    },
    {
      heading: 'Term and Termination',
      body: 'This Agreement shall remain in effect for a period of two (2) years from the date of execution. Either party may terminate this Agreement upon 30 days written notice. Notwithstanding termination, the obligations of confidentiality shall survive for a further period of three (3) years following the termination date.',
    },
  ],
  parties: [
    {
      id: 'party-a',
      name: 'Nexus Ventures Ltd',
      role: 'Party A',
      email: 'legal@nexusventures.io',
      signed: false,
    },
    {
      id: 'party-b',
      name: 'Orbital Systems Inc',
      role: 'Party B',
      email: 'contracts@orbitalsystems.com',
      signed: true,
      signedAt: '2026-06-16T10:15:00Z',
      signature: 'data:image/png;base64,iVBORw0KGgo=',
    },
  ],
})

const handleNdaSign = (partyId: string, signatureDataUrl: string) => {
  nda.value = {
    ...nda.value,
    parties: nda.value.parties.map(p =>
      p.id === partyId
        ? { ...p, signed: true, signedAt: new Date().toISOString(), signature: signatureDataUrl }
        : p
    ),
    status: nda.value.parties.every(p =>
      p.id === partyId ? true : p.signed
    ) ? 'fully-signed' : 'pending',
  }
}

const handleNdaVoid = () => {
  nda.value = { ...nda.value, status: 'void' }
}

// ─── Info modal ───────────────────────────────────────────────────────────────

const USECASES = [
  {
    context: 'Portfolio Manager (#1)',
    icon: 'mdi-briefcase-outline',
    color: 'teal',
    items: [
      { label: 'Client onboarding contracts', detail: 'Capture signed service agreements and NDAs as part of the client intake flow before work begins.' },
      { label: 'Project sign-off', detail: 'Use the fully-signed banner as a milestone trigger — automatically unlock the next project phase when all parties have signed.' },
    ],
  },
  {
    context: 'Expense Tracker (#5)',
    icon: 'mdi-receipt-outline',
    color: 'orange',
    items: [
      { label: 'Vendor agreements', detail: 'Attach and sign vendor supply contracts directly within the expense management flow, linking spend to approved agreements.' },
    ],
  },
  {
    context: 'Guest Arrangements (#7)',
    icon: 'mdi-home-account',
    color: 'blue',
    items: [
      { label: 'Vendor contracts', detail: 'Caterers, photographers, and other vendors sign service contracts in-app before the event date, with a clear per-party progress view.' },
      { label: 'Guest agreements', detail: 'Collect digital signatures for house rules, liability waivers, or rental agreements ahead of arrival.' },
    ],
  },
  {
    context: 'Verifiable Contracts (#14)',
    icon: 'mdi-file-sign',
    color: 'deep-purple',
    items: [
      { label: 'Multi-party contracts', detail: 'This component IS the core UI for verifiable contracts — scroll the document, capture per-party signatures, and track completion status in real time.' },
      { label: 'Audit trail', detail: 'The signedAt timestamp and per-party status provide a lightweight audit trail for compliance records.' },
      { label: 'Void workflow', detail: 'The void-contract action supports contract cancellation flows, setting an immutable voided state visible to all parties.' },
    ],
  },
]
</script>

<template>
  <div>
    <div class="d-flex align-start justify-space-between gap-4 mb-1">
      <h1 class="text-h5 font-weight-bold">Contract Viewer</h1>
      <v-btn icon="mdi-information-outline" variant="text" size="small" @click="infoOpen = true" />
    </div>
    <p class="text-body-2 text-medium-emphasis mb-6">
      Scrollable contract document with per-party signature capture on a canvas pad, a real-time
      progress indicator, and a fully-signed confirmation banner. Parent owns the contract
      state — the component only emits.
    </p>

    <!-- Info dialog -->
    <v-dialog v-model="infoOpen" max-width="560" scrollable>
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center justify-space-between pt-5 px-6 pb-2">
          <span class="text-h6">Use cases &amp; project fit</span>
          <v-btn icon="mdi-close" variant="text" size="small" @click="infoOpen = false" />
        </v-card-title>
        <v-card-subtitle class="px-6 pb-3 text-wrap">
          Any flow that needs a multi-party document signing step — service agreements, NDAs, waivers, vendor contracts — fits this component.
        </v-card-subtitle>
        <v-divider />
        <v-card-text class="px-4 py-4">
          <div v-for="group in USECASES" :key="group.context" class="uc-group">
            <div class="uc-header">
              <v-icon :icon="group.icon" :color="group.color" size="16" />
              <span class="uc-title">{{ group.context }}</span>
            </div>
            <ul class="uc-list">
              <li v-for="item in group.items" :key="item.label">
                <span class="uc-label">{{ item.label }}</span>
                <span class="uc-detail">{{ item.detail }}</span>
              </li>
            </ul>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Tabs -->
    <v-tabs v-model="tab" density="compact" class="mb-6">
      <v-tab value="service">
        <v-icon start icon="mdi-file-document-outline" size="16" />
        Service Agreement
      </v-tab>
      <v-tab value="nda">
        <v-icon start icon="mdi-eye-off-outline" size="16" />
        NDA
      </v-tab>
    </v-tabs>

    <v-window v-model="tab">
      <v-window-item value="service">
        <CommonContractViewer
          :contract="serviceAgreement"
          current-party-id="client"
          @sign="handleServiceSign"
          @void-contract="handleServiceVoid"
        />
      </v-window-item>

      <v-window-item value="nda">
        <CommonContractViewer
          :contract="nda"
          current-party-id="party-a"
          @sign="handleNdaSign"
          @void-contract="handleNdaVoid"
        />
      </v-window-item>
    </v-window>
  </div>
</template>

<style scoped>
.uc-group {
  padding: 10px 8px;
  border-radius: 8px;
  margin-bottom: 4px;
}
.uc-group:hover {
  background: rgba(var(--v-theme-on-surface), 0.03);
}
.uc-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}
.uc-title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(var(--v-theme-on-surface), 0.7);
}
.uc-list {
  padding-left: 22px;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.uc-list li {
  font-size: 0.8125rem;
}
.uc-label {
  font-weight: 600;
  margin-right: 4px;
}
.uc-detail {
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}
</style>
