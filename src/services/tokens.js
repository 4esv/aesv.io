import { readFile, writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'

const TOKENS_PATH = join(import.meta.dirname, '../../data/tokens.json')

export async function readTokens() {
  try {
    const data = await readFile(TOKENS_PATH, 'utf-8')
    return JSON.parse(data)
  } catch {
    return {}
  }
}

export async function writeTokens(partial) {
  const existing = await readTokens()
  const merged = { ...existing, ...partial }
  await mkdir(dirname(TOKENS_PATH), { recursive: true })
  await writeFile(TOKENS_PATH, JSON.stringify(merged, null, 2) + '\n')
  return merged
}
