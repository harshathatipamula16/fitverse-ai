export interface GenderQueryMap {
  men: string[];
  women: string[];
}

export interface FashionQueryMap {
  [key: string]: GenderQueryMap;
}

export const fashionQueryMap: FashionQueryMap = {
  "Office Corporate Chic": {
    men: [
      "indian formal office wear men",
      "smart casual indian male fashion",
      "business indo western men"
    ],
    women: [
      "elegant office wear women india",
      "formal indo western women",
      "corporate chic women fashion"
    ]
  },
  "College Streetwear": {
    men: [
      "indian streetwear men",
      "oversized tshirt indian boys",
      "genz casual men india"
    ],
    women: [
      "korean streetwear women india",
      "casual college outfits girls",
      "oversized aesthetic fashion women"
    ]
  },
  "Romantic Sparkle Date": {
    men: [
      "luxury dinner outfit men",
      "romantic black shirt men",
      "classy casual mens fashion"
    ],
    women: [
      "elegant date night dress women",
      "romantic pink aesthetic outfit",
      "luxury dinner fashion women"
    ]
  },
  "Royal Wedding": {
    men: [
      "indian sherwani groom",
      "royal wedding kurta men",
      "luxury ethnic menswear"
    ],
    women: [
      "bridal lehenga india",
      "luxury saree women",
      "indian wedding fashion women"
    ]
  },
  "Navratri Fusion": {
    men: [
      "navratri kurta men",
      "mirror work ethnic menswear"
    ],
    women: [
      "navratri lehenga choli",
      "mirror work indo western women"
    ]
  },
  "Wedding / Gala Festive": {
    men: [
      "indian sherwani groom",
      "royal wedding kurta men",
      "luxury ethnic menswear"
    ],
    women: [
      "bridal lehenga india",
      "luxury saree women",
      "indian wedding fashion women"
    ]
  },
  "Wedding Festive Glam": {
    men: [
      "indian sherwani groom",
      "royal wedding kurta men",
      "luxury ethnic menswear"
    ],
    women: [
      "bridal lehenga india",
      "luxury saree women",
      "indian wedding fashion women"
    ]
  },
  "Vogue Editorial Interview": {
    men: [
      "gq fashion runway men",
      "avant garde menswear luxury",
      "high fashion tailored male suit"
    ],
    women: [
      "vogue editorial photoshoot women",
      "high fashion runway dress model",
      "avant garde female couture styling"
    ]
  },
  "Gym Coquette Athletics": {
    men: [
      "mens athletic activewear styling",
      "tracksuit running sports hoodie men",
      "premium training aesthetic wear male"
    ],
    women: [
      "coquette aesthetic gymwear women",
      "pastel gym sets fitness wear women",
      "athleisure aesthetics female matching"
    ]
  },
  "Coastal Cannes Vacation": {
    men: [
      "cannes linen summer style men",
      "coastal resort wear mens fashion",
      "yacht lifestyle outfit male"
    ],
    women: [
      "coastal vacation linen dress women",
      "resort wear luxury beachwear female",
      "cannes style summer couture women"
    ]
  },
  "Barbiecore Night Clubbing": {
    men: [
      "neon pink party outfit men",
      "bold disco clubbing mens styling",
      "futuristic silver partywear male"
    ],
    women: [
      "barbiecore pink party dress women",
      "sequin sparkle night clubbing girls",
      "pink aesthetic partywear women runway"
    ]
  },
  // Sub-categories / Fallbacks for Category filters
  "Wedding": {
    men: ["indian sherwani groom", "royal wedding kurta men", "luxury ethnic menswear"],
    women: ["bridal lehenga india", "luxury saree women", "indian wedding fashion women"]
  },
  "Office": {
    men: ["indian formal office wear men", "smart casual indian male fashion", "business indo western men"],
    women: ["elegant office wear women india", "formal indo western women", "corporate chic women fashion"]
  },
  "College": {
    men: ["indian streetwear men", "oversized tshirt indian boys", "genz casual men india"],
    women: ["korean streetwear women india", "casual college outfits girls", "oversized aesthetic fashion women"]
  },
  "Casual": {
    men: ["classy casual mens fashion", "relaxed cotton aesthetic men outfit", "linen shirt casual men"],
    women: ["chic casual summer wear women", "minimalist comfortable outfit women", "linen trousers style women"]
  },
  "Luxury": {
    men: ["old money beige suit luxury men", "premium tailormade blazer men", "savile row tuxedo styling"],
    women: ["luxury high end designer gown women", "quiet luxury silk trenchcoat women", "editorial haute couture woman"]
  },
  "Traditional": {
    men: ["traditional kurta pajama men", "ethnic nehru jacket kurta set boys", "luxe royal sherwani men"],
    women: ["luxurious handloom traditional saree", "banarasi silk lehenga gold zari", "chikankari elegant traditional women"]
  },
  "Streetwear": {
    men: ["indian streetwear men", "oversized streetwear fit male", "cyberpunk techwear pants men"],
    women: ["korean streetwear women india", "oversized aesthetic fashion women", "cargo techwear female streetwear"]
  },
  "Korean Fusion": {
    men: ["korean oversized trench blazer mens", "korean aesthetic minimal outfit male", "seoul streetwear loose fit men"],
    women: ["korean aesthetic outfit women", "minimalist beige trench coat styling women", "chic kfashion elegant female clothing"]
  },
  "Indo-Western": {
    men: ["asymmetric indo western jacket men", "modern achkan wedding sherwani", "fusion nehru jacket styling mens"],
    women: ["indo western draped dress outfit women", "mirror work fusion lehenga girls", "modern ethnic cape top with trousers women"]
  }
};

/**
 * Returns a list of randomized queries based on title, gender and fallbacks
 */
export function getFashionQueryByVibe(title: string, gender: 'men' | 'women', category?: string): string {
  const normalizedGender = gender === 'men' ? 'men' : 'women';
  
  // Try mapping by exact title first
  let mapEntry = fashionQueryMap[title];
  
  // If not found, try mapping by category
  if (!mapEntry && category) {
    mapEntry = fashionQueryMap[category];
  }
  
  // If still not found, try matching by sub-words
  if (!mapEntry) {
    const titleLower = title.toLowerCase();
    const foundKey = Object.keys(fashionQueryMap).find(key => titleLower.includes(key.toLowerCase()));
    if (foundKey) {
      mapEntry = fashionQueryMap[foundKey];
    }
  }

  // Fallbacks
  if (!mapEntry) {
    if (normalizedGender === 'men') {
      return "stylish formal suit men full body photography model";
    } else {
      return "stylish elegant dress women full body fashion model";
    }
  }

  const queries = mapEntry[normalizedGender];
  // Select a random query from the array for variety
  const randomIndex = Math.floor(Math.random() * queries.length);
  return queries[randomIndex] || queries[0];
}
