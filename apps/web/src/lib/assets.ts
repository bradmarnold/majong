/**
 * Asset loading utilities for tiles and backgrounds
 */

interface AssetManifest {
  tiles: Record<string, string>;
  backgrounds: Record<string, string>;
  generated: string;
  version: string;
}

class AssetLoader {
  private manifest: AssetManifest | null = null;
  private loadPromise: Promise<AssetManifest> | null = null;

  /**
   * Load the asset manifest
   */
  async loadManifest(): Promise<AssetManifest> {
    if (this.manifest) {
      return this.manifest;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this.fetchManifest();
    this.manifest = await this.loadPromise;
    return this.manifest;
  }

  private async fetchManifest(): Promise<AssetManifest> {
    try {
      const response = await fetch('/majong/tiles/index.json');
      if (!response.ok) {
        throw new Error(`Failed to load asset manifest: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to load asset manifest, using fallback:', error);
      
      // Fallback manifest with placeholder paths
      return {
        tiles: this.getFallbackTileManifest(),
        backgrounds: {
          felt: '/majong/backgrounds/felt.jpg',
          'light-wood': '/majong/backgrounds/light-wood.jpg',
          'dark-wood': '/majong/backgrounds/dark-wood.jpg',
        },
        generated: new Date().toISOString(),
        version: '1.0.0-fallback',
      };
    }
  }

  private getFallbackTileManifest(): Record<string, string> {
    const tiles: Record<string, string> = {};
    
    // Characters 1-9
    for (let i = 1; i <= 9; i++) {
      tiles[`char-${i}.png`] = `/majong/tiles/char-${i}.png`;
    }
    
    // Bamboos 1-9
    for (let i = 1; i <= 9; i++) {
      tiles[`bamboo-${i}.png`] = `/majong/tiles/bamboo-${i}.png`;
    }
    
    // Dots 1-9
    for (let i = 1; i <= 9; i++) {
      tiles[`dots-${i}.png`] = `/majong/tiles/dots-${i}.png`;
    }
    
    // Winds
    ['east', 'south', 'west', 'north'].forEach(wind => {
      tiles[`wind-${wind}.png`] = `/majong/tiles/wind-${wind}.png`;
    });
    
    // Dragons
    ['red', 'green', 'white'].forEach(dragon => {
      tiles[`dragon-${dragon}.png`] = `/majong/tiles/dragon-${dragon}.png`;
    });
    
    // Back
    tiles['back.png'] = '/majong/tiles/back.png';
    
    return tiles;
  }

  /**
   * Get tile image URL
   */
  async getTileImageUrl(suit: string, rank?: number, wind?: string, dragon?: string): Promise<string> {
    const manifest = await this.loadManifest();
    
    let filename: string;
    
    if (suit === 'characters' && rank) {
      filename = `char-${rank}.png`;
    } else if (suit === 'bamboos' && rank) {
      filename = `bamboo-${rank}.png`;
    } else if (suit === 'dots' && rank) {
      filename = `dots-${rank}.png`;
    } else if (suit === 'winds' && wind) {
      filename = `wind-${wind}.png`;
    } else if (suit === 'dragons' && dragon) {
      filename = `dragon-${dragon}.png`;
    } else {
      filename = 'back.png';
    }
    
    return manifest.tiles[filename] || manifest.tiles['back.png'] || '/majong/tiles/back.png';
  }

  /**
   * Get background image URL
   */
  async getBackgroundImageUrl(type: string = 'felt'): Promise<string> {
    const manifest = await this.loadManifest();
    return manifest.backgrounds[type] || manifest.backgrounds.felt || '/majong/backgrounds/felt.jpg';
  }

  /**
   * Preload all tile images
   */
  async preloadTiles(): Promise<void> {
    const manifest = await this.loadManifest();
    const imagePromises = Object.values(manifest.tiles).map(url => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => {
          console.warn(`Failed to preload tile: ${url}`);
          resolve(); // Don't fail the whole preload on individual image errors
        };
        img.src = url;
      });
    });

    await Promise.all(imagePromises);
    console.log('All tiles preloaded');
  }
}

// Singleton instance
export const assetLoader = new AssetLoader();