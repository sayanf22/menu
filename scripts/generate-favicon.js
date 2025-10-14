import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateFavicon() {
  const inputPath = path.join(__dirname, '../public/favicon.png');
  const outputPath = path.join(__dirname, '../public/favicon.ico');

  try {
    // Generate ICO file with multiple sizes
    await sharp(inputPath)
      .resize(32, 32)
      .toFile(outputPath);
    
    console.log('✅ favicon.ico generated successfully!');
  } catch (error) {
    console.error('❌ Error generating favicon:', error);
  }
}

generateFavicon();
