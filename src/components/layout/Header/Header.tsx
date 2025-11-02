import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { APP_CONFIG, MOVIE_CATEGORIES } from '@/constants/app.constants'
import { ROUTES } from '@/constants/routes.constants'
import { MovieCategory } from '@/types'
import styles from './Header.module.scss'

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    // Check initial scroll position
    handleScroll()
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

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
    setIsMobileMenuOpen(false)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev)
  }

  const activeCategory = getActiveCategory()

  return (
    <>
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
            <button
              className={`${styles.header__hamburger} ${
                isMobileMenuOpen ? styles['header__hamburger--active'] : ''
              }`}
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`${styles.header__mobileMenu} ${
          isMobileMenuOpen ? styles['header__mobileMenu--open'] : ''
        }`}
        onClick={toggleMobileMenu}
      >
        <nav
          className={styles.header__mobileMenu__nav}
          onClick={(e) => e.stopPropagation()}
        >
          {MOVIE_CATEGORIES.map((category) => (
            <Link
              key={category.id}
              to={`${ROUTES.HOME}?category=${category.value}`}
              className={`${styles.header__mobileMenu__link} ${
                activeCategory === category.value
                  ? styles['header__mobileMenu__link--active']
                  : ''
              }`}
              onClick={(e) => handleCategoryClick(category.value, e)}
            >
              {category.label}
            </Link>
          ))}
          <button className={styles.header__mobileMenu__loginBtn}>Login</button>
        </nav>
      </div>
    </>
  )
}

