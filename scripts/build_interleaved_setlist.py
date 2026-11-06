import re
import json

# Read radio-stream.html
with open('hf_radio28e/radio-stream.html', 'r', encoding='utf-8') as f:
    html = f.read()

m = re.search(r'const radioTracks = \[([\s\S]*?)\];', html)
if not m:
    raise Exception("radioTracks not found")

existing_str = m.group(1).strip()
existing_tracks = []
for line in existing_str.splitlines():
    line = line.strip()
    if not line or not line.startswith('{'):
        continue
    # parse object { title: "...", artist: "...", src: "...", duration: ... }
    # regex extract
    t_match = re.search(r'title:\s*"([^"]+)"', line)
    a_match = re.search(r'artist:\s*"([^"]+)"', line)
    s_match = re.search(r'src:\s*"([^"]+)"', line)
    d_match = re.search(r'duration:\s*([0-9.]+)', line)
    if t_match and a_match and s_match and d_match:
        existing_tracks.append({
            "title": t_match.group(1),
            "artist": a_match.group(1),
            "src": s_match.group(1),
            "duration": float(d_match.group(1))
        })

print(f"Loaded {len(existing_tracks)} existing tracks.")

# Load new tracks
with open('scripts/new_tracks_data.json', 'r', encoding='utf-8') as f:
    new_tracks = json.load(f)

print(f"Loaded {len(new_tracks)} new tracks.")

# We want to interleave the 22 new tracks into the 54 existing tracks.
# Total tracks will be 76.
# Let's order the 22 new tracks intentionally so that Pt. 1 comes before Pt. 2, Holiday comes before Holiday (reprise), etc.
ordered_new_titles = [
    "Find Your Lane",
    "Body, Mind & Soul",
    "Paulo Coelho",
    "Cheers to Frank",
    "Finally the Air Is Cool",
    "Feel Right",
    "Ever Felt, Pt. 1",
    "The H3 Theme",
    "Involved",
    "SUNLIGHT",
    "Survive",
    "Fireworks",
    "Hide from the Heavy",
    "Winter Time is Near",
    "RAGE",
    "Be There",
    "Holiday",
    "Wait for You",
    "Ever Felt, Pt. 2",
    "Good Time",
    "Don't Show Your Face",
    "Holiday (reprise)"
]

new_tracks_by_title = {t['title']: t for t in new_tracks}
sorted_new_tracks = [new_tracks_by_title[title] for title in ordered_new_titles if title in new_tracks_by_title]
# Add any that might be missing
for t in new_tracks:
    if t not in sorted_new_tracks:
        sorted_new_tracks.append(t)

print(f"Sorted new tracks count: {len(sorted_new_tracks)}")

# Interleaving strategy:
# We have 54 existing tracks and 22 new tracks.
# Let's distribute the 22 insertions evenly across positions 1 to 54.
# insertion interval: 54 / 22 ≈ 2.45
# We can insert at indices:
# e.g. after index 2, 4, 7, 9, 12, 14, 17, 19, 22, 24, 27, 29, 32, 34, 37, 39, 42, 44, 47, 49, 51, 53

final_tracks = []
new_idx = 0
step = len(existing_tracks) / len(sorted_new_tracks) # ~2.4545

# Calculate exact insertion points
insert_after_existing_indices = set()
for i in range(len(sorted_new_tracks)):
    pos = int(round((i + 1) * step)) - 1
    insert_after_existing_indices.add(min(pos, len(existing_tracks) - 1))

print(f"Calculated {len(insert_after_existing_indices)} unique insertion points: {sorted(list(insert_after_existing_indices))}")

new_ptr = 0
for idx, track in enumerate(existing_tracks):
    final_tracks.append(track)
    if idx in insert_after_existing_indices and new_ptr < len(sorted_new_tracks):
        final_tracks.append(sorted_new_tracks[new_ptr])
        new_ptr += 1

while new_ptr < len(sorted_new_tracks):
    final_tracks.append(sorted_new_tracks[new_ptr])
    new_ptr += 1

print(f"Total final tracks: {len(final_tracks)}")

# Check total duration
total_seconds = sum(t['duration'] for t in final_tracks)
hours = int(total_seconds // 3600)
minutes = int((total_seconds % 3600) // 60)
seconds = int(total_seconds % 60)
print(f"Total setlist duration: {hours}h {minutes}m {seconds}s ({total_seconds:.1f}s)")

# Print full setlist
for i, t in enumerate(final_tracks, 1):
    tag = " [NEW]" if any(nt['src'] == t['src'] for nt in sorted_new_tracks) else ""
    print(f"{i:2d}. {t['title']} - {t['artist']} ({t['duration']}s){tag}")

# Save final tracks JSON
with open('scripts/interleaved_setlist.json', 'w', encoding='utf-8') as out:
    json.dump(final_tracks, out, indent=2, ensure_ascii=False)

