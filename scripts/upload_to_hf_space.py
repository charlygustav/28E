import os
import json
import time
from huggingface_hub import HfApi, CommitOperationAdd

TOKEN = os.environ.get("HF_TOKEN", "")
REPO_ID = "Dandori/radio28e"
api = HfApi(token=TOKEN)

with open('scripts/new_tracks_data.json', 'r', encoding='utf-8') as f:
    new_tracks = json.load(f)

print(f"Preparing upload of {len(new_tracks)} tracks + radio-stream.html to HF Space '{REPO_ID}'...")

# 1. Build list of CommitOperationAdd
operations = []

# Update radio-stream.html
operations.append(CommitOperationAdd(
    path_in_repo="radio-stream.html",
    path_or_fileobj="hf_radio28e/radio-stream.html"
))

for t in new_tracks:
    filename = t["filename"]
    local_p = os.path.join("hf_radio28e", "radio", filename)
    repo_p = f"radio/{filename}"
    if not os.path.exists(local_p):
        raise FileNotFoundError(f"Missing local file: {local_p}")
    size_mb = os.path.getsize(local_p) / (1024 * 1024)
    print(f"  Adding operation: {filename} ({size_mb:.2f} MB)")
    operations.append(CommitOperationAdd(
        path_in_repo=repo_p,
        path_or_fileobj=local_p
    ))

print(f"\nSubmitting atomic commit with {len(operations)} operations to Hugging Face...")
try:
    commit_info = api.create_commit(
        repo_id=REPO_ID,
        repo_type="space",
        operations=operations,
        commit_message="Add 22 new Otis McDonald & TrackTribe tracks; expand interleaved setlist to 76 tracks (4h 0m)"
    )
    print("Atomic commit successful!")
    print(f"Commit URL / OID: {commit_info}")
except Exception as e:
    print(f"create_commit failed ({e}), falling back to file-by-file upload...")
    # fallback
    for idx, op in enumerate(operations, 1):
        print(f"[{idx}/{len(operations)}] Uploading {op.path_in_repo}...")
        api.upload_file(
            path_or_fileobj=op.path_or_fileobj,
            path_in_repo=op.path_in_repo,
            repo_id=REPO_ID,
            repo_type="space",
            commit_message=f"Upload {op.path_in_repo}"
        )
    print("File-by-file upload completed!")

print("All uploads to Hugging Face Space Dandori/radio28e are complete!")

