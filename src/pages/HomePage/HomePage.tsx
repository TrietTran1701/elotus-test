import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Container } from '@/components/layout/Container'
import { Hero } from '@/components/features/Hero'
import { MovieGrid } from '@/components/features/MovieGrid'
import { ErrorMessage, ScrollToTop, PageTransition } from '@/components/common'
import { useMovies } from '@/hooks'
import { MovieCategory, ViewMode } from '@/types'
import styles from './HomePage.module.scss'

export const HomePage = () => {
  const [searchParams] = useSearchParams()
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

  // Get now_playing movies for Hero section (only show Hero for now_playing category)
  const showHero = activeTab === MovieCategory.NOW_PLAYING
  const { movies: heroMovies } = useMovies(MovieCategory.NOW_PLAYING)
  const { movies, loading, error, hasMore, loadMore, refetch } = useMovies(activeTab)

  // Get top 5 movies with backdrop images for Hero
  const heroTopMovies = showHero 
    ? heroMovies.slice(0, 5).filter(movie => movie.backdrop_path) 
    : []

  // Only show regular movies (no search results on HomePage)
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
    <PageTransition>
      <div className={styles.page}>
        {showHero && heroTopMovies.length > 0 && <Hero movies={heroTopMovies} />}
        
        <Container>
          <main id="main-content">
            <div className={`${styles.page__content} ${showHero && heroTopMovies.length > 0 ? styles['page__content--with-hero'] : ''}`}>
              {viewMode === ViewMode.GRID ? (
                <MovieGrid movies={movies} loading={loading} hasMore={hasMore} onLoadMore={loadMore} />
              ) : (
                <MovieGrid movies={movies} loading={loading} hasMore={hasMore} onLoadMore={loadMore} />
              )}
            </div>
          </main>
        </Container>

        <ScrollToTop />
      </div>
    </PageTransition>
  )
}

