import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { CURRENT_USER } from '../services/mockData';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (fullName: string, email: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updated: Partial<UserProfile>) => void;
  switchDemoUser: (userProfile: UserProfile) => void;
  isSupabaseConnected: boolean;
  updateTradeSubscription: (subscribed: boolean, tier?: 'pro' | 'elite') => Promise<void>;
  incrementTradeTrial: () => Promise<number>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const isFresh = localStorage.getItem('narmis_auth_version') === 'v5';
    if (!isFresh) {
      localStorage.setItem('narmis_auth_version', 'v5');
      localStorage.removeItem('narmis_auth_user');
      return {
        ...CURRENT_USER,
        trade_trials_used: 0,
        is_trade_subscribed: false,
        subscription_tier: 'free',
      };
    }
    const saved = localStorage.getItem('narmis_auth_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          trade_trials_used: parsed.trade_trials_used ?? parseInt(localStorage.getItem('narmis_trade_trials_used') || '0', 10),
          is_trade_subscribed: parsed.is_trade_subscribed ?? (localStorage.getItem('narmis_is_trade_subscribed') === 'true'),
        };
      } catch (e) {
        return CURRENT_USER;
      }
    }
    return {
      ...CURRENT_USER,
      trade_trials_used: 0,
      is_trade_subscribed: false,
      subscription_tier: 'free',
    };
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('narmis_auth_user', JSON.stringify(user));
      localStorage.setItem('narmis_trade_trials_used', String(user.trade_trials_used || 0));
      localStorage.setItem('narmis_is_trade_subscribed', String(!!user.is_trade_subscribed));
    } else {
      localStorage.removeItem('narmis_auth_user');
    }
  }, [user]);

  // Sync with Supabase Auth if keys are present
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    const client = supabase;

    const syncProfileFromSupabase = async (userId: string, email?: string) => {
      try {
        const { data: profile } = await client
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        const storedTrials = parseInt(localStorage.getItem('narmis_trade_trials_used') || '0', 10);
        const storedSub = localStorage.getItem('narmis_is_trade_subscribed') === 'true';

        if (profile) {
          setUser({
            id: profile.id,
            full_name: profile.full_name || email?.split('@')[0] || 'NARMIS Member',
            email: email || profile.email,
            avatar_url: profile.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${userId}`,
            bio: profile.bio,
            location: profile.location || 'Bengaluru, India',
            rating: profile.rating || 5.0,
            review_count: profile.review_count || 0,
            trade_trials_used: profile.trade_trials_used ?? storedTrials,
            is_trade_subscribed: profile.is_trade_subscribed ?? storedSub,
            subscription_tier: profile.subscription_tier || 'free',
          });
        } else {
          // If no profile found in database yet, upsert initial record
          const initialProfile = {
            id: userId,
            full_name: email?.split('@')[0] || 'Member',
            avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${userId}`,
            bio: 'NARMIS circular community explorer.',
            location: 'Bengaluru, India',
            trade_trials_used: storedTrials,
            is_trade_subscribed: storedSub,
          };
          await client.from('profiles').upsert(initialProfile);
          setUser({
            ...initialProfile,
            email,
            rating: 5.0,
            review_count: 0,
          });
        }
      } catch (err) {
        console.error('Supabase profile sync error:', err);
      }
    };

    const checkSession = async () => {
      try {
        const { data: { session } } = await client.auth.getSession();
        if (session?.user) {
          await syncProfileFromSupabase(session.user.id, session.user.email);
        }
      } catch (err) {
        console.error('Supabase auth session error:', err);
      }
    };

    checkSession();

    const { data: { subscription } } = client.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await syncProfileFromSupabase(session.user.id, session.user.email);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase && password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          console.error('Supabase signInWithPassword error:', error);
          throw error;
        }
        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          const storedTrials = parseInt(localStorage.getItem('narmis_trade_trials_used') || '0', 10);
          const storedSub = localStorage.getItem('narmis_is_trade_subscribed') === 'true';

          setUser({
            id: data.user.id,
            full_name: profile?.full_name || data.user.user_metadata?.full_name || email.split('@')[0],
            email: data.user.email || email,
            avatar_url: profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${data.user.id}`,
            bio: profile?.bio || 'Active NARMIS member.',
            location: profile?.location || 'Bengaluru, India',
            rating: profile?.rating || 5.0,
            review_count: profile?.review_count || 0,
            trade_trials_used: profile?.trade_trials_used ?? storedTrials,
            is_trade_subscribed: profile?.is_trade_subscribed ?? storedSub,
            subscription_tier: profile?.subscription_tier || 'free',
          });
          return true;
        }
      } else {
        // Fast simulated demo login
        await new Promise((r) => setTimeout(r, 300));
        setUser({
          ...CURRENT_USER,
          email,
          full_name: email.split('@')[0].replace(/[._]/g, ' ').toUpperCase(),
          trade_trials_used: parseInt(localStorage.getItem('narmis_trade_trials_used') || '0', 10),
          is_trade_subscribed: localStorage.getItem('narmis_is_trade_subscribed') === 'true',
        });
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Login error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (fullName: string, email: string, password?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase && password) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        });
        if (error) {
          console.error('Supabase signUp error:', error);
          throw error;
        }
        if (data.user) {
          // Explicitly save the profile row to Supabase online database
          try {
            await supabase.from('profiles').upsert({
              id: data.user.id,
              full_name: fullName,
              avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fullName)}`,
              bio: 'New member of NARMIS circular community.',
              location: 'Bengaluru, India',
              trade_trials_used: 0,
              is_trade_subscribed: false,
              subscription_tier: 'free',
            });
          } catch (profileErr) {
            console.warn('Profile upsert notice:', profileErr);
          }

          setUser({
            id: data.user.id,
            full_name: fullName,
            email,
            avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fullName)}`,
            bio: 'New member of NARMIS circular community.',
            location: 'Bengaluru, India',
            rating: 5.0,
            review_count: 0,
            joined_date: 'November 2026',
            trade_trials_used: 0,
            is_trade_subscribed: false,
            subscription_tier: 'free',
          });
          return true;
        }
      } else {
        await new Promise((r) => setTimeout(r, 400));
        setUser({
          id: 'u-' + Math.random().toString(36).substring(2, 9),
          full_name: fullName,
          email,
          avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fullName)}`,
          bio: 'New member of NARMIS community.',
          location: 'Bengaluru, India',
          rating: 5.0,
          review_count: 0,
          joined_date: 'November 2026',
          trade_trials_used: 0,
          is_trade_subscribed: false,
          subscription_tier: 'free',
        });
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Signup error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
      setUser(null);
      localStorage.removeItem('narmis_auth_user');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    if (!user) return;
    const newUser = { ...user, ...updated };
    setUser(newUser);
  };

  const switchDemoUser = (profile: UserProfile) => {
    setUser(profile);
    localStorage.setItem('narmis_auth_user', JSON.stringify(profile));
  };

  const updateTradeSubscription = async (subscribed: boolean, tier: 'pro' | 'elite' = 'elite') => {
    if (!user) return;
    const updated = {
      ...user,
      is_trade_subscribed: subscribed,
      subscription_tier: tier,
    };
    setUser(updated);
    localStorage.setItem('narmis_is_trade_subscribed', String(subscribed));
    localStorage.setItem('narmis_auth_user', JSON.stringify(updated));

    if (isSupabaseConfigured && supabase && user.id) {
      try {
        await supabase.from('profiles').update({
          is_trade_subscribed: subscribed,
          subscription_tier: tier,
        }).eq('id', user.id);
      } catch (err) {
        console.warn('Supabase subscription update notice:', err);
      }
    }
  };

  const incrementTradeTrial = async (): Promise<number> => {
    const current = user?.trade_trials_used || 0;
    const next = current + 1;
    if (user) {
      const updated = { ...user, trade_trials_used: next };
      setUser(updated);
      localStorage.setItem('narmis_auth_user', JSON.stringify(updated));
    }
    localStorage.setItem('narmis_trade_trials_used', String(next));

    if (isSupabaseConfigured && supabase && user?.id) {
      try {
        await supabase.from('profiles').update({
          trade_trials_used: next,
        }).eq('id', user.id);
      } catch (err) {
        console.warn('Supabase trial count update notice:', err);
      }
    }
    return next;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
        switchDemoUser,
        isSupabaseConnected: isSupabaseConfigured,
        updateTradeSubscription,
        incrementTradeTrial,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
