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
