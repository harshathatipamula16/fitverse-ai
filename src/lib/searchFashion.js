import axios from 'axios';
import { getSmartFashionQuery, applyStrictCategoryFiltering } from '../services/fashionRecommendationMap.js';

/**
 * AI Smart Search query expansion helper.
 * Translates trend vibes or common shortcuts into high-fidelity search descriptors.
 * 
 * @param {string} prompt - Original search prompt from user
 * @returns {string} Fully expanded query optimized for Pexels fashion photography
 */
export function expandFashionQuery(prompt) {
  return getSmartFashionQuery(prompt);
}

/**
 * Filter out unwanted non-outfit assets.
 * 
 * @param {Array} photos - List of raw photo records
 * @returns {Array} Filtered list of fashion outfit photo records
 */
export function filterFashionPhotos(photos, originalQuery = '') {
  if (!photos || !Array.isArray(photos)) return [];
  
  const baseFiltered = photos.filter(photo => {
    const alt = (photo.alt || '').toLowerCase();
    
    // Rule 3: Reject photos containing magazines, makeup, accessories, objects, beauty products, etc.
    const forbidden = [
      'magazine', 'magazine cover', 'newsstand', 'makeup', 'lipgloss', 'lipstick', 'mascara', 'perfume', 
      'cosmetics', 'cosmetic', 'eyeshadow', 'flatlay', 'flat lay', 'flat-lay', 
      'shampoo', 'cream', 'skincare', 'face wash', 'interior design', 'furniture', 'couch',
      'decor', 'room aesthetic', 'plant', 'sunglasses on table', 'only shoes', 
      'necklace box', 'close up of lips', 'close-up of face', 'closeup of lips', 
      'earring detail', 'beauty product', 'lotion', 'cream jar', 'background only',
      'tabletop', 'flatlay arrangement', 'flat lay outfits', 'beauty products',
      'mascara brush', 'perfume bottle', 'cosmetics palette', 'makeup kit'
    ];
    
    if (forbidden.some(word => alt.includes(word))) {
      return false;
    }
    
    // Check if the photo Alt is purely sunglasses, shoes, bag without human/wearable context
    const containsHumanRelation = 
      alt.includes('wearing') || alt.includes('model') || alt.includes('woman') || 
      alt.includes('man') || alt.includes('person') || alt.includes('girl') || 
      alt.includes('boy') || alt.includes('guy') || alt.includes('lady') || 
      alt.includes('gentleman') || alt.includes('posing') || alt.includes('standing') || 
      alt.includes('sitting') || alt.includes('walking') || alt.includes('people') ||
      alt.includes('runway') || alt.includes('designer') || alt.includes('photographed') ||
      alt.includes('fashion') || alt.includes('outfit');
      
    const isSunglassesOnly = (alt.includes('sunglasses') || alt.includes('glasses') || alt.includes('eyewear')) && !containsHumanRelation;
    const isShoeOnly = (alt.includes('shoe') || alt.includes('sneaker') || alt.includes('boot') || alt.includes('heels') || alt.includes('footwear')) && !containsHumanRelation;
    const isBagOnly = (alt.includes('bag') || alt.includes('handbag') || alt.includes('purse') || alt.includes('clutch')) && !containsHumanRelation;
    const isJewelryOnly = (alt.includes('necklace') || alt.includes('ring') || alt.includes('earring') || alt.includes('bracelet')) && !containsHumanRelation;
    
    if (isSunglassesOnly || isShoeOnly || isBagOnly || isJewelryOnly) {
      return false;
    }
    
    // Rule 4: Only display images where a human model exists, clothing is visible, outfit is complete
    const humanKeywords = [
      'woman', 'man', 'person', 'model', 'girl', 'boy', 'guy', 'lady', 'gentleman', 
      'people', 'posing', 'standing', 'sitting', 'walking', 'wearing', 'suit', 
      'dress', 'outfit', 'clothing', 'streetwear', 'jacket', 'coat', 'pants', 
      'jeans', 'shirt', 'sweater', 'gown', 'trousers', 'blazer', 'cardigan',
      'skirt', 'hoodie', 'apparel', 'runway', 'fashion'
    ];
    
    const hasHumanOrClothing = humanKeywords.some(keyword => alt.includes(keyword));
    if (!hasHumanOrClothing && alt.length > 0) {
      return false; 
    }
    
    return true;
  });

  return applyStrictCategoryFiltering(baseFiltered, originalQuery);
}

/**
 * Returns dynamic fallback queries designed for the chosen style concept.
 * 
 * @param {string} prompt 
 * @returns {string} Highly optimized fallback query term
 */
export function getFallbackQuery(prompt) {
  const lower = (prompt || '').toLowerCase();
  if (lower.includes('wedding')) return 'wedding dress full body fashion model';
  if (lower.includes('korean')) return 'korean streetwear full body outfit model';
  if (lower.includes('streetwear') || lower.includes('y2k')) return 'streetwear outfit full body clothing model';
  if (lower.includes('formal') || lower.includes('office') || lower.includes('money')) return 'formal suit dress runway clothing full body model';
  if (lower.includes('dress') || lower.includes('gown')) return 'female dress outfit full body fashion model';
  if (lower.includes('casual')) return 'stylish casual outfit full body model clothing';
  if (lower.includes('barbie')) return 'barbiecore dress full body fashion outfit model';
  return 'stylish outfit full body clothing fashion model'; 
}

/**
 * Connects dynamically with the Pexels API (via backend proxy or direct client-side credentials)
 * to retrieve a feed of active lifestyle fashion, runway elements, and street styles.
 * 
 * @param {string} searchPrompt - Original user search prompt
 * @param {boolean} isFallbackAttempt - Internal safety lock flag to prevent cascading infinite fallback calls
 * @returns {Promise<Array>} List of formatted fashion outfit photo records
 */
export async function searchFashion(searchPrompt, isFallbackAttempt = false) {
  if (!searchPrompt) return [];

  const expandedQuery = expandFashionQuery(searchPrompt);

  try {
    // 1. Primary path: Use the secure Express backend proxy
    const response = await axios.get('/api/pexels/search', {
      params: { query: expandedQuery }
    });
    
    const photos = response.data || [];
    const filtered = filterFashionPhotos(photos, searchPrompt);
    
    // Rule 11: Add fallback queries if API returns irrelevant or sparse images
    if (filtered.length < 4 && !isFallbackAttempt) {
      const fallbackQuery = getFallbackQuery(searchPrompt);
      return await searchFashion(fallbackQuery, true);
    }
    
    return filtered;
  } catch (err) {
    console.warn('[searchFashion.js] Backend proxy failed, attempting direct client fallback:', err.message);

    // 2. Secondary path: Direct client-side fetch as a robust fallback
    const clientKey = (typeof window !== 'undefined' && window.env?.NEXT_PUBLIC_PEXELS_API_KEY) ||
                      import.meta.env?.VITE_NEXT_PUBLIC_PEXELS_API_KEY ||
                      process.env?.NEXT_PUBLIC_PEXELS_API_KEY;

    if (!clientKey || clientKey === 'MY_API_KEY') {
      throw new Error('Pexels API Credentials are not configured. Configure NEXT_PUBLIC_PEXELS_API_KEY on client or server.');
    }

    try {
      const directResponse = await axios.get('https://api.pexels.com/v1/search', {
        headers: {
          Authorization: clientKey,
        },
        params: {
          query: expandedQuery,
          per_page: 24,
          orientation: 'portrait'
        }
      });

      if (directResponse.data && directResponse.data.photos) {
        const photos = directResponse.data.photos.map(photo => ({
          id: photo.id,
          url: photo.src.large2x,
          original: photo.src.original,
          photographer: photo.photographer,
          photographer_url: photo.photographer_url,
          avg_color: photo.avg_color,
          alt: photo.alt || 'Fashion Outfit'
        }));
        
        const filtered = filterFashionPhotos(photos, searchPrompt);
        
        // Rule 11: Fallback search if direct filtering returns too few outfit images
        if (filtered.length < 4 && !isFallbackAttempt) {
          const fallbackQuery = getFallbackQuery(searchPrompt);
          return await searchFashion(fallbackQuery, true);
        }
        
        return filtered;
      }
      return [];
    } catch (clientErr) {
      console.error('[searchFashion.js] Direct Pexels Client Request failed:', clientErr);
      throw new Error(clientErr.response?.data?.error || clientErr.message || 'Failed to sync images from Pexels API.');
    }
  }
}
