const PIECES = {
  K: '\u265A',
  Q: '\u265B',
  R: '\u265C',
  B: '\u265D',
  N: '\u265E',
  P: '\u265F',
  k: '\u2654',
  q: '\u2655',
  r: '\u2656',
  b: '\u2657',
  n: '\u2658',
  p: '\u2659',
}

const LIGHT_EMPTY = '\u00B7'
const DARK_EMPTY = ' '

function fenToBoard(fen) {
  const placement = fen.split(' ')[0]
  const rows = placement.split('/')
  const board = []

  for (let r = 0; r < rows.length; r++) {
    const rank = []
    let file = 0
    for (const ch of rows[r]) {
      if (ch >= '1' && ch <= '8') {
        for (let i = 0; i < parseInt(ch, 10); i++) {
          const isDark = (r + file) % 2 === 1
          rank.push(isDark ? DARK_EMPTY : LIGHT_EMPTY)
          file++
        }
      } else {
        rank.push(PIECES[ch] || ch)
        file++
      }
    }
    board.push(rank)
  }

  return board
}

/**
 * Render a FEN string as an array of display lines (always from white's perspective)
 * @param {string} fen - FEN position string
 * @returns {string[]}
 */
export function renderBoard(fen) {
  const board = fenToBoard(fen)

  const rankLabels = [8, 7, 6, 5, 4, 3, 2, 1]
  const fileLabels = 'a b c d e f g h'

  const lines = []

  for (let i = 0; i < 8; i++) {
    const pieces = board[i].join(' ')
    lines.push(`${rankLabels[i]}  ${pieces}`)
  }

  lines.push(`   ${fileLabels}`)

  return lines
}
