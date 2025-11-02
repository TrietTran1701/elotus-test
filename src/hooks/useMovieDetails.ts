import { useState, useEffect, useCallback } from 'react'
import { moviesService } from '@/services'
import type { MovieDetails } from '@/types'
import type { LoadingState, ErrorState } from '@/types'

interface UseMovieDetailsResult {
  movie: MovieDetails | null
  loading: LoadingState
  error: ErrorState | null
  refetch: () => Promise<void>
}

export const useMovieDetails = (movieId: number): UseMovieDetailsResult => {
  const [movie, setMovie] = useState<MovieDetails | null>(null)
  const [loading, setLoading] = useState<LoadingState>('idle')
  const [error, setError] = useState<ErrorState | null>(null)

  const fetchMovieDetails = useCallback(async () => {
    try {
      setLoading('loading')
      setError(null)

      const controller = new AbortController()
      const data = await moviesService.getMovieDetails(movieId, controller.signal)

      if (controller.signal.aborted) return

      setMovie(data)
      setLoading('success')

      return () => controller.abort()
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch movie details'
      setError({ message: errorMessage })
      setLoading('error')
    }
  }, [movieId])

  useEffect(() => {
    const controller = new AbortController()
    void fetchMovieDetails()

    return () => {
      controller.abort()
    }
  }, [fetchMovieDetails])

  return {
    movie,
    loading,
    error,
    refetch: fetchMovieDetails,
  }
}

