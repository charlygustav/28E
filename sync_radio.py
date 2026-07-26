import urllib.request
import json
import os

url = 'https://yaire-591ca-default-rtdb.firebaseio.com/config.json'
req = urllib.request.Request(url)
with urllib.request.urlopen(req) as response:
    data = json.loads(response.read().decode())

existing_songs = data.get('songs', [])
existing_srcs = set(s['src'] for s in existing_songs)
# also checking local urls without raw.github...
for s in existing_songs:
    if 'raw.githubusercontent.com' in s['src']:
        filename = s['src'].split('/')[-1]
        existing_srcs.add(f'radio/{filename}')

radio_dir = 'radio'
added = 0
for file in os.listdir(radio_dir):
    if file.endswith('.mp3'):
        local_src = f'radio/{file}'
        if local_src not in existing_srcs:
            title = file.replace('.mp3', '')
            title = title.replace('_', ' ')
            new_song = {
                'title': title,
                'artist': 'Desconocido',
                'src': local_src
            }
            existing_songs.append(new_song)
            existing_srcs.add(local_src)
            added += 1

data['songs'] = existing_songs

if added > 0:
    req_put = urllib.request.Request(url, method='PUT')
    req_put.add_header('Content-Type', 'application/json')
    with urllib.request.urlopen(req_put, data=json.dumps(data).encode('utf-8')) as r:
        print(f"Success! Added {added} missing songs to Firebase.")
    
    with open('config.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
else:
    print("No missing songs found.")
