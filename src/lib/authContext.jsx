import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';
import { realtimeManager } from '../services/realtime/realtimeManager';

const AuthContext = createContext(null);

const DEFAULT_ADMIN_EMAIL = 'Admin@2006';
const DEFAULT_ADMIN_PASSWORD = 'Admin@2006';

// Multi-admin credential aliases for testing & institutional operations
const AUTHORIZED_ADMIN_ALIASES = [
  { email: 'admin@2006', role: 'system_admin', name: 'Master System Admin' },
  { email: 'admin@20006', role: 'system_admin', name: 'Master System Admin' },
  { email: 'admin1@maxinstitute.edu.in', role: 'system_admin', name: 'System Admin 1' },
  { email: 'admin2@maxinstitute.edu.in', role: 'admin', name: 'System Admin 2' },
  { email: 'admin3@maxinstitute.edu.in', role: 'admin', name: 'System Admin 3' },
  { email: 'contact@maxinstitute.edu.in', role: 'system_admin', name: 'MAX Institution Director' }
];

const ADMIN_TOKEN_KEY = 'max_admin_session_token';

// Safe helper to record admin activity without ever blocking login or application flow
async function safeLogAdminActivity(activity) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    const { error } = await supabase
      .from('admin_activity_log')
      .insert(activity);

    if (error) {
      console.warn('Admin activity log notice:', error);
    }
  } catch (error) {
    console.warn('Admin activity logging exception:', error);
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to fetch user's profile role from Supabase
  const fetchProfileRole = async (userId, userEmail) => {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      let query = supabase.from('profiles').select('*');
      if (userId) {
        query = query.eq('id', userId);
      } else if (userEmail) {
        query = query.eq('email', userEmail);
      }
      const { data, error } = await query.maybeSingle();
      if (!error && data) {
        return data;
      }
    } catch (e) {
      console.warn('Profile fetch notice:', e);
    }
    return null;
  };

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      // 1. Check local session storage first
      const savedSession = localStorage.getItem('max_admin_session');
      const savedToken = localStorage.getItem(ADMIN_TOKEN_KEY);

      if (savedSession && savedToken) {
        try {
          const parsed = JSON.parse(savedSession);
          if (parsed && parsed.email && (parsed.role === 'system_admin' || parsed.role === 'admin')) {
            if (isMounted) setUser(parsed);
          }
        } catch (e) {
          localStorage.removeItem('max_admin_session');
          localStorage.removeItem(ADMIN_TOKEN_KEY);
        }
      }

      // 2. Check Supabase auth session
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && isMounted) {
            const profile = await fetchProfileRole(session.user.id, session.user.email);
            const role = profile?.role || 'admin';
            const adminData = {
              id: session.user.id,
              email: session.user.email,
              role: role,
              full_name: profile?.full_name || session.user.user_metadata?.full_name || 'Administrator',
              is_active: profile?.is_active !== false
            };
            setUser(adminData);
            localStorage.setItem('max_admin_session', JSON.stringify(adminData));
            localStorage.setItem(ADMIN_TOKEN_KEY, 'active');
          }
        } catch (e) {
          console.warn('Supabase auth session fetch warning:', e);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            const profile = await fetchProfileRole(session.user.id, session.user.email);
            const role = profile?.role || 'admin';
            const adminData = {
              id: session.user.id,
              email: session.user.email,
              role: role,
              full_name: profile?.full_name || session.user.user_metadata?.full_name || 'Administrator',
              is_active: profile?.is_active !== false
            };
            if (isMounted) setUser(adminData);
            localStorage.setItem('max_admin_session', JSON.stringify(adminData));
            localStorage.setItem(ADMIN_TOKEN_KEY, 'active');
          } else {
            // Only clear if no valid manual admin session
            const currentSaved = localStorage.getItem('max_admin_session');
            if (!currentSaved && isMounted) {
              setUser(null);
            }
          }
        });

        if (isMounted) setLoading(false);
        return () => subscription.unsubscribe();
      } else {
        if (isMounted) setLoading(false);
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // Track presence when user is logged in
  useEffect(() => {
    if (user) {
      const cleanupPresence = realtimeManager.trackAdminPresence(user);
      return () => cleanupPresence && cleanupPresence();
    }
  }, [user?.id, user?.email]);

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const inputEmail = String(email ?? '').trim();
      const inputPass = String(password ?? '').trim();

      if (!inputEmail || !inputPass) {
        throw new Error('Please enter both email and password.');
      }

      // Check if matches known administrator alias
      const normalizedInput = inputEmail.toLowerCase();
      const matchedAlias = AUTHORIZED_ADMIN_ALIASES.find(
        (a) => a.email.toLowerCase() === normalizedInput
      );

      // 1. Try Supabase Auth first
      let supabaseUser = null;
      let profile = null;

      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: inputEmail,
            password: inputPass
          });

          if (!error && data?.user) {
            supabaseUser = data.user;
            profile = await fetchProfileRole(data.user.id, data.user.email);
            
            // Check role authorization
            const userRole = profile?.role || 'admin';
            if (userRole !== 'system_admin' && userRole !== 'admin') {
              await supabase.auth.signOut();
              throw new Error('Access denied: You do not have administrator permissions.');
            }

            const adminUserObj = {
              id: data.user.id,
              email: data.user.email,
              role: userRole,
              full_name: profile?.full_name || data.user.user_metadata?.name || 'Administrator',
              is_active: profile?.is_active !== false
            };

            setUser(adminUserObj);
            localStorage.setItem('max_admin_session', JSON.stringify(adminUserObj));
            localStorage.setItem(ADMIN_TOKEN_KEY, 'active');

            // Log admin login activity safely without blocking
            await safeLogAdminActivity({
              admin_id: adminUserObj.id,
              admin_email: adminUserObj.email,
              action: 'LOGIN',
              table_name: 'auth',
              record_id: adminUserObj.id,
              new_data: { login_time: new Date().toISOString() }
            });

            return { user: adminUserObj, error: null };
          }
        } catch (supabaseErr) {
          // If standard credential matches, fallback to authorized session
          if (supabaseErr.message && supabaseErr.message.includes('Access denied')) {
            throw supabaseErr;
          }
        }
      }

      // 2. Fallback check for Default Master Admin or Authorized Admin Aliases
      const isValidPassword =
        inputPass === DEFAULT_ADMIN_PASSWORD ||
        inputPass === 'Admin@20006' ||
        inputPass === 'Admin@2006';

      const isMasterAdmin =
        (normalizedInput === DEFAULT_ADMIN_EMAIL.toLowerCase() ||
         normalizedInput === 'admin@2006' ||
         normalizedInput === 'admin@20006' ||
         normalizedInput === 'admin') &&
        isValidPassword;

      const isAliasAdmin = matchedAlias && isValidPassword;

      if (isMasterAdmin || isAliasAdmin) {
        const selectedAlias = matchedAlias || {
          email: inputEmail,
          role: 'system_admin',
          name: 'Master System Administrator'
        };

        const adminUserObj = {
          id: `admin-${selectedAlias.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
          email: selectedAlias.email,
          role: selectedAlias.role,
          full_name: selectedAlias.name,
          is_active: true
        };

        localStorage.setItem('max_admin_session', JSON.stringify(adminUserObj));
        localStorage.setItem(ADMIN_TOKEN_KEY, 'active');
        setUser(adminUserObj);

        // Record activity log safely without blocking
        await safeLogAdminActivity({
          admin_id: adminUserObj.id,
          admin_email: adminUserObj.email,
          action: 'LOGIN',
          table_name: 'auth',
          record_id: adminUserObj.id,
          new_data: { login_time: new Date().toISOString() }
        });

        return { user: adminUserObj, error: null };
      }

      throw new Error('Invalid administrator credentials. Access denied.');
    } catch (err) {
      return { user: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (user) {
      await safeLogAdminActivity({
        admin_id: user.id,
        admin_email: user.email,
        action: 'LOGOUT',
        table_name: 'auth',
        record_id: user.id,
        new_data: { logout_time: new Date().toISOString() }
      });
    }

    localStorage.removeItem('max_admin_session');
    localStorage.removeItem(ADMIN_TOKEN_KEY);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
        isConfigured: isSupabaseConfigured,
        isSystemAdmin: user?.role === 'system_admin'
      }}
    >
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
