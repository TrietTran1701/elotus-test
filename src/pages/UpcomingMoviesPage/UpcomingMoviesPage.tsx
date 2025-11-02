import { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { Container } from '@/components/layout/Container'
import { MovieGrid } from '@/components/features/MovieGrid'
import { MovieList } from '@/components/features/MovieList'
import { ErrorMessage, ScrollToTop, PageTransition, ViewModeToggle, type ViewMode } from '@/components/common'
import { useMovies } from '@/hooks'
import { MovieCategory } from '@/types'
import styles from './UpcomingMoviesPage.module.scss'

export const UpcomingMoviesPage = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const location = useLocation()

  // Scroll to top when page loads or route changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])
  
  const {
    movies: upcomingMovies,
    loading,
    error,
    hasMore,
    loadMore,
    refetch,
  } = useMovies(MovieCategory.UPCOMING)

  // Infinite scroll: load more when scrolling near the bottom
  const handleScroll = useCallback(() => {
    // Check if we're near the bottom (within 200px)
    const scrollPosition = window.innerHeight + window.scrollY
    const documentHeight = document.documentElement.scrollHeight
    const threshold = 200

    if (
      scrollPosition >= documentHeight - threshold &&
      hasMore &&
      loading !== 'loading'
    ) {
      loadMore()
    }
  }, [hasMore, loading, loadMore])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  return (
    <PageTransition>
      <div className={styles.page}>
        <Container>
          <main id="main-content">
            <div className={styles.page__header}>
              <h1 className={styles.page__title}>Upcoming Movies</h1>
              <ViewModeToggle
                value={viewMode}
                onChange={setViewMode}
                className={styles.page__viewToggle}
              />
            </div>

            {error ? (
              <div className={styles.page__error}>
                <ErrorMessage message={error.message} onRetry={refetch} />
              </div>
            ) : (
              <div className={styles.page__content}>
                {viewMode === 'grid' ? (
                  <MovieGrid
                    movies={upcomingMovies}
                    loading={loading}
                    hasMore={hasMore}
                    onLoadMore={() => {}} // Empty function, infinite scroll handles loading
                    hideLoadMore={true}
                  />
                ) : (
                  <MovieList
                    movies={upcomingMovies}
                    loading={loading}
                    hasMore={hasMore}
                    onLoadMore={() => {}} // Empty function, infinite scroll handles loading
                    hideLoadMore={true}
                  />
                )}
                {loading === 'loading' && upcomingMovies.length > 0 && (
                  <div className={styles.page__loading}>
                    <p>Loading more movies...</p>
                  </div>
                )}
              </div>
            )}
          </main>
        </Container>

        <ScrollToTop />
      </div>
    </PageTransition>
  )
}

