import { useState, useEffect, useCallback } from 'react'
import { moviesService } from '@/services'
import type { Movie, MovieListResponse } from '@/types'
import type { LoadingState, ErrorState, MovieCategory } from '@/types'

interface UseMoviesResult {
  movies: Movie[]
  loading: LoadingState
  error: ErrorState | null
  page: number
  totalPages: number
  hasMore: boolean
  fetchMovies: () => Promise<void>
  loadMore: () => Promise<void>
  refetch: () => Promise<void>
}

export const useMovies = (category: MovieCategory): UseMoviesResult => {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState<LoadingState>('idle')
  const [error, setError] = useState<ErrorState | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

  const fetchMovies = useCallback(
    async (pageNum: number = 1, signal?: AbortSignal) => {
      try {
        setLoading(pageNum === 1 ? 'loading' : 'success')
        setError(null)

        let response: MovieListResponse

        switch (category) {
          case 'now_playing':
            response = await moviesService.getNowPlaying({ page: pageNum }, signal)
            break
          case 'popular':
            response = await moviesService.getPopular({ page: pageNum }, signal)
            break
          case 'top_rated':
            response = await moviesService.getTopRated({ page: pageNum }, signal)
            break
          case 'upcoming':
            response = await moviesService.getUpcoming({ page: pageNum }, signal)
            break
          default:
            response = await moviesService.getNowPlaying({ page: pageNum }, signal)
        }

        if (signal?.aborted) return

        if (pageNum === 1) {
          setMovies(response.results)
        } else {
          setMovies((prev) => [...prev, ...response.results])
        }

        setPage(pageNum)
        setTotalPages(response.total_pages)
        setLoading('success')
      } catch (err) {
        if (signal?.aborted) return
        
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch movies'
        setError({ message: errorMessage })
        setLoading('error')
      }
    },
    [category]
  )

  const loadMore = useCallback(async () => {
    if (page < totalPages && loading !== 'loading') {
      await fetchMovies(page + 1)
    }
  }, [page, totalPages, loading, fetchMovies])

  const refetch = useCallback(async () => {
    setMovies([])
    setPage(1)
    await fetchMovies(1)
  }, [fetchMovies])

  useEffect(() => {
    const controller = new AbortController()
    void fetchMovies(1, controller.signal)

    return () => {
      controller.abort()
    }
  }, [fetchMovies])

  return {
    movies,
    loading,
    error,
    page,
    totalPages,
    hasMore: page < totalPages,
    fetchMovies: () => fetchMovies(1),
    loadMore,
    refetch,
  }
}

