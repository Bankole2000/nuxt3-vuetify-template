export default defineEventHandler(async (event) => {
  const { url } = getQuery(event)

  if (!url || typeof url !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'url query param is required' })
  }

  let parsed: URL
  try {
    parsed = new URL(url)
  }
  catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid URL' })
  }

  // Only allow http/https
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw createError({ statusCode: 400, statusMessage: 'Only http and https URLs are supported' })
  }

  let html: string
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LinkPreviewBot/1.0)' },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    html = await res.text()
  }
  catch (e: unknown) {
    throw createError({ statusCode: 502, statusMessage: `Could not fetch URL: ${(e as Error).message}` })
  }

  const meta = (property: string) => {
    const ogMatch = html.match(new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'))
      ?? html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i'))
    return ogMatch?.[1] ?? null
  }

  const nameMeta = (name: string) => {
    const m = html.match(new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i'))
      ?? html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, 'i'))
    return m?.[1] ?? null
  }

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)

  const title = meta('og:title') ?? nameMeta('twitter:title') ?? titleMatch?.[1]?.trim() ?? null
  const description = meta('og:description') ?? nameMeta('description') ?? nameMeta('twitter:description') ?? null
  const image = meta('og:image') ?? nameMeta('twitter:image') ?? null
  const siteName = meta('og:site_name') ?? null
  const favicon = `${parsed.protocol}//${parsed.hostname}/favicon.ico`

  return {
    url,
    title,
    description,
    image,
    siteName,
    favicon,
    hostname: parsed.hostname,
  }
})
