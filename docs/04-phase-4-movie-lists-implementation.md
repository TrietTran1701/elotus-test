# Phase 4: Feature Implementation - Movie Lists

**Duration**: 8-9 hours  
**Difficulty**: Medium-Hard  
**Prerequisites**: Phase 1, 2, and 3 completed

## Overview

This phase implements the core movie listing features including MovieCard, MovieList, MovieGrid, and tab navigation between "Now Playing" and "Top Rated" categories.

## Objectives

- [ ] Create MovieCard component with poster and info
- [ ] Build MovieList (vertical) component
- [ ] Build MovieGrid (responsive) component
- [ ] Implement TabBar for category switching
- [ ] Create custom hooks for movie data
- [ ] Implement pagination
- [ ] Add loading skeleton
- [ ] Connect to HomePage

## Step-by-Step Instructions

### Step 1: Create Route Constants

Create `src/constants/routes.constants.ts`:

```typescript
export const ROUTES = {
  HOME: '/',
  MOVIE_DETAIL: '/movie/:id',
  NOT_FOUND: '*',
} as const

export const buildMovieDetailRoute = (id: number): string => {
  return `/movie/${id}`
}
```

### Step 2: Create App Constants

Create `src/constants/app.constants.ts`:

```typescript
import { MovieCategory } from '@/types'

export const APP_CONFIG = {
  TITLE: import.meta.env.VITE_APP_TITLE || 'Movies',
  ITEMS_PER_PAGE: 20,
  MAX_CAST_DISPLAY: 10,
} as const

export const MOVIE_CATEGORIES = [
  {
    id: MovieCategory.NOW_PLAYING,
    label: 'Now Playing',
    value: MovieCategory.NOW_PLAYING,
  },
  {
    id: MovieCategory.TOP_RATED,
    label: 'Top Rated',
    value: MovieCategory.TOP_RATED,
  },
] as const

export const DEFAULT_POSTER = '/poster-placeholder.png'
export const DEFAULT_BACKDROP = '/backdrop-placeholder.png'
```

### Step 3: Create useMovies Custom Hook

Create `src/hooks/useMovies.ts`:

```typescript
import { useState, useEffect, useCallback } from 'react'
import { moviesService } from '@/services'
import type { Movie, MovieListResponse } from '@/types'
import type { LoadingState, ErrorState, MovieCategory } from '@/types'

interface UseMoviesResult {
  movies: Movie[]
  loading: LoadingState
  error: ErrorState | null
  page: number
  totalPages: number
  hasMore: boolean
  fetchMovies: () => Promise<void>
  loadMore: () => Promise<void>
  refetch: () => Promise<void>
}

export const useMovies = (category: MovieCategory): UseMoviesResult => {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState<LoadingState>('idle')
  const [error, setError] = useState<ErrorState | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

  const fetchMovies = useCallback(
    async (pageNum: number = 1) => {
      try {
        setLoading(pageNum === 1 ? 'loading' : 'success')
        setError(null)

        const controller = new AbortController()
        let response: MovieListResponse

        if (category === 'now_playing') {
          response = await moviesService.getNowPlaying({ page: pageNum }, controller.signal)
        } else {
          response = await moviesService.getTopRated({ page: pageNum }, controller.signal)
        }

        if (pageNum === 1) {
          setMovies(response.results)
        } else {
          setMovies((prev) => [...prev, ...response.results])
        }

        setPage(pageNum)
        setTotalPages(response.total_pages)
        setLoading('success')

        return () => controller.abort()
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch movies'
        setError({ message: errorMessage })
        setLoading('error')
      }
    },
    [category]
  )

  const loadMore = useCallback(async () => {
    if (page < totalPages && loading !== 'loading') {
      await fetchMovies(page + 1)
    }
  }, [page, totalPages, loading, fetchMovies])

  const refetch = useCallback(async () => {
    setMovies([])
    setPage(1)
    await fetchMovies(1)
  }, [fetchMovies])

  useEffect(() => {
    void fetchMovies(1)
  }, [fetchMovies])

  return {
    movies,
    loading,
    error,
    page,
    totalPages,
    hasMore: page < totalPages,
    fetchMovies: () => fetchMovies(1),
    loadMore,
    refetch,
  }
}
```

### Step 4: Create MovieCard Component

Create `src/components/features/MovieCard/MovieCard.tsx`:

```typescript
import { useNavigate } from 'react-router-dom'
import { LazyImage } from '@/components/common'
import { moviesService } from '@/services'
import { formatYear, formatRating } from '@/utils/formatters'
import { buildMovieDetailRoute } from '@/constants/routes.constants'
import { IMAGE_SIZES } from '@/constants/api.constants'
import type { Movie } from '@/types'
import styles from './MovieCard.module.scss'

export interface MovieCardProps {
  movie: Movie
}

export const MovieCard = ({ movie }: MovieCardProps) => {
  const navigate = useNavigate()

  const posterUrl = moviesService.getPosterURL(movie, IMAGE_SIZES.POSTER.MEDIUM)
  const year = formatYear(movie.release_date)
  const rating = formatRating(movie.vote_average)

  const handleClick = () => {
    navigate(buildMovieDetailRoute(movie.id))
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleClick()
    }
  }

  return (
    <article
      className={styles.card}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${movie.title}`}
    >
      <div className={styles.card__poster}>
        <LazyImage src={posterUrl} alt={movie.title} aspectRatio="2/3" />
        
        {movie.vote_average > 0 && (
          <div className={styles.card__rating}>
            <span className={styles.card__rating__icon}>⭐</span>
            <span className={styles.card__rating__value}>{rating}</span>
          </div>
        )}
      </div>

      <div className={styles.card__content}>
        <h3 className={styles.card__title}>{movie.title}</h3>
        <p className={styles.card__year}>{year}</p>
      </div>
    </article>
  )
}
```

Create `src/components/features/MovieCard/MovieCard.module.scss`:

```scss
@use '@/styles/abstracts/variables' as *;
@use '@/styles/abstracts/mixins' as *;

.card {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform $transition-base;
  
  @include focus-visible;
  
  &:hover {
    transform: translateY(-8px);
    
    .card__poster {
      box-shadow: $shadow-xl;
    }
    
    .card__title {
      color: $primary-color;
    }
  }
  
  &__poster {
    position: relative;
    border-radius: $border-radius-lg;
    overflow: hidden;
    box-shadow: $shadow-md;
    transition: box-shadow $transition-base;
  }
  
  &__rating {
    position: absolute;
    top: $spacing-sm;
    right: $spacing-sm;
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-xs $spacing-sm;
    background-color: rgba($background-color, 0.9);
    border-radius: $border-radius-sm;
    font-size: $font-size-sm;
    font-weight: 600;
    backdrop-filter: blur(8px);
    
    &__icon {
      font-size: $font-size-xs;
    }
    
    &__value {
      color: $text-primary;
    }
  }
  
  &__content {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
    padding-top: $spacing-md;
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
  }
}
```

Create `src/components/features/MovieCard/index.ts`:

```typescript
export { MovieCard } from './MovieCard'
export type { MovieCardProps } from './MovieCard'
```

### Step 5: Create Skeleton Loader for MovieCard

Create `src/components/features/MovieCard/MovieCardSkeleton.tsx`:

```typescript
import styles from './MovieCardSkeleton.module.scss'

export const MovieCardSkeleton = () => {
  return (
    <div className={styles.skeleton}>
      <div className={styles.skeleton__poster} />
      <div className={styles.skeleton__content}>
        <div className={styles.skeleton__title} />
        <div className={styles.skeleton__year} />
      </div>
    </div>
  )
}
```

Create `src/components/features/MovieCard/MovieCardSkeleton.module.scss`:

```scss
@use '@/styles/abstracts/variables' as *;
@use '@/styles/abstracts/mixins' as *;

.skeleton {
  display: flex;
  flex-direction: column;
  
  &__poster {
    aspect-ratio: 2/3;
    background: linear-gradient(
      90deg,
      $surface-color 0%,
      lighten($surface-color, 5%) 50%,
      $surface-color 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: $border-radius-lg;
  }
  
  &__content {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
    padding-top: $spacing-md;
  }
  
  &__title {
    height: 20px;
    width: 80%;
    background: linear-gradient(
      90deg,
      $surface-color 0%,
      lighten($surface-color, 5%) 50%,
      $surface-color 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: $border-radius-sm;
  }
  
  &__year {
    height: 16px;
    width: 40%;
    background: linear-gradient(
      90deg,
      $surface-color 0%,
      lighten($surface-color, 5%) 50%,
      $surface-color 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: $border-radius-sm;
  }
}
```

### Step 6: Create MovieGrid Component

Create `src/components/features/MovieGrid/MovieGrid.tsx`:

```typescript
import { MovieCard } from '../MovieCard/MovieCard'
import { MovieCardSkeleton } from '../MovieCard/MovieCardSkeleton'
import { Button } from '@/components/common'
import type { Movie } from '@/types'
import type { LoadingState } from '@/types'
import styles from './MovieGrid.module.scss'

export interface MovieGridProps {
  movies: Movie[]
  loading: LoadingState
  hasMore: boolean
  onLoadMore: () => void
}

export const MovieGrid = ({ movies, loading, hasMore, onLoadMore }: MovieGridProps) => {
  const isInitialLoading = loading === 'loading' && movies.length === 0

  if (isInitialLoading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 12 }).map((_, index) => (
          <MovieCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>

      {hasMore && (
        <div className={styles.container__actions}>
          <Button onClick={onLoadMore} loading={loading === 'loading'} size="large">
            Load More
          </Button>
        </div>
      )}
    </div>
  )
}
```

Create `src/components/features/MovieGrid/MovieGrid.module.scss`:

```scss
@use '@/styles/abstracts/variables' as *;
@use '@/styles/abstracts/mixins' as *;

.container {
  display: flex;
  flex-direction: column;
  gap: $spacing-2xl;
  
  &__actions {
    @include flex-center;
    padding: $spacing-lg 0;
  }
}

.grid {
  display: grid;
  gap: $spacing-lg;
  grid-template-columns: repeat(2, 1fr);
  
  @include respond-to(mobile-lg) {
    grid-template-columns: repeat(3, 1fr);
    gap: $spacing-xl;
  }
  
  @include respond-to(tablet) {
    grid-template-columns: repeat(4, 1fr);
  }
  
  @include respond-to(desktop) {
    grid-template-columns: repeat(5, 1fr);
  }
  
  @include respond-to(desktop-lg) {
    grid-template-columns: repeat(6, 1fr);
  }
}
```

Create `src/components/features/MovieGrid/index.ts`:

```typescript
export { MovieGrid } from './MovieGrid'
export type { MovieGridProps } from './MovieGrid'
```

### Step 7: Create MovieList Component (Alternative View)

Create `src/components/features/MovieList/MovieList.tsx`:

```typescript
import { MovieCard } from '../MovieCard/MovieCard'
import { MovieCardSkeleton } from '../MovieCard/MovieCardSkeleton'
import { Button } from '@/components/common'
import type { Movie } from '@/types'
import type { LoadingState } from '@/types'
import styles from './MovieList.module.scss'

export interface MovieListProps {
  movies: Movie[]
  loading: LoadingState
  hasMore: boolean
  onLoadMore: () => void
}

export const MovieList = ({ movies, loading, hasMore, onLoadMore }: MovieListProps) => {
  const isInitialLoading = loading === 'loading' && movies.length === 0

  if (isInitialLoading) {
    return (
      <div className={styles.list}>
        {Array.from({ length: 6 }).map((_, index) => (
          <MovieCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.list}>
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>

      {hasMore && (
        <div className={styles.container__actions}>
          <Button onClick={onLoadMore} loading={loading === 'loading'} size="large">
            Load More
          </Button>
        </div>
      )}
    </div>
  )
}
```

Create `src/components/features/MovieList/MovieList.module.scss`:

```scss
@use '@/styles/abstracts/variables' as *;
@use '@/styles/abstracts/mixins' as *;

.container {
  display: flex;
  flex-direction: column;
  gap: $spacing-2xl;
  
  &__actions {
    @include flex-center;
    padding: $spacing-lg 0;
  }
}

.list {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
  
  @include respond-to(tablet) {
    gap: $spacing-xl;
  }
}
```

Create `src/components/features/MovieList/index.ts`:

```typescript
export { MovieList } from './MovieList'
export type { MovieListProps } from './MovieList'
```

### Step 8: Create TabBar Component

Create `src/components/layout/TabBar/TabBar.tsx`:

```typescript
import { MOVIE_CATEGORIES } from '@/constants/app.constants'
import type { MovieCategory } from '@/types'
import styles from './TabBar.module.scss'

export interface TabBarProps {
  activeTab: MovieCategory
  onTabChange: (tab: MovieCategory) => void
}

export const TabBar = ({ activeTab, onTabChange }: TabBarProps) => {
  return (
    <div className={styles.tabbar}>
      <div className={styles.tabbar__tabs}>
        {MOVIE_CATEGORIES.map((category) => {
          const isActive = activeTab === category.value
          const tabClassNames = [
            styles.tabbar__tab,
            isActive ? styles['tabbar__tab--active'] : '',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <button
              key={category.id}
              className={tabClassNames}
              onClick={() => onTabChange(category.value)}
              aria-pressed={isActive}
            >
              {category.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

Create `src/components/layout/TabBar/TabBar.module.scss`:

```scss
@use '@/styles/abstracts/variables' as *;
@use '@/styles/abstracts/mixins' as *;

.tabbar {
  position: sticky;
  top: 0;
  z-index: $z-index-sticky;
  background-color: rgba($background-color, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &__tabs {
    display: flex;
    gap: $spacing-sm;
    padding: $spacing-md;
    overflow-x: auto;
    
    @include respond-to(tablet) {
      padding: $spacing-lg;
      gap: $spacing-md;
    }
    
    // Hide scrollbar
    &::-webkit-scrollbar {
      display: none;
    }
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  &__tab {
    flex-shrink: 0;
    padding: $spacing-md $spacing-lg;
    background-color: transparent;
    color: $text-secondary;
    border: 1px solid transparent;
    border-radius: $border-radius-md;
    font-size: $font-size-md;
    font-weight: 500;
    cursor: pointer;
    transition: all $transition-fast;
    white-space: nowrap;
    
    @include focus-visible;
    
    &:hover:not(&--active) {
      background-color: rgba(255, 255, 255, 0.05);
      color: $text-primary;
    }
    
    &--active {
      background-color: $primary-color;
      color: $text-primary;
      border-color: $primary-color;
    }
    
    @include respond-to(tablet) {
      padding: $spacing-md $spacing-xl;
      font-size: $font-size-lg;
    }
  }
}
```

Create `src/components/layout/TabBar/index.ts`:

```typescript
export { TabBar } from './TabBar'
export type { TabBarProps } from './TabBar'
```

### Step 9: Create Header Component

Create `src/components/layout/Header/Header.tsx`:

```typescript
import { Container } from '../Container'
import { APP_CONFIG } from '@/constants/app.constants'
import styles from './Header.module.scss'

export const Header = () => {
  return (
    <header className={styles.header}>
      <Container>
        <div className={styles.header__content}>
          <h1 className={styles.header__logo}>
            <span className={styles.header__logo__icon}>🎬</span>
            {APP_CONFIG.TITLE}
          </h1>
        </div>
      </Container>
    </header>
  )
}
```

Create `src/components/layout/Header/Header.module.scss`:

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

Create `src/components/layout/Header/index.ts`:

```typescript
export { Header } from './Header'
```

### Step 10: Create HomePage

Create `src/pages/HomePage/HomePage.tsx`:

```typescript
import { useState } from 'react'
import { Container } from '@/components/layout/Container'
import { TabBar } from '@/components/layout/TabBar'
import { MovieGrid } from '@/components/features/MovieGrid'
import { ErrorMessage } from '@/components/common'
import { useMovies } from '@/hooks/useMovies'
import { MovieCategory, ViewMode } from '@/types'
import styles from './HomePage.module.scss'

export const HomePage = () => {
  const [activeTab, setActiveTab] = useState<MovieCategory>(MovieCategory.NOW_PLAYING)
  const [viewMode] = useState<ViewMode>(ViewMode.GRID)

  const { movies, loading, error, hasMore, loadMore, refetch } = useMovies(activeTab)

  const handleTabChange = (tab: MovieCategory) => {
    setActiveTab(tab)
  }

  if (error) {
    return (
      <Container>
        <div className={styles.page__error}>
          <ErrorMessage message={error.message} onRetry={refetch} />
        </div>
      </Container>
    )
  }

  return (
    <div className={styles.page}>
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />

      <Container>
        <div className={styles.page__content}>
          {viewMode === ViewMode.GRID ? (
            <MovieGrid movies={movies} loading={loading} hasMore={hasMore} onLoadMore={loadMore} />
          ) : (
            <MovieGrid movies={movies} loading={loading} hasMore={hasMore} onLoadMore={loadMore} />
          )}
        </div>
      </Container>
    </div>
  )
}
```

Create `src/pages/HomePage/HomePage.module.scss`:

```scss
@use '@/styles/abstracts/variables' as *;
@use '@/styles/abstracts/mixins' as *;

.page {
  min-height: 100vh;
  
  &__content {
    padding: $spacing-xl 0;
    
    @include respond-to(tablet) {
      padding: $spacing-2xl 0;
    }
  }
  
  &__error {
    @include flex-center;
    min-height: 60vh;
  }
}
```

Create `src/pages/HomePage/index.ts`:

```typescript
export { HomePage } from './HomePage'
```

### Step 11: Set Up React Router

Update `src/App.tsx`:

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Header } from './components/layout/Header'
import { HomePage } from './pages/HomePage'
import { ROUTES } from './constants/routes.constants'

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        {/* More routes will be added in next phases */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

### Step 12: Create Components Index

Create `src/components/features/index.ts`:

```typescript
export { MovieCard } from './MovieCard'
export type { MovieCardProps } from './MovieCard'

export { MovieGrid } from './MovieGrid'
export type { MovieGridProps } from './MovieGrid'

export { MovieList } from './MovieList'
export type { MovieListProps } from './MovieList'
```

Create `src/components/layout/index.ts`:

```typescript
export { Container } from './Container'
export type { ContainerProps } from './Container'

export { Header } from './Header'
export { TabBar } from './TabBar'
export type { TabBarProps } from './TabBar'
```

### Step 13: Test the Implementation

```bash
# Start dev server
npm run dev

# Navigate to http://localhost:3000
# Test tab switching
# Test load more functionality
# Test responsive design on different screen sizes
```

## Verification Checklist

- [ ] Movies load on initial page load
- [ ] Tab bar switches between Now Playing and Top Rated
- [ ] MovieCards display poster, title, year, and rating
- [ ] Load More button loads additional movies
- [ ] Skeleton loaders display while loading
- [ ] Error message displays on API failure
- [ ] Images lazy load as you scroll
- [ ] Responsive design works on mobile, tablet, and desktop
- [ ] Hover effects work on MovieCards
- [ ] Clicking a MovieCard navigates (will implement in next phase)

## Common Issues & Solutions

### Issue 1: Movies Not Loading
**Solution**: 
- Check API key in `.env.local`
- Verify network requests in browser DevTools
- Check console for error messages

### Issue 2: Infinite Loading
**Solution**:
- Check `hasMore` logic in useMovies hook
- Verify pagination parameters

### Issue 3: Tab Switch Not Working
**Solution**:
- Verify useMovies hook re-fetches on category change
- Check useEffect dependencies

### Issue 4: Images Not Loading
**Solution**:
- Verify TMDB image URLs are correct
- Check LazyImage component implementation
- Ensure Intersection Observer is supported

## Performance Optimization Tips

1. **Image Loading**
   - LazyImage loads images only when in viewport
   - Uses Intersection Observer API

2. **List Rendering**
   - React keys on movie IDs prevent unnecessary re-renders
   - Skeleton loaders improve perceived performance

3. **API Calls**
   - Caching prevents duplicate requests
   - AbortController cancels in-flight requests on unmount

## Next Steps

Proceed to **Phase 5: Feature Implementation - Search & Movie Details** where we'll:
- Implement search functionality
- Create movie detail page
- Add cast information
- Implement debounced search

## Resources

- [React Router Documentation](https://reactrouter.com/)
- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [React Hooks Best Practices](https://react.dev/learn/reusing-logic-with-custom-hooks)

