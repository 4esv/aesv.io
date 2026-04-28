import { readTokens, writeTokens } from './tokens.js'

const AUTHORIZE_URL = 'https://www.strava.com/oauth/authorize'
const TOKEN_URL = 'https://www.strava.com/oauth/token'
const API_BASE = 'https://www.strava.com/api/v3'
const SCOPE = 'activity:read_all'

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

// Google encoded-polyline decoder. Returns [[lat, lng], ...].
// Strava's `map.summary_polyline` is in this format.
function decodePolyline(str, precision = 5) {
  if (!str) return []
  const coords = []
  const factor = Math.pow(10, precision)
  let index = 0
  let lat = 0
  let lng = 0
  while (index < str.length) {
    let result = 1
    let shift = 0
    let b
    do {
      b = str.charCodeAt(index++) - 63 - 1
      result += b << shift
      shift += 5
    } while (b >= 0x1f && index < str.length)
    lat += result & 1 ? ~(result >> 1) : result >> 1
    result = 1
    shift = 0
    do {
      b = str.charCodeAt(index++) - 63 - 1
      result += b << shift
      shift += 5
    } while (b >= 0x1f && index < str.length)
    lng += result & 1 ? ~(result >> 1) : result >> 1
    coords.push([lat / factor, lng / factor])
  }
  return coords
}

// Project lat/lng pairs into a square 0..100 viewBox with padding.
// Aspect-correct (compensates for longitude shrinking with latitude).
// Returns the SVG path `d` attribute, or null if too few points.
function polylineToSvgPath(coords, { viewBox = 100, padding = 8 } = {}) {
  if (!coords || coords.length < 2) return null
  const lats = coords.map((c) => c[0])
  const lngs = coords.map((c) => c[1])
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)
  const dLat = maxLat - minLat || 1e-6
  const dLng = maxLng - minLng || 1e-6
  const midLat = (minLat + maxLat) / 2
  const lonScale = Math.cos((midLat * Math.PI) / 180)
  const inner = viewBox - padding * 2
  const scaleX = inner / (dLng * lonScale)
  const scaleY = inner / dLat
  const scale = Math.min(scaleX, scaleY)
  const widthUsed = dLng * lonScale * scale
  const heightUsed = dLat * scale
  const offsetX = (viewBox - widthUsed) / 2
  const offsetY = (viewBox - heightUsed) / 2
  const points = coords.map(([la, lo]) => {
    const x = (lo - minLng) * lonScale * scale + offsetX
    const y = viewBox - ((la - minLat) * scale + offsetY)
    return [x, y]
  })
  let d = `M ${points[0][0].toFixed(2)} ${points[0][1].toFixed(2)}`
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i][0].toFixed(2)} ${points[i][1].toFixed(2)}`
  }
  return d
}

export async function getLastActivity(config) {
  const token = await refreshAccessToken(config)
  if (!token) return null

  const res = await fetch(`${API_BASE}/athlete/activities?per_page=1`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) return null

  const [activity] = await res.json()
  if (!activity) return null

  const polyline = activity.map?.summary_polyline || activity.map?.polyline || ''
  const coords = decodePolyline(polyline)
  const routePath = polylineToSvgPath(coords)

  return {
    name: activity.name,
    type: activity.sport_type || activity.type,
    distance: metersToMiles(activity.distance),
    duration: formatDuration(activity.moving_time),
    elevation: Math.round(activity.total_elevation_gain * 3.28084),
    routePath,
    routePoints: coords.length,
  }
}
