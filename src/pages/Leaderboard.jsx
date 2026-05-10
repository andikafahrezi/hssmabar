import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import useSessionStore from '../store/sessionStore'

function calculateStandings(players, matches) {
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

  matches
    .filter(m => m.status === 'done')
    .forEach(m => {
      const winner = m.scoreA > m.scoreB ? 'A'
        : m.scoreB > m.scoreA ? 'B'
        : 'draw'

      const processTeam = (team, scored, conceded) => {
        team.forEach(p => {
          if (!stats[p.id]) return
          stats[p.id].matchesPlayed++
          stats[p.id].pointsScored    += scored
          stats[p.id].pointsConceded  += conceded
          if (winner === 'draw') {
            stats[p.id].draws++
          } else if (
            (winner === 'A' && team === m.teamA) ||
            (winner === 'B' && team === m.teamB)
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

  return Object.values(stats).sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins
    const diffA = a.pointsScored - a.pointsConceded
    const diffB = b.pointsScored - b.pointsConceded
    return diffB - diffA
  })
}

function Leaderboard() {
  const navigate  = useNavigate()
  const {
    players, matches, sessionName,
    sessionFinished, resetAll,
  } = useSessionStore()

  const standings    = calculateStandings(players, matches)
  const doneMatches  = matches.filter(m => m.status === 'done').length
  const totalMatches = matches.length
  const medalEmoji   = ['🥇', '🥈', '🥉']

  if (players.length === 0) {
    return (
      <div className="min-h-screen bg-green-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg mb-4">Belum ada sesi aktif</p>
          <button
            onClick={() => navigate('/setup')}
            className="bg-yellow-400 text-green-900 font-bold px-6 py-3 rounded-2xl"
          >
            Buat Sesi
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col max-w-md mx-auto">

      <Header sessionFinished={sessionFinished} />

      <div className="flex-1 px-5 py-5 flex flex-col gap-4 pb-10">

        {/* Nama sesi */}
        {sessionName && (
          <div className="bg-green-800 rounded-2xl px-4 py-3 text-center">
            <p className="text-yellow-400 font-black text-base">🏸 {sessionName}</p>
          </div>
        )}

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
          {doneMatches === totalMatches && totalMatches > 0 && (
            <p className="text-green-600 font-bold text-xs mt-2 text-center">
              ✓ Semua match selesai!
            </p>
          )}
          {doneMatches < totalMatches && (
            <p className="text-amber-600 text-xs mt-2 text-center">
              ⚠️ Leaderboard dihitung dari {doneMatches} match yang sudah selesai
            </p>
          )}
        </div>

        {/* Podium top 3 */}
        {standings.length >= 3 && (
          <div className="bg-green-800 rounded-3xl p-5">
            <p className="text-green-300 text-xs font-bold text-center mb-4 tracking-widest uppercase">
              Top 3
            </p>
            <div className="flex items-end justify-center gap-3">

              {/* 2nd */}
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
                <div className="bg-gray-400 w-full h-10 rounded-b-xl opacity-60" />
              </div>

              {/* 1st */}
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
                <div className="bg-yellow-400 w-full h-16 rounded-b-xl opacity-50" />
              </div>

              {/* 3rd */}
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
                <div className="bg-orange-300 w-full h-6 rounded-b-xl opacity-60" />
              </div>

            </div>
          </div>
        )}

        {/* Tabel ranking lengkap */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-black text-green-900 text-base">Ranking Lengkap</h2>
          </div>

          {standings.map((player, index) => {
            const pointDiff = player.pointsScored - player.pointsConceded
            const winRate   = player.matchesPlayed > 0
              ? Math.round((player.wins / player.matchesPlayed) * 100)
              : 0

            return (
              <div
                key={player.id}
                className={`flex items-center gap-3 px-5 py-4 border-b border-gray-50 ${
                  index === 0 ? 'bg-yellow-50' : ''
                }`}
              >
                <div className="w-8 text-center flex-shrink-0">
                  {index < 3
                    ? <span className="text-xl">{medalEmoji[index]}</span>
                    : <span className="text-gray-400 font-bold text-sm">{index + 1}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-black text-green-900 truncate">{player.name}</p>
                    <span className="text-xs flex-shrink-0">
                      {player.gender === 'female' ? '👧' : '👦'}
                    </span>
                  </div>
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
                <div className="text-right flex-shrink-0">
                  <p className="font-black text-green-800 text-lg">{player.wins}W</p>
                  <p className="text-gray-400 text-xs">{winRate}% win</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Tombol aksi */}
        <div className="flex flex-col gap-3">
          {!sessionFinished && (
            <button
              onClick={() => navigate('/game')}
              className="w-full bg-green-700 text-white font-black text-lg py-4 rounded-2xl shadow active:scale-95 transition-transform"
            >
              🏸 Lanjut Main
            </button>
          )}
          <button
            onClick={() => {
              resetAll()
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