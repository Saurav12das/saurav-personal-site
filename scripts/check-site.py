"""Verify the static site's local links, anchors, image alternatives, and feed."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import json
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
PAGES = ['index.html','brain-fog.html','brain-fog/automation-and-economics.html','about.html','writing.html','products.html','experiments.html','apps.html','writings/books.html','writings/research-journey.html','writings/watching.html','follow.html'] + [str(p.relative_to(ROOT)) for p in sorted((ROOT/'writings').glob('writing__*.html'))]
class Page(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.ids=[];self.links=[];self.missing_alt=[];self.h1=0;self.metadata={};self.feed(source)
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if 'id' in a:self.ids.append(a['id'])
        if tag=='h1':self.h1+=1
        if tag=='img' and 'alt' not in a:self.missing_alt.append(a.get('src'))
        for key in ('href','src'):
            if key in a:self.links.append(a[key])

def resolve(path, parent):
    target=ROOT/path.lstrip('/') if path.startswith('/') else parent/path
    if target.is_dir():target=target/'index.html'
    if not target.exists() and not target.suffix:target=target.with_suffix('.html')
    return target

config=json.loads((ROOT/'site-links.json').read_text())
errors=[];checked=0
for rel in PAGES:
    path=ROOT/rel;page=Page(path.read_text())
    if rel!='writing.html':
        source=path.read_text()
        assert source.count('data-site-nav')==1, f'{rel}: expected one shared page navigation'
        header=source.split('<!-- SITE HEADER START -->')[1].split('<!-- SITE HEADER END -->')[0]
        for item in config['navigation']:
            assert item['href'] in Page(header).links, f'{rel}: missing {item["label"]} navigation link'
        assert 'id="connect"' in path.read_text(), f'{rel}: missing contact footer'
        for profile in config['connections']:
            assert profile['href'] in page.links, f'{rel}: missing {profile["label"]} link'
    if page.h1!=1:errors.append(f'{rel}: expected 1 h1, got {page.h1}')
    if len(page.ids)!=len(set(page.ids)):errors.append(f'{rel}: duplicate ids')
    if page.missing_alt:errors.append(f'{rel}: images without alt: {page.missing_alt}')
    for link in page.links:
        url=urlsplit(link)
        if url.scheme or url.netloc or url.path.startswith('/_vercel/'):continue
        target=resolve(unquote(url.path),path.parent) if url.path else path
        if not target.exists():errors.append(f'{rel}: missing local target {link}');continue
        if url.fragment and target.suffix=='.html':
            target_page=page if target==path else Page(target.read_text())
            if unquote(url.fragment) not in target_page.ids:errors.append(f'{rel}: missing anchor {link}')
        checked+=1
ET.parse(ROOT/'sitemap.xml')
updates=json.loads((ROOT/'data/updates.json').read_text())
feed_paths={'feed.xml':'brain-fog','feeds/all.xml':None}
feed_paths.update({f'feeds/{section}.xml':section for section in ['groundwork','brain-fog','building','screen-time','bookshelf']})
for rel,section in feed_paths.items():
    feed=ET.parse(ROOT/rel)
    items=feed.findall('./channel/item')
    actual=[item.findtext('guid') for item in items]
    expected=[item['id'] for item in updates if section is None or item['section']==section]
    assert len(actual)==len(set(actual)), f'{rel}: duplicate publication IDs'
    assert set(actual)==set(expected), f'{rel}: missing or misplaced entries'
    assert feed.find('./channel/{http://www.w3.org/2005/Atom}link').get('href')=='https://sauravdas.me/'+rel
    from email.utils import parsedate_to_datetime
    dates=[parsedate_to_datetime(item.findtext('pubDate')) for item in items]
    assert dates==sorted(dates,reverse=True), f'{rel}: entries must be newest first'
    for item in items:
        assert item.findtext('title') and item.findtext('description') and item.findtext('link')
assert 'https://sauravdas.me/brain-fog/automation-and-economics' in [item['id'] for item in updates], 'Preserve the original Brain Fog GUID'
for rel in PAGES[:3]:
    import re
    for script in re.findall(r'<script type="application/ld\+json">(.*?)</script>',(ROOT/rel).read_text(),re.S):json.loads(script)
if errors:
    raise SystemExit('\n'.join(errors))
print(f'PASS: {len(PAGES)} pages, {checked} local references, image alt text, unique anchors, RSS/sitemap XML and structured data.')
