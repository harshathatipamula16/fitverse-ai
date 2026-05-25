import { createContext, useContext, useState, useEffect, ReactNode, useTransition } from 'react';
import { api, User } from '../services/api.js';
import { useAuth } from './AuthContext.js';

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

export function AppProvider({ children }: { children: ReactNode }) {
  const { user, loading, login, register, logout, updateUserLocal } = useAuth();
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
    try {
      const u = await login(email, pass);
      addToast(`Logged in successfully as ${u.name}!`, 'success');
      setActiveTab('home');
    } catch (err: any) {
      addToast(err.message || 'Verification failed. Double check your credentials.', 'error');
      throw err;
    }
  };

  const registerUser = async (email: string, pass: string, name: string) => {
    try {
      const u = await register(email, pass, name);
      addToast(`Welcome to FitVerse AI, ${name}! Your style journey starts now.`, 'success');
      setActiveTab('home');
    } catch (err: any) {
      addToast(err.message || 'Account registration failed.', 'error');
      throw err;
    }
  };

  const logoutUser = async () => {
    await logout();
    addToast('Authentication session revoked. Have a stylish day!', 'info');
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
    if (!user) {
      addToast('Authenticate to lock your sizing choices.', 'error');
      return;
    }
    try {
      const updated = await api.updateProfile(user.id, {
        gender,
        bodyType,
        height,
        weight,
        style,
        colors,
        fit
      });
      updateUserLocal(updated);
      addToast('Body profile metrics synced to cyber ledger!', 'success');
    } catch (err) {
      addToast('Could not save choices to cloud profile.', 'error');
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
