import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  registerUser, 
  loginUser, 
  logoutUser, 
  getCurrentUser, 
  resetPassword 
} from '../services/auth.js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  register: (email: string, pass: string, name: string, gender?: string, favoriteStyle?: string) => Promise<User>;
  logout: () => Promise<void>;
  resetUserPassword: (email: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  updateUserLocal: (updated: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    try {
      const u = await getCurrentUser();
      setUser(u);
    } catch (err) {
      console.error('[Session Retrieval Issue]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const login = async (email: string, pass: string): Promise<User> => {
    setLoading(true);
    try {
      // Input verification
      if (!email || !email.includes('@')) {
        throw new Error('Please specify a valid email address.');
      }
      if (!pass || pass.length < 6) {
        throw new Error('Secret keycode must be at least 6 characters.');
      }
      const response = await loginUser(email, pass);
      setUser(response.user);
      return response.user;
    } catch (err: any) {
      console.error('[AuthContext Login Failure]', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    pass: string,
    name: string,
    gender?: string,
    favoriteStyle?: string
  ): Promise<User> => {
    setLoading(true);
    try {
      if (!name.trim()) {
        throw new Error('Display screen name is required.');
      }
      if (!email || !email.includes('@')) {
        throw new Error('Please specify a valid email address.');
      }
      if (!pass || pass.length < 6) {
        throw new Error('Secret keycode must register at least 6 characters.');
      }
      const response = await registerUser(email, pass, name, gender, favoriteStyle);
      setUser(response.user);
      return response.user;
    } catch (err: any) {
      console.error('[AuthContext Registration Failure]', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
    } catch (err) {
      console.error('[AuthContext Logout Failure]', err);
    } finally {
      setLoading(false);
    }
  };

  const resetUserPassword = async (email: string) => {
    try {
      await resetPassword(email);
    } catch (err: any) {
      console.error('[AuthContext Reset Password Failure]', err);
      throw err;
    }
  };

  const updateUserLocal = (updated: User) => {
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        resetUserPassword,
        refreshSession,
        updateUserLocal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be called underneath AuthProvider wrapper.');
  }
  return context;
}
