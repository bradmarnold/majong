/**
 * Image generation provider abstraction
 */

interface ImageProvider {
  generateImage(prompt: string, options?: ImageOptions): Promise<Buffer>;
}

interface ImageOptions {
  width?: number;
  height?: number;
  quality?: 'standard' | 'hd';
  style?: string;
}

class OpenAIImageProvider implements ImageProvider {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateImage(prompt: string, options: ImageOptions = {}): Promise<Buffer> {
    const { width = 512, height = 768, quality = 'standard' } = options;
    
    try {
      const response = await fetch(`${this.baseUrl}/images/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt,
          size: this.getClosestSize(width, height),
          quality,
          response_format: 'url',
          n: 1,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI Images API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      const imageUrl = data.data[0]?.url;
      
      if (!imageUrl) {
        throw new Error('No image URL returned from OpenAI');
      }

      // Download the image
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error('Failed to download generated image');
      }

      const buffer = await imageResponse.arrayBuffer();
      return Buffer.from(buffer);
    } catch (error) {
      console.error('OpenAI image generation error:', error);
      throw error;
    }
  }

  private getClosestSize(width: number, height: number): string {
    // DALL-E 3 supported sizes
    const sizes = ['1024x1024', '1024x1792', '1792x1024'];
    
    const aspect = width / height;
    
    if (aspect < 0.8) {
      return '1024x1792'; // Portrait
    } else if (aspect > 1.2) {
      return '1792x1024'; // Landscape
    } else {
      return '1024x1024'; // Square
    }
  }
}

/**
 * Get an image provider based on available environment variables
 */
export function getImageProvider(): ImageProvider | null {
  const openaiKey = process.env.OPENAI_API_KEY;

  if (openaiKey) {
    return new OpenAIImageProvider(openaiKey);
  }

  return null;
}

/**
 * Generate a Mahjong tile image
 */
export async function generateTile(face: string, promptExtra: string): Promise<Buffer> {
  const provider = getImageProvider();
  
  if (!provider) {
    throw new Error('No image provider available. Set OPENAI_API_KEY environment variable.');
  }

  const basePrompt = `Clean Mahjong tile, orthographic front view, centered, no drop shadow, transparent background. Ivory ceramic body (#F4F0E6) with subtle satin sheen and a mild inner inset. High contrast, crisp brush-stroke glyphs. Uniform lighting. 2:3 aspect. Output PNG with alpha. Canvas 512x768. Keep margins equal on all sides. No text other than tile mark.`;
  
  const fullPrompt = `${basePrompt} ${promptExtra}`;
  
  return provider.generateImage(fullPrompt, {
    width: 512,
    height: 768,
    quality: 'hd',
  });
}

/**
 * Generate a background image
 */
export async function generateBackground(type: string): Promise<Buffer> {
  const provider = getImageProvider();
  
  if (!provider) {
    throw new Error('No image provider available. Set OPENAI_API_KEY environment variable.');
  }

  const prompts = {
    felt: 'Professional green felt Mahjong table surface, rich emerald green color, subtle texture, even lighting. 1920x1080 resolution.',
    'light-wood': 'Professional light wood Mahjong table surface, natural oak grain, warm honey color, smooth finish. 1920x1080 resolution.',
    'dark-wood': 'Professional dark wood Mahjong table surface, rich mahogany grain, deep brown color, polished finish. 1920x1080 resolution.',
  };

  const prompt = prompts[type as keyof typeof prompts] || prompts.felt;
  
  return provider.generateImage(prompt, {
    width: 1920,
    height: 1080,
    quality: 'hd',
  });
}