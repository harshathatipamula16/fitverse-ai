import { useState, startTransition } from 'react';

// Recommended fallback image from Unsplash
const GENERAL_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80";

interface FashionImageProps {
  src: string;
  alt: string;
  className?: string;
  id?: string;
}

export function FashionImage({ src, alt, className = "w-full h-full object-cover", id }: FashionImageProps) {
  const [loading, setLoading] = useState(true);
  const [currentSrc, setCurrentSrc] = useState(src || GENERAL_FALLBACK_IMAGE);

  const fallbackImages = [
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80"
  ];

  return (
    <div className="relative w-full h-full bg-pink-50 overflow-hidden" id={id}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-pink-50 to-pink-100 animate-pulse z-10">
          <div className="w-8 h-8 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <img
        src={currentSrc}
        alt={alt}
        referrerPolicy="no-referrer"
        loading="lazy"
        onLoad={() => startTransition(() => setLoading(false))}
        onError={() => {
          startTransition(() => {
            // Select a fallback based on alt text hash or pick first
            const idx = Math.abs(alt.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % fallbackImages.length;
            const backup = fallbackImages[idx] || GENERAL_FALLBACK_IMAGE;
            setCurrentSrc(backup);
            setLoading(false);
          });
        }}
        className={`${className} ${loading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} transition-all duration-700 ease-out`}
      />
    </div>
  );
}
