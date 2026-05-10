// Site-wide 404 + 500 handlers. Routes through the shared renderPage helper
// so error views receive the same {site, route, grid} shape as every page —
// including the text/plain switch for terminal clients.

import { renderPage } from '../lib/render.js'

/**
 * @param {import('fastify').FastifyInstance} fastify
 */
export function registerErrorHandler(fastify) {
  fastify.setNotFoundHandler(async (request, reply) => {
    reply.status(404)
    return renderPage(fastify, request, reply, 'pages/404.njk')
  })

  fastify.setErrorHandler(async (error, request, reply) => {
    fastify.log.error(error)
    reply.status(error.statusCode || 500)
    return renderPage(fastify, request, reply, 'pages/500.njk')
  })
}
