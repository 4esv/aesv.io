import { readTokens, writeTokens } from './tokens.js'

const AUTHORIZE_URL = 'https://accounts.spotify.com/authorize'
const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const API_BASE = 'https://api.spotify.com/v1'
const SCOPE = 'user-top-read'
const CACHE_TTL = 10 * 60 * 1000

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

async function fetchApi(path, config, cache) {
  const cacheKey = `spotify:${path}`
  const cached = cache.get(cacheKey)
  if (cached) return cached

  const token = await refreshAccessToken(config)
  if (!token) return null

  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) return null

  const data = await res.json()
  cache.set(cacheKey, data, CACHE_TTL)
  return data
}

export async function getTopTracks(config, cache) {
  try {
    const data = await fetchApi('/me/top/tracks?limit=5&time_range=medium_term', config, cache)
    if (!data?.items) return []
    return data.items.map((t) => ({
      name: t.name,
      artist: t.artists.map((a) => a.name).join(', '),
      url: t.external_urls.spotify,
    }))
  } catch {
    return []
  }
}

export async function getTopArtists(config, cache) {
  try {
    const data = await fetchApi('/me/top/artists?limit=5&time_range=medium_term', config, cache)
    if (!data?.items) return []
    return data.items.map((a) => ({
      name: a.name,
      url: a.external_urls.spotify,
    }))
  } catch {
    return []
  }
}
