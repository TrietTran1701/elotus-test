import { useState, useEffect, useRef, ImgHTMLAttributes } from 'react'
import styles from './LazyImage.module.scss'

export interface LazyImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string | null
  alt: string
  placeholderSrc?: string
  aspectRatio?: string
  fadeInDuration?: number
}

export const LazyImage = ({
  src,
  alt,
  placeholderSrc,
  aspectRatio = '2/3',
  fadeInDuration = 500,
  className = '',
  ...props
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [currentSrc, setCurrentSrc] = useState<string | null>(placeholderSrc || null)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (!imgRef.current) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observerRef.current?.disconnect()
          }
        })
      },
      {
        rootMargin: '100px', // Start loading 100px before entering viewport
        threshold: 0.01,
      }
    )

    observerRef.current.observe(imgRef.current)

    return () => {
      observerRef.current?.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!isInView || !src) return

    const img = new Image()
    img.src = src

    img.onload = () => {
      // Slight delay for better fade effect
      setTimeout(() => {
        setCurrentSrc(src)
        setIsLoaded(true)
      }, 50)
    }

    img.onerror = () => {
      setHasError(true)
      setIsLoaded(true)
    }
  }, [isInView, src])

  const imageClassNames = [
    styles.image,
    isLoaded ? styles['image--loaded'] : styles['image--loading'],
    hasError ? styles['image--error'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div 
      className={styles.image__container} 
      style={{ 
        aspectRatio,
        '--fade-duration': `${fadeInDuration}ms`
      } as React.CSSProperties}
    >
      {currentSrc && !hasError ? (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          className={imageClassNames}
          loading="lazy"
          {...props}
        />
      ) : (
        <div className={styles.image__placeholder} ref={imgRef}>
          <span className={styles.image__placeholder__icon}>
            {hasError ? '⚠️' : '🎬'}
          </span>
        </div>
      )}
    </div>
  )
}
