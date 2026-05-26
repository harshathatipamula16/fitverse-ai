import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '../context/AppContext.js';
import { api, TrendDigest } from '../services/api.js';
import { searchFashion } from '../lib/searchFashion.js';
import { 
  Sparkles, TrendingUp, Cpu, ShieldCheck, Shirt, Palette, MoveRight, Layers, 
  Search, Heart, Loader2, ExternalLink, Check, Image as ImageIcon, Camera,
  Instagram, Feather, Sliders
} from 'lucide-react';
import { FashionImage } from '../components/FashionImage.js';
import { MULTICULTURAL_SUGGESTIONS, INDIAN_AI_FASHION_SUGGESTIONS, IndianFashionAIItem } from '../data/fashionData.js';

export function getOutfitSubtags(altText: string, category: string) {
  const alt = (altText || '').toLowerCase();
  const cat = (category || '').toLowerCase();
  
  let countryStyle = "Western";
  let aesthetic = "Luxury Classic";
  let itemCategory = category;

  if (alt.includes('indian') || alt.includes('saree') || alt.includes('lehenga') || alt.includes('sherwani') || alt.includes('kurta') || alt.includes('anarkali') || alt.includes('salwar') || alt.includes('ethnic') || cat.includes('indian') || cat.includes('saree') || cat.includes('lehenga') || cat.includes('sherwani') || cat.includes('kurta') || cat.includes('ethnic')) {
    countryStyle = "Indian";
  } else if (alt.includes('korean') || alt.includes('kdrama') || alt.includes('k-pop') || alt.includes('seoul') || cat.includes('korean') || cat.includes('k-streetwear') || cat.includes('kdrama') || cat.includes('oversized') || cat.includes('minimal')) {
    countryStyle = "Korean";
  } else if (alt.includes('coquette') || alt.includes('y2k') || alt.includes('old money') || alt.includes('streetwear') || cat.includes('coquette') || cat.includes('old money') || cat.includes('y2k') || cat.includes('streetwear')) {
    countryStyle = "Western";
  }

  if (alt.includes('saree')) {
    aesthetic = "Saree Elegant";
    itemCategory = "Saree";
  } else if (alt.includes('lehenga')) {
    aesthetic = "Bridal Lehenga";
    itemCategory = "Lehenga";
  } else if (alt.includes('sherwani')) {
    aesthetic = "Groom Sherwani";
    itemCategory = "Sherwani";
  } else if (alt.includes('kurta')) {
    aesthetic = "Ethnic Kurta";
    itemCategory = "Kurta";
  } else if (alt.includes('anarkali') || alt.includes('salwar')) {
    aesthetic = "Ethnic Anarkali";
    itemCategory = "Salwar suit";
  } else if (alt.includes('streetwear') && countryStyle === 'Korean') {
    aesthetic = "K-Streetwear";
  } else if (alt.includes('minimal')) {
    aesthetic = "K-Minimalist";
  } else if (alt.includes('oversized')) {
    aesthetic = "K-Oversized";
  } else if (alt.includes('kdrama') || alt.includes('drama')) {
    aesthetic = "K-Drama Look";
  } else if (alt.includes('old money')) {
    aesthetic = "Old Money / Quiet Luxury";
  } else if (alt.includes('y2k')) {
    aesthetic = "Y2K Aesthetic";
  } else if (alt.includes('coquette')) {
    aesthetic = "Coquette Pastel";
  } else if (alt.includes('luxury') || alt.includes('runway')) {
    aesthetic = "Luxury Runway";
  } else if (alt.includes('wedding')) {
    aesthetic = "Wedding Bliss";
  } else {
    if (cat === 'saree') { aesthetic = "Classic Saree"; itemCategory = "Saree"; }
    else if (cat === 'lehenga') { aesthetic = "Bridal Lehenga"; itemCategory = "Lehenga"; }
    else if (cat === 'sherwani') { aesthetic = "Wedding Sherwani"; itemCategory = "Sherwani"; }
    else if (cat === 'kurta') { aesthetic = "Premium Kurta"; itemCategory = "Kurta"; }
    else if (cat === 'ethnic') { aesthetic = "Festive Ethnic"; itemCategory = "Ethnic Wear"; }
    else if (cat === 'k-streetwear') { aesthetic = "Oversized Streetwear"; itemCategory = "K-Streetwear"; }
    else if (cat === 'k-drama') { aesthetic = "K-Drama Trend"; itemCategory = "K-Drama"; }
    else if (cat === 'minimal') { aesthetic = "Clean Minimal"; itemCategory = "Korean Minimal"; }
    else if (cat === 'oversized') { aesthetic = "Oversized Fit"; itemCategory = "Korean Oversized"; }
    else if (cat === 'old money') { aesthetic = "Old Money Beige"; itemCategory = "Old Money"; }
    else if (cat === 'y2k') { aesthetic = "Retro Y2K"; itemCategory = "Y2K"; }
    else if (cat === 'coquette') { aesthetic = "Coquette Delicate"; itemCategory = "Coquette"; }
    else {
      aesthetic = countryStyle + " Elegance";
    }
  }

  return { countryStyle, aesthetic, itemCategory };
}

export default function Home() {
  const { user, addToast, setActiveTab } = useApp();
  
  // Custom API Trend segment states
  const [trends, setTrends] = useState<TrendDigest | null>(null);
  const [trendsLoading, setTrendsLoading] = useState(true);

  // Dynamic Couture Search System states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Custom state metrics
  const [currentPlaceholder, setCurrentPlaceholder] = useState('Ask AI Your Fashion Vibe...');
  const [focusedSuggestionIdx, setFocusedSuggestionIdx] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('fitverse_recent_searches');
      return stored ? JSON.parse(stored) : ["Wedding Sherwani", "Oversized Indian Streetwear", "Haldi ceremony outfit", "Navratri outfit ideas"];
    } catch {
      return ["Wedding Sherwani", "Oversized Indian Streetwear", "Haldi ceremony outfit", "Navratri outfit ideas"];
    }
  });

  // Smart AI Categories
  const smartAiCategories = [
    "Wedding", "Casual", "Festive", "Streetwear", "Traditional", 
    "Indo-Western", "Korean Fusion", "College", "Luxury", "Minimal"
  ];

  // Saved state metrics
  const [savedPhotoIds, setSavedPhotoIds] = useState<Record<string, boolean>>({});
  const [savingPhotoId, setSavingPhotoId] = useState<string | null>(null);

  // Global Pinterest dynamic feeds states
  const [trendingIndian, setTrendingIndian] = useState<any[]>([]);
  const [trendingKorean, setTrendingKorean] = useState<any[]>([]);
  const [trendingWestern, setTrendingWestern] = useState<any[]>([]);
  const [loadingFeeds, setLoadingFeeds] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  // Premium Indian, Korean, and Western fashion outfit suggestions based on specific instructions
  const suggestions = MULTICULTURAL_SUGGESTIONS;

  // Multicultural regional categorized chips requested
  const indianChips = [
    { label: "Saree", query: "Saree" },
    { label: "Lehenga", query: "Lehenga" },
    { label: "Sherwani", query: "Sherwani" },
    { label: "Kurta", query: "Kurta Pajama" },
    { label: "Ethnic", query: "Festive Wear" }
  ];

  const koreanChips = [
    { label: "K-Streetwear", query: "Korean Streetwear" },
    { label: "K-Drama", query: "Kdrama Look" },
    { label: "Minimal", query: "Korean minimalist" },
    { label: "Oversized", query: "Korean oversized" }
  ];

  const westernChips = [
    { label: "Old Money", query: "Old Money" },
    { label: "Y2K", query: "Y2K" },
    { label: "Coquette", query: "Coquette" },
    { label: "Luxury", query: "Luxury fashion" },
    { label: "Streetwear", query: "Western Streetwear" }
  ];

  // Typing animated placeholder effect
  useEffect(() => {
    const promptPhrases = [
      "Wedding outfit for boy",
      "Traditional Gujarati look",
      "Indian college fit",
      "Haldi ceremony outfit",
      "Korean + Indian fusion",
      "Royal sherwani style",
      "Navratri outfit ideas",
      "Streetwear for Indian summer"
    ];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timer: any = null;

    const tickPlaceholder = () => {
      const currentWord = promptPhrases[wordIndex % promptPhrases.length];
      if (isDeleting) {
        setCurrentPlaceholder("“" + currentWord.substring(0, charIndex - 1) + "”");
        charIndex--;
      } else {
        setCurrentPlaceholder("“" + currentWord.substring(0, charIndex + 1) + "”");
        charIndex++;
      }

      let speed = 75;
      if (isDeleting) speed /= 2;

      if (!isDeleting && charIndex === currentWord.length) {
        speed = 1800; // Pause at the end
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex++;
        speed = 400; // Pause before next word
      }

      timer = setTimeout(tickPlaceholder, speed);
    };

    timer = setTimeout(tickPlaceholder, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Sync the ambient trend report on load
    const fetchTrends = async () => {
      try {
        const repo = await api.getTrendsDigest();
        setTrends(repo);
      } catch (e) {
        console.error('Failed to resolve landing trends');
      } finally {
        setTrendsLoading(false);
      }
    };
    fetchTrends();

    // Fetch Pinterest regional feeds in parallel
    const fetchPinterestFeeds = async () => {
      setLoadingFeeds(true);
      try {
        const [ind, kor, wes] = await Promise.all([
          searchFashion("indian fashion designer saree lehenga wedding").catch(() => []),
          searchFashion("korean fashion aesthetic aesthetic models").catch(() => []),
          searchFashion("luxury old money aesthetic retro fashion").catch(() => [])
        ]);
        setTrendingIndian(ind.slice(0, 4));
        setTrendingKorean(kor.slice(0, 4));
        setTrendingWestern(wes.slice(0, 4));
      } catch (err) {
        console.warn('Failed to pre-cache regional Pinterest lookbook feeds:', err);
      } finally {
        setLoadingFeeds(false);
      }
    };
    fetchPinterestFeeds();

    // Load initial ambient discover feed
    handleSearchRun("Traditional Indian Festive fashion", "All");
  }, []);

  // Collapse suggestions when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsSuggestionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Filter local Indian suggestions in real-time
  const dynamicAISuggestions = (() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      // Return top beautiful Indian entries if empty query
      return INDIAN_AI_FASHION_SUGGESTIONS.slice(0, 5);
    }
    return INDIAN_AI_FASHION_SUGGESTIONS.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.styleTag.toLowerCase().includes(query) ||
      item.keywords.some(kw => kw.toLowerCase().includes(query))
    );
  })();

  // Trigger search execution
  const handleSearchRun = async (term: string, categoryLabel: string = "Discovery") => {
    if (!term.trim()) return;
    setLoadingSearch(true);
    setIsSuggestionsOpen(false);
    setSearchQuery(term);
    
    // Save search term to recents safely
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item.toLowerCase() !== term.toLowerCase());
      const updated = [term, ...filtered].slice(0, 5);
      localStorage.setItem('fitverse_recent_searches', JSON.stringify(updated));
      return updated;
    });

    let queryTerm = term;
    const lower = term.toLowerCase().trim();
    if (lower === 'dresses' || lower === 'dress') queryTerm = 'dress outfit full body fashion model';
    if (lower === 'streetwear') queryTerm = 'streetwear outfit model full body clothing';
    if (lower === 'formal') queryTerm = 'formal suit dress runway clothing full body model';
    if (lower === 'wedding' || lower === 'wedding outfit') queryTerm = 'wedding dress full body fashion model';
    if (lower === 'casual') queryTerm = 'stylish casual outfit full body model clothing';
    if (lower === 'y2k') queryTerm = 'y2k streetwear full body outfit model';
    if (lower === 'korean') queryTerm = 'korean streetwear full body outfit model';
    if (lower === 'luxury') queryTerm = 'luxury designer clothing runway dress full body model';
    if (lower === 'old money') queryTerm = 'old money outfit full body model fashion';

    try {
      // 1. Match local high-status Indian structured elements to prioritize beautiful curated outputs
      const localMatches = INDIAN_AI_FASHION_SUGGESTIONS.filter(item => 
        item.title.toLowerCase().includes(lower) ||
        item.category.toLowerCase().includes(lower) ||
        item.styleTag.toLowerCase().includes(lower) ||
        item.keywords.some(kw => kw.toLowerCase().includes(lower))
      );

      const convertedLocal = localMatches.map(item => ({
        id: item.id,
        url: item.image,
        original: item.image,
        alt: item.title,
        photographer: "Sasha AI Stylist",
        photographer_url: "#",
        avg_color: "#db2777",
        isLocalAI: true,
        styleTag: item.styleTag,
        category: item.category,
        description: item.description
      }));

      // 2. Supplement utilizing general Pexels search query lookups
      let pexelsResults: any[] = [];
      try {
        pexelsResults = await searchFashion(queryTerm);
      } catch (pexelsErr) {
        console.warn('Pexels secondary search bypassed:', pexelsErr);
      }

      // Combine matches: placing precious local Indian couture fits at the very top of search feed
      const mergedResults = [
        ...convertedLocal,
        ...pexelsResults.filter(p => !localMatches.some(lm => lm.image === p.url))
      ];

      setSearchResults(mergedResults);
      setActiveCategory(categoryLabel);
      
      if (term !== "full body clothing fashion model") {
        addToast(`AI curated ${mergedResults.length} premium looks for "${term}"`, 'success');
      }
    } catch (err: any) {
      addToast(err.message || 'Error communicating with the stylist search service.', 'error');
    } finally {
      setLoadingSearch(false);
    }
  };

  // Keyboard navigation for floating suggestions drawer
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSuggestionsOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedSuggestionIdx(prev => 
        prev === dynamicAISuggestions.length - 1 ? 0 : prev + 1
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedSuggestionIdx(prev => 
        prev <= 0 ? dynamicAISuggestions.length - 1 : prev - 1
      );
    } else if (e.key === 'Enter') {
      if (focusedSuggestionIdx >= 0 && focusedSuggestionIdx < dynamicAISuggestions.length) {
        e.preventDefault();
        const selected = dynamicAISuggestions[focusedSuggestionIdx];
        setSearchQuery(selected.title);
        handleSearchRun(selected.title, selected.category);
      } else {
        handleSearchRun(searchQuery || "Traditional Indian festive fashion", searchQuery ? "AI Search" : "All");
      }
    } else if (e.key === 'Escape') {
      setIsSuggestionsOpen(false);
    }
  };

  // Trigger Save Look Action
  const handleSaveLook = async (photo: any, tag: string) => {
    if (!user) {
      addToast('Authenticate to lock this aesthetic into your profile boards.', 'info');
      setActiveTab('login');
      return;
    }

    setSavingPhotoId(photo.id.toString());
    try {
      await api.saveLook({
        userId: user.id,
        title: `${tag} Premium Coord`,
        description: `Source image by ${photo.photographer || 'Photographer'}. Curated dynamically from Pexels API fashion indices.`,
        category: tag,
        imageBefore: photo.url,
        imageAfter: photo.url,
        fashionScore: 96, // High status fashion score metric
        tags: [tag, 'Pexels API', 'Hot Trend'],
        caption: `Style discovery featuring #Barbiecore ${tag.toLowerCase()} aesthetics.`
      });

      setSavedPhotoIds(prev => ({ ...prev, [photo.id]: true }));
      addToast('Style pinned to your Saved Looks!', 'success');
    } catch (err) {
      addToast('Failed to pin look to profile records.', 'error');
    } finally {
      setSavingPhotoId(null);
    }
  };

  // Trigger Virtual Try-On flow with selected Pexels model outfit
  const handleTryOnRedirect = (photo: any, tag: string) => {
    try {
      const tryonPayload = {
        id: 'pexels-' + photo.id,
        url: photo.original || photo.url,
        name: `${tag} Silhouette ` + photo.id.toString().substring(0, 4),
        category: 'streetwear', // Base category used for simulation match
        style: tag,
        avg_color: photo.avg_color || '#db2777', // Default hot pink avg tint
        tag: tag
      };

      localStorage.setItem('selected_tryon_outfit', JSON.stringify(tryonPayload));
      addToast('Model synced to AI Tryon scanner. Opening virtual loom...', 'success');
      setActiveTab('tryon');
    } catch (err) {
      addToast('Error parsing visual model assets.', 'error');
    }
  };

  return (
    <div className="pt-24 pb-16 min-h-screen relative text-stone-850" id="home_page_view">
      
      {/* Dynamic drifting background particles */}
      <div className="absolute top-20 right-[15%] w-72 h-72 rounded-full bg-pink-500/10 blur-[130px] pointer-events-none animate-float" />
      <div className="absolute top-[40%] left-[10%] w-96 h-96 rounded-full bg-purple-500/5 blur-[150px] pointer-events-none animate-float" style={{ animationDelay: '2s' }} />

      {/* 1. FUTURISTIC HERO BANNER (Vogue & Pinterest inspired) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 flex flex-col items-center text-center relative overflow-hidden z-10">
        
        {/* Glamorous Barbiecore badge header */}
        <div className="inline-flex items-center gap-1.5 px-4 h-8 bg-pink-50 border border-pink-200 text-[10.5px] font-mono font-black uppercase tracking-widest text-pink-600 rounded-full mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-spin" />
          The AI Virtual Wardrobe & Creative Runway
        </div>

        {/* Beautiful Vogue-style typography headline */}
        <h1 className="text-4xl sm:text-7xl font-light font-serif tracking-tight leading-[1.1] max-w-4xl text-stone-900">
          Where <span className="font-extrabold font-display italic text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 text-shadow-vogue">Aesthetic Vibe</span> <br />
          Meets Smart <span className="font-extrabold font-display text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-500">Virtual Try-On</span>
        </h1>

        {/* Pinterest-esque description subtitle */}
        <p className="mt-6 text-sm sm:text-base text-stone-700/90 max-w-2xl leading-relaxed font-sans font-medium">
          Translate your Pinterest dream coords into interactive previews. Query any trend vibe to instantiate a high-resolution canvas with instant Gemini sizing metrics and physical model overlays.
        </p>

        {/* Interactive Luxury CTA group */}
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => {
              const rect = document.getElementById('ai-search-workspace');
              rect?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-8 py-4 bg-gradient-to-r from-pink-500 via-rose-550 to-pink-600 hover:brightness-110 text-white font-bold text-xs tracking-widest uppercase rounded-full shadow-md shadow-pink-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer border border-pink-400/20"
          >
            Explore Interactive Styles
            <MoveRight className="w-4 h-4 text-pink-200" />
          </button>
          
          <button
            onClick={() => setActiveTab('tryon')}
            className="px-8 py-4 bg-white/80 border border-pink-300 hover:border-pink-505 text-stone-800 hover:text-pink-650 hover:bg-white font-bold text-xs tracking-widest uppercase rounded-full hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 backdrop-blur-md shadow-sm"
          >
            <Camera className="w-4 h-4 text-pink-500" />
            Launch Wardrobe Scanner
          </button>
        </div>

        {/* Statistics Ledger HUD with Soft Pink Glowing Accents */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl border-t border-pink-200 pt-8" id="hero_statistical_grid">
          <div className="p-4 bg-white/70 border border-pink-200/60 rounded-2xl relative overflow-hidden shadow-sm shadow-pink-100/30">
            <span className="block text-xl md:text-2xl font-black font-display text-pink-600">Smart Match</span>
            <span className="text-[9.5px] font-mono tracking-wider uppercase text-stone-600 block mt-1 font-bold">AI Outfit Matching</span>
          </div>
          <div className="p-4 bg-white/70 border border-pink-200/60 rounded-2xl relative overflow-hidden shadow-sm shadow-pink-100/30">
            <span className="block text-xl md:text-2xl font-black font-display text-stone-900">Adaptive</span>
            <span className="text-[9.5px] font-mono tracking-wider uppercase text-stone-600 block mt-1 font-bold">Smart Color Analysis</span>
          </div>
          <div className="p-4 bg-white/70 border border-pink-200/60 rounded-2xl relative overflow-hidden shadow-sm shadow-pink-100/30">
            <span className="block text-xl md:text-2xl font-black font-display text-pink-600">Occasion IQ</span>
            <span className="text-[9.5px] font-mono tracking-wider uppercase text-stone-600 block mt-1 font-bold">Occasion Styling</span>
          </div>
          <div className="p-4 bg-white/70 border border-pink-200/60 rounded-2xl relative overflow-hidden shadow-sm shadow-pink-100/30">
            <span className="block text-xl md:text-2xl font-black font-display text-stone-900">Virtual Fit</span>
            <span className="text-[9.5px] font-mono tracking-wider uppercase text-stone-600 block mt-1 font-bold">Virtual Try-On</span>
          </div>
        </div>
      </section>

      {/* 2. CORE WORKSPACE: INTERACTIVE AI-POWERED INDIAN FASHION COMMAND SEARCH */}
      <section 
        id="ai-search-workspace" 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 pt-12 border-t border-pink-500/10 relative z-20"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-50 border border-pink-100 text-[9px] font-mono tracking-widest text-pink-600 uppercase mb-3 font-bold rounded-full shadow-sm">
            <Cpu className="w-3.5 h-3.5 animate-spin text-pink-500" /> 
            Luxury Indian AI Stylist Search Engine
          </div>
          <h2 className="text-3xl font-serif font-black text-stone-900 tracking-tight text-shadow-vogue">
            ASK AI YOUR FASHION VIBE
          </h2>
          <p className="text-xs text-stone-600 mt-2 max-w-lg mx-auto leading-relaxed font-sans font-medium">
            Step onto the digital catwalk. Specify traditional details, fusion coordinates or festive ceremony prompts to instantiate pristine luxury styling coordinates.
          </p>
        </div>

        {/* FUTURISTIC FLOATING COMMAND BAR & GLASSMORPHIC AI SEARCH DRAWER */}
        <div ref={containerRef} className="max-w-2xl mx-auto relative mb-14">
          
          {/* Neon Pink Glowing Command Box */}
          <div className="relative group bg-white/90 p-2.5 rounded-2xl border-2 border-pink-200 focus-within:border-pink-500/80 focus-within:ring-8 focus-within:ring-pink-300/10 backdrop-blur-xl transition-all shadow-lg hover:shadow-[0_0_25px_rgba(236,72,153,0.15)] duration-300">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Sparkles className="w-5 h-5 text-pink-500 animate-pulse" />
            </div>
            
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSuggestionsOpen(true);
                setFocusedSuggestionIdx(-1);
              }}
              onFocus={() => setIsSuggestionsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder={`✨ Try: ${currentPlaceholder}`}
              className="w-full pl-12 pr-32 py-3 bg-transparent text-sm text-stone-800 placeholder-pink-400 font-semibold tracking-wide outline-none"
              id="ai_vibe_input"
            />

            {/* Glowing action synthesize button */}
            <button
              onClick={() => handleSearchRun(searchQuery || "Traditional Indian Festive fashion", searchQuery ? "AI Search" : "All")}
              disabled={loadingSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:brightness-110 active:scale-95 text-white font-bold text-[10px] tracking-widest uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-pink-200/50 border border-pink-400/20"
            >
              {loadingSearch ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <>SYNTHESIZE <Sparkles className="w-3 h-3 text-pink-200" /></>}
            </button>
          </div>

          {/* Luxury Floating Glassmorphic Suggestions Dropdown */}
          {isSuggestionsOpen && (
            <div 
              className="absolute inset-x-0 top-full mt-3 bg-white/95 border border-pink-200 rounded-3xl overflow-hidden shadow-2xl z-50 backdrop-blur-2xl animate-fade-in border-t-pink-300/30 divide-y divide-stone-100 shadow-[0_20px_60px_rgba(219,39,119,0.18)]"
              id="search_suggestions_dropdown"
            >
              {/* VIBE CHIPS INTERACTIVE MODULE */}
              <div className="p-4 bg-pink-50/40">
                <span className="text-[9px] font-mono tracking-widest text-pink-600 uppercase font-bold block mb-2.5 flex items-center gap-1">
                  <Palette className="w-3 h-3 text-pink-500 animate-spin" /> SMART AI VIBES
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {smartAiCategories.map((chip, idx) => {
                    const isSelected = activeCategory.toLowerCase() === chip.toLowerCase();
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setSearchQuery(chip);
                          handleSearchRun(chip, chip);
                        }}
                        className={`px-3 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase transition-all duration-250 cursor-pointer ${
                          isSelected
                            ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-400 shadow-sm"
                            : "bg-white text-stone-600 border border-pink-100 hover:bg-pink-100 hover:border-pink-300 text-pink-600"
                        }`}
                      >
                        ⚡ {chip}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DYNAMIC RECENT & TRENDING SUBPORTAL */}
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Recent Searches Portal */}
                <div>
                  <span className="text-[9px] font-mono tracking-widest text-stone-400 uppercase font-black block mb-2">
                    ⏱️ RECENT DISCOVERAL
                  </span>
                  <div className="space-y-1.5">
                    {recentSearches.map((term, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setSearchQuery(term);
                          handleSearchRun(term, "Recent");
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-pink-50/50 rounded-xl text-xs font-semibold text-stone-605 hover:text-pink-650 transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <span className="flex items-center gap-2 truncate">
                          <span className="text-[9px] text-pink-400">🔍</span>
                          <span className="truncate">{term}</span>
                        </span>
                        <span className="text-[8px] font-mono text-stone-300 group-hover:text-pink-400">LOAD</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trending Indian Styles */}
                <div>
                  <span className="text-[9px] font-mono tracking-widest text-pink-500 uppercase font-black block mb-2">
                    🔥 TRENDING CLASSICS
                  </span>
                  <div className="space-y-1.5">
                    {[
                      { label: "Wedding outfit for boy", query: "Sherwani kurta traditional wedding" },
                      { label: "Traditional Gujarati look", query: "Garba Dandiya Chaniya traditional" },
                      { label: "Haldi ceremony outfit", query: "Kurta Haldi ceremony peach orange" },
                      { label: "Oversized Indian Streetwear", query: "Oversized Indian Streetwear Cargo" }
                    ].map((item, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setSearchQuery(item.label);
                          handleSearchRun(item.query, "Trending");
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-pink-50/50 rounded-xl text-xs font-semibold text-stone-605 hover:text-pink-650 transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <span className="flex items-center gap-2 truncate">
                          <span className="text-[9px] text-pink-400 animate-pulse">✨</span>
                          <span className="truncate">{item.label}</span>
                        </span>
                        <span className="text-[8px] font-mono text-pink-400 font-bold">VIBE</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* DYNAMIC SUGGESTIONS PREVIEW BOX (TRY-ON SHORTCUT INTEGRATED) */}
              <div className="p-4 bg-stone-50/50 max-h-[340px] overflow-y-auto space-y-2">
                <span className="text-[9px] font-mono tracking-widest text-pink-600 uppercase font-black block mb-2">
                  👗 DESIGN MATCHES ({dynamicAISuggestions.length} FOUND)
                </span>
                
                {dynamicAISuggestions.length === 0 ? (
                  <div className="text-center py-6 text-stone-400 text-xs font-mono">
                    No matching Indian presets. Custom query will search live.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dynamicAISuggestions.map((item, index) => {
                      const isFocused = index === focusedSuggestionIdx;
                      return (
                        <div
                          key={item.id}
                          className={`p-2.5 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-3 ${
                            isFocused 
                              ? 'bg-pink-50 border-pink-300 shadow-sm scale-[1.005]' 
                              : 'bg-white border-stone-150 hover:bg-pink-50/30 hover:border-pink-200'
                          }`}
                          onMouseEnter={() => setFocusedSuggestionIdx(index)}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            {/* Small Elegant Crop Preview */}
                            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-pink-100 border border-pink-200 relative">
                              <img 
                                src={item.image} 
                                alt={item.title} 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            
                            <div className="min-w-0">
                              <div className="flex items-center gap-1 flex-wrap">
                                <span className="px-1.5 py-0.5 rounded-md bg-pink-50 text-pink-700 text-[8px] font-mono font-bold uppercase tracking-wider">
                                  {item.category}
                                </span>
                                <span className="px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[8px] font-mono font-bold uppercase tracking-wider">
                                  {item.styleTag}
                                </span>
                              </div>
                              <h4 className="text-[11px] font-bold text-stone-900 mt-1 truncate">
                                {item.title}
                              </h4>
                              <p className="text-[9px] text-stone-550 truncate">
                                {item.description}
                              </p>
                            </div>
                          </div>

                          {/* Quick Interaction Buttons */}
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              onClick={() => {
                                handleTryOnRedirect({
                                  id: item.id,
                                  url: item.image,
                                  original: item.image,
                                  avg_color: "#db2777"
                                }, item.category);
                              }}
                              className="px-3 py-1.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:brightness-110 text-white text-[9.5px] font-mono font-extrabold uppercase rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-sm border border-pink-400/20"
                            >
                              <Sparkles className="w-2.5 h-2.5" /> TRY THIS
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* 3. QUICK VIBE ACCESS CHIPS ELEMENT */}
        <div className="max-w-4xl mx-auto mb-14 bg-white/70 border border-pink-200/50 p-6 rounded-3xl backdrop-blur-md shadow-sm text-center" id="multicultural_style_pills_panel">
          <span className="text-[10px] font-mono tracking-widest text-pink-500 font-extrabold uppercase block mb-4">
            ✦ HIGH STYLING ACCESS SYSTEM ✦
          </span>
          <div className="flex flex-wrap gap-2 justify-center">
            {smartAiCategories.map((chip, idx) => {
              const isSelected = activeCategory.toLowerCase() === chip.toLowerCase();
              return (
                <button
                  key={idx}
                  onClick={() => {
                    handleSearchRun(chip, chip);
                  }}
                  className={`px-4 py-2 rounded-full text-[10.5px] font-black tracking-widest uppercase transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-pink-500 via-pink-600 to-rose-500 text-white border-pink-400 shadow-[0_5px_15px_rgba(255,79,163,0.3)] scale-105"
                      : "bg-pink-50/40 text-stone-700 border border-pink-100 hover:bg-pink-100 hover:text-pink-700 hover:border-pink-300 hover:scale-102"
                  }`}
                >
                  ⚜️ {chip}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. PREMIUM GLASS CELL RESPONSIVE GRID FEED */}
        {loadingSearch ? (
          /* LUXURY SHIMMER PINK SKELETONS */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="search_loading_skeletons">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-pink-150 rounded-3xl p-3 h-[420px] flex flex-col justify-between shadow-sm"
              >
                <div className="w-full pink-shim rounded-2xl h-[300px]" />
                <div className="space-y-2.5 mt-4 p-2">
                  <div className="h-4 pink-shim rounded w-2/3" />
                  <div className="h-3 pink-shim rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : searchResults.length === 0 ? (
          /* AESTHETIC EMPTY FEED BOARD */
          <div className="text-center py-20 border border-dashed border-pink-200 rounded-3xl bg-white shadow-sm p-8 max-w-xl mx-auto">
            <ImageIcon className="w-12 h-12 text-pink-400 mx-auto mb-4 animate-bounce" />
            <h3 className="text-sm font-bold font-mono text-pink-650 uppercase tracking-widest">Start your AI styling journey</h3>
            <p className="text-xs text-stone-605 max-w-xs mx-auto mt-2 leading-relaxed font-semibold">
              Tap any of our fashion category chips above or input custom styling coordinates to synthesize your premier interactive couture lookbook.
            </p>
          </div>
        ) : (
          /* ACTIVE PINTEREST GRID FEED */
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
            id="pexels_fashion_grid"
          >
            {searchResults.map((photo) => {
              const isSaved = !!savedPhotoIds[photo.id];
              const isSavingThis = savingPhotoId === photo.id.toString();
              const displayTag = activeCategory !== 'All' ? activeCategory : (photo.alt?.split(' ')[0] || 'Aesthetic');
              
              // Deconstruct targeted countryStyle, aesthetic, and specific itemCategory tags requested
              const { countryStyle, aesthetic, itemCategory } = getOutfitSubtags(photo.alt, displayTag);

              return (
                <div
                  key={photo.id}
                  className="group relative bg-white/95 border border-pink-200/80 rounded-3xl p-3 overflow-hidden transition-all duration-500 hover:translate-y-[-8px] hover:border-pink-400 hover:shadow-[0_12px_32px_rgba(255,79,163,0.13)] shadow-sm shadow-pink-100"
                >
                  {/* Photo with vertical runway proportion (aspect-2/3) focusing explicitly on apparel garment and models */}
                  <div className="aspect-[2/3] rounded-2xl overflow-hidden relative bg-pink-50">
                    <FashionImage
                      src={photo.url}
                      alt={photo.alt || "Runway Couture Outfit"}
                      className="w-full h-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-110"
                    />

                    {/* Rich Ambient Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    {/* Aesthetic Hot Pink Category Badge */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-pink-100/90 border border-pink-200 text-[8px] font-mono font-bold text-pink-600 uppercase tracking-widest backdrop-blur-md shadow-sm">
                      {itemCategory}
                    </div>

                    {/* Country style tag badge */}
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-rose-100/90 border border-rose-200 text-[8px] font-mono font-bold text-rose-700 uppercase tracking-widest backdrop-blur-md shadow-sm">
                      {countryStyle}
                    </div>

                    {/* AI Recommendation Tag Badge (conforming with clean real label guidelines) */}
                    <div className="absolute top-[42px] right-3 px-2 py-0.5 rounded-md bg-pink-600/90 border border-pink-550 text-[7px] font-mono font-black uppercase tracking-widest backdrop-blur-md shadow-sm flex items-center gap-1 text-white">
                      <Sparkles className="w-2.5 h-2.5 text-white animate-pulse" />
                      AI RECOMMENDED
                    </div>

                    {/* Subtle Fit Scan Status indicator */}
                    <div className="absolute bottom-16 left-3 px-2 py-0.5 rounded-md bg-white/90 border border-pink-200 text-[7px] font-mono text-pink-600 tracking-wider backdrop-blur-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      ✦ SCAN: VIRTUAL_FIT_READY
                    </div>

                    {/* AI Try-On Overlay trigger */}
                    <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 z-10">
                      <button
                        onClick={() => handleTryOnRedirect(photo, itemCategory)}
                        className="flex-grow py-3 bg-gradient-to-r from-pink-500 via-pink-600 to-rose-500 hover:brightness-110 active:scale-95 text-white font-bold text-[9px] tracking-widest uppercase rounded-xl shadow-md shadow-pink-300 cursor-pointer flex items-center justify-center gap-1.5 border border-pink-400 animate-fade-in"
                      >
                        <Shirt className="w-3.5 h-3.5 text-white" />
                        AI Virtual Try-On
                      </button>
                    </div>
                  </div>

                  {/* Editorial Style Wearable Garment Info */}
                  <div className="p-3">
                    <span className="text-[8px] font-mono uppercase text-pink-500 block font-bold mb-1 tracking-wider">
                      {aesthetic}
                    </span>
                    <h3 className="text-xs font-serif font-bold text-stone-900 truncate uppercase tracking-wide" title={photo.alt}>
                      {photo.alt || `${itemCategory} Couture Outfit`}
                    </h3>
                    
                    <div className="mt-2.5 flex items-center justify-between border-t border-pink-100 pt-2.5">
                      <div className="min-w-0">
                        <span className="text-[7px] font-mono uppercase text-stone-400 block font-bold">CREATIVE DESIGNER</span>
                        <a
                          href={photo.photographer_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-stone-605 hover:text-pink-600 transition-colors font-semibold truncate block flex items-center gap-1 cursor-pointer"
                        >
                          {photo.photographer}
                          <ExternalLink className="w-2.5 h-2.5 text-pink-500 flex-shrink-0" />
                        </a>
                      </div>

                      {/* Save look profile board button */}
                      <button
                        type="button"
                        onClick={() => handleSaveLook(photo, itemCategory)}
                        disabled={isSaved || isSavingThis}
                        className={`p-2 rounded-xl transition-all cursor-pointer ${
                          isSaved
                            ? "bg-pink-500 border border-pink-400 text-white shadow-inner"
                            : "bg-pink-50 hover:bg-pink-100 text-pink-500 hover:text-pink-600 border border-pink-100"
                        }`}
                        title="Pin to Saved Looks"
                      >
                        {isSavingThis ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-pink-500" />
                        ) : isSaved ? (
                          <Check className="w-3.5 h-3.5 text-white animate-pulse" />
                        ) : (
                          <Heart className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* PINTEREST-LIKE REGIONAL LOOKBOOK FEEDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 pt-12 border-t border-pink-100">
        <div className="text-center mb-12">
          <span className="text-[10px] font-mono tracking-widest text-pink-500 uppercase font-black">✦ MULTICULTURAL CURATION ✦</span>
          <h2 className="text-3xl font-serif font-black text-stone-900 mt-1 text-shadow-vogue">PINTEREST STYLE TREND LOOKBOOKS</h2>
          <p className="text-xs text-stone-600 mt-2 max-w-lg mx-auto font-medium">
            Browse dynamic real-time lookbooks directly sourced from international fashion catalogs. Instantly try them on or lock their aesthetics.
          </p>
        </div>

        {loadingFeeds ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8" id="regional_lookbooks_loading">
            {[1, 2, 3].map((grp) => (
              <div key={grp} className="space-y-4 animate-pulse">
                <div className="h-6 pink-shim rounded w-1/2 mx-auto" />
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((v) => (
                     <div key={v} className="aspect-[2/3] pink-shim rounded-2xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="regional_lookbooks_grid">
            {/* TRACK 1: TRENDING INDIAN LOOKS */}
            <div className="space-y-6 bg-white border border-pink-200/80 p-4 rounded-3xl shadow-sm shadow-pink-100">
              <div className="flex items-center justify-between border-b border-pink-100 pb-3">
                <span className="text-sm font-serif font-black text-stone-800 flex items-center gap-1.5">
                  <span className="text-pink-500">🇮🇳</span> Trending Indian Looks
                </span>
                <span className="text-[8px] font-mono text-pink-500 uppercase font-bold">Traditional Glam</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {trendingIndian.map((photo) => {
                  const { countryStyle, aesthetic, itemCategory } = getOutfitSubtags(photo.alt, "Indian");
                  const isSaved = !!savedPhotoIds[photo.id];
                  return (
                    <div key={photo.id} className="group relative bg-pink-50/20 rounded-2xl overflow-hidden border border-pink-100 hover:border-pink-300 hover:shadow-sm transition-all">
                      <div className="aspect-[2/3] relative overflow-hidden bg-pink-50">
                        <FashionImage src={photo.url} alt={photo.alt || "Indian Couture Outfit"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent opacity-90 animate-none" />
                        <div className="absolute bottom-2 inset-x-2 text-left">
                          <span className="text-[7px] font-mono text-pink-500 uppercase tracking-wider block font-bold">{itemCategory}</span>
                          <span className="text-[9px] font-bold text-stone-800 block truncate leading-tight">{photo.alt || 'Ethnic attire'}</span>
                        </div>
                      </div>
                      <div className="p-2 flex items-center justify-between bg-white border-t border-pink-100">
                        <button onClick={() => handleTryOnRedirect(photo, itemCategory)} className="text-[8px] font-mono font-black text-pink-500 hover:text-pink-600 uppercase tracking-widest cursor-pointer hover:underline">
                          Try-On ✦
                        </button>
                        <button onClick={() => handleSaveLook(photo, itemCategory)} className="text-pink-400 hover:text-pink-600 cursor-pointer">
                          <Heart className={`w-3 h-3 ${isSaved ? 'fill-pink-500 text-pink-500' : ''}`} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TRACK 2: TRENDING KOREAN FITS */}
            <div className="space-y-6 bg-white border border-pink-200/80 p-4 rounded-3xl shadow-sm shadow-pink-100">
              <div className="flex items-center justify-between border-b border-pink-100 pb-3">
                <span className="text-sm font-serif font-black text-stone-800 flex items-center gap-1.5">
                  <span className="text-pink-500">🇰🇷</span> Trending Korean Fits
                </span>
                <span className="text-[8px] font-mono text-pink-500 uppercase font-bold">K-Wave Minimalist</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {trendingKorean.map((photo) => {
                  const { countryStyle, aesthetic, itemCategory } = getOutfitSubtags(photo.alt, "Korean");
                  const isSaved = !!savedPhotoIds[photo.id];
                  return (
                    <div key={photo.id} className="group relative bg-pink-50/20 rounded-2xl overflow-hidden border border-pink-100 hover:border-pink-300 hover:shadow-sm transition-all">
                      <div className="aspect-[2/3] relative overflow-hidden bg-pink-50">
                        <FashionImage src={photo.url} alt={photo.alt || "Korean Custom Fit"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent opacity-90 animate-none" />
                        <div className="absolute bottom-2 inset-x-2 text-left">
                          <span className="text-[7px] font-mono text-pink-500 uppercase tracking-wider block font-bold">{itemCategory}</span>
                          <span className="text-[9px] font-bold text-stone-800 block truncate leading-tight">{photo.alt || 'K-Wave Outfit'}</span>
                        </div>
                      </div>
                      <div className="p-2 flex items-center justify-between bg-white border-t border-pink-100">
                        <button onClick={() => handleTryOnRedirect(photo, itemCategory)} className="text-[8px] font-mono font-black text-pink-500 hover:text-pink-600 uppercase tracking-widest cursor-pointer hover:underline">
                          Try-On ✦
                        </button>
                        <button onClick={() => handleSaveLook(photo, itemCategory)} className="text-pink-400 hover:text-pink-600 cursor-pointer">
                          <Heart className={`w-3 h-3 ${isSaved ? 'fill-pink-500 text-pink-500' : ''}`} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TRACK 3: TRENDING WESTERN STYLES */}
            <div className="space-y-6 bg-white border border-pink-200/80 p-4 rounded-3xl shadow-sm shadow-pink-100">
              <div className="flex items-center justify-between border-b border-pink-100 pb-3">
                <span className="text-sm font-serif font-black text-stone-800 flex items-center gap-1.5">
                  <span className="text-pink-500">✨</span> Trending Western Styles
                </span>
                <span className="text-[8px] font-mono text-pink-500 uppercase font-bold">Elite Coordinates</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {trendingWestern.map((photo) => {
                  const { countryStyle, aesthetic, itemCategory } = getOutfitSubtags(photo.alt, "Western");
                  const isSaved = !!savedPhotoIds[photo.id];
                  return (
                    <div key={photo.id} className="group relative bg-pink-50/20 rounded-2xl overflow-hidden border border-pink-100 hover:border-pink-300 hover:shadow-sm transition-all">
                      <div className="aspect-[2/3] relative overflow-hidden bg-pink-50">
                        <FashionImage src={photo.url} alt={photo.alt || "Western Classic Outfit"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent opacity-90 animate-none" />
                        <div className="absolute bottom-2 inset-x-2 text-left">
                          <span className="text-[7px] font-mono text-pink-500 uppercase tracking-wider block font-bold">{itemCategory}</span>
                          <span className="text-[9px] font-bold text-stone-800 block truncate leading-tight">{photo.alt || 'Western coord'}</span>
                        </div>
                      </div>
                      <div className="p-2 flex items-center justify-between bg-white border-t border-pink-100">
                        <button onClick={() => handleTryOnRedirect(photo, itemCategory)} className="text-[8px] font-mono font-black text-pink-500 hover:text-pink-600 uppercase tracking-widest cursor-pointer hover:underline">
                          Try-On ✦
                        </button>
                        <button onClick={() => handleSaveLook(photo, itemCategory)} className="text-pink-400 hover:text-pink-600 cursor-pointer">
                          <Heart className={`w-3 h-3 ${isSaved ? 'fill-pink-500 text-pink-500' : ''}`} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>
       {/* 5. INTERACTIVE COGNITIVE TREND ANALYSIS (Vogue Edition) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-28 bg-white border border-pink-250 rounded-3xl p-8 relative overflow-hidden shadow-lg shadow-pink-100">
        {/* Pink Glow Accent */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-pink-300/10 blur-[80px]" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-pink-100 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[9px] font-mono tracking-widest text-pink-550 uppercase mb-2 font-bold">
              <TrendingUp className="w-3 h-3 text-pink-500" />
              Intelligence Runway Trend Report
            </div>
            <h3 className="text-2xl font-serif font-black text-stone-900 italic">
              {trendsLoading ? 'Decoding Fashion Trends...' : trends?.seasonTitle}
            </h3>
          </div>
          <div className="text-[9px] font-mono text-pink-500 font-bold">
            METRICS REFRESHED VIA GEMINI SECURED API
          </div>
        </div>

        {trendsLoading ? (
          <div className="space-y-4">
            <div className="h-6 pink-shim rounded w-1/3" />
            <div className="h-4 pink-shim rounded w-full" />
            <div className="h-4 pink-shim rounded w-5/6" />
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <span className="text-[9px] font-mono uppercase tracking-widest text-pink-500 block mb-2 font-black">SEASON CORE DIRECTIONS</span>
              <p className="text-sm text-stone-750 font-semibold italic">“ {trends?.globalCoreTrend} ”</p>
            </div>

            <div className="space-y-4 pt-2">
              <span className="text-[9px] font-mono uppercase tracking-widest text-pink-500 block font-black">KEY HIGHLIGHTS</span>
              <div className="grid sm:grid-cols-3 gap-4">
                {trends?.bulletins.map((item, idx) => (
                  <div key={idx} className="bg-pink-50/50 p-4 rounded-2xl border border-pink-150">
                    <h5 className="text-xs font-bold text-stone-900 mb-2">{item.headline}</h5>
                    <p className="text-[10px] text-stone-605 leading-relaxed font-medium">{item.details}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-pink-100">
              <span className="text-[9px] font-mono uppercase tracking-widest text-pink-500 block mb-3 font-black">HIGH-STATUS PALETTE</span>
              <div className="grid sm:grid-cols-3 gap-3">
                {trends?.colorPalette.map((col, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-pink-150 hover:border-pink-300 transition-all shadow-sm"
                  >
                    <div
                      className="w-8 h-8 rounded-lg shadow-inner flex-shrink-0"
                      style={{ backgroundColor: col.hex }}
                    />
                    <div>
                      <span className="block text-xs font-bold text-stone-850">{col.color}</span>
                      <span className="text-[9px] font-mono tracking-wider text-pink-530/80 font-semibold">{col.relevance}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 6. BEAUTIFUL PREMIUM FOOTER WITH SHADOWS */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32 pt-12 border-t border-pink-200 relative z-10" id="fashion_brand_footer">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <span className="text-lg font-bold tracking-widest bg-gradient-to-r from-stone-900 via-pink-650 to-rose-600 bg-clip-text text-transparent font-display uppercase">
              FITVERSE <span className="text-pink-550 font-serif italic normal-case text-shadow-vogue">Couture</span>
            </span>
            <p className="text-[11px] text-stone-500 leading-relaxed font-semibold">
              Crafting virtual looms driven by Gemini Intelligence, high fidelity design systems, and Pinterest-grade wardrobes.
            </p>
          </div>
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-pink-500 font-mono">Runway Systems</h5>
            <ul className="space-y-1.5 text-[11px] text-stone-600 font-medium">
              <li><button onClick={() => setActiveTab('tryon')} className="hover:text-pink-600 cursor-pointer">AI Fitting Room</button></li>
              <li><button onClick={() => setActiveTab('recommendations')} className="hover:text-pink-600 cursor-pointer">Advisory Suite</button></li>
              <li><button onClick={() => setActiveTab('bodyfit')} className="hover:text-pink-600 cursor-pointer">Sizing Matrices</button></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-pink-500 font-mono">Explore Vibe</h5>
            <ul className="space-y-1.5 text-[11px] text-stone-600 font-medium">
              <li><button onClick={() => { setSearchQuery('Barbiecore'); handleSearchRun('Barbiecore', 'Barbiecore') }} className="hover:text-pink-600 cursor-pointer">Barbiecore Selection</button></li>
              <li><button onClick={() => { setSearchQuery('Old Money'); handleSearchRun('Old Money', 'Old Money') }} className="hover:text-pink-600 cursor-pointer">Classic Linen</button></li>
              <li><button onClick={() => { setSearchQuery('Y2K'); handleSearchRun('Y2K', 'Y2K') }} className="hover:text-pink-650 cursor-pointer text-pink-600 font-semibold">Hyper Y2K Lookbook</button></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-pink-500 font-mono">Encrypted Security</h5>
            <div className="p-3 bg-pink-50 rounded-xl border border-pink-150 text-[10px] text-stone-600 flex gap-2 items-center font-medium">
              <ShieldCheck className="w-4 h-4 text-pink-550 flex-shrink-0" />
              <span>Face uploads secure, deleted immediately on session release.</span>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-pink-150 text-center text-[10px] text-stone-500 font-mono flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>© 2026 FITVERSE COUTURE AI SYSTEMS. ALL REIGNS RESERVED.</span>
          <div className="flex gap-4">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-pink-500"><Instagram className="w-4 h-4" /></a>
            <span className="text-pink-500/35">|</span>
            <span className="uppercase text-pink-550 font-bold tracking-widest text-[8px]">EST. 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
