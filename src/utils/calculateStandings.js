function getPointDiff(player) {
  return player.pointsScored - player.pointsConceded
}

function sortStandings(playerA, playerB) {
  if (playerB.wins !== playerA.wins) return playerB.wins - playerA.wins

  if (playerB.pointsScored !== playerA.pointsScored) {
    return playerB.pointsScored - playerA.pointsScored
  }

  const diffA = getPointDiff(playerA)
  const diffB = getPointDiff(playerB)
  if (diffB !== diffA) return diffB - diffA

  if (playerB.matchesPlayed !== playerA.matchesPlayed) {
    return playerB.matchesPlayed - playerA.matchesPlayed
  }

  return playerA.name.localeCompare(playerB.name)
}

export function calculateStandings(players, matches) {
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

  return Object.values(stats).sort(sortStandings)
}
