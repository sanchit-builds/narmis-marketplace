import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { ListingCategory, ListingCondition, ListingType } from '../types';
import { uploadImageToSupabase } from '../services/storage';
import { calculatePlatformMargin } from '../utils/marginCalculator';
import {
  Upload,
  Calendar,
  Repeat,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  X,
  ArrowRight,
  ArrowLeft,
  Eye,
  Camera,
  Star,
  Cloud,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

const CATEGORIES: ListingCategory[] = [
  'Electronics',
  'Computers and Accessories',
  'Books',
  'Tools and Equipment',
  'Photography',
  'Gaming',
  'Sports Equipment',
  'Cricket Equipment',
  'Fashion & Apparel',
  'Furniture',
  'Other',
];

const CONDITIONS: ListingCondition[] = [
  'Brand New',
  'Like New',
  'Excellent',
  'Good',
  'Fair',
];

export const CreateListingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addListing } = useMarketplace();
  const { user, isAuthenticated } = useAuth();

  // Wizard Step: 1 = Details & Category, 2 = Listing Type & Fields, 3 = Images & Preview
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [title, setTitle] = useState(searchParams.get('title') || '');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ListingCategory>('Electronics');
  const [condition, setCondition] = useState<ListingCondition>('Excellent');
  const [listingType, setListingType] = useState<ListingType>(
    (searchParams.get('type') as ListingType) || 'rent'
  );
  const [location, setLocation] = useState(user?.location || 'Indiranagar, Bengaluru');

  // Conditional Fields: Rent
  const [rentalPrice, setRentalPrice] = useState<number>(500);
  const [rentalDuration, setRentalDuration] = useState<'Hourly' | 'Daily' | 'Weekly'>('Daily');

  // Conditional Fields: Trade
  const [estimatedValue, setEstimatedValue] = useState<number>(4000);
  const [tradeDesired, setTradeDesired] = useState('');
  const [tradeCashAdjustment, setTradeCashAdjustment] = useState<number>(0);

  // Conditional Fields: Purchase
  const [purchasePrice, setPurchasePrice] = useState<number>(4500);

  // Images state (data URLs or URLs)
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800',
  ]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Process a list of File objects and upload directly to Supabase Storage
  const processFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    setIsUploadingImage(true);
    setErrorMsg('');

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Only image files (JPG, PNG, WEBP) are supported.');
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('Image size should be below 10MB.');
        continue;
      }

      setUploadProgressText(`Uploading ${i + 1} of ${files.length} directly to Supabase Storage...`);
      try {
        const result = await uploadImageToSupabase(file);
        if (result.url) {
          setImages((prev) => [...prev, result.url]);
        }
      } catch (err: any) {
        console.error('Image upload failed:', err);
        setErrorMsg(err.message || 'Image upload error.');
      }
    }

    setIsUploadingImage(false);
    setUploadProgressText('');
  };

  // Handle local image file upload preview
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processFiles(files);
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const [selected] = copy.splice(index, 1);
      return [selected, ...copy];
    });
  };

  const handleAddImageUrl = () => {
    if (imageUrlInput.trim()) {
      setImages((prev) => [...prev, imageUrlInput.trim()]);
      setImageUrlInput('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitListing = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!title.trim() || !description.trim()) {
      setErrorMsg('Please provide a title and detailed description.');
      return;
    }

    if (images.length === 0) {
      setErrorMsg('Please upload at least one product photo.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const created = await addListing({
        title,
        description,
        category,
        condition,
        listingType: listingType,
        listing_type: listingType,
        rental_price: listingType === 'rent' ? rentalPrice : undefined,
        rental_duration: listingType === 'rent' ? rentalDuration : undefined,
        availability_status: 'available',
        estimated_value: listingType === 'trade' ? estimatedValue : undefined,
        trade_desired: listingType === 'trade' ? tradeDesired : undefined,
        trade_cash_adjustment: listingType === 'trade' ? tradeCashAdjustment : undefined,
        purchase_price: listingType === 'purchase' ? purchasePrice : undefined,
        images,
        location,
        featured: false,
      } as any);

      navigate(`/product/${created.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to publish listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-28 pb-24 bg-narmis-bg min-h-screen text-narmis-cream">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-narmis-surface border border-narmis-gold/30 text-xs font-semibold uppercase tracking-wider text-narmis-gold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Circular Economy Creator</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-narmis-parchment">
            Create a New Listing
          </h1>
          <p className="text-xs sm:text-sm text-narmis-cream/70 mt-2">
            Give your equipment, electronics, books, or gear more than one life.
          </p>
        </div>

        {/* Wizard Stepper Bar */}
        <div className="bg-narmis-surface rounded-2xl p-4 border border-narmis-mountain/60 shadow-lg mb-8">
          <div className="flex items-center justify-between max-w-md mx-auto text-xs">
            <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-narmis-gold font-bold' : 'text-narmis-cream/50'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold ${currentStep >= 1 ? 'bg-narmis-gold text-narmis-charcoal' : 'bg-narmis-forestDark text-narmis-cream/50'}`}>
                1
              </div>
              <span className="hidden sm:inline">Details</span>
            </div>

            <div className={`h-0.5 w-12 sm:w-20 ${currentStep >= 2 ? 'bg-narmis-gold' : 'bg-narmis-mountain'}`} />

            <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-narmis-gold font-bold' : 'text-narmis-cream/50'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold ${currentStep >= 2 ? 'bg-narmis-gold text-narmis-charcoal' : 'bg-narmis-forestDark text-narmis-cream/50'}`}>
                2
              </div>
              <span className="hidden sm:inline">Pricing & Model</span>
            </div>

            <div className={`h-0.5 w-12 sm:w-20 ${currentStep >= 3 ? 'bg-narmis-gold' : 'bg-narmis-mountain'}`} />

            <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-narmis-gold font-bold' : 'text-narmis-cream/50'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold ${currentStep >= 3 ? 'bg-narmis-gold text-narmis-charcoal' : 'bg-narmis-forestDark text-narmis-cream/50'}`}>
                3
              </div>
              <span className="hidden sm:inline">Photos & Publish</span>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Wizard Form Panels */}
        <div className="bg-narmis-surface rounded-3xl p-6 sm:p-10 border border-narmis-mountain/60 shadow-2xl">
          {/* STEP 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="font-serif text-2xl font-bold text-narmis-parchment pb-3 border-b border-narmis-mountain/40">
                Step 1: Product Information
              </h2>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/90 mb-2">
                  Listing Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sony Alpha 7 IV Camera / Keychron Mechanical Keyboard"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-sm text-narmis-cream placeholder-narmis-cream/40 focus:outline-none focus:border-narmis-gold"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/90 mb-2">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ListingCategory)}
                    className="w-full px-4 py-3 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-sm text-narmis-cream focus:outline-none focus:border-narmis-gold cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-narmis-surface">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/90 mb-2">
                    Condition *
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as ListingCondition)}
                    className="w-full px-4 py-3 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-sm text-narmis-cream focus:outline-none focus:border-narmis-gold cursor-pointer"
                  >
                    {CONDITIONS.map((cond) => (
                      <option key={cond} value={cond} className="bg-narmis-surface">
                        {cond}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/90 mb-2">
                  Detailed Description *
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe specifications, what cables/accessories are included, why you are sharing it, and any pickup details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-sm text-narmis-cream placeholder-narmis-cream/40 focus:outline-none focus:border-narmis-gold resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/90 mb-2">
                  Item Location (Neighborhood / Campus)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Indiranagar, Bengaluru"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-sm text-narmis-cream placeholder-narmis-cream/40 focus:outline-none focus:border-narmis-gold"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!title.trim() || !description.trim()) {
                      setErrorMsg('Please fill in title and description first.');
                      return;
                    }
                    setErrorMsg('');
                    setCurrentStep(2);
                  }}
                  className="px-8 py-3.5 rounded-full bg-narmis-gold hover:bg-narmis-accent text-narmis-charcoal text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2"
                >
                  <span>Next: Choose Model</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Listing Type & Custom Fields */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="font-serif text-2xl font-bold text-narmis-parchment pb-3 border-b border-narmis-mountain/40">
                Step 2: Select Marketplace Model
              </h2>

              {/* 3 Model Selection Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setListingType('rent')}
                  className={`p-5 rounded-2xl border text-left transition-all ${
                    listingType === 'rent'
                      ? 'bg-sky-950/60 border-sky-400 shadow-lg ring-1 ring-sky-400'
                      : 'bg-narmis-forestDark/60 border-narmis-mountain/60 hover:bg-narmis-mountain/30'
                  }`}
                >
                  <Calendar className="w-6 h-6 text-sky-400 mb-2" />
                  <h4 className="font-serif font-bold text-narmis-parchment text-base">RENT</h4>
                  <p className="text-xs text-narmis-cream/70 mt-1">
                    Lend your gear temporarily for hourly or daily rates.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setListingType('trade')}
                  className={`p-5 rounded-2xl border text-left transition-all ${
                    listingType === 'trade'
                      ? 'bg-amber-950/60 border-amber-400 shadow-lg ring-1 ring-amber-400'
                      : 'bg-narmis-forestDark/60 border-narmis-mountain/60 hover:bg-narmis-mountain/30'
                  }`}
                >
                  <Repeat className="w-6 h-6 text-amber-400 mb-2" />
                  <h4 className="font-serif font-bold text-narmis-parchment text-base">TRADE</h4>
                  <p className="text-xs text-narmis-cream/70 mt-1">
                    Exchange for another item with optional cash adjustment.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setListingType('purchase')}
                  className={`p-5 rounded-2xl border text-left transition-all ${
                    listingType === 'purchase'
                      ? 'bg-emerald-950/60 border-emerald-400 shadow-lg ring-1 ring-emerald-400'
                      : 'bg-narmis-forestDark/60 border-narmis-mountain/60 hover:bg-narmis-mountain/30'
                  }`}
                >
                  <ShoppingBag className="w-6 h-6 text-emerald-400 mb-2" />
                  <h4 className="font-serif font-bold text-narmis-parchment text-base">PURCHASE</h4>
                  <p className="text-xs text-narmis-cream/70 mt-1">
                    Sell outright for direct demo payment in INR.
                  </p>
                </button>
              </div>

              {/* Conditional Fields: RENT */}
              {listingType === 'rent' && (
                <div className="p-6 rounded-2xl bg-sky-950/20 border border-sky-600/30 space-y-4">
                  <h3 className="font-serif text-lg font-bold text-sky-200">
                    Rental Pricing & Duration
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5">
                        Rental Price (₹) *
                      </label>
                      <input
                        type="number"
                        min="50"
                        step="50"
                        value={rentalPrice}
                        onChange={(e) => setRentalPrice(Number(e.target.value) || 0)}
                        className="w-full px-3 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-sm text-narmis-cream focus:outline-none focus:border-narmis-gold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5">
                        Duration Type
                      </label>
                      <select
                        value={rentalDuration}
                        onChange={(e) => setRentalDuration(e.target.value as any)}
                        className="w-full px-3 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-sm text-narmis-cream focus:outline-none focus:border-narmis-gold cursor-pointer"
                      >
                        <option value="Hourly">Hourly</option>
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                      </select>
                    </div>
                  </div>

                  {rentalPrice > 0 && (
                    <div className="p-3.5 rounded-xl bg-sky-950/40 border border-sky-500/40 space-y-1.5 text-xs">
                      <div className="flex justify-between items-center text-sky-200">
                        <span className="flex items-center gap-1 font-semibold">
                          <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                          <span>NARMIS Margin ({calculatePlatformMargin(rentalPrice).marginPercentText}):</span>
                        </span>
                        <span className="font-bold">₹{calculatePlatformMargin(rentalPrice).platformMargin}</span>
                      </div>
                      <div className="flex justify-between items-center text-emerald-300 font-bold pt-1 border-t border-sky-900/50">
                        <span>Your Estimated Net Rate:</span>
                        <span>₹{calculatePlatformMargin(rentalPrice).sellerPayout} / {rentalDuration.toLowerCase()}</span>
                      </div>
                      {rentalPrice <= 1000 && (
                        <p className="text-[11px] text-sky-200/80 pt-0.5">
                          🛡️ 10% platform margin applies to rentals ₹1,000 or below for equipment damage coverage.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Conditional Fields: TRADE */}
              {listingType === 'trade' && (
                <div className="p-6 rounded-2xl bg-amber-950/20 border border-amber-600/30 space-y-4">
                  <h3 className="font-serif text-lg font-bold text-amber-200">
                    Trade Valuation & Wishlist
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5">
                        Your Item Estimated Value (₹) *
                      </label>
                      <input
                        type="number"
                        min="100"
                        step="100"
                        value={estimatedValue}
                        onChange={(e) => setEstimatedValue(Number(e.target.value) || 0)}
                        className="w-full px-3 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-sm text-narmis-cream focus:outline-none focus:border-narmis-gold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5">
                        Preferred Cash Adjustment (₹)
                      </label>
                      <input
                        type="number"
                        step="100"
                        value={tradeCashAdjustment}
                        onChange={(e) => setTradeCashAdjustment(Number(e.target.value) || 0)}
                        placeholder="e.g. +500 to request extra cash"
                        className="w-full px-3 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-sm text-narmis-cream focus:outline-none focus:border-narmis-gold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5">
                      Items You Wish to Trade For
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Gaming monitor, mechanical keyboard, or tennis racket"
                      value={tradeDesired}
                      onChange={(e) => setTradeDesired(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-sm text-narmis-cream focus:outline-none focus:border-narmis-gold"
                    />
                  </div>

                  {estimatedValue > 0 && estimatedValue <= 1000 && (
                    <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-narmis-gold" />
                        <span>NARMIS 10% Protection Margin Tier (Items ≤ ₹1,000)</span>
                      </span>
                      <span className="font-bold">10% Platform Escrow (₹{calculatePlatformMargin(estimatedValue).platformMargin})</span>
                    </div>
                  )}
                </div>
              )}

              {/* Conditional Fields: PURCHASE */}
              {listingType === 'purchase' && (
                <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-600/30 space-y-4">
                  <h3 className="font-serif text-lg font-bold text-emerald-200">
                    Direct Purchase Price
                  </h3>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5">
                      Selling Price (₹) *
                    </label>
                    <input
                      type="number"
                      min="100"
                      step="100"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-sm text-narmis-cream focus:outline-none focus:border-narmis-gold"
                      required
                    />
                  </div>

                  {/* 10% Margin Breakdown Card */}
                  {purchasePrice > 0 && (
                    <div className="p-4 rounded-xl bg-narmis-forestDark/80 border border-narmis-gold/40 space-y-2 text-xs">
                      <div className="flex justify-between text-narmis-cream/80">
                        <span>Product Selling Price:</span>
                        <span className="font-semibold text-narmis-parchment">₹{purchasePrice.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-amber-300">
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>NARMIS Platform Margin ({calculatePlatformMargin(purchasePrice).marginPercentText}):</span>
                        </span>
                        <span className="font-bold">- ₹{calculatePlatformMargin(purchasePrice).platformMargin.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="pt-2 border-t border-narmis-mountain/50 flex justify-between font-bold text-sm text-emerald-400">
                        <span>Your Estimated Net Payout:</span>
                        <span>₹{calculatePlatformMargin(purchasePrice).sellerPayout.toLocaleString('en-IN')}</span>
                      </div>

                      {purchasePrice <= 1000 ? (
                        <p className="text-[11px] text-amber-200/90 pt-1">
                          🛡️ <strong>10% Margin Policy:</strong> For items ₹1,000 or below, NARMIS maintains a 10% platform margin to ensure full buyer escrow protection and safe peer pickup.
                        </p>
                      ) : (
                        <p className="text-[11px] text-narmis-cream/60 pt-1">
                          Standard 5% platform fee for items above ₹1,000.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-3 rounded-full bg-narmis-forestDark hover:bg-narmis-mountain text-narmis-cream text-xs font-semibold transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-8 py-3.5 rounded-full bg-narmis-gold hover:bg-narmis-accent text-narmis-charcoal text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2"
                >
                  <span>Next: Photos & Preview</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Photos, Preview & Publish */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-narmis-mountain/40 gap-2">
                <h2 className="font-serif text-2xl font-bold text-narmis-parchment">
                  Step 3: Upload Photos & Publish
                </h2>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-[11px] text-emerald-300">
                  <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Supabase Online Storage Active</span>
                </div>
              </div>

              {/* Uploading progress notification */}
              {isUploadingImage && (
                <div className="p-3.5 rounded-2xl bg-amber-950/60 border border-narmis-gold flex items-center justify-center gap-2 text-xs text-narmis-parchment animate-pulse shadow-lg">
                  <Loader2 className="w-4 h-4 text-narmis-gold animate-spin" />
                  <span>{uploadProgressText || 'Uploading directly to Supabase Storage...'}</span>
                </div>
              )}

              {/* Photo Upload Box */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/90">
                    Product Photos * ({images.length} added)
                  </label>
                  {images.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setImages([])}
                      className="text-[11px] text-red-400 hover:text-red-300 font-medium transition-colors"
                    >
                      Clear all photos
                    </button>
                  )}
                </div>

                {/* Drag & Drop Area */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                    isDragging
                      ? 'border-narmis-gold bg-narmis-gold/10 scale-[1.01]'
                      : 'border-narmis-mountain/80 hover:border-narmis-gold/70 bg-narmis-forestDark/50'
                  }`}
                >
                  <Upload className={`w-8 h-8 mx-auto mb-2 transition-transform ${isDragging ? 'text-narmis-gold scale-125' : 'text-narmis-gold'}`} />
                  <p className="text-xs sm:text-sm font-semibold text-narmis-parchment">
                    {isDragging ? 'Drop your photos right here!' : 'Drag & drop product photos here'}
                  </p>
                  <p className="text-[11px] text-narmis-cream/60 mt-1 mb-4">
                    Supports high-resolution JPG, PNG, WEBP from your computer or phone
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {/* File Picker */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-full bg-narmis-gold hover:bg-narmis-accent text-narmis-charcoal text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Choose Files</span>
                    </button>

                    {/* Camera Capture */}
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="px-4 py-2 rounded-full bg-narmis-mountain hover:bg-narmis-mountain/80 text-narmis-parchment text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 border border-narmis-gold/30"
                    >
                      <Camera className="w-3.5 h-3.5 text-narmis-gold" />
                      <span>Take Photo</span>
                    </button>
                  </div>
                </div>

                {/* Add via direct Image URL */}
                <div className="flex gap-2 mt-3">
                  <input
                    type="url"
                    placeholder="Or paste an image web URL..."
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddImageUrl();
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-xs text-narmis-cream placeholder-narmis-cream/40 focus:outline-none focus:border-narmis-gold"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-4 py-2 rounded-xl bg-narmis-mountain hover:bg-narmis-mountain/80 text-narmis-parchment text-xs font-semibold"
                  >
                    Add URL
                  </button>
                </div>
              </div>

              {/* Uploaded Photos Preview Row with Cover Photo star & Reorder */}
              {images.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-narmis-cream/80 font-medium">
                      Photos ({images.length}) — Click <Star className="w-3 h-3 inline text-narmis-gold" /> on any photo to set as cover
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className={`relative aspect-square rounded-xl overflow-hidden border group shadow-md transition-all ${
                          idx === 0
                            ? 'border-narmis-gold ring-2 ring-narmis-gold/50'
                            : 'border-narmis-mountain/60 hover:border-narmis-parchment/60'
                        }`}
                      >
                        <img src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />

                        {/* Primary Cover Badge */}
                        {idx === 0 && (
                          <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-narmis-gold text-narmis-charcoal text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shadow">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            <span>Cover</span>
                          </div>
                        )}

                        {/* Set as Cover button for non-primary photos */}
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(idx)}
                            title="Set as main cover photo"
                            className="absolute top-1 left-1 p-1 rounded-full bg-black/60 text-narmis-cream/70 hover:text-narmis-gold opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Remove Image Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          title="Remove photo"
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-red-400 hover:text-red-300 opacity-90 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>

                        <div className="absolute bottom-1 right-1 text-[9px] px-1 bg-black/60 text-white/80 rounded">
                          #{idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Listing Summary Preview */}
              <div className="p-5 rounded-2xl bg-narmis-forestDark border border-narmis-mountain/50 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-narmis-gold uppercase tracking-wider">
                  <Eye className="w-4 h-4" />
                  <span>Listing Preview Summary</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-narmis-cream/60">Title:</span>
                    <p className="font-semibold text-narmis-parchment">{title}</p>
                  </div>
                  <div>
                    <span className="text-narmis-cream/60">Category:</span>
                    <p className="font-semibold text-narmis-parchment">{category}</p>
                  </div>
                  <div>
                    <span className="text-narmis-cream/60">Model:</span>
                    <p className="font-semibold text-narmis-parchment uppercase">{listingType}</p>
                  </div>
                  <div>
                    <span className="text-narmis-cream/60">
                      {listingType === 'rent'
                        ? 'Rental Rate:'
                        : listingType === 'trade'
                        ? 'Estimated Value:'
                        : 'Price:'}
                    </span>
                    <p className="font-serif font-bold text-narmis-gold">
                      ₹
                      {listingType === 'rent'
                        ? `${rentalPrice} / ${rentalDuration}`
                        : listingType === 'trade'
                        ? `${estimatedValue}`
                        : `${purchasePrice}`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 rounded-full bg-narmis-forestDark hover:bg-narmis-mountain text-narmis-cream text-xs font-semibold transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleSubmitListing}
                  disabled={isSubmitting}
                  className="px-8 py-3.5 rounded-full bg-narmis-gold hover:bg-narmis-accent text-narmis-charcoal text-xs font-bold uppercase tracking-wider shadow-xl transition-all flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Publishing...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Publish Listing Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
