import { useState, useEffect, useRef } from 'react'
import { Button } from '../Button'
import styles from './ScrollToTop.module.scss'

export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const toggleVisibility = () => {
      const currentScrollY = window.scrollY
      
      // Show immediately when scrolling down (and past a small threshold)
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(true)
      } 
      // Hide immediately when scrolling up
      else if (currentScrollY < lastScrollY.current) {
        setIsVisible(false)
      }
      // Hide when at the top
      else if (currentScrollY <= 100) {
        setIsVisible(false)
      }

      lastScrollY.current = currentScrollY
    }

    // Check initial scroll position
    lastScrollY.current = window.scrollY
    toggleVisibility()

    window.addEventListener('scroll', toggleVisibility, { passive: true })

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

