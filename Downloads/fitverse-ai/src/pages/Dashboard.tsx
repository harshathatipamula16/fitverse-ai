import { useEffect, useState, useTransition } from 'react';
import { useApp } from '../context/AppContext.js';
import { api, TryonHistory, SavedLook, Recommendation } from '../services/api.js';
import { 
  Activity, User, Heart, Compass, Sparkles, Scale, Trash2, ShieldCheck, 
  HelpCircle, Calendar, RefreshCcw, Tag, UserPlus, Info, CheckCircle2,
  Sliders, ArrowUpRight, Award, Fingerprint
} from 'lucide-react';

export default function Dashboard() {
  const { user, setActiveTab, addToast } = useApp();
  const [history, setHistory] = useState<TryonHistory[]>([]);
  const [looks, setLooks] = useState<SavedLook[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  // Active sub-dashboard section tab
  const [activeSubTab, setActiveSubTab] = useState<'tryons' | 'favorites' | 'advice'>('tryons');

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([
        api.getTryonHistory(user.id),
        api.getSavedLooks(user.id),
        api.getStoredRecommendations(user.id)
      ])
        .then(([histData, looksData, recData]) => {
          setHistory(histData || []);
          setLooks(looksData || []);
          setRecommendations(recData || []);
        })
        .catch((err) => {
          console.error('Error in dashboard sync:', err);
        })
        .finally(() => {
          startTransition(() => {
            setLoading(false);
          });
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleClearHistory = async () => {
    if (!user) return;
    try {
      await api.clearTryonHistory(user.id);
      setHistory([]);
      addToast('History cleared successfully.', 'info');
    } catch (e) {
      addToast('Could not delete logs.', 'error');
    }
  };

  const handleDeleteLook = async (lookId: string) => {
    if (!user) return;
    try {
      await api.deleteLook(lookId, user.id);
      setLooks(prev => prev.filter(l => l.id !== lookId));
      addToast('Aesthetic ensemble discarded from your boards.', 'success');
    } catch (e) {
      addToast('Could not delete look.', 'error');
    }
  };

  if (!user) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center text-stone-800">
        <div className="max-w-md w-full bg-white border border-pink-200/80 rounded-3xl p-8 text-center space-y-6 shadow-sm shadow-pink-100">
          <div className="w-16 h-16 rounded-full bg-pink-50 border border-pink-300 flex items-center justify-center mx-auto shadow-sm shadow-pink-100">
            <User className="w-8 h-8 text-pink-500" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-black text-stone-900 tracking-widest uppercase italic">STUDIO LOCK</h2>
            <p className="text-xs text-stone-605 mt-2 leading-relaxed font-semibold">
              Authenticate your session token to access permanent try-on archives, saved Pinterest collections, and personalized color matching matrices.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('login')}
            className="w-full py-4.5 bg-gradient-to-r from-pink-550 via-rose-450 to-pink-600 text-white font-bold text-xs tracking-widest uppercase rounded-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-md shadow-pink-100 border border-pink-400/25"
          >
            Authenticate Profile Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 min-h-screen text-stone-800" id="dashboard_page_view">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        
        {/* Title & Cyber Header HUD */}
        <div className="border-b border-pink-100 pb-6 mb-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-100 border border-pink-300 text-[10px] font-mono font-bold uppercase tracking-wider text-pink-600 rounded-full mb-3 shadow-sm">
              <Activity className="w-3.5 h-3.5 text-pink-500 animate-pulse" /> COUTURE DESIGN LEDGER
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-black text-stone-900 tracking-tight capitalize">
              {user.name}&apos;s Runway Studio
            </h1>
            <p className="text-xs text-stone-505 mt-1 font-semibold">Review active custom fittings, cataloged styling grids, and color advice boards.</p>
          </div>
          <div className="text-[9px] font-mono text-stone-505 uppercase tracking-widest pl-3 border-l border-pink-200 font-bold">
            CONNECTION: SECURED VIA CLOUD INTEGRATION
          </div>
        </div>

        {/* Counts modules - Real-time animated stats widgets */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-pink-200 p-5 rounded-2xl relative overflow-hidden hover:border-pink-350 transition-all shadow-sm">
            <div className="absolute right-0 bottom-0 w-16 h-16 bg-pink-50 rounded-tl-full pointer-events-none" />
            <span className="text-[9px] font-mono text-pink-600 block tracking-wider font-bold">VIRTUAL TRYON RUNS</span>
            <span className="text-3xl font-bold font-display text-stone-850 mt-1 block">{history.length}</span>
          </div>
          <div className="bg-white border border-pink-200 p-5 rounded-2xl relative overflow-hidden hover:border-pink-350 transition-all shadow-sm">
            <div className="absolute right-0 bottom-0 w-16 h-16 bg-pink-50 rounded-tl-full pointer-events-none" />
            <span className="text-[9px] font-mono text-pink-600 block tracking-wider font-bold">PINNED DESIGNS</span>
            <span className="text-3xl font-bold font-display text-stone-850 mt-1 block">{looks.length}</span>
          </div>
          <div className="bg-white border border-pink-200 p-5 rounded-2xl relative overflow-hidden hover:border-pink-350 transition-all shadow-sm">
            <span className="text-[9px] font-mono text-pink-600 block tracking-wider font-bold">RECOMMENDATIONS DIGEST</span>
            <span className="text-3xl font-bold font-display text-stone-850 mt-1 block">{recommendations.length}</span>
          </div>
          <div className="bg-white border border-pink-200 p-5 rounded-2xl relative overflow-hidden hover:border-pink-350 transition-all shadow-sm">
            <span className="text-[9px] font-mono text-pink-600 block tracking-wider font-bold">SIZE ASSESS STATUS</span>
            <span className="text-[10px] font-bold text-pink-600 block mt-3 bg-pink-50 py-1 px-2.5 w-fit rounded-lg border border-pink-200 font-mono font-bold">
              {user.height ? 'CALIBRATED' : 'METRICS PENDING'}
            </span>
          </div>
        </div>

        {/* Layout Split: Luxury Sidebar navigation + Content panel */}
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Luxury Sizing Profile & Control Panel (Col Span 4) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-pink-200 rounded-3xl p-6 space-y-6 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 blur-[40px] pointer-events-none" />
              <h3 className="text-xs font-mono font-bold text-pink-600 uppercase tracking-widest flex items-center gap-1.5 border-b border-pink-100 pb-4">
                <Scale className="w-4 h-4 text-pink-500" />
                METRICS ACCOUNT
              </h3>

              {user.height ? (
                <div className="space-y-4 text-xs font-semibold">
                  <div className="flex justify-between items-center py-2.5 border-b border-pink-100">
                    <span className="text-stone-500 font-mono text-[9px] uppercase tracking-wider font-bold">Stature Height</span>
                    <span className="text-stone-800 font-bold">{user.height} cm</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-pink-100">
                    <span className="text-stone-500 font-mono text-[9px] uppercase tracking-wider font-bold">Frame Weight</span>
                    <span className="text-stone-800 font-bold">{user.weight} kg</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-pink-100">
                    <span className="text-stone-500 font-mono text-[9px] uppercase tracking-wider font-bold">Body Shape</span>
                    <span className="text-pink-600 font-bold font-mono uppercase">{user.bodyType}</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-pink-100">
                    <span className="text-stone-500 font-mono text-[9px] uppercase tracking-wider font-bold">Fit Style Preference</span>
                    <span className="text-pink-600 font-bold font-mono capitalize">{user.preferences?.fit || 'regular fit'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-pink-100">
                    <span className="text-stone-500 font-mono text-[9px] uppercase tracking-wider font-bold">Design Palette</span>
                    <span className="text-stone-805 font-bold font-mono capitalize">{user.preferences?.style || 'streetwear'}</span>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => setActiveTab('bodyfit')}
                      className="w-full py-3.5 bg-pink-50 hover:bg-pink-100 border border-pink-150 font-bold text-[10px] font-mono uppercase tracking-widest rounded-xl text-pink-600 transition-all cursor-pointer text-center shadow-sm"
                    >
                      CALIBRATE FIT CONTROLS
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <Fingerprint className="w-10 h-10 text-pink-400 mx-auto animate-pulse" />
                  <p className="text-xs text-stone-500 leading-relaxed max-w-xs mx-auto font-medium">
                    No physical matrix credentials set up on this brand profile. Set up with our easy slider ruler.
                  </p>
                  <button
                    onClick={() => setActiveTab('bodyfit')}
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-455 text-xs font-bold rounded-xl text-white transition-all cursor-pointer tracking-widest uppercase font-mono shadow-sm border border-pink-400/25"
                  >
                    Set Sizing Matrix
                  </button>
                </div>
              )}
            </div>

            {/* Quick Tips */}
            <div className="bg-pink-50/50 border border-pink-150 rounded-3xl p-6 text-xs text-stone-705 leading-relaxed relative flex gap-3 shadow-inner">
              <span className="text-lg">💡</span>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-pink-600 block mb-1 font-bold">RUNWAY PROTOCOL</span>
                Pin looks inside the main directory and trigger the AI Virtual Tryon parameters to dynamically record and save visual mocks.
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Tabbed Workspace Content (Col Span 8) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-pink-200 rounded-3xl p-6 relative shadow-sm">
              
              {/* Menu Tabs Navigation - Luxury Barbiecore Selection Ribbon */}
              <div className="flex flex-wrap border-b border-pink-100 pb-4 mb-6 gap-6">
                <button
                  onClick={() => setActiveSubTab('tryons')}
                  className={`text-xs font-mono font-bold uppercase tracking-wider pb-2 border-b-2 transition-all cursor-pointer ${
                    activeSubTab === 'tryons'
                      ? "border-pink-500 text-pink-600 font-extrabold"
                      : "border-transparent text-stone-500 hover:text-pink-600"
                  }`}
                >
                  Virtual Tryons ({history.length})
                </button>
                <button
                  onClick={() => setActiveSubTab('favorites')}
                  className={`text-xs font-mono font-bold uppercase tracking-wider pb-2 border-b-2 transition-all cursor-pointer ${
                    activeSubTab === 'favorites'
                      ? "border-pink-500 text-pink-600 font-extrabold"
                      : "border-transparent text-stone-500 hover:text-pink-600"
                  }`}
                >
                  Pinned Looks ({looks.length})
                </button>
                <button
                  onClick={() => setActiveSubTab('advice')}
                  className={`text-xs font-mono font-bold uppercase tracking-wider pb-2 border-b-2 transition-all cursor-pointer ${
                    activeSubTab === 'advice'
                      ? "border-pink-500 text-pink-600 font-extrabold"
                      : "border-transparent text-stone-500 hover:text-pink-600"
                  }`}
                >
                  AI Recommendations ({recommendations.length})
                </button>
              </div>

              {loading ? (
                /* LUXURY PINK SHIMMER LOADING SKELETON */
                <div className="space-y-4">
                  <div className="animate-pulse h-16 pink-shim rounded-2xl" />
                  <div className="animate-pulse h-16 pink-shim rounded-2xl" />
                  <div className="animate-pulse h-16 pink-shim rounded-2xl" />
                </div>
              ) : activeSubTab === 'tryons' ? (
                /* --- SECTION A: VIRTUAL TRYON LIST --- */
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono uppercase text-pink-600 tracking-wider font-extrabold">ARCHIVED SESSIONS REGISTER</span>
                    {history.length > 0 && (
                      <button
                        onClick={handleClearHistory}
                        className="text-[10px] font-mono uppercase text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                        Clear History
                      </button>
                    )}
                  </div>

                  {history.length === 0 ? (
                    <div className="text-center py-12 text-stone-500 font-mono text-xs space-y-3">
                      <Compass className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                      <p>NO TRIAL RUNS CURRENTLY DETECTED.</p>
                      <button
                        onClick={() => setActiveTab('tryon')}
                        className="px-5 py-2.5 bg-pink-50 hover:bg-pink-100 border border-pink-150 text-pink-600 rounded-xl uppercase text-[9px] font-extrabold tracking-widest cursor-pointer"
                      >
                        Launch Try-on Scanner
                      </button>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4 max-h-[460px] overflow-y-auto pr-1">
                      {history.map((item) => (
                        <div
                          key={item.id}
                          className="bg-pink-50/40 p-4 border border-pink-150 rounded-2xl flex gap-4 hover:border-pink-300 hover:bg-white transition-all group shadow-sm"
                        >
                          <img 
                            src={item.imageAfter} 
                            alt={item.style} 
                            className="w-16 h-20 object-cover rounded-xl border border-pink-200 flex-shrink-0"
                          />
                          <div className="min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap font-bold">
                                <span className="px-1.5 py-0.5 bg-pink-50 border border-pink-200 text-[8px] font-mono text-pink-600 uppercase rounded">
                                  {item.category}
                                </span>
                                <span className="text-[9px] font-mono text-pink-650 uppercase">
                                  Score: {item.fashionScore}
                                </span>
                              </div>
                              <h4 className="text-xs font-black text-stone-850 truncate mt-1">
                                {item.style}
                              </h4>
                              <p className="text-[10px] text-stone-500 truncate mt-0.5 font-semibold">
                                {item.caption}
                              </p>
                            </div>
                            <span className="text-[9px] font-mono text-stone-500 block mt-2 font-bold">
                              DATE: {new Date(item.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : activeSubTab === 'favorites' ? (
                /* --- SECTION B: PINNED LOOKS LIST --- */
                <div>
                  <div className="mb-4">
                    <span className="text-[10px] font-mono uppercase text-pink-600 tracking-wider font-extrabold">PINNED APPAREL BOARDS</span>
                  </div>

                  {looks.length === 0 ? (
                    <div className="text-center py-12 text-stone-500 font-mono text-xs space-y-3">
                      <Heart className="w-8 h-8 text-pink-400 mx-auto mb-2 animate-bounce" />
                      <p>WIDGET CLOSET IS EMPTY.</p>
                      <button
                        onClick={() => setActiveTab('home')}
                        className="px-5 py-2.5 bg-pink-50 hover:bg-pink-100 border border-pink-150 text-pink-600 rounded-xl uppercase text-[9px] font-extrabold tracking-widest cursor-pointer"
                      >
                        Explore Aesthetic Grid
                      </button>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4 max-h-[460px] overflow-y-auto pr-1">
                      {looks.map((item) => (
                        <div
                          key={item.id}
                          className="bg-pink-50/40 p-4 border border-pink-150 rounded-2xl flex gap-4 hover:border-pink-300 hover:bg-white transition-all group relative shadow-sm"
                        >
                          <img 
                            src={item.imageAfter} 
                            alt={item.title} 
                            className="w-16 h-20 object-cover rounded-xl border border-pink-200 flex-shrink-0 animate-scale-up"
                          />
                          <div className="min-w-0 flex-grow flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="px-1.5 py-0.5 bg-pink-100 border border-pink-200 text-[8px] font-mono text-pink-600 uppercase rounded font-bold">
                                  {item.category}
                                </span>
                              </div>
                              <h4 className="text-xs font-bold text-stone-850 truncate mt-1 pr-6">
                                {item.title}
                              </h4>
                              <p className="text-[10px] text-stone-500 leading-normal line-clamp-2 mt-0.5 font-semibold">
                                {item.description}
                              </p>
                            </div>
                            <span className="text-[9px] font-mono text-stone-500 block mt-2 font-bold">
                              ADDED: {new Date(item.timestamp).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Action overlay to discard look */}
                          <button
                            onClick={() => handleDeleteLook(item.id)}
                            className="absolute top-3 right-3 p-1.5 rounded-xl bg-pink-100 hover:bg-rose-50 text-pink-650 hover:text-red-500 border border-pink-200 cursor-pointer transition-colors shadow-sm"
                            title="Discard Look"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* --- SECTION C: AI RECOMMENDATION ARCHIVES --- */
                <div>
                  <div className="mb-4">
                    <span className="text-[10px] font-mono uppercase text-pink-600 tracking-wider font-extrabold">PERSONAL AI COUTURE ADVICE</span>
                  </div>

                  {recommendations.length === 0 ? (
                    <div className="text-center py-12 text-stone-500 font-mono text-xs space-y-3">
                      <Sparkles className="w-8 h-8 text-pink-500 mx-auto mb-2 animate-bounce" />
                      <p>NO PERSONAL COGNITIVE ADVICE SAVED.</p>
                      <button
                        onClick={() => setActiveTab('recommendations')}
                        className="px-5 py-2.5 bg-pink-50 hover:bg-pink-100 border border-pink-150 text-pink-600 rounded-xl uppercase text-[9px] font-extrabold tracking-widest cursor-pointer"
                      >
                        Launch Recommendations Suite
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1 animate-fadeIn">
                      {recommendations.map((item) => (
                        <div
                          key={item.id}
                          className="bg-pink-50/30 p-5 border border-pink-150 rounded-2xl space-y-3 hover:border-pink-300 hover:bg-white transition-all shadow-sm"
                        >
                          <div className="flex items-center justify-between border-b border-pink-100 pb-2.5 font-bold">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-pink-100 border border-pink-200 text-[9px] font-mono text-pink-600 uppercase rounded">
                                {item.occasion}
                              </span>
                              <span className="text-[10px] font-mono text-stone-500">
                                {item.skinTone} skin / {item.gender}
                              </span>
                            </div>
                            <span className="text-[9px] font-mono text-stone-500 font-bold">
                              {new Date(item.timestamp).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Suggested styles breakdown */}
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {item.suggestedStyles?.map((styleObj: any, idx: number) => (
                              <div key={idx} className="bg-white p-3.5 rounded-xl border border-pink-200 shadow-sm shadow-pink-50/30">
                                <h5 className="text-[11px] font-extrabold text-stone-850">{styleObj.title}</h5>
                                <p className="text-[9px] text-stone-500 mt-1 line-clamp-3 leading-relaxed font-semibold">
                                  {styleObj.desc}
                                </p>
                              </div>
                            ))}
                          </div>

                          {/* Quick Palette */}
                          <div className="flex flex-wrap gap-2 pt-1 border-t border-pink-100 font-bold">
                            <span className="text-[8px] font-mono uppercase text-pink-600 self-center">COGNITIVE PALETTE:</span>
                            {item.matchingColors?.map((color: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-pink-150 shadow-sm">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color.hex }} />
                                <span className="text-[8px] font-mono text-stone-700 uppercase font-black">{color.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
