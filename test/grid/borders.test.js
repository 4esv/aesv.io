// test/grid/borders.test.js
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  BOX,
  hborder,
  vborder,
  box,
  titledBox,
  divider,
  joinHorizontal,
} from '../../src/grid/borders.js'

describe('BOX character sets', () => {
  it('has light box characters', () => {
    assert.equal(BOX.light.h, '─')
    assert.equal(BOX.light.v, '│')
    assert.equal(BOX.light.tl, '┌')
    assert.equal(BOX.light.br, '┘')
  })

  it('has rounded corners', () => {
    assert.equal(BOX.rounded.tl, '╭')
    assert.equal(BOX.rounded.br, '╯')
  })

  it('has ascii fallback', () => {
    assert.equal(BOX.ascii.h, '-')
    assert.equal(BOX.ascii.v, '|')
    assert.equal(BOX.ascii.tl, '+')
  })
})

describe('hborder', () => {
  it('creates top border', () => {
    const result = hborder(5, 'top')
    assert.equal(result, '┌─────┐')
  })

  it('creates bottom border', () => {
    const result = hborder(5, 'bottom')
    assert.equal(result, '└─────┘')
  })

  it('creates middle border', () => {
    const result = hborder(5, 'middle')
    assert.equal(result, '├─────┤')
  })

  it('uses custom character set', () => {
    const result = hborder(3, 'top', BOX.ascii)
    assert.equal(result, '+---+')
  })
})

describe('vborder', () => {
  it('wraps content with vertical borders', () => {
    const result = vborder('hello', 10)
    assert.equal(result, '│hello     │')
  })

  it('truncates long content', () => {
    const result = vborder('hello world', 5)
    assert.equal(result, '│hello│')
  })

  it('handles empty content', () => {
    const result = vborder('', 5)
    assert.equal(result, '│     │')
  })
})

describe('box', () => {
  it('creates complete box around content', () => {
    const result = box(['hello', 'world'], 7)
    assert.deepEqual(result, ['┌───────┐', '│hello  │', '│world  │', '└───────┘'])
  })

  it('handles empty content', () => {
    const result = box([], 5)
    assert.deepEqual(result, ['┌─────┐', '└─────┘'])
  })
})

describe('titledBox', () => {
  it('creates box with title in top border', () => {
    const result = titledBox('Test', ['content'], 12)
    assert.equal(result[0].includes('Test'), true)
    assert.equal(result[0].startsWith('┌'), true)
    assert.equal(result[0].endsWith('┐'), true)
  })
})

describe('divider', () => {
  it('creates interior divider', () => {
    const result = divider(5)
    assert.equal(result, '├─────┤')
  })
})

describe('joinHorizontal', () => {
  it('joins two boxes side by side', () => {
    const left = ['┌──┐', '│ab│', '└──┘']
    const right = ['┌──┐', '│cd│', '└──┘']
    const result = joinHorizontal(left, right, 1)

    assert.equal(result.length, 3)
    assert.equal(result[0], '┌──┐ ┌──┐')
    assert.equal(result[1], '│ab│ │cd│')
  })

  it('handles different heights', () => {
    const left = ['┌──┐', '│ab│', '└──┘']
    const right = ['┌──┐', '└──┘']
    const result = joinHorizontal(left, right, 0)

    assert.equal(result.length, 3)
    assert.equal(result[2], '└──┘')
  })
})
