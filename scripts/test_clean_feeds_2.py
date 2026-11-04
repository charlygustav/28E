import urllib.request
import xml.etree.ElementTree as ET

urls = [
    ('DW_ALL', 'https://rss.dw.com/xml/rss-sp-all'),
    ('TALCUAL', 'https://talcualdigital.com/feed/'),
    ('RUNRUNES', 'https://runrun.es/feed/'),
    ('EL_NACIONAL_DO', 'https://elnacional.com.do/feed/'),
    ('EL_DIA_DO', 'https://eldia.com.do/feed/'),
    ('DL_ACTUALIDAD', 'https://www.diariolibre.com/rss/actualidad.xml'),
    ('DL_ECONOMIA', 'https://www.diariolibre.com/rss/economia.xml'),
    ('ELPAIS_INT', 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/internacional/portada'),
    ('ELPAIS_ECO', 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/economia/portada'),
]

for name, u in urls:
    try:
        r = urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'}), timeout=5)
        root = ET.fromstring(r.read())
        items = root.findall('.//item')[:5]
        print(f"\n--- {name} (Total: {len(root.findall('.//item'))}) ---")
        for it in items:
            t = it.find('title').text or ''
            print("  *", t.strip()[:75])
    except Exception as e:
        print(f"{name} ERROR: {e}")

