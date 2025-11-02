import { useState, useEffect } from 'react'
import { Button } from '../Button'
import styles from './ScrollToTop.module.scss'

export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)

    return () => {
      window.removeEventListener('scroll', toggleVisibility)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <div
      className={`${styles.scrollToTop} ${
        isVisible ? styles['scrollToTop--visible'] : ''
      }`}
    >
      <Button
        onClick={scrollToTop}
        variant="primary"
        size="medium"
        aria-label="Scroll to top"
      >
        ↑
      </Button>
    </div>
  )
}

