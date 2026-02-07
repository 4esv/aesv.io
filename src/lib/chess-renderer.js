const PIECES = {
  K: '\u2654',
  Q: '\u2655',
  R: '\u2656',
  B: '\u2657',
  N: '\u2658',
  P: '\u2659',
  k: '\u265A',
  q: '\u265B',
  r: '\u265C',
  b: '\u265D',
  n: '\u265E',
  p: '\u265F',
}

const EMPTY = '\u00B7'

function fenToBoard(fen) {
  const placement = fen.split(' ')[0]
  const rows = placement.split('/')
  const board = []

  for (const row of rows) {
    const rank = []
    for (const ch of row) {
      if (ch >= '1' && ch <= '8') {
        for (let i = 0; i < parseInt(ch, 10); i++) rank.push(EMPTY)
      } else {
        rank.push(PIECES[ch] || ch)
      }
    }
    board.push(rank)
  }

  return board
}

/**
 * Render a FEN string as an array of display lines
 * @param {string} fen - FEN position string
 * @param {'white'|'black'} perspective - which side is at the bottom
 * @returns {string[]}
 */
export function renderBoard(fen, perspective = 'white') {
  const board = fenToBoard(fen)

  if (perspective === 'black') {
    board.reverse()
    for (const row of board) row.reverse()
  }

  const rankLabels = perspective === 'white' ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8]
  const fileLabels = perspective === 'white' ? 'a b c d e f g h' : 'h g f e d c b a'

  const lines = []
  lines.push(
    '  \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510'
  )

  for (let i = 0; i < 8; i++) {
    const pieces = board[i].join(' ')
    lines.push(`${rankLabels[i]} \u2502 ${pieces} \u2502`)
  }

  lines.push(
    '  \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518'
  )
  lines.push(`    ${fileLabels}`)

  return lines
}
