import { readdir } from 'fs/promises'
import { join, parse } from 'path'

const PAGES_DIR = join(import.meta.dirname, '../templates/pages')

const ROOT_NAMES = new Set(['index', 'home'])

async function discoverTemplates(dir, prefix = '') {
  const entries = await readdir(dir, { withFileTypes: true })
  const routes = []

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const nested = await discoverTemplates(join(dir, entry.name), `${prefix}/${entry.name}`)
      routes.push(...nested)
    } else if (entry.name.endsWith('.njk')) {
      const { name } = parse(entry.name)
      const route = ROOT_NAMES.has(name) ? prefix || '/' : `${prefix}/${name}`
      const template = `pages${prefix}/${entry.name}`
      routes.push({ route, template })
    }
  }

  return routes
}

/**
 * @param {import('fastify').FastifyInstance} fastify
 */
export async function registerPageRoutes(fastify) {
  const templates = await discoverTemplates(PAGES_DIR)

  for (const { route, template } of templates) {
    fastify.get(route, async (request, reply) => {
      const { grid } = request

      if (grid.isTerminal) {
        reply.header('Content-Type', 'text/plain; charset=utf-8')
      }

      return reply.view(template, {
        route,
        site: fastify.config.site,
        grid,
      })
    })
  }
}
