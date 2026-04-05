/**
 * Primary public origin (no trailing slash). Used when VITE_SITE_URL is unset so
 * sitemap.xml, robots.txt, and client SEO still match the custom domain in Google Search Console.
 * Override with VITE_SITE_URL for staging or a different production host.
 */
export const CANONICAL_SITE_ORIGIN = 'https://chatreconstruct.com'
