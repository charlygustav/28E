const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const YT_DLP = "C:\\Users\\thegi\\AppData\\Local\\Microsoft\\WinGet\\Packages\\yt-dlp.yt-dlp_Microsoft.Winget.Source_8wekyb3d8bbwe\\yt-dlp.exe";
const OUTPUT_DIR = path.resolve(__dirname, '..', 'videos', 'ads');

const ADS = [
  {
    key: 'diablitos_underwood_20s',
    title: 'Diablitos Underwood · La Mejor Forma de Comer Jamón',
    desc: 'Comercial clásico venezolano · Diablitos Underwood.',
    id: 'eIGBw0ZaEMs'
  },
  {
    key: 'cri_cri_savoy_20s',
    title: 'Cri-Cri Savoy · El Auténtico Sabor a Chocolate',
    desc: 'Comercial venezolano · Chocolate Cri-Cri de Savoy.',
    id: '7dx6KF5Isvc'
  },
  {
    key: 'toronto_savoy_30s',
    title: 'Toronto Savoy · Un Clásico Venezolano',
    desc: 'Comercial venezolano · Bombón Toronto de Savoy.',
    id: '5B57JL7U-Pc'
  },
  {
    key: 'chicha_chichero_18s',
    title: 'Chicha El Chichero · Bien Fría y Sabrosa',
    desc: 'Comercial venezolano · El Chichero.',
    id: '17I0gxyYPbw'
  },
  {
    key: 'venevision_ident_30s',
    title: 'Venevisión · Identidad Corporativa',
    desc: 'Ident oficial e institucional de la televisión venezolana.',
    id: 'xjTbZtcNvmE'
  },
  {
    key: 'banesco_contigo_20s',
    title: 'Banesco · Contigo Venezuela',
    desc: 'Propaganda institucional · Banesco Banco Universal.',
    id: 'bWR6UNiMjUg'
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
  console.log(`Downloading ${ADS.length} Venezuelan commercials...`);
  const results = [];

  for (let i = 0; i < ADS.length; i++) {
    const ad = ADS[i];
    const targetPath = path.join(OUTPUT_DIR, `${ad.key}.mp4`);
    console.log(`\n[${i + 1}/${ADS.length}] ${ad.title} (${ad.id})`);

    if (fs.existsSync(targetPath) && fs.statSync(targetPath).size > 150000) {
      console.log(`  -> Already exists (${fs.statSync(targetPath).size} bytes).`);
    } else {
      const cmd = `"${YT_DLP}" -f "bestvideo[ext=mp4][height<=1080]+bestaudio[ext=m4a]/best[ext=mp4]/best" --merge-output-format mp4 -o "${targetPath}" "https://www.youtube.com/watch?v=${ad.id}"`;
      try {
        execSync(cmd, { stdio: 'inherit' });
      } catch (e) {
        console.error(`  -> Failed:`, e.message);
      }
    }

    if (fs.existsSync(targetPath) && fs.statSync(targetPath).size > 100000) {
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

  // Load existing venezuelan_ads.json and merge
  const jsonPath = path.resolve(OUTPUT_DIR, 'venezuelan_ads.json');
  let existing = [];
  if (fs.existsSync(jsonPath)) {
    try {
      existing = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    } catch (e) {}
  }

  // Combine uniquely by src
  const allAds = [...existing];
  for (const item of results) {
    if (!allAds.some(a => a.src === item.src)) {
      allAds.push(item);
    }
  }

  fs.writeFileSync(jsonPath, JSON.stringify(allAds, null, 2), 'utf8');
  console.log(`\nSaved total of ${allAds.length} Venezuelan commercials into ${jsonPath}`);
}

run().catch(console.error);
