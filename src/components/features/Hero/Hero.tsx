import { useState } from 'react'
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
  const [prevIndex, setPrevIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isInitialMount, setIsInitialMount] = useState(true)
  const navigate = useNavigate()

  if (!movies || movies.length === 0) return null
  
  const currentMovie = movies[currentIndex]
  if (!currentMovie) return null

  const backdropUrl = moviesService.getBackdropURL(currentMovie, IMAGE_SIZES.BACKDROP.LARGE)
  const prevMovie = prevIndex !== currentIndex && movies[prevIndex] ? movies[prevIndex] : null
  const prevBackdropUrl = prevMovie 
    ? moviesService.getBackdropURL(prevMovie, IMAGE_SIZES.BACKDROP.LARGE)
    : backdropUrl
  const year = formatYear(currentMovie.release_date)
  const rating = formatRating(currentMovie.vote_average)
  const description = truncateText(currentMovie.overview, 200)

  const getThumbnailUrl = (movie: Movie) => {
    return moviesService.getPosterURL(movie, IMAGE_SIZES.POSTER.SMALL)
  }

  const handlePlayClick = () => {
    navigate(buildMovieDetailRoute(currentMovie.id))
  }

  const handleInfoClick = () => {
    navigate(buildMovieDetailRoute(currentMovie.id))
  }

  const goToSlide = (index: number) => {
    if (index === currentIndex) return
    setIsInitialMount(false)
    setIsTransitioning(true)
    setPrevIndex(currentIndex)
    setCurrentIndex(index)
    // Reset transitioning state after animation completes
    setTimeout(() => setIsTransitioning(false), 600)
  }


  return (
    <section className={styles.hero}>
      {backdropUrl && (
        <>
          <div
            className={`${styles.hero__background} ${styles['hero__background--current']} ${
              isTransitioning ? styles['hero__background--entering'] : ''
            }`}
            style={{
              backgroundImage: `url(${backdropUrl})`,
            }}
          />
          <div
            className={`${styles.hero__background} ${styles['hero__background--prev']} ${
              isTransitioning ? styles['hero__background--exiting'] : ''
            }`}
            style={{
              backgroundImage: `url(${prevBackdropUrl})`,
            }}
          />
          <div
            className={styles.hero__blurredBackground}
            style={{
              backgroundImage: `url(${backdropUrl})`,
            }}
          />
        </>
      )}
      <div className={styles.hero__overlay}>
        <div className={styles.hero__wrapper}>
          {/* Hero content */}
          <div 
            key={currentIndex} 
            className={`${styles.hero__content} ${
              !isInitialMount ? styles['hero__content--entering'] : ''
            }`}
          >
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

          {/* Thumbnail Navigation */}
          {movies.length > 1 && (
            <div className={styles.hero__thumbnails}>
              {movies.map((movie, index) => {
                const thumbnailUrl = getThumbnailUrl(movie)
                return (
                  <button
                    key={movie.id}
                    className={`${styles.hero__thumbnail} ${
                      index === currentIndex ? styles['hero__thumbnail--active'] : ''
                    }`}
                    onClick={() => goToSlide(index)}
                    aria-label={`Go to ${movie.title}`}
                  >
                    {thumbnailUrl && (
                      <img
                        src={thumbnailUrl}
                        alt={movie.title}
                        className={styles.hero__thumbnail__image}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

