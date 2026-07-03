<script setup lang="ts">
import type { GraphNode } from '@vue-flow/core'
import { Handle, Position, useNodeConnections, useNodesData } from '@vue-flow/core'

type Operator = '+' | '-' | '*' | '/'
interface ValueNodeData    { value: number }
interface OperatorNodeData { operator: Operator }

const mathFn: Record<Operator, (a: number, b: number) => number> = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '*': (a, b) => a * b,
  '/': (a, b) => a / b,
}

defineProps<{ id: string }>()

const sourceConnections = useNodeConnections({ handleType: 'target' })

const operatorSourceConnections = useNodeConnections({
  handleType: 'target',
  nodeId: () => sourceConnections.value[0]?.source,
})

const operatorData = useNodesData<GraphNode<OperatorNodeData>>(
  () => sourceConnections.value.map(c => c.source),
)

const valueData = useNodesData<GraphNode<ValueNodeData>>(
  () => operatorSourceConnections.value.map(c => c.source),
)

const result = computed(() => {
  const op = operatorData.value[0]?.data?.operator
  if (!op) return 0
  const a = valueData.value[0]?.data?.value
  const b = valueData.value[1]?.data?.value
  if (a === undefined || b === undefined) return 0
  return Math.round(mathFn[op](a, b) * 100) / 100
})
</script>

<template>
  <div class="calculation">
    <template v-for="(v, i) in valueData" :key="v.id">
      <span>{{ v.data?.value }}</span>
      <span v-if="i !== valueData.length - 1">{{ operatorData[0]?.data?.operator }}</span>
    </template>
  </div>
  <span> = </span>
  <span class="counter" :style="{ color: result >= 0 ? '#5EC697' : '#f15a16' }">{{ result }}</span>
  <Handle
    type="target"
    :position="Position.Left"
    :connectable="false"
    :style="{ background: result >= 0 ? '#5EC697' : '#f15a16' }"
  />
</template>
