import { useState, useEffect } from 'react';
import { realtimeManager, REALTIME_STATUS } from '../services/realtime/realtimeManager';

/**
 * React hook to listen to realtime connection status
 */
export function useRealtimeStatus() {
  const [status, setStatus] = useState(realtimeManager.getStatus());

  useEffect(() => {
    const unsubscribe = realtimeManager.onStatusChange((newStatus) => {
      setStatus(newStatus);
    });
    return () => unsubscribe();
  }, []);

  return {
    status,
    isConnected: status === REALTIME_STATUS.CONNECTED,
    isReconnecting: status === REALTIME_STATUS.RECONNECTING || status === REALTIME_STATUS.CONNECTING,
    isError: status === REALTIME_STATUS.ERROR || status === REALTIME_STATUS.DISCONNECTED
  };
}

/**
 * React hook to track and view online administrators
 */
export function useAdminPresence(currentUser) {
  const [onlineAdmins, setOnlineAdmins] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    const cleanup = realtimeManager.trackAdminPresence(currentUser, (admins) => {
      setOnlineAdmins(admins);
    });
    return () => cleanup();
  }, [currentUser?.id, currentUser?.email]);

  return {
    onlineAdmins,
    adminCount: Math.max(1, onlineAdmins.length)
  };
}
