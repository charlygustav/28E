const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const BUMPERS_DIR = path.join(__dirname, '..', 'videos', 'bumpers');
if (!fs.existsSync(BUMPERS_DIR)) {
  fs.mkdirSync(BUMPERS_DIR, { recursive: true });
}

console.log('=== INICIANDO PRODUCCIÓN DE BUMPERS DE TV REALES (MP4) ===');

// ========================================================
// 1. CANAL 01: 28E UNO (Cinemático estilo HBO / Apple TV)
// ========================================================
console.log('\n[1/3] Produciendo Bumper Canal 01: 28E Uno (Cine & Prestigio)...');
const outUno = path.join(BUMPERS_DIR, 'bumper_28e_uno.mp4');
const cmdUno = `ffmpeg -y -ss 00:00:10 -t 6 -i "videos/ads/dior_parfums_ad.mp4" -i "assets/logos/bumper_overlay_ch1.png" -filter_complex "[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,eq=brightness=-0.05:contrast=1.35:saturation=1.1,boxblur=4:1,drawbox=y=0:h=90:color=black:t=fill,drawbox=y=990:h=90:color=black:t=fill[bg];[1:v]format=rgba[logo];[bg][logo]overlay=0:0:enable='between(t,0.5,5.5)':format=auto[vbase];[vbase]fade=t=in:st=0:d=0.7,fade=t=out:st=5.3:d=0.7[vout];[0:a]afade=t=in:st=0:d=0.6,afade=t=out:st=5.2:d=0.8,volume=1.2[aout]" -map "[vout]" -map "[aout]" -c:v libx264 -pix_fmt yuv420p -preset fast -crf 20 -c:a aac -b:a 192k -movflags +faststart "${outUno}"`;

try {
  execSync(cmdUno, { stdio: 'inherit' });
  console.log('✓ Bumper 28E Uno generado con éxito:', outUno);
} catch (e) {
  console.error('Error generando bumper Uno:', e.message);
}

// ========================================================
// 2. CANAL 02: 28E FLOW (Urbano estilo MTV / COLORS / Glitch)
// ========================================================
console.log('\n[2/3] Produciendo Bumper Canal 02: 28E Flow (Urbano & Videoclips)...');
const outFlow = path.join(BUMPERS_DIR, 'bumper_28e_flow.mp4');
const cmdFlow = `ffmpeg -y -ss 00:00:02 -t 6 -i "videos/ads/mtv_ident_2022.mp4" -i "assets/logos/bumper_overlay_ch2.png" -filter_complex "[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,eq=contrast=1.3:saturation=1.4[bg];[1:v]format=rgba[logo];[bg][logo]overlay=0:0:enable='between(t,0.3,5.7)':format=auto[vbase];[vbase]fade=t=in:st=0:d=0.4,fade=t=out:st=5.4:d=0.6[vout];[0:a]afade=t=in:st=0:d=0.3,afade=t=out:st=5.4:d=0.6,volume=1.4[aout]" -map "[vout]" -map "[aout]" -c:v libx264 -pix_fmt yuv420p -preset fast -crf 20 -c:a aac -b:a 192k -movflags +faststart "${outFlow}"`;

try {
  execSync(cmdFlow, { stdio: 'inherit' });
  console.log('✓ Bumper 28E Flow generado con éxito:', outFlow);
} catch (e) {
  console.error('Error generando bumper Flow:', e.message);
}

// ========================================================
// 3. CANAL 03: DCLF TV (Studio Ghibli / Relax & Naturaleza)
// ========================================================
console.log('\n[3/3] Produciendo Bumper Canal 03: DCLF TV (Donde Crecen Las Flores)...');
const outDclf = path.join(BUMPERS_DIR, 'bumper_dclf_tv.mp4');
const cmdDclf = `ffmpeg -y -ss 00:00:03 -t 7 -i "videos/28E - Donde crecen las flores (Trailer Oficial).mp4" -i "assets/logos/bumper_overlay_ch3.png" -filter_complex "[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,eq=brightness=0.03:contrast=1.15:saturation=1.2,boxblur=4:1[bg];[1:v]format=rgba[logo];[bg][logo]overlay=0:0:enable='between(t,0.5,6.5)':format=auto[vbase];[vbase]fade=t=in:st=0:d=0.7,fade=t=out:st=6.3:d=0.7[vout];[0:a]afade=t=in:st=0:d=0.6,afade=t=out:st=6.3:d=0.7,volume=1.3[aout]" -map "[vout]" -map "[aout]" -c:v libx264 -pix_fmt yuv420p -preset fast -crf 20 -c:a aac -b:a 192k -movflags +faststart "${outDclf}"`;

try {
  execSync(cmdDclf, { stdio: 'inherit' });
  console.log('✓ Bumper DCLF TV generado con éxito:', outDclf);
} catch (e) {
  console.error('Error generando bumper DCLF TV:', e.message);
}

console.log('\n=== PRODUCCIÓN DE BUMPERS COMPLETADA CON ÉXITO ===');
