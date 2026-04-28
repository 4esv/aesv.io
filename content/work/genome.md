---
title: Genome Self-Analysis
date: 2024-04-01
slug: genome
year: 2024
tag: Personal · pipeline
summary: 23andMe raw export, end-to-end. Admixture, PCA against 1000 Genomes, polygenic risk scores from GWAS. Pipeline I understand instead of a black-box result.
stack: Python · population genetics calculators · 1000 Genomes reference · PCA · PRS scoring
impact: Pipeline I understand end-to-end instead of a black-box result.
---

## The problem

Consumer genotype reports either over-interpret the data ("you carry the warrior gene!") or refuse to engage past surface ancestry. There's no trusted middle ground between "your DNA is 24% Iberian" and an actual genome research lab.

I wanted a pipeline I could read end-to-end. Not a result — a process.

## What it does

```
23andMe raw export
  → admixture against population calculators
    → PCA projection onto 1000 Genomes
      (50K SNPs, 26 populations)
    → polygenic risk scores from published GWAS
      (peer-reviewed effect sizes, no marketing copy)
  → annotated CSV + plots
```

Each stage is its own script. Each writes intermediate output I can sanity-check before the next stage runs. The PCA projection is the most fun: my single point lands in the cloud of 1000 Genomes samples and you can read the structure visually.

## The receipts

- **A pipeline I understand** end-to-end.
- **50,000 SNPs** projected against **26 reference populations**.
- **Polygenic risk scores** computed from published GWAS effect sizes — no proprietary "wellness" interpretation.
- Reproducible: same input, same result, every time.
