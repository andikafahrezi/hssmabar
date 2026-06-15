import { describe, it, expect } from 'vitest'
import { calculateStandings } from './calculateStandings'

describe('calculateStandings', () => {
  it('prioritizes wins over total points scored', () => {
    const players = [
      { id: 'hasbi', name: 'Hasbi' },
      { id: 'silva', name: 'Silva' },
    ]

    const matches = [
      { status: 'done', teamA: [players[0]], teamB: [players[1]], scoreA: 19, scoreB: 21 },
      { status: 'done', teamA: [players[0]], teamB: [players[1]], scoreA: 18, scoreB: 21 },
      { status: 'done', teamA: [players[0]], teamB: [players[1]], scoreA: 17, scoreB: 21 },
      { status: 'done', teamA: [players[0]], teamB: [players[1]], scoreA: 16, scoreB: 21 },
      { status: 'done', teamA: [players[0]], teamB: [players[1]], scoreA: 15, scoreB: 21 },
      { status: 'done', teamA: [players[0]], teamB: [players[1]], scoreA: 21, scoreB: 10 },
    ]

    const standings = calculateStandings(players, matches)

    expect(standings[0].id).toBe('silva')
    expect(standings[1].id).toBe('hasbi')
  })

  it('uses win rate when wins are equal', () => {
    const players = [
      { id: 'alice', name: 'Alice' },
      { id: 'bob', name: 'Bob' },
      { id: 'chris', name: 'Chris' },
    ]

    const matches = [
      { status: 'done', teamA: [players[0]], teamB: [players[1]], scoreA: 21, scoreB: 19 },
      { status: 'done', teamA: [players[0]], teamB: [players[2]], scoreA: 21, scoreB: 10 },
      { status: 'done', teamA: [players[1]], teamB: [players[2]], scoreA: 21, scoreB: 5 },
    ]

    const standings = calculateStandings(players, matches)

    expect(standings[0].id).toBe('alice')
    expect(standings[1].id).toBe('bob')
  })

  it('uses head-to-head when wins and win rate are tied', () => {
    const players = [
      { id: 'andy', name: 'Andy' },
      { id: 'bella', name: 'Bella' },
      { id: 'chris', name: 'Chris' },
    ]

    const matches = [
      { status: 'done', teamA: [players[0]], teamB: [players[1]], scoreA: 21, scoreB: 19 },
      { status: 'done', teamA: [players[0]], teamB: [players[2]], scoreA: 19, scoreB: 21 },
      { status: 'done', teamA: [players[1]], teamB: [players[2]], scoreA: 21, scoreB: 19 },
    ]

    const standings = calculateStandings(players, matches)

    expect(standings.map((player) => player.id)).toEqual(['andy', 'bella', 'chris'])
  })

  it('handles doubles matches for Americano ranking', () => {
    const players = [
      { id: 'p1', name: 'P1' },
      { id: 'p2', name: 'P2' },
      { id: 'p3', name: 'P3' },
      { id: 'p4', name: 'P4' },
    ]

    const matches = [
      { status: 'done', teamA: [players[0], players[1]], teamB: [players[2], players[3]], scoreA: 21, scoreB: 18 },
      { status: 'done', teamA: [players[0], players[2]], teamB: [players[1], players[3]], scoreA: 15, scoreB: 21 },
      { status: 'done', teamA: [players[0], players[3]], teamB: [players[1], players[2]], scoreA: 19, scoreB: 21 },
    ]

    const standings = calculateStandings(players, matches)

    expect(standings[0].id).toBe('p2')
    expect(standings[1].id).toBe('p4')
    expect(standings[2].id).toBe('p1')
    expect(standings[3].id).toBe('p3')
  })

  it('ignores matches that are not done', () => {
    const players = [
      { id: 'x', name: 'X' },
      { id: 'y', name: 'Y' },
    ]

    const matches = [
      { status: 'pending', teamA: [players[0]], teamB: [players[1]], scoreA: 21, scoreB: 0 },
    ]

    const standings = calculateStandings(players, matches)

    expect(standings[0].wins).toBe(0)
    expect(standings[1].wins).toBe(0)
  })
})
