import { Chess } from 'chess.js'
import { renderBoard } from '../lib/chess-renderer.js'
import { renderBoardSvg } from '../lib/chess-board-svg.js'

const API_BASE = 'https://api.chess.com/pub/player'
const USER_AGENT = 'aesv.io/1.0 (mail@aesv.io)'
const CACHE_TTL_MS = 5 * 60 * 1000

// NOTE: shared in-memory cache keyed by full URL. Both getLastVictory and the
// new stats/recent endpoints share it so a single archive fetch serves both.
const cache = new Map()

async function chessApi(url) {
  const hit = cache.get(url)
  if (hit && hit.expiresAt > Date.now()) return hit.data

  try {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
    if (!res.ok) {
      cache.set(url, { data: null, expiresAt: Date.now() + CACHE_TTL_MS })
      return null
    }
    const data = await res.json()
    cache.set(url, { data, expiresAt: Date.now() + CACHE_TTL_MS })
    return data
  } catch {
    return null
  }
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

function getPlayerSide(game, username) {
  const color = getPlayerColor(game, username)
  if (!color) return { color: null, me: null, opp: null }
  const me = color === 'white' ? game.white : game.black
  const opp = color === 'white' ? game.black : game.white
  return { color, me, opp }
}

// NOTE: chess.com result strings: 'win' | 'checkmated' | 'resigned' | 'timeout'
// | 'stalemate' | 'agreed' | 'repetition' | 'insufficient' | 'abandoned' | ...
const DRAW_RESULTS = new Set([
  'agreed',
  'stalemate',
  'repetition',
  'insufficient',
  '50move',
  'timevsinsufficient',
])

function classifyResult(meResult) {
  if (meResult === 'win') return 'win'
  if (DRAW_RESULTS.has(meResult)) return 'draw'
  return 'loss'
}

function isWin(game, username) {
  const { me } = getPlayerSide(game, username)
  return me?.result === 'win'
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

// NOTE: Opening URLs look like
// https://www.chess.com/openings/Nimzowitsch-Defense-Scandinavian-Bogoljubov-Variation
// We strip the path tail and rehumanize the slug.
function ecoNameFromUrl(url) {
  if (!url) return null
  try {
    const slug = url.split('/').pop() || ''
    return slug.replace(/-/g, ' ').trim() || null
  } catch {
    return null
  }
}

function fmtTimeControl(game) {
  const tc = game.time_control || ''
  // Live games are seconds (e.g. "300" or "180+2"). Daily games are "1/259200".
  if (game.time_class === 'daily') {
    const m = /^1\/(\d+)$/.exec(tc)
    if (m) {
      const days = Math.round(parseInt(m[1], 10) / 86400)
      return `${days}d/move`
    }
    return tc
  }
  const [base, inc] = tc.split('+')
  const baseMin = Math.floor(parseInt(base, 10) / 60) || 0
  const baseSec = parseInt(base, 10) % 60
  const baseStr = baseSec ? `${baseMin}:${String(baseSec).padStart(2, '0')}` : `${baseMin}min`
  return inc ? `${baseStr}+${inc}` : baseStr
}

function summarizeGame(game, username) {
  const { color, me, opp } = getPlayerSide(game, username)
  if (!color) return null
  const outcome = classifyResult(me.result)
  return {
    url: game.url,
    color,
    outcome, // 'win' | 'loss' | 'draw'
    result: me.result, // raw result string
    opponent: opp?.username || '?',
    opponentRating: opp?.rating ?? null,
    myRating: me?.rating ?? null,
    eco: ecoNameFromUrl(game.eco),
    timeClass: game.time_class || 'unknown',
    timeControl: fmtTimeControl(game),
    endTime: game.end_time || null,
    fen: game.fen || null,
    pgn: game.pgn || '',
  }
}

// ---------- Public API ----------

export async function getArchiveList(username) {
  const data = await chessApi(`${API_BASE}/${username}/games/archives`)
  return data?.archives || []
}

/**
 * Last N games across the most recent archives. Walks backwards through
 * archives until we have `limit` games or run out of months.
 */
export async function getRecentGames(username, limit = 20) {
  try {
    const archives = await getArchiveList(username)
    if (!archives.length) return []

    const games = []
    for (let i = archives.length - 1; i >= 0 && games.length < limit; i--) {
      const month = await chessApi(archives[i])
      if (!month?.games?.length) continue
      // chess.com lists games oldest -> newest within a month
      for (let j = month.games.length - 1; j >= 0 && games.length < limit; j--) {
        const summary = summarizeGame(month.games[j], username)
        if (summary) games.push(summary)
      }
      // Safety bound: never walk more than 6 archives back per call.
      if (archives.length - i >= 6) break
    }
    return games
  } catch {
    return []
  }
}

/**
 * Current/best/worst ratings across rapid/blitz/bullet/daily plus tactics +
 * puzzle_rush blocks where present.
 */
export async function getStats(username) {
  try {
    const data = await chessApi(`${API_BASE}/${username}/stats`)
    if (!data) return null

    const formats = ['rapid', 'blitz', 'bullet', 'daily']
    const ratings = formats
      .map((f) => {
        const block = data[`chess_${f}`]
        if (!block) return null
        return {
          format: f,
          current: block.last?.rating ?? null,
          best: block.best?.rating ?? null,
          worst: block.worst?.rating ?? null,
          win: block.record?.win ?? 0,
          loss: block.record?.loss ?? 0,
          draw: block.record?.draw ?? 0,
        }
      })
      .filter(Boolean)

    const totals = ratings.reduce(
      (acc, r) => ({ win: acc.win + r.win, loss: acc.loss + r.loss, draw: acc.draw + r.draw }),
      { win: 0, loss: 0, draw: 0 }
    )

    const tactics = data.tactics
      ? {
          highest: data.tactics.highest?.rating ?? null,
          lowest: data.tactics.lowest?.rating ?? null,
        }
      : null

    const puzzleRush = data.puzzle_rush?.best
      ? {
          score: data.puzzle_rush.best.score ?? null,
          totalAttempts: data.puzzle_rush.best.total_attempts ?? null,
        }
      : null

    return { ratings, totals, tactics, puzzleRush }
  } catch {
    return null
  }
}

/**
 * Profile: name, country, avatar, joined, last online, status.
 */
export async function getProfile(username) {
  try {
    const data = await chessApi(`${API_BASE}/${username}`)
    if (!data) return null
    return {
      username: data.username || username,
      name: data.name || null,
      country: data.country ? data.country.split('/').pop() : null,
      joined: data.joined || null,
      lastOnline: data.last_online || null,
      status: data.status || null,
      avatar: data.avatar || null,
      url: data.url || `https://www.chess.com/member/${username}`,
    }
  } catch {
    return null
  }
}

export async function getLastVictory(username) {
  try {
    const archives = await getArchiveList(username)
    if (!archives.length) return null

    // NOTE: iterate from most recent archive backwards
    for (let i = archives.length - 1; i >= 0; i--) {
      const monthData = await chessApi(archives[i])
      if (!monthData?.games?.length) continue

      // NOTE: iterate games from most recent
      for (let j = monthData.games.length - 1; j >= 0; j--) {
        const game = monthData.games[j]
        if (!isWin(game, username)) continue

        const color = getPlayerColor(game, username)
        const fen = game.fen || getFen(game.pgn)
        if (!fen) continue

        return {
          white: getUsername(game.white),
          black: getUsername(game.black),
          result: `${color} wins`,
          url: game.url,
          fen,
          pgn: game.pgn || '',
          eco: ecoNameFromUrl(game.eco),
          timeControl: fmtTimeControl(game),
          timeClass: game.time_class || 'unknown',
          playerColor: color,
          board: renderBoard(fen),
          svg: renderBoardSvg(fen),
        }
      }
    }

    return null
  } catch {
    return null
  }
}

// Exposed for the route to render a final-position SVG for any game we surface.
export { renderBoardSvg }
