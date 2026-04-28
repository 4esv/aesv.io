---
title: Frevvo Workflow Platform
date: 2023-01-01
slug: frevvo
year: 2023—now
tag: Workflow platform
summary: Sole maintainer of a multi-college workflow platform. 806 business rules, 37 endpoints, 16 LDAP groups. UUID-named XML refactored into something documented.
stack: JavaScript · MSSQL · LDAP · REST · PDF generation
impact: 53 forms, 45 workflows, 2 colleges, 4 orgs. $258K COCOMO.
---

## The problem

When the supervising admin retired, ownership of the multi-college Frevvo workflow platform transferred to me. The handoff included:

- No documentation.
- No version control.
- No tests.
- No backup maintainer.
- 53 active forms named after UUIDs.
- 45 workflows nobody could fully describe.
- A copy of the production database on someone's desk.

Frevvo is a low-code workflow tool. The "low" part means business rules are written in JavaScript inside XML inside the admin UI. There is no `git diff` for that. There is no test runner. There is no deploy script.

## What I did

Built the missing infrastructure around a tool that doesn't have any.

- **Source-of-truth export**: a script that pulls every form, every rule, every workflow definition out of Frevvo and writes it to a git repo as readable JavaScript and JSON. Diffable.
- **Naming**: every UUID-named form mapped to a human name and documented. Every business rule labeled.
- **Test harness**: lightweight JavaScript runner that loads each rule and exercises it against fixtures. Catches regressions when the platform itself updates.
- **Deploy**: a script that takes the diff and pushes it back to Frevvo through the admin API. Code review now means something.

## The receipts

- **806** JavaScript business rules across **8,592 active lines**.
- **37** API endpoints integrated with downstream systems.
- **16** LDAP groups governing workflow routing.
- **53** forms, **45** workflows, **2** colleges, **4** organizations.
- **$258K COCOMO** estimate for an equivalent rewrite.
- Sole maintainer since 2023. Still running.
