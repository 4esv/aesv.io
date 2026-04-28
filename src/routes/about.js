// /about — long-form bio page rendered from content/about.md
import { readFile } from 'fs/promises'
import { join } from 'path'

import matter from 'gray-matter'

import { renderMarkdown } from '../lib/markdown.js'

const ABOUT_PATH = join(import.meta.dirname, '../../content/about.md')

let cache = null
const USE_CACHE = process.env.NODE_ENV === 'production'

async function loadAbout() {
  if (cache && USE_CACHE) return cache
  const raw = await readFile(ABOUT_PATH, 'utf-8')
  const { data, content } = matter(raw)
  const date =
    data.date instanceof Date
      ? data.date.toISOString().slice(0, 10)
      : typeof data.date === 'string'
        ? data.date
        : null
  cache = {
    title: data.title || 'About',
    date,
    summary: data.summary || '',
    html: renderMarkdown(content),
  }
  return cache
}

export async function registerAboutRoutes(fastify) {
  fastify.get('/about', async (_req, reply) => {
    const about = await loadAbout()
    return reply.view('about/index.njk', {
      site: { ...fastify.config.site, name: 'about', tagline: about.summary },
      about,
    })
  })
}
