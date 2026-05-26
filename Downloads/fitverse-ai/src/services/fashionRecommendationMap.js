/**
 * FitVerse AI Fashion Recommendation Map and Strict Category Filters
 * 
 * Maps general fashion concepts, vibes, or search tags to highly specific
 * search queries, and provides strict filtering configurations to guarantee accuracy.
 */

export const fashionRecommendationMap = {
  categories: {
    wedding: {
      tags: ['lehenga', 'saree', 'gown', 'sherwani', 'tuxedo', 'bridalwear', 'suit', 'marriage dress', 'anarkali', 'bridal lehenga'],
      allowedKeywords: [
        'lehenga', 'saree', 'gown', 'sherwani', 'tuxedo', 'wedding', 'bride', 'groom', 'marriage', 'bridal', 
        'ethnic', 'anarkali', 'lengha', 'sari', 'groomswear', 'traditional', 'salwar kameez', 'tux'
      ],
      disallowedKeywords: [
        'gym', 'workout', 'sports', 'activewear', 'casual hoodie', 'jogger', 'sweatpant', 'sneaker', 
        'shorts', 'swimsuit', 'swimwear', 'crop top', 't-shirt', 'bikini', 'yoga', 'running', 'fitness'
      ],
      defaultQuery: 'luxury bridal gown full body woman fashion model'
    },
    gym: {
      tags: ['activewear', 'sports outfits', 'fitness apparel', 'gymwear', 'tracksuit'],
      allowedKeywords: [
        'gym', 'workout', 'sports', 'activewear', 'fitness', 'athletic', 'yoga', 'leggings', 'sports bra',
        'tracksuit', 'jogger', 'hoodie', 'sneakers', 'running', 'tank top', 'workout apparel', 'shorts'
      ],
      disallowedKeywords: [
        'saree', 'sari', 'lehenga', 'gown', 'sherwani', 'kurta', 'anarkali', 'tuxedo', 'office wear', 
        'formal suit', 'wedding dress', 'bridal', 'heels', 'cocktail dress', 'evening gown'
      ],
      defaultQuery: 'fitness gym activewear outfit model'
    },
    streetwear: {
      tags: ['oversized hoodie', 'cargo pants', 'sneakers', 'streetstyle'],
      allowedKeywords: [
        'streetwear', 'street style', 'oversized', 'cargo', 'sneakers', 'hoodie', 'jacket', 'bomber',
        'vintage', 'retro', 'jeans', 'trousers', 'graphic tee', 'denem', 'puffer', 'varsity'
      ],
      disallowedKeywords: [
        'saree', 'lehenga', 'sherwani', 'bridal', 'wedding dress', 'tuxedo', 'swimwear', 'lingerie'
      ],
      defaultQuery: 'korean oversized streetwear full body outfit'
    },
    korean: {
      tags: ['kfashion', 'korean oversized fit', 'kdrama style', 'minimalist aesthetic'],
      allowedKeywords: [
        'korean', 'kfashion', 'oversized', 'kdrama', 'seoul', 'minimalist', 'blazer', 'trench coat',
        'pastel', 'k-pop', 'kpop', 'airport fashion', 'clean style', 'aesthetic'
      ],
      disallowedKeywords: [
        'saree', 'lehenga', 'sherwani', 'kurta', 'traditional wedding', 'swimwear', 'lingerie'
      ],
      defaultQuery: 'korean minimalist elegant outfit model'
    },
    party: {
      tags: ['cocktail dress', 'partywear', 'glam fashion'],
      allowedKeywords: [
        'party', 'cocktail dress', 'glam', 'sequin', 'disco', 'shimmer', 'night club', 'night out',
        'evening gown', 'slits', 'satin dress', 'celebration', 'fashion runway'
      ],
      disallowedKeywords: [
        'gym', 'workout', 'sports bra', 'leggings', 'tracksuit', 'activewear', 'joggers', 'sweatpants'
      ],
      defaultQuery: 'partywear fashion model full body luxury dress'
    }
  }
};

/**
 * Classifies a raw query into one of our predefined fashion categories.
 * 
 * @param {string} query - The search query term
 * @returns {string} One of 'wedding', 'gym', 'streetwear', 'korean', 'party', or 'casual'/null
 */
export function classifyQueryCategory(query) {
  if (!query) return null;
  const lower = query.toLowerCase();

  if (
    lower.includes('wedding') || lower.includes('bride') || lower.includes('groom') || 
    lower.includes('lehenga') || lower.includes('saree') || lower.includes('sherwani') || 
    lower.includes('bridal') || lower.includes('tuxedo') || lower.includes('marriage') ||
    lower.includes('anarkali') || lower.includes('ethnic') || lower.includes('kurta')
  ) {
    return 'wedding';
  }

  if (
    lower.includes('gym') || lower.includes('workout') || lower.includes('activewear') || 
    lower.includes('sports') || lower.includes('fitness') || lower.includes('yoga') ||
    lower.includes('run') || lower.includes('athletic')
  ) {
    return 'gym';
  }

  if (
    lower.includes('korean') || lower.includes('k-streetwear') || lower.includes('kdrama') || 
    lower.includes('kpop') || lower.includes('k-pop') || lower.includes('seoul')
  ) {
    return 'korean';
  }

  if (
    lower.includes('streetwear') || lower.includes('cargo') || lower.includes('hoodie') ||
    lower.includes('oversized') || lower.includes('y2k')
  ) {
    return 'streetwear';
  }

  if (
    lower.includes('party') || lower.includes('night club') || lower.includes('partywear') ||
    lower.includes('cocktail') || lower.includes('glam') || lower.includes('clubbing')
  ) {
    return 'party';
  }

  return null;
}

/**
 * Map search inputs to strict, highly accurate fashion descriptors
 */
export function getSmartFashionQuery(query) {
  const categoryId = classifyQueryCategory(query);
  const lower = (query || '').toLowerCase().trim();

  // If we mapped to a specific category, let's check for specific subterms
  if (categoryId === 'wedding') {
    if (lower.includes('indian wedding') || lower.includes('saree') || lower.includes('lehenga')) {
      return 'indian bridal lehenga saree full body woman style';
    }
    if (lower.includes('groom') || lower.includes('sherwani')) {
      return 'indian groom sherwani wedding outfit';
    }
    if (lower.includes('tuxedo') || lower.includes('tux')) {
      return 'groom formal black tuxedo wedding suit full body';
    }
    return fashionRecommendationMap.categories.wedding.defaultQuery;
  }

  if (categoryId === 'gym') {
    return fashionRecommendationMap.categories.gym.defaultQuery;
  }

  if (categoryId === 'korean') {
    if (lower.includes('streetwear') || lower.includes('hoodie')) {
      return fashionRecommendationMap.categories.streetwear.defaultQuery;
    }
    if (lower.includes('minimal')) {
      return fashionRecommendationMap.categories.korean.defaultQuery;
    }
    return 'korean fashion aesthetic full body outfit';
  }

  if (categoryId === 'streetwear') {
    if (lower.includes('old money') || lower.includes('quiet luxury')) {
      return 'luxury old money beige formal outfit';
    }
    return fashionRecommendationMap.categories.streetwear.defaultQuery;
  }

  if (categoryId === 'party') {
    return fashionRecommendationMap.categories.party.defaultQuery;
  }

  // Fallback for general queries
  let enhanced = lower;
  if (!enhanced.includes('outfit') && !enhanced.includes('model') && !enhanced.includes('apparel')) {
    enhanced += ' full body fashion outfit model';
  }
  return enhanced;
}

/**
 * Enforces strict category filters on a list of photos to ensure perfect accuracy.
 *
 * @param {Array} photos - List of raw photo objects
 * @param {string} initialQuery - Original query used
 * @returns {Array} Filtered list of relevant photo objects
 */
export function applyStrictCategoryFiltering(photos, initialQuery) {
  if (!photos || !Array.isArray(photos)) return [];
  const categoryId = classifyQueryCategory(initialQuery);

  if (!categoryId) return photos; // No specific category restrictions

  const config = fashionRecommendationMap.categories[categoryId];

  return photos.filter(photo => {
    const alt = (photo.alt || '').toLowerCase();

    // 1. Any disallowed keyword is an immediate rejection
    if (config.disallowedKeywords.some(word => alt.includes(word))) {
      return false;
    }

    // 2. Gym photos for wedding search must be rejected: if category is wedding, the alt MUST NOT have gym terms, which is already handled above.
    // Let's do a cross-check for high confidence:
    if (categoryId === 'wedding') {
      const containsWeddingIndicators = config.allowedKeywords.some(kw => alt.includes(kw));
      // If it has NO wedding terms but has casual terms, exclude it
      const casualTerms = ['gym', 'yoga', 'sport', 'sweatshirt', 'active', 'tshirt', 't-shirt', 'casual', 'denim', 'jeans'];
      if (!containsWeddingIndicators && casualTerms.some(term => alt.includes(term))) {
        return false;
      }
    }

    if (categoryId === 'gym') {
      const containsGymIndicators = config.allowedKeywords.some(kw => alt.includes(kw));
      const weddingTerms = ['lehenga', 'saree', 'wedding', 'gown', 'tuxedo', 'sherwani', 'formal', 'suit'];
      if (!containsGymIndicators && weddingTerms.some(word => alt.includes(word))) {
        return false;
      }
    }

    return true;
  });
}
