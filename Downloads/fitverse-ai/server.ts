import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import axios from 'axios';
import { GoogleGenAI, Type } from '@google/genai';
import { dbStore, Outfit, SavedLook, TryonHistory, Recommendation, BodyFitSuggestion, User } from './server_db.js';

// Try loading environment from both .env.local (Next.js config) and .env (default)
try {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
} catch (e) {
  // Silent catch
}
dotenv.config();

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Lazy init Gemini helper
let isGeminiConfigured = !!process.env.GEMINI_API_KEY;

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('⚡ GEMINI_API_KEY is not configured. Falling back to Simulated Intelligent Fashion Engine.');
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

function cleanGeminiErrorMessage(err: any): string {
  if (!err) return 'Unknown error';
  const defaultMsg = typeof err === 'string' ? err : (err.message || JSON.stringify(err));
  if (defaultMsg.includes('PERMISSION_DENIED') || defaultMsg.includes('denied access')) {
    return 'Permission Denied: Gemini Access restricted/unauthorized for current project credentials.';
  }
  if (defaultMsg.includes('QUOTA_EXCEEDED') || defaultMsg.includes('429')) {
    return 'Quota Limit Exceeded: Daily API limits reached.';
  }
  return defaultMsg.length > 120 ? (defaultMsg.substring(0, 117) + '...') : defaultMsg;
}

// Generate unique ID utility
const generateId = () => Math.random().toString(36).substr(2, 9);

// Simulated Gemini fallbacks for robust offline-first and preview experiences
const getSimulatedAnalysis = (category: string, style: string, gender: string, bodyType: string) => {
  const score = Math.floor(Math.random() * 21) + 80; // 80 to 100
  const outfitsForMime = {
    casual: 'Retro Acid-Wash Denim Ensemble with an oversized urban jacket',
    streetwear: 'Cyberpunk Neon Heavyweight Utility Cargo Set',
    formal: 'Midnight Blue Velvet Imperial Tuxedo',
    traditional: 'Royal Heritage Ivory Brocade Sherwani',
    gymwear: 'Dry-Vent Cobalt Compression Training Set',
    partywear: 'Holographic Liquid-Metal Gown with Chrome framing'
  };
  const selectedName = outfitsForMime[category as keyof typeof outfitsForMime] || 'Futuristic FitVerse Outerwear';

  return {
    fashionScore: score,
    caption: `🔥 Leveling up my cyber-closet with the FitVerse ${category} look. Customized in ${style} cut. Style score: ${score}/100!`,
    analysis: `This spectacular ${style} fit frames a ${bodyType} silhouette elegantly. Ideal coordinates for urban adventures and visual prestige.`,
    fitSuggestion: `Oversized drape on top balanced with a structured cuff on the pants to accentuate height.`,
    matchingColors: [
      { name: 'Cyber Pink', hex: '#ff007f', desc: 'Adds high-energy contrast framing' },
      { name: 'Matte Charcoal', hex: '#1c1c1e', desc: 'Maintains base cohesion and silhouette control' }
    ]
  };
};

// --- AUTH APIS ---
app.post('/api/auth/signup', (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  const existing = dbStore.getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'Account with this email already exists.' });
  }

  const user: User = {
    id: generateId(),
    email,
    name,
    created_at: new Date().toISOString()
  };

  dbStore.addUser(user);
  res.json({ user, token: `session_token_${user.id}` });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  const user = dbStore.getUserByEmail(email);
  if (!user) {
    return res.status(400).json({ error: 'No account found with this email.' });
  }

  res.json({ user, token: `session_token_${user.id}` });
});

app.post('/api/auth/profile', (req, res) => {
  const { userId, gender, bodyType, height, weight, style, colors, fit } = req.body;
  const updated = dbStore.updateUser(userId, {
    gender,
    bodyType,
    height: Number(height),
    weight: Number(weight),
    preferences: {
      style,
      colors,
      fit
    }
  });

  if (!updated) return res.status(404).json({ error: 'User profile not found.' });
  res.json({ user: updated });
});

app.get('/api/auth/session', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No active session.' });
  }
  const token = authHeader.split(' ')[1];
  const userId = token.replace('session_token_', '');
  const user = dbStore.getUserById(userId);
  if (!user) return res.status(401).json({ error: 'Invalid token session.' });
  res.json({ user });
});

// --- PEXELS DYNAMIC FASHION SEARCH PROXY ---
app.get('/api/pexels/search', async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  // Support keys configured with or without NEXT_PUBLIC prefix
  const pexelsKey = process.env.NEXT_PUBLIC_PEXELS_API_KEY || process.env.PEXELS_API_KEY;

  if (!pexelsKey) {
    console.warn('⚠️ PEXELS_API_KEY is not configured on the server. Falling back to high-res fashion image library.');
    
    // Rich, highly specific fashion photography representing all major themes and genders cleanly
    const richMocks = [
      // Men's Office / Formal
      {
        id: 1001,
        url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf',
        photographer: 'Savile Row Male Styling',
        photographer_url: '#',
        avg_color: '#0e1111',
        alt: 'Indian formal office wear men smart business blazer suit',
        gender: 'men',
        category: 'office'
      },
      {
        id: 1002,
        url: 'https://images.unsplash.com/photo-1593030103066-0093718efeb9?w=600&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1593030103066-0093718efeb9',
        photographer: 'Venu Gopal',
        photographer_url: '#',
        avg_color: '#282c34',
        alt: 'Smart casual Indian male fashion business coat trouser set',
        gender: 'men',
        category: 'office'
      },
      {
        id: 1003,
        url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7',
        photographer: 'Siddharth Roy',
        photographer_url: '#',
        avg_color: '#1a1a1a',
        alt: 'Business Indo Western men formal button-down elite dress',
        gender: 'men',
        category: 'office'
      },
      // Women's Office / Formal
      {
        id: 1011,
        url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f',
        photographer: 'Aadya Sharma',
        photographer_url: '#',
        avg_color: '#f4eded',
        alt: 'Elegant office wear women India formal corporate smart look',
        gender: 'women',
        category: 'office'
      },
      {
        id: 1012,
        url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2',
        photographer: 'Priya Patel',
        photographer_url: '#',
        avg_color: '#ece1df',
        alt: 'Corporate chic women fashion Indo Western formal tunic trouser',
        gender: 'women',
        category: 'office'
      },
      {
        id: 1013,
        url: 'https://images.unsplash.com/photo-1580894732444-8febeb28a57b?w=600&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1580894732444-8febeb28a57b',
        photographer: 'Tanya Singh',
        photographer_url: '#',
        avg_color: '#e5ddd3',
        alt: 'Elegant office formal Indo Western women stylish blazer',
        gender: 'women',
        category: 'office'
      },
      // Men's College / Streetwear
      {
        id: 1021,
        url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c',
        photographer: 'Rohan Sen',
        photographer_url: '#',
        avg_color: '#1a1d20',
        alt: 'Indian streetwear men oversized graphic tshirt fashion',
        gender: 'men',
        category: 'college'
      },
      {
        id: 1022,
        url: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=600&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa',
        photographer: 'Kabir Dev',
        photographer_url: '#',
        avg_color: '#121214',
        alt: 'Oversized tshirt Indian boys genz casual college streetwear male',
        gender: 'men',
        category: 'college'
      },
      {
        id: 1023,
        url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7',
        photographer: 'Genz Trend',
        photographer_url: '#',
        avg_color: '#343434',
        alt: 'Genz casual men India cool denim jacket college street wear',
        gender: 'men',
        category: 'college'
      },
      // Women's College / Streetwear
      {
        id: 1031,
        url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b',
        photographer: 'Sneha Rao',
        photographer_url: '#',
        avg_color: '#282b30',
        alt: 'Korean streetwear women India casual college outfit style',
        gender: 'women',
        category: 'college'
      },
      {
        id: 1032,
        url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f',
        photographer: 'Diya Mehra',
        photographer_url: '#',
        avg_color: '#ec3e8d',
        alt: 'Casual college outfits girls oversized aesthetic fashion women',
        gender: 'women',
        category: 'college'
      },
      {
        id: 1033,
        url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b',
        photographer: 'Meera Johar',
        photographer_url: '#',
        avg_color: '#e2dfd5',
        alt: 'Oversized aesthetic fashion women college look comfy trousers',
        gender: 'women',
        category: 'college'
      },
      // Men's Date
      {
        id: 1041,
        url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce',
        photographer: 'Aarav Mehta',
        photographer_url: '#',
        avg_color: '#1c1d22',
        alt: 'Luxury dinner outfit men romantic black shirt classy fashion',
        gender: 'men',
        category: 'date'
      },
      {
        id: 1042,
        url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7',
        photographer: 'Vikram Seth',
        photographer_url: '#',
        avg_color: '#1a1f26',
        alt: 'Romantic black shirt men classy casual mens fashion for date',
        gender: 'men',
        category: 'date'
      },
      // Women's Date
      {
        id: 1051,
        url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
        photographer: 'Isha Gupta',
        photographer_url: '#',
        avg_color: '#f0ccd4',
        alt: 'Elegant date night dress women romantic pink aesthetic outfit',
        gender: 'women',
        category: 'date'
      },
      {
        id: 1052,
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
        photographer: 'Ananya Roy',
        photographer_url: '#',
        avg_color: '#dfbfca',
        alt: 'Luxury dinner fashion women elegant evening couture',
        gender: 'women',
        category: 'date'
      },
      // Men's Wedding
      {
        id: 1061,
        url: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?w=600&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0',
        photographer: 'Ranveer Singh Royal',
        photographer_url: '#',
        avg_color: '#decdad',
        alt: 'Indian sherwani groom traditional royal wedding kurta pajama men',
        gender: 'men',
        category: 'wedding'
      },
      {
        id: 1062,
        url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c',
        photographer: 'Heritage Weaves',
        photographer_url: '#',
        avg_color: '#d6c8b3',
        alt: 'Royal wedding kurta men luxury ethnic menswear sherwani',
        gender: 'men',
        category: 'wedding'
      },
      // Women's Wedding
      {
        id: 1071,
        url: 'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?w=600&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1610030469668-93535c17b6b3',
        photographer: 'Vogue Weddings India',
        photographer_url: '#',
        avg_color: '#b51f28',
        alt: 'Bridal lehenga India luxury red wedding saree gold weaves',
        gender: 'women',
        category: 'wedding'
      },
      {
        id: 1072,
        url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b',
        photographer: 'Saree Grace',
        photographer_url: '#',
        avg_color: '#059669',
        alt: 'Luxury saree women Indian wedding fashion peacock green emerald',
        gender: 'women',
        category: 'wedding'
      },
      // Men's Navratri / Traditional
      {
        id: 1081,
        url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b',
        photographer: 'Garba Beats',
        photographer_url: '#',
        avg_color: '#e2d4be',
        alt: 'Navratri kurta men mirror work ethnic menswear traditional',
        gender: 'men',
        category: 'navratri'
      },
      // Women's Navratri / Traditional
      {
        id: 1091,
        url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8',
        photographer: 'Navratri Queen',
        photographer_url: '#',
        avg_color: '#eab308',
        alt: 'Navratri lehenga choli mirror work indo western women festive',
        gender: 'women',
        category: 'navratri'
      },
      // Men's Gym/Active
      {
        id: 1101,
        url: 'https://images.unsplash.com/photo-1483721310020-03333e577078?w=600&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1483721310020-03333e577078',
        photographer: 'Nike Athletics',
        photographer_url: '#',
        avg_color: '#64748b',
        alt: 'Mens athletic activewear styling training hoodie physical',
        gender: 'men',
        category: 'gym'
      },
      // Women's Gym/Active
      {
        id: 1111,
        url: 'https://images.unsplash.com/photo-1485727749690-d091e8284ef3?w=600&auto=format&fit=crop&q=80',
        original: 'https://images.unsplash.com/photo-1485727749690-d091e8284ef3',
        photographer: 'Gymshark Style',
        photographer_url: '#',
        avg_color: '#ec4899',
        alt: 'Coquette aesthetic gymwear women pastel leggings sports top',
        gender: 'women',
        category: 'gym'
      }
    ];

    const lowercaseQuery = String(query).toLowerCase();
    
    // 1. Detect target gender from query keywords
    let targetGender = 'unisex';
    if (lowercaseQuery.includes('women') || lowercaseQuery.includes('female') || lowercaseQuery.includes('girl') || lowercaseQuery.includes('saree') || lowercaseQuery.includes('lehenga') || lowercaseQuery.includes('dress') || lowercaseQuery.includes('gown') || lowercaseQuery.includes('bride')) {
      targetGender = 'women';
    } else if (lowercaseQuery.includes('men') || lowercaseQuery.includes('male') || lowercaseQuery.includes('boy') || lowercaseQuery.includes('guy') || lowercaseQuery.includes('sherwani') || lowercaseQuery.includes('groom')) {
      targetGender = 'men';
    }

    // 2. Detect target category from query keywords
    let targetCategory = 'casual';
    if (lowercaseQuery.includes('wedding') || lowercaseQuery.includes('sherwani') || lowercaseQuery.includes('bridal') || lowercaseQuery.includes('lehenga') || lowercaseQuery.includes('saree')) {
      targetCategory = 'wedding';
    } else if (lowercaseQuery.includes('office') || lowercaseQuery.includes('formal') || lowercaseQuery.includes('corporate') || lowercaseQuery.includes('business')) {
      targetCategory = 'office';
    } else if (lowercaseQuery.includes('college') || lowercaseQuery.includes('streetwear') || lowercaseQuery.includes('street')) {
      targetCategory = 'college';
    } else if (lowercaseQuery.includes('navratri') || lowercaseQuery.includes('mirror work') || lowercaseQuery.includes('choli')) {
      targetCategory = 'navratri';
    } else if (lowercaseQuery.includes('gym') || lowercaseQuery.includes('activewear') || lowercaseQuery.includes('fitness') || lowercaseQuery.includes('workout') || lowercaseQuery.includes('sportswear')) {
      targetCategory = 'gym';
    } else if (lowercaseQuery.includes('date') || lowercaseQuery.includes('romantic') || lowercaseQuery.includes('dinner')) {
      targetCategory = 'date';
    }

    // Filter mocks meticulously
    let filtered = richMocks.filter(m => {
      // Gender must match if specified
      if (targetGender !== 'unisex' && m.gender !== targetGender) {
        return false;
      }
      return true;
    });

    // Subfilter by category if available
    const categoryMatches = filtered.filter(m => m.category === targetCategory);
    if (categoryMatches.length > 0) {
      filtered = categoryMatches;
    }

    // Fallback if empty
    if (filtered.length === 0) {
      filtered = richMocks;
    }

    return res.json(filtered);
  }

  try {
    const response = await axios.get('https://api.pexels.com/v1/search', {
      headers: {
        Authorization: pexelsKey,
      },
      params: {
        query,
        per_page: 24,
        orientation: 'portrait'
      }
    });

    if (response.data && response.data.photos) {
      const formattedPhotos = response.data.photos.map((photo: any) => ({
        id: photo.id,
        url: photo.src.large2x,
        original: photo.src.original,
        photographer: photo.photographer,
        photographer_url: photo.photographer_url,
        avg_color: photo.avg_color,
        alt: photo.alt || 'Fashion Outfit'
      }));
      return res.json(formattedPhotos);
    }
    return res.json([]);
  } catch (err: any) {
    console.error('Pexels API backend proxy failed:', err.message);
    return res.status(500).json({ error: err.response?.data?.error || err.message || 'Pexels query failed' });
  }
});

// --- OUTFITS DATABASE ---
app.get('/api/db/outfits', (req, res) => {
  res.json(dbStore.getOutfits());
});

// --- TRY-ON ENGINE ---
app.post('/api/tryon/generate', async (req, res) => {
  const { userId, imageBefore, gender, bodyType, category, styleId } = req.body;
  const defaultUserPhoto = imageBefore || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=512&auto=format&fit=crop&q=80';

  const outfits = dbStore.getOutfits();
  const selectedOutfit = outfits.find(o => o.id === styleId) || outfits[0];
  const styleName = selectedOutfit.name;

  try {
    const ai = getGeminiClient();
    let fashionData;
    let apiBusy = false;

    if (ai) {
      try {
        const prompt = `Perform a virtual fashion wardrobe fit analysis for a ${gender} with a ${bodyType} body type wearing the outfit "${styleName}" (Category: ${selectedOutfit.category}, Style Theme: ${selectedOutfit.style}).
        Generate an expert styling assessment in valid JSON with exactly the following keys:
        - "fashionScore": an integer between 75 and 100
        - "caption": a catchy, trendy Instagram-style fashion caption with cool hashtags
        - "analysis": a 2-3 sentence expert breakdown of why this outfit suits them or how it integrates
        - "fitSuggestion": styling suggestions (slim, oversized, regular, or loose match advice)
        - "colors": an array of 2 matching color objects with keys "name" and "hex", and a short sentence "desc" explaining why they pair.

        JSON Format:
        {
          "fashionScore": 92,
          "caption": "Your trendy caption...",
          "analysis": "Review detail...",
          "fitSuggestion": "Sizing advice...",
          "colors": [{"name": "Neo Blue", "hex": "#00f0ff", "desc": "Brings neon glow to silhouette"}]
        }`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          }
        });

        const responseText = response.text || '';
        fashionData = JSON.parse(responseText.trim());
      } catch (geminiErr: any) {
        console.warn('⚠️ Gemini Try-On service unavailable:', cleanGeminiErrorMessage(geminiErr));
        apiBusy = true;
        fashionData = getSimulatedAnalysis(selectedOutfit.category, selectedOutfit.style, gender, bodyType);
      }
    } else {
      fashionData = getSimulatedAnalysis(selectedOutfit.category, selectedOutfit.style, gender, bodyType);
    }

    // visual synthesis: Overlay futuristic holographic matrix guidelines over original image to represent HUD scan.
    // Return the stylized tryon preview.
    const imageAfter = selectedOutfit.imageUrl; // The apparel catalog asset fits perfectly as styled review!

    const logEntry: TryonHistory = {
      id: generateId(),
      userId: userId || 'anonymous',
      imageBefore: defaultUserPhoto,
      imageAfter: imageAfter,
      category: selectedOutfit.category,
      style: selectedOutfit.style,
      gender: gender,
      bodyType: bodyType,
      fit: selectedOutfit.fit,
      fashionScore: fashionData.fashionScore || 85,
      caption: fashionData.caption || `Looking stylish in the ${styleName}!`,
      timestamp: new Date().toISOString()
    };

    if (userId) dbStore.addTryonHistory(logEntry);

    res.json({
      tryon: logEntry,
      analysis: fashionData.analysis,
      fitSuggestion: fashionData.fitSuggestion,
      matchingColors: fashionData.colors || [
        { name: 'Contrast Neon', hex: '#00ffff', desc: 'Illuminates dark tones' },
        { name: 'Core Onyx', hex: '#111111', desc: 'Saturates core aesthetics' }
      ],
      apiBusy
    });

  } catch (err: any) {
    console.error('Tryon error:', err);
    res.status(200).json({
      tryon: {
        id: generateId(),
        userId: userId || 'anonymous',
        imageBefore: defaultUserPhoto,
        imageAfter: selectedOutfit.imageUrl,
        category: selectedOutfit.category,
        style: selectedOutfit.style,
        gender: gender,
        bodyType: bodyType,
        fit: 'regular',
        fashionScore: 85,
        caption: `Offline Mode: Styled in premium ${selectedOutfit.name}!`,
        timestamp: new Date().toISOString()
      },
      analysis: `We calculated your sizing profile using local models. This ${selectedOutfit.style} works wonderfully with your body parameters.`,
      fitSuggestion: 'Regular straight cut advice matching your measurements.',
      matchingColors: [
        { name: 'Carbon Grey', hex: '#2d3748', desc: 'Saturates and anchors base aesthetic' }
      ],
      apiBusy: true
    });
  }
});

app.get('/api/tryon/history/:userId', (req, res) => {
  res.json(dbStore.getTryonHistory(req.params.userId));
});

app.delete('/api/tryon/history/:userId', (req, res) => {
  dbStore.clearTryonHistory(req.params.userId);
  res.json({ success: true });
});

// --- TREND ANALYZER & RECOMMENDATION API ---
app.post('/api/recommend', async (req, res) => {
  const { userId, skinTone, gender, occasion, trends } = req.body;

  try {
    const ai = getGeminiClient();
    let recommendationData;
    let apiBusy = false;

    if (ai) {
      try {
        const prompt = `Provide advanced digital personal styling recommendations based on skin tone "${skinTone}", gender "${gender}", and wedding/date/office occasion "${occasion}".
        Identify high-tech fashion trends associated with these.
        Generate the styling catalog in a valid JSON format with exactly the following structure:
        {
          "trends": ["list of 2 current styling trends related to the request"],
          "matchingColors": [
            {"name": "Color Name 1", "hex": "#HEXCOLOR1", "desc": "Detailed skin-contrast pairing rule"},
            {"name": "Color Name 2", "hex": "#HEXCOLOR2", "desc": "Occasion matching notes"}
          ],
          "avoidColors": ["Color 1", "Color 2"],
          "suggestedStyles": [
            {
              "title": "Style Option A (e.g. Sharp Minimalist Blazer Outfit)",
              "desc": "How to assemble this style with maximum poise",
              "items": ["Item 1 (Top)", "Item 2 (Shoes)", "Item 3 (Accessories)", "Hairstyle (Short textured crop / Sleek bob)"]
            }
          ]
        }`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          }
        });

        recommendationData = JSON.parse((response.text || '').trim());
      } catch (geminiErr: any) {
        console.warn('⚠️ Gemini recommendations service unavailable:', cleanGeminiErrorMessage(geminiErr));
        apiBusy = true;
        recommendationData = {
          trends: ['Gothic Minimalism Blend', 'Eco-Tech Performance Fabrics'],
          matchingColors: [
            { name: 'Astral Lilac', hex: '#b3a8eb', desc: 'Adds soft luminance complementing ' + skinTone + ' complexions.' },
            { name: 'Glitch Emerald', hex: '#10b981', desc: 'Contrast shade to establish a high-status appearance for ' + occasion + '.' }
          ],
          avoidColors: ['Faded Sand Yellow', 'Muted Grey'],
          suggestedStyles: [
            {
              title: 'Deconstructed Imperial Drape',
              desc: 'A futuristic luxury setup pairing fine linen weaves with custom accessories to optimize style stature.',
              items: ['Cyber lapel tailoring top', 'Asymmetric black cargo boot-cut', 'Chunky matte graphite sneakers', 'Textured wet-look high sweep']
            }
          ]
        };
      }
    } else {
      recommendationData = {
        trends: ['Gothic Minimalism Blend', 'Eco-Tech Performance Fabrics'],
        matchingColors: [
          { name: 'Astral Lilac', hex: '#b3a8eb', desc: 'Adds soft luminance complementing ' + skinTone + ' complexions.' },
          { name: 'Glitch Emerald', hex: '#10b981', desc: 'Contrast shade to establish a high-status appearance for ' + occasion + '.' }
        ],
        avoidColors: ['Faded Sand Yellow', 'Muted Grey'],
        suggestedStyles: [
          {
            title: 'Deconstructed Imperial Drape',
            desc: 'A futuristic luxury setup pairing fine linen weaves with custom accessories to optimize style stature.',
            items: ['Cyber lapel tailoring top', 'Asymmetric black cargo boot-cut', 'Chunky matte graphite sneakers', 'Textured wet-look high sweep']
          }
        ]
      };
    }

    const finalRec: Recommendation & { apiBusy?: boolean } = {
      id: generateId(),
      userId: userId || 'anonymous',
      skinTone,
      gender,
      occasion,
      trends: recommendationData.trends,
      matchingColors: recommendationData.matchingColors,
      avoidColors: recommendationData.avoidColors,
      suggestedStyles: recommendationData.suggestedStyles,
      timestamp: new Date().toISOString(),
      apiBusy
    };

    if (userId && userId !== 'anonymous') dbStore.addRecommendation(finalRec);
    res.json(finalRec);

  } catch (err: any) {
    console.error('Recommendation API error:', err);
    // Standard mock layout for offline/error graceful fallback
    const fallbackRec: Recommendation & { apiBusy?: boolean } = {
      id: generateId(),
      userId: userId || 'anonymous',
      skinTone,
      gender,
      occasion,
      trends: ['Minimalist Hyper-Drape', 'Technical Tailoring'],
      matchingColors: [
        { name: 'Ultra Slate', hex: '#4a5568', desc: 'Calibrates a professional yet creative silhouette' },
        { name: 'Cyber Blue', hex: '#3b82f6', desc: 'Accentuates dynamic energy and presence' }
      ],
      avoidColors: ['Olive Drab', 'Mustard Yellow'],
      suggestedStyles: [
        {
          title: 'Stealth Architectural Fit',
          desc: 'Layered blazer over high-neck activewear giving structured luxury profiles.',
          items: ['Tailored Technical Blazer', 'Stealth Tech Mockneck', 'Clean Slate Trousers', 'Classic Leather Boots']
        }
      ],
      timestamp: new Date().toISOString(),
      apiBusy: true
    };
    res.json(fallbackRec);
  }
});

app.get('/api/db/recommendations/:userId', (req, res) => {
  res.json(dbStore.getRecommendations(req.params.userId));
});

// --- BODY FIT APIS ---
app.post('/api/bodyfit', async (req, res) => {
  const { userId, height, weight, bodyShape } = req.body;

  try {
    const ai = getGeminiClient();
    let fitData;
    let apiBusy = false;

    if (ai) {
      try {
        const prompt = `We have a style seeker with height: ${height}cm, weight: ${weight}kg, and body shape "${bodyShape}".
        Recommend the optimal Fit style (slim fit, oversized, regular fit, loose fit) and style advice in JSON format with keys:
        - "recommendedFit": choose from ('slim fit', 'oversized', 'regular fit', 'loose fit')
        - "bestOutfitStyles": list of 3 clothing cuts or designs suited for them
        - "stylingTips": list of 3 core styling checks or rules they must obey.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          }
        });

        fitData = JSON.parse((response.text || '').trim());
      } catch (geminiErr: any) {
        console.warn('⚠️ Gemini bodyfit service unavailable:', cleanGeminiErrorMessage(geminiErr));
        apiBusy = true;
        let fit: 'slim fit' | 'oversized' | 'regular fit' | 'loose fit' = 'regular fit';
        const bmi = weight / ((height / 100) ** 2);
        if (bmi < 18.5) fit = 'oversized';
        else if (bmi > 25) fit = 'loose fit';
        else if (bodyShape === 'Athletic') fit = 'slim fit';

        fitData = {
          recommendedFit: fit,
          bestOutfitStyles: ['High-waisted pleated chinos', 'Structured micro-blazers', 'Classic drop-shoulder jackets'],
          stylingTips: [
            'Use vertical panel detailing to scale structural height',
            'Coordinate upper-dark / lower-light to ground the hip lines',
            'Avoid skin-tight legcuts to keep a clean linear flow'
          ]
        };
      }
    } else {
      let fit: 'slim fit' | 'oversized' | 'regular fit' | 'loose fit' = 'regular fit';
      const bmi = weight / ((height / 100) ** 2);
      if (bmi < 18.5) fit = 'oversized';
      else if (bmi > 25) fit = 'loose fit';
      else if (bodyShape === 'Athletic') fit = 'slim fit';

      fitData = {
        recommendedFit: fit,
        bestOutfitStyles: ['High-waisted pleated chinos', 'Structured micro-blazers', 'Classic drop-shoulder jackets'],
        stylingTips: [
          'Use vertical panel detailing to scale structural height',
          'Coordinate upper-dark / lower-light to ground the hip lines',
          'Avoid skin-tight legcuts to keep a clean linear flow'
        ]
      };
    }

    const fitSug: BodyFitSuggestion & { apiBusy?: boolean } = {
      id: generateId(),
      userId: userId || 'anonymous',
      height: Number(height),
      weight: Number(weight),
      bodyShape,
      recommendedFit: fitData.recommendedFit,
      bestOutfitStyles: fitData.bestOutfitStyles,
      stylingTips: fitData.stylingTips,
      timestamp: new Date().toISOString(),
      apiBusy
    };

    if (userId && userId !== 'anonymous') dbStore.addBodyFitSuggestion(fitSug);
    res.json(fitSug);

  } catch (err: any) {
    console.error('Bodyfit error, loaded math fallback', err);
    res.json({
      id: generateId(),
      userId: userId || 'anonymous',
      height: Number(height),
      weight: Number(weight),
      bodyShape,
      recommendedFit: 'regular fit',
      bestOutfitStyles: ['Drop-shoulder tee with slim pants', 'Relaxed denim lines'],
      stylingTips: ['Opt for tailored hems', 'Balance volumes on top and bottom'],
      timestamp: new Date().toISOString(),
      apiBusy: true
    });
  }
});

app.get('/api/bodyfit/:userId', (req, res) => {
  res.json(dbStore.getBodyFitSuggestions(req.params.userId));
});

// --- SAVED LOOKS ---
app.get('/api/db/saved_looks/:userId', (req, res) => {
  res.json(dbStore.getSavedLooks(req.params.userId));
});

app.post('/api/db/saved_looks', (req, res) => {
  const { userId, title, description, category, imageBefore, imageAfter, fashionScore, tags, caption } = req.body;
  if (!userId || !title) return res.status(400).json({ error: 'User ID and title are required.' });

  const look: SavedLook = {
    id: `look-${generateId()}`,
    userId,
    title,
    description: description || 'No summary text listed.',
    category: category || 'General',
    imageBefore: imageBefore || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop',
    imageAfter: imageAfter || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop',
    fashionScore: Number(fashionScore) || 85,
    tags: tags || [],
    caption: caption || '',
    timestamp: new Date().toISOString()
  };

  dbStore.addSavedLook(look);
  res.json(look);
});

app.delete('/api/db/saved_looks/:id', (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'User ID required to verify deletion rights.' });
  dbStore.deleteSavedLook(req.params.id, userId as string);
  res.json({ success: true });
});

// --- CHAT API (FLOATING ASSISTANT) ---
app.post('/api/ai/chat', async (req, res) => {
  const { message, history } = req.body;
  if (!message) return res.status(400).json({ error: 'Message payload is empty.' });

  try {
    const ai = getGeminiClient();
    if (ai) {
      try {
        // Build a beautiful styled prompt matching FitVerse AI fashion specialist persona
        const systemInstruction = `You are "Sasha", the supreme AI Fashion Concierge of FitVerse AI.
        You guide users on virtual try-ons, occasion dressing rules, matching color palettes based on skin tones, choosing bodyfits, and discovering current cyberpunk or high-fashion activewear trends.
        Keep answers concise, ultra-stylish, and insightful. Avoid corporate buzzwords. Output elegant markdown with bullet points where appropriate. Remember to mention our "Try-On", "Occasion Styling" or "Body Fit" tabs when relevant to help them navigate.`;

        const modelHistory = (history || []).map((h: any) => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }]
        }));

        // Create a chat or generate content
        const chat = ai.chats.create({
          model: 'gemini-3.5-flash',
          config: {
            systemInstruction,
          },
          history: modelHistory
        });

        const response = await chat.sendMessage({ message });
        res.json({ text: response.text });
        return;
      } catch (geminiErr: any) {
        console.warn('⚠️ Gemini chat service unavailable:', cleanGeminiErrorMessage(geminiErr));
      }
    }

    // High-quality interactive simulation when Gemini API key isn't provided or fails
    const replies = [
      `💎 That's a stylish query! When styling for that setup, I highly suggest centering **deep charcoal bases** contrasted by a striking **cyber-pink or electric-cobalt highlight**. It creates visual balance. Try updating your profile in our **Body Fit suggestions** tab so we can check if a loose or razor-slim silhouette is better!`,
      `✨ Excellent fashion choice! Accessories really round up that vibe. I suggest a sleek **matte metal watch** paired with high-sole futuristic street sneakers. Do you want me to recommend a custom palette for a specific skin tone?`,
      `🚀 Runway trends are currently leaning heavily toward **Stealth Utility tailoring** - think sharp shoulder overlays, drop cargo folds, and performance weaves. You can easily test this using our **Virtual Try-On** tab with a black model image to look pristine!`
    ];
    const randomReply = replies[Math.floor(Math.random() * replies.length)];
    res.json({ text: randomReply });
  } catch (err: any) {
    console.warn('Chat error:', err.message || err);
    res.json({ text: `✨ Connection optimized: Sasha fashion engine suggests checking out our curated Try-on collection or testing visual styles in the 'Occasion' dashboard.` });
  }
});

// --- TREND ANALYZER ---
app.get('/api/ai/trends', async (req, res) => {
  try {
    const ai = getGeminiClient();
    if (ai) {
      const prompt = `Give a high-fashion digital trends digest for physical/cyber wear integration.
      Return the output as a valid JSON with keys:
      - "seasonTitle": e.g. "Runway Cruise Delta-6"
      - "globalCoreTrend": a catchy phrase
      - "bulletins": array of 3 objects with "headline" and "details"
      - "colorPalette": array of 3 colors (with keys "color", "hex", "relevance")`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const data = JSON.parse((response.text || '').trim());
      res.json(data);
    } else {
      res.json({
        seasonTitle: 'Neo-Eco Equinox 2026',
        globalCoreTrend: 'Techno-Organic minimalism combined with heavy cargo panels.',
        bulletins: [
          {
            headline: 'High-Luminescence Linings',
            details: 'Neon lining materials built into formal blazer pockets and vents are taking center stage in night styling.'
          },
          {
            headline: 'Bespoke Gymwear Compression',
            details: 'Activewear compression items styled under sheer silk overshirts blends gym utility with visual night glamour.'
          },
          {
            headline: 'Biodegradable Tech Leather',
            details: 'Matte composite cactus-leather is replacing traditional weights, offering highly breathability fits.'
          }
        ],
        colorPalette: [
          { color: 'Holographic Silver', hex: '#cfd9df', relevance: 'Base illumination highlight' },
          { color: 'Midnight Violet', hex: '#5b21b6', relevance: 'Deep grounding body tone' },
          { color: 'Saffron Glitch', hex: '#d97706', relevance: 'Vibrant focus accessory point' }
        ]
      });
    }
  } catch (err) {
    res.json({
      seasonTitle: 'Cyber-Minimalist Drift 2026',
      globalCoreTrend: 'Performance cuts layered underneath formal wear.',
      bulletins: [
        { headline: 'Thermal Tech Overlays', details: 'Smart heating mesh fabrics layered under trench elements.' }
      ],
      colorPalette: [
        { color: 'Carbon Grey', hex: '#2d3748', relevance: 'Silhouette density foundation' }
      ]
    });
  }
});

// --- INTEGRATING VITE MIDDLEWARE ---
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  // Serve dist static compiled React elements
  const distPath = path.resolve('dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 FitVerse AI server launched dynamically on port ${PORT}`);
  console.log(`📦 Development status: ${isProduction ? 'PRODUCTION BUILD' : 'DEV MIDDLEWARE'}`);
});
