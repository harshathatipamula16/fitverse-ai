import { useState, useEffect, useTransition } from 'react';
import { useApp } from '../context/AppContext.js';
import { api, Outfit } from '../services/api.js';
import { ArrowRight, Sparkles, User, Gift, Coffee, Heart, CheckSquare, ShieldCheck, HeartPulse, Compass, Loader2 } from 'lucide-react';
import * as pexelsService from '../services/pexelsService.js';

export default function Occasion() {
  const { setActiveTab, addToast } = useApp();
  const [activeOccasion, setActiveOccasion] = useState('date');
  const [catalog, setCatalog] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  // Pexels Occasion States
  const [pexelsOutfits, setPexelsOutfits] = useState<any[]>([]);
  const [loadingPexels, setLoadingPexels] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<'Indian' | 'Korean' | 'Western'>('Indian');

  const getRegionalOccasionQuery = (occasion: string, region: 'Indian' | 'Korean' | 'Western') => {
    const occ = occasion.toLowerCase().trim();
    if (occ === 'wedding') {
      if (region === 'Indian') return 'indian bridal lehenga wedding saree sherwani ethnic glam';
      if (region === 'Korean') return 'korean wedding aesthetic elegant pastel fashion dresses';
      return 'luxury wedding gowns tuxedo old money formalwear';
    }
    if (occ === 'office') {
      if (region === 'Indian') return 'indian office formal kurti waistcoat jacket waist coat';
      if (region === 'Korean') return 'korean minimalist office blazer suit smart trousers';
      return 'western business formal blazer suit pants power dressing';
    }
    if (occ === 'college') {
      if (region === 'Indian') return 'indian college ethnic kurti fusion jeans aesthetic';
      if (region === 'Korean') return 'korean oversized campus streetwear hoodie bag aesthetic';
      return 'western high school college casual streetwear denim campus';
    }
    if (occ === 'date') {
      if (region === 'Indian') return 'indian silk fusion dress indo-western date night wear';
      if (region === 'Korean') return 'korean date sweet pastel skirt dress outfit gentle aesthetic';
      return 'western romantic slip dress hot minimal coquette slips';
    }
    if (occ === 'gym') {
      if (region === 'Indian') return 'activewear athletic stylish clothing training model looks';
      if (region === 'Korean') return 'korean activewear matching lounge track minimalism set';
      return 'western coquette compression gymwear sports crop leggings';
    }
    if (occ === 'vacation') {
      if (region === 'Indian') return 'indian handloom block resort fusion summer travelwear';
      if (region === 'Korean') return 'korean airport fashion travel baggy stylish outerwear minimal';
      return 'cannes luxury resort wear linen dress chic travel';
    }
    return `${region} ${occasion} clothing outfit fashion`;
  };

  useEffect(() => {
    const fetchPexelsOccasion = async () => {
      setLoadingPexels(true);
      try {
        const query = getRegionalOccasionQuery(activeOccasion, selectedRegion);
        const outfits = await pexelsService.searchOutfits(query);
        setPexelsOutfits(outfits.slice(0, 6)); 
      } catch (err) {
        console.error('Failed to seek Pexels scenario clothing', err);
      } finally {
        setLoadingPexels(false);
      }
    };
    fetchPexelsOccasion();
  }, [activeOccasion, selectedRegion]);

  const occasions = [
    { id: 'wedding', label: 'Wedding / Gala Festive', desc: 'Regal, high-luxury aesthetic styling.', icon: Gift, color: 'from-pink-500/20 via-rose-600/10 to-transparent' },
    { id: 'office', label: 'Office Suit Chic', desc: 'Precision corporate, power-profile tailoring.', icon: Coffee, color: 'from-pink-500/15 via-purple-600/10 to-transparent' },
    { id: 'college', label: 'Academy Streetwear', desc: 'Effortless, graphic indie smart-street drapes.', icon: User, color: 'from-rose-500/20 via-pink-900/10 to-transparent' },
    { id: 'date', label: 'Romantic Sparkle Date', desc: 'Seductive, minimal silhouette overlays.', icon: Heart, color: 'from-pink-500/25 via-rose-950/10 to-transparent' },
    { id: 'gym', label: 'Coquette Athletics', desc: 'Aero performance, compression-vented paneling.', icon: HeartPulse, color: 'from-pink-500/15 via-rose-500/10 to-transparent' },
    { id: 'vacation', label: 'Cannes Travel Resort', desc: 'Breezy linens, travel-resort styling.', icon: Compass, color: 'from-pink-550/20 via-rose-900/10 to-transparent' }
  ];

  useEffect(() => {
    api.getOutfits()
      .then((data) => {
        startTransition(() => {
          setCatalog(data);
          setLoading(false);
        });
      })
      .catch(() => {});
  }, []);

  // Map occasion ID to our outfit categories
  const categoryMap: Record<string, 'casual' | 'streetwear' | 'formal' | 'traditional' | 'gymwear' | 'partywear'> = {
    wedding: 'traditional',
    office: 'formal',
    college: 'streetwear',
    date: 'partywear',
    gym: 'gymwear',
    vacation: 'casual'
  };

  const activeCategory = categoryMap[activeOccasion] || 'casual';

  // Regional-specific Recommendations mapping
  const regionalRecommendations: Record<string, Record<'Indian' | 'Korean' | 'Western', {
    stylingRule: string;
    shoes: string;
    accessories: string;
    hairstyle: string;
    tips: string[];
  }>> = {
    wedding: {
      Indian: {
        stylingRule: 'Emphasize royal hand-woven silk barocades, exquisite designer bridal lehengas, majestic wedding sarees with ethnic details, or silk sherwanis to command high-societal presence.',
        shoes: 'Embroidered royal Zardosi Mojaris, Jutis, or hand-painted copper leather flats.',
        accessories: 'Heavy kundan necklaces, royal chest brooches, or statement gold-plated cuff links.',
        hairstyle: 'Intricate royal jasmine garland braids or neat low rose buns.',
        tips: ['Drape dupattas over the left shoulder for poise', 'Introduce deep saffron or premium pink tones', 'Ensure embroidery is authentic threadwork']
      },
      Korean: {
        stylingRule: 'Adhere to clean modern minimalist pastel gowns, neat tailoring, or elegant sleek pastel coordinates that respect modern Korean wedding trends.',
        shoes: 'Sleek matte pumps, elegant slingback heels, or satin-finish loafers.',
        accessories: 'Delicate drop-pearl earrings, clean silver stack bands, or minimal lace veils.',
        hairstyle: 'Soft wave center part with loose tendrils or subtle curtain-bang crop.',
        tips: ['Stick to clean ivory and soft pastel neutrals', 'Ensure collars are neatly ironed to structured edges', 'Fabric textures like organza work beautifully']
      },
      Western: {
        stylingRule: 'Incorporate premium high-gloss silk satin wedding gowns with architectural corsetry, or structured bespoke wool tuxedo suits.',
        shoes: 'High-gloss calf leather oxfords or needle-sharp premium silk heels.',
        accessories: 'Platinum diamond wristwatches, delicate pearls, or high-carat matching bands.',
        hairstyle: 'Hollywood waves or structured French twists.',
        tips: ['Lapels must sit flush on shoulder seams', 'Always use high-status pocket squares', 'Choose fabric with high structural weight count']
      }
    },
    office: {
      Indian: {
        stylingRule: 'Deploy structured premium handloom linen kurtis, high-neck waistcoats, elegant nehru jackets, or lightweight pastel silk salwar suits.',
        shoes: 'Classic leather Kohlapuris, mojris, or pointed kitten heels.',
        accessories: 'Artisanal clay earrings, silver metal bangles, or leather strap watches.',
        hairstyle: 'Neat high bun or clean low crown braid.',
        tips: ['Opt for organic handloom textures', 'Keep necklines high and professional', 'Linen offers elite breathability']
      },
      Korean: {
        stylingRule: 'Adopt oversized double-breasted clean wool blazers, relaxed-fit drape trousers, or elegant shirt dresses in neutral slate shades.',
        shoes: 'Chunky minimal black leather loafers or pristine cream flats.',
        accessories: 'Thin frame titanium glasses, simple metal wrist bracelets, or leather tote bags.',
        hairstyle: 'Effortless low bun with curtain framing or glass hair bob.',
        tips: ['Monochromatic silhouettes are highest status', 'Pants should pool slightly over loafers', 'Prioritize premium beige and charcoal']
      },
      Western: {
        stylingRule: 'Utilize razor-sharp classic power suits, double-breasted blazers with padding, or structured knee-length sheath wear dresses.',
        shoes: 'Prada-style leather buckle loafers, pointed patent leather flats, or mid-height block heels.',
        accessories: 'Luxury chronometers, premium gold dome studs, or leather belt straps.',
        hairstyle: 'High-comb sleek pony or crisp clean lob.',
        tips: ['Suit cuffs should show exactly 1/2 inch of shirt', 'Never combine bold colors', 'Keep accessories strictly minimal']
      }
    },
    college: {
      Indian: {
        stylingRule: 'Fuse comfortable modern graphic kurtas or raw-indigo short kurtis with relaxed flared denim pants or custom ethnic jackets.',
        shoes: 'Canvas slip-ons with regional patterns or raw leather sandals.',
        accessories: 'Handmade thread tassels or oxidized silver ring bands.',
        hairstyle: 'Half-up messy bun or natural loose waves.',
        tips: ['Indigo dyes should be pre-washed to avoid transfer', 'Pockets are vital for student ease', 'Roll sleeves slightly over elbows']
      },
      Korean: {
        stylingRule: 'Embellish drop-shoulder heavy canvas sweaters, wide combat cargo pants, or oversized preppy knit sweater vests.',
        shoes: 'Dad sneakers with high sporty white ankle socks.',
        accessories: 'Wire-rimmed round glasses, canvas satchels, or beanies.',
        hairstyle: 'Fluffy texturized center parted locks or baby braids.',
        tips: ['Oversized means exactly 1-2 sizes up max', 'Jeans should pool with wide hems', 'Ground with monochromatic black/white shoe basis']
      },
      Western: {
        stylingRule: 'Standardize premium collegiate style with authentic varsity leather jackets, raw-edge denim jeans, and organic heavy hoodies.',
        shoes: 'Retro basketball leather sneakers or heavy combat lace-up boots.',
        accessories: 'Baseball caps, premium gym duffels, or simple cord necklaces.',
        hairstyle: 'Natural locks, casual high pony, or textured messy tops.',
        tips: ['Ensure layering looks intentional', 'Vintage washes give deep character', 'Fleece weight should exceed 400GSM']
      }
    },
    date: {
      Indian: {
        stylingRule: 'Adorn contemporary georgette drapes with silver thread details, elegant front-slit anarkalis in sunset pink, or custom fusion crop-tops with matching palettes.',
        shoes: 'Silver threaded sandals or mirrored kitten heels.',
        accessories: 'High-contrast jhumkas, oxidized necklaces, or matching rose-gold wrist cuffs.',
        hairstyle: 'Loose side-swept locks with fresh jasmine highlights.',
        tips: ['Keep makeup glass-like matching rose tones', 'Drapes should flow with walking pace', 'Select breathable silk weaves']
      },
      Korean: {
        stylingRule: 'Accentuate sweet romantic pastel palettes, tiered high-waist chiffon wrap skirts, or delicate puff-sleeve knitwear tops.',
        shoes: 'Mary Jane patent flats or pastel strap-on sandals.',
        accessories: 'Simple bow hairpins, tiny pearl drop-chains, or mini leather purses.',
        hairstyle: 'Romantic half-up bow tie or gentle side braids.',
        tips: ['Coordinate tones: e.g. daisy cream with soft peach', 'Ensure skirt pleats are clean', 'Soft knits hug necklines with romantic grace']
      },
      Western: {
        stylingRule: 'Anchor with a luxurious bias-cut coquette satin slip dress, structured velvet blouson, or asymmetrical draped knits.',
        shoes: 'Fine stiletto strap shoes or sleek black leather chelsea boots.',
        accessories: 'Delicate gold chokers or high-status minimalist drop chains.',
        hairstyle: 'Tousled wavy bed-head curls or wet-look sleek back.',
        tips: ['Perfume matching notes of warm amber & rose', 'Iron slip out to absolute liquid luster', 'Dark romantic colors are most reliable']
      }
    },
    gym: {
      Indian: {
        stylingRule: 'High performance quick-dry active tops layered elegantly with lightweight high-waist compression fitness wear.',
        shoes: 'Multi-directional training sneakers.',
        accessories: 'Waterproof smart wrist fit bands.',
        hairstyle: 'Tight braided high bun or clean ponytail.',
        tips: ['Durable weave resists friction', 'Elastane ratio: aim for 15-20%', 'Color block with bold tones']
      },
      Korean: {
        stylingRule: 'Minimalist high-neck pastel activewear matching set, coordinating cream track jackets or fleece joggers.',
        shoes: 'Chunky white performance cushion sneakers.',
        accessories: 'Minimalist canvas gym straps.',
        hairstyle: 'Double athletic French braids.',
        tips: ['Fleece fabrics create active coziness', 'Choose high-waisted seamless ribs', 'Muted earth tones are highest-rated']
      },
      Western: {
        stylingRule: 'Align aesthetic coquette compression gymwear, high-stride running crop shirts, or specialized lifting wear with subtle branding.',
        shoes: 'Flat-sole retro canvas lifters or specialized arch running shoes.',
        accessories: 'Wireless ear capsules, shaker cups, magnetic towels.',
        hairstyle: 'Premium claw-clip secure buns or high ponytail.',
        tips: ['Seamless rib design provides optimal shape', 'Matte fabrics absorb light cleanly', 'Mesh vents boost breathability']
      }
    },
    vacation: {
      Indian: {
        stylingRule: 'Utilize organic hand-block printed Jaipuri cotton resort wear, breezy indowestern kaftans, or relaxed handspun cotton trousers.',
        shoes: 'Handcrafted leather slides or lightweight braided sandals.',
        accessories: 'Woven straw shoulder bags, chunky bead bangles, or printed cotton bandanas.',
        hairstyle: 'Natural loose waves or silk floral headwrap.',
        tips: ['Pure 100% Khadi or premium cotton keeps cool', 'Hand block prints create travel-ready textures', 'Wear sunset orange or breezy indigo']
      },
      Korean: {
        stylingRule: 'Adopt airport fashion codes with wide casual trousers, oversized soft trench cloaks, or lightweight linen overshirts.',
        shoes: 'Slip-on leather mules or breathable canvas slides.',
        accessories: 'Rimless large sunglasses, linen bucket hats, or clean leather travel packs.',
        hairstyle: 'Casual loose low claw-clip bun.',
        tips: ['Stick to relaxed and low-slung coordinates', 'Oversized styles travel with great comfort', 'Muted beiges reject heat and dust']
      },
      Western: {
        stylingRule: 'Embellish premium Cannes style linen beach slip dresses, lightweight open-collar white shirts, or tailored resort shorts.',
        shoes: 'Braided leather sandals or classic casual espadrilles.',
        accessories: 'Tortoiseshell frame designer sunglasses or broad straw sunhats.',
        hairstyle: 'Airdried salt-water beachy waves.',
        tips: ['Raw hem cuts look effortlessly stylish', 'Stick to monochromatic sand and white coordinates', 'Dry naturally for that premium organic aesthetic']
      }
    }
  };

  const currentAdvice = regionalRecommendations[activeOccasion]?.[selectedRegion];

  // Catalog outfits matching the chosen category
  const activeOutfits = catalog.filter(o => o.category === activeCategory);

  return (
    <div className="pt-24 pb-16 min-h-screen text-stone-800" id="occasion_page_view">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        
        {/* Title */}
        <div className="border-b border-pink-100 pb-6 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-100 border border-pink-300 text-[10px] font-mono font-bold uppercase text-pink-500 rounded-full mb-3 shadow-[0_4px_15px_rgba(255,79,163,0.12)]">
            <Sparkles className="w-3.5 h-3.5 text-pink-500" /> VOGUE INSPIRED COORDINATES
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-stone-900 tracking-tight">OCCASION STYLING PLANNER</h1>
          <p className="text-xs text-stone-600 mt-1 font-medium font-sans">Navigate social gatherings, runway galas, or vacation coordinates with expert advice from Sasha AI.</p>
        </div>

        {/* Bento Grid layout */}
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Bento selection column (Span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-[10px] font-mono font-bold text-pink-500 uppercase tracking-widest px-2 block">
              CHOOSE SCENARIO MATRIX
            </h3>
            
            <div className="space-y-3">
              {occasions.map((occ) => {
                const isSelected = activeOccasion === occ.id;
                const OccIcon = occ.icon;

                return (
                  <div
                    key={occ.id}
                    onClick={() => setActiveOccasion(occ.id)}
                    className={`relative p-5 rounded-3xl border transition-all cursor-pointer overflow-hidden group ${
                      isSelected
                        ? 'bg-white border-pink-400 shadow-[0_8px_30px_rgba(255,79,163,0.14)]'
                        : 'bg-white/60 border-pink-100 hover:border-pink-300 hover:bg-white/90 shadow-sm'
                    }`}
                  >
                    {/* Color Glow wash */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${occ.color} opacity-40`} />

                    <div className="relative flex items-start gap-4">
                      <div className={`p-2.5 rounded-2xl border flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected ? 'bg-pink-500/10 border-pink-500/20 text-pink-550' : 'bg-pink-50 border-pink-100 text-pink-400'
                      }`}>
                        <OccIcon className="w-5 h-5 animate-pulse" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-stone-850 group-hover:text-pink-600 transition-colors">
                          {occ.label}
                        </h4>
                        <p className="text-[10px] text-stone-500 mt-1 leading-normal uppercase tracking-wider font-bold">
                          {occ.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Expanded styling advice (Span 8) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Multicultural Style Filters */}
            <div className="bg-white rounded-3xl p-5 relative border border-pink-200 shadow-sm shadow-pink-100">
              <span className="text-[9px] font-mono tracking-widest text-pink-500 uppercase block mb-3 font-bold">
                SELECT GLOBAL STYLING INFLUENCE
              </span>
              <div className="flex flex-wrap gap-2.5">
                {(['Indian', 'Korean', 'Western'] as const).map((region) => {
                  const isRegSelected = selectedRegion === region;
                  const flags = { Indian: '🇮🇳', Korean: '🇰🇷', Western: '✨' };
                  const subtags = { Indian: 'Royal Ethnic Fusion', Korean: 'Minimalist & Street', Western: 'Vogue & Luxury' };
                  return (
                    <button
                      key={region}
                      onClick={() => setSelectedRegion(region)}
                      className={`flex-1 min-w-[130px] flex items-center justify-between px-4 py-3.5 rounded-2xl border transition-all cursor-pointer font-sans text-left ${
                        isRegSelected
                          ? 'bg-gradient-to-br from-pink-500 to-rose-450 border-pink-450 shadow-[0_4px_16px_rgba(255,79,163,0.2)] text-white'
                          : 'bg-pink-50/40 border-pink-150 text-stone-700 hover:border-pink-350 hover:bg-white'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <span>{flags[region]}</span>
                          <span className={`${isRegSelected ? 'text-white' : 'text-stone-850'}`}>{region} Style</span>
                        </div>
                        <span className={`text-[8.5px] font-mono block tracking-wide mt-0.5 truncate uppercase font-bold ${
                          isRegSelected ? 'text-pink-100' : 'text-stone-500'
                        }`}>
                          {subtags[region]}
                        </span>
                      </div>
                      {isRegSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white] flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {currentAdvice ? (
              <div className="space-y-6 animate-fadeIn">
                
                {/* 1. Core Wardrobe styling guidelines */}
                <div className="bg-white rounded-3xl p-6 relative shadow-sm border border-pink-200">
                  <div className="absolute top-6 right-6 text-[9px] font-mono text-pink-500 uppercase tracking-widest font-black">
                    SASHA COUTURE BRIEF
                  </div>
                  <span className="text-[9px] font-mono tracking-widest text-pink-500 uppercase block mb-2 font-black">
                    RECOMMENDED SCENARIO ASSIGNMENT
                  </span>
                  <h3 className="text-xl font-serif font-black text-stone-900 capitalize mb-4">
                    {activeOccasion} Visual Directives
                  </h3>
                  <p className="text-xs text-stone-800 leading-relaxed font-sans font-medium bg-pink-50/55 p-4.5 rounded-2xl border border-pink-200 border-dashed">
                    🔑 {currentAdvice.stylingRule}
                  </p>
                </div>

                {/* 2. Accessories, Footwear, Hair specs */}
                <div className="grid md:grid-cols-3 gap-4">
                  
                  {/* Accessories */}
                  <div className="bg-white p-5 rounded-2xl border border-pink-150 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-mono tracking-widest text-pink-500 block mb-2 font-bold">ACCESSORIES</span>
                      <p className="text-xs font-semibold text-stone-750 leading-relaxed">
                        💍 {currentAdvice.accessories}
                      </p>
                    </div>
                  </div>

                  {/* Footwear */}
                  <div className="bg-white p-5 rounded-2xl border border-pink-150 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-mono tracking-widest text-pink-500 block mb-2 font-bold">FOOTWEAR</span>
                      <p className="text-xs font-semibold text-stone-750 leading-relaxed">
                        👠 {currentAdvice.shoes}
                      </p>
                    </div>
                  </div>

                  {/* Hairstyle */}
                  <div className="bg-white p-5 rounded-2xl border border-pink-150 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-mono tracking-widest text-[10px] text-pink-500 block mb-2 font-bold">HAIRSTYLE STYLE</span>
                      <p className="text-xs font-semibold text-stone-750 leading-relaxed">
                        💇 {currentAdvice.hairstyle}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Core Checkpoints checkboxes */}
                <div className="bg-white rounded-3xl p-6 border border-pink-200 shadow-sm">
                  <span className="text-[9px] font-mono tracking-widest text-pink-500 uppercase bg-pink-50 px-2.5 py-1 rounded-xl border border-pink-200 block mb-4 w-fit font-bold">
                    CRITICAL FIT CHECKPOINTS
                  </span>

                  <div className="grid sm:grid-cols-3 gap-3">
                    {currentAdvice.tips.map((tip, idx) => (
                      <div
                        key={idx}
                        className="bg-pink-50/50 p-3.5 rounded-2xl border border-pink-150 flex items-center gap-2.5"
                      >
                        <ShieldCheck className="w-4 h-4 text-pink-500 flex-shrink-0" />
                        <span className="text-[11px] font-sans font-semibold text-stone-755">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Active catalog clothes recommendations linking pages */}
                <div className="bg-white rounded-3xl p-6 border border-pink-200 shadow-sm space-y-6">
                  {/* PEXELS DYNAMIC RUNWAY SELECTION */}
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-pink-100">
                      <span className="text-[9px] font-mono text-pink-500 uppercase tracking-widest block font-black">
                        🎥 PEXELS LIVE SCENARIO LOOKBOOKS
                      </span>
                      <span className="text-[8px] font-mono text-stone-500 uppercase font-black">Real Fashion Models</span>
                    </div>

                    {loadingPexels ? (
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map((v) => (
                          <div key={v} className="h-20 pink-shim rounded-2xl animate-pulse" />
                        ))}
                      </div>
                    ) : pexelsOutfits.length === 0 ? (
                      <p className="text-xs text-stone-500 font-mono py-2 text-center">No matching photographic layouts found.</p>
                    ) : (
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {pexelsOutfits.map((photo) => (
                          <div
                            key={photo.id}
                            className="bg-white p-2 border border-pink-150 hover:border-pink-350 rounded-2xl flex items-center gap-2.5 transition-all group cursor-pointer hover:shadow-sm"
                            onClick={() => {
                              addToast(`Synced model look to try-on board!`, 'success');
                              localStorage.setItem('selected_tryon_outfit', JSON.stringify({
                                id: 'pexels-' + photo.id,
                                name: photo.alt ? (photo.alt.length > 20 ? photo.alt.substring(0, 18) + '...' : photo.alt) : 'Pexels Look',
                                category: activeCategory,
                                url: photo.url,
                                style: `by ${photo.photographer}`,
                                avg_color: photo.avg_color || '#db2777',
                                tag: activeCategory
                              }));
                              setActiveTab('tryon');
                            }}
                          >
                            <img
                              src={photo.url}
                              alt={photo.alt}
                              referrerPolicy="no-referrer"
                              className="w-10 h-14 object-cover rounded-xl flex-shrink-0 group-hover:scale-105 transition-transform"
                            />
                            <div className="min-w-0">
                              <h4 className="text-[10px] font-bold text-stone-850 group-hover:text-pink-600 truncate transition-colors" title={photo.alt}>
                                {photo.alt ? (photo.alt.length > 15 ? photo.alt.substring(0, 13) + '...' : photo.alt) : 'Pexels Look'}
                              </h4>
                              <span className="text-[8.5px] font-mono text-stone-500 block truncate">
                                by {photo.photographer} 📸
                              </span>
                              <span className="text-[7.5px] font-mono tracking-wider font-extrabold text-pink-500 uppercase block mt-1">
                                Tap to Wear ✦
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* LOCAL DATABASE CLOSETS */}
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-pink-100">
                      <span className="text-[9px] font-mono text-pink-500 uppercase tracking-widest block font-black">
                        👚 BACKSTAGE CLOSET INVENTORY
                      </span>
                      <button
                        onClick={() => setActiveTab('tryon')}
                        className="text-[10px] font-mono font-bold uppercase text-pink-500 hover:text-pink-600 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        Launch Try-on
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    {loading ? (
                      <div className="h-12 pink-shim rounded-2xl animate-pulse" />
                    ) : activeOutfits.length === 0 ? (
                      <div className="text-center py-6 bg-pink-50/50 rounded-2xl border border-pink-150 text-xs text-stone-600 font-mono px-4">
                        No warehouse items logged under &apos;{activeCategory}&apos; yet. View alternate couture vibes above.
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeOutfits.map((out) => (
                          <div
                            key={out.id}
                            className="bg-white p-2.5 border border-pink-150 hover:border-pink-300 rounded-2xl flex items-center gap-3.5 hover:shadow-sm transition-all group cursor-pointer"
                            onClick={() => {
                              addToast(`Locked style: ${out.name}. Proceeding to Virtual Try-on!`, 'success');
                              // Cache choice
                              localStorage.setItem('selected_tryon_outfit', JSON.stringify({
                                id: out.id,
                                name: out.name,
                                category: out.category,
                                url: out.imageUrl,
                                style: out.style,
                                avg_color: out.hex
                              }));
                              setActiveTab('tryon');
                            }}
                          >
                            <img
                              src={out.imageUrl}
                              alt={out.name}
                              className="w-10 h-14 object-cover rounded-xl flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <h4 className="text-[11px] font-bold text-stone-850 group-hover:text-pink-600 truncate transition-colors">
                                {out.name}
                              </h4>
                              <span className="text-[9px] font-mono text-stone-500 block uppercase mt-0.5">
                                {out.style}
                              </span>
                              <span className="text-[8px] font-mono tracking-widest font-bold text-pink-500 uppercase block mt-1">
                                Tap to Wear ✦
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 border border-pink-100 border-dashed rounded-3xl text-stone-500 text-xs font-mono">
                Select an occasion on the left.
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
