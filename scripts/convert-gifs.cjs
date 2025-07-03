#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '../src/assets');
const OUTPUT_DIR = ASSETS_DIR; // Output to same directory

function checkFFmpeg() {
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

function convertGif(inputPath, outputPath) {
  console.log(`Converting ${path.basename(inputPath)}...`);
  
  const command = [
    'ffmpeg',
    '-i', `"${inputPath}"`,
    '-vf', '"scale=trunc(iw/2)*2:trunc(ih/2)*2"', // Ensure even dimensions
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart', // Optimize for web
    '-crf', '23', // Good quality/size balance
    '-y', // Overwrite output files
    `"${outputPath}"`
  ].join(' ');

  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ Created ${path.basename(outputPath)}`);
    
    // Show file size comparison
    const originalSize = fs.statSync(inputPath).size;
    const newSize = fs.statSync(outputPath).size;
    const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(1);
    
    console.log(`   Original: ${(originalSize / 1024 / 1024).toFixed(1)}MB`);
    console.log(`   New: ${(newSize / 1024 / 1024).toFixed(1)}MB`);
    console.log(`   Reduction: ${reduction}%\n`);
    
    return true;
  } catch (error) {
    console.error(`❌ Failed to convert ${path.basename(inputPath)}`);
    console.error(error.message);
    return false;
  }
}

function main() {
  console.log('🦆 Converting GIFs to MP4...\n');

  // Check if FFmpeg is installed
  if (!checkFFmpeg()) {
    console.error('❌ FFmpeg is not installed or not in PATH');
    console.error('Please install FFmpeg:');
    console.error('  macOS: brew install ffmpeg');
    console.error('  Ubuntu: sudo apt install ffmpeg');
    console.error('  Windows: Download from https://ffmpeg.org/download.html');
    process.exit(1);
  }

  // Find all GIF files in assets directory
  const gifFiles = fs.readdirSync(ASSETS_DIR)
    .filter(file => file.toLowerCase().endsWith('.gif'))
    .map(file => path.join(ASSETS_DIR, file));

  if (gifFiles.length === 0) {
    console.log('No GIF files found in src/assets/');
    return;
  }

  console.log(`Found ${gifFiles.length} GIF file(s):`);
  gifFiles.forEach(file => console.log(`  - ${path.basename(file)}`));
  console.log('');

  let successCount = 0;
  
  for (const gifPath of gifFiles) {
    const filename = path.basename(gifPath, '.gif');
    const mp4Path = path.join(OUTPUT_DIR, `${filename}.mp4`);
    
    if (convertGif(gifPath, mp4Path)) {
      successCount++;
    }
  }

  console.log(`\n🎉 Conversion complete! ${successCount}/${gifFiles.length} files converted.`);
  
  if (successCount > 0) {
    console.log('\n📝 Next steps:');
    console.log('1. Update your imports to use .mp4 instead of .gif');
    console.log('2. Replace <img> tags with <video> tags for autoplay');
    console.log('3. Consider removing the original .gif files to save space');
  }
}

main();