/**
 * =============================================
 * SHUTTLEMABAR - Match Generation Algorithm v5
 * =============================================
 * - Jumlah main & duduk adil merata
 * - Urutan ronde dioptimasi: tidak ada yang
 *   duduk berturut-turut (max 1x untuk n=4,5,6)
 */

function rotateFair(players) {
  const offset = Math.floor(Date.now() / 1000) % players.length
  return [...players.slice(offset), ...players.slice(0, offset)]
}

// Interleave kelompok duduk supaya tidak ada yang
// duduk berturut-turut sebisa mungkin
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
    groupArrays.forEach(g => {
      if (i < g.length) result.push(g[i])
    })
  }
  return result
}

/**
 * Tabel dasar (belum diinterleave)
 * Setelah interleave, max duduk berturut-turut:
 * n=4 → 0x | n=5 → 1x | n=6 → 1x
 * n=7 → 3x (tidak bisa dihindari) | n=8 → 2x
 */
const BASE_TABLES = {
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
    { teamA:[0,2], teamB:[1,3], sitting:[4,5] },
    { teamA:[0,3], teamB:[1,2], sitting:[4,5] },
    { teamA:[0,4], teamB:[1,5], sitting:[2,3] },
    { teamA:[2,4], teamB:[3,5], sitting:[0,1] },
    { teamA:[0,5], teamB:[1,4], sitting:[2,3] },
    { teamA:[2,5], teamB:[3,4], sitting:[0,1] },
    { teamA:[0,1], teamB:[4,5], sitting:[2,3] },
    { teamA:[2,3], teamB:[4,5], sitting:[0,1] },
  ],
  7: [
    { teamA:[0,1], teamB:[2,3], sitting:[4,5,6] },
    { teamA:[0,2], teamB:[1,3], sitting:[4,5,6] },
    { teamA:[0,3], teamB:[1,2], sitting:[4,5,6] },
    { teamA:[0,4], teamB:[5,6], sitting:[1,2,3] },
    { teamA:[1,5], teamB:[4,6], sitting:[0,2,3] },
    { teamA:[2,6], teamB:[4,5], sitting:[0,1,3] },
    { teamA:[3,4], teamB:[5,6], sitting:[0,1,2] },
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

// ── AMERICANO ────────────────────────────────
export function generateAmericano(players) {
  if (players.length < 4) {
    alert('Americano butuh minimal 4 pemain!')
    return []
  }

  const rotated = rotateFair(players)
  const n = rotated.length
  const baseTable = BASE_TABLES[n]

  if (baseTable) {
    // Interleave supaya urutan duduk adil & tidak berturut-turut
    const optimized = interleaveGroups(baseTable)

    return optimized.map((round, i) => ({
      id: i + 1,
      round: i + 1,
      court: 1,
      teamA: round.teamA.map(idx => rotated[idx]),
      teamB: round.teamB.map(idx => rotated[idx]),
      scoreA: 0,
      scoreB: 0,
      status: i === 0 ? 'active' : 'pending',
      sittingOut: round.sitting.map(idx => rotated[idx]),
    }))
  }

  return generateLargeGroup(rotated)
}

function generateLargeGroup(rotated) {
  const numCourts = Math.floor(rotated.length / 4)
  const sittingPool = rotated.slice(numCourts * 4)
  const matches = []
  let matchId = 1

  for (let court = 0; court < numCourts; court++) {
    const group = rotated.slice(court * 4, court * 4 + 4)
    const optimized = interleaveGroups(BASE_TABLES[4])
    optimized.forEach((round, i) => {
      matches.push({
        id: matchId++,
        round: i + 1,
        court: court + 1,
        teamA: round.teamA.map(idx => group[idx]),
        teamB: round.teamB.map(idx => group[idx]),
        scoreA: 0,
        scoreB: 0,
        status: 'pending',
        sittingOut: sittingPool,
      })
    })
  }

  if (matches.length > 0) matches[0].status = 'active'
  return matches
}

// ── SINGLES ──────────────────────────────────
function getRoundRobinRounds(players) {
  const list = [...players]
  if (list.length % 2 !== 0) list.push({ id: 'bye', name: 'BYE' })
  const total = list.length
  const rounds = []

  for (let round = 0; round < total - 1; round++) {
    const pairs = []
    for (let i = 0; i < total / 2; i++) {
      pairs.push([list[i], list[total - 1 - i]])
    }
    rounds.push(pairs)
    const fixed = list[0]
    const rotating = list.slice(1)
    rotating.unshift(rotating.pop())
    list.splice(0, total, fixed, ...rotating)
  }
  return rounds
}

export function generateSingles(players) {
  const matches = []
  let matchId = 1
  const rounds = getRoundRobinRounds(players)

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

export function generateMixed(players) {
  return generateSingles(players)
}

export function generateFixedDoubles(players) {
  const teams = []
  for (let i = 0; i + 1 < players.length; i += 2) {
    teams.push([players[i], players[i + 1]])
  }
  if (teams.length < 2) return []

  const matches = []
  let matchId = 1

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

export function generateMatches(format, players) {
  switch (format) {
    case 'americano': return generateAmericano(players)
    case 'singles':   return generateSingles(players)
    case 'mixed':     return generateMixed(players)
    case 'fixed':     return generateFixedDoubles(players)
    default:          return generateSingles(players)
  }
}