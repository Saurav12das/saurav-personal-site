"""Render consistent navigation and contact links from site-links.json.
Run after changing the navigation or the owner's verified public profile links.
Existing article bodies and original article footers are preserved.
"""
from pathlib import Path
from html import escape
import json,re

ROOT=Path(__file__).resolve().parents[1]
CONFIG=json.loads((ROOT/'site-links.json').read_text())
MAIN=['index.html','brain-fog.html','brain-fog/automation-and-economics.html','about.html','products.html','experiments.html','apps.html','writings/books.html','writings/research-journey.html','writings/watching.html','follow.html']
MAIN += sorted(str(p.relative_to(ROOT)) for p in (ROOT/'writings').glob('writing__*.html'))
ESSAYS=sorted(str(p.relative_to(ROOT)) for p in (ROOT/'writings').glob('writing__*.html') if str(p.relative_to(ROOT)) not in MAIN)
VERSION='20261004-2'
CHROME_VERSION='20261005-4'
DESIGN_VERSION='20261005-1'
FONTS='https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300..900;1,300..900&amp;family=DM+Mono:wght@400;500&amp;display=swap'
FEEDS={'research':('Groundwork','groundwork'),'writing':('Brain Fog','brain-fog'),'building':('Building','building'),'watching':('Screen Time','screen-time'),'books':('Bookshelf','bookshelf')}

def section_for(path):
    if 'research-journey' in path:return 'research'
    if 'brain-fog' in path or 'writing__' in path:return 'writing'
    if path in ['products.html','experiments.html','apps.html']:return 'building'
    if 'watching' in path:return 'watching'
    if 'books' in path:return 'books'
    return ''

def header(path):
    links=''.join(f'<li><a href="{escape(item["href"])}" title="{escape(item["description"])}"'+(' aria-current="page"' if item['section']==section_for(path) else '')+f'>{escape(item["label"])}</a></li>' for item in CONFIG['navigation'])
    return f'''<!-- SITE HEADER START -->
<nav class="site-nav" data-site-nav aria-label="Site"><div class="nav-inner"><a class="wordmark" href="/" aria-label="Saurav Das — home"><span class="brand-dot" aria-hidden="true">S</span><span class="brand-name" aria-hidden="true">aurav Das</span><span class="brand-note" aria-hidden="true">stay curious.</span></a><ul class="nav-links">{links}</ul><a class="hello-link" href="#connect">Let’s talk <span aria-hidden="true">↗</span></a></div></nav>
<!-- SITE HEADER END -->'''

def footer(path):
    profiles=''.join(f'<a class="connect-link'+(' connect-link-support' if item.get('kind')=='support' else '')+f'" href="{escape(item["href"])}"'+(' target="_blank" rel="noopener noreferrer"' if item['href'].startswith('https://') else '')+f'><span class="connect-mark" aria-hidden="true">{escape(item["mark"])}</span><span><strong>{escape(item["label"])}</strong><small>{escape(item["description"])}</small></span><span class="connect-arrow" aria-hidden="true">↗</span></a>' for item in CONFIG['connections'])
    links=''.join(f'<a href="{escape(item["href"])}">{escape(item["label"])}</a>' for item in CONFIG['navigation'])
    topic=FEEDS.get(section_for(path))
    follow=''
    if path!='follow.html':
        topic_link=f'<a href="/follow.html#{topic[1]}">Follow {topic[0]} <span aria-hidden="true">↗</span></a>' if topic else ''
        follow=f'<div class="connect-follow"><div><span class="connect-eyebrow">KEEP THE THREAD GOING</span><h2>Follow your curiosity.</h2><p>Choose a topic, or keep up with the whole notebook.</p></div><div class="connect-follow-links">{topic_link}<a href="/follow.html">Explore all feeds <span aria-hidden="true">↗</span></a></div></div>'
    return f'''<!-- SITE FOOTER START -->
<footer class="site-connect" id="connect" aria-labelledby="connect-title"><div class="connect-wrap">{follow}<div class="connect-main"><div class="connect-intro"><span class="connect-eyebrow">THE BEST PART IS THE CONVERSATION</span><h2 id="connect-title">Stay curious.<br><em>Say hello.</em></h2><p>A research question, something to build together, a film I should see, or an idea you can’t shake. Pick your corner of the internet.</p><a class="about-link" href="/about.html">A little more about me <span aria-hidden="true">↗</span></a></div><div class="connect-platforms" aria-label="Find Saurav online">{profiles}</div></div><div class="connect-bottom"><a class="connect-signature" href="/"><span class="brand-dot" aria-hidden="true"></span>Saurav Das</a><nav class="connect-navigation" aria-label="Explore the site">{links}<a href="/about.html">About</a></nav><span class="connect-copyright">© <span data-current-year>2026</span> · Still connecting the dots.</span></div></div></footer>
<!-- SITE FOOTER END -->'''

def support_panel():
    support=next((item for item in CONFIG['connections'] if item.get('kind')=='support'),None)
    if not support:return '<!-- SITE SUPPORT START --><!-- SITE SUPPORT END -->'
    return f'''<!-- SITE SUPPORT START -->
<section class="follow-support" id="support" aria-labelledby="support-title"><div><p class="library-kicker">A LITTLE FUEL FOR THE NEXT QUESTION</p><h2 id="support-title">Enjoying the notebook?</h2><p>If a story, an idea, or a tool here has been useful, you’re welcome to buy me a coffee. Thanks for reading and being part of the conversation.</p></div><a class="library-button" href="{escape(support['href'])}" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">☕</span> {escape(support['label'])} <span aria-hidden="true">↗</span></a></section>
<!-- SITE SUPPORT END -->'''

for name in MAIN+ESSAYS:
    p=ROOT/name;s=p.read_text()
    if name=='follow.html':
        s=re.sub(r'<!-- SITE SUPPORT START -->.*?<!-- SITE SUPPORT END -->',lambda _:support_panel(),s,flags=re.S)
    if name in MAIN:
        if '<!-- SITE HEADER START -->' in s:
            s=re.sub(r'<!-- SITE HEADER START -->.*?<!-- SITE HEADER END -->',lambda _:header(name),s,flags=re.S)
        else:
            # A footer navigation is not a page header.
            page_content=s.split('<!-- SITE FOOTER START -->',1)[0]
            if re.search(r'<nav\b',page_content):
                s=re.sub(r'<nav\b[^>]*>.*?</nav>',lambda _:header(name),s,count=1,flags=re.S)
            else:
                s=re.sub(r'(<body\b[^>]*>)',lambda m:m[0]+'\n'+header(name),s,count=1)
    if '<!-- SITE FOOTER START -->' in s:
        s=re.sub(r'<!-- SITE FOOTER START -->.*?<!-- SITE FOOTER END -->',lambda _:footer(name),s,flags=re.S)
    elif name in MAIN and re.search(r'<footer\b',s):
        s=re.sub(r'<footer\b[^>]*>.*?</footer>',lambda _:footer(name),s,count=1,flags=re.S)
    else:s=s.replace('</body>',footer(name)+'\n</body>')
    if '/site-chrome.css' not in s:s=s.replace('</head>',f'<link rel="stylesheet" href="/site-chrome.css?v={CHROME_VERSION}">\n</head>')
    else:s=re.sub(r'/site-chrome.css\?v=[^"\s]+',f'/site-chrome.css?v={CHROME_VERSION}',s)
    if name in MAIN and '/site.js' not in s:s=s.replace('</body>',f'<script defer src="/site.js?v={VERSION}"></script>\n</body>')
    if name in MAIN:s=re.sub(r'<script defer src="/dock.js[^\"]*"></script>','',s)
    if 'rel="icon"' not in s:s=s.replace('</head>','<link rel="icon" href="/images/brain-fog/favicon.svg" type="image/svg+xml">\n</head>')
    # Keep archive links attached to the single writing destination.
    s=s.replace('href="/writing.html"','href="/brain-fog.html#essays"').replace('href="/#writing"','href="/brain-fog.html#essays"')
    # Preserve existing feed URLs; advertise the site-wide and section feeds.
    feed_links=[('All updates — Saurav Das','/feeds/all.xml')]
    topic=FEEDS.get(section_for(name))
    if topic:feed_links.append((topic[0]+' — Saurav Das','/feeds/'+topic[1]+'.xml'))
    for title,href in feed_links:
        if f'href="{href}"' not in s.split('</head>')[0]:
            s=s.replace('</head>',f'<link rel="alternate" type="application/rss+xml" title="{escape(title)}" href="{href}">\n</head>')
    # One font request and one final design layer for every public site page.
    s=re.sub(r'<link\b[^>]*href="https://fonts.googleapis.com/css2?\?[^\"]*"[^>]*>\s*','',s,flags=re.S)
    s=re.sub(r'<link\b[^>]*href="/design-system.css[^\"]*"[^>]*>\s*','',s)
    s=s.replace('</head>',f'<link rel="stylesheet" href="{FONTS}">\n<link rel="stylesheet" href="/design-system.css?v={DESIGN_VERSION}">\n</head>')
    def design_classes(match):
        tag=match[0]
        current=re.search(r'class="([^"]*)"',tag)
        classes=current[1].split() if current else []
        for classname in ['site-system']+(['site-article'] if 'writing__' in name else []):
            if classname not in classes:classes.append(classname)
        value='class="'+' '.join(classes)+'"'
        return re.sub(r'class="[^"]*"',value,tag) if current else tag[:-1]+' '+value+'>'
    s=re.sub(r'<body\b[^>]*>',design_classes,s,count=1)
    p.write_text(s)
print(f'Rendered navigation and contact links for {len(MAIN)} main pages and {len(ESSAYS)} existing essays.')
