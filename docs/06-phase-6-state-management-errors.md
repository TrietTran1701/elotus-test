# Phase 6: State Management & Error Handling

**Duration**: 4-5 hours  
**Difficulty**: Medium  
**Prerequisites**: Phase 1-5 completed

## Overview

This phase implements global state management using React Context and enhances error handling with Error Boundaries. We'll also add view mode toggling and improve overall app resilience.

## Objectives

- [ ] Create Error Boundary component
- [ ] Implement App Context for global state
- [ ] Add view mode toggle (Grid/List)
- [ ] Enhance error handling across the app
- [ ] Add NotFound page
- [ ] Implement proper error recovery
- [ ] Add user preferences persistence

## Step-by-Step Instructions

### Step 1: Create Error Boundary

Create `src/contexts/ErrorBoundary.tsx`:

```typescript
import { Component, ReactNode, ErrorInfo } from 'react'
import { ErrorMessage } from '@/components/common'
import styles from './ErrorBoundary.module.scss'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error Boundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo,
    })
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
    
    // Optionally reload the page
    window.location.href = '/'
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className={styles.errorBoundary}>
          <ErrorMessage
            message={
              this.state.error?.message ||
              'Something went wrong. Please try refreshing the page.'
            }
            onRetry={this.handleReset}
            fullScreen
          />
          
          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <details className={styles.errorBoundary__details}>
              <summary>Error Details (Development Only)</summary>
              <pre>{this.state.errorInfo.componentStack}</pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
```

Create `src/contexts/ErrorBoundary.module.scss`:

```scss
@use '@/styles/abstracts/variables' as *;

.errorBoundary {
  &__details {
    position: fixed;
    bottom: $spacing-lg;
    left: $spacing-lg;
    right: $spacing-lg;
    max-width: 800px;
    margin: 0 auto;
    padding: $spacing-md;
    background-color: $surface-color;
    border: 1px solid $error-color;
    border-radius: $border-radius-md;
    color: $text-primary;
    font-size: $font-size-xs;
    z-index: 9999;
    
    summary {
      cursor: pointer;
      font-weight: 600;
      margin-bottom: $spacing-sm;
    }
    
    pre {
      overflow: auto;
      max-height: 200px;
      padding: $spacing-sm;
      background-color: rgba(0, 0, 0, 0.3);
      border-radius: $border-radius-sm;
      font-size: $font-size-xs;
      line-height: 1.4;
    }
  }
}
```

### Step 2: Create App Context

Create `src/contexts/AppContext.tsx`:

```typescript
import { createContext, useContext, ReactNode, useState, useCallback } from 'react'
import { ViewMode } from '@/types'

interface AppContextType {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  toggleViewMode: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

interface AppProviderProps {
  children: ReactNode
}

const STORAGE_KEY = 'movies_app_preferences'

const getStoredViewMode = (): ViewMode => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const preferences = JSON.parse(stored) as { viewMode: ViewMode }
      return preferences.viewMode
    }
  } catch (error) {
    console.error('Failed to load preferences:', error)
  }
  return ViewMode.GRID
}

const saveViewMode = (mode: ViewMode): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ viewMode: mode }))
  } catch (error) {
    console.error('Failed to save preferences:', error)
  }
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [viewMode, setViewModeState] = useState<ViewMode>(getStoredViewMode())

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode)
    saveViewMode(mode)
  }, [])

  const toggleViewMode = useCallback(() => {
    const newMode = viewMode === ViewMode.GRID ? ViewMode.LIST : ViewMode.GRID
    setViewMode(newMode)
  }, [viewMode, setViewMode])

  return (
    <AppContext.Provider
      value={{
        viewMode,
        setViewMode,
        toggleViewMode,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider')
  }
  return context
}
```

### Step 3: Create ViewModeToggle Component

Create `src/components/common/ViewModeToggle/ViewModeToggle.tsx`:

```typescript
import { ViewMode } from '@/types'
import styles from './ViewModeToggle.module.scss'

export interface ViewModeToggleProps {
  value: ViewMode
  onChange: (mode: ViewMode) => void
}

export const ViewModeToggle = ({ value, onChange }: ViewModeToggleProps) => {
  return (
    <div className={styles.toggle}>
      <button
        className={`${styles.toggle__button} ${
          value === ViewMode.GRID ? styles['toggle__button--active'] : ''
        }`}
        onClick={() => onChange(ViewMode.GRID)}
        aria-label="Grid view"
        aria-pressed={value === ViewMode.GRID}
      >
        <span className={styles.toggle__icon}>⊞</span>
      </button>
      
      <button
        className={`${styles.toggle__button} ${
          value === ViewMode.LIST ? styles['toggle__button--active'] : ''
        }`}
        onClick={() => onChange(ViewMode.LIST)}
        aria-label="List view"
        aria-pressed={value === ViewMode.LIST}
      >
        <span className={styles.toggle__icon}>☰</span>
      </button>
    </div>
  )
}
```

Create `src/components/common/ViewModeToggle/ViewModeToggle.module.scss`:

```scss
@use '@/styles/abstracts/variables' as *;
@use '@/styles/abstracts/mixins' as *;

.toggle {
  display: flex;
  gap: $spacing-xs;
  padding: $spacing-xs;
  background-color: $surface-color;
  border-radius: $border-radius-md;
  
  &__button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background-color: transparent;
    color: $text-secondary;
    border: none;
    border-radius: $border-radius-sm;
    cursor: pointer;
    transition: all $transition-fast;
    
    @include focus-visible;
    
    &:hover:not(&--active) {
      background-color: rgba(255, 255, 255, 0.05);
      color: $text-primary;
    }
    
    &--active {
      background-color: $primary-color;
      color: $text-primary;
    }
  }
  
  &__icon {
    font-size: $font-size-lg;
  }
}
```

Create `src/components/common/ViewModeToggle/index.ts`:

```typescript
export { ViewModeToggle } from './ViewModeToggle'
export type { ViewModeToggleProps } from './ViewModeToggle'
```

### Step 4: Update Common Components Index

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
```

### Step 5: Create NotFound Page

Create `src/pages/NotFoundPage/NotFoundPage.tsx`:

```typescript
import { useNavigate } from 'react-router-dom'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/common'
import { ROUTES } from '@/constants/routes.constants'
import styles from './NotFoundPage.module.scss'

export const NotFoundPage = () => {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <Container>
        <div className={styles.page__content}>
          <div className={styles.page__icon}>🎬</div>
          <h1 className={styles.page__title}>404</h1>
          <p className={styles.page__message}>Page Not Found</p>
          <p className={styles.page__description}>
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className={styles.page__actions}>
            <Button onClick={() => navigate(ROUTES.HOME)} variant="primary" size="large">
              Go Home
            </Button>
            <Button onClick={() => navigate(-1)} variant="ghost" size="large">
              Go Back
            </Button>
          </div>
        </div>
      </Container>
    </div>
  )
}
```

Create `src/pages/NotFoundPage/NotFoundPage.module.scss`:

```scss
@use '@/styles/abstracts/variables' as *;
@use '@/styles/abstracts/mixins' as *;

.page {
  @include flex-center;
  min-height: 80vh;
  
  &__content {
    @include flex-center;
    @include flex-column;
    gap: $spacing-lg;
    text-align: center;
    max-width: 500px;
    padding: $spacing-2xl;
  }
  
  &__icon {
    font-size: 5rem;
    opacity: 0.5;
  }
  
  &__title {
    font-size: 4rem;
    font-weight: 700;
    color: $text-primary;
    
    @include respond-to(tablet) {
      font-size: 6rem;
    }
  }
  
  &__message {
    font-size: $font-size-xl;
    font-weight: 600;
    color: $text-primary;
  }
  
  &__description {
    font-size: $font-size-md;
    color: $text-secondary;
    line-height: 1.6;
  }
  
  &__actions {
    display: flex;
    gap: $spacing-md;
    margin-top: $spacing-lg;
  }
}
```

Create `src/pages/NotFoundPage/index.ts`:

```typescript
export { NotFoundPage } from './NotFoundPage'
```

### Step 6: Update HomePage with View Mode

Update `src/pages/HomePage/HomePage.tsx`:

```typescript
import { useState } from 'react'
import { Container } from '@/components/layout/Container'
import { TabBar } from '@/components/layout/TabBar'
import { SearchBar } from '@/components/features/SearchBar'
import { MovieGrid } from '@/components/features/MovieGrid'
import { MovieList } from '@/components/features/MovieList'
import { ErrorMessage, ViewModeToggle } from '@/components/common'
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
    <div className={styles.page}>
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />

      <Container>
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
            <MovieList
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
  
  &__controls {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
    padding: $spacing-xl 0 $spacing-lg;
    
    @include respond-to(tablet) {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: $spacing-2xl 0 $spacing-xl;
    }
  }
  
  &__search {
    flex: 1;
    
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

### Step 7: Update App with Context and Error Boundary

Update `src/App.tsx`:

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from './contexts/ErrorBoundary'
import { AppProvider } from './contexts/AppContext'
import { Header } from './components/layout/Header'
import { HomePage } from './pages/HomePage'
import { MovieDetailPage } from './pages/MovieDetailPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ROUTES } from './constants/routes.constants'

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path={ROUTES.HOME} element={<HomePage />} />
            <Route path={ROUTES.MOVIE_DETAIL} element={<MovieDetailPage />} />
            <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  )
}

export default App
```

### Step 8: Add Global Error Handling Utility

Create `src/utils/errorHandling.ts`:

```typescript
import type { ErrorState } from '@/types'

export const createErrorState = (error: unknown): ErrorState => {
  if (error instanceof Error) {
    return {
      message: error.message,
      details: error,
    }
  }

  if (typeof error === 'string') {
    return {
      message: error,
    }
  }

  return {
    message: 'An unknown error occurred',
    details: error,
  }
}

export const logError = (error: unknown, context?: string): void => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`Error${context ? ` in ${context}` : ''}:`, error)
  }

  // In production, you might want to send errors to a logging service
  // Example: Sentry, LogRocket, etc.
}

export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return (
      error.message.includes('Network') ||
      error.message.includes('fetch') ||
      error.message.includes('timeout')
    )
  }
  return false
}
```

### Step 9: Create Contexts Index

Create `src/contexts/index.ts`:

```typescript
export { ErrorBoundary } from './ErrorBoundary'
export { AppProvider, useAppContext } from './AppContext'
```

### Step 10: Update Utils Index

Create `src/utils/index.ts`:

```typescript
export * from './formatters'
export * from './errorHandling'
```

### Step 11: Test Implementation

```bash
# Start dev server
npm run dev

# Test the following:
# 1. Toggle between grid and list view
# 2. Verify preference is saved (refresh page)
# 3. Navigate to invalid route (test 404 page)
# 4. Test error boundary by simulating an error
# 5. Test error recovery
```

## Verification Checklist

- [ ] Error Boundary catches and displays errors
- [ ] App Context provides global state
- [ ] View mode toggle works
- [ ] View mode preference persists
- [ ] NotFound page displays for invalid routes
- [ ] Error messages are user-friendly
- [ ] Error recovery works properly
- [ ] localStorage works correctly

## Common Issues & Solutions

### Issue 1: Context Not Available
**Solution**:
- Ensure AppProvider wraps the entire app
- Check hook usage is inside provider

### Issue 2: View Mode Not Persisting
**Solution**:
- Check localStorage is enabled
- Verify JSON serialization
- Check browser privacy settings

### Issue 3: Error Boundary Not Catching Errors
**Solution**:
- Error boundaries don't catch async errors
- Use try/catch in async functions
- Ensure error is thrown, not just logged

## Next Steps

Proceed to **Phase 7: Advanced Features & Optimizations** where we'll:
- Enhance animations and transitions
- Implement additional optimizations
- Add advanced features
- Polish user experience

## Resources

- [Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [React Context](https://react.dev/learn/passing-data-deeply-with-context)
- [LocalStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

