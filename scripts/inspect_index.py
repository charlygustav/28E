import re

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

print('Length of index.html:', len(text), 'bytes')
sections = re.findall(r'<section[^>]*id=["\']([^"\']+)["\']', text)
print('Section IDs:', sections)
titles = re.findall(r'<h[1-3][^>]*>(.*?)</h[1-3]>', text)
print('First 10 Headings:')
for t in titles[:10]:
    clean = re.sub(r'<[^>]+>', '', t).strip()
    if clean:
        print('  -', clean)

