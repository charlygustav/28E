const fs = require('fs');
const path = require('path');

const srcDir = __dirname;
const distDir = path.join(__dirname, 'dist');

// Define exactly what to copy to the mobile app
const allowedFiles = [
    'index.html',
    'maintenance.html',
    'mantenimiento.html',
    'wrapped.html',
    'tulip.ico',
    'maintenance_bg.mp4',
    'bg-mantenimiento.mp4',
    'config.json'
];

const allowedFolders = [
    'images',
    'sounds',
    'radio',
    'gallery',
    'lasfotos'
];

// Helper to copy files recursively
function copySync(src, dest) {
    if (!fs.existsSync(src)) return;
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        fs.readdirSync(src).forEach(item => {
            copySync(path.join(src, item), path.join(dest, item));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

// 1. Create clean dist directory
if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// 2. Copy allowed files
allowedFiles.forEach(file => {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(distDir, file);
    if (fs.existsSync(srcPath)) {
        copySync(srcPath, destPath);
        console.log(`Copied file: ${file}`);
    }
});

// 3. Copy allowed folders
allowedFolders.forEach(folder => {
    const srcPath = path.join(srcDir, folder);
    const destPath = path.join(distDir, folder);
    if (fs.existsSync(srcPath)) {
        copySync(srcPath, destPath);
        console.log(`Copied folder: ${folder}`);
    }
});

console.log('Build completed! Files are ready in the dist/ folder for Capacitor.');
