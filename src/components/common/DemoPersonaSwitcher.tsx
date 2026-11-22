import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DEMO_PROFILES, CURRENT_USER } from '../../services/mockData';
import { Sparkles, Users, X, Check, Database } from 'lucide-react';

export const DemoPersonaSwitcher: React.FC = () => {
  const { user, switchDemoUser, isSupabaseConnected } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-5 left-5 z-40">
      {isOpen ? (
        <div className="bg-narmis-surface/98 backdrop-blur-xl border-2 border-narmis-gold/70 rounded-3xl p-5 shadow-2xl w-80 text-narmis-cream animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-narmis-mountain/50 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-narmis-gold" />
              <h4 className="font-serif font-bold text-narmis-parchment text-sm">
                Hackathon Demo Switcher
              </h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-narmis-cream/60 hover:text-white p-1 rounded-full hover:bg-narmis-mountain/50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-narmis-cream/70 mb-3 leading-relaxed">
            Switch between demo user personas to inspect both sides of trade proposals, rental requests,
            and messages:
          </p>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {DEMO_PROFILES.map((profile) => {
              const isCurrent = user?.id === profile.id;

              return (
                <button
                  key={profile.id}
                  onClick={() => {
                    switchDemoUser(profile);
                    setIsOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all ${
                    isCurrent
                      ? 'bg-narmis-mountain/80 border border-narmis-gold shadow-sm'
                      : 'bg-narmis-forestDark/80 border border-narmis-mountain/40 hover:bg-narmis-mountain/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-narmis-gold"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-narmis-parchment truncate">
                        {profile.full_name}
                      </p>
                      <p className="text-[10px] text-narmis-cream/60 truncate">
                        {profile.full_name === 'Vipan'
                          ? 'Oscilloscope, Soldering & Electronics'
                          : profile.full_name === 'Shraddha'
                          ? 'Sony Cinema Camera, Studio Mic & Gown'
                          : profile.full_name === 'Sanchit'
                          ? 'PS5 GTA V, Volleyball & Keychron'
                          : profile.full_name === 'Harshit'
                          ? 'MacBook M2, Tech Stickers & Cricket Bat'
                          : profile.full_name === 'Shabadh'
                          ? 'Tolkien Hardcovers, Books & Manga'
                          : profile.full_name === 'Naina'
                          ? 'Dyson Styler, Makeup Vanity & Dresses'
                          : profile.full_name === 'Javed Bhaiya'
                          ? 'Custom FPV Drones & RC Controllers'
                          : 'Community Peer Member'}
                      </p>
                    </div>
                  </div>

                  {isCurrent && <Check className="w-4 h-4 text-narmis-gold shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-narmis-mountain/40 flex items-center justify-between text-[11px] text-narmis-cream/60">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-narmis-gold" />
              <span>{isSupabaseConnected ? 'Live Supabase' : 'Demo Local Store'}</span>
            </span>
            <span className="text-emerald-300 font-semibold">Ready for Demo</span>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2 px-4 py-2.5 rounded-full bg-narmis-surface/95 hover:bg-narmis-mountain border border-narmis-gold/70 shadow-2xl backdrop-blur-md text-xs font-semibold text-narmis-parchment transition-all hover:scale-105 active:scale-95"
          title="Switch Demo User Persona"
        >
          <Sparkles className="w-4 h-4 text-narmis-gold group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline">Demo Switcher:</span>
          <span className="text-narmis-gold font-bold truncate max-w-[100px]">
            {user?.full_name.split(' ')[0] || 'Demo'}
          </span>
        </button>
      )}
    </div>
  );
};
