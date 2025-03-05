const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ICON_SIZE = 1024;
const ADAPTIVE_ICON_SIZE = 1024;
const SPLASH_SIZE = 2048;

async function generateIcons() {
  const assetsDir = path.join(__dirname, '../assets');
  
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir);
  }

  // Ana ikon
  await sharp({
    create: {
      width: ICON_SIZE,
      height: ICON_SIZE,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
  .composite([{
    input: Buffer.from(`
      <svg width="${ICON_SIZE}" height="${ICON_SIZE}" viewBox="0 0 ${ICON_SIZE} ${ICON_SIZE}">
        <rect width="100%" height="100%" fill="#f44336"/>
        <text x="50%" y="50%" font-family="Arial" font-size="${ICON_SIZE/4}" fill="white" text-anchor="middle" dy="${ICON_SIZE/8}">G</text>
      </svg>
    `),
    top: 0,
    left: 0,
  }])
  .png()
  .toFile(path.join(assetsDir, 'icon.png'));

  // Adaptive ikon
  await sharp({
    create: {
      width: ADAPTIVE_ICON_SIZE,
      height: ADAPTIVE_ICON_SIZE,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
  .composite([{
    input: Buffer.from(`
      <svg width="${ADAPTIVE_ICON_SIZE}" height="${ADAPTIVE_ICON_SIZE}" viewBox="0 0 ${ADAPTIVE_ICON_SIZE} ${ADAPTIVE_ICON_SIZE}">
        <circle cx="${ADAPTIVE_ICON_SIZE/2}" cy="${ADAPTIVE_ICON_SIZE/2}" r="${ADAPTIVE_ICON_SIZE/2.5}" fill="#f44336"/>
        <text x="50%" y="50%" font-family="Arial" font-size="${ADAPTIVE_ICON_SIZE/3}" fill="white" text-anchor="middle" dy="${ADAPTIVE_ICON_SIZE/8}">G</text>
      </svg>
    `),
    top: 0,
    left: 0,
  }])
  .png()
  .toFile(path.join(assetsDir, 'adaptive-icon.png'));

  // Splash screen
  await sharp({
    create: {
      width: SPLASH_SIZE,
      height: SPLASH_SIZE,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
  .composite([{
    input: Buffer.from(`
      <svg width="${SPLASH_SIZE}" height="${SPLASH_SIZE}" viewBox="0 0 ${SPLASH_SIZE} ${SPLASH_SIZE}">
        <text x="50%" y="50%" font-family="Arial" font-size="${SPLASH_SIZE/8}" fill="#f44336" text-anchor="middle" dy="${SPLASH_SIZE/16}">GelirGider</text>
      </svg>
    `),
    top: 0,
    left: 0,
  }])
  .png()
  .toFile(path.join(assetsDir, 'splash.png'));

  // Favicon
  await sharp({
    create: {
      width: 196,
      height: 196,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
  .composite([{
    input: Buffer.from(`
      <svg width="196" height="196" viewBox="0 0 196 196">
        <rect width="100%" height="100%" fill="#f44336"/>
        <text x="50%" y="50%" font-family="Arial" font-size="96" fill="white" text-anchor="middle" dy="32">G</text>
      </svg>
    `),
    top: 0,
    left: 0,
  }])
  .png()
  .toFile(path.join(assetsDir, 'favicon.png'));
}

generateIcons().catch(console.error); 