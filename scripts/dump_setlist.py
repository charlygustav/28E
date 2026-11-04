import re

with open('radio-stream.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

in_tracks = False
tracks = []
for l in lines:
    if 'const radioTracks = [' in l:
        in_tracks = True
        continue
    if in_tracks:
        if '];' in l:
            break
        l = l.strip()
        if l.startswith('{') and 'title:' in l:
            tracks.append(l)

print(f"Total: {len(tracks)} canciones")
total_sec = 0

for idx, t in enumerate(tracks, 1):
    m_title = re.search(r'title:\s*"([^"]+)"', t)
    m_artist = re.search(r'artist:\s*"([^"]+)"', t)
    m_dur = re.search(r'duration:\s*([\d\.]+)', t)
    title = m_title.group(1) if m_title else 'Unknown'
    artist = m_artist.group(1) if m_artist else 'Unknown'
    dur = float(m_dur.group(1)) if m_dur else 0
    total_sec += dur
    mins = int(dur // 60)
    secs = int(dur % 60)
    print(f"| **{idx:02d}** | {title} | {artist} | {mins}:{secs:02d} |")

h = int(total_sec // 3600)
m = int((total_sec % 3600) // 60)
s = int(total_sec % 60)
print(f"\nDuración total: {h} horas, {m} minutos y {s} segundos")

