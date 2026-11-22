import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';
import {
  X,
  Crown,
  Check,
  Sparkles,
  ArrowLeftRight,
  ShieldCheck,
  Zap,
  Repeat,
  Lock,
} from 'lucide-react';

interface TradeSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  trialsUsed?: number;
}

export const TradeSubscriptionModal: React.FC<TradeSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  trialsUsed = 3,
}) => {
  const { user, updateTradeSubscription } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [isActivating, setIsActivating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    setIsActivating(true);
    try {
      // Simulate real payment checkout & confirmation
      await new Promise((r) => setTimeout(r, 900));
      await updateTradeSubscription(true, 'elite');
      setIsSuccess(true);

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#D97706', '#10B981', '#3B82F6'],
      });

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err) {
      console.error('Subscription error:', err);
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-narmis-surface border-2 border-narmis-gold/70 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl relative text-narmis-cream overflow-hidden">
        {/* Glow ambient background accent */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-narmis-gold/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-narmis-cream/60 hover:text-white p-1.5 rounded-full hover:bg-narmis-mountain/50 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-10 space-y-4">
            <div className="w-20 h-20 rounded-full bg-amber-500/20 text-narmis-gold border border-narmis-gold/50 flex items-center justify-center mx-auto animate-bounce">
              <Crown className="w-10 h-10" />
            </div>
            <h3 className="font-serif text-3xl font-bold text-narmis-parchment">
              Welcome to Trader Elite!
            </h3>
            <p className="text-sm text-narmis-cream/80 max-w-sm mx-auto">
              Your unlimited trade pass is now active. You can propose infinite barter exchanges with verified escrow protection.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-950/80 text-amber-300 border border-amber-600/50">
                <Crown className="w-3.5 h-3.5 text-narmis-gold" />
                <span>NARMIS Trader Elite</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-narmis-parchment">
                Unlock Unlimited Trading
              </h2>
              <p className="text-xs sm:text-sm text-narmis-cream/70 max-w-sm mx-auto">
                All members receive <span className="font-bold text-narmis-parchment">3 free trade trials</span>. You have used{' '}
                <span className="font-bold text-amber-400">{Math.min(3, trialsUsed)} of 3</span> free trades. Subscribe to continue barter proposals.
              </p>
            </div>

            {/* Trial Usage Progress Meter */}
            <div className="bg-narmis-forestDark/80 p-3.5 rounded-2xl border border-narmis-mountain/60">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-narmis-cream/80 font-medium flex items-center gap-1.5">
                  <Repeat className="w-3.5 h-3.5 text-narmis-gold" />
                  Free Trial Status
                </span>
                <span className="font-bold text-amber-400">
                  {Math.min(3, trialsUsed)} / 3 Used (0 remaining)
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`h-2 rounded-full transition-all ${
                      trialsUsed >= step
                        ? 'bg-amber-500 shadow-sm'
                        : 'bg-narmis-mountain/60'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Elite Perks List */}
            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3" />
                </div>
                <span><strong className="text-narmis-parchment">Unlimited Barter Offers:</strong> Propose item trades across cameras, laptops, gear & books.</span>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3" />
                </div>
                <span><strong className="text-narmis-parchment">Cash Offset Protection:</strong> Safe escrow when balancing trade valuations with cash.</span>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3" />
                </div>
                <span><strong className="text-narmis-parchment">Verified Trader Badge:</strong> Instant credibility with campus & neighborhood owners.</span>
              </div>
            </div>

            {/* Plan Selector */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setSelectedPlan('monthly')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  selectedPlan === 'monthly'
                    ? 'border-narmis-gold bg-narmis-forestDark shadow-md'
                    : 'border-narmis-mountain/60 bg-narmis-surface/60 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="text-[11px] font-bold uppercase tracking-wider text-narmis-cream/70">
                  Monthly Pass
                </div>
                <div className="text-xl font-bold font-serif text-narmis-parchment mt-0.5">
                  ₹199<span className="text-xs font-normal text-narmis-cream/60">/mo</span>
                </div>
                <div className="text-[11px] text-narmis-cream/60 mt-1">
                  Flexible, cancel anytime
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlan('yearly')}
                className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                  selectedPlan === 'yearly'
                    ? 'border-narmis-gold bg-narmis-forestDark shadow-md'
                    : 'border-narmis-mountain/60 bg-narmis-surface/60 opacity-80 hover:opacity-100'
                }`}
              >
                <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-black uppercase tracking-wider">
                  Save 37%
                </span>
                <div className="text-[11px] font-bold uppercase tracking-wider text-narmis-gold">
                  Annual Pass
                </div>
                <div className="text-xl font-bold font-serif text-narmis-parchment mt-0.5">
                  ₹1,499<span className="text-xs font-normal text-narmis-cream/60">/yr</span>
                </div>
                <div className="text-[11px] text-emerald-400/90 mt-1">
                  Just ₹125/month billed yearly
                </div>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleSubscribe}
                disabled={isActivating}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-narmis-gold via-amber-500 to-narmis-gold hover:opacity-95 text-narmis-charcoal font-bold text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isActivating ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-narmis-charcoal border-t-transparent rounded-full animate-spin" />
                    Activating Trader Elite...
                  </span>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Activate Trader Elite ({selectedPlan === 'monthly' ? '₹199' : '₹1,499'})</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-narmis-cream/50 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Instant activation • 100% money-back guarantee within 7 days</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
