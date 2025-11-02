import { useNavigate } from 'react-router-dom'
import { LazyImage } from '@/components/common'
import { moviesService } from '@/services'
import { formatYear, formatRating } from '@/utils/formatters'
import { buildMovieDetailRoute } from '@/constants/routes.constants'
import { IMAGE_SIZES } from '@/constants/api.constants'
import type { Movie } from '@/types'
import styles from './MovieCard.module.scss'

export interface MovieCardProps {
  movie: Movie
}

export const MovieCard = ({ movie }: MovieCardProps) => {
  const navigate = useNavigate()

  const posterUrl = moviesService.getPosterURL(movie, IMAGE_SIZES.POSTER.MEDIUM)
  const year = formatYear(movie.release_date)
  const rating = formatRating(movie.vote_average)

  const handleClick = () => {
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
      className={styles.card}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${movie.title}`}
    >
      <div className={styles.card__poster}>
        <LazyImage src={posterUrl} alt={movie.title} aspectRatio="2/3" />
        
        {movie.vote_average > 0 && (
          <div className={styles.card__rating}>
            <span className={styles.card__rating__icon}>⭐</span>
            <span className={styles.card__rating__value}>{rating}</span>
          </div>
        )}
      </div>

      <div className={styles.card__content}>
        <h3 className={styles.card__title}>{movie.title}</h3>
        <p className={styles.card__year}>{year}</p>
      </div>
    </article>
  )
}

