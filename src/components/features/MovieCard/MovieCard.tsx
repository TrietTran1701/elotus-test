import { useNavigate } from 'react-router-dom'
import { LazyImage } from '@/components/common'
import { moviesService } from '@/services'
import { formatYear, formatRating, truncateText } from '@/utils/formatters'
import { buildMovieDetailRoute } from '@/constants/routes.constants'
import { IMAGE_SIZES } from '@/constants/api.constants'
import type { Movie } from '@/types'
import styles from './MovieCard.module.scss'

export interface MovieCardProps {
  movie: Movie
  variant?: 'grid' | 'list'
}

export const MovieCard = ({ movie, variant = 'grid' }: MovieCardProps) => {
  const navigate = useNavigate()

  const posterUrl = moviesService.getPosterURL(movie, IMAGE_SIZES.POSTER.MEDIUM)
  const year = formatYear(movie.release_date)
  const rating = formatRating(movie.vote_average)
  const truncatedDescription = variant === 'list' ? truncateText(movie.overview, 150) : null
  const fullDescription = variant === 'list' ? movie.overview : null
  const isDescriptionTruncated = variant === 'list' && fullDescription && truncatedDescription && fullDescription.length > truncatedDescription.length

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

  return (
    <article
      className={`${styles.card} ${variant === 'list' ? styles['card--list'] : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
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
  )
}

