import { useState } from 'react'
import { Container } from '@/components/layout/Container'
import { TabBar } from '@/components/layout/TabBar'
import { MovieGrid } from '@/components/features/MovieGrid'
import { ErrorMessage } from '@/components/common'
import { useMovies } from '@/hooks/useMovies'
import { MovieCategory, ViewMode } from '@/types'
import styles from './HomePage.module.scss'

export const HomePage = () => {
  const [activeTab, setActiveTab] = useState<MovieCategory>(MovieCategory.NOW_PLAYING)
  const [viewMode] = useState<ViewMode>(ViewMode.GRID)

  const { movies, loading, error, hasMore, loadMore, refetch } = useMovies(activeTab)

  const handleTabChange = (tab: MovieCategory) => {
    setActiveTab(tab)
  }

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
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />

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

