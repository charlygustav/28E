import sys
import re
from collections import defaultdict
import random

filename = "Chat de WhatsApp con mi novia linda 💗.txt"
with open(filename, "r", encoding="utf-8") as f:
    lines = f.readlines()

months = defaultdict(list)
keyword_lines = []

keywords = ["feliz mes", "te amo", "novia", "amor", "siempre", "juntos", "gracias"]

for line in lines:
    match = re.match(r'^(\d{1,2})/(\d{1,2})/(\d{4}),', line)
    if match:
        day, month, year = match.groups()
        month_key = f"{year}-{month.zfill(2)}"
        
        if len(months[month_key]) < 2:
            months[month_key].append(line.strip())
            
        lower_line = line.lower()
        if any(kw in lower_line for kw in keywords):
            keyword_lines.append(line.strip())

with open("chat_samples.txt", "w", encoding="utf-8") as out:
    out.write("--- FIRST MESSAGES PER MONTH ---\n")
    for mk in sorted(months.keys()):
        out.write(f"[{mk}]\n")
        for l in months[mk]:
            out.write(l + "\n")

    out.write("\n--- SAMPLE KEYWORD MESSAGES ---\n")
    random.seed(42)
    if keyword_lines:
        sample = random.sample(keyword_lines, min(40, len(keyword_lines)))
        for l in sample:
            out.write(l + "\n")
