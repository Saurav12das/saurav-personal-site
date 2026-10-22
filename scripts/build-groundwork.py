"""Render the Groundwork page body from the research record; no production build needed."""
from pathlib import Path
from html import escape as e
import json, sys
ROOT=Path(__file__).resolve().parents[1]
data=json.loads((ROOT/'data/groundwork.json').read_text())
papers=data['papers'];chapters=data['chapters'];other=data['otherWork'];open_question=data['openQuestion'];fst=data['fst']
readings=fst['readings'];systems={s['id']:s for s in fst['systems']}
ids={p['id'] for p in papers}
assert len(ids)==len(papers)
assert all(set(p['related']) <= ids for p in papers)
reading_ids={r['id'] for r in readings}
assert len(reading_ids)==len(readings)
anchors={f'paper-{i}' for i in ids}|{f'work-{w["id"]}' for w in other}|{'open-question'}
assert all(set(d['from'])<=reading_ids and all(h[1:] in anchors for _,h in d['to']) for d in fst['dots'])
assert fst['next']['href'][1:] in anchors
START='<!-- GROUNDWORK INTERACTIVE START -->';END='<!-- GROUNDWORK INTERACTIVE END -->'
SCHOLAR='https://scholar.google.com/citations?user=184srWEAAAAJ&amp;hl=en'
def external(url,label,cls=''):
    return f'<a class="{cls}" href="{e(url)}" target="_blank" rel="noopener noreferrer">{label} <span aria-hidden="true">↗</span></a>'
def preprint(p):return p['status'].lower().startswith('preprint')
def flagged(p):return preprint(p) or p['status'].lower().startswith('position')
def status_flag(p):return f'<span class="is-preprint">{"Preprint" if preprint(p) else e(p["status"])}</span>' if flagged(p) else ''
def num(i):return f'{i+1:02d}'
def letter(i):return chr(65+i)
WORDS=['No','One','Two','Three','Four','Five','Six','Seven','Eight','Nine']

# Masthead: the name, the thesis, and the page at a glance.
first_year=chapters[0]['years'].split('–')[0];last_year=chapters[-1]['years'].split('–')[-1]
hero=f'''<header class="ground-hero"><p class="ground-kicker">Groundwork · Science &amp; research · by Saurav Das</p><h1>Groundwork.</h1><p class="ground-deck">One question keeps becoming the next.</p><div class="ground-hero-grid"><p class="ground-intro">From microbes in Assam’s groundwater to soil health in Nebraska and four decades of farming systems in Pennsylvania. A life of looking beneath the surface, and connecting what I find.</p><dl class="ground-facts" aria-label="Groundwork at a glance"><div><dt>Papers here</dt><dd>{len(papers)+len(other)+len(readings)}</dd></div><div><dt>In the thread</dt><dd>{len(papers)}</dd></div><div><dt>From the trial</dt><dd>{len(readings)}</dd></div><div><dt>Chapters</dt><dd>{len(chapters)}</dd></div><div><dt>Years</dt><dd>{e(first_year)}–{e(last_year)}</dd></div></dl></div><nav class="ground-hero-links" aria-label="On this page"><a href="#research-thread">The thread <span aria-hidden="true">↓</span></a><a href="#field-trial">The field trial <span aria-hidden="true">↓</span></a><a href="#connecting-dots">Connecting the dots <span aria-hidden="true">↓</span></a><a href="#life-journey">The journey <span aria-hidden="true">↓</span></a><a href="#selected-work">Other work <span aria-hidden="true">↓</span></a><a href="{SCHOLAR}" target="_blank" rel="noopener noreferrer">All publications <span aria-hidden="true">↗</span></a></nav></header>'''

# The thread: five papers as one sequence of questions, every step visible.
index=''.join(f'<li><a href="#paper-{p["id"]}" data-thread-link="{p["id"]}"><span class="thread-num">{num(i)}</span><span class="thread-name">{e(p["short"])}</span><span class="thread-year">{e(p["year"])}{" · preprint" if preprint(p) else ""}</span></a></li>' for i,p in enumerate(papers))
steps=[]
for i,p in enumerate(papers):
    links=''.join(f'<a href="#paper-{q["id"]}">{e(q["short"])}</a>' for q in papers if q['id'] in p['related'])
    flag='<span class="is-preprint">Preprint</span>' if preprint(p) else ''
    bridge=f'<div class="thread-bridge"><span class="bridge-mark" aria-hidden="true">↓</span><p>{e(p["next"])}</p></div>'
    steps.append(f'''<li class="thread-step" id="paper-{p['id']}"><div class="step-rail" aria-hidden="true"><span class="step-num">{num(i)}</span></div><article class="step-body" aria-labelledby="question-{p['id']}"><p class="ground-kicker"><span>Question {num(i)} of {num(len(papers)-1)}</span><span>{e(p['year'])}</span><span>{e(p['stage'])}</span>{flag}</p><h3 id="question-{p['id']}">{e(p['question'])}</h3><p class="step-answer">{e(p['answer'])}</p><p class="step-caution"><span>Leaves open</span>{e(p['caution'])}</p><div class="step-citation"><span class="paper-status{' is-preprint' if preprint(p) else ''}">{e(p['status'])}</span><p class="citation-title">{e(p['title'])}</p><p class="citation-meta">{e(p['authors'])} · {e(p['journal'])} · {e(p['year'])}</p>{external(p['url'],'Read the preprint' if preprint(p) else 'Read the paper','ground-link')}</div><p class="step-links"><span>Connected to</span>{links}</p></article>{bridge}</li>''')
thread=f'''<section class="ground-section" id="research-thread" aria-labelledby="research-thread-title"><div class="ground-section-heading"><p class="ground-kicker"><span>01</span><span>The thread</span></p><h2 id="research-thread-title">Five papers, one question at a time.</h2><p>Each study answered part of a question and left the next one open. Read them in order, or jump to a step.</p></div><ol class="thread-index" aria-label="Steps in the thread">{index}</ol><ol class="thread-steps">{''.join(steps)}</ol><div class="ground-open-question" id="open-question"><p class="ground-kicker"><span>Still open</span></p><div class="open-question-body"><p>{e(open_question['text'])}</p><a href="{e(open_question['href'])}">{e(open_question['link'])} <span aria-hidden="true">↗</span></a></div></div><p class="ground-method">{e(data['connectionNote'])}</p></section>'''

# The field trial: one field, three systems, five readings of the same record.
def track(sid,width,band=None):
    pale=f'<span class="fst-band is-{sid}" style="left:{width:g}%;width:{band:g}%"></span>' if band else ''
    return f'<span class="fst-track" aria-hidden="true"><span class="fst-bar is-{sid}" style="width:{width:.1f}%"></span>{pale}</span>'
def carbon_figure(c):
    groups=[]
    for g in c['groups']:
        base=g['values']['cnv'];rows=[]
        for sid in systems:
            v=g['values'][sid]
            diff='' if sid=='cnv' else f'<span class="fst-diff"><span class="sr-only">, </span>+{v-base:.1f}<span class="sr-only"> over conventional</span></span>'
            rows.append(f'<li><span class="fst-bar-name">{e(systems[sid]["name"])}</span>{track(sid,100*v/c["scale"])}<span class="fst-value">{v:.1f}{diff}</span></li>')
        groups.append(f'<div class="fst-bar-group"><p class="fst-group-label">{e(g["label"])}</p><ul class="fst-bars">{"".join(rows)}</ul></div>')
    return f'<figure class="fst-figure"><figcaption class="fst-figure-title">{e(c["title"])} <span>{e(c["unit"])}</span></figcaption>{"".join(groups)}<p class="fst-figure-note">{e(c["note"])}</p><p class="fst-figure-source">Source: {e(c["source"])}</p></figure>'
def footprint_figure(f):
    rows=''.join(f'<li><span class="fst-bar-name">{e(systems[r["system"]]["name"])}</span>{track(r["system"],r["low"],r["high"]-r["low"])}<span class="fst-value">{e(r["label"])}</span></li>' for r in f['rows'])
    return f'<figure class="fst-figure"><figcaption class="fst-figure-title">{e(f["title"])} <span>{e(f["unit"])}</span></figcaption><div class="fst-bar-group"><ul class="fst-bars">{rows}</ul><p class="fst-axis" aria-hidden="true"><span>0</span><span>50</span><span>100%</span></p></div><p class="fst-figure-note">{e(f["note"])}</p><p class="fst-figure-source">Source: {e(f["source"])}</p></figure>'
figures={'carbon':carbon_figure(fst['carbon']),'footprint':footprint_figure(fst['footprint'])}
short={r['id']:r['short'] for r in readings}
system_items=''.join(f'<li class="fst-system"><p class="fst-system-name"><span class="fst-swatch is-{s["id"]}" aria-hidden="true"></span>{e(s["name"])}</p><p class="fst-system-model">{e(s["model"])}</p><dl><div><dt>Rotation</dt><dd>{e(s["rotation"])}</dd></div><div><dt>Fertility</dt><dd>{e(s["fertility"])}</dd></div></dl><p class="fst-plot" aria-hidden="true"><span>Full tillage</span><span>Reduced tillage</span></p></li>' for s in fst['systems'])
reading_index=''.join(f'<li><a href="#fst-{r["id"]}"><span class="thread-num">{letter(i)}</span><span class="thread-name">{e(r["short"])}</span><span class="thread-year">{e(r["year"])}{" · preprint" if preprint(r) else ""}</span></a></li>' for i,r in enumerate(readings))
reading_items=[]
for i,r in enumerate(readings):
    meets=[]
    for d in fst['dots']:
        for label,href in d['to']:
            if r['id'] in d['from'] and (label,href) not in meets:meets.append((label,href))
    links=''.join(f'<a href="{e(h)}">{e(l)}</a>' for l,h in meets)
    reading_items.append(f'''<li class="thread-step fst-reading" id="fst-{r['id']}"><div class="step-rail" aria-hidden="true"><span class="step-num">{letter(i)}</span></div><article class="step-body" aria-labelledby="reading-{r['id']}"><p class="ground-kicker"><span>Reading {letter(i)} of {letter(len(readings)-1)}</span><span>{e(r['year'])}</span><span>{e(r['short'])}</span>{status_flag(r)}</p><h3 id="reading-{r['id']}">{e(r['question'])}</h3><p class="step-answer">{e(r['finding'])}</p>{figures.get(r.get('figure'),'')}<p class="step-caution"><span>Read with care</span>{e(r['caution'])}</p><div class="step-citation"><span class="paper-status{' is-preprint' if flagged(r) else ''}">{e(r['status'])}</span><p class="citation-title">{e(r['title'])}</p><p class="citation-meta">{e(r['authors'])} · {e(r['journal'])} · {e(r['year'])}</p>{external(r['url'],'Read the preprint' if preprint(r) else 'Read the paper','ground-link')}</div><p class="step-links"><span>Meets</span>{links}</p></article></li>''')
field=f'''<section class="ground-section" id="field-trial" aria-labelledby="field-trial-title"><div class="ground-section-heading"><p class="ground-kicker"><span>02</span><span>The field trial</span></p><h2 id="field-trial-title">{e(fst['heading'])}</h2><p>{e(fst['aside'])}</p></div><p class="fst-intro">{e(fst['intro'])}</p><ol class="fst-systems" aria-label="The three systems">{system_items}</ol><p class="fst-tillage">{e(fst['tillage'])}</p><h3 class="fst-subhead">Five readings of one record</h3><ol class="thread-index fst-index" aria-label="Readings of the trial">{reading_index}</ol><ol class="thread-steps">{''.join(reading_items)}</ol></section>'''

# Connecting the dots: where the trial meets the rest of the work.
dot_items=[]
for i,d in enumerate(fst['dots']):
    froms=''.join(f'<a href="#fst-{rid}">{e(short[rid])}</a>' for rid in d['from'])
    tos=''.join(f'<a href="{e(h)}">{e(l)}</a>' for l,h in d['to'])
    dot_items.append(f'<li class="fst-dot"><div class="fst-dot-head"><span class="fst-dot-num">{num(i)}</span><h3>{e(d["title"])}</h3></div><div class="fst-dot-body"><p>{e(d["text"])}</p><div class="fst-link"><p class="fst-end"><span>From the trial</span>{froms}</p><span class="fst-wire" aria-hidden="true"></span><p class="fst-end"><span>Meets</span>{tos}</p></div></div></li>')
nxt=fst['next']
dots=f'''<section class="ground-section" id="connecting-dots" aria-labelledby="connecting-dots-title"><div class="ground-section-heading"><p class="ground-kicker"><span>03</span><span>Connecting the dots</span></p><h2 id="connecting-dots-title">Where the field meets the thread.</h2><p>{WORDS[len(fst['dots'])]} patterns that only show up when the readings are laid side by side, and the ideas elsewhere in my work they meet.</p></div><ol class="fst-dots">{''.join(dot_items)}</ol><div class="ground-open-question fst-next"><p class="ground-kicker"><span>What the trial asks next</span></p><div class="open-question-body"><p>{e(nxt['question'])}</p><p class="fst-next-caution">{e(nxt['caution'])}</p><a href="{e(nxt['href'])}">{e(nxt['link'])} <span aria-hidden="true">↑</span></a></div></div><p class="ground-method">Connections are my reading across the papers, not findings of any single one. The per-year figure is arithmetic on the reported stocks, not a measured rate.</p></section>'''

# The journey: three chapters side by side.
chapter_items=[]
for i,c in enumerate(chapters):
    link=external(c['href'],e(c['link']),'ground-link') if c['href'].startswith('https://') else f'<a class="ground-link" href="{c["href"]}">{e(c["link"])} <span aria-hidden="true">↗</span></a>'
    chapter_items.append(f'''<li class="journey-chapter" id="chapter-{c['id']}"><article aria-labelledby="chapter-title-{c['id']}"><p class="ground-kicker"><span>Chapter {num(i)}</span><span>{e(c['years'])}</span></p><p class="chapter-word">{e(c['word'])}</p><h3 id="chapter-title-{c['id']}">{e(c['label'])}</h3><p class="chapter-place">{e(c['place'])} · {e(c['institution'])}</p><p class="chapter-question">{e(c['question'])}</p><p class="chapter-body">{e(c['body'])}</p><div class="chapter-carry"><span>What I carried forward</span><p>{e(c['carry'])}</p></div><p class="chapter-tags">{''.join('<span>'+e(t)+'</span>' for t in c['tags'])}</p>{link}</article></li>''')
journey=f'''<section class="ground-section" id="life-journey" aria-labelledby="life-journey-title"><div class="ground-section-heading"><p class="ground-kicker"><span>04</span><span>The journey</span></p><h2 id="life-journey-title">Water, then soil, then systems.</h2><p>Three places that changed what I ask and how I work.</p></div><ol class="journey-grid">{''.join(chapter_items)}</ol></section>'''

# Other work: the remaining papers around the thread.
pubs=''.join(f'<li class="pub" id="work-{e(w["id"])}"><p class="ground-kicker"><span>{e(w["year"])}</span><span>{e(w["venue"])}</span></p><h3><a href="{e(w["url"])}" target="_blank" rel="noopener noreferrer">{e(w["title"])} <span aria-hidden="true">↗</span></a></h3><p>{e(w["summary"])}</p></li>' for w in other)
selected=f'''<section class="ground-section" id="selected-work" aria-labelledby="selected-work-title"><div class="ground-section-heading"><p class="ground-kicker"><span>05</span><span>Other threads in the work</span></p><h2 id="selected-work-title">Mechanisms, microbes &amp; the bigger picture.</h2><p>{len(other)} more papers around the thread: evidence, mechanisms, and where soil health claims hold up.</p></div><ol class="pub-list">{pubs}</ol></section>'''

connect=f'''<section class="ground-connect" aria-labelledby="ground-connect-title"><p class="ground-kicker"><span>The journey is a collaborative one</span></p><h2 id="ground-connect-title">Another dot to connect?</h2><p>A research question, a shared field site, or an idea worth testing. I’d like to hear it.</p><div><a href="{SCHOLAR}" target="_blank" rel="noopener noreferrer">All publications ↗</a><a href="mailto:saurav12das@gmail.com">Start a conversation ↗</a><a href="/about.html">More of the story ↗</a></div></section>'''

content=f'''{START}
{hero}
{thread}
{field}
{dots}
{journey}
{selected}
{connect}
{END}'''
page=ROOT/'writings/research-journey.html';source=page.read_text()
assert START in source and END in source
output=source.split(START)[0]+content+source.split(END)[1]
if '--check' in sys.argv:
    if output!=source:raise SystemExit('Groundwork is stale. Run npm run groundwork.')
    print(f'Verified Groundwork: {len(papers)} papers in the thread, {len(readings)} field-trial readings, {len(other)} other papers, and {len(chapters)} journey chapters.')
else:
    page.write_text(output);print('Rendered the Groundwork thread, field trial, journey, and publication list.')
