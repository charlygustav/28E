import urllib.request, json

url = 'https://yaire-591ca-default-rtdb.firebaseio.com/radio_state/news.json'
data = json.loads(urllib.request.urlopen(url).read().decode('utf-8'))
items = data.get('items', [])
print(f'Total items: {len(items)}')

for i, x in enumerate(items[:60]):
    print(f"{i+1:3d}. [{x.get('category'):15s}] {x.get('title')}")

