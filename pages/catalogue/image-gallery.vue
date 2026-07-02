<script setup lang="ts">
definePageMeta({
  layout: 'catalogue',
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Catalogue', to: '/catalogue' },
    { title: 'Image Gallery', disabled: true },
  ],
})

// Using Unsplash source for demo images — replace with /assets/images/* for local files
const images = [
  { src: 'https://picsum.photos/seed/arch/800/600', thumb: 'https://picsum.photos/seed/arch/400/300', alt: 'Architecture', caption: 'Modern architecture' },
  { src: 'https://picsum.photos/seed/nature1/800/600', thumb: 'https://picsum.photos/seed/nature1/400/300', alt: 'Nature', caption: 'Forest path' },
  { src: 'https://picsum.photos/seed/city/800/600', thumb: 'https://picsum.photos/seed/city/400/300', alt: 'City', caption: 'City lights at night' },
  { src: 'https://picsum.photos/seed/ocean/800/600', thumb: 'https://picsum.photos/seed/ocean/400/300', alt: 'Ocean', caption: 'Ocean waves' },
  { src: 'https://picsum.photos/seed/desert/800/600', thumb: 'https://picsum.photos/seed/desert/400/300', alt: 'Desert', caption: 'Desert dunes' },
  { src: 'https://picsum.photos/seed/mountain/800/600', thumb: 'https://picsum.photos/seed/mountain/400/300', alt: 'Mountain', caption: 'Mountain peak' },
  { src: 'https://picsum.photos/seed/flower/800/600', thumb: 'https://picsum.photos/seed/flower/400/300', alt: 'Flowers', caption: 'Spring flowers' },
  { src: 'https://picsum.photos/seed/lake/800/600', thumb: 'https://picsum.photos/seed/lake/400/300', alt: 'Lake', caption: 'Still lake' },
  { src: 'https://picsum.photos/seed/bridge/800/600', thumb: 'https://picsum.photos/seed/bridge/400/300', alt: 'Bridge', caption: 'Old bridge' },
]

const cols = ref(3)
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">Image Gallery</h1>
    <p class="text-body-2 text-medium-emphasis mb-8">
      Responsive grid with a fullscreen lightbox. Click any image to open — use arrow keys or buttons to navigate.
      Thumbnail strip at the bottom for quick jumping.
    </p>

    <div class="d-flex align-center gap-4 mb-6">
      <span class="text-body-2 text-medium-emphasis">Columns</span>
      <v-btn-toggle v-model="cols" density="compact" variant="outlined" divided mandatory>
        <v-btn :value="2" size="small">2</v-btn>
        <v-btn :value="3" size="small">3</v-btn>
        <v-btn :value="4" size="small">4</v-btn>
      </v-btn-toggle>
    </div>

    <CommonImageGallery :images="images" :columns="cols" />

    <h2 class="text-overline text-medium-emphasis mt-10 mb-4">Usage</h2>
    <v-card rounded="lg" class="pa-5">
      <v-sheet rounded="lg" color="surface-variant" class="pa-4">
        <pre v-pre class="text-body-2"><code>&lt;CommonImageGallery
  :images="[
    {
      src: '/assets/images/full.jpg',
      thumb: '/assets/images/thumb.jpg',
      alt: 'Description',
      caption: 'Optional caption',
    },
  ]"
  :columns="3"
  :gap="8"
/&gt;</code></pre>
      </v-sheet>
      <v-alert type="info" variant="tonal" density="compact" rounded="lg" class="mt-4">
        Drop your images in <code>/public/assets/images/</code> and reference them as <code>/assets/images/filename.jpg</code>.
        Use smaller thumbnail versions in <code>thumb</code> for fast grid loading.
      </v-alert>
    </v-card>
  </div>
</template>
