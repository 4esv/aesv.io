// /garden — writing garden. Markdown files in content/grdn/ surfaced
// at /garden (folder kept named grdn to match templates/grdn/).

import { join } from 'path'

import { loadMarkdownDir } from '../lib/content.js'

const BASE_PATH = '/garden'
const CONTENT_DIR = join(import.meta.dirname, '../../content/grdn')

const loadEssays = loadMarkdownDir(CONTENT_DIR, (base, data) => ({
  ...base,
  tags: data.tags || [],
  hidden: data.hidden === true,
}))

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
    return reply.view('grdn/essay.njk', {
      site: siteShape(fastify),
      essay,
      html: essay.html,
      basePath: BASE_PATH,
    })
  })
}
