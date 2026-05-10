// /music — Spotify deep-dive. Album-led landing page; pulls recent
// plays for the "Just heard" lead + ledger, and medium-term top tracks
// for the album grid. 5-min TTL per source.

import { getRecentTracks, getTopTracksFull, searchTrack } from '../services/spotify.js'
import { renderPage } from '../lib/render.js'

const TEMPLATE = 'music/index.njk'

const ALBUM_LIMIT = 16
const RECENT_LIMIT = 20
const TOP_TRACK_LIMIT = 40
// Recent log on /music: skip the lead (last-played) and show the next 4
// numbered 02–05 (lead is implied as 01).
const RECENT_LOG_SIZE = 4

// Songs I'm working on. Album art + deep links pulled live from
// Spotify search so the covers stay correct without hosting images.
const LEARNING_QUERIES = [
  { query: 'Mas Que Nada Sergio Mendes Brasil 66', note: 'Sergio Mendes & Brasil 66' },
  { query: 'Wave Joao Gilberto', note: 'João Gilberto' },
  { query: 'Lithium Nirvana', note: 'Nirvana' },
]

const CACHE_TTL_MS = 5 * 60 * 1000
const NOW_PLAYING_WINDOW_MS = 10 * 60 * 1000

const cache = new Map()

async function cached(key, loader) {
  const now = Date.now()
  const hit = cache.get(key)
  if (hit && now - hit.at < CACHE_TTL_MS) return hit.value
  try {
    const value = await loader()
    cache.set(key, { at: now, value })
    return value
  } catch {
    // Fall back to last known good value on error to avoid blank UI.
    return hit?.value ?? null
  }
}

// Albums missing art are dropped — page is art-led; chrome-only tile is
// worse signal than a shorter grid.
function deriveAlbums(tracks, max) {
  const seen = new Map()
  for (const t of tracks || []) {
    const album = t?.album
    if (!album?.name || !album?.artUrl) continue
    const key = album.id || `${t.artist}::${album.name}`
    if (seen.has(key)) continue
    seen.set(key, {
      id: key,
      name: album.name,
      artist: t.artist,
      artUrl: album.artUrl,
      url: album.url || t.url || null,
    })
    if (seen.size >= max) break
  }
  return [...seen.values()]
}

function pickNow(recent) {
  const head = recent?.[0]
  if (!head?.playedAt) return null
  const playedAt = Date.parse(head.playedAt)
  if (Number.isNaN(playedAt)) return null
  if (Date.now() - playedAt > NOW_PLAYING_WINDOW_MS) return null
  return head
}

export async function registerMusicRoutes(fastify) {
  fastify.get('/listening', async (_request, reply) => reply.redirect('/music', 301))

  fastify.get('/music', async (request, reply) => {
    const cfg = fastify.config.spotify

    // Each source wrapped — partial failures must still render.
    // Albums come from medium-term top tracks (not recent plays) so the
    // grid reflects taste over weeks, not what's playing right now.
    const [recent, top, learningResults] = await Promise.all([
      cached('recent', () => getRecentTracks(cfg, { limit: RECENT_LIMIT })).catch(() => []),
      cached('top-medium', () =>
        getTopTracksFull(cfg, { limit: TOP_TRACK_LIMIT, timeRange: 'medium_term' })
      ).catch(() => []),
      Promise.all(
        LEARNING_QUERIES.map((q) =>
          cached(`learning:${q.query}`, () => searchTrack(cfg, q.query)).catch(() => null)
        )
      ),
    ])

    const recentList = Array.isArray(recent) ? recent : []
    const topList = Array.isArray(top) ? top : []

    const albums = deriveAlbums(topList, ALBUM_LIMIT)
    // `nowPlaying` (not `now`) — `now` is a global Date in template-helpers.
    const nowPlaying = pickNow(recentList)
    // Skip the lead track (rendered as the big card, implied #1) and
    // show the next RECENT_LOG_SIZE entries numbered #2 onward.
    const leadIndex = nowPlaying ? -1 : 0
    const recentLog = recentList.slice(leadIndex + 1, leadIndex + 1 + RECENT_LOG_SIZE)

    const learning = learningResults
      .map((track, i) => (track ? { ...track, note: LEARNING_QUERIES[i].note } : null))
      .filter(Boolean)

    return renderPage(fastify, request, reply, TEMPLATE, {
      nowPlaying,
      recent: recentList,
      recentLog,
      albums,
      learning,
      hasData: Boolean(recentList.length || albums.length),
    })
  })
}
