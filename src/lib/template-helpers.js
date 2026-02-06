function toStr(value) {
  return typeof value === 'string' ? value : String(value || '')
}

/**
 * @param {import('nunjucks').Environment} env
 */
export function registerFilters(env) {
  env.addFilter('repeat', (str, count) => {
    if (typeof str !== 'string' || typeof count !== 'number') return ''
    if (count < 0) return ''
    return str.repeat(Math.floor(count))
  })

  env.addFilter('truncate', (str, length = 50, suffix = '\u2026') => {
    if (typeof str !== 'string') return ''
    if (str.length <= length) return str
    return str.slice(0, length - suffix.length) + suffix
  })

  env.addFilter('center', (str, width) => {
    str = toStr(str)
    if (str.length >= width) return str.slice(0, width)
    const left = Math.floor((width - str.length) / 2)
    const right = width - str.length - left
    return ' '.repeat(left) + str + ' '.repeat(right)
  })

  env.addFilter('padEnd', (str, width, char = ' ') => {
    str = toStr(str)
    if (str.length >= width) return str.slice(0, width)
    return str + char.repeat(width - str.length)
  })

  env.addFilter('padStart', (str, width, char = ' ') => {
    str = toStr(str)
    if (str.length >= width) return str.slice(0, width)
    return char.repeat(width - str.length) + str
  })

  env.addFilter('date', (date, format) => {
    const d = date instanceof Date ? date : new Date(date)
    if (format === 'Y') return d.getFullYear().toString()
    return d.toISOString()
  })
}

/**
 * @param {import('nunjucks').Environment} env
 */
export function registerGlobals(env) {
  env.addGlobal('now', new Date())

  env.addGlobal('range', (start, end) => {
    if (end === undefined) {
      end = start
      start = 0
    }
    const result = []
    for (let i = start; i < end; i++) result.push(i)
    return result
  })
}
