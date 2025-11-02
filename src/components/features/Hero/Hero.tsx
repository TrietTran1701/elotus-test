import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { moviesService } from '@/services'
import { formatYear, formatRating, truncateText } from '@/utils/formatters'
import { buildMovieDetailRoute } from '@/constants/routes.constants'
import { IMAGE_SIZES } from '@/constants/api.constants'
import type { Movie } from '@/types'
import styles from './Hero.module.scss'

export interface HeroProps {
  movies: Movie[]
}

export const Hero = ({ movies }: HeroProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const navigate = useNavigate()

  // Auto-play carousel every 5 seconds
  useEffect(() => {
    if (movies.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [movies.length])

  if (!movies || movies.length === 0) return null
  
  const currentMovie = movies[currentIndex]
  if (!currentMovie) return null

  const backdropUrl = moviesService.getBackdropURL(currentMovie, IMAGE_SIZES.BACKDROP.LARGE)
  const year = formatYear(currentMovie.release_date)
  const rating = formatRating(currentMovie.vote_average)
  const description = truncateText(currentMovie.overview, 200)

  const handlePlayClick = () => {
    navigate(buildMovieDetailRoute(currentMovie.id))
  }

  const handleInfoClick = () => {
    navigate(buildMovieDetailRoute(currentMovie.id))
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % movies.length)
  }

  return (
    <section
      className={styles.hero}
      style={{
        backgroundImage: backdropUrl ? `url(${backdropUrl})` : undefined,
      }}
    >
      <div className={styles.hero__overlay}>
        <div className={styles.hero__content}>
          <h1 className={styles.hero__title}>{currentMovie.title}</h1>
          <h3 className={styles.hero__subtitle}>{currentMovie.original_title}</h3>

          <div className={styles.hero__meta}>
            <span className={`${styles.hero__tag} ${styles['hero__tag--imdb']}`}>
              IMDb {rating}
            </span>
            <span className={styles.hero__tag}>{currentMovie.adult ? 'T18' : 'T13'}</span>
            <span className={styles.hero__tag}>{year}</span>
          </div>

          <p className={styles.hero__desc}>{description}</p>

          <div className={styles.hero__actions}>
            <button className={styles.hero__playBtn} onClick={handlePlayClick}>
              ▶ Watch now
            </button>
            <button className={styles.hero__likeBtn}>♡</button>
            <button className={styles.hero__infoBtn} onClick={handleInfoClick}>
              ℹ
            </button>
          </div>
        </div>
      </div>

      {/* Carousel Controls */}
      {movies.length > 1 && (
        <>
          <button className={styles.hero__prevBtn} onClick={goToPrevious} aria-label="Previous">
            ‹
          </button>
          <button className={styles.hero__nextBtn} onClick={goToNext} aria-label="Next">
            ›
          </button>

          {/* Carousel Indicators */}
          <div className={styles.hero__indicators}>
            {movies.map((_, index) => (
              <button
                key={index}
                className={`${styles.hero__indicator} ${
                  index === currentIndex ? styles['hero__indicator--active'] : ''
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}

