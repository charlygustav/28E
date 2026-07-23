with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

import re
scripts = re.findall(r'<script.*?>\s*(.*?)\s*</script>', content, re.DOTALL)
with open('check.js', 'w', encoding='utf-8') as f:
    for s in scripts:
        f.write(s + '\n')
