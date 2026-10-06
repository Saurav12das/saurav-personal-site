"""Render the question map and life timeline from the research record; no production build needed."""
from pathlib import Path
from html import escape as e
import json, sys
ROOT=Path(__file__).resolve().parents[1]
data=json.loads((ROOT/'data/groundwork.json').read_text())
papers=data['papers'];chapters=data['chapters']
ids={p['id'] for p in papers}
assert len(ids)==len(papers)
assert all(set(p['related']) <= ids for p in papers)
START='<!-- GROUNDWORK INTERACTIVE START -->';END='<!-- GROUNDWORK INTERACTIVE END -->'
def external(url,label,cls=''):
    return f'<a class="{cls}" href="{e(url)}" target="_blank" rel="noopener noreferrer">{label} <span aria-hidden="true">↗</span></a>'
nodes=''.join(f'<a class="research-node" href="#paper-{p["id"]}" data-paper="{p["id"]}" data-related="{" ".join(p["related"])}" style="--node-x:{p["x"]}%;--node-y:{p["y"]}%" aria-controls="paper-{p["id"]}"><span class="node-dot" aria-hidden="true">{i+1:02d}</span><span class="node-copy"><span class="node-year">{p["year"]}{" · PREPRINT" if p["id"]=="hlc" else ""}</span><strong>{e(p["short"])}</strong><span class="node-stage">{e(p["stage"])}</span></span></a>' for i,p in enumerate(papers))
paths=[]
for a,b in zip(papers,papers[1:]):
    x1,y1=a['x']*10,a['y']*6;x2,y2=b['x']*10,b['y']*6
    paths.append(f'<path data-edge="{a["id"]} {b["id"]}" d="M{x1},{y1} Q{(x1+x2)/2},{min(y1,y2)-70} {x2},{y2}"/>')
for aid,bid in [('creu','tier'),('creu','hlc'),('gap','hlc')]:
    a=next(p for p in papers if p['id']==aid);b=next(p for p in papers if p['id']==bid)
    paths.append(f'<path class="cross-connection" data-edge="{aid} {bid}" d="M{a["x"]*10},{a["y"]*6} Q{(a["x"]+b["x"])*5-45},{(a["y"]+b["y"])*3} {b["x"]*10},{b["y"]*6}"/>')
panels=[]
for i,p in enumerate(papers):
    links=''.join(f'<a href="#paper-{q["id"]}" data-paper-link="{q["id"]}">{e(q["short"])}</a>' for q in papers if q['id'] in p['related'])
    panels.append(f'''<article class="research-paper" id="paper-{p['id']}" aria-labelledby="question-{p['id']}">
<p class="ground-kicker">QUESTION {i+1:02d} / {len(papers):02d} <span>{e(p['year'])}</span></p>
<h3 id="question-{p['id']}">{e(p['question'])}</h3><p class="paper-answer">{e(p['answer'])}</p>
<div class="paper-next"><span class="ground-kicker">THE NEXT QUESTION</span><p>{e(p['next'])}</p></div>
<p class="paper-caution">{e(p['caution'])}</p>
<div class="paper-citation"><span class="paper-status{' is-preprint' if p['id']=='hlc' else ''}">{e(p['status'])}</span><h4>{e(p['title'])}</h4><p>{e(p['authors'])} · {e(p['journal'])} · {e(p['year'])}</p>{external(p['url'],'Read the '+('preprint' if p['id']=='hlc' else 'paper'),'ground-link')}</div>
<div class="paper-connections"><span class="ground-kicker">CONNECTED TO</span>{links}</div></article>''')
era_links=''.join(f'<a href="#chapter-{c["id"]}" data-chapter="{c["id"]}" aria-controls="chapter-{c["id"]}"><span class="era-point" aria-hidden="true"></span><span class="era-years">{e(c["years"])}</span><strong>{e(c["place"])}</strong></a>' for c in chapters)
era_panels=[]
for i,c in enumerate(chapters):
    link=external(c['href'],e(c['link']),'ground-link') if c['href'].startswith('https://') else f'<a class="ground-link" href="{c["href"]}">{e(c["link"])} <span aria-hidden="true">↗</span></a>'
    era_panels.append(f'''<article class="journey-chapter" id="chapter-{c['id']}" aria-labelledby="chapter-title-{c['id']}"><div class="chapter-landscape" aria-hidden="true"><span class="chapter-index">CHAPTER {i+1:02d}</span><span class="chapter-word">{e(c['word'])}</span><span class="chapter-orbit"></span><span class="chapter-place">{e(c['place'])}</span></div><div class="chapter-copy"><p class="ground-kicker">{e(c['institution'])}</p><h3 id="chapter-title-{c['id']}">{e(c['label'])}</h3><p class="chapter-question">{e(c['question'])}</p><p>{e(c['body'])}</p><div class="chapter-carry"><span class="ground-kicker">WHAT I CARRIED FORWARD</span><p>{e(c['carry'])}</p></div><div class="chapter-tags">{''.join('<span>'+e(t)+'</span>' for t in c['tags'])}</div>{link}</div></article>''')
content=f'''{START}
<header class="ground-hero"><div><p class="ground-kicker">GROUNDWORK / SCIENCE &amp; RESEARCH</p><h1>Groundwork<span>.</span></h1><p class="ground-deck">One question keeps<br>becoming the next.</p><p class="ground-intro">From microbes in Assam’s groundwater to soil health in Nebraska and long-term farming systems. A life of looking beneath the surface, and connecting what I find.</p><div class="ground-hero-links"><a href="#research-map">Explore the research <span aria-hidden="true">↓</span></a><a href="#life-timeline">Follow the journey <span aria-hidden="true">↓</span></a></div></div><figure class="ground-hero-art"><img src="/images/essays/pathology-of-more.jpg" alt="An engraved collage of roots, farmland, and a balance beneath an orange sun." width="1536" height="1024" fetchpriority="high"><figcaption>THE QUESTIONS HAVE ROOTS. <span>Conceptual illustration</span></figcaption></figure></header>
<section class="ground-section" id="research-map" aria-labelledby="research-map-title"><div class="ground-section-heading"><div><p class="ground-kicker">01 / CONNECT THE QUESTIONS</p><h2 id="research-map-title">Research grows in connections.</h2></div><p>Select a dot. See what the study contributed, what it could not settle, and where the question goes next.</p></div><div class="research-toolbar"><span class="ground-kicker">FIVE PAPERS · ONE EVOLVING FRAMEWORK</span><div class="map-modes" hidden aria-label="Research display"><button type="button" data-map-mode="map" aria-pressed="true">Connected map</button><button type="button" data-map-mode="list" aria-pressed="false">Reading order</button></div></div><div class="research-explorer"><div class="map-column"><div class="research-map-canvas"><svg class="research-edges" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">{''.join(paths)}</svg><div class="map-center-note" aria-hidden="true">Soil health.<br>Compared with what?</div><nav class="research-nodes" aria-label="Explore research questions">{nodes}</nav></div><div class="map-legend"><span><i></i>Question to question</span><span><i class="dashed"></i>Shared foundations</span></div><p class="map-method">{e(data['connectionNote'])}</p></div><div class="research-detail"><div class="research-papers">{''.join(panels)}</div><div class="research-pagination" hidden><button type="button" data-paper-prev aria-label="Previous research question">← Previous</button><span data-paper-count>01 / 05</span><button type="button" data-paper-next aria-label="Next research question">Next question →</button></div></div></div><p class="sr-only" role="status" data-research-status></p><div class="ground-open-question"><span class="ground-kicker">STILL OPEN</span><p>Can a fairer benchmark lead to a better decision in the field?</p><a href="/products.html">Where research meets building <span aria-hidden="true">↗</span></a></div></section>
<section class="ground-section" id="life-timeline" aria-labelledby="life-timeline-title"><div class="ground-section-heading"><div><p class="ground-kicker">02 / THE LIFE BEHIND THE QUESTIONS</p><h2 id="life-timeline-title">Different places. A continuing curiosity.</h2></div><p>Water, then soil, then systems. Explore the chapters that changed what I ask and how I work.</p></div><nav class="journey-eras" aria-label="Choose a chapter of the research journey"><span class="journey-track" aria-hidden="true"><span></span></span>{era_links}</nav><div class="journey-chapters">{''.join(era_panels)}</div><p class="sr-only" role="status" data-journey-status></p></section>
{END}'''
page=ROOT/'writings/research-journey.html';source=page.read_text()
assert START in source and END in source
output=source.split(START)[0]+content+source.split(END)[1]
if '--check' in sys.argv:
    if output!=source:raise SystemExit('Groundwork is stale. Run npm run groundwork.')
    print(f'Verified Groundwork: {len(papers)} sourced papers and {len(chapters)} journey chapters.')
else:
    page.write_text(output);print('Rendered Groundwork question map and timeline.')
