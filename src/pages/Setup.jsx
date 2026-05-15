import {
  Check,
  ShuffleAngular,
  Info,
  GenderFemale,
  GenderMale,
  PencilSimpleLine,
  PersonSimpleRunIcon,
  Plus,
  User,
  Users,
  UsersFour,
  X,
} from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import americanoIllustration from '../assets/illustrations/americano.svg'
import fixedDoublesIllustration from '../assets/illustrations/fixed doubles.svg'
import mixedDoublesIllustration from '../assets/illustrations/mixed doubles.svg'
import singlesIllustration from '../assets/illustrations/singles.svg'
import Header from '../components/Header'
import useSessionStore from '../store/sessionStore'
import { generateMatches } from '../utils/generateMatches'

const FORMATS = [
  {
    id: 'americano',
    label: 'Americano',
    desc: 'Partner berganti tiap ronde',
    icon: ShuffleAngular,
    illustration: americanoIllustration,
  },
  {
    id: 'singles',
    label: 'Singles',
    desc: 'Satu vs Satu',
    icon: User,
    illustration: singlesIllustration,
  },
  {
    id: 'mixed',
    label: 'Mixed',
    desc: 'Pria + Wanita',
    icon: UsersFour,
    illustration: mixedDoublesIllustration,
  },
  {
    id: 'fixed',
    label: 'Fixed Doubles',
    desc: 'Tim Tetap',
    icon: Users,
    illustration: fixedDoublesIllustration,
  },
]

const TARGETS = [
  { score: 11, label: 'Kroco' },
  { score: 15, label: 'Intermediate' },
  { score: 21, label: 'Pro' },
]

const FORMAT_RULES = {
  americano: { minPlayers: 4, emptyHint: 'Tambahkan minimal 4 pemain untuk format Americano.' },
  singles: { minPlayers: 2, emptyHint: 'Tambahkan minimal 2 pemain untuk format Singles.' },
  mixed: { minPlayers: 4, emptyHint: 'Tambahkan minimal 4 pemain untuk format Mixed.' },
  fixed: { minPlayers: 4, emptyHint: 'Tambahkan minimal 4 pemain untuk format Fixed Doubles.' },
}

function Setup() {
  const navigate = useNavigate()
  const [nameInput, setNameInput] = useState('')
  const [gender, setGender] = useState('male')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  const {
    sessionName,
    setSessionName,
    format,
    setFormat,
    players,
    addPlayer,
    removePlayer,
    editPlayerName,
    targetScore,
    setTargetScore,
    sessionStarted,
    startSession,
    setMatches,
  } = useSessionStore()

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

  function validateBeforeStart() {
    if (!format) return 'Pilih format permainan dulu.'

    const selectedRule = FORMAT_RULES[format]
    if (selectedRule && players.length < selectedRule.minPlayers) {
      return selectedRule.emptyHint
    }

    if (format === 'mixed') {
      const maleCount = players.filter((player) => player.gender === 'male').length
      const femaleCount = players.filter((player) => player.gender === 'female').length

      if (maleCount < 2 || femaleCount < 2) {
        return 'Format Mixed butuh minimal 2 pria dan 2 wanita.'
      }
    }

    return null
  }

  function handleAddPlayer() {
    const name = nameInput.trim()
    if (!name) return
    if (players.find((player) => player.name.toLowerCase() === name.toLowerCase())) {
      showToast('Nama pemain sudah ada.')
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
    if (players.find((player) => player.name.toLowerCase() === newName.toLowerCase() && player.id !== id)) {
      showToast('Nama sudah dipakai pemain lain.')
      return
    }

    editPlayerName(id, newName)
    setEditingId(null)
    setEditingName('')
  }

  function handleStart() {
    const validationMessage = validateBeforeStart()
    if (validationMessage) return showToast(validationMessage)

    const generated = generateMatches(format, players)
    if (generated.length === 0) {
      return showToast('Match belum bisa dibuat. Cek lagi jumlah pemain dan format permainan.')
    }

    setMatches(generated)
    startSession()
    navigate('/game')
  }

  return (
    <div className="app-screen flex flex-col">
      <Header sessionFinished={false} backTo="/" />
      <div className={`pointer-events-none fixed left-1/2 top-4 z-50 w-[calc(100%-2rem)] max-w-[358px] -translate-x-1/2 transition-all duration-200 ${
        toastMessage ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0'
      }`}>
        <div className="rounded-[18px] border-[2px] border-[#1f4b26] bg-[linear-gradient(135deg,#c6ff10_0%,#f5ffd2_100%)] px-4 py-3 text-[#1f2d13] shadow-[3px_3px_0_rgba(31,75,38,0.98)]">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1f4b26] text-[#c6ff10]">
              <Info size={16} weight="bold" />
            </span>
            <div>
              <div className="font-display text-[0.98rem] uppercase leading-none">Setup Belum Siap</div>
              <div className="mt-1 text-[0.8rem] font-semibold leading-5">{toastMessage}</div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 px-5 pb-10">
        <div className="flex flex-col gap-6">
          <section>
            <h1 className="app-section-title">Setup Sesi / Tournament</h1>
            <p className="app-section-subtitle">Atur format & pemain sebelum mulai</p>
          </section>

          <section>
            <label htmlFor="session-name" className="app-field-label">
              Nama Sesi / Turnamen
            </label>
            <input
              id="session-name"
              type="text"
              value={sessionName}
              onChange={(event) => setSessionName(event.target.value)}
              placeholder="Buat nama turnamen"
              className="app-input text-[0.9rem] font-medium"
            />
          </section>

          <section>
            <label className="app-field-label">Format Permainan</label>
            <div className="grid grid-cols-2 gap-3">
              {FORMATS.map((item) => {
                const Icon = item.icon
                const isActive = format === item.id

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormat(item.id)}
                    className={`relative min-h-[160px] overflow-hidden rounded-[16px] border-2 p-3 text-left transition ${
                      isActive
                        ? 'border-[#1f4b26] bg-[#3f9f37] text-white shadow-[2px_2px_0_rgba(31,75,38,0.98)]'
                        : 'border-[#1f4b26] bg-white text-[#1f4b26] shadow-[2px_2px_0_rgba(31,75,38,0.98)]'
                    }`}
                  >
                    <img
                      src={item.illustration}
                      alt=""
                      aria-hidden="true"
                      className="pointer-events-none absolute bottom-0 left-0 w-full h-auto"
                    />
                    <div
                      className={`absolute inset-0 opacity-25 ${
                        isActive ? 'bg-[linear-gradient(120deg,rgba(255,255,255,0.08),transparent_55%)]' : ''
                      }`}
                    />
                    <div className={`absolute inset-x-0 bottom-0 h-20 ${
                      isActive
                        ? 'bg-[linear-gradient(180deg,rgba(63,159,55,0)_0%,rgba(31,75,38,0.18)_100%)]'
                        : 'bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.9)_100%)]'
                    }`} />
                    <div className="relative z-10 flex h-full flex-col justify-between">
                      <div className="max-w-[88%]">
                        <span className={`mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full ${
                          isActive ? 'bg-white/16 text-white' : 'bg-[#edf4e7] text-[#1f4b26]'
                        }`}>
                          <Icon size={16} weight="bold" />
                        </span>
                        <div className="font-display text-[1.3rem] font-semibold leading-none">{item.label}</div>
                        <div className={`mt-1 text-[0.72rem] leading-tight ${isActive ? 'text-white/82' : 'text-[#4d614d]'}`}>
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          <section>
            <label className="app-field-label">Target Point</label>
            <div className="grid grid-cols-3 gap-3">
              {TARGETS.map((item) => {
                const isActive = targetScore === item.score

                return (
                  <button
                    key={item.score}
                    type="button"
                    onClick={() => setTargetScore(item.score)}
                    className={`rounded-[14px] border-[2px] px-3 py-3 text-left transition ${
                      isActive
                        ? 'border-[#1f4b26] bg-[#3f9f37] text-white shadow-[2px_2px_0_rgba(31,75,38,0.98)]'
                        : 'border-[#1f4b26] bg-white text-[#1f4b26] shadow-[2px_2px_0_rgba(31,75,38,0.98)]'
                    }`}
                  >
                    <div className="font-display text-[1.3rem] leading-none">{item.score}</div>
                    <div className={`mt-1 text-[0.72rem] ${isActive ? 'text-white/88' : 'text-[#587158]'}`}>
                      {item.label}
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <label className="app-field-label !mb-0">Pemain</label>
              <span className="font-display text-[1rem] leading-none text-[#1f7a30]">
                ({players.length} orang)
              </span>
            </div>

            <div className="rounded-[18px] border-[2px] border-[#1f4b26] bg-white p-3 shadow-[2px_2px_0_rgba(31,75,38,0.98)]">
              <input
                type="text"
                value={nameInput}
                onChange={(event) => setNameInput(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && handleAddPlayer()}
                placeholder="Masukan Nama Pemain"
                className="mb-3 w-full bg-transparent px-2 py-1 text-[0.88rem] text-[#223126] outline-none placeholder:text-[#8da18d]"
              />

              <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`flex h-11 items-center justify-center gap-2 rounded-[12px] border-[2px] px-3 text-[0.82rem] font-bold transition ${
                    gender === 'male'
                      ? 'border-[#1f4b26] bg-[#3f9f37] text-white'
                      : 'border-[#9ad092] bg-white text-[#1f4b26]'
                  }`}
                >
                  <span className="material-symbols-rounded !text-[18px]">face</span>
                  <span style={{ fontWeight: 600 }}>Male</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`flex h-11 items-center justify-center gap-2 rounded-[12px] border-[2px] px-3 text-[0.82rem] font-bold transition ${
                    gender === 'female'
                      ? 'border-[#1f4b26] bg-[#3f9f37] text-white'
                      : 'border-[#9ad092] bg-white text-[#1f4b26]'
                  }`}
                >
                  <span className="material-symbols-rounded !text-[18px]">face_4</span>
                  <span style={{ fontWeight: 600 }}>Female</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddPlayer}
                  className="flex h-11 items-center justify-center gap-2 rounded-[12px] border-[2px] border-[#1f4b26] bg-[#c6ff10] shadow-[2px_2px_0_rgba(31,75,38,0.98)] px-4 text-[0.84rem] font-bold text-[#1f2d13] transition active:translate-y-px"
                >
                  <Plus size={15} weight="bold" />
                  <span style={{ fontWeight: 800 }}>Add</span>
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-2.5">
              {players.length === 0 ? (
                <div className="app-soft-card px-4 py-5 text-center text-[0.82rem] text-[#6d7c6d]">
                  {format ? FORMAT_RULES[format].emptyHint : 'Pilih format dulu, lalu tambahkan pemain untuk mulai.'}
                </div>
              ) : null}

              {players.map((player, index) => (
                <div key={player.id} className="app-soft-card px-3 py-2.5 shadow-[2px_2px_0_rgba(31,75,38,0.98)]">
                  {editingId === player.id ? (
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#edf4e7] text-[#1f4b26]">
                        {player.gender === 'female'
                          ? <GenderFemale size={14} weight="bold" />
                          : <GenderMale size={14} weight="bold" />}
                      </span>
                      <input
                        autoFocus
                        type="text"
                        value={editingName}
                        onChange={(event) => setEditingName(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') confirmEditName(player.id)
                          if (event.key === 'Escape') setEditingId(null)
                        }}
                        className="flex-1 border-b border-[#7fc77a] bg-transparent pb-1 text-[0.9rem] font-semibold outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => confirmEditName(player.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-[#2f8f33]"
                      >
                        <Check size={16} weight="bold" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-[#6d7c6d]"
                      >
                        <X size={16} weight="bold" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="font-display text-[1rem] text-[#1f4b26]">{index + 1}</span>
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#edf4e7] text-[#1f4b26]">
                          {player.gender === 'female'
                            ? <GenderFemale size={14} weight="bold" />
                            : <GenderMale size={14} weight="bold" />}
                        </span>
                        <span className="truncate text-[0.86rem] font-semibold text-[#223126]">{player.name}</span>
                        <span className="rounded-full bg-[#1f4b26] px-2 py-0.5 text-[0.62rem] font-bold uppercase text-white">
                          {player.gender === 'female' ? 'F' : 'M'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => startEditName(player)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-[#1f4b26]"
                        >
                          <PencilSimpleLine size={14} weight="bold" />
                        </button>
                        {!sessionStarted ? (
                          <button
                            type="button"
                            onClick={() => removePlayer(player.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-[#1f4b26]"
                          >
                            <X size={15} weight="bold" />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {sessionStarted ? (
            <div className="app-soft-card flex items-start gap-3 px-4 py-3 text-[0.82rem] text-[#466246]">
              <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#edf4e7] text-[#2f8f33]">
                <Check size={14} weight="bold" />
              </span>
              <div>
                <div className="font-display text-[1rem] uppercase leading-none text-[#1f4b26]">Sesi sedang berjalan</div>
                <div className="mt-1">Nama pemain masih bisa diubah, tetapi pemain tidak bisa dihapus.</div>
              </div>
            </div>
          ) : (
            <button type="button" onClick={handleStart} className="app-primary-button flex items-center justify-center gap-2">
              <span>Mulai Main</span>
              <PersonSimpleRunIcon size={18} weight="bold" />
            </button>
          )}
        </div>
      </main>
    </div>
  )
}

export default Setup
