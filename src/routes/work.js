// /work — hire-me page plus canonical home for case studies.
// Case-study markdown still lives in content/feed/ (tagged `type: case-study`)
// but is surfaced and rendered under /work/<slug>; the writing /feed
// excludes them.

import { loadFeedEntries } from './feed.js'
import { renderPage } from '../lib/render.js'

const loadCaseStudies = async () => {
  const entries = await loadFeedEntries()
  return entries.filter((e) => e.type === 'case-study' && !e.hidden)
}

const SERVICES = [
  {
    title: 'Full-Stack Web Apps',
    body: 'End-to-end web applications. React on the front, Node or Python on the back. Built lean, deployed often.',
  },
  {
    title: 'Process Automation',
    body: 'Replace the spreadsheet, the retyping, the manual exports. Workflows that run on their own at 3am.',
  },
  {
    title: 'System Integration',
    body: 'Get two systems to talk. Undocumented APIs, signed auth, vendor SDKs that fight back. Wherever the data needs to go.',
  },
  {
    title: 'API Development and Integration',
    body: 'Design, build, and consume APIs. REST, OAuth, webhooks, signed payloads. The plumbing that holds the stack together.',
  },
  {
    title: 'AI and LLM Integration',
    body: 'Custom GPT, Claude, or local models wired into your products and workflows. Honest scoping when AI is the wrong answer.',
  },
  {
    title: 'Internal Tools and Dashboards',
    body: 'Focused interfaces for your team. Search, role-based access, drag-and-drop. The screen people actually open.',
  },
  {
    title: 'Data Pipelines and Reporting',
    body: 'ETL, scheduled exports, reports leadership can act on. From raw source to executive summary, end to end.',
  },
  {
    title: 'Web Scraping and Data Extraction',
    body: 'Pull data from anywhere it lives. Reverse-engineered endpoints, throttled scrapes, the export the vendor never built.',
  },
  {
    title: 'Document Processing and OCR',
    body: 'PDFs, scans, and receipts turned into structured data. Pipelines that read what humans used to retype, with checks that catch the misreads.',
  },
  {
    title: 'Authentication and Permissions',
    body: 'OAuth, SSO, and role-based access. Login flows users barely notice, with the audit trail your security team will ask for.',
  },
  {
    title: 'Legacy Code Modernization',
    body: 'Decade-old code, missing docs, no tests. Read it, document it, modernize it, or rewrite it cleanly.',
  },
  {
    title: 'Migrations and System Rewrites',
    body: 'Move off the old thing without losing what works. Phased rollouts, data integrity end to end, no big-bang weekends.',
  },
]

const AUDIENCES = [
  {
    title: 'Individuals',
    body: "I'll build the small tool you've been meaning to write.",
  },
  {
    title: 'Small businesses',
    body: "I'll automate the manual workflow you've been retyping for years.",
  },
  {
    title: 'Organizations',
    body: "I'll connect your legacy system to the new one without taking the office offline.",
  },
]

export async function registerWorkRoutes(fastify) {
  fastify.get('/work', async (request, reply) => {
    const caseStudies = await loadCaseStudies()
    return renderPage(fastify, request, reply, 'work/index.njk', {
      site: { name: 'work', tagline: 'I make system A talk to system B.' },
      lede: 'Hire me to make system A talk to system B. Integrations, automation, AI plumbing, internal tools, and the occasional rescue of something old.',
      caseStudies,
      services: SERVICES,
      audiences: AUDIENCES,
    })
  })

  fastify.get('/work/:slug', async (request, reply) => {
    const entries = await loadFeedEntries()
    const entry = entries.find((e) => e.slug === request.params.slug)
    if (!entry || entry.type !== 'case-study' || entry.hidden) {
      return reply.redirect('/work')
    }
    return renderPage(fastify, request, reply, 'feed/entry.njk', {
      site: { name: 'work', tagline: entry.summary || 'I make system A talk to system B.' },
      entry,
      html: entry.html,
      basePath: '/work',
      canonicalBase: '/work',
    })
  })
}
