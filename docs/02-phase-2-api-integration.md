# Phase 2: API Integration & Core Services

**Duration**: 4-5 hours  
**Difficulty**: Medium  
**Prerequisites**: Phase 1 completed, TMDB API key obtained

## Overview

This phase focuses on building a robust API layer for communicating with The Movie Database (TMDB) API. We'll implement proper error handling, request/response transformation, and a simple caching mechanism.

## Objectives

- [ ] Obtain TMDB API key
- [ ] Create base API client with Fetch
- [ ] Implement movies service (Now Playing, Top Rated)
- [ ] Implement search service
- [ ] Create TypeScript types for API responses
- [ ] Implement error handling
- [ ] Create simple caching service
- [ ] Test API integration

## Step-by-Step Instructions

### Step 1: Obtain TMDB API Key

1. Go to [The Movie Database](https://www.themoviedb.org/)
2. Create an account (if you don't have one)
3. Navigate to Settings > API
4. Request an API key (choose "Developer" option)
5. Copy your API key
6. Add it to `.env.local`:

```bash
VITE_TMDB_API_KEY=your_actual_api_key_here
```

### Step 2: Create API Type Definitions

Create `src/types/movie.types.ts`:

```typescript
export interface Movie {
  id: number
  title: string
  original_title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  popularity: number
  adult: boolean
  genre_ids: number[]
  original_language: string
  video: boolean
}

export interface MovieDetails extends Movie {
  runtime: number | null
  budget: number
  revenue: number
  homepage: string | null
  imdb_id: string | null
  genres: Genre[]
  production_companies: ProductionCompany[]
  production_countries: ProductionCountry[]
  spoken_languages: SpokenLanguage[]
  status: string
  tagline: string | null
  credits?: Credits
}

export interface Genre {
  id: number
  name: string
}

export interface ProductionCompany {
  id: number
  name: string
  logo_path: string | null
  origin_country: string
}

export interface ProductionCountry {
  iso_3166_1: string
  name: string
}

export interface SpokenLanguage {
  english_name: string
  iso_639_1: string
  name: string
}

export interface Credits {
  cast: CastMember[]
  crew: CrewMember[]
}

export interface CastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
  order: number
}

export interface CrewMember {
  id: number
  name: string
  job: string
  department: string
  profile_path: string | null
}

export interface MovieListResponse {
  page: number
  results: Movie[]
  total_pages: number
  total_results: number
}

export interface SearchResponse extends MovieListResponse {}
```

Create `src/types/api.types.ts`:

```typescript
export interface ApiError {
  status_code: number
  status_message: string
  success: boolean
}

export interface ApiResponse<T> {
  data: T | null
  error: ApiError | null
  success: boolean
}

export enum ApiEndpoint {
  NOW_PLAYING = '/movie/now_playing',
  TOP_RATED = '/movie/top_rated',
  MOVIE_DETAIL = '/movie',
  SEARCH_MOVIE = '/search/movie',
}

export interface ApiRequestConfig {
  params?: Record<string, string | number>
  signal?: AbortSignal
}
```

Create `src/types/common.types.ts`:

```typescript
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface ErrorState {
  message: string
  code?: string | number
  details?: unknown
}

export enum ViewMode {
  LIST = 'list',
  GRID = 'grid',
}

export enum MovieCategory {
  NOW_PLAYING = 'now_playing',
  TOP_RATED = 'top_rated',
}

export interface PaginationParams {
  page: number
}

export interface SearchParams extends PaginationParams {
  query: string
}
```

### Step 3: Create API Constants

Create `src/constants/api.constants.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_TMDB_BASE_URL,
  API_KEY: import.meta.env.VITE_TMDB_API_KEY,
  IMAGE_BASE_URL: import.meta.env.VITE_TMDB_IMAGE_BASE_URL,
  TIMEOUT: 10000, // 10 seconds
  CACHE_DURATION: parseInt(import.meta.env.VITE_CACHE_DURATION || '300000', 10), // 5 minutes
} as const

export const IMAGE_SIZES = {
  POSTER: {
    SMALL: 'w185',
    MEDIUM: 'w342',
    LARGE: 'w500',
    ORIGINAL: 'original',
  },
  BACKDROP: {
    SMALL: 'w300',
    MEDIUM: 'w780',
    LARGE: 'w1280',
    ORIGINAL: 'original',
  },
  PROFILE: {
    SMALL: 'w45',
    MEDIUM: 'w185',
    LARGE: 'h632',
    ORIGINAL: 'original',
  },
} as const

export const API_ERRORS = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  NOT_FOUND: 'Resource not found.',
  UNAUTHORIZED: 'Invalid API key.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNKNOWN_ERROR: 'An unknown error occurred.',
  RATE_LIMIT: 'Too many requests. Please try again later.',
} as const
```

### Step 4: Create Base API Client

Create `src/services/api/client.ts`:

```typescript
import { API_CONFIG, API_ERRORS } from '@/constants/api.constants'
import type { ApiError, ApiRequestConfig } from '@/types/api.types'

class ApiClient {
  private baseURL: string
  private apiKey: string
  private timeout: number

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL
    this.apiKey = API_CONFIG.API_KEY
    this.timeout = API_CONFIG.TIMEOUT

    // Validate configuration
    if (!this.apiKey) {
      throw new Error('TMDB API key is not configured')
    }
  }

  private buildURL(endpoint: string, params?: Record<string, string | number>): string {
    const url = new URL(`${this.baseURL}${endpoint}`)
    
    // Add API key
    url.searchParams.append('api_key', this.apiKey)
    
    // Add additional parameters
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value))
      })
    }
    
    return url.toString()
  }

  private async fetchWithTimeout(
    url: string,
    config?: ApiRequestConfig
  ): Promise<Response> {
    const controller = new AbortController()
    const signal = config?.signal || controller.signal

    const timeoutId = setTimeout(() => {
      controller.abort()
    }, this.timeout)

    try {
      const response = await fetch(url, { signal })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(API_ERRORS.TIMEOUT_ERROR)
      }
      
      throw error
    }
  }

  private handleError(error: unknown): ApiError {
    if (error instanceof Error) {
      // Network errors
      if (error.message === API_ERRORS.TIMEOUT_ERROR) {
        return {
          status_code: 408,
          status_message: API_ERRORS.TIMEOUT_ERROR,
          success: false,
        }
      }

      if (error.message.includes('Failed to fetch')) {
        return {
          status_code: 0,
          status_message: API_ERRORS.NETWORK_ERROR,
          success: false,
        }
      }

      return {
        status_code: 500,
        status_message: error.message || API_ERRORS.UNKNOWN_ERROR,
        success: false,
      }
    }

    return {
      status_code: 500,
      status_message: API_ERRORS.UNKNOWN_ERROR,
      success: false,
    }
  }

  async get<T>(endpoint: string, config?: ApiRequestConfig): Promise<T> {
    try {
      const url = this.buildURL(endpoint, config?.params)
      const response = await this.fetchWithTimeout(url, config)

      // Handle HTTP errors
      if (!response.ok) {
        const errorData = (await response.json()) as ApiError
        
        let errorMessage = API_ERRORS.UNKNOWN_ERROR

        switch (response.status) {
          case 401:
            errorMessage = API_ERRORS.UNAUTHORIZED
            break
          case 404:
            errorMessage = API_ERRORS.NOT_FOUND
            break
          case 429:
            errorMessage = API_ERRORS.RATE_LIMIT
            break
          case 500:
          case 502:
          case 503:
          case 504:
            errorMessage = API_ERRORS.SERVER_ERROR
            break
          default:
            errorMessage = errorData.status_message || API_ERRORS.UNKNOWN_ERROR
        }

        throw new Error(errorMessage)
      }

      const data = (await response.json()) as T
      return data
    } catch (error) {
      const apiError = this.handleError(error)
      throw new Error(apiError.status_message)
    }
  }

  // Build image URL helper
  getImageURL(path: string | null, size: string = 'original'): string | null {
    if (!path) return null
    return `${API_CONFIG.IMAGE_BASE_URL}/${size}${path}`
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
```

### Step 5: Create Cache Service

Create `src/services/cache/cache.service.ts`:

```typescript
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
```

### Step 6: Create Movies Service

Create `src/services/api/movies.service.ts`:

```typescript
import { apiClient } from './client'
import { cacheService } from '../cache/cache.service'
import { ApiEndpoint } from '@/types/api.types'
import type { Movie, MovieDetails, MovieListResponse } from '@/types/movie.types'
import type { PaginationParams } from '@/types/common.types'

class MoviesService {
  private readonly CACHE_KEY_NOW_PLAYING = 'movies:now_playing'
  private readonly CACHE_KEY_TOP_RATED = 'movies:top_rated'
  private readonly CACHE_KEY_MOVIE_DETAIL = 'movies:detail'

  async getNowPlaying(
    params: PaginationParams = { page: 1 },
    signal?: AbortSignal
  ): Promise<MovieListResponse> {
    // Check cache first
    const cacheKey = this.CACHE_KEY_NOW_PLAYING
    const cachedData = cacheService.get<MovieListResponse>(cacheKey, params)

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
    cacheService.set(cacheKey, data, params)

    return data
  }

  async getTopRated(
    params: PaginationParams = { page: 1 },
    signal?: AbortSignal
  ): Promise<MovieListResponse> {
    // Check cache first
    const cacheKey = this.CACHE_KEY_TOP_RATED
    const cachedData = cacheService.get<MovieListResponse>(cacheKey, params)

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
    cacheService.set(cacheKey, data, params)

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

  invalidateTopRated(): void {
    cacheService.invalidateByPrefix(this.CACHE_KEY_TOP_RATED)
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
```

### Step 7: Create Search Service

Create `src/services/api/search.service.ts`:

```typescript
import { apiClient } from './client'
import { cacheService } from '../cache/cache.service'
import { ApiEndpoint } from '@/types/api.types'
import type { SearchResponse } from '@/types/movie.types'
import type { SearchParams } from '@/types/common.types'

class SearchService {
  private readonly CACHE_KEY_SEARCH = 'search:movies'

  async searchMovies(
    params: SearchParams,
    signal?: AbortSignal
  ): Promise<SearchResponse> {
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
    const cachedData = cacheService.get<SearchResponse>(cacheKey, params)

    if (cachedData) {
      return cachedData
    }

    // Fetch from API
    const data = await apiClient.get<SearchResponse>(ApiEndpoint.SEARCH_MOVIE, {
      params: {
        query: params.query,
        page: params.page,
        language: 'en-US',
        include_adult: false,
      },
      signal,
    })

    // Cache the result
    cacheService.set(cacheKey, data, params)

    return data
  }

  // Invalidate search cache
  invalidateSearch(): void {
    cacheService.invalidateByPrefix(this.CACHE_KEY_SEARCH)
  }
}

// Export singleton instance
export const searchService = new SearchService()
```

### Step 8: Create Utility Helpers

Create `src/utils/formatters.ts`:

```typescript
export const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A'
  
  const date = new Date(dateString)
  
  if (isNaN(date.getTime())) return 'Invalid Date'
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const formatYear = (dateString: string): string => {
  if (!dateString) return 'N/A'
  
  const date = new Date(dateString)
  
  if (isNaN(date.getTime())) return 'N/A'
  
  return date.getFullYear().toString()
}

export const formatRating = (rating: number): string => {
  return rating.toFixed(1)
}

export const formatRuntime = (minutes: number | null): string => {
  if (!minutes) return 'N/A'
  
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  
  return `${hours}h ${mins}m`
}

export const formatCurrency = (amount: number): string => {
  if (!amount) return 'N/A'
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num)
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trim()}...`
}
```

### Step 9: Create Index Files for Easy Imports

Create `src/services/index.ts`:

```typescript
export { apiClient } from './api/client'
export { moviesService } from './api/movies.service'
export { searchService } from './api/search.service'
export { cacheService } from './cache/cache.service'
```

Create `src/types/index.ts`:

```typescript
export type * from './movie.types'
export type * from './api.types'
export type * from './common.types'
export { ApiEndpoint, ViewMode, MovieCategory } from './api.types'
```

### Step 10: Create Test File to Verify API Integration

Create `src/test-api.ts` (temporary file for testing):

```typescript
import { moviesService, searchService } from './services'

async function testAPI() {
  console.log('🎬 Testing TMDB API Integration...\n')

  try {
    // Test Now Playing
    console.log('📺 Fetching Now Playing movies...')
    const nowPlaying = await moviesService.getNowPlaying({ page: 1 })
    console.log(`✅ Success! Found ${nowPlaying.results.length} movies`)
    console.log(`First movie: ${nowPlaying.results[0]?.title}\n`)

    // Test Top Rated
    console.log('⭐ Fetching Top Rated movies...')
    const topRated = await moviesService.getTopRated({ page: 1 })
    console.log(`✅ Success! Found ${topRated.results.length} movies`)
    console.log(`First movie: ${topRated.results[0]?.title}\n`)

    // Test Movie Details
    console.log('🎥 Fetching Movie Details...')
    const movieId = nowPlaying.results[0]?.id
    if (movieId) {
      const details = await moviesService.getMovieDetails(movieId)
      console.log(`✅ Success! Movie: ${details.title}`)
      console.log(`Runtime: ${details.runtime} minutes`)
      console.log(`Genres: ${details.genres.map((g) => g.name).join(', ')}\n`)
    }

    // Test Search
    console.log('🔍 Searching for "Inception"...')
    const searchResults = await searchService.searchMovies({ query: 'Inception', page: 1 })
    console.log(`✅ Success! Found ${searchResults.results.length} results`)
    console.log(`First result: ${searchResults.results[0]?.title}\n`)

    // Test Cache
    console.log('💾 Testing Cache...')
    const cachedNowPlaying = await moviesService.getNowPlaying({ page: 1 })
    console.log(`✅ Cache working! Retrieved ${cachedNowPlaying.results.length} movies from cache\n`)

    console.log('🎉 All API tests passed!')
  } catch (error) {
    console.error('❌ API test failed:', error)
  }
}

// Run tests
testAPI()
```

Update `src/main.tsx` temporarily to run the test:

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './test-api' // Import test file

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div>Testing API...</div>
  </StrictMode>,
)
```

### Step 11: Run and Verify API Integration

```bash
# Start dev server
npm run dev

# Check browser console for test results
# You should see successful API calls
```

### Step 12: Clean Up Test Files

After verifying API works, remove test files:

```bash
rm src/test-api.ts
```

Restore `src/main.tsx` to original state (will be updated in next phase).

## Verification Checklist

- [ ] API client successfully connects to TMDB
- [ ] Now Playing endpoint returns data
- [ ] Top Rated endpoint returns data
- [ ] Movie Details endpoint returns data
- [ ] Search endpoint returns data
- [ ] Cache service stores and retrieves data
- [ ] Error handling works correctly
- [ ] TypeScript types are correctly defined
- [ ] Image URLs are correctly generated

## Common Issues & Solutions

### Issue 1: "Invalid API key" Error
**Solution**: 
- Verify API key is correct in `.env.local`
- Restart dev server after updating `.env.local`
- Ensure API key is activated on TMDB website

### Issue 2: CORS Errors
**Solution**: TMDB API should not have CORS issues. If you see them:
- Check your browser extensions (ad blockers)
- Verify you're using the correct base URL

### Issue 3: TypeScript Errors on API Responses
**Solution**: 
- Verify types match TMDB API documentation
- Use unknown type temporarily and log the response to see actual structure

### Issue 4: Cache Not Working
**Solution**:
- Check browser console for cache statistics
- Verify cache duration is set correctly
- Clear cache manually using `cacheService.invalidateAll()`

## API Response Examples

### Now Playing Response
```json
{
  "page": 1,
  "results": [
    {
      "id": 123,
      "title": "Movie Title",
      "overview": "Movie description...",
      "poster_path": "/path-to-poster.jpg",
      "release_date": "2024-01-01",
      "vote_average": 7.5
    }
  ],
  "total_pages": 100,
  "total_results": 2000
}
```

## Next Steps

Proceed to **Phase 3: Basic UI Components & Layout** where we'll:
- Create reusable UI components
- Build layout structure
- Implement design system
- Create component library

## Resources

- [TMDB API Documentation](https://developers.themoviedb.org/3)
- [Fetch API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

