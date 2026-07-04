<script setup lang="ts">
export interface ContractParty {
  id: string
  name: string
  role: string
  email?: string
  signed?: boolean
  signedAt?: string
  signature?: string
}

export interface ContractDoc {
  title: string
  clauses: { heading: string; body: string }[]
  parties: ContractParty[]
  status: 'draft' | 'pending' | 'fully-signed' | 'void'
  createdAt: string
}

const props = withDefaults(defineProps<{
  contract: ContractDoc
  currentPartyId: string
  readonly?: boolean
}>(), {
  readonly: false,
})

const emit = defineEmits<{
  (e: 'sign', partyId: string, signatureDataUrl: string): void
  (e: 'void-contract'): void
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const isDrawing = ref(false)
const canvasEmpty = ref(true)

let ctx: CanvasRenderingContext2D | null = null

const currentParty = computed(() =>
  props.contract.parties.find(p => p.id === props.currentPartyId) ?? null
)

const signedCount = computed(() =>
  props.contract.parties.filter(p => p.signed).length
)

const totalCount = computed(() => props.contract.parties.length)

const statusConfig = computed(() => {
  const s = props.contract.status
  if (s === 'draft')        return { label: 'DRAFT',        color: 'default' }
  if (s === 'pending')      return { label: 'PENDING',      color: 'warning' }
  if (s === 'fully-signed') return { label: 'FULLY SIGNED', color: 'success' }
  return                           { label: 'VOID',          color: 'error' }
})

const canSign = computed(() =>
  !props.readonly &&
  props.contract.status !== 'void' &&
  props.contract.status !== 'fully-signed' &&
  currentParty.value !== null &&
  !currentParty.value.signed
)

const getPos = (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  if (e instanceof TouchEvent) {
    const touch = e.touches[0]!
    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY,
    }
  }
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  }
}

const startDraw = (e: MouseEvent | TouchEvent) => {
  e.preventDefault()
  if (!ctx || !canvasRef.value) return
  isDrawing.value = true
  const { x, y } = getPos(e, canvasRef.value)
  ctx.beginPath()
  ctx.moveTo(x, y)
}

const draw = (e: MouseEvent | TouchEvent) => {
  e.preventDefault()
  if (!isDrawing.value || !ctx || !canvasRef.value) return
  const { x, y } = getPos(e, canvasRef.value)
  ctx.lineTo(x, y)
  ctx.stroke()
  canvasEmpty.value = false
}

const endDraw = () => {
  if (!isDrawing.value) return
  isDrawing.value = false
}

const clearCanvas = () => {
  if (!ctx || !canvasRef.value) return
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  canvasEmpty.value = true
}

const sign = () => {
  if (!canvasRef.value || canvasEmpty.value || !currentParty.value) return
  const dataUrl = canvasRef.value.toDataURL()
  emit('sign', props.currentPartyId, dataUrl)
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

const initCanvas = () => {
  if (!canvasRef.value) return
  ctx = canvasRef.value.getContext('2d')
  if (!ctx) return
  ctx.strokeStyle = '#1a1a2e'
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height)
}

watch(canvasRef, (el) => { if (el) initCanvas() })
</script>

<template>
  <div>
    <!-- Status badge + progress -->
    <div class="d-flex align-center flex-wrap gap-3 mb-4">
      <v-chip
        :color="statusConfig.color"
        size="small"
        label
        class="font-weight-bold letter-spacing-wide"
      >
        {{ statusConfig.label }}
      </v-chip>
      <span class="text-body-2 text-medium-emphasis">
        {{ signedCount }} of {{ totalCount }} parties have signed
      </span>
      <v-progress-linear
        :model-value="(signedCount / totalCount) * 100"
        :color="contract.status === 'fully-signed' ? 'success' : 'primary'"
        rounded
        height="6"
        class="flex-grow-1"
        style="min-width: 80px; max-width: 200px;"
      />
    </div>

    <!-- Fully-signed banner -->
    <v-alert
      v-if="contract.status === 'fully-signed'"
      type="success"
      variant="tonal"
      icon="mdi-check-circle-outline"
      class="mb-4"
      rounded="lg"
    >
      All parties have signed. This document is legally binding.
    </v-alert>

    <!-- Void banner -->
    <v-alert
      v-if="contract.status === 'void'"
      type="error"
      variant="tonal"
      icon="mdi-cancel"
      class="mb-4"
      rounded="lg"
    >
      This contract has been voided and is no longer valid.
    </v-alert>

    <v-row>
      <!-- Left panel: document -->
      <v-col cols="12" md="7">
        <v-card rounded="lg" variant="outlined">
          <div class="contract-document pa-6" style="max-height: 560px; overflow-y: auto;">
            <p class="text-overline text-medium-emphasis mb-1">Contract</p>
            <h2 class="text-h6 font-weight-bold mb-1">{{ contract.title }}</h2>
            <p class="text-caption text-medium-emphasis mb-5">
              Created {{ formatDate(contract.createdAt) }}
            </p>

            <v-divider class="mb-5" />

            <div
              v-for="(clause, i) in contract.clauses"
              :key="i"
              class="contract-clause mb-5"
            >
              <p class="text-body-2 font-weight-bold mb-1 contract-clause-heading">
                {{ i + 1 }}. {{ clause.heading }}
              </p>
              <p class="text-body-2 contract-clause-body">{{ clause.body }}</p>
            </div>

            <v-divider class="mb-4" />

            <p class="text-caption text-medium-emphasis">
              This document constitutes a legally binding agreement between the parties listed below.
            </p>
          </div>
        </v-card>
      </v-col>

      <!-- Right panel: signatures -->
      <v-col cols="12" md="5">
        <v-card rounded="lg" variant="outlined" class="pa-4">
          <p class="text-overline text-medium-emphasis mb-3">Parties &amp; Signatures</p>

          <div
            v-for="party in contract.parties"
            :key="party.id"
            class="party-row mb-4"
          >
            <div class="d-flex align-start justify-space-between mb-1">
              <div>
                <p class="text-body-2 font-weight-bold mb-0">{{ party.name }}</p>
                <p class="text-caption text-medium-emphasis">{{ party.role }}</p>
                <p v-if="party.email" class="text-caption text-medium-emphasis">{{ party.email }}</p>
              </div>
              <v-chip
                v-if="party.signed"
                color="success"
                size="x-small"
                prepend-icon="mdi-check"
                class="mt-1"
              >
                Signed
              </v-chip>
              <v-chip
                v-else
                color="warning"
                size="x-small"
                variant="tonal"
                class="mt-1"
              >
                Awaiting
              </v-chip>
            </div>

            <!-- Show existing signature image for signed parties -->
            <div v-if="party.signed && party.signature" class="mb-1">
              <img
                :src="party.signature"
                :alt="`${party.name} signature`"
                class="rounded"
                style="max-width: 100%; height: 60px; object-fit: contain; border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); background: #fff;"
              />
              <p v-if="party.signedAt" class="text-caption text-medium-emphasis mt-1">
                Signed {{ formatDate(party.signedAt) }}
              </p>
            </div>

            <!-- Canvas for current party if not yet signed -->
            <template v-if="party.id === currentPartyId && !party.signed && canSign">
              <p class="text-caption text-medium-emphasis mb-1">Draw your signature below:</p>
              <canvas
                ref="canvasRef"
                :width="600"
                :height="120"
                class="signature-canvas rounded"
                style="width: 100%; height: 120px; display: block; cursor: crosshair; touch-action: none;"
                @mousedown="startDraw"
                @mousemove="draw"
                @mouseup="endDraw"
                @mouseleave="endDraw"
                @touchstart="startDraw"
                @touchmove="draw"
                @touchend="endDraw"
              />
              <p v-if="canvasEmpty" class="text-caption text-medium-emphasis text-center mt-1">
                Sign above
              </p>
              <div class="d-flex gap-2 mt-2">
                <v-btn
                  color="primary"
                  size="small"
                  :disabled="canvasEmpty"
                  prepend-icon="mdi-pen"
                  @click="sign"
                >
                  Sign document
                </v-btn>
                <v-btn
                  size="small"
                  variant="outlined"
                  prepend-icon="mdi-eraser"
                  @click="clearCanvas"
                >
                  Clear
                </v-btn>
              </div>
            </template>

            <v-divider v-if="party.id !== contract.parties[contract.parties.length - 1]!.id" class="mt-3" />
          </div>
        </v-card>

        <!-- Void button -->
        <div
          v-if="!readonly && contract.status !== 'void' && contract.status !== 'fully-signed'"
          class="mt-3 text-right"
        >
          <v-btn
            color="error"
            variant="text"
            size="small"
            prepend-icon="mdi-cancel"
            @click="emit('void-contract')"
          >
            Void contract
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.contract-clause-heading {
  color: rgba(var(--v-theme-on-surface), 0.9);
}
.contract-clause-body {
  line-height: 1.7;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}
.signature-canvas {
  border: 1px dashed rgba(var(--v-border-color), calc(var(--v-border-opacity) * 1.5));
  background: #ffffff;
}
.letter-spacing-wide {
  letter-spacing: 0.08em;
}
</style>
