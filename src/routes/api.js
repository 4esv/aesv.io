import { readFile } from 'fs/promises'
import { join } from 'path'

import { CacheMap } from '../services/cache.js'
import * as spotify from '../services/spotify.js'
import * as strava from '../services/strava.js'
import { getLastVictory } from '../services/chess.js'

const GPG_PATH = join(import.meta.dirname, '../static/gpg.asc')

export async function apiRoutes(fastify) {
  const cache = new CacheMap()
  const { config } = fastify

  // Spotify OAuth
  fastify.get('/api/spotify/auth', async (_request, reply) => {
    return reply.redirect(spotify.getAuthUrl(config.spotify))
  })

  fastify.get('/api/spotify/callback', async (request, reply) => {
    const { code } = request.query
    if (code) await spotify.handleCallback(code, config.spotify)
    return reply.redirect('/')
  })

  // Strava OAuth
  fastify.get('/api/strava/auth', async (_request, reply) => {
    return reply.redirect(strava.getAuthUrl(config.strava))
  })

  fastify.get('/api/strava/callback', async (request, reply) => {
    const { code } = request.query
    if (code) await strava.handleCallback(code, config.strava)
    return reply.redirect('/')
  })

  // Chess data
  fastify.get('/api/chess/data', async () => {
    const data = await getLastVictory(config.chess.username, cache)
    return data || { error: 'no data' }
  })

  // GPG public key
  fastify.get('/api/gpg', async (_request, reply) => {
    try {
      const key = await readFile(GPG_PATH, 'utf-8')
      reply.type('text/plain').send(key)
    } catch {
      reply.status(404).send('Not found')
    }
  })

  // preHandler hook: load API data for home page
  fastify.addHook('preHandler', async (request) => {
    if (request.url !== '/' && request.url !== '') return

    const [tracks, artists, stravaData, chessData] = await Promise.all([
      spotify.getTopTracks(config.spotify, cache).catch(() => []),
      spotify.getTopArtists(config.spotify, cache).catch(() => []),
      strava.getLastActivity(config.strava, cache).catch(() => null),
      getLastVictory(config.chess.username, cache).catch(() => null),
    ])

    request.pageData = {
      spotify: tracks.length || artists.length ? { tracks, artists } : null,
      strava: stravaData,
      chess: chessData,
    }
  })
}
