import urllib.request

dw_urls = [
    'https://rss.dw.com/rdf/rss-sp-all',
    'https://rss.dw.com/xml/rss-sp-cul',
    'https://rss.dw.com/xml/rss-sp-eco',
    'https://rss.dw.com/xml/rss-sp-dep',
    'https://rss.dw.com/xml/rss-sp-ciencia'
]

for u in dw_urls:
    try:
        r = urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'}), timeout=4)
        print("OK:", u)
    except Exception as e:
        print("FAIL:", u, "->", e)

