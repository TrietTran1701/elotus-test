import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { APP_CONFIG, MOVIE_CATEGORIES } from '@/constants/app.constants'
import { ROUTES } from '@/constants/routes.constants'
import { MovieCategory } from '@/types'
import styles from './Header.module.scss'

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const getActiveCategory = (): MovieCategory => {
    const params = new URLSearchParams(location.search)
    const categoryParam = params.get('category') as MovieCategory
    if (categoryParam && Object.values(MovieCategory).includes(categoryParam)) {
      return categoryParam
    }
    return MovieCategory.NOW_PLAYING // default
  }

  const handleCategoryClick = (category: MovieCategory, e: React.MouseEvent) => {
    e.preventDefault()
    navigate(`${ROUTES.HOME}?category=${category}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const activeCategory = getActiveCategory()

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.header__container}>
        <Link to={ROUTES.HOME} className={styles.header__logo}>
          {APP_CONFIG.TITLE}
        </Link>

        <nav className={styles.header__nav}>
          {MOVIE_CATEGORIES.map((category) => (
            <Link
              key={category.id}
              to={`${ROUTES.HOME}?category=${category.value}`}
              className={`${styles.header__nav__link} ${
                activeCategory === category.value ? styles['header__nav__link--active'] : ''
              }`}
              onClick={(e) => handleCategoryClick(category.value, e)}
            >
              {category.label}
            </Link>
          ))}
        </nav>

        <div className={styles.header__actions}>
          <button className={styles.header__actions__appBtn}>Login</button>
        </div>
      </div>
    </header>
  )
}

