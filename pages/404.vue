<script setup lang="ts">
useSeo({ title: 'Page not found' })
</script>

<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center" class="text-center">
      <v-col cols="12" sm="8" md="5">
        <div class="position-relative d-inline-block mb-6">
          <span
            class="font-weight-black text-primary"
            style="font-size: clamp(6rem, 20vw, 12rem); line-height: 1; opacity: 0.1;"
          >
            404
          </span>
          <div
            class="position-absolute w-100 d-flex align-center justify-center"
            style="top: 50%; transform: translateY(-50%);"
          >
            <v-icon icon="mdi-map-search-outline" size="72" color="primary" />
          </div>
        </div>

        <h1 class="text-h4 font-weight-bold mb-3">Page not found</h1>
        <p class="text-body-1 text-medium-emphasis mb-6 mx-auto" style="max-width: 360px;">
          The page you're looking for doesn't exist, was removed, or the link is incorrect.
        </p>

        <!-- Search suggestion -->
        <v-text-field
          placeholder="Search for something…"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-magnify"
          rounded="lg"
          class="mb-6 mx-auto"
          style="max-width: 360px;"
          hide-details
          @keydown.enter="navigateTo('/')"
        />

        <div class="d-flex gap-3 justify-center flex-wrap">
          <v-btn color="primary" size="large" prepend-icon="mdi-home-outline" to="/">
            Go home
          </v-btn>
          <v-btn variant="tonal" size="large" prepend-icon="mdi-arrow-left" @click="$router.back()">
            Go back
          </v-btn>
        </div>

        <!-- Helpful links -->
        <v-divider class="my-8 mx-auto" style="max-width: 320px;" />
        <p class="text-caption text-medium-emphasis mb-3">You might be looking for</p>
        <div class="d-flex gap-2 justify-center flex-wrap">
          <v-chip to="/" size="small" variant="tonal">Dashboard</v-chip>
          <v-chip to="/catalogue" size="small" variant="tonal">Catalogue</v-chip>
          <v-chip to="/profile" size="small" variant="tonal">Profile</v-chip>
          <v-chip to="/settings" size="small" variant="tonal">Settings</v-chip>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
