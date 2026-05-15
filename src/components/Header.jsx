import { CaretLeft } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import TabBar from './TabBar'
import logo from '../assets/logohssmabar.svg'

function Header({ sessionFinished = false, backTo = '/', showTabs = true }) {
  const navigate = useNavigate()

  return (
    <header className="px-5 pb-3 pt-12">
      <div className="relative mb-5 flex items-center justify-center">
        <button
          type="button"
          aria-label="Kembali"
          onClick={() => navigate(backTo)}
          className="absolute left-0 flex h-9 w-9 items-center justify-center rounded-full text-[#324232] transition hover:bg-[#edf4e7]"
        >
          <CaretLeft size={18} weight="bold" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center justify-center"
        >
          <img src={logo} alt="HSS Mabar" className="h-6 w-auto" />
        </button>
      </div>

      {showTabs ? <TabBar sessionFinished={sessionFinished} /> : null}
    </header>
  )
}

export default Header
