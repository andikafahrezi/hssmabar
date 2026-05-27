import { create } from 'zustand'

const defaultSession = {
  sessionName: '',
  format: null,
  players: [],
  targetScore: 21,
  createdAt: null,
}

const HISTORY_KEY = 'shuttlemabar_history'

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

function loadHistoryFromStorage() {
  try {
    const saved = localStorage.getItem(HISTORY_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function hasSessionData(session) {
  return Boolean(
    session.sessionName ||
    session.format ||
    session.players.length > 0 ||
    session.matches.length > 0
  )
}

const useSessionStore = create((set, get) => ({
  // ── State ──
  ...loadFromStorage(),
  matches: loadMatchesFromStorage(),
  history: loadHistoryFromStorage(),
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
    const createdAt = get().createdAt || new Date().toISOString()
    set({ createdAt, sessionStarted: true, sessionFinished: false })
    get()._save()
    localStorage.removeItem('shuttlemabar_finished')
  },
  finishSession: () => {
    set({ sessionFinished: true })
    localStorage.setItem('shuttlemabar_finished', 'true')
  },

  // ── Archive actions ──
  archiveCurrentSession: () => {
    const {
      sessionName,
      format,
      players,
      targetScore,
      createdAt,
      matches,
      sessionFinished,
      history,
    } = get()
    const currentSession = {
      sessionName,
      format,
      players,
      targetScore,
      createdAt,
      matches,
    }

    if (!hasSessionData(currentSession)) return null

    const archivedAt = new Date().toISOString()
    const archivedSession = {
      id: `${createdAt || archivedAt}-${archivedAt}`,
      ...currentSession,
      createdAt: createdAt || archivedAt,
      sessionFinished,
      archivedAt,
    }
    const nextHistory = [archivedSession, ...history].slice(0, 20)

    set({ history: nextHistory })
    localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory))

    return archivedSession
  },
  restoreArchivedSession: (archivedSession) => {
    const restoredSession = {
      sessionName: archivedSession.sessionName || '',
      format: archivedSession.format || null,
      players: archivedSession.players || [],
      targetScore: archivedSession.targetScore || 21,
      createdAt: archivedSession.createdAt || null,
    }
    const matches = archivedSession.matches || []
    const sessionFinished = Boolean(archivedSession.sessionFinished)

    set({
      ...restoredSession,
      matches,
      sessionStarted: matches.length > 0,
      sessionFinished,
    })
    localStorage.setItem('shuttlemabar_session', JSON.stringify(restoredSession))
    if (matches.length > 0) {
      localStorage.setItem('shuttlemabar_matches', JSON.stringify(matches))
    } else {
      localStorage.removeItem('shuttlemabar_matches')
    }
    if (sessionFinished) {
      localStorage.setItem('shuttlemabar_finished', 'true')
    } else {
      localStorage.removeItem('shuttlemabar_finished')
    }
  },
  deleteArchivedSession: (id) => {
    const history = get().history.filter((session) => session.id !== id)
    set({ history })
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  },

  // Reset semua — hanya saat kembali ke Home
  resetAll: () => {
    get().archiveCurrentSession()
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
