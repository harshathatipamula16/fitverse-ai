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

export const isSupabaseConfigured = (): boolean => {
  const url = (import.meta as any).env.VITE_SUPABASE_URL;
  const key = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;
  return !!(url && key && url !== 'MY_API_KEY' && key !== 'MY_API_KEY' && !url.includes('placeholder'));
};

export async function registerUser(
  email: string,
  pass: string,
  name: string,
  gender?: string,
  favoriteStyle?: string
): Promise<{ user: User; token: string }> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: { name, gender, favoriteStyle }
        }
      });

      if (error) {
        throw new Error(error.message || 'Supabase authentication registration failed');
      }

      if (data.user) {
        // Safe profile row insertion
        try {
          await supabase.from('users').insert({
            id: data.user.id,
            email,
            name,
            gender: gender || 'women',
            style_preference: favoriteStyle || 'streetwear'
          });
        } catch (profileErr: any) {
          console.warn('⚠️ profile sync bypassed or failed:', profileErr.message);
        }

        const registeredUser: User = {
          id: data.user.id,
          email: data.user.email || email,
          name,
          gender: gender || 'women',
          created_at: data.user.created_at || new Date().toISOString(),
          preferences: {
            style: favoriteStyle
          }
        };

        const token = data.session?.access_token || 'supabase_token_placeholder';
        localStorage.setItem('fitverse_token', token);
        return { user: registeredUser, token };
      }
    } catch (err: any) {
      console.error('[Supabase Register Error]', err);
      throw err;
    }
  }

  // Graceful local backend / simulated api fallback
  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass, name, gender, favoriteStyle })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Simulated signup failed');
    }
    const result = await res.json();
    
    // Save token
    localStorage.setItem('fitverse_token', result.token);
    
    // Supplement object details
    const finalUser: User = {
      ...result.user,
      gender: gender || result.user.gender,
      preferences: {
        style: favoriteStyle || result.user.preferences?.style
      }
    };
    return { user: finalUser, token: result.token };
  } catch (err: any) {
    console.error('[Local Sign-Up Fallback Engine]', err);
    throw new Error(err.message || 'Underlying authentication system failure');
  }
}

export async function loginUser(email: string, pass: string): Promise<{ user: User; token: string }> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass
      });

      if (error) {
        throw new Error(error.message || 'Supabase match credentials failed');
      }

      if (data.user) {
        let profile: any = null;
        try {
          const { data: p } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();
          profile = p;
        } catch (pErr) {
          console.warn('Could not query public.users info from db directly:', pErr);
        }

        const userObj: User = {
          id: data.user.id,
          email: data.user.email || email,
          name: profile?.name || data.user.user_metadata?.name || 'Explorer',
          gender: profile?.gender || data.user.user_metadata?.gender || 'women',
          bodyType: profile?.body_type,
          height: profile?.height ? Number(profile.height) : undefined,
          weight: profile?.weight ? Number(profile.weight) : undefined,
          preferences: {
            style: profile?.style_preference || data.user.user_metadata?.favoriteStyle,
            colors: profile?.favorite_colors,
          },
          created_at: profile?.created_at || data.user.created_at || new Date().toISOString()
        };

        const token = data.session?.access_token || 'supabase_token_placeholder';
        localStorage.setItem('fitverse_token', token);
        return { user: userObj, token };
      }
    } catch (err: any) {
      console.warn('[Supabase Login Alert] Incorrect credentials or user not found. Throwing clean error.');
      throw new Error('Invalid login credentials');
    }
  }

  // Graceful simulated endpoint fallback
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Invalid credentials');
    }
    const result = await res.json();
    localStorage.setItem('fitverse_token', result.token);
    return result;
  } catch (err: any) {
    console.error('[Local Login Fallback Engine]', err);
    throw new Error(err.message || 'Authentication code not recognized.');
  }
}

export async function logoutUser(): Promise<void> {
  try {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
  } catch (err) {
    console.warn('Supabase logout signout skipped:', err);
  } finally {
    localStorage.removeItem('fitverse_token');
  }
}

export async function getCurrentUser(): Promise<User | null> {
  if (isSupabaseConfigured()) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        let profile: any = null;
        try {
          const { data: p } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          profile = p;
        } catch (dbErr) {
          console.warn('Profile read unsuccessful:', dbErr);
        }

        return {
          id: session.user.id,
          email: session.user.email || '',
          name: profile?.name || session.user.user_metadata?.name || 'Explorer',
          gender: profile?.gender || session.user.user_metadata?.gender || 'women',
          bodyType: profile?.body_type,
          height: profile?.height ? Number(profile.height) : undefined,
          weight: profile?.weight ? Number(profile.weight) : undefined,
          preferences: {
            style: profile?.style_preference || session.user.user_metadata?.favoriteStyle,
            colors: profile?.favorite_colors,
          },
          created_at: profile?.created_at || session.user.created_at || new Date().toISOString()
        } as User;
      }
    } catch (err) {
      console.warn('Supabase getSession error:', err);
    }
  }

  // Fallback lookups
  const token = localStorage.getItem('fitverse_token');
  if (!token) return null;

  try {
    const res = await fetch('/api/auth/session', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (res.ok) {
      const result = await res.json();
      return result.user;
    }
  } catch (err) {
    console.warn('Local session auth check failed:', err);
  }

  return null;
}

export async function resetPassword(email: string): Promise<void> {
  if (isSupabaseConfigured()) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    });
    if (error) {
      throw new Error(error.message);
    }
    return;
  }

  // Simulated validation reset
  if (!email.includes('@')) {
    throw new Error('Please specify a valid email syntax.');
  }
  return new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });
}
