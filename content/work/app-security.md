---
title: App Security Manager
date: 2023-09-01
slug: app-security
year: 2023
tag: RBAC · directory
summary: Replaced a decade-old ColdFusion permissions system. Live LDAP search, drag-and-drop role assignment, Shibboleth SSO. Two colleges, one interface.
stack: Node.js · Express · MSSQL · LDAP · Shibboleth/SAML
impact: Days to under a minute. Replaced 10+ years of production ColdFusion.
---

## The problem

Application access in two colleges lived in a decade-old ColdFusion system that nobody had touched in years. Permissions were tracked in spreadsheets out-of-band. To grant access, a department head emailed an IT ticket; somebody logged in over RDP, edited the spreadsheet, hit a button, and confirmed. The whole thing took days.

Worse: nobody could read the ColdFusion. The original maintainer had retired. Audit requests had to be answered manually.

## The solution

A new RBAC dashboard. Three role tiers (admin, manager, viewer), live LDAP search with drag-and-drop assignment, Shibboleth/SAML SSO so nobody needed a separate password.

The data layer is plain MSSQL with transactional updates so partial assignments can't corrupt the directory mapping. The UI is server-rendered Node — no SPA complexity for an internal tool that lives on a campus VPN.

```
Browser (Shibboleth-authenticated)
  ↓
Node/Express
  ↓
LDAP (live search)        MSSQL (role assignments)
```

Two colleges, one interface. Department heads now self-serve. Audit reports run from the same SQL the dashboard reads.

## The receipts

- **Days → under a minute** to grant or revoke access.
- Replaces **10+ years** of production ColdFusion that nobody could read.
- Two colleges on one codebase.
- Audit-from-source: the role table is the audit log.
