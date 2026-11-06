import os
import shutil
import subprocess
import json

downloads_dir = r"C:\Users\thegi\Downloads"
dest_radio = r"radio"
dest_hf_radio = r"hf_radio28e\radio"

rename_map = {
    "Otis McDonald - Don t Show Your Face.mp3": "Otis McDonald - Don't Show Your Face.mp3",
    "Otis McDonald - Feel Right (feat. The Kount   Sndtrak).mp3": "Otis McDonald - Feel Right (feat. The Kount & Sndtrak).mp3"
}

files = [f for f in os.listdir(downloads_dir) if f.endswith(".mp3")]
print(f"Total MP3 files in Downloads: {len(files)}")

track_metadata = []

for f in sorted(files):
    src_file = os.path.join(downloads_dir, f)
    target_name = rename_map.get(f, f)
    
    # 1. Copy to radio/ and hf_radio28e/radio/
    target_radio = os.path.join(dest_radio, target_name)
    target_hf = os.path.join(dest_hf_radio, target_name)
    
    shutil.copy2(src_file, target_radio)
    shutil.copy2(src_file, target_hf)
    
    # 2. Probe with ffprobe
    cmd = ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", target_radio]
    res = subprocess.run(cmd, capture_output=True, text=True)
    try:
        data = json.loads(res.stdout)
        dur = round(float(data["format"]["duration"]), 1)
        tags = data["format"].get("tags", {})
        
        # Artist / title resolution
        title = tags.get("title") or tags.get("TITLE")
        artist = tags.get("artist") or tags.get("ARTIST")
        
        # Refine artist / title
        if "TrackTribe" in target_name:
            artist = "TrackTribe, Otis McDonald"
            title = "Winter Time is Near"
        elif "Feel Right" in target_name:
            artist = "Otis McDonald, The Kount, Sndtrak"
            title = "Feel Right"
        elif "Involved" in target_name:
            artist = "Otis McDonald, Mani Draper"
            title = "Involved"
        elif "Paulo Coelho" in target_name:
            artist = "Otis McDonald, Mani Draper"
            title = "Paulo Coelho"
        else:
            if not artist or "Otis" in artist:
                artist = "Otis McDonald"
            if not title:
                # derive from filename
                title = target_name.replace("Otis McDonald - ", "").replace(".mp3", "")
        
        # Clean title if needed
        if title == "Don t Show Your Face":
            title = "Don't Show Your Face"

        track_metadata.append({
            "filename": target_name,
            "title": title,
            "artist": artist,
            "src": f"radio/{target_name}",
            "duration": dur
        })
    except Exception as e:
        print(f"Error processing {target_name}: {e}")

print(f"Processed {len(track_metadata)} tracks successfully:")
for t in track_metadata:
    print(f"- {t['title']} | {t['artist']} | {t['duration']}s | {t['src']}")

# Save json for next steps
with open("scripts/new_tracks_data.json", "w", encoding="utf-8") as out:
    json.dump(track_metadata, out, indent=2, ensure_ascii=False)

