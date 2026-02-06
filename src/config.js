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

  grid: Object.freeze({
    defaultCols: envInt('GRID_DEFAULT_COLS', 80),
    defaultRows: envInt('GRID_DEFAULT_ROWS', 24),
    minCols: envInt('GRID_MIN_COLS', 20),
    minRows: envInt('GRID_MIN_ROWS', 10),
    maxCols: envInt('GRID_MAX_COLS', 300),
    maxRows: envInt('GRID_MAX_ROWS', 100),
  }),
})
