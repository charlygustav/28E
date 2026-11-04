const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const HF_BASE = path.join(ROOT, "videos", "bumpers_hf");
const OUT_DIR = path.join(ROOT, "videos", "bumpers");
if (!fs.existsSync(HF_BASE)) fs.mkdirSync(HF_BASE, { recursive: true });
if (!fs.existsSync(OUT_DIR))  fs.mkdirSync(OUT_DIR,  { recursive: true });

// Write the HTML files for each bumper directly
// Then run hyperframes render on each

// After that copys aliases

console.log("WRITE_TEMPLATES=true");
