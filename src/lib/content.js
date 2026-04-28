// Markdown-content loader shared by /work, /garden, /about.
//
// Parses front-matter, renders body HTML at load time, sorts by date.
// Cache is hydrated once in production and bypassed in dev so edits
// show up without restarting the server.

import { readdir, readFile } from 'fs/promises'
import { join, parse } from 'path'

import matter from 'gray-matter'

import { renderMarkdown } from './markdown.js'

const USE_CACHE = process.env.NODE_ENV === 'production'

function normalizeDate(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  if (typeof value === 'string') return value
  return null
}

function parseEntry(slug, raw, mapFrontmatter) {
  const { data, content } = matter(raw)
  const html = renderMarkdown(content)
  const base = {
    slug,
    title: data.title || slug,
    date: normalizeDate(data.date),
    summary: data.summary || '',
    raw: content,
    html,
  }
  return mapFrontmatter ? mapFrontmatter(base, data) : base
}

// Load every .md file in a directory. `mapFrontmatter(base, data)` lets
// callers pull through additional frontmatter fields (year, tag, stack, etc.)
// without re-implementing the read/parse/render pipeline.
export function loadMarkdownDir(dir, mapFrontmatter) {
  let cache = null
  return async function load() {
    if (cache && USE_CACHE) return cache
    const entries = await readdir(dir, { withFileTypes: true })
    const items = []
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith('.md')) continue
      const slug = parse(entry.name).name
      const raw = await readFile(join(dir, entry.name), 'utf-8')
      items.push(parseEntry(slug, raw, mapFrontmatter))
    }
    items.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
    cache = items
    return items
  }
}

// Single-file variant for /about. Same parse pipeline, no sort.
export function loadMarkdownFile(path, mapFrontmatter) {
  let cache = null
  return async function load() {
    if (cache && USE_CACHE) return cache
    const raw = await readFile(path, 'utf-8')
    const slug = parse(path).name
    cache = parseEntry(slug, raw, mapFrontmatter)
    return cache
  }
}
