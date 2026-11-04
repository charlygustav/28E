import urllib.request, json

url = "https://yaire-591ca-default-rtdb.firebaseio.com/radio_state/news.json"
data = json.loads(urllib.request.urlopen(url).read().decode('utf-8'))
items = data.get('items', [])
for it in items:
    title = it.get('title', '')
    if any(k.lower() in title.lower() for k in ['bibi', 'futuro ya no', 'gasolina subsidiada', 'paredes', 'pasaporte']):
        print(f"Category: {it.get('category')} | Title: {it.get('title')}")

