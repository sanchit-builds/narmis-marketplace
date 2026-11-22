import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/common/Logo';
import { Sparkles, ArrowRight, Lock, Mail, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isSupabaseConnected } = useAuth();

  const [email, setEmail] = useState('vipan.demo@narmis.in');
  const [password, setPassword] = useState('Password123!');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const ok = await login(email, password);
      if (ok) {
        navigate('/dashboard');
      } else {
        setErrorMsg('Invalid login credentials. Try with demo account!');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error logging in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setIsLoading(true);
    await login('vipan.demo@narmis.in', 'Password123!');
    navigate('/dashboard');
  };

  return (
    <div className="pt-28 pb-20 bg-narmis-bg min-h-screen flex items-center justify-center px-4 text-narmis-cream">
      <div className="w-full max-w-md bg-narmis-surface rounded-3xl p-8 sm:p-10 border border-narmis-mountain/60 shadow-2xl relative">
        <div className="text-center mb-8">
          <Logo variant="cream" className="justify-center inline-block mb-3" />
          <h1 className="font-serif text-2xl font-bold text-narmis-parchment">
            Welcome Back to NARMIS
          </h1>
          <p className="text-xs text-narmis-cream/70 mt-1">
            Sign in to manage your rentals, trade negotiations, and listings.
          </p>
        </div>

        {/* Demo Fast Login Banner */}
        <div className="mb-6 p-3.5 rounded-2xl bg-narmis-forestDark border border-narmis-gold/40 text-xs flex items-center justify-between">
          <div>
            <span className="font-bold text-narmis-gold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hackathon Quick-Sign In</span>
            </span>
            <p className="text-[11px] text-narmis-cream/70">One-click sign in as Vipan (Demo User)</p>
          </div>
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            className="px-3 py-1.5 rounded-xl bg-narmis-gold hover:bg-narmis-accent text-narmis-charcoal font-bold text-xs shrink-0"
          >
            Quick Sign In
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-narmis-gold absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-xs sm:text-sm text-narmis-cream focus:outline-none focus:border-narmis-gold"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80">
                Password
              </label>
              <button
                type="button"
                onClick={() => alert('Password reset link sent to demo email.')}
                className="text-[11px] text-narmis-gold hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-narmis-gold absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to NARMIS</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-xs text-narmis-cream/60">
          <span>Do not have an account? </span>
          <Link to="/signup" className="text-narmis-gold font-bold hover:underline">
            Create an Account
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
