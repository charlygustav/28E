import json
import re

with open('scripts/interleaved_setlist.json', 'r', encoding='utf-8') as f:
    tracks = json.load(f)

# Format JS array
lines = ["        const radioTracks = ["]
for i, t in enumerate(tracks):
    comma = "," if i < len(tracks) - 1 else ""
    # escape quotes if any
    title = t['title'].replace('"', '\\"')
    artist = t['artist'].replace('"', '\\"')
    src = t['src'].replace('"', '\\"')
    dur = t['duration']
    lines.append(f'            {{ title: "{title}", artist: "{artist}", src: "{src}", duration: {dur} }}{comma}')
lines.append("        ];")

js_replacement = "\n".join(lines)

target_files = [
    "radio-stream.html",
    "hf_radio28e/radio-stream.html",
    "hf_repo_clone/radio-stream.html"
]

pattern = re.compile(r'([ \t]*const radioTracks = \[[\s\S]*?\];)')

for path in target_files:
    try:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        match = pattern.search(content)
        if match:
            new_content = pattern.sub(js_replacement, content, count=1)
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {path} successfully.")
        else:
            print(f"WARNING: const radioTracks not found in {path}")
    except Exception as e:
        print(f"Error updating {path}: {e}")

