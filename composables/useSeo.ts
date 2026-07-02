interface SeoOptions {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'book' | 'profile' | 'music.song' | 'music.album' | 'music.playlist' | 'music.radio_status' | 'video.movie' | 'video.episode' | 'video.tv_show' | 'video.other'
  noIndex?: boolean
}

const SITE_NAME = 'My App'
const TITLE_TEMPLATE = (t: string) => `${t} · ${SITE_NAME}`
const DEFAULT_DESCRIPTION = 'A Nuxt 3 + Vuetify 4 starter template.'
const DEFAULT_IMAGE = '/assets/images/og-default.png'

export const useSeo = (options: SeoOptions = {}) => {
  const route = useRoute()
  const config = useRuntimeConfig()

  const resolvedTitle = options.title ? TITLE_TEMPLATE(options.title) : SITE_NAME
  const resolvedUrl = options.url ?? `${config.public.apiBaseUrl}${route.path}`

  useSeoMeta({
    title: resolvedTitle,
    ogTitle: resolvedTitle,
    twitterTitle: resolvedTitle,

    description: options.description ?? DEFAULT_DESCRIPTION,
    ogDescription: options.description ?? DEFAULT_DESCRIPTION,
    twitterDescription: options.description ?? DEFAULT_DESCRIPTION,

    ogImage: options.image ?? DEFAULT_IMAGE,
    twitterImage: options.image ?? DEFAULT_IMAGE,
    twitterCard: 'summary_large_image',

    ogUrl: resolvedUrl,
    ogType: options.type ?? 'website',
    ogSiteName: SITE_NAME,

    ...(options.noIndex ? { robots: 'noindex, nofollow' } : {}),
  })
}
