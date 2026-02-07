import { readTokens, writeTokens } from './tokens.js'

const AUTHORIZE_URL = 'https://www.strava.com/oauth/authorize'
const TOKEN_URL = 'https://www.strava.com/oauth/token'
const API_BASE = 'https://www.strava.com/api/v3'
const SCOPE = 'activity:read_all'
const CACHE_TTL = 10 * 60 * 1000

export function getAuthUrl(config) {
  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: 'code',
    redirect_uri: config.redirectUri,
    scope: SCOPE,
    approval_prompt: 'auto',
  })
  return `${AUTHORIZE_URL}?${params}`
}

export async function handleCallback(code, config) {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      grant_type: 'authorization_code',
    }),
  })

  if (!res.ok) return null

  const data = await res.json()
  await writeTokens({
    strava_refresh_token: data.refresh_token,
    strava_athlete_id: data.athlete?.id,
  })
  return data.access_token
}

async function refreshAccessToken(config) {
  const tokens = await readTokens()
  const refreshToken = tokens.strava_refresh_token
  if (!refreshToken) return null

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!res.ok) return null

  const data = await res.json()
  if (data.refresh_token) {
    await writeTokens({ strava_refresh_token: data.refresh_token })
  }
  return data.access_token
}

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':')
}

function metersToMiles(meters) {
  return (meters * 0.000621371).toFixed(2)
}

export async function getLastActivity(config, cache) {
  const cacheKey = 'strava:last_activity'
  const cached = cache.get(cacheKey)
  if (cached) return cached

  try {
    const token = await refreshAccessToken(config)
    if (!token) return null

    const res = await fetch(`${API_BASE}/athlete/activities?per_page=1`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) return null

    const [activity] = await res.json()
    if (!activity) return null

    const result = {
      name: activity.name,
      type: activity.sport_type || activity.type,
      distance: metersToMiles(activity.distance),
      duration: formatDuration(activity.moving_time),
      date: new Date(activity.start_date_local).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    }

    cache.set(cacheKey, result, CACHE_TTL)
    return result
  } catch {
    return null
  }
}
