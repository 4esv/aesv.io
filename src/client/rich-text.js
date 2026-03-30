/**
 * Rich text layout with inline chips.
 *
 * Inspired by pretext's rich-note demo: lays out mixed content (text + chips)
 * using pretext's layoutNextLine so chips never split across lines and text
 * wraps naturally around them.
 *
 * Used for work case studies tech stack tags and section labels.
 */

import { prepareWithSegments, layoutNextLine } from '@chenglou/pretext'

const BODY_FONT = '400 13px "Source Code Pro", monospace'
const CHIP_FONT = '700 11px "Source Code Pro", monospace'
const LINE_HEIGHT = 18.2

/**
 * Chip tone → CSS class mapping.
 * Matches .pt-chip--{tone} in pretext.css
 *
 * @type {Record<string, string>}
 */
const CHIP_TONES = {
  lang: 'lang',
  tool: 'tool',
  role: 'role',
  tag: 'tag',
}

const CHIP_PADDING = 16 // px horizontal chrome (8px each side)
const CHIP_GAP = 6 // px between chips

/**
 * Parse a rich text string into segments.
 * Syntax: plain text with `[label](tone)` for chips.
 *
 * @param {string} source
 * @returns {{ kind: 'text' | 'chip'; content: string; tone?: string }[]}
 */
function parseRichText(source) {
  const segments = []
  const RE = /\[([^\]]+)\]\(([^)]+)\)/g
  let last = 0
  let match

  while ((match = RE.exec(source)) !== null) {
    if (match.index > last) {
      segments.push({ kind: 'text', content: source.slice(last, match.index) })
    }
    segments.push({ kind: 'chip', content: match[1], tone: match[2] })
    last = match.index + match[0].length
  }
  if (last < source.length) {
    segments.push({ kind: 'text', content: source.slice(last) })
  }
  return segments
}

/**
 * Measure the pixel width of a chip label.
 *
 * @param {string} label
 * @returns {number}
 */
function measureChip(label) {
  const prepared = prepareWithSegments(label, CHIP_FONT)
  let w = 0
  // NOTE: layoutNextLine at large width gives us the natural width
  const result = layoutNextLine(prepared, { segmentIndex: 0, graphemeIndex: 0 }, Infinity)
  w = result.lineWidth
  return w + CHIP_PADDING
}

/**
 * Render rich text segments into a container element.
 * Each line is a <div class="pt-line">, chips and text fragments inside.
 *
 * @param {HTMLElement} container
 * @param {string} source - rich text source with [label](tone) chip syntax
 */
export function renderRichText(container, source) {
  const segments = parseRichText(source)
  const availWidth = container.clientWidth || 600

  // Build inline items with widths
  const items = segments.map((seg) => {
    if (seg.kind === 'chip') {
      return { ...seg, width: measureChip(seg.content) }
    }
    const prepared = prepareWithSegments(seg.content, BODY_FONT)
    return { ...seg, prepared, width: null }
  })

  // Simple line-breaking: flow items left-to-right, break on text wraps
  const lines = []
  let currentLine = []
  let lineUsed = 0

  for (const item of items) {
    if (item.kind === 'chip') {
      if (lineUsed + item.width + CHIP_GAP > availWidth && currentLine.length > 0) {
        lines.push(currentLine)
        currentLine = []
        lineUsed = 0
      }
      currentLine.push(item)
      lineUsed += item.width + CHIP_GAP
    } else {
      // Text: use pretext to break it across remaining width
      let cursor = { segmentIndex: 0, graphemeIndex: 0 }
      let firstInText = true

      while (true) {
        const remaining = firstInText ? availWidth - lineUsed : availWidth
        const result = layoutNextLine(item.prepared, cursor, remaining)
        const fragment = { kind: 'text', content: result.text, width: result.lineWidth }
        currentLine.push(fragment)
        lineUsed += result.lineWidth
        firstInText = false

        if (!result.nextCursor) break
        // Hard line break — flush current line
        lines.push(currentLine)
        currentLine = []
        lineUsed = 0
        cursor = result.nextCursor
      }
    }
  }

  if (currentLine.length > 0) lines.push(currentLine)

  // Render to DOM
  container.innerHTML = ''
  for (const line of lines) {
    const lineEl = document.createElement('div')
    lineEl.className = 'pt-line'

    for (const item of line) {
      if (item.kind === 'chip') {
        const chipEl = document.createElement('span')
        const toneClass = CHIP_TONES[item.tone] || 'tag'
        chipEl.className = `pt-chip pt-chip--${toneClass}`
        chipEl.textContent = item.content
        lineEl.appendChild(chipEl)
      } else {
        const span = document.createElement('span')
        span.textContent = item.content
        lineEl.appendChild(span)
      }
    }

    container.appendChild(lineEl)
  }
}

/**
 * Initialize all rich text containers in the document.
 * Looks for elements with [data-rich-text] attribute.
 */
export function initRichText() {
  const containers = document.querySelectorAll('[data-rich-text]')
  containers.forEach((el) => {
    const source = el.dataset.richText || el.textContent || ''
    renderRichText(el, source)
  })

  // Re-render on resize (debounced)
  let resizeTimer
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      containers.forEach((el) => {
        const source = el.dataset.richText || ''
        renderRichText(el, source)
      })
    }, 120)
  })
}
