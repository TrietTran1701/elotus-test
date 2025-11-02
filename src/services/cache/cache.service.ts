import { API_CONFIG } from '@/constants/api.constants'

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

class CacheService {
  private cache: Map<string, CacheEntry<unknown>>
  private cacheDuration: number

  constructor(cacheDuration: number = API_CONFIG.CACHE_DURATION) {
    this.cache = new Map()
    this.cacheDuration = cacheDuration
  }

  private isExpired(entry: CacheEntry<unknown>): boolean {
    return Date.now() > entry.expiresAt
  }

  private generateKey(baseKey: string, params?: Record<string, unknown>): string {
    if (!params) return baseKey

    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}:${String(params[key])}`)
      .join('|')

    return `${baseKey}:${sortedParams}`
  }

  get<T>(key: string, params?: Record<string, unknown>): T | null {
    const cacheKey = this.generateKey(key, params)
    const entry = this.cache.get(cacheKey)

    if (!entry) return null

    if (this.isExpired(entry)) {
      this.cache.delete(cacheKey)
      return null
    }

    return entry.data as T
  }

  set<T>(key: string, data: T, params?: Record<string, unknown>): void {
    const cacheKey = this.generateKey(key, params)
    const timestamp = Date.now()

    this.cache.set(cacheKey, {
      data,
      timestamp,
      expiresAt: timestamp + this.cacheDuration,
    })
  }

  has(key: string, params?: Record<string, unknown>): boolean {
    const cacheKey = this.generateKey(key, params)
    const entry = this.cache.get(cacheKey)

    if (!entry) return false

    if (this.isExpired(entry)) {
      this.cache.delete(cacheKey)
      return false
    }

    return true
  }

  invalidate(key: string, params?: Record<string, unknown>): void {
    const cacheKey = this.generateKey(key, params)
    this.cache.delete(cacheKey)
  }

  invalidateAll(): void {
    this.cache.clear()
  }

  invalidateByPrefix(prefix: string): void {
    const keys = Array.from(this.cache.keys())
    keys.forEach((key) => {
      if (key.startsWith(prefix)) {
        this.cache.delete(key)
      }
    })
  }

  // Get cache statistics
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }
}

// Export singleton instance
export const cacheService = new CacheService()
