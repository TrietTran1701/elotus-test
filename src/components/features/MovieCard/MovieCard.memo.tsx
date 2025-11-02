import { memo } from 'react'
import { MovieCard } from './MovieCard'
import type { MovieCardProps } from './MovieCard'

export const MovieCardMemo = memo<MovieCardProps>(MovieCard, (prevProps, nextProps) => {
  return prevProps.movie.id === nextProps.movie.id
})

