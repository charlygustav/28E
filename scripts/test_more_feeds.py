import urllib.request
import xml.etree.ElementTree as ET

test_urls = [
    ('DW_ES', 'https://rss.dw.com/xml/rss-sp-all'),
    ('FRANCE24', 'https://www.france24.com/es/rss'),
    ('BBC_MUNDO', 'https://feeds.bbci.co.uk/mundo/rss.xml'),
    ('CNN_ES', 'https://cnnespanol.cnn.com/feed/'),
    ('TALCUAL', 'https://talcualdigital.com/feed/'),
    ('RUNRUNES', 'https://runrun.es/feed/'),
    ('EL_DIARIO_VE', 'https://eldiario.com/feed/'),
    ('DIARIO_LIBRE', 'https://www.diariolibre.com/rss/portada.xml'),
    ('EL_NACIONAL_DO', 'https://elnacional.com.do/feed/'),
    ('EL_DIA_DO', 'https://eldia.com.do/feed/'),
    ('ACENTO_DO', 'https://acento.com.do/rss/'),
    ('XATAKA', 'https://feeds.weblogssl.com/xataka2'),
    ('GENBETA', 'https://feeds.weblogssl.com/genbeta'),
    ('HIPERTEXTUAL', 'https://hipertextual.com/feed'),
    ('MARCA', 'https://e00-marca.uecdn.es/rss/portada.xml'),
    ('AS_DEPORTES', 'https://feeds.as.com/mrss-s/pages/ep/site/as.com/portada'),
    ('EL_PAIS_INT', 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/internacional/portada'),
    ('EL_PAIS_ECO', 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/economia/portada'),
    ('EL_PAIS_TEC', 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/tecnologia/portada'),
]

for name, url in test_urls:
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })
        with urllib.request.urlopen(req, timeout=6) as resp:
            data = resp.read()
            root = ET.fromstring(data)
            items = root.findall('.//item')
            t1 = items[0].find('title').text if items and items[0].find('title') is not None else 'None'
            print(f"OK [count={len(items):2d}] {name:16s} : {t1[:60]}")
    except Exception as e:
        print(f"FAIL          {name:16s} : {e}")

