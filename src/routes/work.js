// /work — portfolio + hire-me
//
// Case studies are now markdown files in content/work/. Each .md has
// frontmatter (year, tag, slug, summary, stack, impact) and a body
// rendered through the same renderMarkdown chain the garden uses.

import { readdir, readFile } from 'fs/promises'
import { join, parse } from 'path'

import matter from 'gray-matter'

import { renderMarkdown } from '../lib/markdown.js'

const CASE_STUDIES_DIR = join(import.meta.dirname, '../../content/work')

let cache = null
const USE_CACHE = process.env.NODE_ENV === 'production'

async function loadCaseStudies() {
  if (cache && USE_CACHE) return cache
  const entries = await readdir(CASE_STUDIES_DIR, { withFileTypes: true })
  const studies = []
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue
    const slug = parse(entry.name).name
    const raw = await readFile(join(CASE_STUDIES_DIR, entry.name), 'utf-8')
    const { data, content } = matter(raw)
    const date =
      data.date instanceof Date
        ? data.date.toISOString().slice(0, 10)
        : typeof data.date === 'string'
          ? data.date
          : null
    studies.push({
      slug: data.slug || slug,
      title: data.title || slug,
      date,
      year: data.year || (date ? date.slice(0, 4) : ''),
      tag: data.tag || '',
      summary: data.summary || '',
      stack: data.stack || '',
      impact: data.impact || '',
      raw: content,
    })
  }
  // Most recent first.
  studies.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
  cache = studies
  return studies
}

const SERVICES = [
  {
    title: 'Forms & workflows',
    body: "Frevvo or otherwise. Multi-stage approvals, role-based routing, LDAP, real databases. End-to-end.",
  },
  {
    title: 'Automation scripts',
    body: "PowerShell, Python, Node. API sync between systems that don't want to talk. Scheduled jobs, Group Policy, OAuth lifecycle.",
  },
  {
    title: 'AI for researchers',
    body: 'Whisper, GPT, Azure OpenAI wired into research hardware. NSF-ready proofs of concept that run.',
  },
  {
    title: 'Asset management plumbing',
    body: 'Jamf, Snipe-IT, MDM-to-CMDB sync. Hostname-pattern classification. Nightly audits.',
  },
  {
    title: 'SSO & directory',
    body: 'LDAP, Active Directory, Shibboleth, SAML. RBAC dashboards. The boring infrastructure that has to be exactly right.',
  },
]

export async function registerWorkRoutes(fastify) {
  fastify.get('/work', async (_request, reply) => {
    const caseStudies = await loadCaseStudies()
    return reply.view('work/index.njk', {
      site: { ...fastify.config.site, name: 'work', tagline: 'I make system A talk to system B.' },
      route: '/work',
      caseStudies,
      services: SERVICES,
    })
  })

  fastify.get('/work/:slug', async (req, reply) => {
    const studies = await loadCaseStudies()
    const study = studies.find((s) => s.slug === req.params.slug)
    if (!study) return reply.redirect('/work')
    const html = renderMarkdown(study.raw)
    return reply.view('work/case-study.njk', {
      site: { ...fastify.config.site, name: 'work', tagline: study.summary },
      route: `/work/${study.slug}`,
      study,
      html,
    })
  })
}
