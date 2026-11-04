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
    key: 'harina_pan_30s',
    title: 'Harina P.A.N. · El Sabor de Venezuela',
    desc: 'Comercial oficial · Harina P.A.N.',
    id: 'XTfj1TBUy84'
  },
  {
    key: 'maltin_polar_15s',
    title: 'Maltín Polar · Lo Bueno Nos Une',
    desc: 'Comercial oficial · Cervecería Polar.',
    id: 'PLrgBfh0Hbk'
  },
  {
    key: 'savoy_chocolates_20s',
    title: 'Savoy · Con Sabor Venezolano',
    desc: 'Comercial oficial · Chocolates Savoy.',
    id: 'KrPsrsGi2N0'
  },
  {
    key: 'pirulin_venezuela_27s',
    title: 'Pirulin · Me Lo Merezco',
    desc: 'Comercial oficial · Pirulin Venezuela.',
    id: 'LJ71dxZAroE'
  },
  {
    key: 'toddy_venezuela_30s',
    title: 'Toddy · Lo Que Provoca',
    desc: 'Comercial oficial · Toddy.',
    id: '10YKvhMUqvg'
  }
];

function getDuration(filePath) {
  try {
    const out = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`, { encoding: 'utf8' });
    return Math.round(parseFloat(out.trim())) || 25;
  } catch (e) {
    return 25;
  }
}

async function run() {
  console.log(`Downloading ${ADS.length} Venezuelan TV commercials...`);
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

  const jsonOut = path.resolve(OUTPUT_DIR, 'venezuelan_ads.json');
  fs.writeFileSync(jsonOut, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\nSaved ${results.length} Venezuelan ads to ${jsonOut}`);
}

run().catch(console.error);
