// src/grid/borders.js
// Box-drawing character utilities

// Box drawing character sets
export const BOX = {
  // Light box drawing
  light: {
    h: '─', // horizontal
    v: '│', // vertical
    tl: '┌', // top-left
    tr: '┐', // top-right
    bl: '└', // bottom-left
    br: '┘', // bottom-right
    lt: '├', // left-tee
    rt: '┤', // right-tee
    tt: '┬', // top-tee
    bt: '┴', // bottom-tee
    cross: '┼', // cross
  },
  // Heavy box drawing
  heavy: {
    h: '━',
    v: '┃',
    tl: '┏',
    tr: '┓',
    bl: '┗',
    br: '┛',
    lt: '┣',
    rt: '┫',
    tt: '┳',
    bt: '┻',
    cross: '╋',
  },
  // Double line box drawing
  double: {
    h: '═',
    v: '║',
    tl: '╔',
    tr: '╗',
    bl: '╚',
    br: '╝',
    lt: '╠',
    rt: '╣',
    tt: '╦',
    bt: '╩',
    cross: '╬',
  },
  // Rounded corners (light)
  rounded: {
    h: '─',
    v: '│',
    tl: '╭',
    tr: '╮',
    bl: '╰',
    br: '╯',
    lt: '├',
    rt: '┤',
    tt: '┬',
    bt: '┴',
    cross: '┼',
  },
  // ASCII fallback
  ascii: {
    h: '-',
    v: '|',
    tl: '+',
    tr: '+',
    bl: '+',
    br: '+',
    lt: '+',
    rt: '+',
    tt: '+',
    bt: '+',
    cross: '+',
  },
}

/**
 * Create a horizontal border line
 * @param {number} width - Inner width (excluding corners)
 * @param {'top'|'bottom'|'middle'} position - Position in box
 * @param {object} chars - Box character set
 * @returns {string}
 */
export function hborder(width, position = 'top', chars = BOX.light) {
  const left = position === 'top' ? chars.tl : position === 'bottom' ? chars.bl : chars.lt
  const right = position === 'top' ? chars.tr : position === 'bottom' ? chars.br : chars.rt
  return left + chars.h.repeat(width) + right
}

/**
 * Create a content line with vertical borders
 * @param {string} content - Content to wrap
 * @param {number} width - Inner width
 * @param {object} chars - Box character set
 * @returns {string}
 */
export function vborder(content, width, chars = BOX.light) {
  const padded = (content || '').padEnd(width).slice(0, width)
  return chars.v + padded + chars.v
}

/**
 * Create a complete box around content
 * @param {string[]} lines - Content lines
 * @param {number} width - Inner width
 * @param {object} chars - Box character set
 * @returns {string[]}
 */
export function box(lines, width, chars = BOX.light) {
  const result = [hborder(width, 'top', chars)]

  for (const line of lines) {
    result.push(vborder(line, width, chars))
  }

  result.push(hborder(width, 'bottom', chars))
  return result
}

/**
 * Create a titled box
 * @param {string} title - Box title
 * @param {string[]} lines - Content lines
 * @param {number} width - Inner width
 * @param {object} chars - Box character set
 * @returns {string[]}
 */
export function titledBox(title, lines, width, chars = BOX.light) {
  // Title in top border: ┌─ Title ─┐
  const titleText = ` ${title} `
  const availableWidth = width - titleText.length
  const leftPad = Math.floor(availableWidth / 2)
  const rightPad = availableWidth - leftPad

  const topBorder =
    chars.tl + chars.h.repeat(leftPad) + titleText + chars.h.repeat(rightPad) + chars.tr

  const result = [topBorder]

  for (const line of lines) {
    result.push(vborder(line, width, chars))
  }

  result.push(hborder(width, 'bottom', chars))
  return result
}

/**
 * Create a divider line for inside a box
 * @param {number} width - Inner width
 * @param {object} chars - Box character set
 * @returns {string}
 */
export function divider(width, chars = BOX.light) {
  return hborder(width, 'middle', chars)
}

/**
 * Join two boxes horizontally
 * @param {string[]} leftBox - Left box lines
 * @param {string[]} rightBox - Right box lines
 * @param {number} gap - Gap between boxes
 * @returns {string[]}
 */
export function joinHorizontal(leftBox, rightBox, gap = 0) {
  const maxHeight = Math.max(leftBox.length, rightBox.length)
  const leftWidth = leftBox[0]?.length || 0
  const gapStr = ' '.repeat(gap)

  const result = []
  for (let i = 0; i < maxHeight; i++) {
    const left = leftBox[i] || ' '.repeat(leftWidth)
    const right = rightBox[i] || ''
    result.push(left + gapStr + right)
  }

  return result
}

/**
 * Join multiple boxes vertically
 * @param {...string[]} boxes - Box line arrays
 * @returns {string[]}
 */
export function joinVertical(...boxes) {
  return boxes.flat()
}
