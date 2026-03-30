/**
 * Dynamic layout — text flowing around dynamic elements.
 *
 * Inspired by pretext's dynamic-layout demo: obstacle-aware text routing.
 * Used for sections where a live widget (chess board, Spotify card) sits
 * beside flowing text. Pretext calculates line widths that skip the widget's
 * bounding box so text wraps tightly rather than in a full-width column.
 *
 * Usage:
 *   <div class="pt-dynamic-section">
 *     <div class="pt-dynamic-widget" data-rows="8">...widget...</div>
 *     <div class="pt-dynamic-text">...text content...</div>
 *   </div>
 */

import { prepare, layoutWithLines } from '@chenglou/pretext'

const BODY_FONT = '400 13px "Source Code Pro", monospace'
const LINE_HEIGHT = 18.2

/**
 * @param {HTMLElement} section
 */
function layoutSection(section) {
  const widget = section.querySelector('.pt-dynamic-widget')
  const textEl = section.querySelector('.pt-dynamic-text')
  if (!widget || !textEl) return

  const sectionW = section.clientWidth
  const widgetW = widget.clientWidth + 24 // 24px gap
  const widgetH = widget.clientHeight

  // Number of lines the widget is tall
  const widgetLines = Math.ceil(widgetH / LINE_HEIGHT)

  const text = textEl.dataset.content || textEl.textContent || ''
  const prepared = prepare(text, BODY_FONT)

  // Line widths: narrow beside widget, full after
  const lineWidths = []
  for (let i = 0; i < widgetLines + 2; i++) {
    lineWidths.push(sectionW - widgetW)
  }
  // After widget, full width
  const fullWidthLine = sectionW

  // layoutWithLines with variable line widths
  // NOTE: pretext's layoutWithLines accepts a single width, not per-line widths yet.
  // For now we lay out at narrow width for widget-adjacent lines, then full width after.
  const narrowResult = layoutWithLines(prepared, sectionW - widgetW, LINE_HEIGHT)
  const narrowLineCount = Math.min(widgetLines, narrowResult.lines.length)

  const narrowText = narrowResult.lines.slice(0, narrowLineCount).join('\n')
  const remainingText = narrowResult.lines.slice(narrowLineCount).join('\n')

  // Render narrow block
  const narrowEl = document.createElement('div')
  narrowEl.className = 'pt-text-narrow'
  narrowEl.style.width = `${sectionW - widgetW}px`
  narrowEl.textContent = narrowText

  // Render full-width remainder
  const wideEl = document.createElement('div')
  wideEl.className = 'pt-text-wide'
  wideEl.textContent = remainingText

  textEl.innerHTML = ''
  textEl.appendChild(narrowEl)
  textEl.appendChild(wideEl)
}

/**
 * Initialize all dynamic layout sections.
 */
export function initDynamicLayout() {
  const sections = document.querySelectorAll('.pt-dynamic-section')
  sections.forEach(layoutSection)

  let resizeTimer
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => sections.forEach(layoutSection), 120)
  })
}
