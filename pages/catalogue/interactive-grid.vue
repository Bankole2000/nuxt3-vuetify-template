<script setup lang="ts">
import type { GridCell, VariantStyle } from '~/components/common/InteractiveGrid.vue'

definePageMeta({ layout: 'catalogue' })
useSeo({ title: 'Interactive Grid', description: 'Generic clickable grid component demonstrated across four use-cases: Memory Match, Whack-a-Mole, Seat Reservation, and Chess.' })

const tab = ref('memory')

// ─────────────────────────────────────────────────────────────────────────────
// 1. MEMORY MATCH
// ─────────────────────────────────────────────────────────────────────────────

type MemVariant = 'hidden' | 'flipped' | 'matched'

const MEM_EMOJIS = ['🍎','🍊','🍋','🍇','🍓','🍒','🍑','🥝']
const MEM_PAIRS  = [...MEM_EMOJIS, ...MEM_EMOJIS]

const memVariants: Record<MemVariant, VariantStyle> = {
  hidden:  { background: 'rgba(var(--v-theme-primary), .15)', border: '1.5px solid rgba(var(--v-theme-primary), .25)', icon: 'mdi-help', iconColor: 'rgba(var(--v-theme-primary), .4)' },
  flipped: { background: 'rgba(var(--v-theme-primary), .3)',  border: '1.5px solid rgba(var(--v-theme-primary), .6)', fontSize: '24px' },
  matched: { background: '#10b98120', border: '1.5px solid #10b981', fontSize: '24px', opacity: 0.75 },
}

interface MemCell { emoji: string }

const memDeal = () =>
  [...MEM_PAIRS].sort(() => Math.random() - 0.5)
    .map(e => ({ variant: 'hidden' as MemVariant, label: e, data: { emoji: e } as MemCell }))

const memCells   = ref<GridCell<MemVariant>[]>(memDeal())
const memFlipped = ref<number[]>([])
const memMatched = ref<Set<number>>(new Set())
const memLocked  = ref(false)
const memMoves   = ref(0)
const memWon     = computed(() => memMatched.value.size === MEM_PAIRS.length)

const memShuffle = () => {
  memCells.value   = memDeal()
  memFlipped.value = []
  memMatched.value = new Set()
  memLocked.value  = false
  memMoves.value   = 0
}

const memClick = (i: number) => {
  if (memLocked.value) return
  if (memMatched.value.has(i)) return
  if (memFlipped.value.includes(i)) return
  if (memFlipped.value.length === 2) return

  const cells = [...memCells.value]
  cells[i] = { ...cells[i]!, variant: 'flipped', label: (cells[i]!.data as MemCell).emoji }
  memCells.value = cells
  memFlipped.value = [...memFlipped.value, i]

  if (memFlipped.value.length === 2) {
    memMoves.value++
    const [a, b] = memFlipped.value as [number, number]
    const ca = cells[a]!.data as MemCell
    const cb = cells[b]!.data as MemCell
    if (ca.emoji === cb.emoji) {
      const next = [...cells]
      next[a] = { ...next[a]!, variant: 'matched' }
      next[b] = { ...next[b]!, variant: 'matched' }
      memCells.value = next
      memMatched.value = new Set([...memMatched.value, a, b])
      memFlipped.value = []
    } else {
      memLocked.value = true
      setTimeout(() => {
        const reset = [...memCells.value]
        reset[a] = { ...reset[a]!, variant: 'hidden', label: '' }
        reset[b] = { ...reset[b]!, variant: 'hidden', label: '' }
        memCells.value = reset
        memFlipped.value = []
        memLocked.value  = false
      }, 900)
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. WHACK-A-MOLE
// ─────────────────────────────────────────────────────────────────────────────

type MoleVariant = 'empty' | 'mole' | 'whacked' | 'miss'

const moleVariants: Record<MoleVariant, VariantStyle> = {
  empty:   { background: '#16a34a20', border: '1.5px solid #16a34a30', borderRadius: '50%' },
  mole:    { background: '#92400e',   border: '1.5px solid #78350f',   borderRadius: '50%', icon: 'mdi-rodent', iconColor: '#fde68a', cursor: 'crosshair' },
  whacked: { background: '#fbbf24',   border: '1.5px solid #d97706',   borderRadius: '50%', icon: 'mdi-star-four-points', iconColor: '#fff' },
  miss:    { background: '#ef444430', border: '1.5px solid #ef4444',   borderRadius: '50%' },
}

const MOLE_COLS = 5
const MOLE_ROWS = 4
const MOLE_TOTAL = MOLE_COLS * MOLE_ROWS

const makeMoleCells = (): GridCell<MoleVariant>[] =>
  Array.from({ length: MOLE_TOTAL }, () => ({ variant: 'empty' as MoleVariant }))

const moleCells   = ref<GridCell<MoleVariant>[]>(makeMoleCells())
const moleScore   = ref(0)
const moleRunning = ref(false)
const moleTimeLeft = ref(30)
let   moleTimer: ReturnType<typeof setInterval> | null = null
let   moleShowTimer: ReturnType<typeof setTimeout> | null = null

const moleReset = () => {
  if (moleTimer)     clearInterval(moleTimer)
  if (moleShowTimer) clearTimeout(moleShowTimer)
  moleCells.value   = makeMoleCells()
  moleScore.value   = 0
  moleRunning.value = false
  moleTimeLeft.value = 30
}

const moleShowNext = () => {
  if (!moleRunning.value) return
  const cells = makeMoleCells()
  // Show 1–3 moles simultaneously
  const count = Math.floor(Math.random() * 3) + 1
  const idxs  = Array.from({ length: MOLE_TOTAL }, (_, i) => i).sort(() => Math.random() - 0.5).slice(0, count)
  for (const i of idxs) cells[i] = { variant: 'mole' }
  moleCells.value = cells
  moleShowTimer = setTimeout(() => {
    // Hide any un-whacked moles
    moleCells.value = moleCells.value.map(c => c.variant === 'mole' ? { variant: 'empty' } : c)
    moleShowNext()
  }, 750 + Math.random() * 400)
}

const moleStart = () => {
  moleReset()
  moleRunning.value = true
  moleShowNext()
  moleTimer = setInterval(() => {
    moleTimeLeft.value--
    if (moleTimeLeft.value <= 0) {
      moleRunning.value = false
      if (moleTimer)     clearInterval(moleTimer)
      if (moleShowTimer) clearTimeout(moleShowTimer)
      moleCells.value = makeMoleCells()
    }
  }, 1000)
}

const moleClick = (i: number) => {
  if (!moleRunning.value) return
  const cell = moleCells.value[i]
  if (!cell) return
  const cells = [...moleCells.value]
  if (cell.variant === 'mole') {
    cells[i] = { variant: 'whacked' }
    moleScore.value++
    setTimeout(() => {
      moleCells.value = moleCells.value.map((c, idx) => idx === i && c.variant === 'whacked' ? { variant: 'empty' } : c)
    }, 300)
  } else if (cell.variant === 'empty') {
    cells[i] = { variant: 'miss' }
    setTimeout(() => {
      moleCells.value = moleCells.value.map((c, idx) => idx === i && c.variant === 'miss' ? { variant: 'empty' } : c)
    }, 200)
  }
  moleCells.value = cells
}

onUnmounted(() => {
  if (moleTimer)     clearInterval(moleTimer)
  if (moleShowTimer) clearTimeout(moleShowTimer)
})

// ─────────────────────────────────────────────────────────────────────────────
// 3. SEAT RESERVATION
// ─────────────────────────────────────────────────────────────────────────────

type SeatVariant = 'available' | 'selected' | 'taken' | 'vip' | 'aisle'

const seatVariants: Record<SeatVariant, VariantStyle> = {
  available: { background: 'rgba(var(--v-theme-on-surface), .07)', border: '1.5px solid rgba(var(--v-theme-on-surface), .15)', icon: 'mdi-seat', iconColor: 'rgba(var(--v-theme-on-surface), .4)' },
  selected:  { background: '#6366f120',  border: '1.5px solid #6366f1',    icon: 'mdi-seat',              iconColor: '#6366f1' },
  taken:     { background: '#ef444420',  border: '1.5px solid #ef444450',  icon: 'mdi-seat',              iconColor: '#ef4444',  cursor: 'not-allowed' },
  vip:       { background: '#f59e0b20',  border: '1.5px solid #f59e0b',    icon: 'mdi-star-circle',       iconColor: '#f59e0b' },
  aisle:     { background: 'transparent', border: '1.5px solid transparent', cursor: 'default' },
}

const SEAT_COLS = 10
const SEAT_ROWS = 8

const makeSeatCells = (): GridCell<SeatVariant>[] => {
  const cells: GridCell<SeatVariant>[] = []
  for (let r = 0; r < SEAT_ROWS; r++) {
    for (let c = 0; c < SEAT_COLS; c++) {
      // Column 4 is an aisle gap
      if (c === 4) { cells.push({ variant: 'aisle', disabled: true }); continue }
      // Front 2 rows are VIP
      const isVip  = r < 2
      // ~30% pre-taken
      const isTaken = !isVip && Math.random() < 0.3
      cells.push({ variant: isTaken ? 'taken' : isVip ? 'vip' : 'available', disabled: isTaken, label: `${String.fromCharCode(65 + r)}${c < 4 ? c + 1 : c}` })
    }
  }
  return cells
}

const seatCells    = ref<GridCell<SeatVariant>[]>(makeSeatCells())
const seatSelected = computed(() => seatCells.value.filter(c => c.variant === 'selected').length)

const seatClick = (i: number) => {
  const cell = seatCells.value[i]
  if (!cell || cell.variant === 'taken' || cell.variant === 'aisle') return
  const cells = [...seatCells.value]
  const next = cell.variant === 'selected' ? (cell.label?.startsWith('A') || cell.label?.startsWith('B') ? 'vip' : 'available') : 'selected'
  cells[i] = { ...cell, variant: next as SeatVariant }
  seatCells.value = cells
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. CHESS BOARD
// ─────────────────────────────────────────────────────────────────────────────

type ChessVariant = 'light' | 'dark' | 'light-selected' | 'dark-selected' | 'light-valid' | 'dark-valid'

const chessVariants: Record<ChessVariant, VariantStyle> = {
  'light':          { background: '#f0d9b5', border: 'none', borderRadius: '0', color: '#2c1810' },
  'dark':           { background: '#b58863', border: 'none', borderRadius: '0', color: '#f0d9b5' },
  'light-selected': { background: '#f6f669', border: 'none', borderRadius: '0' },
  'dark-selected':  { background: '#baca2b', border: 'none', borderRadius: '0' },
  'light-valid':    { background: '#f0d9b5', border: 'none', borderRadius: '0' },
  'dark-valid':     { background: '#b58863', border: 'none', borderRadius: '0' },
}

type PieceColor = 'w' | 'b'
type PieceType  = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P'

interface Piece { color: PieceColor; type: PieceType }

const PIECE_ICONS: Record<PieceType, Record<PieceColor, string>> = {
  K: { w: '♔', b: '♚' }, Q: { w: '♕', b: '♛' }, R: { w: '♖', b: '♜' },
  B: { w: '♗', b: '♝' }, N: { w: '♘', b: '♞' }, P: { w: '♙', b: '♟' },
}

const INIT_PIECES: (Piece | null)[] = [
  { color:'b', type:'R' },{ color:'b', type:'N' },{ color:'b', type:'B' },{ color:'b', type:'Q' },{ color:'b', type:'K' },{ color:'b', type:'B' },{ color:'b', type:'N' },{ color:'b', type:'R' },
  ...Array(8).fill(null).map((): Piece => ({ color:'b', type:'P' })),
  ...Array(32).fill(null),
  ...Array(8).fill(null).map((): Piece => ({ color:'w', type:'P' })),
  { color:'w', type:'R' },{ color:'w', type:'N' },{ color:'w', type:'B' },{ color:'w', type:'Q' },{ color:'w', type:'K' },{ color:'w', type:'B' },{ color:'w', type:'N' },{ color:'w', type:'R' },
]

const chessPieces  = ref<(Piece | null)[]>([...INIT_PIECES])
const chessSelected = ref<number | null>(null)
const chessValidMoves = ref<Set<number>>(new Set())

const isLight = (i: number) => ((Math.floor(i / 8) + (i % 8)) % 2 === 0)

const chessCells = computed<GridCell<ChessVariant>[]>(() => {
  return Array.from({ length: 64 }, (_, i) => {
    const piece  = chessPieces.value[i]
    const light  = isLight(i)
    const isSel  = chessSelected.value === i
    const isValid = chessValidMoves.value.has(i)
    let variant: ChessVariant = light ? 'light' : 'dark'
    if (isSel)   variant = light ? 'light-selected' : 'dark-selected'
    const label = piece ? PIECE_ICONS[piece.type][piece.color] : (isValid ? (light ? '·' : '·') : '')
    return {
      variant,
      label,
      data: { piece, isValid },
    }
  })
})

// Naive move generation — legal squares only for the selected piece type
const getValidMoves = (from: number, piece: Piece): number[] => {
  const r = Math.floor(from / 8), c = from % 8
  const moves: number[] = []
  const board = chessPieces.value

  const addIf = (idx: number) => {
    if (idx < 0 || idx > 63) return false
    const target = board[idx]
    if (target && target.color === piece.color) return false
    moves.push(idx)
    return !target
  }

  const slide = (dr: number, dc: number) => {
    let nr = r + dr, nc = c + dc
    while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
      const idx = nr * 8 + nc
      const target = board[idx]
      if (target) { if (target.color !== piece.color) moves.push(idx); break }
      moves.push(idx)
      nr += dr; nc += dc
    }
  }

  if (piece.type === 'P') {
    const dir = piece.color === 'w' ? -1 : 1
    const nr1 = r + dir
    if (nr1 >= 0 && nr1 < 8) {
      if (!board[nr1 * 8 + c]) {
        moves.push(nr1 * 8 + c)
        const startRow = piece.color === 'w' ? 6 : 1
        if (r === startRow && !board[(r + dir * 2) * 8 + c]) moves.push((r + dir * 2) * 8 + c)
      }
      for (const dc of [-1, 1]) {
        const nc2 = c + dc
        if (nc2 >= 0 && nc2 < 8) {
          const target = board[nr1 * 8 + nc2]
          if (target && target.color !== piece.color) moves.push(nr1 * 8 + nc2)
        }
      }
    }
  } else if (piece.type === 'R') {
    slide(1,0); slide(-1,0); slide(0,1); slide(0,-1)
  } else if (piece.type === 'B') {
    slide(1,1); slide(1,-1); slide(-1,1); slide(-1,-1)
  } else if (piece.type === 'Q') {
    slide(1,0); slide(-1,0); slide(0,1); slide(0,-1)
    slide(1,1); slide(1,-1); slide(-1,1); slide(-1,-1)
  } else if (piece.type === 'N') {
    for (const delta of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]] as [number,number][]) addIf((r+delta[0])*8+(c+delta[1]))
  } else if (piece.type === 'K') {
    for (const delta of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]] as [number,number][]) addIf((r+delta[0])*8+(c+delta[1]))
  }

  return moves.filter(m => m >= 0 && m < 64)
}

const chessClick = (i: number) => {
  const piece = chessPieces.value[i]

  // If a piece is selected and this is a valid move — execute it
  if (chessSelected.value !== null && chessValidMoves.value.has(i)) {
    const pieces = [...chessPieces.value]
    pieces[i] = pieces[chessSelected.value!]!
    pieces[chessSelected.value!] = null
    chessPieces.value = pieces
    chessSelected.value   = null
    chessValidMoves.value = new Set()
    return
  }

  // Select a piece
  if (piece) {
    chessSelected.value   = i
    chessValidMoves.value = new Set(getValidMoves(i, piece))
    return
  }

  // Click on empty non-valid square — deselect
  chessSelected.value   = null
  chessValidMoves.value = new Set()
}

const chessReset = () => {
  chessPieces.value     = [...INIT_PIECES]
  chessSelected.value   = null
  chessValidMoves.value = new Set()
}

const infoOpen = ref(false)

const OTHER_USES = [
  { category: 'Games & puzzles', items: ['Sudoku / Nonogram (Picross)', 'Minesweeper', 'Battleship', 'Conway\'s Game of Life / cellular automata', 'Sliding puzzle (15-puzzle)', 'Tic-tac-toe · Connect Four · Othello'] },
  { category: 'Productivity & planning', items: ['Habit tracker (day × habit grid)', 'Availability / scheduling picker', 'Pixel art / sprite editor', 'Heatmap / contribution graph', 'Floor plan or room layout builder'] },
  { category: 'Booking & commerce', items: ['Hotel room booking (floor × room number)', 'Parking bay reservation', 'Locker assignment'] },
  { category: 'Education', items: ['Multiplication table quiz', 'Binary / hex number visualiser', 'Logic gate truth table explorer'] },
]
</script>

<template>
  <div>
    <div class="d-flex align-start justify-space-between gap-4 mb-1">
      <h1 class="text-h5 font-weight-bold">Interactive Grid</h1>
      <v-btn icon="mdi-information-outline" variant="text" size="small" @click="infoOpen = true" />
    </div>
    <p class="text-body-2 text-medium-emphasis mb-5">
      One generic <code>&lt;CommonInteractiveGrid&gt;</code> component powering four completely different applications.
      All game logic lives outside the grid — the component only handles layout, rendering, and events.
    </p>

    <!-- Other uses dialog -->
    <v-dialog v-model="infoOpen" max-width="480" scrollable>
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center justify-space-between pt-5 px-6 pb-2">
          <span class="text-h6">Other possible applications</span>
          <v-btn icon="mdi-close" variant="text" size="small" @click="infoOpen = false" />
        </v-card-title>
        <v-card-subtitle class="px-6 pb-3 text-wrap">
          Any problem that maps to a 2-D grid of discrete states can use this component.
        </v-card-subtitle>
        <v-divider />
        <v-card-text class="px-6 py-4">
          <div v-for="group in OTHER_USES" :key="group.category" class="mb-5">
            <p class="text-overline text-medium-emphasis mb-2" style="letter-spacing:.08em">{{ group.category }}</p>
            <ul class="ig-uses-list">
              <li v-for="item in group.items" :key="item">{{ item }}</li>
            </ul>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-tabs v-model="tab" density="compact" class="mb-5">
      <v-tab value="memory">
        <v-icon start icon="mdi-cards" size="16" />
        Memory Match
      </v-tab>
      <v-tab value="mole">
        <v-icon start icon="mdi-rodent" size="16" />
        Whack-a-Mole
      </v-tab>
      <v-tab value="seats">
        <v-icon start icon="mdi-seat" size="16" />
        Seat Reservation
      </v-tab>
      <v-tab value="chess">
        <v-icon start icon="mdi-chess-king" size="16" />
        Chess
      </v-tab>
    </v-tabs>

    <v-window v-model="tab">

      <!-- ── MEMORY MATCH ─────────────────────────────────────────────────── -->
      <v-window-item value="memory">
        <div class="demo-header">
          <div class="d-flex align-center gap-3">
            <v-chip size="small" color="primary" variant="tonal">Moves: {{ memMoves }}</v-chip>
            <v-chip v-if="memWon" size="small" color="success" variant="tonal">
              <v-icon start icon="mdi-party-popper" />
              Solved in {{ memMoves }} moves!
            </v-chip>
          </div>
          <v-btn size="small" variant="tonal" prepend-icon="mdi-refresh" @click="memShuffle">Shuffle</v-btn>
        </div>

        <div class="demo-canvas">
          <CommonInteractiveGrid
            :cols="4"
            :rows="4"
            :cells="memCells"
            :cell-size="72"
            :gap="8"
            :variants="memVariants"
            @click="memClick"
          >
            <template #default="{ cell }">
              <span v-if="cell.variant !== 'hidden'" style="font-size:28px;line-height:1;pointer-events:none">
                {{ cell.label }}
              </span>
            </template>
          </CommonInteractiveGrid>
        </div>

        <p class="text-caption text-medium-emphasis mt-4">
          Click two cards. If they match they stay face-up. Find all 8 pairs.
        </p>
      </v-window-item>

      <!-- ── WHACK-A-MOLE ──────────────────────────────────────────────────── -->
      <v-window-item value="mole">
        <div class="demo-header">
          <div class="d-flex align-center gap-3">
            <v-chip size="small" color="success" variant="tonal">Score: {{ moleScore }}</v-chip>
            <v-chip size="small" :color="moleTimeLeft <= 5 ? 'error' : 'default'" variant="tonal">
              {{ moleRunning ? `${moleTimeLeft}s` : moleTimeLeft === 0 ? 'Done!' : 'Ready' }}
            </v-chip>
          </div>
          <v-btn size="small" variant="tonal" :color="moleRunning ? 'error' : 'success'" :prepend-icon="moleRunning ? 'mdi-stop' : 'mdi-play'" @click="moleRunning ? moleReset() : moleStart()">
            {{ moleRunning ? 'Stop' : moleTimeLeft === 0 ? 'Play again' : 'Start' }}
          </v-btn>
        </div>

        <div class="demo-canvas">
          <CommonInteractiveGrid
            :cols="MOLE_COLS"
            :rows="MOLE_ROWS"
            :cells="moleCells"
            :cell-size="72"
            :gap="10"
            :variants="moleVariants"
            @click="moleClick"
          />
        </div>

        <p class="text-caption text-medium-emphasis mt-4">
          Whack the moles before they duck back underground. 30 seconds on the clock.
        </p>
      </v-window-item>

      <!-- ── SEAT RESERVATION ──────────────────────────────────────────────── -->
      <v-window-item value="seats">
        <div class="demo-header">
          <div class="d-flex align-center gap-3">
            <v-chip size="small" color="primary" variant="tonal">
              {{ seatSelected }} seat{{ seatSelected !== 1 ? 's' : '' }} selected
            </v-chip>
          </div>
          <div class="d-flex align-center gap-2">
            <v-chip size="small" color="warning"   variant="tonal"><v-icon start icon="mdi-star-circle" size="14"/>VIP</v-chip>
            <v-chip size="small" color="primary"   variant="tonal"><v-icon start icon="mdi-seat" size="14"/>Available</v-chip>
            <v-chip size="small" color="error"     variant="tonal"><v-icon start icon="mdi-seat" size="14"/>Taken</v-chip>
            <v-chip size="small" color="secondary" variant="tonal" class="ig-chip-sel"><v-icon start icon="mdi-seat" size="14"/>Selected</v-chip>
          </div>
          <v-btn size="small" variant="tonal" prepend-icon="mdi-refresh" @click="seatCells = makeSeatCells()">Reset</v-btn>
        </div>

        <!-- Stage indicator -->
        <div class="seat-stage">
          <div class="seat-stage-bar">STAGE</div>
        </div>

        <div class="demo-canvas">
          <CommonInteractiveGrid
            :cols="SEAT_COLS"
            :rows="SEAT_ROWS"
            :cells="seatCells"
            :cell-size="44"
            :gap="5"
            :variants="seatVariants"
            @click="seatClick"
          />
        </div>

        <p class="text-caption text-medium-emphasis mt-4">
          Click available or VIP seats to toggle selection. Grey column is the aisle.
          Red seats are already taken.
        </p>
      </v-window-item>

      <!-- ── CHESS ─────────────────────────────────────────────────────────── -->
      <v-window-item value="chess">
        <div class="demo-header">
          <div class="d-flex align-center gap-3">
            <v-chip v-if="chessSelected !== null" size="small" color="primary" variant="tonal">
              {{ chessPieces[chessSelected] ? PIECE_ICONS[chessPieces[chessSelected]!.type][chessPieces[chessSelected]!.color] : '' }}
              {{ chessValidMoves.size }} valid move{{ chessValidMoves.size !== 1 ? 's' : '' }}
            </v-chip>
            <span v-else class="text-body-2 text-medium-emphasis">Click a piece to select it</span>
          </div>
          <v-btn size="small" variant="tonal" prepend-icon="mdi-refresh" @click="chessReset">Reset</v-btn>
        </div>

        <!-- Rank / file labels -->
        <div class="chess-wrap">
          <div class="chess-files">
            <span v-for="f in ['a','b','c','d','e','f','g','h']" :key="f" class="chess-file-label">{{ f }}</span>
          </div>
          <div class="chess-inner">
            <div class="chess-ranks">
              <span v-for="r in [8,7,6,5,4,3,2,1]" :key="r" class="chess-rank-label">{{ r }}</span>
            </div>
            <div class="chess-board">
              <CommonInteractiveGrid
                :cols="8"
                :rows="8"
                :cells="chessCells"
                :cell-size="56"
                :gap="0"
                :variants="chessVariants"
                @click="chessClick"
              >
                <template #default="{ index }">
                  <!-- Valid move dot or capture ring -->
                  <template v-if="chessValidMoves.has(index)">
                    <div
                      v-if="!chessPieces[index]"
                      class="chess-dot"
                      :style="{ background: isLight(index) ? 'rgba(0,0,0,.18)' : 'rgba(0,0,0,.22)' }"
                    />
                    <div
                      v-else
                      class="chess-ring"
                      :style="{ borderColor: isLight(index) ? 'rgba(0,0,0,.2)' : 'rgba(0,0,0,.25)' }"
                    />
                  </template>
                  <!-- Piece glyph -->
                  <span
                    v-if="chessPieces[index]"
                    class="chess-piece"
                    :style="{ color: chessPieces[index]!.color === 'w' ? '#fff' : '#1c1c1c', textShadow: chessPieces[index]!.color === 'w' ? '0 1px 2px rgba(0,0,0,.8)' : '0 1px 2px rgba(255,255,255,.3)' }"
                  >{{ PIECE_ICONS[chessPieces[index]!.type][chessPieces[index]!.color] }}</span>
                </template>
              </CommonInteractiveGrid>
            </div>
          </div>
        </div>

        <p class="text-caption text-medium-emphasis mt-4">
          Click a piece to see its legal moves, click a highlighted square to move it.
          No check/castling/en-passant — this demonstrates the grid's slot system for custom per-cell rendering.
        </p>
      </v-window-item>

    </v-window>
  </div>
</template>

<style scoped>
.demo-header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}
.demo-header > :first-child { flex: 1; }

.demo-canvas {
  display: flex;
  justify-content: center;
}

/* Seat reservation */
.seat-stage {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}
.seat-stage-bar {
  background: rgba(var(--v-theme-primary), .15);
  border: 1.5px solid rgba(var(--v-theme-primary), .3);
  border-radius: 6px;
  padding: 6px 64px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .1em;
  color: rgba(var(--v-theme-primary), 1);
}

/* Chess layout */
.chess-wrap { display: flex; flex-direction: column; align-items: center; gap: 0; }
.chess-files { display: flex; gap: 0; padding-left: 22px; margin-bottom: 2px; }
.chess-file-label { width: 56px; text-align: center; font-size: 11px; color: rgba(var(--v-theme-on-surface), .4); font-weight: 600; }
.chess-inner { display: flex; align-items: flex-start; gap: 4px; }
.chess-ranks { display: flex; flex-direction: column; padding-top: 0; }
.chess-rank-label { height: 56px; display: flex; align-items: center; font-size: 11px; color: rgba(var(--v-theme-on-surface), .4); font-weight: 600; width: 18px; justify-content: center; }
.chess-board { box-shadow: 0 4px 24px rgba(0,0,0,.25); }
.chess-piece { font-size: 32px; line-height: 1; pointer-events: none; position: relative; z-index: 1; }
.chess-dot {
  width: 22px; height: 22px; border-radius: 50%;
  pointer-events: none; position: absolute;
}
.chess-ring {
  width: 48px; height: 48px; border-radius: 50%;
  border: 5px solid;
  pointer-events: none; position: absolute;
  box-sizing: border-box;
}

.ig-uses-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.ig-uses-list li {
  font-size: 13px;
  padding: 3px 0 3px 16px;
  position: relative;
  color: rgb(var(--v-theme-on-surface));
}
.ig-uses-list li::before {
  content: '·';
  position: absolute;
  left: 4px;
  color: rgba(var(--v-theme-on-surface), .4);
  font-size: 18px;
  line-height: 1;
  top: 1px;
}
</style>
