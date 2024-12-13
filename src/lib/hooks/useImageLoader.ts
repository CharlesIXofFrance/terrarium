import { useState, useEffect } from 'react';

interface ImageLoaderOptions {
  width?: number;
  height?: number;
  quality?: number;
}

export function useImageLoader() {
  const [imageCache] = useState(new Map<string, string>());

  const optimizeImageUrl = (url: string, options: ImageLoaderOptions = {}) => {
    if (!url) return '';
    
    // Check cache first
    const cacheKey = `${url}-${JSON.stringify(options)}`;
    if (imageCache.has(cacheKey)) {
      return imageCache.get(cacheKey);
    }

    try {
      const imageUrl = new URL(url);
      
      // Handle Unsplash images
      if (imageUrl.hostname === 'images.unsplash.com') {
        const params = new URLSearchParams(imageUrl.search);
        if (options.width) params.set('w', options.width.toString());
        if (options.height) params.set('h', options.height.toString());
        if (options.quality) params.set('q', options.quality.toString());
        imageUrl.search = params.toString();
        
        const optimizedUrl = imageUrl.toString();
        imageCache.set(cacheKey, optimizedUrl);
        return optimizedUrl;
      }
      
      return url;
    } catch {
      return url;
    }
  };

  return { optimizeImageUrl };
}