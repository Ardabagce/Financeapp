const fs = require('fs');
const { createCanvas } = require('canvas');

// Klasör yoksa oluştur
if (!fs.existsSync('./assets')) {
    fs.mkdirSync('./assets');
}
if (!fs.existsSync('./assets/images')) {
    fs.mkdirSync('./assets/images');
}

// Icon için canvas oluştur
const canvas = createCanvas(1024, 1024);
const ctx = canvas.getContext('2d');

// Arka planı beyaz yap
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, 1024, 1024);

// Basit bir ikon çiz - ₺ sembolü
ctx.fillStyle = '#4CAF50';
ctx.beginPath();
ctx.arc(512, 512, 400, 0, Math.PI * 2);
ctx.fill();

// ₺ sembolü ekle
ctx.fillStyle = '#ffffff';
ctx.font = 'bold 500px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('₺', 512, 512);

// İkonları kaydet
try {
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('./assets/images/icon.png', buffer);
    fs.writeFileSync('./assets/images/adaptive-icon.png', buffer);
    fs.writeFileSync('./assets/images/splash.png', buffer);
    fs.writeFileSync('./assets/images/splash-icon.png', buffer);
    fs.writeFileSync('./assets/images/favicon.png', buffer);
    console.log('İkonlar başarıyla oluşturuldu!');
} catch (error) {
    console.error('İkon oluşturma hatası:', error);
} 