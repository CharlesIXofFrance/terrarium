import Vibrant from 'node-vibrant';

/**
 * Convert RGB array to hex color string
 */
function rgbToHex([r, g, b]: number[]): string {
  return (
    '#' +
    [r, g, b]
      .map((x) => Math.round(x).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (hex: string): number => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = rgb & 0xff;

    const [rs, gs, bs] = [r, g, b].map((c) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if a color meets WCAG contrast requirements
 */
function meetsWCAGRequirements(color: string): boolean {
  const lightContrast = getContrastRatio(color, '#FFFFFF');
  const darkContrast = getContrastRatio(color, '#000000');
  return Math.max(lightContrast, darkContrast) >= 4.5;
}

/**
 * Load image and create canvas for color analysis
 */
async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Analyze image colors using Vibrant.js
 */
export async function analyzeImageColors(imageUrl: string): Promise<{
  dominantColor: string;
  palette: string[];
  contrast: { light: number; dark: number };
}> {
  try {
    const palette = await Vibrant.from(imageUrl).getPalette();
    const dominantColor =
      palette.Vibrant?.hex || palette.DominantVibrant?.hex || '#000000';

    // Get all colors from the palette
    const allColors = Object.values(palette)
      .filter(Boolean)
      .map((color) => color.hex);

    // Calculate contrast ratios
    const lightContrast = getContrastRatio(dominantColor, '#FFFFFF');
    const darkContrast = getContrastRatio(dominantColor, '#000000');

    return {
      dominantColor,
      palette: Array.from(new Set(allColors)),
      contrast: {
        light: lightContrast,
        dark: darkContrast,
      },
    };
  } catch (error) {
    console.error('Error analyzing image colors:', error);
    throw new Error('Failed to analyze image colors');
  }
}
