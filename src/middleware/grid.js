// Decorates request with `grid.isTerminal` so routes can switch to text/plain
// for curl, wget, etc. Tiny — kept as middleware for backwards compat with
// route handlers that read `request.grid.isTerminal`.
const TERMINAL_CLIENTS = /^(curl|wget|httpie|fetch|lynx|links|w3m)/i

function isTerminalClient(userAgent) {
  if (!userAgent) return false
  return TERMINAL_CLIENTS.test(userAgent)
}

/**
 * @param {import('fastify').FastifyInstance} fastify
 */
export function registerGridMiddleware(fastify) {
  fastify.decorateRequest('grid', null)

  fastify.addHook('preHandler', async (request) => {
    request.grid = {
      isTerminal: isTerminalClient(request.headers['user-agent']),
    }
  })
}
