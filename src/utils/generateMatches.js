const BYE_PLAYER = { id: '__bye__', name: 'BYE' }

function isByePlayer(player) {
  return player?.id === BYE_PLAYER.id
}

function playerKey(player) {
  return String(player.id)
}

function teamKey(team) {
  return team.map(playerKey).sort().join('|')
}

function matchupKey(playerA, playerB) {
  return [playerKey(playerA), playerKey(playerB)].sort().join('|')
}

function uniquePlayers(players) {
  const seen = new Set()
  return players.filter(player => {
    const key = playerKey(player)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function getRoundRobinRounds(items, byeItem = BYE_PLAYER) {
  const list = [...items]
  if (list.length % 2 !== 0) list.push(byeItem)

  const total = list.length
  const rounds = []

  for (let round = 0; round < total - 1; round++) {
    const pairs = []

    for (let i = 0; i < total / 2; i++) {
      const left = list[i]
      const right = list[total - 1 - i]
      pairs.push(round % 2 === 0 ? [left, right] : [right, left])
    }

    rounds.push(pairs)

    const fixed = list[0]
    const rotating = list.slice(1)
    rotating.unshift(rotating.pop())
    list.splice(0, total, fixed, ...rotating)
  }

  return rounds
}

function createPlayerStats(players) {
  return new Map(players.map(player => [
    playerKey(player),
    { played: 0, sat: 0 },
  ]))
}

function addPlayed(stats, players) {
  players.forEach(player => {
    const stat = stats.get(playerKey(player))
    if (stat) stat.played++
  })
}

function addSat(stats, players) {
  players.forEach(player => {
    const stat = stats.get(playerKey(player))
    if (stat) stat.sat++
  })
}

function teamStat(stats, team, field) {
  return team.reduce((total, player) => {
    return total + (stats.get(playerKey(player))?.[field] || 0)
  }, 0)
}

function hasSharedPlayer(teamA, teamB) {
  const ids = new Set(teamA.map(playerKey))
  return teamB.some(player => ids.has(playerKey(player)))
}

function opponentScore(teamA, teamB, opponentCounts) {
  let score = 0

  teamA.forEach(playerA => {
    teamB.forEach(playerB => {
      score += opponentCounts.get(matchupKey(playerA, playerB)) || 0
    })
  })

  return score
}

function recordOpponents(teamA, teamB, opponentCounts) {
  teamA.forEach(playerA => {
    teamB.forEach(playerB => {
      const key = matchupKey(playerA, playerB)
      opponentCounts.set(key, (opponentCounts.get(key) || 0) + 1)
    })
  })
}

function sortTeamsForPlay(teams, stats) {
  return [...teams].sort((teamA, teamB) => {
    const satDiff = teamStat(stats, teamB, 'sat') - teamStat(stats, teamA, 'sat')
    if (satDiff !== 0) return satDiff

    const playDiff = teamStat(stats, teamA, 'played') - teamStat(stats, teamB, 'played')
    if (playDiff !== 0) return playDiff

    return teamKey(teamA).localeCompare(teamKey(teamB))
  })
}

function findBestOpponent(teamA, teams, stats, opponentCounts) {
  let bestIndex = -1
  let bestScore = Infinity

  teams.forEach((teamB, index) => {
    if (hasSharedPlayer(teamA, teamB)) return

    const repeatedOpponents = opponentScore(teamA, teamB, opponentCounts) * 100
    const playBalance = teamStat(stats, teamB, 'played')
    const score = repeatedOpponents + playBalance

    if (score < bestScore) {
      bestScore = score
      bestIndex = index
    }
  })

  return bestIndex
}

function makeMatch({ id, round, court, teamA, teamB, sittingOut }) {
  return {
    id,
    round,
    court,
    teamA,
    teamB,
    scoreA: 0,
    scoreB: 0,
    status: 'pending',
    sittingOut,
  }
}

function activateFirstMatch(matches) {
  if (matches.length > 0) matches[0].status = 'active'
  return matches
}

function getMatchPlayers(match) {
  return [...match.teamA, ...match.teamB]
}

function reorderMatchesForRest(matches, players) {
  if (matches.length <= 1) return matches

  const pending = matches.map((match, index) => ({ match, index }))
  const currentStreaks = new Map(players.map(player => [playerKey(player), 0]))
  const scheduledPlays = new Map(players.map(player => [playerKey(player), 0]))
  const courtCount = Math.max(1, ...matches.map(match => match.court || 1))
  const ordered = []

  while (pending.length > 0) {
    let bestIndex = 0
    let bestScore = Infinity

    pending.forEach(({ match, index }, pendingIndex) => {
      const playing = getMatchPlayers(match)
      const playingIds = new Set(playing.map(playerKey))
      const streakPressure = playing.reduce((total, player) => {
        return total + (currentStreaks.get(playerKey(player)) || 0)
      }, 0)
      const maxProjectedStreak = Math.max(...playing.map(player => {
        return (currentStreaks.get(playerKey(player)) || 0) + 1
      }))
      const playBalancePressure = playing.reduce((total, player) => {
        return total + (scheduledPlays.get(playerKey(player)) || 0)
      }, 0)
      const restingRelief = players
        .filter(player => !playingIds.has(playerKey(player)))
        .reduce((total, player) => {
          return total + (currentStreaks.get(playerKey(player)) || 0)
        }, 0)
      const score = (streakPressure * 1000) +
        (maxProjectedStreak * 200) +
        (playBalancePressure * 10) -
        (restingRelief * 20) +
        (index / 1000)

      if (score < bestScore) {
        bestScore = score
        bestIndex = pendingIndex
      }
    })

    const [{ match }] = pending.splice(bestIndex, 1)
    const playingIds = new Set(getMatchPlayers(match).map(playerKey))

    players.forEach(player => {
      const key = playerKey(player)
      if (playingIds.has(key)) {
        currentStreaks.set(key, (currentStreaks.get(key) || 0) + 1)
        scheduledPlays.set(key, (scheduledPlays.get(key) || 0) + 1)
      } else {
        currentStreaks.set(key, 0)
      }
    })

    ordered.push(match)
  }

  return ordered.map((match, index) => ({
    ...match,
    id: index + 1,
    round: index + 1,
    court: (index % courtCount) + 1,
    status: 'pending',
  }))
}

function buildAmericanoMatches(players) {
  const playerStats = createPlayerStats(players)
  const opponentCounts = new Map()
  const courtCount = Math.max(1, Math.floor(players.length / 4))
  const partnerRounds = getRoundRobinRounds(players)

  const pendingTeams = partnerRounds.flatMap(round => {
    return round
      .filter(([playerA, playerB]) => !isByePlayer(playerA) && !isByePlayer(playerB))
      .map(([playerA, playerB]) => [playerA, playerB])
  })

  const originalTeams = [...pendingTeams]
  const duplicateCount = new Map()
  const matches = []
  let matchId = 1

  while (pendingTeams.length > 0) {
    const orderedTeams = sortTeamsForPlay(pendingTeams, playerStats)
    const teamA = orderedTeams[0]
    const teamAIndex = pendingTeams.findIndex(team => teamKey(team) === teamKey(teamA))
    pendingTeams.splice(teamAIndex, 1)

    const opponentIndex = findBestOpponent(teamA, pendingTeams, playerStats, opponentCounts)
    let teamB

    if (opponentIndex >= 0) {
      teamB = pendingTeams.splice(opponentIndex, 1)[0]
    } else {
      teamB = findDuplicateTeam(teamA, originalTeams, playerStats, opponentCounts, duplicateCount)
      if (!teamB) break
      duplicateCount.set(teamKey(teamB), (duplicateCount.get(teamKey(teamB)) || 0) + 1)
    }

    const playing = [...teamA, ...teamB]
    const playingIds = new Set(playing.map(playerKey))
    const sittingOut = players.filter(player => !playingIds.has(playerKey(player)))

    matches.push(makeMatch({
      id: matchId,
      round: matchId,
      court: ((matchId - 1) % courtCount) + 1,
      teamA,
      teamB,
      sittingOut,
    }))

    addPlayed(playerStats, playing)
    addSat(playerStats, sittingOut)
    recordOpponents(teamA, teamB, opponentCounts)
    matchId++
  }

  return matches
}

function findDuplicateTeam(teamA, teams, stats, opponentCounts, duplicateCount) {
  const candidates = teams.filter(team => !hasSharedPlayer(teamA, team))
  if (candidates.length === 0) return null

  return candidates.sort((teamB, teamC) => {
    const duplicateDiff = (duplicateCount.get(teamKey(teamB)) || 0) -
      (duplicateCount.get(teamKey(teamC)) || 0)
    if (duplicateDiff !== 0) return duplicateDiff

    const opponentDiff = opponentScore(teamA, teamB, opponentCounts) -
      opponentScore(teamA, teamC, opponentCounts)
    if (opponentDiff !== 0) return opponentDiff

    const playDiff = teamStat(stats, teamB, 'played') - teamStat(stats, teamC, 'played')
    if (playDiff !== 0) return playDiff

    return teamKey(teamB).localeCompare(teamKey(teamC))
  })[0]
}

function buildRoundRobinEntityMatches(entities, entityToPlayers, allPlayers) {
  const byeEntity = { id: '__bye_entity__', players: [BYE_PLAYER] }
  const rounds = getRoundRobinRounds(entities, byeEntity)
  const courtCount = Math.max(1, Math.floor(allPlayers.length / 4))
  const matches = []
  let matchId = 1

  rounds.forEach((pairs, roundIndex) => {
    const sittingOut = pairs.flatMap(([entityA, entityB]) => {
      if (entityA === byeEntity) return entityToPlayers(entityB)
      if (entityB === byeEntity) return entityToPlayers(entityA)
      return []
    })
    let court = 1

    pairs.forEach(([entityA, entityB]) => {
      if (entityA === byeEntity || entityB === byeEntity) return

      const teamA = entityToPlayers(entityA)
      const teamB = entityToPlayers(entityB)

      matches.push(makeMatch({
        id: matchId++,
        round: roundIndex + 1,
        court,
        teamA,
        teamB,
        sittingOut: uniquePlayers(sittingOut),
      }))

      court = court === courtCount ? 1 : court + 1
    })
  })

  return matches
}

export function generateAmericano(players) {
  if (players.length < 4) return []

  return activateFirstMatch(reorderMatchesForRest(buildAmericanoMatches(players), players))
}

export function generateSingles(players) {
  const matches = buildRoundRobinEntityMatches(
    players,
    player => [player],
    players
  )

  return activateFirstMatch(reorderMatchesForRest(matches, players))
}

export function generateMixed(players) {
  const males = players.filter(player => player.gender === 'male')
  const females = players.filter(player => player.gender === 'female')

  if (males.length < 2 || females.length < 2) {
    return []
  }

  const mixedTeams = []

  males.forEach(male => {
    females.forEach(female => {
      mixedTeams.push([male, female])
    })
  })

  return activateFirstMatch(reorderMatchesForRest(scheduleMixedTeams(mixedTeams, players), players))
}

function scheduleMixedTeams(teams, players) {
  const playerStats = createPlayerStats(players)
  const opponentCounts = new Map()
  const courtCount = Math.max(1, Math.floor(players.length / 4))
  const pendingTeams = [...teams]
  const originalTeams = [...teams]
  const duplicateCount = new Map()
  const matches = []
  let matchId = 1

  while (pendingTeams.length > 0) {
    const orderedTeams = sortTeamsForPlay(pendingTeams, playerStats)
    const teamA = orderedTeams[0]
    const teamAIndex = pendingTeams.findIndex(team => teamKey(team) === teamKey(teamA))
    pendingTeams.splice(teamAIndex, 1)

    const opponentIndex = findBestOpponent(teamA, pendingTeams, playerStats, opponentCounts)
    let teamB

    if (opponentIndex >= 0) {
      teamB = pendingTeams.splice(opponentIndex, 1)[0]
    } else {
      teamB = findDuplicateTeam(teamA, originalTeams, playerStats, opponentCounts, duplicateCount)
      if (!teamB) break
      duplicateCount.set(teamKey(teamB), (duplicateCount.get(teamKey(teamB)) || 0) + 1)
    }

    const playing = [...teamA, ...teamB]
    const playingIds = new Set(playing.map(playerKey))
    const sittingOut = players.filter(player => !playingIds.has(playerKey(player)))

    matches.push(makeMatch({
      id: matchId,
      round: matchId,
      court: ((matchId - 1) % courtCount) + 1,
      teamA,
      teamB,
      sittingOut,
    }))

    addPlayed(playerStats, playing)
    addSat(playerStats, sittingOut)
    recordOpponents(teamA, teamB, opponentCounts)
    matchId++
  }

  return matches
}

export function generateFixedDoubles(players) {
  const teams = []
  const unmatchedPlayers = []

  for (let i = 0; i < players.length; i += 2) {
    if (players[i + 1]) {
      teams.push([players[i], players[i + 1]])
    } else {
      unmatchedPlayers.push(players[i])
    }
  }

  if (teams.length < 2) return []

  const matches = buildRoundRobinEntityMatches(
    teams,
    team => team,
    players
  ).map(match => ({
    ...match,
    sittingOut: uniquePlayers([...(match.sittingOut || []), ...unmatchedPlayers]),
  }))

  return activateFirstMatch(reorderMatchesForRest(matches, players))
}

export function generateMatches(format, players) {
  switch (format) {
    case 'americano': return generateAmericano(players)
    case 'singles': return generateSingles(players)
    case 'mixed': return generateMixed(players)
    case 'fixed': return generateFixedDoubles(players)
    default: return generateSingles(players)
  }
}
