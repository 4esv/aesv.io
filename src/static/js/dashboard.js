;(function () {
  // ---------- info block: live time + date ----------
  var TIMEZONE = 'America/New_York'

  function nyParts() {
    var now = new Date()
    var hour = parseInt(
      new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        hour12: false,
        timeZone: TIMEZONE,
      }).format(now),
      10
    )
    var minute = parseInt(
      new Intl.DateTimeFormat('en-US', {
        minute: 'numeric',
        timeZone: TIMEZONE,
      }).format(now),
      10
    )
    var second = parseInt(
      new Intl.DateTimeFormat('en-US', {
        second: 'numeric',
        timeZone: TIMEZONE,
      }).format(now),
      10
    )
    var weekday = new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      timeZone: TIMEZONE,
    })
      .format(now)
      .toLowerCase()
    var day = new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      timeZone: TIMEZONE,
    }).format(now)
    var month = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      timeZone: TIMEZONE,
    })
      .format(now)
      .toLowerCase()
    return {
      hour: hour,
      minute: minute,
      second: second,
      weekday: weekday,
      day: day,
      month: month,
    }
  }

  function tickInfo() {
    var p = nyParts()
    var hourDeg = ((p.hour % 12) + p.minute / 60) * 30
    var minDeg = (p.minute + p.second / 60) * 6
    var hourEl = document.getElementById('info-clock-hour')
    var minEl = document.getElementById('info-clock-min')
    if (hourEl) hourEl.setAttribute('transform', 'rotate(' + hourDeg + ' 30 30)')
    if (minEl) minEl.setAttribute('transform', 'rotate(' + minDeg + ' 30 30)')
    var mEl = document.getElementById('info-month')
    var wEl = document.getElementById('info-weekday')
    var dEl = document.getElementById('info-day')
    if (mEl) mEl.textContent = p.month
    if (wEl) wEl.textContent = p.weekday
    if (dEl) dEl.textContent = p.day
  }
  tickInfo()
  setInterval(tickInfo, 1000)

  // ---------- interactive 3D cube (CSS transforms + drag) ----------
  var stage = document.getElementById('cube-stage')
  var cube = document.getElementById('cube')
  if (!stage || !cube) return

  // Initial pose: a corner-isometric view that shows 3 faces clearly.
  // Auto-rotates gently; drag spins it faster; release lets damping
  // carry the momentum back toward the gentle baseline.
  var rotX = -22
  var rotY = -34
  var velX = 0.04
  var velY = 0.08
  var dragging = false
  var lastPx = 0
  var lastPy = 0
  var damping = 0.985

  function syncCubeSize() {
    var rect = cube.getBoundingClientRect()
    var half = Math.max(8, Math.round(rect.width / 2))
    cube.style.setProperty('--cube-half', half + 'px')
  }
  syncCubeSize()
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(syncCubeSize).observe(cube)
  } else {
    window.addEventListener('resize', syncCubeSize)
  }

  function apply() {
    cube.style.transform = 'rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg)'
  }

  function frame() {
    if (!dragging) {
      rotX += velX
      rotY += velY
      velX *= damping
      velY *= damping
    }
    apply()
    requestAnimationFrame(frame)
  }

  function pointerXY(e) {
    if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY }
    return { x: e.clientX, y: e.clientY }
  }

  function onDown(e) {
    dragging = true
    var p = pointerXY(e)
    lastPx = p.x
    lastPy = p.y
    velX = 0
    velY = 0
    stage.classList.add('is-dragging')
    e.preventDefault()
  }

  function onMove(e) {
    if (!dragging) return
    var p = pointerXY(e)
    var dx = p.x - lastPx
    var dy = p.y - lastPy
    lastPx = p.x
    lastPy = p.y
    rotY += dx * 0.5
    rotX -= dy * 0.5
    velX = -dy * 0.4
    velY = dx * 0.4
    apply()
  }

  function onUp() {
    dragging = false
    stage.classList.remove('is-dragging')
  }

  stage.addEventListener('mousedown', onDown)
  stage.addEventListener('touchstart', onDown, { passive: false })
  window.addEventListener('mousemove', onMove)
  window.addEventListener('touchmove', onMove, { passive: false })
  window.addEventListener('mouseup', onUp)
  window.addEventListener('touchend', onUp)

  apply()
  requestAnimationFrame(frame)
})()
