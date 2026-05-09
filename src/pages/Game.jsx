import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateMatches } from '../utils/generateMatches'
import Header from '../components/Header'

function Game() {
  const navigate = useNavigate()
  const [matches, setMatches] = useState([])
  const [session, setSession] = useState(null)
  const [currentRound, setCurrentRound] = useState(0)
  const [scoreInputA, setScoreInputA] = useState('')
  const [scoreInputB, setScoreInputB] = useState('')
  const [sessionFinished, setSessionFinished] = useState(
    localStorage.getItem('shuttlemabar_finished') === 'true'
  )

  useEffect(() => {
    const saved = localStorage.getItem('shuttlemabar_session')
    if (!saved) return navigate('/')
    const s = JSON.parse(saved)
    setSession(s)
    const generated = generateMatches(s.format, s.players)
    setMatches(generated)
  }, [])

  if (!session || matches.length === 0) {
    return (
      <div className="min-h-screen bg-green-900 flex items-center justify-center">
        <p className="text-white text-lg">Memuat sesi...</p>
      </div>
    )
  }

  const match = matches[currentRound]
  const isLast = currentRound === matches.length - 1

  const donCount = matches.filter(m => m.status === 'done').length
  const pendingCount = matches.filter(m => m.status === 'pending').length
  const activeCount = matches.filter(m => m.status === 'active').length

  function handleSubmit() {
    const sA = parseInt(scoreInputA)
    const sB = parseInt(scoreInputB)

    if (isNaN(sA) || isNaN(sB)) return alert('Masukkan skor untuk kedua tim!')
    if (sA < 0 || sB < 0) return alert('Skor tidak boleh minus!')

    const updated = matches.map((m, i) =>
      i === currentRound
        ? { ...m, scoreA: sA, scoreB: sB, status: 'done' }
        : i === currentRound + 1
        ? { ...m, status: 'active' }
        : m
    )
    setMatches(updated)
    setScoreInputA('')
    setScoreInputB('')

    if (isLast) {
      localStorage.setItem('shuttlemabar_matches', JSON.stringify(updated))
      navigate('/leaderboard')
    } else {
      setCurrentRound(currentRound + 1)
    }
  }

  function handlePostpone() {
    if (isLast) return alert('Ini match terakhir, tidak bisa dilewati!')
    setCurrentRound(currentRound + 1)
    setScoreInputA('')
    setScoreInputB('')
  }

  function handleFinishSession() {
    const confirm = window.confirm(
        'Akhiri sesi sekarang? Leaderboard akan dihitung dari match yang sudah selesai.'
    )
    if (!confirm) return
    localStorage.setItem('shuttlemabar_matches', JSON.stringify(matches))
    localStorage.setItem('shuttlemabar_finished', 'true')
    setSessionFinished(true)
    navigate('/leaderboard')
  }

  // Pemain yang tidak main di ronde ini
  const playingIds = [
    ...match.teamA.map(p => p.id),
    ...match.teamB.map(p => p.id),
  ]
  const notPlaying = session.players.filter(p => !playingIds.includes(p.id))

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col max-w-md mx-auto">

      {/* Header */}
      <Header sessionFinished={sessionFinished} />

      {/* Status bar */}
      <div className="bg-white px-5 py-3 flex gap-2 overflow-x-auto border-b border-gray-200">
        <span className="bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
          {activeCount + (match.status !== 'done' ? 1 : 0)} Active
        </span>
        <span className="bg-gray-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
          {donCount} Done
        </span>
        <span className="bg-gray-100 text-yellow-600 text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
          0 Delayed
        </span>
        <span className="bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
          {pendingCount} Pending
        </span>
      </div>

      {/* Navigasi ronde */}
      <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
        <button
          onClick={() => currentRound > 0 && setCurrentRound(currentRound - 1)}
          className={`w-10 h-10 rounded-xl border-2 font-bold text-lg flex items-center justify-center transition-all ${
            currentRound > 0
              ? 'border-gray-300 text-gray-600 active:scale-95'
              : 'border-gray-100 text-gray-300'
          }`}
        >
          ‹
        </button>
        <h2 className="font-black text-green-900 text-lg">
          Match {currentRound + 1} / {matches.length}
        </h2>
        <button
          onClick={() => currentRound < matches.length - 1 && setCurrentRound(currentRound + 1)}
          className={`w-10 h-10 rounded-xl border-2 font-bold text-lg flex items-center justify-center transition-all ${
            currentRound < matches.length - 1
              ? 'border-gray-300 text-gray-600 active:scale-95'
              : 'border-gray-100 text-gray-300'
          }`}
        >
          ›
        </button>
      </div>

      <div className="flex-1 px-5 py-4 flex flex-col gap-4">

        {/* Kartu Match */}
        <div className="bg-green-800 rounded-3xl overflow-hidden shadow-lg">

          {/* Match header */}
          <div className="px-5 py-3 flex items-center justify-between">
            <span className="text-yellow-400 font-black text-base">
              Match {currentRound + 1}
            </span>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              match.status === 'done'
                ? 'bg-green-600 text-white'
                : 'bg-yellow-400 text-green-900'
            }`}>
              {match.status === 'done' ? '✓ Selesai' : '● Berlangsung'}
            </span>
          </div>

          {/* Tim A vs Tim B */}
          <div className="bg-white mx-4 mb-4 rounded-2xl p-4">
            <div className="grid grid-cols-3 gap-2 items-center mb-4">
              {/* Tim A */}
              <div className="text-center">
                <p className="text-green-600 font-bold text-xs mb-2">Tim A</p>
                <div className="bg-green-50 rounded-xl p-2">
                  {match.teamA.map(p => (
                    <p key={p.id} className="font-bold text-green-900 text-sm">{p.name}</p>
                  ))}
                </div>
              </div>

              {/* VS */}
              <div className="text-center">
                <div className="text-3xl mb-1">🏆</div>
                <p className="text-gray-400 font-bold text-xs">vs</p>
              </div>

              {/* Tim B */}
              <div className="text-center">
                <p className="text-red-500 font-bold text-xs mb-2">Tim B</p>
                <div className="bg-red-50 rounded-xl p-2">
                  {match.teamB.map(p => (
                    <p key={p.id} className="font-bold text-green-900 text-sm">{p.name}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* Input Skor */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <p className="text-gray-500 text-xs font-medium mb-1">Skor Tim A</p>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={scoreInputA}
                  onChange={e => setScoreInputA(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-center text-2xl font-black text-green-900 outline-none focus:border-green-500"
                />
              </div>
              <div>
                <p className="text-gray-500 text-xs font-medium mb-1">Skor Tim B</p>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={scoreInputB}
                  onChange={e => setScoreInputB(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-center text-2xl font-black text-green-900 outline-none focus:border-red-400"
                />
              </div>
            </div>

            {/* Tombol aksi */}
            <div className="flex gap-2">
              <button
                onClick={() => { setScoreInputA(''); setScoreInputB('') }}
                className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-lg active:scale-95 transition-transform"
              >
                🔄
              </button>
              <button
                onClick={handlePostpone}
                className="flex-1 bg-yellow-50 border-2 border-yellow-300 text-yellow-700 font-bold py-3 rounded-xl active:scale-95 transition-transform text-sm"
              >
                ⏱ Lewati
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-green-700 text-white font-bold py-3 rounded-xl active:scale-95 transition-transform text-sm shadow"
              >
                ✓ Submit
              </button>
            </div>
          </div>
        </div>

        {/* Tidak main ronde ini */}
        {notPlaying.length > 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <p className="text-blue-700 font-bold text-sm mb-2">
              Tidak Main Ronde Ini ({notPlaying.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {notPlaying.map(p => (
                <span key={p.id} className="bg-white border border-blue-200 text-blue-600 text-sm font-medium px-3 py-1 rounded-full">
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tombol aksi bawah */}
        <div className="flex flex-col gap-3">
        {/* Akhiri sesi kapanpun */}
        <button
            onClick={handleFinishSession}
            className="w-full bg-red-50 border-2 border-red-200 text-red-500 font-bold text-sm py-3 rounded-2xl active:scale-95 transition-transform"
        >
            🏁 Akhiri Sesi & Lihat Leaderboard
        </button>

        {/* Lihat leaderboard kalau match terakhir */}
        {isLast && (
            <button
            onClick={() => {
                localStorage.setItem('shuttlemabar_matches', JSON.stringify(matches))
                localStorage.setItem('shuttlemabar_finished', 'true')
                navigate('/leaderboard')
            }}
            className="w-full bg-yellow-400 text-green-900 font-black text-lg py-4 rounded-2xl shadow active:scale-95 transition-transform"
            >
            🏆 Selesai & Lihat Leaderboard
            </button>
        )}
        </div>

      </div>
    </div>
  )
}

export default Game