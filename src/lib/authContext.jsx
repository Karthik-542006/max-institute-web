import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

const AuthContext = createContext(null);

const REQUIRED_ADMIN_EMAIL = 'Admin@2006';
const REQUIRED_ADMIN_PASSWORD = 'Admin@2006';

const ADMIN_USER = {
  id: 'admin-2006-id',
  email: 'Admin@2006',
  role: 'admin',
  user_metadata: { name: 'MAX Administrator' }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local admin session
    const savedSession = localStorage.getItem('max_admin_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed.email?.toLowerCase() === REQUIRED_ADMIN_EMAIL.toLowerCase()) {
          setUser(parsed);
        } else {
          localStorage.removeItem('max_admin_session');
        }
      } catch (e) {
        localStorage.removeItem('max_admin_session');
      }
    }

    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(session.user);
        } else if (!localStorage.getItem('max_admin_session')) {
          setUser(null);
        }
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const inputEmail = (email || '').trim();
      const inputPass = (password || '').trim();

      // Check strictly for authorized admin credentials
      const isAuthorized = 
        inputEmail.toLowerCase() === REQUIRED_ADMIN_EMAIL.toLowerCase() &&
        inputPass === REQUIRED_ADMIN_PASSWORD;

      if (!isAuthorized) {
        throw new Error('You are not entry. Access denied.');
      }

      // If Supabase is configured, attempt authentication or fallback to authenticated admin session
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email: inputEmail, password: inputPass });
          if (!error && data?.user) {
            setUser(data.user);
            return { user: data.user, error: null };
          }
        } catch (err) {
          // If not in Supabase auth table, proceed with verified Admin@2006 session
        }
      }

      localStorage.setItem('max_admin_session', JSON.stringify(ADMIN_USER));
      setUser(ADMIN_USER);
      return { user: ADMIN_USER, error: null };
    } catch (err) {
      return { user: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemo = () => {
    localStorage.setItem('max_admin_session', JSON.stringify(ADMIN_USER));
    setUser(ADMIN_USER);
    return ADMIN_USER;
  };

  const signOut = async () => {
    localStorage.removeItem('max_admin_session');
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, loginAsDemo, isConfigured: isSupabaseConfigured }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
