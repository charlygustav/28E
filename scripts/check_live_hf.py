import urllib.request
url = 'https://dandori-radio28e.hf.space/radio-stream.html'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        content = resp.read().decode('utf-8', errors='ignore')
        print('Length of content:', len(content))
        print('First 300 chars:', content[:300])
        print('Has radioTracks:', 'const radioTracks' in content)
except Exception as e:
    print(e)
