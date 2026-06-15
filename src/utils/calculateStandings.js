function getPointDiff(player) {
  return player.pointsScored - player.pointsConceded
}
// Keep getPointDiff at top; sorting requires contextual head-to-head data

export function calculateStandings(players, matches) {
  const stats = {}
  const headToHead = {}

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
    headToHead[player.id] = {}
  })

  matches
    .filter((match) => match.status === 'done')
    .forEach((match) => {
      const winner = match.scoreA > match.scoreB
        ? 'A'
        : match.scoreB > match.scoreA
          ? 'B'
          : 'draw'

      // Update per-player stats and head-to-head records
      match.teamA.forEach((playerA) => {
        if (!stats[playerA.id]) return
        stats[playerA.id].matchesPlayed++
        stats[playerA.id].pointsScored += match.scoreA
        stats[playerA.id].pointsConceded += match.scoreB

        if (winner === 'draw') stats[playerA.id].draws++
        else if (winner === 'A') stats[playerA.id].wins++
        else stats[playerA.id].losses++

        // head-to-head vs each player on teamB
        match.teamB.forEach((playerB) => {
          if (!headToHead[playerA.id][playerB.id]) headToHead[playerA.id][playerB.id] = { wins: 0, draws: 0 }
          if (!headToHead[playerB.id][playerA.id]) headToHead[playerB.id][playerA.id] = { wins: 0, draws: 0 }

          if (winner === 'A') headToHead[playerA.id][playerB.id].wins++
          else if (winner === 'draw') {
            headToHead[playerA.id][playerB.id].draws++
            headToHead[playerB.id][playerA.id].draws++
          } else headToHead[playerB.id][playerA.id].wins++
        })
      })

      match.teamB.forEach((playerB) => {
        if (!stats[playerB.id]) return
        stats[playerB.id].matchesPlayed++
        stats[playerB.id].pointsScored += match.scoreB
        stats[playerB.id].pointsConceded += match.scoreA

        if (winner === 'draw') stats[playerB.id].draws++
        else if (winner === 'B') stats[playerB.id].wins++
        else stats[playerB.id].losses++
      })
    })

  // Sorting with head-to-head tie-break available
  function sortStandings(playerA, playerB) {
    // Primary: more wins
    if (playerB.wins !== playerA.wins) return playerB.wins - playerA.wins

    // Secondary: higher win rate (wins / matchesPlayed)
    const rateA = playerA.matchesPlayed > 0 ? playerA.wins / playerA.matchesPlayed : 0
    const rateB = playerB.matchesPlayed > 0 ? playerB.wins / playerB.matchesPlayed : 0
    if (rateB !== rateA) return rateB - rateA

    // Tertiary: head-to-head (if they played each other)
    const aVsB = headToHead[playerA.id] && headToHead[playerA.id][playerB.id]
      ? headToHead[playerA.id][playerB.id].wins
      : 0
    const bVsA = headToHead[playerB.id] && headToHead[playerB.id][playerA.id]
      ? headToHead[playerB.id][playerA.id].wins
      : 0
    if (aVsB !== bVsA) return bVsA - aVsB

    // Next: point difference (scored - conceded)
    const diffA = getPointDiff(playerA)
    const diffB = getPointDiff(playerB)
    if (diffB !== diffA) return diffB - diffA

    // Next: total points scored
    if (playerB.pointsScored !== playerA.pointsScored) {
      return playerB.pointsScored - playerA.pointsScored
    }

    return playerA.name.localeCompare(playerB.name)
  }

  return Object.values(stats).sort(sortStandings)
}
