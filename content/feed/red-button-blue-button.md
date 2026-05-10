---
title: Red button, Blue button
date: 2026-05-05
slug: red-button-blue-button
tags: [think piece, social media]
summary: Why would anyone press the other button?
repo: https://github.com/4esv/red-blue-buttons
extra_css:
  - /css/red-blue.css
extra_js:
  - /js/katex/katex.min.js
  - /js/katex/auto-render.min.js
  - /js/red-blue.js
---

<p>It all starts with a simple-looking internet dilemma:</p>

<figure class="tweet-card">
  <span class="tweet-handle">Tim Urban <span class="at">· @waitbutwhy</span></span>
  <p>Everyone in the world has to take a private vote by pressing a red or blue button. If more than 50% of people press the blue button, everyone survives. If less than 50% of people press the blue button, only people who pressed the red button survive. Which button would you press?</p>
  <p class="tweet-foot"><a href="https://x.com/waitbutwhy/status/2047710215265730755?s=20" target="_blank" rel="noopener">view on x.com →</a></p>
</figure>

<p>Answers are skewed but everyone speaks with an air of certainty.</p>

<p>Press blue, obviously. Press red, obviously. It's a <u>scissor statement</u><sup class="footnote-ref"><a id="fnref-scissor" href="#fn-scissor">1</a></sup>.</p>

<p>Let's look at it from three angles from simplest to messiest: logic, morality and social sciences.</p>

<h2>How much trust does pressing blue need?</h2>

<p>There's no other way to put it: pressing red is a guarantee and the easy choice.</p>

<p>Pressing blue is a bet that pays off only if more than half the world bets with you, the cost of being wrong is your life.</p>

<p>There are two inputs that move the bar. First is altruism, how much you weight a stranger's life against your own, on a scale from zero (pure self-interest) to one (you'd die for anyone). The other is trust, which in this context is how confident you are that more than half the world is in it with you.</p>

<p>We don't have any people evil enough to do this, so we will use proxies for the parameters when estimating outcomes.</p>

<p>The closest thing to a number for altruism is the dictator game<sup class="footnote-ref"><a id="fnref-dictator" href="#fn-dictator">2</a></sup>: a participant is handed some money and decides how much to share with an anonymous stranger. Across hundreds of studies the average share lands at a quarter to a third. I conflate this to a generous upper bound for altruism.</p>

<p>Working from this estimate, the bare expected-value rule asks for trust in the high 70s. If we factor in the human tendency to weigh losses as twice heavier than gains<sup class="footnote-ref"><a id="fnref-loss" href="#fn-loss">3</a></sup>, the bar climbs into the high 80s. With similar assumptions, other decision frameworks land us in essentially the same neighborhood<sup class="footnote-ref"><a id="fnref-frameworks" href="#fn-frameworks">4</a></sup>.</p>

<p>To bet your life, you need to be four-out-of-five sure half the world is in with you, at a minimum.</p>

<figure class="sweep">
  <p class="sweep-title">Trust required to press blue, as altruism varies</p>
  <svg class="sweep-svg" viewBox="0 0 600 240" role="img" aria-label="A chart with altruism on the x-axis from 0 to 1 and required trust on the y-axis from 0 to 100 percent. Two curves slope downward from the top-left: a dashed risk-neutral curve and a solid loss-averse curve sitting above it. At altruism 0.28 the loss-averse curve crosses 89 percent and the risk-neutral curve crosses 78 percent. The region above the loss-averse curve is shaded to mark where pressing blue is rational.">
    <rect x="60" y="30" width="500" height="170" fill="#fdf6e6" stroke="#1f1c19" stroke-width="1.5"/>
    <path d="M 60,30 L 85,33.7 L 110,37.2 L 135,40.6 L 160,43.9 L 185,47 L 200,48.8 L 210,50 L 260,55.7 L 310,60.9 L 360,65.8 L 410,70.3 L 460,74.5 L 510,78.6 L 560,82.3 L 560,30 Z" fill="#a8b3d8" opacity="0.55"/>
    <polyline points="60,30 85,38.1 110,45.5 135,52.2 160,58.3 185,64 200,67.2 210,69.2 260,78.6 310,86.7 360,93.75 410,100 460,105.6 510,110.5 560,115" fill="none" stroke="#1f1c19" stroke-width="1.5" stroke-dasharray="5 4"/>
    <polyline points="60,30 85,33.7 110,37.2 135,40.6 160,43.9 185,47 200,48.8 210,50 260,55.7 310,60.9 360,65.8 410,70.3 460,74.5 510,78.6 560,82.3" fill="none" stroke="#1f1c19" stroke-width="1.5"/>
    <line x1="200" y1="30" x2="200" y2="200" stroke="#1f1c19" stroke-width="1" stroke-dasharray="2 3" opacity="0.55"/>
    <circle cx="200" cy="48.8" r="4" fill="#b04632" stroke="#1f1c19" stroke-width="1.2"/>
    <circle cx="200" cy="67.2" r="4" fill="#b04632" stroke="#1f1c19" stroke-width="1.2"/>
    <text x="208" y="48.8" font-family="Menlo, monospace" font-size="11" fill="#1f1c19" dominant-baseline="middle">89% · loss-averse</text>
    <text x="208" y="67.2" font-family="Menlo, monospace" font-size="11" fill="#1f1c19" dominant-baseline="middle">78% · risk-neutral</text>
    <text x="475" y="55" font-family="Menlo, monospace" font-size="11" fill="#1f1c19" text-anchor="middle">press blue</text>
    <text x="55" y="34" font-family="Menlo, monospace" font-size="11" fill="#1f1c19" text-anchor="end">100%</text>
    <text x="55" y="119" font-family="Menlo, monospace" font-size="11" fill="#1f1c19" text-anchor="end">50%</text>
    <text x="55" y="204" font-family="Menlo, monospace" font-size="11" fill="#1f1c19" text-anchor="end">0%</text>
    <text x="60" y="218" font-family="Menlo, monospace" font-size="11" fill="#1f1c19" text-anchor="middle">a = 0</text>
    <text x="200" y="218" font-family="Menlo, monospace" font-size="11" fill="#1f1c19" text-anchor="middle">0.28</text>
    <text x="310" y="218" font-family="Menlo, monospace" font-size="11" fill="#1f1c19" text-anchor="middle">0.5</text>
    <text x="560" y="218" font-family="Menlo, monospace" font-size="11" fill="#1f1c19" text-anchor="middle">a = 1</text>
    <text x="310" y="234" font-family="Menlo, monospace" font-size="11" fill="#1f1c19" text-anchor="middle">altruism</text>
    <text x="55" y="22" font-family="Menlo, monospace" font-size="11" fill="#1f1c19" text-anchor="end">trust required</text>
  </svg>
  <div class="sweep-legend">
    <span><span class="swatch" style="background:#a8b3d8"></span>region where blue beats red</span>
    <span><span class="swatch" style="background:#b04632; border-radius:50%"></span>thresholds at \(a = 0.28\)</span>
  </div>
  <p class="figure-note">Each curve marks the trust level at which the math tips from red to blue. The solid curve accounts for the human tendency to weigh losses heavier than gains; the dashed curve ignores it. Higher altruism lowers the bar; loss aversion lifts it.</p>
</figure>

<p class="math-aside">Pressing blue beats pressing red whenever \(p\,(1+a) \geq 1\), where \(p\) is your trust and \(a\) is the weight you put on a stranger's life.</p>

<h2>What if everyone did the same thing?</h2>

<p>Logic asks what's best for you given what you know and can do.</p>

<p>Morality asks a wider (and to me, more interesting) question: what should everyone do?</p>

<p>Kant in 1785 asked, what if your choice were universal law? Rawls asked the same question in 1971 but with the addition that you don't get to know who you'd be when the rule lands. We can now follow this precedent and get a clear answer for the buttons.</p>

<p>If everyone chooses blue, any error rate below 50% means zero deaths, regardless of how many red there are. If everyone chooses red, the error rate is the same as the death rate; everyone who chose blue dies.</p>

<div class="aphorism">
  <strong>Universal blue saves everyone.<br>Universal red saves almost everyone.</strong>
</div>

<section class="figure">
  <h3 class="figure-title">If 1000 people agreed</h3>
  <div class="pictogram-pair">
    <div class="pictogram-card">
      <p class="pictogram-card-title">Universal blue</p>
      <p class="pictogram-card-meta">everyone tries to press blue · 5% of them misclick</p>
      <div class="btn-grid" data-blue="95" data-result="won"></div>
      <p class="pictogram-readout"><span class="num alive">1000</span><span class="label">live, everyone wins</span></p>
    </div>
    <div class="pictogram-card">
      <p class="pictogram-card-title">Universal red</p>
      <p class="pictogram-card-meta">everyone tries to press red · 5% of them misclick</p>
      <div class="btn-grid" data-blue="5" data-result="lost"></div>
      <p class="pictogram-readout"><span class="num dead">50</span><span class="label">die, blue loses</span></p>
    </div>
  </div>
  <p class="figure-note">Each circle stands for ten people based on which button they actually pressed: <span class="btn-inline red"></span> red or <span class="btn-inline blue"></span> blue. Faded buttons died.</p>
</section>

<p>The case for blue requires universalization to actually happen, everyone has to agree. Contrary to what we may want to believe, an over-half-blue world isn't more likely than an all-red one (as we will see shortly).</p>

<h2>Where do real people sit on the bar?</h2>

<p>There's a poll from the tweet at the top that I saved for this section:</p>

<figure class="poll-result">
  <p class="poll-result-title">Tim's poll, final results:</p>
  <div class="poll-row">
    <div class="poll-bar-track">
      <div class="poll-bar poll-bar-red" style="width: 42.1%">Red</div>
    </div>
    <span class="poll-pct">42.1%</span>
  </div>
  <div class="poll-row">
    <div class="poll-bar-track">
      <div class="poll-bar poll-bar-blue" style="width: 57.9%">Blue</div>
    </div>
    <span class="poll-pct">57.9%</span>
  </div>
  <p class="poll-meta">98,539 votes · <a href="https://x.com/waitbutwhy/status/2047710215265730755?s=20" target="_blank" rel="noopener">final results on x.com</a></p>
</figure>

<p>While a fun result, it isn't a very useful one. The people who answered are not a representative sample of humanity. They're a self-selected slice of the internet (netizens, contrarians, followers) that doesn't map to the broader world.</p>

<p>To attempt and approach a better estimate, I found two datasets that loosely map onto the parameters for the problem. With a bit of confidence and the magic of the internet, we can broadly generalize and pretend together.</p>

<p>First is generalized trust, from the World Values Survey<sup class="footnote-ref"><a id="fnref-wvs" href="#fn-wvs">5</a></sup>: the global average sits around a third. Denmark and Norway clear seventy percent while Brazil and Colombia sit down low in the single digits. The majority of the world does not exist at high trust; the nations that do may actually be in a danger zone, as I estimate later.</p>

<p>Second is altruism, which is harder to pin per country. As a proxy for it, I'm holding it at the dictator-game upper bound, which is generous and loosely equates human life to money<sup class="footnote-ref"><a href="#fn-dictator">2</a></sup>. Even there, no country clears either bar. Denmark, the most-trusting country in the data by far, falls a few points short of the basic threshold and more than a few points short of the loss-averse one.</p>

<p>Taking altruism and trust as axes, I built a plane where each cell is a population at that combination of rates with a generous 2% misclick rate<sup class="footnote-ref"><a id="fnref-sim" href="#fn-sim">6</a></sup>.</p>

<p>We can then plug countries in and see how everyone falls short:</p>

<figure class="sweep">
  <p class="sweep-title">Where each country sits relative to the bar</p>
  <svg class="sweep-svg" viewBox="0 0 600 220" role="img" aria-label="A horizontal trust axis from 0 to 100 percent. Two threshold lines at 78 and 89 percent mark the basic and loss-averse bars. Six country markers (Colombia, Mexico, France, USA, Sweden, Denmark) all sit below both bars.">
    <text x="445.6" y="32" font-family="Menlo, monospace" font-size="11" fill="#1f1c19" text-anchor="middle">basic · 78%</text>
    <line x1="445.6" y1="40" x2="445.6" y2="92" stroke="#1f1c19" stroke-width="1" stroke-dasharray="3 3"/>
    <text x="540" y="60" font-family="Menlo, monospace" font-size="11" fill="#1f1c19" text-anchor="middle">loss-averse · 89%</text>
    <line x1="502.8" y1="68" x2="502.8" y2="92" stroke="#1f1c19" stroke-width="1" stroke-dasharray="3 3"/>
    <rect x="40" y="92" width="520" height="48" fill="#fdf6e6" stroke="#1f1c19" stroke-width="1.5"/>
    <rect x="502.8" y="92" width="57.2" height="48" fill="#a8b3d8" opacity="0.55"/>
    <line x1="445.6" y1="92" x2="445.6" y2="140" stroke="#1f1c19" stroke-width="1.5" stroke-dasharray="5 4"/>
    <line x1="502.8" y1="92" x2="502.8" y2="140" stroke="#1f1c19" stroke-width="1.5"/>
    <text x="66"    y="86" font-size="18" text-anchor="middle">🇨🇴</text>
    <text x="107.6" y="86" font-size="18" text-anchor="middle">🇲🇽</text>
    <text x="175.2" y="86" font-size="18" text-anchor="middle">🇫🇷</text>
    <text x="232.4" y="86" font-size="18" text-anchor="middle">🇺🇸</text>
    <text x="367.6" y="86" font-size="18" text-anchor="middle">🇸🇪</text>
    <text x="424.8" y="86" font-size="18" text-anchor="middle">🇩🇰</text>
    <circle cx="66"    cy="116" r="6" fill="#b04632" stroke="#1f1c19" stroke-width="1.2"/>
    <circle cx="107.6" cy="116" r="6" fill="#b04632" stroke="#1f1c19" stroke-width="1.2"/>
    <circle cx="175.2" cy="116" r="6" fill="#b04632" stroke="#1f1c19" stroke-width="1.2"/>
    <circle cx="232.4" cy="116" r="6" fill="#b04632" stroke="#1f1c19" stroke-width="1.2"/>
    <circle cx="367.6" cy="116" r="6" fill="#b04632" stroke="#1f1c19" stroke-width="1.2"/>
    <circle cx="424.8" cy="116" r="6" fill="#b04632" stroke="#1f1c19" stroke-width="1.2"/>
    <text x="66"    y="160" font-family="Menlo, monospace" font-size="11" fill="#1f1c19" text-anchor="middle">5%</text>
    <text x="107.6" y="160" font-family="Menlo, monospace" font-size="11" fill="#1f1c19" text-anchor="middle">13%</text>
    <text x="175.2" y="160" font-family="Menlo, monospace" font-size="11" fill="#1f1c19" text-anchor="middle">26%</text>
    <text x="232.4" y="160" font-family="Menlo, monospace" font-size="11" fill="#1f1c19" text-anchor="middle">37%</text>
    <text x="367.6" y="160" font-family="Menlo, monospace" font-size="11" fill="#1f1c19" text-anchor="middle">63%</text>
    <text x="424.8" y="160" font-family="Menlo, monospace" font-size="11" fill="#1f1c19" text-anchor="middle">74%</text>
    <text x="531.4" y="160" font-family="Menlo, monospace" font-size="11" fill="#1f1c19" text-anchor="middle">blue wins</text>
    <text x="40"  y="190" font-family="Menlo, monospace" font-size="11" fill="#1f1c19" text-anchor="start">trust 0%</text>
    <text x="560" y="190" font-family="Menlo, monospace" font-size="11" fill="#1f1c19" text-anchor="end">100%</text>
  </svg>
  <div class="sweep-legend">
    <span><span class="swatch" style="background:#a8b3d8"></span>blue-winning region (trust ≥ 89% at \(a = 0.28\))</span>
    <span><span class="swatch" style="background:#b04632; border-radius:50%"></span>country at dictator-game altruism</span>
  </div>
</figure>

<p>In the mythical lands past the bar, blue wins reliably every time and everyone survives. At any point below it (where we happen to exist), blue loses and the people who pressed it die. The more pressed it, the more die.</p>

<p>Played out on a thousand people, this would look something like:</p>

<section class="figure">
  <h3 class="figure-title">1000 people in six countries</h3>
  <div class="pictogram-grid-3">
    <div class="pictogram-card">
      <p class="pictogram-card-title"><span class="flag">🇨🇴</span> Colombia</p>
      <p class="pictogram-card-meta">trust 5%</p>
      <div class="btn-grid" data-blue="2" data-result="lost"></div>
      <p class="pictogram-readout"><span class="num dead">20</span><span class="label">die</span></p>
    </div>
    <div class="pictogram-card">
      <p class="pictogram-card-title"><span class="flag">🇲🇽</span> Mexico</p>
      <p class="pictogram-card-meta">trust 13%</p>
      <div class="btn-grid" data-blue="2" data-result="lost"></div>
      <p class="pictogram-readout"><span class="num dead">20</span><span class="label">die</span></p>
    </div>
    <div class="pictogram-card">
      <p class="pictogram-card-title"><span class="flag">🇫🇷</span> France</p>
      <p class="pictogram-card-meta">trust 26%</p>
      <div class="btn-grid" data-blue="2" data-result="lost"></div>
      <p class="pictogram-readout"><span class="num dead">20</span><span class="label">die</span></p>
    </div>
    <div class="pictogram-card">
      <p class="pictogram-card-title"><span class="flag">🇺🇸</span> USA</p>
      <p class="pictogram-card-meta">trust 37%</p>
      <div class="btn-grid" data-blue="4" data-result="lost"></div>
      <p class="pictogram-readout"><span class="num dead">40</span><span class="label">die</span></p>
    </div>
    <div class="pictogram-card">
      <p class="pictogram-card-title"><span class="flag">🇸🇪</span> Sweden</p>
      <p class="pictogram-card-meta">trust 63%</p>
      <div class="btn-grid" data-blue="23" data-result="lost"></div>
      <p class="pictogram-readout"><span class="num dead">230</span><span class="label">die</span></p>
    </div>
    <div class="pictogram-card">
      <p class="pictogram-card-title"><span class="flag">🇩🇰</span> Denmark</p>
      <p class="pictogram-card-meta">trust 74%</p>
      <div class="btn-grid" data-blue="42" data-result="lost"></div>
      <p class="pictogram-readout"><span class="num dead">420</span><span class="label">die</span></p>
    </div>
  </div>
  <p class="figure-note">Trust values are WVS Wave 7 country averages; altruism is held at 0.28 across the board (the dictator-game upper bound). Each circle stands for ten people; color shows the button they actually pressed after a 2% misclick. Blue lost in all six worlds, so the blue buttons are the dead ones.</p>
</section>

<p>In this world, trust kills. Colombia only loses 20 because almost no one pressed blue while Denmark loses 420 because nearly half did, but not enough. Faith without numbers is a deadly combination: enough true believers to approach the threshold, without enough to cross it. The countries you'd most want to live in become the worst places to be.</p>

<div class="aphorism aphorism-red">
  <strong>Half-coordinated optimism kills more people than cynicism.</strong>
</div>

<p>While the numbers don't support blue, they also don't tell the whole story. There are other factors and considerations to consider which may affect what the optimal outcome even is.</p>

<h2>Special cases for blue</h2>

<h3>Population size</h3>

<p>In the simulation your vote is private and one part in N of the outcome. The smaller the N, the more influential you are. In a village of eleven, you are not only one-eleventh of the result but also a likely tie-breaker in the case of an even split.</p>

<p>A village can coordinate on blue at trust levels that would result in mass casualties at a planetary scale.</p>

<p>The tipping point for this problem is about ten thousand voters. After ten thousand people, pivotality<sup class="footnote-ref"><a id="fnref-pivotality" href="#fn-pivotality">7</a></sup> decays into a rounding error and you end up back at the planetary baseline.</p>

<h3>Dependents</h3>

<p>You are rarely deciding alone; the outcome of your choice in this likely affects others. When thinking about children, the elderly, those with disabilities, even those prone to confusion: what if you have to choose for them? What if you knew they may choose wrong in either direction? Each situation changes the meaning of the question and the reasoning behind the choice. In either case, if blue loses, they lose you and lose with you. Their risk is your risk.</p>

<p>A partner moves the bar from the high 80s into the low 90s; add a child and it crosses 95; add another and it clears 97<sup class="footnote-ref"><a id="fnref-dep" href="#fn-dep">8</a></sup>. It is safe to say that most parents would weight a child's life heavier than their own without question, pushing the bar even further out. Duty drives altruism.</p>

<h3>Family pre-commitment</h3>

<p>To complicate matters further, suppose your partner and child have already pressed blue and you know it. The world where blue loses is also the world where they die, regardless of your choice.</p>

<p>The question becomes: would you rather die with them, or live in a world without them? Again, most parents when asked plainly will tell you that the second option is not at all comparable to the first.</p>

<p>Once outliving them is nearly as bad as dying, the bar falls into the low 70s. Denmark's measured trust sits in the mid-70s already<sup class="footnote-ref"><a id="fnref-survivor" href="#fn-survivor">9</a></sup>. So, a Dane whose family has already pressed blue, and who would rather die than outlive them, presses blue without a second thought here.</p>

<h2>Which button?</h2>

<p>The case for <span class="btn-inline red"></span> <strong>red</strong>, on the numbers we have: no measured population clears the bar at any plausible level of altruism, and adding dependents pushes it further out. Wanting a blue world doesn't make one so; if we lived in such a world we'd be in agreement already. Red is the move the data and heuristics support.</p>

<p>The case for <span class="btn-inline blue"></span> <strong>blue</strong>: belief moves the bar in ways the simulation can't model. Public commitment, family agreement, a viral thread. Each lifts collective trust upward. The price of being right early is paid by the people who press blue while the rest of the world is still deciding. To be in a blue world we must believe we are already in one.</p>

<section class="footnotes">
  <ol class="footnotes-list">
    <li id="fn-scissor" class="footnote-item">
      <p>Alexander, S. (2018). <em>Sort By Controversial.</em> Slate Star Codex. <a href="https://slatestarcodex.com/2018/10/30/sort-by-controversial/" target="_blank" rel="noopener">slatestarcodex.com/2018/10/30/sort-by-controversial</a>. The story coins the term as the title of a fictional algorithm that surfaces statements maximally divisive between two camps. The button isn't engineered, but it lands in the same shape: each side reads its own answer as obviously correct and the other side as morally or logically broken. <a href="#fnref-scissor" class="footnote-backref">↩</a></p>
    </li>
    <li id="fn-dictator" class="footnote-item">
      <p>Engel, C. (2011). <em>Dictator games: a meta study.</em> Experimental Economics 14(4), 583–610. <a href="https://link.springer.com/article/10.1007/s10683-011-9283-7" target="_blank" rel="noopener">link.springer.com/article/10.1007/s10683-011-9283-7</a>. The 28% figure is the average share across hundreds of studies; students share less, older participants share more, larger stakes share less. Treat it as a common reference, not a tight estimate. Important to acknowledge: money is not comparable to lives. We treat this as a generous upper bound. We don't want to actually find out, do we? <a href="#fnref-dictator" class="footnote-backref">↩</a></p>
    </li>
    <li id="fn-loss" class="footnote-item">
      <p>Tversky, A. &amp; Kahneman, D. (1992). <em>Advances in prospect theory: cumulative representation of uncertainty.</em> Journal of Risk and Uncertainty 5, 297–323. <a href="https://link.springer.com/article/10.1007/BF00122574" target="_blank" rel="noopener">link.springer.com/article/10.1007/BF00122574</a>. The original paper estimated \(\lambda \approx 2.25\) from monetary gambles; field replications give a wider range (roughly 1.5 to 4). Carrying that coefficient over from "would you take a coin flip for \$200 to win \$100" to "would you take a coin flip with your life on it" is a leap. I use it as a useful order-of-magnitude correction, not a measured truth. <a href="#fnref-loss" class="footnote-backref">↩</a></p>
    </li>
    <li id="fn-frameworks" class="footnote-item">
      <p>Maximin picks the option whose worst possible outcome is best. For this dilemma that is red, since red's worst case is "you live" and blue's is "you die." Minimax regret picks the option that minimises the largest possible regret, and for any \(a &lt; 1\) that is also red, since missing the moral payoff is a smaller regret than dying for nothing. <a href="#fnref-frameworks" class="footnote-backref">↩</a></p>
    </li>
    <li id="fn-wvs" class="footnote-item">
      <p>World Values Survey, Wave 7 (2017–2022). Question Q57: <em>"Generally speaking, would you say that most people can be trusted, or that you need to be very careful in dealing with people?"</em> <a href="https://www.worldvaluessurvey.org/WVSDocumentationWV7.jsp" target="_blank" rel="noopener">worldvaluessurvey.org/WVSDocumentationWV7</a>. Numbers shift one to three points between releases as the dataset is curated; verify against the latest release before citing. The leap I'm asking the reader to grant is that "most people can be trusted" tracks "more than half of all humans will press blue." The first is about strangers in shops and on buses, the second is about everyone alive answering the same prompt at the same time. Reading the WVS number directly into trust is generous to blue. <a href="#fnref-wvs" class="footnote-backref">↩</a></p>
    </li>
    <li id="fn-sim" class="footnote-item">
      <p>41×41 grid over \((a, p) \in [0.05, 0.95]^2\). 3000 agents per cell, 80 Monte Carlo runs per cell, 2% misclick rate. Each agent's altruism and trust are drawn from Beta distributions matched to the cell's mean. Two simplifications worth flagging up front: (1) for the country pictograms, altruism is held at the dictator-game upper bound across every country, because no instrument I know of measures stranger-altruism per country at scale, and country-level differences in altruism would shift the picture, probably not uniformly; (2) every vote is treated as independent, with no communication or coordination between agents. Code and data are in the <a href="https://github.com/4esv/red-blue-buttons" target="_blank" rel="noopener">github repo</a>; the full math (thresholds, dependents, μ derivation) lives there too. <a href="#fnref-sim" class="footnote-backref">↩</a></p>
    </li>
    <li id="fn-pivotality" class="footnote-item">
      <p>Pivotality is the probability that your single vote is the one that flips the outcome. In a closely-divided population of size \(N\), it scales roughly as \(1/\sqrt{N}\). At ten people it's a meaningful fraction; at ten thousand it's already small; past that the expected-value calculation collapses back to the planetary baseline regardless of how decisive your vote feels. <a href="#fnref-pivotality" class="footnote-backref">↩</a></p>
    </li>
    <li id="fn-dep" class="footnote-item">
      <p>Derivation, in case you want to check it. Treat each dependent as another life lost on the blue-loss branch, weighted equally with your own. With \(f\) dependents the loss-averse threshold becomes \(p \geq \lambda(1+f) / (a + \lambda(1+f))\). At a quarter-altruism, \(\lambda = 2.25\), and \(f = 2\) (a spouse and one child) it lands around 96%. The formula assumes the lives are independent and weigh equally with yours. Most parents would weight a child's life heavier, which would push the bar even higher than the number above. <a href="#fnref-dep" class="footnote-backref">↩</a></p>
    </li>
    <li id="fn-survivor" class="footnote-item">
      <p>Derivation. Take the reference point as "you live, family lives." On the blue-loss branch your family dies regardless of your button. Press red and you live with utility \(1 - \mu\), your life dampened by guilt. Press blue and you die with utility \(-\lambda\). Setting expected utilities equal at the threshold gives \(p \geq \lambda(1-\mu) / (a + \lambda(1-\mu))\). The survivor-guilt term effectively dampens loss aversion by a factor of \((1-\mu)\). The "low 70s" figure in the body uses \(\mu = 0.7\), which is illustrative, not measured. μ is by definition a private number. The honest claim is just that for a parent of a committed family, the bar can fall low enough that empirical trust meets it. <a href="#fnref-survivor" class="footnote-backref">↩</a></p>
    </li>
  </ol>
</section>
