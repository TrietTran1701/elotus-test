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
          <MovieCard key={movie.id} movie={movie} variant="list" />
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

