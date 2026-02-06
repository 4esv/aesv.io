import { networkInterfaces } from 'os'
import { join } from 'path'

import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import fastifyView from '@fastify/view'
import nunjucks from 'nunjucks'

import config from './config.js'
import { registerErrorHandler } from './errors/handler.js'
import { registerFilters, registerGlobals } from './lib/template-helpers.js'
import { registerGridMiddleware } from './middleware/grid.js'
import { registerPageRoutes } from './routes/pages.js'

const TEMPLATES_DIR = join(import.meta.dirname, 'templates')
const STATIC_DIR = join(import.meta.dirname, 'static')

/**
 * Build and configure the Fastify application
 * @param {object} opts - Fastify options override
 * @returns {Promise<import('fastify').FastifyInstance>}
 */
export async function build(opts = {}) {
  const fastify = Fastify({
    logger: { level: config.logLevel },
    ...opts,
  })

  fastify.decorate('config', config)

  nunjucks.configure(TEMPLATES_DIR, {
    autoescape: true,
    noCache: config.env === 'development',
  })

  await fastify.register(fastifyView, {
    engine: { nunjucks },
    root: TEMPLATES_DIR,
    viewExt: 'njk',
    options: {
      onConfigure: (env) => {
        registerFilters(env)
        registerGlobals(env)
      },
    },
  })

  registerGridMiddleware(fastify)

  await fastify.register(fastifyStatic, {
    root: STATIC_DIR,
    prefix: '/',
  })

  fastify.addHook('onSend', async (request, reply) => {
    if (request.url.endsWith('.woff2')) {
      reply.header('cache-control', 'public, max-age=31536000, immutable')
    }
  })

  await registerPageRoutes(fastify)
  registerErrorHandler(fastify)

  return fastify
}

async function start() {
  const app = await build({ logger: false })

  try {
    await app.listen({ port: config.port, host: config.host })

    console.log('')
    console.log('  Local:   http://localhost:' + config.port)
    if (config.host === '0.0.0.0') {
      for (const iface of Object.values(networkInterfaces()).flat()) {
        if (iface?.family === 'IPv4' && !iface.internal) {
          console.log('  Network: http://' + iface.address + ':' + config.port)
        }
      }
    }
    console.log('')
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  start()
}
