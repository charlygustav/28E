import os

files_to_check = ['check.js', 'patch_main.js', 'patch_main3.js', 'admin/index.html']
for file_path in files_to_check:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        if 'Spotlight Radio' in content:
            content = content.replace('Spotlight Radio', 'Spotlight Music')
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'Replaced in {file_path}')
