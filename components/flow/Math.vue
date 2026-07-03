<script setup lang="ts">
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import type { Edge, Node } from '@vue-flow/core'
import ValueNode    from './ValueNode.vue'
import OperatorNode from './OperatorNode.vue'
import ResultNode   from './ResultNode.vue'

const nodes = ref<Node[]>([
  { id: '1', position: { x: 0,   y: 0   }, type: 'value',    data: { value: 10 } },
  { id: '2', position: { x: 0,   y: 100 }, type: 'value',    data: { value: 30 } },
  { id: '3', position: { x: 240, y: 35  }, type: 'operator', data: { operator: '+' } },
  { id: '4', position: { x: 480, y: 40  }, type: 'result',   data: {} },
])

const edges = ref<Edge[]>([
  { id: 'e1-3', source: '1', target: '3', animated: true, targetHandle: 'target-a' },
  { id: 'e2-3', source: '2', target: '3', animated: true, targetHandle: 'target-b' },
  { id: 'e3-4', source: '3', target: '4', animated: true },
])
</script>

<template>
  <VueFlow
    class="math-flow"
    :nodes="nodes"
    :edges="edges"
    fit-view-on-init
    :max-zoom="1.5"
    :min-zoom="0.5"
  >
    <template #node-value="props">
      <ValueNode :id="props.id" :data="props.data" />
    </template>
    <template #node-operator="props">
      <OperatorNode :id="props.id" :data="props.data" />
    </template>
    <template #node-result="props">
      <ResultNode :id="props.id" :data="props.data" />
    </template>
    <Background pattern-color="#aaa" :gap="24" />
  </VueFlow>
</template>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';

.math-flow {
  background-color: transparent;
  height: 100%;
  width: 100%;
}
.math-flow .vue-flow__handle {
  height: 22px;
  width: 9px;
  background: #aaa;
  border-radius: 4px;
}
.math-flow .vue-flow__edges path { stroke-width: 3; }

.math-flow .vue-flow__node-value {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #f3f4f6;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0,0,0,.2);
}
.math-flow .vue-flow__node-value.selected { box-shadow: 0 0 0 2px #ec4899; }
.math-flow .vue-flow__node-value input {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0,0,0,.1);
  width: 80px;
}
.math-flow .vue-flow__node-value input:focus { outline: none; }
.math-flow .vue-flow__node-value .vue-flow__handle { background-color: #ec4899; }

.math-flow .vue-flow__node-operator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #f3f4f6;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0,0,0,.2);
}
.math-flow .vue-flow__node-operator.selected { box-shadow: 0 0 0 2px #0EA5E9; }
.math-flow .vue-flow__node-operator .buttons { display: flex; gap: 8px; }
.math-flow .vue-flow__node-operator button {
  border: none;
  cursor: pointer;
  background-color: #4a5568;
  border-radius: 8px;
  color: white;
  width: 40px;
  height: 40px;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.math-flow .vue-flow__node-operator button:hover,
.math-flow .vue-flow__node-operator button.selected { background-color: #0EA5E9; }
.math-flow .vue-flow__node-operator .vue-flow__handle[data-handleid="target-a"] { top: 25%; }
.math-flow .vue-flow__node-operator .vue-flow__handle[data-handleid="target-b"] { top: 75%; }
.math-flow .vue-flow__node-operator .vue-flow__handle { background-color: #0EA5E9; }

.math-flow .vue-flow__node-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #f3f4f6;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0,0,0,.2);
  min-width: 100px;
}
.math-flow .vue-flow__node-result.selected { box-shadow: 0 0 0 2px #5EC697; }
.math-flow .vue-flow__node-result .calculation { display: flex; gap: 8px; font-size: 22px; }
.math-flow .vue-flow__node-result .counter { font-size: 28px; font-weight: bold; }
</style>
