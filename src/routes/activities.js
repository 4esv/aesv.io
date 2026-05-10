// /activities — chess last-victory + strava last-activity.

import { Chess } from 'chess.js'

import { renderBoardSvg } from '../lib/chess-board-svg.js'
import { renderPage } from '../lib/render.js'
import { getLastVictory } from '../services/chess.js'
import { getLastActivity } from '../services/strava.js'

const TEMPLATE = 'activities/index.njk'

function buildReplayFrames(pgn) {
  if (!pgn) return []
  try {
    const chess = new Chess()
    chess.loadPgn(pgn)
    const history = chess.history({ verbose: true })
    const replay = new Chess()
    const frames = []
    for (const move of history) {
      const result = replay.move({ from: move.from, to: move.to, promotion: move.promotion })
      if (!result) break
      frames.push({ fen: replay.fen(), from: move.from, to: move.to })
    }
    return frames
  } catch {
    return []
  }
}

export async function registerActivitiesRoutes(fastify) {
  fastify.get('/chess', async (_request, reply) => reply.redirect('/activities', 301))

  fastify.get('/activities', async (request, reply) => {
    const username = fastify.config.chess.username

    const [lastVictory, strava] = await Promise.all([
      getLastVictory(username).catch(() => null),
      getLastActivity(fastify.config.strava).catch(() => null),
    ])

    // Final frame keeps the winning-move highlight; intermediate frames
    // highlight the just-played move so the eye can track it.
    let replayFramesSvg = []
    if (lastVictory?.pgn) {
      const frames = buildReplayFrames(lastVictory.pgn)
      replayFramesSvg = frames.map((f, idx) =>
        renderBoardSvg(f.fen, {
          highlight: { from: f.from, to: f.to },
          ...(idx === frames.length - 1 ? {} : { highlightTo: '#D9A56B' }),
        })
      )
    }

    return renderPage(fastify, request, reply, TEMPLATE, {
      username,
      lastVictory,
      replayFramesSvg,
      strava,
      hasData: Boolean(lastVictory || strava),
    })
  })
}
