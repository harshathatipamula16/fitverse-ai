import axios from 'axios';
import { getFashionQueryByVibe } from '../data/fashionQueryMap.js';
import { recommendationMappings } from '../data/recommendationMappings.js';

/**
 * AI Smart Search query expansion helper.
 * Translates trend vibes or common shortcuts into high-fidelity search descriptors.
 */
export function expandCustomQuery(prompt, gender = 'women') {
  return getFashionQueryByVibe(prompt, gender);
}

/**
 * Filter out unwanted non-outfit assets, mismatched genders, and gym elements.
 */
export function filterFashionPhotos(photos, originalQuery = '') {
  if (!photos || !Array.isArray(photos)) return [];
  
  const qLower = originalQuery.toLowerCase();
  const isGymQuery = qLower.includes('gym') || qLower.includes('fitness') || qLower.includes('workout') || qLower.includes('activewear') || qLower.includes('sports');
  
  // 1. Determine target gender from query
  let targetGender = null;
  if (qLower.includes('women') || qLower.includes('female') || qLower.includes('girl') || qLower.includes('saree') || qLower.includes('lehenga') || qLower.includes('dress') || qLower.includes('gown') || qLower.includes('bride')) {
    targetGender = 'women';
  } else if (qLower.includes('men') || qLower.includes('male') || qLower.includes('boy') || qLower.includes('guy') || qLower.includes('sherwani') || qLower.includes('groom')) {
    targetGender = 'men';
  }

  return photos.filter(photo => {
    const alt = (photo.alt || '').toLowerCase();
    
    // Forbidden objects
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

    // 2. STRICTOR GYM FILTER: Unless they want gym wear, immediately remove ALL fitness indices
    if (!isGymQuery) {
      const gymKeywords = [
        'gym', 'fitness', 'workout', 'exercise', 'sportswear', 'activewear', 'training', 'treadmill', 
        'dumbbell', 'barbell', 'lifting', 'crossfit', 'athletics', 'runwear', 'workout clothes'
      ];
      if (gymKeywords.some(word => alt.includes(word))) {
        return false;
      }
    }

    // 3. STRICTOR GENDER FILTER: Reject cross-gender results completely
    if (targetGender === 'women') {
      const maleOnlyKeywords = ['man posing', 'men modeling', 'portrait of a man', 'businessman', 'sherwani', 'groom', 'guy', 'gentleman'];
      // If it contains male keywords without female keywords, reject
      if (maleOnlyKeywords.some(word => alt.includes(word)) && !alt.includes('woman') && !alt.includes('girl') && !alt.includes('female')) {
        return false;
      }
    } else if (targetGender === 'men') {
      const femaleOnlyKeywords = ['woman posing', 'women modeling', 'portrait of a woman', 'bride', 'lehenga', 'saree', 'girl', 'lady', 'female', 'gown', 'dress'];
      // If it contains female keywords without male keywords, reject
      if (femaleOnlyKeywords.some(word => alt.includes(word)) && !alt.includes('man') && !alt.includes('boy') && !alt.includes('guy') && !alt.includes('male') && !alt.includes('gentleman')) {
        return false;
      }
    }
    
    // Only display images where a human model exists or wearable context is high
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
}

/**
 * Dynamic fallback query builder.
 */
export function getFallbackQuery(prompt, gender = 'women') {
  return getFashionQueryByVibe(prompt, gender);
}

/**
 * Core Pexels Search function calling the secure backend proxy or falls back to client environment.
 */
export async function searchOutfits(query, isFallbackAttempt = false) {
  if (!query) return [];

  try {
    const response = await axios.get('/api/pexels/search', {
      params: { query }
    });
    const photos = response.data || [];
    const filtered = filterFashionPhotos(photos, query);
    
    if (filtered.length < 4 && !isFallbackAttempt) {
      const fallbackQuery = getFallbackQuery(query);
      return await searchOutfits(fallbackQuery, true);
    }
    return filtered;
  } catch (err) {
    console.warn('[pexelsService.js] Backend proxy failed, checking client key fallback:', err.message);
    
    const clientKey = (typeof window !== 'undefined' && window.env?.NEXT_PUBLIC_PEXELS_API_KEY) ||
                      import.meta.env?.VITE_NEXT_PUBLIC_PEXELS_API_KEY ||
                      import.meta.env?.VITE_PEXELS_API_KEY;

    if (!clientKey || clientKey === 'MY_API_KEY') {
      return [];
    }

    try {
      const directResponse = await axios.get('https://api.pexels.com/v1/search', {
        headers: { Authorization: clientKey },
        params: {
          query: query,
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
        
        const filtered = filterFashionPhotos(photos, query);
        if (filtered.length < 4 && !isFallbackAttempt) {
          const fallbackQuery = getFallbackQuery(query);
          return await searchOutfits(fallbackQuery, true);
        }
        return filtered;
      }
      return [];
    } catch (clientErr) {
      console.error('[pexelsService.js] Direct client call failed:', clientErr);
      return [];
    }
  }
}

/**
 * 1. getTrendingOutfits()
 */
export async function getTrendingOutfits() {
  return await searchOutfits('high fashion runway model full body outfit');
}

/**
 * 2. getOccasionOutfits()
 */
export async function getOccasionOutfits(occasion, gender = 'women') {
  const query = getFashionQueryByVibe(occasion, gender);
  return await searchOutfits(query);
}

/**
 * 3. getBodyFitOutfits()
 */
export async function getBodyFitOutfits(bodyType, gender = 'women') {
  const query = getFashionQueryByVibe(bodyType, gender);
  return await searchOutfits(query);
}

// State variables for recommendation query rotation & deduplication
const queryRotationIndices = {};
const shownImageIds = new Set();
let currentRecommendationKey = "";

export function getRotatedQuery(title, gender) {
  const mapping = recommendationMappings[title];
  if (!mapping) return null;
  const genderMap = mapping[gender];
  if (!genderMap || !genderMap.queries || genderMap.queries.length === 0) return null;
  
  const key = `${title}_${gender}`;
  if (queryRotationIndices[key] === undefined) {
    queryRotationIndices[key] = 0;
  } else {
    queryRotationIndices[key] = (queryRotationIndices[key] + 1) % genderMap.queries.length;
  }
  return genderMap.queries[queryRotationIndices[key]];
}

export function deduplicateResults(photos) {
  if (!photos || !Array.isArray(photos)) return [];
  const uniqueInBatch = [];
  const seenIdsInBatch = new Set();
  
  for (const photo of photos) {
    const idStr = photo.id.toString();
    if (!seenIdsInBatch.has(idStr) && !shownImageIds.has(idStr)) {
      uniqueInBatch.push(photo);
      seenIdsInBatch.add(idStr);
    }
  }
  
  // Add unique batch results to the globally shown images
  uniqueInBatch.forEach(photo => shownImageIds.add(photo.id.toString()));
  return uniqueInBatch;
}

export function resetRecommendationCache() {
  shownImageIds.clear();
}

export function filterStrictCategory(photos, title) {
  if (!photos || !Array.isArray(photos)) return [];
  
  const lowerTitle = title.toLowerCase();
  
  return photos.filter(photo => {
    const alt = (photo.alt || '').toLowerCase();
    
    // Wedding Festive Glam
    if (lowerTitle.includes('wedding') || lowerTitle.includes('festive') || lowerTitle.includes('ethnic')) {
      const isTraditionalMatch = alt.includes('lehenga') || alt.includes('saree') || alt.includes('sherwani') || 
                                  alt.includes('ethnic') || alt.includes('wedding') || alt.includes('marriage') ||
                                  alt.includes('traditional') || alt.includes('kurta') || alt.includes('royal indian');
      const isModernGenericOffice = alt.includes('office blazer') || alt.includes('corporate') || alt.includes('sneakers') || alt.includes('business suit');
      return isTraditionalMatch && !isModernGenericOffice;
    }
    
    // Office Corporate Chic
    if (lowerTitle.includes('office') || lowerTitle.includes('corporate') || lowerTitle.includes('interview')) {
      const isCorporateMatch = alt.includes('office') || alt.includes('formal') || alt.includes('blazer') || 
                                alt.includes('suit') || alt.includes('shirt') || alt.includes('business') || 
                                alt.includes('corporate') || alt.includes('trousers') || alt.includes('professional');
      const isWeddingOverdose = alt.includes('lehenga') || alt.includes('saree') || alt.includes('sherwani') || alt.includes('bride') || alt.includes('wedding banner');
      return isCorporateMatch && !isWeddingOverdose;
    }
    
    // College Streetwear
    if (lowerTitle.includes('college') || lowerTitle.includes('streetwear')) {
      const isStreetwearMatch = alt.includes('streetwear') || alt.includes('oversized') || alt.includes('casual') || 
                                 alt.includes('jeans') || alt.includes('tshirt') || alt.includes('hoodie') || 
                                 alt.includes('cargo') || alt.includes('sneakers') || alt.includes('college') || 
                                 alt.includes('campus');
      const isSuperFormal = alt.includes('business suit') || alt.includes('executive coat') || alt.includes('sherwani') || alt.includes('lehenga');
      return isStreetwearMatch && !isSuperFormal;
    }
    
    // Romantic Sparkle Date
    if (lowerTitle.includes('date') || lowerTitle.includes('romantic') || lowerTitle.includes('dinner') || lowerTitle.includes('party') || lowerTitle.includes('clubbing')) {
      const isDateMatch = alt.includes('date') || alt.includes('dinner') || alt.includes('romantic') || 
                            alt.includes('evening') || alt.includes('elegant') || alt.includes('gown') || 
                            alt.includes('cocktail') || alt.includes('party') || alt.includes('luxury') || 
                            alt.includes('dress') || alt.includes('chic') || alt.includes('glitter') || alt.includes('clubbing');
      const isSuperActive = alt.includes('gym') || alt.includes('workout') || alt.includes('treadmill') || alt.includes('running shirt');
      return isDateMatch && !isSuperActive;
    }
    
    return true; // default fallback for other categories
  });
}

/**
 * 4. getRecommendationOutfits()
 */
export async function getRecommendationOutfits(aesthetic, gender = 'women', occasion = '', bodyType = '') {
  const idToTitleMap = {
    'wedding': 'Wedding Festive Glam',
    'office': 'Office Corporate Chic',
    'college': 'College Streetwear',
    'date': 'Romantic Sparkle Date',
    'interview': 'Vogue Editorial Interview',
    'gym': 'Gym Coquette Athletics',
    'vacation': 'Coastal Cannes Vacation',
    'party': 'Barbiecore Night Clubbing'
  };

  const title = idToTitleMap[occasion] || 'Romantic Sparkle Date';
  const newKey = `${title}_${gender}`;
  
  if (currentRecommendationKey !== newKey) {
    currentRecommendationKey = newKey;
    resetRecommendationCache();
  }

  // 1. Get rotated query based on title
  const query = getRotatedQuery(title, gender) || getFashionQueryByVibe(aesthetic || occasion || 'Casual', gender, occasion);
  
  // 2. Search outfits
  let photos = await searchOutfits(query);
  
  // 3. Strict category filtering based on title
  let finalPhotos = filterStrictCategory(photos, title);
  
  // 4. Deduplicate across different category selections to avoid duplicate image reuse
  finalPhotos = deduplicateResults(finalPhotos);
  
  // Fallback: If strict filtering or deduplication was too heavy (results < 2),
  // retrieve a fresh run with an alternative query or relax constraints so the user gets visual feedback
  if (finalPhotos.length < 2) {
    const backupQuery = getFashionQueryByVibe(aesthetic || occasion || 'Casual', gender, occasion);
    const backupPhotos = await searchOutfits(backupQuery);
    const backupFiltered = filterStrictCategory(backupPhotos, title);
    
    const existingIds = new Set(finalPhotos.map(p => p.id.toString()));
    for (const p of backupFiltered) {
      if (!existingIds.has(p.id.toString())) {
        finalPhotos.push(p);
        shownImageIds.add(p.id.toString());
      }
    }
  }
  
  return finalPhotos;
}
