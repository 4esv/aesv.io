# mono

A single-page personal site. Monospace. Two columns on desktop, one on mobile. Serves plain text to terminal clients.

Built with [Fastify](https://fastify.dev) and [Nunjucks](https://mozilla.github.io/nunjucks/). Self-hosted [Source Code Pro](https://github.com/adobe-fonts/source-code-pro). Lighthouse 100.

## Run

```
cp .env.example .env
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000), or `curl localhost:3000`.

## Structure

```
src/
├── server.js              # Fastify app
├── config.js              # Environment config
├── routes/pages.js        # Auto-discovers templates → routes
├── middleware/grid.js      # Terminal client detection
├── errors/handler.js       # 404 / 500
├── lib/template-helpers.js # Nunjucks filters
├── grid/                  # Layout math, text utilities, borders
├── static/
│   ├── css/style.css      # All styles
│   └── fonts/             # Self-hosted woff2
└── templates/
    ├── base.njk           # HTML shell
    ├── base-text.njk      # Plain text shell (curl)
    └── pages/home.njk     # The page
```

## Make it yours

- **Content**: Edit `src/templates/pages/home.njk`. Add `<section>` blocks. The sidebar and footer are in `src/templates/partials/grid/`.
- **Identity**: Set `SITE_NAME` and `SITE_TAGLINE` in `.env`, or edit the defaults in `src/config.js`.
- **Sections**: Add nav links in the sidebar partial. Add matching `<section id="...">` blocks in the home template.
- **Style**: Colors live in CSS custom properties at the top of `style.css`. The font is in `src/static/fonts/`.

New `.njk` files in `src/templates/pages/` automatically become routes.

## Deploy

```
docker compose up -d
```

Or run `npm start` behind a reverse proxy.

## License

MIT
