import urllib.request
import xml.etree.ElementTree as ET
import sys, os
sys.path.insert(0, os.path.abspath('.'))
from scripts.test_final_pipeline import is_good_headline, clean_title, determine_category

url = 'https://espndeportes.espn.com/espn/rss/news'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    root = ET.fromstring(resp.read())
    items = root.findall('.//item')
    print(f"Total items in ESPN: {len(items)}")
    for it in items[:15]:
        t = it.find('title').text or ''
        link = it.find('link').text or ''
        cats = [c.text for c in it.findall('category') if c.text]
        clean = clean_title(t)
        valid = is_good_headline(clean, link, cats)
        cat = determine_category(clean, 'DEPORTES')
        print(f"[{'VALID' if valid else 'DROP '}] Cat: {cat:12s} | Orig: {t} -> Clean: {clean}")
