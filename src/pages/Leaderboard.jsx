import {
  FlagBannerFoldIcon,
  GenderFemale,
  GenderMale,
  ScrollIcon,
  ShareNetwork,
  Target,
  UsersThree,
} from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import firstPlaceMedal from '../assets/icons/1st-place-medal.svg'
import secondPlaceMedal from '../assets/icons/2nd-place-medal.svg'
import thirdPlaceMedal from '../assets/icons/3rd-place-medal.svg'
import podiumFirst from '../assets/podium/podium 1.svg'
import podiumSecond from '../assets/podium/podium 2.svg'
import podiumThird from '../assets/podium/podium 3.svg'
import vectorPattern from '../assets/patterns/vector pattern.svg'
import Header from '../components/Header'
import useSessionStore from '../store/sessionStore'

function calculateStandings(players, matches) {
  const stats = {}

  players.forEach((player) => {
    stats[player.id] = {
      ...player,
      wins: 0,
      losses: 0,
      draws: 0,
      pointsScored: 0,
      pointsConceded: 0,
      matchesPlayed: 0,
    }
  })

  matches
    .filter((match) => match.status === 'done')
    .forEach((match) => {
      const winner = match.scoreA > match.scoreB
        ? 'A'
        : match.scoreB > match.scoreA
          ? 'B'
          : 'draw'

      const processTeam = (team, scored, conceded) => {
        team.forEach((player) => {
          if (!stats[player.id]) return

          stats[player.id].matchesPlayed++
          stats[player.id].pointsScored += scored
          stats[player.id].pointsConceded += conceded

          if (winner === 'draw') {
            stats[player.id].draws++
          } else if (
            (winner === 'A' && team === match.teamA) ||
            (winner === 'B' && team === match.teamB)
          ) {
            stats[player.id].wins++
          } else {
            stats[player.id].losses++
          }
        })
      }

      processTeam(match.teamA, match.scoreA, match.scoreB)
      processTeam(match.teamB, match.scoreB, match.scoreA)
    })

  return Object.values(stats).sort((playerA, playerB) => {
    if (playerB.wins !== playerA.wins) return playerB.wins - playerA.wins

    const diffA = playerA.pointsScored - playerA.pointsConceded
    const diffB = playerB.pointsScored - playerB.pointsConceded
    if (diffB !== diffA) return diffB - diffA

    return playerB.pointsScored - playerA.pointsScored
  })
}

function getFormatLabel(format) {
  switch (format) {
    case 'americano': return 'Americano'
    case 'singles': return 'Singles'
    case 'mixed': return 'Mixed Doubles'
    case 'fixed': return 'Fixed Doubles'
    default: return 'Format belum dipilih'
  }
}

function PodiumCard({ player, place, podiumAsset }) {
  if (!player) return <div className="flex-1" />

  const isFirst = place === 1

  return (
    <div className={`relative flex shrink-0 flex-col items-center ${isFirst ? 'w-[122px]' : 'w-[98px]'} ${isFirst ? 'z-10' : 'z-0'}`}>
      <div className={`rounded-[18px] border-[2px] border-[#1f4b26] bg-white px-3 py-3 text-center shadow-[3px_3px_0_rgba(31,75,38,0.98)] ${isFirst ? 'mb-0 w-[96px]' : 'mb-0 w-[96px]'}`}>
        <div className={`truncate font-display ${isFirst ? 'text-[1.15rem]' : 'text-[1.02rem]'} leading-none text-[#1f1f1f]`}>
          {player.name}
        </div>
        <div className={`mt-1 ${isFirst ? 'text-[0.72rem]' : 'text-[0.68rem]'} font-bold text-[#1f1f1f]`}>
          {player.wins}W <span className="mx-1 text-[#698669]">•</span> {player.losses}L
        </div>
      </div>

      <div className="flex w-full justify-center">
        <img
          src={podiumAsset}
          alt=""
          aria-hidden="true"
          className={`block h-auto ${isFirst ? 'w-[98px]' : 'w-[98px]'}`}
        />
      </div>
    </div>
  )
}

function Leaderboard() {
  const navigate = useNavigate()
  const {
    players,
    matches,
    sessionName,
    format,
    targetScore,
    sessionFinished,
    resetAll,
  } = useSessionStore()

  const standings = calculateStandings(players, matches)
  const doneMatches = matches.filter((match) => match.status === 'done').length
  const totalMatches = matches.length
  const progressWidth = totalMatches > 0 ? `${(doneMatches / totalMatches) * 100}%` : '0%'

  if (players.length === 0) {
    return (
      <div className="app-screen flex min-h-screen items-center justify-center px-5">
        <div className="app-soft-card w-full px-5 py-6 text-center">
          <p className="font-display text-[1.3rem] uppercase text-[#1f4b26]">Belum ada sesi aktif</p>
          <p className="mt-2 text-[0.82rem] text-[#6d7c6d]">Buat sesi dulu sebelum membuka leaderboard.</p>
          <button
            type="button"
            onClick={() => navigate('/setup')}
            className="mt-5 rounded-[18px] border-[2px] border-[#1f4b26] bg-[#c6ff10] px-5 py-3 font-display text-[1.2rem] uppercase text-[#1f2d13] shadow-[2px_2px_0_rgba(31,75,38,0.98)] transition active:translate-y-px"
          >
            Buat Sesi
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app-screen flex flex-col">
      <Header sessionFinished={sessionFinished} backTo="/game" />

      <main className="flex-1 px-5 pb-10">
        <div className="flex flex-col gap-5">
          <section className="overflow-hidden rounded-[20px] border-[2px] border-[#1f4b26] bg-[#3f9f37] shadow-[2px_2px_0_#1f4b26]">
            <div className="flex items-center justify-between border-b border-[#2d7d2f] px-4 py-[0.9rem]">
              <div className="min-w-0 pr-3">
                <div className="flex items-center gap-2 text-white">
                  <FlagBannerFoldIcon size={16} weight="bold" />
                  <div className="truncate font-display text-[1rem] leading-[1.15]">{sessionName || 'Testing sesi name'}</div>
                </div>
              </div>
              <button
                type="button"
                aria-label="Bagikan sesi"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/95 transition hover:bg-white/10"
              >
                <ShareNetwork size={16} weight="bold" />
              </button>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-3 px-4 py-3">
              <div className="flex items-center gap-2 text-white">
                <ScrollIcon size={16} weight="bold" className="rotate-none" />
                <span className="font-display text-[1rem] uppercase leading-none">{getFormatLabel(format)}</span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border-[2px] border-[#1f4b26] bg-[#c6ff10] px-3 py-1 Plus Jakarta Sans text-[0.9rem] leading-none text-[#1f2d13] shadow-[1px_1px_0_rgba(31,75,38,0.98)]">
                <span style={{ fontWeight: '600' }}>{players.length} Players</span>
                <UsersThree size={16} weight="bold" />
              </div>

              <div className="flex items-center gap-2 text-white">
                <Target size={16} weight="bold" />
                <span className="font-display text-[1rem] uppercase leading-none">{targetScore} Point</span>
              </div>
            </div>
          </section>

          <section className="rounded-[20px] border-[2px] border-[#1f4b26] bg-white px-4 py-4 shadow-[2px_2px_0_#1f4b26]">
            <div className="flex items-center justify-between">
              <div className="font-display text-[1rem] uppercase leading-none text-[#2b5f2c]">Progress Sesi</div>
              <div className="font-display text-[1rem] uppercase leading-none text-[#2b5f2c]">
                {doneMatches}/{totalMatches} Match
              </div>
            </div>

            <div className="mt-4 h-[6px] rounded-full bg-[#dbdbdb]">
              <div
                className="h-[6px] rounded-full bg-[#95cf38] transition-all duration-500"
                style={{ width: progressWidth }}
              />
            </div>

            <div className="mt-4 text-center text-[0.73rem] font-bold text-[#df8d0f]">
              <span className="mr-2">⚠</span>
              Leaderboard dihitung dari {doneMatches} match yang sudah selesai
            </div>
          </section>

          {standings.length >= 3 ? (
            <section className="relative overflow-hidden rounded-[20px] border-[2px] border-[#1f4b26] bg-[#3f9f37] shadow-[2px_2px_0_#1f4b26]">
              <img src={vectorPattern} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-30" />
              <div className="relative px-3 pb-0 pt-5">
                <div className="text-center font-display text-[1.3rem] uppercase leading-none text-white">Top 3</div>

                <div className="mt-5 flex items-end justify-center gap-none">
                  <PodiumCard
                    player={standings[1]}
                    place={2}
                    podiumAsset={podiumSecond}
                  />
                  <PodiumCard
                    player={standings[0]}
                    place={1}
                    podiumAsset={podiumFirst}
                  />
                  <PodiumCard
                    player={standings[2]}
                    place={3}
                    podiumAsset={podiumThird}
                  />
                </div>
              </div>
            </section>
          ) : null}

          <section className="overflow-hidden rounded-[20px] border-[2px] border-[#1f4b26] bg-white shadow-[2px_2px_0_#1f4b26]">
            <div className="px-4 pb-2 pt-4 font-display text-[1rem] uppercase leading-none text-[#2b5f2c]">
              Ranking Lengkap
            </div>

            <div className="px-4 pb-3 pt-2">
              {standings.map((player, index) => {
                const pointDiff = player.pointsScored - player.pointsConceded
                const winRate = player.matchesPlayed > 0
                  ? Math.round((player.wins / player.matchesPlayed) * 100)
                  : 0

                const medalIcon = index === 0
                  ? firstPlaceMedal
                  : index === 1
                    ? secondPlaceMedal
                    : index === 2
                      ? thirdPlaceMedal
                      : null

                return (
                  <div key={player.id} className="flex items-start gap-3 py-3">
                    <div className="flex w-7 shrink-0 justify-center pt-0.5">
                      {medalIcon ? (
                        <img src={medalIcon} alt="" aria-hidden="true" className="w-6 h-auto" />
                      ) : (
                        <span className="font-display text-[1.2rem] leading-none text-[#1f1f1f]">{index + 1}</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-[1rem] leading-none text-[#2c5e2d]">
                          {player.name}
                        </span>
                        <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#2c5e2d] bg-[#edf4e7] text-[#2c5e2d]">
                          {player.gender === 'female'
                            ? <GenderFemale size={12} weight="bold" />
                            : <GenderMale size={12} weight="bold" />}
                        </span>
                      </div>

                      <div className="mt-1 text-[0.78rem] font-bold text-[#1f1f1f]">
                        {player.matchesPlayed} main <span className="mx-1">{player.pointsScored}</span> pts <span className="mx-1">{pointDiff >= 0 ? '+' : ''}{pointDiff}</span> diff
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="font-display text-[1rem] uppercase leading-none text-[#2c5e2d]">{player.wins}W</div>
                      <div className="mt-1 text-[0.78rem] font-bold text-[#1f1f1f]">{winRate}% win</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <div className="flex flex-col gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                resetAll()
                navigate('/')
              }}
              className="w-full rounded-[18px] border-[2px] border-[#1f4b26] bg-[#c6ff10] px-4 py-4 text-[#1f2d13] shadow-[2px_2px_0_#1f4b26] transition active:translate-y-px"
            >
              <span style={{ fontWeight: 800 }} className="font-display text-[1rem] uppercase leading-none">Sesi Baru</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full rounded-[18px] border-[2px] border-[#1f4b26] bg-white px-4 py-4 text-[#2c5e2d] shadow-[2px_2px_0_#1f4b26] transition active:translate-y-px"
            >
              <span style={{ fontWeight: 800 }} className="font-display text-[1rem] uppercase leading-none">Kembali ke Home</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Leaderboard
