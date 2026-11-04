import subprocess, os, json, datetime, glob

downloads = os.path.expanduser('~/Downloads')
cutoff = datetime.datetime(2026, 11, 3, 19, 52, 0)

exts = ['*.mp3', '*.wav', '*.flac', '*.m4a']
files = []
for ext in exts:
    files.extend(glob.glob(os.path.join(downloads, ext)))

new_files = [f for f in files if datetime.datetime.fromtimestamp(os.path.getmtime(f)) > cutoff]
new_files.sort(key=lambda x: os.path.getmtime(x))

tracks_info = []

for fp in new_files:
    cmd = ['ffprobe', '-v', 'quiet', '-print_format', 'json', '-show_format', fp]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0:
        d = json.loads(res.stdout)
        fmt = d.get('format', {})
        dur = float(fmt.get('duration', 0))
        tags = fmt.get('tags', {})
        title = tags.get('title') or tags.get('TITLE') or os.path.basename(fp).replace(' - Otis McDonald.mp3', '')
        artist = tags.get('artist') or tags.get('ARTIST') or 'Otis McDonald'
        bitrate = int(fmt.get('bit_rate', 0)) // 1000
        tracks_info.append({
            'file': os.path.basename(fp),
            'title': title.strip(),
            'artist': artist.strip(),
            'duration': round(dur, 1),
            'bitrate': bitrate
        })

print(f"Total nuevas encontradas: {len(tracks_info)}")
total_dur = sum(t['duration'] for t in tracks_info)
print(f"Duracion total adicional: {int(total_dur//60)} min {int(total_dur%60)} seg\n")

for i, t in enumerate(tracks_info, 1):
    m = int(t['duration'] // 60)
    s = int(t['duration'] % 60)
    print(f"{i:2d}. {t['title']} — {t['artist']} ({m}:{s:02d}) [{t['bitrate']} kbps]")

