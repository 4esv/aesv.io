// /music — Spotify deep-dive. Album-led landing page; pulls recent +
// top tracks + top artists in parallel and derives a deduped album view.
// 5-min TTL per source.

import { getRecentTracks, getTopArtistsFull, getTopTracksFull } from '../services/spotify.js'

const TEMPLATE = 'music/index.njk'

const ALBUM_LIMIT = 16
const ARTIST_LIMIT = 10
const RECENT_LIMIT = 20
const TOP_TRACK_LIMIT = 20
// Recent log on /music: skip the lead (last-played) and show the next 5.
const RECENT_LOG_SIZE = 5

// What I play — kept here (not in CMS / config) so the page renders even
// when every external API is down. Order is intentional: primary first.
const INSTRUMENTS = [
  { name: 'piano', note: 'classical roots, comfortable improvising over changes', tag: 'primary' },
  { name: 'electric bass', note: 'pocket player, fingerstyle, occasional pick', tag: 'primary' },
  { name: 'drum kit', note: 'emergency drummer — keep time, stay out of the way', tag: 'rescue' },
  { name: 'classical guitar', note: 'fingerstyle, slow doughs only', tag: 'casual' },
  { name: 'voice', note: 'low baritone, used sparingly and never first', tag: 'casual' },
]

// "Music to me" — short paragraphs in my voice. Survives API outages.
const MUSIC_TO_ME = [
  'Music is the closest thing I have to a daily practice. I play to think — sit with a chord that\'s bothering me until it stops.',
  'No through-line in what I listen to. Corridos, Norwegian death metal, Vince Guaraldi, Rosalía. The connecting thread is "I want to hear that again right now."',
  'I prefer a room with one good speaker over a soundbar with surround. Recordings are written for two ears.',
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
    const { grid } = request
    const cfg = fastify.config.spotify

    // Each source wrapped — partial failures must still render.
    const [recent, top, topArtists] = await Promise.all([
      cached('recent', () => getRecentTracks(cfg, { limit: RECENT_LIMIT })).catch(() => []),
      cached('top', () => getTopTracksFull(cfg, { limit: TOP_TRACK_LIMIT })).catch(() => []),
      cached('artists', () => getTopArtistsFull(cfg, { limit: ARTIST_LIMIT })).catch(() => []),
    ])

    const recentList = Array.isArray(recent) ? recent : []
    const topList = Array.isArray(top) ? top : []
    const artistsList = Array.isArray(topArtists) ? topArtists : []

    const albums = deriveAlbums([...recentList, ...topList], ALBUM_LIMIT)
    // `nowPlaying` (not `now`) — `now` is a global Date in template-helpers.
    const nowPlaying = pickNow(recentList)
    const leadIndex = nowPlaying ? -1 : 0
    const recentLog = recentList.slice(leadIndex + 1, leadIndex + 1 + RECENT_LOG_SIZE)

    const payload = {
      site: fastify.config.site,
      grid,
      route: '/music',
      nowPlaying,
      recent: recentList,
      recentLog,
      albums,
      topArtists: artistsList,
      instruments: INSTRUMENTS,
      musicToMe: MUSIC_TO_ME,
      hasData: Boolean(recentList.length || albums.length || artistsList.length),
    }

    if (grid.isTerminal) {
      reply.header('Content-Type', 'text/plain; charset=utf-8')
    }

    return reply.view(TEMPLATE, payload)
  })
}
