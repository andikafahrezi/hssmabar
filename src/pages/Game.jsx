import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import useSessionStore from '../store/sessionStore'

function Game() {
  const navigate = useNavigate()
  const [currentRound, setCurrentRound] = useState(0)
  const [scoreInputA, setScoreInputA]   = useState('')
  const [scoreInputB, setScoreInputB]   = useState('')
  const [showFinishModal, setShowFinishModal] = useState(false)

  const {
    format, players, targetScore, sessionName,
    matches, setMatches,
    sessionFinished, finishSession,
  } = useSessionStore()

  useEffect(() => {
    if (!format || players.length === 0) navigate('/setup')
  }, [])

  if (!format || matches.length === 0) {
    return (
      <div className="min-h-screen bg-green-900 flex items-center justify-center">
        <p className="text-white text-lg">Memuat sesi...</p>
      </div>
    )
  }

  const match   = matches[currentRound]
  const isLast  = currentRound === matches.length - 1
  const doneCount    = matches.filter(m => m.status === 'done').length
  const pendingCount = matches.filter(m => m.status === 'pending').length

  function handleSubmit() {
    const sA = parseInt(scoreInputA)
    const sB = parseInt(scoreInputB)
    if (isNaN(sA) || isNaN(sB)) return alert('Masukkan skor untuk kedua tim!')
    if (sA < 0 || sB < 0)       return alert('Skor tidak boleh minus!')

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
      finishSession()
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
    setShowFinishModal(true)
  }

  function confirmFinishSession() {
    finishSession()
    navigate('/leaderboard')
  }

  // Pemain yang tidak main ronde ini
  const playingIds   = [...match.teamA, ...match.teamB].map(p => p.id)
  const sittingOut   = match.sittingOut?.length > 0
    ? match.sittingOut
    : players.filter(p => !playingIds.includes(p.id))

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col max-w-md mx-auto">

      <Header sessionFinished={sessionFinished} />

      {/* Status bar */}
      <div className="bg-white px-5 py-3 flex gap-2 overflow-x-auto border-b border-gray-100">
        <span className="bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
          ● Active
        </span>
        <span className="bg-gray-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
          {doneCount} Done
        </span>
        <span className="bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
          {pendingCount} Pending
        </span>
        {sessionName ? (
          <span className="ml-auto bg-yellow-50 text-yellow-700 text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap border border-yellow-200">
            🏸 {sessionName}
          </span>
        ) : null}
      </div>

      {/* Navigasi ronde */}
      <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
        <button
          onClick={() => {
            if (currentRound > 0) {
              setCurrentRound(currentRound - 1)
              setScoreInputA('')
              setScoreInputB('')
            }
          }}
          className={`w-10 h-10 rounded-xl border-2 font-bold text-lg flex items-center justify-center transition-all ${
            currentRound > 0
              ? 'border-gray-300 text-gray-600 active:scale-95'
              : 'border-gray-100 text-gray-300'
          }`}
        >
          ‹
        </button>
        <div className="text-center">
          <h2 className="font-black text-green-900 text-lg">
            Match {currentRound + 1} / {matches.length}
          </h2>
          <p className="text-xs text-gray-400">Target: {targetScore} poin</p>
        </div>
        <button
          onClick={() => {
            if (currentRound < matches.length - 1) {
              setCurrentRound(currentRound + 1)
              setScoreInputA('')
              setScoreInputB('')
            }
          }}
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

        {/* Kartu match */}
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

            {/* Nama tim */}
            <div className="grid grid-cols-3 gap-2 items-center mb-4">
              <div className="text-center">
                <p className="text-green-600 font-bold text-xs mb-2">Tim A</p>
                <div className="bg-green-50 rounded-xl p-2.5">
                  {match.teamA.map(p => (
                    <p key={p.id} className="font-bold text-green-900 text-sm leading-6">
                      {p.name}
                    </p>
                  ))}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-1">🏆</div>
                <p className="text-gray-400 font-bold text-xs">vs</p>
              </div>
              <div className="text-center">
                <p className="text-red-500 font-bold text-xs mb-2">Tim B</p>
                <div className="bg-red-50 rounded-xl p-2.5">
                  {match.teamB.map(p => (
                    <p key={p.id} className="font-bold text-green-900 text-sm leading-6">
                      {p.name}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Input skor */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <p className="text-gray-400 text-xs font-medium mb-1">Skor Tim A</p>
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
                <p className="text-gray-400 text-xs font-medium mb-1">Skor Tim B</p>
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
                title="Reset skor"
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

        {/* Istirahat ronde ini */}
        {sittingOut.length > 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <p className="text-blue-700 font-bold text-sm mb-2">
              Istirahat Ronde Ini ({sittingOut.length} orang)
            </p>
            <div className="flex flex-wrap gap-2">
              {sittingOut.map(p => (
                <span
                  key={p.id}
                  className="bg-white border border-blue-200 text-blue-600 text-sm font-medium px-3 py-1 rounded-full"
                >
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tombol akhiri sesi */}
        <button
          onClick={handleFinishSession}
          className="w-full bg-red-50 border-2 border-red-200 text-red-500 font-bold text-sm py-3.5 rounded-2xl active:scale-95 transition-transform"
        >
          🏁 Akhiri Sesi & Lihat Leaderboard
        </button>

        {/* Tombol selesai kalau match terakhir */}
        {isLast && (
          <button
            onClick={() => {
              finishSession()
              navigate('/leaderboard')
            }}
            className="w-full bg-yellow-400 text-green-900 font-black text-lg py-4 rounded-2xl shadow active:scale-95 transition-transform"
          >
            🏆 Selesai & Lihat Leaderboard
          </button>
        )}

      </div>

      {showFinishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-green-950/70 px-5">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="finish-session-title"
            className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <div className="bg-red-50 px-5 py-5 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-2xl">
                🏁
              </div>
              <h3 id="finish-session-title" className="text-xl font-black text-green-900">
                Akhiri sesi sekarang?
              </h3>
              <p className="mt-2 text-sm font-medium leading-6 text-gray-500">
                Leaderboard akan dihitung dari match yang sudah selesai.
              </p>
            </div>

            <div className="px-5 py-4">
              <div className="grid grid-cols-2 gap-3 rounded-2xl bg-gray-50 p-3">
                <div className="text-center">
                  <p className="text-2xl font-black text-green-700">{doneCount}</p>
                  <p className="text-xs font-bold text-gray-400">Done</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-red-500">{pendingCount}</p>
                  <p className="text-xs font-bold text-gray-400">Pending</p>
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => setShowFinishModal(false)}
                  className="flex-1 rounded-2xl border-2 border-gray-200 bg-white py-3 text-sm font-black text-gray-500 active:scale-95 transition-transform"
                >
                  Batal
                </button>
                <button
                  onClick={confirmFinishSession}
                  className="flex-1 rounded-2xl bg-red-500 py-3 text-sm font-black text-white shadow active:scale-95 transition-transform"
                >
                  Akhiri
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Game
