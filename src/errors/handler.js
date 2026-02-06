// src/errors/handler.js

/**
 * Register error handlers for 404 and 500
 * @param {import('fastify').FastifyInstance} fastify
 */
export function registerErrorHandler(fastify) {
  fastify.setNotFoundHandler(async (request, reply) => {
    const { grid } = request
    reply.status(404)
    return reply.view('pages/404.njk', {
      route: request.url,
      site: fastify.config.site,
      grid,
    })
  })

  fastify.setErrorHandler(async (error, request, reply) => {
    const { grid } = request
    fastify.log.error(error)
    reply.status(error.statusCode || 500)
    return reply.view('pages/500.njk', {
      route: request.url,
      site: fastify.config.site,
      grid,
    })
  })
}
