export const ROUTES = {
  HOME: '/',
  MOVIE_DETAIL: '/movie/:id',
  UPCOMING: '/upcoming',
  POPULAR: '/popular',
  NOT_FOUND: '*',
} as const

export const buildMovieDetailRoute = (id: number): string => {
  return `/movie/${id}`
}

