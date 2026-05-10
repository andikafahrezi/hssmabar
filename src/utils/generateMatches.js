/**
 * SHUTTLEMABAR - Match Generation v5 Final
 * 
 * Semua jumlah pemain (4-20+) otomatis di-handle
 * dengan membagi ke pool dan menggunakan tabel
 * yang sudah diverifikasi matematis
 */

// ── Helpers ──────────────────────────────────

function rotateFair(players) {
  const offset = Math.floor(Date.now() / 1000) % players.length
  return [...players.slice(offset), ...players.slice(0, offset)]
}

function interleaveGroups(table) {
  const groups = new Map()
  table.forEach(r => {
    const key = [...r.sitting].sort().join(',')
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(r)
  })
  const groupArrays = [...groups.values()]
  const maxLen = Math.max(...groupArrays.map(g => g.length))
  const result = []
  for (let i = 0; i < maxLen; i++) {
    groupArrays.forEach(g => { if (i < g.length) result.push(g[i]) })
  }
  return result
}

// ── Tabel verified per ukuran pool ───────────

const TABLES = {
  4: [
    { teamA:[0,1], teamB:[2,3], sitting:[] },
    { teamA:[0,2], teamB:[1,3], sitting:[] },
    { teamA:[0,3], teamB:[1,2], sitting:[] },
  ],
  5: [
    { teamA:[0,1], teamB:[2,3], sitting:[4] },
    { teamA:[0,2], teamB:[1,4], sitting:[3] },
    { teamA:[0,3], teamB:[2,4], sitting:[1] },
    { teamA:[0,4], teamB:[1,3], sitting:[2] },
    { teamA:[1,2], teamB:[3,4], sitting:[0] },
  ],
  6: [
    { teamA:[0,1], teamB:[2,3], sitting:[4,5] },
    { teamA:[0,4], teamB:[1,5], sitting:[2,3] },
    { teamA:[2,4], teamB:[3,5], sitting:[0,1] },
    { teamA:[0,2], teamB:[1,3], sitting:[4,5] },
    { teamA:[0,5], teamB:[1,4], sitting:[2,3] },
    { teamA:[2,5], teamB:[3,4], sitting:[0,1] },
    { teamA:[0,3], teamB:[1,2], sitting:[4,5] },
    { teamA:[0,1], teamB:[4,5], sitting:[2,3] },
    { teamA:[2,3], teamB:[4,5], sitting:[0,1] },
  ],
  7: [
    { teamA:[0,1], teamB:[2,3], sitting:[4,5,6] },
    { teamA:[0,4], teamB:[5,6], sitting:[1,2,3] },
    { teamA:[1,5], teamB:[4,6], sitting:[0,2,3] },
    { teamA:[0,2], teamB:[1,3], sitting:[4,5,6] },
    { teamA:[2,6], teamB:[4,5], sitting:[0,1,3] },
    { teamA:[3,4], teamB:[5,6], sitting:[0,1,2] },
    { teamA:[0,3], teamB:[1,2], sitting:[4,5,6] },
  ],
  8: [
    { teamA:[0,1], teamB:[2,3], sitting:[4,5,6,7] },
    { teamA:[4,5], teamB:[6,7], sitting:[0,1,2,3] },
    { teamA:[0,2], teamB:[1,3], sitting:[4,5,6,7] },
    { teamA:[4,6], teamB:[5,7], sitting:[0,1,2,3] },
    { teamA:[0,3], teamB:[1,2], sitting:[4,5,6,7] },
    { teamA:[4,7], teamB:[5,6], sitting:[0,1,2,3] },
    { teamA:[0,4], teamB:[1,5], sitting:[2,3,6,7] },
    { teamA:[2,6], teamB:[3,7], sitting:[0,1,4,5] },
    { teamA:[0,5], teamB:[1,4], sitting:[2,3,6,7] },
    { teamA:[2,7], teamB:[3,6], sitting:[0,1,4,5] },
    { teamA:[0,6], teamB:[1,7], sitting:[2,3,4,5] },
    { teamA:[2,4], teamB:[3,5], sitting:[0,1,6,7] },
    { teamA:[0,7], teamB:[1,6], sitting:[2,3,4,5] },
    { teamA:[2,5], teamB:[3,4], sitting:[0,1,6,7] },
  ],
}

// ── Generate pool sizes dari n pemain ────────

function splitIntoPools(n) {
  const courts = Math.floor(n / 4)
  if (courts === 0) return []
  const base  = Math.floor(n / courts)
  const extra = n % courts
  const sizes = []
  for (let c = 0; c < courts; c++) {
    sizes.push(base + (c < extra ? 1 : 0))
  }
  return sizes
}

// ── Generate matches untuk satu pool ─────────

function generatePoolMatches(pool, courtNum, targetRounds) {
  const size  = pool.length
  const table = interleaveGroups(TABLES[size] || TABLES[Math.min(size, 8)])

  // Repeat tabel kalau targetRounds > panjang tabel
  const extended = []
  while (extended.length < targetRounds) {
    for (const r of table) {
      extended.push(r)
      if (extended.length >= targetRounds) break
    }
  }

  return extended.map((r, i) => ({
    round:     i + 1,
    court:     courtNum,
    teamA:     r.teamA.map(j => pool[j]),
    teamB:     r.teamB.map(j => pool[j]),
    sittingOut: r.sitting.map(j => pool[j]),
  }))
}

// ── AMERICANO ────────────────────────────────

export function generateAmericano(players) {
  if (players.length < 4) {
    alert('Americano butuh minimal 4 pemain!')
    return []
  }

  const rotated  = rotateFair(players)
  const n        = rotated.length
  const sizes    = splitIntoPools(n)

  // Bagi players ke pool
  const pools = []
  let idx = 0
  sizes.forEach(size => {
    pools.push(rotated.slice(idx, idx + size))
    idx += size
  })

  // Tentukan targetRounds = max panjang tabel antar pool
  const targetRounds = Math.max(
    ...pools.map(pool => {
      const t = TABLES[pool.length] || TABLES[Math.min(pool.length, 8)]
      return (interleaveGroups(t)).length
    })
  )

  // Generate matches per pool
  const perPool = pools.map((pool, i) =>
    generatePoolMatches(pool, i + 1, targetRounds)
  )

  // Flatten: semua court di ronde yang sama dijadikan satu list
  const matches = []
  let matchId = 1

  for (let r = 0; r < targetRounds; r++) {
    perPool.forEach(poolMatches => {
      if (r < poolMatches.length) {
        matches.push({
          id: matchId++,
          ...poolMatches[r],
          scoreA: 0,
          scoreB: 0,
          status: 'pending',
        })
      }
    })
  }

  if (matches.length > 0) matches[0].status = 'active'
  return matches
}

// ── SINGLES ──────────────────────────────────

function getRoundRobinRounds(players) {
  const list = [...players]
  if (list.length % 2 !== 0) list.push({ id: 'bye', name: 'BYE' })
  const total  = list.length
  const rounds = []

  for (let r = 0; r < total - 1; r++) {
    const pairs = []
    for (let i = 0; i < total / 2; i++) {
      pairs.push([list[i], list[total - 1 - i]])
    }
    rounds.push(pairs)
    const fixed    = list[0]
    const rotating = list.slice(1)
    rotating.unshift(rotating.pop())
    list.splice(0, total, fixed, ...rotating)
  }
  return rounds
}

export function generateSingles(players) {
  const matches = []
  let matchId   = 1
  const rounds  = getRoundRobinRounds(players)

  rounds.forEach((pairs, roundIdx) => {
    pairs.forEach(([p1, p2]) => {
      if (p1.id === 'bye' || p2.id === 'bye') return
      matches.push({
        id: matchId++,
        round: roundIdx + 1,
        court: 1,
        teamA: [p1],
        teamB: [p2],
        scoreA: 0,
        scoreB: 0,
        status: 'pending',
        sittingOut: [],
      })
    })
  })

  if (matches.length > 0) matches[0].status = 'active'
  return matches
}

// ── MIXED ─────────────────────────────────────

export function generateMixed(players) {
  // Untuk saat ini gunakan Singles
  // (bisa dikembangkan dengan filter gender)
  return generateSingles(players)
}

// ── FIXED DOUBLES ─────────────────────────────

export function generateFixedDoubles(players) {
  const teams = []
  for (let i = 0; i + 1 < players.length; i += 2) {
    teams.push([players[i], players[i + 1]])
  }
  if (teams.length < 2) return []

  const matches = []
  let matchId   = 1

  for (let i = 0; i < teams.length - 1; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push({
        id: matchId++,
        round: matchId - 1,
        court: 1,
        teamA: teams[i],
        teamB: teams[j],
        scoreA: 0,
        scoreB: 0,
        status: 'pending',
        sittingOut: [],
      })
    }
  }

  if (matches.length > 0) matches[0].status = 'active'
  return matches
}

// ── Main export ───────────────────────────────

export function generateMatches(format, players) {
  switch (format) {
    case 'americano': return generateAmericano(players)
    case 'singles':   return generateSingles(players)
    case 'mixed':     return generateMixed(players)
    case 'fixed':     return generateFixedDoubles(players)
    default:          return generateSingles(players)
  }
}