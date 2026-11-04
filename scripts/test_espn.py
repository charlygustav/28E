import urllib.request
import xml.etree.ElementTree as ET

urls = [
    'https://espndeportes.espn.com/espn/rss/news',
    'https://www.espn.com/espn/rss/deportes/news',
    'https://as.com/rss/tags/ultimas_noticias.xml',
    'https://e00-marca.uecdn.es/rss/futbol.xml'
]

for u in urls:
    try:
        req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as r:
            root = ET.fromstring(r.read())
            items = root.findall('.//item')[:5]
            print(f"\nOK: {u} (count={len(root.findall('.//item'))})")
            for it in items:
                print("  *", (it.find('title').text or '').strip()[:70])
    except Exception as e:
        print(f"\nFAIL: {u} -> {e}")

