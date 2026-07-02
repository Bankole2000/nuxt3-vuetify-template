<script setup lang="ts">
definePageMeta({
  layout: "catalogue",
  breadcrumbs: [
    { title: "Home", to: "/" },
    { title: "Catalogue", to: "/catalogue" },
    { title: "Video Player", disabled: true },
  ],
});

// Native player demos
const nativeSrc = "/assets/video/landscape/professional.mp4";
const nativePoster = "";

const playerEvents = ref<string[]>([]);
const logEvent = (name: string) => {
  playerEvents.value.unshift(`${new Date().toLocaleTimeString()} — ${name}`);
  if (playerEvents.value.length > 6) playerEvents.value.pop();
};

// YouTube demos
const ytVideos = [
  { id: "dQw4w9WgXcQ", label: "Music video (YouTube URL)" },
  { id: "LXb3EKWsInQ", label: "Short-form (Shorts)" },
  { id: "C0DPdy98e4c", label: "Talk / conference" },
];
const selectedYt = ref(ytVideos[0]);
const ytCompact = ref(false);
const ytStart = ref(0);

// Format-specific demos
const verticalSrc = "/assets/video/vertical/downloadjkl.mp4";
const squareSrc = "/assets/video/square/VID_30920101_064938_955.mp4";
const verticalShowActions = ref(true);

// Audio demo — swap src for local file once added to /public/assets/audio/
// e.g. /assets/audio/track.mp3
const audioSrc = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
const audioCompact = ref(false);
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">Video Player</h1>
    <p class="text-body-2 text-medium-emphasis mb-8">
      A custom HTML5 video player with full controls, and a YouTube embed
      component with thumbnail-first loading.
    </p>

    <!-- Native HTML5 player -->
    <h2 class="text-overline text-medium-emphasis mb-4">Native video player</h2>
    <v-card rounded="lg" class="mb-2 pa-5">
      <CommonVideoPlayer
        :src="nativeSrc"
        title="Professional"
        :downloadable="true"
        @play="logEvent('play')"
        @pause="logEvent('pause')"
        @ended="logEvent('ended')"
        @timeupdate="logEvent(`timeupdate: ${Math.floor($event)}s`)"
      />
      <div v-if="playerEvents.length" class="mt-4">
        <p class="text-caption text-medium-emphasis mb-2">Events</p>
        <v-sheet rounded="lg" color="surface-variant" class="pa-3">
          <p
            v-for="(e, i) in playerEvents"
            :key="i"
            class="text-caption font-monospace mb-0"
            :class="i === 0 ? 'text-on-surface' : 'text-medium-emphasis'"
          >
            {{ e }}
          </p>
        </v-sheet>
      </div>
    </v-card>
    <v-card rounded="lg" class="pa-5 mb-8">
      <v-sheet rounded="lg" color="surface-variant" class="pa-4">
        <pre v-pre class="text-body-2"><code>&lt;CommonVideoPlayer
  src="https://example.com/video.mp4"
  poster="https://example.com/thumb.jpg"
  title="My video"
  :downloadable="true"
  :autoplay="false"
  :loop="false"
  :muted="false"
  @play="onPlay"
  @pause="onPause"
  @ended="onEnded"
  @timeupdate="onTimeUpdate"
/&gt;</code></pre>
      </v-sheet>
    </v-card>

    <!-- Muted autoplay (e.g. hero banner) -->
    <h2 class="text-overline text-medium-emphasis mb-4">Muted autoplay</h2>
    <v-card rounded="lg" class="mb-2 pa-5">
      <p class="text-body-2 text-medium-emphasis mb-4">
        Common for hero sections and background loops. Browsers allow autoplay
        when <code>muted</code> is set.
      </p>
      <CommonVideoPlayer
        :src="nativeSrc"
        :autoplay="true"
        :loop="true"
        :muted="true"
      />
    </v-card>
    <v-card rounded="lg" class="pa-5 mb-8">
      <v-sheet rounded="lg" color="surface-variant" class="pa-4">
        <pre v-pre class="text-body-2"><code>&lt;CommonVideoPlayer
  src="https://example.com/loop.mp4"
  :autoplay="true"
  :loop="true"
  :muted="true"
/&gt;</code></pre>
      </v-sheet>
    </v-card>

    <!-- YouTube player -->
    <h2 class="text-overline text-medium-emphasis mb-4">YouTube embed</h2>
    <v-card rounded="lg" class="pa-5 mb-2">
      <div class="d-flex gap-3 mb-5 flex-wrap align-center">
        <v-btn-toggle
          v-model="selectedYt"
          density="compact"
          variant="outlined"
          divided
          mandatory
        >
          <v-btn v-for="v in ytVideos" :key="v.id" :value="v" size="small">
            {{ v.label }}
          </v-btn>
        </v-btn-toggle>
        <v-switch
          v-model="ytCompact"
          label="9:16 (shorts)"
          density="compact"
          hide-details
          color="primary"
        />
      </div>

      <div :style="ytCompact ? 'max-width: 320px; margin: 0 auto;' : ''">
        <CommonYoutubePlayer
          :key="selectedYt.id + ytCompact"
          :src="selectedYt.id"
          :title="selectedYt.label"
          :aspect-ratio="ytCompact ? '9/16' : '16/9'"
          :start="ytStart"
        />
      </div>

      <v-row class="mt-4" align="center">
        <v-col cols="12" sm="6">
          <p class="text-caption text-medium-emphasis mb-2">
            Start at (seconds)
          </p>
          <v-slider
            v-model="ytStart"
            min="0"
            max="120"
            step="5"
            density="compact"
            hide-details
            color="primary"
            thumb-label
          />
        </v-col>
      </v-row>
    </v-card>
    <v-card rounded="lg" class="pa-5 mb-8">
      <v-sheet rounded="lg" color="surface-variant" class="pa-4">
        <pre
          v-pre
          class="text-body-2"
        ><code>&lt;!-- Accepts full URL, youtu.be short link, or raw video ID --&gt;
&lt;CommonYoutubePlayer
  src="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  title="Never Gonna Give You Up"
  :thumbnail="true"
  :start="30"
  aspect-ratio="16/9"
/&gt;

&lt;!-- Short link --&gt;
&lt;CommonYoutubePlayer src="https://youtu.be/dQw4w9WgXcQ" /&gt;

&lt;!-- Raw video ID --&gt;
&lt;CommonYoutubePlayer src="dQw4w9WgXcQ" /&gt;</code></pre>
      </v-sheet>
      <v-alert
        type="info"
        variant="tonal"
        density="compact"
        rounded="lg"
        class="mt-4"
      >
        The thumbnail is loaded from YouTube's CDN
        (<code>img.youtube.com</code>) — no API key needed. The iframe is only
        mounted after the user clicks play, keeping the initial page weight low.
      </v-alert>
    </v-card>

    <!-- YouTube playlist / no-thumbnail -->
    <h2 class="text-overline text-medium-emphasis mb-4">
      Without thumbnail overlay
    </h2>
    <v-card rounded="lg" class="pa-5 mb-12">
      <p class="text-body-2 text-medium-emphasis mb-4">
        Set <code>:thumbnail="false"</code> to load the native YouTube iframe
        controls immediately, useful when embedding in a modal or lightbox.
      </p>
      <div style="max-width: 560px">
        <CommonYoutubePlayer
          src="dQw4w9WgXcQ"
          :thumbnail="false"
          title="No thumbnail overlay"
        />
      </div>
    </v-card>

    <!-- Vertical video (TikTok / Reels) -->
    <h2 class="text-overline text-medium-emphasis mb-1">Vertical video — TikTok / Reels (9:16)</h2>
    <p class="text-body-2 text-medium-emphasis mb-4">
      9:16 aspect ratio with side action buttons, mute toggle and bottom caption overlay.
      Drop files in <code>/public/assets/video/vertical/</code>.
    </p>
    <v-card rounded="lg" class="pa-5 mb-2">
      <div class="d-flex align-center gap-4 mb-5">
        <v-switch
          v-model="verticalShowActions"
          label="Show action buttons"
          density="compact"
          hide-details
          color="primary"
        />
      </div>
      <CommonVideoVertical
        :src="verticalSrc"
        title="Subarau Outback"
        caption="On street and dirt 🚗"
        :show-actions="verticalShowActions"
        :loop="true"
        :muted="true"
      />
    </v-card>
    <v-card rounded="lg" class="pa-5 mb-12">
      <v-sheet rounded="lg" color="surface-variant" class="pa-4">
        <pre v-pre class="text-body-2"><code>&lt;CommonVideoVertical
  src="/assets/video/vertical/my-video.mp4"
  poster="/assets/video/vertical/my-poster.jpg"
  title="My short"
  caption="Some caption text"
  :show-actions="true"
  :loop="true"
  :muted="true"
/&gt;</code></pre>
      </v-sheet>
    </v-card>

    <!-- Square video (Instagram) -->
    <h2 class="text-overline text-medium-emphasis mb-1">Square video — Instagram feed (1:1)</h2>
    <p class="text-body-2 text-medium-emphasis mb-4">
      1:1 aspect ratio with post header, like/comment/share actions and caption below.
      Drop files in <code>/public/assets/video/square/</code>.
    </p>
    <v-card rounded="lg" class="pa-5 mb-2">
      <CommonVideoSquare
        :src="squareSrc"
        username="@template_demo"
        caption="Cruising around in the new Joyride 🎉 #adventure"
        :loop="true"
        :muted="true"
      />
    </v-card>
    <v-card rounded="lg" class="pa-5 mb-12">
      <v-sheet rounded="lg" color="surface-variant" class="pa-4">
        <pre v-pre class="text-body-2"><code>&lt;CommonVideoSquare
  src="/assets/video/square/my-video.mp4"
  poster="/assets/video/square/my-poster.jpg"
  username="@myhandle"
  caption="Caption text here"
  :loop="true"
  :muted="true"
/&gt;</code></pre>
      </v-sheet>
    </v-card>

    <!-- Audio player -->
    <h2 class="text-overline text-medium-emphasis mb-1">Audio player</h2>
    <p class="text-body-2 text-medium-emphasis mb-4">
      Full and compact layouts. Supports cover art, skip ±10s, volume control and all standard audio events.
      Drop files in <code>/public/assets/audio/</code>.
    </p>
    <v-card rounded="lg" class="pa-5 mb-2">
      <div class="d-flex align-center gap-4 mb-5">
        <v-switch
          v-model="audioCompact"
          label="Compact"
          density="compact"
          hide-details
          color="primary"
        />
      </div>
      <div :style="audioCompact ? '' : 'max-width: 320px;'">
        <CommonAudioPlayer
          :src="audioSrc"
          title="SoundHelix Song 1"
          artist="T. Schürger"
          album="SoundHelix Demo"
          :compact="audioCompact"
        />
      </div>
    </v-card>
    <v-card rounded="lg" class="pa-5">
      <v-sheet rounded="lg" color="surface-variant" class="pa-4">
        <pre v-pre class="text-body-2"><code>&lt;!-- Full card --&gt;
&lt;CommonAudioPlayer
  src="/assets/audio/track.mp3"
  title="Track name"
  artist="Artist"
  album="Album"
  cover="/assets/images/cover.jpg"
/&gt;

&lt;!-- Compact row (e.g. in a playlist) --&gt;
&lt;CommonAudioPlayer
  src="/assets/audio/track.mp3"
  title="Track name"
  artist="Artist"
  :compact="true"
/&gt;</code></pre>
      </v-sheet>
      <v-alert type="info" variant="tonal" density="compact" rounded="lg" class="mt-4">
        Place your audio files in <code>/public/assets/audio/</code> and reference them as
        <code>src="/assets/audio/filename.mp3"</code>.
      </v-alert>
    </v-card>
  </div>
</template>
