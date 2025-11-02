import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { LazyImage } from '@/components/common'
import { moviesService } from '@/services'
import { IMAGE_SIZES } from '@/constants/api.constants'
import { buildMovieDetailRoute } from '@/constants/routes.constants'
import { formatYear, formatRating } from '@/utils/formatters'
import type { Movie } from '@/types'
import type { LoadingState } from '@/types'
import styles from './MovieCarousel.module.scss'

export interface MovieCarouselProps {
  title: string
  movies: Movie[]
  loading: LoadingState
}

export const MovieCarousel = ({ movies }: MovieCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const getVisibleCards = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1400) return 5
      if (window.innerWidth >= 1024) return 4
      if (window.innerWidth >= 768) return 3
      return 2
    }
    return 5
  }

  const [visibleCards, setVisibleCards] = useState(getVisibleCards())

  useEffect(() => {
    const handleResize = () => {
      setVisibleCards(getVisibleCards())
      setCurrentIndex(0) // Reset to start on resize
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const maxIndex = Math.max(0, movies.length - visibleCards)

  const handlePrev = () => {
    setIsPaused(true)
    setCurrentIndex((prev) => Math.max(0, prev - 1))
    // Resume auto-play after 5 seconds
    setTimeout(() => setIsPaused(false), 5000)
  }

  const handleNext = () => {
    setIsPaused(true)
    setCurrentIndex((prev) => {
      if (prev >= maxIndex) {
        return 0 // Loop back to start
      }
      return Math.min(maxIndex, prev + 1)
    })
    // Resume auto-play after 5 seconds
    setTimeout(() => setIsPaused(false), 5000)
  }

  // Auto-play functionality
  useEffect(() => {
    if (movies.length === 0 || maxIndex === 0) return

    const startAutoPlay = () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current)
      }

      autoPlayIntervalRef.current = setInterval(() => {
        if (!isPaused) {
          setCurrentIndex((prev) => {
            if (prev >= maxIndex) {
              return 0 // Loop back to start
            }
            return prev + 1
          })
        }
      }, 3000) // Auto-advance every 3 seconds
    }

    startAutoPlay()

    return () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current)
      }
    }
  }, [movies.length, maxIndex, isPaused])

  // Pause on hover, resume on leave
  const handleMouseEnter = () => {
    setIsPaused(true)
  }

  const handleMouseLeave = () => {
    setIsPaused(false)
  }

  const handleMovieClick = (movieId: number) => {
    navigate(buildMovieDetailRoute(movieId))
  }

  if (movies.length === 0) {
    return null
  }

  return (
    <div 
      className={styles.carousel}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.carousel__wrapper}>
        {currentIndex > 0 && (
          <button
            className={`${styles.carousel__navButton} ${styles['carousel__navButton--left']}`}
            onClick={handlePrev}
            aria-label="Previous"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        )}

        <div className={styles.carousel__track} ref={carouselRef}>
          <div
            className={styles.carousel__inner}
            style={{
              transform: `translateX(-${currentIndex * (100 / visibleCards)}%)`,
            }}
          >
            {movies.map((movie, index) => {
              const posterUrl = moviesService.getPosterURL(movie, IMAGE_SIZES.POSTER.LARGE)
              const year = formatYear(movie.release_date)
              const rating = formatRating(movie.vote_average)

              return (
                <div
                  key={movie.id}
                  className={`${styles.carousel__card} ${
                    hoveredIndex === index ? styles['carousel__card--hovered'] : ''
                  }`}
                  style={{ width: `${100 / visibleCards}%` }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => handleMovieClick(movie.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleMovieClick(movie.id)
                    }
                  }}
                  aria-label={`View details for ${movie.title}`}
                >
                  <div className={styles.carousel__cardInner}>
                    <div className={styles.carousel__poster}>
                      {posterUrl && (
                        <LazyImage src={posterUrl} alt={movie.title} aspectRatio="2/3" />
                      )}
                    </div>

                    <div className={styles.carousel__info}>
                      <div className={styles.carousel__movieMeta}>
                        {movie.vote_average > 0 && (
                          <span className={`${styles.carousel__badge} ${styles['carousel__badge--primary']}`}>
                            ⭐ {rating}
                          </span>
                        )}
                        {year && (
                          <span className={`${styles.carousel__badge} ${styles['carousel__badge--secondary']}`}>
                            {year}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {currentIndex < maxIndex && (
          <button
            className={`${styles.carousel__navButton} ${styles['carousel__navButton--right']}`}
            onClick={handleNext}
            aria-label="Next"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

