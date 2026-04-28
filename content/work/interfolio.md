---
title: Interfolio Dossier Builder
date: 2024-08-01
slug: interfolio
year: 2024
tag: Faculty workflow
summary: Tenure and promotion packets, days to five minutes. React → Express → BullMQ → Python. 23,000 lines, six languages.
stack: Node.js · Express · React · Vite · Python · BullMQ · Redis · PyPDF2 · Interfolio API (HMAC-SHA1) · MSSQL · Shibboleth/SAML · systemd
impact: Days became 5 minutes. 23,000 lines, 127 files, six languages.
---

## The problem

Tenure and promotion review is the highest-stakes academic moment of a faculty member's career. The dossier — letters of recommendation, teaching evaluations, publications, committee statements — gets assembled into a single ordered PDF that a tenure review committee actually reads.

At Cornell's College of Human Ecology, this assembly happened by hand. A staff member would log into Interfolio, download every artifact one at a time, classify each by section, sort, paginate, watermark, and merge — over multiple days, during the highest-stakes review window of the year. Errors were inevitable. Re-runs were common.

## The solution

A single-button workflow. Faculty (or their reviewer) chooses the candidate, picks a template, and the system produces the merged packet.

```
React/Vite UI
  → Node/Express API
    → BullMQ on Redis (job queue)
      → Python worker (PyPDF2 + Interfolio API)
        → merged PDF
```

Each layer was chosen because the next one needed it:

- **React/Vite** for a UI that staff actually opened. The previous attempt was a Java desktop tool that nobody touched.
- **BullMQ on Redis** because the Python merge step takes minutes, not seconds. Browsers don't wait. The queue gives the API a job ID; the UI polls.
- **Python worker** because PyPDF2 is the right library for what we're doing and Node's PDF stack isn't.
- **Interfolio API** signed with HMAC-SHA1, refreshed per call. No SDK exists; the wire format is documented and stable.

## The receipts

- **Days → 5 minutes** for the median packet.
- **23,000 lines** across **127 files** in **six languages** (TypeScript, JavaScript, Python, SQL, Shell, YAML).
- Replaces a manual workflow that ate one full FTE-week per cycle.
- Runs on systemd-managed services with a 60-second restart on failure.
- Authenticates against Cornell's Shibboleth IdP via SAML 2.0.
