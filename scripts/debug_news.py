import urllib.request
import json

url = "https://yaire-591ca-default-rtdb.firebaseio.com/radio_state/news.json"
data = json.loads(urllib.request.urlopen(url).read().decode('utf-8'))
items = data.get('items', [])
print(f"Total: {len(items)}")
for i, x in enumerate(items[:40]):
    print(f"{i+1}. [{x.get('category')}] {x.get('title')}")

