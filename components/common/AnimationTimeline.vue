<script setup lang="ts">
export type EasingFn = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce' | 'spring'

export interface Keyframe {
  time:     number
  value:    number
  easing:   EasingFn
}

export interface AnimationTrack {
  id:       string
  label:    string
  property: string
  unit:     string
  keyframes: Keyframe[]
  color:    string
}

export interface AnimationClip {
  name:     string
  duration: number
  tracks:   AnimationTrack[]
}

const props = withDefaults(defineProps<{
  clip:             AnimationClip
  targetSelector?:  string
  readonly?:        boolean
}>(), {
  readonly: false,
})

const emit = defineEmits<{
  (e: 'update', clip: AnimationClip): void
  (e: 'play'): void
  (e: 'pause'): void
  (e: 'seek', time: number): void
}>()

const easingOptions: EasingFn[] = ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'bounce', 'spring']

function applyEasing(fn: EasingFn, t: number): number {
  t = Math.max(0, Math.min(1, t))
  switch (fn) {
    case 'linear':     return t
    case 'ease':       return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    case 'ease-in':    return t * t
    case 'ease-out':   return 1 - (1 - t) * (1 - t)
    case 'ease-in-out':return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
    case 'bounce': {
      const n1 = 7.5625, d1 = 2.75
      if (t < 1 / d1)       return n1 * t * t
      else if (t < 2 / d1)  return n1 * (t -= 1.5 / d1) * t + 0.75
      else if (t < 2.5 / d1)return n1 * (t -= 2.25 / d1) * t + 0.9375
      else                   return n1 * (t -= 2.625 / d1) * t + 0.984375
    }
    case 'spring': {
      const c4 = (2 * Math.PI) / 3
      if (t === 0) return 0
      if (t === 1) return 1
      return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
    }
  }
}

function interpolateTrack(track: AnimationTrack, normalTime: number): number {
  const kfs = [...track.keyframes].sort((a, b) => a.time - b.time)
  if (kfs.length === 0) return 0
  if (normalTime <= (kfs[0]?.time ?? 0)) return kfs[0]?.value ?? 0
  if (normalTime >= (kfs[kfs.length - 1]?.time ?? 1)) return kfs[kfs.length - 1]?.value ?? 0

  for (let i = 0; i < kfs.length - 1; i++) {
    const kf0 = kfs[i]!
    const kf1 = kfs[i + 1]!
    if (normalTime >= kf0.time && normalTime <= kf1.time) {
      const span = kf1.time - kf0.time
      const local = span === 0 ? 0 : (normalTime - kf0.time) / span
      const eased = applyEasing(kf0.easing, local)
      return kf0.value + (kf1.value - kf0.value) * eased
    }
  }
  return kfs[kfs.length - 1]?.value ?? 0
}

const isPlaying = ref(false)
const isLooping = ref(false)
const currentMs  = ref(0)

const previewEl = ref<HTMLDivElement | null>(null)
let rafId = 0
let lastTs = 0

function applyToTarget(normalTime: number) {
  const el = props.targetSelector
    ? (document.querySelector(props.targetSelector) as HTMLElement | null)
    : previewEl.value
  if (!el) return

  for (const track of props.clip.tracks) {
    const val = interpolateTrack(track, normalTime)
    const valueStr = `${val}${track.unit}`
    if (track.property === 'translateX') {
      el.style.transform = `translateX(${valueStr})`
    } else if (track.property === 'scale') {
      el.style.transform = `scale(${val})`
    } else {
      el.style.setProperty(track.property, valueStr)
    }
  }

  const translateTrack = props.clip.tracks.find(t => t.property === 'translateX')
  const scaleTrack     = props.clip.tracks.find(t => t.property === 'scale')
  if (translateTrack && scaleTrack) {
    const tx  = interpolateTrack(translateTrack, normalTime)
    const sc  = interpolateTrack(scaleTrack, normalTime)
    el.style.transform = `translateX(${tx}${translateTrack.unit}) scale(${sc})`
  }
}

function tick(ts: number) {
  if (!isPlaying.value) return
  const delta = lastTs === 0 ? 0 : ts - lastTs
  lastTs = ts
  currentMs.value = Math.min(currentMs.value + delta, props.clip.duration)

  const normalTime = props.clip.duration === 0 ? 0 : currentMs.value / props.clip.duration
  applyToTarget(normalTime)

  if (currentMs.value >= props.clip.duration) {
    if (isLooping.value) {
      currentMs.value = 0
      lastTs = 0
    } else {
      isPlaying.value = false
      lastTs = 0
      return
    }
  }
  rafId = requestAnimationFrame(tick)
}

function play() {
  if (isPlaying.value) return
  isPlaying.value = true
  if (currentMs.value >= props.clip.duration) currentMs.value = 0
  lastTs = 0
  rafId = requestAnimationFrame(tick)
  emit('play')
}

function pause() {
  isPlaying.value = false
  cancelAnimationFrame(rafId)
  emit('pause')
}

function stop() {
  isPlaying.value = false
  cancelAnimationFrame(rafId)
  currentMs.value = 0
  lastTs = 0
  applyToTarget(0)
}

function seekTo(ms: number) {
  currentMs.value = Math.max(0, Math.min(ms, props.clip.duration))
  const normalTime = props.clip.duration === 0 ? 0 : currentMs.value / props.clip.duration
  applyToTarget(normalTime)
  emit('seek', currentMs.value)
}

const progressPct = computed(() =>
  props.clip.duration === 0 ? 0 : (currentMs.value / props.clip.duration) * 100,
)

function fmtTime(ms: number) {
  const total  = Math.floor(ms)
  const m      = Math.floor(total / 60000)
  const s      = Math.floor((total % 60000) / 1000)
  const ms2    = total % 1000
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms2).padStart(3, '0')}`
}

const scrubRef = ref<HTMLElement | null>(null)
let scrubbing = false

function onScrubClick(e: MouseEvent) {
  const el = scrubRef.value
  if (!el) return
  const pct = e.offsetX / el.clientWidth
  seekTo(pct * props.clip.duration)
}

function onScrubMousedown(e: MouseEvent) {
  scrubbing = true
  onScrubMousemove(e)
}

function onScrubMousemove(e: MouseEvent) {
  if (!scrubbing) return
  const el = scrubRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  seekTo(pct * props.clip.duration)
}

function onScrubMouseup() { scrubbing = false }

onMounted(() => {
  window.addEventListener('mouseup', onScrubMouseup)
  window.addEventListener('mousemove', (e) => onScrubMousemove(e))
  applyToTarget(0)
})
onUnmounted(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('mouseup', onScrubMouseup)
  window.removeEventListener('mousemove', onScrubMousemove)
})

interface SelectedKeyframe {
  trackId: string
  index:   number
}

const selected = ref<SelectedKeyframe | null>(null)

const selectedKf = computed<Keyframe | null>(() => {
  if (!selected.value) return null
  const track = props.clip.tracks.find(t => t.id === selected.value!.trackId)
  if (!track) return null
  return track.keyframes[selected.value.index] ?? null
})

function selectKeyframe(trackId: string, index: number) {
  selected.value = { trackId, index }
}

function updateSelectedValue(val: number) {
  if (!selected.value) return
  const clip  = structuredClone(props.clip)
  const track = clip.tracks.find(t => t.id === selected.value!.trackId)
  if (!track) return
  const kf = track.keyframes[selected.value.index]
  if (!kf) return
  kf.value = val
  emit('update', clip)
}

function updateSelectedEasing(easing: EasingFn) {
  if (!selected.value) return
  const clip  = structuredClone(props.clip)
  const track = clip.tracks.find(t => t.id === selected.value!.trackId)
  if (!track) return
  const kf = track.keyframes[selected.value.index]
  if (!kf) return
  kf.easing = easing
  emit('update', clip)
}

function moveKeyframe(trackId: string, index: number, e: MouseEvent) {
  if (props.readonly) return
  const laneEl = (e.currentTarget as HTMLElement).closest('.timeline-lane') as HTMLElement | null
  if (!laneEl) return

  const onMove = (ev: MouseEvent) => {
    const rect = laneEl.getBoundingClientRect()
    const pct  = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width))
    const clip  = structuredClone(props.clip)
    const track = clip.tracks.find(t => t.id === trackId)
    if (!track) return
    const kf = track.keyframes[index]
    if (!kf) return
    kf.time = Math.round(pct * 100) / 100
    emit('update', clip)
  }
  const onUp = () => {
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
  }
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}

function addKeyframeOnLane(trackId: string, e: MouseEvent) {
  if (props.readonly) return
  const laneEl = e.currentTarget as HTMLElement
  const rect   = laneEl.getBoundingClientRect()
  const pct    = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  const time   = Math.round(pct * 100) / 100

  const clip  = structuredClone(props.clip)
  const track = clip.tracks.find(t => t.id === trackId)
  if (!track) return

  const sortedKfs = [...track.keyframes].sort((a, b) => a.time - b.time)
  const newVal    = interpolateTrack(track, time)
  track.keyframes.push({ time, value: Math.round(newVal * 100) / 100, easing: 'ease-in-out' })
  track.keyframes = sortedKfs
  emit('update', clip)
}

function easingCurvePoints(fn: EasingFn): string {
  const pts: string[] = []
  for (let i = 0; i <= 20; i++) {
    const t  = i / 20
    const y  = applyEasing(fn, t)
    pts.push(`${t * 40},${(1 - y) * 30}`)
  }
  return pts.join(' ')
}
</script>

<template>
  <div>
    <v-card rounded="xl" elevation="0" border>
      <v-card-text class="pa-0">

        <div class="d-flex align-center justify-space-between pa-4 border-b">
          <span class="text-body-2 font-weight-bold">{{ clip.name }}</span>
          <span class="text-caption text-medium-emphasis font-weight-medium font-monospace">{{ fmtTime(currentMs) }} / {{ fmtTime(clip.duration) }}</span>
        </div>

        <div class="preview-area d-flex align-center justify-center pa-6" style="min-height: 120px; background: rgba(var(--v-border-color), 0.04);">
          <div
            ref="previewEl"
            class="preview-box rounded-lg"
            style="width: 64px; height: 64px; background: linear-gradient(135deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-secondary)));"
          />
        </div>

        <div class="pa-4 border-b border-t">
          <div
            ref="scrubRef"
            class="scrub-track rounded cursor-pointer position-relative mb-2"
            style="height: 6px; background: rgba(var(--v-border-color), 0.15);"
            @click="onScrubClick"
            @mousedown="onScrubMousedown"
          >
            <div
              class="rounded bg-primary position-absolute"
              style="top: 0; left: 0; height: 100%; transition: width 0.05s;"
              :style="{ width: progressPct + '%' }"
            />
            <div
              class="rounded-circle bg-primary position-absolute"
              style="top: 50%; transform: translate(-50%, -50%); width: 14px; height: 14px; box-shadow: 0 0 0 3px rgba(var(--v-theme-primary), 0.25);"
              :style="{ left: progressPct + '%' }"
            />

            <div
              v-for="track in clip.tracks"
              :key="track.id"
            >
              <div
                v-for="(kf, ki) in track.keyframes"
                :key="ki"
                class="position-absolute"
                style="top: 50%; width: 8px; height: 8px; transform: translate(-50%, -50%) rotate(45deg); pointer-events: none;"
                :style="{ left: (kf.time * 100) + '%', background: track.color }"
              />
            </div>
          </div>

          <div class="d-flex align-center gap-2 mt-3">
            <v-btn icon="mdi-stop" variant="text" size="small" density="compact" @click="stop" />
            <v-btn
              :icon="isPlaying ? 'mdi-pause' : 'mdi-play'"
              color="primary"
              variant="tonal"
              size="small"
              @click="isPlaying ? pause() : play()"
            />
            <v-btn
              :icon="isLooping ? 'mdi-repeat' : 'mdi-repeat-off'"
              :color="isLooping ? 'primary' : 'default'"
              variant="text"
              size="small"
              density="compact"
              @click="isLooping = !isLooping"
            />
          </div>
        </div>

        <div class="pa-4">
          <p class="text-overline text-medium-emphasis mb-3">Timeline Tracks</p>

          <div
            v-for="track in clip.tracks"
            :key="track.id"
            class="mb-3"
          >
            <div class="d-flex align-center mb-1 gap-2">
              <div
                class="rounded-circle flex-shrink-0"
                style="width: 10px; height: 10px;"
                :style="{ background: track.color }"
              />
              <span class="text-caption font-weight-bold">{{ track.label }}</span>
              <span class="text-caption text-medium-emphasis">({{ track.property }})</span>
            </div>

            <div
              class="timeline-lane rounded position-relative cursor-crosshair"
              style="height: 32px; background: rgba(var(--v-border-color), 0.08); border: 1px solid rgba(var(--v-border-color), 0.15);"
              @contextmenu.prevent="addKeyframeOnLane(track.id, $event)"
            >
              <div
                class="position-absolute h-100 opacity-20"
                style="top: 0; width: 2px; pointer-events: none;"
                :style="{ left: progressPct + '%', background: 'rgb(var(--v-theme-primary))' }"
              />

              <div
                v-for="(kf, ki) in track.keyframes"
                :key="ki"
                class="position-absolute d-flex align-center justify-center"
                style="top: 50%; width: 14px; height: 14px; transform: translate(-50%, -50%) rotate(45deg); cursor: grab; border: 2px solid white;"
                :style="{
                  left: (kf.time * 100) + '%',
                  background: selected?.trackId === track.id && selected?.index === ki ? 'white' : track.color,
                  outline: selected?.trackId === track.id && selected?.index === ki ? `2px solid ${track.color}` : 'none',
                  zIndex: 2,
                }"
                @click.stop="selectKeyframe(track.id, ki)"
                @mousedown.stop="moveKeyframe(track.id, ki, $event)"
              />
            </div>
          </div>
        </div>

        <div v-if="selectedKf && selected" class="pa-4 border-t">
          <p class="text-overline text-medium-emphasis mb-3">Keyframe Inspector</p>
          <v-row dense>
            <v-col cols="12" sm="5">
              <v-text-field
                :model-value="selectedKf.value"
                label="Value"
                type="number"
                density="compact"
                variant="outlined"
                hide-details
                :disabled="readonly"
                @update:model-value="updateSelectedValue(Number($event))"
              />
            </v-col>
            <v-col cols="12" sm="5">
              <v-select
                :model-value="selectedKf.easing"
                :items="easingOptions"
                label="Easing"
                density="compact"
                variant="outlined"
                hide-details
                :disabled="readonly"
                @update:model-value="updateSelectedEasing($event as EasingFn)"
              />
            </v-col>
            <v-col cols="12" sm="2" class="d-flex align-center justify-center">
              <v-tooltip :text="selectedKf.easing" location="top">
                <template #activator="{ props: tp }">
                  <svg
                    v-bind="tp"
                    width="40"
                    height="30"
                    viewBox="0 0 40 30"
                    style="display: block;"
                  >
                    <polyline
                      :points="easingCurvePoints(selectedKf.easing)"
                      fill="none"
                      stroke="rgb(var(--v-theme-primary))"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </template>
              </v-tooltip>
            </v-col>
          </v-row>
          <p class="text-caption text-medium-emphasis mt-2">
            Time: {{ Math.round(selectedKf.time * 100) }}% · Right-click lane to add keyframe
          </p>
        </div>

        <div v-else class="pa-4 border-t">
          <p class="text-caption text-medium-emphasis">
            Click a keyframe diamond to inspect and edit it. Right-click on a lane to add a keyframe at that position.
          </p>
        </div>

      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
.scrub-track:hover { height: 8px !important; }
.cursor-crosshair { cursor: crosshair; }
.font-monospace { font-family: monospace; }
</style>
