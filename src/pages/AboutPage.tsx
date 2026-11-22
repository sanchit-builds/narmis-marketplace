import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookExchangeIllustration,
  LaptopRentalIllustration,
  KeyboardTradeIllustration,
  CricketPurchaseIllustration,
} from '../components/illustrations/CartoonCharacters';
import { Sparkles, Leaf, ShieldCheck, HeartHandshake, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="pt-28 pb-24 bg-narmis-bg min-h-screen text-narmis-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Hero Section */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-narmis-surface border border-narmis-gold/30 text-xs font-semibold uppercase tracking-wider text-narmis-gold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The NARMIS Story</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-narmis-parchment leading-tight">
            Things Have More Than One Life.
          </h1>

          <p className="font-serif italic text-xl text-narmis-gold">
            RENT. TRADE. PURCHASE.
          </p>

          <p className="text-base sm:text-lg text-narmis-cream/80 leading-relaxed max-w-2xl mx-auto">
            "NARMIS is built around a simple idea: things have more than one life. Many products remain
            unused while other people need them. NARMIS connects people through renting, trading and
            purchasing, making products more accessible and encouraging smarter use of resources."
          </p>
        </div>

        {/* Editorial Story / Why NARMIS Exists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-narmis-surface rounded-3xl p-8 sm:p-12 border border-narmis-mountain/60 shadow-xl">
          <div className="space-y-5">
            <span className="text-xs font-bold uppercase tracking-widest text-narmis-gold">
              Our Genesis
            </span>
            <h2 className="font-serif text-3xl font-bold text-narmis-parchment">
              Why We Built NARMIS
            </h2>
            <p className="text-sm text-narmis-cream/80 leading-relaxed">
              In college dorms, design studios, and neighborhood apartments, thousands of items sit in
              closets collecting dust: high-end cinema lenses used twice a year, mechanical keyboards
              replaced during desk upgrades, cricket bats waiting for summer matches, and textbooks read
              once.
            </p>
            <p className="text-sm text-narmis-cream/80 leading-relaxed">
              At the same time, students, creators, and hobbyists hesitate to pursue new skills because the
              upfront retail barrier is prohibitively steep. NARMIS closes that loop.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-narmis-forestDark border border-narmis-mountain/50">
                <Leaf className="w-5 h-5 text-emerald-400 mb-2" />
                <h4 className="font-serif font-bold text-narmis-parchment text-sm">Circular Economy</h4>
                <p className="text-xs text-narmis-cream/60 mt-0.5">Reducing landfill waste through shared usage.</p>
              </div>
              <div className="p-4 rounded-2xl bg-narmis-forestDark border border-narmis-mountain/50">
                <HeartHandshake className="w-5 h-5 text-narmis-gold mb-2" />
                <h4 className="font-serif font-bold text-narmis-parchment text-sm">Hyper-Local Trust</h4>
                <p className="text-xs text-narmis-cream/60 mt-0.5">Verified campus and neighborhood community peers.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <BookExchangeIllustration className="w-64 h-64 sm:w-80 sm:h-80 drop-shadow-2xl" />
          </div>
        </div>

        {/* The 3 Core Pillars */}
        <div className="space-y-10">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="font-serif text-3xl font-bold text-narmis-parchment">
              Our Tripartite Philosophy
            </h2>
            <p className="text-xs sm:text-sm text-narmis-cream/70 mt-2">
              Three flexible paths for every product in circulation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-narmis-surface rounded-3xl p-6 border border-narmis-mountain/60 shadow-lg text-center space-y-3">
              <div className="flex justify-center">
                <LaptopRentalIllustration className="w-36 h-36" />
              </div>
              <h3 className="font-serif text-xl font-bold text-narmis-parchment">
                1. RENT
              </h3>
              <p className="text-xs text-narmis-cream/75 leading-relaxed">
                Access specialized equipment on your terms: by the hour, day, or week. Earn passive income
                from gear that would otherwise sit idle.
              </p>
            </div>

            <div className="bg-narmis-surface rounded-3xl p-6 border-2 border-narmis-gold/60 shadow-xl text-center space-y-3">
              <div className="flex justify-center">
                <KeyboardTradeIllustration className="w-36 h-36" />
              </div>
              <h3 className="font-serif text-xl font-bold text-narmis-parchment">
                2. TRADE
              </h3>
              <p className="text-xs text-narmis-cream/75 leading-relaxed">
                Our signature exchange mechanism. Barter item-for-item with 3 free trials, optional Trader Elite pass, and bridge valuation gaps with
                transparent, agreed-upon cash adjustments.
              </p>
            </div>

            <div className="bg-narmis-surface rounded-3xl p-6 border border-narmis-mountain/60 shadow-lg text-center space-y-3">
              <div className="flex justify-center">
                <CricketPurchaseIllustration className="w-36 h-36" />
              </div>
              <h3 className="font-serif text-xl font-bold text-narmis-parchment">
                3. PURCHASE
              </h3>
              <p className="text-xs text-narmis-cream/75 leading-relaxed">
                When you want permanent stewardship, buy quality pre-loved goods in certified conditions
                at honest, community-fair prices.
              </p>
            </div>
          </div>
        </div>

        {/* Vision CTA */}
        <div className="text-center bg-gradient-to-r from-narmis-forestDark via-narmis-surface to-narmis-forestDark p-10 sm:p-14 rounded-3xl border border-narmis-gold/40 shadow-2xl space-y-5">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-narmis-parchment">
            Our Vision for the Future
          </h2>
          <p className="text-xs sm:text-sm text-narmis-cream/80 max-w-2xl mx-auto leading-relaxed">
            We envision cities where fewer manufactured goods are cast into landfills, where every creator
            has instantaneous access to the tools they need, and where peer trust replaces impersonal
            e-commerce giants.
          </p>
          <div className="pt-3">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-narmis-gold hover:bg-narmis-accent text-narmis-charcoal text-xs font-bold uppercase tracking-wider transition-all shadow-xl hover:scale-105 active:scale-95"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
