import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { CacheMap } from '../../src/services/cache.js'

describe('CacheMap', () => {
  it('returns null for missing keys', () => {
    const cache = new CacheMap()
    assert.equal(cache.get('missing'), null)
  })

  it('stores and retrieves values', () => {
    const cache = new CacheMap()
    cache.set('key', 'value')
    assert.equal(cache.get('key'), 'value')
  })

  it('returns null for expired keys', () => {
    const cache = new CacheMap()
    cache.set('key', 'value', 0)
    assert.equal(cache.get('key'), null)
  })

  it('uses default TTL', () => {
    const cache = new CacheMap(60000)
    cache.set('key', 'value')
    assert.equal(cache.get('key'), 'value')
  })

  it('clears all entries', () => {
    const cache = new CacheMap()
    cache.set('a', 1)
    cache.set('b', 2)
    cache.clear()
    assert.equal(cache.get('a'), null)
    assert.equal(cache.get('b'), null)
  })
})
