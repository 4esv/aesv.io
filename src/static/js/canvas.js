/* canvas.js — aesv.io spatial garden */
;(function () {
  'use strict'

  // ── Constants ──────────────────────────────────────────────────────────────────
  var BW = 260,
    BH = 260
  var CW = 3200,
    CH = 3200
  var CX = CW / 2,
    CY = CH / 2
  var MM_W = 140,
    MM_H = 90
  var THEME_KEY = 'aesv-theme'

  // ── Page data ──────────────────────────────────────────────────────────────────
  var DATA = (function () {
    try {
      var el = document.getElementById('page-data')
      return el ? JSON.parse(el.textContent) : {}
    } catch {
      return {}
    }
  })()

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  // ── Card content ───────────────────────────────────────────────────────────────
  // Format principle: bites, not prose. Labels > sentences. Stats > descriptions.
  var CARDS = {
    // ── Center
    welcome: {
      title: '·>· Axel Stevens',
      render: function () {
        return (
          '<p>Mexican American · New York</p>' +
          '<hr class="win-hr">' +
          '<p>interfaces for humans<br>' +
          'systems for machines</p>' +
          '<hr class="win-hr">' +
          '<p>' +
          '<a href="mailto:mail@aesv.io">mail@aesv.io</a><br>' +
          '<a href="https://github.com/4esv" target="_blank" rel="noopener noreferrer">github.com/4esv ↗</a><br>' +
          '<a href="https://garden.aesv.io" target="_blank" rel="noopener noreferrer">garden.aesv.io ↗</a>' +
          '</p>'
        )
      },
    },

    // ── NE — work + do
    work: {
      title: 'work',
      render: function () {
        return (
          '<p>Cornell University<br>' +
          '<span class="dim">Systems Integrator · 2022–</span></p>' +
          '<hr class="win-hr">' +
          '<p class="dim">applications<br>' +
          'automations<br>' +
          'integrations</p>' +
          '<hr class="win-hr">' +
          '<p>' +
          '<a href="https://linkedin.com/in/aesv" target="_blank" rel="noopener noreferrer">linkedin ↗</a> · ' +
          '<a href="mailto:mail@aesv.io">mail@aesv.io</a>' +
          '</p>'
        )
      },
    },

    // ── NW — work + make (case studies)
    dossier: {
      title: 'dossier builder · 2024',
      render: function () {
        return (
          '<p class="win-label">case study</p>' +
          '<p>Tenure packet assembly</p>' +
          '<p class="win-result">multi-day → 5 min</p>' +
          '<hr class="win-hr">' +
          '<p class="dim">React · Node.js · BullMQ<br>' +
          'Python · MSSQL · Interfolio<br>' +
          '23k lines</p>'
        )
      },
    },
    devicesync: {
      title: 'device sync · 2023',
      render: function () {
        return (
          '<p class="win-label">case study</p>' +
          '<p>MDM sync · 40k+ devices</p>' +
          '<p class="win-result">inventory 60% → 95%+</p>' +
          '<hr class="win-hr">' +
          '<p class="dim">Jamf ↔ Snipe-IT<br>' +
          'PowerShell · OAuth<br>' +
          'exponential backoff</p>'
        )
      },
    },
    appsec: {
      title: 'app security · 2023',
      render: function () {
        return (
          '<p class="win-label">case study</p>' +
          '<p>Three-tier RBAC</p>' +
          '<p class="dim">replaced decade-old ColdFusion<br>' +
          'serves two colleges</p>' +
          '<hr class="win-hr">' +
          '<p class="dim">LDAP · SAML · Shibboleth<br>' +
          'Node.js · MSSQL</p>'
        )
      },
    },
    nao: {
      title: 'nao robot · 2022',
      render: function () {
        return (
          '<p class="win-label">case study</p>' +
          '<p>Conversational humanoid<br>' +
          '<span class="dim">NSF grant demo</span></p>' +
          '<hr class="win-hr">' +
          '<p class="dim">mic → Whisper → GPT<br>' +
          '→ speech + gestures<br>' +
          'Python · NAOqi</p>'
        )
      },
    },

    // ── SE — life + do
    music: {
      title: 'music',
      render: function () {
        var sp = DATA.spotify
        var tracks = ''
        if (sp && sp.tracks && sp.tracks.length) {
          tracks =
            '<hr class="win-hr"><p class="dim">lately</p>' +
            sp.tracks
              .slice(0, 3)
              .map(function (t) {
                return (
                  '<p><a href="' +
                  esc(t.url) +
                  '" target="_blank" rel="noopener noreferrer">' +
                  esc(t.name) +
                  ' ↗</a><br>' +
                  '<span class="dim">' +
                  esc(t.artist) +
                  '</span></p>'
                )
              })
              .join('')
        }
        return (
          '<p>piano · bass · drums (ish)</p>' +
          '<p class="dim">folklore → death metal</p>' +
          tracks +
          '<hr class="win-hr">' +
          '<p>' +
          '<a href="https://open.spotify.com/user/aesvel" target="_blank" rel="noopener noreferrer">spotify ↗</a> · ' +
          '<a href="https://soundcloud.com/4esv" target="_blank" rel="noopener noreferrer">soundcloud ↗</a>' +
          '</p>'
        )
      },
    },
    chess: {
      title: 'chess',
      render: function () {
        var c = DATA.chess
        if (!c)
          return (
            '<p class="dim">no recent victories</p>' +
            '<p><a href="https://chess.com/member/4esv" target="_blank" rel="noopener noreferrer">chess.com ↗</a></p>'
          )
        var board = (c.board || [])
          .map(function (l) {
            return esc(l)
          })
          .join('\n')
        return (
          '<p class="dim">last victory</p>' +
          '<p>' +
          esc(c.white) +
          ' vs ' +
          esc(c.black) +
          '</p>' +
          '<code class="win-board">' +
          board +
          '</code>' +
          '<p><a href="' +
          esc(c.url) +
          '" target="_blank" rel="noopener noreferrer">chess.com ↗</a></p>'
        )
      },
    },
    sport: {
      title: 'sport',
      render: function () {
        var s = DATA.strava
        var last = ''
        if (s) {
          last =
            '<hr class="win-hr">' +
            '<p class="dim">last</p>' +
            '<p>' +
            esc(s.name) +
            '</p>' +
            '<p class="dim">' +
            esc(s.type) +
            ' · ' +
            esc(s.distance) +
            ' mi · ' +
            esc(s.duration) +
            '</p>'
        }
        return (
          '<p>walking · climbing · running</p>' +
          '<p class="dim">gorges · trails · lake</p>' +
          last +
          '<hr class="win-hr">' +
          '<p><a href="https://strava.com/athletes/51674641" target="_blank" rel="noopener noreferrer">strava ↗</a></p>'
        )
      },
    },

    // ── SW — life + make (open source)
    pianito: {
      title: 'pianito',
      render: function () {
        return (
          '<p>TUI piano tuner</p>' +
          '<p class="dim">chromatic · terminal · keyboard</p>' +
          '<hr class="win-hr">' +
          '<p><a href="https://github.com/4esv/pianito" target="_blank" rel="noopener noreferrer">github.com/4esv/pianito ↗</a></p>'
        )
      },
    },
    bbq: {
      title: 'bbq',
      render: function () {
        return (
          '<p>BQN quant toolkit</p>' +
          '<p class="dim">array language · finance</p>' +
          '<hr class="win-hr">' +
          '<p><a href="https://github.com/4esv/bbq" target="_blank" rel="noopener noreferrer">github.com/4esv/bbq ↗</a></p>'
        )
      },
    },
    dotfiles: {
      title: 'dotfiles',
      render: function () {
        return (
          '<p>portable dev environment</p>' +
          '<p class="dim">neovim · zsh · tmux</p>' +
          '<hr class="win-hr">' +
          '<p>' +
          '<a href="https://github.com/4esv/dotfiles" target="_blank" rel="noopener noreferrer">dotfiles ↗</a> · ' +
          '<a href="https://github.com/4esv/nvim-config" target="_blank" rel="noopener noreferrer">nvim ↗</a>' +
          '</p>'
        )
      },
    },
    garden: {
      title: 'digital garden',
      render: function () {
        return (
          '<p>longer thoughts</p>' +
          '<p class="dim">notes · experiments<br>' +
          "things that don't fit here</p>" +
          '<hr class="win-hr">' +
          '<p><a href="https://garden.aesv.io" target="_blank" rel="noopener noreferrer">garden.aesv.io ↗</a></p>'
        )
      },
    },
  }

  // ── Static positions ───────────────────────────────────────────────────────────
  // Axis logic:
  //   N = work,  S = life
  //   W = make,  E = do
  //   NW = work+make (case studies), NE = work+do (work history)
  //   SW = life+make (open source),  SE = life+do (music/sport)

  var POS = {
    welcome: { x: CX - BW / 2, y: CY - BH / 2 }, // (1470, 1470)

    // NE — work + do
    work: { x: 1900, y: 980 },

    // NW — work + make (case studies, 2×2 grid)
    dossier: { x: 1000, y: 840 },
    devicesync: { x: 700, y: 840 },
    appsec: { x: 1000, y: 1160 },
    nao: { x: 700, y: 1160 },

    // SE — life + do
    music: { x: 1900, y: 1880 },
    chess: { x: 2200, y: 1880 },
    sport: { x: 1900, y: 2180 },

    // SW — life + make (open source, 2×2 grid)
    pianito: { x: 1000, y: 1880 },
    bbq: { x: 700, y: 1880 },
    dotfiles: { x: 1000, y: 2180 },
    garden: { x: 700, y: 2180 },
  }

  // Card center helper
  function cc(id) {
    var p = POS[id]
    return { x: p.x + BW / 2, y: p.y + BH / 2 }
  }

  // ── Connection definitions ─────────────────────────────────────────────────────
  // Main lines from welcome → nearest card in each quadrant
  var MAIN_LINES = [
    { a: 'welcome', b: 'work' }, // NE
    { a: 'welcome', b: 'dossier' }, // NW
    { a: 'welcome', b: 'music' }, // SE
    { a: 'welcome', b: 'pianito' }, // SW
  ]

  var CLUSTER_LINES = [
    // NW cluster (case studies)
    ['dossier', 'devicesync'],
    ['dossier', 'appsec'],
    ['appsec', 'nao'],
    ['devicesync', 'nao'],
    // SE cluster (life + do)
    ['music', 'chess'],
    ['music', 'sport'],
    // SW cluster (open source)
    ['bbq', 'pianito'],
    ['bbq', 'garden'],
    ['pianito', 'dotfiles'],
    ['dotfiles', 'garden'],
  ]

  // ── State ──────────────────────────────────────────────────────────────────────
  var state = { panX: 0, panY: 0, theme: 'dark', flyRaf: null, zTop: 100 }

  // ── DOM refs ───────────────────────────────────────────────────────────────────
  var wrap, canvas, conns, mmCanvas, mmVp, mmCtx, MMS, MMX, MMY
  var paletteOverlay, paletteInput, paletteResults
  var paletteOpen = false,
    palItems = [],
    palIdx = 0

  // ── Transform ──────────────────────────────────────────────────────────────────
  function applyTransform() {
    canvas.style.transform = 'translate(' + state.panX + 'px,' + state.panY + 'px)'
    redrawMinimap()
  }

  // ── Fly-to ─────────────────────────────────────────────────────────────────────
  function flyTo(id) {
    var p = POS[id]
    if (!p) return
    animatePanTo(
      window.innerWidth / 2 - (p.x + BW / 2),
      window.innerHeight / 2 - (p.y + BH / 2),
      340
    )
  }

  function animatePanTo(tx, ty, dur) {
    var sx = state.panX,
      sy = state.panY
    var dx = tx - sx,
      dy = ty - sy
    var t0 = performance.now()
    if (state.flyRaf) cancelAnimationFrame(state.flyRaf)
    function tick(t) {
      var p = Math.min((t - t0) / dur, 1)
      var e = 1 - Math.pow(1 - p, 3)
      state.panX = sx + dx * e
      state.panY = sy + dy * e
      applyTransform()
      if (p < 1) state.flyRaf = requestAnimationFrame(tick)
      else state.flyRaf = null
    }
    state.flyRaf = requestAnimationFrame(tick)
  }

  // ── Build card ─────────────────────────────────────────────────────────────────
  function makeCard(id) {
    var def = CARDS[id]
    var p = POS[id]

    var div = document.createElement('div')
    div.className = 'win'
    div.id = 'card-' + id
    div.style.cssText = 'left:' + p.x + 'px;top:' + p.y + 'px;z-index:' + ++state.zTop

    var top = document.createElement('div')
    top.className = 'win-top'

    var title = document.createElement('span')
    title.className = 'win-title'
    title.textContent = def.title
    top.appendChild(title)

    var body = document.createElement('div')
    body.className = 'win-body'
    body.innerHTML = def.render()

    div.appendChild(top)
    div.appendChild(body)

    // Body click → center this card
    body.addEventListener('click', function (e) {
      if (e.target.closest('a')) return
      flyTo(id)
    })

    // Raise z-index on interact
    div.addEventListener('mousedown', function () {
      div.style.zIndex = ++state.zTop
    })
    div.addEventListener(
      'touchstart',
      function () {
        div.style.zIndex = ++state.zTop
      },
      { passive: true }
    )

    setupDrag(id, div, top)
    return div
  }

  // ── Drag ───────────────────────────────────────────────────────────────────────
  function setupDrag(id, div, handle) {
    var dragging = false
    var smx, smy, sox, soy

    handle.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return
      e.preventDefault()
      e.stopPropagation()
      dragging = true
      div.style.zIndex = ++state.zTop
      smx = e.clientX
      smy = e.clientY
      sox = parseFloat(div.style.left)
      soy = parseFloat(div.style.top)
      wrap.classList.add('panning')
    })

    document.addEventListener('mousemove', function (e) {
      if (!dragging) return
      div.style.left = sox + e.clientX - smx + 'px'
      div.style.top = soy + e.clientY - smy + 'px'
    })

    document.addEventListener('mouseup', function () {
      if (dragging) {
        dragging = false
        wrap.classList.remove('panning')
      }
    })

    // Touch drag
    var tDragging = false,
      stx,
      sty

    handle.addEventListener(
      'touchstart',
      function (e) {
        if (e.touches.length !== 1) return
        e.stopPropagation()
        tDragging = true
        div.style.zIndex = ++state.zTop
        stx = e.touches[0].clientX
        sty = e.touches[0].clientY
        sox = parseFloat(div.style.left)
        soy = parseFloat(div.style.top)
      },
      { passive: true }
    )

    handle.addEventListener(
      'touchmove',
      function (e) {
        if (!tDragging || e.touches.length !== 1) return
        e.preventDefault()
        e.stopPropagation()
        div.style.left = sox + e.touches[0].clientX - stx + 'px'
        div.style.top = soy + e.touches[0].clientY - sty + 'px'
      },
      { passive: false }
    )

    handle.addEventListener(
      'touchend',
      function () {
        tDragging = false
      },
      { passive: true }
    )
  }

  // ── SVG helpers ────────────────────────────────────────────────────────────────
  function svgEl(tag, attrs, text) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', tag)
    for (var k in attrs) el.setAttribute(k, attrs[k])
    if (text != null) el.textContent = text
    return el
  }

  function drawConnections() {
    while (conns.firstChild) conns.removeChild(conns.firstChild)

    // Crosshair axis lines
    conns.appendChild(
      svgEl('line', {
        x1: CX,
        y1: 240,
        x2: CX,
        y2: 2960,
        stroke: 'var(--fg-dim)',
        'stroke-width': '1',
        'stroke-dasharray': '3 10',
        opacity: '0.22',
      })
    )
    conns.appendChild(
      svgEl('line', {
        x1: 240,
        y1: CY,
        x2: 2960,
        y2: CY,
        stroke: 'var(--fg-dim)',
        'stroke-width': '1',
        'stroke-dasharray': '3 10',
        opacity: '0.22',
      })
    )

    // Axis labels  (N=work, S=life, W=make, E=do)
    var axisLabels = [
      { x: CX, y: 318, text: 'work' },
      { x: CX, y: 2912, text: 'life' },
      { x: 296, y: CY + 5, text: 'make' },
      { x: 2912, y: CY + 5, text: 'do' },
    ]
    axisLabels.forEach(function (lb) {
      conns.appendChild(
        svgEl(
          'text',
          {
            x: lb.x,
            y: lb.y,
            'text-anchor': 'middle',
            fill: 'var(--fg-dim)',
            'font-size': '11',
            'font-family': 'Source Code Pro, Courier New, monospace',
            'letter-spacing': '0.12em',
            opacity: '0.45',
          },
          lb.text
        )
      )
    })

    // Main lines from welcome → quadrant anchors
    MAIN_LINES.forEach(function (conn) {
      var a = cc(conn.a),
        b = cc(conn.b)
      conns.appendChild(
        svgEl('line', {
          x1: a.x,
          y1: a.y,
          x2: b.x,
          y2: b.y,
          stroke: 'var(--fg-dim)',
          'stroke-width': '1.5',
          opacity: '0.5',
        })
      )
    })

    // Cluster internal lines
    CLUSTER_LINES.forEach(function (pair) {
      var a = cc(pair[0]),
        b = cc(pair[1])
      conns.appendChild(
        svgEl('line', {
          x1: a.x,
          y1: a.y,
          x2: b.x,
          y2: b.y,
          stroke: 'var(--fg-dim)',
          'stroke-width': '1',
          opacity: '0.28',
        })
      )
    })
  }

  // ── Minimap ────────────────────────────────────────────────────────────────────
  function redrawMinimap() {
    if (!mmCtx) return
    mmCtx.clearRect(0, 0, MM_W, MM_H)
    var style = getComputedStyle(document.documentElement)
    mmCtx.fillStyle = style.getPropertyValue('--bg').trim()
    mmCtx.fillRect(0, 0, MM_W, MM_H)
    mmCtx.fillStyle = style.getPropertyValue('--accent').trim()
    mmCtx.globalAlpha = 0.5
    for (var id in POS) {
      var p = POS[id]
      mmCtx.fillRect(p.x * MMS + MMX, p.y * MMS + MMY, Math.max(BW * MMS, 2), Math.max(BH * MMS, 2))
    }
    mmCtx.globalAlpha = 1
    var vx = -state.panX * MMS + MMX
    var vy = -state.panY * MMS + MMY
    var vw = window.innerWidth * MMS
    var vh = window.innerHeight * MMS
    vx = Math.max(0, Math.min(vx, MM_W))
    vy = Math.max(0, Math.min(vy, MM_H))
    mmVp.style.cssText =
      'left:' +
      vx +
      'px;top:' +
      vy +
      'px;width:' +
      Math.max(vw, 4) +
      'px;height:' +
      Math.max(vh, 4) +
      'px'
  }

  // ── Pan — mouse ────────────────────────────────────────────────────────────────
  var panning = false,
    pmx,
    pmy,
    ppx,
    ppy

  function onWrapMousedown(e) {
    var t = e.target
    if (t !== wrap && t !== canvas && !t.matches('#connections, #connections *')) return
    panning = true
    pmx = e.clientX
    pmy = e.clientY
    ppx = state.panX
    ppy = state.panY
    wrap.classList.add('panning')
  }

  document.addEventListener('mousemove', function (e) {
    if (!panning) return
    state.panX = ppx + (e.clientX - pmx)
    state.panY = ppy + (e.clientY - pmy)
    applyTransform()
  })

  document.addEventListener('mouseup', function () {
    if (panning) {
      panning = false
      wrap.classList.remove('panning')
    }
  })

  // ── Pan — touch ────────────────────────────────────────────────────────────────
  var lastTouch = null

  function onTouchStart(e) {
    if (e.touches.length === 1) lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  function onTouchMove(e) {
    e.preventDefault()
    if (e.touches.length === 1 && lastTouch) {
      state.panX += e.touches[0].clientX - lastTouch.x
      state.panY += e.touches[0].clientY - lastTouch.y
      lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      applyTransform()
    }
  }

  // ── Command palette ────────────────────────────────────────────────────────────
  function openPalette() {
    paletteOpen = true
    paletteOverlay.classList.add('open')
    paletteInput.value = ''
    renderPalette('')
    setTimeout(function () {
      paletteInput.focus()
    }, 0)
  }

  function closePalette() {
    paletteOpen = false
    paletteOverlay.classList.remove('open')
  }

  function renderPalette(q) {
    q = q.toLowerCase().trim()
    palItems = []

    for (var id in CARDS) {
      var def = CARDS[id]
      if (!q || def.title.toLowerCase().indexOf(q) !== -1 || id.indexOf(q) !== -1) {
        palItems.push({
          tag: 'card',
          name: def.title,
          sub: 'fly to',
          action: (function (bid) {
            return function () {
              flyTo(bid)
              closePalette()
            }
          })(id),
        })
      }
    }

    var actions = [
      {
        tag: 'action',
        name: 'toggle theme',
        sub: state.theme === 'dark' ? '→ light' : '→ dark',
        action: function () {
          toggleTheme()
          closePalette()
        },
      },
      {
        tag: 'action',
        name: 'reset view',
        sub: '',
        action: function () {
          resetView()
          closePalette()
        },
      },
    ]
    actions.forEach(function (a) {
      if (!q || a.name.indexOf(q) !== -1) palItems.push(a)
    })

    palIdx = 0
    var cardItems = palItems.filter(function (i) {
      return i.tag === 'card'
    })
    var actItems = palItems.filter(function (i) {
      return i.tag === 'action'
    })
    var html = ''
    if (!palItems.length) {
      html = '<div class="pal-empty">no results</div>'
    } else {
      if (cardItems.length) {
        html += '<div class="pal-group">cards</div>'
        cardItems.forEach(function (it) {
          html += palItemHtml(it)
        })
      }
      if (actItems.length) {
        html += '<div class="pal-group">actions</div>'
        actItems.forEach(function (it) {
          html += palItemHtml(it)
        })
      }
    }
    paletteResults.innerHTML = html
    paletteResults.querySelectorAll('.pal-item').forEach(function (el) {
      var idx = parseInt(el.dataset.idx, 10)
      el.addEventListener('click', function () {
        palItems[idx] && palItems[idx].action()
      })
      el.addEventListener('mouseenter', function () {
        palIdx = idx
        highlightPal()
      })
    })
    highlightPal()
  }

  function palItemHtml(item) {
    var idx = palItems.indexOf(item)
    return (
      '<div class="pal-item" data-idx="' +
      idx +
      '" role="option">' +
      '<span class="pi-tag">' +
      esc(item.tag) +
      '</span>' +
      '<span class="pi-name">' +
      esc(item.name) +
      '</span>' +
      (item.sub ? '<span class="pi-sub">' + esc(item.sub) + '</span>' : '') +
      '</div>'
    )
  }

  function highlightPal() {
    paletteResults.querySelectorAll('.pal-item').forEach(function (el) {
      el.classList.toggle('active', parseInt(el.dataset.idx, 10) === palIdx)
    })
  }

  // ── Actions ────────────────────────────────────────────────────────────────────
  function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', state.theme)
    localStorage.setItem(THEME_KEY, state.theme)
    redrawMinimap()
  }

  function resetView() {
    animatePanTo(
      window.innerWidth / 2 - (POS.welcome.x + BW / 2),
      window.innerHeight / 2 - (POS.welcome.y + BH / 2),
      350
    )
  }

  // ── Keyboard ───────────────────────────────────────────────────────────────────
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      paletteOpen ? closePalette() : openPalette()
      return
    }
    if (e.key === '/' && !paletteOpen && document.activeElement.tagName !== 'INPUT') {
      e.preventDefault()
      openPalette()
      return
    }
    if (e.key === 'Escape') {
      if (paletteOpen) closePalette()
      return
    }
    if (!paletteOpen) return
    if (e.key === 'ArrowDown') {
      palIdx = Math.min(palIdx + 1, palItems.length - 1)
      highlightPal()
      e.preventDefault()
    } else if (e.key === 'ArrowUp') {
      palIdx = Math.max(palIdx - 1, 0)
      highlightPal()
      e.preventDefault()
    } else if (e.key === 'Enter') {
      if (palItems[palIdx]) palItems[palIdx].action()
      e.preventDefault()
    }
  })

  // ── Init ───────────────────────────────────────────────────────────────────────
  function init() {
    wrap = document.getElementById('canvas-wrap')
    canvas = document.getElementById('canvas')
    conns = document.getElementById('connections')
    mmCanvas = document.getElementById('minimap-canvas')
    mmVp = document.getElementById('minimap-viewport')
    mmCtx = mmCanvas.getContext('2d')
    paletteOverlay = document.getElementById('palette-overlay')
    paletteInput = document.getElementById('palette-input')
    paletteResults = document.getElementById('palette-results')

    MMS = Math.min(MM_W / CW, MM_H / CH)
    MMX = (MM_W - CW * MMS) / 2
    MMY = (MM_H - CH * MMS) / 2

    var saved = localStorage.getItem(THEME_KEY)
    if (saved === 'light' || saved === 'dark') {
      state.theme = saved
      document.documentElement.setAttribute('data-theme', saved)
    }

    for (var id in CARDS) {
      var el = makeCard(id)
      canvas.appendChild(el)
    }

    drawConnections()

    wrap.addEventListener('mousedown', onWrapMousedown)
    wrap.addEventListener('touchstart', onTouchStart, { passive: true })
    wrap.addEventListener('touchmove', onTouchMove, { passive: false })

    document.getElementById('minimap').addEventListener('click', function (e) {
      var rect = document.getElementById('minimap').getBoundingClientRect()
      var cx = (e.clientX - rect.left - MMX) / MMS
      var cy = (e.clientY - rect.top - MMY) / MMS
      animatePanTo(window.innerWidth / 2 - cx, window.innerHeight / 2 - cy, 350)
    })

    document.getElementById('palette-btn').addEventListener('click', function () {
      paletteOpen ? closePalette() : openPalette()
    })
    paletteOverlay.addEventListener('click', function (e) {
      if (e.target === paletteOverlay) closePalette()
    })
    paletteInput.addEventListener('input', function (e) {
      renderPalette(e.target.value)
    })

    state.panX = window.innerWidth / 2 - (POS.welcome.x + BW / 2)
    state.panY = window.innerHeight / 2 - (POS.welcome.y + BH / 2)
    applyTransform()

    var hint = document.getElementById('canvas-hint')
    if (hint) {
      setTimeout(function () {
        hint.classList.add('visible')
      }, 1200)
      setTimeout(function () {
        hint.classList.remove('visible')
      }, 5500)
    }

    window.addEventListener('resize', redrawMinimap)

    if ('serviceWorker' in navigator)
      navigator.serviceWorker.register('/sw.js').catch(function () {})
  }

  document.addEventListener('DOMContentLoaded', init)
})()
