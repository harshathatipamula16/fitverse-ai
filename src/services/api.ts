import { supabase } from '../lib/supabase.js';

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

// Utility checker for Supabase parameters status
export const isSupabaseConfigured = (): boolean => {
  const url = (import.meta as any).env.VITE_SUPABASE_URL;
  const key = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;
  return !!(url && key && url !== 'MY_API_KEY' && key !== 'MY_API_KEY');
};

const getHeaders = () => {
  const token = localStorage.getItem('fitverse_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // --- AUTH SERVICES ---
  async signup(email: string, password: string, name: string) {
    if (isSupabaseConfigured()) {
      // Direct Supabase Authentication Sign Up
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });
      if (error) {
        throw new Error(error.message || 'Supabase SignUp failed');
      }
      if (data.user) {
        // Create custom profile in public.users table
        const { error: insertErr } = await supabase.from('users').insert({
          id: data.user.id,
          email,
          name
        });
        if (insertErr) {
          console.warn('⚠️ Could not sync Supabase profile Row, but authentication was registered:', insertErr.message);
        }
        return {
          token: data.session?.access_token || 'supabase_token',
          user: {
            id: data.user.id,
            email: data.user.email || email,
            name,
            created_at: new Date().toISOString()
          }
        };
      }
    }

    // Fallback to Express backend mock
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Signup failed');
    }
    const result = await res.json();
    localStorage.setItem('fitverse_token', result.token);
    return result;
  },

  async login(email: string, password: string) {
    if (isSupabaseConfigured()) {
      // Real Supabase Authentication Sign In
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        throw new Error(error.message || 'Supabase Login failed');
      }
      if (data.user) {
        // Query user table details
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        const userObj: User = {
          id: data.user.id,
          email: data.user.email || email,
          name: profile?.name || data.user.user_metadata?.name || 'Explorer',
          gender: profile?.gender,
          bodyType: profile?.body_type,
          height: profile?.height ? Number(profile.height) : undefined,
          weight: profile?.weight ? Number(profile.weight) : undefined,
          preferences: {
            style: profile?.style_preference,
            colors: profile?.favorite_colors,
          },
          created_at: profile?.created_at || new Date().toISOString()
        };

        return {
          token: data.session?.access_token || 'supabase_token',
          user: userObj
        };
      }
    }

    // Fallback to Express backend mock
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    const result = await res.json();
    localStorage.setItem('fitverse_token', result.token);
    return result;
  },

  async logout() {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('fitverse_token');
  },

  async getSession() {
    if (isSupabaseConfigured()) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        return {
          id: session.user.id,
          email: session.user.email || '',
          name: profile?.name || session.user.user_metadata?.name || 'Explorer',
          gender: profile?.gender,
          bodyType: profile?.body_type,
          height: profile?.height ? Number(profile.height) : undefined,
          weight: profile?.weight ? Number(profile.weight) : undefined,
          preferences: {
            style: profile?.style_preference,
            colors: profile?.favorite_colors,
          },
          created_at: profile?.created_at || new Date().toISOString()
        } as User;
      }
      return null;
    }

    const token = localStorage.getItem('fitverse_token');
    if (!token) return null;
    const res = await fetch('/api/auth/session', {
      headers: getHeaders()
    });
    if (!res.ok) {
      localStorage.removeItem('fitverse_token');
      return null;
    }
    const data = await res.json();
    return data.user as User;
  },

  async updateProfile(userId: string, data: Partial<User> & { style?: string; colors?: string[]; fit?: string }) {
    if (isSupabaseConfigured()) {
      // Upsert direct mappings to Snake Case Supabase column names
      const payload: any = {};
      if (data.name !== undefined) payload.name = data.name;
      if (data.gender !== undefined) payload.gender = data.gender;
      if (data.bodyType !== undefined) payload.body_type = data.bodyType;
      if (data.height !== undefined) payload.height = Number(data.height);
      if (data.weight !== undefined) payload.weight = Number(data.weight);
      if (data.style !== undefined) payload.style_preference = data.style;
      if (data.colors !== undefined) payload.favorite_colors = data.colors;

      const { error } = await supabase
        .from('users')
        .update(payload)
        .eq('id', userId);

      if (error) {
        throw new Error(error.message || 'Supabase profile update failed');
      }

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      return {
        id: userId,
        email: profile.email,
        name: profile.name,
        gender: profile.gender,
        bodyType: profile.body_type,
        height: profile.height ? Number(profile.height) : undefined,
        weight: profile.weight ? Number(profile.weight) : undefined,
        preferences: {
          style: profile.style_preference,
          colors: profile.favorite_colors,
        },
        created_at: profile.created_at
      } as User;
    }

    const res = await fetch('/api/auth/profile', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId, ...data })
    });
    if (!res.ok) throw new Error('Failed to update profile');
    const responseData = await res.json();
    return responseData.user as User;
  },

  // --- OUTFIT SERVICES ---
  async getOutfits() {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('outfits')
          .select('*');

        if (!error && data && data.length > 0) {
          return data.map(item => ({
            id: item.id,
            name: item.name,
            category: item.category,
            gender: item.gender,
            color: item.color,
            hex: item.hex,
            imageUrl: item.image_url,
            style: item.style,
            fit: item.fit,
            tags: item.tags || []
          })) as Outfit[];
        }
      } catch (e) {
        console.warn('⚠️ Supabase error on "getOutfits", falling back to local memory:', e);
      }
    }

    const res = await fetch('/api/db/outfits');
    if (!res.ok) throw new Error('Failed to load outfits catalog');
    return await res.json() as Outfit[];
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
    // 1. Core Gemini AI model execution always runs on the server (handles secure AI environment)
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

    // 2. Log Result rows securely into Supabase database if active
    if (isSupabaseConfigured() && params.userId) {
      try {
        await supabase.from('tryon_history').insert({
          user_id: params.userId,
          image_before: params.imageBefore || data.tryon.imageBefore || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600',
          image_after: data.tryon.imageAfter || 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600',
          category: params.category,
          style: data.tryon.style || 'AI Interactive',
          gender: params.gender,
          body_type: params.bodyType,
          fit: data.tryon.fit || 'regular',
          fashion_score: Number(data.tryon.fashionScore || 85),
          caption: data.tryon.caption || 'Synthesized virtual fitting coordinate.'
        });
      } catch (dbErr) {
        console.warn('⚠️ Could not archive Tryon into database records:', dbErr);
      }
    }

    return data as {
      tryon: TryonHistory;
      analysis: string;
      fitSuggestion: string;
      matchingColors: Array<{ name: string; hex: string; desc: string }>;
      apiBusy?: boolean;
    };
  },

  async getTryonHistory(userId: string) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('tryon_history')
          .select('*')
          .eq('user_id', userId)
          .order('timestamp', { ascending: false });

        if (error) throw error;
        return (data || []).map(item => ({
          id: item.id,
          userId: item.user_id,
          imageBefore: item.image_before,
          imageAfter: item.image_after,
          category: item.category,
          style: item.style,
          gender: item.gender,
          bodyType: item.body_type,
          fit: item.fit,
          fashionScore: item.fashion_score,
          caption: item.caption,
          timestamp: item.timestamp
        })) as TryonHistory[];
      } catch (e: any) {
        console.warn('⚠️ Supabase error in getTryonHistory, falling back to local Express history:', e.message || e);
      }
    }

    try {
      const res = await fetch(`/api/tryon/history/${userId}`, {
        headers: getHeaders()
      });
      if (res.ok) {
        return await res.json() as TryonHistory[];
      }
    } catch (fetchErr) {
      console.warn('Local history API failed:', fetchErr);
    }
    return [] as TryonHistory[];
  },

  async clearTryonHistory(userId: string) {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('tryon_history')
          .delete()
          .eq('user_id', userId);
        if (error) throw error;
        return { success: true };
      } catch (e: any) {
        console.warn('⚠️ Supabase error in clearTryonHistory, falling back to local Express deletion:', e.message || e);
      }
    }

    try {
      const res = await fetch(`/api/tryon/history/${userId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (fetchErr) {
      console.warn('Local history clear API failed:', fetchErr);
    }
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
    // Generate AI recommendations on backend (uses secure server-side Gemini SDK key)
    const res = await fetch('/api/recommend', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Smart recommendations failed to build');
    const recommendation = await res.json() as Recommendation;

    // Log the generated output details directly in the user recommendations table
    if (isSupabaseConfigured() && params.userId) {
      try {
        await supabase.from('recommendations').insert({
          user_id: params.userId,
          skin_tone: recommendation.skinTone || params.skinTone,
          gender: recommendation.gender || params.gender,
          occasion: recommendation.occasion || params.occasion,
          trends: recommendation.trends || [],
          matching_colors: recommendation.matchingColors || [],
          avoid_colors: recommendation.avoidColors || [],
          suggested_styles: recommendation.suggestedStyles || []
        });
      } catch (dbErr) {
        console.warn('⚠️ Could not lock smart recommendation row to database:', dbErr);
      }
    }

    return recommendation;
  },

  async getStoredRecommendations(userId: string) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('recommendations')
          .select('*')
          .eq('user_id', userId)
          .order('timestamp', { ascending: false });

        if (error) throw error;
        return (data || []).map(item => ({
          id: item.id,
          userId: item.user_id,
          skinTone: item.skin_tone,
          gender: item.gender,
          occasion: item.occasion,
          trends: item.trends || [],
          matchingColors: item.matching_colors || [],
          avoidColors: item.avoid_colors || [],
          suggestedStyles: item.suggested_styles || [],
          timestamp: item.timestamp
        })) as Recommendation[];
      } catch (e: any) {
        console.warn('⚠️ Supabase error in getStoredRecommendations, falling back to local Express records:', e.message || e);
      }
    }

    try {
      const res = await fetch(`/api/db/recommendations/${userId}`, {
        headers: getHeaders()
      });
      if (res.ok) {
        return await res.json() as Recommendation[];
      }
    } catch (fetchErr) {
      console.warn('Local recommendations API failed:', fetchErr);
    }
    return [] as Recommendation[];
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
      headers: getHeaders(),
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Body fit suggestion generation failed');
    return await res.json() as BodyFitSuggestion;
  },

  async getStoredBodyFit(userId: string) {
    const res = await fetch(`/api/bodyfit/${userId}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch sizing check');
    return await res.json() as BodyFitSuggestion[];
  },

  // --- SAVED LOOKS (FAVORITES) ---
  async getSavedLooks(userId: string) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('saved_looks')
          .select('*')
          .eq('user_id', userId)
          .order('timestamp', { ascending: false });

        if (error) throw error;
        return (data || []).map(item => ({
          id: item.id,
          userId: item.user_id,
          title: item.title,
          description: item.description,
          category: item.category,
          imageBefore: item.image_before,
          imageAfter: item.image_after,
          fashionScore: item.fashion_score,
          tags: item.tags || [],
          caption: item.caption,
          timestamp: item.timestamp
        })) as SavedLook[];
      } catch (e: any) {
        console.warn('⚠️ Supabase error in getSavedLooks, falling back to local Express saved looks:', e.message || e);
      }
    }

    try {
      const res = await fetch(`/api/db/saved_looks/${userId}`, {
        headers: getHeaders()
      });
      if (res.ok) {
        return await res.json() as SavedLook[];
      }
    } catch (fetchErr) {
      console.warn('Local saved looks get API failed:', fetchErr);
    }
    return [] as SavedLook[];
  },

  async saveLook(look: Omit<SavedLook, 'id' | 'timestamp'>) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('saved_looks')
          .insert({
            user_id: look.userId,
            title: look.title,
            description: look.description,
            category: look.category,
            image_before: look.imageBefore,
            image_after: look.imageAfter,
            fashion_score: Number(look.fashionScore || 80),
            tags: look.tags || [],
            caption: look.caption || ''
          })
          .select()
          .single();

        if (error) throw error;
        return {
          id: data.id,
          userId: data.user_id,
          title: data.title,
          description: data.description,
          category: data.category,
          imageBefore: data.image_before,
          imageAfter: data.image_after,
          fashionScore: data.fashion_score,
          tags: data.tags || [],
          caption: data.caption,
          timestamp: data.timestamp
        } as SavedLook;
      } catch (e: any) {
        console.warn('⚠️ Supabase error in saveLook, falling back to local Express saved looks creation:', e.message || e);
      }
    }

    const res = await fetch('/api/db/saved_looks', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(look)
    });
    if (!res.ok) throw new Error('Failed to pin look to boards');
    return await res.json() as SavedLook;
  },

  async deleteLook(id: string, userId: string) {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('saved_looks')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);
        if (error) throw error;
        return { success: true };
      } catch (e: any) {
        console.warn('⚠️ Supabase error in deleteLook, falling back to local Express deletion:', e.message || e);
      }
    }

    const res = await fetch(`/api/db/saved_looks/${id}?userId=${userId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to wipe look from history');
    return await res.json();
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
