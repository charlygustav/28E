import os
import json

radio_dir = 'radio'
songs = []

for file in os.listdir(radio_dir):
    if file.endswith('.mp3'):
        title = file.replace('.mp3', '')
        # attempt to clean up title
        title = title.replace('_', ' ')
        songs.append({
            'title': title,
            'artist': 'Desconocido',
            'src': f'radio/{file}'
        })

print('const allRadioSongs =', json.dumps(songs, indent=4) + ';')
