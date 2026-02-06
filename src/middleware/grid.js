import { getLayoutConfig } from '../grid/layout.js'

const TERMINAL_CLIENTS = /^(curl|wget|httpie|fetch|lynx|links|w3m)/i

function isTerminalClient(userAgent) {
  if (!userAgent) return false
  return TERMINAL_CLIENTS.test(userAgent)
}

function parseGridDimension(value, defaultValue, min, max) {
  if (!value) return defaultValue
  const parsed = parseInt(value, 10)
  if (isNaN(parsed)) return defaultValue
  return Math.max(min, Math.min(max, parsed))
}

/**
 * @param {import('fastify').FastifyInstance} fastify
 */
export function registerGridMiddleware(fastify) {
  const { grid: gridConfig } = fastify.config

  fastify.decorateRequest('grid', null)

  fastify.addHook('preHandler', async (request) => {
    const isTerminal = isTerminalClient(request.headers['user-agent'])

    const cols = parseGridDimension(
      request.headers['hx-grid-cols'],
      gridConfig.defaultCols,
      gridConfig.minCols,
      gridConfig.maxCols
    )

    const rows = parseGridDimension(
      request.headers['hx-grid-rows'],
      gridConfig.defaultRows,
      gridConfig.minRows,
      gridConfig.maxRows
    )

    request.grid = {
      cols,
      rows,
      isTerminal,
      layout: getLayoutConfig(cols, rows),
      isHtmx: request.headers['hx-request'] === 'true',
    }
  })
}
