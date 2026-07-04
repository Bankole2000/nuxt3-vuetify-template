<script setup lang="ts">
definePageMeta({ layout: 'catalogue' })
useSeo({ title: 'Family Tree', description: 'Four family tree visualisations of the same dataset: bidirectional D3, classic D3 tree SVG, D3 radial cluster, and Cytoscape.js hierarchical graph.' })

const tab = ref('bidirectional')
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">Family Tree</h1>
    <p class="text-body-2 text-medium-emphasis mb-1">
      The Webb family across 5 generations, including polygamous partnerships (Frank with Lena &amp; Nora concurrently;
      Harold's two sequential marriages). Four renderers, same data.
    </p>
    <p class="text-body-2 text-medium-emphasis mb-5">
      Click any person to shift focus. The ancestry list on the left stays in sync.
    </p>

    <v-tabs v-model="tab" density="compact" class="mb-4">
      <v-tab value="bidirectional">
        <v-icon start icon="mdi-family-tree" size="16" />
        Bidirectional
      </v-tab>
      <v-tab value="d3tree">
        <v-icon start icon="mdi-sitemap" size="16" />
        D3 Tree
      </v-tab>
      <v-tab value="radial">
        <v-icon start icon="mdi-chart-bubble" size="16" />
        Radial
      </v-tab>
      <v-tab value="cytoscape">
        <v-icon start icon="mdi-graph" size="16" />
        Cytoscape
      </v-tab>
    </v-tabs>

    <ClientOnly>
      <v-window v-model="tab">
        <v-window-item value="bidirectional">
          <p class="text-caption text-medium-emphasis mb-3">
            Focus person centred vertically — ancestors above, descendants below.
            Marriage bars connect co-parents; child lines drop from the midpoint.
            Drag to pan · scroll to zoom · click any node to re-focus.
          </p>
          <CommonFamilyTree />
        </v-window-item>

        <v-window-item value="d3tree">
          <p class="text-caption text-medium-emphasis mb-3">
            Classic top-down <code>d3.tree()</code> rendered entirely in SVG — no foreignObject.
            Reingold-Tilford layout guarantees no node overlaps.
            Diamond connectors between co-parents; cubic bezier links via <code>d3.linkVertical()</code>.
            Hover a sidebar name to highlight that node. Drag to pan · scroll to zoom.
          </p>
          <CommonFamilyTreeD3 />
        </v-window-item>

        <v-window-item value="radial">
          <p class="text-caption text-medium-emphasis mb-3">
            Ego-network radial layout via <code>d3.cluster()</code>.
            Focus person at centre; rings expand outward by generation.
            Amber left-border = ancestor branch · green = descendant branch.
            Dashed pink lines = partnerships between nodes at different positions.
          </p>
          <CommonFamilyTreeRadial />
        </v-window-item>

        <v-window-item value="cytoscape">
          <p class="text-caption text-medium-emphasis mb-3">
            Cytoscape.js breadth-first layout. Diamond nodes are partnership connectors —
            green = active, red = ended. Polygamous scenarios (Frank → two diamonds) render naturally.
            Dashed borders = deceased. Built-in pan/zoom · click any person to re-focus.
          </p>
          <CommonFamilyTreeCytoscape />
        </v-window-item>
      </v-window>
    </ClientOnly>
  </div>
</template>
