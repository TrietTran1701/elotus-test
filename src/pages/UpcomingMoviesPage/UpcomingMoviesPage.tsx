import { useState } from 'react'
import { Container } from '@/components/layout/Container'
import { MovieGrid } from '@/components/features/MovieGrid'
import { MovieList } from '@/components/features/MovieList'
import { ErrorMessage, ScrollToTop, PageTransition, ViewModeToggle, type ViewMode } from '@/components/common'
import { useMovies } from '@/hooks'
import { MovieCategory } from '@/types'
import styles from './UpcomingMoviesPage.module.scss'

export const UpcomingMoviesPage = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  
  const {
    movies: upcomingMovies,
    loading,
    error,
    hasMore,
    loadMore,
    refetch,
  } = useMovies(MovieCategory.UPCOMING)

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
                    onLoadMore={loadMore}
                  />
                ) : (
                  <MovieList
                    movies={upcomingMovies}
                    loading={loading}
                    hasMore={hasMore}
                    onLoadMore={loadMore}
                  />
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

