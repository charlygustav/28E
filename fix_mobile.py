import os

file_path = 'voice-channel-widget.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the vc-close button corrupted character
bad_close = 'id="vc-close">o </button>'
good_close = 'id="vc-close" style="background: transparent; -webkit-appearance: none; appearance: none; border: none; box-shadow: none;"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>'

content = content.replace(bad_close, good_close)
content = content.replace('id="vc-close">o </button>', good_close)

# Fix the "VER MAS" button background and appearance
bad_more_btn = 'id="vc-btn-ver-mas" class="w-full mt-2 text-[9px] text-amber-500/80 hover:text-amber-400 font-bold uppercase tracking-wider py-1 border border-white/5 rounded-md bg-white/5 hover:bg-white/10 transition-colors"'
good_more_btn = 'id="vc-btn-ver-mas" class="w-full mt-2 text-[9px] text-amber-500/80 hover:text-amber-400 font-bold uppercase tracking-wider py-1 border border-white/5 rounded-md transition-colors" style="background-color: rgba(255,255,255,0.05); -webkit-appearance: none; appearance: none; border-style: solid; box-shadow: none;"'

content = content.replace(bad_more_btn, good_more_btn)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed mobile bugs.")
