import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateAllFavicons() {
  const inputPath = path.join(__dirname, '../public/favicon.png');
  const publicDir = path.join(__dirname, '../public');

  try {
    console.log('🎨 Generating all favicon sizes...\n');

    // Generate multiple PNG sizes
    const sizes = [16, 32, 48, 64, 96, 128, 192, 256, 512];
    
    for (const size of sizes) {
      const outputPath = path.join(publicDir, `favicon-${size}x${size}.png`);
      await sharp(inputPath)
        .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .png()
        .toFile(outputPath);
      console.log(`✅ Generated favicon-${size}x${size}.png`);
    }

    // Generate ICO (32x32)
    const icoPath = path.join(publicDir, 'favicon.ico');
    await sharp(inputPath)
      .resize(32, 32)
      .toFile(icoPath);
    console.log('✅ Generated favicon.ico');

    // Generate apple-touch-icon
    const applePath = path.join(publicDir, 'apple-touch-icon.png');
    await sharp(inputPath)
      .resize(180, 180)
      .png()
      .toFile(applePath);
    console.log('✅ Generated apple-touch-icon.png');

    console.log('\n🎉 All favicons generated successfully!');
  } catch (error) {
    console.error('❌ Error generating favicons:', error);
  }
}

generateAllFavicons();
