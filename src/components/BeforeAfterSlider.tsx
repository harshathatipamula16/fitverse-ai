import { useState, useRef, useEffect, MouseEvent, TouchEvent } from 'react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = "Original",
  afterLabel = "AI Try-On"
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50); // 0 to 100 percentage
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    if (e.touches && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[4/5] bg-neutral-900 border border-purple-500/20 rounded-2xl overflow-hidden select-none cursor-ew-resize group shadow-2xl shadow-purple-950/20"
      onMouseDown={() => setIsDragging(true)}
      onTouchStart={() => setIsDragging(true)}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      id="before_after_slider_component"
    >
      {/* Target After Image (Background layer) */}
      <img
        src={afterImage}
        alt="Style After"
        className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
        loading="lazy"
      />
      <div className="absolute top-3 right-3 z-10 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-wide text-cyan-400 border border-cyan-400/30">
        {afterLabel}
      </div>

      {/* Target Before Image (Overlay layer, clipped dynamically) */}
      <div
        className="absolute top-0 left-0 h-full w-full overflow-hidden pointer-events-none"
        style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
      >
        <img
          src={beforeImage}
          alt="Style Before"
          className="absolute top-0 left-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-wide text-purple-400 border border-purple-400/30">
          {beforeLabel}
        </div>
      </div>

      {/* Sliding separator line and anchor grip */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-cyan-400 to-purple-500 cursor-ew-resize pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-black border-2 border-cyan-400 text-white flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-transform duration-200 group-hover:scale-110">
          <svg
            className="w-4 h-4 text-cyan-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 9l-4 3 4 3m8-6l4 3-4 3" />
          </svg>
        </div>
      </div>

      {/* Futuristic scanning laser sweep line */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent animate-pulse" />
    </div>
  );
}
