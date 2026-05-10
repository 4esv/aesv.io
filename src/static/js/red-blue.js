// Article-specific scripts for /feed/red-button-blue-button.
// Two jobs: render the 100-circle button pictograms from data-blue
// counts, and run KaTeX over inline \(…\) and \[…\] expressions.

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.btn-grid[data-blue]').forEach((el) => {
    const blue = parseInt(el.dataset.blue, 10)
    const result = el.dataset.result || 'lost'
    const blueClass = result === 'won' ? 'btn-pict blue' : 'btn-pict blue dead'
    const frag = document.createDocumentFragment()
    for (let i = 0; i < blue; i++) {
      const b = document.createElement('span')
      b.className = blueClass
      frag.appendChild(b)
    }
    for (let i = blue; i < 100; i++) {
      const b = document.createElement('span')
      b.className = 'btn-pict red'
      frag.appendChild(b)
    }
    el.appendChild(frag)
  })

  if (typeof window.renderMathInElement === 'function') {
    window.renderMathInElement(document.body, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '\\(', right: '\\)', display: false },
        { left: '\\[', right: '\\]', display: true },
      ],
      throwOnError: false,
    })
  }
})
