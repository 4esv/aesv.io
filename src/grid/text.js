// src/grid/text.js
// Text utilities for grid-based rendering

/**
 * Wrap text to fit within a given width
 * @param {string} text - Text to wrap
 * @param {number} width - Maximum width in characters
 * @returns {string[]} Array of lines
 */
export function wrapText(text, width) {
  if (!text || width < 1) return ['']

  const lines = []
  const paragraphs = text.split('\n')

  for (const paragraph of paragraphs) {
    if (paragraph === '') {
      lines.push('')
      continue
    }

    const words = paragraph.split(/\s+/)
    let currentLine = ''

    for (const word of words) {
      // Handle words longer than width
      if (word.length > width) {
        if (currentLine) {
          lines.push(currentLine)
          currentLine = ''
        }
        // Break long word into chunks
        for (let i = 0; i < word.length; i += width) {
          lines.push(word.slice(i, i + width))
        }
        continue
      }

      const testLine = currentLine ? `${currentLine} ${word}` : word

      if (testLine.length <= width) {
        currentLine = testLine
      } else {
        lines.push(currentLine)
        currentLine = word
      }
    }

    if (currentLine) {
      lines.push(currentLine)
    }
  }

  return lines.length ? lines : ['']
}

/**
 * Truncate text to fit within a given width
 * @param {string} text - Text to truncate
 * @param {number} width - Maximum width in characters
 * @param {string} suffix - Suffix to append when truncated
 * @returns {string}
 */
export function truncate(text, width, suffix = '…') {
  if (!text) return ''
  if (text.length <= width) return text
  if (width <= suffix.length) return suffix.slice(0, width)
  return text.slice(0, width - suffix.length) + suffix
}

/**
 * Pad a line to a specific width
 * @param {string} line - Line to pad
 * @param {number} width - Target width
 * @param {'left'|'right'|'center'} align - Alignment
 * @param {string} char - Padding character
 * @returns {string}
 */
export function padLine(line, width, align = 'left', char = ' ') {
  if (!line) line = ''
  if (line.length >= width) return line.slice(0, width)

  const padding = width - line.length

  switch (align) {
    case 'right':
      return char.repeat(padding) + line
    case 'center': {
      const left = Math.floor(padding / 2)
      const right = padding - left
      return char.repeat(left) + line + char.repeat(right)
    }
    default: // left
      return line + char.repeat(padding)
  }
}

/**
 * Get the visual width of a string (accounting for wide characters)
 * @param {string} str - String to measure
 * @returns {number}
 */
export function visualWidth(str) {
  if (!str) return 0
  // NOTE: Simple implementation - assumes monospace ASCII
  // Could be extended for emoji/CJK support
  return str.length
}

/**
 * Create a horizontal rule
 * @param {number} width - Width in characters
 * @param {string} char - Character to use
 * @returns {string}
 */
export function hrule(width, char = '─') {
  return char.repeat(width)
}

/**
 * Center text within a width, truncating if necessary
 * @param {string} text - Text to center
 * @param {number} width - Target width
 * @returns {string}
 */
export function centerText(text, width) {
  const truncated = truncate(text, width, '…')
  return padLine(truncated, width, 'center')
}

/**
 * Right-align text within a width, truncating if necessary
 * @param {string} text - Text to align
 * @param {number} width - Target width
 * @returns {string}
 */
export function rightAlign(text, width) {
  const truncated = truncate(text, width, '…')
  return padLine(truncated, width, 'right')
}

/**
 * Left-align text within a width, truncating if necessary
 * @param {string} text - Text to align
 * @param {number} width - Target width
 * @returns {string}
 */
export function leftAlign(text, width) {
  const truncated = truncate(text, width, '…')
  return padLine(truncated, width, 'left')
}
