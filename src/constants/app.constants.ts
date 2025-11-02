import { MovieCategory } from '@/types'

export const APP_CONFIG = {
  TITLE: import.meta.env.VITE_APP_TITLE || 'NitFlex',
  ITEMS_PER_PAGE: 20,
  MAX_CAST_DISPLAY: 10,
} as const

export const MOVIE_CATEGORIES = [
  {
    id: MovieCategory.NOW_PLAYING,
    label: 'Now Playing',
    value: MovieCategory.NOW_PLAYING,
  },
  // {
  //   id: MovieCategory.POPULAR,
  //   label: 'Popular',
  //   value: MovieCategory.POPULAR,
  // },
  {
    id: MovieCategory.TOP_RATED,
    label: 'Top Rated',
    value: MovieCategory.TOP_RATED,
  },
  {
    id: MovieCategory.UPCOMING,
    label: 'Upcoming',
    value: MovieCategory.UPCOMING,
  },
] as const

export const DEFAULT_POSTER = '/poster-placeholder.png'
export const DEFAULT_BACKDROP = '/backdrop-placeholder.png'

