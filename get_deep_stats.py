import sys
import re
import emoji
from collections import defaultdict
from datetime import datetime

filename = "Chat de WhatsApp con mi novia linda 💗.txt"
with open(filename, "r", encoding="utf-8") as f:
    lines = f.readlines()

total_msgs = 0
total_words = 0
total_media = 0
late_night_msgs = 0
day_counts = defaultdict(int)
month_counts = defaultdict(int)
sender_counts = defaultdict(int)
emoji_counts = defaultdict(int)
longest_msg = ""
longest_msg_words = 0

jan_msgs = 0
laughs = 0
love_msgs = 0
buenos_dias = 0
buenas_noches = 0
first_msg_date = ""

for line in lines:
    match = re.match(r'^(\d{1,2})/(\d{1,2})/(\d{4}), (\d{1,2}):(\d{2})\s+([ap])\.\s*m\.\s*-\s*(.*?):\s*(.*)', line)
    if match:
        day, month, year, hour, minute, am_pm, sender, text = match.groups()
        
        date_key = f"{year}-{month.zfill(2)}-{day.zfill(2)}"
        month_key = f"{year}-{month.zfill(2)}"
        
        if total_msgs == 0:
            first_msg_date = f"{day}/{month}/{year}"
            
        day_counts[date_key] += 1
        month_counts[month_key] += 1
        
        total_msgs += 1
        sender_counts[sender] += 1
        
        if month == "1" and year == "2026":
            jan_msgs += 1
            
        if "<Multimedia omitido>" in text:
            total_media += 1
        else:
            words = text.split()
            word_count = len(words)
            total_words += word_count
            
            if word_count > longest_msg_words:
                longest_msg_words = word_count
                longest_msg = text
                
            text_lower = text.lower()
            if "jaja" in text_lower or "haha" in text_lower:
                laughs += 1
            if "te amo" in text_lower or "te quiero" in text_lower:
                love_msgs += 1
            if "buenos dias" in text_lower or "buenos días" in text_lower:
                buenos_dias += 1
            if "buenas noches" in text_lower:
                buenas_noches += 1
                
            # Extract emojis
            for char in text:
                if char in emoji.EMOJI_DATA:
                    emoji_counts[char] += 1
            
        hour_int = int(hour)
        if am_pm == 'a':
            if hour_int == 12 or hour_int < 5:
                late_night_msgs += 1

busiest_day = max(day_counts, key=day_counts.get)
busiest_count = day_counts[busiest_day]

busiest_month = max(month_counts, key=month_counts.get)
busiest_month_count = month_counts[busiest_month]

top_sender = max(sender_counts, key=sender_counts.get)
top_sender_count = sender_counts[top_sender]

top_emojis = sorted(emoji_counts.items(), key=lambda x: x[1], reverse=True)[:5]

with open("deep_stats.txt", "w", encoding="utf-8") as out:
    out.write(f"Enero: {jan_msgs} mensajes\n")
    out.write(f"Primer msj guardado: {first_msg_date}\n")
    out.write(f"Total: {total_msgs} msgs, {total_words} palabras, {total_media} multimedia\n")
    out.write(f"Madrugadas (12am-5am): {late_night_msgs} mensajes\n")
    out.write(f"Día más ocupado: {busiest_day} con {busiest_count} mensajes\n")
    out.write(f"Mes más activo: {busiest_month} con {busiest_month_count} mensajes\n")
    out.write(f"Mensaje más largo: {longest_msg_words} palabras\n")
    out.write(f"Quien envió más: {top_sender} ({top_sender_count} mensajes)\n")
    out.write(f"Top 5 Emojis: {top_emojis}\n")
    out.write(f"Risas (jaja): {laughs}\n")
    out.write(f"Te amo / Te quiero: {love_msgs}\n")
    out.write(f"Buenos dias: {buenos_dias} vs Buenas noches: {buenas_noches}\n")
