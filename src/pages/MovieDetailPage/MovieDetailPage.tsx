import { useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Container } from '@/components/layout/Container'
import { Button, LazyImage, Loader, ErrorMessage } from '@/components/common'
import { MovieGrid } from '@/components/features/MovieGrid'
import { CastMember } from '@/components/features/CastMember'
import { useMovieDetails, useSearch } from '@/hooks'
import { moviesService } from '@/services'
import { IMAGE_SIZES } from '@/constants/api.constants'
import { APP_CONFIG } from '@/constants/app.constants'
import { ROUTES } from '@/constants/routes.constants'
import {
  formatDate,
  formatRuntime,
  formatCurrency,
  formatRating,
} from '@/utils/formatters'
import styles from './MovieDetailPage.module.scss'

export const MovieDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const movieId = parseInt(id || '0', 10)

  // Get search query from URL params
  const searchQueryFromUrl = searchParams.get('search') || ''

  // Initialize search hook
  const {
    query: searchQuery,
    results: searchResults,
    loading: searchLoading,
    error: searchError,
    hasMore: searchHasMore,
    setQuery: setSearchQuery,
    loadMore: searchLoadMore,
    clearSearch,
  } = useSearch()

  // Sync search query with URL
  useEffect(() => {
    if (searchQueryFromUrl !== searchQuery) {
      setSearchQuery(searchQueryFromUrl)
    }
  }, [searchQueryFromUrl, searchQuery, setSearchQuery])

  const { movie, loading, error, refetch } = useMovieDetails(movieId)

  // If there's a search query, show search results instead of movie details
  const isSearchActive = searchQuery.trim().length > 0

  // Handle back navigation - go to home page when on search results, otherwise use browser history
  const handleBack = () => {
    if (isSearchActive) {
      // Navigate to home page when on search results
      navigate(ROUTES.HOME)
    } else {
      // Use browser history for normal navigation
      navigate(-1)
    }
  }

  // Show search results if search is active
  if (isSearchActive) {
    if (searchError) {
      return (
        <Container>
          <div className={styles.page__error}>
            <ErrorMessage
              message={searchError.message}
              onRetry={() => {
                clearSearch()
                const newParams = new URLSearchParams(searchParams)
                newParams.delete('search')
                navigate(`/movie/${movieId}`, { replace: true })
              }}
            />
          </div>
        </Container>
      )
    }

    return (
      <div className={styles.page}>
        <Container>
          <div className={styles.page__nav}>
            <Button variant="ghost" onClick={handleBack}>
              ← Back
            </Button>
          </div>

          <div className={styles.page__search}>
            <div className={styles.page__search__info}>
              <p>
                {searchResults.length > 0
                  ? `Found ${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} for "${searchQuery}"`
                  : searchLoading === 'loading'
                  ? 'Searching...'
                  : `No results found for "${searchQuery}"`}
              </p>
            </div>
          </div>

          <MovieGrid
            movies={searchResults}
            loading={searchLoading}
            hasMore={searchHasMore}
            onLoadMore={searchLoadMore}
          />
        </Container>
      </div>
    )
  }

  // Show movie details if no search is active
  if (loading === 'loading' || !movie) {
    return <Loader fullScreen message="Loading movie details..." />
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

  const backdropUrl = moviesService.getBackdropURL(movie, IMAGE_SIZES.BACKDROP.LARGE)
  const posterUrl = moviesService.getPosterURL(movie, IMAGE_SIZES.POSTER.LARGE)

  const displayedCast = movie.credits?.cast.slice(0, APP_CONFIG.MAX_CAST_DISPLAY) || []

  return (
    <div className={styles.page}>
      {/* Backdrop */}
      {backdropUrl && (
        <div className={styles.page__backdrop}>
          <img src={backdropUrl} alt="" className={styles.page__backdrop__image} />
          <div className={styles.page__backdrop__overlay} />
        </div>
      )}

      <Container>
        {/* Back Button */}
        <div className={styles.page__nav}>
          <Button variant="ghost" onClick={handleBack}>
            ← Back
          </Button>
        </div>

        {/* Main Content */}
        <div className={styles.page__content}>
          {/* Poster */}
          <div className={styles.page__poster}>
            <LazyImage src={posterUrl} alt={movie.title} aspectRatio="2/3" />
          </div>

          {/* Info */}
          <div className={styles.page__info}>
            <h1 className={styles.page__title}>{movie.title}</h1>

            {movie.tagline && <p className={styles.page__tagline}>{movie.tagline}</p>}

            {/* Meta Info */}
            <div className={styles.page__meta}>
              <div className={styles.page__meta__item}>
                <span className={styles.page__meta__icon}>⭐</span>
                <span>{formatRating(movie.vote_average)}</span>
                <span className={styles.page__meta__label}>
                  ({movie.vote_count} votes)
                </span>
              </div>

              {movie.release_date && (
                <div className={styles.page__meta__item}>
                  <span className={styles.page__meta__icon}>📅</span>
                  <span>{formatDate(movie.release_date)}</span>
                </div>
              )}

              {movie.runtime && (
                <div className={styles.page__meta__item}>
                  <span className={styles.page__meta__icon}>⏱️</span>
                  <span>{formatRuntime(movie.runtime)}</span>
                </div>
              )}
            </div>

            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div className={styles.page__genres}>
                {movie.genres.map((genre) => (
                  <span key={genre.id} className={styles.page__genre}>
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {/* Overview */}
            {movie.overview && (
              <div className={styles.page__section}>
                <h2 className={styles.page__section__title}>Overview</h2>
                <p className={styles.page__overview}>{movie.overview}</p>
              </div>
            )}

            {/* Additional Info */}
            <div className={styles.page__details}>
              {movie.budget > 0 && (
                <div className={styles.page__detail}>
                  <span className={styles.page__detail__label}>Budget</span>
                  <span className={styles.page__detail__value}>
                    {formatCurrency(movie.budget)}
                  </span>
                </div>
              )}

              {movie.revenue > 0 && (
                <div className={styles.page__detail}>
                  <span className={styles.page__detail__label}>Revenue</span>
                  <span className={styles.page__detail__value}>
                    {formatCurrency(movie.revenue)}
                  </span>
                </div>
              )}

              {movie.status && (
                <div className={styles.page__detail}>
                  <span className={styles.page__detail__label}>Status</span>
                  <span className={styles.page__detail__value}>{movie.status}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cast */}
        {displayedCast.length > 0 && (
          <div className={styles.page__cast}>
            <h2 className={styles.page__section__title}>Cast</h2>
            <div className={styles.page__cast__grid}>
              {displayedCast.map((castMember) => (
                <CastMember key={castMember.id} castMember={castMember} />
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  )
}

