import urllib.request
import json
import re

url = 'https://yaire-591ca-default-rtdb.firebaseio.com/config.json'
req = urllib.request.Request(url)
with urllib.request.urlopen(req) as response:
    data = json.loads(response.read().decode())

def clean_title_display(title):
    # Remove leading timestamp if present (e.g. 1779443980848)
    cleaned = re.sub(r'^\d+[\s_]*', '', title)
    # Remove any extra extensions or ugly chars if we want, but let's just do the timestamp
    return cleaned

for song in data.get('songs', []):
    old_title = song.get('title', '')
    new_title = clean_title_display(old_title)
    if new_title != old_title:
        print(f"Renaming: '{old_title}' -> '{new_title}'")
        song['title'] = new_title

req_put = urllib.request.Request(url, method='PUT')
req_put.add_header('Content-Type', 'application/json')
with urllib.request.urlopen(req_put, data=json.dumps(data).encode('utf-8')) as r:
    pass

with open('config.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
