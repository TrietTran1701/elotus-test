import { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LazyImage } from '@/components/common'
import { moviesService } from '@/services'
import { formatYear, formatRating, formatRuntime } from '@/utils/formatters'
import { buildMovieDetailRoute } from '@/constants/routes.constants'
import { IMAGE_SIZES } from '@/constants/api.constants'
import type { Movie, MovieDetails } from '@/types'
import styles from './MovieTooltip.module.scss'

interface MovieTooltipProps {
  movie: Movie
  movieDetails: MovieDetails | null
  position: { top: number; left: number }
  onClose: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export const MovieTooltip = ({ movie, movieDetails, position, onClose, onMouseEnter, onMouseLeave }: MovieTooltipProps) => {
  const navigate = useNavigate()
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [adjustedPosition, setAdjustedPosition] = useState(position)

  useEffect(() => {
    // Adjust position to keep tooltip within viewport
    if (tooltipRef.current) {
      const tooltip = tooltipRef.current
      const rect = tooltip.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      let newLeft = position.left
      let newTop = position.top

      // Adjust horizontal position
      if (rect.right > viewportWidth) {
        newLeft = position.left - (rect.right - viewportWidth) - 20
      }
      if (rect.left < 0) {
        newLeft = 20
      }

      // Adjust vertical position
      if (rect.bottom > viewportHeight) {
        newTop = position.top - (rect.bottom - viewportHeight) - 20
      }
      if (rect.top < 0) {
        newTop = 20
      }

      setAdjustedPosition({ top: newTop, left: newLeft })
    }
  }, [position])

  const backdropUrl = moviesService.getBackdropURL(movie, IMAGE_SIZES.BACKDROP.MEDIUM)
  const year = formatYear(movie.release_date)
  const rating = formatRating(movie.vote_average)
  const runtime = movieDetails?.runtime ? formatRuntime(movieDetails.runtime) : null
  const genres = movieDetails?.genres || []
  const genresText = genres.map((g) => g.name).join(' • ') || ''

  const handleWatchNow = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(buildMovieDetailRoute(movie.id))
    onClose()
  }

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    // TODO: Implement like functionality
    console.log('Like clicked for movie:', movie.id)
  }

  const handleDetails = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(buildMovieDetailRoute(movie.id))
    onClose()
  }

  return (
    <div
      ref={tooltipRef}
      className={styles.tooltip}
      style={{
        top: `${adjustedPosition.top}px`,
        left: `${adjustedPosition.left}px`,
      }}
      onMouseEnter={(e) => {
        e.stopPropagation()
        onMouseEnter?.()
      }}
      onMouseLeave={(e) => {
        e.stopPropagation()
        onMouseLeave?.()
      }}
    >
      {backdropUrl && (
        <div className={styles.tooltip__backdrop}>
          <LazyImage src={backdropUrl} alt={movie.title} aspectRatio="16/9" />
        </div>
      )}

      <div className={styles.tooltip__overlay} />

      <div className={styles.tooltip__content}>
        <div className={styles.tooltip__titles}>
          <h3 className={styles.tooltip__title}>{movie.title}</h3>
          {movie.original_title !== movie.title && (
            <h4 className={styles.tooltip__originalTitle}>{movie.original_title}</h4>
          )}
        </div>

        <div className={styles.tooltip__actions}>
          <button className={styles.tooltip__button} onClick={handleWatchNow}>
            <span className={styles.tooltip__buttonIcon}>▶</span>
            <span>Watch Now</span>
          </button>
          <button className={styles.tooltip__buttonSecondary} onClick={handleLike}>
            <span className={styles.tooltip__buttonIcon}>♡</span>
            <span>Like</span>
          </button>
          <button className={styles.tooltip__buttonSecondary} onClick={handleDetails}>
            <span className={styles.tooltip__buttonIcon}>ℹ</span>
            <span>Details</span>
          </button>
        </div>

        <div className={styles.tooltip__meta}>
          {movie.vote_average > 0 && (
            <span className={styles.tooltip__badge}>
              IMDb {rating}
            </span>
          )}
          <span className={styles.tooltip__badgeSecondary}>
            {movie.adult ? 'T18' : 'T13'}
          </span>
          <span className={styles.tooltip__metaText}>{year}</span>
          {runtime && <span className={styles.tooltip__metaText}>{runtime}</span>}
        </div>

        {genresText && (
          <div className={styles.tooltip__genres}>{genresText}</div>
        )}
      </div>
    </div>
  )
}
