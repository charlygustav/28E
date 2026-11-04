import urllib.request
import xml.etree.ElementTree as ET

test_urls = [
    ('DW_ALL', 'https://rss.dw.com/xml/rss-sp-all'),
    ('DW_TECH', 'https://rss.dw.com/xml/rss-sp-tech'),
    ('FRANCE24', 'https://www.france24.com/es/rss'),
    ('BBC', 'https://feeds.bbci.co.uk/mundo/rss.xml'),
    ('EFECTO_COCUYO', 'https://efectococuyo.com/feed/'),
    ('TALCUAL', 'https://talcualdigital.com/feed/'),
    ('RUNRUNES', 'https://runrun.es/feed/'),
    ('LISTIN_DIARIO', 'https://listindiario.com/rss'),
    ('EL_DIA_DO', 'https://eldia.com.do/feed/'),
    ('EP_INTERNACIONAL', 'https://www.europapress.es/rss/rss.aspx?ch=00069'),
    ('EP_DEPORTES', 'https://www.europapress.es/rss/rss.aspx?ch=00067'),
    ('EP_CIENCIA', 'https://www.europapress.es/rss/rss.aspx?ch=00449'),
    ('EP_ECONOMIA', 'https://www.europapress.es/rss/rss.aspx?ch=00136'),
    ('MARCA', 'https://e00-marca.uecdn.es/rss/portada.xml'),
    ('BLOOMBERG_LINEA', 'https://www.bloomberglinea.com/arc/outboundfeeds/rss/')
]

for name, url in test_urls:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = resp.read()
            root = ET.fromstring(data)
            items = root.findall('.//item')
            t1 = items[0].find('title').text if items and items[0].find('title') is not None else 'None'
            print(f"OK [count={len(items):2d}] {name:16s} : {t1[:60]}")
    except Exception as e:
        print(f"FAIL          {name:16s} : {e}")

