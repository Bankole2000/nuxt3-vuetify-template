<script setup lang="ts">
import type { NodeProps } from '@vue-flow/core'
import { Handle, Position, useVueFlow } from '@vue-flow/core'

type Operator = '+' | '-' | '*' | '/'
interface OperatorNodeData { operator: Operator }

const props = defineProps<Pick<NodeProps<OperatorNodeData>, 'id' | 'data'>>()

const operators: Operator[] = ['+', '-', '*', '/']

const { updateNodeData } = useVueFlow()
</script>

<template>
  <label :for="`${id}-operator`">Operator</label>
  <div class="buttons nodrag">
    <button
      v-for="op in operators"
      :key="op"
      :class="{ selected: data.operator === op }"
      @click="updateNodeData(id, { operator: op })"
    >{{ op }}</button>
  </div>
  <Handle type="source" :position="Position.Right" :connectable="false" />
  <Handle id="target-a" type="target" :position="Position.Left" :connectable="false" />
  <Handle id="target-b" type="target" :position="Position.Left" :connectable="false" />
</template>
