import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from './contexts/ErrorBoundary'
import { Header } from './components/layout/Header'
import { HomePage } from './pages/HomePage'
import { MovieDetailPage } from './pages/MovieDetailPage'
import { UpcomingMoviesPage } from './pages/UpcomingMoviesPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ROUTES } from './constants/routes.constants'

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.UPCOMING} element={<UpcomingMoviesPage />} />
          <Route path={ROUTES.MOVIE_DETAIL} element={<MovieDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
