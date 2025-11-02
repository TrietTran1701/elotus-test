import { useState, useEffect, useRef, ImgHTMLAttributes } from 'react'
import styles from './LazyImage.module.scss'

export interface LazyImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string | null
  alt: string
  placeholderSrc?: string
  aspectRatio?: string
}

export const LazyImage = ({
  src,
  alt,
  placeholderSrc,
  aspectRatio = '2/3',
  className = '',
  ...props
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [currentSrc, setCurrentSrc] = useState<string | null>(placeholderSrc || null)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (!imgRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '50px',
      }
    )

    observer.observe(imgRef.current)

    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!isInView || !src) return

    const img = new Image()
    img.src = src

    img.onload = () => {
      setCurrentSrc(src)
      setIsLoaded(true)
    }

    img.onerror = () => {
      setIsLoaded(true)
    }
  }, [isInView, src])

  const imageClassNames = [
    styles.image,
    isLoaded ? styles['image--loaded'] : styles['image--loading'],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={styles.image__container} style={{ aspectRatio }}>
      {currentSrc ? (
        <img ref={imgRef} src={currentSrc} alt={alt} className={imageClassNames} {...props} />
      ) : (
        <div className={styles.image__placeholder} ref={imgRef}>
          <span>🎬</span>
        </div>
      )}
    </div>
  )
}
