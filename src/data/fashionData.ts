// High-quality structured fashion look datasets for FitVerse AI
export interface StaticFashionOutfit {
  id: string;
  title: string;
  category: string;
  image: string;
  style: string;
  description: string;
}

export const EXCLUSIVE_FASHION_PRESETS: StaticFashionOutfit[] = [
  {
    id: "preset-1",
    title: "Silk Auburn Trenchcoat",
    category: "Outerwear",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop&q=80",
    style: "Old Money / Quiet Luxury",
    description: "Premium flowing mulberry silk trench with bespoke structured drapes and gold alloy button fastings."
  },
  {
    id: "preset-2",
    title: "Cobalt Utility Zip Vest Set",
    category: "Streetwear",
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&auto=format&fit=crop&q=80",
    style: "Cyberpunk Techwear",
    description: "Multi-pocket tactical combat gilet layered over heavy-wash cotton hoodies for progressive urban aesthetics."
  },
  {
    id: "preset-3",
    title: "Holographic Pleated Glitch Skirt Set",
    category: "Partywear",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80",
    style: "Harajuku Aesthetic",
    description: "Iridescent metallic pastel coordinates featuring high stretch compression knit overlays and chunky soles."
  },
  {
    id: "preset-4",
    title: "Emerald Georgette Sequin Saree",
    category: "Traditional",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80",
    style: "Indian Couture Elegant",
    description: "Elysian satin-lined emerald georgette drape styled with hand-stitched gold spectrum sequins."
  },
  {
    id: "preset-5",
    title: "Ivory Coronation Wedding Sherwani",
    category: "Traditional",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80",
    style: "Royal Heritage Wedding",
    description: "Brocade front-slit sherwani detailing coronation buttons, matching silk trousers, and ornate gold weaves."
  },
  {
    id: "preset-6",
    title: "Double-Breasted Cashmere Tux Set",
    category: "Formal",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80",
    style: "High-Society Evening Wear",
    description: "Savile Row-inspired double breasted classic blazer in midnight tones with satin velvet details."
  }
];

export const AI_TRENDS_REPORTS = {
  seasonTitle: "Neo-Eco Equinox 2026",
  globalCoreTrend: "Techno-Organic minimalism combined with heavy cargo structures.",
  bulletins: [
    {
      headline: "High-Luminescence Linings",
      details: "Bespoke reflective trim integrated dynamically into formal inner linings captures visual elegance at night events."
    },
    {
      headline: "Sartorial Activewear Layers",
      details: "Wicking compression elements combined with oversized silk wraps frames height proportions cleanly."
    },
    {
      headline: "Cactus-Composite Tech Weaves",
      details: "Lightweight and hypoallergenic bio-materials replacing standard heavy animal hides for ultra-breathable drapes."
    }
  ]
};

export const MULTICULTURAL_SUGGESTIONS = [
  "bridal lehenga",
  "korean oversized hoodie",
  "old money beige fit",
  "indian wedding sherwani",
  "kdrama airport fashion",
  "elegant indian saree",
  "coquette dress",
  "korean aesthetic minimalist outerwear"
];

export interface IndianFashionAIItem {
  id: string;
  title: string;
  category: string;
  image: string;
  styleTag: string;
  description: string;
  keywords: string[];
}

export const INDIAN_AI_FASHION_SUGGESTIONS: IndianFashionAIItem[] = [
  {
    id: "ind-ai-1",
    title: "Elegant Crimson Banarasi Saree",
    category: "Traditional",
    image: "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?w=800&auto=format&fit=crop&q=80",
    styleTag: "Gilded Regal",
    description: "Hand-loomed Benarasi silk saree in deep crimson with ornate gold zari weaves and floral details.",
    keywords: ["saree", "traditional", "wedding", "banarasi", "bridal lehenga", "golden", "crimson", "red Saree"]
  },
  {
    id: "ind-ai-2",
    title: "Royal Ivory Zardozi Sherwani",
    category: "Wedding",
    image: "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?w=800&auto=format&fit=crop&q=80",
    styleTag: "Heritage Luxury",
    description: "Off-white raw silk sherwani decorated with micro-embroidered silver-gilt Zardozi threads and custom buttons.",
    keywords: ["sherwani", "wedding", "boy", "royal", "kurta pajama", "traditional", "reception", "heritage", "ivory"]
  },
  {
    id: "ind-ai-3",
    title: "Emerald Georgette Sequin Lehenga",
    category: "Festive",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80",
    styleTag: "Indo-Western",
    description: "Flowing georgette lehenga set in deep emerald green, layered with custom iridescent sequence embroidery.",
    keywords: ["lehenga", "festive", "sequin", "green", "emerald", "girls", "indo-western", "haldi ceremony outfit", "partywear"]
  },
  {
    id: "ind-ai-4",
    title: "Pastel Chikankari Kurti Set",
    category: "Traditional",
    image: "https://images.unsplash.com/photo-1608748010899-18f300247112?w=800&auto=format&fit=crop&q=80",
    styleTag: "Vintage Lucknowi",
    description: "Breathable cotton-georgette kurti in soft baby blue featuring shadow-work Lucknowi Chikankari florals.",
    keywords: ["kurti", "salwar suit", "traditional", "lucknowi", "chikankari", "pastel", "blue", "college", "casual", "indo-western"]
  },
  {
    id: "ind-ai-5",
    title: "Indo-Western Pearl Asymmetric Jacket",
    category: "Indo-Western",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80",
    styleTag: "Modernist Achkan",
    description: "Structured steel-grey crop blazer with asymmetry, double breasting, and pearl embellishments on the lapel.",
    keywords: ["indo-western", "nehru jacket", "jacket", "fusion", "asymmetric", "modern", "formal", "royal sherwani style", "korean + indian fusion"]
  },
  {
    id: "ind-ai-6",
    title: "Heavy Banarasi Brocade Lehenga",
    category: "Luxury",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80",
    styleTag: "Bridal Wear",
    description: "Exquisite hand-woven gold brocade lehenga skirt paired with a scalloped dupatta and silk sweetheart choli.",
    keywords: ["lehenga", "luxury", "wedding", "bridal wear", "gold", "brocade", "traditional", "royal", "festive"]
  },
  {
    id: "ind-ai-7",
    title: "Sagar Green Lucknowi Sherwani Set",
    category: "Wedding",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80",
    styleTag: "Royal Classic",
    description: "Elegantly tailored sage-green silk sherwani with matching ivory cowl churidar pants.",
    keywords: ["sherwani", "wedding", "boy", "green", "kurta", "traditional", "festive", "churidar", "royal sherwani style"]
  },
  {
    id: "ind-ai-8",
    title: "Traditional Multicolored Dandiya Choli",
    category: "Festive",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80",
    styleTag: "Garba Queen",
    description: "High stretch traditional circular ghagra featuring hand-embroidered mirrors, shells, and bandhni patterns.",
    keywords: ["navratri outfits", "festive", "gujarati", "garba", "traditional gujarati look", "choli", "multicolor", "mirror work", "navratri outfit ideas"]
  },
  {
    id: "ind-ai-9",
    title: "Indian Summer Streetwear Baggy Set",
    category: "Streetwear",
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&auto=format&fit=crop&q=80",
    styleTag: "Cyber Streetwear",
    description: "Heavy weight drop-shoulder tech tee paired with multi-cargo utility pants and customized silver chains.",
    keywords: ["streetwear", "streetwear for indian summer", "oversized indian streetwear", "casual", "college", "baggy", "indian college fit", "grey"]
  },
  {
    id: "ind-ai-10",
    title: "Classic Ivory Kurta with Nehru Jacket",
    category: "Traditional",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop&q=80",
    styleTag: "Festive Dapper",
    description: "Breathable handspun khadi kurta layered with a custom structured woven silk Nehru jacket in dusty rose.",
    keywords: ["nehru jacket", "kurta", "kurta pajama", "traditional", "wedding", "festive ethnic fits", "haldi ceremony outfit", "rose", "cotton"]
  },
  {
    id: "ind-ai-11",
    title: "Minimalist Indigo Linen Fusion Set",
    category: "Minimal",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80",
    styleTag: "Modernist Minimal",
    description: "A tailored dark-indigo linen asymmetric tunic set with slim-fit dynamic trousers for an elite professional statement.",
    keywords: ["minimal", "indigo", "linen", "casual", "indo-western", "korean + indian fusion", "kurti", "clean"]
  },
  {
    id: "ind-ai-12",
    title: "Haldi Peach Peplum Gharara Set",
    category: "Festive",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80",
    styleTag: "Wedding Guest",
    description: "Vibrant peplum-cut georgette style kurti featuring gold gottapatti borders paired with a multi-tiered flared gharara.",
    keywords: ["haldi ceremony outfit", "kurti", "salwar suit", "lehenga", "orange", "festive", "peach", "traditional", "wedding"]
  }
];

