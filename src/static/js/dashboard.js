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
