'use strict'
const cacheManager = use('cache-manager')
const cache = cacheManager.caching({ store: 'memory', max: 0, ttl: 3600 * 7/* 1 = 1 seconds*/ })
class Cache {
  /**
  * Save cache define by key
  */
  static async saveCache(key, data) {
    await cache.set(key, data)
  }

  /**
  * Get cache define by key
  */
  static async getCache(key) {
    const value = await cache.get(key)
    if (value === undefined) {
      return {}
    }
    return value
  }

  /**
  * Remove cache by key
  */
  static async removeCache(key) {
    await cache.del(key)
  }
}
module.exports = Cache