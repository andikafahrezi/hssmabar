import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import useSessionStore from '../store/sessionStore'
import { generateMatches } from '../utils/generateMatches'

const FORMATS = [
  { id: 'americano', label: 'Americano',    desc: 'Partner berganti tiap ronde', icon: '🔄' },
  { id: 'singles',   label: 'Singles',      desc: 'Satu lawan satu',             icon: '🧍' },
  { id: 'mixed',     label: 'Mixed',        desc: 'Pria + Wanita',               icon: '👫' },
  { id: 'fixed',     label: 'Fixed Doubles',desc: 'Tim tetap',                   icon: '👥' },
]

function Setup() {
  const navigate = useNavigate()
  const [nameInput, setNameInput] = useState('')
  const [gender, setGender]       = useState('male')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')

  const {
    sessionName, setSessionName,
    format, setFormat,
    players, addPlayer, removePlayer, editPlayerName,
    targetScore, setTargetScore,
    sessionStarted,
    startSession, setMatches,
  } = useSessionStore()

  function handleAddPlayer() {
    const name = nameInput.trim()
    if (!name) return
    if (players.find(p => p.name.toLowerCase() === name.toLowerCase())) {
      alert('Nama pemain sudah ada!')
      return
    }
    addPlayer({ id: Date.now(), name, gender })
    setNameInput('')
  }

  function startEditName(player) {
    setEditingId(player.id)
    setEditingName(player.name)
  }

  function confirmEditName(id) {
    const newName = editingName.trim()
    if (!newName) return
    if (players.find(p => p.name.toLowerCase() === newName.toLowerCase() && p.id !== id)) {
      alert('Nama sudah dipakai pemain lain!')
      return
    }
    editPlayerName(id, newName)
    setEditingId(null)
    setEditingName('')
  }

  function handleStart() {
    if (!format) return alert('Pilih format permainan dulu!')
    if (players.length < 2) return alert('Minimal 2 pemain!')
    if (format === 'americano' && players.length < 4)
      return alert('Format Americano butuh minimal 4 pemain!')

    const generated = generateMatches(format, players)
    setMatches(generated)
    startSession()
    navigate('/game')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto">
      <Header sessionFinished={false} />

      <div className="flex-1 px-5 py-5 flex flex-col gap-6 pb-10">

        {/* ── Nama Sesi ── */}
        <div>
          <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3">
            Nama Sesi / Turnamen
          </p>
          <input
            type="text"
            placeholder="cth: Mabar Sabtu Pagi 🏸"
            value={sessionName}
            onChange={e => setSessionName(e.target.value)}
            className="w-full bg-white border-2 border-gray-200 rounded-2xl px-4 py-3.5 text-gray-800 font-semibold outline-none focus:border-green-400 transition-colors placeholder-gray-300"
          />
        </div>

        {/* ── Format ── */}
        <div>
          <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3">
            Format Permainan
          </p>
          <div className="grid grid-cols-2 gap-3">
            {FORMATS.map(f => (
              <button
                key={f.id}
                onClick={() => setFormat(f.id)}
                className={`p-4 rounded-2xl border-2 text-left transition-all active:scale-95 ${
                  format === f.id
                    ? 'border-green-600 bg-green-50 shadow-sm'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="text-2xl mb-2">{f.icon}</div>
                <div className={`font-bold text-sm ${
                  format === f.id ? 'text-green-700' : 'text-gray-700'
                }`}>
                  {f.label}
                </div>
                <div className="text-gray-400 text-xs mt-0.5">{f.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Target Poin ── */}
        <div>
          <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3">
            Target Poin
          </p>
          <div className="flex gap-3">
            {[11, 15, 21].map(n => (
              <button
                key={n}
                onClick={() => setTargetScore(n)}
                className={`flex-1 py-3 rounded-2xl font-bold text-lg transition-all active:scale-95 ${
                  targetScore === n
                    ? 'bg-yellow-400 text-green-900 shadow-sm'
                    : 'bg-white border-2 border-gray-200 text-gray-400'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* ── Pemain ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-gray-400 tracking-widest uppercase">
              Pemain
            </p>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
              {players.length} orang
            </span>
          </div>

          {format === 'americano' && players.length < 4 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-3">
              <span>⚡</span>
              <p className="text-xs text-amber-700 font-medium">
                Americano butuh minimal 4 pemain
              </p>
            </div>
          )}

          {/* Input box */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-3 mb-3 focus-within:border-green-400 transition-colors">
            <input
              type="text"
              placeholder="Nama pemain..."
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddPlayer()}
              className="w-full text-gray-800 font-medium outline-none text-base placeholder-gray-300 mb-3 bg-transparent"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setGender('male')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                  gender === 'male'
                    ? 'bg-blue-50 text-blue-700 border-2 border-blue-200'
                    : 'bg-gray-100 text-gray-400 border-2 border-transparent'
                }`}
              >
                <span>👦</span> Male
              </button>
              <button
                onClick={() => setGender('female')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                  gender === 'female'
                    ? 'bg-pink-50 text-pink-600 border-2 border-pink-200'
                    : 'bg-gray-100 text-gray-400 border-2 border-transparent'
                }`}
              >
                <span>👧</span> Female
              </button>
              <button
                onClick={handleAddPlayer}
                className="bg-green-800 text-white font-black px-5 rounded-xl active:scale-95 transition-transform text-sm"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Daftar pemain */}
          <div className="flex flex-col gap-2">
            {players.map((p, i) => (
              <div
                key={p.id}
                className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm"
              >
                {editingId === p.id ? (
                  /* Mode edit nama */
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{p.gender === 'female' ? '👧' : '👦'}</span>
                    <input
                      autoFocus
                      type="text"
                      value={editingName}
                      onChange={e => setEditingName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') confirmEditName(p.id)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      className="flex-1 border-b-2 border-green-400 outline-none font-semibold text-gray-800 bg-transparent py-0.5"
                    />
                    <button
                      onClick={() => confirmEditName(p.id)}
                      className="text-green-600 font-black text-sm px-2"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-gray-400 font-black text-sm px-1"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  /* Mode normal */
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-green-400 font-black text-sm w-5 text-center">
                        {i + 1}
                      </span>
                      <span className="text-lg">
                        {p.gender === 'female' ? '👧' : '👦'}
                      </span>
                      <span className="font-semibold text-gray-800">{p.name}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        p.gender === 'female'
                          ? 'bg-pink-100 text-pink-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {p.gender === 'female' ? 'F' : 'M'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {/* Tombol edit nama */}
                      <button
                        onClick={() => startEditName(p)}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 text-sm active:scale-95"
                      >
                        ✏️
                      </button>
                      {/* Tombol hapus — disable kalau sesi sudah mulai */}
                      {!sessionStarted && (
                        <button
                          onClick={() => removePlayer(p.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-full bg-red-50 text-red-400 font-bold text-lg leading-none active:scale-95"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {players.length === 0 && (
              <div className="text-center py-8">
                <p className="text-4xl mb-2">👥</p>
                <p className="text-gray-400 text-sm">
                  Belum ada pemain.<br />
                  Tambahkan minimal {format === 'americano' ? '4' : '2'} orang.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Tombol Mulai / Info sudah mulai ── */}
        {sessionStarted ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
            <p className="text-green-700 font-bold text-sm mb-1">
              ✓ Sesi sedang berjalan
            </p>
            <p className="text-green-500 text-xs">
              Kamu masih bisa edit nama pemain di atas.
              <br />Hapus pemain tidak bisa setelah sesi dimulai.
            </p>
          </div>
        ) : (
          <button
            onClick={handleStart}
            className="w-full bg-green-800 text-white font-black text-lg py-4 rounded-2xl shadow-lg active:scale-95 transition-transform"
          >
            Mulai Main 🏸
          </button>
        )}

      </div>
    </div>
  )
}

export default Setup