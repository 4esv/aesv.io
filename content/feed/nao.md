---
title: A robot that holds a conversation
date: 2024-04-01
slug: nao
type: case-study
year: 2024
tag: AI · robotics
tags: [case-study, ai, robotics]
summary: A research robot that needed to hold a conversation, not run a script. Working demo into the NSF grant on time.
stack: Python · NAOqi · Azure OpenAI · GPT-3.5 Turbo · Whisper · SSH
impact: Working demo into the NSF grant package, on time.
---

<p>Professor Keith Green<sup class="footnote-ref"><a id="fnref-green" href="#fn-green">1</a></sup>, the father of architectural robotics, walked into the lab with a NAO v3 humanoid<sup class="footnote-ref"><a id="fnref-nao" href="#fn-nao">2</a></sup> under one arm and a deadline. The NSF grant package needed something it did not have yet: a robot that could actually <em>talk</em> with a person. Not pattern-match on "hello" and "goodbye", not page through a scripted dialog tree. Hold a conversation. Across turns. With context.</p>

<p>Stock NAO ships with a graphical authoring tool that points you at a keyword recognizer and a fixed vocabulary. Useful for a museum-floor demo. Not useful for what we needed. The vendor docs talk in marketing terms; the authoring tool is slow and points away from the API surface underneath. So I plugged in, got the IP off the head, and SSH'd into the robot.</p>

<p>Underneath the chrome was a custom Gentoo Linux build and naoqi<sup class="footnote-ref"><a id="fnref-naoqi" href="#fn-naoqi">3</a></sup> running as the root process. naoqi is SoftBank's robot middleware; it exposes every onboard subsystem (motors, microphones, LEDs, speech, memory) as a service you can call over TCP from any language with a binding. The Python binding is the <code>qi</code> module. naoqi was first cut for NAO v3 around 2008. The model it would eventually orchestrate shipped in 2022. Fourteen years sit between the two ends of the conversation loop.</p>

<p>The obvious next move was to run everything on the robot. That fell over inside the first hour. NAO's onboard CPU is an Atom-class chip from the Obama administration; it can drive the motors and stream audio, but it cannot also run speech recognition and an LLM at conversational latency. So the robot keeps doing what it is good at (microphones, speakers, motors, the gesture timeline) and a MacBook on the same Wi-Fi runs the heavy work. The robot's <code>qi</code> session is a long-lived TCP connection back to the laptop's Python process.</p>

<section class="figure">
  <h3 class="figure-title">Topology</h3>
  <svg viewBox="0 0 600 200" role="img" aria-label="Three boxes in a row: NAO robot on the left, MacBook in the middle, Azure OpenAI on the right. A thin line connects the robot to the MacBook, labeled gestural-speech RPC over Wi-Fi. A thicker line connects the MacBook to Azure, labeled LLM and Whisper inference. The MacBook is annotated as the bottleneck.">
    <rect x="20" y="60" width="140" height="80" fill="#fdf6e6" stroke="#1f1c19" stroke-width="2"/>
    <text x="90" y="95" font-family="Menlo, monospace" font-size="13" fill="#1f1c19" text-anchor="middle">NAO v3</text>
    <text x="90" y="115" font-family="Menlo, monospace" font-size="10" fill="#1f1c19" text-anchor="middle">naoqi · :9559</text>
    <text x="90" y="130" font-family="Menlo, monospace" font-size="10" fill="#1f1c19" text-anchor="middle">mics · motors · LEDs</text>
    <rect x="230" y="60" width="140" height="80" fill="#a8b3d8" stroke="#1f1c19" stroke-width="2"/>
    <text x="300" y="95" font-family="Menlo, monospace" font-size="13" fill="#1f1c19" text-anchor="middle">MacBook</text>
    <text x="300" y="115" font-family="Menlo, monospace" font-size="10" fill="#1f1c19" text-anchor="middle">main.py · qi client</text>
    <text x="300" y="130" font-family="Menlo, monospace" font-size="10" fill="#1f1c19" text-anchor="middle">conversation loop</text>
    <rect x="440" y="60" width="140" height="80" fill="#fdf6e6" stroke="#1f1c19" stroke-width="2"/>
    <text x="510" y="95" font-family="Menlo, monospace" font-size="13" fill="#1f1c19" text-anchor="middle">Azure OpenAI</text>
    <text x="510" y="115" font-family="Menlo, monospace" font-size="10" fill="#1f1c19" text-anchor="middle">GPT-3.5 Turbo</text>
    <text x="510" y="130" font-family="Menlo, monospace" font-size="10" fill="#1f1c19" text-anchor="middle">+ Whisper</text>
    <line x1="160" y1="100" x2="230" y2="100" stroke="#7a7770" stroke-width="1.5"/>
    <polygon points="230,100 222,96 222,104" fill="#7a7770"/>
    <polygon points="160,100 168,96 168,104" fill="#7a7770"/>
    <text x="195" y="88" font-family="Menlo, monospace" font-size="10" fill="#7a7770" text-anchor="middle">light</text>
    <text x="195" y="120" font-family="Menlo, monospace" font-size="9" fill="#7a7770" text-anchor="middle">say · listen · gesture</text>
    <line x1="370" y1="100" x2="440" y2="100" stroke="#b04632" stroke-width="3.5"/>
    <polygon points="440,100 430,94 430,106" fill="#b04632"/>
    <polygon points="370,100 380,94 380,106" fill="#b04632"/>
    <text x="405" y="88" font-family="Menlo, monospace" font-size="10" fill="#b04632" text-anchor="middle">heavy</text>
    <text x="405" y="120" font-family="Menlo, monospace" font-size="9" fill="#b04632" text-anchor="middle">audio · history · tokens</text>
    <text x="300" y="172" font-family="Menlo, monospace" font-size="10" fill="#1f1c19" text-anchor="middle">↑ bottleneck lives here, not on the robot</text>
  </svg>
  <p class="figure-note">The thin line is gestural speech RPC: a few hundred bytes of text per turn over Wi-Fi to the robot's <code>qi</code> session on port 9559. The thick line is the inference round trip to Cornell's hosted Azure OpenAI endpoint.</p>
</section>

<p>The conversation loop is small enough to fit on screen. Connect to the robot, load a system prompt, then bounce audio through Whisper, the chat history through GPT, and the response through animated speech, in a loop until somebody says goodbye:</p>

```python
session = qi.Session()
session.connect(f"tcp://{ip}:9559")

history = [{"role": "system", "content": open("prompt.txt").read().strip()}]

while True:
    user_input = listen_and_recognize(session)        # ALAudioRecorder → Whisper
    history.append({"role": "user", "content": user_input})

    response = get_gpt_response(history)              # Azure GPT-3.5 Turbo
    history.append({"role": "assistant", "content": response})

    nao_speak_with_animations(session, response)      # ALAnimatedSpeech, contextual

    if "goodbye" in user_input.lower():
        break
```

<p>The interesting line is <code>nao_speak_with_animations</code>. Setting <code>bodyLanguageMode: "contextual"</code> on <code>ALAnimatedSpeech</code> tells the robot to pick gestures from its library that match the meaning of what it is saying, so the words and the body move together.</p>

<p>The demo went into the NSF grant package on time. The robot answered open questions, held context across multi-turn exchanges, and gestured along with what it was saying.</p>

<section class="footnotes">
  <ol class="footnotes-list">
    <li id="fn-green" class="footnote-item">
      <p>Keith Evan Green is a professor at Cornell whose book <em>Architectural Robotics: Ecosystems of Bits, Bytes, and Biology</em> (MIT Press, 2016) coined the term and frames the field. <a href="https://mitpress.mit.edu/9780262035065/architectural-robotics/" target="_blank" rel="noopener">mitpress.mit.edu/9780262035065</a>. <a href="#fnref-green" class="footnote-backref">↩</a></p>
    </li>
    <li id="fn-nao" class="footnote-item">
      <p>NAO v3 is a 58 cm humanoid by Aldebaran Robotics (now SoftBank Robotics, now United Robotics Group). Onboard CPU is an Intel Atom Z530 at 1.6 GHz with 1 GB RAM, four-microphone head array, 25 degrees of freedom. <a href="https://www.aldebaran.com/en/nao" target="_blank" rel="noopener">aldebaran.com/en/nao</a>. <a href="#fnref-nao" class="footnote-backref">↩</a></p>
    </li>
    <li id="fn-naoqi" class="footnote-item">
      <p>NAOqi is the robot's middleware. Versions 2.5+ ship a Python 3 binding (the <code>qi</code> module); earlier releases were Python 2.7 only, which is the gotcha that catches everyone reaching for the SDK in 2024. SDK reference: <a href="http://doc.aldebaran.com/2-5/naoqi/index.html" target="_blank" rel="noopener">doc.aldebaran.com/2-5/naoqi</a>. <a href="#fnref-naoqi" class="footnote-backref">↩</a></p>
    </li>
  </ol>
</section>
