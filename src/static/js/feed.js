;(function () {
  var search = document.getElementById('feed-search')
  var grid = document.querySelector('.feed-grid')
  var emptyEl = document.getElementById('feed-empty')
  if (!grid) return

  var cards = Array.prototype.slice.call(grid.querySelectorAll('.note-card'))
  var viewChips = Array.prototype.slice.call(document.querySelectorAll('.view-chip'))

  // Precompute one lowercase haystack per card — title + tags joined.
  // Cheap to build once, cheaper to .includes() on every keystroke.
  var haystacks = cards.map(function (card) {
    var title = (card.getAttribute('data-title') || '').toLowerCase()
    var tags = (card.getAttribute('data-tags') || '').toLowerCase()
    return title + ' ' + tags
  })

  function apply(q) {
    q = (q || '').trim().toLowerCase()
    var tokens = q ? q.split(/\s+/) : []
    var visible = 0
    cards.forEach(function (card, i) {
      var hay = haystacks[i]
      var show =
        !tokens.length ||
        tokens.every(function (tok) {
          return hay.indexOf(tok) >= 0
        })
      // .note-card sets `display: flex`, which beats the [hidden]
      // user-agent rule — use the inline style so filtering sticks.
      card.style.display = show ? '' : 'none'
      if (show) visible++
    })
    if (emptyEl) emptyEl.style.display = visible === 0 ? '' : 'none'
  }

  if (search) {
    search.addEventListener('input', function (e) {
      apply(e.target.value)
    })
  }

  viewChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      viewChips.forEach(function (c) {
        c.classList.remove('is-active')
        c.setAttribute('aria-pressed', 'false')
      })
      chip.classList.add('is-active')
      chip.setAttribute('aria-pressed', 'true')
      grid.setAttribute('data-view', chip.getAttribute('data-view') || 'grid')
    })
  })
})()
