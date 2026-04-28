---
title: NAO Bot AI Integration
date: 2022-11-01
slug: nao
year: 2022
tag: AI · research
summary: Wired Whisper + GPT into a 14-year-old NAO humanoid for an NSF research proposal. Independent test modes per layer to keep the SDK debuggable.
stack: Python · NAOqi SDK · OpenAI Whisper · OpenAI API
impact: Proof-of-concept delivered for the NSF proposal. SDK predates the API it now speaks through.
---

## The problem

A faculty researcher needed a conversational humanoid robot for an NSF study. Aldebaran's NAO is the obvious hardware — but its built-in speech recognition is keyword-matching from a hand-curated dictionary. It cannot hold a conversation.

The NAOqi SDK is also fourteen years old. It targets Python 2. It assumes a network and a robot that both behave exactly as documented in 2010.

## The solution

Pipe NAO's microphone into Whisper, route the transcript through GPT, send the response back into NAO's animated speech engine. Each layer is independently testable so when the SDK does something weird at 2am, you can isolate the failure.

```
NAO microphone
  → Whisper (local or OpenAI)
    → GPT (system prompt: "you are a research robot, stay in character")
      → NAO animated speech (NAOqi SDK)
```

The independent test modes turned out to be the most important part. NAOqi's failure modes are charming — silent timeouts, half-completed gestures, a robot that simply stops listening — and the only way to debug a layered pipeline is to be able to remove a layer.

## The receipts

- **Proof-of-concept delivered** for the NSF proposal.
- The NAO **SDK predates the GPT API** it now speaks through by over a decade.
- Conversational interaction in field trials: working.
