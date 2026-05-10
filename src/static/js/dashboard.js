;(function () {
  // ---------- Weather widget: live time + date ----------
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
      weekday: 'long',
      timeZone: TIMEZONE,
    }).format(now)
    var day = new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      timeZone: TIMEZONE,
    }).format(now)
    var month = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      timeZone: TIMEZONE,
    }).format(now)
    return {
      hour: hour,
      minute: minute,
      second: second,
      weekday: weekday,
      day: day,
      month: month,
    }
  }

  function pad(n) {
    return n < 10 ? '0' + n : '' + n
  }

  // Cache last-rendered text per element so the per-second tick only
  // touches the DOM when the value actually changed.
  function setText(el, value) {
    if (!el) return
    if (el.__last === value) return
    el.textContent = value
    el.__last = value
  }

  function tickInfo() {
    var p = nyParts()
    var hour12 = p.hour % 12 || 12
    var ampm = p.hour < 12 ? 'am' : 'pm'
    setText(document.getElementById('info-clock-text'), hour12 + ':' + pad(p.minute) + ampm)
    setText(document.getElementById('info-month'), p.month)
    setText(document.getElementById('info-weekday'), p.weekday)
    setText(document.getElementById('info-day'), p.day)
  }
  tickInfo()
  setInterval(tickInfo, 1000)

  // ---------- Intro: single-source deal origins ----------
  // Compute per-cell --deal-x / --deal-y / --deal-rot so the intro
  // animation in dashboard.css launches every card from one spot
  // (above the middle-top of the grid) and lets each one travel to
  // its own resting position. Without this, every card would start at
  // the same fallback offset relative to its own grid cell, which
  // reads as six independent decks rather than one dealer.
  var dashboardGrid = document.querySelector('.dashboard-grid')
  if (dashboardGrid) {
    var setDealOrigins = function () {
      var rect = dashboardGrid.getBoundingClientRect()
      // Source point: horizontally centered on the grid, lifted ~80px
      // above its top edge so the dealer's hand is clearly off the
      // table. Cards always land downward + outward from this point.
      var sourceX = rect.left + rect.width / 2
      var sourceY = rect.top - 80
      Array.prototype.forEach.call(dashboardGrid.children, function (cell) {
        if (cell.classList.contains('widget-cell-bare')) return
        var c = cell.getBoundingClientRect()
        var dx = sourceX - (c.left + c.width / 2)
        var dy = sourceY - (c.top + c.height / 2)
        // Rotation tilts toward the direction of travel — cards flicked
        // left start tilted right (positive degrees) and unwind to 0,
        // and vice versa. Capped at ±14deg so far-edge cards don't
        // rotate to the point of looking out of control.
        var rot = Math.max(-14, Math.min(14, (dx / rect.width) * 28))
        cell.style.setProperty('--deal-x', dx + 'px')
        cell.style.setProperty('--deal-y', dy + 'px')
        cell.style.setProperty('--deal-rot', rot + 'deg')
      })
    }
    // Run once after the next paint so layout is settled (grid mode
    // resolution + aspect-ratio sizing). The first card's animation
    // delay is 480ms — JS runs synchronously at end of <main>, so the
    // RAF tick is well before any card begins animating.
    requestAnimationFrame(setDealOrigins)
  }

  // ---------- Outro: fall animation on internal nav ----------
  // Intercept clicks on same-origin links inside .dashboard, run the
  // fall animation (CSS in dashboard.css under .is-leaving), then
  // navigate. New-tab modifiers, external links, hash-only links, and
  // mailto/tel are skipped — they nav as usual.
  var dashboard = document.querySelector('.dashboard')
  var prefersReduced =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (dashboard && !prefersReduced) {
    var OUTRO_CAP_MS = 560 // last card finishes at 220 + 220 = 440ms; cap is the failsafe
    dashboard.addEventListener('click', function (e) {
      if (e.defaultPrevented) return
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      var a = e.target.closest && e.target.closest('a[href]')
      if (!a || !dashboard.contains(a)) return
      if (a.target && a.target !== '' && a.target !== '_self') return
      var href = a.getAttribute('href') || ''
      if (!href || href.charAt(0) === '#') return
      if (/^(mailto:|tel:|javascript:)/i.test(href)) return
      // External link → let it navigate normally.
      if (a.origin && a.origin !== window.location.origin) return
      // Same-page nav (e.g. brand → / from /) → skip outro, just reload.
      if (a.pathname === window.location.pathname && a.search === window.location.search) return

      e.preventDefault()
      dashboard.classList.add('is-leaving')

      var grid = dashboard.querySelector('.dashboard-grid')
      var lastCell = grid && grid.lastElementChild
      var navigated = false
      function go() {
        if (navigated) return
        navigated = true
        window.location.href = a.href
      }
      if (lastCell) {
        lastCell.addEventListener('animationend', go, { once: true })
      }
      // Failsafe in case animationend never fires (animation skipped,
      // tab backgrounded, etc).
      setTimeout(go, OUTRO_CAP_MS)
    })
  }

  // ---------- Hobbies tile: cycle between chess + strava panes ----------
  // Pauses on hover so a visitor can read whichever pane caught their eye.
  document.querySelectorAll('[data-cycle-interval]').forEach(function (el) {
    var panes = el.querySelectorAll('.hobby-pane')
    if (panes.length < 2) return
    var interval = parseInt(el.getAttribute('data-cycle-interval'), 10) || 6000
    var idx = 0
    var paused = false

    function advance() {
      if (paused) return
      panes[idx].classList.remove('is-active')
      idx = (idx + 1) % panes.length
      panes[idx].classList.add('is-active')
    }

    setInterval(advance, interval)

    var host = el.closest('.widget-cell-link') || el
    host.addEventListener('mouseenter', function () {
      paused = true
    })
    host.addEventListener('mouseleave', function () {
      paused = false
    })
    host.addEventListener('focusin', function () {
      paused = true
    })
    host.addEventListener('focusout', function () {
      paused = false
    })
  })
})()
