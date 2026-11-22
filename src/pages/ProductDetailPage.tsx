import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/marketplace/ProductCard';
import { RentalRequestModal } from '../components/marketplace/RentalRequestModal';
import { TradeOfferModal } from '../components/marketplace/TradeOfferModal';
import { PurchaseModal } from '../components/marketplace/PurchaseModal';
import { useToast } from '../context/ToastContext';
import { INITIAL_REVIEWS } from '../services/mockData';
import {
  Heart,
  Share2,
  MapPin,
  Star,
  ShieldCheck,
  Calendar,
  Repeat,
  ShoppingBag,
  MessageSquare,
  ArrowLeft,
  Sparkles,
  Check,
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getListing, listings, isSaved, toggleSaveListing, startOrGetConversation } = useMarketplace();
  const { user } = useAuth();
  const { showToast } = useToast();

  const listing = getListing(id || '');

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  // Reviews state
  const [reviewsList, setReviewsList] = useState(INITIAL_REVIEWS);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isAddingReview, setIsAddingReview] = useState(false);

  // Modals state
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  if (!listing) {
    return (
      <div className="pt-32 pb-24 max-w-4xl mx-auto px-4 text-center">
        <h2 className="font-serif text-3xl font-bold text-narmis-parchment mb-4">
          Listing Not Found
        </h2>
        <p className="text-sm text-narmis-cream/70 mb-8">
          The requested item may have been completed, reserved, or removed by its owner.
        </p>
        <Link
          to="/explore"
          className="px-6 py-2.5 rounded-full bg-narmis-gold text-narmis-charcoal text-xs font-bold uppercase tracking-wider"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const saved = isSaved(listing.id);
  const isOwner = user?.id === listing.user_id;

  // Share handler
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Contact seller handler
  const handleContactSeller = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const convId = startOrGetConversation(listing.id, listing.user_id, `Inquiry about ${listing.title}`);
    navigate('/messages');
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newRev = {
      id: 'rev-' + Date.now(),
      reviewer_id: user?.id || 'demo-user',
      reviewer: user || {
        id: 'demo-user',
        full_name: 'Verified Buyer',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      },
      target_user_id: listing?.user_id || '',
      listing_id: listing?.id,
      rating: newRating,
      comment: newComment.trim(),
      created_at: new Date().toISOString(),
    };

    setReviewsList((prev) => [newRev, ...prev]);
    setNewComment('');
    setIsAddingReview(false);
    showToast('Your peer review has been posted!', 'success');
  };

  const relatedListings = listings
    .filter((l) => l.id !== listing.id && (l.category === listing.category || l.listing_type === listing.listing_type))
    .slice(0, 3);

  return (
    <div className="pt-28 pb-24 bg-narmis-bg min-h-screen text-narmis-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between mb-8 text-xs text-narmis-cream/60">
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 hover:text-narmis-parchment transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Marketplace</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="capitalize">{listing.listing_type}</span>
            <span>/</span>
            <span className="text-narmis-gold">{listing.category}</span>
          </div>
        </div>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Image Gallery (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary Featured Image */}
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-narmis-forestDark border border-narmis-mountain/60 shadow-2xl">
              <img
                src={listing.images[activeImageIndex] || listing.images[0]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />

              {/* Status Overlay */}
              <div className="absolute top-4 left-4 z-10 flex gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-md border shadow-md ${
                    listing.listing_type === 'rent'
                      ? 'bg-sky-950/80 text-sky-200 border-sky-600/40'
                      : listing.listing_type === 'trade'
                      ? 'bg-amber-950/80 text-amber-200 border-amber-600/40'
                      : 'bg-emerald-950/80 text-emerald-200 border-emerald-600/40'
                  }`}
                >
                  {listing.listing_type === 'rent' ? (
                    <Calendar className="w-3.5 h-3.5" />
                  ) : listing.listing_type === 'trade' ? (
                    <Repeat className="w-3.5 h-3.5" />
                  ) : (
                    <ShoppingBag className="w-3.5 h-3.5" />
                  )}
                  {listing.listing_type.toUpperCase()}
                </span>

                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-black/60 text-narmis-cream backdrop-blur-md border border-white/10">
                  {listing.condition}
                </span>
              </div>

              {/* Action Buttons top right */}
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-narmis-cream backdrop-blur-md transition-all border border-white/10"
                  title="Share Listing Link"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => toggleSaveListing(listing.id)}
                  className={`p-2.5 rounded-full backdrop-blur-md transition-all border border-white/10 ${
                    saved
                      ? 'bg-red-500 text-white shadow-lg'
                      : 'bg-black/60 hover:bg-black/90 text-narmis-cream'
                  }`}
                  title={saved ? 'Remove from Saved' : 'Save to Favorites'}
                >
                  <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Thumbnail Row if multiple images */}
            {listing.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {listing.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all ${
                      activeImageIndex === idx
                        ? 'border-narmis-gold scale-105 shadow-md'
                        : 'border-narmis-mountain/50 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Product Description */}
            <div className="bg-narmis-surface rounded-3xl p-6 sm:p-8 border border-narmis-mountain/50 space-y-4">
              <h3 className="font-serif text-xl font-bold text-narmis-parchment">
                About this Item
              </h3>
              <p className="text-sm text-narmis-cream/80 leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>

              {/* Specific features by type */}
              {listing.listing_type === 'trade' && (
                <div className="mt-4 p-4 rounded-2xl bg-amber-950/30 border border-amber-600/30 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-amber-300 font-bold uppercase tracking-wider">
                    <Repeat className="w-4 h-4" />
                    <span>Owner's Trade Wishlist</span>
                  </div>
                  <p className="text-narmis-cream/90">
                    {listing.trade_desired || 'Owner is open to all equivalent gadgets and tools.'}
                  </p>
                  {listing.trade_cash_adjustment !== undefined && listing.trade_cash_adjustment !== 0 && (
                    <p className="text-[11px] text-narmis-gold">
                      Preferred cash adjustment: ₹{listing.trade_cash_adjustment}
                    </p>
                  )}
                </div>
              )}

              {listing.listing_type === 'rent' && (
                <div className="mt-4 p-4 rounded-2xl bg-sky-950/30 border border-sky-600/30 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-sky-300 font-bold uppercase tracking-wider">
                    <Calendar className="w-4 h-4" />
                    <span>Rental Terms & Handover</span>
                  </div>
                  <p className="text-narmis-cream/90">
                    Includes all necessary cables and accessories. Valid college or government ID
                    verification required at pickup.
                  </p>
                </div>
              )}
            </div>

            {/* Community Reviews Section */}
            <div className="bg-narmis-surface rounded-3xl p-6 sm:p-8 border border-narmis-mountain/50 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-narmis-mountain/40">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-current" />
                  <h3 className="font-serif text-xl font-bold text-narmis-parchment">
                    Community Reviews ({reviewsList.length})
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddingReview(!isAddingReview)}
                  className="px-3 py-1.5 rounded-full bg-narmis-mountain hover:bg-narmis-mountain/80 border border-narmis-gold/30 text-xs font-semibold text-narmis-gold transition-colors"
                >
                  {isAddingReview ? 'Cancel' : '+ Write Review'}
                </button>
              </div>

              {/* Add Review Form */}
              {isAddingReview && (
                <form onSubmit={handleAddReview} className="p-4 rounded-2xl bg-narmis-forestDark border border-narmis-mountain/60 space-y-3 animate-fadeIn">
                  <h4 className="font-serif font-bold text-narmis-parchment text-sm">
                    Leave a Verified Peer Review
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-narmis-cream/70">Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className={`p-1 ${newRating >= star ? 'text-amber-400' : 'text-narmis-cream/30'}`}
                        >
                          <Star className="w-4 h-4 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Share details on handover, item condition, communication..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-narmis-surface border border-narmis-mountain/60 text-xs text-narmis-cream placeholder-narmis-cream/40 focus:outline-none focus:border-narmis-gold resize-none"
                    required
                  />
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-narmis-gold text-narmis-charcoal text-xs font-bold uppercase tracking-wider hover:bg-narmis-accent transition-all"
                  >
                    Post Review
                  </button>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {reviewsList.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-narmis-forestDark/50 border border-narmis-mountain/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={rev.reviewer?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                          alt={rev.reviewer?.full_name || 'Reviewer'}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-xs font-bold text-narmis-parchment">
                          {rev.reviewer?.full_name || 'Verified Member'}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-300">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-narmis-cream/80 leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Pricing & Action Box (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-narmis-surface rounded-3xl p-6 sm:p-8 border border-narmis-mountain/60 shadow-xl space-y-6 sticky top-24">
              {/* Category & Title */}
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-narmis-gold">
                  {listing.category}
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-narmis-parchment mt-1 leading-tight">
                  {listing.title}
                </h1>
                <div className="flex items-center gap-2 text-xs text-narmis-cream/70 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-narmis-gold shrink-0" />
                  <span>{listing.location}</span>
                </div>
              </div>

              {/* Price / Rate / Valuation Box */}
              <div className="p-4 rounded-2xl bg-narmis-forestDark border border-narmis-mountain/50">
                {listing.listing_type === 'rent' && (
                  <div>
                    <span className="text-xs text-narmis-cream/60 uppercase tracking-wider">
                      Rental Pricing
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-serif text-3xl font-bold text-narmis-parchment">
                        ₹{listing.rental_price?.toLocaleString('en-IN')}
                      </span>
                      <span className="text-sm text-narmis-cream/70">
                        / {listing.rental_duration || 'Day'}
                      </span>
                    </div>
                  </div>
                )}

                {listing.listing_type === 'trade' && (
                  <div>
                    <span className="text-xs text-narmis-cream/60 uppercase tracking-wider">
                      Estimated Trade Value
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-serif text-3xl font-bold text-narmis-parchment">
                        ₹{listing.estimated_value?.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-xs text-narmis-gold mt-1">
                      Open to trade proposals with optional cash adjustments.
                    </p>
                  </div>
                )}

                {listing.listing_type === 'purchase' && (
                  <div>
                    <span className="text-xs text-narmis-cream/60 uppercase tracking-wider">
                      Purchase Price
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-serif text-3xl font-bold text-emerald-400">
                        ₹{listing.purchase_price?.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-300/80 mt-1">
                      Includes simulated demo payment and immediate verified receipt.
                    </p>
                  </div>
                )}
              </div>

              {/* 10% Platform Margin Notice on items <= ₹1,000 */}
              {(listing.purchase_price || listing.rental_price || listing.estimated_value || 0) <= 1000 && (
                <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-600/40 text-xs text-amber-200/90 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-narmis-gold shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-narmis-parchment">10% Platform Protection Margin:</span>
                    <p className="text-[11px] text-amber-200/80 mt-0.5">
                      Items valued at ₹1,000 or below are protected with a 10% platform margin for peer escrow verification and fraud-free handover.
                    </p>
                  </div>
                </div>
              )}

              {/* Trade Section Free Trials Indicator */}
              {listing.listing_type === 'trade' && (
                <div className="p-3 rounded-2xl bg-narmis-forestDark/80 border border-narmis-gold/30 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-narmis-parchment font-medium">
                    <Repeat className="w-3.5 h-3.5 text-narmis-gold" />
                    <span>3 Free Trade Trials Available</span>
                  </span>
                  <span className="text-[11px] text-amber-300 font-bold uppercase tracking-wider">
                    {user?.is_trade_subscribed ? 'Elite Unlimited' : `${Math.max(0, 3 - (user?.trade_trials_used || 0))} Free Left`}
                  </span>
                </div>
              )}

              {/* PRIMARY ACTION BUTTON MATCHING TYPE */}
              <div className="space-y-3">
                {listing.listing_type === 'rent' && (
                  <button
                    onClick={() => setIsRentalModalOpen(true)}
                    className="w-full py-4 rounded-2xl bg-narmis-gold hover:bg-narmis-accent text-narmis-charcoal font-serif text-sm font-bold uppercase tracking-wider transition-all shadow-xl hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Request Rental</span>
                  </button>
                )}

                {listing.listing_type === 'trade' && (
                  <button
                    onClick={() => setIsTradeModalOpen(true)}
                    className="w-full py-4 rounded-2xl bg-narmis-gold hover:bg-narmis-accent text-narmis-charcoal font-serif text-sm font-bold uppercase tracking-wider transition-all shadow-xl hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Repeat className="w-4 h-4" />
                    <span>Make Trade Offer</span>
                  </button>
                )}

                {listing.listing_type === 'purchase' && (
                  <button
                    onClick={() => setIsPurchaseModalOpen(true)}
                    className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-narmis-charcoal font-serif text-sm font-bold uppercase tracking-wider transition-all shadow-xl hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Purchase Item (Demo)</span>
                  </button>
                )}

                {/* Secondary Contact Seller in Chat */}
                <button
                  onClick={handleContactSeller}
                  className="w-full py-3.5 rounded-2xl bg-narmis-forestDark hover:bg-narmis-mountain text-narmis-cream font-medium text-xs tracking-wider transition-all border border-narmis-mountain/60 flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 text-narmis-gold" />
                  <span>Chat with Owner</span>
                </button>
              </div>

              {/* Seller Profile Card */}
              {listing.user && (
                <div className="pt-6 border-t border-narmis-mountain/40">
                  <span className="text-xs uppercase tracking-wider text-narmis-cream/60 font-medium block mb-3">
                    Listing Owner
                  </span>
                  <div className="flex items-start gap-4">
                    <Link to={`/profile/${listing.user.id}`}>
                      <img
                        src={listing.user.avatar_url}
                        alt={listing.user.full_name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-narmis-gold/50"
                      />
                    </Link>
                    <div className="flex-1">
                      <Link
                        to={`/profile/${listing.user.id}`}
                        className="font-serif font-bold text-narmis-parchment hover:text-narmis-gold transition-colors text-sm"
                      >
                        {listing.user.full_name}
                      </Link>
                      <div className="flex items-center gap-3 text-xs text-narmis-cream/70 mt-0.5">
                        <div className="flex items-center gap-1 text-amber-300 font-bold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{listing.user.rating?.toFixed(1) || '5.0'}</span>
                        </div>
                        <span>·</span>
                        <span>{listing.user.review_count || 12} reviews</span>
                      </div>
                      <p className="text-[11px] text-narmis-cream/60 mt-1 line-clamp-1">
                        {listing.user.bio || 'Active peer member.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Similar / Recommended Products */}
        {relatedListings.length > 0 && (
          <div className="mt-20 pt-12 border-t border-narmis-mountain/40">
            <h3 className="font-serif text-2xl font-bold text-narmis-parchment mb-6">
              You Might Also Be Interested In
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedListings.map((rel) => (
                <ProductCard key={rel.id} listing={rel} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <RentalRequestModal
        listing={listing}
        isOpen={isRentalModalOpen}
        onClose={() => setIsRentalModalOpen(false)}
      />

      <TradeOfferModal
        listing={listing}
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
      />

      <PurchaseModal
        listing={listing}
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
      />
    </div>
  );
};
