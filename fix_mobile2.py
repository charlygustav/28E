import os
import re

file_path = 'voice-channel-widget.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace ANY vc-close button that has weird contents with the good SVG and inline styles
# Pattern: <button ... id="vc-close"> (anything) </button>
pattern = r'<button class="([^"]*)"\s*id="vc-close">.*?</button>'

def repl(match):
    cls = match.group(1)
    # Ensure appearance none and transparent bg
    return f'<button class="{cls}" id="vc-close" style="background: transparent; -webkit-appearance: none; appearance: none; border: none; box-shadow: none;"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>'

content = re.sub(pattern, repl, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed vc-close buttons.")
