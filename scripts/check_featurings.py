import re

with open('radio-stream.html', 'r', encoding='utf-8') as f:
    c = f.read()

matches = re.findall(r'\{\s*title:\s*"([^"]+)",\s*artist:\s*"([^"]+)"', c)
for idx, (title, artist) in enumerate(matches, 1):
    if 'feat' in title.lower() or '(' in title:
        print(f"{idx}. Title: {title} | Artist: {artist}")

