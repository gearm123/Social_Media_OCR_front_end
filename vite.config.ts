import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

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
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'WebApplication',
      name: HOME_TITLE,
      description: HOME_DESC,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web',
    },
  ]
  if (siteHome) {
    graph.unshift({
      '@type': 'WebSite',
      name: HOME_TITLE,
      description: HOME_DESC,
      url: siteHome,
    })
  }
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': graph,
  })
  lines.push(`<script type="application/ld+json">${jsonLd}</script>`)
  return `\n    ${lines.join('\n    ')}\n  `
}

function seoBuildPlugin(siteUrl: string): Plugin {
  return {
    name: 'seo-build',
    transformIndexHtml(html) {
      return html.replace('</title>', `</title>${GA_GTAG_SNIPPET}${seoInjectHtml(siteUrl)}`)
    },
    closeBundle() {
      const base = siteUrl.replace(/\/$/, '')
      if (!base) return
      const distDir = path.join(process.cwd(), 'dist')
      if (!fs.existsSync(distDir)) return
      const paths = ['/', '/contact', '/feedback', '/pay']
      const urls = paths.map((p) => {
        const loc = p === '/' ? `${base}/` : `${base}${p}`
        const priority = p === '/' ? '1.0' : '0.7'
        return `  <url>\n    <loc>${loc}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`
      })
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
      fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap, 'utf8')
      fs.writeFileSync(
        path.join(distDir, 'robots.txt'),
        `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`,
        'utf8',
      )
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteUrl = (env.VITE_SITE_URL || '').trim()

  return {
    plugins: [react(), seoBuildPlugin(siteUrl)],
  }
})
