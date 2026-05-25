import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useApp } from '../context/AppContext.js';
import { Cpu, Sparkles, Key, KeyRound, Mail, Eye, EyeOff, HelpCircle } from 'lucide-react';

export default function Login() {
  const { login, resetUserPassword } = useAuth();
  const { addToast, setActiveTab } = useApp();

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);

  // Validate inputs and process sign in
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !email.includes('@')) {
      addToast('Please specify a valid email address.', 'error');
      return;
    }
    if (!password) {
      addToast('Password field is empty.', 'error');
      return;
    }
    if (password.length < 6) {
      addToast('Secret keycode must be at least 6 characters.', 'error');
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      addToast('Access certified. Welcome back to the digital runway!', 'success');
      setActiveTab('tryon');
    } catch (err: any) {
      const msg = err.message || '';
      if (
        msg.toLowerCase().includes('invalid grant') ||
        msg.toLowerCase().includes('invalid login') ||
        msg.toLowerCase().includes('invalid credentials') ||
        msg.toLowerCase().includes('mfa') ||
        msg.toLowerCase().includes('not match')
      ) {
        addToast('Invalid credentials. If you are new, try forging a free access token below!', 'error');
      } else if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('failed to fetch')) {
        addToast('Network issue detected. Check connection ledger.', 'error');
      } else {
        addToast(err.message || 'Verification rejected. Access code invalid.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Process Forgot Password Flow
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !email.includes('@')) {
      addToast('Please enter a valid email address first.', 'error');
      return;
    }

    setLoading(true);

    try {
      await resetUserPassword(email);
      addToast(`Instruction key successfully beamed to ${email}!`, 'success');
      setForgotPasswordMode(false);
    } catch (err: any) {
      addToast(err.message || 'Password reset request denied. Check connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-16 min-h-screen text-slate-100 flex items-center justify-center animate-fadeIn relative overflow-hidden" id="login_page_view">
      
      {/* Absolute background elegant visual elements */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-pink-500/5 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none z-0" />

      <div className="max-w-md w-full court-glass rounded-3xl p-8 relative overflow-hidden shadow-2xl space-y-7 m-4 border border-white/10 z-10 backdrop-blur-xl">
        
        {/* Top visual brand banner */}
        <div className="text-center">
          <div className="w-12 h-12 bg-pink-500/10 border border-pink-400/30 rounded-2xl flex items-center justify-center text-pink-400 mx-auto mb-4 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.15)]">
            <Cpu className="w-5.5 h-5.5 text-pink-300" />
          </div>

          <span className="text-[10px] font-mono tracking-widest text-pink-450 uppercase font-bold">
            FITVERSE ACCESS SIGNATURE
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-white tracking-tight mt-1 uppercase">
            {forgotPasswordMode ? 'RECOVER DECK' : 'STUDIO KEYCARD'}
          </h2>
          <p className="text-xs text-rose-200/65 max-w-xs mx-auto mt-2 leading-relaxed font-sans">
            {forgotPasswordMode 
              ? 'Provide your registered mail to authorize an offline recovery key linkage.'
              : 'Authenticate your credentials to preserve sizing configurations across the luxury dashboard.'
            }
          </p>
        </div>

        {forgotPasswordMode ? (
          /* Forgot Password Interface */
          <form onSubmit={handleForgotPassword} className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] font-mono text-pink-400/80 uppercase mb-2 flex items-center gap-1.5 font-bold">
                <Mail className="w-3.5 h-3.5 text-pink-400" /> Registered Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. fashiondesigner@gmail.com"
                className="w-full bg-zinc-950/60 border border-pink-500/10 p-3.5 rounded-2xl font-bold outline-none text-rose-100 focus:border-pink-500/30 focus:ring-4 focus:ring-pink-500/5 placeholder-rose-200/20 transition-all font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white font-bold text-xs tracking-widest uppercase rounded-3xl hover:brightness-110 active:scale-97 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-pink-900/40 border border-pink-400/20 mt-2"
            >
              {loading ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <HelpCircle className="w-4 h-4 text-white" />
              )}
              REQUEST ACCOUNT RECOVERY
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setForgotPasswordMode(false)}
                className="text-[9.5px] font-mono text-stone-350 hover:text-pink-400 uppercase tracking-widest transition-colors font-bold cursor-pointer"
              >
                ◀ RETREAT SIGN IN
              </button>
            </div>
          </form>
        ) : (
          /* Main Authentication Sign In Interface */
          <form onSubmit={handleAuth} className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] font-mono text-pink-400/80 uppercase mb-2 flex items-center gap-1.5 font-bold">
                <Mail className="w-3.5 h-3.5 text-pink-400" /> email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. styleseeker@domain.com"
                className="w-full bg-zinc-955 border border-pink-500/10 p-3.5 rounded-2xl font-bold outline-none text-rose-100 focus:border-pink-500/30 focus:ring-4 focus:ring-pink-500/5 placeholder-rose-200/20 transition-all font-sans"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-mono text-pink-400/80 uppercase flex items-center gap-1.5 font-bold">
                  <KeyRound className="w-3.5 h-3.5 text-pink-400" /> Password key
                </label>
                <button
                  type="button"
                  onClick={() => setForgotPasswordMode(true)}
                  className="text-[9px] font-mono text-pink-500 hover:text-pink-400 uppercase font-bold cursor-pointer"
                >
                  Forgot Key?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-zinc-955 border border-pink-500/10 p-3.5 pr-10 rounded-2xl text-rose-100 outline-none focus:border-pink-500/30 focus:ring-4 focus:ring-pink-500/5 placeholder-rose-200/20 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-pink-450 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white font-bold text-xs tracking-widest uppercase rounded-3xl hover:brightness-110 active:scale-97 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-pink-900/35 border border-pink-400/20 mt-3"
            >
              {loading ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Key className="w-4 h-4 text-white animate-bounce" />
              )}
              CERTIFY WORKSPACE KEY
            </button>
          </form>
        )}

        {/* Switch layout registration prompt */}
        {!forgotPasswordMode && (
          <div className="text-center border-t border-white/5 pt-5 flex flex-col gap-2">
            <p className="text-[10px] text-stone-400">
              New style voyager looking for private locker space?
            </p>
            <button
              onClick={() => setActiveTab('register')}
              className="text-[10px] font-mono uppercase tracking-widest font-bold text-pink-450 hover:text-pink-300 transition-colors cursor-pointer"
            >
              Forge Free ACCESS Token
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
