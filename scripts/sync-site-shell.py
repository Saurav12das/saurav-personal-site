"""Render consistent navigation and contact links from site-links.json.
Run after changing the navigation or the owner's verified public profile links.
Existing article bodies and original article footers are preserved.
"""
from pathlib import Path
from html import escape
import json,re

ROOT=Path(__file__).resolve().parents[1]
CONFIG=json.loads((ROOT/'site-links.json').read_text())
MAIN=['index.html','brain-fog.html','brain-fog/automation-and-economics.html','about.html','products.html','experiments.html','apps.html','writings/books.html','writings/research-journey.html','writings/watching.html']
ESSAYS=sorted(str(p.relative_to(ROOT)) for p in (ROOT/'writings').glob('writing__*.html'))
VERSION='20261004-2'

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
<nav class="site-nav" data-site-nav aria-label="Site"><div class="nav-inner"><a class="wordmark" href="/" aria-label="Saurav Das — home"><span class="brand-dot" aria-hidden="true"></span><span>Saurav Das</span><span class="brand-note">stay curious.</span></a><ul class="nav-links">{links}</ul><a class="hello-link" href="#connect">Let’s talk <span aria-hidden="true">↗</span></a></div></nav>
<!-- SITE HEADER END -->'''

def footer():
    profiles=''.join(f'<a class="connect-link" href="{escape(item["href"])}"'+(' target="_blank" rel="noopener noreferrer"' if item['href'].startswith('https://') else '')+f'><span class="connect-mark" aria-hidden="true">{escape(item["mark"])}</span><span><strong>{escape(item["label"])}</strong><small>{escape(item["description"])}</small></span><span class="connect-arrow" aria-hidden="true">↗</span></a>' for item in CONFIG['connections'])
    links=''.join(f'<a href="{escape(item["href"])}">{escape(item["label"])}</a>' for item in CONFIG['navigation'])
    return f'''<!-- SITE FOOTER START -->
<footer class="site-connect" id="connect" aria-labelledby="connect-title"><div class="connect-wrap"><div class="connect-main"><div class="connect-intro"><span class="connect-eyebrow">THE BEST PART IS THE CONVERSATION</span><h2 id="connect-title">Stay curious.<br><em>Say hello.</em></h2><p>A research question, something to build together, a film I should see, or an idea you can’t shake. Pick your corner of the internet.</p><a class="about-link" href="/about.html">A little more about me <span aria-hidden="true">↗</span></a></div><div class="connect-platforms" aria-label="Find Saurav online">{profiles}</div></div><div class="connect-bottom"><a class="connect-signature" href="/"><span class="brand-dot" aria-hidden="true"></span>Saurav Das</a><nav class="connect-navigation" aria-label="Explore the site">{links}<a href="/about.html">About</a></nav><span class="connect-copyright">© <span data-current-year>2026</span> · Still connecting the dots.</span></div></div></footer>
<!-- SITE FOOTER END -->'''

for name in MAIN+ESSAYS:
    p=ROOT/name;s=p.read_text()
    if name in MAIN:
        if '<!-- SITE HEADER START -->' in s:
            s=re.sub(r'<!-- SITE HEADER START -->.*?<!-- SITE HEADER END -->',lambda _:header(name),s,flags=re.S)
        else:
            s=re.sub(r'<nav\b[^>]*>.*?</nav>',lambda _:header(name),s,count=1,flags=re.S)
    if '<!-- SITE FOOTER START -->' in s:
        s=re.sub(r'<!-- SITE FOOTER START -->.*?<!-- SITE FOOTER END -->',lambda _:footer(),s,flags=re.S)
    elif name in MAIN and re.search(r'<footer\b',s):
        s=re.sub(r'<footer\b[^>]*>.*?</footer>',lambda _:footer(),s,count=1,flags=re.S)
    else:s=s.replace('</body>',footer()+'\n</body>')
    if '/site-chrome.css' not in s:s=s.replace('</head>',f'<link rel="stylesheet" href="/site-chrome.css?v={VERSION}">\n</head>')
    else:s=re.sub(r'/site-chrome.css\?v=[^"\s]+',f'/site-chrome.css?v={VERSION}',s)
    if name in MAIN and '/site.js' not in s:s=s.replace('</body>',f'<script defer src="/site.js?v={VERSION}"></script>\n</body>')
    s=re.sub(r'/site.js(?:\?v=[^"\s]+)?',f'/site.js?v={VERSION}',s)
    s=re.sub(r'/brain-fog.css(?:\?v=[^"\s]+)?',f'/brain-fog.css?v={VERSION}',s)
    s=re.sub(r'/dock.js(?:\?v=[^"\s]+)?',f'/dock.js?v={VERSION}',s)
    if name in MAIN:s=re.sub(r'<script defer src="/dock.js[^\"]*"></script>','',s)
    if 'rel="icon"' not in s:s=s.replace('</head>','<link rel="icon" href="/images/brain-fog/favicon.svg" type="image/svg+xml">\n</head>')
    # Keep archive links attached to the single writing destination.
    s=s.replace('href="/writing.html"','href="/brain-fog.html#essays"').replace('href="/#writing"','href="/brain-fog.html#essays"')
    p.write_text(s)
print(f'Rendered navigation and contact links for {len(MAIN)} main pages and {len(ESSAYS)} existing essays.')
