export const ROUTES = {
  HOME: '/',
  MOVIE_DETAIL: '/movie/:id',
  NOT_FOUND: '*',
} as const

export const buildMovieDetailRoute = (id: number): string => {
  return `/movie/${id}`
}

