import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/common/Logo';
import { ArrowRight, Lock, Mail, User, ShieldCheck } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      const ok = await signup(fullName, email, password);
      if (ok) {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error signing up.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-20 bg-narmis-bg min-h-screen flex items-center justify-center px-4 text-narmis-cream">
      <div className="w-full max-w-md bg-narmis-surface rounded-3xl p-8 sm:p-10 border border-narmis-mountain/60 shadow-2xl relative">
        <div className="text-center mb-8">
          <Logo variant="cream" className="justify-center inline-block mb-3" />
          <h1 className="font-serif text-2xl font-bold text-narmis-parchment">
            Join the NARMIS Circle
          </h1>
          <p className="text-xs text-narmis-cream/70 mt-1">
            Give items a second life. Rent, trade, and buy with community trust.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-narmis-gold absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Aarav Sharma"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-xs sm:text-sm text-narmis-cream focus:outline-none focus:border-narmis-gold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-narmis-gold absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aarav@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-xs sm:text-sm text-narmis-cream focus:outline-none focus:border-narmis-gold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-narmis-gold absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                minLength={6}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-xs sm:text-sm text-narmis-cream focus:outline-none focus:border-narmis-gold"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-narmis-gold hover:bg-narmis-accent text-narmis-charcoal text-xs font-bold uppercase tracking-wider transition-all shadow-lg hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Create Free Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-xs text-narmis-cream/60">
          <span>Already have an account? </span>
          <Link to="/login" className="text-narmis-gold font-bold hover:underline">
            Log In
          </Link>
        </div>

        <div className="mt-4 pt-4 border-t border-narmis-mountain/40 text-center flex items-center justify-center gap-1.5 text-[11px] text-emerald-400/90 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Supabase Online Auth • Real-Time Cloud Persistence</span>
        </div>
      </div>
    </div>
  );
};
