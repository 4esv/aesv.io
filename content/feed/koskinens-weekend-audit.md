---
title: A weekend in place of a quarter
date: 2025-04-15
slug: koskinens-weekend-audit
type: case-study
year: 2025
tag: Process automation · Scraping
tags: [case-study, automation, scraping]
summary: Three years of dispatch records from a portal that shows them one click at a time. The receipt was a CSV by Monday.
stack: Python · requests · throttled HTTP · session cookies · progress checkpointing
impact: Three years of records pulled in a weekend. CSV on the auditor's desk Monday morning.
---

<p>An audit asked a small towing company for three years of dispatch records out of a national billing portal. The portal is the kind of system where every detail page is its own request and every request stares at you for five seconds before the data arrives. Twenty-eight thousand records, one at a time, through a UI<sup class="footnote-ref"><a id="fnref-records" href="#fn-records">1</a></sup>. That is weeks of full-time clicking, and the audit window did not have weeks.</p>

<p>The portal's UI is a thin wrapper around two JSON endpoints. Open the network tab, click around for a minute, and the URLs reveal themselves:</p>

```
POST /D3Dispatch/orange/calls/datatable/filtered     # listing, paged
GET  /D3Dispatch/orange/mcd/load/full/{call_info}/…  # one call, full detail
```

<p>From there it is a Python script with the session cookies, a loop over months, a loop over pages of the listing, a loop over the per-call detail endpoint, and a half-second sleep between detail fetches with a ten-second backoff on a 429<sup class="footnote-ref"><a id="fnref-throttle" href="#fn-throttle">2</a></sup>. A progress file on disk so a crash does not cost the run.</p>

<figure class="sweep">
  <p class="sweep-title">Three years of records, two ways</p>
  <svg class="sweep-svg" viewBox="0 0 600 200" role="img" aria-label="Two horizontal bars compared at the same scale. The top bar represents clicking through the UI at five seconds per record for 28000 records and stretches almost the full width of the chart, labeled 39 hours of pure load time. The bottom bar represents the throttled script at half a second per record and is roughly a tenth of the width, labeled 3.9 hours of HTTP plus a weekend wall clock.">
    <rect x="40" y="30" width="520" height="140" fill="#fdf6e6" stroke="#1f1c19" stroke-width="1.5"/>
    <text x="50" y="56" font-family="Menlo, monospace" font-size="12" fill="#1f1c19">click through the UI</text>
    <rect x="50" y="64" width="500" height="22" fill="#b04632" stroke="#1f1c19" stroke-width="1.2"/>
    <text x="556" y="80" font-family="Menlo, monospace" font-size="11" fill="#1f1c19" text-anchor="end">~39 h of just spinners</text>
    <text x="50" y="120" font-family="Menlo, monospace" font-size="12" fill="#1f1c19">throttled script</text>
    <rect x="50" y="128" width="50" height="22" fill="#7a8d6a" stroke="#1f1c19" stroke-width="1.2"/>
    <text x="106" y="144" font-family="Menlo, monospace" font-size="11" fill="#1f1c19" text-anchor="start">~3.9 h of HTTP, ran over a weekend</text>
    <text x="40" y="190" font-family="Menlo, monospace" font-size="11" fill="#1f1c19" text-anchor="start">28,000 detail fetches</text>
    <text x="560" y="190" font-family="Menlo, monospace" font-size="11" fill="#1f1c19" text-anchor="end">scale: 1 second per pixel</text>
  </svg>
  <div class="sweep-legend">
    <span><span class="swatch" style="background:#b04632"></span>UI at 5 s/record</span>
    <span><span class="swatch" style="background:#7a8d6a"></span>script at 0.5 s/record</span>
  </div>
  <p class="figure-note">Bars are drawn to the same time scale. The UI bar is pure spinner time and ignores the clicks, copy-pastes, and tab-switches that go between each load. The script bar is the lower bound on HTTP at the throttle the script actually used.</p>
</figure>

<p>Started Friday night, done by Monday. The full date range was on the auditor's desk in a CSV they could open in Excel.</p>

<section class="footnotes">
  <ol class="footnotes-list">
    <li id="fn-records" class="footnote-item">
      <p>Thirty-four monthly CSVs covering Q2 2022 through Q1 2025, totalling 28,158 lines minus 34 headers, so 28,124 records. The five-second-per-page figure is the wall-clock load time on the portal's detail view as observed during manual use; the listing endpoint is faster. <a href="#fnref-records" class="footnote-backref">↩</a></p>
    </li>
    <li id="fn-throttle" class="footnote-item">
      <p>The detail-fetch loop sleeps 0.5 s between requests and backs off 10 s on a 429 response, with progress checkpointed to <code>enrichment_progress.json</code> after each successful enrichment so a crash or restart resumes mid-stream rather than from the top. <a href="#fnref-throttle" class="footnote-backref">↩</a></p>
    </li>
  </ol>
</section>
