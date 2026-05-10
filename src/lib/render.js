// Single render path for every page route.
//
// Guarantees every view receives `site`, `route`, and `grid`, sets the
// terminal content-type when the request comes from curl/wget, and merges
// background-refreshed page data when the caller wants it. New routes
// should call this and not duplicate the boilerplate.

export function renderPage(fastify, request, reply, template, payload = {}) {
  const { grid } = request
  const { site: siteOverrides, withPageData = false, ...rest } = payload

  if (grid?.isTerminal) {
    reply.header('Content-Type', 'text/plain; charset=utf-8')
  }

  const site = siteOverrides ? { ...fastify.config.site, ...siteOverrides } : fastify.config.site
  const pageData = withPageData ? fastify.getPageData() : {}

  return reply.view(template, {
    site,
    route: request.url.split('?')[0],
    grid,
    ...pageData,
    ...rest,
  })
}
