import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { absoluteSiteUrl, CANONICAL_SITE_ORIGIN } from './src/canonicalSite'
import { DEMO_RECONSTRUCTION_GIF_PATH } from './src/demoReconstructionMedia'
import { INTENT_LANDINGS, USES_HUB_PATH } from './src/intentLandings'
import { GUIDE_VIDEO_CLIPS, VIDEOS_HUB_PATH } from './src/guideWorkflowSteps'
import { buildLandingStructuredData } from './src/landingStructuredDataShared'
import { PRERENDER_ROUTES } from './src/prerenderRoutes'
import {
  OG_IMAGE_ALT,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_PATH,
  OG_IMAGE_TYPE,
  OG_IMAGE_WIDTH,
} from './src/seoAssets'
import { SEO_HOME_DESCRIPTION, SEO_HOME_TITLE, SEO_SITE_NAME } from './src/seoContent'
import type { DocumentSeo } from './src/seoTypes'

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

function socialImageTags(base: string): string[] {
  const image = `${base}${OG_IMAGE_PATH}`
  return [
    `<meta property="og:image" content="${escAttr(image)}" />`,
    `<meta property="og:image:alt" content="${escAttr(OG_IMAGE_ALT)}" />`,
    `<meta property="og:image:type" content="${escAttr(OG_IMAGE_TYPE)}" />`,
    `<meta property="og:image:width" content="${OG_IMAGE_WIDTH}" />`,
    `<meta property="og:image:height" content="${OG_IMAGE_HEIGHT}" />`,
    `<meta name="twitter:image" content="${escAttr(image)}" />`,
    `<meta name="twitter:image:alt" content="${escAttr(OG_IMAGE_ALT)}" />`,
  ]
}

function documentHeadLines(siteUrl: string, seo: DocumentSeo): string[] {
  const base = siteUrl.replace(/\/$/, '')
  const canonPath = seo.canonicalPath || seo.path
  const pageUrl = base ? absoluteSiteUrl(base, canonPath) : ''
  const lines = [
    `<meta name="description" content="${escAttr(seo.description)}" />`,
    `<meta name="robots" content="${escAttr(seo.robots || 'index, follow, max-image-preview:large')}" />`,
    `<meta name="theme-color" content="#0f172a" />`,
    `<meta name="format-detection" content="telephone=no" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${escAttr(SEO_SITE_NAME)}" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta property="og:title" content="${escAttr(seo.title)}" />`,
    `<meta property="og:description" content="${escAttr(seo.description)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escAttr(seo.title)}" />`,
    `<meta name="twitter:description" content="${escAttr(seo.description)}" />`,
  ]
  if (pageUrl) {
    lines.push(`<link rel="canonical" href="${escAttr(pageUrl)}" />`)
    lines.push(`<link rel="alternate" hreflang="en" href="${escAttr(pageUrl)}" />`)
    lines.push(`<link rel="alternate" hreflang="x-default" href="${escAttr(pageUrl)}" />`)
    lines.push(`<meta property="og:url" content="${escAttr(pageUrl)}" />`)
    lines.push(...socialImageTags(base))
  }
  return lines
}

function wrapSeoHead(lines: string[]): string {
  return `\n    ${SEO_HEAD_START}\n    ${lines.join('\n    ')}\n    ${SEO_HEAD_END}\n  `
}

function seoInjectHtml(siteUrl: string): string {
  const base = siteUrl.replace(/\/$/, '')
  const lines = documentHeadLines(siteUrl, {
    title: SEO_HOME_TITLE,
    description: SEO_HOME_DESCRIPTION,
    path: '/',
  })
  if (base) {
    for (const entry of buildLandingStructuredData('/', null, base)) {
      const jsonLd = JSON.stringify(entry.data).replace(/</g, '\\u003c')
      lines.push(`<script type="application/ld+json" id="${escAttr(entry.id)}">${jsonLd}</script>`)
    }
  }
  return wrapSeoHead(lines)
}

function routeSeoHtml(siteUrl: string, route: (typeof PRERENDER_ROUTES)[number]): string {
  const base = siteUrl.replace(/\/$/, '')
  const lines = documentHeadLines(siteUrl, route.seo)
  for (const entry of buildLandingStructuredData(route.pathNorm, route.intent, base)) {
    const jsonLd = JSON.stringify(entry.data).replace(/</g, '\\u003c')
    lines.push(`<script type="application/ld+json" id="${escAttr(entry.id)}">${jsonLd}</script>`)
  }
  return wrapSeoHead(lines)
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

      const lastmod = new Date().toISOString().slice(0, 10)
      type Row = {
        loc: string
        changefreq: string
        priority: string
        images?: { loc: string; title: string }[]
        video?: { thumbnail: string; title: string; description: string; content: string; duration: string }
      }
      const rows: Row[] = [
        {
          loc: `${base}/`,
          changefreq: 'weekly',
          priority: '1.0',
          images: [{ loc: `${base}${OG_IMAGE_PATH}`, title: SEO_SITE_NAME }],
        },
        { loc: `${base}${USES_HUB_PATH}`, changefreq: 'weekly', priority: '0.9' },
        { loc: `${base}/faq`, changefreq: 'monthly', priority: '0.75' },
        { loc: `${base}/how-to`, changefreq: 'monthly', priority: '0.78' },
        {
          loc: `${base}/demonstration`,
          changefreq: 'monthly',
          priority: '0.8',
          images: [{ loc: `${base}${DEMO_RECONSTRUCTION_GIF_PATH}`, title: 'Demonstration' }],
        },
        ...INTENT_LANDINGS.map((x) => ({
          loc: `${base}${x.path}`,
          changefreq: 'monthly',
          priority: '0.85',
        })),
        { loc: `${base}${VIDEOS_HUB_PATH}`, changefreq: 'weekly', priority: '0.8' },
        ...GUIDE_VIDEO_CLIPS.map((clip) => ({
          loc: `${base}${clip.path}`,
          changefreq: 'monthly',
          priority: '0.82',
          video: {
            thumbnail: `${base}${clip.poster}`,
            title: clip.title,
            description: clip.seoDescription,
            content: `${base}${clip.src}`,
            duration: clip.duration,
          },
        })),
        { loc: `${base}/privacy`, changefreq: 'yearly', priority: '0.5' },
        { loc: `${base}/terms`, changefreq: 'yearly', priority: '0.5' },
        { loc: `${base}/contact`, changefreq: 'yearly', priority: '0.4' },
        { loc: `${base}/feedback`, changefreq: 'yearly', priority: '0.4' },
      ]
      const urlBlocks = rows.map((r) => {
        const images = (r.images || [])
          .map(
            (img) =>
              `    <image:image>\n      <image:loc>${img.loc}</image:loc>\n      <image:title>${escAttr(img.title)}</image:title>\n    </image:image>`,
          )
          .join('\n')
        const video = r.video
          ? [
              '    <video:video>',
              `      <video:thumbnail_loc>${escAttr(r.video.thumbnail)}</video:thumbnail_loc>`,
              `      <video:title>${escAttr(r.video.title)}</video:title>`,
              `      <video:description>${escAttr(r.video.description)}</video:description>`,
              `      <video:content_loc>${escAttr(r.video.content)}</video:content_loc>`,
              `      <video:duration>${Number(r.video.duration.replace(/[^\d]/g, '')) || 0}</video:duration>`,
              '    </video:video>',
            ].join('\n')
          : ''
        const extra = [images, video].filter(Boolean).map((block) => `\n${block}`).join('')
        return `  <url>\n    <loc>${r.loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>${extra}\n  </url>`
      })
      const sitemap =
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n` +
        `${urlBlocks.join('\n')}\n</urlset>\n`
      fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap, 'utf8')
      fs.writeFileSync(
        path.join(distDir, 'robots.txt'),
        `User-agent: *\nAllow: /\nDisallow: /pay\n\nSitemap: ${base}/sitemap.xml\n`,
        'utf8',
      )
      const indexHtmlPath = path.join(distDir, 'index.html')
      if (fs.existsSync(indexHtmlPath)) {
        const template = fs.readFileSync(indexHtmlPath, 'utf8')
        for (const route of PRERENDER_ROUTES) {
          let routeHtml = replaceTitle(template, route.seo.title)
          routeHtml = replaceSeoHead(routeHtml, routeSeoHtml(base, route))
          routeHtml = routeHtml.replace('<div id="root"></div>', `<div id="root">${route.bodyHtml}</div>`)

          const rel = route.pathNorm.replace(/^\/+/, '')
          const outDir = rel ? path.join(distDir, rel) : distDir
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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const fromEnv = String(env.VITE_SITE_URL || process.env.VITE_SITE_URL || '').trim()
  const useCanonicalFallback =
    !fromEnv &&
    (mode === 'production' ||
      Boolean(process.env.NETLIFY || process.env.CI || process.env.CONTINUOUS_INTEGRATION))
  const siteUrl = fromEnv || (useCanonicalFallback ? CANONICAL_SITE_ORIGIN : '')

  return {
    plugins: [react(), seoBuildPlugin(siteUrl, mode)],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react-dom') || id.includes('node_modules\\react-dom')) {
              return 'react'
            }
            if (id.includes('node_modules/react/') || id.includes('node_modules\\react\\')) {
              return 'react'
            }
          },
        },
      },
    },
  }
})
