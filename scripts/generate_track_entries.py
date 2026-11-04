import json, subprocess, os

files = [
    'I Wish I Knew - Otis McDonald.mp3',
    'Forever Young - Otis McDonald.mp3',
    'Side Steppin\' - Otis McDonald.mp3',
    'Truckee - Otis McDonald.mp3',
    'Complicate ya - Otis McDonald.mp3',
    'Treat me this way - Otis McDonald.mp3',
    'Yesterday - Otis McDonald.mp3',
    'BirdBrainz II - Otis McDonald.mp3',
    'That Slapper - Otis McDonald.mp3',
    '3rdEyeBlimp - Otis McDonald.mp3',
    'Fly Away - Otis McDonald.mp3',
    'Stay - Otis McDonald.mp3',
    'Other Way - Otis McDonald.mp3',
    'Behind Closed Doors - Otis McDonald.mp3'
]

lines = []
for f in files:
    cmd = ['ffprobe', '-v', 'quiet', '-print_format', 'json', '-show_format', os.path.join('radio', f)]
    res = subprocess.run(cmd, capture_output=True, text=True)
    d = json.loads(res.stdout)
    dur = round(float(d['format']['duration']), 1)
    tags = d['format'].get('tags', {})
    title = tags.get('title') or tags.get('TITLE') or f.replace(' - Otis McDonald.mp3', '')
    artist = tags.get('artist') or tags.get('ARTIST') or 'Otis McDonald'
    lines.append(f'            {{ title: "{title.strip()}", artist: "{artist.strip()}", src: "radio/{f}", duration: {dur} }},')

print('\n'.join(lines))

