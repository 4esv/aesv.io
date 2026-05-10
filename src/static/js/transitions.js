// Global outro interceptor for every base.njk subpage.
//
// On internal-nav click, add body.is-leaving so transitions.css runs
// the fall + fade outro, then navigate. The dashboard handles its own
// nav in dashboard.js and lives outside base.njk, so a `.dashboard`
// guard means this script never fires there.
;(function () {
  if (document.querySelector('.dashboard')) return

  // Outro is a single ~140ms fade. Cap a hair beyond so the user
  // never feels click→nav lag, even on a sluggish frame.
  var OUTRO_CAP_MS = 200
  var prefersReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // True when the previous page was on this same site, so history.back()
  // will land somewhere inside aesv.io rather than bouncing the user off.
  function hasInternalHistory() {
    if (!document.referrer) return false
    try {
      return new window.URL(document.referrer).origin === window.location.origin
    } catch {
      return false
    }
  }

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented) return
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    var a = e.target.closest && e.target.closest('a[href]')
    if (!a) return
    if (a.target && a.target !== '' && a.target !== '_self') return
    var href = a.getAttribute('href') || ''
    if (!href || href.charAt(0) === '#') return
    if (/^(mailto:|tel:|javascript:)/i.test(href)) return
    if (a.origin && a.origin !== window.location.origin) return
    if (a.pathname === window.location.pathname && a.search === window.location.search) {
      return
    }

    // The global "← back" link should mirror the browser back button when
    // there's a same-site page to return to (work → case → back lands on
    // work, not the dashboard). Falls back to its href on cold loads.
    var useHistoryBack = a.classList.contains('back-link') && hasInternalHistory()

    // Reduced-motion users skip the outro entirely. The back-link still
    // needs the history.back() override though, so handle it inline.
    if (prefersReducedMotion) {
      if (useHistoryBack) {
        e.preventDefault()
        window.history.back()
      }
      return
    }

    e.preventDefault()
    document.body.classList.add('is-leaving')

    var navigated = false
    function go() {
      if (navigated) return
      navigated = true
      if (useHistoryBack) {
        window.history.back()
      } else {
        window.location.href = a.href
      }
    }
    setTimeout(go, OUTRO_CAP_MS)
  })
})()

// Console easter egg. Prints once on load for the curious dev who pops
// devtools. ASCII + a hire-me line, styled with %c.
;(function () {
  var art =
    '\n' + '   ▄▀█ █▀▀ █▀ █░█\n' + '   █▀█ ██▄ ▄█ ▀▄▀  . i o\n' + '\n' + '   systems integrator\n'
  var msg = '\n' + '   hi. i make system A talk to system B.\n' + '   hire me  →  axel@aesv.io\n'
  console.log(
    '%c' + art + '%c' + msg,
    'color:#F4ECD8;background:#1a1a1a;font-family:monospace;font-weight:bold;font-size:12px;line-height:1.2;',
    'color:#888;background:#1a1a1a;font-family:monospace;font-size:11px;'
  )
})()
