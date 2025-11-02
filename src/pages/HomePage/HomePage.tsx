import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { TabBar } from '@/components/layout/TabBar'
import { Hero } from '@/components/features/Hero'
import { MovieCarousel } from '@/components/features/MovieCarousel'
import { MovieGrid } from '@/components/features/MovieGrid'
import { ErrorMessage, ScrollToTop, PageTransition } from '@/components/common'
import { useMovies } from '@/hooks'
import { MovieCategory } from '@/types'
import { ROUTES } from '@/constants/routes.constants'
import styles from './HomePage.module.scss'

export const HomePage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Get category from URL params or default to NOW_PLAYING
  const getCategoryFromParams = (params: URLSearchParams): MovieCategory => {
    const categoryParam = params.get('category') as MovieCategory
    if (
      categoryParam === MovieCategory.NOW_PLAYING ||
      categoryParam === MovieCategory.TOP_RATED
    ) {
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

  // Handle tab change
  const handleTabChange = (category: MovieCategory) => {
    setActiveTab(category)
    navigate(`${ROUTES.HOME}?category=${category}`)
  }

  // Get popular movies for Hero section (always show Hero with popular movies)
  const { movies: heroMovies } = useMovies(MovieCategory.POPULAR)

  // Fetch movies for the active tab (Now Playing or Top Rated)
  const { movies: activeTabMovies, loading, error, refetch } = useMovies(activeTab)

  const {
    movies: upcomingMovies,
    loading: upcomingLoading,
    error: upcomingError,
    refetch: upcomingRefetch,
  } = useMovies(MovieCategory.UPCOMING)

  // Limit to 10 items for home page
  const displayedUpcomingMovies = upcomingMovies.slice(0, 12)

  // Get top 5 movies with backdrop images for Hero
  const heroTopMovies = heroMovies.slice(0, 5).filter(movie => movie.backdrop_path)

  // Show error state
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
        {heroTopMovies.length > 0 && <Hero movies={heroTopMovies} />}
        
        <Container>
          <main id="main-content">
            {/* Tab Bar */}
            <TabBar activeTab={activeTab} onTabChange={handleTabChange} />

            {/* Movie Carousel for Active Tab */}
            <MovieCarousel
              title={activeTab === MovieCategory.NOW_PLAYING ? 'Now Playing' : 'Top Rated'}
              movies={activeTabMovies}
              loading={loading}
            />

            {/* Upcoming Movies Section */}
            <div className={styles.page__upcoming}>
              <div className={styles.page__upcoming__header}>
                <h2 className={styles.page__upcoming__title}>Upcoming</h2>
                <button
                  className={styles.page__upcoming__viewMore}
                  aria-label="View more upcoming movies"
                  onClick={() => navigate(ROUTES.UPCOMING)}
                >
                  <div className={styles.page__upcoming__viewMore__content}>
                    <span className={styles.page__upcoming__viewMore__text}>View more</span>
                    <ChevronRight
                      className={styles.page__upcoming__viewMore__icon}
                      aria-hidden="true"
                    />
                  </div>
                </button>
              </div>
              {upcomingError ? (
                <div className={styles.page__upcoming__error}>
                  <ErrorMessage
                    message={upcomingError.message}
                    onRetry={upcomingRefetch}
                  />
                </div>
              ) : (
                <div className={styles.page__content}>
                  <MovieGrid
                    movies={displayedUpcomingMovies}
                    loading={upcomingLoading}
                    hasMore={false}
                    onLoadMore={() => {}}
                  />
                </div>
              )}
            </div>
          </main>
        </Container>

        <ScrollToTop />
      </div>
    </PageTransition>
  )
}

