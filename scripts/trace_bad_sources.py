import urllib.request
import xml.etree.ElementTree as ET

import sys, os
sys.path.insert(0, os.path.abspath('.'))
from hf_radio28e.news_service import FEEDS, clean_title

targets = ['bibi', 'futuro ya no', 'gasolina subsidiada', 'paredes', 'pasaporte', 'digitel', 'movistar']

for tag, url in FEEDS:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as r:
            root = ET.fromstring(r.read())
            for item in root.findall('.//item'):
                t = item.find('title')
                link = item.find('link')
                if t is not None and t.text:
                    title = clean_title(t.text)
                    for tg in targets:
                        if tg in title.lower():
                            l_txt = link.text if link is not None else ''
                            print(f"FOUND: [{tag}] {title}")
                            print(f"       Feed: {url}")
                            print(f"       Link: {l_txt}")
    except Exception as e:
        pass
