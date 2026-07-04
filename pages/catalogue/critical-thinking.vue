<script setup lang="ts">
import type { DecisionMatrixData } from '~/components/common/DecisionMatrix.vue'
import type { ArgumentMapData }    from '~/components/common/ArgumentMap.vue'
import type { ProsConsData }       from '~/components/common/ProsConsBoard.vue'

definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Critical Thinking', disabled: true },
  ],
})

useSeo({
  title: 'Critical Thinking',
  description: 'Decision matrix with weighted scoring, argument map node graph, and pros/cons + SWOT board — structured tools for complex decisions.',
})

const activeTab = ref(0)
const infoDialog = ref(false)

// ─── Decision Matrix data ──────────────────────────────────────────────────────
const dmData = ref<DecisionMatrixData>({
  title: 'Choose a Frontend Framework',
  criteria: [
    { id: 'lc', label: 'Learning Curve',    weight: 7 },
    { id: 'ec', label: 'Ecosystem',         weight: 9 },
    { id: 'pf', label: 'Performance',       weight: 8 },
    { id: 'tf', label: 'Team Familiarity',  weight: 10 },
    { id: 'ls', label: 'Long-term Support', weight: 8 },
  ],
  options: [
    { id: 'vue',     label: 'Vue',     color: '#42b883' },
    { id: 'react',   label: 'React',   color: '#61dafb' },
    { id: 'angular', label: 'Angular', color: '#dd0031' },
    { id: 'svelte',  label: 'Svelte',  color: '#ff3e00' },
  ],
  scores: [
    // Vue
    { optionId: 'vue', criterionId: 'lc', value: 8 },
    { optionId: 'vue', criterionId: 'ec', value: 7 },
    { optionId: 'vue', criterionId: 'pf', value: 8 },
    { optionId: 'vue', criterionId: 'tf', value: 9 },
    { optionId: 'vue', criterionId: 'ls', value: 8 },
    // React
    { optionId: 'react', criterionId: 'lc', value: 6 },
    { optionId: 'react', criterionId: 'ec', value: 10 },
    { optionId: 'react', criterionId: 'pf', value: 8 },
    { optionId: 'react', criterionId: 'tf', value: 7 },
    { optionId: 'react', criterionId: 'ls', value: 9 },
    // Angular
    { optionId: 'angular', criterionId: 'lc', value: 4 },
    { optionId: 'angular', criterionId: 'ec', value: 8 },
    { optionId: 'angular', criterionId: 'pf', value: 7 },
    { optionId: 'angular', criterionId: 'tf', value: 5 },
    { optionId: 'angular', criterionId: 'ls', value: 9 },
    // Svelte
    { optionId: 'svelte', criterionId: 'lc', value: 9 },
    { optionId: 'svelte', criterionId: 'ec', value: 5 },
    { optionId: 'svelte', criterionId: 'pf', value: 10 },
    { optionId: 'svelte', criterionId: 'tf', value: 4 },
    { optionId: 'svelte', criterionId: 'ls', value: 6 },
  ],
})

// ─── Argument Map data ─────────────────────────────────────────────────────────
const amData = ref<ArgumentMapData>({
  nodes: [
    { id: 'claim1',   type: 'claim',    text: 'We should migrate to microservices',  x: 310, y: 210 },
    { id: 'sup1',     type: 'support',  text: 'Independent scaling',                  x: 60,  y: 80  },
    { id: 'sup2',     type: 'support',  text: 'Technology flexibility',               x: 60,  y: 200 },
    { id: 'sup3',     type: 'support',  text: 'Team autonomy',                        x: 60,  y: 320 },
    { id: 'reb1',     type: 'rebuttal', text: 'Increased complexity',                 x: 580, y: 80  },
    { id: 'reb2',     type: 'rebuttal', text: 'Network latency overhead',             x: 580, y: 200 },
    { id: 'qual1',    type: 'qualifier',text: 'Only if team > 20 engineers',          x: 580, y: 320 },
    { id: 'ev1',      type: 'evidence', text: 'Netflix case study',                   x: 310, y: 400 },
    { id: 'ev2',      type: 'evidence', text: 'AWS whitepaper',                       x: 310, y: 80  },
  ],
  edges: [
    { id: 'e1', from: 'sup1',  to: 'claim1', type: 'supports'  },
    { id: 'e2', from: 'sup2',  to: 'claim1', type: 'supports'  },
    { id: 'e3', from: 'sup3',  to: 'claim1', type: 'supports'  },
    { id: 'e4', from: 'reb1',  to: 'claim1', type: 'rebuts'    },
    { id: 'e5', from: 'reb2',  to: 'claim1', type: 'rebuts'    },
    { id: 'e6', from: 'qual1', to: 'claim1', type: 'qualifies' },
    { id: 'e7', from: 'ev1',   to: 'sup1',   type: 'supports'  },
    { id: 'e8', from: 'ev2',   to: 'sup2',   type: 'supports'  },
  ],
})

// ─── Pros & Cons / SWOT data ───────────────────────────────────────────────────
const pcData = ref<ProsConsData>({
  title: 'Adopting Remote-First Work Policy',
  mode: 'pros-cons',
  pros: [
    { id: 'p1', text: 'Access to global talent pool without geographic constraints', impact: 3 },
    { id: 'p2', text: 'Reduced overhead costs for office space and facilities',       impact: 3 },
    { id: 'p3', text: 'Higher employee autonomy and reported job satisfaction',       impact: 2 },
    { id: 'p4', text: 'Asynchronous workflows improve focus and deep work time',     impact: 2 },
  ],
  cons: [
    { id: 'c1', text: 'Collaboration and spontaneous brainstorming becomes harder',  impact: 2 },
    { id: 'c2', text: 'Onboarding new team members is slower and less immersive',    impact: 2 },
    { id: 'c3', text: 'Risk of isolation and burnout from blurred work-life balance', impact: 3 },
    { id: 'c4', text: 'Timezone differences complicate real-time decision making',   impact: 1 },
  ],
  strengths:     [],
  weaknesses:    [],
  opportunities: [],
  threats:       [],
})

const swotData = ref<ProsConsData>({
  title: 'Launching a SaaS Product',
  mode: 'swot',
  pros: [],
  cons: [],
  strengths: [
    { id: 's1', text: 'Recurring revenue model with predictable cash flow',  impact: 3 },
    { id: 's2', text: 'Existing engineering team with relevant domain expertise', impact: 3 },
    { id: 's3', text: 'Low marginal cost to serve additional customers',     impact: 2 },
  ],
  weaknesses: [
    { id: 'w1', text: 'No established brand recognition in the target market', impact: 2 },
    { id: 'w2', text: 'Limited budget for customer acquisition in year one',   impact: 3 },
    { id: 'w3', text: 'Small team means slower feature development cadence',   impact: 2 },
  ],
  opportunities: [
    { id: 'o1', text: 'Growing market demand for automation in the sector',    impact: 3 },
    { id: 'o2', text: 'Competitor products are outdated and poorly reviewed',  impact: 3 },
    { id: 'o3', text: 'Partnership channels with complementary software tools',impact: 2 },
  ],
  threats: [
    { id: 't1', text: 'Well-funded incumbents could replicate the feature set', impact: 3 },
    { id: 't2', text: 'Regulatory changes could affect data handling requirements', impact: 2 },
    { id: 't3', text: 'Macroeconomic downturn reducing SMB software budgets',   impact: 2 },
  ],
})

const pcTab = ref(0)

const useCases = [
  {
    icon: 'mdi-briefcase-outline',
    title: 'Portfolio Manager (#1)',
    body: 'Use the decision matrix to evaluate and rank investment options by weighted criteria such as ROI, risk and strategic fit.',
  },
  {
    icon: 'mdi-map-outline',
    title: 'Roadmap Builder (#2)',
    body: 'Apply the SWOT board to assess features before committing to the roadmap — surfaces hidden risks and missed opportunities.',
  },
  {
    icon: 'mdi-pipe',
    title: 'Workflow Engine (#3)',
    body: 'The argument map helps teams document and challenge the reasoning behind workflow design decisions before automation is built.',
  },
  {
    icon: 'mdi-file-sign',
    title: 'Verifiable Contracts (#14)',
    body: 'Pros/Cons boards structure negotiation trade-offs between parties, producing auditable rationale alongside contract terms.',
  },
]
</script>

<template>
  <div>
    <div class="d-flex align-center mb-1 gap-3">
      <h1 class="text-h5 font-weight-bold">Critical Thinking Tools</h1>
      <v-btn
        size="small"
        variant="tonal"
        prepend-icon="mdi-information-outline"
        @click="infoDialog = true"
      >
        Use cases
      </v-btn>
    </div>
    <p class="text-body-2 text-medium-emphasis mb-6">
      Structured tools for complex decisions: a weighted decision matrix, an argument map node graph,
      and a pros/cons + SWOT board.
    </p>

    <v-tabs v-model="activeTab" class="mb-6">
      <v-tab :value="0" prepend-icon="mdi-table-check">Decision Matrix</v-tab>
      <v-tab :value="1" prepend-icon="mdi-graph-outline">Argument Map</v-tab>
      <v-tab :value="2" prepend-icon="mdi-scale-balance">Pros &amp; Cons / SWOT</v-tab>
    </v-tabs>

    <v-window v-model="activeTab">
      <!-- ── Tab 0: Decision Matrix ── -->
      <v-window-item :value="0">
        <v-card rounded="lg" class="pa-4">
          <CommonDecisionMatrix
            :data="dmData"
            @update="dmData = $event"
          />
        </v-card>
        <p class="text-caption text-medium-emphasis mt-3">
          Edit scores in each cell (1–10). Adjust criterion weights in the header row. The winner is gold-highlighted with a #1 badge.
        </p>
      </v-window-item>

      <!-- ── Tab 1: Argument Map ── -->
      <v-window-item :value="1">
        <v-card rounded="lg" class="pa-4">
          <CommonArgumentMap
            :data="amData"
            @update="amData = $event"
          />
        </v-card>
        <p class="text-caption text-medium-emphasis mt-3">
          Drag nodes to reposition · Scroll to zoom · Drag background to pan · Double-click canvas to add a node · Select + Delete key to remove.
        </p>
      </v-window-item>

      <!-- ── Tab 2: Pros & Cons / SWOT ── -->
      <v-window-item :value="2">
        <v-tabs v-model="pcTab" density="compact" class="mb-4">
          <v-tab :value="0" prepend-icon="mdi-scale-balance">Remote-First Work</v-tab>
          <v-tab :value="1" prepend-icon="mdi-view-grid-outline">SaaS Product</v-tab>
        </v-tabs>

        <v-window v-model="pcTab">
          <v-window-item :value="0">
            <v-card rounded="lg" class="pa-4">
              <CommonProsConsBoard
                :data="pcData"
                @update="pcData = $event"
              />
            </v-card>
          </v-window-item>

          <v-window-item :value="1">
            <v-card rounded="lg" class="pa-4">
              <CommonProsConsBoard
                :data="swotData"
                @update="swotData = $event"
              />
            </v-card>
          </v-window-item>
        </v-window>

        <p class="text-caption text-medium-emphasis mt-3">
          Toggle Pros/Cons ↔ SWOT mode · Drag items to reorder · Click item text to edit · Impact dots (1–3) show relative weight.
        </p>
      </v-window-item>
    </v-window>

    <!-- Info dialog -->
    <v-dialog v-model="infoDialog" max-width="560">
      <v-card rounded="lg">
        <v-card-title class="pt-5 px-6 text-h6 font-weight-bold">
          <v-icon icon="mdi-head-lightbulb-outline" class="mr-2" />
          Critical Thinking — Use Cases
        </v-card-title>
        <v-card-text class="px-6">
          <v-list lines="two" class="pa-0">
            <v-list-item
              v-for="uc in useCases"
              :key="uc.title"
              :prepend-icon="uc.icon"
              rounded="lg"
              class="mb-1 px-0"
            >
              <v-list-item-title class="text-body-2 font-weight-medium">{{ uc.title }}</v-list-item-title>
              <v-list-item-subtitle class="text-caption" style="white-space: normal;">{{ uc.body }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions class="px-6 pb-5">
          <v-spacer />
          <v-btn variant="tonal" @click="infoDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
