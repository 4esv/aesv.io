(function() {
  var saved = {};
  var timer = null;

  var RE_PREFIX = /^([\s│┃║┌└├┬┴┼─┏┗┣┳┻╋━╔╚╠╦╩╬═]*)/;
  var RE_CORNERS = /[┌└─┏┗━╔╚═]/g;

  function charWidth(container) {
    var span = document.createElement('span');
    span.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;font:inherit';
    span.textContent = 'MMMMMMMMMM';
    container.appendChild(span);
    var w = span.offsetWidth / 10;
    container.removeChild(span);
    return w;
  }

  function wrapLine(line, max) {
    if (line.length <= max) return line;

    var match = line.match(RE_PREFIX);
    var prefix = match ? match[1] : '';
    var text = line.slice(prefix.length);
    var avail = max - prefix.length - 1;

    if (avail < 5 || text.length <= avail) return line;

    var words = text.split(/\s+/).filter(function(w) { return w; });
    if (!words.length) return line;

    var chunks = [];
    var cur = words[0];
    for (var i = 1; i < words.length; i++) {
      if ((cur + ' ' + words[i]).length <= avail) {
        cur += ' ' + words[i];
      } else {
        chunks.push(cur);
        cur = words[i];
      }
    }
    chunks.push(cur);

    var cont = prefix.replace(RE_CORNERS, ' ');
    var out = [];
    for (var j = 0; j < chunks.length; j++) {
      out.push((j === 0 ? prefix : cont) + chunks[j]);
    }
    return out.join('\n');
  }

  function wrap() {
    var els = document.querySelectorAll('.terminal');
    for (var k = 0; k < els.length; k++) {
      var el = els[k];
      var id = el.id || ('t' + k);

      if (!saved[id]) saved[id] = el.innerHTML;
      else el.innerHTML = saved[id];

      var max = Math.floor(el.clientWidth / charWidth(el)) - 1;
      if (max < 20) continue;

      var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      var nodes = [];
      var n;
      while (n = walker.nextNode()) nodes.push(n);

      for (var i = 0; i < nodes.length; i++) {
        var lines = nodes[i].textContent.split('\n');
        var wrapped = [];
        for (var j = 0; j < lines.length; j++) {
          wrapped.push(wrapLine(lines[j], max));
        }
        nodes[i].textContent = wrapped.join('\n');
      }
    }
  }

  window.addEventListener('load', wrap);
  window.addEventListener('resize', function() {
    clearTimeout(timer);
    timer = setTimeout(wrap, 150);
  });
})();
