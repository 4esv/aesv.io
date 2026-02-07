import { Chess } from 'chess.js'
import { renderBoard } from '../lib/chess-renderer.js'

const API_BASE = 'https://api.chess.com/pub/player'
const USER_AGENT = 'aesv.io/1.0'

async function chessApi(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
  })
  if (!res.ok) return null
  return res.json()
}

function getUsername(player) {
  return typeof player === 'object' ? player.username : player?.split('/').pop() || '?'
}

function getPlayerColor(game, username) {
  const lower = username.toLowerCase()
  if (getUsername(game.white).toLowerCase() === lower) return 'white'
  if (getUsername(game.black).toLowerCase() === lower) return 'black'
  return null
}

function isWin(game, username) {
  const color = getPlayerColor(game, username)
  if (!color) return false
  const result = color === 'white' ? game.white : game.black
  if (typeof result === 'object') return result.result === 'win'
  return false
}

function getFen(pgn) {
  try {
    const chess = new Chess()
    chess.loadPgn(pgn)
    return chess.fen()
  } catch {
    return null
  }
}

export async function getLastVictory(username) {
  try {
    const archives = await chessApi(`${API_BASE}/${username}/games/archives`)
    if (!archives?.archives?.length) return null

    // NOTE: iterate from most recent archive backwards
    for (let i = archives.archives.length - 1; i >= 0; i--) {
      const monthData = await chessApi(archives.archives[i])
      if (!monthData?.games?.length) continue

      // NOTE: iterate games from most recent
      for (let j = monthData.games.length - 1; j >= 0; j--) {
        const game = monthData.games[j]
        if (!isWin(game, username)) continue

        const color = getPlayerColor(game, username)
        const fen = getFen(game.pgn)
        if (!fen) continue

        return {
          white: getUsername(game.white),
          black: getUsername(game.black),
          result: `${color} wins`,
          url: game.url,
          board: renderBoard(fen, color),
        }
      }
    }

    return null
  } catch {
    return null
  }
}
