<script setup lang="ts">
import type { NodeProps } from '@vue-flow/core'
import { Handle, Position, useVueFlow } from '@vue-flow/core'

interface ValueNodeData { value: number }

const props = defineProps<Pick<NodeProps<ValueNodeData>, 'id' | 'data'>>()

const { updateNodeData } = useVueFlow()

const onChange = (event: Event) => {
  const value = Number.parseFloat((event.target as HTMLInputElement).value)
  if (!Number.isNaN(value)) updateNodeData(props.id, { value })
}
</script>

<template>
  <label :for="`${id}-input`">Value</label>
  <input :id="`${id}-input`" :value="data.value" type="number" class="nodrag" @change="onChange" />
  <Handle type="source" :position="Position.Right" :connectable="false" />
</template>
