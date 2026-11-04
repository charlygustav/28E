import os
from huggingface_hub import HfApi

TOKEN = "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"
REPO_ID = "Dandori/radio28e"
api = HfApi(token=TOKEN)

files = [
    "I Wish I Knew - Otis McDonald.mp3",
    "Forever Young - Otis McDonald.mp3",
    "Side Steppin' - Otis McDonald.mp3",
    "Truckee - Otis McDonald.mp3",
    "Complicate ya - Otis McDonald.mp3",
    "Treat me this way - Otis McDonald.mp3",
    "Yesterday - Otis McDonald.mp3",
    "BirdBrainz II - Otis McDonald.mp3",
    "That Slapper - Otis McDonald.mp3",
    "3rdEyeBlimp - Otis McDonald.mp3",
    "Fly Away - Otis McDonald.mp3",
    "Stay - Otis McDonald.mp3",
    "Other Way - Otis McDonald.mp3",
    "Behind Closed Doors - Otis McDonald.mp3"
]

print(f"Subiendo {len(files)} canciones de Otis McDonald a {REPO_ID}...")

for idx, f in enumerate(files, 1):
    local_path = os.path.join("hf_radio28e", "radio", f)
    repo_path = f"radio/{f}"
    print(f"[{idx}/{len(files)}] Subiendo {f} ({os.path.getsize(local_path)/(1024*1024):.2f} MB)...")
    try:
        api.upload_file(
            path_or_fileobj=local_path,
            path_in_repo=repo_path,
            repo_id=REPO_ID,
            repo_type="space",
            commit_message=f"Add track: {f}"
        )
        print(f"  -> OK: {f}")
    except Exception as e:
        print(f"  -> ERROR en {f}: {e}")

print("¡Todas las pistas de Otis McDonald han sido subidas!")

