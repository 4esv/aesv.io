// /work — portfolio + hire-me. Case studies are markdown files in
// content/work/ with frontmatter (year, tag, slug, summary, stack, impact).

import { join } from 'path'

import { loadMarkdownDir } from '../lib/content.js'

const loadCaseStudies = loadMarkdownDir(
  join(import.meta.dirname, '../../content/work'),
  (base, data) => ({
    ...base,
    slug: data.slug || base.slug,
    year: data.year || (base.date ? base.date.slice(0, 4) : ''),
    tag: data.tag || '',
    stack: data.stack || '',
    impact: data.impact || '',
  })
)

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
    return reply.view('work/case-study.njk', {
      site: { ...fastify.config.site, name: 'work', tagline: study.summary },
      route: `/work/${study.slug}`,
      study,
      html: study.html,
    })
  })
}
