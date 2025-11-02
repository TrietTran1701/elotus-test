# Phase 5: Feature Implementation - Search & Movie Details

**Duration**: 8-10 hours  
**Difficulty**: Medium-Hard  
**Prerequisites**: Phase 1-4 completed

## Overview

This phase implements search functionality with debouncing and creates a detailed movie view page with cast information, genres, and additional metadata.

## Objectives

- [ ] Create SearchBar component
- [ ] Implement useDebounce hook
- [ ] Create useSearch custom hook
- [ ] Build MovieDetailPage
- [ ] Create CastMember component
- [ ] Implement movie details layout
- [ ] Add navigation to detail page
- [ ] Handle loading and error states

## Step-by-Step Instructions

### Step 1: Create useDebounce Hook

Create `src/hooks/useDebounce.ts`:

```typescript
import { useState, useEffect } from 'react'

export const useDebounce = <T>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
```

### Step 2: Create useSearch Hook

Create `src/hooks/useSearch.ts`:

```typescript
import { useState, useEffect, useCallback } from 'react'
import { searchService } from '@/services'
import { useDebounce } from './useDebounce'
import type { Movie, SearchResponse } from '@/types'
import type { LoadingState, ErrorState } from '@/types'

interface UseSearchResult {
  query: string
  results: Movie[]
  loading: LoadingState
  error: ErrorState | null
  page: number
  totalPages: number
  hasMore: boolean
  setQuery: (query: string) => void
  loadMore: () => Promise<void>
  clearSearch: () => void
}

export const useSearch = (): UseSearchResult => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Movie[]>([])
  const [loading, setLoading] = useState<LoadingState>('idle')
  const [error, setError] = useState<ErrorState | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

  const debouncedQuery = useDebounce(query, 500)

  const searchMovies = useCallback(
    async (searchQuery: string, pageNum: number = 1) => {
      if (!searchQuery.trim()) {
        setResults([])
        setLoading('idle')
        setError(null)
        return
      }

      try {
        setLoading(pageNum === 1 ? 'loading' : 'success')
        setError(null)

        const controller = new AbortController()
        const response: SearchResponse = await searchService.searchMovies(
          { query: searchQuery, page: pageNum },
          controller.signal
        )

        if (pageNum === 1) {
          setResults(response.results)
        } else {
          setResults((prev) => [...prev, ...response.results])
        }

        setPage(pageNum)
        setTotalPages(response.total_pages)
        setLoading('success')

        return () => controller.abort()
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Search failed'
        setError({ message: errorMessage })
        setLoading('error')
      }
    },
    []
  )

  const loadMore = useCallback(async () => {
    if (page < totalPages && loading !== 'loading' && debouncedQuery) {
      await searchMovies(debouncedQuery, page + 1)
    }
  }, [page, totalPages, loading, debouncedQuery, searchMovies])

  const clearSearch = useCallback(() => {
    setQuery('')
    setResults([])
    setPage(1)
    setTotalPages(0)
    setLoading('idle')
    setError(null)
  }, [])

  useEffect(() => {
    if (debouncedQuery) {
      void searchMovies(debouncedQuery, 1)
    } else {
      setResults([])
      setLoading('idle')
      setPage(1)
      setTotalPages(0)
    }
  }, [debouncedQuery, searchMovies])

  return {
    query,
    results,
    loading,
    error,
    page,
    totalPages,
    hasMore: page < totalPages,
    setQuery,
    loadMore,
    clearSearch,
  }
}
```

### Step 3: Create SearchBar Component

Create `src/components/features/SearchBar/SearchBar.tsx`:

```typescript
import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/common'
import styles from './SearchBar.module.scss'

export interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  placeholder?: string
  autoFocus?: boolean
}

export const SearchBar = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search movies...',
  autoFocus = false,
}: SearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  const handleClear = () => {
    onClear()
    inputRef.current?.focus()
  }

  return (
    <div className={styles.searchbar}>
      <div
        className={`${styles.searchbar__wrapper} ${
          isFocused ? styles['searchbar__wrapper--focused'] : ''
        }`}
      >
        <span className={styles.searchbar__icon}>🔍</span>
        
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          fullWidth
          className={styles.searchbar__input}
        />

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className={styles.searchbar__clear}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
```

Create `src/components/features/SearchBar/SearchBar.module.scss`:

```scss
@use '@/styles/abstracts/variables' as *;
@use '@/styles/abstracts/mixins' as *;

.searchbar {
  width: 100%;
  
  &__wrapper {
    position: relative;
    display: flex;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-sm $spacing-md;
    background-color: $surface-color;
    border: 2px solid transparent;
    border-radius: $border-radius-lg;
    transition: all $transition-fast;
    
    &:hover {
      border-color: rgba(255, 255, 255, 0.1);
    }
    
    &--focused {
      border-color: $primary-color;
      background-color: lighten($surface-color, 3%);
    }
  }
  
  &__icon {
    font-size: $font-size-lg;
    flex-shrink: 0;
  }
  
  &__input {
    :global {
      .input {
        padding: $spacing-sm 0;
        background-color: transparent !important;
        border: none !important;
        
        &:focus {
          outline: none;
          box-shadow: none;
        }
      }
      
      .input__wrapper {
        width: 100%;
      }
    }
  }
  
  &__clear {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0.1);
    color: $text-secondary;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: all $transition-fast;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.2);
      color: $text-primary;
    }
  }
}
```

Create `src/components/features/SearchBar/index.ts`:

```typescript
export { SearchBar } from './SearchBar'
export type { SearchBarProps } from './SearchBar'
```

### Step 4: Create useMovieDetails Hook

Create `src/hooks/useMovieDetails.ts`:

```typescript
import { useState, useEffect, useCallback } from 'react'
import { moviesService } from '@/services'
import type { MovieDetails } from '@/types'
import type { LoadingState, ErrorState } from '@/types'

interface UseMovieDetailsResult {
  movie: MovieDetails | null
  loading: LoadingState
  error: ErrorState | null
  refetch: () => Promise<void>
}

export const useMovieDetails = (movieId: number): UseMovieDetailsResult => {
  const [movie, setMovie] = useState<MovieDetails | null>(null)
  const [loading, setLoading] = useState<LoadingState>('idle')
  const [error, setError] = useState<ErrorState | null>(null)

  const fetchMovieDetails = useCallback(async () => {
    try {
      setLoading('loading')
      setError(null)

      const controller = new AbortController()
      const data = await moviesService.getMovieDetails(movieId, controller.signal)

      setMovie(data)
      setLoading('success')

      return () => controller.abort()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch movie details'
      setError({ message: errorMessage })
      setLoading('error')
    }
  }, [movieId])

  useEffect(() => {
    void fetchMovieDetails()
  }, [fetchMovieDetails])

  return {
    movie,
    loading,
    error,
    refetch: fetchMovieDetails,
  }
}
```

Create `src/hooks/index.ts`:

```typescript
export { useMovies } from './useMovies'
export { useSearch } from './useSearch'
export { useDebounce } from './useDebounce'
export { useMovieDetails } from './useMovieDetails'
```

### Step 5: Create CastMember Component

Create `src/components/features/CastMember/CastMember.tsx`:

```typescript
import { LazyImage } from '@/components/common'
import { apiClient } from '@/services'
import { IMAGE_SIZES } from '@/constants/api.constants'
import type { CastMember as CastMemberType } from '@/types'
import styles from './CastMember.module.scss'

export interface CastMemberProps {
  castMember: CastMemberType
}

export const CastMember = ({ castMember }: CastMemberProps) => {
  const profileUrl = apiClient.getImageURL(
    castMember.profile_path,
    IMAGE_SIZES.PROFILE.MEDIUM
  )

  return (
    <div className={styles.cast}>
      <div className={styles.cast__photo}>
        <LazyImage src={profileUrl} alt={castMember.name} aspectRatio="2/3" />
      </div>
      
      <div className={styles.cast__info}>
        <h4 className={styles.cast__name}>{castMember.name}</h4>
        <p className={styles.cast__character}>{castMember.character}</p>
      </div>
    </div>
  )
}
```

Create `src/components/features/CastMember/CastMember.module.scss`:

```scss
@use '@/styles/abstracts/variables' as *;
@use '@/styles/abstracts/mixins' as *;

.cast {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  
  &__photo {
    border-radius: $border-radius-md;
    overflow: hidden;
    box-shadow: $shadow-md;
  }
  
  &__info {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }
  
  &__name {
    font-size: $font-size-sm;
    font-weight: 600;
    color: $text-primary;
    
    @include line-clamp(2);
  }
  
  &__character {
    font-size: $font-size-xs;
    color: $text-secondary;
    
    @include line-clamp(2);
  }
}
```

Create `src/components/features/CastMember/index.ts`:

```typescript
export { CastMember } from './CastMember'
export type { CastMemberProps } from './CastMember'
```

### Step 6: Create MovieDetailPage

Create `src/pages/MovieDetailPage/MovieDetailPage.tsx`:

```typescript
import { useParams, useNavigate } from 'react-router-dom'
import { Container } from '@/components/layout/Container'
import { Button, LazyImage, Loader, ErrorMessage } from '@/components/common'
import { CastMember } from '@/components/features/CastMember'
import { useMovieDetails } from '@/hooks'
import { moviesService } from '@/services'
import { IMAGE_SIZES } from '@/constants/api.constants'
import { APP_CONFIG } from '@/constants/app.constants'
import {
  formatDate,
  formatRuntime,
  formatCurrency,
  formatRating,
} from '@/utils/formatters'
import styles from './MovieDetailPage.module.scss'

export const MovieDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const movieId = parseInt(id || '0', 10)

  const { movie, loading, error, refetch } = useMovieDetails(movieId)

  if (loading === 'loading' || !movie) {
    return <Loader fullScreen message="Loading movie details..." />
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

  const backdropUrl = moviesService.getBackdropURL(movie, IMAGE_SIZES.BACKDROP.LARGE)
  const posterUrl = moviesService.getPosterURL(movie, IMAGE_SIZES.POSTER.LARGE)

  const displayedCast = movie.credits?.cast.slice(0, APP_CONFIG.MAX_CAST_DISPLAY) || []

  return (
    <div className={styles.page}>
      {/* Backdrop */}
      {backdropUrl && (
        <div className={styles.page__backdrop}>
          <img src={backdropUrl} alt="" className={styles.page__backdrop__image} />
          <div className={styles.page__backdrop__overlay} />
        </div>
      )}

      <Container>
        {/* Back Button */}
        <div className={styles.page__nav}>
          <Button variant="ghost" onClick={() => navigate(-1)}>
            ← Back
          </Button>
        </div>

        {/* Main Content */}
        <div className={styles.page__content}>
          {/* Poster */}
          <div className={styles.page__poster}>
            <LazyImage src={posterUrl} alt={movie.title} aspectRatio="2/3" />
          </div>

          {/* Info */}
          <div className={styles.page__info}>
            <h1 className={styles.page__title}>{movie.title}</h1>

            {movie.tagline && <p className={styles.page__tagline}>{movie.tagline}</p>}

            {/* Meta Info */}
            <div className={styles.page__meta}>
              <div className={styles.page__meta__item}>
                <span className={styles.page__meta__icon}>⭐</span>
                <span>{formatRating(movie.vote_average)}</span>
                <span className={styles.page__meta__label}>
                  ({movie.vote_count} votes)
                </span>
              </div>

              {movie.release_date && (
                <div className={styles.page__meta__item}>
                  <span className={styles.page__meta__icon}>📅</span>
                  <span>{formatDate(movie.release_date)}</span>
                </div>
              )}

              {movie.runtime && (
                <div className={styles.page__meta__item}>
                  <span className={styles.page__meta__icon}>⏱️</span>
                  <span>{formatRuntime(movie.runtime)}</span>
                </div>
              )}
            </div>

            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div className={styles.page__genres}>
                {movie.genres.map((genre) => (
                  <span key={genre.id} className={styles.page__genre}>
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {/* Overview */}
            {movie.overview && (
              <div className={styles.page__section}>
                <h2 className={styles.page__section__title}>Overview</h2>
                <p className={styles.page__overview}>{movie.overview}</p>
              </div>
            )}

            {/* Additional Info */}
            <div className={styles.page__details}>
              {movie.budget > 0 && (
                <div className={styles.page__detail}>
                  <span className={styles.page__detail__label}>Budget</span>
                  <span className={styles.page__detail__value}>
                    {formatCurrency(movie.budget)}
                  </span>
                </div>
              )}

              {movie.revenue > 0 && (
                <div className={styles.page__detail}>
                  <span className={styles.page__detail__label}>Revenue</span>
                  <span className={styles.page__detail__value}>
                    {formatCurrency(movie.revenue)}
                  </span>
                </div>
              )}

              {movie.status && (
                <div className={styles.page__detail}>
                  <span className={styles.page__detail__label}>Status</span>
                  <span className={styles.page__detail__value}>{movie.status}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cast */}
        {displayedCast.length > 0 && (
          <div className={styles.page__cast}>
            <h2 className={styles.page__section__title}>Cast</h2>
            <div className={styles.page__cast__grid}>
              {displayedCast.map((castMember) => (
                <CastMember key={castMember.id} castMember={castMember} />
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  )
}
```

Create `src/pages/MovieDetailPage/MovieDetailPage.module.scss`:

```scss
@use '@/styles/abstracts/variables' as *;
@use '@/styles/abstracts/mixins' as *;

.page {
  position: relative;
  min-height: 100vh;
  padding-bottom: $spacing-2xl;
  
  &__backdrop {
    position: relative;
    width: 100%;
    height: 50vh;
    overflow: hidden;
    
    @include respond-to(tablet) {
      height: 60vh;
    }
    
    &__image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    &__overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        to bottom,
        transparent 0%,
        rgba($background-color, 0.7) 70%,
        $background-color 100%
      );
    }
  }
  
  &__nav {
    position: relative;
    z-index: 10;
    padding: $spacing-lg 0;
  }
  
  &__content {
    position: relative;
    z-index: 10;
    display: grid;
    gap: $spacing-xl;
    margin-top: -20vh;
    
    @include respond-to(tablet) {
      grid-template-columns: 300px 1fr;
      gap: $spacing-2xl;
      margin-top: -25vh;
    }
    
    @include respond-to(desktop) {
      grid-template-columns: 350px 1fr;
    }
  }
  
  &__poster {
    box-shadow: $shadow-xl;
    border-radius: $border-radius-lg;
    overflow: hidden;
  }
  
  &__info {
    display: flex;
    flex-direction: column;
    gap: $spacing-lg;
  }
  
  &__title {
    font-size: $font-size-2xl;
    font-weight: 700;
    color: $text-primary;
    line-height: 1.2;
    
    @include respond-to(tablet) {
      font-size: 3rem;
    }
  }
  
  &__tagline {
    font-size: $font-size-lg;
    color: $text-secondary;
    font-style: italic;
  }
  
  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-md;
    
    &__item {
      display: flex;
      align-items: center;
      gap: $spacing-xs;
      padding: $spacing-sm $spacing-md;
      background-color: rgba(255, 255, 255, 0.05);
      border-radius: $border-radius-md;
      font-size: $font-size-sm;
    }
    
    &__icon {
      font-size: $font-size-md;
    }
    
    &__label {
      color: $text-secondary;
    }
  }
  
  &__genres {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-sm;
  }
  
  &__genre {
    padding: $spacing-sm $spacing-md;
    background-color: $primary-color;
    color: $text-primary;
    border-radius: $border-radius-md;
    font-size: $font-size-sm;
    font-weight: 500;
  }
  
  &__section {
    &__title {
      font-size: $font-size-xl;
      font-weight: 600;
      color: $text-primary;
      margin-bottom: $spacing-md;
    }
  }
  
  &__overview {
    font-size: $font-size-md;
    line-height: 1.7;
    color: $text-secondary;
  }
  
  &__details {
    display: grid;
    gap: $spacing-md;
    
    @include respond-to(tablet) {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  &__detail {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-md;
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: $border-radius-md;
    
    &__label {
      font-size: $font-size-sm;
      color: $text-secondary;
    }
    
    &__value {
      font-size: $font-size-md;
      font-weight: 600;
      color: $text-primary;
    }
  }
  
  &__cast {
    position: relative;
    z-index: 10;
    margin-top: $spacing-2xl;
    
    &__grid {
      display: grid;
      gap: $spacing-lg;
      grid-template-columns: repeat(3, 1fr);
      
      @include respond-to(mobile-lg) {
        grid-template-columns: repeat(4, 1fr);
      }
      
      @include respond-to(tablet) {
        grid-template-columns: repeat(5, 1fr);
      }
      
      @include respond-to(desktop) {
        grid-template-columns: repeat(6, 1fr);
      }
      
      @include respond-to(desktop-lg) {
        grid-template-columns: repeat(8, 1fr);
      }
    }
  }
  
  &__error {
    @include flex-center;
    min-height: 60vh;
  }
}
```

Create `src/pages/MovieDetailPage/index.ts`:

```typescript
export { MovieDetailPage } from './MovieDetailPage'
```

### Step 7: Update HomePage with Search

Update `src/pages/HomePage/HomePage.tsx`:

```typescript
import { useState } from 'react'
import { Container } from '@/components/layout/Container'
import { TabBar } from '@/components/layout/TabBar'
import { SearchBar } from '@/components/features/SearchBar'
import { MovieGrid } from '@/components/features/MovieGrid'
import { ErrorMessage } from '@/components/common'
import { useMovies, useSearch } from '@/hooks'
import { MovieCategory, ViewMode } from '@/types'
import styles from './HomePage.module.scss'

export const HomePage = () => {
  const [activeTab, setActiveTab] = useState<MovieCategory>(MovieCategory.NOW_PLAYING)
  const [viewMode] = useState<ViewMode>(ViewMode.GRID)

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
    <div className={styles.page}>
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />

      <Container>
        <div className={styles.page__search}>
          <SearchBar
            value={query}
            onChange={setQuery}
            onClear={clearSearch}
            placeholder="Search movies..."
          />
        </div>

        {isSearchActive && (
          <div className={styles.page__search__info}>
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
            <MovieGrid
              movies={displayMovies}
              loading={displayLoading}
              hasMore={displayHasMore}
              onLoadMore={displayLoadMore}
            />
          )}
        </div>
      </Container>
    </div>
  )
}
```

Update `src/pages/HomePage/HomePage.module.scss`:

```scss
@use '@/styles/abstracts/variables' as *;
@use '@/styles/abstracts/mixins' as *;

.page {
  min-height: 100vh;
  
  &__search {
    padding: $spacing-xl 0 $spacing-lg;
    
    @include respond-to(tablet) {
      padding: $spacing-2xl 0 $spacing-xl;
    }
    
    &__info {
      padding: $spacing-md 0;
      text-align: center;
      color: $text-secondary;
      font-size: $font-size-sm;
    }
  }
  
  &__content {
    padding-bottom: $spacing-2xl;
  }
  
  &__error {
    @include flex-center;
    min-height: 60vh;
  }
}
```

### Step 8: Update App Routes

Update `src/App.tsx`:

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Header } from './components/layout/Header'
import { HomePage } from './pages/HomePage'
import { MovieDetailPage } from './pages/MovieDetailPage'
import { ROUTES } from './constants/routes.constants'

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.MOVIE_DETAIL} element={<MovieDetailPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

### Step 9: Update Features Index

Update `src/components/features/index.ts`:

```typescript
export { MovieCard } from './MovieCard'
export type { MovieCardProps } from './MovieCard'

export { MovieGrid } from './MovieGrid'
export type { MovieGridProps } from './MovieGrid'

export { MovieList } from './MovieList'
export type { MovieListProps } from './MovieList'

export { SearchBar } from './SearchBar'
export type { SearchBarProps } from './SearchBar'

export { CastMember } from './CastMember'
export type { CastMemberProps } from './CastMember'
```

### Step 10: Test Implementation

```bash
# Start dev server
npm run dev

# Test the following:
# 1. Search for movies
# 2. Click on a movie card to view details
# 3. View cast members
# 4. Navigate back to home
# 5. Test on mobile devices
```

## Verification Checklist

- [ ] Search bar accepts input
- [ ] Search results display after typing (debounced)
- [ ] Search loads more results
- [ ] Clear button clears search
- [ ] Clicking a movie navigates to detail page
- [ ] Movie details display correctly
- [ ] Backdrop image displays
- [ ] Cast members display
- [ ] Back button works
- [ ] Loading states show during API calls
- [ ] Error states display properly
- [ ] Responsive on all screen sizes

## Common Issues & Solutions

### Issue 1: Search Not Working
**Solution**:
- Check debounce implementation
- Verify search API endpoint
- Check for console errors

### Issue 2: Movie Detail Not Loading
**Solution**:
- Verify movieId is being parsed correctly
- Check API response in network tab
- Ensure credits are being fetched

### Issue 3: Images Not Loading on Detail Page
**Solution**:
- Verify image URLs
- Check backdrop and poster paths
- Test with different movies

## Next Steps

Proceed to **Phase 6: State Management & Error Handling** where we'll:
- Implement Error Boundary
- Create App Context
- Add view mode toggle
- Enhance error handling

## Resources

- [React Router Params](https://reactrouter.com/en/main/hooks/use-params)
- [Debouncing in React](https://www.developerway.com/posts/debouncing-in-react)
- [TMDB Movie Details API](https://developers.themoviedb.org/3/movies/get-movie-details)

