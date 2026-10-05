"""Generate RSS from intentional publication entries, or check for stale feeds.

A page edit alone is not a new publication. Add an entry to data/updates.json
when publishing something readers should receive; retain its ID and date.
"""
from pathlib import Path
from datetime import datetime
from email.utils import format_datetime
from urllib.parse import urlsplit
import argparse
import json
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SITE = 'https://sauravdas.me'
ATOM = 'http://www.w3.org/2005/Atom'
ET.register_namespace('atom', ATOM)
SECTIONS = {
    'groundwork': ('Groundwork', '/writings/research-journey', 'Science, research, and field notes.'),
    'brain-fog': ('Brain Fog', '/brain-fog', 'Writing and weekly visual explorations.'),
    'building': ('Building', '/products', 'Products, apps, and experiments.'),
    'screen-time': ('Screen Time', '/writings/watching', 'Movies, series, and animation through a personal lens.'),
    'bookshelf': ('Bookshelf', '/writings/books', 'Reading notes, reviews, and books to explore.'),
}


def load_entries():
    entries = json.loads((ROOT / 'data/updates.json').read_text())
    ids = set()
    for entry in entries:
        assert entry['section'] in SECTIONS, f"Unknown section: {entry['section']}"
        assert entry['id'] and entry['id'] not in ids, f"Duplicate or empty ID: {entry['id']}"
        ids.add(entry['id'])
        assert entry['title'].strip() and entry['summary'].strip(), 'An update needs a title and summary'
        date = datetime.fromisoformat(entry['published'])
        assert date.utcoffset() is not None, 'Publication dates must include a timezone'
        url = urlsplit(entry['url'])
        assert url.scheme == 'https' and url.netloc == 'sauravdas.me', 'Updates must link to the site'
        target = ROOT / url.path.lstrip('/')
        if target.is_dir():
            target = target / 'index.html'
        if not target.exists():
            target = target.with_suffix('.html')
        assert target.exists(), f"Missing update destination: {entry['url']}"
    return sorted(entries, key=lambda item: datetime.fromisoformat(item['published']), reverse=True)


def render_feed(entries, path, section=None):
    name, home, description = SECTIONS[section] if section else (
        'Stay curious', '/follow', 'New posts from Groundwork, Brain Fog, Building, Screen Time, and Bookshelf.')
    rss = ET.Element('rss', {'version': '2.0'})
    channel = ET.SubElement(rss, 'channel')
    for tag, value in [('title', f'{name} by Saurav Das'), ('link', SITE + home),
                       ('description', description), ('language', 'en-us')]:
        ET.SubElement(channel, tag).text = value
    ET.SubElement(channel, f'{{{ATOM}}}link', {'href': SITE + '/' + path, 'rel': 'self', 'type': 'application/rss+xml'})
    selected = [entry for entry in entries if section is None or entry['section'] == section]
    if selected:
        ET.SubElement(channel, 'lastBuildDate').text = format_datetime(datetime.fromisoformat(selected[0]['published']))
    for entry in selected:
        item = ET.SubElement(channel, 'item')
        ET.SubElement(item, 'title').text = entry['title']
        ET.SubElement(item, 'link').text = entry['url']
        # Historical Brain Fog IDs retain their permalink semantics. Collection
        # announcements use opaque, stable IDs that need not resolve as pages.
        ET.SubElement(item, 'guid', {'isPermaLink': str(entry['id'] == entry['url']).lower()}).text = entry['id']
        ET.SubElement(item, 'pubDate').text = format_datetime(datetime.fromisoformat(entry['published']))
        ET.SubElement(item, 'category').text = SECTIONS[entry['section']][0]
        ET.SubElement(item, 'description').text = entry['summary']
    ET.indent(rss, space='  ')
    return ET.tostring(rss, encoding='utf-8', xml_declaration=True) + b'\n'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Fail if committed feeds differ from publication entries')
    args = parser.parse_args()
    entries = load_entries()
    outputs = {'feeds/all.xml': None, 'feed.xml': 'brain-fog'}
    outputs.update({f'feeds/{section}.xml': section for section in SECTIONS})
    stale = []
    for path, section in outputs.items():
        expected = render_feed(entries, path, section)
        target = ROOT / path
        if args.check:
            if not target.exists() or target.read_bytes() != expected:
                stale.append(path)
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(expected)
    if stale:
        raise SystemExit('Stale feeds: ' + ', '.join(stale) + '. Run npm run feeds.')
    print(f'{"Verified" if args.check else "Generated"} {len(outputs)} feeds from {len(entries)} publication entries.')


if __name__ == '__main__':
    main()
