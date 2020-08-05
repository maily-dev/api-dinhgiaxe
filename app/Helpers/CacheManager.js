
'use strict'

const cacheManager = use('cache-manager')
const cache = cacheManager.caching({ store: 'memory', max: 0, ttl: 3600 * 7/* 1 = 1 seconds*/ })
class CacheManager {
  constructor(name) {
    this.name = name
    this.key = null
    this.tmp = {}
  }

  async saveCacheItem(data) {
    this.tmp[this.key] = data
    await cache.set(this.name, this.tmp)
  }


  async getCacheByKey(key) {
    this.key = key
    this.tmp = (await cache.get(this.name) || {})
    if (Object.keys(this.tmp).length <= 0) {
      return ''
    }
    return this.tmp[this.key]
  }


  async removeCache() {
    await cache.del(this.name)
  }
}
module.exports = CacheManager