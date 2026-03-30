/**
 * Accordion sections with pretext height pre-calculation.
 *
 * The critical insight from pretext's accordion demo:
 * Instead of measuring DOM height in the animation hot path (which forces
 * layout reflow), we use pretext to predict the expanded height before the
 * CSS transition starts. This means the transition can use a concrete
 * `max-height` value rather than the `max-height: 9999px` hack.
 */

import { prepare, layout } from '@chenglou/pretext'

const BODY_FONT = '400 13px "Source Code Pro", monospace'
const LINE_HEIGHT_PX = 18.2 // 13px * 1.4

/**
 * Pre-calculate the expanded height of an accordion body using pretext.
 * Avoids DOM measurement in the hot path.
 *
 * @param {HTMLElement} bodyEl
 * @param {number} availWidth
 * @returns {number} height in px
 */
function predictHeight(bodyEl, availWidth) {
  // Collect all text nodes + chip elements
  let totalHeight = 0

  // Walk children — text paragraphs, chip rows, sub-sections
  for (const child of bodyEl.children) {
    const computed = getComputedStyle(child)
    const mT = parseFloat(computed.marginTop) || 0
    const mB = parseFloat(computed.marginBottom) || 0

    if (child.classList.contains('pt-chips')) {
      // Chip rows have fixed height
      totalHeight += 28 + mT + mB
    } else if (child.tagName === 'P' || child.classList.contains('pt-text')) {
      const text = child.textContent || ''
      if (text.trim()) {
        const prepared = prepare(text, BODY_FONT)
        const { height } = layout(prepared, availWidth, LINE_HEIGHT_PX)
        totalHeight += height + mT + mB
      }
    } else {
      // Fallback: use a line estimate for complex children
      const lines = Math.max(1, Math.round(child.textContent.length / (availWidth / (FONT_SIZE * 0.6))))
      totalHeight += lines * LINE_HEIGHT_PX + mT + mB
    }
  }

  return totalHeight
}

/**
 * Initialize all accordion elements in the document.
 * Wires up click handlers and pretext-driven height transitions.
 */
export function initAccordions() {
  const accordions = document.querySelectorAll('.pt-accordion')

  accordions.forEach((accordion) => {
    const header = accordion.querySelector('.pt-accordion-header')
    const body = accordion.querySelector('.pt-accordion-body')
    if (!header || !body) return

    // Initial state
    let isOpen = accordion.dataset.open === 'true'
    body.style.overflow = 'hidden'
    body.style.transition = 'max-height 280ms cubic-bezier(0.4, 0, 0.2, 1), opacity 240ms ease'

    const update = (animate) => {
      if (isOpen) {
        const w = body.clientWidth || accordion.clientWidth
        const h = predictHeight(body, w)
        body.style.maxHeight = `${h + 40}px`
        body.style.opacity = '1'
        accordion.dataset.open = 'true'
        header.setAttribute('aria-expanded', 'true')
      } else {
        body.style.maxHeight = '0'
        body.style.opacity = '0'
        accordion.dataset.open = 'false'
        header.setAttribute('aria-expanded', 'false')
      }
    }

    // Initial render without transition
    body.style.transition = 'none'
    update(false)
    requestAnimationFrame(() => {
      body.style.transition = 'max-height 280ms cubic-bezier(0.4, 0, 0.2, 1), opacity 240ms ease'
    })

    header.addEventListener('click', () => {
      isOpen = !isOpen
      update(true)
    })

    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        isOpen = !isOpen
        update(true)
      }
    })

    header.setAttribute('role', 'button')
    header.setAttribute('tabindex', '0')
    header.setAttribute('aria-expanded', isOpen ? 'true' : 'false')
  })
}
