const DEFAULT_TTL = 10 * 60 * 1000

export class CacheMap {
  constructor(defaultTtl = DEFAULT_TTL) {
    this._map = new Map()
    this._defaultTtl = defaultTtl
  }

  get(key) {
    const entry = this._map.get(key)
    if (!entry) return null
    if (Date.now() >= entry.expires) {
      this._map.delete(key)
      return null
    }
    return entry.value
  }

  set(key, value, ttl = this._defaultTtl) {
    this._map.set(key, { value, expires: Date.now() + ttl })
  }

  clear() {
    this._map.clear()
  }
}
