import React, { useState } from 'react';
import { Listing, PurchaseTransaction } from '../../types';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { calculatePlatformMargin } from '../../utils/marginCalculator';
import {
  X,
  ShoppingBag,
  ShieldAlert,
  CheckCircle2,
  Truck,
  CreditCard,
  Sparkles,
  Printer,
  QrCode,
  ShieldCheck,
} from 'lucide-react';

interface PurchaseModalProps {
  listing: Listing;
  isOpen: boolean;
  onClose: () => void;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  listing,
  isOpen,
  onClose,
}) => {
  const { processDemoPurchase } = useMarketplace();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState(
    user?.location || 'Flat 402, Green Glen Layout, Bellandur, Bengaluru - 560103'
  );
  const [demoPaymentMethod, setDemoPaymentMethod] = useState<'DEMO_UPI' | 'DEMO_CARD' | 'DEMO_WALLET'>('DEMO_UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedPurchase, setCompletedPurchase] = useState<PurchaseTransaction | null>(null);

  if (!isOpen) return null;

  const price = listing.purchase_price || 0;
  const marginInfo = calculatePlatformMargin(price);
  const deliveryEstimated = 0; // Local meetup / zero charge
  const total = price + deliveryEstimated;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate realistic payment delay
      await new Promise((r) => setTimeout(r, 1200));
      const result = await processDemoPurchase({
        listingId: listing.id,
        address: shippingAddress,
      });

      setCompletedPurchase(result);

      // Trigger celebratory confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#B88A4A', '#EAD3AA', '#304943', '#D97A53'],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-narmis-surface border border-narmis-mountain w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl relative text-narmis-cream max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-narmis-cream/60 hover:text-white p-1 rounded-full hover:bg-narmis-mountain/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {completedPurchase ? (
          /* Receipt Screen */
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-600/40 text-[11px] font-bold uppercase mb-2">
                <Sparkles className="w-3 h-3" />
                Payment Successful
              </div>
              <h3 className="font-serif text-2xl font-bold text-narmis-parchment">
                Order Confirmed!
              </h3>
              <p className="text-xs text-narmis-cream/70 mt-1">
                Receipt Number: <span className="font-mono text-narmis-gold">{completedPurchase.receipt_number}</span>
              </p>
            </div>

            {/* Receipt Breakdown Card */}
            <div className="p-4 rounded-2xl bg-narmis-forestDark/80 border border-narmis-mountain/50 text-left space-y-2 text-xs">
              <div className="flex justify-between text-narmis-cream/70">
                <span>Item Purchased:</span>
                <span className="font-semibold text-narmis-parchment truncate max-w-[200px]">
                  {listing.title}
                </span>
              </div>
              <div className="flex justify-between text-narmis-cream/70">
                <span>Item Price:</span>
                <span className="font-semibold text-narmis-parchment">
                  ₹{price.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-amber-300">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Platform Margin ({marginInfo.marginPercentText}):</span>
                </span>
                <span className="font-semibold">₹{marginInfo.platformMargin.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-narmis-cream/70">
                <span>Seller Payout Remittance:</span>
                <span className="font-semibold text-emerald-400">₹{marginInfo.sellerPayout.toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 border-t border-narmis-mountain/50 flex justify-between font-bold text-sm">
                <span>Total Paid:</span>
                <span className="font-bold text-emerald-400 font-serif">
                  ₹{completedPurchase.amount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-narmis-cream/60">
                <span>Payment Mode:</span>
                <span className="font-medium text-narmis-gold">Verified Escrow Handover</span>
              </div>
              <div className="flex justify-between text-narmis-cream/60">
                <span>Delivery / Handover:</span>
                <span className="truncate max-w-[200px] text-narmis-parchment">
                  {completedPurchase.shipping_address}
                </span>
              </div>
            </div>

            {/* Handover Verification QR Code */}
            <div className="p-4 rounded-2xl bg-narmis-forestDark/60 border border-narmis-gold/30 flex items-center justify-between text-left">
              <div>
                <span className="text-[10px] text-narmis-gold uppercase font-bold tracking-wider flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5" />
                  Handover Verification Pass
                </span>
                <p className="text-xs text-narmis-cream/80 font-medium mt-0.5">
                  Present to seller at in-person meetup
                </p>
                <p className="text-[10px] text-narmis-cream/50 font-mono mt-0.5">
                  PASS: {completedPurchase.receipt_number}
                </p>
              </div>

              {/* Vector Simulated QR Code */}
              <div className="bg-white p-1.5 rounded-xl shadow-md shrink-0">
                <svg viewBox="0 0 48 48" width="48" height="48" fill="#142523">
                  <rect x="4" y="4" width="16" height="16" fill="none" stroke="#142523" strokeWidth="3" />
                  <rect x="8" y="8" width="8" height="8" />
                  <rect x="28" y="4" width="16" height="16" fill="none" stroke="#142523" strokeWidth="3" />
                  <rect x="32" y="8" width="8" height="8" />
                  <rect x="4" y="28" width="16" height="16" fill="none" stroke="#142523" strokeWidth="3" />
                  <rect x="8" y="32" width="8" height="8" />
                  <rect x="24" y="24" width="4" height="4" />
                  <rect x="32" y="24" width="6" height="4" />
                  <rect x="24" y="32" width="6" height="6" />
                  <rect x="34" y="34" width="8" height="8" />
                </svg>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-200/90 text-left">
              <strong>100% Escrow Protection:</strong> Funds are safely held by NARMIS and only released to the seller after you inspect and accept the item at handover.
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2.5 rounded-full bg-narmis-forestDark hover:bg-narmis-mountain text-narmis-parchment border border-narmis-mountain text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <Printer className="w-3.5 h-3.5 text-narmis-gold" />
                <span>Print Official Receipt</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  navigate('/messages');
                }}
                className="px-6 py-2.5 rounded-full bg-narmis-gold text-narmis-charcoal text-xs font-bold uppercase tracking-wider hover:bg-narmis-accent transition-all"
              >
                View Handover Chat
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Summary & Confirmation */
          <form onSubmit={handleCheckout} className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-600/40">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-narmis-parchment">
                  Confirm Purchase & Escrow
                </h3>
                <p className="text-xs text-narmis-cream/60">
                  Direct peer acquisition with NARMIS handover protection
                </p>
              </div>
            </div>

            {/* Product Snapshot Card */}
            <div className="p-3.5 rounded-2xl bg-narmis-forestDark/80 border border-narmis-mountain/50 flex items-center gap-3.5">
              <img
                src={listing.images[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800'}
                alt=""
                className="w-16 h-16 rounded-xl object-cover border border-narmis-mountain/60 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-serif font-bold text-narmis-parchment text-sm truncate">
                  {listing.title}
                </h4>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-narmis-cream/60">
                  <span>Condition: <strong className="text-narmis-parchment">{listing.condition}</strong></span>
                  <span>•</span>
                  <span>Seller: <strong className="text-narmis-parchment">{listing.user?.full_name || 'Community Member'}</strong></span>
                </div>
              </div>
            </div>

            {/* Cost & Margin Breakdown */}
            <div className="p-4 rounded-2xl bg-narmis-forestDark/80 border border-narmis-mountain/50 space-y-2.5 text-xs">
              <div className="flex justify-between text-narmis-cream/70">
                <span>Product Listed Price:</span>
                <span className="font-semibold text-narmis-parchment">₹{price.toLocaleString('en-IN')}</span>
              </div>

              {/* NARMIS Platform Margin */}
              <div className="flex justify-between text-amber-300">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>NARMIS Platform Margin ({marginInfo.marginPercentText}):</span>
                </span>
                <span className="font-semibold">₹{marginInfo.platformMargin.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-narmis-cream/70">
                <span>Seller Payout After Margin:</span>
                <span className="font-semibold text-emerald-400">₹{marginInfo.sellerPayout.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-narmis-cream/70">
                <span>Direct Handover / Verification:</span>
                <span className="font-semibold text-emerald-400">FREE</span>
              </div>

              {/* 10% Margin Callout Banner if price <= 1000 */}
              {price <= 1000 && (
                <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-600/30 text-[11px] text-amber-200">
                  🛡️ <strong>10% Margin Tier (≤ ₹1,000):</strong> A 10% platform margin is applied to support buyer escrow protection, dispute resolution, and verified condition checks.
                </div>
              )}

              <div className="pt-2 border-t border-narmis-mountain/40 flex justify-between items-center text-sm font-bold">
                <span className="text-narmis-parchment">Total Payable:</span>
                <span className="font-serif text-xl text-emerald-400">
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Handover / Shipping Address */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-narmis-gold" />
                <span>Handover / Delivery Address *</span>
              </label>
              <textarea
                rows={2}
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-xs text-narmis-cream focus:outline-none focus:border-narmis-gold resize-none"
                required
              />
            </div>

            {/* Demo Payment Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-narmis-gold" />
                <span>Select Payment Method</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDemoPaymentMethod('DEMO_UPI')}
                  className={`p-2.5 rounded-xl border text-xs text-center font-medium transition-all ${
                    demoPaymentMethod === 'DEMO_UPI'
                      ? 'bg-narmis-mountain border-narmis-gold text-narmis-parchment font-bold shadow-sm'
                      : 'bg-narmis-forestDark border-narmis-mountain/50 text-narmis-cream/70 hover:bg-narmis-mountain/30'
                  }`}
                >
                  UPI / QR
                </button>
                <button
                  type="button"
                  onClick={() => setDemoPaymentMethod('DEMO_CARD')}
                  className={`p-2.5 rounded-xl border text-xs text-center font-medium transition-all ${
                    demoPaymentMethod === 'DEMO_CARD'
                      ? 'bg-narmis-mountain border-narmis-gold text-narmis-parchment font-bold shadow-sm'
                      : 'bg-narmis-forestDark border-narmis-mountain/50 text-narmis-cream/70 hover:bg-narmis-mountain/30'
                  }`}
                >
                  Debit/Credit Card
                </button>
                <button
                  type="button"
                  onClick={() => setDemoPaymentMethod('DEMO_WALLET')}
                  className={`p-2.5 rounded-xl border text-xs text-center font-medium transition-all ${
                    demoPaymentMethod === 'DEMO_WALLET'
                      ? 'bg-narmis-mountain border-narmis-gold text-narmis-parchment font-bold shadow-sm'
                      : 'bg-narmis-forestDark border-narmis-mountain/50 text-narmis-cream/70 hover:bg-narmis-mountain/30'
                  }`}
                >
                  NetBanking / Wallet
                </button>
              </div>
            </div>

            {/* Submit & Cancel */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-3 rounded-xl bg-narmis-mountain/60 text-narmis-cream text-xs font-semibold hover:bg-narmis-mountain transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="w-2/3 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Authorizing Escrow...
                  </span>
                ) : (
                  <span>Authorize ₹{total.toLocaleString('en-IN')}</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
