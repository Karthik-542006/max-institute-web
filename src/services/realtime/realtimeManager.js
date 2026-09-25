import { supabase, isSupabaseConfigured } from '../../lib/supabase';

/**
 * Connection states for Supabase Realtime
 */
export const REALTIME_STATUS = {
  CONNECTING: 'CONNECTING',
  CONNECTED: 'CONNECTED',
  RECONNECTING: 'RECONNECTING',
  DISCONNECTED: 'DISCONNECTED',
  ERROR: 'ERROR'
};

class RealtimeManager {
  constructor() {
    this.status = isSupabaseConfigured ? REALTIME_STATUS.CONNECTING : REALTIME_STATUS.DISCONNECTED;
    this.statusListeners = new Set();
    this.tableSubscribers = new Map(); // tableName -> Set of callbacks
    this.tableChannels = new Map(); // tableName -> Supabase channel
    this.presenceChannel = null;
    this.onlineAdmins = [];
    this.presenceListeners = new Set();
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.reconnectTimer = null;
    this.initNetworkListeners();
  }

  // ==========================================================================
  // Connection Status Management
  // ==========================================================================
  setStatus(newStatus) {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.notifyStatusListeners();
    }
  }

  getStatus() {
    return this.status;
  }

  onStatusChange(callback) {
    this.statusListeners.add(callback);
    callback(this.status);
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  notifyStatusListeners() {
    this.statusListeners.forEach((cb) => {
      try {
        cb(this.status);
      } catch (err) {
        console.error('Realtime status listener error:', err);
      }
    });
  }

  initNetworkListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.isOnline = true;
      this.setStatus(REALTIME_STATUS.RECONNECTING);
      this.reconnectAll();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.setStatus(REALTIME_STATUS.DISCONNECTED);
    });

    // Re-verify on document visibility wake-up
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.isOnline) {
        this.triggerDataSync('VISIBILITY_SYNC');
      }
    });
  }

  reconnectAll() {
    if (!isSupabaseConfigured || !supabase) return;

    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      // Refresh all table subscriptions
      this.tableChannels.forEach((channel, tableName) => {
        try {
          supabase.removeChannel(channel);
        } catch (e) {}
        this.tableChannels.delete(tableName);
        this.ensureChannelForTable(tableName);
      });

      // Refetch latest data for all active listeners
      this.triggerDataSync('RECONNECT_SYNC');
      this.setStatus(REALTIME_STATUS.CONNECTED);
    }, 1000);
  }

  triggerDataSync(reason = 'MANUAL_SYNC') {
    this.tableSubscribers.forEach((callbacks, tableName) => {
      callbacks.forEach((cb) => {
        try {
          cb({ type: reason, table: tableName });
        } catch (e) {}
      });
    });
  }

  // ==========================================================================
  // Centralized Table Subscriptions (Postgres Changes + Broadcast)
  // ==========================================================================
  subscribeToTable(tableName, callback) {
    if (!this.tableSubscribers.has(tableName)) {
      this.tableSubscribers.set(tableName, new Set());
    }
    const callbacks = this.tableSubscribers.get(tableName);
    callbacks.add(callback);

    this.ensureChannelForTable(tableName);

    // Cross-tab BroadcastChannel integration
    let bc = null;
    const channelName = `max_${tableName}_sync_channel`;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        bc = new BroadcastChannel(channelName);
        bc.onmessage = (event) => {
          callback(event.data?.detail || event.data || { type: 'BROADCAST' });
        };
      } catch (e) {}
    }

    // Local custom event listener
    const localEventName = `max_${tableName}_updated`;
    const localHandler = (e) => callback(e.detail || { type: 'LOCAL_EVENT' });
    if (typeof window !== 'undefined') {
      window.addEventListener(localEventName, localHandler);
    }

    // Return cleanup function
    return () => {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.tableSubscribers.delete(tableName);
        const channel = this.tableChannels.get(tableName);
        if (channel && supabase) {
          try {
            supabase.removeChannel(channel);
          } catch (e) {}
          this.tableChannels.delete(tableName);
        }
      }
      if (bc) {
        try { bc.close(); } catch (e) {}
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener(localEventName, localHandler);
      }
    };
  }

  ensureChannelForTable(tableName) {
    if (!isSupabaseConfigured || !supabase) return;
    if (this.tableChannels.has(tableName)) return;

    try {
      const channelId = `realtime:${tableName}:${Date.now()}`;
      const channel = supabase.channel(channelId);

      // Listen to PostgreSQL changes on this table
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: tableName },
        (payload) => {
          this.handlePostgresChange(tableName, payload);
        }
      );

      // Also listen to scalable Supabase Broadcast events on this table channel
      channel.on(
        'broadcast',
        { event: `${tableName}_change` },
        (payload) => {
          this.dispatchTableEvent(tableName, payload?.payload || payload);
        }
      );

      channel.subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          this.setStatus(REALTIME_STATUS.CONNECTED);
        } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
          this.setStatus(REALTIME_STATUS.ERROR);
          console.warn(`Supabase Realtime subscription status for ${tableName}:`, status, err);
        } else if (status === 'CLOSED') {
          // Normal on unmount
        }
      });

      this.tableChannels.set(tableName, channel);
    } catch (err) {
      console.warn(`Failed to create channel for ${tableName}:`, err);
    }
  }

  handlePostgresChange(tableName, payload) {
    const eventType = payload.eventType; // 'INSERT' | 'UPDATE' | 'DELETE'
    const newRecord = payload.new;
    const oldRecord = payload.old;

    const eventDetail = {
      type: eventType,
      table: tableName,
      record: newRecord || oldRecord,
      new: newRecord,
      old: oldRecord
    };

    this.dispatchTableEvent(tableName, eventDetail);
  }

  dispatchTableEvent(tableName, detail) {
    // 1. Notify table subscribers
    const callbacks = this.tableSubscribers.get(tableName);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(detail);
        } catch (e) {
          console.error(`Error in ${tableName} subscription callback:`, e);
        }
      });
    }

    // 2. Dispatch cross-tab BroadcastChannel
    const channelName = `max_${tableName}_sync_channel`;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel(channelName);
        bc.postMessage({ type: detail.type || 'SYNC', detail });
        bc.close();
      } catch (e) {}
    }

    // 3. Dispatch local window event
    const localEventName = `max_${tableName}_updated`;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(localEventName, { detail }));
    }
  }

  // Broadcast event to Supabase channel (for scalable multi-admin distribution)
  async broadcastEvent(tableName, action, payload = {}) {
    // First notify locally and across browser tabs
    this.dispatchTableEvent(tableName, { type: action, ...payload });

    // Broadcast through Supabase channel if connected
    const channel = this.tableChannels.get(tableName);
    if (channel && isSupabaseConfigured) {
      try {
        await channel.send({
          type: 'broadcast',
          event: `${tableName}_change`,
          payload: { action, ...payload, timestamp: Date.now() }
        });
      } catch (e) {
        console.warn(`Broadcast send error (${tableName}):`, e);
      }
    }
  }

  // ==========================================================================
  // Admin Presence (Online Administrators Tracking)
  // ==========================================================================
  trackAdminPresence(adminUser, onPresenceChange) {
    if (!isSupabaseConfigured || !supabase || !adminUser) return () => {};

    if (onPresenceChange) {
      this.presenceListeners.add(onPresenceChange);
      onPresenceChange(this.onlineAdmins);
    }

    if (!this.presenceChannel) {
      try {
        this.presenceChannel = supabase.channel('admin_presence_room', {
          config: {
            presence: { key: adminUser.id || adminUser.email }
          }
        });

        this.presenceChannel
          .on('presence', { event: 'sync' }, () => {
            const state = this.presenceChannel.presenceState();
            const admins = [];
            Object.values(state).forEach((presences) => {
              presences.forEach((p) => {
                if (p.user) admins.push(p.user);
              });
            });
            this.onlineAdmins = admins;
            this.notifyPresenceListeners();
          })
          .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              await this.presenceChannel.track({
                user: {
                  id: adminUser.id || 'admin',
                  email: adminUser.email || 'Admin',
                  role: adminUser.role || 'admin',
                  onlineAt: new Date().toISOString()
                }
              });
            }
          });
      } catch (e) {
        console.warn('Admin presence track error:', e);
      }
    } else {
      // Re-track with updated user
      try {
        this.presenceChannel.track({
          user: {
            id: adminUser.id || 'admin',
            email: adminUser.email || 'Admin',
            role: adminUser.role || 'admin',
            onlineAt: new Date().toISOString()
          }
        });
      } catch (trackErr) {
        console.warn('Admin presence track error:', trackErr);
      }
    }

    return () => {
      if (onPresenceChange) {
        this.presenceListeners.delete(onPresenceChange);
      }
      if (this.presenceListeners.size === 0 && this.presenceChannel) {
        try {
          this.presenceChannel.untrack();
          supabase.removeChannel(this.presenceChannel);
        } catch (e) {}
        this.presenceChannel = null;
        this.onlineAdmins = [];
      }
    };
  }

  notifyPresenceListeners() {
    this.presenceListeners.forEach((cb) => {
      try {
        cb(this.onlineAdmins);
      } catch (e) {}
    });
  }

  // ==========================================================================
  // Idempotent State Modifiers for React Reducers / Setters
  // ==========================================================================
  static applyIdempotentUpdate(currentList, event) {
    if (!Array.isArray(currentList)) return currentList;
    if (!event || !event.type) return currentList;

    const record = event.record || event.new || event.old;
    if (!record || !record.id) return currentList;

    const recordId = String(record.id);

    switch (event.type) {
      case 'INSERT': {
        const exists = currentList.some((item) => String(item.id) === recordId);
        if (exists) {
          // Replace rather than duplicate
          return currentList.map((item) => (String(item.id) === recordId ? { ...item, ...record } : item));
        }
        return [record, ...currentList];
      }
      case 'UPDATE': {
        return currentList.map((item) => (String(item.id) === recordId ? { ...item, ...record } : item));
      }
      case 'DELETE': {
        return currentList.filter((item) => String(item.id) !== recordId);
      }
      default:
        return currentList;
    }
  }
}

export const realtimeManager = new RealtimeManager();
export default realtimeManager;
