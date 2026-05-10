# aesv.io: project notes

## Site-wide rules

These apply to every published page. The CLAUDE.md file itself follows them.

- **No em-dashes anywhere.** Period, colon, parens, or comma per sentence rhythm. If a sentence wants an em-dash, it usually wants a period or a colon instead.
- **No emoji in case studies.** Country-flag glyphs in `red-button-blue-button` country pictograms are tolerated as data-viz markers only.
- **No external concept-drops in case study prose.** Don't name "worse is better," "bus factor," "toil vs engineering," "Conway's law," "technical debt," or any other essay-flavored frame. Describe the situation. The reader names the principle if they have a name for it.
- **Footnotes serve claims, not counts.** A footnote belongs where a careful reader would squint. Never invented to fill a slot. A footnote either points at publicly available reference material (vendor docs, papers, open-source code, public posts) or the depth lives directly in the body. Private notes, internal docs, and private repos are never footnote targets, since the public reader can't open them.

## Site topology

Single site at `aesv.io`. No subdomains. Anything you find that suggests `work.aesv.io` or `grdn.aesv.io` is from a 2026-04 prototype that was abandoned; treat it as stale and remove it.

| URL                     | Source                                           | Template                         |
| ----------------------- | ------------------------------------------------ | -------------------------------- |
| `/`                     | `templates/pages/home.njk`                       | auto-discovered                  |
| `/work`                 | hire-me + case-study index                       | `templates/work/index.njk`       |
| `/work/<slug>`          | `content/feed/*.md` where `type: case-study`     | `templates/feed/entry.njk`       |
| `/feed`                 | `content/feed/*.md` excluding case studies       | `templates/feed/index.njk`       |
| `/feed/<slug>`          | same                                             | `templates/feed/entry.njk`       |
| `/feed.xml`             | RSS, essays only                                 | string-built in `routes/feed.js` |
| `/about`                | `content/about.md` + `templates/about/index.njk` | `routes/about.js`                |
| `/music`, `/activities` | hand-wired                                       | `templates/<name>/index.njk`     |

Two important non-obvious facts:

1. **One content tree feeds two URL surfaces.** `content/feed/*.md` is the single source of truth. `routes/work.js` and `routes/feed.js` both call `loadFeedEntries` (defined in `routes/feed.js`) and filter by `type: case-study`. Don't introduce a parallel `content/work/` or a second detail template. Case studies and essays render through `templates/feed/entry.njk` either way.
2. **`routes/pages.js` auto-mounts any `templates/pages/*.njk` at its filename.** Drop a template, get a route. No wiring. `404.njk` and `500.njk` are skipped (the error handler owns them).

Legacy 301 redirects in `routes/feed.js`: `/garden`, `/garden/<slug>`, `/files`, `/files/<slug>` → `/feed`.

## Adding a feed entry

Markdown files in `content/feed/` are surfaced at `/feed/<slug>` and in `/feed.xml`. Case studies (`type: case-study`) are excluded from `/feed` and `/feed.xml` and surface at `/work/<slug>` instead. Frontmatter fields:

- `title`, `date`, `slug`, `tags`, `summary`. Standard.
- `type: case-study`. Switches on the work-detail layout (`/css/work.css`, "← back to work" CTA, fact-row showing `impact` / `stack`).
- `repo: <url>`. Adds a "code on github" CTA in the page-head.
- `extra_css: [paths]` and `extra_js: [paths]`. Per-entry stylesheets and scripts loaded after the site defaults.

Markdown is parsed by `markdown-it` with `html: true`, so raw HTML in the body is passed through. **Watch for blank lines inside an HTML block.** markdown-it terminates the block on the blank line and treats the remainder as text/code. Strip blank lines from inside `<svg>...</svg>` and similar.

Two stylesheets are auto-loaded on every entry beyond `feed.css`: `work.css` and `case-study.css` (when `type: case-study`). The shared graphics primitives (figures, pictograms, sweeps, aphorisms, math-aside, footnote chrome) live in `case-study.css` so studies don't need to declare `extra_css` for the common kit. Reach for `extra_css`/`extra_js` only when the entry needs something genuinely bespoke (KaTeX, an interactive widget, a one-off palette).

Inline math (`\(...\)`, `\[...\]`) is not processed by `markdown-it-katex` when it sits inside raw HTML. The fix on `red-button-blue-button` is to load `/js/katex/katex.min.js` + `/js/katex/auto-render.min.js` via `extra_js` and call `renderMathInElement` from a small init script. Do the same for any other entry that needs it.

## Design tokens

`src/static/css/foundation.css` is the single source of truth. There is one scale, not two. If a value isn't in this list, it shouldn't be in the codebase.

- **Color**: `--ink`, `--ink-mute`, `--cream`, `--cream-deep`, `--paper`, `--offwhite`, `--lavender` (the only accent; one element per screen wears it), `--terracotta`, `--brick`, `--ochre`, `--sage`, `--white`. Aliases: `--bg`, `--fg`, `--fg-mute`, `--accent`, `--accent-fg`, `--border`.
- **Type**: `--font-display`, `--font-body` (both Birdie), `--font-mono`. Sizes: `--fs-marquee`, `--fs-hero`, `--fs-h1`..`--fs-h3`, `--fs-body`, `--fs-small`, `--fs-eyebrow`, `--fs-tile`. Line-height: `--lh-display`, `--lh-tight`, `--lh-body`. Tracking: `--tracking-eyebrow`, `--tracking-display`.
- **Space**: `--s-1`..`--s-12` (8 / 16 / 24 / 32 / 48 / 64 / 96).
- **Border + shadow**: `--border-thin`, `--border-thick`; `--shadow-sm`/`--shadow-md`/`--shadow-lg`/`--shadow-xl`/`--shadow-pressed`.
- **Reading width**: `--reading-narrow`, `--reading-default`, `--reading-wide`.
- **Shell**: `--shell-max`, `--shell-pad-x`, `--shell-pad-y`. Every cream-paper subpage is wrapped in `.subpage`, which uses these.
- **Riso paper grain**: `--riso` (intensity 0..1; set to 0 per-page when texture would fight content), `--riso-misreg` (px).
- **Press anim**: `--ease-press`, `--dur-press`, `--dur-wiggle`.

Active responsive tiers (raw pixels in `@media`, since `@media` can't read `var()`):

- `≤280px` (wrist): riso off, shadows shrunk
- `<360px` (watch): single column, ≥44px taps, no big footer
- `360–639px` (phone): base mobile
- default: laptop / desk
- `1600–2559px`: shell grows, type creeps up
- `≥2560px` (TV / billboard): read-from-across-the-room

## Article voice: `red-button-blue-button` and similar think pieces

These notes cover entries written in the "casual research paper / over-engineered social media post" mode. Smart-friend voice, plain English first then formalize, no posturing. Math is a bonus for the curious, not a crutch the prose leans on.

### Visual preferences

- The inline red/blue button pictograms (`<span class="btn-inline red"></span>` and `.blue` variants) are punctuation, not refrain. Two or three appearances across an essay reads sharp; one in every paragraph reads as a tic.
- Use a colon when you're showing something visually next (a chart, a poll, a pictogram). Use a period when you're stating something. "Tim's poll, final results:" leads into the bars; "Three thresholds, three readings." stands on its own.

### Citations and fact-checkability

- Articles are built to be fact-checkable, not just fact-checked. Every empirical claim has an inline footnote marker linking to its primary source.
- Use proper footnote markers (`<sup class="footnote-ref">`), not bracketed `[Author Year]` cites in prose. The footnote entries themselves carry the source link.
- Don't double-cite. If a source is already linked in the surrounding context (e.g. the tweet card has a "view on x.com" link), don't add another reference to it in the next paragraph. Same applies to the `repo` page-head CTA. Don't end the article with another github link.
- Plain-English claim in the body; formula in a `.math-aside` sidenote that opens with a nonchalant "Formally put, …". No all-caps "FOR THE CURIOUS" labels.

### Numbers come from the actual sim

- For the red-blue article, the country pictogram counts (Colombia 2, Mexico 2, France 2, USA 4, Sweden 23, Denmark 42) match what the simulation in [`4esv/red-blue-buttons`](https://github.com/4esv/red-blue-buttons) returns at `a=0.28`, `concentration=7`, `error_rate=0.02`, `lambda=1`. If the model parameters change, regenerate these numbers rather than estimating.

### Visual patterns to avoid

- Do not use the "ALL CAPS · DOT-SPLIT · FADED MONO TEXT" pattern for figure captions, section labels, kickers, or anything else. Plain sentence-case body or heading text is the right default. The same goes for any uppercase letter-spaced grey-mono treatment, even with different separators.

### Prose patterns to avoid

- Trim unsure tutorial-script chatter. Lines like "Clone it and run the sweep yourself with `python -m ...`", "The case for each side breaks down like this:", "What I wanted to know is …", or "the empirical section asks who clears either bar" all signpost or invite the reader to do something. Cut them.
- Don't paraphrase quoted source text. If you're quoting a tweet or paper, use the exact wording.
- Two-to-five sentences per paragraph is a _guide_, not a rule. Breaking it for clarity is fine. What is not fine is super short lonely lines as paragraphs of their own. Merge them into the surrounding paragraph instead.

## Case studies: graphic + prose patterns

Case studies (`type: case-study`) live in `content/feed/` alongside think pieces. They share the same voice and chrome as `red-button-blue-button`: smart-friend prose, claims followed by evidence, footnoted facts, hand-built figures inline. The job of a case study is to be **fun to read and finish**, not to inventory tasks completed. Lead with the situation, show the ugly real-world constraint, then the move, then the receipt.

### Structure that works

- Open with the _human_ problem in one sentence (who, what they were stuck doing). Not the stack, not the title.
- Hit the constraint that made the obvious solution impossible (no new vendor, undocumented API, ancient runtime, no staging).
- Show the move. One or two well-chosen code blocks beat ten paragraphs of explanation. Code should be the _interesting_ line, not the boilerplate.
- Land on the receipt: a number, a duration, a person's reaction, a system that has not paged anyone in two years. Same shape as the `impact:` frontmatter line, but earned by the body.
- Footnote any number that would make a careful reader squint (fleet sizes, time savings, dataset shapes, vendor specifics) only when the source is publicly linkable. If the only source is internal, either earn the depth in the body or drop the precision; never gesture at a private artifact the reader can't open.

### Five-audience layering checklist

Every case study must clear all five readers without a separate path for each:

- **Worried coworker.** No exposed identifiers (no NetIDs, no internal acronyms uncashed, no team names that mean nothing outside the institution). Read once with redaction in mind.
- **Tired recruiter.** Title, first paragraph, last paragraph. The story arrives without a full read.
- **Family member.** Paragraph one paints a room they can picture. Plain English, no jargon yet.
- **Tech founder.** The middle has one specific decision with the why-this-not-that exposed.
- **Non-technical HR or business owner.** The receipt is a number that reads as value without a glossary.

### Summary line as work-index card

The summary line in frontmatter is the only sentence every audience reads on the work-index page. Write it like a recruiter is skimming a hundred cards.

- State the human problem and the receipt.
- No dinner-party jokes.
- No "I" first-person opening.
- No marketing adjectives.

### Factoid-drop rule

A stat list (legend, pictogram-grid breakdown, "X · 17 / Y · 16") is allowed only when every named entity is globally legible without explanation. "CHE Registrar · 17 / Brooks Registrar · 16 / Central HR · 5" fails: non-Cornell readers don't know who any of those are or why the count matters. "Petitions · 33 / Hires · 12 / Course changes · 5" passes: process names are universal. The same rule applies to vendor lists, internal team names, and acronym chains. If the legend has to teach the reader the institution's org chart, the graphic is wrong.

### Graphics inventory

Every study earns at least one bespoke inline graphic. Use the shared primitives in `case-study.css`:

- `figure` + `figure-title` + `figure-note`. Cartoon-card chrome around inline SVG schematics, before/after pictograms, fleet counts. Caption goes in `figure-note`; period-terminated, sentence case.
- `pictogram-card` (+ `pictogram-pair` or `pictogram-grid-3`). Small stat tiles. `.pictogram-readout .num.good` (sage) for wins, `.num.bad` (brick) for losses. Use a `unit-grid` of `unit-pict` dots inside when you want the dictogram-of-N treatment that `red-button-blue-button` uses for buttons.
- `sweep`. Wide rectangular figure with an inline SVG plot inside. Good for fleet-growth curves, time-collapse charts, distribution-across-units bars. Caption underneath via `sweep-legend`.
- `aphorism`. Single-sentence pull-out, used at most twice per study, for the line you want the reader to remember.
- `math-aside`. Only if the study has a small derivation worth showing (rate calculations, queue depth, error budgets). Opens with "Formally put, …".

Inline SVGs should use `viewBox`, mono labels via `font-family="Menlo, monospace"`, and the design tokens (`--ink`, `--brick`, `--lavender`, `--sage`, `--cream`) for fills. Keep them under ~260px tall so they sit in the reading column without overwhelming it. Always include a meaningful `role="img"` + `aria-label` describing what the chart shows.

### Footnote chrome

Use the same raw-HTML pattern as `red-button-blue-button` so the markers render with our chrome and don't fight `markdown-it-footnote`'s ordering when the body is mostly HTML:

```html
<sup class="footnote-ref"><a id="fnref-snipe" href="#fn-snipe">1</a></sup>
…
<section class="footnotes">
  <ol class="footnotes-list">
    <li id="fn-snipe" class="footnote-item">
      <p>Snipe-IT REST API docs … <a href="#fnref-snipe" class="footnote-backref">↩</a></p>
    </li>
  </ol>
</section>
```

IDs are slug-shaped (`fn-snipe`, `fn-jamf`) not numeric, so reordering the body doesn't shift the references. When splitting a piece, re-ID per file: anchor and target slugs collide otherwise.

### Numbers must come from the source

The same rule the red-blue note pins: never estimate a number that the source can give you. Fleet sizes come from the actual export; time-savings come from the user's own report; form counts come from the scope letter. If a number is approximate, say "about". Don't over-precise. If the only place the number lives is private, either earn the depth in the body or drop the precision. Do not footnote a private artifact.

### Voice: case-study specific

- The reader is hiring you. Show range, not bravado. The line "I read theirs and ported the signing flow" is better than "I architected a polyglot HMAC pipeline".
- Don't bury the user. Name the person or the office that benefited if you can do so without leaking PII (titles + departments are usually fine; first names only when they're already public-facing).
- Avoid résumé-bullet syntax ("Designed and implemented …", "Spearheaded …"). Whole sentences only.
- The `impact:` line in frontmatter is a punchline, not a paragraph. Two clauses, no marketing adjectives.
- Direct openings only. Never "Let me", "Great question", "I'd be happy to", "It's important to note", "In today's world", "At the end of the day".
- Never sign off. No "Cheers", no "Hope this helps". A piece ends when the last sentence ends.

## Branch hygiene

The site lives on `main`. Substantial redesigns happen on a single feature branch and merge whole. A few rules that prevent the kind of half-merged state this branch was rescued from:

- **Routes ship in one piece.** Adding a route means adding its template, its CSS, its JS, and its content tree (if any) in the same commit. Removing a route means deleting all four. Don't leave a CSS file that mentions a route the code no longer serves.
- **One direction at a time.** If you rename `/foo` to `/bar`, do the rename and the redirect in one commit. Don't leave both directories on disk.
- **Untracked is a question, not a state.** A file that's been sitting untracked in `git status` for more than a session needs a decision: commit, gitignore, or delete.
- **Run `npm run check` before committing.** Lint + format-check + tests. The whole bar is fast.
- **Sandboxes go in `.gitignore`, not `templates/pages/`.** Anything in `templates/pages/` auto-mounts at its filename in production. The `/lab` tile-animation playground is gitignored for exactly this reason.
