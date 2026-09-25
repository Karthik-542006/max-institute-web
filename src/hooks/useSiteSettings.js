import { useState, useEffect } from 'react';
import { dataService } from '../lib/dataService';

/**
 * Custom React Hook: useSiteSettings
 * 
 * Automatically fetches the site settings from Supabase on initial load
 * and listens for Supabase Realtime changes on the `site_settings` table.
 * 
 * Whenever an Admin changes opening_time, closing_time, phone, email, etc.,
 * this hook immediately updates the React state across all open client pages.
 */
export function useSiteSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      const data = await dataService.getSettings();
      if (isMounted) {
        setSettings(data);
        setLoading(false);
      }
    }

    // Initial load
    loadSettings();

    // Subscribe to Supabase Realtime + local BroadcastChannel events
    const unsubscribe = dataService.subscribeToSettings((updated) => {
      if (!isMounted) return;

      if (updated && typeof updated === 'object' && Object.keys(updated).length > 0) {
        // Immediate local state update from realtime payload
        setSettings((prev) => ({ ...(prev || {}), ...updated }));
      }
      
      // Secondary fetch to ensure full sync from database
      loadSettings();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return { settings, loading };
}

export default useSiteSettings;
