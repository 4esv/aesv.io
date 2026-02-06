// test/grid/text.test.js
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { wrapText, truncate, padLine, centerText, rightAlign, hrule } from '../../src/grid/text.js'

describe('wrapText', () => {
  it('wraps text at word boundaries', () => {
    const result = wrapText('hello world foo bar', 10)
    assert.deepEqual(result, ['hello', 'world foo', 'bar'])
  })

  it('handles text shorter than width', () => {
    const result = wrapText('hello', 10)
    assert.deepEqual(result, ['hello'])
  })

  it('handles empty string', () => {
    const result = wrapText('', 10)
    assert.deepEqual(result, [''])
  })

  it('handles null/undefined', () => {
    const result = wrapText(null, 10)
    assert.deepEqual(result, [''])
  })

  it('handles long words by breaking them', () => {
    const result = wrapText('supercalifragilistic', 5)
    assert.deepEqual(result, ['super', 'calif', 'ragil', 'istic'])
  })

  it('preserves paragraph breaks', () => {
    const result = wrapText('hello\n\nworld', 10)
    assert.deepEqual(result, ['hello', '', 'world'])
  })
})

describe('truncate', () => {
  it('truncates long strings', () => {
    const result = truncate('hello world', 8)
    assert.equal(result, 'hello w…')
  })

  it('returns original if shorter than width', () => {
    const result = truncate('hello', 10)
    assert.equal(result, 'hello')
  })

  it('handles custom suffix', () => {
    const result = truncate('hello world', 8, '...')
    assert.equal(result, 'hello...')
  })

  it('handles empty string', () => {
    const result = truncate('', 10)
    assert.equal(result, '')
  })

  it('handles width smaller than suffix', () => {
    const result = truncate('hello', 2, '...')
    assert.equal(result, '..')
  })
})

describe('padLine', () => {
  it('pads to the right (left-align) by default', () => {
    const result = padLine('hello', 10)
    assert.equal(result, 'hello     ')
  })

  it('pads to the left (right-align)', () => {
    const result = padLine('hello', 10, 'right')
    assert.equal(result, '     hello')
  })

  it('centers text', () => {
    const result = padLine('hello', 10, 'center')
    assert.equal(result, '  hello   ')
  })

  it('truncates if longer than width', () => {
    const result = padLine('hello world', 5)
    assert.equal(result, 'hello')
  })

  it('handles empty string', () => {
    const result = padLine('', 5)
    assert.equal(result, '     ')
  })

  it('uses custom padding character', () => {
    const result = padLine('hi', 5, 'left', '-')
    assert.equal(result, 'hi---')
  })
})

describe('centerText', () => {
  it('centers and pads', () => {
    const result = centerText('hi', 10)
    assert.equal(result, '    hi    ')
  })

  it('truncates if too long', () => {
    const result = centerText('hello world foo', 10)
    assert.equal(result, 'hello wor…')
  })
})

describe('rightAlign', () => {
  it('right-aligns text', () => {
    const result = rightAlign('hi', 10)
    assert.equal(result, '        hi')
  })
})

describe('hrule', () => {
  it('creates horizontal rule', () => {
    const result = hrule(5)
    assert.equal(result, '─────')
  })

  it('uses custom character', () => {
    const result = hrule(5, '=')
    assert.equal(result, '=====')
  })
})
