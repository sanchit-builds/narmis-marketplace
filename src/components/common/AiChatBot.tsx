import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMarketplace } from '../../context/MarketplaceContext';
import { getAiResponse, ChatMessage } from '../../services/aiChatService';
import {
  Sparkles,
  Bot,
  Send,
  X,
  RotateCcw,
  MessageSquare,
  ChevronDown,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome-msg',
  sender: 'assistant',
  text: `👋 **Hello! I'm Sage, your NARMIS circular marketplace assistant.**\n\nI can clear any doubts about:\n• 🔄 **Trading:** 3 free trials, Trader Elite subscription & barter cash offsets\n• 🛡️ **Pricing:** Our 10% platform protection margin on items ≤ ₹1,000\n• ☁️ **Cloud Storage:** Live photo upload directly to Supabase storage\n• 📅 **Renting:** Rates, booking durations & reservation inquiries\n• 🛍️ **Purchasing:** Condition ratings, checkout & verified receipts\n\nHow can I help you today?`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  suggestions: [
    'How does the 10% platform margin work?',
    'How many free trade trials do I get?',
    'How does Trade with cash offset work?',
    'How are photos uploaded to Supabase?'
  ],
  links: [
    { label: 'Explore Catalog', path: '/explore' },
    { label: 'Trading Section', path: '/trade' },
    { label: 'Create Listing', path: '/create-listing' }
  ]
};

export const AiChatBot: React.FC = () => {
  const navigate = useNavigate();
  const { listings } = useMarketplace();

  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isGeminiLive = Boolean(
    import.meta.env.VITE_GEMINI_API_KEY && 
    import.meta.env.VITE_GEMINI_API_KEY !== 'your-gemini-api-key'
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isTyping) return;

    setHasInteracted(true);
    setInputValue('');

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Simulate natural thinking delay for human-like conversational experience
      const [aiResult] = await Promise.all([
        getAiResponse(text, messages, listings),
        new Promise((resolve) => setTimeout(resolve, 600)),
      ]);

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: aiResult.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: aiResult.suggestions,
        links: aiResult.links,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error('Error generating AI response:', err);
      const fallbackMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: `I'm having a brief connection hitch, but I'm here! Feel free to explore our [Rent](/rent), [Trade](/trade), or [Purchase](/purchase) markets.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        ...INITIAL_WELCOME_MESSAGE,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  // Simple, elegant Markdown & Link formatter
  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');

    return (
      <div className="space-y-1.5 text-xs sm:text-[13px] leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) {
            return <div key={idx} className="h-1" />;
          }

          // Bullet points
          const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
          const cleanLine = isBullet ? line.trim().replace(/^[•-]\s*/, '') : line;

          // Parse markdown bold **text** and [link text](/path)
          const parts: React.ReactNode[] = [];
          const regex = /(\*\*.*?\*\*|\[.*?\]\(.*?\))/g;
          let lastIndex = 0;
          let match;

          while ((match = regex.exec(cleanLine)) !== null) {
            if (match.index > lastIndex) {
              parts.push(cleanLine.substring(lastIndex, match.index));
            }

            const token = match[0];
            if (token.startsWith('**') && token.endsWith('**')) {
              parts.push(
                <strong key={`${idx}-${match.index}`} className="font-bold text-narmis-parchment">
                  {token.slice(2, -2)}
                </strong>
              );
            } else if (token.startsWith('[') && token.includes('](')) {
              const linkMatch = token.match(/\[(.*?)\]\((.*?)\)/);
              if (linkMatch) {
                const label = linkMatch[1];
                const href = linkMatch[2];
                parts.push(
                  <button
                    key={`${idx}-${match.index}`}
                    onClick={() => handleNavigate(href)}
                    className="inline-flex items-center gap-0.5 text-narmis-gold hover:underline font-semibold ml-0.5 mr-0.5 cursor-pointer"
                  >
                    {label}
                    <ExternalLink className="w-2.5 h-2.5 inline" />
                  </button>
                );
              }
            }
            lastIndex = regex.lastIndex;
          }

          if (lastIndex < cleanLine.length) {
            parts.push(cleanLine.substring(lastIndex));
          }

          if (isBullet) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1">
                <span className="text-narmis-gold font-bold select-none shrink-0">•</span>
                <span className="flex-1">{parts}</span>
              </div>
            );
          }

          return <p key={idx}>{parts}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="fixed bottom-5 left-5 z-50">
      {/* EXPANDED CHAT WINDOW */}
      {isOpen ? (
        <div className="w-[calc(100vw-32px)] max-w-sm sm:max-w-md h-[560px] max-h-[85vh] bg-narmis-surface/98 backdrop-blur-xl border-2 border-narmis-gold/70 rounded-3xl shadow-2xl flex flex-col text-narmis-cream overflow-hidden animate-fadeIn">
          {/* HEADER */}
          <div className="px-5 py-4 bg-gradient-to-r from-narmis-forestDark via-narmis-surface to-narmis-surface border-b border-narmis-mountain/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-narmis-mountain to-narmis-gold/30 border border-narmis-gold/60 flex items-center justify-center text-narmis-gold shadow-md">
                  <Bot className="w-5 h-5 text-narmis-parchment" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-narmis-forestDark rounded-full animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-serif font-bold text-narmis-parchment text-base leading-tight">
                    NARMIS Sage AI
                  </h3>
                  <span className="px-1.5 py-0.5 rounded-full bg-narmis-gold/20 text-narmis-gold text-[10px] font-bold uppercase tracking-wider border border-narmis-gold/30">
                    Guide
                  </span>
                </div>
                <p className="text-[11px] text-narmis-cream/60 flex items-center gap-1">
                  <span>{isGeminiLive ? 'Powered by Gemini AI' : 'NARMIS Intelligence Engine'}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-medium">Online</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Restart Chat"
                className="p-1.5 rounded-xl text-narmis-cream/60 hover:text-white hover:bg-narmis-mountain/40 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Minimize Chat"
                className="p-1.5 rounded-xl text-narmis-cream/60 hover:text-white hover:bg-narmis-mountain/40 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* MESSAGES SCROLL AREA */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 select-text">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
                >
                  <div className="flex items-end gap-2 max-w-[88%]">
                    {!isUser && (
                      <div className="w-6 h-6 rounded-lg bg-narmis-mountain/80 border border-narmis-gold/40 flex items-center justify-center shrink-0 mb-1 text-narmis-gold">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div
                      className={`p-3.5 rounded-2xl ${
                        isUser
                          ? 'bg-narmis-gold/25 border border-narmis-gold/60 text-narmis-parchment rounded-br-xs shadow-md'
                          : 'bg-narmis-forestDark/90 border border-narmis-mountain/50 text-narmis-cream rounded-bl-xs shadow-md'
                      }`}
                    >
                      {renderFormattedText(msg.text)}

                      {/* Action Links if available */}
                      {msg.links && msg.links.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-narmis-mountain/40 flex flex-wrap gap-1.5">
                          {msg.links.map((link, i) => (
                            <button
                              key={i}
                              onClick={() => handleNavigate(link.path)}
                              className="px-2.5 py-1 rounded-xl bg-narmis-mountain/70 hover:bg-narmis-gold hover:text-narmis-charcoal text-[11px] font-semibold text-narmis-parchment border border-narmis-gold/40 transition-all flex items-center gap-1 active:scale-95"
                            >
                              <span>{link.label}</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] text-narmis-cream/40 px-2">
                    {msg.timestamp}
                  </span>

                  {/* Suggestion Chips from latest assistant response */}
                  {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1 pl-8">
                      {msg.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(suggestion)}
                          className="text-[11px] px-2.5 py-1 rounded-full bg-narmis-surface border border-narmis-gold/40 text-narmis-parchment/90 hover:bg-narmis-gold hover:text-narmis-charcoal hover:border-narmis-gold transition-all text-left"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* TYPING INDICATOR */}
            {isTyping && (
              <div className="flex items-center gap-2 pl-2">
                <div className="w-6 h-6 rounded-lg bg-narmis-mountain/80 border border-narmis-gold/40 flex items-center justify-center shrink-0 text-narmis-gold">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-narmis-forestDark/90 border border-narmis-mountain/50 text-narmis-cream rounded-bl-xs flex items-center gap-1.5 shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-narmis-gold animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-narmis-gold animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-narmis-gold animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT BAR */}
          <div className="p-3 bg-narmis-forestDark/95 border-t border-narmis-mountain/60">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask any doubt about Rent, Trade, Buy..."
                  className="w-full pl-3.5 pr-8 py-2.5 rounded-2xl bg-narmis-surface border border-narmis-mountain/80 focus:border-narmis-gold focus:outline-none text-xs sm:text-sm text-narmis-cream placeholder-narmis-cream/40 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="w-10 h-10 rounded-2xl bg-narmis-gold hover:bg-narmis-parchment text-narmis-charcoal disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all shrink-0 active:scale-95 shadow-md font-bold"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-1.5 flex items-center justify-between px-1 text-[10px] text-narmis-cream/40">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Verified Circular Guidance
              </span>
              <span>Press Enter ↵</span>
            </div>
          </div>
        </div>
      ) : (
        /* COLLAPSED FLOATING TRIGGER BUTTON */
        <button
          onClick={() => {
            setIsOpen(true);
            setHasInteracted(true);
          }}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-narmis-forestDark via-narmis-surface to-narmis-forestDark hover:from-narmis-mountain hover:to-narmis-surface border-2 border-narmis-gold shadow-2xl backdrop-blur-md text-xs font-bold text-narmis-parchment transition-all hover:scale-105 active:scale-95"
          title="Open NARMIS AI Assistant"
        >
          {/* Animated Glow Halo */}
          <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-narmis-gold/40 via-emerald-500/20 to-narmis-gold/40 blur-sm opacity-70 group-hover:opacity-100 transition-opacity animate-pulse" />

          <div className="relative flex items-center gap-2">
            <div className="relative">
              <div className="w-7 h-7 rounded-full bg-narmis-gold text-narmis-charcoal flex items-center justify-center font-bold shadow-md">
                <Bot className="w-4 h-4" />
              </div>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-narmis-surface rounded-full" />
            </div>

            <div className="flex flex-col text-left">
              <span className="leading-tight flex items-center gap-1">
                Ask NARMIS AI
                <Sparkles className="w-3 h-3 text-narmis-gold" />
              </span>
              <span className="text-[10px] font-normal text-narmis-cream/70">
                Clear any doubts
              </span>
            </div>
          </div>

          {!hasInteracted && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-narmis-gold opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-narmis-gold"></span>
            </span>
          )}
        </button>
      )}
    </div>
  );
};
