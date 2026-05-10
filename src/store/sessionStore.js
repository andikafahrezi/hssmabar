import { create } from 'zustand'

const defaultSession = {
  sessionName: '',
  format: null,
  players: [],
  targetScore: 21,
  createdAt: null,
}

function loadFromStorage() {
  try {
    const saved = localStorage.getItem('shuttlemabar_session')
    return saved ? JSON.parse(saved) : defaultSession
  } catch {
    return defaultSession
  }
}

function loadMatchesFromStorage() {
  try {
    const saved = localStorage.getItem('shuttlemabar_matches')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

const useSessionStore = create((set, get) => ({
  // ── State ──
  ...loadFromStorage(),
  matches: loadMatchesFromStorage(),
  sessionStarted: !!localStorage.getItem('shuttlemabar_matches'),
  sessionFinished: localStorage.getItem('shuttlemabar_finished') === 'true',

  // ── Setup actions ──
  setSessionName: (name) => {
    set({ sessionName: name })
    get()._save()
  },
  setFormat: (format) => {
    set({ format })
    get()._save()
  },
  setTargetScore: (score) => {
    set({ targetScore: score })
    get()._save()
  },
  addPlayer: (player) => {
    const players = [...get().players, player]
    set({ players })
    get()._save()
  },
  removePlayer: (id) => {
    const players = get().players.filter(p => p.id !== id)
    set({ players })
    get()._save()
  },

  // Edit nama pemain — update di players DAN di matches (nama saja)
  editPlayerName: (id, newName) => {
    // Update di daftar pemain
    const players = get().players.map(p =>
      p.id === id ? { ...p, name: newName } : p
    )

    // Update nama di matches tanpa ubah struktur/urutan
    const matches = get().matches.map(m => ({
      ...m,
      teamA: m.teamA.map(p => p.id === id ? { ...p, name: newName } : p),
      teamB: m.teamB.map(p => p.id === id ? { ...p, name: newName } : p),
      sittingOut: (m.sittingOut || []).map(p =>
        p.id === id ? { ...p, name: newName } : p
      ),
    }))

    set({ players, matches })
    get()._save()
    localStorage.setItem('shuttlemabar_matches', JSON.stringify(matches))
  },

  // ── Match actions ──
  setMatches: (matches) => {
    set({ matches })
    localStorage.setItem('shuttlemabar_matches', JSON.stringify(matches))
  },
  startSession: () => {
    set({ sessionStarted: true, sessionFinished: false })
    localStorage.removeItem('shuttlemabar_finished')
  },
  finishSession: () => {
    set({ sessionFinished: true })
    localStorage.setItem('shuttlemabar_finished', 'true')
  },

  // Reset semua — hanya saat kembali ke Home
  resetAll: () => {
    set({ ...defaultSession, matches: [], sessionStarted: false, sessionFinished: false })
    localStorage.removeItem('shuttlemabar_session')
    localStorage.removeItem('shuttlemabar_matches')
    localStorage.removeItem('shuttlemabar_finished')
  },

  // Internal: simpan session ke localStorage
  _save: () => {
    const { sessionName, format, players, targetScore, createdAt } = get()
    localStorage.setItem('shuttlemabar_session', JSON.stringify({
      sessionName, format, players, targetScore, createdAt,
    }))
  },
}))

export default useSessionStore