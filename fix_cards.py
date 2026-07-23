with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Fix Timeline Cards Background
html = html.replace('bg-white/50 dark:bg-white/[0.02]', 'bg-zinc-100/50 dark:bg-white/5')

# Fix Timeline Cards Border
html = html.replace('border border-zinc-200/50 dark:border-white/[0.06]', 'border border-zinc-200/50 dark:border-white/10')

# Also in Logros section
html = html.replace('dark:bg-white/[0.02]', 'dark:bg-white/5')
html = html.replace('dark:border-white/[0.06]', 'dark:border-white/10')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Fixed timeline and logros card styles.')
