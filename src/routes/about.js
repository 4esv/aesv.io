// /about — long-form bio rendered from content/about.md
import { join } from 'path'

import { loadMarkdownFile } from '../lib/content.js'
import { renderPage } from '../lib/render.js'

const loadAbout = loadMarkdownFile(join(import.meta.dirname, '../../content/about.md'))

export async function registerAboutRoutes(fastify) {
  fastify.get('/about', async (request, reply) => {
    const about = await loadAbout()
    return renderPage(fastify, request, reply, 'about/index.njk', {
      site: { name: 'about', tagline: about.summary },
      about,
    })
  })
}
