<script setup lang="ts">
useSeo({ title: 'Privacy Policy' })

const lastUpdated = '1 July 2026'
const companyName = 'Acme Studio Ltd.'
const contactEmail = 'privacy@example.com'

const sections = [
  {
    title: '1. Information we collect',
    body: `We collect information you provide directly (such as name, email address, and password when you register), information generated through your use of the service (such as log data, device information, and usage analytics), and information from third-party services if you choose to connect them.`,
  },
  {
    title: '2. How we use your information',
    body: `We use the information we collect to provide, maintain, and improve our services; process transactions; send transactional and promotional communications; monitor and analyse usage trends; detect and prevent fraudulent or abusive activity; and comply with legal obligations.`,
  },
  {
    title: '3. Information sharing',
    body: `We do not sell your personal information. We may share information with service providers who assist us in operating the service (subject to confidentiality obligations), when required by law, or to protect the rights and safety of our users and the public.`,
  },
  {
    title: '4. Cookies and tracking',
    body: `We use cookies and similar tracking technologies to maintain your session, remember your preferences (such as theme), and collect analytics data. You can control cookie settings through your browser, though some features may not function correctly if cookies are disabled.`,
  },
  {
    title: '5. Data retention',
    body: `We retain your personal information for as long as necessary to provide the service and comply with our legal obligations. You may request deletion of your account and associated data at any time by contacting us.`,
  },
  {
    title: '6. Security',
    body: `We implement industry-standard security measures including encryption in transit (TLS) and at rest, access controls, and regular security reviews. However, no method of transmission over the internet is 100% secure.`,
  },
  {
    title: '7. Your rights',
    body: `Depending on your location, you may have the right to access, correct, or delete your personal data; object to or restrict certain processing; and data portability. To exercise these rights, contact us at the address below.`,
  },
  {
    title: '8. Children\'s privacy',
    body: `Our service is not directed to children under the age of 13. We do not knowingly collect personal information from children. If you believe we have inadvertently collected such information, please contact us immediately.`,
  },
  {
    title: '9. Changes to this policy',
    body: `We may update this Privacy Policy from time to time. We will notify you of material changes by email or by posting a notice on the service before the changes take effect.`,
  },
  {
    title: '10. Contact us',
    body: `If you have questions or concerns about this Privacy Policy or our data practices, please contact our privacy team at ${contactEmail} or write to ${companyName}.`,
  },
]
</script>

<template>
  <v-container class="py-12" style="max-width: 760px;">
    <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-6 text-medium-emphasis" @click="$router.back()">
      Back
    </v-btn>

    <h1 class="text-h4 font-weight-bold mb-2">Privacy Policy</h1>
    <p class="text-body-2 text-medium-emphasis mb-8">Last updated: {{ lastUpdated }}</p>

    <p class="text-body-1 mb-8">
      Your privacy matters to us. This policy explains what information we collect, how we use it,
      and what rights you have in relation to it.
    </p>

    <div class="d-flex flex-column gap-6">
      <div v-for="section in sections" :key="section.title">
        <h2 class="text-h6 font-weight-bold mb-2">{{ section.title }}</h2>
        <p class="text-body-2 text-medium-emphasis">{{ section.body }}</p>
      </div>
    </div>

    <v-divider class="my-8" />
    <p class="text-caption text-medium-emphasis text-center">
      This policy is provided for informational purposes. Update it to reflect your actual data practices before shipping.
      <br />
      See also our <NuxtLink to="/terms" class="text-primary">Terms of Service</NuxtLink>.
    </p>
  </v-container>
</template>
