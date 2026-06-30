<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { user, logout } = useAuth()
</script>

<template>
  <v-container>
    <v-row justify="center" align="center" style="height: 80vh;">
      <v-col cols="12" sm="8" md="6" class="text-center">
        <h1 class="text-h4 font-weight-bold mb-2">Welcome, {{ user?.name }}</h1>
        <p class="text-body-1 text-medium-emphasis mb-6">You are signed in as {{ user?.email }}</p>
        <v-btn color="error" variant="tonal" @click="logout">Sign out</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>
