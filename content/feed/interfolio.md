---
title: Building a Tenure-Dossier Pipeline
date: 2024-08-01
slug: interfolio
type: case-study
year: 2024
tag: Faculty workflow
tags: [case-study, full-stack, integration]
summary: Tenure dossiers used to eat months of manual PDF assembly. A two-language pipeline does it in five minutes.
stack: Node.js · Express · React · Python · BullMQ · Redis · pypdf · Interfolio API · Shibboleth · systemd
impact: Months → 5 minutes per packet.
---

<p>Tenure cases at Cornell live or die by a single PDF. Dozens of letters, evaluations, syllabi, and statements, each pulled from a separate place, each routed to its own numbered slot in a hierarchy the college committee expects to see exactly so. An administrative assistant in Nutritional Sciences once told me a packet "typically ate months" of careful work: download, classify, watermark, merge, repeat, then re-do the parts that came back wrong.</p>

<p>The brief was a web app where a staff member picks a candidate and gets a finished, bookmarked PDF on the other side. The shape of the problem turned out to be less about PDFs and more about two stubborn integrations on the way in.</p>

<p>The first was the Interfolio side. Their public API uses HMAC-SHA1 request signing<sup class="footnote-ref"><a id="fnref-hmac" href="#fn-hmac">1</a></sup>, and there is no Node library that speaks the dialect they want. A neighboring college had a Python desktop app that already handled the auth, so I read theirs and ported the signing flow into Node:</p>

```js
function generateHMACHeader(privateKey, publicKey, timestamp, requestString, requestVerb) {
  const verbRequestString = `${requestVerb}\n\n${timestamp}\n${requestString}`
  const signedHash = crypto.createHmac('sha1', privateKey).update(verbRequestString, 'utf8')
  return `INTF ${publicKey}:${signedHash.digest().toString('base64')}`
}
```

<p>The two blank lines between the verb and the timestamp are not optional. Get them wrong and every request comes back with a polite 401 that does not tell you why.</p>

<p>The second integration was on the way out. Node's PDF tooling has a long-running gap: the libraries that merge cleanly do not preserve a hierarchical outline, and the libraries that write outlines do not merge cleanly. Python's <code>pypdf</code> exposes both, so Python stayed and became the worker. A staff member clicks build; the Node API validates the candidate's packet and pushes a job onto a Redis queue; a Python worker pops it, downloads each file from Interfolio with the same HMAC headers, and writes one merged-and-bookmarked PDF.</p>

<section class="figure">
  <div class="pictogram-pair">
    <div class="pictogram-card">
      <p class="pictogram-card-title">By hand</p>
      <p class="pictogram-card-meta">download · sort · watermark · merge · re-run</p>
      <p class="pictogram-readout"><span class="num bad">~weeks</span><span class="label">per packet</span></p>
    </div>
    <div class="pictogram-card">
      <p class="pictogram-card-title">One click</p>
      <p class="pictogram-card-meta">pick candidate · build · download</p>
      <p class="pictogram-readout"><span class="num good">~5 min</span><span class="label">per packet</span></p>
    </div>
  </div>
</section>

<p>The first time the assistant in Nutritional Sciences ran a real packet end-to-end, the build came back in roughly the time it takes to refill a coffee. What used to eat a full FTE-week per cycle now runs in about five minutes<sup class="footnote-ref"><a id="fnref-time" href="#fn-time">2</a></sup>, and has been doing so without paging anyone for over a year.</p>

<section class="footnotes">
  <ol class="footnotes-list">
    <li id="fn-hmac" class="footnote-item">
      <p>Interfolio's developer documentation specifies HMAC-SHA1 over a canonical request string of <code>VERB\n\n\nTIMESTAMP\nPATH</code>, base64-encoded, with the <code>INTF publicKey:digest</code> envelope. The two empty lines after the verb are part of the spec; an unused header slot from an earlier version of the protocol. <a href="#fnref-hmac" class="footnote-backref">↩</a></p>
    </li>
    <li id="fn-time" class="footnote-item">
      <p>The "FTE-week per cycle" figure is the assistant's own estimate of total staff time previously spent assembling and re-assembling a single packet across one review cycle, not a stopwatch number. The "about five minutes" figure is the typical wall-clock from clicking build to a finished PDF, dominated by sequential downloads from Interfolio for packets in the 30-to-60-file range. <a href="#fnref-time" class="footnote-backref">↩</a></p>
    </li>
  </ol>
</section>
