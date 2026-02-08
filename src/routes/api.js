import { readFile } from 'fs/promises'
import { join } from 'path'

import * as spotify from '../services/spotify.js'
import * as strava from '../services/strava.js'
import { getLastVictory } from '../services/chess.js'

const GPG_PATH = join(import.meta.dirname, '../static/gpg.asc')
const REFRESH_INTERVAL = 5 * 60 * 1000

// NOTE: shared page data, refreshed in background
let pageData = { spotify: null, strava: null, chess: null }

async function refreshData(config) {
  const [tracks, artists, stravaData, chessData] = await Promise.all([
    spotify.getTopTracks(config.spotify).catch(() => []),
    spotify.getTopArtists(config.spotify).catch(() => []),
    strava.getLastActivity(config.strava).catch(() => null),
    getLastVictory(config.chess.username).catch(() => null),
  ])

  pageData = {
    spotify: tracks.length || artists.length ? { tracks, artists } : null,
    strava: stravaData,
    chess: chessData,
  }
}

export async function apiRoutes(fastify) {
  const { config } = fastify

  // Health check for Docker and uptime monitoring
  fastify.get('/health', async () => ({ status: 'ok' }))

  // Spotify OAuth
  fastify.get('/api/auth/spotify', async (_request, reply) => {
    return reply.redirect(spotify.getAuthUrl(config.spotify))
  })

  fastify.get('/api/auth/spotify/callback', async (request, reply) => {
    const { code } = request.query
    if (code) await spotify.handleCallback(code, config.spotify)
    await refreshData(config)
    return reply.redirect('/')
  })

  // Strava OAuth
  fastify.get('/api/auth/strava', async (_request, reply) => {
    return reply.redirect(strava.getAuthUrl(config.strava))
  })

  fastify.get('/api/auth/strava/callback', async (request, reply) => {
    const { code } = request.query
    if (code) await strava.handleCallback(code, config.strava)
    await refreshData(config)
    return reply.redirect('/')
  })

  // GPG public key
  fastify.get('/api/gpg', async (_request, reply) => {
    try {
      const key = await readFile(GPG_PATH, 'utf-8')
      return reply.type('text/plain').send(key)
    } catch {
      return reply.status(404).send('Not found')
    }
  })

  // Background refresh on startup + interval
  refreshData(config)
  setInterval(() => refreshData(config), REFRESH_INTERVAL).unref()
}

export function getPageData() {
  return pageData
}
