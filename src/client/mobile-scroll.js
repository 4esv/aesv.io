/**
 * Mobile minimap scroll navigation.
 *
 * Builds a proportional tile map in the #minimap element.
 * Active tile (most visible in viewport) gets magnify treatment.
 * Drag on the minimap scrolls the page.
 * Handedness toggle switches the sidebar side.
 */

// NOTE: localStorage key for persisting the user's preferred minimap side
const STORAGE_KEY = 'minimap-side'

export function initMinimap() {
  const minimap = document.getElementById('minimap')
  if (!minimap) return

  // Only activate on mobile
  if (window.innerWidth > 767) return

  const track = document.getElementById('minimap-track')
  const handBtn = document.getElementById('minimap-hand-toggle')

  // Restore handedness preference
  const savedSide = localStorage.getItem(STORAGE_KEY) || 'right'
  minimap.dataset.side = savedSide

  // Find all tiles (sections with data-tile-label or .tile class)
  const tiles = Array.from(document.querySelectorAll('[data-tile-label]'))
  if (tiles.length === 0) return

  // Build minimap markers
  const markers = tiles.map((tile, i) => {
    const el = document.createElement('div')
    el.className = 'minimap-tile'
    el.dataset.index = i
    // Height proportional to tile height relative to document
    const h = Math.max(4, Math.round((tile.offsetHeight / document.body.scrollHeight) * 200))
    el.style.height = h + 'px'
    track.appendChild(el)
    return el
  })

  // Update active tile on scroll
  function updateActive() {
    const viewMid = window.scrollY + window.innerHeight * 0.4
    let activeIdx = 0
    tiles.forEach((tile, i) => {
      const top = tile.offsetTop
      const bottom = top + tile.offsetHeight
      if (viewMid >= top && viewMid < bottom) activeIdx = i
    })
    markers.forEach((m, i) => {
      m.classList.toggle('active', i === activeIdx)
    })
  }

  window.addEventListener('scroll', updateActive, { passive: true })
  updateActive()

  // Drag to scroll
  let dragging = false
  let startY = 0
  let startScroll = 0

  minimap.addEventListener('pointerdown', (e) => {
    dragging = true
    startY = e.clientY
    startScroll = window.scrollY
    minimap.style.cursor = 'grabbing'
    e.preventDefault()
  })

  window.addEventListener('pointermove', (e) => {
    if (!dragging) return
    const dy = e.clientY - startY
    const maxScroll = document.body.scrollHeight - window.innerHeight
    const ratio = maxScroll / (minimap.offsetHeight || 1)
    window.scrollTo(0, Math.max(0, Math.min(maxScroll, startScroll + dy * ratio * 3)))
  })

  window.addEventListener('pointerup', () => {
    dragging = false
    minimap.style.cursor = 'grab'
  })

  // Handedness toggle
  handBtn.addEventListener('click', () => {
    const newSide = minimap.dataset.side === 'right' ? 'left' : 'right'
    minimap.dataset.side = newSide
    localStorage.setItem(STORAGE_KEY, newSide)
  })
}
