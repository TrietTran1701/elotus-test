# Phase 7: Advanced Features & Optimizations

**Duration**: 10-12 hours  
**Difficulty**: Hard  
**Prerequisites**: Phase 1-6 completed

## Overview

This phase implements advanced features and optimizations including enhanced animations, image fade-in effects, lazy loading improvements, custom selection effects, skeleton loading enhancements, and responsive design improvements.

## Objectives

- [ ] Implement fade-in animations for all images
- [ ] Enhance lazy loading with progressive image loading
- [ ] Add custom highlight and selection effects
- [ ] Improve skeleton loading with better animations
- [ ] Enhance responsive design for all screen sizes
- [ ] Add scroll-to-top functionality
- [ ] Implement performance optimizations
- [ ] Add accessibility improvements

## Step-by-Step Instructions

### Step 1: Enhance LazyImage with Progressive Loading

Update `src/components/common/Image/LazyImage.tsx`:

```typescript
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
```

Update `src/components/common/Image/LazyImage.module.scss`:

```scss
@use '@/styles/abstracts/variables' as *;
@use '@/styles/abstracts/mixins' as *;

.image {
  &__container {
    position: relative;
    width: 100%;
    overflow: hidden;
    background-color: $surface-color;
    border-radius: $border-radius-md;
  }

  &__placeholder {
    @include flex-center;
    @include absolute-center;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      110deg,
      $surface-color 8%,
      lighten($surface-color, 8%) 18%,
      $surface-color 33%
    );
    background-size: 200% 100%;
    animation: shimmer 2s linear infinite;

    &__icon {
      font-size: 48px;
      opacity: 0.3;
      animation: pulse 2s ease-in-out infinite;
    }
  }
}

.image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity var(--fade-duration, 500ms) cubic-bezier(0.4, 0, 0.2, 1),
              transform var(--fade-duration, 500ms) cubic-bezier(0.4, 0, 0.2, 1);

  &--loading {
    opacity: 0;
    transform: scale(1.05);
  }

  &--loaded {
    opacity: 1;
    transform: scale(1);
  }

  &--error {
    display: none;
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
```

### Step 2: Enhance MovieCard with Selection Effects

Update `src/components/features/MovieCard/MovieCard.module.scss`:

```scss
@use '@/styles/abstracts/variables' as *;
@use '@/styles/abstracts/mixins' as *;

.card {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform $transition-base cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  
  @include focus-visible;

  // Add ripple effect container
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle, rgba($primary-color, 0.3) 0%, transparent 70%);
    opacity: 0;
    transform: scale(0);
    transition: opacity $transition-base, transform $transition-base;
    border-radius: $border-radius-lg;
    pointer-events: none;
  }

  &:active::before {
    opacity: 1;
    transform: scale(1);
    transition: opacity 0s, transform 0.3s;
  }

  &:hover {
    transform: translateY(-8px);
    z-index: 10;

    .card__poster {
      box-shadow: 0 20px 40px rgba($primary-color, 0.3), $shadow-xl;

      &::after {
        opacity: 1;
      }
    }

    .card__title {
      color: $primary-color;
    }

    .card__content {
      transform: translateY(-4px);
    }
  }

  &:active {
    transform: translateY(-6px) scale(0.98);
  }

  &__poster {
    position: relative;
    border-radius: $border-radius-lg;
    overflow: hidden;
    box-shadow: $shadow-md;
    transition: all $transition-base cubic-bezier(0.4, 0, 0.2, 1);

    // Overlay effect on hover
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        to top,
        rgba($primary-color, 0.2) 0%,
        transparent 50%
      );
      opacity: 0;
      transition: opacity $transition-base;
      pointer-events: none;
    }
  }

  &__rating {
    position: absolute;
    top: $spacing-sm;
    right: $spacing-sm;
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-xs $spacing-sm;
    background-color: rgba($background-color, 0.95);
    border-radius: $border-radius-sm;
    font-size: $font-size-sm;
    font-weight: 600;
    backdrop-filter: blur(12px);
    box-shadow: $shadow-md;
    transition: transform $transition-fast;
    z-index: 2;

    &__icon {
      font-size: $font-size-xs;
    }

    &__value {
      color: $text-primary;
    }
  }

  &:hover &__rating {
    transform: scale(1.1);
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
    padding-top: $spacing-md;
    transition: transform $transition-base cubic-bezier(0.4, 0, 0.2, 1);
  }

  &__title {
    font-size: $font-size-md;
    font-weight: 600;
    color: $text-primary;
    transition: color $transition-fast;

    @include line-clamp(2);
  }

  &__year {
    font-size: $font-size-sm;
    color: $text-secondary;
    transition: color $transition-fast;
  }

  &:hover &__year {
    color: $text-primary;
  }
}

// Add animation for new cards
@keyframes cardEnter {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card {
  animation: cardEnter 0.4s cubic-bezier(0.4, 0, 0.2, 1) backwards;

  @for $i from 1 through 20 {
    &:nth-child(#{$i}) {
      animation-delay: #{$i * 0.05}s;
    }
  }
}
```

### Step 3: Create ScrollToTop Component

Create `src/components/common/ScrollToTop/ScrollToTop.tsx`:

```typescript
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
```

Create `src/components/common/ScrollToTop/ScrollToTop.module.scss`:

```scss
@use '@/styles/abstracts/variables' as *;
@use '@/styles/abstracts/mixins' as *;

.scrollToTop {
  position: fixed;
  bottom: $spacing-xl;
  right: $spacing-xl;
  z-index: $z-index-fixed;
  opacity: 0;
  visibility: hidden;
  transform: translateY(20px);
  transition: all $transition-base;

  &--visible {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  button {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    box-shadow: $shadow-lg;
    font-size: $font-size-xl;

    &:hover {
      box-shadow: $shadow-xl;
      transform: translateY(-4px);
    }
  }
}
```

Create `src/components/common/ScrollToTop/index.ts`:

```typescript
export { ScrollToTop } from './ScrollToTop'
```

### Step 4: Add Smooth Page Transitions

Create `src/components/common/PageTransition/PageTransition.tsx`:

```typescript
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
```

Create `src/components/common/PageTransition/PageTransition.module.scss`:

```scss
@use '@/styles/abstracts/variables' as *;

.pageTransition {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &--visible {
    opacity: 1;
    transform: translateY(0);
  }
}
```

Create `src/components/common/PageTransition/index.ts`:

```typescript
export { PageTransition } from './PageTransition'
```

### Step 5: Enhance Responsive Design

Update `src/styles/abstracts/_variables.scss` with more responsive values:

```scss
// Add responsive font sizes
$font-size-responsive-xs: clamp(0.625rem, 0.5rem + 0.5vw, 0.75rem);
$font-size-responsive-sm: clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem);
$font-size-responsive-md: clamp(0.875rem, 0.75rem + 0.5vw, 1rem);
$font-size-responsive-lg: clamp(1rem, 0.875rem + 0.5vw, 1.25rem);
$font-size-responsive-xl: clamp(1.25rem, 1rem + 1vw, 1.5rem);
$font-size-responsive-2xl: clamp(1.5rem, 1.25rem + 1vw, 2rem);

// Add responsive spacing
$spacing-responsive-sm: clamp(0.5rem, 0.25rem + 1vw, 0.75rem);
$spacing-responsive-md: clamp(0.75rem, 0.5rem + 1vw, 1rem);
$spacing-responsive-lg: clamp(1rem, 0.75rem + 1vw, 1.5rem);
$spacing-responsive-xl: clamp(1.5rem, 1rem + 2vw, 2rem);
```

Create responsive utility classes in `src/styles/base/_utilities.scss`:

```scss
@use '../abstracts/variables' as *;
@use '../abstracts/mixins' as *;

// Display utilities
.d-none {
  display: none !important;
}

.d-block {
  display: block !important;
}

.d-flex {
  display: flex !important;
}

.d-grid {
  display: grid !important;
}

// Responsive display
@include respond-to(tablet) {
  .d-tablet-none {
    display: none !important;
  }

  .d-tablet-block {
    display: block !important;
  }

  .d-tablet-flex {
    display: flex !important;
  }
}

@include respond-to(desktop) {
  .d-desktop-none {
    display: none !important;
  }

  .d-desktop-block {
    display: block !important;
  }

  .d-desktop-flex {
    display: flex !important;
  }
}

// Text utilities
.text-center {
  text-align: center !important;
}

.text-left {
  text-align: left !important;
}

.text-right {
  text-align: right !important;
}

// Spacing utilities
.mt-auto {
  margin-top: auto !important;
}

.mb-auto {
  margin-bottom: auto !important;
}

// Accessibility
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

Update `src/styles/main.scss`:

```scss
// Abstracts
@use 'abstracts/variables';
@use 'abstracts/mixins';
@use 'abstracts/functions';
@use 'abstracts/breakpoints';

// Base
@use 'base/reset';
@use 'base/typography';
@use 'base/animations';
@use 'base/utilities';

// Layout
@use 'layout/grid';
@use 'layout/container';
```

### Step 6: Add Performance Optimizations - React.memo

Create `src/components/features/MovieCard/MovieCard.memo.tsx`:

```typescript
import { memo } from 'react'
import { MovieCard, MovieCardProps } from './MovieCard'

export const MovieCardMemo = memo(MovieCard, (prevProps, nextProps) => {
  return prevProps.movie.id === nextProps.movie.id
})
```

Update `src/components/features/MovieCard/index.ts`:

```typescript
export { MovieCard } from './MovieCard'
export { MovieCardMemo } from './MovieCard.memo'
export type { MovieCardProps } from './MovieCard'
export { MovieCardSkeleton } from './MovieCardSkeleton'
```

### Step 7: Add Accessibility Improvements

Update `src/components/layout/Header/Header.tsx` with skip link:

```typescript
import { Container } from '../Container'
import { APP_CONFIG } from '@/constants/app.constants'
import styles from './Header.module.scss'

export const Header = () => {
  return (
    <>
      <a href="#main-content" className={styles.header__skip}>
        Skip to main content
      </a>
      <header className={styles.header}>
        <Container>
          <div className={styles.header__content}>
            <h1 className={styles.header__logo}>
              <span className={styles.header__logo__icon} aria-hidden="true">
                🎬
              </span>
              {APP_CONFIG.TITLE}
            </h1>
          </div>
        </Container>
      </header>
    </>
  )
}
```

Update `src/components/layout/Header/Header.module.scss`:

```scss
@use '@/styles/abstracts/variables' as *;
@use '@/styles/abstracts/mixins' as *;

.header {
  position: sticky;
  top: 0;
  z-index: $z-index-sticky + 1;
  background-color: rgba($background-color, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  &__skip {
    position: absolute;
    left: -9999px;
    top: auto;
    width: 1px;
    height: 1px;
    overflow: hidden;

    &:focus {
      position: fixed;
      top: $spacing-md;
      left: $spacing-md;
      width: auto;
      height: auto;
      padding: $spacing-md $spacing-lg;
      background-color: $primary-color;
      color: $text-primary;
      text-decoration: none;
      border-radius: $border-radius-md;
      z-index: 9999;
      outline: 2px solid $text-primary;
      outline-offset: 2px;
    }
  }

  &__content {
    @include flex-between;
    padding: $spacing-lg 0;
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    font-size: $font-size-xl;
    font-weight: 700;
    color: $text-primary;

    @include respond-to(tablet) {
      font-size: $font-size-2xl;
    }

    &__icon {
      font-size: $font-size-2xl;

      @include respond-to(tablet) {
        font-size: 2.5rem;
      }
    }
  }
}
```

### Step 8: Update HomePage with Optimizations

Update `src/pages/HomePage/HomePage.tsx`:

```typescript
import { useState } from 'react'
import { Container } from '@/components/layout/Container'
import { TabBar } from '@/components/layout/TabBar'
import { SearchBar } from '@/components/features/SearchBar'
import { MovieGrid } from '@/components/features/MovieGrid'
import { MovieList } from '@/components/features/MovieList'
import { ErrorMessage, ViewModeToggle, ScrollToTop, PageTransition } from '@/components/common'
import { useMovies, useSearch } from '@/hooks'
import { useAppContext } from '@/contexts/AppContext'
import { MovieCategory, ViewMode } from '@/types'
import styles from './HomePage.module.scss'

export const HomePage = () => {
  const [activeTab, setActiveTab] = useState<MovieCategory>(MovieCategory.NOW_PLAYING)
  const { viewMode, setViewMode } = useAppContext()

  const {
    movies,
    loading: moviesLoading,
    error: moviesError,
    hasMore: moviesHasMore,
    loadMore: moviesLoadMore,
    refetch: moviesRefetch,
  } = useMovies(activeTab)

  const {
    query,
    results: searchResults,
    loading: searchLoading,
    error: searchError,
    hasMore: searchHasMore,
    setQuery,
    loadMore: searchLoadMore,
    clearSearch,
  } = useSearch()

  const handleTabChange = (tab: MovieCategory) => {
    setActiveTab(tab)
    clearSearch()
  }

  const isSearchActive = query.trim().length > 0
  const displayMovies = isSearchActive ? searchResults : movies
  const displayLoading = isSearchActive ? searchLoading : moviesLoading
  const displayError = isSearchActive ? searchError : moviesError
  const displayHasMore = isSearchActive ? searchHasMore : moviesHasMore
  const displayLoadMore = isSearchActive ? searchLoadMore : moviesLoadMore
  const displayRefetch = isSearchActive ? clearSearch : moviesRefetch

  if (displayError) {
    return (
      <Container>
        <div className={styles.page__error}>
          <ErrorMessage message={displayError.message} onRetry={displayRefetch} />
        </div>
      </Container>
    )
  }

  return (
    <PageTransition>
      <div className={styles.page}>
        <TabBar activeTab={activeTab} onTabChange={handleTabChange} />

        <Container>
          <main id="main-content">
            <div className={styles.page__controls}>
              <div className={styles.page__search}>
                <SearchBar
                  value={query}
                  onChange={setQuery}
                  onClear={clearSearch}
                  placeholder="Search movies..."
                />
              </div>

              <ViewModeToggle value={viewMode} onChange={setViewMode} />
            </div>

            {isSearchActive && (
              <div className={styles.page__search__info} role="status" aria-live="polite">
                <p>
                  {searchResults.length > 0
                    ? `Found ${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} for "${query}"`
                    : searchLoading === 'loading'
                    ? 'Searching...'
                    : `No results found for "${query}"`}
                </p>
              </div>
            )}

            <div className={styles.page__content}>
              {viewMode === ViewMode.GRID ? (
                <MovieGrid
                  movies={displayMovies}
                  loading={displayLoading}
                  hasMore={displayHasMore}
                  onLoadMore={displayLoadMore}
                />
              ) : (
                <MovieList
                  movies={displayMovies}
                  loading={displayLoading}
                  hasMore={displayHasMore}
                  onLoadMore={displayLoadMore}
                />
              )}
            </div>
          </main>
        </Container>

        <ScrollToTop />
      </div>
    </PageTransition>
  )
}
```

### Step 9: Update Common Components Index

Update `src/components/common/index.ts`:

```typescript
export { Button } from './Button'
export type { ButtonProps } from './Button'

export { Input } from './Input'
export type { InputProps } from './Input'

export { Card } from './Card'
export type { CardProps } from './Card'

export { Loader } from './Loader'
export type { LoaderProps } from './Loader'

export { ErrorMessage } from './ErrorMessage'
export type { ErrorMessageProps } from './ErrorMessage'

export { LazyImage } from './Image'
export type { LazyImageProps } from './Image'

export { ViewModeToggle } from './ViewModeToggle'
export type { ViewModeToggleProps } from './ViewModeToggle'

export { ScrollToTop } from './ScrollToTop'
export { PageTransition } from './PageTransition'
```

### Step 10: Add Touch Gestures for Mobile (Optional Enhancement)

Create `src/hooks/useSwipe.ts`:

```typescript
import { useEffect, useRef, RefObject } from 'react'

interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
}

const SWIPE_THRESHOLD = 50

export const useSwipe = (
  ref: RefObject<HTMLElement>,
  handlers: SwipeHandlers
): void => {
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const handleTouchStart = (e: TouchEvent) => {
      touchStart.current = {
        x: e.touches[0]?.clientX ?? 0,
        y: e.touches[0]?.clientY ?? 0,
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return

      const touchEnd = {
        x: e.changedTouches[0]?.clientX ?? 0,
        y: e.changedTouches[0]?.clientY ?? 0,
      }

      const deltaX = touchEnd.x - touchStart.current.x
      const deltaY = touchEnd.y - touchStart.current.y

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
          if (deltaX > 0) {
            handlers.onSwipeRight?.()
          } else {
            handlers.onSwipeLeft?.()
          }
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > SWIPE_THRESHOLD) {
          if (deltaY > 0) {
            handlers.onSwipeDown?.()
          } else {
            handlers.onSwipeUp?.()
          }
        }
      }

      touchStart.current = null
    }

    element.addEventListener('touchstart', handleTouchStart)
    element.addEventListener('touchend', handleTouchEnd)

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [ref, handlers])
}
```

## Verification Checklist

- [ ] All images fade in smoothly
- [ ] MovieCards have enhanced hover effects
- [ ] Selection effects work on click
- [ ] Skeleton loading is smooth
- [ ] Scroll to top button appears after scrolling
- [ ] Page transitions are smooth
- [ ] Responsive design works on all devices
- [ ] Touch gestures work on mobile
- [ ] Accessibility features work (keyboard navigation, screen readers)
- [ ] Performance is optimized (React.memo)

## Performance Benchmarks

Target metrics:
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.0s
- Lighthouse Performance Score: > 90
- Lighthouse Accessibility Score: > 95

## Common Issues & Solutions

### Issue 1: Animations Causing Performance Issues
**Solution**:
- Use CSS transforms instead of position changes
- Utilize will-change property sparingly
- Use requestAnimationFrame for JS animations

### Issue 2: Images Loading Slowly
**Solution**:
- Verify lazy loading is working
- Check image sizes from API
- Consider using smaller image sizes for mobile

### Issue 3: Scroll Performance Issues
**Solution**:
- Debounce scroll event listeners
- Use Intersection Observer instead of scroll events
- Implement virtual scrolling for very long lists

## Next Steps

Proceed to **Phase 8: Testing & Final Polish** where we'll:
- Test all features thoroughly
- Fix remaining bugs
- Optimize performance further
- Add final touches
- Prepare for deployment

## Resources

- [CSS Transforms Performance](https://web.dev/animations-guide/)
- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Web Accessibility](https://www.w3.org/WAI/WCAG21/quickref/)

