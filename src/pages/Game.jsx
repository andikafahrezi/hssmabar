import {
  ArrowClockwise,
  Check,
  ClockCountdown,
  Info,
  CaretLeft,
  CaretRight,
  FlagCheckered,
  StrategyIcon,
} from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import trophyIcon from '../assets/icons/trophy.svg'
import Header from '../components/Header'
import useSessionStore from '../store/sessionStore'

function Game() {
  const navigate = useNavigate()
  const [currentRound, setCurrentRound] = useState(0)
  const [showFinishModal, setShowFinishModal] = useState(false)
  const [scorePickerTarget, setScorePickerTarget] = useState(null)
  const [toastMessage, setToastMessage] = useState('')

  const {
    format,
    players,
    targetScore,
    sessionName,
    matches,
    setMatches,
    sessionFinished,
    finishSession,
  } = useSessionStore()

  function getInitialScore(matchScore) {
    return matchScore > 0 ? String(matchScore) : ''
  }

  const [scoreInputA, setScoreInputA] = useState(getInitialScore(matches[0]?.scoreA))
  const [scoreInputB, setScoreInputB] = useState(getInitialScore(matches[0]?.scoreB))

  useEffect(() => {
    if (!format || players.length === 0) {
      navigate('/setup')
    }
  }, [format, navigate, players.length])

  useEffect(() => {
    if (!toastMessage) return undefined

    const timeoutId = window.setTimeout(() => {
      setToastMessage('')
    }, 2400)

    return () => window.clearTimeout(timeoutId)
  }, [toastMessage])

  function showToast(message) {
    setToastMessage(message)
  }

  function goToRound(nextRound) {
    if (nextRound < 0 || nextRound >= matches.length) return

    const nextMatch = matches[nextRound]
    setScoreInputA(getInitialScore(nextMatch?.scoreA))
    setScoreInputB(getInitialScore(nextMatch?.scoreB))
    setCurrentRound(nextRound)
  }

  if (!format || matches.length === 0) {
    return (
      <div className="app-screen flex min-h-screen items-center justify-center px-5">
        <div className="app-soft-card w-full px-5 py-6 text-center">
          <p className="font-display text-[1.2rem] uppercase text-[#1f4b26]">Memuat sesi...</p>
          <p className="mt-2 text-[0.82rem] text-[#6d7c6d]">Menyiapkan match dan pemain.</p>
        </div>
      </div>
    )
  }

  const match = matches[currentRound]
  const isLast = currentRound === matches.length - 1
  const doneCount = matches.filter((item) => item.status === 'done').length
  const pendingCount = matches.filter((item) => item.status === 'pending').length
  const activeCount = matches.filter((item) => item.status === 'active').length
  const currentStatusLabel = match.status === 'done' ? 'Selesai' : 'Berlangsung'
  const currentStatusClass = match.status === 'done'
    ? 'bg-[#c6ff10] text-[#1f2d13]'
    : 'bg-[#1f4b26] text-white'
  const scoreOptions = Array.from({ length: 51 }, (_, index) => index)

  function getFormatLabel(value) {
    switch (value) {
      case 'americano': return 'Americano'
      case 'singles': return 'Singles'
      case 'mixed': return 'Mixed'
      case 'fixed': return 'Fixed Doubles'
      default: return 'Match'
    }
  }

  function openScorePicker(team) {
    setScorePickerTarget(team)
  }

  function closeScorePicker() {
    setScorePickerTarget(null)
  }

  function handleScorePick(score) {
    if (scorePickerTarget === 'A') setScoreInputA(String(score))
    if (scorePickerTarget === 'B') setScoreInputB(String(score))
    closeScorePicker()
  }

  function handleSubmit() {
    const scoreA = Number.parseInt(scoreInputA, 10)
    const scoreB = Number.parseInt(scoreInputB, 10)

    if (Number.isNaN(scoreA) || Number.isNaN(scoreB)) {
      return showToast('Masukkan skor untuk kedua tim dulu.')
    }
    if (scoreA < 0 || scoreB < 0) {
      return showToast('Skor tidak boleh minus.')
    }

    const updatedMatches = matches.map((item, index) => {
      if (index === currentRound) {
        return { ...item, scoreA, scoreB, status: 'done' }
      }
      if (index === currentRound + 1 && item.status === 'pending') {
        return { ...item, status: 'active' }
      }
      return item
    })

    setMatches(updatedMatches)

    if (isLast) {
      finishSession()
      navigate('/leaderboard')
      return
    }

    goToRound(currentRound + 1)
  }

  function handlePostpone() {
    if (isLast) {
      return showToast('Ini match terakhir, tidak bisa dilewati.')
    }

    goToRound(currentRound + 1)
  }

  function handleFinishSession() {
    setShowFinishModal(true)
  }

  function confirmFinishSession() {
    finishSession()
    navigate('/leaderboard')
  }

  const playingIds = [...match.teamA, ...match.teamB].map((player) => player.id)
  const sittingOut = match.sittingOut?.length > 0
    ? match.sittingOut
    : players.filter((player) => !playingIds.includes(player.id))

  return (
    <div className="app-screen flex flex-col">
      <Header sessionFinished={sessionFinished} backTo="/setup" />

      <div className={`pointer-events-none fixed left-1/2 top-4 z-50 w-[calc(100%-2rem)] max-w-[358px] -translate-x-1/2 transition-all duration-200 ${
        toastMessage ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0'
      }`}>
        <div className="rounded-[18px] border-[2px] border-[#1f4b26] bg-[linear-gradient(135deg,#c6ff10_0%,#f5ffd2_100%)] px-4 py-3 text-[#1f2d13] shadow-[3px_3px_0_rgba(31,75,38,0.98)]">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1f4b26] text-[#c6ff10]">
              <Info size={16} weight="bold" />
            </span>
            <div>
              <div className="font-display text-[0.98rem] uppercase leading-none">Match Belum Siap</div>
              <div className="mt-1 text-[0.8rem] font-semibold leading-5">{toastMessage}</div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 px-5 pb-10">
        <div className="flex flex-col gap-4">
          <section className="flex items-start gap-2 px-[2px] py-[2px]">
            <div className="flex-1 overflow-x-auto py-[2px] whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex w-max gap-2 pl-[1px]">
                <span className="inline-flex shrink-0 items-center gap-2 rounded-full border-[2px] border-[#1f4b26] bg-[#c6ff10] px-3 py-1 text-[0.74rem] font-bold text-[#1f2d13] shadow-[1.5px_1.5px_0_rgba(31,75,38,0.98)]">
                  <span className="text-[0.5rem]">●</span>
                  Active
                </span>
                <span className="inline-flex shrink-0 items-center rounded-full border-[2px] border-[#1f4b26] bg-white px-3 py-1 text-[0.74rem] font-bold text-[#1f2d13]">
                  {doneCount} Done
                </span>
                <span className="inline-flex shrink-0 items-center rounded-full border-[2px] border-[#1f4b26] bg-white px-3 py-1 text-[0.74rem] font-bold text-[#1f2d13]">
                  {pendingCount + activeCount} Pending
                </span>
              </div>
            </div>

            {sessionName ? (
              <span className="inline-flex max-w-[11rem] shrink-0 items-center gap-2 rounded-full border-[2px] border-[#1f4b26] bg-[#3f9f37] px-3 py-1 text-[0.74rem] font-bold text-white shadow-[1.5px_1.5px_0_rgba(31,75,38,0.98)]">
                <FlagCheckered size={12} weight="bold" />
                <span className="truncate">{sessionName}</span>
              </span>
            ) : null}
          </section>

          <section className="flex items-center justify-between border-t border-[#cfd8c8] pt-3">
            <button
              type="button"
              onClick={() => goToRound(currentRound - 1)}
              disabled={currentRound === 0}
              className={`flex h-9 w-9 items-center justify-center rounded-[12px] border-[2px] shadow-[2px_2px_0_#1f4b26] transition ${
                currentRound === 0
                  ? 'border-[#1f4b26] bg-[#edf4e7] text-[#88a084]'
                  : 'border-[#1f4b26] bg-[#c6ff10] text-[#1f2d13]'
              }`}
            >
              <CaretLeft size={18} weight="bold" />
            </button>

            <div className="text-center">
              <div className="font-display text-[1.3rem] leading-none text-[#1f1f1f]">
                Match {currentRound + 1} / {matches.length}
              </div>
              <p className="mt-1 text-[0.74rem] font-semibold text-[#6d7c6d]">Target {targetScore} poin</p>
            </div>

            <button
              type="button"
              onClick={() => goToRound(currentRound + 1)}
              disabled={currentRound === matches.length - 1}
              className={`flex h-9 w-9 items-center justify-center rounded-[12px] border-[2px] shadow-[2px_2px_0_#1f4b26] transition ${
                currentRound === matches.length - 1
                  ? 'border-[#9db694] bg-[#edf4e7] text-[#88a084]'
                  : 'border-[#1f4b26] bg-[#c6ff10] text-[#1f2d13]'
              }`}
            >
              <CaretRight size={18} weight="bold" />
            </button>
          </section>

          <section className="rounded-[22px] border-[2px] border-[#1f4b26] bg-[#3f9f37] p-2 shadow-[2px_2px_0_#1f4b26]">
            <div className="mb-2 flex items-center justify-between px-1.5 pt-1">
              <div className="font-display text-[1rem] uppercase leading-none text-white">
                Match {currentRound + 1}
              </div>
              <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[0.7rem] font-bold ${currentStatusClass}`}>
                <span className="text-[0.5rem]">●</span>
                {currentStatusLabel}
              </div>
            </div>

            <div className="rounded-[18px] border-[2px] border-[#1f4b26] bg-white px-4 py-5">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div className="text-center">
                  <p className="mb-2 font-display text-[1rem] uppercase leading-none text-[#325a30]">Tim A</p>
                  <div className="rounded-[14px] border-[2px] border-[#1f4b26] bg-[#3f9f37] px-2 py-3 text-white shadow-[2px_2px_0_#1f4b26]">
                    {match.teamA.map((player) => (
                      <p key={player.id} className="text-[0.95rem] font-bold leading-6">
                        {player.name}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  <img src={trophyIcon} alt="" aria-hidden="true" className="mx-auto w-8 h-auto" />
                  <p className="mt-1 font-display text-[1.25rem] uppercase leading-none text-[#a96b00]">VS</p>
                </div>

                <div className="text-center">
                  <p className="mb-2 font-display text-[1rem] uppercase leading-none text-[#325a30]">Tim B</p>
                  <div className="rounded-[14px] border-[2px] border-[#1f4b26] bg-[#3f9f37] px-2 py-3 text-white shadow-[2px_2px_0_#1f4b26]">
                    {match.teamB.map((player) => (
                      <p key={player.id} className="text-[0.95rem] font-bold leading-6">
                        {player.name}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div>
                  <span className="mb-2 block font-display text-[0.8rem] uppercase leading-none text-[#1f2d13]">
                    Skor Tim A
                  </span>
                  <button
                    type="button"
                    onClick={() => openScorePicker('A')}
                    className="w-full rounded-[14px] border-[2px] border-[#1f1f1f] bg-[#1f1f1f] px-3 py-3 text-center font-display text-[2rem] leading-none text-white transition active:translate-y-px"
                  >
                    {scoreInputA || '0'}
                  </button>
                </div>

                <div>
                  <span className="mb-2 block font-display text-[0.8rem] uppercase leading-none text-[#1f2d13]">
                    Skor Tim B
                  </span>
                  <button
                    type="button"
                    onClick={() => openScorePicker('B')}
                    className="w-full rounded-[14px] border-[2px] border-[#1f1f1f] bg-[#1f1f1f] px-3 py-3 text-center font-display text-[2rem] leading-none text-white transition active:translate-y-px"
                  >
                    {scoreInputB || '0'}
                  </button>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setScoreInputA('')
                    setScoreInputB('')
                  }}
                  className="flex flex-1 items-center justify-center rounded-[14px] border-[1.5px] border-[#8fda8c] bg-white text-[#1f4b26] transition active:translate-y-px"
                  title="Reset skor"
                >
                  <ArrowClockwise size={18} weight="bold" />
                </button>

                <button
                  type="button"
                  onClick={handlePostpone}
                  className="flex flex-1 items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-[#8fda8c] bg-white px-3 py-3 text-[0.95rem] font-bold text-[#1f4b26] transition active:translate-y-px"
                >
                  <ClockCountdown size={18} weight="bold" />
                  <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>Lewati</span>
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex flex-1 items-center justify-center gap-2 rounded-[14px] border-[2px] border-[#1f4b26] bg-[#c6ff10] px-3 py-3 text-[0.95rem] font-bold text-[#1f2d13] shadow-[2px_2px_0_#1f4b26] transition active:translate-y-px"
                >
                  <Check size={18} weight="bold" />
                  <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>Submit</span>
                </button>
              </div>
            </div>
          </section>

          {sittingOut.length > 0 ? (
            <section className="rounded-[20px] border-[2px] border-[#1f4b26] bg-white px-4 py-4 shadow-[2px_2px_0_#1f4b26]">
              <div className="font-display text-[0.8rem] uppercase leading-none text-[#325a30]">
                Istirahat Match Ini ({sittingOut.length} orang)
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {sittingOut.map((player) => (
                  <span
                    key={player.id}
                    className="rounded-full border-[1.5px] border-[#1f4b26] bg-[#3f9f37] px-3 py-1 text-[0.78rem] font-semibold text-white shadow-[1.5px_1.5px_0_#1f4b26]"
                  >
                    {player.name}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          <button
            type="button"
            onClick={handleFinishSession}
            className="w-full rounded-[18px] border-[2px] border-[#8f4a3d] bg-[#e4a79a] px-4 py-3 font-display text-[1.25rem] uppercase leading-none text-[#4a241d] shadow-[2px_2px_0_rgba(143,74,61,100)] transition active:translate-y-px"
          >
            Akhiri Sesi & Lihat Leaderboard
          </button>
        </div>
      </main>

      {showFinishModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#173019]/70 px-5">
          <div className="w-full max-w-sm rounded-[24px] border-[2px] border-[#1f4b26] bg-white p-4 shadow-[4px_4px_0_rgba(31,75,38,0.98)]">
            <div className="rounded-[18px] bg-[#f6eee8] px-4 py-5 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[16px] bg-[#e4a79a] text-[#4a241d]">
                <StrategyIcon size={28} weight="regular" />
              </div>
              <div className="mt-4 font-display text-[1.5rem] uppercase leading-none text-[#1f4b26]">
                Akhiri sesi sekarang?
              </div>
              <p className="mt-2 text-[0.82rem] font-medium leading-6 text-[#6d7c6d]">
                Leaderboard akan dihitung dari match yang sudah selesai.
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-[16px] border-[2px] border-[#1f4b26] bg-[#edf4e7] px-3 py-3 text-center">
                <div className="font-display text-[1.4rem] leading-none text-[#1f4b26]">{doneCount}</div>
                <div className="mt-1 text-[0.72rem] font-bold uppercase text-[#587158]">Done</div>
              </div>
              <div className="rounded-[16px] border-[2px] border-[#1f4b26] bg-[#f7eee7] px-3 py-3 text-center">
                <div className="font-display text-[1.4rem] leading-none text-[#7c382d]">{pendingCount + activeCount}</div>
                <div className="mt-1 text-[0.72rem] font-bold uppercase text-[#9d5e52]">Pending</div>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setShowFinishModal(false)}
                className="flex-1 rounded-[16px] border-[2px] border-[#c7d6c3] bg-white py-3 text-[0.9rem] font-bold text-[#6d7c6d] transition active:translate-y-px"
              >
                <span style={{ fontWeight: 800 }}>Batal</span>
              </button>
              <button
                type="button"
                onClick={confirmFinishSession}
                className="flex-1 rounded-[16px] border-[2px] border-[#8f4a3d] bg-[#e4a79a] py-3 text-[0.9rem] font-bold text-[#4a241d] shadow-[2px_2px_0_rgba(143,74,61,100)] transition active:translate-y-px"
              >
                <span style={{ fontWeight: 800 }}>Akhiri</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {scorePickerTarget ? (
        <div className="fixed inset-0 z-50 flex justify-center bg-black/75 px-5">
          <div className="flex w-full max-w-[390px] items-center">
            <div className="w-full rounded-[22px] border-[2px] border-[#1f4b26] bg-[#3f9f37] p-3 shadow-[4px_4px_0_rgba(19,63,27,0.98)]">
            <div className="pb-2">
              <div className="font-display text-[1.3rem] uppercase leading-none text-white">Select Score</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full border-[1.5px] border-[#1f4b26] bg-[#c6ff10] px-3 py-1 text-[0.72rem] font-bold text-[#1f2d13]">
                  {getFormatLabel(format)}
                </span>
                <span className="rounded-full border-[1.5px] border-[#1f4b26] bg-[#c6ff10] px-3 py-1 text-[0.72rem] font-bold text-[#1f2d13]">
                  Match {currentRound + 1}
                </span>
              </div>
              <div className="mt-3 text-[0.95rem] font-bold text-white">
                {scorePickerTarget === 'A'
                  ? match.teamA.map((player) => player.name).join(' ')
                  : match.teamB.map((player) => player.name).join(' ')}
              </div>
            </div>

            <div className="mt-2 grid grid-cols-6 gap-2">
              {scoreOptions.map((score) => {
                const isSelected = (scorePickerTarget === 'A' && scoreInputA === String(score)) ||
                  (scorePickerTarget === 'B' && scoreInputB === String(score))

                return (
                  <button
                    key={score}
                    type="button"
                    onClick={() => handleScorePick(score)}
                    className={`flex h-10 items-center justify-center rounded-[8px] border font-extrabold transition active:translate-y-px ${
                      isSelected
                        ? 'border-[#1f4b26] bg-[#c6ff10] text-[#1f2d13] shadow-[1.5px_1.5px_0_rgba(31,75,38,0.98)]'
                        : 'border-[#567850] bg-white text-[#2f5d2f] shadow-[1.5px_1.5px_0_rgba(31,75,38,0.98)]'
                    }`}
                  >
                    {score}
                  </button>
                )
              })}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={closeScorePicker}
                className="rounded-[8px] bg-[#12411c] px-4 py-2 text-[0.84rem] font-bold text-white transition active:translate-y-px"
              >
                close
              </button>
            </div>
          </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default Game
