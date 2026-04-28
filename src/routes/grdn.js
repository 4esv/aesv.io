// /garden — writing garden (markdown-content)
//
// Mounted as a path on aesv.io. Was previously served from grdn.aesv.io
// via host-constrained routing; collapsed to a single domain for simplicity.
// File is still named grdn.js to match the source/templates folder naming
// (templates/grdn/, content/grdn/); the user-facing path is /garden.

import { readdir, readFile } from 'fs/promises'
import { join, parse } from 'path'

import matter from 'gray-matter'

import { renderMarkdown } from '../lib/markdown.js'

const BASE_PATH = '/garden'
const CONTENT_DIR = join(import.meta.dirname, '../../content/grdn')

let cache = null
const USE_CACHE = process.env.NODE_ENV === 'production'

async function loadEssays() {
  if (cache && USE_CACHE) return cache
  const entries = await readdir(CONTENT_DIR, { withFileTypes: true })
  const essays = []
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue
    const slug = parse(entry.name).name
    const raw = await readFile(join(CONTENT_DIR, entry.name), 'utf-8')
    const { data, content } = matter(raw)
    const date =
      data.date instanceof Date
        ? data.date.toISOString().slice(0, 10)
        : typeof data.date === 'string'
          ? data.date
          : null
    essays.push({
      slug,
      title: data.title || slug,
      date,
      summary: data.summary || '',
      tags: data.tags || [],
      hidden: data.hidden === true,
      raw: content,
    })
  }
  // most recent first
  essays.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
  cache = essays
  return essays
}

function siteShape(fastify) {
  return {
    ...fastify.config.site,
    name: 'garden',
    tagline: 'A digital garden. Writing, code, and the occasional over-researched essay.',
  }
}

export async function registerGrdnRoutes(fastify) {
  fastify.get(BASE_PATH, async (_req, reply) => {
    const essays = await loadEssays()
    const visible = essays.filter((e) => !e.hidden)
    // NOTE: tag stats power the discovery sidebar — counts let the
    //   most-used tags float to the top of the facet list.
    const tagCounts = new Map()
    for (const e of visible) {
      for (const tag of e.tags || []) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      }
    }
    const tags = Array.from(tagCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    return reply.view('grdn/index.njk', {
      site: siteShape(fastify),
      essays: visible,
      tags,
      route: BASE_PATH,
      basePath: BASE_PATH,
    })
  })
  fastify.get(`${BASE_PATH}/:slug`, async (req, reply) => {
    const essays = await loadEssays()
    const essay = essays.find((e) => e.slug === req.params.slug)
    if (!essay) return reply.redirect(BASE_PATH)
    const html = renderMarkdown(essay.raw)
    return reply.view('grdn/essay.njk', {
      site: siteShape(fastify),
      essay,
      html,
      basePath: BASE_PATH,
    })
  })
}
