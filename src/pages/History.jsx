import {
  ArrowClockwise,
  CalendarBlank,
  ClockCounterClockwise,
  Trash,
  Trophy,
  UsersThree,
} from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import useSessionStore from '../store/sessionStore'

function getFormatLabel(format) {
  switch (format) {
    case 'americano': return 'Americano'
    case 'singles': return 'Singles'
    case 'mixed': return 'Mixed Doubles'
    case 'fixed': return 'Fixed Doubles'
    default: return 'Format belum dipilih'
  }
}

function formatDate(value) {
  if (!value) return 'Tanggal tidak tersedia'

  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value))
  } catch {
    return 'Tanggal tidak tersedia'
  }
}

function History() {
  const navigate = useNavigate()
  const {
    history,
    restoreArchivedSession,
    deleteArchivedSession,
  } = useSessionStore()

  function handleRestore(session) {
    restoreArchivedSession(session)
    navigate(session.matches?.length > 0 ? '/leaderboard' : '/setup')
  }

  return (
    <div className="app-screen flex flex-col">
      <Header sessionFinished={false} backTo="/" showTabs={false} />

      <main className="flex-1 px-5 pb-10">
        <div className="flex flex-col gap-5">
          <section>
            <h1 className="app-section-title">Riwayat Sesi</h1>
            <p className="app-section-subtitle">Arsip lokal dari sesi yang pernah dibuat di browser ini</p>
            <p style={{ color: '#FF0000', fontFamily: 'Plus Jakarta Sans', fontSize: '0.7rem', marginTop: '8px' }}>
              *Studi kasus Hasbi yang lupa simpan hasil pertandingan, jadilah dibuat riwayat sesi ini.
            </p>
          </section>

          {history.length === 0 ? (
            <section className="app-soft-card px-5 py-7 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[16px] bg-[#edf4e7] text-[#1f4b26]">
                <ClockCounterClockwise size={28} weight="bold" />
              </div>
              <div className="mt-4 font-display text-[1.2rem] uppercase leading-none text-[#1f4b26]">
                Belum Ada Arsip
              </div>
              <p className="mt-2 text-[0.82rem] font-medium leading-6 text-[#6d7c6d]">
                Arsip akan muncul setelah kamu membuat sesi baru atau reset sesi yang sedang berjalan.
              </p>
            </section>
          ) : (
            <section className="flex flex-col gap-3">
              {history.map((session) => {
                const doneMatches = (session.matches || []).filter((match) => match.status === 'done').length
                const totalMatches = session.matches?.length || 0

                return (
                  <div
                    key={session.id}
                    className="rounded-[20px] border-[2px] border-[#1f4b26] bg-white p-4 shadow-[2px_2px_0_#1f4b26]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-display text-[1.18rem] uppercase leading-none text-[#1f4b26]">
                          {session.sessionName || 'Sesi Tanpa Nama'}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-[#1f4b26] bg-[#c6ff10] px-2.5 py-1 text-[0.7rem] font-bold text-[#1f2d13]">
                            <Trophy size={12} weight="bold" />
                            {getFormatLabel(session.format)}
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-[#9ad092] bg-[#edf4e7] px-2.5 py-1 text-[0.7rem] font-bold text-[#1f4b26]">
                            <UsersThree size={12} weight="bold" />
                            {session.players?.length || 0} pemain
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteArchivedSession(session.id)}
                        aria-label="Hapus arsip"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border-[1.5px] border-[#e0b2aa] bg-[#f8e8e4] text-[#8f4a3d] transition active:translate-y-px"
                      >
                        <Trash size={16} weight="bold" />
                      </button>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-[14px] border-[1.5px] border-[#c7d6c3] bg-[#f7faf4] px-3 py-3">
                        <div className="font-display text-[1.2rem] leading-none text-[#1f4b26]">
                          {doneMatches}/{totalMatches}
                        </div>
                        <div className="mt-1 text-[0.7rem] font-bold uppercase text-[#6d7c6d]">Match done</div>
                      </div>
                      <div className="rounded-[14px] border-[1.5px] border-[#c7d6c3] bg-[#f7faf4] px-3 py-3">
                        <div className="font-display text-[1.2rem] leading-none text-[#1f4b26]">
                          {session.targetScore || 21}
                        </div>
                        <div className="mt-1 text-[0.7rem] font-bold uppercase text-[#6d7c6d]">Target poin</div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-[0.74rem] font-semibold text-[#6d7c6d]">
                      <CalendarBlank size={14} weight="bold" />
                      <span>Diarsipkan {formatDate(session.archivedAt)}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRestore(session)}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-[16px] border-[2px] border-[#1f4b26] bg-[#c6ff10] px-4 py-3 text-[#1f2d13] shadow-[2px_2px_0_#1f4b26] transition active:translate-y-px"
                    >
                      <ArrowClockwise size={17} weight="bold" />
                      <span style={{ fontWeight: 800 }} className="font-display text-[1rem] uppercase leading-none">
                        Pulihkan Sesi
                      </span>
                    </button>
                  </div>
                )
              })}
            </section>
          )}
        </div>
      </main>
    </div>
  )
}

export default History
