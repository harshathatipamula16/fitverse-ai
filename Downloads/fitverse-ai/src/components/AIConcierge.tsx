import { useState, useRef, useEffect, useTransition } from 'react';
import { useApp } from '../context/AppContext.js';
import { api } from '../services/api.js';
import { Send, X, Bot, Sparkles, CornerDownLeft, MessageSquareDot } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIConcierge() {
  const { chatOpen, setChatOpen, addToast } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "👋 Greetings, Style Seeker! I'm **Sasha**, compile of fashion sciences for FitVerse AI. I can guide your body profiling, suggest color harmonies based on skin complexion, or customize styling suggestions for weddings, dates, or office setups! What are you styling for today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [, startTransition] = useTransition();

  const presets = [
    'Recommend colors for warm honey skin',
    'Best streetwear styles for athletic fit',
    'Hairstyle + accessory tips for date night',
    'Sizing tips for an oversized silhouette'
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, generating]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || generating) return;

    const userMessage: ChatMessage = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setGenerating(true);

    try {
      const response = await api.chat(textToSend, messages);
      setMessages((prev) => [...prev, { role: 'assistant', content: response.text }]);
    } catch (err: any) {
      addToast(err.message || 'AI is currently processing another coordinate.', 'error');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "⚠️ **System Overload**: Gemini neural bridge temporarily down. Just to highlight: deep greys and cobalt accents always pair optimally in general. Try asking me again shortly!"
        }
      ]);
    } finally {
      setGenerating(false);
    }
  };

  if (!chatOpen) {
    // Return floating drawer trigger button
    return (
      <button
        onClick={() => startTransition(() => setChatOpen(true))}
        className="fixed bottom-6 right-6 z-40 p-4 bg-gradient-to-r from-[#ff4fa3] to-[#ff8bd3] text-white rounded-full shadow-[0_8px_25px_rgba(255,79,163,0.35)] border border-pink-300/40 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer"
        id="floating_chat_trigger"
      >
        <MessageSquareDot className="w-6 h-6 animate-pulse" />
        <span className="max-w-0 overflow-hidden w-0 text-xs font-bold tracking-wider transition-all duration-500 text-white group-hover:max-w-[120px] group-hover:w-auto uppercase">
          Style Advisor
        </span>
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-2rem)] h-[580px] max-h-[calc(100vh-2rem)] bg-white/95 backdrop-blur-2xl border border-pink-200/85 rounded-3xl overflow-hidden shadow-[0_15px_50px_rgba(255,194,209,0.35)] flex flex-col animate-scale-up"
      id="chat_concierge_panel"
    >
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-pink-600 to-pink-700 text-white border-b border-pink-700 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/35 flex items-center justify-center text-white">
            <Bot className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide font-display">Sasha AI Stylist</h4>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white current-ping bg-emerald-450"></span>
              <span className="text-[9.5px] font-mono tracking-widest text-pink-100 uppercase font-bold">LUXURY COUTURE ENGINE</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => startTransition(() => setChatOpen(false))}
          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Message Feed */}
      <div
        ref={scrollRef}
        className="flex-grow p-4 overflow-y-auto space-y-4 bg-white"
      >
        {messages.map((m, idx) => {
          const isBot = m.role === 'assistant';
          return (
            <div key={idx} className={`flex gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}>
              {isBot && (
                <div className="w-7 h-7 rounded-xl bg-pink-100 border border-pink-300 text-pink-700 flex flex-shrink-0 items-center justify-center text-xs font-black shadow-sm">
                  S
                </div>
              )}
              <div
                className={`max-w-[78%] p-3 text-xs leading-relaxed rounded-2xl border ${
                  isBot
                    ? 'bg-pink-50/90 border-pink-200/80 text-stone-900 rounded-tl-none font-semibold'
                    : 'bg-gradient-to-r from-pink-600 to-rose-600 border border-pink-500 text-white rounded-tr-none shadow-sm shadow-pink-100'
                }`}
              >
                {/* Parse simple markdown structures like **bold** */}
                {m.content.split('\n').map((line, lineIdx) => (
                  <p key={lineIdx} className={lineIdx > 0 ? 'mt-1' : ''}>
                    {line.split('**').map((chunk, chunkIdx) => {
                      if (chunkIdx % 2 === 1) {
                        return <strong key={chunkIdx} className={`${isBot ? 'text-pink-850' : 'text-white'} font-black`}>{chunk}</strong>;
                      }
                      return chunk;
                    })}
                  </p>
                ))}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {generating && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-7 h-7 rounded-xl bg-pink-100 border border-pink-200 text-pink-500 flex flex-shrink-0 items-center justify-center text-xs font-bold">
              S
            </div>
            <div className="bg-pink-50/70 border border-pink-100 rounded-2xl rounded-tl-none p-3 flex gap-1 items-center">
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-bounce"></span>
            </div>
          </div>
        )}
      </div>

      {/* Presets and entry tray */}
      <div className="p-4 border-t border-pink-100 bg-pink-50/30">
        {/* Quick query presets */}
        {messages.length === 1 && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(p)}
                className="p-2 bg-white hover:bg-pink-50 text-stone-600 hover:text-pink-600 text-[10px] font-semibold rounded-xl text-left border border-pink-100 hover:border-pink-300 shadow-sm transition-all cursor-pointer truncate"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Input area */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex items-center gap-2 bg-white rounded-xl border border-pink-200 p-1.5 focus-within:border-pink-400 focus-within:shadow-[0_4px_12px_rgba(255,79,163,0.15)] transition-all"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Sasha about skin tones, silhouettes..."
            className="flex-grow bg-transparent text-xs text-stone-800 border-none outline-none focus:ring-0 px-2 placeholder-stone-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || generating}
            className="p-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
