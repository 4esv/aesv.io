# aesv.io

My personal site at [aesv.io](https://aesv.io). Monospace terminal aesthetic. Two columns on desktop, single column on mobile. Serves plain text to terminal clients (`curl aesv.io`).

Live data from Spotify, Strava, and Chess.com APIs, refreshed in the background. Built with Fastify, Nunjucks, and self-hosted Source Code Pro.

Want a blank version to start from? Check out the [`clean-template`](https://github.com/4esv/aesv.io/tree/clean-template) branch.

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
├── routes/
│   ├── pages.js           # Auto-discovers templates -> routes
│   └── api.js             # OAuth callbacks, GPG, data loader
├── services/
│   ├── spotify.js         # Spotify top tracks/artists
│   ├── strava.js          # Strava last activity
│   └── chess.js           # Chess.com last victory
├── lib/
│   ├── chess-renderer.js  # Unicode board renderer
│   └── template-helpers.js
├── middleware/grid.js     # Terminal client detection
├── static/
│   ├── css/style.css      # All styles
│   └── fonts/             # Self-hosted woff2
└── templates/
    ├── base.njk           # HTML shell
    ├── base-text.njk      # Plain text shell (curl)
    └── pages/home.njk     # The page
```

## Deploy

CI/CD via GitHub Actions: push to `main` builds a Docker image, pushes to GHCR, and deploys via SSH.

```
docker compose -f docker-compose.prod.yml up -d
```

Or run `npm start` behind a reverse proxy.

## License

MIT
