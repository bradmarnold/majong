#!/usr/bin/env node

/**
 * Asset generation script for Mahjong tiles and backgrounds
 */

import { promises as fs } from 'fs';
import path from 'path';
import { generateTile, generateBackground } from '../lib/images.js';

interface TileSpec {
  filename: string;
  prompt: string;
}

interface AssetManifest {
  tiles: Record<string, string>;
  backgrounds: Record<string, string>;
  generated: string;
  version: string;
}

const TILES_DIR = path.join(process.cwd(), '../../apps/web/public/tiles');
const BACKGROUNDS_DIR = path.join(process.cwd(), '../../apps/web/public/backgrounds');

/**
 * Generate all tile specifications
 */
function getTileSpecs(): TileSpec[] {
  const specs: TileSpec[] = [];

  // Characters 1-9
  const characters = ['一萬', '二萬', '三萬', '四萬', '五萬', '六萬', '七萬', '八萬', '九萬'];
  characters.forEach((char, index) => {
    specs.push({
      filename: `char-${index + 1}.png`,
      prompt: `Tile face: Characters. '${char}' in deep blue (#103C57) with red (#B02A2C) accents.`,
    });
  });

  // Bamboos 1-9
  for (let i = 1; i <= 9; i++) {
    specs.push({
      filename: `bamboo-${i}.png`,
      prompt: `Tile face: Bamboos. ${i} bamboo stick${i > 1 ? 's' : ''} arranged vertically, teal color (#0D4B57).`,
    });
  }

  // Dots 1-9
  for (let i = 1; i <= 9; i++) {
    specs.push({
      filename: `dots-${i}.png`,
      prompt: `Tile face: Dots. ${i} circle${i > 1 ? 's' : ''} arranged in standard pattern, navy (#153A50) with red (#B02A2C) pips as needed.`,
    });
  }

  // Winds
  const winds = [
    { name: 'east', char: '東' },
    { name: 'south', char: '南' },
    { name: 'west', char: '西' },
    { name: 'north', char: '北' },
  ];
  winds.forEach(wind => {
    specs.push({
      filename: `wind-${wind.name}.png`,
      prompt: `Tile face: Winds. '${wind.char}' in deep blue (#103C57).`,
    });
  });

  // Dragons
  const dragons = [
    { name: 'red', char: '中', color: '#B02A2C' },
    { name: 'green', char: '發', color: '#1E6E52' },
    { name: 'white', char: '白', color: '#103C57' },
  ];
  dragons.forEach(dragon => {
    if (dragon.name === 'white') {
      specs.push({
        filename: `dragon-${dragon.name}.png`,
        prompt: `Tile face: Dragons. White dragon with embossed blue frame (#103C57), subtle raised border.`,
      });
    } else {
      specs.push({
        filename: `dragon-${dragon.name}.png`,
        prompt: `Tile face: Dragons. ${dragon.char} seal in ${dragon.color}.`,
      });
    }
  });

  // Back
  specs.push({
    filename: 'back.png',
    prompt: 'Tile face: Back. Jade green (#2E6D5A) with circular longevity motif in relief, traditional Chinese pattern.',
  });

  return specs;
}

/**
 * Ensure directory exists
 */
async function ensureDir(dirPath: string) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * Generate all tiles
 */
async function generateTiles(): Promise<Record<string, string>> {
  console.log('Generating tiles...');
  await ensureDir(TILES_DIR);

  const specs = getTileSpecs();
  const manifest: Record<string, string> = {};

  for (const spec of specs) {
    try {
      console.log(`Generating ${spec.filename}...`);
      
      const imageBuffer = await generateTile(spec.filename, spec.prompt);
      const filepath = path.join(TILES_DIR, spec.filename);
      
      await fs.writeFile(filepath, imageBuffer);
      manifest[spec.filename] = `/tiles/${spec.filename}`;
      
      console.log(`✅ Generated ${spec.filename}`);
    } catch (error) {
      console.error(`❌ Failed to generate ${spec.filename}:`, error);
      // Continue with other tiles
    }
  }

  return manifest;
}

/**
 * Generate all backgrounds
 */
async function generateBackgrounds(): Promise<Record<string, string>> {
  console.log('Generating backgrounds...');
  await ensureDir(BACKGROUNDS_DIR);

  const backgrounds = ['felt', 'light-wood', 'dark-wood'];
  const manifest: Record<string, string> = {};

  for (const bg of backgrounds) {
    try {
      console.log(`Generating ${bg} background...`);
      
      const imageBuffer = await generateBackground(bg);
      const filename = `${bg}.jpg`;
      const filepath = path.join(BACKGROUNDS_DIR, filename);
      
      await fs.writeFile(filepath, imageBuffer);
      manifest[bg] = `/backgrounds/${filename}`;
      
      console.log(`✅ Generated ${bg} background`);
    } catch (error) {
      console.error(`❌ Failed to generate ${bg} background:`, error);
      // Continue with other backgrounds
    }
  }

  return manifest;
}

/**
 * Create a preview grid image (placeholder for now)
 */
async function createPreviewGrid(tileManifest: Record<string, string>): Promise<string> {
  // For now, just return a text description
  // In a full implementation, this would create an actual grid image
  const tileCount = Object.keys(tileManifest).length;
  
  const previewText = `# Generated Assets Preview

## Tiles Generated: ${tileCount}

${Object.keys(tileManifest).map(filename => `- ${filename}`).join('\n')}

## Backgrounds Generated: 3

- felt.jpg
- light-wood.jpg  
- dark-wood.jpg

Generated on: ${new Date().toISOString()}
`;

  const previewPath = path.join(process.cwd(), '../../preview.md');
  await fs.writeFile(previewPath, previewText);
  
  return previewPath;
}

/**
 * Generate asset manifest
 */
async function generateManifest(tiles: Record<string, string>, backgrounds: Record<string, string>) {
  const manifest: AssetManifest = {
    tiles,
    backgrounds,
    generated: new Date().toISOString(),
    version: '1.0.0',
  };

  const manifestPath = path.join(TILES_DIR, 'index.json');
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  
  console.log(`✅ Generated manifest at ${manifestPath}`);
}

/**
 * Main generation function
 */
async function main() {
  console.log('🎨 Starting asset generation...\n');

  try {
    // Generate tiles
    const tileManifest = await generateTiles();
    console.log(`\n📁 Generated ${Object.keys(tileManifest).length} tiles\n`);

    // Generate backgrounds
    const backgroundManifest = await generateBackgrounds();
    console.log(`\n🖼️  Generated ${Object.keys(backgroundManifest).length} backgrounds\n`);

    // Create manifest
    await generateManifest(tileManifest, backgroundManifest);

    // Create preview
    const previewPath = await createPreviewGrid(tileManifest);
    console.log(`📋 Created preview at ${previewPath}\n`);

    console.log('✨ Asset generation complete!');
  } catch (error) {
    console.error('💥 Asset generation failed:', error);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}