const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const YT_DLP = "C:\\Users\\thegi\\AppData\\Local\\Microsoft\\WinGet\\Packages\\yt-dlp.yt-dlp_Microsoft.Winget.Source_8wekyb3d8bbwe\\yt-dlp.exe";
const OUTPUT_DIR = path.resolve(__dirname, '..', 'videos', 'mtv');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const TRACKS = [
  {
    key: 'tulipanes_pa_yaire',
    title: "Tulipanes Pa' Yaire",
    artist: "Charles Gustav",
    album: "28E Originals Special (2026)",
    existingSrc: 'videos/tulipanes_pa_yaire.mp4'
  },
  {
    key: 'alvaro_diaz_malasnoticias',
    title: "MALASNOTICIAS",
    artist: "Alvaro Diaz, LATIN MAFIA",
    album: "SAYONARA (2024)",
    search: "Alvaro Diaz LATIN MAFIA MALASNOTICIAS Video Oficial"
  },
  {
    key: 'don_toliver_no_pole',
    title: "No Pole",
    artist: "Don Toliver",
    album: "Love Sick (2023)",
    search: "Don Toliver No Pole Official Video"
  },
  {
    key: 'girl_ultra_tomas',
    title: "Tomás",
    artist: "Girl Ultra ft. Chromeo, Empress Of",
    album: "Single Oficial (2024)",
    search: "Girl Ultra Tomas Official Video"
  },
  {
    key: 'drake_gods_plan',
    title: "God's Plan",
    artist: "Drake",
    album: "Scorpion (2018)",
    search: "Drake God's Plan Official Music Video"
  },
  {
    key: 'cardi_b_i_like_it',
    title: "I Like It",
    artist: "Cardi B, Bad Bunny & J Balvin",
    album: "Invasion of Privacy (2018)",
    search: "Cardi B I Like It Official Music Video"
  },
  {
    key: 'ariana_grande_god_is_a_woman',
    title: "God is a woman",
    artist: "Ariana Grande",
    album: "Sweetener (2018)",
    search: "Ariana Grande God is a woman Official Video"
  },
  {
    key: 'bnyx_fuego',
    title: "fuëgo",
    artist: "BNYX, Bizarrap, Yeat, Peso Pluma",
    album: "fuëgo (Single)",
    search: "BNYX Yeat Peso Pluma fuego"
  },
  {
    key: 'sg_lewis_impact',
    title: "Impact",
    artist: "SG Lewis ft. Robyn & Channel Tres",
    album: "times (2021)",
    search: "SG Lewis Impact Official Video"
  },
  {
    key: 'michael_jackson_heaven_can_wait',
    title: "Heaven Can Wait",
    artist: "Michael Jackson",
    album: "Invincible (2001)",
    search: "Michael Jackson Heaven Can Wait Official Audio Video"
  },
  {
    key: 'fcukers_bon_bon',
    title: "Bon Bon",
    artist: "Fcukers",
    album: "Bon Bon (2024)",
    search: "Fcukers Bon Bon Official Video"
  },
  {
    key: 'bryant_myers_como_panas',
    title: "Como Panas",
    artist: "Bryant Myers",
    album: "Bendecido (2020)",
    search: "Bryant Myers Como Panas Video Oficial"
  },
  {
    key: 'tokischa_delincuente',
    title: "Delincuente",
    artist: "Tokischa, Anuel AA, Ñengo Flow",
    album: "Single (2022)",
    search: "Tokischa Anuel Nengo Delincuente Video Oficial"
  },
  {
    key: 'ovy_inolvidable',
    title: "Inolvidable",
    artist: "Ovy On The Drums, Beéle",
    album: "Single (2020)",
    search: "Ovy On The Drums Beele Inolvidable Video Oficial"
  },
  {
    key: 'raye_oscar_winning_tears',
    title: "Oscar Winning Tears.",
    artist: "RAYE",
    album: "My 21st Century Blues (2023)",
    search: "RAYE Oscar Winning Tears Official Video"
  },
  {
    key: 'yailin_bing_bong',
    title: "Bing Bong",
    artist: "Yailin la Mas Viral, Puyalo Pantera",
    album: "Single (2024)",
    search: "Yailin la Mas Viral Bing Bong Video Oficial"
  },
  {
    key: 'chimbala_brazilera_remix',
    title: "Brazilera (Remix)",
    artist: "Chimbala, Fetti031, Chucky73",
    album: "Single",
    search: "Chimbala Brazilera Remix Video Oficial"
  },
  {
    key: 'chimbala_se_me_nota',
    title: "Se Me Nota (Agárrame)",
    artist: "Chimbala, Omega",
    album: "Single",
    search: "Chimbala Omega Se Me Nota Video Oficial"
  },
  {
    key: 'alvaro_diaz_mami_100pre_sabe',
    title: "MAMI 100PRE SABE (INTERLUDE)",
    artist: "Alvaro Diaz, NSQK",
    album: "SAYONARA (2024)",
    search: "Alvaro Diaz NSQK MAMI 100PRE SABE Visualizer"
  },
  {
    key: 'john_legend_crowd_go_crazy',
    title: "Crowd Go Crazy",
    artist: "John Legend",
    album: "Space Jam: A New Legacy (2021)",
    search: "John Legend Crowd Go Crazy Official Video"
  },
  {
    key: 'ice_spice_thootie',
    title: "Thootie",
    artist: "Ice Spice ft. Tokischa",
    album: "Y2K! (2024)",
    search: "Ice Spice Tokischa Thootie Official Visualizer"
  },
  {
    key: 'huan62_toto_lindo',
    title: "Toto Lindo",
    artist: "Huan62, Tokischa",
    album: "Single",
    search: "Huan62 Tokischa Toto Lindo Video Oficial"
  },
  {
    key: 'lil_naay_pasao_de_farmacia',
    title: "Pasao De Farmacia",
    artist: "Lil Naay",
    album: "Single",
    search: "Lil Naay Pasao De Farmacia Video Oficial"
  },
  {
    key: 'ito_de_la_noche_a_la_manana',
    title: "De la Noche a la Mañana",
    artist: "Ito, Quevedo, Myke Towers, Eladio Carrión",
    album: "Single",
    search: "De la Noche a la Mañana Ito Quevedo Video Oficial"
  },
  {
    key: 'lonown_worry_slowed',
    title: "worry (Slowed)",
    artist: "LONOWN, riserayss",
    album: "worry",
    search: "LONOWN riserayss worry Slowed Audio"
  },
  {
    key: 'softable_flip_the_coin',
    title: "Flip The Coin",
    artist: "Softable",
    album: "Flip The Coin",
    search: "Softable Flip The Coin Audio"
  },
  {
    key: 'kmpl3x_sweet_escape',
    title: "Sweet Escape (Instrumental)",
    artist: "KmPl3x",
    album: "Sweet Escape",
    search: "KmPl3x Sweet Escape Instrumental"
  },
  {
    key: 'corbyn_kites_slow_burn',
    title: "Slow Burn",
    artist: "Corbyn Kites",
    album: "Slow Burn",
    search: "Corbyn Kites Slow Burn Audio"
  },
  {
    key: 'ever_alejandro_barcelona',
    title: "Barcelona (demo)",
    artist: "Ever Alejandro",
    album: "The One",
    search: "Ever Alejandro Barcelona demo"
  },
  {
    key: 'otis_mcdonald_treat_me_this_way',
    title: "Treat Me This Way",
    artist: "Otis McDonald",
    album: "Treat Me This Way",
    search: "Otis McDonald Treat Me This Way Audio"
  }
];

function getDuration(filePath) {
  try {
    const out = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`, { encoding: 'utf8' });
    return Math.round(parseFloat(out.trim())) || 180;
  } catch (e) {
    return 180;
  }
}

async function run() {
  console.log(`Starting sync of ${TRACKS.length} tracks for MTV 28E...`);

  const results = [];

  for (let i = 0; i < TRACKS.length; i++) {
    const t = TRACKS[i];
    console.log(`\n[${i + 1}/${TRACKS.length}] Processing: ${t.artist} - ${t.title}`);

    let targetPath = '';
    let relativeSrc = '';

    if (t.existingSrc) {
      targetPath = path.resolve(__dirname, '..', t.existingSrc);
      relativeSrc = t.existingSrc;
    } else {
      targetPath = path.join(OUTPUT_DIR, `${t.key}.mp4`);
      relativeSrc = `videos/mtv/${t.key}.mp4`;
    }

    if (fs.existsSync(targetPath) && fs.statSync(targetPath).size > 500000) {
      console.log(`  -> Already exists (${(fs.statSync(targetPath).size / 1024 / 1024).toFixed(1)} MB). Skipping download.`);
    } else if (t.search) {
      console.log(`  -> Searching & downloading: "${t.search}"...`);
      const cmd = `"${YT_DLP}" -f "bestvideo[ext=mp4][height<=1080]+bestaudio[ext=m4a]/best[ext=mp4]/best" --merge-output-format mp4 --no-playlist -o "${targetPath}" "ytsearch1:${t.search}"`;
      try {
        execSync(cmd, { stdio: 'inherit' });
      } catch (err) {
        console.error(`  -> Error downloading ${t.title}:`, err.message);
      }
    }

    if (fs.existsSync(targetPath)) {
      const dur = getDuration(targetPath);
      results.push({
        title: t.title,
        artist: t.artist,
        album: t.album,
        duration: dur,
        type: 'video',
        src: relativeSrc,
        isAd: false
      });
      console.log(`  -> Verified: ${dur}s`);
    } else {
      console.warn(`  -> Could not find target file: ${targetPath}`);
    }
  }

  // Comerciales y tráilers 100% en Full HD (1080p), venezolanos oficiales y estrenos 2026
  const BUMPERS = [
    {
      title: 'Maltín Polar · Lo Bueno Nos Une',
      desc: 'Comercial oficial venezolano en 1080p · Cervecería Polar.',
      duration: 15,
      type: 'ad',
      src: 'videos/ads/maltin_polar_15s.mp4',
      isAd: true
    },
    {
      title: 'Avengers 5: Doomsday · Tráiler Oficial (2026)',
      desc: 'Tráiler oficial de estreno 2026 doblado en español latino · Marvel Studios.',
      duration: 165,
      type: 'ad',
      src: 'videos/ads/trailer_avengers_doomsday_2026.mp4',
      isAd: true
    },
    {
      title: 'Empresas Polar · Aquí Seguimos #PorqueSí',
      desc: 'Comercial institucional oficial en 1080p · Empresas Polar.',
      duration: 40,
      type: 'ad',
      src: 'videos/ads/empresas_polar_porquesi_40s.mp4',
      isAd: true
    },
    {
      title: 'Spider-Man: Un Nuevo Día · Tráiler Oficial (2026)',
      desc: 'Tráiler oficial de estreno 2026 doblado en español latino · Marvel Studios.',
      duration: 173,
      type: 'ad',
      src: 'videos/ads/trailer_spiderman_nuevo_dia_2026.mp4',
      isAd: true
    },
    {
      title: 'Maltín Polar Coco · ¡Vacila la Nueva Edición!',
      desc: 'Comercial oficial venezolano en 1080p · Cervecería Polar.',
      duration: 15,
      type: 'ad',
      src: 'videos/ads/maltin_polar_coco_15s.mp4',
      isAd: true
    },
    {
      title: 'La Reina del Flow 3 · Tráiler Oficial (2026)',
      desc: 'Tráiler oficial de estreno 2026 · Caracol Televisión.',
      duration: 200,
      type: 'ad',
      src: 'videos/ads/trailer_la_reina_del_flow_3.mp4',
      isAd: true
    },
    {
      title: 'Digitel · Vívelo Todo con Digitel 4G LTE',
      desc: 'Comercial oficial en 1080p · Digitel Venezuela.',
      duration: 60,
      type: 'ad',
      src: 'videos/ads/digitel_venezuela_60s.mp4',
      isAd: true
    },
    {
      title: 'Toy Story 5 · Tráiler Oficial (2026)',
      desc: 'Tráiler oficial de estreno 2026 doblado en español latino · Disney Pixar.',
      duration: 164,
      type: 'ad',
      src: 'videos/ads/trailer_toy_story_5_2026.mp4',
      isAd: true
    },
    {
      title: 'Polar Pilsen · Un Rondón de Polarcitas',
      desc: 'Comercial oficial venezolano en 1080p · Polar Pilsen feat. Salomón Rondón.',
      duration: 60,
      type: 'ad',
      src: 'videos/ads/polar_pilsen_rondon_60s.mp4',
      isAd: true
    },
    {
      title: 'Shrek 5 · Tráiler Oficial (2026)',
      desc: 'Tráiler oficial de estreno en español latino · DreamWorks Animation.',
      duration: 96,
      type: 'ad',
      src: 'videos/ads/trailer_shrek_5_2026.mp4',
      isAd: true
    },
    {
      title: 'PlayStation 5 Pro · Cada Detalle Cuenta',
      desc: 'Comercial oficial de lanzamiento en español latino 1080p · PlayStation.',
      duration: 66,
      type: 'ad',
      src: 'videos/ads/ps5_pro_espanol_60s.mp4',
      isAd: true
    },
    {
      title: 'Jumanji: En el Mundo Real · Tráiler Oficial (2026)',
      desc: 'Tráiler oficial de estreno 2026 doblado en español latino · Sony Pictures.',
      duration: 194,
      type: 'ad',
      src: 'videos/ads/trailer_jumanji_2026.mp4',
      isAd: true
    },
    {
      title: 'Apple iPhone 16 Pro · Reveal Oficial',
      desc: 'Comercial oficial de lanzamiento en 1080p · Apple.',
      duration: 39,
      type: 'ad',
      src: 'videos/ads/iphone_16_pro_apple_40s.mp4',
      isAd: true
    },
    {
      title: 'La Reina del Flow 3 · Avance Oficial (2026)',
      desc: 'Avance oficial de la nueva temporada 2026 · Caracol Televisión.',
      duration: 25,
      type: 'ad',
      src: 'videos/ads/avance_la_reina_del_flow_3.mp4',
      isAd: true
    },
    {
      title: 'Pepsi Venezuela · Un Aventurero del Sabor',
      desc: 'Comercial oficial en 1080p · Pepsi Cola Venezuela.',
      duration: 20,
      type: 'ad',
      src: 'videos/ads/pepsi_venezuela_20s.mp4',
      isAd: true
    },
    {
      title: 'Banco de Venezuela · Nuestra Campeona Yulimar',
      desc: 'Comercial oficial venezolano en 1080p · BDV con Yulimar Rojas.',
      duration: 21,
      type: 'ad',
      src: 'videos/ads/bdv_yulimar_20s.mp4',
      isAd: true
    },
    {
      title: 'Nintendo Switch · Super Mario Party Jamboree',
      desc: 'Comercial oficial en 1080p60 español · Nintendo.',
      duration: 30,
      type: 'ad',
      src: 'videos/ads/nintendo_mario_party_jamboree_30s.mp4',
      isAd: true
    },
    {
      title: 'Disney+ Latinoamérica · Todo en un Mismo Lugar',
      desc: 'Spot oficial en español latino 1080p · Disney Plus Latinoamérica.',
      duration: 30,
      type: 'ad',
      src: 'videos/ads/disney_plus_latam_30s.mp4',
      isAd: true
    },
    {
      title: '28E Flow · Cortinilla Oficial',
      desc: 'Identidad sonora y visual · 28E Flow.',
      duration: 15,
      type: 'ad',
      src: 'videos/ads/mtv_ident_2022.mp4',
      isAd: true
    }
  ];

  const fullSchedule = [];
  let bumperIdx = 0;

  for (let i = 0; i < results.length; i++) {
    fullSchedule.push(results[i]);
    // Cada 2 videoclips, insertar un comercial real en español o bumper de 28E Flow
    if ((i + 1) % 2 === 0 && i < results.length - 1) {
      const b = BUMPERS[bumperIdx % BUMPERS.length];
      fullSchedule.push(b);
      bumperIdx++;
    }
  }

  const jsonOut = path.resolve(__dirname, '..', 'videos', 'mtv', 'mtv_playlist.json');
  fs.writeFileSync(jsonOut, JSON.stringify(fullSchedule, null, 2), 'utf8');
  console.log(`\nSaved playlist with ${fullSchedule.length} entries to ${jsonOut}`);

  // Actualizar tv.html
  const tvHtmlPath = path.resolve(__dirname, '..', 'tv.html');
  let tvContent = fs.readFileSync(tvHtmlPath, 'utf8');

  const newChannel2 = `2: {
          number: '02',
          name: '28E Flow',
          sub: 'Música Urbana & Tendencias · 24/7',
          accent: '#a855f7',
          schedule: ${JSON.stringify(fullSchedule, null, 12)}
        }`;

  const regex2 = /2:\s*\{[\s\S]*?schedule:\s*\[[\s\S]*?\n\s*\]\s*\}/;
  if (regex2.test(tvContent)) {
    tvContent = tvContent.replace(regex2, newChannel2);
    fs.writeFileSync(tvHtmlPath, tvContent, 'utf8');
    console.log('Successfully updated tv.html with the full MTV 28E schedule!');
  } else {
    console.error('Could not match Channel 2 block in tv.html');
  }
}

run().catch(console.error);
