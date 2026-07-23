import sys
import re
from collections import defaultdict
from datetime import datetime

filename = "Chat de WhatsApp con mi novia linda 💗.txt"
with open(filename, "r", encoding="utf-8") as f:
    lines = f.readlines()

monthly_stats = defaultdict(lambda: {"msgs": 0, "words": 0, "media": 0})
total_msgs = 0

for line in lines:
    match = re.match(r'^(\d{1,2})/(\d{1,2})/(\d{4}),', line)
    if match:
        day, month, year = match.groups()
        month_key = f"{year}-{month.zfill(2)}"
        
        monthly_stats[month_key]["msgs"] += 1
        total_msgs += 1
        
        if "<Multimedia omitido>" in line:
            monthly_stats[month_key]["media"] += 1
        
        # approximate words
        parts = line.split("-", 1)
        if len(parts) > 1:
            msg = parts[1].split(":", 1)
            if len(msg) > 1:
                monthly_stats[month_key]["words"] += len(msg[1].split())

with open("chat_stats.txt", "w", encoding="utf-8") as out:
    for mk in sorted(monthly_stats.keys()):
        stats = monthly_stats[mk]
        out.write(f"Mes {mk}: {stats['msgs']} mensajes, {stats['words']} palabras, {stats['media']} fotos/videos\n")
