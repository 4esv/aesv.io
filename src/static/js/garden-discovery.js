;(function () {
  var search = document.getElementById('garden-search')
  var grid = document.querySelector('.garden-grid')
  var emptyEl = document.getElementById('garden-empty')
  if (!grid) return

  var cards = Array.prototype.slice.call(grid.querySelectorAll('.note-card'))
  var chips = Array.prototype.slice.call(document.querySelectorAll('.tag-chip'))

  var state = { query: '', tag: '' }

  function apply() {
    var q = state.query.trim().toLowerCase()
    var tag = state.tag.toLowerCase()
    var visible = 0
    cards.forEach(function (card) {
      var title = card.getAttribute('data-title') || ''
      var summary = card.getAttribute('data-summary') || ''
      var tags = (card.getAttribute('data-tags') || '').split(/\s+/).filter(Boolean)
      var matchQuery = !q || title.indexOf(q) >= 0 || summary.indexOf(q) >= 0 || tags.indexOf(q) >= 0
      var matchTag = !tag || tags.indexOf(tag) >= 0
      var show = matchQuery && matchTag
      card.hidden = !show
      if (show) visible++
    })
    if (emptyEl) emptyEl.hidden = visible !== 0
  }

  if (search) {
    search.addEventListener('input', function (e) {
      state.query = e.target.value
      apply()
    })
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) {
        c.classList.remove('is-active')
      })
      chip.classList.add('is-active')
      state.tag = chip.getAttribute('data-tag') || ''
      apply()
    })
  })
})()
