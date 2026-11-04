const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const YT_DLP = "C:\\Users\\thegi\\AppData\\Local\\Microsoft\\WinGet\\Packages\\yt-dlp.yt-dlp_Microsoft.Winget.Source_8wekyb3d8bbwe\\yt-dlp.exe";
const OUTPUT_DIR = path.resolve(__dirname, '..', 'videos', 'ads');

const NEW_ITEMS = [
  // 1. Comerciales Venezolanos 1080p oficiales de alta calidad
  {
    key: 'empresas_polar_calidad_15s',
    title: 'Empresas Polar · Lleva Calidad, Elige con Confianza',
    desc: 'Comercial oficial venezolano en 1080p · Empresas Polar.',
    category: 'venezuela',
    id: 'DgxIaG0b77o'
  },
  {
    key: 'digitel_venezuela_60s',
    title: 'Digitel · Vívelo Todo con Digitel 4G LTE',
    desc: 'Comercial oficial en 1080p · Digitel Venezuela.',
    category: 'venezuela',
    id: 'IIexRiGLo1g'
  },
  {
    key: 'pepsi_venezuela_20s',
    title: 'Pepsi Venezuela · Un Aventurero del Sabor',
    desc: 'Comercial oficial en 1080p · Pepsi Cola Venezuela.',
    category: 'venezuela',
    id: 'OOlFkNL2CKg'
  },

  // 2. Trailers de películas de estreno 2024 / 2025 en Español Latino
  {
    key: 'trailer_gladiador_2',
    title: 'Gladiador II · Tráiler Oficial',
    desc: 'Tráiler oficial de estreno 2024 en español latino · Paramount Pictures.',
    category: 'movie_trailer',
    id: 'vZQm2ZRYz00'
  },
  {
    key: 'trailer_moana_2',
    title: 'Moana 2 · Tráiler Oficial',
    desc: 'Tráiler oficial de estreno en español latino · Walt Disney Studios LA.',
    category: 'movie_trailer',
    id: 'XcPZ2jPTJCM'
  },
  {
    key: 'trailer_mufasa_el_rey_leon',
    title: 'Mufasa: El Rey León · Tráiler Oficial',
    desc: 'Tráiler oficial de estreno en español latino · Walt Disney Studios LA.',
    category: 'movie_trailer',
    id: 'jYGUYAaqmlU'
  },
  {
    key: 'trailer_sonic_3',
    title: 'Sonic 3: La Película · Tráiler Oficial',
    desc: 'Tráiler oficial de estreno en español latino · Paramount Pictures.',
    category: 'movie_trailer',
    id: 'bjxCH2fX4QU'
  },
  {
    key: 'trailer_capitan_america_nuevo_mundo',
    title: 'Capitán América: Un Nuevo Mundo · Tráiler Oficial',
    desc: 'Tráiler oficial de estreno 2025 en español latino · Marvel Studios.',
    category: 'movie_trailer',
    id: 'RXoqRPP-y5c'
  },

  // 3. Streaming actual (2024 / 2025)
  {
    key: 'netflix_squid_game_2',
    title: 'Netflix · El Juego del Calamar: Temporada 2',
    desc: 'Anuncio oficial de estreno · Netflix Latinoamérica.',
    category: 'streaming',
    id: '42ayVzJ4LwE'
  },
  {
    key: 'max_casa_dragon_2',
    title: 'Max · La Casa del Dragón: Temporada 2',
    desc: 'Tráiler oficial de estreno · Max Latinoamérica.',
    category: 'streaming',
    id: 'gZbybAkuPJg'
  },

  // 4. Tecnología en 1080p
  {
    key: 'nintendo_mario_party_jamboree_30s',
    title: 'Nintendo Switch · Super Mario Party Jamboree',
    desc: 'Comercial oficial en 1080p60 español · Nintendo.',
    category: 'tech',
    id: 'jejUPobOv2Q'
  }
];

function getDuration(filePath) {
  try {
    const out = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`, { encoding: 'utf8' });
    return Math.round(parseFloat(out.trim())) || 30;
  } catch (e) {
    return 30;
  }
}

async function run() {
  console.log(`Downloading ${NEW_ITEMS.length} crisp 1080p modern ads and upcoming movie trailers...`);

  for (let i = 0; i < NEW_ITEMS.length; i++) {
    const item = NEW_ITEMS[i];
    const targetPath = path.join(OUTPUT_DIR, `${item.key}.mp4`);
    console.log(`\n[${i + 1}/${NEW_ITEMS.length}] [${item.category}] ${item.title} (${item.id})`);

    if (fs.existsSync(targetPath) && fs.statSync(targetPath).size > 400000) {
      console.log(`  -> Already downloaded (${fs.statSync(targetPath).size} bytes).`);
    } else {
      const cmd = `"${YT_DLP}" -f "bestvideo[ext=mp4][height<=1080]+bestaudio[ext=m4a]/best[ext=mp4]/best" --merge-output-format mp4 -o "${targetPath}" "https://www.youtube.com/watch?v=${item.id}"`;
      try {
        execSync(cmd, { stdio: 'inherit' });
      } catch (e) {
        console.error(`  -> Failed:`, e.message);
      }
    }

    if (fs.existsSync(targetPath)) {
      const dur = getDuration(targetPath);
      console.log(`  -> Verified: ${dur}s`);
    }
  }
}

run().catch(console.error);
