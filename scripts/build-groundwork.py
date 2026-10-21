"""Render the Groundwork page body from the research record; no production build needed."""
from pathlib import Path
from html import escape as e
import json, sys
ROOT=Path(__file__).resolve().parents[1]
data=json.loads((ROOT/'data/groundwork.json').read_text())
papers=data['papers'];chapters=data['chapters'];other=data['otherWork'];open_question=data['openQuestion']
ids={p['id'] for p in papers}
assert len(ids)==len(papers)
assert all(set(p['related']) <= ids for p in papers)
START='<!-- GROUNDWORK INTERACTIVE START -->';END='<!-- GROUNDWORK INTERACTIVE END -->'
SCHOLAR='https://scholar.google.com/citations?user=184srWEAAAAJ&amp;hl=en'
def external(url,label,cls=''):
    return f'<a class="{cls}" href="{e(url)}" target="_blank" rel="noopener noreferrer">{label} <span aria-hidden="true">↗</span></a>'
def preprint(p):return p['status'].lower().startswith('preprint')
def num(i):return f'{i+1:02d}'

# Masthead: the name, the thesis, and the page at a glance.
first_year=chapters[0]['years'].split('–')[0];last_year=chapters[-1]['years'].split('–')[-1]
hero=f'''<header class="ground-hero"><p class="ground-kicker">Groundwork · Science &amp; research · by Saurav Das</p><h1>Groundwork.</h1><p class="ground-deck">One question keeps becoming the next.</p><div class="ground-hero-grid"><p class="ground-intro">From microbes in Assam’s groundwater to soil health in Nebraska and long-term farming systems. A life of looking beneath the surface, and connecting what I find.</p><dl class="ground-facts" aria-label="Groundwork at a glance"><div><dt>Papers here</dt><dd>{len(papers)+len(other)}</dd></div><div><dt>In the thread</dt><dd>{len(papers)}</dd></div><div><dt>Chapters</dt><dd>{len(chapters)}</dd></div><div><dt>Years</dt><dd>{e(first_year)}–{e(last_year)}</dd></div></dl></div><nav class="ground-hero-links" aria-label="On this page"><a href="#research-thread">The thread <span aria-hidden="true">↓</span></a><a href="#life-journey">The journey <span aria-hidden="true">↓</span></a><a href="#selected-work">Other work <span aria-hidden="true">↓</span></a><a href="{SCHOLAR}" target="_blank" rel="noopener noreferrer">All publications <span aria-hidden="true">↗</span></a></nav></header>'''

# The thread: five papers as one sequence of questions, every step visible.
index=''.join(f'<li><a href="#paper-{p["id"]}" data-thread-link="{p["id"]}"><span class="thread-num">{num(i)}</span><span class="thread-name">{e(p["short"])}</span><span class="thread-year">{e(p["year"])}{" · preprint" if preprint(p) else ""}</span></a></li>' for i,p in enumerate(papers))
steps=[]
for i,p in enumerate(papers):
    links=''.join(f'<a href="#paper-{q["id"]}">{e(q["short"])}</a>' for q in papers if q['id'] in p['related'])
    flag='<span class="is-preprint">Preprint</span>' if preprint(p) else ''
    bridge=f'<div class="thread-bridge"><span class="bridge-mark" aria-hidden="true">↓</span><p>{e(p["next"])}</p></div>'
    steps.append(f'''<li class="thread-step" id="paper-{p['id']}"><div class="step-rail" aria-hidden="true"><span class="step-num">{num(i)}</span></div><article class="step-body" aria-labelledby="question-{p['id']}"><p class="ground-kicker"><span>Question {num(i)} of {num(len(papers)-1)}</span><span>{e(p['year'])}</span><span>{e(p['stage'])}</span>{flag}</p><h3 id="question-{p['id']}">{e(p['question'])}</h3><p class="step-answer">{e(p['answer'])}</p><p class="step-caution"><span>Leaves open</span>{e(p['caution'])}</p><div class="step-citation"><span class="paper-status{' is-preprint' if preprint(p) else ''}">{e(p['status'])}</span><p class="citation-title">{e(p['title'])}</p><p class="citation-meta">{e(p['authors'])} · {e(p['journal'])} · {e(p['year'])}</p>{external(p['url'],'Read the preprint' if preprint(p) else 'Read the paper','ground-link')}</div><p class="step-links"><span>Connected to</span>{links}</p></article>{bridge}</li>''')
thread=f'''<section class="ground-section" id="research-thread" aria-labelledby="research-thread-title"><div class="ground-section-heading"><p class="ground-kicker"><span>01</span><span>The thread</span></p><h2 id="research-thread-title">Five papers, one question at a time.</h2><p>Each study answered part of a question and left the next one open. Read them in order, or jump to a step.</p></div><ol class="thread-index" aria-label="Steps in the thread">{index}</ol><ol class="thread-steps">{''.join(steps)}</ol><div class="ground-open-question"><p class="ground-kicker"><span>Still open</span></p><div class="open-question-body"><p>{e(open_question['text'])}</p><a href="{e(open_question['href'])}">{e(open_question['link'])} <span aria-hidden="true">↗</span></a></div></div><p class="ground-method">{e(data['connectionNote'])}</p></section>'''

# The journey: three chapters side by side.
chapter_items=[]
for i,c in enumerate(chapters):
    link=external(c['href'],e(c['link']),'ground-link') if c['href'].startswith('https://') else f'<a class="ground-link" href="{c["href"]}">{e(c["link"])} <span aria-hidden="true">↗</span></a>'
    chapter_items.append(f'''<li class="journey-chapter" id="chapter-{c['id']}"><article aria-labelledby="chapter-title-{c['id']}"><p class="ground-kicker"><span>Chapter {num(i)}</span><span>{e(c['years'])}</span></p><p class="chapter-word">{e(c['word'])}</p><h3 id="chapter-title-{c['id']}">{e(c['label'])}</h3><p class="chapter-place">{e(c['place'])} · {e(c['institution'])}</p><p class="chapter-question">{e(c['question'])}</p><p class="chapter-body">{e(c['body'])}</p><div class="chapter-carry"><span>What I carried forward</span><p>{e(c['carry'])}</p></div><p class="chapter-tags">{''.join('<span>'+e(t)+'</span>' for t in c['tags'])}</p>{link}</article></li>''')
journey=f'''<section class="ground-section" id="life-journey" aria-labelledby="life-journey-title"><div class="ground-section-heading"><p class="ground-kicker"><span>02</span><span>The journey</span></p><h2 id="life-journey-title">Water, then soil, then systems.</h2><p>Three places that changed what I ask and how I work.</p></div><ol class="journey-grid">{''.join(chapter_items)}</ol></section>'''

# Other work: the remaining papers around the thread.
pubs=''.join(f'<li class="pub"><p class="ground-kicker"><span>{e(w["year"])}</span><span>{e(w["venue"])}</span></p><h3><a href="{e(w["url"])}" target="_blank" rel="noopener noreferrer">{e(w["title"])} <span aria-hidden="true">↗</span></a></h3><p>{e(w["summary"])}</p></li>' for w in other)
selected=f'''<section class="ground-section" id="selected-work" aria-labelledby="selected-work-title"><div class="ground-section-heading"><p class="ground-kicker"><span>03</span><span>Other threads in the work</span></p><h2 id="selected-work-title">Mechanisms, microbes &amp; the bigger picture.</h2><p>{len(other)} more papers around the thread: evidence, mechanisms, and where soil health claims hold up.</p></div><ol class="pub-list">{pubs}</ol></section>'''

connect=f'''<section class="ground-connect" aria-labelledby="ground-connect-title"><p class="ground-kicker"><span>The journey is a collaborative one</span></p><h2 id="ground-connect-title">Another dot to connect?</h2><p>A research question, a shared field site, or an idea worth testing. I’d like to hear it.</p><div><a href="{SCHOLAR}" target="_blank" rel="noopener noreferrer">All publications ↗</a><a href="mailto:saurav12das@gmail.com">Start a conversation ↗</a><a href="/about.html">More of the story ↗</a></div></section>'''

content=f'''{START}
{hero}
{thread}
{journey}
{selected}
{connect}
{END}'''
page=ROOT/'writings/research-journey.html';source=page.read_text()
assert START in source and END in source
output=source.split(START)[0]+content+source.split(END)[1]
if '--check' in sys.argv:
    if output!=source:raise SystemExit('Groundwork is stale. Run npm run groundwork.')
    print(f'Verified Groundwork: {len(papers)} papers in the thread, {len(other)} other papers, and {len(chapters)} journey chapters.')
else:
    page.write_text(output);print('Rendered the Groundwork thread, journey, and publication list.')
