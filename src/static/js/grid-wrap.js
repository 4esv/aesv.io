;(function () {
  const saved = {}
  let timer = null

  const RE_PREFIX = /^([\s│┃║┌└├┬┴┼─┏┗┣┳┻╋━╔╚╠╦╩╬═]*)/
  const RE_CORNERS = /[┌└─┏┗━╔╚═]/g

  function charWidth(container) {
    const span = document.createElement('span')
    span.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;font:inherit'
    span.textContent = 'MMMMMMMMMM'
    container.appendChild(span)
    const w = span.offsetWidth / 10
    container.removeChild(span)
    return w
  }

  function wrapLine(line, max) {
    if (line.length <= max) return line

    const match = line.match(RE_PREFIX)
    const prefix = match ? match[1] : ''
    const text = line.slice(prefix.length)
    const avail = max - prefix.length - 1

    if (avail < 5 || text.length <= avail) return line

    const words = text.split(/\s+/).filter(Boolean)
    if (!words.length) return line

    const chunks = []
    let cur = words[0]
    for (let i = 1; i < words.length; i++) {
      if ((cur + ' ' + words[i]).length <= avail) {
        cur += ' ' + words[i]
      } else {
        chunks.push(cur)
        cur = words[i]
      }
    }
    chunks.push(cur)

    const cont = prefix.replace(RE_CORNERS, ' ')
    const out = []
    for (let j = 0; j < chunks.length; j++) {
      out.push((j === 0 ? prefix : cont) + chunks[j])
    }
    return out.join('\n')
  }

  function wrap() {
    const els = document.querySelectorAll('.terminal')
    for (let k = 0; k < els.length; k++) {
      const el = els[k]
      const id = el.id || 't' + k

      if (!saved[id]) saved[id] = el.innerHTML
      else el.innerHTML = saved[id]

      const max = Math.floor(el.clientWidth / charWidth(el)) - 1
      if (max < 20) continue

      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
      const nodes = []
      let n
      while ((n = walker.nextNode()) !== null) nodes.push(n)

      for (let i = 0; i < nodes.length; i++) {
        const lines = nodes[i].textContent.split('\n')
        const wrapped = []
        for (let j = 0; j < lines.length; j++) {
          wrapped.push(wrapLine(lines[j], max))
        }
        nodes[i].textContent = wrapped.join('\n')
      }
    }
  }

  window.addEventListener('load', wrap)
  window.addEventListener('resize', function () {
    clearTimeout(timer)
    timer = setTimeout(wrap, 150)
  })
})()
