<script setup lang="ts">
useSeo({ title: 'Terms of Service' })

const lastUpdated = '1 July 2026'
const companyName = 'Acme Studio Ltd.'
const contactEmail = 'legal@example.com'

const sections = [
  {
    title: '1. Acceptance of terms',
    body: `By accessing or using our service, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, you may not use our service.`,
  },
  {
    title: '2. Use of the service',
    body: `You agree to use the service only for lawful purposes and in a way that does not infringe the rights of others or restrict their use of the service. You must not misuse our service by introducing viruses or other malicious code.`,
  },
  {
    title: '3. Accounts',
    body: `You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorised use of your account.`,
  },
  {
    title: '4. Intellectual property',
    body: `All content, trademarks, and data on this service are the property of ${companyName} or its licensors. You may not reproduce, distribute, or create derivative works without explicit written permission.`,
  },
  {
    title: '5. Limitation of liability',
    body: `To the maximum extent permitted by law, ${companyName} shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.`,
  },
  {
    title: '6. Termination',
    body: `We reserve the right to suspend or terminate your access to the service at our sole discretion, without notice, for conduct that we believe violates these terms or is harmful to other users, us, or third parties.`,
  },
  {
    title: '7. Changes to terms',
    body: `We may revise these terms at any time. We will notify you of material changes by posting the new terms on this page. Your continued use of the service after changes constitutes your acceptance.`,
  },
  {
    title: '8. Contact',
    body: `If you have any questions about these Terms, please contact us at ${contactEmail}.`,
  },
]
</script>

<template>
  <v-container class="py-12" style="max-width: 760px;">
    <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-6 text-medium-emphasis" @click="$router.back()">
      Back
    </v-btn>

    <h1 class="text-h4 font-weight-bold mb-2">Terms of Service</h1>
    <p class="text-body-2 text-medium-emphasis mb-8">Last updated: {{ lastUpdated }}</p>

    <p class="text-body-1 mb-8">
      Please read these Terms of Service carefully before using our platform.
      These terms govern your access to and use of our services.
    </p>

    <div class="d-flex flex-column gap-6">
      <div v-for="section in sections" :key="section.title">
        <h2 class="text-h6 font-weight-bold mb-2">{{ section.title }}</h2>
        <p class="text-body-2 text-medium-emphasis">{{ section.body }}</p>
      </div>
    </div>

    <v-divider class="my-8" />
    <p class="text-caption text-medium-emphasis text-center">
      By using our service, you acknowledge that you have read and understood these terms.
      <br />
      See also our <NuxtLink to="/privacy" class="text-primary">Privacy Policy</NuxtLink>.
    </p>
  </v-container>
</template>
