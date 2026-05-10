// /feed — writing feed. Markdown files in content/feed/ surfaced
// at /feed. Single index page with tag/search filtering, plus a detail
// page per slug. Also exposes /feed.xml as an RSS 2.0 feed.

import { join } from 'path'

import { loadMarkdownDir } from '../lib/content.js'
import { renderPage } from '../lib/render.js'

const BASE_PATH = '/feed'
const CONTENT_DIR = join(import.meta.dirname, '../../content/feed')
const SITE_URL = 'https://aesv.io'

const loadEntries = loadMarkdownDir(CONTENT_DIR, (base, data) => ({
  ...base,
  tags: data.tags || [],
  hidden: data.hidden === true,
  type: data.type || '',
  year: data.year || (base.date ? base.date.slice(0, 4) : ''),
  tag: data.tag || '',
  stack: data.stack || '',
  impact: data.impact || '',
  repo: data.repo || '',
  extraCss: data.extra_css || [],
  extraJs: data.extra_js || [],
}))

export const loadFeedEntries = loadEntries

const SITE_OVERRIDES = {
  name: 'feed',
  tagline: 'Writing, code, and the occasional over-researched essay.',
}

function escapeXml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function rfc822(date) {
  const d = date ? new Date(date) : new Date()
  return Number.isNaN(d.getTime()) ? new Date().toUTCString() : d.toUTCString()
}

function buildRss(entries) {
  const items = entries
    .map((e) => {
      const link = `${SITE_URL}${BASE_PATH}/${e.slug}`
      return `    <item>
      <title>${escapeXml(e.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${rfc822(e.date)}</pubDate>
      ${e.summary ? `<description>${escapeXml(e.summary)}</description>` : ''}
    </item>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>aesv.io / feed</title>
    <link>${SITE_URL}${BASE_PATH}</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>${escapeXml(SITE_OVERRIDES.tagline)}</description>
    <language>en</language>
    <lastBuildDate>${rfc822(new Date())}</lastBuildDate>
${items}
  </channel>
</rss>`
}

export async function registerFeedRoutes(fastify) {
  // Legacy paths — preserve old links.
  for (const old of ['/garden', '/files']) {
    fastify.get(old, async (_req, reply) => reply.redirect(BASE_PATH, 301))
    fastify.get(`${old}/:slug`, async (req, reply) =>
      reply.redirect(`${BASE_PATH}/${req.params.slug}`, 301)
    )
  }

  fastify.get('/feed.xml', async (_request, reply) => {
    const entries = await loadEntries()
    const visible = entries
      .filter((e) => !e.hidden && e.type !== 'case-study')
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    reply.header('content-type', 'application/rss+xml; charset=utf-8')
    return buildRss(visible)
  })

  fastify.get(BASE_PATH, async (request, reply) => {
    const entries = await loadEntries()
    const visible = entries.filter((e) => !e.hidden && e.type !== 'case-study')
    return renderPage(fastify, request, reply, 'feed/index.njk', {
      site: SITE_OVERRIDES,
      entries: visible,
      basePath: BASE_PATH,
    })
  })

  fastify.get(`${BASE_PATH}/:slug`, async (request, reply) => {
    const entries = await loadEntries()
    const entry = entries.find((e) => e.slug === request.params.slug)
    if (!entry || entry.type === 'case-study') return reply.redirect(BASE_PATH)
    return renderPage(fastify, request, reply, 'feed/entry.njk', {
      site: { ...SITE_OVERRIDES, tagline: entry.summary || SITE_OVERRIDES.tagline },
      entry,
      html: entry.html,
      basePath: BASE_PATH,
      canonicalBase: '/feed',
    })
  })
}
