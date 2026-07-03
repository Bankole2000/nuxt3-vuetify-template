<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

const props = defineProps<{
  id: string
  data: {
    label: string
    icon: string
    color: string
    inputs: number
    outputs: number
    selected?: boolean
  }
}>()
</script>

<template>
  <div
    class="wfn-node"
    :style="{ '--node-color': data.color }"
    :class="{ 'wfn-node--selected': data.selected }"
  >
    <!-- Input handles -->
    <Handle
      v-for="i in data.inputs"
      :key="`in-${i}`"
      :id="`in-${i}`"
      type="target"
      :position="Position.Left"
      :style="{ top: data.inputs === 1 ? '50%' : `${(i / (data.inputs + 1)) * 100}%` }"
      class="wfn-handle wfn-handle--in"
    />

    <!-- Node body -->
    <div class="wfn-icon-wrap">
      <v-icon :icon="data.icon" size="18" color="white" />
    </div>
    <div class="wfn-label">{{ data.label }}</div>

    <!-- Output handles -->
    <Handle
      v-for="i in data.outputs"
      :key="`out-${i}`"
      :id="`out-${i}`"
      type="source"
      :position="Position.Right"
      :style="{ top: data.outputs === 1 ? '50%' : `${(i / (data.outputs + 1)) * 100}%` }"
      class="wfn-handle wfn-handle--out"
    />
  </div>
</template>

<style scoped>
.wfn-node {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px 10px 10px;
  border-radius: 10px;
  background: rgb(var(--v-theme-surface));
  border: 2px solid rgba(var(--v-border-color), var(--v-border-opacity));
  box-shadow: 0 2px 8px rgba(0,0,0,.12);
  min-width: 148px;
  cursor: grab;
  transition: border-color .15s, box-shadow .15s;
  user-select: none;
}
.wfn-node--selected {
  border-color: var(--node-color);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--node-color) 20%, transparent);
}
.wfn-node:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,.18);
}

.wfn-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 7px;
  background: var(--node-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.wfn-label {
  font-size: 12px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  white-space: nowrap;
}

.wfn-handle {
  width: 10px !important;
  height: 10px !important;
  border-radius: 50% !important;
  border: 2px solid rgb(var(--v-theme-surface)) !important;
}
.wfn-handle--in  { background: rgba(var(--v-theme-on-surface), .35) !important; left: -6px !important; }
.wfn-handle--out { background: var(--node-color) !important; right: -6px !important; }
</style>
