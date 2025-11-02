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
  
  // Get search query from URL params
  const searchParams = new URLSearchParams(location.search)
  const searchQueryFromUrl = searchParams.get('search') || ''
  const [searchQuery, setSearchQuery] = useState(searchQueryFromUrl)

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

  // Sync search query with URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const urlSearchQuery = params.get('search') || ''
    if (urlSearchQuery !== searchQuery) {
      setSearchQuery(urlSearchQuery)
    }
  }, [location.search])

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Search is handled via URL params, no need to navigate on submit
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    
    // Update URL params in real-time
    const params = new URLSearchParams(location.search)
    const category = params.get('category')
    
    if (value.trim()) {
      // Navigate to a movie detail page with search query
      // Use a default movie ID (0) or current movie ID if on detail page
      const currentPath = location.pathname
      const movieIdMatch = currentPath.match(/\/movie\/(\d+)/)
      const movieId = movieIdMatch ? movieIdMatch[1] : '0'
      navigate(`/movie/${movieId}?search=${encodeURIComponent(value.trim())}`)
    } else {
      // Remove search param
      const currentPath = location.pathname
      const movieIdMatch = currentPath.match(/\/movie\/(\d+)/)
      if (movieIdMatch) {
        navigate(`/movie/${movieIdMatch[1]}`)
      } else {
        const category = params.get('category')
        if (category) {
          navigate(`${ROUTES.HOME}?category=${category}`)
        } else {
          navigate(ROUTES.HOME)
        }
      }
    }
  }
  
  const handleSearchClear = () => {
    setSearchQuery('')
    const currentPath = location.pathname
    const movieIdMatch = currentPath.match(/\/movie\/(\d+)/)
    
    if (movieIdMatch) {
      // If on movie detail page, remove search but stay on the page
      navigate(`/movie/${movieIdMatch[1]}`, { replace: true })
    } else {
      // Otherwise navigate to home
      const params = new URLSearchParams(location.search)
      const category = params.get('category')
      if (category) {
        navigate(`${ROUTES.HOME}?category=${category}`)
      } else {
        navigate(ROUTES.HOME)
      }
    }
  }

  const activeCategory = getActiveCategory()

  return (
    <>
      <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
        <div className={styles.header__container}>
          <div className={styles.header__left}>
            <Link to={ROUTES.HOME} className={styles.header__logo}>
              {APP_CONFIG.TITLE}
            </Link>
            
            <form className={styles.header__search} onSubmit={handleSearchSubmit}>
              <svg
                className={styles.header__search__icon}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={handleSearchChange}
                className={styles.header__search__input}
                aria-label="Search movies"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleSearchClear}
                  className={styles.header__search__clear}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </form>
          </div>

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

