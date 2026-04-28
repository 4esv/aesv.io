// /chess — chess.com receipts for 4esv
//
// Pulls profile, ratings, recent ~20 games and the last-victory board in
// parallel. Each call is independent and tolerates a chess.com outage —
// missing data renders as an empty state, never as a 500. Same dual-render
// pattern as the rest of the site: HTML for browsers, plain ascii for
// terminals via `request.grid.isTerminal`.

import { getLastVictory, getProfile, getRecentGames, getStats } from '../services/chess.js'

const TEMPLATE = 'chess/index.njk'
const RECENT_LIMIT = 20

const FORMAT_LABELS = {
  rapid: 'rapid',
  blitz: 'blitz',
  bullet: 'bullet',
  daily: 'daily',
}

function formatDate(unixSeconds) {
  if (!unixSeconds) return ''
  const d = new Date(unixSeconds * 1000)
  if (Number.isNaN(d.getTime())) return ''
  const yyyy = d.getUTCFullYear()
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function tallyRecord(games) {
  const tally = { win: 0, loss: 0, draw: 0 }
  for (const g of games) {
    if (g.outcome === 'win') tally.win += 1
    else if (g.outcome === 'draw') tally.draw += 1
    else tally.loss += 1
  }
  return tally
}

function decorateGames(games) {
  return games.map((g) => ({
    ...g,
    date: formatDate(g.endTime),
    formatLabel: FORMAT_LABELS[g.timeClass] || g.timeClass,
    outcomeChar: g.outcome === 'win' ? 'W' : g.outcome === 'draw' ? 'D' : 'L',
  }))
}

export async function registerChessRoutes(fastify) {
  fastify.get('/chess', async (request, reply) => {
    const { grid } = request
    const username = fastify.config.chess.username

    const [profile, stats, rawGames, lastVictory] = await Promise.all([
      getProfile(username).catch(() => null),
      getStats(username).catch(() => null),
      getRecentGames(username, RECENT_LIMIT).catch(() => []),
      getLastVictory(username).catch(() => null),
    ])

    const games = decorateGames(rawGames || [])
    const record = tallyRecord(games)

    const payload = {
      site: fastify.config.site,
      grid,
      route: '/chess',
      username,
      profile,
      stats,
      games,
      record,
      lastVictory,
      hasData: Boolean(profile || stats || games.length || lastVictory),
    }

    if (grid.isTerminal) {
      reply.header('Content-Type', 'text/plain; charset=utf-8')
    }

    return reply.view(TEMPLATE, payload)
  })
}
