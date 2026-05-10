---
title: A 1,300-device fleet on no budget
date: 2024-06-01
slug: endpoint-automation
type: case-study
year: 2024
tag: PowerShell · Python · MDM
tags: [case-study, automation, mdm]
summary: Fleet ops without a budget. Discovery grew 300 to 1,300 devices and classroom builds dropped from 40 minutes to four.
stack: PowerShell · Snipe-IT API · Jamf Pro API · Active Directory · Group Policy · DeepFreeze · cron
impact: 300 → 1,300+ devices accurately tracked. 40 min → 4 min per classroom build.
---

<p>The college's asset database said 300 computers. There were closer to 1,300. The other thousand were sitting on desks and under monitors, working fine, and entirely unknown to the system that was supposed to know about them<sup class="footnote-ref"><a id="fnref-fleet" href="#fn-fleet">1</a></sup>. Confirming the rest meant walking rooms and reading service tags off the back of monitors.</p>

<p>Alongside that, every classroom PC connected to AV had to be rebuilt by hand after imaging. Registry tweaks, MSI installs, taskbar pins, Zoom policy, then DeepFreeze<sup class="footnote-ref"><a id="fnref-deepfreeze" href="#fn-deepfreeze">2</a></sup> to lock the image. Forty minutes of clicking, forty-plus times a semester, and at least one missed step in most cycles.</p>

<p>Both jobs landed on me with the same constraint: no new vendor, no new licenses. Whatever shipped had to run on tools the college already owned. PowerShell on every Windows box, Python and cron on a server, and the two MDM consoles already in use<sup class="footnote-ref"><a id="fnref-snipe" href="#fn-snipe">3</a></sup>.</p>

<p>The Windows side moved first. Every domain machine had to sign in to be useful, and a sign-in is a perfect cron tick. A PowerShell script deployed via Group Policy runs on logon, gathers IP, MAC, model, serial, and asset tag from the local box, then walks the Snipe-IT REST API toward whatever the database thinks is true. The interesting line is the dispatch, a small ordered state machine that puts the abort conditions first and the corrective work after:</p>

```powershell
if (!$snipeAsset)                { CreateAsset }
elseif ((Discrepancy))           { PatchAsset }
elseif ($computer.special)       { PatchAsset }
elseif ((AssignmentDiscrepancy)) { CheckoutAsset }
else                             { AuditAsset }
```

<p>Each branch is the smallest API call that moves the row toward correctness. A healthy machine costs one request, not five. The remaining 400 devices were Apple, sitting in Jamf, the MDM the rest of the IT org was already using. A nightly cron job reads from Jamf and writes to Snipe with a retry/throttle/token-refresh loop, falling back to a generic category for hardware models nobody has catalogued yet so a fresh Mac Studio revision does not break the run.</p>

<section class="figure">
  <h3 class="figure-title">Where the 1,300 came from</h3>
  <svg class="sweep-svg" viewBox="0 0 600 140" role="img" aria-label="A horizontal stacked bar chart of fleet coverage. A baseline brick segment of 300 devices represents what was already in Snipe-IT. A lavender segment adds 600 more for a total of 900 after the Windows sign-on script. A sage segment adds 400 more for a total of 1,300 after the Jamf sync.">
    <rect x="20" y="20" width="560" height="40" fill="#fdf6e6" stroke="#1f1c19" stroke-width="1.5"/>
    <rect x="20" y="20" width="129" height="40" fill="#b04632"/>
    <rect x="149" y="20" width="259" height="40" fill="#a8b3d8"/>
    <rect x="408" y="20" width="172" height="40" fill="#8aa07a"/>
    <line x1="149" y1="14" x2="149" y2="66" stroke="#1f1c19" stroke-width="1"/>
    <line x1="408" y1="14" x2="408" y2="66" stroke="#1f1c19" stroke-width="1"/>
    <line x1="580" y1="14" x2="580" y2="66" stroke="#1f1c19" stroke-width="1"/>
    <text x="84" y="44" font-family="Menlo, monospace" font-size="13" fill="#fdf6e6" text-anchor="middle" font-weight="bold">300</text>
    <text x="278" y="44" font-family="Menlo, monospace" font-size="13" fill="#1f1c19" text-anchor="middle" font-weight="bold">+600</text>
    <text x="494" y="44" font-family="Menlo, monospace" font-size="13" fill="#1f1c19" text-anchor="middle" font-weight="bold">+400</text>
    <text x="20" y="86" font-family="Menlo, monospace" font-size="11" fill="#1f1c19" text-anchor="start">0</text>
    <text x="149" y="86" font-family="Menlo, monospace" font-size="11" fill="#1f1c19" text-anchor="middle">300</text>
    <text x="408" y="86" font-family="Menlo, monospace" font-size="11" fill="#1f1c19" text-anchor="middle">900</text>
    <text x="580" y="86" font-family="Menlo, monospace" font-size="11" fill="#1f1c19" text-anchor="end">1,300+</text>
    <text x="84" y="110" font-family="Menlo, monospace" font-size="10" fill="#5a554d" text-anchor="middle">already in Snipe</text>
    <text x="278" y="110" font-family="Menlo, monospace" font-size="10" fill="#5a554d" text-anchor="middle">Windows sign-on script</text>
    <text x="494" y="110" font-family="Menlo, monospace" font-size="10" fill="#5a554d" text-anchor="middle">Jamf nightly sync</text>
  </svg>
</section>

<p>The classroom side was a different shape of tedious. Each new AV-PC build needed the same five things in the same order, most of them with a CLI for it. One PowerShell script per machine collapses the checklist into a sequence with error checks between every stage. The hard part was not the registry edits or the MSIs, both of which take silent flags and behave. It was the small group of installers that ignore <code>/quiet</code> and sit on a modal dialog waiting for a human to click Next. Instead of pulling in a UI-automation framework for three stubborn vendors, I drove their dialogs the way a person would: tab, shift-tab, and enter keystrokes paced with sleeps long enough to outlast the slowest disk on the fleet. The whole sequence is idempotent, so re-running it on a half-built machine resumes from wherever the previous run left off.</p>

<p>One college's IT team can now identify, image, audit, and lock its Windows and Mac fleet without anyone touching a spreadsheet. Imaging a classroom went from a Saturday afternoon to the time it takes to walk to the next room. The system has run for two years without an outage that required a human to restart it<sup class="footnote-ref"><a id="fnref-uptime" href="#fn-uptime">4</a></sup>. The director who asked for "any way to get the database closer to reality" got a database that <em>is</em> reality, refreshed every night.</p>

<section class="footnotes">
  <ol class="footnotes-list">
    <li id="fn-fleet" class="footnote-item">
      <p>The 300 and 1,300+ figures are from internal Snipe-IT exports at the start of the project and after both syncs were running steady-state, respectively. The earlier number is what was reachable from the asset list view; some additional rows existed in archived/deleted state and are not included in either count. <a href="#fnref-fleet" class="footnote-backref">↩</a></p>
    </li>
    <li id="fn-deepfreeze" class="footnote-item">
      <p>Faronics Deep Freeze, the image-lock product the college standardized on for shared classroom machines. It reverts the disk to a saved state on every reboot, which is why the build script has to run end-to-end <em>before</em> Deep Freeze gets armed. <a href="https://www.faronics.com/products/deep-freeze" target="_blank" rel="noopener">faronics.com/products/deep-freeze</a>. <a href="#fnref-deepfreeze" class="footnote-backref">↩</a></p>
    </li>
    <li id="fn-snipe" class="footnote-item">
      <p>Snipe-IT is the open-source asset management tool the college had already deployed; the integration uses its REST API. <a href="https://snipe-it.readme.io/reference" target="_blank" rel="noopener">snipe-it.readme.io/reference</a>. The Jamf Pro Classic API is documented at <a href="https://developer.jamf.com/jamf-pro/reference/classic-api" target="_blank" rel="noopener">developer.jamf.com/jamf-pro/reference/classic-api</a>. <a href="#fnref-snipe" class="footnote-backref">↩</a></p>
    </li>
    <li id="fn-uptime" class="footnote-item">
      <p>Internal claim: across roughly two years of nightly runs and per-logon executions, no recovery has required restarting either script by hand. Transient API errors are absorbed by the retry/backoff loop; unrecognized models are absorbed by the fallback. The script has not, in that window, paged anyone. <a href="#fnref-uptime" class="footnote-backref">↩</a></p>
    </li>
  </ol>
</section>
