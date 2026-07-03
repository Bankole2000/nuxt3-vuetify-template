<script setup lang="ts">
definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Vue Flow', disabled: true },
  ],
})

useSeo({ title: 'Vue Flow', description: 'Interactive node-based flow editor powered by Vue Flow — demonstrating data flow between custom nodes.' })
</script>

<template>
  <div>
    <div class="d-flex align-center gap-3 mb-2">
      <h1 class="text-h4 font-weight-bold">Vue Flow</h1>
      <v-chip color="primary" size="small" variant="tonal">@vue-flow/core</v-chip>
    </div>
    <p class="text-body-1 text-medium-emphasis mb-6">
      A math operation flow — two Value nodes feed into an Operator node which computes a Result in real time.
      Demonstrates <code>useNodeConnections</code> and <code>useNodesData</code> for reactive data flow between nodes.
    </p>

    <v-row class="mb-4">
      <v-col cols="12" sm="4">
        <v-card rounded="lg" variant="tonal" color="primary" class="pa-4 d-flex align-center gap-3">
          <v-icon icon="mdi-numeric" />
          <div>
            <p class="text-body-2 font-weight-medium">Value nodes</p>
            <p class="text-caption">Type any number into the input field</p>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card rounded="lg" variant="tonal" color="info" class="pa-4 d-flex align-center gap-3">
          <v-icon icon="mdi-plus-minus-variant" />
          <div>
            <p class="text-body-2 font-weight-medium">Operator node</p>
            <p class="text-caption">Pick +  −  ×  ÷ to change the operation</p>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card rounded="lg" variant="tonal" color="success" class="pa-4 d-flex align-center gap-3">
          <v-icon icon="mdi-equal" />
          <div>
            <p class="text-body-2 font-weight-medium">Result node</p>
            <p class="text-caption">Updates instantly — green if ≥ 0, red if negative</p>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-card rounded="lg" class="overflow-hidden" style="height: 400px">
      <ClientOnly>
        <FlowMath />
      </ClientOnly>
    </v-card>

    <v-row class="mt-6">
      <v-col cols="12" sm="6">
        <v-card rounded="lg" variant="outlined" class="pa-4">
          <p class="text-body-2 font-weight-bold mb-2">How it works</p>
          <p class="text-body-2 text-medium-emphasis mb-1">• <code>useNodeConnections</code> — walks the graph backwards to find which nodes feed into the current one</p>
          <p class="text-body-2 text-medium-emphasis mb-1">• <code>useNodesData</code> — subscribes to reactive data on any set of nodes by ID</p>
          <p class="text-body-2 text-medium-emphasis">• <code>updateNodeData</code> — updates a node's data from inside its own component</p>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6">
        <v-card rounded="lg" variant="outlined" class="pa-4">
          <p class="text-body-2 font-weight-bold mb-2">Interactions</p>
          <p class="text-body-2 text-medium-emphasis mb-1">• Drag nodes to rearrange the layout</p>
          <p class="text-body-2 text-medium-emphasis mb-1">• Scroll to zoom, drag background to pan</p>
          <p class="text-body-2 text-medium-emphasis mb-1">• Change values or operator — result updates live</p>
          <p class="text-body-2 text-medium-emphasis">• Handles are fixed (not connectable in this demo)</p>
        </v-card>
      </v-col>
    </v-row>

    <h2 class="text-overline text-medium-emphasis mt-8 mb-4">Usage</h2>
    <v-card rounded="lg" class="pa-6">
      <v-sheet rounded="lg" color="surface-variant" class="pa-4">
        <pre class="text-body-2"><code v-pre>&lt;!-- Wrap in ClientOnly — VueFlow uses browser APIs --&gt;
&lt;ClientOnly&gt;
  &lt;FlowMath /&gt;
&lt;/ClientOnly&gt;

&lt;!-- Custom node types are registered via named slots --&gt;
&lt;VueFlow :nodes="nodes" :edges="edges"&gt;
  &lt;template #node-value="props"&gt;
    &lt;ValueNode :id="props.id" :data="props.data" /&gt;
  &lt;/template&gt;
&lt;/VueFlow&gt;</code></pre>
      </v-sheet>
    </v-card>
  </div>
</template>
