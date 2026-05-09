import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Setup from './pages/Setup'
import Game from './pages/Game'
import Leaderboard from './pages/Leaderboard'
import Result from './pages/Result'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/game" element={<Game />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/result" element={<Result />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App