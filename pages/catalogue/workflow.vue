<script setup lang="ts">
definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Workflow Editor', disabled: true },
  ],
})

useSeo({ title: 'Workflow Editor', description: 'Node-based visual workflow editor with draggable nodes, bezier edges, pan/zoom canvas and minimap.' })
</script>

<template>
  <div>
    <h1 class="text-h4 font-weight-bold mb-2">Workflow Editor</h1>
    <p class="text-body-1 text-medium-emphasis mb-6">
      Node-based visual editor — drag nodes from the palette, connect ports to draw edges, pan with drag, zoom with scroll.
    </p>

    <v-row class="mb-4">
      <v-col cols="12" sm="4">
        <v-card rounded="lg" variant="tonal" color="info" class="pa-4 d-flex align-center gap-3">
          <v-icon icon="mdi-cursor-move" />
          <div>
            <p class="text-body-2 font-weight-medium">Pan</p>
            <p class="text-caption">Drag the canvas background</p>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card rounded="lg" variant="tonal" color="info" class="pa-4 d-flex align-center gap-3">
          <v-icon icon="mdi-magnify-plus-outline" />
          <div>
            <p class="text-body-2 font-weight-medium">Zoom</p>
            <p class="text-caption">Mouse wheel or trackpad pinch</p>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card rounded="lg" variant="tonal" color="info" class="pa-4 d-flex align-center gap-3">
          <v-icon icon="mdi-vector-polyline-plus" />
          <div>
            <p class="text-body-2 font-weight-medium">Connect</p>
            <p class="text-caption">Drag from a port dot to another</p>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <ClientOnly>
      <CommonWorkflowEditor />
    </ClientOnly>

    <v-row class="mt-6 mb-2">
      <v-col cols="12" sm="6">
        <v-card rounded="lg" variant="outlined" class="pa-4">
          <p class="text-body-2 font-weight-bold mb-2">Keyboard shortcuts</p>
          <v-table density="compact">
            <tbody>
              <tr><td class="text-caption"><kbd>Delete</kbd> / <kbd>Backspace</kbd></td><td class="text-caption text-medium-emphasis">Delete selected node</td></tr>
              <tr><td class="text-caption">Click edge</td><td class="text-caption text-medium-emphasis">Delete that edge</td></tr>
              <tr><td class="text-caption">Click palette item</td><td class="text-caption text-medium-emphasis">Add node at canvas centre</td></tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6">
        <v-card rounded="lg" variant="outlined" class="pa-4">
          <p class="text-body-2 font-weight-bold mb-2">Port rules</p>
          <p class="text-body-2 text-medium-emphasis mb-1">• Blue filled dots are <strong>outputs</strong></p>
          <p class="text-body-2 text-medium-emphasis mb-1">• Hollow dots are <strong>inputs</strong></p>
          <p class="text-body-2 text-medium-emphasis mb-1">• Drag from output → input to connect</p>
          <p class="text-body-2 text-medium-emphasis">• Filter nodes have 2 outputs (true / false branch)</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Logic Simulator section -->
    <h2 class="text-overline text-medium-emphasis mt-10 mb-2">Logic Gate Simulator</h2>
    <p class="text-body-2 text-medium-emphasis mb-4">
      Same canvas — but with a <strong>Run</strong> button that propagates signals through logic gates in topological order.
      Toggle inputs, pick a preset circuit, then hit Run to watch the evaluation animate node-by-node.
    </p>

    <ClientOnly>
      <CommonLogicSimulator />
    </ClientOnly>

    <v-row class="mt-4">
      <v-col cols="12" sm="4">
        <v-card rounded="lg" variant="outlined" class="pa-4">
          <p class="text-body-2 font-weight-bold mb-2">Half Adder</p>
          <p class="text-body-2 text-medium-emphasis">A + B → XOR gives the sum bit, AND gives the carry bit. The fundamental building block of binary addition.</p>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card rounded="lg" variant="outlined" class="pa-4">
          <p class="text-body-2 font-weight-bold mb-2">Majority Gate</p>
          <p class="text-body-2 text-medium-emphasis">Output is 1 if at least 2 of the 3 inputs are 1. Built from AND + OR layers — demonstrates multi-level logic.</p>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card rounded="lg" variant="outlined" class="pa-4">
          <p class="text-body-2 font-weight-bold mb-2">SR Latch</p>
          <p class="text-body-2 text-medium-emphasis">Two cross-coupled NOR gates. Set S=1 to latch Q=1; set R=1 to reset. Shows feedback loops in combinational logic.</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Graph Explorer section -->
    <h2 class="text-overline text-medium-emphasis mt-10 mb-2">Graph Database Explorer</h2>
    <p class="text-body-2 text-medium-emphasis mb-4">
      Entity-relationship graph with typed nodes and labelled edges — similar to a Neo4j browser.
      Click any node or edge to open its properties panel with a generated Cypher query stub.
      Filter visible node labels from the sidebar.
    </p>

    <ClientOnly>
      <CommonGraphExplorer />
    </ClientOnly>

    <v-row class="mt-4 mb-2">
      <v-col cols="12" sm="4">
        <v-card rounded="lg" variant="outlined" class="pa-4">
          <p class="text-body-2 font-weight-bold mb-1">6 node labels</p>
          <p class="text-body-2 text-medium-emphasis">Person, Movie, Product, Company, Tag, Location — toggle visibility from the sidebar.</p>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card rounded="lg" variant="outlined" class="pa-4">
          <p class="text-body-2 font-weight-bold mb-1">8 relationship types</p>
          <p class="text-body-2 text-medium-emphasis">KNOWS, ACTED_IN, DIRECTED, WORKS_AT, LOCATED_IN, TAGGED_WITH, PURCHASED, REVIEWED.</p>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card rounded="lg" variant="outlined" class="pa-4">
          <p class="text-body-2 font-weight-bold mb-1">Properties panel</p>
          <p class="text-body-2 text-medium-emphasis">Click a node or edge — view its properties and a Cypher query for that selection.</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Usage -->
    <h2 class="text-overline text-medium-emphasis mt-10 mb-4">Usage</h2>
    <v-card rounded="lg" class="pa-6">
      <v-sheet rounded="lg" color="surface-variant" class="pa-4 mb-4">
        <pre class="text-body-2"><code v-pre>&lt;!-- Free-form workflow editor --&gt;
&lt;ClientOnly&gt;
  &lt;CommonWorkflowEditor /&gt;
&lt;/ClientOnly&gt;

&lt;!-- Logic gate simulator with Run button --&gt;
&lt;ClientOnly&gt;
  &lt;CommonLogicSimulator /&gt;
&lt;/ClientOnly&gt;

&lt;!-- Graph database explorer --&gt;
&lt;ClientOnly&gt;
  &lt;CommonGraphExplorer /&gt;
&lt;/ClientOnly&gt;</code></pre>
      </v-sheet>
    </v-card>
  </div>
</template>
