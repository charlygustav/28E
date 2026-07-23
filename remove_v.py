with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

import re
# Find menu link for mes-cinco
menu_match = re.search(r'<!-- Cap.tulo V: 5 Meses -->.*?</div>', content, re.DOTALL)
if menu_match:
    content = content.replace(menu_match.group(0), '')
    print('Removed mes-cinco menu link')

# Find section mes-cinco
# We know it starts at <section id="mes-cinco" and ends before <!-- ??? ?? CINEMASCOPE VI
section_match = re.search(r'<section id="mes-cinco".*?</section>', content, re.DOTALL)
if section_match:
    content = content.replace(section_match.group(0), '')
    print('Removed mes-cinco section')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
