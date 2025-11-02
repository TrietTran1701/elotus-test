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
  POPULAR = '/movie/popular',
  TOP_RATED = '/movie/top_rated',
  UPCOMING = '/movie/upcoming',
  MOVIE_DETAIL = '/movie',
  SEARCH_MOVIE = '/search/movie',
}

export interface ApiRequestConfig {
  params?: Record<string, string | number>
  signal?: AbortSignal
}
