import { useState, useEffect, useCallback } from 'react'
import { searchService } from '@/services'
import { useDebounce } from './useDebounce'
import type { Movie, SearchResponse } from '@/types'
import type { LoadingState, ErrorState } from '@/types'

interface UseSearchResult {
  query: string
  results: Movie[]
  loading: LoadingState
  error: ErrorState | null
  page: number
  totalPages: number
  hasMore: boolean
  setQuery: (query: string) => void
  loadMore: () => Promise<void>
  clearSearch: () => void
}

export const useSearch = (): UseSearchResult => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Movie[]>([])
  const [loading, setLoading] = useState<LoadingState>('idle')
  const [error, setError] = useState<ErrorState | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

  const debouncedQuery = useDebounce(query, 500)

  const searchMovies = useCallback(
    async (searchQuery: string, pageNum: number = 1) => {
      if (!searchQuery.trim()) {
        setResults([])
        setLoading('idle')
        setError(null)
        return
      }

      try {
        setLoading(pageNum === 1 ? 'loading' : 'success')
        setError(null)

        const controller = new AbortController()
        const response: SearchResponse = await searchService.searchMovies(
          { query: searchQuery, page: pageNum },
          controller.signal
        )

        if (pageNum === 1) {
          setResults(response.results)
        } else {
          setResults((prev) => [...prev, ...response.results])
        }

        setPage(pageNum)
        setTotalPages(response.total_pages)
        setLoading('success')

        return () => controller.abort()
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }
        const errorMessage = err instanceof Error ? err.message : 'Search failed'
        setError({ message: errorMessage })
        setLoading('error')
      }
    },
    []
  )

  const loadMore = useCallback(async () => {
    if (page < totalPages && loading !== 'loading' && debouncedQuery) {
      await searchMovies(debouncedQuery, page + 1)
    }
  }, [page, totalPages, loading, debouncedQuery, searchMovies])

  const clearSearch = useCallback(() => {
    setQuery('')
    setResults([])
    setPage(1)
    setTotalPages(0)
    setLoading('idle')
    setError(null)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    
    if (debouncedQuery) {
      void searchMovies(debouncedQuery, 1)
    } else {
      setResults([])
      setLoading('idle')
      setPage(1)
      setTotalPages(0)
    }

    return () => {
      controller.abort()
    }
  }, [debouncedQuery, searchMovies])

  return {
    query,
    results,
    loading,
    error,
    page,
    totalPages,
    hasMore: page < totalPages,
    setQuery,
    loadMore,
    clearSearch,
  }
}

