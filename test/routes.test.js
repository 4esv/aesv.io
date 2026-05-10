// test/routes.test.js
import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { build } from '../src/server.js'

let app

before(async () => {
  app = await build({ logger: false })
})

after(async () => {
  await app.close()
})

describe('Page routes', () => {
  it('GET / returns 200 HTML', async () => {
    const r = await app.inject({ method: 'GET', url: '/' })
    assert.equal(r.statusCode, 200)
    assert.match(r.headers['content-type'], /text\/html/)
  })

  it('GET /work returns 200', async () => {
    const r = await app.inject({ method: 'GET', url: '/work' })
    assert.equal(r.statusCode, 200)
    assert.match(r.headers['content-type'], /text\/html/)
  })

  it('GET /work/:slug returns 200 for a case study', async () => {
    const r = await app.inject({ method: 'GET', url: '/work/interfolio' })
    assert.equal(r.statusCode, 200)
    assert.ok(r.body.includes('back to work'), 'case-study detail shows back-to-work link')
  })

  it('GET /feed returns 200', async () => {
    const r = await app.inject({ method: 'GET', url: '/feed' })
    assert.equal(r.statusCode, 200)
    assert.ok(r.body.includes('feed.'))
  })

  it('GET /feed/:slug returns 200 for an existing entry', async () => {
    const r = await app.inject({ method: 'GET', url: '/feed/gallows' })
    assert.equal(r.statusCode, 200)
  })

  it('GET /feed.xml returns RSS feed', async () => {
    const r = await app.inject({ method: 'GET', url: '/feed.xml' })
    assert.equal(r.statusCode, 200)
    assert.match(r.headers['content-type'], /application\/rss\+xml/)
    assert.ok(r.body.includes('<rss'), 'has rss root element')
  })

  it('GET /about returns 200', async () => {
    const r = await app.inject({ method: 'GET', url: '/about' })
    assert.equal(r.statusCode, 200)
  })

  it('GET /activities returns 200', async () => {
    const r = await app.inject({ method: 'GET', url: '/activities' })
    assert.equal(r.statusCode, 200)
  })

  it('GET /music returns 200', async () => {
    const r = await app.inject({ method: 'GET', url: '/music' })
    assert.equal(r.statusCode, 200)
  })
})

describe('Legacy redirects', () => {
  it('GET /garden 301-redirects to /feed', async () => {
    const r = await app.inject({ method: 'GET', url: '/garden' })
    assert.equal(r.statusCode, 301)
    assert.equal(r.headers.location, '/feed')
  })

  it('GET /garden/:slug 301-redirects to /feed/:slug', async () => {
    const r = await app.inject({ method: 'GET', url: '/garden/click' })
    assert.equal(r.statusCode, 301)
    assert.equal(r.headers.location, '/feed/click')
  })

  it('GET /files 301-redirects to /feed', async () => {
    const r = await app.inject({ method: 'GET', url: '/files' })
    assert.equal(r.statusCode, 301)
    assert.equal(r.headers.location, '/feed')
  })

  it('GET /files/:slug 301-redirects to /feed/:slug', async () => {
    const r = await app.inject({ method: 'GET', url: '/files/gallows' })
    assert.equal(r.statusCode, 301)
    assert.equal(r.headers.location, '/feed/gallows')
  })

  it('GET /chess 301-redirects to /activities', async () => {
    const r = await app.inject({ method: 'GET', url: '/chess' })
    assert.equal(r.statusCode, 301)
    assert.equal(r.headers.location, '/activities')
  })

  it('GET /listening 301-redirects to /music', async () => {
    const r = await app.inject({ method: 'GET', url: '/listening' })
    assert.equal(r.statusCode, 301)
    assert.equal(r.headers.location, '/music')
  })
})

describe('Error pages', () => {
  it('GET /nonexistent returns 404', async () => {
    const r = await app.inject({ method: 'GET', url: '/nonexistent' })
    assert.equal(r.statusCode, 404)
  })

  it('404 HTML includes the requested path and a dashboard link', async () => {
    const r = await app.inject({ method: 'GET', url: '/clearly-not-real' })
    assert.equal(r.statusCode, 404)
    assert.ok(r.body.includes('/clearly-not-real'), 'requested path is shown')
    assert.ok(r.body.includes('href="/"'), 'has a link back to the dashboard')
  })

  it('404 plain-text variant for terminal clients', async () => {
    const r = await app.inject({
      method: 'GET',
      url: '/missing',
      headers: { 'user-agent': 'curl/8.4.0' },
    })
    assert.equal(r.statusCode, 404)
    assert.match(r.headers['content-type'], /text\/plain/)
    assert.ok(r.body.includes('404'))
  })
})

describe('Terminal detection', () => {
  it('serves HTML to a regular browser', async () => {
    const r = await app.inject({
      method: 'GET',
      url: '/',
      headers: { 'user-agent': 'Mozilla/5.0' },
    })
    assert.equal(r.statusCode, 200)
    assert.match(r.headers['content-type'], /text\/html/)
  })

  it('serves text/plain to curl', async () => {
    const r = await app.inject({
      method: 'GET',
      url: '/',
      headers: { 'user-agent': 'curl/8.4.0' },
    })
    assert.equal(r.statusCode, 200)
    assert.match(r.headers['content-type'], /text\/plain/)
  })
})

describe('API routes', () => {
  it('GET /health returns ok', async () => {
    const r = await app.inject({ method: 'GET', url: '/health' })
    assert.equal(r.statusCode, 200)
    assert.equal(r.json().status, 'ok')
  })

  it('GET /api/gpg returns the public key', async () => {
    const r = await app.inject({ method: 'GET', url: '/api/gpg' })
    assert.equal(r.statusCode, 200)
    assert.match(r.headers['content-type'], /text\/plain/)
    assert.ok(r.body.includes('BEGIN PGP PUBLIC KEY BLOCK'))
  })

  it('GET /api/auth/spotify redirects to Spotify', async () => {
    const r = await app.inject({ method: 'GET', url: '/api/auth/spotify' })
    assert.equal(r.statusCode, 302)
    assert.ok(r.headers.location.includes('accounts.spotify.com'))
  })

  it('GET /api/auth/strava redirects to Strava', async () => {
    const r = await app.inject({ method: 'GET', url: '/api/auth/strava' })
    assert.equal(r.statusCode, 302)
    assert.ok(r.headers.location.includes('strava.com'))
  })
})
