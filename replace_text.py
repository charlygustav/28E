import os
file_path = 'index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('Spotlight Radio', 'Spotlight Music')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Replaced Spotlight Radio in index.html')
