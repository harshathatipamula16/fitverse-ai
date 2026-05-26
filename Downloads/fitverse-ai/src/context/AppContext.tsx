import { createContext, useContext, useState, useEffect, ReactNode, useTransition } from 'react';
import { api, User } from '../services/api.js';

export interface ToastType {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextProps {
  user: User | null;
  loading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  toasts: ToastType[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  loginUser: (email: string, pass: string) => Promise<void>;
  registerUser: (email: string, pass: string, name: string) => Promise<void>;
  logoutUser: () => void;
  syncProfile: (gender: string, bodyType: string, height: number, weight: number, style: string, colors: string[], fit: string) => Promise<void>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

const defaultGuestUser: User = {
  id: 'guest_user_id',
  email: 'guest.critic@fitverse.com',
  name: 'Couture Curator',
  gender: 'women',
  bodyType: 'hourglass',
  height: 168,
  weight: 58,
  preferences: {
    style: 'modernist',
    colors: ['#000000', '#ec4899'],
    fit: 'regular'
  },
  created_at: new Date().toISOString()
};

const getLocalProfile = (): User => {
  try {
    const raw = localStorage.getItem('fitverse_guest_profile');
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultGuestUser;
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getLocalProfile());
  const [loading, setLoading] = useState(false); // No initial authentication loading
  const [activeTab, setActiveTabState] = useState('home');
  const [chatOpen, setChatOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const [, startTransition] = useTransition();

  const setActiveTab = (tab: string) => {
    startTransition(() => {
      setActiveTabState(tab);
    });
  };

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto purge toast after 4s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loginUser = async (email: string, pass: string) => {
    // Elegant simulation of local login / style preference locking
    const mockUser: User = {
      ...getLocalProfile(),
      email,
      name: email.split('@')[0] || 'Couture Critic'
    };
    localStorage.setItem('fitverse_guest_profile', JSON.stringify(mockUser));
    setUser(mockUser);
    addToast(`Logged in successfully as ${mockUser.name}!`, 'success');
    setActiveTab('home');
  };

  const registerUser = async (email: string, pass: string, name: string) => {
    const mockUser: User = {
      ...getLocalProfile(),
      email,
      name
    };
    localStorage.setItem('fitverse_guest_profile', JSON.stringify(mockUser));
    setUser(mockUser);
    addToast(`Welcome to FitVerse AI, ${name}! Your style journey starts now.`, 'success');
    setActiveTab('home');
  };

  const logoutUser = () => {
    // Mock logout triggers default profile restoration
    localStorage.setItem('fitverse_guest_profile', JSON.stringify(defaultGuestUser));
    setUser(defaultGuestUser);
    addToast('Authentication session revoked. Restored Couture Guest Account!', 'info');
    setActiveTab('home');
  };

  const syncProfile = async (
    gender: string,
    bodyType: string,
    height: number,
    weight: number,
    style: string,
    colors: string[],
    fit: string
  ) => {
    try {
      const current = getLocalProfile();
      const updatedProfile = await api.updateProfile(current.id, {
        gender,
        bodyType,
        height,
        weight,
        style,
        colors,
        fit
      });
      setUser(updatedProfile);
      addToast('Body profile metrics synced to custom styling engine!', 'success');
    } catch (err) {
      addToast('Could not save choices to custom profile.', 'error');
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        activeTab,
        setActiveTab,
        chatOpen,
        setChatOpen,
        toasts,
        addToast,
        removeToast,
        loginUser,
        registerUser,
        logoutUser,
        syncProfile
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be paired underneath AppProvider');
  return context;
}
