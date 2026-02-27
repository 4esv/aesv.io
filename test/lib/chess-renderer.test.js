import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { renderBoard } from '../../src/lib/chess-renderer.js'

describe('renderBoard', () => {
  const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

  it('renders starting position from white perspective', () => {
    const lines = renderBoard(STARTING_FEN)
    assert.equal(lines.length, 9)
    assert.ok(lines[8].includes('a b c d e f g h'))
    // Black pieces on rank 8 (top) — outlined glyphs on dark bg
    assert.ok(lines[0].includes('\u2656'))
    // White pieces on rank 1 (bottom) — filled glyphs on dark bg
    assert.ok(lines[7].includes('\u265C'))
  })

  it('renders empty board', () => {
    const emptyFen = '8/8/8/8/8/8/8/8 w - - 0 1'
    const lines = renderBoard(emptyFen)
    assert.equal(lines.length, 9)
    for (let i = 0; i < 8; i++) {
      assert.ok(lines[i].includes('\u00B7'))
    }
  })

  it('renders a known endgame position', () => {
    const scholarsMate = 'rnb1kbnr/pppp1ppp/8/4p3/2B1P2q/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1'
    const lines = renderBoard(scholarsMate)
    assert.equal(lines.length, 9)
    assert.ok(lines[0].includes('\u2656'))
  })
})
