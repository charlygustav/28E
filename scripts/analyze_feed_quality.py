import urllib.request
import xml.etree.ElementTree as ET
import html
import re

feeds = [
    ('DW', 'https://rss.dw.com/xml/rss-sp-all'),
    ('TALCUAL', 'https://talcualdigital.com/feed/'),
    ('RUNRUNES', 'https://runrun.es/feed/'),
    ('EL_DIARIO_VE', 'https://eldiario.com/feed/'),
    ('EL_NACIONAL_DO', 'https://elnacional.com.do/feed/'),
    ('EL_DIA_DO', 'https://eldia.com.do/feed/'),
    ('DIARIO_LIBRE', 'https://www.diariolibre.com/rss/portada.xml'),
    ('XATAKA', 'https://feeds.weblogssl.com/xataka2'),
    ('MARCA', 'https://e00-marca.uecdn.es/rss/portada.xml'),
    ('FRANCE24', 'https://www.france24.com/es/rss'),
]

for name, url in feeds:
    print(f"\n=================== {name} ===================")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0'})
        with urllib.request.urlopen(req, timeout=5) as r:
            root = ET.fromstring(r.read())
            items = root.findall('.//item')[:8]
            for it in items:
                t = it.find('title').text if it.find('title') is not None else ''
                t = html.unescape(t).strip()
                t = re.sub(r'\s+', ' ', t)
                print(f"  * {t}")
    except Exception as e:
        print(f"  Error: {e}")

