import React, { useState } from 'react';
import { ExplorePage } from './ExplorePage';
import { KeyboardTradeIllustration } from '../components/illustrations/CartoonCharacters';
import { useAuth } from '../context/AuthContext';
import { TradeSubscriptionModal } from '../components/marketplace/TradeSubscriptionModal';
import {
  Repeat,
  ArrowLeftRight,
  Coins,
  ShieldCheck,
  Crown,
  Sparkles,
  Zap,
  Info,
} from 'lucide-react';

export const TradePage: React.FC = () => {
  const { user } = useAuth();
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

  const trialsUsed = user?.trade_trials_used || 0;
  const isSubscribed = !!user?.is_trade_subscribed;
  const remainingTrials = Math.max(0, 3 - trialsUsed);

  return (
    <div>
      {/* Editorial Header Banner */}
      <div className="bg-gradient-to-b from-narmis-forestDark via-narmis-surface to-narmis-bg pt-28 pb-10 border-b border-narmis-mountain/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-center md:text-left space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-950/80 text-amber-200 border border-amber-600/40">
                <Repeat className="w-3.5 h-3.5" />
                NARMIS Trade Engine
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-narmis-parchment">
                Exchange Items, Balance with Cash
              </h1>
              <p className="text-sm sm:text-base text-narmis-cream/80 leading-relaxed">
                The most sustainable way to upgrade your gear. Propose a trade with another member,
                automatically compute estimated valuation differences, and balance it with optional cash.
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs text-narmis-cream/70">
                <div className="flex items-center gap-1.5">
                  <ArrowLeftRight className="w-4 h-4 text-narmis-gold" />
                  <span>Item-for-Item Barter</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-narmis-gold" />
                  <span>Flexible Cash Offsets</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-narmis-gold" />
                  <span>Mutual Explicit Approvals</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 hidden md:block">
              <KeyboardTradeIllustration className="w-52 h-48 drop-shadow-xl" />
            </div>
          </div>

          {/* Interactive Trade Criteria & Subscription Status Box */}
          <div className="mt-8 p-4 sm:p-5 rounded-3xl bg-narmis-surface/90 border-2 border-narmis-gold/40 shadow-xl backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 w-full md:w-auto">
              <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-narmis-gold/60 text-narmis-gold flex items-center justify-center shrink-0">
                {isSubscribed ? <Crown className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-serif font-bold text-narmis-parchment text-base">
                    {isSubscribed ? 'NARMIS Trader Elite Active' : 'Trade Pass & Trial Criteria'}
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isSubscribed
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                        : remainingTrials > 0
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                        : 'bg-red-950 text-red-300 border border-red-500/50'
                    }`}
                  >
                    {isSubscribed
                      ? 'Unlimited Barters'
                      : remainingTrials > 0
                      ? `${remainingTrials} Free Trial(s) Left`
                      : 'Subscription Required'}
                  </span>
                </div>
                <p className="text-xs text-narmis-cream/70">
                  {isSubscribed
                    ? 'You have unlimited access to initiate trades and negotiate with campus peers.'
                    : `3 free trials included for all members. You have used ${Math.min(3, trialsUsed)} of 3 free trades.`}
                </p>
              </div>
            </div>

            {/* Trial Meter or Subscription Button */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              {!isSubscribed && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-xs">
                  <span className="text-narmis-cream/60">Trials:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3].map((step) => (
                      <span
                        key={step}
                        className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
                          trialsUsed >= step
                            ? 'bg-amber-500 text-narmis-charcoal'
                            : 'bg-narmis-mountain text-narmis-cream/50'
                        }`}
                      >
                        {step}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsSubModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-narmis-gold hover:bg-narmis-accent text-narmis-charcoal font-bold text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 shrink-0 transition-all"
              >
                {isSubscribed ? (
                  <>
                    <Crown className="w-3.5 h-3.5" />
                    <span>Manage Pass</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>{remainingTrials === 0 ? 'Subscribe Now (₹199/mo)' : 'Upgrade to Elite'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 10% Margin Transparency Note for Trade */}
          <div className="mt-3 px-4 py-2.5 rounded-2xl bg-amber-950/20 border border-amber-600/30 text-xs text-amber-200/90 flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0 text-narmis-gold" />
            <span>
              <strong>10% Margin Transparency:</strong> For trades involving items or cash offsets of <strong>₹1,000 or below</strong>, NARMIS applies a 10% platform protection margin to guarantee peer escrow and verified condition checks.
            </span>
          </div>
        </div>
      </div>

      <ExplorePage
        initialType="trade"
        titleOverride="Active Trade & Barter Offers"
        subtitleOverride="Explore items community members are eager to exchange."
      />

      <TradeSubscriptionModal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        trialsUsed={trialsUsed}
      />
    </div>
  );
};
