document.querySelectorAll('.countdown-btn[data-seconds]').forEach(function (el) {
  const total = parseInt(el.dataset.seconds, 10)

  function fmt(s) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    const blocks = Math.ceil(s / 6)
    return (
      String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0') + ' ' + '█'.repeat(blocks)
    )
  }

  el.textContent = fmt(total)

  el.addEventListener('click', function () {
    if (el.disabled) return
    el.disabled = true
    el.classList.add('is-running')

    let remaining = total - 1
    el.textContent = fmt(remaining)

    const timer = setInterval(function () {
      remaining -= 1
      el.textContent = fmt(remaining)
      if (remaining <= 0) {
        clearInterval(timer)
        el.classList.remove('is-running')
      }
    }, 1000)
  })
})
