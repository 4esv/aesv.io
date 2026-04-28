function env(key, fallback) {
  return process.env[key] ?? fallback
}

function envInt(key, fallback) {
  const value = process.env[key]
  return value !== undefined ? parseInt(value, 10) : fallback
}

export default Object.freeze({
  env: env('NODE_ENV', 'development'),
  port: envInt('PORT', 3000),
  host: env('HOST', '0.0.0.0'),
  logLevel: env('LOG_LEVEL', 'info'),

  site: Object.freeze({
    name: env('SITE_NAME', 'Your Name'),
    tagline: env('SITE_TAGLINE', 'Your tagline.'),
    url: env('SITE_URL', 'https://example.com'),
    github: env('SITE_GITHUB', 'username'),
  }),

  spotify: Object.freeze({
    clientId: env('SPOTIFY_CLIENT_ID', ''),
    clientSecret: env('SPOTIFY_CLIENT_SECRET', ''),
    redirectUri: env('SPOTIFY_REDIRECT_URI', 'http://127.0.0.1:3000/api/auth/spotify/callback'),
  }),

  strava: Object.freeze({
    clientId: env('STRAVA_CLIENT_ID', ''),
    clientSecret: env('STRAVA_CLIENT_SECRET', ''),
    redirectUri: env('STRAVA_REDIRECT_URI', 'http://localhost:3000/api/auth/strava/callback'),
  }),

  chess: Object.freeze({
    username: env('CHESS_USERNAME', '4esv'),
  }),
})
