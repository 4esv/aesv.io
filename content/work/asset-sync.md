---
title: Device Asset Sync
date: 2023-06-01
slug: asset-sync
year: 2023
tag: MDM · CMDB
summary: 1,300 devices across two inventory systems — Jamf for Macs, Snipe-IT for the rest. Bi-directional sync over OAuth with exponential backoff, OOP PowerShell.
stack: PowerShell OOP · Jamf Pro API · Snipe-IT API · Group Policy · OAuth
impact: Audits itself nightly. 95%+ accuracy across 1,300 endpoints. Zero manual reconciliation.
---

## The problem

Two inventory systems describing the same fleet:

- **Jamf Pro** — the Mac MDM. Macs were the source of truth here.
- **Snipe-IT** — the asset CMDB. Everything else lived here, including all the Macs (because finance needs everything in one ledger).

Reconciliation between them was quarterly, late, never complete. Drift was constant: a new MacBook deployed via Jamf wouldn't appear in Snipe-IT until somebody noticed during an audit. A retired device in Snipe-IT would still phone home from Jamf for months.

## The solution

A scheduled bi-directional sync. PowerShell because the Windows side already had Group Policy and the Mac side runs PowerShell fine via Jamf. One script, one runtime, one auth flow per system.

```powershell
class AssetManager {
  [Jamf]    $jamf
  [SnipeIT] $snipe
  [void] Sync()      { ... }   # bi-directional
  [void] Audit()     { ... }   # nightly diff report
  [void] BackoffOnFailure() { ... }
}
```

OOP because the OAuth flows on each side are stateful — Jamf's token expires every 15 minutes — and a class encapsulates the refresh-on-401 logic cleanly. Exponential backoff on rate-limit hits. Request throttling so a bulk sync doesn't trip Jamf's rate limiter. Mac agent deploys via Jamf policy; Windows via Group Policy.

## The receipts

- **1,300 endpoints** synced nightly.
- **95%+ accuracy** measured against quarterly manual audit.
- **Zero manual reconciliation** since deployment.
- **OAuth refresh** handled per-call; 15-minute Jamf tokens are transparent.
