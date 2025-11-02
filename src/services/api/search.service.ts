import { apiClient } from './client'
import { cacheService } from '../cache/cache.service'
import { ApiEndpoint } from '@/types/api.types'
import type { SearchResponse } from '@/types/movie.types'
import type { SearchParams } from '@/types/common.types'

class SearchService {
  private readonly CACHE_KEY_SEARCH = 'search:movies'

  async searchMovies(params: SearchParams, signal?: AbortSignal): Promise<SearchResponse> {
    // Don't cache empty queries
    if (!params.query.trim()) {
      return {
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0,
      }
    }

    // Check cache first
    const cacheKey = this.CACHE_KEY_SEARCH
    const cachedData = cacheService.get<SearchResponse>(
      cacheKey,
      params as unknown as Record<string, unknown>
    )

    if (cachedData) {
      return cachedData
    }

    // Fetch from API
    const data = await apiClient.get<SearchResponse>(ApiEndpoint.SEARCH_MOVIE, {
      params: {
        query: params.query,
        page: params.page,
        language: 'en-US',
        include_adult: 0,
      },
      signal,
    })

    // Cache the result
    cacheService.set(cacheKey, data, params as unknown as Record<string, unknown>)

    return data
  }

  // Invalidate search cache
  invalidateSearch(): void {
    cacheService.invalidateByPrefix(this.CACHE_KEY_SEARCH)
  }
}

// Export singleton instance
export const searchService = new SearchService()
