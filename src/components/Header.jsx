import { useNavigate } from 'react-router-dom'
import TabBar from './TabBar'
import logo from '../assets/logo.svg'

function Header({ sessionFinished = false }) {
  const navigate = useNavigate()

  return (
    <div className="bg-green-900 px-5 pt-12 pb-0">
      {/* Logo */}
      <div className="flex items-center justify-between mb-4 px-1">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <img src={logo} alt="HSS Mabar" className="w-6 h-6" />
          <span className="text-white font-black text-lg tracking-tight">
            HSS<span className="text-yellow-400">Mabar</span>
          </span>
        </button>
      </div>

      {/* Tab bar */}
      <TabBar sessionFinished={sessionFinished} />
    </div>
  )
}

export default Header
