// /work — portfolio + hire-me
//
// Mounted as a path on aesv.io. Was previously served from work.aesv.io
// via host-constrained routing; collapsed to a single domain for simplicity.

const TEMPLATE = 'work/index.njk'

function workPayload(fastify) {
  return {
    site: { ...fastify.config.site, name: 'work', tagline: 'I make system A talk to system B.' },
    ...fastify.getPageData(),
  }
}

export async function registerWorkRoutes(fastify) {
  fastify.get('/work', async (_request, reply) => {
    return reply.view(TEMPLATE, workPayload(fastify))
  })
}
