import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useApp } from '../context/AppContext.js';
import { Cpu, Sparkles, User, KeyRound, Mail, ArrowLeft, Heart, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const { addToast, setActiveTab } = useApp();

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'men' | 'women'>('women');
  const [favoriteStyle, setFavoriteStyle] = useState('streetwear');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validations
  const validateAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Minimum field verification
    if (!name.trim()) {
      addToast('Please specify a screen name for your style card.', 'error');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      addToast('Please enter a valid email address.', 'error');
      return;
    }
    if (!password) {
      addToast('Password credentials cannot be blank.', 'error');
      return;
    }

    // 2. Minimum length check
    if (password.length < 6) {
      addToast('Password must be at least 6 characters.', 'error');
      return;
    }

    setLoading(true);

    try {
      await register(email, password, name, gender, favoriteStyle);
      addToast(`Welcome to FitVerse AI, ${name}! Your style ledger is ready.`, 'success');
      setActiveTab('tryon');
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('taken') || msg.toLowerCase().includes('already exists')) {
        addToast('Email already registered. Try signing in or use another email.', 'error');
      } else if (msg.toLowerCase().includes('weak-password') || msg.toLowerCase().includes('password too short') || msg.toLowerCase().includes('at least 6')) {
        addToast('Password too short. Specify at least 6 characters.', 'error');
      } else if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('failed to fetch')) {
        addToast('Network issue detected. Please check your internet connection.', 'error');
      } else {
        addToast(err.message || 'Registration rejected by cybersecurity gateway.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-16 min-h-screen text-slate-100 flex items-center justify-center animate-fadeIn relative overflow-hidden" id="register_page_view">
      
      {/* Absolute background visual flares */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-pink-500/5 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none z-0" />

      <div className="max-w-md w-full court-glass rounded-3xl p-8 relative overflow-hidden shadow-2xl space-y-7 m-4 border border-white/10 z-10 backdrop-blur-xl">
        
        {/* Navigation back and header */}
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <button 
            type="button"
            onClick={() => setActiveTab('login')}
            className="flex items-center gap-1 text-[10px] font-mono uppercase text-pink-400 hover:text-pink-300 transition-colors font-bold cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Client Sign In
          </button>
          
          <div className="flex items-center gap-1.5 px-3 py-1 bg-pink-500/10 border border-pink-400/20 text-[8px] font-mono tracking-widest text-pink-300 uppercase rounded-full">
            <Sparkles className="w-3 h-3 text-pink-450 animate-pulse" /> FORGIER PORTAL
          </div>
        </div>

        {/* Brand identity */}
        <div className="text-center">
          <div className="w-11 h-11 bg-pink-500/10 border border-pink-400/30 rounded-2xl flex items-center justify-center text-pink-450 mx-auto mb-3 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.15)]">
            <Cpu className="w-5 h-5 text-pink-455" />
          </div>

          <span className="text-[9px] font-mono tracking-widest text-pink-400 uppercase font-black">
            FITVERSE COUTURE ACQUISITION
          </span>
          <h2 className="text-2xl font-serif font-black text-white tracking-tight mt-1">
            CREATIVE PROFILE SETUP
          </h2>
          <p className="text-xs text-rose-200/60 max-w-xs mx-auto mt-2 leading-relaxed font-sans">
            Acquire your digital credentials to locking custom wardrobe parameters, virtual fit scores & luxury trends.
          </p>
        </div>

        {/* Input Forms */}
        <form onSubmit={validateAndSubmit} className="space-y-4 text-xs">
          
          {/* Display Name Input */}
          <div>
            <label className="block text-[10px] font-mono text-pink-400 uppercase mb-1.5 flex items-center gap-1.5 font-bold">
              <User className="w-3.5 h-3.5 text-pink-400" /> Designer Screen Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aisha Kumar"
              className="w-full bg-zinc-950/60 border border-pink-500/10 p-3 rounded-2xl font-bold outline-none text-rose-100 focus:border-pink-500/30 focus:ring-4 focus:ring-pink-500/5 placeholder-rose-200/20 transition-all font-sans"
            />
          </div>

          {/* Email Address Input */}
          <div>
            <label className="block text-[10px] font-mono text-pink-400 uppercase mb-1.5 flex items-center gap-1.5 font-bold">
              <Mail className="w-3.5 h-3.5 text-pink-400" /> Virtual Mail Endpoint
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. stylecraft@domain.com"
              className="w-full bg-zinc-950/60 border border-pink-500/10 p-3 rounded-2xl font-bold outline-none text-rose-100 focus:border-pink-500/30 focus:ring-4 focus:ring-pink-500/5 placeholder-rose-200/20 transition-all font-sans"
            />
          </div>

          {/* Password Code Input with show/hide eye toggle */}
          <div>
            <label className="block text-[10px] font-mono text-pink-400 uppercase mb-1.5 flex items-center gap-1.5 font-bold">
              <KeyRound className="w-3.5 h-3.5 text-pink-400" /> Private Passcode Key
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full bg-zinc-950/60 border border-pink-500/10 p-3 pr-10 rounded-2xl text-rose-100 outline-none focus:border-pink-500/30 focus:ring-4 focus:ring-pink-500/5 placeholder-rose-200/20 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-pink-400 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Preference Selects */}
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-[10px] font-mono text-pink-400 uppercase mb-1.5 font-bold">Gender Fit</label>
              <select
                value={gender}
                onChange={(e: any) => setGender(e.target.value)}
                className="w-full bg-zinc-955 border border-pink-550/10 p-3 rounded-2xl text-rose-100 font-bold outline-none focus:border-pink-500/30 hover:border-pink-400/20 cursor-pointer"
              >
                <option value="women" className="bg-zinc-950 text-slate-100 font-sans">Women Profiles</option>
                <option value="men" className="bg-zinc-950 text-slate-100 font-sans">Men Profiles</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-pink-400 uppercase mb-1.5 font-bold">Primary Instinct</label>
              <select
                value={favoriteStyle}
                onChange={(e) => setFavoriteStyle(e.target.value)}
                className="w-full bg-zinc-955 border border-pink-550/10 p-3 rounded-2xl text-rose-100 font-bold outline-none focus:border-pink-500/30 hover:border-pink-400/20 cursor-pointer"
              >
                <option value="streetwear" className="bg-zinc-950 text-slate-100 font-sans">Indian Streetwear</option>
                <option value="casual" className="bg-zinc-950 text-slate-100 font-sans">Casual Couture</option>
                <option value="formal" className="bg-zinc-950 text-slate-100 font-sans">Luxury Traditional</option>
              </select>
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white font-bold text-xs tracking-widest uppercase rounded-3xl hover:brightness-110 active:scale-97 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-pink-900/35 border border-pink-400/20 mt-3"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Heart className="w-4 h-4 text-white" />
                CREATE DESIGNER PASS
              </>
            )}
          </button>
        </form>

        {/* Navigation bottom */}
        <div className="text-center border-t border-white/5 pt-5 flex flex-col gap-2">
          <p className="text-[10px] text-stone-400">
            Already registered on our fashion ledger?
          </p>
          <button
            onClick={() => setActiveTab('login')}
            className="text-[10px] font-mono uppercase tracking-widest font-bold text-pink-400 hover:text-pink-300 transition-colors cursor-pointer"
          >
            RETURN & CERTIFY KEYCARD
          </button>
        </div>

      </div>
    </div>
  );
}
