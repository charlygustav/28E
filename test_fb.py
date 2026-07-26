import urllib.request
import json

url = 'https://yaire-591ca-default-rtdb.firebaseio.com/config.json'
req = urllib.request.Request(url)
with urllib.request.urlopen(req) as response:
    data = json.loads(response.read().decode())
    
print('Total songs in Firebase:', len(data.get('songs', [])))
