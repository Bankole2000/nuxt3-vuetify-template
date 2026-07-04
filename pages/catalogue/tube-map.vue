<script setup lang="ts">
import type { TubeMapData } from '~/components/common/TubeMap.vue'

useSeo({ title: 'Tube Map', description: 'Transit-style node-link diagram built from scratch.' })

definePageMeta({ layout: 'catalogue' })

// ── Tab 1: City Metro ─────────────────────────────────────────────────────────
//
// Grid layout (x right, y up):
//   Blue:  West(1,4) —E— Harbor(6,4) —E— East(11,4)
//   Red:   Central(6,9) —S— Harbor(6,4) —(S→SE corner [1,-2])— (7,2)
//          —SE— Docks(9,0) —(SE→E corner [2,-1])— (11,-1) —E— Airport(14,-1)
//   Green: NW(2,8) —SE— Harbor(6,4) —(SE→E corner [2,-1])— (8,3) —E— EastEnd(11,3)
//
// Corner validation:
//   S→SE:  [0,-1]+[1,-1] = [1,-2]  ✓ |dx|=1,|dy|=2
//   SE→E:  [1,-1]+[1,0]  = [2,-1]  ✓ |dx|=2,|dy|=1

const cityMetroData: TubeMapData = {
  stations: {
    West:    { label: 'West' },
    Harbor:  { label: 'Harbor' },
    East:    { label: 'East' },
    Central: { label: 'Central' },
    Docks:   { label: 'Docks' },
    Airport: { label: 'Airport' },
    NW:      { label: 'North\nWest' },
    EastEnd: { label: 'East End' },
  },
  lines: [
    {
      name: 'blue', label: 'Blue Line', color: '#1e88e5',
      shiftCoords: [0, 0],
      nodes: [
        { coords: [1,  4], name: 'West',   labelPos: 'W' },
        { coords: [6,  4], name: 'Harbor', labelPos: 'N', marker: 'interchange' },
        { coords: [11, 4], name: 'East',   labelPos: 'E', marker: 'interchange' },
      ],
    },
    {
      name: 'red', label: 'Red Line', color: '#e53935',
      shiftCoords: [0, 0],
      nodes: [
        { coords: [6,  9], name: 'Central', labelPos: 'N' },
        { coords: [6,  4], name: 'Harbor',  labelPos: 'W', marker: 'interchange', canonical: true },
        { coords: [7,  2] },
        { coords: [9,  0], name: 'Docks',   labelPos: 'W' },
        { coords: [11,-1] },
        { coords: [14,-1], name: 'Airport', labelPos: 'E' },
      ],
    },
    {
      name: 'green', label: 'Green Line', color: '#43a047',
      shiftCoords: [0, 0],
      nodes: [
        { coords: [2,  8], name: 'NW',      labelPos: 'W' },
        { coords: [6,  4], name: 'Harbor',  labelPos: 'N', marker: 'interchange' },
        { coords: [8,  3] },
        { coords: [11, 3], name: 'EastEnd', labelPos: 'E' },
      ],
    },
  ],
}

const cityMetroLegend = [
  { label: 'Blue Line',  color: '#1e88e5', stops: 'West · Harbor · East' },
  { label: 'Red Line',   color: '#e53935', stops: 'Central · Harbor · Docks · Airport' },
  { label: 'Green Line', color: '#43a047', stops: 'North West · Harbor · East End' },
]

// ── Tab 2: London Underground excerpt ─────────────────────────────────────────
//
// Victoria line: straight N at x=8, y=0..28
// District line: straight E at y=8, x=2..26
// Circle line:   shares District x=2..26, then turns N at TowerHill corner,
//                runs N x=27 to Farringdon, then turns W back to KingsCross (hide node)
// Jubilee line:  straight E at y=10, x=4..16
//
// Corner validations:
//   Circle E→N at TowerHill(26,8): step [1,0]+[0,1]=[1,1] → corner(27,9)  ✓ |dx|=1,|dy|=1
//   Circle N→W at Farringdon(27,19): step [0,1]+[-1,0]=[-1,1] → corner(26,20) ✓ |dx|=1,|dy|=1

const londonData: TubeMapData = {
  stations: {
    Brixton:            { label: 'Brixton' },
    Stockwell:          { label: 'Stockwell' },
    Vauxhall:           { label: 'Vauxhall' },
    Pimlico:            { label: 'Pimlico' },
    Victoria:           { label: 'Victoria' },
    GreenPark:          { label: 'Green\nPark' },
    OxfordCircus:       { label: 'Oxford\nCircus' },
    WarrenStreet:       { label: 'Warren\nStreet' },
    KingsCross:         { label: "King's Cross\nSt Pancras" },
    HighburyIslington:  { label: 'Highbury &\nIslington' },
    FinsburyPark:       { label: 'Finsbury\nPark' },
    SevenSisters:       { label: 'Seven\nSisters' },
    TottenhamHale:      { label: 'Tottenham\nHale' },
    BlackhorseRoad:     { label: 'Blackhorse\nRoad' },
    WalthamstowCentral: { label: 'Walthamstow\nCentral' },
    SouthKensington:    { label: 'South\nKensington' },
    SloaneSquare:       { label: 'Sloane\nSquare' },
    StJamessPark:       { label: "St James's\nPark" },
    Westminster:        { label: 'Westminster' },
    Embankment:         { label: 'Embankment' },
    Temple:             { label: 'Temple' },
    Blackfriars:        { label: 'Blackfriars' },
    MansionHouse:       { label: 'Mansion\nHouse' },
    CannonStreet:       { label: 'Cannon\nStreet' },
    Monument:           { label: 'Monument' },
    TowerHill:          { label: 'Tower Hill' },
    Aldgate:            { label: 'Aldgate' },
    LiverpoolStreet:    { label: 'Liverpool\nStreet' },
    Moorgate:           { label: 'Moorgate' },
    Barbican:           { label: 'Barbican' },
    Farringdon:         { label: 'Farringdon' },
    BondStreet:         { label: 'Bond\nStreet' },
    Waterloo:           { label: 'Waterloo' },
  },
  lines: [
    // Victoria line — straight N from Brixton(8,0) to WalthamstowCentral(8,28)
    {
      name: 'victoria', label: 'Victoria', color: '#009FE0',
      shiftCoords: [0, 0],
      nodes: [
        { coords: [8,  0], name: 'Brixton',            labelPos: 'W' },
        { coords: [8,  2], name: 'Stockwell',          labelPos: 'W' },
        { coords: [8,  4], name: 'Vauxhall',           labelPos: 'W' },
        { coords: [8,  6], name: 'Pimlico',            labelPos: 'W' },
        { coords: [8,  8], name: 'Victoria',           labelPos: 'W', marker: 'interchange' },
        { coords: [8, 10], name: 'GreenPark',          labelPos: 'W', marker: 'interchange' },
        { coords: [8, 12], name: 'OxfordCircus',       labelPos: 'W', marker: 'interchange' },
        { coords: [8, 14], name: 'WarrenStreet',       labelPos: 'W' },
        { coords: [8, 16], name: 'KingsCross',         labelPos: 'E', marker: 'interchange' },
        { coords: [8, 18], name: 'HighburyIslington',  labelPos: 'E' },
        { coords: [8, 20], name: 'FinsburyPark',       labelPos: 'E', marker: 'interchange' },
        { coords: [8, 22], name: 'SevenSisters',       labelPos: 'E' },
        { coords: [8, 24], name: 'TottenhamHale',      labelPos: 'E' },
        { coords: [8, 26], name: 'BlackhorseRoad',     labelPos: 'E' },
        { coords: [8, 28], name: 'WalthamstowCentral', labelPos: 'E' },
      ],
    },
    // District line — straight E from SouthKensington(2,8) to TowerHill(26,8)
    {
      name: 'district', label: 'District', color: '#007229',
      shiftCoords: [0, 0],
      nodes: [
        { coords: [ 2, 8], name: 'SouthKensington', labelPos: 'S' },
        { coords: [ 4, 8], name: 'SloaneSquare',    labelPos: 'S' },
        { coords: [ 8, 8], name: 'Victoria',        labelPos: 'N', marker: 'interchange', canonical: true },
        { coords: [10, 8], name: 'StJamessPark',    labelPos: 'S' },
        { coords: [12, 8], name: 'Westminster',     labelPos: 'S', marker: 'interchange' },
        { coords: [14, 8], name: 'Embankment',      labelPos: 'S', marker: 'interchange' },
        { coords: [16, 8], name: 'Temple',          labelPos: 'S' },
        { coords: [18, 8], name: 'Blackfriars',     labelPos: 'S' },
        { coords: [20, 8], name: 'MansionHouse',    labelPos: 'S' },
        { coords: [22, 8], name: 'CannonStreet',    labelPos: 'S' },
        { coords: [24, 8], name: 'Monument',        labelPos: 'S', marker: 'interchange' },
        { coords: [26, 8], name: 'TowerHill',       labelPos: 'S', marker: 'interchange' },
      ],
    },
    // Circle line — shares District from SouthKensington to TowerHill (nodes hidden),
    // then E→N corner at (27,9), north to Farringdon,
    // then N→W corner at (26,20), west back past KingsCross (hidden node).
    // E→N corner at TowerHill(26,8): corner(27,9) — step [1,1] ✓
    // N→W corner at Farringdon(27,19): corner(26,20) — step [-1,1] ✓
    {
      name: 'circle', label: 'Circle', color: '#FFD329',
      shiftCoords: [0, 1],
      nodes: [
        { coords: [ 2, 8], name: 'SouthKensington', labelPos: 'N', hide: true },
        { coords: [ 4, 8], name: 'SloaneSquare',    labelPos: 'N', hide: true },
        { coords: [ 8, 8], name: 'Victoria',        labelPos: 'N', hide: true },
        { coords: [10, 8], name: 'StJamessPark',    labelPos: 'N', hide: true },
        { coords: [12, 8], name: 'Westminster',     labelPos: 'N', hide: true },
        { coords: [14, 8], name: 'Embankment',      labelPos: 'N', hide: true },
        { coords: [16, 8], name: 'Temple',          labelPos: 'N', hide: true },
        { coords: [18, 8], name: 'Blackfriars',     labelPos: 'N', hide: true },
        { coords: [20, 8], name: 'MansionHouse',    labelPos: 'N', hide: true },
        { coords: [22, 8], name: 'CannonStreet',    labelPos: 'N', hide: true },
        { coords: [24, 8], name: 'Monument',        labelPos: 'N', hide: true },
        { coords: [26, 8], name: 'TowerHill',       labelPos: 'N', hide: true },
        // E→N corner: TowerHill(26,8) + [1,1] = (27,9)
        { coords: [27,  9] },
        { coords: [27, 11], name: 'Aldgate',         labelPos: 'E' },
        { coords: [27, 13], name: 'LiverpoolStreet', labelPos: 'E', marker: 'interchange' },
        { coords: [27, 15], name: 'Moorgate',        labelPos: 'E', marker: 'interchange' },
        { coords: [27, 17], name: 'Barbican',        labelPos: 'E' },
        { coords: [27, 19], name: 'Farringdon',      labelPos: 'E', marker: 'interchange' },
        // N→W corner: Farringdon(27,19) + [-1,1] = (26,20)
        { coords: [26, 20] },
        { coords: [ 8, 20], name: 'KingsCross',      labelPos: 'N', hide: true },
      ],
    },
    // Jubilee line — straight E at y=10, from BondStreet(4,10) to Waterloo(16,10)
    {
      name: 'jubilee', label: 'Jubilee', color: '#7B868C',
      shiftCoords: [0, 0],
      nodes: [
        { coords: [ 4, 10], name: 'BondStreet',  labelPos: 'N' },
        { coords: [ 8, 10], name: 'GreenPark',   labelPos: 'N', marker: 'interchange' },
        { coords: [12, 10], name: 'Westminster',  labelPos: 'N', marker: 'interchange' },
        { coords: [16, 10], name: 'Waterloo',    labelPos: 'N', marker: 'interchange' },
      ],
    },
  ],
}

const londonLegend = [
  { label: 'Victoria',  color: '#009FE0' },
  { label: 'District',  color: '#007229' },
  { label: 'Circle',    color: '#FFD329' },
  { label: 'Jubilee',   color: '#7B868C' },
]

// ── Tab 3: Tech Campus Shuttle ────────────────────────────────────────────────
//
// Red Shuttle:   MainGate(0,0) →NE→ Cafeteria(2,2) →NE→ Engineering(4,4)
//                →[NE→N corner (5,6)]→ ServerRoom(5,6) →N→ Parking(5,8)
//   NE→N at Engineering(4,4): step [1,1]+[0,1]=[1,2] → corner(5,6) ✓
//
// Blue Shuttle:  MainGate(0,0) →E→ Gym(4,0) →[E→N corner (5,1)]→ (5,1)
//                →N→ DesignStudio(5,5) →[N→NE corner (6,7)]→ (6,7)
//                →NE→ ConferenceCenter(8,9)
//   E→N at Gym(4,0): step [1,0]+[0,1]=[1,1] → corner(5,1) ✓
//   N→NE at DesignStudio(5,5): step [0,1]+[1,1]=[1,2] → corner(6,7) ✓
//
// Green Shuttle: Cafeteria(2,2) →E→ (4,2) →[E→N corner (5,3)]→ (5,3)
//                →N→ DesignStudio(5,5) →[N→NE corner (6,7)]→ ConferenceCenter(8,9)
//   E→N at (4,2): step [1,1] → corner(5,3) ✓

const techCampusData: TubeMapData = {
  stations: {
    MainGate:         { label: 'Main\nGate' },
    Cafeteria:        { label: 'Cafeteria' },
    Engineering:      { label: 'Engineering' },
    ServerRoom:       { label: 'Server\nRoom' },
    Parking:          { label: 'Parking' },
    Gym:              { label: 'Gym' },
    DesignStudio:     { label: 'Design\nStudio' },
    ConferenceCenter: { label: 'Conference\nCenter' },
  },
  lines: [
    {
      name: 'red-shuttle', label: 'Red Shuttle', color: '#e53935',
      shiftCoords: [0, 0],
      nodes: [
        { coords: [0, 0], name: 'MainGate',    labelPos: 'SW' },
        { coords: [2, 2], name: 'Cafeteria',   labelPos: 'W', marker: 'interchange' },
        { coords: [4, 4], name: 'Engineering', labelPos: 'W', marker: 'interchange' },
        // NE→N corner: Engineering(4,4) + [1,2] = (5,6)
        { coords: [5, 6], name: 'ServerRoom',  labelPos: 'E' },
        { coords: [5, 8], name: 'Parking',     labelPos: 'E' },
      ],
    },
    {
      name: 'blue-shuttle', label: 'Blue Shuttle', color: '#1e88e5',
      shiftCoords: [0, 0],
      nodes: [
        { coords: [0, 0], name: 'MainGate',         labelPos: 'SW', hide: true },
        { coords: [4, 0], name: 'Gym',              labelPos: 'S' },
        // E→N corner: Gym(4,0) + [1,1] = (5,1)
        { coords: [5, 1] },
        { coords: [5, 5], name: 'DesignStudio',     labelPos: 'E', marker: 'interchange' },
        // N→NE corner: DesignStudio(5,5) + [1,2] = (6,7)
        { coords: [6, 7] },
        { coords: [8, 9], name: 'ConferenceCenter', labelPos: 'E' },
      ],
    },
    {
      name: 'green-shuttle', label: 'Green Shuttle', color: '#43a047',
      shiftCoords: [0, 0],
      nodes: [
        { coords: [2, 2], name: 'Cafeteria',        labelPos: 'S', hide: true },
        { coords: [4, 2] },
        // E→N corner: (4,2) + [1,1] = (5,3)
        { coords: [5, 3] },
        { coords: [5, 5], name: 'DesignStudio',     labelPos: 'W', marker: 'interchange', canonical: true },
        // N→NE corner: DesignStudio(5,5) + [1,2] = (6,7)
        { coords: [6, 7] },
        { coords: [8, 9], name: 'ConferenceCenter', labelPos: 'N', marker: 'interchange', canonical: true },
      ],
    },
  ],
}

const techCampusLegend = [
  { label: 'Red Shuttle',   color: '#e53935', stops: 'Main Gate · Cafeteria · Engineering · Server Room · Parking' },
  { label: 'Blue Shuttle',  color: '#1e88e5', stops: 'Main Gate · Gym · Design Studio · Conference Center' },
  { label: 'Green Shuttle', color: '#43a047', stops: 'Cafeteria · Design Studio · Conference Center' },
]

// ── Tab 4: Airport Terminal Shuttle ──────────────────────────────────────────
//
// Terminal Express: straight E from CarPark(0,4) to Terminal4(12,4)
//
// Gates Shuttle:    Arrivals(0,0) →E→ (2,0) →[E→N corner (3,1)]→ (3,1)
//                   →N→ Terminal1(3,4) →[N→NE corner (4,6)]→ (4,6)
//                   →NE→ GateB(6,8) →NE→ GateC(8,10)
//   E→N at (2,0): step [1,0]+[0,1]=[1,1] → corner(3,1) ✓
//   N→NE at Terminal1(3,4): step [0,1]+[1,1]=[1,2] → corner(4,6) ✓
//
// Lounge Connector: CarPark(0,4) →N→ GateA(0,7) →N→ Lounge(0,10)  (straight N)

const airportData: TubeMapData = {
  stations: {
    CarPark:   { label: 'Car\nPark' },
    Arrivals:  { label: 'Arrivals' },
    Terminal1: { label: 'Terminal\n1' },
    Terminal2: { label: 'Terminal\n2' },
    Terminal3: { label: 'Terminal\n3' },
    Terminal4: { label: 'Terminal\n4' },
    GateA:     { label: 'Gate A' },
    GateB:     { label: 'Gate B' },
    GateC:     { label: 'Gate C' },
    Lounge:    { label: 'Lounge' },
  },
  lines: [
    {
      name: 'terminal-express', label: 'Terminal Express', color: '#e53935',
      shiftCoords: [0, 0],
      nodes: [
        { coords: [ 0, 4], name: 'CarPark',   labelPos: 'W', marker: 'interchange' },
        { coords: [ 3, 4], name: 'Terminal1', labelPos: 'S', marker: 'interchange' },
        { coords: [ 6, 4], name: 'Terminal2', labelPos: 'S' },
        { coords: [ 9, 4], name: 'Terminal3', labelPos: 'S' },
        { coords: [12, 4], name: 'Terminal4', labelPos: 'E' },
      ],
    },
    {
      name: 'gates-shuttle', label: 'Gates Shuttle', color: '#1e88e5',
      shiftCoords: [0, 0],
      nodes: [
        { coords: [0, 0], name: 'Arrivals',  labelPos: 'W' },
        { coords: [2, 0] },
        // E→N corner: (2,0) + [1,1] = (3,1)
        { coords: [3, 1] },
        { coords: [3, 4], name: 'Terminal1', labelPos: 'N', marker: 'interchange', canonical: true },
        // N→NE corner: Terminal1(3,4) + [1,2] = (4,6)
        { coords: [4, 6] },
        { coords: [6, 8], name: 'GateB',     labelPos: 'E' },
        { coords: [8,10], name: 'GateC',     labelPos: 'E' },
      ],
    },
    {
      name: 'lounge-connector', label: 'Lounge Connector', color: '#f9a825',
      shiftCoords: [0, 0],
      nodes: [
        { coords: [0, 4], name: 'CarPark', labelPos: 'E', hide: true },
        { coords: [0, 7], name: 'GateA',   labelPos: 'W' },
        { coords: [0,10], name: 'Lounge',  labelPos: 'W' },
      ],
    },
  ],
}

const airportLegend = [
  { label: 'Terminal Express', color: '#e53935', stops: 'Car Park · T1 · T2 · T3 · T4' },
  { label: 'Gates Shuttle',    color: '#1e88e5', stops: 'Arrivals · T1 · Gate B · Gate C' },
  { label: 'Lounge Connector', color: '#f9a825', stops: 'Car Park · Gate A · Lounge' },
]

// ── Shared state ──────────────────────────────────────────────────────────────

const activeTab = ref(0)
const lastClicked = ref<string | null>(null)

function onStationClick(name: string) {
  lastClicked.value = name
}
</script>

<template>
  <v-container>
    <h1 class="text-h5 font-weight-bold mb-1">Tube Map</h1>
    <p class="text-body-2 text-medium-emphasis mb-4">
      Transit-style diagram with d3 imperative rendering, replicating the logic of
      <em>d3-tube-map</em>: compass-direction routing, quadratic bezier corners,
      interchange circles, and station tick marks. Click any station.
    </p>

    <v-tabs v-model="activeTab" class="mb-4">
      <v-tab :value="0">City Metro</v-tab>
      <v-tab :value="1">London Underground</v-tab>
      <v-tab :value="2">Tech Campus</v-tab>
      <v-tab :value="3">Airport Terminal</v-tab>
    </v-tabs>

    <v-tabs-window v-model="activeTab">

      <!-- ── Tab 1: City Metro ─────────────────────────────────────────── -->
      <v-tabs-window-item :value="0">
        <v-row>
          <v-col cols="12" md="9">
            <v-card rounded="lg" class="overflow-hidden" elevation="1" color="grey-lighten-5">
              <CommonTubeMap
                :data="cityMetroData"
                :width="760"
                :height="440"
                :margin="{ top: 70, right: 130, bottom: 60, left: 130 }"
                @station-click="onStationClick"
              />
            </v-card>
            <p v-if="lastClicked" class="mt-3 text-body-2">
              Selected: <strong>{{ lastClicked }}</strong>
            </p>
          </v-col>
          <v-col cols="12" md="3">
            <v-card rounded="lg" class="pa-4" elevation="0" variant="tonal">
              <p class="text-overline mb-3">Lines</p>
              <div v-for="l in cityMetroLegend" :key="l.label" class="mb-3">
                <div class="d-flex align-center gap-2 mb-1">
                  <v-sheet :color="l.color" width="28" height="4" rounded />
                  <span class="text-body-2 font-weight-medium">{{ l.label }}</span>
                </div>
                <p class="text-caption text-medium-emphasis ml-9">{{ l.stops }}</p>
              </div>
              <v-divider class="my-3" />
              <p class="text-overline mb-2">Markers</p>
              <div class="d-flex align-center gap-2 mb-2">
                <svg width="18" height="18" style="flex-shrink:0">
                  <circle cx="9" cy="9" r="6" fill="white" stroke="#333" stroke-width="1.5" />
                </svg>
                <span class="text-caption">Interchange</span>
              </div>
              <div class="d-flex align-center gap-2">
                <svg width="18" height="18" style="flex-shrink:0">
                  <line x1="9" y1="3" x2="9" y2="15" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>
                </svg>
                <span class="text-caption">Station</span>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-tabs-window-item>

      <!-- ── Tab 2: London Underground ────────────────────────────────── -->
      <v-tabs-window-item :value="1">
        <v-row>
          <v-col cols="12" md="9">
            <v-card rounded="lg" class="overflow-hidden" elevation="1" color="grey-lighten-5">
              <CommonTubeMap
                :data="londonData"
                :width="860"
                :height="560"
                :margin="{ top: 80, right: 150, bottom: 80, left: 150 }"
                @station-click="onStationClick"
              />
            </v-card>
            <p v-if="lastClicked" class="mt-3 text-body-2">
              Selected: <strong>{{ lastClicked }}</strong>
            </p>
          </v-col>
          <v-col cols="12" md="3">
            <v-card rounded="lg" class="pa-4" elevation="0" variant="tonal">
              <p class="text-overline mb-3">Lines</p>
              <div v-for="l in londonLegend" :key="l.label" class="mb-3">
                <div class="d-flex align-center gap-2">
                  <v-sheet :color="l.color" width="28" height="4" rounded />
                  <span class="text-body-2 font-weight-medium">{{ l.label }}</span>
                </div>
              </div>
              <v-divider class="my-3" />
              <p class="text-caption text-medium-emphasis">
                Excerpt: Victoria, District, Circle, and Jubilee lines with key interchange stations.
              </p>
            </v-card>
          </v-col>
        </v-row>
      </v-tabs-window-item>

      <!-- ── Tab 3: Tech Campus ────────────────────────────────────────── -->
      <v-tabs-window-item :value="2">
        <v-row>
          <v-col cols="12" md="9">
            <v-card rounded="lg" class="overflow-hidden" elevation="1" color="grey-lighten-5">
              <CommonTubeMap
                :data="techCampusData"
                :width="760"
                :height="480"
                :margin="{ top: 80, right: 140, bottom: 70, left: 140 }"
                @station-click="onStationClick"
              />
            </v-card>
            <p v-if="lastClicked" class="mt-3 text-body-2">
              Selected: <strong>{{ lastClicked }}</strong>
            </p>
          </v-col>
          <v-col cols="12" md="3">
            <v-card rounded="lg" class="pa-4" elevation="0" variant="tonal">
              <p class="text-overline mb-3">Shuttle Routes</p>
              <div v-for="l in techCampusLegend" :key="l.label" class="mb-3">
                <div class="d-flex align-center gap-2 mb-1">
                  <v-sheet :color="l.color" width="28" height="4" rounded />
                  <span class="text-body-2 font-weight-medium">{{ l.label }}</span>
                </div>
                <p class="text-caption text-medium-emphasis ml-9">{{ l.stops }}</p>
              </div>
              <v-divider class="my-3" />
              <p class="text-caption text-medium-emphasis">
                Fictional tech campus with diagonal segments and shared interchanges.
              </p>
            </v-card>
          </v-col>
        </v-row>
      </v-tabs-window-item>

      <!-- ── Tab 4: Airport Terminal ───────────────────────────────────── -->
      <v-tabs-window-item :value="3">
        <v-row>
          <v-col cols="12" md="9">
            <v-card rounded="lg" class="overflow-hidden" elevation="1" color="grey-lighten-5">
              <CommonTubeMap
                :data="airportData"
                :width="760"
                :height="480"
                :margin="{ top: 80, right: 140, bottom: 70, left: 140 }"
                @station-click="onStationClick"
              />
            </v-card>
            <p v-if="lastClicked" class="mt-3 text-body-2">
              Selected: <strong>{{ lastClicked }}</strong>
            </p>
          </v-col>
          <v-col cols="12" md="3">
            <v-card rounded="lg" class="pa-4" elevation="0" variant="tonal">
              <p class="text-overline mb-3">Shuttle Lines</p>
              <div v-for="l in airportLegend" :key="l.label" class="mb-3">
                <div class="d-flex align-center gap-2 mb-1">
                  <v-sheet :color="l.color" width="28" height="4" rounded />
                  <span class="text-body-2 font-weight-medium">{{ l.label }}</span>
                </div>
                <p class="text-caption text-medium-emphasis ml-9">{{ l.stops }}</p>
              </div>
              <v-divider class="my-3" />
              <p class="text-caption text-medium-emphasis">
                Fictional airport with inter-terminal express, gates shuttle, and lounge connector.
              </p>
            </v-card>
          </v-col>
        </v-row>
      </v-tabs-window-item>

    </v-tabs-window>
  </v-container>
</template>
