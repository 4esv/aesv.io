import { readdir } from 'fs/promises'
import { join, parse } from 'path'

const GARDEN_DIR = join(import.meta.dirname, '../templates/garden')

const ROOT_NAMES = new Set(['index', 'home'])

/**
 * @param {import('fastify').FastifyInstance} fastify
 */
export async function registerGardenRoutes(fastify) {
  const entries = await readdir(GARDEN_DIR, { withFileTypes: true })

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.njk')) continue

    const { name } = parse(entry.name)
    const route = ROOT_NAMES.has(name) ? '/' : `/${name}`
    const template = `garden/${entry.name}`

    for (const host of ['garden.aesv.io', 'garden.aesv.io:3000']) {
      fastify.get(route, { constraints: { host } }, async (request, reply) => {
        const { grid } = request

        if (grid.isTerminal) {
          reply.header('Content-Type', 'text/plain; charset=utf-8')
        }

        return reply.view(template, {
          route,
          site: fastify.config.site,
          grid,
          ...fastify.getPageData(),
        })
      })
    }
  }
}
