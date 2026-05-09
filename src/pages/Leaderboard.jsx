import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'

function Leaderboard() {
  const navigate = useNavigate()
  const [standings, setStandings] = useState([])
  const [session, setSession] = useState(null)
  const [matches, setMatches] = useState([])

  useEffect(() => {
    const savedSession = localStorage.getItem('shuttlemabar_session')
    const savedMatches = localStorage.getItem('shuttlemabar_matches')

    if (!savedSession) return navigate('/')

    const s = JSON.parse(savedSession)
    const m = savedMatches ? JSON.parse(savedMatches) : []

    setSession(s)
    setMatches(m)
    setStandings(calculateStandings(s.players, m))
  }, [])

  function calculateStandings(players, matches) {
    // Inisialisasi statistik tiap pemain
    const stats = {}
    players.forEach(p => {
      stats[p.id] = {
        ...p,
        wins: 0,
        losses: 0,
        draws: 0,
        pointsScored: 0,
        pointsConceded: 0,
        matchesPlayed: 0,
      }
    })

    // Hitung dari semua match yang sudah selesai
    matches
      .filter(m => m.status === 'done')
      .forEach(m => {
        const winnersTeam = m.scoreA > m.scoreB ? 'A'
          : m.scoreB > m.scoreA ? 'B'
          : 'draw'

        const processTeam = (team, scored, conceded) => {
          team.forEach(p => {
            if (!stats[p.id]) return
            stats[p.id].matchesPlayed++
            stats[p.id].pointsScored += scored
            stats[p.id].pointsConceded += conceded
            if (winnersTeam === 'draw') {
              stats[p.id].draws++
            } else if (
              (winnersTeam === 'A' && team === m.teamA) ||
              (winnersTeam === 'B' && team === m.teamB)
            ) {
              stats[p.id].wins++
            } else {
              stats[p.id].losses++
            }
          })
        }

        processTeam(m.teamA, m.scoreA, m.scoreB)
        processTeam(m.teamB, m.scoreB, m.scoreA)
      })

    // Urutkan: wins dulu, lalu point difference
    return Object.values(stats).sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins
      const diffA = a.pointsScored - a.pointsConceded
      const diffB = b.pointsScored - b.pointsConceded
      return diffB - diffA
    })
  }

  const doneMatches = matches.filter(m => m.status === 'done').length
  const totalMatches = matches.length
  const isFinished = doneMatches === totalMatches && totalMatches > 0

  const medalEmoji = ['🥇', '🥈', '🥉']

  if (!session) {
    return (
      <div className="min-h-screen bg-green-900 flex items-center justify-center">
        <p className="text-white">Memuat...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col max-w-md mx-auto">

      {/* Header */}
      <Header sessionFinished={true} />

      <div className="flex-1 px-5 py-5 flex flex-col gap-4">

        {/* Progress sesi */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-900 font-bold text-sm">Progress Sesi</span>
            <span className="text-green-600 font-black text-sm">
              {doneMatches} / {totalMatches} match
            </span>
          </div>
          <div className="bg-gray-100 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-500"
              style={{
                width: totalMatches > 0
                  ? `${(doneMatches / totalMatches) * 100}%`
                  : '0%'
              }}
            />
          </div>
          {isFinished && (
            <p className="text-green-600 font-bold text-xs mt-2 text-center">
              ✓ Semua match selesai!
            </p>
          )}
        </div>

        {/* Podium top 3 */}
        {standings.length >= 3 && (
          <div className="bg-green-800 rounded-3xl p-5">
            <p className="text-green-300 text-xs font-bold text-center mb-4 tracking-widest">
              TOP 3
            </p>
            <div className="flex items-end justify-center gap-3">

              {/* 2nd place */}
              <div className="flex flex-col items-center flex-1">
                <span className="text-3xl mb-1">🥈</span>
                <div className="bg-green-700 rounded-2xl p-3 w-full text-center">
                  <p className="text-white font-black text-sm truncate">
                    {standings[1]?.name}
                  </p>
                  <p className="text-green-300 text-xs mt-1">
                    {standings[1]?.wins}W · {standings[1]?.losses}L
                  </p>
                </div>
                <div className="bg-gray-300 w-full h-12 rounded-b-xl" />
              </div>

              {/* 1st place */}
              <div className="flex flex-col items-center flex-1">
                <span className="text-4xl mb-1">🥇</span>
                <div className="bg-yellow-400 rounded-2xl p-3 w-full text-center">
                  <p className="text-green-900 font-black text-sm truncate">
                    {standings[0]?.name}
                  </p>
                  <p className="text-green-700 text-xs mt-1">
                    {standings[0]?.wins}W · {standings[0]?.losses}L
                  </p>
                </div>
                <div className="bg-yellow-400 w-full h-20 rounded-b-xl opacity-60" />
              </div>

              {/* 3rd place */}
              <div className="flex flex-col items-center flex-1">
                <span className="text-3xl mb-1">🥉</span>
                <div className="bg-green-700 rounded-2xl p-3 w-full text-center">
                  <p className="text-white font-black text-sm truncate">
                    {standings[2]?.name}
                  </p>
                  <p className="text-green-300 text-xs mt-1">
                    {standings[2]?.wins}W · {standings[2]?.losses}L
                  </p>
                </div>
                <div className="bg-orange-300 w-full h-8 rounded-b-xl" />
              </div>

            </div>
          </div>
        )}

        {/* Tabel ranking lengkap */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-black text-green-900 text-base">
              Ranking Lengkap
            </h2>
          </div>

          {standings.map((player, index) => {
            const pointDiff = player.pointsScored - player.pointsConceded
            const winRate = player.matchesPlayed > 0
              ? Math.round((player.wins / player.matchesPlayed) * 100)
              : 0

            return (
              <div
                key={player.id}
                className={`flex items-center gap-3 px-5 py-4 border-b border-gray-50 ${
                  index === 0 ? 'bg-yellow-50' : ''
                }`}
              >
                {/* Rank */}
                <div className="w-8 text-center">
                  {index < 3
                    ? <span className="text-xl">{medalEmoji[index]}</span>
                    : <span className="text-gray-400 font-bold text-sm">{index + 1}</span>
                  }
                </div>

                {/* Nama & stats */}
                <div className="flex-1 min-w-0">
                  <p className="font-black text-green-900 truncate">{player.name}</p>
                  <div className="flex gap-3 mt-0.5">
                    <span className="text-green-600 text-xs font-medium">
                      {player.matchesPlayed} main
                    </span>
                    <span className="text-gray-400 text-xs">
                      {player.pointsScored} pts
                    </span>
                    <span className={`text-xs font-medium ${
                      pointDiff >= 0 ? 'text-green-500' : 'text-red-400'
                    }`}>
                      {pointDiff >= 0 ? '+' : ''}{pointDiff} diff
                    </span>
                  </div>
                </div>

                {/* Win rate */}
                <div className="text-right">
                  <p className="font-black text-green-800 text-lg">{player.wins}W</p>
                  <p className="text-gray-400 text-xs">{winRate}% win</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Tombol aksi */}
        <div className="flex flex-col gap-3 pb-8">
          {!isFinished && (
            <button
              onClick={() => navigate('/game')}
              className="w-full bg-green-700 text-white font-black text-lg py-4 rounded-2xl shadow active:scale-95 transition-transform"
            >
              🏸 Lanjut Main
            </button>
          )}
          <button
            onClick={() => {
              localStorage.removeItem('shuttlemabar_session')
              localStorage.removeItem('shuttlemabar_matches')
              navigate('/')
            }}
            className="w-full bg-yellow-400 text-green-900 font-black text-lg py-4 rounded-2xl shadow active:scale-95 transition-transform"
          >
            🎮 Sesi Baru
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full border-2 border-gray-200 text-gray-500 font-bold text-base py-3 rounded-2xl active:scale-95 transition-transform"
          >
            Kembali ke Home
          </button>
        </div>

      </div>
    </div>
  )
}

export default Leaderboard