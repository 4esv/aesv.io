// test/routes.test.js
import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { build } from '../src/server.js'

describe('Page Routes', () => {
  let app

  before(async () => {
    app = await build({ logger: false })
  })

  after(async () => {
    await app.close()
  })

  describe('GET /', () => {
    it('returns 200 with HTML', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/',
      })

      assert.equal(response.statusCode, 200)
      assert.ok(response.headers['content-type'].includes('text/html'))
    })

    it('returns plain text for curl', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/',
        headers: {
          'user-agent': 'curl/7.79.1',
        },
      })

      assert.equal(response.statusCode, 200)
      assert.ok(response.headers['content-type'].includes('text/plain'))
    })
  })

  describe('404 handling', () => {
    it('returns 404 for unknown routes', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/nonexistent',
      })

      assert.equal(response.statusCode, 404)
    })

    it('returns 404 page with grid context', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/nonexistent',
      })

      assert.ok(response.body.includes('404'))
    })
  })
})

describe('API Routes', () => {
  let app

  before(async () => {
    app = await build({ logger: false })
  })

  after(async () => {
    await app.close()
  })

  it('GET /api/gpg returns text/plain', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/gpg',
    })

    assert.equal(response.statusCode, 200)
    assert.ok(response.headers['content-type'].includes('text/plain'))
    assert.ok(response.body.includes('BEGIN PGP PUBLIC KEY BLOCK'))
  })

  it('GET /api/auth/spotify returns 302', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/auth/spotify',
    })

    assert.equal(response.statusCode, 302)
    assert.ok(response.headers.location.includes('accounts.spotify.com'))
  })

  it('GET /api/auth/strava returns 302', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/auth/strava',
    })

    assert.equal(response.statusCode, 302)
    assert.ok(response.headers.location.includes('strava.com'))
  })
})

describe('Grid Middleware', () => {
  let app

  before(async () => {
    app = await build({ logger: false })
  })

  after(async () => {
    await app.close()
  })

  it('uses default grid when headers missing', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/',
    })

    assert.equal(response.statusCode, 200)
  })

  it('clamps grid to minimum values', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/',
      headers: {
        'hx-grid-cols': '5',
        'hx-grid-rows': '3',
      },
    })

    assert.equal(response.statusCode, 200)
  })

  it('clamps grid to maximum values', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/',
      headers: {
        'hx-grid-cols': '1000',
        'hx-grid-rows': '500',
      },
    })

    assert.equal(response.statusCode, 200)
  })

  it('handles invalid grid values gracefully', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/',
      headers: {
        'hx-grid-cols': 'invalid',
        'hx-grid-rows': 'also-invalid',
      },
    })

    assert.equal(response.statusCode, 200)
  })
})
