// test/grid/layout.test.js
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  getLayoutConfig,
  getContentRegion,
  splitColumns,
  splitRows,
  subRegion,
  padRegion,
} from '../../src/grid/layout.js'

describe('getLayoutConfig', () => {
  it('returns ultra-narrow for cols < 40', () => {
    const config = getLayoutConfig(30, 20)
    assert.equal(config.breakpoint, 'ultra-narrow')
    assert.equal(config.hasBorders, false)
    assert.equal(config.columns, 1)
  })

  it('returns compact for cols 40-79', () => {
    const config = getLayoutConfig(60, 20)
    assert.equal(config.breakpoint, 'compact')
    assert.equal(config.hasBorders, true)
    assert.equal(config.columns, 1)
  })

  it('returns standard for cols 80-119', () => {
    const config = getLayoutConfig(80, 24)
    assert.equal(config.breakpoint, 'standard')
    assert.equal(config.hasBorders, true)
    assert.equal(config.columns, 1)
  })

  it('returns wide for cols >= 120', () => {
    const config = getLayoutConfig(150, 40)
    assert.equal(config.breakpoint, 'wide')
    assert.equal(config.hasBorders, true)
    assert.equal(config.columns, 2)
  })

  it('includes hasNav based on rows', () => {
    assert.equal(getLayoutConfig(80, 5).hasNav, false)
    assert.equal(getLayoutConfig(80, 6).hasNav, true)
  })

  it('includes hasFooter based on rows', () => {
    assert.equal(getLayoutConfig(80, 9).hasFooter, false)
    assert.equal(getLayoutConfig(80, 10).hasFooter, true)
  })
})

describe('getContentRegion', () => {
  it('calculates content region for standard layout', () => {
    const config = getLayoutConfig(80, 24)
    const region = getContentRegion(config)

    // With nav (1), footer (1), borders (2 each side)
    assert.equal(region.x, 1)
    assert.equal(region.y, 2) // nav + border
    assert.equal(region.width, 78) // 80 - 2 borders
    assert.equal(region.height, 20) // 24 - nav - footer - 2 borders
  })

  it('calculates content region for ultra-narrow (no borders)', () => {
    const config = getLayoutConfig(30, 20)
    const region = getContentRegion(config)

    assert.equal(region.x, 0)
    assert.equal(region.width, 30)
  })

  it('handles minimum grid', () => {
    const config = getLayoutConfig(20, 10)
    const region = getContentRegion(config)

    assert.ok(region.width >= 1)
    assert.ok(region.height >= 1)
  })
})

describe('splitColumns', () => {
  it('splits region into two columns', () => {
    const region = { x: 0, y: 0, width: 80, height: 20 }
    const { left, right } = splitColumns(region, 2)

    assert.equal(left.width, 39)
    assert.equal(right.width, 39)
    assert.equal(right.x, 41) // left width + gap
  })

  it('handles odd widths', () => {
    const region = { x: 0, y: 0, width: 81, height: 20 }
    const { left, right } = splitColumns(region, 2)

    assert.equal(left.width + 2 + right.width, 81)
  })
})

describe('splitRows', () => {
  it('splits region into rows with fixed heights', () => {
    const region = { x: 0, y: 0, width: 80, height: 30 }
    const rows = splitRows(region, [10, 10, 10])

    assert.equal(rows.length, 3)
    assert.equal(rows[0].height, 10)
    assert.equal(rows[1].y, 10)
    assert.equal(rows[2].y, 20)
  })

  it('handles flex heights (-1)', () => {
    const region = { x: 0, y: 0, width: 80, height: 30 }
    const rows = splitRows(region, [5, -1, 5])

    assert.equal(rows[0].height, 5)
    assert.equal(rows[1].height, 20) // 30 - 5 - 5
    assert.equal(rows[2].height, 5)
  })

  it('distributes flex heights evenly', () => {
    const region = { x: 0, y: 0, width: 80, height: 30 }
    const rows = splitRows(region, [-1, -1, -1])

    assert.equal(rows[0].height, 10)
    assert.equal(rows[1].height, 10)
    assert.equal(rows[2].height, 10)
  })
})

describe('subRegion', () => {
  it('creates sub-region within parent', () => {
    const parent = { x: 10, y: 10, width: 50, height: 30 }
    const sub = subRegion(parent, 5, 5, 20, 10)

    assert.equal(sub.x, 15)
    assert.equal(sub.y, 15)
    assert.equal(sub.width, 20)
    assert.equal(sub.height, 10)
  })

  it('handles -1 for remaining space', () => {
    const parent = { x: 0, y: 0, width: 50, height: 30 }
    const sub = subRegion(parent, 10, 5, -1, -1)

    assert.equal(sub.width, 40)
    assert.equal(sub.height, 25)
  })

  it('clamps to parent bounds', () => {
    const parent = { x: 0, y: 0, width: 50, height: 30 }
    const sub = subRegion(parent, 40, 25, 100, 100)

    assert.equal(sub.width, 10)
    assert.equal(sub.height, 5)
  })
})

describe('padRegion', () => {
  it('shrinks region by padding amount', () => {
    const region = { x: 10, y: 10, width: 50, height: 30 }
    const padded = padRegion(region, 5)

    assert.equal(padded.x, 15)
    assert.equal(padded.y, 15)
    assert.equal(padded.width, 40)
    assert.equal(padded.height, 20)
  })

  it('prevents negative dimensions', () => {
    const region = { x: 0, y: 0, width: 10, height: 10 }
    const padded = padRegion(region, 10)

    assert.equal(padded.width, 0)
    assert.equal(padded.height, 0)
  })
})
