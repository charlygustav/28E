import urllib.request
import xml.etree.ElementTree as ET

import sys, os
sys.path.insert(0, os.path.abspath('.'))
from hf_radio28e.news_service import FEEDS

targets = [
    'informe desde detroit',
    'venezuela libre',
    'implantación definitiva de la radio digital',
    'brasil y los dueños',
    'gardner-johnson'
]

for tag, url in FEEDS:
    try:
        ua = 'Mozilla/5.0' if 'espn' in url else 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0'
        req = urllib.request.Request(url, headers={'User-Agent': ua})
        with urllib.request.urlopen(req, timeout=5) as r:
            root = ET.fromstring(r.read())
            for item in root.findall('.//item'):
                t = (item.find('title').text or '').lower()
                for tgt in targets:
                    if tgt in t:
                        print(f"ENCONTRADO: '{tgt}' en [{tag}] -> {url}")
    except Exception as e:
        pass
