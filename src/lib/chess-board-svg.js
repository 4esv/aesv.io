// FEN → SVG renderer in the Simple-Friendly visual language.
// Ink-on-cream squares, Unicode pieces, optional last-move highlight.

const PIECE_GLYPH = {
  K: '♔',
  Q: '♕',
  R: '♖',
  B: '♗',
  N: '♘',
  P: '♙',
  k: '♚',
  q: '♛',
  r: '♜',
  b: '♝',
  n: '♞',
  p: '♟',
}

function parseFen(fen) {
  const board = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null))
  if (!fen) return board
  const rows = fen.split(' ')[0].split('/')
  for (let r = 0; r < 8; r++) {
    let c = 0
    for (const ch of rows[r] || '') {
      if (/\d/.test(ch)) c += parseInt(ch, 10)
      else {
        board[r][c] = ch
        c++
      }
    }
  }
  return board
}

// Algebraic ("e4") → board indices (row, col) where row 0 is rank 8.
function algebraicToRC(square) {
  if (!square || square.length < 2) return null
  const file = square.charCodeAt(0) - 'a'.charCodeAt(0)
  const rank = parseInt(square[1], 10)
  if (Number.isNaN(rank) || file < 0 || file > 7 || rank < 1 || rank > 8) return null
  return { r: 8 - rank, c: file }
}

/**
 * Render a board to SVG.
 * @param {string} fen - position to render
 * @param {object} [opts]
 * @param {number} [opts.size=320]
 * @param {{from: string, to: string}} [opts.highlight] - last move to highlight
 *   on the board (algebraic squares — e.g. {from: 'g7', to: 'g8'}).
 */
export function renderBoardSvg(fen, opts = {}) {
  const {
    size = 320,
    light = '#F4ECD8',
    dark = '#C8B999',
    ink = '#1A1A1A',
    highlightFrom = '#D9C77E', // ochre wash on the move-from square
    highlightTo = '#8579A0', // lavender wash on the move-to square (the winning move)
    highlight = null,
  } = opts
  const sq = size / 8
  const board = parseFen(fen)

  const fromRC = highlight?.from ? algebraicToRC(highlight.from) : null
  const toRC = highlight?.to ? algebraicToRC(highlight.to) : null

  let squares = ''
  let pieces = ''
  let marks = ''

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const x = c * sq
      const y = r * sq
      let fill = (r + c) % 2 === 0 ? light : dark
      if (fromRC && fromRC.r === r && fromRC.c === c) fill = highlightFrom
      if (toRC && toRC.r === r && toRC.c === c) fill = highlightTo
      squares += `<rect x="${x}" y="${y}" width="${sq}" height="${sq}" fill="${fill}"/>`
      const p = board[r][c]
      if (p) {
        const glyph = PIECE_GLYPH[p] || ''
        const cx = x + sq / 2
        const cy = y + sq / 2 + sq * 0.06
        const pieceColor = toRC && toRC.r === r && toRC.c === c ? '#F4ECD8' : ink
        pieces += `<text x="${cx}" y="${cy}" font-size="${sq * 0.78}" text-anchor="middle" dominant-baseline="middle" fill="${pieceColor}" font-family="serif">${glyph}</text>`
      }
    }
  }

  if (toRC) {
    // Tiny corner mark in cream so the winning move reads even in print.
    const x = toRC.c * sq
    const y = toRC.r * sq
    marks += `<rect x="${x + 2}" y="${y + 2}" width="${sq * 0.18}" height="${sq * 0.18}" fill="#F4ECD8"/>`
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" role="img" aria-label="chess board final position">${squares}${marks}${pieces}</svg>`
}
