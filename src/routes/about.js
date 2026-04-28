// /about — long-form bio page rendered from content/about.md
import { join } from 'path'

import { loadMarkdownFile } from '../lib/content.js'

const loadAbout = loadMarkdownFile(join(import.meta.dirname, '../../content/about.md'))

export async function registerAboutRoutes(fastify) {
  fastify.get('/about', async (_req, reply) => {
    const about = await loadAbout()
    return reply.view('about/index.njk', {
      site: { ...fastify.config.site, name: 'about', tagline: about.summary },
      about,
    })
  })
}
