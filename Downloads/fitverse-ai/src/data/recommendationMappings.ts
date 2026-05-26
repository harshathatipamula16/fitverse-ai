export interface StyleItem {
  title: string;
  desc: string;
  items: string[];
}

export interface ColorItem {
  name: string;
  hex: string;
  desc: string;
}

export interface GenderMapping {
  queries: string[];
  colors: ColorItem[];
  category: string;
  avoidColors: string[];
  suggestedStyles: StyleItem[];
  trends: string[];
}

export interface TitleMapping {
  women: GenderMapping;
  men: GenderMapping;
}

export const recommendationMappings: Record<string, TitleMapping> = {
  "Wedding Festive Glam": {
    women: {
      queries: [
        "indian bridal lehenga",
        "luxury wedding saree",
        "heavy festive indian fashion",
        "royal ethnic womenswear"
      ],
      colors: [
        { name: "Maroon Crimson Weave", hex: "#b91c1c", desc: "A heavy velvet bridal standard designed for evening strobe balance." },
        { name: "Elysian Gold Brocade", hex: "#d97706", desc: "Reflects festival royalty and pairs cleanly with traditional gold jewelry." },
        { name: "Peacock Emerald", hex: "#059669", desc: "An auspicious color evoking deep heritage look and elegant luxury." }
      ],
      category: "Wedding Ethnic",
      avoidColors: ["Charcoal Black", "Asphalt Grey", "Dull Army Mud"],
      trends: ["Royal Brocade Lehenga Choli", "Indian Heritage Pastel Fusion"],
      suggestedStyles: [
        {
          title: "Royal Wedding Silk Lehenga Choli",
          desc: "Classic heavy silk lehenga styled with a matching velvet body and contrasting heavy dupatta.",
          items: ["Handcrafted Maroon Lehenga", "Premium Silk Dupatta", "Golden Wedding Mojris", "Statement Temple Polki Choker"]
        }
      ]
    },
    men: {
      queries: [
        "royal sherwani men",
        "indian wedding kurta",
        "luxury ethnic menswear",
        "designer wedding safa"
      ],
      colors: [
        { name: "Regal Ivory Gold", hex: "#fef3c7", desc: "Gives the primary base an elevated, high-status foundation." },
        { name: "Royal Saffron Marigold", hex: "#ea580c", desc: "Highlights shoulders and pockets with signature traditional radiance." },
        { name: "Emperor Navy Silk", hex: "#1e3a8a", desc: "Deep rich blue offering majestic traditional strength." }
      ],
      category: "Wedding Ethnic",
      avoidColors: ["Faded Denim Blue", "Neon Lime Green", "Dull Drab Brown"],
      trends: ["Imperial Jodhpur Kurta Bandhgala", "Linen Nehru Jacket Layering"],
      suggestedStyles: [
        {
          title: "Royal Jadhpuri Bundi Look",
          desc: "A structured Nehru jacket layered over a crisp tussar-silk ivory kurta and slim pants.",
          items: ["Brocade Nehru Jacket", "Tussar-silk Long Kurta", "Polished Velvet Juttis", "Gold-threaded Embroidered Pocket Square"]
        }
      ]
    }
  },

  "Office Corporate Chic": {
    women: {
      queries: [
        "corporate women fashion",
        "formal office outfit women",
        "minimal professional women style",
        "office blazer suit women"
      ],
      colors: [
        { name: "Oatmeal Minimal Beige", hex: "#e2d4be", desc: "A soothing corporate neutral that feels professional and eye-friendly." },
        { name: "Executive Charcoal Teal", hex: "#115e59", desc: "Subtle executive pigment that works elegantly for premium conference rooms." },
        { name: "Sleek Midnight Navy", hex: "#1e293b", desc: "Authoritative base tone establishing pure corporate credibility." }
      ],
      category: "Formal",
      avoidColors: ["Dayglo Orange", "Fluorescent Violet", "Neon Hot Pink"],
      trends: ["Contemporary Minimalist Kurtas", "Linen Nehru Waistcoats"],
      suggestedStyles: [
        {
          title: "Modern Executive Indo-Western Coord",
          desc: "Mandarin collar linen shirt layered with slim-cut trousers and a lightweight minimal cotton waistcoat.",
          items: ["Mandarin-collar Professional Tunic", "Slim-Fit Cotton Chinos", "Flat Formal Mules", "Minimal Titanium Timepiece"]
        }
      ]
    },
    men: {
      queries: [
        "business casual men",
        "formal office wear men",
        "executive mens fashion",
        "sharp suit tailored men"
      ],
      colors: [
        { name: "Classic French Navy", hex: "#1e3a8a", desc: "Provides heavy masculine corporate status suited for boardrooms." },
        { name: "Aesthetic Slate Grey", hex: "#4b5563", desc: "Elegant framing neutral ideal for senior management status." },
        { name: "Pristine Crisp White", hex: "#ffffff", desc: "A perfect contrast standard that holds a neat tie and lapel lines." }
      ],
      category: "Formal",
      avoidColors: ["Vibrant Saffron", "Golden Yellow", "Barbie Pink"],
      trends: ["Corporate Dapper Blazers", "Linen Smart Formal"],
      suggestedStyles: [
        {
          title: "Smart Business Formal Suit",
          desc: "A sharply tailored modern slim blazer in crisp cotton linen over customized tapered formal styling.",
          items: ["Tailored Slate Blazer", "Crisp Cotton Cuff Shirt", "Premium Formal Oxhide Loafers", "Sleek Professional Chronometer"]
        }
      ]
    }
  },

  "Romantic Sparkle Date": {
    women: {
      queries: [
        "luxury dinner dress women",
        "romantic pink outfit",
        "date night elegant women fashion",
        "cocktail dinner gown women"
      ],
      colors: [
        { name: "Blush Rose Petal", hex: "#fda4af", desc: "Establishes a romantic, light-reflecting charm that warms skin complexions instantly." },
        { name: "Burgundy Velvet Secret", hex: "#9d174d", desc: "Sensual luxury tone holding premium presence under candlelight." },
        { name: "Rose Gold Shimmer", hex: "#fb7185", desc: "Adds subtle sparkling glamour to evening social curves." }
      ],
      category: "Date Night",
      avoidColors: ["Harsh Neon Green", "Asphalt Grey", "Dull Khaki Clay"],
      trends: ["K-Wave + Indian Fusion", "Korean Oversized Trench over Soft Linen"],
      suggestedStyles: [
        {
          title: "Fusion Romanticism Drape",
          desc: "Oversized linen top tucked cleanly under structured fabrics, accessorized with subtle traditional threads.",
          items: ["Blush Silk Drape Shirt", "Tapered Structured Slacks", "Minimal Silver Clasp Chain", "Suede Pointed Boots"]
        }
      ]
    },
    men: {
      queries: [
        "black shirt date outfit men",
        "luxury dinner mens fashion",
        "romantic evening menswear",
        "smart casual date men"
      ],
      colors: [
        { name: "Obsidian Midnight Black", hex: "#111111", desc: "The ultimate date night standard, creating a sharp, handsome silhouette." },
        { name: "Rich Mulberry Wine", hex: "#881337", desc: "Warm elite burgundy evoking elegant premium lifestyle." },
        { name: "Cream Cashmere Sand", hex: "#f3f4f6", desc: "Light luxurious contrast for shoulder jackets and coats." }
      ],
      category: "Date Night",
      avoidColors: ["Bright Saffron Gold", "Neon Yellow", "Athletic Active White"],
      trends: ["Dapper Romantic Blazers", "Luxury Silk Shirt Layering"],
      suggestedStyles: [
        {
          title: "Executive Date Night Silhouette",
          desc: "A sleek open-collar dark linen or silk shirt layered under a luxury unstructured blazer.",
          items: ["Obsidian Silk Button-Down", "Unstructured Charcoal Blazer", "Slim Tapered Chinos", "Italian Suede Chelsea Boots"]
        }
      ]
    }
  },

  "College Streetwear": {
    women: {
      queries: [
        "cyberpunk streetwear girls",
        "oversized pastel aesthetic comfort",
        "college student outfit girls",
        "gen z style women denim"
      ],
      colors: [
        { name: "Soft Lilac Mist", hex: "#d8b4fe", desc: "Relaxed lilac hue expressing Gen-Z playfulness and creative charm." },
        { name: "Faded Denim Indigo", hex: "#3b82f6", desc: "Classic casual denim anchor reflecting organic college lifestyle." },
        { name: "Cyberpunk Highlighter Pink", hex: "#ec4899", desc: "Pops of color for shoelaces and streetwear accessory graphics." }
      ],
      category: "College / Streetwear",
      avoidColors: ["Brocade Saffron Gold", "Heavy Velvet Maroon", "Formal Slate Grey"],
      trends: ["Cyberpunk Streetwear Girls", "Oversized Pastel aesthetic comfort"],
      suggestedStyles: [
        {
          title: "Gen-Z Khadi Campus Fusion",
          desc: "Oversized comfortable khadi shirt paired with high-waist cargo jeans and chunky street trainers.",
          items: ["Oversized Roll-Sleeve Khadi Shirt", "Denim Carpenter Utility Jeans", "High-Platform Canvas Chunky Sneakers", "Printed Recycled Duffle Tote Bag"]
        }
      ]
    },
    men: {
      queries: [
        "oversized streetwear boys",
        "urban khadi street sets",
        "men baggy cargo outfit",
        "cool gen z college guy style"
      ],
      colors: [
        { name: "Amber Sandstone", hex: "#f59e0b", desc: "An active warm college hue perfect for dynamic campus routines." },
        { name: "Streetwear Ink Black", hex: "#18181b", desc: "Chic streetwear foundation establishing a strong modern silhouette." },
        { name: "Sage Grass Green", hex: "#86efac", desc: "Earthy, creative pigment reflecting relaxed design school vibe." }
      ],
      category: "College / Streetwear",
      avoidColors: ["Formal Golden Silk", "Business Navy Blue", "Polki Maroon"],
      trends: ["Oversized Streetwear Boys", "Urban Khadi Street sets"],
      suggestedStyles: [
        {
          title: "Urban Indian Streetwear Set",
          desc: "Heavy drop-shoulder oversized graphic t-shirt layered with relaxed military baggy cargos.",
          items: ["Oversized Drop-Shoulder Graphic Tee", "Tapered Cotton Utility Cargo Pants", "Chunky Retro Running Sneakers", "Utility Crossbody Pouch Bag"]
        }
      ]
    }
  },

  "Vogue Editorial Interview": {
    women: {
      queries: [
        "haute couture runway model",
        "quiet luxury editorial fashion",
        "high-end designer womens blazer",
        "fashion director style women"
      ],
      colors: [
        { name: "High-Fashion Ivory Satin", hex: "#fafaf9", desc: "Pristine elegant standard framing luxury silhouettes perfectly." },
        { name: "Empress Burgundy Wine", hex: "#831843", desc: "Rich elite palette signaling creative power and high-taste status." },
        { name: "Champagne Gold Gloss", hex: "#fef08a", desc: "Understated luxury sheen for subtle border buttons and cuff lines." }
      ],
      category: "Luxury Editorial",
      avoidColors: ["Bright Neon Lime", "Raw Active Blue", "Cheap Polyester Yellow"],
      trends: ["Haute Couture Runway", "Quiet Luxury Silk Coats"],
      suggestedStyles: [
        {
          title: "Vogue Creative Director Ensemble",
          desc: "A modern silk cape jacket layered over a luxury handcrafted tailored monochrome suit statement.",
          items: ["High-Couture Silk Overlay Coat", "Asymmetrical Tailored Bodice Suit", "Vintage Statement Gold Hoops", "Leather Fashion Week Pointed High Heels"]
        }
      ]
    },
    men: {
      queries: [
        "savile row elite suit men",
        "quiet luxury menswear blazer",
        "fashion week design outfit men",
        "editorial men fashion portrait"
      ],
      colors: [
        { name: "Bespoke Royal Navy", hex: "#172554", desc: "Perfect high-status executive color reflecting Savile Row handcraft." },
        { name: "Cashmere Camel Beige", hex: "#d97706", desc: "Warm premium coat tone framing pristine upper garments elegantly." },
        { name: "Slate Charcoal Shadow", hex: "#1e293b", desc: "Highly professional neutral bringing structural depth." }
      ],
      category: "Luxury Editorial",
      avoidColors: ["Activewear Orange", "Denim Basic Blue", "Gym Neon Green"],
      trends: ["Old Money Tailoring Men", "Savile Row Elite Suit"],
      suggestedStyles: [
        {
          title: "Couture Editorial Blazer Set",
          desc: "A bespoke wool jacket or designer double-breasted blazer styled with high-thread cotton underlays.",
          items: ["Bespoke Cashmere Blazer", "Premium Sea Island Cotton Shirt", "Calfskin Hand-Stitched Oxfords", "Vintage Sterling Silver Cufflinks"]
        }
      ]
    }
  },

  "Gym Coquette Athletics": {
    women: {
      queries: [
        "coquette fitness aesthetic women",
        "pastel matching athleisure set women",
        "yoga instructor style girls",
        "aesthetic tennis skirt workout clothing"
      ],
      colors: [
        { name: "Coquette Blush Pink", hex: "#fda4af", desc: "Soft pastel wellness tone expressing feminine wellness chic." },
        { name: "Coconut Cream Ivory", hex: "#fef3c7", desc: "Crisp natural off-white perfect for tennis court accents and straps." },
        { name: "Active Slate Mist", hex: "#cbd5e1", desc: "Graceful secondary activewear base reflecting eye-safety." }
      ],
      category: "Athleisure",
      avoidColors: ["Brocade Saffron Silk", "Heavy Velvet Gold", "Embroidery Saree Red"],
      trends: ["Coquette Fitness aesthetics", "Pastel Athleisure sets"],
      suggestedStyles: [
        {
          title: "Coquette Gym Activewear Trio",
          desc: "Premium matching sports bodice and high-rise performance leggings layered under a breezy mesh cropped hoodie.",
          items: ["Pastel Ribbed Athletic Gym Suit", "Mesh Cropped Active Activewear", "Cloud-Plated Premium Running Sneakers", "Insulated Sports Hydro-Flask Cup"]
        }
      ]
    },
    men: {
      queries: [
        "active core gym athletic men",
        "mens premium core training apparel",
        "full body athletic wear male runner",
        "fitness trainer clothing men"
      ],
      colors: [
        { name: "Obsidian Core Charcoal", hex: "#1f2937", desc: "Sleek masculine high-performance standard that conceals activity residue." },
        { name: "Electric Royal Blue", hex: "#2563eb", desc: "High-intensity athletic speed shade that commands attention on courts." },
        { name: "Cyber Volt Grey", hex: "#f8fafc", desc: "Bright high-technology performance trim highlighting runner mechanics." }
      ],
      category: "Athleisure",
      avoidColors: ["Traditional Silk Saffron", "Polki Royal Brocade", "Ivory Wedding Gold"],
      trends: ["Active core gym looks", "Premium training coordinates"],
      suggestedStyles: [
        {
          title: "High-Performance Runner Set",
          desc: "Advanced dry-fit activewear knit shirt paired with lightweight tapered multi-pocket utility joggers.",
          items: ["Active Dry-Fit Knit Top", "Multi-Pocket Training Joggers", "Carbon-Plated Aero Running Shoes", "Smart GPS Sportswatch"]
        }
      ]
    }
  },

  "Coastal Cannes Vacation": {
    women: {
      queries: [
        "coastal cannes vacation outfit women",
        "luxury resort wear dress women",
        "summer beach side linen look women",
        "vacation clothing women summer"
      ],
      colors: [
        { name: "Ocean Breeze Aqua", hex: "#0284c7", desc: "Deep beautiful blue evocative of Southern French coast water hues." },
        { name: "Beach Sand Linen", hex: "#fafaf9", desc: "Maintains ultimate breathability and high summer heat-reflection index." },
        { name: "Luminous Sunset Pearl", hex: "#fef08a", desc: "Adds comfortable evening champagne lighting to seaside dining coords." }
      ],
      category: "Resort Casual",
      avoidColors: ["Heavy Winter Charcoal", "Deep Velvet Maroon", "Heavy Brocade Metallic"],
      trends: ["Coastal Cannes Vacation Mood", "Chic Resort Wear"],
      suggestedStyles: [
        {
          title: "Riviera Summer Resort Set",
          desc: "A flowing printed beach dress paired with oversized shades and hand-woven slides.",
          items: ["Printed Luxury Resort Dress", "Sandy Beach Linen Wrap", "Handcrafted Italian Leather Slides", "Oversized Round Retro Sunglasses"]
        }
      ]
    },
    men: {
      queries: [
        "linen resort menswear",
        "yacht riviera men summer style",
        "cannes vacation look beach linen men",
        "mens resort wear print clothing"
      ],
      colors: [
        { name: "Breezy Coconut Cream", hex: "#f7fee7", desc: "Super relaxed, luxurious resort color perfect for beachfront lounges." },
        { name: "St Tropez Navy Blue", hex: "#1e3a8a", desc: "Deep nautical standard framing summer shorts and yachts elegantly." },
        { name: "Warm Amber Sand", hex: "#ea580c", desc: "Warm daylight hue mimicking premium beachside horizons." }
      ],
      category: "Resort Casual",
      avoidColors: ["Formal Silk Gold", "High-Stiffness Tie Black", "Heavy Velvet Brocade"],
      trends: ["Linen Summer Breeze", "Yacht Riviera Men"],
      suggestedStyles: [
        {
          title: "Linen Resort Yacht Silhouette",
          desc: "Breathable open-collar premium linen shirt styled with casual cream trousers and driving slippers.",
          items: ["Premium Short-Sleeve Linen Shirt", "Slim-Fit Light Chino Trousers", "Suede Italian Yacht Loafers", "Woven Straw Beach Panama Hat"]
        }
      ]
    }
  },

  "Barbiecore Night Clubbing": {
    women: {
      queries: [
        "barbiecore pink outfits women fashion",
        "night clubbing glitter dress women",
        "electric pink party style women",
        "futuristic rave outfit women"
      ],
      colors: [
        { name: "Electric Barbiecore Fuchsia", hex: "#ec4899", desc: "Fierce neon magenta designed for night strobe highlight and dancing vibe." },
        { name: "Obsidian High-Gloss Black", hex: "#111111", desc: "High-contrast anchor that creates dramatic night-club strobe pop." },
        { name: "Metallic Hologram Silver", hex: "#e2e8f0", desc: "Catching neon light with maximum digital refraction." }
      ],
      category: "Party / Glam",
      avoidColors: ["Corporate Beige", "Dull Office Sage Green", "Formal Saffron Brown"],
      trends: ["Navratri Mirror-Work Fusion", "Chic Indo-Western Sheer Shimmer"],
      suggestedStyles: [
        {
          title: "Cyber-Indo Sparkle Set",
          desc: "A dazzling metallic sequined jacket paired over an asymmetric tunic and dynamic streetwear trousers.",
          items: ["Glittering Asymmetrical Vest", "Asymmetric Obsidian Slip Top", "Holographic High-Sole Boots", "Designer Cyberpunk Visor Clasp"]
        }
      ]
    },
    men: {
      queries: [
        "mens party club wear luxury shirt",
        "rave streetwear fashion boys",
        "cool night clubbing outfit men",
        "electric neon designer party shirt men"
      ],
      colors: [
        { name: "Hyper Glow Pink Accent", hex: "#f43f5e", desc: "Bold, modern neon pink detailing to capture active rave atmospheres." },
        { name: "Nightlife Matte Black", hex: "#18181b", desc: "The ultimate clubbing base framing clean streetwear cuts and neon details." },
        { name: "Electric Indigo Blue", hex: "#1d4ed8", desc: "A rich digital blue offering powerful evening style and modern contrast." }
      ],
      category: "Party / Glam",
      avoidColors: ["Business Office Beige", "Brocade Wedding Saffron", "Dull Olive Drab"],
      trends: ["Indo-Western fusion Achkan", "Mirror Ethnic kurta sets"],
      suggestedStyles: [
        {
          title: "Rave Fusion Avant-Garde Drapes",
          desc: "A modern structural open collar tunic decorated with subtle geometric neon lines.",
          items: ["Asymmetrical Club Tunic Jacket", "Glossy Tapered Jogger Pants", "Chunky High-Top Street Trainers", "Neon Glow Metallic Pendant"]
        }
      ]
    }
  }
};
