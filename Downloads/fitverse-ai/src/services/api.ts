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
  created_at?: string;
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

export interface TrendDigest {
  seasonTitle: string;
  globalCoreTrend: string;
  bulletins: Array<{ headline: string; details: string }>;
  colorPalette: Array<{ color: string; hex: string; relevance: string }>;
}

export const isSupabaseConfigured = (): boolean => {
  return false;
};

// Local storage helper functions to emulate a rich backend
const getLocalData = <T>(key: string, defaultValue: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setLocalData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn('LocalStorage save failed:', err);
  }
};

export const api = {
  // --- AUTH SERVICES (Mocked for front-end experience with no database constraints) ---
  async signup(email: string, pass: string, name: string) {
    const user: User = {
      id: 'guest_user_id',
      email,
      name,
      created_at: new Date().toISOString()
    };
    return { token: 'mock_token', user };
  },

  async login(email: string, pass: string) {
    const user: User = {
      id: 'guest_user_id',
      email,
      name: 'Guest Stylist',
      created_at: new Date().toISOString()
    };
    return { token: 'mock_token', user };
  },

  async logout() {
    // No-op
  },

  async getSession() {
    return null;
  },

  async updateProfile(userId: string, data: Partial<User> & { style?: string; colors?: string[]; fit?: string }) {
    // Merges updated profile information and saves locally
    const currentProfile = getLocalData<User>('fitverse_guest_profile', {
      id: 'guest_user_id',
      email: 'guest@fitverse.com',
      name: 'Guest Stylist',
      gender: 'women',
      bodyType: 'hourglass',
      height: 168,
      weight: 58,
      preferences: {
        style: 'modernist',
        colors: ['#000055', '#ec4899'],
        fit: 'regular'
      },
      created_at: new Date().toISOString()
    });

    const updatedProfile: User = {
      ...currentProfile,
      ...data,
      preferences: {
        style: data.style || currentProfile.preferences?.style,
        colors: data.colors || currentProfile.preferences?.colors,
        fit: data.fit || currentProfile.preferences?.fit
      }
    };

    setLocalData('fitverse_guest_profile', updatedProfile);
    return updatedProfile;
  },

  // --- OUTFIT SERVICES ---
  async getOutfits() {
    try {
      const res = await fetch('/api/db/outfits');
      if (res.ok) {
        return await res.json() as Outfit[];
      }
    } catch (e) {
      console.warn('Backend fetch failed, using mock fallbacks:', e);
    }
    return [] as Outfit[];
  },

  // --- VIRTUAL TRY-ON ---
  async generateTryon(params: {
    userId?: string;
    imageBefore: string | null;
    gender: string;
    bodyType: string;
    category: string;
    styleId: string;
  }) {
    const res = await fetch('/api/tryon/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Virtual try-on generation failed');
    }
    const data = await res.json();

    // Persist to local history
    const history = getLocalData<TryonHistory[]>('fitverse_tryon_history', []);
    const newEntry: TryonHistory = {
      id: Math.random().toString(36).substring(2, 9),
      userId: params.userId || 'guest_user_id',
      imageBefore: params.imageBefore || data.tryon?.imageBefore || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600',
      imageAfter: data.tryon?.imageAfter || 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600',
      category: params.category,
      style: data.tryon?.style || 'AI Interactive',
      gender: params.gender,
      bodyType: params.bodyType,
      fit: data.tryon?.fit || 'regular',
      fashionScore: Number(data.tryon?.fashionScore || 85),
      caption: data.tryon?.caption || 'Synthesized virtual fitting coordinate.',
      timestamp: new Date().toISOString()
    };
    history.unshift(newEntry);
    setLocalData('fitverse_tryon_history', history);

    return {
      ...data,
      tryon: newEntry
    };
  },

  async getTryonHistory(userId: string) {
    return getLocalData<TryonHistory[]>('fitverse_tryon_history', []);
  },

  async clearTryonHistory(userId: string) {
    setLocalData('fitverse_tryon_history', []);
    return { success: true };
  },

  // --- SMART RECOMMENDATION ---
  async generateRecommendation(params: {
    userId?: string;
    skinTone: string;
    gender: string;
    occasion: string;
    trends: string[];
  }) {
    const res = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Smart recommendations failed to build');
    const recommendation = await res.json() as Recommendation;

    // Persist to local recommendations
    const records = getLocalData<Recommendation[]>('fitverse_recommendations', []);
    const newRecord: Recommendation = {
      ...recommendation,
      id: Math.random().toString(36).substring(2, 9),
      userId: params.userId || 'guest_user_id',
      timestamp: new Date().toISOString()
    };
    records.unshift(newRecord);
    setLocalData('fitverse_recommendations', records);

    return newRecord;
  },

  async getStoredRecommendations(userId: string) {
    return getLocalData<Recommendation[]>('fitverse_recommendations', []);
  },

  // --- BODY FIT ---
  async generateBodyFit(params: {
    userId?: string;
    height: number;
    weight: number;
    bodyShape: string;
  }) {
    const res = await fetch('/api/bodyfit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Body fit suggestion generation failed');
    const result = await res.json() as BodyFitSuggestion;

    const records = getLocalData<BodyFitSuggestion[]>('fitverse_bodyfit', []);
    const newRecord: BodyFitSuggestion = {
      ...result,
      id: Math.random().toString(36).substring(2, 9),
      userId: params.userId || 'guest_user_id',
      timestamp: new Date().toISOString()
    };
    records.unshift(newRecord);
    setLocalData('fitverse_bodyfit', records);

    return newRecord;
  },

  async getStoredBodyFit(userId: string) {
    return getLocalData<BodyFitSuggestion[]>('fitverse_bodyfit', []);
  },

  // --- SAVED LOOKS (FAVORITES) ---
  async getSavedLooks(userId: string) {
    return getLocalData<SavedLook[]>('fitverse_saved_looks', []);
  },

  async saveLook(look: Omit<SavedLook, 'id' | 'timestamp'>) {
    const records = getLocalData<SavedLook[]>('fitverse_saved_looks', []);
    const newLook: SavedLook = {
      ...look,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString()
    };
    records.unshift(newLook);
    setLocalData('fitverse_saved_looks', records);
    return newLook;
  },

  async deleteLook(id: string, userId: string) {
    const records = getLocalData<SavedLook[]>('fitverse_saved_looks', []);
    const filtered = records.filter(item => item.id !== id);
    setLocalData('fitverse_saved_looks', filtered);
    return { success: true };
  },

  // --- AI ASSISTANT CHAT ---
  async chat(message: string, history: Array<{ role: 'user' | 'assistant'; content: string }>) {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history })
    });
    if (!res.ok) throw new Error('AI Fashion concierge is currently busy');
    return await res.json() as { text: string };
  },

  async getTrendsDigest() {
    const res = await fetch('/api/ai/trends');
    if (!res.ok) throw new Error('Trend report down');
    return await res.json() as TrendDigest;
  }
};
