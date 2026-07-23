with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Fix percentText
html = html.replace("const percentText = document.getElementById('loader-percent-v4');", "const percentTextV4 = document.getElementById('loader-percent-v4');")

# Fix loaderEl
html = html.replace("const loaderEl = document.getElementById('loader');\\n            const sceneEl = document.getElementById('loader-3d-scene');", "const sceneEl = document.getElementById('loader-3d-scene');")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Fixed duplicate variables.')
