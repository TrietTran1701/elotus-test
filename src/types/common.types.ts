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
  POPULAR = 'popular',
  TOP_RATED = 'top_rated',
  UPCOMING = 'upcoming',
}

export interface PaginationParams {
  page: number
}

export interface SearchParams extends PaginationParams {
  query: string
}
