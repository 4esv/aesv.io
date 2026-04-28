// Activities page — last-victory playthrough.
// Pre-rendered SVG frames live in <script id="lv-frames"> as JSON. The
// Play button steps through them; Reset returns to the final position
// (which is the canonical winning-move highlight from the server).
;(function () {
  var board = document.getElementById('lv-board')
  var playBtn = document.getElementById('lv-play')
  var resetBtn = document.getElementById('lv-reset')
  var status = document.getElementById('lv-status')
  var framesScript = document.getElementById('lv-frames')

  if (!board || !playBtn || !framesScript) return

  var frames
  try {
    frames = JSON.parse(framesScript.textContent || '[]')
  } catch {
    return
  }
  if (!frames.length) return

  // The final SVG (winning position with lavender highlight) is what
  // server-rendered into the board. Stash it so Reset can restore.
  var finalSvg = board.innerHTML
  var FRAME_MS = 700
  var idx = 0
  var timer = null

  function setFrame(i) {
    if (i < 0 || i >= frames.length) return
    board.innerHTML = frames[i]
    status.textContent = 'move ' + (i + 1) + ' / ' + frames.length
  }

  function stop() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    playBtn.textContent = '▶ play through'
    playBtn.disabled = false
  }

  function reset() {
    stop()
    board.innerHTML = finalSvg
    status.textContent = ''
    resetBtn.hidden = true
    idx = 0
  }

  playBtn.addEventListener('click', function () {
    if (timer) {
      stop()
      return
    }
    idx = 0
    setFrame(idx)
    resetBtn.hidden = false
    playBtn.textContent = '⏸ pause'
    timer = setInterval(function () {
      idx += 1
      if (idx >= frames.length) {
        stop()
        // Settle on the final winning-move position.
        board.innerHTML = finalSvg
        status.textContent = 'finished · ' + frames.length + ' moves'
        return
      }
      setFrame(idx)
    }, FRAME_MS)
  })

  resetBtn.addEventListener('click', reset)
})()
