(function() {
  function copyGpg(btn) {
    fetch('/api/gpg').then(function(r) { return r.text(); }).then(function(key) {
      navigator.clipboard.writeText(key).then(function() {
        var orig = btn.textContent;
        btn.textContent = '\u2713 copied';
        setTimeout(function() { btn.textContent = orig; }, 1500);
      });
    });
  }
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('gpg-btn')) copyGpg(e.target);
  });

  function checkScroll() {
    document.body.classList.toggle('no-scroll',
      document.documentElement.scrollHeight <= window.innerHeight);
  }
  window.addEventListener('load', checkScroll);
  window.addEventListener('resize', checkScroll);
})();
