// src/hooks/useQRHistory.ts
import { useCallback, useEffect, useState } from 'react';

export type QRItem = {
  id: string;
  data: string;
  createdAt: string;
  options?: Record<string, any>;
  version?: number;
};

const DEVICE_KEY = 'qr_app_device_id';
const HISTORY_KEY = 'qr_app_history';
const CURRENT_VERSION = 1;

// Get or create device ID - stored in localStorage for mobile reliability
function getOrCreateDeviceId(): string {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      // Generate UUID using crypto API, fallback to random string
      id = (crypto as any)?.randomUUID?.() || ('dev_' + Date.now() + '_' + Math.random().toString(36).slice(2, 15));
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return 'dev_' + Date.now();
  }
}

export default function useQRHistory(max = 200) {
  const [history, setHistory] = useState<QRItem[]>([]);
  const [ready, setReady] = useState(true); // localStorage is synchronous
  const [isAvailable, setIsAvailable] = useState(true);

  // Load history on mount (synchronous from localStorage)
  useEffect(() => {
    try {
      // Test si localStorage est disponible
      localStorage.setItem('__test', 'test');
      localStorage.removeItem('__test');
      
      const deviceId = getOrCreateDeviceId();
      const key = `${HISTORY_KEY}_${deviceId}`;
      const saved = localStorage.getItem(key);
      
      if (saved) {
        const parsed = JSON.parse(saved) as QRItem[];
        setHistory(Array.isArray(parsed) ? parsed : []);
      }
      
      console.log('[QRHistory] Loaded from localStorage, deviceId:', deviceId);
      setIsAvailable(true);
    } catch (err) {
      console.error('[QRHistory] Failed to load from localStorage:', err);
      setIsAvailable(false);
      setHistory([]);
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (!isAvailable) return;
    
    try {
      const deviceId = getOrCreateDeviceId();
      const key = `${HISTORY_KEY}_${deviceId}`;
      localStorage.setItem(key, JSON.stringify(history));
      console.log('[QRHistory] Saved to localStorage, items:', history.length);
    } catch (err) {
      // localStorage quota exceeded or not available
      console.warn('[QRHistory] Failed to save:', err);
      setIsAvailable(false);
    }
  }, [history, isAvailable]);

  const add = useCallback((item: Omit<QRItem, 'createdAt' | 'version'> & Partial<QRItem>) => {
    const now = new Date().toISOString();
    const complete: QRItem = { ...item, createdAt: item.createdAt || now, version: CURRENT_VERSION } as QRItem;
    setHistory(prev => {
      const next = [complete, ...prev.filter(i => i.id !== complete.id)];
      return next.slice(0, max);
    });
  }, [max]);

  const remove = useCallback((id: string) => {
    setHistory(prev => prev.filter(i => i.id !== id));
  }, []);

  const clear = useCallback(() => {
    setHistory([]);
  }, []);

  const exportJSON = useCallback(() => {
    return JSON.stringify({ version: CURRENT_VERSION, history }, null, 2);
  }, [history]);

  const importJSON = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json);
      const payload = Array.isArray(parsed) ? parsed : parsed?.history;
      if (Array.isArray(payload)) {
        setHistory(payload.slice(0, max));
        return true;
      }
    } catch {
      return false;
    }
    return false;
  }, [max]);

  return { history, add, remove, clear, exportJSON, importJSON, ready };
}