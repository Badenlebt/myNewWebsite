#!/usr/bin/env node

/**
 * Generates sitemap.xml from content JSON files.
 * Run: node scripts/generate-sitemap.js
 *
 * This reads public/content/blog-entries.json and public/content/books.json
 * and outputs a complete sitemap.xml to public/sitemap.xml.
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')

const SITE_URL = 'https://mhitzelberger.de'

// Static routes
const staticRoutes = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/blog', changefreq: 'weekly', priority: '0.9' },
  { path: '/impressum', changefreq: 'yearly', priority: '0.3' },
  { path: '/imprint', changefreq: 'yearly', priority: '0.3' }
]

// Read content files
const blogEntries = JSON.parse(
  readFileSync(resolve(rootDir, 'public/content/blog-entries.json'), 'utf-8')
)
const books = JSON.parse(
  readFileSync(resolve(rootDir, 'public/content/books.json'), 'utf-8')
)

// Build URL entries
const urls = [
  ...staticRoutes,
  ...books.map(book => ({
    path: `/books/${book.url}`,
    changefreq: 'monthly',
    priority: '0.8'
  })),
  ...blogEntries.map(entry => ({
    path: `/blog/${entry.url}`,
    changefreq: 'yearly',
    priority: '0.6'
  }))
]

// Generate XML
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ path, changefreq, priority }) => `  <url>
    <loc>${SITE_URL}${path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`

const outputPath = resolve(rootDir, 'public/sitemap.xml')
writeFileSync(outputPath, xml, 'utf-8')
console.log(`Sitemap generated: ${outputPath} (${urls.length} URLs)`)
