import urllib.request
import json
import re

url = 'https://yaire-591ca-default-rtdb.firebaseio.com/config.json'
req = urllib.request.Request(url)
with urllib.request.urlopen(req) as response:
    data = json.loads(response.read().decode())

songs = data.get('songs', [])
print(f"Total songs before deduplication: {len(songs)}")

unique_songs = []
seen_titles = set()

def clean_title(title):
    # Remove leading numbers and underscores (e.g., 1779443980848_)
    cleaned = re.sub(r'^\d+[\s_]*', '', title)
    cleaned = cleaned.lower().strip()
    return cleaned

for song in songs:
    ctitle = clean_title(song.get('title', ''))
    if ctitle not in seen_titles:
        seen_titles.add(ctitle)
        unique_songs.append(song)
    else:
        print(f"Removing duplicate: {song['title']}")

print(f"Total songs after deduplication: {len(unique_songs)}")

data['songs'] = unique_songs

req_put = urllib.request.Request(url, method='PUT')
req_put.add_header('Content-Type', 'application/json')
with urllib.request.urlopen(req_put, data=json.dumps(data).encode('utf-8')) as r:
    print("Successfully pushed deduplicated songs to Firebase.")

with open('config.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
