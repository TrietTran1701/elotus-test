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

