import { useState, useEffect, startTransition } from 'react';
import { useApp } from '../context/AppContext.js';
import { api, SavedLook } from '../services/api.js';
import BeforeAfterSlider from '../components/BeforeAfterSlider.js';
import { Heart, Search, Eye, Trash2, Calendar, Share2, Sparkles, X, Check, Copy } from 'lucide-react';

export default function SavedLooks() {
  const { user, addToast, setActiveTab } = useApp();
  const [looks, setLooks] = useState<SavedLook[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal viewer
  const [activeModalLook, setActiveModalLook] = useState<SavedLook | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      api.getSavedLooks(user.id)
        .then((data) => {
          startTransition(() => {
            setLooks(data);
          });
        })
        .catch(() => {})
        .finally(() => {
          startTransition(() => {
            setLoading(false);
          });
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleDelete = async (id: string, e: any) => {
    e.stopPropagation();
    if (!user) return;
    try {
      await api.deleteLook(id, user.id);
      setLooks((prev) => prev.filter((l) => l.id !== id));
      addToast('Styled look removed securely.', 'info');
      if (activeModalLook?.id === id) setActiveModalLook(null);
    } catch (err) {
      addToast('Could not delete look.', 'error');
    }
  };

  const handleShareLook = () => {
    addToast('Runway collection package shared to feed!', 'success');
  };

  const copyModalCaption = () => {
    if (!activeModalLook) return;
    navigator.clipboard.writeText(activeModalLook.caption);
    setCopied(true);
    addToast('Instagram styling tags copied!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  // Filter styles with search terms
  const filteredLooks = looks.filter((l) => {
    const term = search.toLowerCase();
    return (
      l.title.toLowerCase().includes(term) ||
      l.category.toLowerCase().includes(term) ||
      l.caption.toLowerCase().includes(term)
    );
  });

  if (!user) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center text-stone-850">
        <div className="max-w-md w-full bg-white border border-pink-200 rounded-3xl p-8 text-center space-y-6 shadow-md shadow-pink-100/30">
          <div className="w-16 h-16 rounded-full bg-pink-500/10 border border-pink-200 flex items-center justify-center mx-auto shadow-sm">
            <Heart className="w-8 h-8 text-pink-500 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-black text-stone-900 tracking-widest uppercase italic">CLOSET SECURITY LOCK</h2>
            <p className="text-xs text-stone-605 mt-2 leading-relaxed font-semibold">
              Authenticate your developer session key to browse custom saved try-on cards, copy Instagram templates, and package couture collections.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('login')}
            className="w-full py-4 bg-gradient-to-r from-pink-550 via-rose-500 to-pink-600 text-white font-bold text-xs tracking-widest uppercase rounded-xl hover:brightness-110 transition-all cursor-pointer shadow-md border border-pink-400/20"
          >
            Authenticate Profile Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 min-h-screen text-stone-850" id="saved_looks_view">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        
        {/* Title */}
        <div className="border-b border-pink-201 pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-100 border border-pink-300 text-[10.5px] font-mono font-bold uppercase text-pink-700 rounded-full mb-3 shadow-sm">
              <Heart className="w-3.5 h-3.5 text-pink-505" /> STYLED LOOKBOOK BOARDS
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-black text-stone-900 tracking-tight">SAVED PINUPS</h1>
            <p className="text-xs text-stone-600 mt-1 font-semibold">Explore saved assessed try-on ensembles, copy social captions, and share digital cards.</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-600" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search pinned lookbooks..."
              className="w-full bg-white border border-pink-300 rounded-2xl py-2.5 pl-10 pr-4 text-xs text-stone-900 placeholder-stone-400/80 outline-none focus:border-pink-400 shadow-sm font-sans"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div className="h-64 pink-shim rounded-3xl" />
            <div className="h-64 pink-shim rounded-3xl" />
          </div>
        ) : filteredLooks.length === 0 ? (
          <div className="text-center py-20 border border-pink-250 border-dashed rounded-3xl space-y-4 max-w-xl mx-auto mt-8 bg-white shadow-sm">
            <Sparkles className="w-12 h-12 text-pink-400/60 mx-auto animate-bounce" />
            <h3 className="text-sm font-bold text-stone-600 uppercase tracking-widest font-mono">Pinned board empty</h3>
            <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed font-semibold">
              Create gorgeous virtual silhouettes inside our AI Fitting Room, analyze fit parameters, then click save.
            </p>
            <button
              onClick={() => setActiveTab('tryon')}
              className="px-5 py-2.5 bg-gradient-to-r from-pink-550 to-rose-500 hover:brightness-110 text-xs font-bold rounded-xl text-white tracking-wider uppercase transition-all shadow-md cursor-pointer"
            >
              Enter Try-On Suite
            </button>
          </div>
        ) : (
          /* Grid pin structures */
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredLooks.map((look) => (
              <div
                key={look.id}
                onClick={() => setActiveModalLook(look)}
                className="bg-white border border-pink-200 hover:border-pink-400 hover:shadow-pink-100/50 rounded-3xl overflow-hidden cursor-pointer group hover:translate-y-[-4px] transition-all duration-300 p-2.5 space-y-3 flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="aspect-[4/5] rounded-2xl overflow-hidden relative border border-pink-150 bg-pink-50">
                    <img
                      src={look.imageAfter}
                      alt={look.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-pink-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                      <span className="text-[10px] font-mono text-white font-bold flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" /> EXAMINE MATRIX
                      </span>
                    </div>

                    <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 bg-pink-50/90 backdrop-blur-sm rounded-lg border border-pink-250 text-[9px] font-mono font-black text-pink-700 shadow-sm">
                      Score: {look.fashionScore}
                    </div>
                  </div>

                  <div className="min-w-0 pt-2 px-1">
                    <span className="text-[9px] font-mono text-pink-600 uppercase font-black tracking-widest">
                      {look.category} SPECIAL
                    </span>
                    <h4 className="text-xs font-bold text-stone-900 truncate mt-0.5 uppercase tracking-wide">
                      {look.title}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-pink-100 pt-2.5 px-1 bg-pink-50/30 rounded-b-xl">
                  <span className="text-[8px] font-mono text-stone-600 flex items-center gap-1 font-semibold">
                    <Calendar className="w-3 h-3 text-pink-500" />
                    {new Date(look.timestamp).toLocaleDateString()}
                  </span>
                  
                  <button
                    onClick={(e) => handleDelete(look.id, e)}
                    className="p-1.5 rounded-xl bg-pink-50 hover:bg-red-50 text-red-650 hover:text-red-700 border border-pink-150 cursor-pointer transition-colors"
                    title="Wipe look pin"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal lightbox overlay detailing */}
        {activeModalLook && (
          <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto" id="look_modal_overlay">
            <div className="bg-white border border-pink-200 w-full max-w-4xl rounded-3xl overflow-hidden shadow-xl relative flex flex-col md:flex-row aspect-[1.8/1]">
              
              {/* Close pin */}
              <button
                onClick={() => setActiveModalLook(null)}
                className="absolute top-4 right-4 z-20 p-2 bg-pink-50 text-pink-700 hover:text-pink-905 rounded-xl border border-pink-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Slider comparative container (Span 1/2) */}
              <div className="w-full md:w-1/2 relative bg-pink-50/30 p-2 flex items-center">
                <div className="w-full h-full rounded-2xl overflow-hidden border border-pink-150">
                  <BeforeAfterSlider
                    beforeImage={activeModalLook.imageBefore}
                    afterImage={activeModalLook.imageAfter}
                    beforeLabel="Raw Scan Profile"
                    afterLabel="Styled Couture"
                  />
                </div>
              </div>

              {/* Data detail details (Span 1/2) */}
              <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between space-y-6">
                
                <div className="space-y-4 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-pink-50 border border-pink-200 text-[9px] font-mono font-bold text-pink-650 uppercase rounded-md tracking-wider">
                      {activeModalLook.category} LUXURY LOOK
                    </span>
                    <span className="text-[10px] font-mono text-stone-500 font-bold">
                      COUTURE SCORE: {activeModalLook.fashionScore}/100
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl font-serif font-black text-stone-900 uppercase tracking-tight">{activeModalLook.title}</h2>
                    <p className="text-xs text-stone-800 leading-relaxed mt-3.5 font-sans font-medium">
                      {activeModalLook.description}
                    </p>
                  </div>
                </div>

                {/* Caption and interactive pins */}
                <div className="space-y-4 pt-4 border-t border-pink-100">
                  
                  {/* Caption line */}
                  <div className="bg-pink-50/50 p-4 border border-pink-200 rounded-2xl flex items-center justify-between gap-3 min-w-0">
                    <p className="text-[10px] font-mono text-pink-705 leading-normal truncate select-all flex-grow">
                      {activeModalLook.caption}
                    </p>
                    <button
                      onClick={copyModalCaption}
                      className="p-2 bg-pink-100 border border-pink-300 text-pink-700 hover:text-pink-900 rounded-xl transition-all cursor-pointer flex-shrink-0"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleShareLook}
                      className="flex-grow py-3.5 bg-gradient-to-r from-pink-550 via-rose-500 to-pink-600 hover:brightness-110 text-white font-bold text-xs tracking-widest uppercase rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md border border-pink-400/25"
                    >
                      <Share2 className="w-4 h-4 text-white animate-pulse" />
                      SIMPACK SHARE LOOK
                    </button>
                    <button
                      onClick={(e) => handleDelete(activeModalLook.id, e)}
                      className="p-3.5 bg-red-50 hover:bg-red-100 text-red-650 border border-red-205 rounded-2xl text-xs flex items-center justify-center transition-all cursor-pointer"
                      title="WipeLook Pin"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
