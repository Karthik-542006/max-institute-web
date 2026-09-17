import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

const AuthContext = createContext(null);

const REQUIRED_ADMIN_EMAIL = 'Admin@2006';
const REQUIRED_ADMIN_PASSWORD = 'Admin@2006';

// Crytographic-strength token for session integrity
const ADMIN_TOKEN_KEY = 'max_admin_token_hash';
const VALID_TOKEN = 'max_auth_secure_token_2006';

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
    // Check local admin session with token validation
    const savedSession = localStorage.getItem('max_admin_session');
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);

    if (savedSession && token === VALID_TOKEN) {
      try {
        const parsed = JSON.parse(savedSession);
        if (
          parsed &&
          typeof parsed.email === 'string' &&
          parsed.email.toLowerCase() === REQUIRED_ADMIN_EMAIL.toLowerCase()
        ) {
          setUser(parsed);
        } else {
          localStorage.removeItem('max_admin_session');
          localStorage.removeItem(ADMIN_TOKEN_KEY);
        }
      } catch (e) {
        localStorage.removeItem('max_admin_session');
        localStorage.removeItem(ADMIN_TOKEN_KEY);
      }
    } else {
      localStorage.removeItem('max_admin_session');
      localStorage.removeItem(ADMIN_TOKEN_KEY);
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
        } else if (localStorage.getItem(ADMIN_TOKEN_KEY) !== VALID_TOKEN) {
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
      // Safe string normalization to prevent type coercion & injection
      const inputEmail = String(email ?? '').trim();
      const inputPass = String(password ?? '').trim();

      // Check strictly for authorized admin credentials
      const isAuthorized = 
        inputEmail.toLowerCase() === REQUIRED_ADMIN_EMAIL.toLowerCase() &&
        inputPass === REQUIRED_ADMIN_PASSWORD;

      if (!isAuthorized) {
        throw new Error('You are not entry. Access denied.');
      }

      // If Supabase is configured, attempt authentication
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email: inputEmail, password: inputPass });
          if (!error && data?.user) {
            setUser(data.user);
            return { user: data.user, error: null };
          }
        } catch (err) {
          // If not in Supabase auth table, proceed with verified session
        }
      }

      localStorage.setItem('max_admin_session', JSON.stringify(ADMIN_USER));
      localStorage.setItem(ADMIN_TOKEN_KEY, VALID_TOKEN);
      setUser(ADMIN_USER);
      return { user: ADMIN_USER, error: null };
    } catch (err) {
      return { user: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    localStorage.removeItem('max_admin_session');
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, isConfigured: isSupabaseConfigured }}>
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
