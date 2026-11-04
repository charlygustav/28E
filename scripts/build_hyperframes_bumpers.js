const { execSync } = require("child_process");
const fs   = require("fs");
const path = require("path");

const ROOT     = path.join(__dirname, "..");
const HF_BASE  = path.join(ROOT, "videos", "bumpers_hf");
const OUT_DIR  = path.join(ROOT, "videos", "bumpers");
const TTS_DIR  = path.join(HF_BASE, "tts");
const SFX_BASE = path.join(ROOT, ".media", "audio", "sfx");

if (!fs.existsSync(HF_BASE)) fs.mkdirSync(HF_BASE, { recursive: true });
if (!fs.existsSync(OUT_DIR))  fs.mkdirSync(OUT_DIR,  { recursive: true });
if (!fs.existsSync(TTS_DIR))  fs.mkdirSync(TTS_DIR,  { recursive: true });

// ── LOGOS ──────────────────────────────────────────────────────────────────
function readLogo(file) {
  try {
    return fs.readFileSync(path.join(ROOT,"assets","logos",file),"utf8")
      .replace(/<\?xml[^>]*\?>/g,"").replace(/<!DOCTYPE[^>]*>/g,"").trim();
  } catch(e) { return ""; }
}
const LOGO_UNO  = readLogo("logo_28e_uno.svg");
const LOGO_FLOW = readLogo("logo_28e_flow.svg");
const LOGO_DCLF = readLogo("logo_dclf_tv.svg");

// ── BUMPERS ─────────────────────────────────────────────────────────────────
const BUMPERS = [
  { id:"ch1_station_id", ch:1, type:"station_id", dur:5.0, accent:"#10b981",
    line1:"28E UNO",          line2:null,                sub:"SEÑAL PRINCIPAL · 24/7",
    voice:"Veintiocho E Uno. Tu señal principal.",
    sfx:"sfx_002", music:"uno_ident" },
  { id:"ch1_break_in", ch:1, type:"break_in", dur:3.5, accent:"#10b981",
    line1:"YA VOLVEMOS",     line2:null,                sub:"CONTINUAMOS EN BREVE",
    voice:"Ya volvemos. Permanece con nosotros.",
    sfx:"sfx_005", music:"uno_break" },
  { id:"ch1_break_out", ch:1, type:"break_out", dur:3.0, accent:"#10b981",
    line1:"DE REGRESO",      line2:null,                sub:"28E UNO AL AIRE",
    voice:"De regreso. Esto es veintiocho E Uno.",
    sfx:"sfx_006", music:"uno_return" },
  { id:"ch1_up_next", ch:1, type:"up_next", dur:7.0, accent:"#10b981",
    line1:"A CONTINUACION",  line2:"CINE CLUB 28E",     sub:"SESION NOCTURNA",
    voice:"A continuacion, Cine Club veintiocho E. Sesion nocturna.",
    sfx:"sfx_001", music:"uno_preview" },
  { id:"ch2_station_id", ch:2, type:"station_id", dur:5.0, accent:"#a855f7",
    line1:"FLOW",             line2:null,                sub:"VIDEOCLIPS · 24/7",
    voice:"Veintiocho E Flow. La frecuencia urbana, veinticuatro siete.",
    sfx:"sfx_002", music:"flow_drop" },
  { id:"ch2_break_in", ch:2, type:"break_in", dur:3.5, accent:"#a855f7",
    line1:"PAUSA",            line2:null,                sub:"YA VOLVEMOS",
    voice:"Pausa musical. Ya volvemos con mas flow.",
    sfx:"sfx_005", music:"flow_pause" },
  { id:"ch2_break_out", ch:2, type:"break_out", dur:3.0, accent:"#a855f7",
    line1:"EN ROTACION",     line2:null,                sub:"FLOW AL AIRE",
    voice:"De vuelta a la rotacion. Esto es veintiocho E Flow.",
    sfx:"sfx_006", music:"flow_return" },
  { id:"ch2_up_next", ch:2, type:"up_next", dur:7.0, accent:"#a855f7",
    line1:"EN SEGUIDA",      line2:"TULIPANES PA YAIRE",sub:"CHARLES GUSTAV",
    voice:"En seguida. Tulipanes para Yaire, de Charles Gustav.",
    sfx:"sfx_001", music:"flow_preview" },
  { id:"ch3_station_id", ch:3, type:"station_id", dur:5.0, accent:"#f472b6",
    line1:"DCLF",             line2:"TV",                sub:"DONDE CRECEN LAS FLORES",
    voice:"De Ce Ele Efe Television. Donde crecen las flores.",
    sfx:"sfx_004", music:"dclf_chime" },
  { id:"ch3_break_in", ch:3, type:"break_in", dur:3.5, accent:"#f472b6",
    line1:"PAUSA",            line2:null,                sub:"RESPIRA",
    voice:"Una pausa. Respira. Ya volvemos.",
    sfx:"sfx_004", music:"dclf_soft" },
  { id:"ch3_break_out", ch:3, type:"break_out", dur:3.0, accent:"#f472b6",
    line1:"VOLVEMOS",         line2:null,                sub:"FLORECIENDO",
    voice:"Volvemos a florecer. De Ce Ele Efe Television.",
    sfx:"sfx_006", music:"dclf_return" },
  { id:"ch3_up_next", ch:3, type:"up_next", dur:7.0, accent:"#f472b6",
    line1:"PROXIMO",          line2:"EN EL JARDIN",      sub:"PASEO NOCTURNO",
    voice:"Proximamente. Paseo nocturno por el jardin. Un recorrido ambiental.",
    sfx:"sfx_001", music:"dclf_preview" },
];

// ── TTS ──────────────────────────────────────────────────────────────────────
function genVoice(b, dest) {
  if (fs.existsSync(dest)) { console.log("    voice cached"); return true; }
  try {
    execSync(
      "npx.cmd hyperframes tts \"" + b.voice + "\" --voice bm_george --lang es --speed 0.86 --output \"" + dest + "\"",
      { stdio:"pipe" }
    );
    return fs.existsSync(dest);
  } catch(e) {
    const msg = String(e.stderr||e.stdout||"");
    console.log("    [WARN] TTS: " + msg.slice(0,80));
    return false;
  }
}

// ── AUDIO ─────────────────────────────────────────────────────────────────────
function musicLavfi(name, d) {
  const R = {
    uno_ident:   "sine=f=65.41:d="+d+"[b];sine=f=130.81:d="+d+"[m];sine=f=261.63:d="+d+"[h];sine=f=392:d="+d+"[s];[b]volume=0.55[b2];[m]volume=0.27[m2];[h]volume=0.12[h2];[s]volume=0.06[s2];[b2][m2][h2][s2]amix=inputs=4,aecho=0.6:0.5:320:0.38,lowpass=f=900,afade=t=in:st=0:d=0.35,afade=t=out:st="+(d-1.2)+":d=1.2",
    uno_break:   "sine=f=130.81:d="+d+"[a];sine=f=196:d="+d+"[b];[a]volume=0.6[a2];[b]volume=0.4[b2];[a2][b2]amix=inputs=2,lowpass=f=1100,aecho=0.5:0.4:200:0.28,afade=t=in:st=0:d=0.12,afade=t=out:st="+(d-0.7)+":d=0.7",
    uno_return:  "sine=f=196:d="+d+"[a];sine=f=261.63:d="+d+"[b];[a]volume=0.55[a2];[b]volume=0.45[b2];[a2][b2]amix=inputs=2,lowpass=f=1200,aecho=0.45:0.38:180:0.22,afade=t=in:st=0:d=0.1,afade=t=out:st="+(d-0.6)+":d=0.6",
    uno_preview: "sine=f=65.41:d="+d+"[b];sine=f=130.81:d="+d+"[m];sine=f=196:d="+d+"[h];sine=f=261.63:d="+d+"[s];sine=f=392:d="+d+"[o];[b]volume=0.42[b2];[m]volume=0.26[m2];[h]volume=0.16[h2];[s]volume=0.1[s2];[o]volume=0.06[o2];[b2][m2][h2][s2][o2]amix=inputs=5,aecho=0.7:0.55:380:0.45,lowpass=f=1400,afade=t=in:st=0:d=0.6,afade=t=out:st="+(d-1.5)+":d=1.5",
    flow_drop:   "sine=f=43.65:d="+d+"[s];sine=f=87.31:d="+d+"[m];sine=f=220:d="+d+"[h];[s]volume=0.68[s2];[m]volume=0.24[m2];[h]volume=0.08[h2];[s2][m2][h2]amix=inputs=3,lowpass=f=420,aecho=0.3:0.2:80:0.18,afade=t=in:st=0:d=0.06,afade=t=out:st="+(d-0.8)+":d=0.8",
    flow_pause:  "sine=f=87.31:d="+d+"[a];sine=f=174.61:d="+d+"[b];[a]volume=0.65[a2];[b]volume=0.35[b2];[a2][b2]amix=inputs=2,lowpass=f=520,aecho=0.28:0.18:60:0.14,afade=t=in:st=0:d=0.08,afade=t=out:st="+(d-0.6)+":d=0.6",
    flow_return: "sine=f=87.31:d="+d+"[a];sine=f=220:d="+d+"[b];[a]volume=0.62[a2];[b]volume=0.38[b2];[a2][b2]amix=inputs=2,lowpass=f=600,aecho=0.32:0.22:90:0.16,afade=t=in:st=0:d=0.08,afade=t=out:st="+(d-0.55)+":d=0.55",
    flow_preview:"sine=f=43.65:d="+d+"[s];sine=f=87.31:d="+d+"[m];sine=f=174.61:d="+d+"[h];sine=f=349.23:d="+d+"[t];[s]volume=0.5[s2];[m]volume=0.28[m2];[h]volume=0.15[h2];[t]volume=0.07[t2];[s2][m2][h2][t2]amix=inputs=4,lowpass=f=700,aecho=0.38:0.28:110:0.22,afade=t=in:st=0:d=0.4,afade=t=out:st="+(d-1.4)+":d=1.4",
    dclf_chime:  "sine=f=659.26:d="+d+"[a];sine=f=880:d="+d+"[b];sine=f=1046.5:d="+d+"[c];sine=f=1318.5:d="+d+"[e];[a]adelay=0|0[a2];[b]adelay=200|200[b2];[c]adelay=400|400[c2];[e]adelay=600|600[e2];[a2]volume=0.46[av];[b2]volume=0.3[bv];[c2]volume=0.16[cv];[e2]volume=0.08[ev];[av][bv][cv][ev]amix=inputs=4,aecho=0.55:0.42:260:0.36,afade=t=in:st=0:d=0.06,afade=t=out:st="+(d-1.3)+":d=1.3",
    dclf_soft:   "sine=f=659.26:d="+d+"[a];sine=f=987.77:d="+d+"[b];[a]adelay=0|0[a2];[b]adelay=150|150[b2];[a2]volume=0.54[av];[b2]volume=0.46[bv];[av][bv]amix=inputs=2,aecho=0.48:0.36:200:0.28,afade=t=in:st=0:d=0.06,afade=t=out:st="+(d-0.9)+":d=0.9",
    dclf_return: "sine=f=783.99:d="+d+"[a];sine=f=1046.5:d="+d+"[b];[a]volume=0.56[a2];[b]volume=0.44[b2];[a2][b2]amix=inputs=2,aecho=0.44:0.33:180:0.24,afade=t=in:st=0:d=0.06,afade=t=out:st="+(d-0.7)+":d=0.7",
    dclf_preview:"sine=f=523.25:d="+d+"[a];sine=f=659.26:d="+d+"[b];sine=f=783.99:d="+d+"[c];sine=f=1046.5:d="+d+"[e];sine=f=1318.5:d="+d+"[f2];[a]adelay=0|0[a2];[b]adelay=180|180[b2];[c]adelay=360|360[c2];[e]adelay=540|540[e2];[f2]adelay=720|720[f3];[a2]volume=0.36[av];[b2]volume=0.28[bv];[c2]volume=0.18[cv];[e2]volume=0.12[ev];[f3]volume=0.06[fv];[av][bv][cv][ev][fv]amix=inputs=5,aecho=0.62:0.48:300:0.42,afade=t=in:st=0:d=0.6,afade=t=out:st="+(d-1.6)+":d=1.6",
  };
  return R[name] || R.uno_break;
}

function buildAudio(b, voiceWav, sfxPath, dest) {
  const d   = b.dur;
  const mf  = musicLavfi(b.music, d);
  const hasV = voiceWav && fs.existsSync(voiceWav);
  const hasS = sfxPath  && fs.existsSync(sfxPath);
  const ins = ["-f lavfi -i \"" + mf + "\""];
  if (hasV) ins.push("-i \"" + voiceWav + "\"");
  if (hasS) ins.push("-i \"" + sfxPath  + "\"");
  let fc;
  const n = ins.length;
  if (n===1) fc="[0:a]volume=1.0[out]";
  else if (n===2&&hasV) fc="[0:a]volume=0.18[mu];[1:a]volume=1.0,adelay=700|700[vo];[mu][vo]amix=inputs=2[out]";
  else if (n===2&&hasS) fc="[0:a]volume=0.78[mu];[1:a]volume=0.55,atrim=end="+d+",afade=t=out:st="+(d-0.4)+":d=0.4[sf];[mu][sf]amix=inputs=2[out]";
  else fc="[0:a]volume=0.16[mu];[1:a]volume=1.0,adelay=700|700[vo];[2:a]volume=0.5,atrim=end="+d+",afade=t=out:st="+(d-0.4)+":d=0.4[sf];[mu][vo][sf]amix=inputs=3[out]";
  execSync("ffmpeg -y "+ins.join(" ")+" -filter_complex \""+fc+"\" -map \"[out]\" -ar 48000 -ac 2 \""+dest+"\"",{stdio:"ignore"});
}

// ── SHARED CANVAS PARTICLES ──────────────────────────────────────────────────
function ptcJS(accent, n) {
  return "(function(){var c=document.getElementById('ptc');if(!c)return;var ctx=c.getContext('2d');c.width=1920;c.height=1080;var P=[];for(var i=0;i<"+n+";i++)P.push({x:Math.random()*1920,y:Math.random()*1080,vx:(Math.random()-0.5)*0.44,vy:(Math.random()-0.5)*0.38,r:Math.random()*1.4+0.3,a:Math.random()*0.16+0.04});var t0=null;function draw(ts){if(!t0)t0=ts;var t=(ts-t0)/1000;ctx.clearRect(0,0,1920,1080);P.forEach(function(p){p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=1920;if(p.x>1920)p.x=0;if(p.y<0)p.y=1080;if(p.y>1080)p.y=0;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle='"+accent+"';ctx.globalAlpha=p.a*(0.55+0.45*Math.sin(t*0.7+p.x*0.009));ctx.fill();});ctx.globalAlpha=1;requestAnimationFrame(draw);}requestAnimationFrame(draw);})();";
}

function gridSVG(stroke) {
  return "<svg id='grid' style='position:absolute;inset:0;width:100%;height:100%;opacity:0;pointer-events:none;' xmlns='http://www.w3.org/2000/svg'><line class='gl' x1='0' y1='540' x2='1920' y2='540'/><line class='gl' x1='960' y1='0' x2='960' y2='1080'/><line class='gl' x1='0' y1='270' x2='1920' y2='270' style='opacity:.5'/><line class='gl' x1='0' y1='810' x2='1920' y2='810' style='opacity:.5'/><style>.gl{stroke:"+stroke+";stroke-width:1;}</style></svg>";
}

// ── HTML: 28E UNO ─────────────────────────────────────────────────────────────
function htmlUno(b) {
  const ex=b.dur-0.55, isId=b.type==="station_id", isNx=b.type==="up_next";
  const tpx=isId?"148px":isNx?"96px":"120px";
  const ghost=isId?"01":isNx?"&rarr;":"&mdash;";
  return "<!doctype html><html lang='es'><head><meta charset='UTF-8'><title>"+b.id+"</title><style>*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}html,body{width:1920px;height:1080px;overflow:hidden;background:#000;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;}#root{position:relative;width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;padding:0 160px;overflow:hidden;}#ptc{position:absolute;inset:0;width:1920px;height:1080px;pointer-events:none;}.ghost{position:absolute;right:-60px;top:-90px;font-size:700px;font-weight:900;color:transparent;-webkit-text-stroke:1px rgba(16,185,129,0.055);line-height:1;letter-spacing:-0.05em;pointer-events:none;}.laser{position:absolute;top:50%;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,#10b981 20%,#10b981 80%,transparent);transform:scaleX(0);transform-origin:left;}.laser2{position:absolute;top:calc(50% + 52px);left:0;width:480px;height:1px;background:linear-gradient(90deg,rgba(16,185,129,0.32),transparent);transform:scaleX(0);transform-origin:left;}.scan{position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(16,185,129,0.2),transparent);top:-2px;}.chnum{position:absolute;top:72px;left:160px;font-size:10px;font-weight:700;letter-spacing:.44em;color:#10b981;text-transform:uppercase;}.hdtag{position:absolute;top:72px;right:160px;font-size:10px;font-weight:700;letter-spacing:.28em;color:rgba(16,185,129,.45);font-family:ui-monospace,monospace;}.wm{position:absolute;bottom:72px;right:160px;font-size:10px;letter-spacing:.35em;color:rgba(255,255,255,.1);text-transform:uppercase;}.logo-wrap{position:absolute;bottom:72px;left:160px;opacity:0;max-height:52px;}.logo-wrap svg,.logo-wrap img{max-height:52px;width:auto;}.title{position:relative;z-index:2;font-size:"+tpx+";font-weight:800;letter-spacing:-.04em;color:#fff;line-height:.9;text-transform:uppercase;}.title2{position:relative;z-index:2;font-size:42px;font-weight:300;letter-spacing:.22em;color:rgba(255,255,255,.44);text-transform:uppercase;margin-top:20px;}.sub{position:relative;z-index:2;margin-top:26px;font-size:11px;font-weight:400;letter-spacing:.36em;color:rgba(255,255,255,.24);font-family:ui-monospace,monospace;text-transform:uppercase;}.dot{display:inline-block;width:5px;height:5px;border-radius:50%;background:#10b981;margin-right:10px;vertical-align:middle;}</style><script src='https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js'></script></head><body><div id='root' data-composition-id='"+b.id+"' data-start='0' data-duration='"+b.dur+"' data-width='1920' data-height='1080'><audio id='bgm' src='audio.wav' data-start='0' data-duration='"+b.dur+"'></audio><canvas id='ptc'></canvas>"+gridSVG("rgba(16,185,129,0.06)")+"<div class='ghost' id='ghost'>"+ghost+"</div><div class='laser' id='laser'><div class='scan' id='scan'></div></div><div class='laser2' id='laser2'></div><div class='chnum' id='chnum'>CANAL 01 &bull; 28E UNO</div><div class='hdtag' id='hdtag'>HD &bull; 1080p</div><div class='wm' id='wm'>28E Network</div><div class='logo-wrap' id='logo'>"+LOGO_UNO+"</div><h1 class='title' id='title'>"+b.line1+"</h1>"+(b.line2?"<div class='title2' id='title2'>"+b.line2+"</div>":"")+"<div class='sub' id='sub'><span class='dot' id='dot'></span>"+b.sub+"</div></div><script>"+ptcJS("#10b981",22)+"\nconst tl=gsap.timeline({paused:true});\ntl.fromTo('#grid',{opacity:0},{opacity:1,duration:.3,ease:'power1.out'},0);\ntl.fromTo('#ghost',{opacity:0,scale:.94,transformOrigin:'right top'},{opacity:1,scale:1,duration:.55,ease:'power2.out'},0);\ntl.fromTo('#laser',{scaleX:0},{scaleX:1,duration:.22,ease:'power4.out'},.06);\ntl.fromTo('#laser2',{scaleX:0},{scaleX:1,duration:.18,ease:'power3.out'},.14);\ntl.to('#scan',{y:1082,duration:"+b.dur+",ease:'none',repeat:-1},.06);\ntl.fromTo('#chnum',{x:-24,opacity:0},{x:0,opacity:1,duration:.28,ease:'power2.out'},.12);\ntl.fromTo('#hdtag',{opacity:0},{opacity:1,duration:.22,ease:'power1.out'},.18);\ntl.fromTo('#title',{x:-64,opacity:0,skewX:'-2deg'},{x:0,opacity:1,skewX:'0deg',duration:.32,ease:'expo.out'},.18);\n"+(b.line2?"tl.fromTo('#title2',{x:-32,opacity:0},{x:0,opacity:1,duration:.28,ease:'expo.out'},.26);\n":"")+"tl.fromTo('#dot',{scale:0},{scale:1,duration:.2,ease:'back.out(3)'},.3);\ntl.fromTo('#sub',{opacity:0,y:10},{opacity:1,y:0,duration:.24,ease:'power2.out'},.32);\ntl.fromTo('#logo',{opacity:0,y:6},{opacity:1,y:0,duration:.32,ease:'back.out(1.5)'},.42);\ntl.fromTo('#wm',{opacity:0},{opacity:1,duration:.28,ease:'power1.out'},.32);\ntl.to('#laser',{opacity:.12,duration:.8,ease:'power1.in'},.5);\ntl.to('#laser2',{opacity:.16,duration:.6,ease:'power1.in'},.5);\ntl.to(['#title','#title2','#sub','#ghost','#chnum','#hdtag','#logo','#wm','#grid'],{opacity:0,duration:.22,ease:'power2.in',stagger:.016},"+ex+");\ntl.to(['#laser','#laser2'],{scaleX:0,opacity:0,duration:.16,ease:'power3.in',transformOrigin:'right'},"+(ex+0.05)+");\nwindow.__timelines=window.__timelines||{};window.__timelines['"+b.id+"']=tl;tl.seek(0);<\/script></body></html>";
}

// ── HTML: 28E FLOW ────────────────────────────────────────────────────────────
function htmlFlow(b) {
  const ex=b.dur-0.55, isId=b.type==="station_id", isNx=b.type==="up_next";
  const tpx=isId?"240px":isNx?"110px":"152px";
  const outlined=isId?"color:transparent;-webkit-text-stroke:2.5px #a855f7;":"color:#fff;";
  return "<!doctype html><html lang='es'><head><meta charset='UTF-8'><title>"+b.id+"</title><style>*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}html,body{width:1920px;height:1080px;overflow:hidden;background:#000;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;}#root{position:relative;width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:flex-end;padding:0 160px;overflow:hidden;}#ptc{position:absolute;inset:0;width:1920px;height:1080px;pointer-events:none;}.vbar{position:absolute;left:0;top:0;bottom:0;width:4px;background:#a855f7;transform:scaleY(0);transform-origin:bottom;}.vbar2{position:absolute;left:18px;top:20%;bottom:20%;width:1px;background:linear-gradient(to bottom,transparent,rgba(168,85,247,.28),transparent);transform:scaleY(0);transform-origin:center;}.hbar{position:absolute;right:0;top:50%;height:1px;width:38%;background:linear-gradient(90deg,transparent,rgba(168,85,247,.22));transform:scaleX(0);transform-origin:right;}.chtag{position:absolute;top:0;left:40px;bottom:0;display:flex;align-items:center;font-size:10px;font-weight:700;letter-spacing:.45em;color:#a855f7;text-transform:uppercase;writing-mode:vertical-rl;transform:rotate(180deg);}.logo-wrap{position:absolute;bottom:72px;right:160px;opacity:0;max-height:52px;}.logo-wrap svg,.logo-wrap img{max-height:52px;width:auto;}.wm{position:absolute;top:72px;right:160px;font-size:10px;letter-spacing:.35em;color:rgba(255,255,255,.1);text-transform:uppercase;}.title{position:relative;z-index:2;font-size:"+tpx+";font-weight:900;letter-spacing:-.04em;text-transform:uppercase;line-height:.85;text-align:right;"+outlined+"}.title2{position:relative;z-index:2;font-size:34px;font-weight:300;letter-spacing:.2em;color:rgba(168,85,247,.58);text-transform:uppercase;text-align:right;margin-top:14px;}.sub{position:relative;z-index:2;margin-top:22px;font-size:11px;letter-spacing:.4em;color:rgba(255,255,255,.22);font-family:ui-monospace,monospace;text-transform:uppercase;text-align:right;}.freq{position:absolute;left:64px;bottom:80px;display:flex;flex-direction:column;gap:5px;opacity:0;}.fb{height:2px;background:rgba(168,85,247,.48);border-radius:1px;}.pulse{position:absolute;top:50%;left:100px;width:8px;height:8px;border-radius:50%;background:#a855f7;transform:translateY(-50%) scale(0);margin-top:-4px;}</style><script src='https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js'></script></head><body><div id='root' data-composition-id='"+b.id+"' data-start='0' data-duration='"+b.dur+"' data-width='1920' data-height='1080'><audio id='bgm' src='audio.wav' data-start='0' data-duration='"+b.dur+"'></audio><canvas id='ptc'></canvas>"+gridSVG("rgba(168,85,247,0.065)")+"<div class='vbar' id='vb1'></div><div class='vbar2' id='vb2'></div><div class='hbar' id='hb'></div><div class='pulse' id='pulse'></div><div class='chtag' id='chtag'>02 &bull; 28E FLOW</div><div class='wm' id='wm'>28E Network</div><div class='logo-wrap' id='logo'>"+LOGO_FLOW+"</div><div class='freq' id='freq'><div class='fb' id='fb0' style='width:80px'></div><div class='fb' id='fb1' style='width:50px'></div><div class='fb' id='fb2' style='width:100px'></div><div class='fb' id='fb3' style='width:62px'></div><div class='fb' id='fb4' style='width:38px'></div><div class='fb' id='fb5' style='width:74px'></div><div class='fb' id='fb6' style='width:90px'></div><div class='fb' id='fb7' style='width:55px'></div></div><h1 class='title' id='title'>"+b.line1+"</h1>"+(b.line2?"<div class='title2' id='title2'>"+b.line2+"</div>":"")+"<div class='sub' id='sub'>"+b.sub+"</div></div><script>"+ptcJS("#a855f7",18)+"\nconst tl=gsap.timeline({paused:true});\ntl.fromTo('#grid',{opacity:0},{opacity:1,duration:.22,ease:'power1.out'},0);\ntl.fromTo('#vb1',{scaleY:0},{scaleY:1,duration:.18,ease:'power4.out'},0);\ntl.fromTo('#vb2',{scaleY:0},{scaleY:1,duration:.28,ease:'power3.out'},.06);\ntl.fromTo('#hb',{scaleX:0},{scaleX:1,duration:.22,ease:'power3.out'},.1);\ntl.fromTo('#pulse',{scale:0},{scale:1,duration:.18,ease:'back.out(3)'},.12);\ntl.to('#pulse',{scale:1.8,opacity:0,duration:.55,ease:'power1.out',repeat:-1,repeatDelay:.7},.28);\ntl.fromTo('#chtag',{opacity:0,x:10},{opacity:1,x:0,duration:.26,ease:'power2.out'},.08);\ntl.fromTo('#wm',{opacity:0},{opacity:1,duration:.24,ease:'power1.out'},.2);\ntl.fromTo('#title',{x:72,opacity:0,skewX:'3deg'},{x:0,opacity:1,skewX:'0deg',duration:.28,ease:'expo.out'},.12);\n"+(b.line2?"tl.fromTo('#title2',{x:36,opacity:0},{x:0,opacity:1,duration:.24,ease:'expo.out'},.2);\n":"")+"tl.fromTo('#sub',{opacity:0},{opacity:1,duration:.22,ease:'power1.out'},.26);\ntl.fromTo('#freq',{opacity:0},{opacity:1,duration:.2,ease:'power1.out'},.3);\ntl.fromTo('#logo',{opacity:0,y:6},{opacity:1,y:0,duration:.28,ease:'back.out(1.5)'},.38);\n[80,50,100,62,38,74,90,55].forEach(function(w,i){tl.to('#fb'+i,{width:(w*.22)+'px',duration:.28+i*.02,ease:'power1.inOut',yoyo:true,repeat:-1,repeatDelay:.2},.36+i*.03);});\ntl.to(['#title','#title2','#sub','#logo','#wm','#chtag','#freq','#grid','#pulse'],{opacity:0,duration:.2,ease:'power2.in',stagger:.013},"+ex+");\ntl.to(['#vb1','#vb2'],{scaleY:0,transformOrigin:'bottom',duration:.15,ease:'power3.in'},"+(ex+0.04)+");\ntl.to('#hb',{scaleX:0,transformOrigin:'right',duration:.13,ease:'power3.in'},"+(ex+0.04)+");\nwindow.__timelines=window.__timelines||{};window.__timelines['"+b.id+"']=tl;tl.seek(0);<\/script></body></html>";
}

// ── HTML: DCLF TV ─────────────────────────────────────────────────────────────
function htmlDclf(b) {
  const ex=b.dur-0.55, isId=b.type==="station_id", isNx=b.type==="up_next";
  const tpx=isId?"200px":isNx?"128px":"148px";
  return "<!doctype html><html lang='es'><head><meta charset='UTF-8'><title>"+b.id+"</title><style>*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}html,body{width:1920px;height:1080px;overflow:hidden;background:#000;-webkit-font-smoothing:antialiased;}#root{position:relative;width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;padding:0 160px;overflow:hidden;}#ptc{position:absolute;inset:0;width:1920px;height:1080px;pointer-events:none;}.petal-wrap{position:absolute;right:180px;top:50%;transform:translateY(-50%);width:420px;height:420px;opacity:0;}.petal-wrap svg{width:100%;height:100%;}.pp{fill:none;stroke:#f472b6;stroke-linecap:round;stroke-dasharray:1400;stroke-dashoffset:1400;}.pp2{fill:none;stroke:rgba(244,114,182,.26);stroke-linecap:round;stroke-dasharray:700;stroke-dashoffset:700;}.hl{position:absolute;top:50%;left:0;right:0;height:1px;background:rgba(244,114,182,.12);transform:scaleX(0);transform-origin:left;}.hl2{position:absolute;top:calc(50% - 56px);left:0;width:520px;height:1px;background:linear-gradient(90deg,rgba(244,114,182,.2),transparent);transform:scaleX(0);transform-origin:left;}.chtag{position:absolute;top:72px;left:160px;font-size:10px;font-weight:600;letter-spacing:.44em;color:rgba(244,114,182,.62);font-family:'Helvetica Neue',sans-serif;text-transform:uppercase;}.logo-wrap{position:absolute;bottom:72px;left:160px;opacity:0;max-height:52px;}.logo-wrap svg,.logo-wrap img{max-height:52px;width:auto;}.wm{position:absolute;bottom:72px;right:160px;font-size:10px;letter-spacing:.35em;color:rgba(255,255,255,.09);font-family:'Helvetica Neue',sans-serif;text-transform:uppercase;}.title{position:relative;z-index:2;font-size:"+tpx+";font-weight:900;font-style:italic;letter-spacing:-.04em;color:#fff;line-height:.88;text-transform:uppercase;font-family:Georgia,'Times New Roman',serif;}.title2{position:relative;z-index:2;font-size:50px;font-weight:300;font-style:normal;letter-spacing:.26em;color:rgba(244,114,182,.52);text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,sans-serif;margin-top:18px;}.sub{position:relative;z-index:2;margin-top:24px;font-size:11px;letter-spacing:.42em;color:rgba(255,255,255,.2);font-family:'Helvetica Neue',sans-serif;text-transform:uppercase;}.pdot{position:absolute;right:368px;top:50%;width:5px;height:5px;border-radius:50%;background:#f472b6;transform:translateY(-50%) scale(0);margin-top:-2px;}</style><script src='https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js'></script></head><body><div id='root' data-composition-id='"+b.id+"' data-start='0' data-duration='"+b.dur+"' data-width='1920' data-height='1080'><audio id='bgm' src='audio.wav' data-start='0' data-duration='"+b.dur+"'></audio><canvas id='ptc'></canvas>"+gridSVG("rgba(244,114,182,0.055)")+"<div class='hl' id='hl'></div><div class='hl2' id='hl2'></div><div class='petal-wrap' id='pw'><svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><path class='pp' id='p1' stroke-width='1.4' d='M100,10 C142,38 168,78 158,112 C146,150 118,172 100,176 C82,172 54,150 42,112 C32,78 58,38 100,10 Z'/><path class='pp2' id='p2' stroke-width='.8' d='M100,40 C124,58 134,82 128,104 C120,132 110,148 100,150 C90,148 80,132 72,104 C66,82 76,58 100,40 Z'/><line id='stem' x1='100' y1='176' x2='100' y2='198' stroke='#f472b6' stroke-width='1' stroke-opacity='.4' stroke-dasharray='22' stroke-dashoffset='22'/><circle id='pistil' cx='100' cy='100' r='0' fill='none' stroke='rgba(244,114,182,.32)' stroke-width='.8'/></svg></div><div class='pdot' id='pdot'></div><div class='chtag' id='chtag'>03 &bull; DCLF TV</div><div class='wm' id='wm'>28E Network</div><div class='logo-wrap' id='logo'>"+LOGO_DCLF+"</div><h1 class='title' id='title'>"+b.line1+"</h1>"+(b.line2?"<div class='title2' id='title2'>"+b.line2+"</div>":"")+"<div class='sub' id='sub'>"+b.sub+"</div></div><script>"+ptcJS("#f472b6",16)+"\nconst tl=gsap.timeline({paused:true});\ntl.fromTo('#grid',{opacity:0},{opacity:1,duration:.28,ease:'power1.out'},0);\ntl.fromTo('#hl',{scaleX:0},{scaleX:1,duration:.5,ease:'power2.out'},0);\ntl.fromTo('#hl2',{scaleX:0},{scaleX:1,duration:.38,ease:'power2.out'},.08);\ntl.fromTo('#chtag',{opacity:0,y:-10},{opacity:1,y:0,duration:.28,ease:'power2.out'},.1);\ntl.to('#pw',{opacity:1,duration:.01},.14);\ntl.to('#p1',{strokeDashoffset:0,duration:1.5,ease:'power1.inOut'},.14);\ntl.to('#p2',{strokeDashoffset:0,duration:1.1,ease:'power1.inOut'},.44);\ntl.to('#stem',{strokeDashoffset:0,duration:.36,ease:'power2.out'},.92);\ntl.to('#pistil',{attr:{r:20},duration:.6,ease:'elastic.out(1,.5)'},.72);\ntl.fromTo('#pdot',{scale:0},{scale:1,duration:.22,ease:'back.out(3)'},.74);\ntl.to('#pdot',{scale:1.6,opacity:0,duration:.7,ease:'power1.out',repeat:-1,repeatDelay:.95},1.0);\ntl.fromTo('#title',{y:48,opacity:0},{y:0,opacity:1,duration:.46,ease:'power3.out'},.18);\n"+(b.line2?"tl.fromTo('#title2',{y:24,opacity:0},{y:0,opacity:1,duration:.36,ease:'power2.out'},.3);\n":"")+"tl.fromTo('#sub',{opacity:0},{opacity:1,duration:.28,ease:'power1.out'},.38);\ntl.fromTo('#wm',{opacity:0},{opacity:1,duration:.22,ease:'power1.out'},.32);\ntl.fromTo('#logo',{opacity:0,y:6},{opacity:1,y:0,duration:.3,ease:'back.out(1.5)'},.46);\ntl.to(['#title','#title2','#sub','#wm','#chtag','#logo','#grid','#pdot'],{opacity:0,duration:.24,ease:'power2.in',stagger:.016},"+ex+");\ntl.to('#pw',{opacity:0,duration:.2,ease:'power1.in'},"+ex+");\ntl.to(['#hl','#hl2'],{scaleX:0,transformOrigin:'right',duration:.18,ease:'power3.in'},"+(ex+0.04)+");\nwindow.__timelines=window.__timelines||{};window.__timelines['"+b.id+"']=tl;tl.seek(0);<\/script></body></html>";
}

function makeHtml(b) {
  if (b.ch===1) return htmlUno(b);
  if (b.ch===2) return htmlFlow(b);
  return htmlDclf(b);
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
const HFJ=JSON.stringify({"$schema":"https://hyperframes.heygen.com/schema/hyperframes.json","registry":"https://raw.githubusercontent.com/heygen-com/hyperframes/main/registry","paths":{"blocks":"compositions","components":"compositions/components","assets":"assets"}},null,2);
const PKJ=JSON.stringify({"name":"28e-bumper","version":"1.0.0","private":true},null,2);

async function buildAll() {
  console.log("\n=== 28E BUMPERS v3 — LOGOS + GSAP + PARTICLES + MUSIC + SFX ===\n");
  for (let i=0;i<BUMPERS.length;i++) {
    const b=BUMPERS[i];
    const dir=path.join(HF_BASE,b.id);
    fs.mkdirSync(dir,{recursive:true});
    fs.writeFileSync(path.join(dir,"hyperframes.json"),HFJ);
    fs.writeFileSync(path.join(dir,"package.json"),PKJ);
    const html=makeHtml(b);
    fs.writeFileSync(path.join(dir,"index.html"),html,"utf8");
    console.log("["+String(i+1).padStart(2,"0")+"/12] "+b.id+"  ("+b.dur+"s, html="+html.length+"B)");
    const vp=path.join(TTS_DIR,b.id+".wav");
    const hv=genVoice(b,vp);
    const sp=path.join(SFX_BASE,b.sfx+".mp3");
    const hs=fs.existsSync(sp);
    if(!hs)console.log("    [WARN] sfx missing: "+b.sfx);
    const aw=path.join(dir,"audio.wav");
    try { buildAudio(b,hv?vp:null,hs?sp:null,aw); console.log("    audio OK  voice="+hv+" sfx="+hs); }
    catch(e) {
      console.error("    audio ERR: "+String(e.message).slice(0,100));
      execSync("ffmpeg -y -f lavfi -i anullsrc=r=48000:cl=stereo -t "+b.dur+" \""+aw+"\"",{stdio:"ignore"});
    }
    const out=path.join(OUT_DIR,b.id+".mp4");
    try { execSync("npx.cmd hyperframes render \""+dir+"\" --output=\""+out+"\" --quality looks",{stdio:"inherit"}); console.log("  OK\n"); }
    catch(e) { console.error("  RENDER ERR: "+e.message+"\n"); }
  }
  const aliases={"ch1_station_id.mp4":"bumper_28e_uno.mp4","ch2_station_id.mp4":"bumper_28e_flow.mp4","ch3_station_id.mp4":"bumper_dclf_tv.mp4"};
  for(const[s,d]of Object.entries(aliases)){const sp=path.join(OUT_DIR,s),dp=path.join(OUT_DIR,d);if(fs.existsSync(sp)){fs.copyFileSync(sp,dp);console.log("alias -> "+d);}}
  console.log("\n=== DONE === Bumpers en: videos/bumpers/");
}
buildAll();
