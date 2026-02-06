// src/grid/layout.js
// Layout allocation for grid-based rendering

/**
 * @typedef {Object} Region
 * @property {number} x - Column offset
 * @property {number} y - Row offset
 * @property {number} width - Width in columns
 * @property {number} height - Height in rows
 */

/**
 * @typedef {Object} LayoutConfig
 * @property {'ultra-narrow'|'compact'|'standard'|'wide'} breakpoint
 * @property {number} cols
 * @property {number} rows
 * @property {boolean} hasBorders
 * @property {boolean} hasNav
 * @property {boolean} hasFooter
 * @property {number} columns - Number of content columns (1 or 2)
 */

// Breakpoint thresholds
const BREAKPOINTS = {
  ultraNarrow: 40, // cols < 40
  compact: 80, // cols 40-79
  standard: 120, // cols 80-119
  // wide: cols >= 120
}

/**
 * Determine layout configuration from grid dimensions
 * @param {number} cols - Available columns
 * @param {number} rows - Available rows
 * @returns {LayoutConfig}
 */
export function getLayoutConfig(cols, rows) {
  let breakpoint
  let hasBorders = true
  let columns = 1

  if (cols < BREAKPOINTS.ultraNarrow) {
    breakpoint = 'ultra-narrow'
    hasBorders = false
  } else if (cols < BREAKPOINTS.compact) {
    breakpoint = 'compact'
  } else if (cols < BREAKPOINTS.standard) {
    breakpoint = 'standard'
  } else {
    breakpoint = 'wide'
    columns = 2
  }

  return {
    breakpoint,
    cols,
    rows,
    hasBorders,
    hasNav: rows >= 6,
    hasFooter: rows >= 10,
    columns,
  }
}

/**
 * Calculate content region after accounting for chrome (nav, footer, borders)
 * @param {LayoutConfig} config - Layout configuration
 * @returns {Region}
 */
export function getContentRegion(config) {
  const { cols, rows, hasBorders, hasNav, hasFooter } = config

  let x = 0
  let y = 0
  let width = cols
  let height = rows

  // Account for nav (1 row)
  if (hasNav) {
    y += 1
    height -= 1
  }

  // Account for footer (1 row)
  if (hasFooter) {
    height -= 1
  }

  // Account for borders (2 cols, 2 rows)
  if (hasBorders) {
    x += 1
    y += 1
    width -= 2
    height -= 2
  }

  return { x, y, width: Math.max(1, width), height: Math.max(1, height) }
}

/**
 * Split a region into two columns
 * @param {Region} region - Region to split
 * @param {number} gap - Gap between columns
 * @returns {{left: Region, right: Region}}
 */
export function splitColumns(region, gap = 2) {
  const availableWidth = region.width - gap
  const leftWidth = Math.floor(availableWidth / 2)
  const rightWidth = availableWidth - leftWidth

  return {
    left: {
      x: region.x,
      y: region.y,
      width: leftWidth,
      height: region.height,
    },
    right: {
      x: region.x + leftWidth + gap,
      y: region.y,
      width: rightWidth,
      height: region.height,
    },
  }
}

/**
 * Split a region into rows
 * @param {Region} region - Region to split
 * @param {number[]} heights - Height of each row (use -1 for flex)
 * @returns {Region[]}
 */
export function splitRows(region, heights) {
  const fixedHeight = heights.filter((h) => h > 0).reduce((a, b) => a + b, 0)
  const flexCount = heights.filter((h) => h < 0).length
  const flexHeight = flexCount > 0 ? Math.floor((region.height - fixedHeight) / flexCount) : 0

  const regions = []
  let currentY = region.y

  for (const h of heights) {
    const rowHeight = h < 0 ? flexHeight : h
    regions.push({
      x: region.x,
      y: currentY,
      width: region.width,
      height: Math.max(0, rowHeight),
    })
    currentY += rowHeight
  }

  return regions
}

/**
 * Create a sub-region within a parent region
 * @param {Region} parent - Parent region
 * @param {number} x - X offset within parent
 * @param {number} y - Y offset within parent
 * @param {number} width - Width (or -1 for remaining)
 * @param {number} height - Height (or -1 for remaining)
 * @returns {Region}
 */
export function subRegion(parent, x, y, width, height) {
  return {
    x: parent.x + x,
    y: parent.y + y,
    width: width < 0 ? parent.width - x : Math.min(width, parent.width - x),
    height: height < 0 ? parent.height - y : Math.min(height, parent.height - y),
  }
}

/**
 * Pad a region by shrinking it from all sides
 * @param {Region} region - Region to pad
 * @param {number} padding - Padding amount
 * @returns {Region}
 */
export function padRegion(region, padding) {
  return {
    x: region.x + padding,
    y: region.y + padding,
    width: Math.max(0, region.width - padding * 2),
    height: Math.max(0, region.height - padding * 2),
  }
}

/**
 * Calculate widget regions for homepage layout
 * @param {LayoutConfig} config - Layout configuration
 * @returns {{spotify: Region, strava: Region, github: Region}}
 */
export function getWidgetRegions(config) {
  const content = getContentRegion(config)

  if (config.columns === 2) {
    // Wide layout: two columns
    const { left, right } = splitColumns(content)

    // Left column: spotify at top
    // Right column: strava, github stacked
    const [stravaRegion, githubRegion] = splitRows(right, [-1, -1])

    return {
      spotify: left,
      strava: stravaRegion,
      github: githubRegion,
    }
  }

  // Single column: stack vertically
  const [spotifyRegion, stravaRegion, githubRegion] = splitRows(content, [-1, -1, -1])

  return {
    spotify: spotifyRegion,
    strava: stravaRegion,
    github: githubRegion,
  }
}
