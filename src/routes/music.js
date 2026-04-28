// /music — Spotify deep-dive on aesv.io
//
// Album-led landing page. Pulls recent plays, top tracks (medium-term)
// and top artists in parallel, then derives a deduped album view from
// the union of recent + top tracks. The dashboard widget on `/` and the
// existing `/listening` page keep using the minimal getTopTracks /
// getTopArtists shape; this route uses the *Full variants because it
// needs album art + artist images to render.
//
// Caching: 5-minute TTL keyed per source function. Mirrors the
// background refresh interval used by routes/api.js.

import { getRecentTracks, getTopArtistsFull, getTopTracksFull } from '../services/spotify.js'

const TEMPLATE = 'music/index.njk'

const ALBUM_LIMIT = 16
const ARTIST_LIMIT = 10
const RECENT_LIMIT = 20
const TOP_TRACK_LIMIT = 20

const CACHE_TTL_MS = 5 * 60 * 1000
const NOW_PLAYING_WINDOW_MS = 10 * 60 * 1000

// PERF: per-key in-memory cache, hydrates on demand. Three keys: recent, top, artists.
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
    // NOTE: on error, fall back to last known good value if any; otherwise empty.
    return hit?.value ?? null
  }
}

/**
 * Dedupe albums from a list of tracks. Albums missing art are dropped — the
 * page is art-led, a chrome-only tile is worse signal than a shorter grid.
 */
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
  fastify.get('/music', async (request, reply) => {
    const { grid } = request
    const cfg = fastify.config.spotify

    // Each source wrapped — partial failures must still render. Auth
    // expiry returns []/null from the service, so this is belt-and-braces.
    const [recent, top, topArtists] = await Promise.all([
      cached('recent', () => getRecentTracks(cfg, { limit: RECENT_LIMIT })).catch(() => []),
      cached('top', () => getTopTracksFull(cfg, { limit: TOP_TRACK_LIMIT })).catch(() => []),
      cached('artists', () => getTopArtistsFull(cfg, { limit: ARTIST_LIMIT })).catch(() => []),
    ])

    const recentList = Array.isArray(recent) ? recent : []
    const topList = Array.isArray(top) ? top : []
    const artistsList = Array.isArray(topArtists) ? topArtists : []

    // Recents first (fresher signal); top tracks fill in for breadth.
    const albums = deriveAlbums([...recentList, ...topList], ALBUM_LIMIT)
    // NOTE: keyed `nowPlaying` (not `now`) — `now` is a global Date in template-helpers.
    const nowPlaying = pickNow(recentList)

    const payload = {
      site: fastify.config.site,
      grid,
      route: '/music',
      nowPlaying,
      recent: recentList,
      albums,
      topArtists: artistsList,
      hasData: Boolean(recentList.length || albums.length || artistsList.length),
    }

    if (grid.isTerminal) {
      reply.header('Content-Type', 'text/plain; charset=utf-8')
    }

    return reply.view(TEMPLATE, payload)
  })
}
