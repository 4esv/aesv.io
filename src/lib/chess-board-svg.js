// FEN → SVG renderer in the Simple-Friendly visual language.
// Ink-on-cream squares, square pieces as Unicode glyphs, 4px ink border.

const PIECE_GLYPH = {
  // White pieces (filled outline)
  K: '♔',
  Q: '♕',
  R: '♖',
  B: '♗',
  N: '♘',
  P: '♙',
  // Black pieces (solid)
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

export function renderBoardSvg(fen, opts = {}) {
  // No inner ink frame — the cell's own border + cartoon shadow provides the frame.
  // Squares fill the entire viewBox. Light squares = cream, dark = warm muted ink.
  const { size = 320, light = '#F4ECD8', dark = '#C8B999', ink = '#1A1A1A' } = opts
  const sq = size / 8
  const board = parseFen(fen)

  let squares = ''
  let pieces = ''

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const x = c * sq
      const y = r * sq
      const fill = (r + c) % 2 === 0 ? light : dark
      squares += `<rect x="${x}" y="${y}" width="${sq}" height="${sq}" fill="${fill}"/>`
      const p = board[r][c]
      if (p) {
        const glyph = PIECE_GLYPH[p] || ''
        const cx = x + sq / 2
        const cy = y + sq / 2 + sq * 0.06
        pieces += `<text x="${cx}" y="${cy}" font-size="${sq * 0.78}" text-anchor="middle" dominant-baseline="middle" fill="${ink}" font-family="serif">${glyph}</text>`
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" role="img" aria-label="chess board final position">${squares}${pieces}</svg>`
}
