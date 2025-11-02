import { apiClient } from './client'
import { cacheService } from '../cache/cache.service'
import { ApiEndpoint } from '@/types/api.types'
import type { Movie, MovieDetails, MovieListResponse } from '@/types/movie.types'
import type { PaginationParams } from '@/types/common.types'

class MoviesService {
  private readonly CACHE_KEY_NOW_PLAYING = 'movies:now_playing'
  private readonly CACHE_KEY_POPULAR = 'movies:popular'
  private readonly CACHE_KEY_TOP_RATED = 'movies:top_rated'
  private readonly CACHE_KEY_UPCOMING = 'movies:upcoming'
  private readonly CACHE_KEY_MOVIE_DETAIL = 'movies:detail'

  async getNowPlaying(
    params: PaginationParams = { page: 1 },
    signal?: AbortSignal
  ): Promise<MovieListResponse> {
    // Check cache first
    const cacheKey = this.CACHE_KEY_NOW_PLAYING
    const cachedData = cacheService.get<MovieListResponse>(
      cacheKey,
      params as unknown as Record<string, unknown>
    )

    if (cachedData) {
      return cachedData
    }

    // Fetch from API
    const data = await apiClient.get<MovieListResponse>(ApiEndpoint.NOW_PLAYING, {
      params: {
        page: params.page,
        language: 'en-US',
      },
      signal,
    })

    // Cache the result
    cacheService.set(cacheKey, data, params as unknown as Record<string, unknown>)

    return data
  }

  async getPopular(
    params: PaginationParams = { page: 1 },
    signal?: AbortSignal
  ): Promise<MovieListResponse> {
    // Check cache first
    const cacheKey = this.CACHE_KEY_POPULAR
    const cachedData = cacheService.get<MovieListResponse>(
      cacheKey,
      params as unknown as Record<string, unknown>
    )

    if (cachedData) {
      return cachedData
    }

    // Fetch from API
    const data = await apiClient.get<MovieListResponse>(ApiEndpoint.POPULAR, {
      params: {
        page: params.page,
        language: 'en-US',
      },
      signal,
    })

    // Cache the result
    cacheService.set(cacheKey, data, params as unknown as Record<string, unknown>)

    return data
  }

  async getTopRated(
    params: PaginationParams = { page: 1 },
    signal?: AbortSignal
  ): Promise<MovieListResponse> {
    // Check cache first
    const cacheKey = this.CACHE_KEY_TOP_RATED
    const cachedData = cacheService.get<MovieListResponse>(
      cacheKey,
      params as unknown as Record<string, unknown>
    )

    if (cachedData) {
      return cachedData
    }

    // Fetch from API
    const data = await apiClient.get<MovieListResponse>(ApiEndpoint.TOP_RATED, {
      params: {
        page: params.page,
        language: 'en-US',
      },
      signal,
    })

    // Cache the result
    cacheService.set(cacheKey, data, params as unknown as Record<string, unknown>)

    return data
  }

  async getUpcoming(
    params: PaginationParams = { page: 1 },
    signal?: AbortSignal
  ): Promise<MovieListResponse> {
    // Check cache first
    const cacheKey = this.CACHE_KEY_UPCOMING
    const cachedData = cacheService.get<MovieListResponse>(
      cacheKey,
      params as unknown as Record<string, unknown>
    )

    if (cachedData) {
      return cachedData
    }

    // Fetch from API
    const data = await apiClient.get<MovieListResponse>(ApiEndpoint.UPCOMING, {
      params: {
        page: params.page,
        language: 'en-US',
      },
      signal,
    })

    // Cache the result
    cacheService.set(cacheKey, data, params as unknown as Record<string, unknown>)

    return data
  }

  async getMovieDetails(movieId: number, signal?: AbortSignal): Promise<MovieDetails> {
    // Check cache first
    const cacheKey = this.CACHE_KEY_MOVIE_DETAIL
    const cachedData = cacheService.get<MovieDetails>(cacheKey, { movieId })

    if (cachedData) {
      return cachedData
    }

    // Fetch from API
    const data = await apiClient.get<MovieDetails>(`${ApiEndpoint.MOVIE_DETAIL}/${movieId}`, {
      params: {
        language: 'en-US',
        append_to_response: 'credits',
      },
      signal,
    })

    // Cache the result
    cacheService.set(cacheKey, data, { movieId })

    return data
  }

  // Helper to get poster URL
  getPosterURL(movie: Movie, size: string = 'w342'): string | null {
    return apiClient.getImageURL(movie.poster_path, size)
  }

  // Helper to get backdrop URL
  getBackdropURL(movie: Movie, size: string = 'w780'): string | null {
    return apiClient.getImageURL(movie.backdrop_path, size)
  }

  // Invalidate specific caches
  invalidateNowPlaying(): void {
    cacheService.invalidateByPrefix(this.CACHE_KEY_NOW_PLAYING)
  }

  invalidatePopular(): void {
    cacheService.invalidateByPrefix(this.CACHE_KEY_POPULAR)
  }

  invalidateTopRated(): void {
    cacheService.invalidateByPrefix(this.CACHE_KEY_TOP_RATED)
  }

  invalidateUpcoming(): void {
    cacheService.invalidateByPrefix(this.CACHE_KEY_UPCOMING)
  }

  invalidateMovieDetail(movieId: number): void {
    cacheService.invalidate(this.CACHE_KEY_MOVIE_DETAIL, { movieId })
  }

  invalidateAll(): void {
    cacheService.invalidateAll()
  }
}

// Export singleton instance
export const moviesService = new MoviesService()
