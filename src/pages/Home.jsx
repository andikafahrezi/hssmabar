import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.svg'

function Home() {
  const navigate = useNavigate()
  const [joinCode, setJoinCode] = useState('')
  const [showJoin, setShowJoin] = useState(false)

  return (
    <div className="min-h-screen bg-green-900 flex flex-col items-center justify-center px-6">

      {/* Logo & Judul */}
      <div className="text-center mb-12">
        <img src={logo} alt="HSS Mabar" className="w-24 h-24 mx-auto mb-4" />
        <h1 className="text-5xl font-black text-white tracking-tight">
          HSS
        </h1>
        <h1 className="text-5xl font-black text-yellow-400 tracking-tight">
          Mabar
        </h1>
        <p className="text-green-300 mt-3 text-sm">
          Ora usah CaCiCu langsung aja di gaskeun!
        </p>
      </div>

      {/* Tombol Buat Sesi */}
      <button
        onClick={() => navigate('/setup')}
        className="w-full max-w-sm bg-yellow-400 text-green-900 font-bold text-lg py-4 rounded-2xl shadow-lg active:scale-95 transition-transform"
      >
        🎮 Buat Sesi Baru
      </button>

      {/* Tombol Gabung Sesi */}
      <div className="w-full max-w-sm mt-4">
        {!showJoin ? (
          <button
            onClick={() => setShowJoin(true)}
            className="w-full border-2 border-green-400 text-green-300 font-bold text-lg py-4 rounded-2xl active:scale-95 transition-transform"
          >
            🔗 Gabung Sesi
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Masukkan kode sesi..."
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="w-full bg-green-800 text-white placeholder-green-500 border-2 border-green-400 rounded-2xl px-5 py-4 text-lg font-bold tracking-widest outline-none"
              maxLength={6}
            />
            <button
              onClick={() => alert(`Gabung dengan kode: ${joinCode}`)}
              className="w-full bg-green-400 text-green-900 font-bold text-lg py-4 rounded-2xl active:scale-95 transition-transform"
            >
              Masuk →
            </button>
            <button
              onClick={() => setShowJoin(false)}
              className="text-green-500 text-sm text-center"
            >
              Batal
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="text-green-600 text-xs mt-16">
        Gak usah login der · Langsung generate permainan 🏸
      </p>

    </div>
  )
}

export default Home