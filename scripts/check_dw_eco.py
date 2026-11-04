import urllib.request
import xml.etree.ElementTree as ET

url = 'https://rss.dw.com/xml/rss-sp-eco'
r = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}))
root = ET.fromstring(r.read())
items = root.findall('.//item')
print(f"Total in DW Economía: {len(items)}")
for it in items[:8]:
    t = it.find('title').text or ''
    print("  *", t.strip())

