// src/grid/art.js
// ASCII/block art utilities

// Block characters for pixel art (in order of density)
export const BLOCKS = {
  empty: ' ',
  light: '░',
  medium: '▒',
  dark: '▓',
  full: '█',
  halfTop: '▀',
  halfBottom: '▄',
  halfLeft: '▌',
  halfRight: '▐',
}

// Shade characters mapped to brightness levels (0-4)
const SHADE_CHARS = [BLOCKS.full, BLOCKS.dark, BLOCKS.medium, BLOCKS.light, BLOCKS.empty]

/**
 * Convert a brightness value (0-255) to a shade character
 * @param {number} brightness - Brightness value 0-255
 * @returns {string}
 */
export function brightnessToChar(brightness) {
  const index = Math.floor((brightness / 255) * (SHADE_CHARS.length - 1))
  return SHADE_CHARS[Math.min(index, SHADE_CHARS.length - 1)]
}

/**
 * Create a progress bar using block characters
 * @param {number} progress - Progress value 0-100
 * @param {number} width - Width in characters
 * @param {object} options - Options
 * @param {string} options.filled - Filled character
 * @param {string} options.empty - Empty character
 * @param {boolean} options.showPercent - Show percentage at end
 * @returns {string}
 */
export function progressBar(progress, width, options = {}) {
  const { filled = BLOCKS.full, empty = BLOCKS.light, showPercent = false } = options

  const percent = Math.max(0, Math.min(100, progress))
  let barWidth = width

  // Reserve space for percentage display
  if (showPercent) {
    barWidth -= 5 // " 100%"
  }

  const filledCount = Math.round((percent / 100) * barWidth)
  const emptyCount = barWidth - filledCount

  let bar = filled.repeat(filledCount) + empty.repeat(emptyCount)

  if (showPercent) {
    bar += ` ${Math.round(percent).toString().padStart(3)}%`
  }

  return bar
}

/**
 * Create a simple ASCII spinner frame
 * @param {number} frame - Frame number
 * @returns {string}
 */
export function spinner(frame) {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
  return frames[frame % frames.length]
}

/**
 * Create a horizontal bar chart line
 * @param {string} label - Label for the bar
 * @param {number} value - Value (0-100)
 * @param {number} labelWidth - Width for label column
 * @param {number} barWidth - Width for bar
 * @returns {string}
 */
export function barChartLine(label, value, labelWidth, barWidth) {
  const paddedLabel = label.slice(0, labelWidth).padEnd(labelWidth)
  const bar = progressBar(value, barWidth)
  return `${paddedLabel} ${bar}`
}

/**
 * Create a simple spark line from values
 * @param {number[]} values - Array of values
 * @param {number} width - Maximum width
 * @returns {string}
 */
export function sparkLine(values, width) {
  if (!values || values.length === 0) return ''

  const chars = '▁▂▃▄▅▆▇█'
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  // Sample values to fit width
  const step = Math.max(1, Math.floor(values.length / width))
  const sampled = []

  for (let i = 0; i < values.length && sampled.length < width; i += step) {
    sampled.push(values[i])
  }

  return sampled
    .map((v) => {
      const normalized = (v - min) / range
      const index = Math.floor(normalized * (chars.length - 1))
      return chars[index]
    })
    .join('')
}

/**
 * Create ASCII art placeholder for album/image
 * @param {number} width - Width in characters
 * @param {number} height - Height in rows
 * @returns {string[]}
 */
export function artPlaceholder(width, height) {
  const lines = []
  const topBottom = '─'.repeat(width)

  lines.push('┌' + topBottom.slice(0, -2) + '┐')

  for (let y = 1; y < height - 1; y++) {
    if (y === Math.floor(height / 2)) {
      const text = '♪ ♫'
      const padding = Math.floor((width - 2 - text.length) / 2)
      const line = ' '.repeat(padding) + text + ' '.repeat(width - 2 - padding - text.length)
      lines.push('│' + line + '│')
    } else {
      lines.push('│' + ' '.repeat(width - 2) + '│')
    }
  }

  lines.push('└' + topBottom.slice(0, -2) + '┘')

  return lines
}

/**
 * Simple ASCII bee art (mascot)
 * @param {'small'|'medium'|'large'} size - Art size
 * @returns {string[]}
 */
export function bee(size = 'small') {
  if (size === 'small') {
    return ['  \\_/  ', ' (o.o) ', '  > <  ']
  }

  if (size === 'medium') {
    return ['    \\   /    ', '     \\_/     ', '    (o.o)    ', '   /|===|\\   ', '    \\   /    ']
  }

  // large
  return [
    '      \\     /      ',
    '       \\   /       ',
    '        \\_/        ',
    '       (o.o)       ',
    '      /|===|\\      ',
    '     / |===| \\     ',
    '        \\ /        ',
    '        / \\        ',
  ]
}

/**
 * Create a simple status indicator
 * @param {'ok'|'error'|'warning'|'info'} status - Status type
 * @returns {string}
 */
export function statusIndicator(status) {
  switch (status) {
    case 'ok':
      return '●'
    case 'error':
      return '✗'
    case 'warning':
      return '⚠'
    case 'info':
      return '○'
    default:
      return '?'
  }
}
