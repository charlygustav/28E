const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const YT_DLP = "C:\\Users\\thegi\\AppData\\Local\\Microsoft\\WinGet\\Packages\\yt-dlp.yt-dlp_Microsoft.Winget.Source_8wekyb3d8bbwe\\yt-dlp.exe";
const OUTPUT_DIR = path.resolve(__dirname, '..', 'videos', 'ads');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const ADS = [
  {
    key: 'sprite_chile_15s',
    title: 'Sprite · Refresca Tu Mundo',
    desc: 'Comercial oficial · Sprite Chile.',
    id: 'M-uzZR2M38s'
  },
  {
    key: 'doritos_espanol_20s',
    title: 'Doritos · Más Crujientes',
    desc: 'Spot oficial en español · Doritos.',
    id: 'bARFBq1cNwU'
  },
  {
    key: 'wom_chile_20s',
    title: 'WOM Chile · Nadie Te Da Más',
    desc: 'Comercial oficial · WOM Chile.',
    id: 'kW0_MJIsIXA'
  },
  {
    key: 'cocacola_para_todos_30s',
    title: 'Coca-Cola · Para Todos',
    desc: 'Spot clásico oficial en español · Coca-Cola.',
    id: 'q6-t24vK_94'
  },
  {
    key: 'ps5_espanol_30s',
    title: 'PlayStation 5 · Jugar No Tiene Límites',
    desc: 'Spot oficial en español · PS5.',
    id: 'cSGbkeCgbz8'
  },
  {
    key: 'redbull_espanol_30s',
    title: 'Red Bull · Te Da Alas',
    desc: 'Comercial animado en español · Red Bull.',
    id: 'cNaasUHvFu0'
  }
];

function getDuration(filePath) {
  try {
    const out = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`, { encoding: 'utf8' });
    return Math.round(parseFloat(out.trim())) || 20;
  } catch (e) {
    return 20;
  }
}

async function run() {
  console.log(`Downloading ${ADS.length} Spanish TV commercials...`);
  const results = [];

  for (let i = 0; i < ADS.length; i++) {
    const ad = ADS[i];
    const targetPath = path.join(OUTPUT_DIR, `${ad.key}.mp4`);
    console.log(`\n[${i + 1}/${ADS.length}] ${ad.title} (${ad.id})`);

    if (fs.existsSync(targetPath) && fs.statSync(targetPath).size > 200000) {
      console.log(`  -> Already downloaded.`);
    } else {
      const cmd = `"${YT_DLP}" -f "bestvideo[ext=mp4][height<=1080]+bestaudio[ext=m4a]/best[ext=mp4]/best" --merge-output-format mp4 -o "${targetPath}" "https://www.youtube.com/watch?v=ad.id"`.replace('ad.id', ad.id);
      try {
        execSync(cmd, { stdio: 'inherit' });
      } catch (e) {
        console.error(`  -> Failed:`, e.message);
      }
    }

    if (fs.existsSync(targetPath)) {
      const dur = getDuration(targetPath);
      results.push({
        title: ad.title,
        desc: ad.desc,
        duration: dur,
        type: 'ad',
        src: `videos/ads/${ad.key}.mp4`,
        isAd: true
      });
      console.log(`  -> Verified: ${dur}s`);
    }
  }

  const jsonOut = path.resolve(OUTPUT_DIR, 'spanish_ads.json');
  fs.writeFileSync(jsonOut, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\nSaved ${results.length} Spanish ads to ${jsonOut}`);
}

run().catch(console.error);
