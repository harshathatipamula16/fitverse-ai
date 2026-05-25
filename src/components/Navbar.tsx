import { useState } from 'react';
import { useApp } from '../context/AppContext.js';
import { Menu, X, Sparkles, MessageSquare, LogIn, LogOut, Heart, Activity } from 'lucide-react';

export default function Navbar() {
  const { activeTab, setActiveTab, user, logoutUser, chatOpen, setChatOpen } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Home' },
    { id: 'tryon', label: 'AI Try-On', icon: Sparkles },
    { id: 'recommendations', label: 'Recommendations' },
    { id: 'occasion', label: 'Occasion' },
    { id: 'bodyfit', label: 'Body Fit' },
    { id: 'saved', label: 'Saved Looks', icon: Heart },
    { id: 'dashboard', label: 'Dashboard', icon: Activity }
  ];

  return (
    <nav className="fixed top-0 inset-x-0 z-40 bg-white/75 backdrop-blur-xl border-b border-pink-200/40 shadow-md shadow-pink-100/20" id="main_navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 border-b border-pink-100/5">
          
          {/* Logo Brand in vogue display style */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('home')} id="navbar_brand">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-pink-600 flex items-center justify-center shadow-[0_4px_14px_rgba(255,79,163,0.3)] group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-bold font-display tracking-widest bg-gradient-to-r from-stone-900 via-pink-600 to-rose-600 bg-clip-text text-transparent group-hover:brightness-110 transition-all font-display uppercase">
                FITVERSE <span className="text-pink-500 font-serif italic normal-case">Couture</span>
              </span>
              <p className="text-[8px] font-mono tracking-widest text-pink-500/80 uppercase font-semibold">LUXURY RUNWAY HUB</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 bg-pink-100/30 p-1.5 rounded-full border border-pink-200/50 backdrop-blur-md" id="desktop_nav_links">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm shadow-pink-300/50 border border-pink-400/30'
                      : 'text-stone-700 hover:text-pink-600 hover:bg-white/80'
                  }`}
                  id={`nav_btn_${item.id}`}
                >
                  <span className="flex items-center gap-1.5">
                    {item.icon && <item.icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-pink-500'}`} />}
                    {item.label}
                  </span>
                </button>
              );
            })}


          </div>

          {/* Desktop Session Controls */}
          <div className="hidden lg:flex items-center gap-3" id="desktop_session_controls">
            {/* Toggle AI Copilot */}
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className={`p-2.5 rounded-xl border transition-all duration-300 flex items-center justify-center relative cursor-pointer ${
                chatOpen
                  ? 'bg-pink-100 border-pink-400 text-pink-600 shadow-[0_4px_15px_rgba(255,79,163,0.15)]'
                  : 'bg-white border-pink-200 text-stone-750 hover:text-pink-600 hover:border-pink-400'
              }`}
              title="Toggle AI Fashion Assistant"
              id="navbar_chat_toggle"
            >
              <MessageSquare className="w-5 h-5" />
              {!chatOpen && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pink-500"></span>
                </span>
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-pink-200/50">
                <div
                  className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-200/80 flex items-center justify-center text-xs font-mono font-bold text-pink-600 tracking-wider shadow-inner cursor-pointer hover:border-pink-400 transition-colors"
                  onClick={() => setActiveTab('dashboard')}
                  title="View Studio Dashboard"
                >
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <button
                  onClick={logoutUser}
                  className="px-4 py-2 border border-pink-100 hover:border-pink-200 text-xs font-semibold tracking-wide text-stone-500 hover:text-red-600 hover:bg-red-50/50 rounded-xl transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
                  id="navbar_logout_btn"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('login')}
                className="px-5 py-2.5 z-10 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white font-bold text-xs tracking-wider uppercase rounded-xl shadow-md shadow-pink-200 hover:shadow-pink-300 hover:brightness-110 active:scale-95 transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
                id="navbar_login_btn"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Right Controls */}
          <div className="flex lg:hidden items-center gap-3">
            {/* Chat button for mobile */}
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className={`p-2 rounded-lg border text-pink-600 cursor-pointer ${
                chatOpen ? 'bg-pink-100 border-pink-400' : 'bg-white border-pink-200'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
            </button>

            {/* Hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 bg-white border border-pink-200 rounded-lg text-stone-700 hover:text-pink-600 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-pink-250 pb-4 px-4 py-4 space-y-3 shadow-lg" id="mobile_navbar_drawer">
          <div className="flex flex-col gap-2">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold flex items-center gap-2 ${
                    isActive
                      ? 'bg-pink-50 border-pink-300 text-pink-600'
                      : 'bg-stone-50 border-transparent text-stone-700 hover:text-pink-600'
                  }`}
                >
                  {item.icon && <item.icon className="w-4 h-4 text-pink-500" />}
                  {item.label}
                </button>
              );
            })}


          </div>

          <div className="pt-4 border-t border-pink-100 flex flex-col gap-3">
            {user ? (
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => {
                    setActiveTab('dashboard');
                    setMobileMenuOpen(false);
                  }}
                >
                  <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center font-mono font-bold text-pink-600 border border-pink-200">
                    {user.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-stone-800">{user.name}</p>
                    <p className="text-xs text-stone-500">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logoutUser();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-2 bg-red-55/80 text-red-650 border border-red-200 text-xs rounded-xl flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setActiveTab('login');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                Sign In to Studio
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
