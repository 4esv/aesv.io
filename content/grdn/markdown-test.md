---
title: Markdown features test
date: 2026-04-26
summary: Verifying that code blocks, inline code, math, and footnotes all render the way they should.
tags:
  - meta
hidden: true
---

This page exists to verify that everything in the markdown pipeline actually renders. If you're reading this in production, something has gone wrong[^1].

## Code

Inline code looks like `foo.bar()` and lives flush with the prose. Block code lives in its own ink-on-cream slab:

```javascript
function fenToBoard(fen) {
  const rows = fen.split(' ')[0].split('/')
  return rows.map((row) => {
    const cells = []
    for (const ch of row) {
      if (/\d/.test(ch)) cells.push(...Array(+ch).fill(null))
      else cells.push(ch)
    }
    return cells
  })
}
```

```python
def admixture(snps, ref):
    """Project a genotype against reference populations."""
    return np.linalg.lstsq(ref, snps, rcond=None)[0]
```

## Math

Inline LaTeX: $E = mc^2$ should sit inside the line of prose. Greek letters: $\alpha + \beta = \gamma$. A fraction: $\frac{1}{1 + e^{-x}}$.

A display block is on its own line:

$$
\sigma(z) = \frac{1}{1 + e^{-z}}
$$

And something more involved:

$$
\int_{-\infty}^{\infty} e^{-x^2} \, dx = \sqrt{\pi}
$$

## Lists

- One.
- Two.
- Three.

1. First.
2. Second.
3. Third.

## A blockquote

> The first principle is that you must not fool yourself, and you are the easiest person to fool.

## Footnotes

The footnote marker should appear superscript[^example] and link down to the section at the bottom.

---

[^1]: This is the footnote definition. It should appear in a "footnotes" section with a back-arrow link.

[^example]: A second footnote, just to verify ordering.
