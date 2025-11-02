import { ReactNode, useEffect, useState } from 'react'
import styles from './PageTransition.module.scss'

interface PageTransitionProps {
  children: ReactNode
}

export const PageTransition = ({ children }: PageTransitionProps) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className={`${styles.pageTransition} ${isVisible ? styles['pageTransition--visible'] : ''}`}>
      {children}
    </div>
  )
}

