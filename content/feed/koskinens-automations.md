---
title: Two pipelines for a towing company
date: 2025-11-09
slug: koskinens-automations
type: case-study
year: 2025
tag: Process automation · OCR
tags: [case-study, automation]
summary: A dispatcher and a bookkeeper, both retyping the same paperwork. Two pipelines that replace the human, not assist.
stack: n8n · Google Mail · Google Drive · Python · OCR · dispatch software API
impact: Boots dispatched in about an hour. Receipts done in twenty minutes a month.
---

<p>A small towing company runs on more paperwork than the trucks suggest. Boot removal orders show up by email and sit there until someone retypes them into the dispatch software. Hundreds of receipts a month, fuel and diesel treatment and tolls and shop supplies, get hand-keyed into a spreadsheet.</p>

<p>Two jobs, same constraint: no new vendor, no person doing the work. Each pipeline had to run unattended on infrastructure already in place and replace the human, not assist them.</p>

<p>The dispatch software is <a href="https://www.towbook.com/" target="_blank" rel="noopener">Towbook</a>, an ASP.NET web app with no published API for creating calls. There is, however, a JSON endpoint behind the call-creation form. A few minutes in the browser network tab gave me the shape: a single POST with the whole call as one payload<sup class="footnote-ref"><a id="fnref-towbook-endpoint" href="#fn-towbook-endpoint">1</a></sup>. n8n watches the Gmail inbox; when a boot order arrives, an OCR step pulls plate, make, model, color, location, and customer out of the email; an n8n code node turns those fields into the Towbook payload; an HTTP node POSTs it. Towbook takes integer IDs for color, reason, body type, and rate items, none of them documented, so the code node carries a small lookup table:</p>

```js
const COLOR_MAP = {
  black: { id: 1, name: 'Black' },
  gray: { id: 17, name: 'Gray' },
  grey: { id: 17, name: 'Gray' }, // OCR is bilingual
}
```

<p>The call appears in dispatch and the truck rolls. Boot orders that used to sit now turn around in about an hour, gated on driver availability rather than on data entry.</p>

<p>The receipts pipeline starts at intake. The friction was always the paper getting in, not the spreadsheet at the back. Google Drive's mobile app has a free quick-scan that turns a stack of receipts into a multi-page PDF. Once the PDF lands in a known folder, a server-side job splits the scan into one PDF per receipt, OCRs each page, classifies the vendor, and appends a row to the spreadsheet. The receipts come in mixed; the pipeline sorts the rows so nobody sorts the paper.</p>

<section class="figure">
  <h3 class="figure-title">Hours a week to minutes a month</h3>
  <div class="pictogram-pair">
    <div class="pictogram-card">
      <p class="pictogram-card-title">Before</p>
      <p class="pictogram-card-meta">manual entry</p>
      <p class="pictogram-readout"><span class="num bad">hours</span><span class="label">a week</span></p>
    </div>
    <div class="pictogram-card">
      <p class="pictogram-card-title">After</p>
      <p class="pictogram-card-meta">scan, split, classify</p>
      <p class="pictogram-readout"><span class="num good">20</span><span class="label">minutes a month</span></p>
    </div>
  </div>
  <p class="figure-note">After numbers are user-reported<sup class="footnote-ref"><a id="fnref-receipts" href="#fn-receipts">2</a></sup>, not instrumented.</p>
</section>

<p>The towing company's stack came out the other side looking exactly the same, just with fewer hours of human attention spent feeding it.</p>

<section class="footnotes">
  <ol class="footnotes-list">
    <li id="fn-towbook-endpoint" class="footnote-item">
      <p>The endpoint is <code>POST https://app.towbook.com/api/calls/?deleteMissingAssets=true</code>, JSON body containing the whole call (callType, reason, notes, towSource, waypoints, assets, contacts, attributes, invoiceItems). Captured by watching the network panel while creating a call by hand. <a href="#fnref-towbook-endpoint" class="footnote-backref">↩</a></p>
    </li>
    <li id="fn-receipts" class="footnote-item">
      <p>Turnaround and receipt-time figures come from the company's own report rather than instrumented logs. Treat as user-reported, not measured. <a href="#fnref-receipts" class="footnote-backref">↩</a></p>
    </li>
  </ol>
</section>
