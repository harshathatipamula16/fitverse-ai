import { useState, useEffect, useTransition } from 'react';
import { useApp } from '../context/AppContext.js';
import { api, BodyFitSuggestion } from '../services/api.js';
import { Settings, Sparkles, Scale, Info, History, BookmarkCheck, CheckCircle2 } from 'lucide-react';
import * as pexelsService from '../services/pexelsService.js';

export default function Bodyfit() {
  const { user, syncProfile, addToast, setActiveTab } = useApp();
  
  // States
  const [height, setHeight] = useState(175); // cm
  const [weight, setWeight] = useState(65); // kg
  const [bodyShape, setBodyShape] = useState('Hourglass');

  // Outputs
  const [generating, setGenerating] = useState(false);
  const [fitResult, setFitResult] = useState<BodyFitSuggestion | null>(null);
  const [fitHistory, setFitHistory] = useState<BodyFitSuggestion[]>([]);
  const [apiBusyError, setApiBusyError] = useState(false);
  const [, startTransition] = useTransition();

  // Pexels Body Fit States
  const [pexelsOutfits, setPexelsOutfits] = useState<any[]>([]);
  const [loadingPexels, setLoadingPexels] = useState(false);

  useEffect(() => {
    if (fitResult) {
      const fetchPexelsBodyFit = async () => {
        setLoadingPexels(true);
        try {
          const matchingPhotos = await pexelsService.getBodyFitOutfits(bodyShape);
          setPexelsOutfits(matchingPhotos.slice(0, 4));
        } catch (e) {
          console.error('Failed to seek Pexels body fit photos', e);
        } finally {
          setLoadingPexels(false);
        }
      };
      fetchPexelsBodyFit();
    } else {
      setPexelsOutfits([]);
    }
  }, [fitResult]);

  const bodyShapes = [
    { label: 'Hourglass Balanced', id: 'Hourglass', desc: 'Symmetrical voluptuous curves.' },
    { label: 'Petite/Slender', id: 'Petite', desc: 'Slim, delicate frame alignment.' },
    { label: 'Athletic/Tone', id: 'Athletic', desc: 'Broad shoulders, narrow hip structure.' },
    { label: 'Rectangular/Symmetric', id: 'Rectangle', desc: 'Unified shoulder-waist lines.' },
    { label: 'Triangle/Pear', id: 'Triangle', desc: 'Heavy grounding lower volumes.' },
    { label: 'Round/Oval Silhou.', id: 'Oval', desc: 'High centering chest-waist ratios.' }
  ];

  useEffect(() => {
    if (user) {
      api.getStoredBodyFit(user.id)
        .then((data) => setFitHistory(data))
        .catch(() => {});
        
      if (user.height) setHeight(user.height);
      if (user.weight) setWeight(user.weight);
      if (user.bodyType) setBodyShape(user.bodyType);
    }
  }, [user, fitResult]);

  const generateLocalBodyFitSuggestions = (heightVal: number, weightVal: number, shapeStr: string) => {
    const ratio = weightVal / (heightVal / 100) ** 2; // BM index
    let recomFitValue = 'regular fit';
    let bestStyles = [
      'Tailored single-breasted structure blazers',
      'Straight-cut high-waist authentic denim',
      'Drape oversized linen summer shirts'
    ];
    let stylingRules = [
      'Focus contrast on natural shoulder alignments to maximize visual frame structure.',
      'A slight drape across body lines keeps long vertical proportions exquisitely balanced.',
      'Use classic standard hemlines to avoid cutting leg lines short.'
    ];

    if (shapeStr === 'Hourglass') {
      recomFitValue = 'slim fit / structured custom drape';
      bestStyles = [
        'Waist-defining double-breasted designer suits',
        'Traditional draped Anarkali or Sherwani ensembles',
        'V-neck wrap tops paired with high-rise tailored trousers'
      ];
      stylingRules = [
        'Highlight your balanced waist shape using tailored wrap seams or premium belt accessories.',
        'Avoid stiff, oversized box designs that mask your natural visual architecture.',
        'Symmetric draped ethnic layers reinforce elegant flowing lines beautifully.'
      ];
    } else if (shapeStr === 'Petite') {
      recomFitValue = 'slim fit / cropped custom structure';
      bestStyles = [
        'High-waist cigarette pants and matching crop-cut tailored tops',
        'A-Line short contemporary block silhouettes',
        'Vertical striped premium linen button-down coordinates'
      ];
      stylingRules = [
        'Utilize monochromatic color coordinates to establish an uninterrupted vertical visual line.',
        'Prefer higher waistlines to elongate the appearance of your lower limbs.',
        'Select small-scale, high-density prints that match your petite alignment perfectly.'
      ];
    } else if (shapeStr === 'Athletic') {
      recomFitValue = 'regular or relaxed fit / layered silhouette';
      bestStyles = [
        'Oversized drop-shoulder streetwear hoodies or jackets',
        'Soft flowing silk drapes and asymmetrical hemlines',
        'Pleated tapered trousers to expand lower volume representation'
      ];
      stylingRules = [
        'Soften block shoulders using elegant draping fabrics (silk, georgette, or fine linen).',
        'Create a relaxed mid-section line to focus focus on your dynamic shoulder stance.',
        'Wide-legged bottom coordinates construct clean, architectural symmetry.'
      ];
    } else if (shapeStr === 'Triangle') {
      recomFitValue = 'regular fit / accent shoulders';
      bestStyles = [
        'Padded-shoulder elegant trench jackets',
        'Boat-neck tops matching flared denim jeans',
        'Traditional lehengas structured to highlight upper torso alignment'
      ];
      stylingRules = [
        'Draw focus upwards using statement neckpieces, puff sleeves, or custom shoulder details.',
        'Keep lower apparel dark and minimally detailed to establish grounded vertical length.',
        'Flared long dresses or floor-length skirts mask and balance lower pelvic volumes.'
      ];
    } else if (shapeStr === 'Oval') {
      recomFitValue = 'relaxed fit / premium comfort layering';
      bestStyles = [
        'Asymmetrical layered drapes and fluid jackets',
        'Crisp straight-fit tunic shirts styled with slim stretch pants',
        'A-Line long silhouettes or comfortable kaftan fashion sets'
      ];
      stylingRules = [
        'Construct lean vertical columns using elegant, open outer drapes and jackets.',
        'Highlight arms, ankles, and neck boundaries where shape naturally tapers.',
        'Softly structured fabrics keep lines elegant without pulling tight on mid-sections.'
      ];
    } else if (shapeStr === 'Rectangle') {
      recomFitValue = 'regular fit / waist-belted structure';
      bestStyles = [
        'Belted traditional long luxury trench coats',
        'Pleated skirts paired with fitted sweetheart tops',
        'Ruffled shoulder blocks styled to create illusion contours'
      ];
      stylingRules = [
        'Cinched belts at the navel break up rectangular alignments with romantic curvature.',
        'Invest in fabric dimensioning like pleats, ruffles, or structured cargo layers.',
        'Asymmetric seams cut across lines dynamically to form modern asymmetry.'
      ];
    }

    return {
      id: 'local-fit-' + Math.random().toString(36).substr(2, 9),
      userId: user?.id || 'anonymous',
      height: Number(heightVal),
      weight: Number(weightVal),
      bodyShape: shapeStr,
      recommendedFit: recomFitValue,
      bestOutfitStyles: bestStyles,
      stylingTips: stylingRules,
      timestamp: new Date().toISOString()
    };
  };

  const handleSubmit = async () => {
    setGenerating(true);
    setFitResult(null);
    setApiBusyError(false);

    const apiCallPromise = api.generateBodyFit({
      userId: user?.id,
      height,
      weight,
      bodyShape
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), 6500)
    );

    try {
      addToast('Drafting your anatomical fit locally...', 'info');
      
      const response = await Promise.race([apiCallPromise, timeoutPromise]);

      if (response && (response as any).apiBusy) {
        const localSg = generateLocalBodyFitSuggestions(height, weight, bodyShape);
        setFitResult(localSg);
        addToast('Aesthetic local metrics alignment calculated!', 'success');
      } else {
        setFitResult(response);
        addToast('Anatomical fit profiling succeeded!', 'success');
      }
    } catch (e: any) {
      console.warn('Physical matrix calibration failed. Splicing offline backup recommendations...', e.message || e);
      const localSg = generateLocalBodyFitSuggestions(height, weight, bodyShape);
      setFitResult(localSg);
      addToast('Digital local silhouette profile compiled!', 'success');
    } finally {
      setGenerating(false);
    }
  };

  const handleSyncToProfile = async () => {
    if (!user) {
      addToast('Sign in to lock metrics into your profile.', 'info');
      setActiveTab('login');
      return;
    }
    if (!fitResult) return;

    // Call global sync state
    await syncProfile(
      genderKey(),
      bodyShape,
      height,
      weight,
      user?.preferences?.style || 'streetwear',
      user?.preferences?.colors || ['#ec4899'],
      fitResult.recommendedFit
    );
  };

  const genderKey = () => user?.gender || 'women';

  return (
    <div className="pt-24 pb-16 min-h-screen text-stone-850" id="bodyfit_page_view">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        
        {/* Title */}
        <div className="border-b border-pink-205 pb-6 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-100 border border-pink-300 text-[10.5px] font-mono font-bold uppercase text-pink-650 rounded-full mb-3 shadow-sm">
            <Settings className="w-3.5 h-3.5 text-pink-500 animate-spin" /> PHYSICAL MATRIX CALIBRATION
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-stone-900 tracking-tight">BODY FIT SUGGESTIONS</h1>
          <p className="text-xs text-stone-605 mt-1 font-semibold font-sans">Configure your exact coordinates to let Gemini calculate appropriate sizing overlays, hemlines, and vertical framing ratios.</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* LEFT: Config Column (Span 5) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-pink-201 rounded-3xl p-6 space-y-6 shadow-sm relative overflow-hidden">
              <h3 className="text-xs font-mono font-bold text-pink-600 uppercase tracking-widest flex items-center gap-1.5 border-b border-pink-100 pb-3">
                <Scale className="w-4 h-4 text-pink-500 animate-pulse" />
                METRICS CONFIGURATION
              </h3>

              {/* Sliders */}
              <div className="space-y-5">
                {/* Height */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="font-mono text-pink-700 uppercase font-black">Silhouette Height</span>
                    <span className="text-stone-900 font-bold font-mono px-2 py-0.5 bg-pink-50 border border-pink-200 rounded-lg">{height} cm</span>
                  </div>
                  <input
                    type="range"
                    min="140"
                    max="210"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full h-1 bg-pink-100 rounded-lg cursor-pointer accent-pink-500"
                  />
                </div>

                {/* Weight */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="font-mono text-pink-700 uppercase font-black">Frame Weight</span>
                    <span className="text-stone-900 font-bold font-mono px-2 py-0.5 bg-pink-50 border border-pink-200 rounded-lg">{weight} kg</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="135"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full h-1 bg-pink-100 rounded-lg cursor-pointer accent-pink-500"
                  />
                </div>
              </div>

              {/* Shapes grid selection */}
              <div>
                <label className="block text-[10px] font-mono text-pink-600 uppercase mb-3 tracking-wider font-extrabold animate-pulse">Anatomical Archetype</label>
                <div className="grid grid-cols-2 gap-2">
                  {bodyShapes.map((shape) => {
                    const isSelected = bodyShape === shape.id;
                    return (
                      <button
                        key={shape.id}
                        type="button"
                        onClick={() => setBodyShape(shape.id)}
                        className={`p-3 text-left rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-pink-500 bg-gradient-to-r from-pink-550 to-pink-600 hover:brightness-110 shadow-sm'
                            : 'border-pink-150 bg-pink-50/50 text-stone-600 hover:text-pink-600 hover:border-pink-300'
                        }`}
                      >
                        <span className={`block text-xs font-bold leading-normal ${isSelected ? 'text-white font-extrabold' : 'text-stone-800'}`}>
                          {shape.label}
                        </span>
                        <span className={`text-[9px] mt-1 block leading-tight font-medium ${isSelected ? 'text-pink-100' : 'text-stone-500'}`}>{shape.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={generating}
                className="w-full py-4 bg-gradient-to-r from-pink-550 via-rose-500 to-pink-600 text-white font-bold text-xs tracking-widest uppercase rounded-3xl hover:brightness-110 active:scale-97 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2 border border-pink-400/20 shadow-md shadow-pink-100/50"
              >
                <Sparkles className="w-4 h-4 animate-pulse text-white" />
                CALCULATE SILHOUETTE FIT
              </button>
            </div>
          </div>

          {/* RIGHT: Results Display (Span 7) */}
          <div className="lg:col-span-7 space-y-6">
            
            {generating ? (
              <div className="bg-white border border-pink-200 rounded-3xl p-16 text-center animate-pulse flex flex-col items-center justify-center space-y-4 shadow-sm aspect-[4/3]">
                <Settings className="w-10 h-10 text-pink-500 animate-spin" />
                <h4 className="text-sm font-mono text-pink-600 uppercase tracking-widest font-black">STITCHING ANATOMY REGISTERS</h4>
                <p className="text-xs text-stone-605 max-w-xs leading-relaxed font-semibold">Compiling exact body mass index ratios, coordinate hip-to-shoulder silhouettes, and sleeve-drop indices...</p>
              </div>
            ) : apiBusyError ? (
              /* GRACIOUS CONGESTION CORNER MAPS */
              <div className="bg-white border border-pink-200 rounded-3xl p-8 text-center flex flex-col justify-center items-center space-y-6 shadow-sm aspect-[4/3]">
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
                      handleSubmit();
                    }}
                    className="px-5 py-3 bg-gradient-to-r from-pink-500 to-rose-455 text-white text-[10px] font-mono font-bold rounded-2xl tracking-widest uppercase hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-sm border border-pink-400"
                  >
                    RETRY PROFILING
                  </button>
                  <button
                    onClick={() => {
                      setApiBusyError(false);
                      setFitResult({
                        id: 'mock-fit',
                        userId: user?.id || 'anonymous',
                        height: Number(height),
                        weight: Number(weight),
                        bodyShape,
                        recommendedFit: 'regular fit',
                        bestOutfitStyles: [
                          'Structured Tailored Double-Breasted Blazers',
                          'Straight-Cut Raw Selvedge Denim',
                          'Drop-Shoulder Ribbed Knit Sweaters'
                        ],
                        stylingTips: [
                          'Focus contrast on natural shoulder bounds.',
                          'Slight drape keeps long linear proportions balanced.',
                          'Use standard hemlines to avoid leg shortening.'
                        ],
                        timestamp: new Date().toISOString()
                      });
                      addToast('Loaded high-fashion offline mock profile specification.', 'info');
                    }}
                    className="px-5 py-3 bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-650 text-[10px] font-mono font-bold rounded-2xl tracking-widest uppercase transition-all cursor-pointer"
                  >
                    VIEW OFFLINE SPECS
                  </button>
                </div>
              </div>
            ) : fitResult ? (
              <div className="space-y-6">
                
                {/* Recommended Fit label */}
                <div className="bg-gradient-to-r from-pink-50 to-white border border-pink-200 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-pink-600 block mb-1 font-extrabold uppercase animate-pulse">RECOMMENDED LUXURY FIT</span>
                    <h3 className="text-2xl font-serif font-black text-stone-900 uppercase tracking-wide">
                      {fitResult.recommendedFit}
                    </h3>
                  </div>
                  
                  {user && (
                    <button
                      onClick={handleSyncToProfile}
                      className="px-4 py-2 bg-pink-100 hover:bg-pink-200 text-pink-700 hover:text-pink-850 rounded-xl border border-pink-300 text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    >
                      <BookmarkCheck className="w-4 h-4 text-pink-605 animate-pulse" />
                      SYNC BRAND PROFILE
                    </button>
                  )}
                </div>

                {/* Best Clothing cuts */}
                <div className="bg-white border border-pink-200/60 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 animate-bounce">
                    <CheckCircle2 className="w-4.5 h-4.5 text-pink-500" />
                    <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-pink-600">
                      APPROVED SILHOUETTE OUTLINES
                    </h3>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3">
                    {fitResult.bestOutfitStyles.map((cut, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-pink-50/40 rounded-2xl border border-pink-150 flex flex-col justify-between"
                      >
                        <span className="text-[9px] text-pink-500 block font-mono font-bold">ARC OUTLINE {idx + 1}</span>
                        <p className="text-xs font-bold text-stone-850 mt-2 font-sans leading-normal line-clamp-2" title={cut}>
                          {cut}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Styling Tips checklist */}
                <div className="bg-white border border-pink-200/60 rounded-3xl p-6 space-y-4 shadow-sm">
                  <span className="text-[10px] font-mono tracking-widest text-pink-600 block font-bold">CORE STYLING RULES & FORMULAS</span>
                  
                  <div className="space-y-3">
                    {fitResult.stylingTips.map((tip, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 bg-pink-50/30 p-3.5 rounded-2xl border border-pink-100 text-xs text-stone-800"
                      >
                        <span className="w-5 h-5 rounded-lg bg-pink-100 border border-pink-200 text-pink-705 font-mono font-bold flex flex-shrink-0 items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <p className="leading-relaxed font-sans font-medium mt-0.5">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3.5 Dynamic Pexels matching silhouette drapes */}
                <div className="bg-white border border-pink-200/60 rounded-3xl p-6 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-pink-500/10 pb-3 mb-2">
                    <div className="flex items-center gap-2">
                      <Scale className="w-4.5 h-4.5 text-pink-400" />
                      <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-pink-450">
                        SILHOUETTE SPEC MODEL EXAMPLES
                      </h3>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-pink-500/70 uppercase">
                      Pexels Body-Typology Guide
                    </span>
                  </div>

                  {loadingPexels ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
                      {[1,2,3,4].map(idx => (
                        <div key={idx} className="aspect-[3/4] pink-shim rounded-2xl pb-1" />
                      ))}
                    </div>
                  ) : pexelsOutfits.length === 0 ? (
                    <p className="text-xs text-rose-300/40 font-mono text-center py-4">No matching archetypes registered in Lookbooks.</p>
                  ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {pexelsOutfits.map((photo) => (
                        <div
                          key={photo.id}
                          className="group relative bg-pink-955 rounded-3xl overflow-hidden border border-pink-550/10 hover:border-pink-500/40 hover:shadow-[0_0_15px_rgba(236,72,153,0.35)] transition-all cursor-pointer aspect-[3/4]"
                          onClick={() => {
                            addToast('Transferring model garment to virtual scanner...', 'success');
                            localStorage.setItem('selected_tryon_outfit', JSON.stringify({
                              id: 'pexels-' + photo.id,
                              name: photo.alt ? (photo.alt.length > 20 ? photo.alt.substring(0, 18) + '...' : photo.alt) : 'Anatomy Fit',
                              category: 'casual',
                              url: photo.url,
                              style: `by ${photo.photographer}`,
                              avg_color: photo.avg_color || '#db2777',
                              tag: 'BodyTypology'
                            }));
                            setActiveTab('tryon');
                          }}
                        >
                          <img
                            src={photo.url}
                            alt={photo.alt}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {/* Gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80" />
                          <div className="absolute bottom-2 inset-x-2 text-left p-2">
                            <span className="text-[8px] font-mono text-pink-400 uppercase tracking-widest font-black block">
                              # {bodyShape} Fit
                            </span>
                            <h4 className="text-[9px] font-bold text-slate-100 truncate mt-0.5" title={photo.alt}>
                              {photo.alt || 'Symmetrical Draft'}
                            </h4>
                            <span className="text-[8px] text-rose-300/50 block font-mono">
                              by {photo.photographer} 📸
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      setFitResult(null);
                      addToast('Fittings reset.', 'info');
                    }}
                    className="px-4 py-2 text-xs font-mono hover:underline text-stone-500 hover:text-stone-900 cursor-pointer font-bold uppercase transition-all"
                  >
                    RESET PREFERENCE SCALES
                  </button>
                </div>

              </div>
            ) : (
              <div className="border border-pink-200 border-dashed rounded-3xl flex flex-col justify-center items-center text-center p-12 text-stone-500 aspect-[4/3] bg-white shadow-sm shadow-pink-50/50">
                <Info className="w-12 h-12 text-pink-400 mb-4 animate-bounce" />
                <h3 className="text-sm font-bold font-mono text-pink-600 tracking-wider uppercase">AWAITING DIMENSIONS SCANS</h3>
                <p className="text-xs text-stone-500 max-w-xs leading-relaxed mt-2 font-semibold">
                  Configure your metrics scales on the left, pick your anatomical archetype card, then lock in with &apos;Calculate Silhouette Fit&apos;.
                </p>
              </div>
            )}

            {/* Previous calibrations */}
            {user && fitHistory.length > 0 && (
              <div className="pt-8 border-t border-pink-150 space-y-4">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-pink-500 animate-pulse" />
                  <h3 className="text-sm font-serif font-black text-stone-900 uppercase tracking-widest">ARCHIVAL CALIBRATION LOGS</h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {fitHistory.slice(0, 4).map((hist) => (
                    <div
                      key={hist.id}
                      onClick={() => startTransition(() => setFitResult(hist))}
                      className="bg-white hover:bg-pink-50/40 border border-pink-150 hover:border-pink-300 rounded-2xl p-4 transition-all cursor-pointer space-y-2 shadow-sm"
                    >
                      <div className="flex justify-between items-center text-[10px] font-mono text-pink-600 font-bold">
                        <span>SHAPE: {hist.bodyShape}</span>
                        <span className="text-stone-550 font-semibold">{new Date(hist.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-stone-900 font-black capitalize">
                        Height: {hist.height}cm / Weight: {hist.weight}kg
                      </p>
                      <span className="block text-[10px] font-bold text-pink-700 uppercase tracking-widest mt-2 font-mono">
                        ✨ FIT ARCH: {hist.recommendedFit}
                      </span>
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
