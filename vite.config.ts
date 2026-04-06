import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { CANONICAL_SITE_ORIGIN } from './src/canonicalSite'
import { INTENT_LANDINGS, USES_HUB_PATH } from './src/intentLandings'

const HOME_TITLE = 'Translate Chat'
const HOME_DESC = 'Turn your chat screenshots into a translated conversation'

/** GA4 — injected here so `npm run build` / Netlify always emit these tags (not dropped vs source-only edits). */
const GA_MEASUREMENT_ID = 'G-Y5NEYR5MJZ'
const GA_GTAG_SNIPPET = `
    <script async src="https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_MEASUREMENT_ID}');
    </script>`

function escAttr(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
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
  return `\n    ${lines.join('\n    ')}\n  `
}

function seoBuildPlugin(siteUrl: string, mode: string): Plugin {
  return {
    name: 'seo-build',
    transformIndexHtml(html) {
      return html.replace('</title>', `</title>${GA_GTAG_SNIPPET}${seoInjectHtml(siteUrl)}`)
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
        ...INTENT_LANDINGS.map((x) => ({
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
