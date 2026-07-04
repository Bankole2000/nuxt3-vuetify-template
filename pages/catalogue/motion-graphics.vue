<script setup lang="ts">
import type { AnimationClip } from '~/components/common/AnimationTimeline.vue'

definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Motion Graphics', disabled: true },
  ],
})

useSeo({
  title: 'Motion Graphics',
  description: 'Keyframe animation timeline editor with easing functions and preview, plus a Lottie JSON player with speed and direction controls.',
})

const tab      = ref('timeline')
const infoOpen = ref(false)

const demoClip = ref<AnimationClip>({
  name:     'Demo Clip',
  duration: 2000,
  tracks: [
    {
      id:       'translate-x',
      label:    'Position X',
      property: 'translateX',
      unit:     'px',
      color:    '#1976D2',
      keyframes: [
        { time: 0,   value: 0,   easing: 'ease-in-out' },
        { time: 0.5, value: 200, easing: 'ease-in-out' },
        { time: 1.0, value: 0,   easing: 'ease-in-out' },
      ],
    },
    {
      id:       'opacity',
      label:    'Opacity',
      property: 'opacity',
      unit:     '',
      color:    '#E91E63',
      keyframes: [
        { time: 0,   value: 1,   easing: 'ease' },
        { time: 0.5, value: 0.2, easing: 'ease' },
        { time: 1.0, value: 1,   easing: 'ease' },
      ],
    },
    {
      id:       'scale',
      label:    'Scale',
      property: 'scale',
      unit:     '',
      color:    '#4CAF50',
      keyframes: [
        { time: 0,   value: 1,   easing: 'bounce' },
        { time: 0.5, value: 1.5, easing: 'bounce' },
        { time: 1.0, value: 1,   easing: 'bounce' },
      ],
    },
  ],
})

function onClipUpdate(updated: AnimationClip) {
  demoClip.value = updated
}

const lottieUrl = ref('https://assets5.lottiefiles.com/packages/lf20_fcfjwiyb.json')
const lottieInputUrl = ref(lottieUrl.value)
const lottieSrc = ref(lottieUrl.value)

function applyUrl() {
  const trimmed = lottieInputUrl.value.trim()
  if (trimmed) {
    lottieSrc.value = trimmed
    lottieUrl.value  = trimmed
  }
}
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between flex-wrap gap-4 mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Motion Graphics</h1>
        <p class="text-body-2 text-medium-emphasis">
          Keyframe animation timeline editor with easing functions and preview, plus a Lottie JSON player with speed and direction controls.
        </p>
      </div>
      <v-btn
        variant="tonal"
        prepend-icon="mdi-information-outline"
        @click="infoOpen = true"
      >
        Use cases
      </v-btn>
    </div>

    <v-tabs v-model="tab" class="mb-6">
      <v-tab value="timeline" prepend-icon="mdi-timeline-outline">Animation Timeline</v-tab>
      <v-tab value="lottie" prepend-icon="mdi-motion-play-outline">Lottie Player</v-tab>
    </v-tabs>

    <v-tabs-window v-model="tab">

      <v-tabs-window-item value="timeline">
        <p class="text-body-2 text-medium-emphasis mb-4">
          Click a keyframe diamond to inspect and edit its value and easing. Right-click on a track lane to add a keyframe at that position. Press Play to preview the animation on the box above.
        </p>
        <CommonAnimationTimeline
          :clip="demoClip"
          @update="onClipUpdate"
          @play="() => {}"
          @pause="() => {}"
          @seek="() => {}"
        />

        <h2 class="text-overline text-medium-emphasis mt-8 mb-4">Usage</h2>
        <v-card rounded="lg" class="pa-5">
          <v-sheet rounded="lg" color="surface-variant" class="pa-4 mb-4">
            <pre v-pre class="text-body-2"><code>import type { AnimationClip } from '~/components/common/AnimationTimeline.vue'

const clip = ref&lt;AnimationClip&gt;({
  name:     'My Clip',
  duration: 2000,
  tracks: [
    {
      id: 'tx', label: 'Position X', property: 'translateX', unit: 'px',
      color: '#1976D2',
      keyframes: [
        { time: 0, value: 0,   easing: 'ease-in-out' },
        { time: 1, value: 200, easing: 'ease-in-out' },
      ],
    },
  ],
})

&lt;CommonAnimationTimeline
  :clip="clip"
  @update="clip = $event"
/&gt;</code></pre>
          </v-sheet>
          <v-row dense class="text-caption text-medium-emphasis">
            <v-col cols="12" sm="6">
              <p><code>clip</code>: AnimationClip — required. Contains name, duration (ms) and tracks.</p>
              <p><code>targetSelector</code>: CSS selector to animate an element outside the preview box.</p>
            </v-col>
            <v-col cols="12" sm="6">
              <p><code>readonly</code>: boolean — disables keyframe editing (default false).</p>
              <p>Emits: <code>update</code> (full clip), <code>play</code>, <code>pause</code>, <code>seek</code> (ms).</p>
            </v-col>
          </v-row>
        </v-card>
      </v-tabs-window-item>

      <v-tabs-window-item value="lottie">
        <p class="text-body-2 text-medium-emphasis mb-4">
          Load any Lottie JSON animation from a URL. Lottie animations can be sourced from
          <strong>LottieFiles.com</strong> — browse their library and copy the JSON CDN link.
        </p>

        <v-card rounded="lg" class="pa-4 mb-6" border elevation="0">
          <p class="text-body-2 font-weight-medium mb-3">Load from URL</p>
          <div class="d-flex align-center gap-3 flex-wrap">
            <v-text-field
              v-model="lottieInputUrl"
              label="Lottie JSON URL"
              placeholder="https://assets.lottiefiles.com/..."
              variant="outlined"
              density="compact"
              hide-details
              clearable
              style="min-width: 280px; flex: 1;"
              @keydown.enter="applyUrl"
            />
            <v-btn
              color="primary"
              variant="tonal"
              prepend-icon="mdi-play-circle-outline"
              @click="applyUrl"
            >
              Load
            </v-btn>
          </div>
          <v-alert type="info" variant="tonal" density="compact" icon="mdi-lottiefiles" class="mt-3">
            Try sample animations from
            <strong>lottiefiles.com/featured</strong> — open any animation, go to
            <em>Download → JSON</em>, then paste the direct JSON URL above.
          </v-alert>
        </v-card>

        <ClientOnly>
          <CommonLottiePlayer
            :src="lottieSrc"
            :config="{ loop: true, autoplay: true, speed: 1, direction: 1 }"
            height="320px"
            @complete="() => {}"
            @loop-complete="() => {}"
            @enter-frame="() => {}"
          />
        </ClientOnly>

        <h2 class="text-overline text-medium-emphasis mt-8 mb-4">Usage</h2>
        <v-card rounded="lg" class="pa-5">
          <v-sheet rounded="lg" color="surface-variant" class="pa-4 mb-4">
            <pre v-pre class="text-body-2"><code>&lt;!-- From URL --&gt;
&lt;ClientOnly&gt;
  &lt;CommonLottiePlayer
    src="https://assets.lottiefiles.com/..."
    :config="{ loop: true, autoplay: true, speed: 1, direction: 1 }"
    height="300px"
    @complete="onComplete"
    @loop-complete="onLoopComplete"
    @enter-frame="onEnterFrame"
  /&gt;
&lt;/ClientOnly&gt;

&lt;!-- From inline JSON data --&gt;
&lt;ClientOnly&gt;
  &lt;CommonLottiePlayer
    :animation-data="myJsonObject"
    :config="{ loop: false, autoplay: false, speed: 1.5 }"
  /&gt;
&lt;/ClientOnly&gt;</code></pre>
          </v-sheet>
          <v-row dense class="text-caption text-medium-emphasis">
            <v-col cols="12" sm="6">
              <p><code>src</code>: URL to Lottie JSON file.</p>
              <p><code>animationData</code>: Inline parsed JSON object (takes precedence).</p>
              <p><code>height</code>: CSS height string (default '300px').</p>
            </v-col>
            <v-col cols="12" sm="6">
              <p><code>config.loop</code>: boolean. <code>config.autoplay</code>: boolean.</p>
              <p><code>config.speed</code>: 0.25 – 3. <code>config.direction</code>: 1 | -1.</p>
              <p>Emits: <code>complete</code>, <code>loop-complete</code>, <code>enter-frame(frame)</code>.</p>
            </v-col>
          </v-row>
          <v-alert type="warning" variant="tonal" density="compact" icon="mdi-package-variant" class="mt-4">
            Requires <strong>lottie-web</strong>: <code>npm install lottie-web</code>. Falls back to a CSS animation placeholder when the package is absent. Wrap in <code>&lt;ClientOnly&gt;</code> — lottie-web requires a browser DOM.
          </v-alert>
        </v-card>
      </v-tabs-window-item>

    </v-tabs-window>

    <v-dialog v-model="infoOpen" max-width="620">
      <v-card rounded="lg">
        <v-card-title class="pa-5 pb-2">Use Cases</v-card-title>
        <v-card-text class="pa-5 pt-2">
          <p class="text-body-2 text-medium-emphasis mb-4">
            Motion Graphics tooling covers keyframe animation authoring and playback of pre-built Lottie animations — useful anywhere micro-interactions or branded motion matter.
          </p>
          <v-list density="compact" class="pa-0">
            <v-list-item
              prepend-icon="mdi-video-outline"
              title="Loom Online (#6)"
              subtitle="Animate recording overlays, countdown timers and post-processing UI transitions with keyframe control."
            />
            <v-list-item
              prepend-icon="mdi-briefcase-outline"
              title="Portfolio Manager (#1)"
              subtitle="Lottie micro-animations for loading states, success/error feedback and empty-state illustrations."
            />
            <v-list-item
              prepend-icon="mdi-compass-outline"
              title="Onboarding Tour"
              subtitle="Play a Lottie animation in each spotlight step to guide users with expressive motion."
            />
            <v-list-item
              prepend-icon="mdi-gesture-tap"
              title="Micro-interactions (general)"
              subtitle="Button hover effects, toggle transitions and progress celebrations using lightweight Lottie JSON files."
            />
            <v-list-item
              prepend-icon="mdi-monitor-dashboard"
              title="Dashboards & Marketing pages"
              subtitle="Loop branded Lottie animations as hero visuals or section separators — no video bandwidth cost."
            />
          </v-list>
        </v-card-text>
        <v-card-actions class="pa-5 pt-0">
          <v-spacer />
          <v-btn @click="infoOpen = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
