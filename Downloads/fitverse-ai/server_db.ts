import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  email: string;
  name: string;
  gender?: string;
  bodyType?: string;
  height?: number;
  weight?: number;
  preferences?: {
    style?: string;
    colors?: string[];
    fit?: string;
  };
  created_at: string;
}

export interface Outfit {
  id: string;
  name: string;
  category: 'casual' | 'streetwear' | 'formal' | 'traditional' | 'gymwear' | 'partywear';
  gender: 'men' | 'women' | 'unisex';
  color: string;
  hex: string;
  imageUrl: string;
  style: string;
  fit: 'slim' | 'oversized' | 'regular' | 'loose';
  tags: string[];
}

export interface SavedLook {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  imageBefore: string;
  imageAfter: string;
  fashionScore: number;
  tags: string[];
  caption: string;
  timestamp: string;
}

export interface TryonHistory {
  id: string;
  userId: string;
  imageBefore: string;
  imageAfter: string;
  category: string;
  style: string;
  gender: string;
  bodyType: string;
  fit: string;
  fashionScore: number;
  caption: string;
  timestamp: string;
}

export interface Recommendation {
  id: string;
  userId: string;
  skinTone: string;
  gender: string;
  occasion: string;
  trends: string[];
  matchingColors: Array<{ name: string; hex: string; desc: string }>;
  avoidColors: string[];
  suggestedStyles: Array<{ title: string; desc: string; items: string[] }>;
  timestamp: string;
}

export interface BodyFitSuggestion {
  id: string;
  userId: string;
  height: number;
  weight: number;
  bodyShape: string;
  recommendedFit: 'slim fit' | 'oversized' | 'regular fit' | 'loose fit';
  bestOutfitStyles: string[];
  stylingTips: string[];
  timestamp: string;
}

interface DB {
  users: User[];
  outfits: Outfit[];
  saved_looks: SavedLook[];
  tryon_history: TryonHistory[];
  recommendations: Recommendation[];
  body_fit_suggestions: BodyFitSuggestion[];
}

const DB_PATH = path.resolve('fitverse_db.json');

const DEFAULT_OUTFITS: Outfit[] = [
  // Streetwear
  {
    id: 'outfit-1',
    name: 'Cyberpunk Neon Cargo Set',
    category: 'streetwear',
    gender: 'unisex',
    color: 'Matte Black & Cyber Pink',
    hex: '#ff007f',
    imageUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&auto=format&fit=crop&q=80',
    style: 'Techwear Utility',
    fit: 'oversized',
    tags: ['Cyber aesthetics', 'Multi-pocket', 'Neon accent', 'Waterproof']
  },
  {
    id: 'outfit-2',
    name: 'Asphalt Tokyo Hoodie Styling',
    category: 'streetwear',
    gender: 'men',
    color: 'Graphic Charcoal Gray',
    hex: '#333333',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
    style: 'Urban Streetwear',
    fit: 'oversized',
    tags: ['Graphic Print', 'Heavyweight cotton', 'Comfy drop-shoulder']
  },
  // Casual
  {
    id: 'outfit-3',
    name: 'Retro Acid-Wash Denim Ensemble',
    category: 'casual',
    gender: 'women',
    color: 'Indie Denim Blue',
    hex: '#4b70dd',
    imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80',
    style: '90s Vibe Casual',
    fit: 'regular',
    tags: ['Vintage denim', 'White crop top', 'Retro sneakers matching']
  },
  {
    id: 'outfit-4',
    name: 'Linen Breeze Weekender Suit',
    category: 'casual',
    gender: 'men',
    color: 'Sand Beige',
    hex: '#e2d4be',
    imageUrl: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=600&auto=format&fit=crop&q=80',
    style: 'Minimalist Coastal',
    fit: 'loose',
    tags: ['100% Linen', 'Breathable', 'Sun vacation styling']
  },
  // Formal
  {
    id: 'outfit-5',
    name: 'Imperial Double-Breasted Tuxedo',
    category: 'formal',
    gender: 'men',
    color: 'Midnight Blue Velvet',
    hex: '#191970',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80',
    style: 'High-Society Evening Wear',
    fit: 'slim',
    tags: ['Velvet lapels', 'Bespoke tailoring', 'Classic silk bowtie']
  },
  {
    id: 'outfit-6',
    name: 'Structured Blazer & Pleated Slacks',
    category: 'formal',
    gender: 'women',
    color: 'Monochrome Arctic White',
    hex: '#f3f4f6',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80',
    style: 'Modern Power Styling',
    fit: 'slim',
    tags: ['Sharp shoulder pads', 'Gold alloy accents', 'High-waist tailored pants']
  },
  // Gymwear
  {
    id: 'outfit-7',
    name: 'HydroShield Aero Compression Set',
    category: 'gymwear',
    gender: 'women',
    color: 'Electric Cobalt',
    hex: '#2563eb',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
    style: 'Athleisure Performance',
    fit: 'slim',
    tags: ['Moisture-wicking', 'Anti-chafing', 'Subtle futuristic panels']
  },
  {
    id: 'outfit-8',
    name: 'Dry-Vent Stealth Training Gear',
    category: 'gymwear',
    gender: 'men',
    color: 'Carbon Grey',
    hex: '#2d3748',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
    style: 'Performance Athletic',
    fit: 'regular',
    tags: ['Ultra-vented mesh', 'Reflective security straps', 'Lightweight stretch']
  },
  // Traditional
  {
    id: 'outfit-9',
    name: 'Royal Heritage Brocade Sherwani',
    category: 'traditional',
    gender: 'men',
    color: 'Ivory Gold & Crimson',
    hex: '#ffd700',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
    style: 'Luxury Festive Wedding',
    fit: 'regular',
    tags: ['Handcrafted brocade', 'Coronation buttons', 'Artisanal embroidery']
  },
  {
    id: 'outfit-10',
    name: 'Elysian Aurora Sequin Saree',
    category: 'traditional',
    gender: 'women',
    color: 'Emerald & Gold Spectrum',
    hex: '#059669',
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
    style: 'Festive Traditional Couture',
    fit: 'regular',
    tags: ['Shimmering sequins', 'Satin borders', 'Contemporary georgette drape']
  },
  // Partywear
  {
    id: 'outfit-11',
    name: 'Holographic Liquid-Metal Gown',
    category: 'partywear',
    gender: 'women',
    color: 'Hyper Chrome Silver',
    hex: '#e2e8f0',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
    style: 'Gala Avant-Garde',
    fit: 'slim',
    tags: ['Iridescent sheen', 'Floor-length drape', 'Dynamic lights reflection']
  },
  {
    id: 'outfit-12',
    name: 'Cyberpunk Silk Clubbing Shirt Set',
    category: 'partywear',
    gender: 'men',
    color: 'Neo Burgundy Satin',
    hex: '#9d174d',
    imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&auto=format&fit=crop&q=80',
    style: 'Futuristic Club Couture',
    fit: 'regular',
    tags: ['Premium mulberry silk', 'Asymmetrical collar', 'Neon stitching details']
  }
];

export class DBStore {
  private data: DB;

  constructor() {
    this.data = {
      users: [],
      outfits: DEFAULT_OUTFITS,
      saved_looks: [],
      tryon_history: [],
      recommendations: [],
      body_fit_suggestions: []
    };
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
        const parsed = JSON.parse(fileContent);
        this.data = {
          users: parsed.users || [],
          outfits: parsed.outfits && parsed.outfits.length > 0 ? parsed.outfits : DEFAULT_OUTFITS,
          saved_looks: parsed.saved_looks || [],
          tryon_history: parsed.tryon_history || [],
          recommendations: parsed.recommendations || [],
          body_fit_suggestions: parsed.body_fit_suggestions || []
        };
      } else {
        this.save();
      }
    } catch (e) {
      console.error('Error loading database, setting defaults', e);
      this.save();
    }
  }

  public save() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write database file', e);
    }
  }

  // --- Users CRUD ---
  public getUsers() { return this.data.users; }
  public getUserByEmail(email: string) { return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase()); }
  public getUserById(id: string) { return this.data.users.find(u => u.id === id); }
  public addUser(user: User) {
    this.data.users.push(user);
    this.save();
    return user;
  }
  public updateUser(id: string, updates: Partial<User>) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates };
      this.save();
      return this.data.users[idx];
    }
    return null;
  }

  // --- Outfits CRUD ---
  public getOutfits() { return this.data.outfits; }
  public addOutfit(outfit: Outfit) {
    this.data.outfits.unshift(outfit);
    this.save();
    return outfit;
  }
  public deleteOutfit(id: string) {
    this.data.outfits = this.data.outfits.filter(o => o.id !== id);
    this.save();
    return true;
  }

  // --- Saved Looks CRUD ---
  public getSavedLooks(userId: string) {
    return this.data.saved_looks.filter(l => l.userId === userId);
  }
  public addSavedLook(look: SavedLook) {
    this.data.saved_looks.unshift(look);
    this.save();
    return look;
  }
  public deleteSavedLook(id: string, userId: string) {
    this.data.saved_looks = this.data.saved_looks.filter(l => !(l.id === id && l.userId === userId));
    this.save();
    return true;
  }

  // --- Tryon History CRUD ---
  public getTryonHistory(userId: string) {
    return this.data.tryon_history.filter(h => h.userId === userId);
  }
  public addTryonHistory(history: TryonHistory) {
    this.data.tryon_history.unshift(history);
    this.save();
    return history;
  }
  public clearTryonHistory(userId: string) {
    this.data.tryon_history = this.data.tryon_history.filter(h => h.userId !== userId);
    this.save();
    return true;
  }

  // --- Recommendations CRUD ---
  public getRecommendations(userId: string) {
    return this.data.recommendations.filter(r => r.userId === userId);
  }
  public addRecommendation(rec: Recommendation) {
    this.data.recommendations.unshift(rec);
    this.save();
    return rec;
  }

  // --- Body Fit Suggestions CRUD ---
  public getBodyFitSuggestions(userId: string) {
    return this.data.body_fit_suggestions.filter(s => s.userId === userId);
  }
  public addBodyFitSuggestion(sug: BodyFitSuggestion) {
    this.data.body_fit_suggestions.unshift(sug);
    this.save();
    return sug;
  }
}

export const dbStore = new DBStore();
