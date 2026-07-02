/**
 * Typed application config helpers.
 * Import from here instead of calling useRuntimeConfig() directly throughout the app —
 * keeps usages refactorable from one place and adds type safety.
 */

export interface AppConfig {
  apiBaseUrl: string
  wsUrl: string
  isDev: boolean
  linkPreviewKey: string | undefined
}

export const useAppConfig = (): AppConfig => {
  const config = useRuntimeConfig()
  return {
    apiBaseUrl: config.public.apiBaseUrl as string,
    wsUrl: config.public.wsUrl as string,
    isDev: config.public.isDev as boolean,
    linkPreviewKey: config.public.linkPreviewKey as string | undefined,
  }
}

/** Feature flags — driven by env vars so they can differ per environment */
export const useFeatureFlags = () => {
  const { isDev } = useAppConfig()
  return {
    devToolsEnabled: isDev,
    // Add feature flags here, e.g.:
    // newDashboard: process.env.NUXT_PUBLIC_FF_NEW_DASHBOARD === 'true',
  }
}
