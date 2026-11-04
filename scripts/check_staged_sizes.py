import subprocess
import os

# Check all untracked and modified files
status_output = subprocess.check_output(['git', 'status', '--porcelain'], text=True)
large_staged = []

for line in status_output.splitlines():
    status = line[:2].strip()
    path = line[3:].strip().strip('"')
    if os.path.isfile(path):
        sz = os.path.getsize(path) / (1024 * 1024)
        if sz > 20: # > 20MB
            large_staged.append((sz, path))

large_staged.sort(reverse=True)
print(f"Files > 20MB in working status: {len(large_staged)}")
for sz, p in large_staged:
    print(f"  {sz:.1f} MB : {p}")

