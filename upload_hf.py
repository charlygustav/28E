from huggingface_hub import HfApi
import os

TOKEN = "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"
REPO_ID = "Dandori/radio28e"
FOLDER = os.path.abspath("hf_radio28e")

print(f"Subiendo contenido desde {FOLDER} a {REPO_ID} con soporte LFS...")
api = HfApi(token=TOKEN)

api.upload_folder(
    folder_path=FOLDER,
    repo_id=REPO_ID,
    repo_type="space",
    commit_message="Deploy 28E Radio 24/7 live stream with LFS"
)

print("¡Subida completada con éxito!")

