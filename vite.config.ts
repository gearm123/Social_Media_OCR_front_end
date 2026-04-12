import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { CANONICAL_SITE_ORIGIN } from './src/canonicalSite'
import { INTENT_LANDINGS, USES_HUB_PATH } from './src/intentLandings'
import { buildLandingStructuredData } from './src/landingStructuredDataShared'
import { PRERENDER_ROUTES } from './src/prerenderRoutes'

const HOME_TITLE = 'Translate Chat'
const HOME_DESC = 'Turn your chat screenshots into a translated conversation'
const SEO_HEAD_START = '<!-- SEO_HEAD_START -->'
const SEO_HEAD_END = '<!-- SEO_HEAD_END -->'

function escAttr(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function escRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function seoInjectHtml(siteUrl: string): string {
  const lines = [
    `<meta name="description" content="${escAttr(HOME_DESC)}" />`,
    `<meta name="robots" content="index, follow, max-image-preview:large" />`,
    `<meta name="theme-color" content="#0f172a" />`,
    `<meta name="format-detection" content="telephone=no" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${escAttr(HOME_TITLE)}" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta property="og:title" content="${escAttr(HOME_TITLE)}" />`,
    `<meta property="og:description" content="${escAttr(HOME_DESC)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escAttr(HOME_TITLE)}" />`,
    `<meta name="twitter:description" content="${escAttr(HOME_DESC)}" />`,
  ]
  const base = siteUrl.replace(/\/$/, '')
  const siteHome = base ? `${base}/` : ''
  if (siteHome) {
    lines.push(`<link rel="canonical" href="${escAttr(siteHome)}" />`)
    lines.push(`<meta property="og:url" content="${escAttr(siteHome)}" />`)
    lines.push(`<meta property="og:image" content="${escAttr(`${base}/translate-chat-mark.svg`)}" />`)
    lines.push(`<meta property="og:image:alt" content="${escAttr(HOME_TITLE)}" />`)
    lines.push(`<meta name="twitter:image" content="${escAttr(`${base}/translate-chat-mark.svg`)}" />`)
  }
  const graph: Record<string, unknown>[] = []
  if (siteHome) {
    const orgId = `${base}/#organization`
    graph.push(
      {
        '@type': 'Organization',
        '@id': orgId,
        name: HOME_TITLE,
        url: siteHome,
      },
      {
        '@type': 'WebSite',
        '@id': `${base}/#website`,
        name: HOME_TITLE,
        description: HOME_DESC,
        url: siteHome,
        publisher: { '@id': orgId },
        inLanguage: 'en',
      },
      {
        '@type': 'WebApplication',
        '@id': `${base}/#webapp`,
        name: HOME_TITLE,
        description: HOME_DESC,
        url: siteHome,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        browserRequirements: 'Requires JavaScript',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          description: 'Free tier available; paid plans for more usage',
        },
        publisher: { '@id': orgId },
      },
    )
  } else {
    graph.push({
      '@type': 'WebApplication',
      name: HOME_TITLE,
      description: HOME_DESC,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web',
    })
  }
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': graph,
  }).replace(/</g, '\\u003c')
  lines.push(`<script type="application/ld+json">${jsonLd}</script>`)
  return `\n    ${SEO_HEAD_START}\n    ${lines.join('\n    ')}\n    ${SEO_HEAD_END}\n  `
}

function routeSeoHtml(
  siteUrl: string,
  route: (typeof PRERENDER_ROUTES)[number],
): string {
  const base = siteUrl.replace(/\/$/, '')
  const pagePath = route.seo.path === '/' ? '/' : route.seo.path.startsWith('/') ? route.seo.path : `/${route.seo.path}`
  const pageUrl = pagePath === '/' ? `${base}/` : `${base}${pagePath}`
  const lines = [
    `<meta name="description" content="${escAttr(route.seo.description)}" />`,
    `<meta name="robots" content="${escAttr(route.seo.robots || 'index, follow, max-image-preview:large')}" />`,
    `<meta name="theme-color" content="#0f172a" />`,
    `<meta name="format-detection" content="telephone=no" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${escAttr(HOME_TITLE)}" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta property="og:title" content="${escAttr(route.seo.title)}" />`,
    `<meta property="og:description" content="${escAttr(route.seo.description)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escAttr(route.seo.title)}" />`,
    `<meta name="twitter:description" content="${escAttr(route.seo.description)}" />`,
    `<link rel="canonical" href="${escAttr(pageUrl)}" />`,
    `<meta property="og:url" content="${escAttr(pageUrl)}" />`,
    `<meta property="og:image" content="${escAttr(`${base}/translate-chat-mark.svg`)}" />`,
    `<meta property="og:image:alt" content="${escAttr(HOME_TITLE)}" />`,
    `<meta name="twitter:image" content="${escAttr(`${base}/translate-chat-mark.svg`)}" />`,
  ]

  for (const entry of buildLandingStructuredData(route.pathNorm, route.intent, base)) {
    const jsonLd = JSON.stringify(entry.data).replace(/</g, '\\u003c')
    lines.push(`<script type="application/ld+json" id="${escAttr(entry.id)}">${jsonLd}</script>`)
  }

  return `\n    ${SEO_HEAD_START}\n    ${lines.join('\n    ')}\n    ${SEO_HEAD_END}\n  `
}

function replaceSeoHead(html: string, seoHtml: string): string {
  const pattern = new RegExp(`${escRegex(SEO_HEAD_START)}[\\s\\S]*?${escRegex(SEO_HEAD_END)}`)
  return html.replace(pattern, seoHtml.trim())
}

function replaceTitle(html: string, title: string): string {
  return html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escAttr(title)}</title>`)
}

function seoBuildPlugin(siteUrl: string, mode: string): Plugin {
  return {
    name: 'seo-build',
    transformIndexHtml(html) {
      // GA4 gtag lives in index.html (official snippet). SEO meta/JSON-LD injected before </head>.
      return html.replace('</head>', `${seoInjectHtml(siteUrl)}\n  </head>`)
    },
    closeBundle() {
      const base = siteUrl.replace(/\/$/, '')
      if (!base) {
        const onCi = Boolean(process.env.CI || process.env.NETLIFY || process.env.CONTINUOUS_INTEGRATION)
        if (onCi || mode === 'production') {
          console.warn(
            '[seo-build] VITE_SITE_URL is empty — sitemap.xml and robots.txt were not written. ' +
              'Production builds use CANONICAL_SITE_ORIGIN from src/canonicalSite.ts when env is unset.',
          )
        }
        return
      }
      const distDir = path.join(process.cwd(), 'dist')
      if (!fs.existsSync(distDir)) return

      type Row = { loc: string; changefreq: string; priority: string }
      const rows: Row[] = [
        { loc: `${base}/`, changefreq: 'weekly', priority: '1.0' },
        { loc: `${base}${USES_HUB_PATH}`, changefreq: 'weekly', priority: '0.9' },
        { loc: `${base}/faq`, changefreq: 'monthly', priority: '0.75' },
        { loc: `${base}/how-to`, changefreq: 'monthly', priority: '0.78' },
        { loc: `${base}/demonstration`, changefreq: 'monthly', priority: '0.8' },
        ...INTENT_LANDINGS.filter((x) => x.includeInSitemap !== false).map((x) => ({
          loc: `${base}${x.path}`,
          changefreq: 'monthly',
          priority: '0.85',
        })),
        { loc: `${base}/contact`, changefreq: 'yearly', priority: '0.4' },
        { loc: `${base}/feedback`, changefreq: 'yearly', priority: '0.4' },
      ]
      const urlBlocks = rows.map(
        (r) =>
          `  <url>\n    <loc>${r.loc}</loc>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`,
      )
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlBlocks.join('\n')}\n</urlset>\n`
      fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap, 'utf8')
      fs.writeFileSync(
        path.join(distDir, 'robots.txt'),
        `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`,
        'utf8',
      )
      const indexHtmlPath = path.join(distDir, 'index.html')
      if (fs.existsSync(indexHtmlPath)) {
        const template = fs.readFileSync(indexHtmlPath, 'utf8')
        for (const route of PRERENDER_ROUTES) {
          let routeHtml = replaceTitle(template, route.seo.title)
          routeHtml = replaceSeoHead(routeHtml, routeSeoHtml(base, route))
          routeHtml = routeHtml.replace('<div id="root"></div>', `<div id="root">${route.bodyHtml}</div>`)

          const outDir = path.join(distDir, route.pathNorm.replace(/^\/+/, ''))
          fs.mkdirSync(outDir, { recursive: true })
          fs.writeFileSync(path.join(outDir, 'index.html'), routeHtml, 'utf8')
        }
      }
      console.log(`[seo-build] sitemap.xml + robots.txt written with base: ${base}`)
      if (base.includes('netlify.app')) {
        console.warn(
          '[seo-build] VITE_SITE_URL uses a *.netlify.app host. If Google Search Console is set up for a ' +
            'custom domain (e.g. chatreconstruct.com), every <loc> must use that origin or GSC reports ' +
            '"URL not allowed". Set VITE_SITE_URL in Netlify → Site configuration → Environment variables ' +
            'to your **primary** domain (UI vars override netlify.toml), then redeploy.',
        )
      }
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const fromEnv = String(env.VITE_SITE_URL || process.env.VITE_SITE_URL || '').trim()
  const useCanonicalFallback =
    !fromEnv &&
    (mode === 'production' ||
      Boolean(process.env.NETLIFY || process.env.CI || process.env.CONTINUOUS_INTEGRATION))
  // Explicit VITE_SITE_URL (e.g. Netlify UI) always wins. If unset on Netlify/production, use repo default
  // so sitemap <loc> URLs match the custom domain and Google Search Console accepts the sitemap.
  const siteUrl = fromEnv || (useCanonicalFallback ? CANONICAL_SITE_ORIGIN : '')

  return {
    plugins: [react(), seoBuildPlugin(siteUrl, mode)],
  }
})
