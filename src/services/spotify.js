import { readTokens, writeTokens } from './tokens.js'

const AUTHORIZE_URL = 'https://accounts.spotify.com/authorize'
const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const API_BASE = 'https://api.spotify.com/v1'
const SCOPE = 'user-top-read user-read-recently-played'

export function getAuthUrl(config) {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    scope: SCOPE,
    redirect_uri: config.redirectUri,
  })
  return `${AUTHORIZE_URL}?${params}`
}

export async function handleCallback(code, config) {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization:
        'Basic ' + Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64'),
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: config.redirectUri,
    }),
  })

  if (!res.ok) return null

  const data = await res.json()
  await writeTokens({ spotify_refresh_token: data.refresh_token })
  return data.access_token
}

async function refreshAccessToken(config) {
  const tokens = await readTokens()
  const refreshToken = tokens.spotify_refresh_token
  if (!refreshToken) return null

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization:
        'Basic ' + Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64'),
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!res.ok) return null

  const data = await res.json()
  if (data.refresh_token) {
    await writeTokens({ spotify_refresh_token: data.refresh_token })
  }
  return data.access_token
}

async function fetchApi(path, config) {
  const token = await refreshAccessToken(config)
  if (!token) return null

  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) return null
  return res.json()
}

export async function getTopTracks(config) {
  const data = await fetchApi('/me/top/tracks?limit=5&time_range=medium_term', config)
  if (!data?.items) return []
  return data.items.map((t) => ({
    name: t.name,
    artist: t.artists.map((a) => a.name).join(', '),
    url: t.external_urls.spotify,
  }))
}

export async function getTopArtists(config) {
  const data = await fetchApi('/me/top/artists?limit=5&time_range=medium_term', config)
  if (!data?.items) return []
  return data.items.map((a) => ({
    name: a.name,
    url: a.external_urls.spotify,
  }))
}

// NOTE: extended variants used by /music — full album + image payload, configurable limit.
// Kept separate from the dashboard-flavored getTopTracks/getTopArtists to preserve their
// minimal shape for the home widget.
export async function getTopTracksFull(config, { limit = 20, timeRange = 'medium_term' } = {}) {
  const data = await fetchApi(`/me/top/tracks?limit=${limit}&time_range=${timeRange}`, config)
  if (!data?.items) return []
  return data.items.map((t) => ({
    name: t.name,
    artist: t.artists.map((a) => a.name).join(', '),
    url: t.external_urls?.spotify || null,
    album: {
      id: t.album?.id || null,
      name: t.album?.name || '',
      artUrl: t.album?.images?.[0]?.url || null,
      url: t.album?.external_urls?.spotify || null,
    },
  }))
}

export async function getTopArtistsFull(config, { limit = 10, timeRange = 'medium_term' } = {}) {
  const data = await fetchApi(`/me/top/artists?limit=${limit}&time_range=${timeRange}`, config)
  if (!data?.items) return []
  return data.items.map((a) => ({
    name: a.name,
    url: a.external_urls?.spotify || null,
    imageUrl: a.images?.[0]?.url || null,
    followers: a.followers?.total ?? null,
    genres: a.genres || [],
  }))
}

export async function getRecentTracks(config, { limit = 30 } = {}) {
  const data = await fetchApi(`/me/player/recently-played?limit=${limit}`, config)
  if (!data?.items) return []
  return data.items
    .filter((item) => item?.track)
    .map((item) => {
      const t = item.track
      return {
        name: t.name,
        artist: t.artists.map((a) => a.name).join(', '),
        url: t.external_urls?.spotify || null,
        playedAt: item.played_at,
        album: {
          id: t.album?.id || null,
          name: t.album?.name || '',
          artUrl: t.album?.images?.[0]?.url || null,
          url: t.album?.external_urls?.spotify || null,
        },
      }
    })
}

export async function getRecentlyPlayed(config) {
  const data = await fetchApi('/me/player/recently-played?limit=1', config)
  const item = data?.items?.[0]
  if (!item?.track) return null
  const t = item.track
  // NOTE: pick largest image (first in Spotify's array is largest)
  const albumArt = t.album?.images?.[0]?.url || null
  return {
    track: t.name,
    artist: t.artists.map((a) => a.name).join(', '),
    album: t.album?.name || '',
    albumArtUrl: albumArt,
    url: t.external_urls?.spotify || null,
    playedAt: item.played_at,
  }
}
