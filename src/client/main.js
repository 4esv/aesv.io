/**
 * aesv.io — pretext redesign client entry point
 *
 * Orchestrates three pretext-powered UI layers:
 *   1. AsciiMotif    — variable-weight canvas animation of ·>·
 *   2. initAccordions — pretext height pre-calculation for smooth expand/collapse
 *   3. initRichText  — inline chip + text layout without DOM measurements
 *   4. initDynamicLayout — text flowing around live widgets (chess, Spotify)
 */

import { AsciiMotif } from './ascii-motif.js'
import { initAccordions } from './accordion.js'
import { initRichText } from './rich-text.js'
import { initDynamicLayout } from './dynamic-layout.js'
import { initMinimap } from './mobile-scroll.js'

function init() {
  // 1. ASCII motif canvas
  const canvas = document.getElementById('motif-canvas')
  if (canvas) {
    const motif = new AsciiMotif(canvas)
    motif.start()

    // Pause when tab is hidden to save resources
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) motif.stop()
      else motif.start()
    })
  }

  // 2. Accordion sections
  initAccordions()

  // 3. Rich text with inline chips
  initRichText()

  // 4. Dynamic layout (text around widgets)
  initDynamicLayout()

  // 5. Mobile minimap scroll navigation
  initMinimap()

  // 6. GPG copy button
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.gpg-btn')
    if (!btn) return
    fetch('/api/gpg')
      .then((r) => r.text())
      .then((key) => navigator.clipboard.writeText(key))
      .then(() => {
        const orig = btn.textContent
        btn.textContent = '✓ copied'
        setTimeout(() => (btn.textContent = orig), 1500)
      })
  })
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
