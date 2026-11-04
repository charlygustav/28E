const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const YT_DLP = "C:\\Users\\thegi\\AppData\\Local\\Microsoft\\WinGet\\Packages\\yt-dlp.yt-dlp_Microsoft.Winget.Source_8wekyb3d8bbwe\\yt-dlp.exe";
const OUTPUT_DIR = path.resolve(__dirname, '..', 'videos', 'ads');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const ITEMS = [
  // 1. Comerciales actuales venezolanos
  {
    key: 'cashea_venezuela_40s',
    title: 'Cashea · La Confianza Floreció',
    desc: 'Comercial oficial venezolano · Cashea Compra Ahora y Paga Después.',
    category: 'venezuela',
    id: 'X4nC2QftL7M'
  },
  {
    key: 'polar_pilsen_rondon_60s',
    title: 'Polar Pilsen · Un Rondón de Polarcitas',
    desc: 'Comercial oficial venezolano · Polar Pilsen feat. Salomón Rondón.',
    category: 'venezuela',
    id: 'EuXbwISVoHw'
  },
  {
    key: 'bdv_yulimar_20s',
    title: 'Banco de Venezuela · Nuestra Campeona Yulimar',
    desc: 'Comercial oficial venezolano · BDV con Yulimar Rojas.',
    category: 'venezuela',
    id: '9H0dfHgHGhg'
  },
  {
    key: 'simpletv_venezuela_40s',
    title: 'SimpleTV Venezuela · Así de Simple',
    desc: 'Comercial oficial venezolano · SimpleTV televisión satelital.',
    category: 'venezuela',
    id: 'UMEh95g2VMA'
  },
  {
    key: 'ridery_venezuela_45s',
    title: 'Ridery · La App de Movilidad de Venezuela',
    desc: 'Comercial oficial venezolano · Ridery Venezuela.',
    category: 'venezuela',
    id: '6d5T0uz17xY'
  },

  // 2. Trailers de películas en Español Latino
  {
    key: 'trailer_deadpool_wolverine',
    title: 'Deadpool & Wolverine · Tráiler Oficial',
    desc: 'Tráiler oficial de cine en español latino · Marvel Studios.',
    category: 'movie_trailer',
    id: 'uDzfa0w86Vw'
  },
  {
    key: 'trailer_intensamente_2',
    title: 'IntensaMente 2 · Tráiler Oficial',
    desc: 'Tráiler oficial de cine en español latino · Disney Pixar.',
    category: 'movie_trailer',
    id: '9bol4Yyx9Gs'
  },
  {
    key: 'trailer_spiderman_spiderverso',
    title: 'Spider-Man: A Través del Spider-Verso · Tráiler',
    desc: 'Tráiler oficial de cine en español latino · Sony Pictures Animation.',
    category: 'movie_trailer',
    id: 'oBmazlyP220'
  },

  // 3. Comerciales de servicios de streaming en Español Latino
  {
    key: 'netflix_latam_30s',
    title: 'Netflix Latinoamérica · Historias Que Te Atrapan',
    desc: 'Spot publicitario oficial · Vive Netflix Latinoamérica.',
    category: 'streaming',
    id: '1SuS72s16is'
  },
  {
    key: 'max_latam_60s',
    title: 'Max Latinoamérica · Mucho Más Que Ver',
    desc: 'Spot publicitario oficial · HBO Max ahora es Max.',
    category: 'streaming',
    id: 'j2yryrVKwss'
  },
  {
    key: 'disney_plus_latam_30s',
    title: 'Disney+ Latinoamérica · Todo en un Mismo Lugar',
    desc: 'Spot oficial en español latino · Disney Plus Latinoamérica.',
    category: 'streaming',
    id: '5w85OmxIuI0'
  },

  // 4. Comerciales de tecnología en español
  {
    key: 'nintendo_switch_latam_30s',
    title: 'Nintendo Switch · Día de Mario',
    desc: 'Comercial oficial en español latino · Nintendo Switch.',
    category: 'tech',
    id: 'gIBz6kHr_MQ'
  },
  {
    key: 'iphone_15_pro_apple_38s',
    title: 'Apple iPhone 15 Pro · Titanio Aeroespacial',
    desc: 'Comercial oficial en español · Apple Event.',
    category: 'tech',
    id: 'uEf9_Qc_mWM'
  },
  {
    key: 'samsung_galaxy_ai_80s',
    title: 'Samsung Galaxy · Inteligencia Alucinante Galaxy AI',
    desc: 'Comercial oficial en español · Samsung Galaxy.',
    category: 'tech',
    id: 'dhADgV2lkis'
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
  console.log(`Starting download of ${ITEMS.length} modern commercials and trailers...`);
  const catalog = [];

  // Also include the existing modern ads already verified
  if (fs.existsSync(path.join(OUTPUT_DIR, 'maltin_polar_15s.mp4'))) {
    catalog.push({
      key: 'maltin_polar_15s',
      title: 'Maltín Polar · Lo Bueno Nos Une',
      desc: 'Comercial oficial venezolano · Cervecería Polar.',
      category: 'venezuela',
      duration: getDuration(path.join(OUTPUT_DIR, 'maltin_polar_15s.mp4')),
      type: 'ad',
      src: 'videos/ads/maltin_polar_15s.mp4',
      isAd: true
    });
  }

  if (fs.existsSync(path.join(OUTPUT_DIR, 'ps5_espanol_30s.mp4'))) {
    catalog.push({
      key: 'ps5_espanol_30s',
      title: 'PlayStation 5 · Jugar No Tiene Límites',
      desc: 'Comercial oficial en español latino · PlayStation 5.',
      category: 'tech',
      duration: getDuration(path.join(OUTPUT_DIR, 'ps5_espanol_30s.mp4')),
      type: 'ad',
      src: 'videos/ads/ps5_espanol_30s.mp4',
      isAd: true
    });
  }

  for (let i = 0; i < ITEMS.length; i++) {
    const item = ITEMS[i];
    const targetPath = path.join(OUTPUT_DIR, `${item.key}.mp4`);
    console.log(`\n[${i + 1}/${ITEMS.length}] [${item.category}] ${item.title} (${item.id})`);

    if (fs.existsSync(targetPath) && fs.statSync(targetPath).size > 200000) {
      console.log(`  -> Already downloaded (${fs.statSync(targetPath).size} bytes).`);
    } else {
      const cmd = `"${YT_DLP}" -f "bestvideo[ext=mp4][height<=1080]+bestaudio[ext=m4a]/best[ext=mp4]/best" --merge-output-format mp4 -o "${targetPath}" "https://www.youtube.com/watch?v=${item.id}"`;
      try {
        execSync(cmd, { stdio: 'inherit' });
      } catch (e) {
        console.error(`  -> Failed:`, e.message);
      }
    }

    if (fs.existsSync(targetPath) && fs.statSync(targetPath).size > 150000) {
      const dur = getDuration(targetPath);
      catalog.push({
        key: item.key,
        title: item.title,
        desc: item.desc,
        category: item.category,
        duration: dur,
        type: 'ad',
        src: `videos/ads/${item.key}.mp4`,
        isAd: true
      });
      console.log(`  -> Verified: ${dur}s`);
    }
  }

  const jsonOut = path.resolve(OUTPUT_DIR, 'modern_commercials_catalog.json');
  fs.writeFileSync(jsonOut, JSON.stringify(catalog, null, 2), 'utf8');
  console.log(`\nSaved ${catalog.length} modern ads to ${jsonOut}`);
}

run().catch(console.error);
