<script setup lang="ts">
// ─── Public types ──────────────────────────────────────────────────────────────
export interface DMCriterion { id: string; label: string; weight: number }
export interface DMOption    { id: string; label: string; color?: string }
export interface DMScore     { optionId: string; criterionId: string; value: number }
export interface DecisionMatrixData {
  title: string
  criteria: DMCriterion[]
  options: DMOption[]
  scores: DMScore[]
}

// ─── Props / emits ─────────────────────────────────────────────────────────────
const props = withDefaults(defineProps<{
  data: DecisionMatrixData
  readonly?: boolean
}>(), {
  readonly: false,
})

const emit = defineEmits<{
  (e: 'update', data: DecisionMatrixData): void
}>()

// ─── Local copy ────────────────────────────────────────────────────────────────
const local = ref<DecisionMatrixData>(JSON.parse(JSON.stringify(props.data)))

watch(() => props.data, (v) => {
  local.value = JSON.parse(JSON.stringify(v))
}, { deep: true })

function push() {
  emit('update', JSON.parse(JSON.stringify(local.value)))
}

// ─── Score helpers ─────────────────────────────────────────────────────────────
function getScore(optionId: string, criterionId: string): number {
  return local.value.scores.find(
    s => s.optionId === optionId && s.criterionId === criterionId,
  )?.value ?? 5
}

function setScore(optionId: string, criterionId: string, value: number) {
  if (props.readonly) return
  const clamped = Math.max(1, Math.min(10, value))
  const idx = local.value.scores.findIndex(
    s => s.optionId === optionId && s.criterionId === criterionId,
  )
  if (idx === -1) {
    local.value.scores.push({ optionId, criterionId, value: clamped })
  }
  else {
    local.value.scores[idx]!.value = clamped
  }
  push()
}

function weightedTotal(optionId: string): number {
  const totalWeight = local.value.criteria.reduce((s, c) => s + c.weight, 0)
  if (totalWeight === 0) return 0
  const weighted = local.value.criteria.reduce((s, c) => {
    return s + getScore(optionId, c.id) * c.weight
  }, 0)
  return (weighted / totalWeight)
}

interface RankedOption { id: string; total: number; rank: number }

const rankedOptions = computed<RankedOption[]>(() => {
  const totals = local.value.options.map(o => ({
    id: o.id,
    total: weightedTotal(o.id),
  }))
  const sorted = [...totals].sort((a, b) => b.total - a.total)
  return totals.map(t => ({
    ...t,
    rank: sorted.findIndex(s => s.id === t.id) + 1,
  }))
})

function rankOf(optionId: string): number {
  return rankedOptions.value.find(r => r.id === optionId)?.rank ?? 0
}

function totalOf(optionId: string): number {
  return rankedOptions.value.find(r => r.id === optionId)?.total ?? 0
}

function progressColor(rank: number): string {
  if (rank === 1) return 'success'
  if (rank === 2) return 'info'
  if (rank === 3) return 'warning'
  return 'secondary'
}

// ─── Add / remove ──────────────────────────────────────────────────────────────
const newCriterionLabel = ref('')
const newCriterionWeight = ref(5)
const newOptionLabel = ref('')

function addCriterion() {
  const label = newCriterionLabel.value.trim()
  if (!label) return
  const id = `c_${Date.now()}`
  local.value.criteria.push({ id, label, weight: newCriterionWeight.value })
  newCriterionLabel.value = ''
  newCriterionWeight.value = 5
  push()
}

function removeCriterion(id: string) {
  local.value.criteria = local.value.criteria.filter(c => c.id !== id)
  local.value.scores = local.value.scores.filter(s => s.criterionId !== id)
  push()
}

function addOption() {
  const label = newOptionLabel.value.trim()
  if (!label) return
  const id = `o_${Date.now()}`
  local.value.options.push({ id, label })
  newOptionLabel.value = ''
  push()
}

function removeOption(id: string) {
  local.value.options = local.value.options.filter(o => o.id !== id)
  local.value.scores = local.value.scores.filter(s => s.optionId !== id)
  push()
}

function updateWeight(criterionId: string, value: number) {
  const c = local.value.criteria.find(c => c.id === criterionId)
  if (c) {
    c.weight = Math.max(1, Math.min(10, value))
    push()
  }
}

// ─── CSV export ────────────────────────────────────────────────────────────────
function exportCsv() {
  const header = ['Option', ...local.value.criteria.map(c => `${c.label} (w:${c.weight})`), 'Weighted Total', 'Rank']
  const rows = local.value.options.map(o => {
    const scores = local.value.criteria.map(c => getScore(o.id, c.id))
    const total = totalOf(o.id).toFixed(2)
    const rank = rankOf(o.id)
    return [o.label, ...scores, total, rank]
  })
  const csv = [header, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${local.value.title.replace(/\s+/g, '-').toLowerCase()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4 flex-wrap gap-2">
      <span class="text-subtitle-1 font-weight-bold">{{ local.title }}</span>
      <v-btn
        size="small"
        variant="tonal"
        prepend-icon="mdi-download-outline"
        @click="exportCsv"
      >
        Export CSV
      </v-btn>
    </div>

    <!-- Scrollable table wrapper -->
    <div style="overflow-x: auto;">
      <table class="dm-table">
        <thead>
          <tr>
            <th class="dm-cell dm-option-col text-left">Option</th>
            <th
              v-for="c in local.criteria"
              :key="c.id"
              class="dm-cell dm-criterion-col text-center"
            >
              <div class="d-flex flex-column align-center gap-1">
                <span class="text-caption font-weight-medium">{{ c.label }}</span>
                <div class="d-flex align-center gap-1">
                  <span class="text-caption text-medium-emphasis">w:</span>
                  <input
                    v-if="!readonly"
                    :value="c.weight"
                    type="number"
                    min="1"
                    max="10"
                    class="dm-weight-input"
                    @change="updateWeight(c.id, Number(($event.target as HTMLInputElement).value))"
                  />
                  <span v-else class="text-caption font-weight-bold">{{ c.weight }}</span>
                </div>
                <v-btn
                  v-if="!readonly"
                  icon="mdi-close"
                  size="x-small"
                  variant="text"
                  color="error"
                  @click="removeCriterion(c.id)"
                />
              </div>
            </th>
            <th class="dm-cell dm-total-col text-center">Weighted Total</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="opt in local.options"
            :key="opt.id"
            :class="{ 'dm-row--winner': rankOf(opt.id) === 1 }"
          >
            <td class="dm-cell dm-option-col">
              <div class="d-flex align-center gap-2">
                <!-- rank badge -->
                <v-chip
                  v-if="rankOf(opt.id) <= 3"
                  size="x-small"
                  :color="progressColor(rankOf(opt.id))"
                  variant="tonal"
                  class="font-weight-bold"
                >
                  #{{ rankOf(opt.id) }}
                </v-chip>
                <span class="text-body-2 font-weight-medium">{{ opt.label }}</span>
                <v-btn
                  v-if="!readonly"
                  icon="mdi-close"
                  size="x-small"
                  variant="text"
                  color="error"
                  class="ml-auto"
                  @click="removeOption(opt.id)"
                />
              </div>
            </td>
            <td
              v-for="c in local.criteria"
              :key="c.id"
              class="dm-cell text-center"
            >
              <input
                v-if="!readonly"
                :value="getScore(opt.id, c.id)"
                type="number"
                min="1"
                max="10"
                class="dm-score-input"
                @change="setScore(opt.id, c.id, Number(($event.target as HTMLInputElement).value))"
              />
              <span v-else class="text-body-2 font-weight-bold">{{ getScore(opt.id, c.id) }}</span>
            </td>
            <td class="dm-cell dm-total-col">
              <div class="d-flex flex-column align-center gap-1 px-2">
                <span class="text-body-2 font-weight-bold">
                  {{ totalOf(opt.id).toFixed(1) }}
                </span>
                <v-progress-linear
                  :model-value="totalOf(opt.id) * 10"
                  :color="progressColor(rankOf(opt.id))"
                  rounded
                  height="6"
                  style="min-width: 80px"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add row/column controls -->
    <div v-if="!readonly" class="d-flex flex-wrap gap-4 mt-4">
      <v-card variant="outlined" rounded="lg" class="pa-3" style="min-width:280px; flex:1">
        <p class="text-caption text-medium-emphasis mb-2">Add Option</p>
        <div class="d-flex gap-2">
          <v-text-field
            v-model="newOptionLabel"
            placeholder="Option name"
            density="compact"
            variant="outlined"
            hide-details
            @keyup.enter="addOption"
          />
          <v-btn icon="mdi-plus" variant="tonal" color="primary" @click="addOption" />
        </div>
      </v-card>

      <v-card variant="outlined" rounded="lg" class="pa-3" style="min-width:320px; flex:1">
        <p class="text-caption text-medium-emphasis mb-2">Add Criterion</p>
        <div class="d-flex gap-2">
          <v-text-field
            v-model="newCriterionLabel"
            placeholder="Criterion name"
            density="compact"
            variant="outlined"
            hide-details
            @keyup.enter="addCriterion"
          />
          <v-text-field
            v-model.number="newCriterionWeight"
            label="Weight"
            type="number"
            min="1"
            max="10"
            density="compact"
            variant="outlined"
            hide-details
            style="max-width:80px"
          />
          <v-btn icon="mdi-plus" variant="tonal" color="primary" @click="addCriterion" />
        </div>
      </v-card>
    </div>
  </div>
</template>

<style scoped>
.dm-table {
  border-collapse: collapse;
  width: 100%;
  min-width: 600px;
}

.dm-cell {
  padding: 10px 12px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  vertical-align: middle;
}

.dm-option-col {
  min-width: 180px;
  white-space: nowrap;
}

.dm-criterion-col {
  min-width: 120px;
}

.dm-total-col {
  min-width: 120px;
}

.dm-row--winner td {
  background: rgba(var(--v-theme-success), 0.07);
}

thead tr th {
  background: rgba(var(--v-theme-surface-variant), 0.4);
}

.dm-score-input,
.dm-weight-input {
  width: 52px;
  padding: 2px 4px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 6px;
  background: transparent;
  color: inherit;
  text-align: center;
  font-size: 0.875rem;
  outline: none;
}

.dm-score-input:focus,
.dm-weight-input:focus {
  border-color: rgb(var(--v-theme-primary));
}

.dm-weight-input {
  width: 42px;
}
</style>
