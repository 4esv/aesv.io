/**
 * Variable typographic ASCII motif for ·>·
 *
 * Inspired by pretext's variable-typographic-ascii demo:
 * uses prepareWithSegments to measure each glyph at current weight,
 * then builds a particle field that forms the ·>· shape.
 *
 * The key trick: Source Code Pro is a variable font. As font-weight
 * animates from 300→900, glyph widths change — pretext measures these
 * accurately without DOM reads, letting us place characters precisely.
 */

import { prepareWithSegments, walkLineRanges } from '@chenglou/pretext'

const CHARSET = ' .,:·-=*#·>·'
const WEIGHTS = [300, 400, 700, 900]
const FONT_SIZE = 13
const LINE_HEIGHT = 15
// NOTE: target shape rendered as ASCII — sampled to a particle field
const TARGET_TEXT = '·>·'
const PARTICLE_N = 80
const ATTRACTOR_FORCE = 0.18
const FIELD_DECAY = 0.84

/**
 * @param {string} weight
 * @returns {string}
 */
function makeFont(weight) {
  return `${weight} ${FONT_SIZE}px "Source Code Pro", monospace`
}

/**
 * Sample brightness from an offscreen canvas where TARGET_TEXT is drawn large.
 * Returns a Float32Array [cols*rows] of [0..1] brightness values.
 *
 * @param {number} cols
 * @param {number} rows
 * @param {string} font
 * @returns {Float32Array}
 */
function sampleTargetField(cols, rows, font) {
  const scale = 4
  const w = cols * scale
  const h = rows * scale
  const off = new OffscreenCanvas(w, h)
  const ctx = off.getContext('2d')

  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#fff'
  ctx.font = `900 ${h * 0.7}px "Source Code Pro", monospace`
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.fillText(TARGET_TEXT, w / 2, h / 2)

  const data = ctx.getImageData(0, 0, w, h).data
  const field = new Float32Array(cols * rows)
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // average brightness of the block this cell covers
      let sum = 0
      const x0 = Math.floor((col / cols) * w)
      const y0 = Math.floor((row / rows) * h)
      const x1 = Math.floor(((col + 1) / cols) * w)
      const y1 = Math.floor(((row + 1) / rows) * h)
      let count = 0
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const i = (y * w + x) * 4
          sum += data[i] / 255
          count++
        }
      }
      field[row * cols + col] = count > 0 ? sum / count : 0
    }
  }
  return field
}

/**
 * Build a brightness-sorted palette of characters at a given weight.
 * Uses pretext to measure glyph widths (main purpose: ensure accurate layout
 * when mixing proportional and monospace modes).
 *
 * @param {string} font
 * @returns {{ char: string; brightness: number; width: number }[]}
 */
function buildPalette(font) {
  const chars = CHARSET.split('')
  return chars
    .map((char) => {
      const prepared = prepareWithSegments(char, font)
      let width = 0
      walkLineRanges(prepared, Infinity, (lineWidth) => {
        width = lineWidth
      })
      // brightness proxy: measure the char on a tiny canvas
      const off = new OffscreenCanvas(20, 20)
      const ctx = off.getContext('2d')
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, 20, 20)
      ctx.fillStyle = '#fff'
      ctx.font = font
      ctx.textBaseline = 'top'
      ctx.fillText(char, 2, 2)
      const d = ctx.getImageData(0, 0, 20, 20).data
      let sum = 0
      for (let i = 0; i < d.length; i += 4) sum += d[i] / 255
      return { char, brightness: sum / (20 * 20), width }
    })
    .sort((a, b) => a.brightness - b.brightness)
}

/**
 * Map a field brightness value [0..1] to a character from the sorted palette.
 *
 * @param {number} brightness
 * @param {{ char: string }[]} palette
 * @returns {string}
 */
function brightnessToChar(brightness, palette) {
  const i = Math.round(brightness * (palette.length - 1))
  return palette[Math.max(0, Math.min(i, palette.length - 1))].char
}

export class AsciiMotif {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.cols = 0
    this.rows = 0
    this.field = null
    this.palette = null
    this.weight = 300
    this.targetWeight = 700
    this.raf = null
    this.frame = 0
    this.lastPalette = null
    this.lastFont = null
  }

  resize() {
    const dpr = window.devicePixelRatio || 1
    const w = this.canvas.clientWidth
    const h = this.canvas.clientHeight
    this.canvas.width = w * dpr
    this.canvas.height = h * dpr
    this.ctx.scale(dpr, dpr)

    this.cols = Math.floor(w / (FONT_SIZE * 0.6))
    this.rows = Math.floor(h / LINE_HEIGHT)
    this.field = sampleTargetField(this.cols, this.rows, makeFont(900))
  }

  start() {
    this.resize()
    window.addEventListener('resize', () => this.resize())
    this._animate()
  }

  stop() {
    if (this.raf) cancelAnimationFrame(this.raf)
  }

  _animate() {
    this.frame++

    // Oscillate font weight between 300 and 900
    this.weight = 300 + 300 * (1 + Math.sin(this.frame * 0.012))

    const font = makeFont(Math.round(this.weight))
    if (font !== this.lastFont) {
      this.lastFont = font
      this.palette = buildPalette(font)
    }

    this._draw()
    this.raf = requestAnimationFrame(() => this._animate())
  }

  _draw() {
    const { ctx, cols, rows, field, palette } = this
    if (!field || !palette || cols === 0) return

    const cellW = this.canvas.clientWidth / cols
    const cellH = this.canvas.clientHeight / rows

    ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight)
    ctx.font = makeFont(Math.round(this.weight))
    ctx.textBaseline = 'top'

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const brightness = field[row * cols + col]
        if (brightness < 0.04) continue
        const char = brightnessToChar(brightness, palette)
        if (char === ' ') continue

        // alpha driven by brightness
        const alpha = 0.15 + brightness * 0.85
        ctx.fillStyle = `rgba(149, 95, 59, ${alpha})`
        ctx.fillText(char, col * cellW, row * cellH)
      }
    }
  }
}
