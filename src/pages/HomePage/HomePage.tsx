import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Container } from '@/components/layout/Container'
import { MovieGrid } from '@/components/features/MovieGrid'
import { ErrorMessage } from '@/components/common'
import { useMovies } from '@/hooks/useMovies'
import { MovieCategory, ViewMode } from '@/types'
import styles from './HomePage.module.scss'

export const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [viewMode] = useState<ViewMode>(ViewMode.GRID)

  // Get category from URL params or default to NOW_PLAYING
  const getCategoryFromParams = (params: URLSearchParams): MovieCategory => {
    const categoryParam = params.get('category') as MovieCategory
    if (categoryParam && Object.values(MovieCategory).includes(categoryParam)) {
      return categoryParam
    }
    return MovieCategory.NOW_PLAYING
  }

  const [activeTab, setActiveTab] = useState<MovieCategory>(() =>
    getCategoryFromParams(searchParams)
  )

  // Update activeTab when URL params change
  useEffect(() => {
    const category = getCategoryFromParams(searchParams)
    setActiveTab(category)
  }, [searchParams])

  const { movies, loading, error, hasMore, loadMore, refetch } = useMovies(activeTab)

  if (error) {
    return (
      <Container>
        <div className={styles.page__error}>
          <ErrorMessage message={error.message} onRetry={refetch} />
        </div>
      </Container>
    )
  }

  return (
    <div className={styles.page}>
      <Container>
        <div className={styles.page__content}>
          {viewMode === ViewMode.GRID ? (
            <MovieGrid movies={movies} loading={loading} hasMore={hasMore} onLoadMore={loadMore} />
          ) : (
            <MovieGrid movies={movies} loading={loading} hasMore={hasMore} onLoadMore={loadMore} />
          )}
        </div>
      </Container>
    </div>
  )
}

