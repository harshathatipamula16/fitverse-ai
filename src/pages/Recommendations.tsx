import { useState, useEffect, useTransition } from 'react';
import { useApp } from '../context/AppContext.js';
import { api, Recommendation } from '../services/api.js';
import { Palette, Sparkles, AlertTriangle, CheckCircle, Flame, History, Briefcase, HelpCircle, Heart, Eye, Loader2, RefreshCw } from 'lucide-react';
import * as pexelsService from '../services/pexelsService.js';
import { recommendationMappings } from '../data/recommendationMappings.js';

export default function Recommendations() {
  const { user, addToast, setActiveTab } = useApp();
  const [skinTone, setSkinTone] = useState('Medium Warmth');
  const [gender, setGender] = useState('women');
  const [occasion, setOccasion] = useState('date');
  const [category, setCategory] = useState('Traditional');
  const [activeTrends, setActiveTrends] = useState(['Barbiecore Pink Accents', 'Old Money Tailoring']);

  const categories = ['Traditional', 'Wedding', 'Office', 'College', 'Casual', 'Luxury', 'Streetwear', 'Korean Fusion', 'Indo-Western'];

  // Results
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<Recommendation | null>(null);
  const [archived, setArchived] = useState<Recommendation[]>([]);
  const [apiBusyError, setApiBusyError] = useState(false);
  const [, startTransition] = useTransition();

  // Pexels Integration States
  const [pexelsOutfits, setPexelsOutfits] = useState<any[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [savingPhotoId, setSavingPhotoId] = useState<string | null>(null);
  const [savedPhotoIds, setSavedPhotoIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (result) {
      const fetchRecommendationOutfits = async () => {
        setPexelsOutfits([]); // Clear previous images to trigger elegant loading skeleton
        setLoadingPhotos(true);
        try {
          const aesthetic = result.trends[0] || 'fashion';
          const photos = await pexelsService.getRecommendationOutfits(
            aesthetic,
            gender,
            occasion,
            'Hourglass/Athletic'
          );
          setPexelsOutfits(photos.slice(0, 4));
        } catch (e) {
          console.error('Failed to resolve recommendation outfit photos:', e);
        } finally {
          setLoadingPhotos(false);
        }
      };
      fetchRecommendationOutfits();
    } else {
      setPexelsOutfits([]);
    }
  }, [result]);

  const handleSaveLook = async (photo: any, tag: string) => {
    if (!user) {
      addToast('Authenticate to lock this look into your profile boards.', 'info');
      setActiveTab('login');
      return;
    }

    setSavingPhotoId(photo.id.toString());
    try {
      await api.saveLook({
        userId: user.id,
        title: `${tag} Premium Coord`,
        description: `Source image by ${photo.photographer || 'Photographer'}. Curated dynamically from Pexels API recommendations.`,
        category: tag,
        imageBefore: photo.url,
        imageAfter: photo.url,
        fashionScore: 98,
        tags: [tag, 'Pexels API', 'AI Harmony'],
        caption: `AI harmonized fashion discovery featuring #Barbiecore ${tag.toLowerCase()} aesthetics.`
      });

      setSavedPhotoIds(prev => ({ ...prev, [photo.id]: true }));
      addToast('Couture look pinned to your Saved Looks!', 'success');
    } catch (err) {
      addToast('Failed to pin look securely.', 'error');
    } finally {
      setSavingPhotoId(null);
    }
  };

  const handleTryOnRedirect = (photo: any, tag: string) => {
    try {
      const tryonPayload = {
        id: 'pexels-' + photo.id,
        url: photo.original || photo.url,
        name: `${tag} Silhouette ` + photo.id.toString().substring(0, 4),
        category: 'partywear',
        style: tag,
        avg_color: photo.avg_color || '#db2777',
        tag: tag
      };

      localStorage.setItem('selected_tryon_outfit', JSON.stringify(tryonPayload));
      addToast('Model synced to AI Tryon scanner.', 'success');
      setActiveTab('tryon');
    } catch (err) {
      addToast('Error parsing visual model assets.', 'error');
    }
  };

  const skinTones = [
    'Fair/Light Cold',
    'Fair Light Neutral',
    'Medium Warmth',
    'Olive Undertone',
    'Tan Sun-Golden',
    'Dark Rich Obsidian'
  ];

  const occasions = [
    { id: 'wedding', label: 'Wedding Festive Glam' },
    { id: 'office', label: 'Office Corporate Chic' },
    { id: 'college', label: 'College Streetwear' },
    { id: 'date', label: 'Romantic Sparkle Date' },
    { id: 'interview', label: 'Vogue Editorial Interview' },
    { id: 'gym', label: 'Gym Coquette Athletics' },
    { id: 'vacation', label: 'Coastal Cannes Vacation' },
    { id: 'party', label: 'Barbiecore Night Clubbing' }
  ];

  useEffect(() => {
    if (user) {
      api.getStoredRecommendations(user.id)
        .then((data) => setArchived(data))
        .catch(() => {});
    }
  }, [user, result]);

  const generateLocalRecommendations = (skinToneStr: string, genderStr: string, occasionStr: string) => {
    const idToTitleMap: Record<string, string> = {
      'wedding': 'Wedding Festive Glam',
      'office': 'Office Corporate Chic',
      'college': 'College Streetwear',
      'date': 'Romantic Sparkle Date',
      'interview': 'Vogue Editorial Interview',
      'gym': 'Gym Coquette Athletics',
      'vacation': 'Coastal Cannes Vacation',
      'party': 'Barbiecore Night Clubbing'
    };

    const title = idToTitleMap[occasionStr] || 'Romantic Sparkle Date';
    const mapping = recommendationMappings[title];
    const genderMap = mapping ? mapping[genderStr as 'women' | 'men'] : null;

    if (genderMap) {
      return {
        id: 'local-rec-' + Math.random().toString(36).substring(2, 9),
        userId: user?.id || 'anonymous',
        skinTone: skinToneStr,
        gender: genderStr,
        occasion: occasionStr,
        trends: genderMap.trends,
        matchingColors: genderMap.colors,
        avoidColors: genderMap.avoidColors,
        suggestedStyles: genderMap.suggestedStyles,
        timestamp: new Date().toISOString()
      };
    }

    return {
      id: 'local-rec-fallback',
      userId: user?.id || 'anonymous',
      skinTone: skinToneStr,
      gender: genderStr,
      occasion: occasionStr,
      trends: ['Gothic Minimalism Blend', 'Eco-Tech Performance Fabrics'],
      matchingColors: [
        { name: 'Astral Lilac', hex: '#b3a8eb', desc: 'Adds soft luminance complementing your skin undertones.' },
        { name: 'Glitch Emerald', hex: '#10b981', desc: 'Incredibly neat contrast shade establishing high style stature.' }
      ],
      avoidColors: ['Faded Sand Yellow', 'Muted Grey'],
      suggestedStyles: [
        {
          title: 'Deconstructed Imperial Drape',
          desc: 'A futuristic luxury setup pairing fine linen weaves with custom accessories to optimize style stature.',
          items: ['Cyber lapel tailoring top', 'Asymmetric black cargo boot-cut', 'Chunky matte graphite sneakers', 'Textured wet-look high sweep']
        }
      ],
      timestamp: new Date().toISOString()
    };
  };

  const runRecommendation = async () => {
    setGenerating(true);
    setResult(null);
    setPexelsOutfits([]); // Clear previous images immediately so skeleton loader engages
    setApiBusyError(false);

    const apiCallPromise = api.generateRecommendation({
      userId: user?.id || 'anonymous',
      skinTone,
      gender,
      occasion,
      trends: activeTrends
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), 6500)
    );

    try {
      addToast('Drafting your couture styling locally...', 'info');
      
      const response = await Promise.race([apiCallPromise, timeoutPromise]);

      if (response && (response as any).apiBusy) {
        const localRec = generateLocalRecommendations(skinTone, gender, occasion);
        setResult(localRec);
        addToast('Bespoke local color harmony generated!', 'success');
      } else {
        setResult(response);
        addToast('Smart Color harmony recommendation rendered!', 'success');
      }
    } catch (err: any) {
      console.warn('Recommendation server call failed. Loaded custom local dataset:', err.message || err);
      const localRec = generateLocalRecommendations(skinTone, gender, occasion);
      setResult(localRec);
      addToast('Indian-fusion local styling coords drafted!', 'success');
    } finally {
      setGenerating(false);
    }
  };

  // Automated live harmonization draft generation on control shift or load
  useEffect(() => {
    runRecommendation();
  }, [gender, occasion, skinTone, category]);


  return (
    <div className="pt-24 pb-16 min-h-screen text-stone-800" id="recommendations_page_view">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        
        {/* Title / Header */}
        <div className="border-b border-pink-100 pb-6 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-100 border border-pink-300 text-[10px] font-mono font-bold uppercase text-pink-650 rounded-full mb-3 shadow-[0_4px_15px_rgba(255,79,163,0.12)]">
            <Palette className="w-3.5 h-3.5 text-pink-500 animate-pulse" /> CHROMATIC INTELLIGENCE
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-stone-900 tracking-tight">SMART COLOR HARMONY</h1>
          <p className="text-xs text-stone-600 mt-1 font-medium">Discover curated, luxury-grade color coordinate maps tailored meticulously to your skin undertone characteristics.</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* LEFT: Controls FORM (Span 4) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-pink-200/80 shadow-sm space-y-6">
              <h3 className="text-xs font-mono font-bold text-pink-600 uppercase tracking-widest flex items-center gap-1.5 border-b border-pink-100 pb-3">
                <Briefcase className="w-4 h-4 text-pink-500" />
                CONCIERGE INPUTS
              </h3>

              {/* Skin tone selection */}
              <div>
                <label className="block text-[10px] font-mono text-stone-500 uppercase mb-2 tracking-wider font-bold">Skin Complexion Tone</label>
                <div className="grid grid-cols-2 gap-2">
                  {skinTones.map((tone) => (
                    <button
                      key={tone}
                      type="button"
                      onClick={() => setSkinTone(tone)}
                      className={`p-2.5 text-[11px] text-left font-bold rounded-xl border transition-all truncate cursor-pointer ${
                        skinTone === tone
                          ? 'border-pink-500 bg-gradient-to-r from-pink-500 to-rose-455 text-white font-extrabold'
                          : 'border-pink-100 bg-pink-50/50 text-stone-600 hover:text-pink-600 hover:border-pink-300'
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gender selector */}
              <div>
                <label className="block text-[10px] font-mono text-stone-500 uppercase mb-2 tracking-wider font-bold">Aesthetic Gender</label>
                <div className="grid grid-cols-2 gap-1.5 bg-pink-50/55 p-1 rounded-xl border border-pink-100">
                  <button
                    type="button"
                    onClick={() => setGender('women')}
                    className={`py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                      gender === 'women' ? 'bg-gradient-to-r from-pink-500 to-rose-455 text-white shadow-sm' : 'text-stone-500 hover:text-pink-600'
                    }`}
                  >
                    Women Fits
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('men')}
                    className={`py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                      gender === 'men' ? 'bg-gradient-to-r from-pink-500 to-rose-455 text-white shadow-sm' : 'text-stone-500 hover:text-pink-600'
                    }`}
                  >
                    Men Fits
                  </button>
                </div>
              </div>

              {/* Style Category selector */}
              <div>
                <label className="block text-[10px] font-mono text-stone-500 uppercase mb-2 tracking-wider font-bold">Style Category Filter</label>
                <div className="flex flex-wrap gap-1.5 p-1 bg-pink-50/55 rounded-xl border border-pink-100 max-h-[140px] overflow-y-auto pr-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1.5 text-[11px] font-bold rounded-lg cursor-pointer transition-all ${
                        category === cat 
                          ? 'bg-gradient-to-r from-pink-500 to-rose-455 text-white shadow-sm' 
                          : 'bg-white text-stone-600 border border-pink-100 hover:text-pink-600 hover:border-pink-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Occasion list */}
              <div>
                <label className="block text-[10px] font-mono text-stone-500 uppercase mb-2 tracking-wider font-bold">Upcoming Occasion</label>
                <div className="space-y-1 max-h-[160px] overflow-y-auto pr-1">
                  {occasions.map((occ) => (
                    <button
                      key={occ.id}
                      type="button"
                      onClick={() => setOccasion(occ.id)}
                      className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        occasion === occ.id
                          ? 'border-pink-350 bg-pink-50 text-pink-600'
                          : 'border-transparent bg-transparent text-stone-600 hover:text-pink-600 hover:bg-pink-50/50'
                      }`}
                    >
                      <span>{occ.label}</span>
                      {occasion === occ.id && <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Run Trigger btn */}
              <button
                onClick={runRecommendation}
                disabled={generating}
                className="w-full py-4 bg-gradient-to-r from-pink-550 via-rose-450 to-pink-600 text-white font-bold text-xs tracking-widest uppercase shadow-md shadow-pink-100/50 hover:brightness-110 active:scale-97 transition-all cursor-pointer border border-pink-400/20"
              >
                <Sparkles className="w-4.5 h-4.5 animate-pulse text-white inline mr-1" />
                DRAFT COLOR SCHEME
              </button>
            </div>
          </div>

          {/* RIGHT: Assessment Display (Span 8) */}
          <div className="lg:col-span-8 space-y-6">
            
            {generating ? (
              /* LOADER SHADOW */
              <div className="bg-white border border-pink-200 rounded-3xl p-16 text-center flex flex-col items-center justify-center space-y-4 shadow-sm">
                <Palette className="w-10 h-10 text-pink-500 animate-spin" />
                <h4 className="text-sm font-mono text-pink-600 uppercase tracking-widest font-black">STULTIFYING CHROMATIC MAPS</h4>
                <p className="text-xs text-stone-500 max-w-xs leading-relaxed font-semibold">Querying Sasha AI Stylist to balance skin tone indices and coordinate luxury wardrobe palettes...</p>
              </div>
            ) : apiBusyError ? (
              /* GRACIOUS CONGESTION CORNER MAPS */
              <div className="bg-white border border-pink-200 rounded-3xl p-8 text-center flex flex-col justify-center items-center space-y-6 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center border border-pink-200">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-bold font-mono text-pink-600 tracking-wider">AI STYLE SERVICE CONGESTED</h3>
                  <p className="text-xs text-stone-600 font-semibold max-w-sm leading-relaxed text-center">
                    AI styling service is temporarily busy. Please try again shortly.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={() => {
                      setApiBusyError(false);
                      runRecommendation();
                    }}
                    className="px-5 py-3 bg-gradient-to-r from-pink-500 to-rose-455 text-white text-[10px] font-mono font-bold rounded-2xl tracking-widest uppercase hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-sm border border-pink-400"
                  >
                    RETRY DRAFTING
                  </button>
                  <button
                    onClick={() => {
                      setApiBusyError(false);
                      // Fallback with realistic styling concepts straight away to prevent blocking
                      setResult({
                        id: 'mock-rec',
                        userId: user?.id || 'anonymous',
                        skinTone,
                        gender,
                        occasion,
                        trends: ['Cyber Punk Minimalist', 'High-Status activewear comfort'],
                        matchingColors: [
                          { name: 'Ultra Slate Gray', hex: '#4a5568', desc: 'Complements the undertones of your complexion elegantly.' },
                          { name: 'Barbiecore Neon Pink', hex: '#ff007f', desc: 'Injects vibrant visual energy suited specifically for the selected occasion.' }
                        ],
                        avoidColors: ['Muted Sand Yellow', 'Olive Drab'],
                        suggestedStyles: [
                          {
                            title: 'Deconstructed Imperial Drape Ensembles',
                            desc: 'A futuristic setup pairing structured drapes with custom overlays.',
                            items: ['Drape jacket', 'Cyber boot-cut trousers', 'Sneakers with metal details']
                          }
                        ],
                        timestamp: new Date().toISOString()
                      });
                      addToast('Loaded high-fashion offline mock recommendations.', 'info');
                    }}
                    className="px-5 py-3 bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-650 text-[10px] font-mono font-bold rounded-2xl tracking-widest uppercase transition-all cursor-pointer"
                  >
                    VIEW OFFLINE DESIGN
                  </button>
                </div>
              </div>
            ) : result ? (
              /* RESULT VIEW PANELS */
              <div className="space-y-6">
                
                {/* 1. MATCHING COLOR CARDS */}
                <div className="bg-white border border-pink-200 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-pink-500" />
                    <h3 className="text-sm font-serif font-black tracking-wide uppercase text-stone-850">RECOMMENDED COUTURE COHORTS</h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {result.matchingColors.map((col, idx) => (
                      <div
                        key={idx}
                        className="bg-pink-50/40 p-4 rounded-2xl border border-pink-150 flex gap-4 hover:border-pink-300 hover:bg-white transition-all cursor-pointer group"
                      >
                        <div
                          className="w-14 h-14 rounded-xl shadow-inner border border-pink-200 flex-shrink-0 group-hover:scale-105 transition-transform"
                          style={{ backgroundColor: col.hex }}
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-black text-stone-850 block">{col.name}</span>
                          <span className="text-[10px] font-mono text-pink-600 font-bold block mt-0.5">{col.hex}</span>
                          <p className="text-[11px] text-stone-500 mt-1 leading-relaxed font-semibold">{col.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. COLORS TO AVOID */}
                <div className="bg-white border border-pink-200 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                    <h3 className="text-sm font-mono font-bold tracking-widest uppercase text-rose-600">
                      COLORS TO AVOID
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {result.avoidColors.map((col, idx) => (
                      <span
                        key={idx}
                        className="px-3.5 py-1.5 rounded-xl bg-pink-50 text-pink-600 border border-pink-150 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                        {col}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 3. SUGGESTED STYLES LISTS */}
                <div className="bg-white border border-pink-200 rounded-3xl p-6 space-y-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-pink-500 animate-spin" />
                    <h3 className="text-sm font-serif font-black tracking-wide uppercase text-stone-850">
                      AI STYLE ENSEMBLES
                    </h3>
                  </div>

                  {result.suggestedStyles.map((sty, idx) => (
                    <div key={idx} className="bg-pink-50/30 p-5 rounded-2xl border border-pink-150 space-y-4">
                      <div>
                        <h4 className="text-sm font-bold text-stone-850">{sty.title}</h4>
                        <p className="text-xs text-stone-600 leading-relaxed mt-1 font-medium">{sty.desc}</p>
                      </div>

                      <div className="border-t border-pink-100 pt-4">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-pink-600 block mb-3 font-bold">
                          HOLISTIC ACCESSORIZING MATRIX
                        </span>
                        
                        <div className="grid sm:grid-cols-2 gap-3">
                          {sty.items.map((it, itemIdx) => (
                            <div key={itemIdx} className="flex items-start gap-2.5 text-xs text-stone-700 font-semibold">
                              <span className="w-4 h-4 rounded-full bg-white border border-pink-200 text-pink-500 flex items-center justify-center text-[10px] font-mono flex-shrink-0 mt-0.5 font-bold">✓</span>
                              <span>{it}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 3.5 Dynamic Pexels matching garments display */}
                <div className="bg-white border border-pink-200 rounded-3xl p-6 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-pink-100 pb-3 mb-2">
                    <div className="flex items-center gap-2">
                      <Palette className="w-5 h-5 text-pink-500 animate-pulse" />
                      <h3 className="text-sm font-serif font-black tracking-wide uppercase text-stone-850">
                        VOGUE RECOMMENDED REAL OUTFITS
                      </h3>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-pink-500 uppercase">
                      Curated from Pexels API
                    </span>
                  </div>

                  {loadingPhotos ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[1,2,3,4].map(idx => (
                        <div key={idx} className="aspect-[3/4] bg-gradient-to-br from-stone-50 via-pink-50/25 to-stone-100/55 rounded-3xl animate-pulse border border-pink-100/50 flex flex-col justify-end p-4 space-y-2">
                          <div className="h-2 w-12 bg-pink-200/50 rounded-full" />
                          <div className="h-3 w-3/4 bg-stone-200 rounded-full" />
                          <div className="h-2 w-1/2 bg-stone-150 rounded-full" />
                        </div>
                      ))}
                    </div>
                  ) : pexelsOutfits.length === 0 ? (
                    <p className="text-xs text-stone-500 font-mono text-center py-4">No matching photographic outfits found.</p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {pexelsOutfits.map((photo) => {
                        const isPinned = !!savedPhotoIds[photo.id];
                        const isPinning = savingPhotoId === photo.id.toString();

                        return (
                          <div
                            key={photo.id}
                            className="group relative bg-pink-105 rounded-3xl overflow-hidden border border-pink-150 hover:border-pink-300 hover:shadow-md transition-all cursor-pointer aspect-[3/4]"
                          >
                            <img
                              src={photo.url}
                              alt={photo.alt}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                            {/* Info card absolute overlay */}
                            <div className="absolute bottom-0 inset-x-0 p-4 flex flex-col justify-end space-y-2 text-left">
                              <div>
                                <span className="text-[8px] font-mono text-pink-300 uppercase tracking-widest font-black block">
                                  # {result?.trends[0] || 'aesthetic'}
                                </span>
                                <h4 className="text-[10px] font-bold text-white truncate mt-0.5" title={photo.alt}>
                                  {photo.alt ? (photo.alt.length > 20 ? photo.alt.substring(0, 18) + '...' : photo.alt) : 'Outfit Look'}
                                </h4>
                                <a
                                  href={photo.photographer_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[8px] text-pink-200 hover:underline hover:text-white block truncate font-mono mt-0.5"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  by {photo.photographer} 📸
                                </a>
                              </div>

                              {/* Interactive HUD Actions button */}
                              <div className="flex gap-2 pt-1 font-bold">
                                <button
                                  onClick={() => handleTryOnRedirect(photo, result?.trends[0] || 'Aesthetic')}
                                  className="flex-grow py-1.5 bg-gradient-to-r from-pink-500 to-rose-450 hover:brightness-115 text-white font-bold text-[8.5px] tracking-wider uppercase rounded-xl flex items-center justify-center gap-1 transition-all"
                                >
                                  <Eye className="w-2.5 h-2.5" />
                                  Try On
                                </button>
                                <button
                                  onClick={() => handleSaveLook(photo, result?.trends[0] || 'Aesthetic')}
                                  disabled={isPinning || isPinned}
                                  className={`p-1.5 rounded-xl border flex items-center justify-center transition-all ${
                                    isPinned 
                                      ? 'bg-pink-500/20 border-pink-500/40 text-pink-300' 
                                      : 'bg-stone-950/70 border-white/20 hover:border-pink-300 text-pink-100 hover:text-white'
                                  }`}
                                >
                                  {isPinning ? (
                                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                  ) : (
                                    <Heart className="w-2.5 h-2.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 4. ACTIVE RUNWAY TRENDS MOUNT */}
                <div className="bg-white border border-pink-200 p-5 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-pink-600 block uppercase mb-1 font-bold">
                      Runway Trend Alignment
                    </span>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {result.trends.map((tr, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-pink-50 border border-pink-150 text-[10px] font-mono font-bold text-pink-600 uppercase rounded-lg">
                          # {tr}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setResult(null);
                      addToast('Reset completed.', 'info');
                    }}
                    className="self-end px-5 py-2.5 bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-2xl text-xs font-mono font-bold uppercase tracking-widest transition-colors text-pink-600 hover:text-pink-705 cursor-pointer"
                  >
                    RESET
                  </button>
                </div>
              </div>
            ) : (
              /* EMPTY BOARD */
              <div className="border border-pink-250 border-dashed rounded-3xl flex flex-col justify-center items-center text-center p-12 text-stone-500 aspect-[4/3] bg-white shadow-sm shadow-pink-50/50">
                <HelpCircle className="w-12 h-12 text-pink-400 mb-4 animate-bounce" />
                <h3 className="text-sm font-bold font-mono text-pink-600 tracking-wider">AWAITING CHROMATIC HARMONIZATION</h3>
                <p className="text-xs text-stone-500 max-w-xs leading-relaxed mt-2 font-semibold">
                  Match your skin tone undertones, aesthetic fit directives, and upcoming scenario, then click DRAFT COLOR SCHEME to load coordinates.
                </p>
              </div>
            )}

            {/* Archive advices */}
            {user && archived.length > 0 && (
              <div className="pt-8 border-t border-pink-150 space-y-4">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-pink-500 animate-pulse" />
                  <h3 className="text-sm font-serif font-black text-stone-900">HISTORIC ADVICE DIGESTS</h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {archived.slice(0, 4).map((rec) => (
                    <div
                      key={rec.id}
                      onClick={() => startTransition(() => setResult(rec))}
                      className="bg-white hover:bg-pink-50/40 border border-pink-150 hover:border-pink-300 rounded-2xl p-4 transition-all cursor-pointer space-y-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-pink-600 uppercase tracking-widest font-bold">
                          Scenario: {rec.occasion}
                        </span>
                        <span className="text-[9px] font-mono text-stone-500">
                          {new Date(rec.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-stone-800 font-bold truncate">
                        Complexion: {rec.skinTone}
                      </p>
                      
                      {/* Grid representation of matched colors */}
                      <div className="flex gap-2.5">
                        {rec.matchingColors.map((c, i) => (
                          <div
                            key={i}
                            className="w-5 h-5 rounded-lg border border-pink-200 shadow-inner"
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
