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
