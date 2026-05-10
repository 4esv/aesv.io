---
title: Access control, by gesture
date: 2023-09-01
slug: app-security
type: case-study
year: 2023
tag: RBAC · directory
tags: [case-study, internal-tools, identity]
summary: Granting access used to take days. A drag-and-drop tool got it to under a minute, two colleges, two years stable.
stack: Node.js · Express · MSSQL · Shibboleth · vanilla JS
impact: Days per ticket to under a minute. Two colleges, two years stable.
---

<p>A department head needs to grant a new admin access to one of about thirty internal apps. In the system she inherited, that means filing a ticket, waiting for a developer to RDP into a Windows box, edit a row in a spreadsheet kept beside a decade-old ColdFusion service<sup class="footnote-ref"><a id="fnref-cf" href="#fn-cf">1</a></sup>, click a button, then email back to confirm. Multiple business days, every time, for a single line of permission.</p>

<p>The original maintainer had retired. Nobody on the team could read the ColdFusion. Audits were answered by hand from screenshots and memory.</p>

<section class="figure">
  <h3 class="figure-title">Same task, two systems</h3>
  <svg viewBox="0 0 600 220" role="img" aria-label="Two horizontal bars compare the time to grant access. The top bar, labeled old workflow, stretches across most of the chart through six steps: ticket, email, RDP, edit spreadsheet, click confirm, reply. The bottom bar, labeled new workflow, is a tiny segment at the left covering one step: drag and drop." style="display:block;width:100%;height:auto;max-height:240px;background:var(--cream);border:var(--border-thin);">
    <text x="20" y="34" font-family="Menlo, monospace" font-size="12" fill="#1f1c19">old workflow</text>
    <rect x="20" y="46" width="555" height="34" fill="#b04632" stroke="#1f1c19" stroke-width="1.5"/>
    <line x1="112" y1="46" x2="112" y2="80" stroke="#1f1c19" stroke-width="1"/>
    <line x1="205" y1="46" x2="205" y2="80" stroke="#1f1c19" stroke-width="1"/>
    <line x1="297" y1="46" x2="297" y2="80" stroke="#1f1c19" stroke-width="1"/>
    <line x1="390" y1="46" x2="390" y2="80" stroke="#1f1c19" stroke-width="1"/>
    <line x1="482" y1="46" x2="482" y2="80" stroke="#1f1c19" stroke-width="1"/>
    <text x="66"  y="68" font-family="Menlo, monospace" font-size="11" fill="#fdf6e6" text-anchor="middle">ticket</text>
    <text x="158" y="68" font-family="Menlo, monospace" font-size="11" fill="#fdf6e6" text-anchor="middle">email</text>
    <text x="251" y="68" font-family="Menlo, monospace" font-size="11" fill="#fdf6e6" text-anchor="middle">rdp</text>
    <text x="343" y="68" font-family="Menlo, monospace" font-size="11" fill="#fdf6e6" text-anchor="middle">edit row</text>
    <text x="436" y="68" font-family="Menlo, monospace" font-size="11" fill="#fdf6e6" text-anchor="middle">confirm</text>
    <text x="528" y="68" font-family="Menlo, monospace" font-size="11" fill="#fdf6e6" text-anchor="middle">reply</text>
    <text x="20" y="100" font-family="Menlo, monospace" font-size="11" fill="#1f1c19">~ days</text>
    <text x="20" y="144" font-family="Menlo, monospace" font-size="12" fill="#1f1c19">new workflow</text>
    <rect x="20" y="156" width="42" height="34" fill="#7a8b6a" stroke="#1f1c19" stroke-width="1.5"/>
    <text x="41" y="178" font-family="Menlo, monospace" font-size="11" fill="#fdf6e6" text-anchor="middle">drop</text>
    <text x="70" y="178" font-family="Menlo, monospace" font-size="12" fill="#1f1c19">&lt; 1 minute</text>
  </svg>
  <p class="figure-note">Each segment in the top bar is a hand-off. The bottom bar is one person dragging a search result onto a role card.</p>
</section>

<p>The replacement is an Express service over the existing SQL tables, a vanilla-JS frontend, and Shibboleth at the Apache layer for identity. The whole UI is drag-and-drop: search a NetID, drop the result onto a role card, drop onto the trash icon to revoke. The schema stamps every grant with <code>added_by</code> and <code>added_on</code>, so the permission table doubles as the audit log. The next time the audit request landed, the answer was one query.</p>

<p>Two business years on, granting or revoking access is under a minute. The ColdFusion is retired. Other Node services in the same colleges resolve identity through this database. Same codebase, no rewrites, no pages<sup class="footnote-ref"><a id="fnref-stable" href="#fn-stable">2</a></sup>.</p>

<section class="footnotes">
  <ol class="footnotes-list">
    <li id="fn-cf" class="footnote-item">
      <p>The previous system was an Adobe ColdFusion application maintained by a developer who had retired before I joined. ColdFusion's last major release in the open is CF2023; the codebase in question predated it by roughly a decade. Replacement was a precondition for any new application that needed scoped permissions. <a href="#fnref-cf" class="footnote-backref">↩</a></p>
    </li>
    <li id="fn-stable" class="footnote-item">
      <p>"No pages" is an internal claim from on-call experience rather than a metric I can link out to. If you're reviewing this, ask and I'll walk through the deploy log. <a href="#fnref-stable" class="footnote-backref">↩</a></p>
    </li>
  </ol>
</section>
