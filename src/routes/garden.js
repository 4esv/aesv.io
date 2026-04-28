// /sketches — small templates-based garden (the original "garden.aesv.io" content).
//
// Mounted as a path on aesv.io. Was previously served from garden.aesv.io
// via host-constrained routing; collapsed to /sketches to leave /garden free
// for the markdown writing garden (see grdn.js). Filename kept as garden.js
// to match the templates/garden/ folder.

import { readdir } from 'fs/promises'
import { join, parse } from 'path'

const GARDEN_DIR = join(import.meta.dirname, '../templates/garden')
const BASE_PATH = '/sketches'

const ROOT_NAMES = new Set(['index', 'home'])

/**
 * @param {import('fastify').FastifyInstance} fastify
 */
export async function registerGardenRoutes(fastify) {
  const entries = await readdir(GARDEN_DIR, { withFileTypes: true })

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.njk')) continue

    const { name } = parse(entry.name)
    const route = ROOT_NAMES.has(name) ? BASE_PATH : `${BASE_PATH}/${name}`
    const template = `garden/${entry.name}`

    fastify.get(route, async (request, reply) => {
      const { grid } = request

      if (grid.isTerminal) {
        reply.header('Content-Type', 'text/plain; charset=utf-8')
      }

      return reply.view(template, {
        route,
        basePath: BASE_PATH,
        site: fastify.config.site,
        grid,
        ...fastify.getPageData(),
      })
    })
  }
}
