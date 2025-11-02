import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { LazyImage } from '@/components/common'
import { moviesService } from '@/services'
import { formatYear, formatRating, truncateText } from '@/utils/formatters'
import { buildMovieDetailRoute } from '@/constants/routes.constants'
import { IMAGE_SIZES } from '@/constants/api.constants'
import type { Movie, MovieDetails } from '@/types'
import { MovieTooltip } from './MovieTooltip'
import styles from './MovieCard.module.scss'

export interface MovieCardProps {
  movie: Movie
  variant?: 'grid' | 'list'
}

export const MovieCard = ({ movie, variant = 'grid' }: MovieCardProps) => {
  const navigate = useNavigate()
  const cardRef = useRef<HTMLElement | null>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const [movieDetails, setMovieDetails] = useState<MovieDetails | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const posterUrl = moviesService.getPosterURL(movie, IMAGE_SIZES.POSTER.MEDIUM)
  const year = formatYear(movie.release_date)
  const rating = formatRating(movie.vote_average)
  const truncatedDescription = variant === 'list' ? truncateText(movie.overview, 150) : null
  const fullDescription = variant === 'list' ? movie.overview : null
  const isDescriptionTruncated = variant === 'list' && fullDescription && truncatedDescription && fullDescription.length > truncatedDescription.length

  // Only show tooltip for grid variant
  const shouldShowTooltip = variant === 'grid'

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const handleMouseEnter = () => {
    if (!shouldShowTooltip) return

    hoverTimeoutRef.current = setTimeout(async () => {
      if (!cardRef.current) return

      // Get card position
      const rect = cardRef.current.getBoundingClientRect()
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft

      // Position tooltip to the right of the card with some offset
      const tooltipTop = rect.top + scrollTop
      const tooltipLeft = rect.right + scrollLeft + 20

      setTooltipPosition({ top: tooltipTop, left: tooltipLeft })

      // Fetch movie details
      try {
        const controller = new AbortController()
        abortControllerRef.current = controller
        const details = await moviesService.getMovieDetails(movie.id, controller.signal)
        
        if (!controller.signal.aborted) {
          setMovieDetails(details)
          setShowTooltip(true)
        }
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Failed to fetch movie details:', err)
          // Still show tooltip with basic info
          setShowTooltip(true)
        }
      }
    }, 500) // 500ms delay
  }

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    
    // Add a small delay before closing to allow transition to tooltip
    closeTimeoutRef.current = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
      setShowTooltip(false)
      setMovieDetails(null)
    }, 200)
  }

  const handleTooltipMouseEnter = () => {
    // Cancel close timeout when mouse enters tooltip
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }

  const handleTooltipMouseLeave = () => {
    // Close tooltip when mouse leaves tooltip
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setShowTooltip(false)
    setMovieDetails(null)
  }

  const handleClick = () => {
    navigate(buildMovieDetailRoute(movie.id))
  }

  const handleWatchNow = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(buildMovieDetailRoute(movie.id))
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleClick()
    }
  }

  const handleTooltipClose = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setShowTooltip(false)
    setMovieDetails(null)
  }

  return (
    <>
      <article
        ref={cardRef}
        className={`${styles.card} ${variant === 'list' ? styles['card--list'] : ''}`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="button"
        tabIndex={0}
        aria-label={`View details for ${movie.title}`}
      >
        <div className={styles.card__poster}>
          <LazyImage src={posterUrl} alt={movie.title} aspectRatio="2/3" />
        </div>

        <div className={styles.card__content}>
          <h3 className={styles.card__title}>{movie.title}</h3>
          
          {variant === 'list' ? (
            <>
              {movie.original_title !== movie.title && (
                <h4 className={styles.card__originalTitle}>{movie.original_title}</h4>
              )}
              
              <div className={styles.card__meta}>
                {movie.vote_average > 0 && (
                  <span className={`${styles.card__tag} ${styles['card__tag--imdb']}`}>
                    <span className={styles.card__tag__icon}>⭐</span>
                    IMDb {rating}
                  </span>
                )}
                <span className={styles.card__tag}>{movie.adult ? 'T18' : 'T13'}</span>
                <span className={styles.card__tag}>{year}</span>
              </div>
              
              {truncatedDescription && (
                <div 
                  className={styles.card__descriptionWrapper}
                  data-tooltip={isDescriptionTruncated ? fullDescription : undefined}
                >
                  <p className={styles.card__description}>{truncatedDescription}</p>
                </div>
              )}
              
              <button className={styles.card__watchBtn} onClick={handleWatchNow}>
                ▶ Watch now
              </button>
            </>
          ) : (
            <p className={styles.card__year}>{year}</p>
          )}
        </div>
      </article>

      {showTooltip && shouldShowTooltip && (
        <MovieTooltip
          movie={movie}
          movieDetails={movieDetails}
          position={tooltipPosition}
          onClose={handleTooltipClose}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        />
      )}
    </>
  )
}

