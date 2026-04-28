import MarkdownIt from 'markdown-it'
import footnote from 'markdown-it-footnote'
import anchor from 'markdown-it-anchor'
import katex from 'markdown-it-katex'
import hljs from 'highlight.js'

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code class="language-${lang}">${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`
      } catch {
        // fall through
      }
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
  },
})

md.use(footnote)
md.use(anchor, { permalink: anchor.permalink.headerLink({ safariReaderFix: true }) })
md.use(katex, { throwOnError: false, errorColor: '#A84A3C' })

export function renderMarkdown(src) {
  return md.render(src || '')
}
