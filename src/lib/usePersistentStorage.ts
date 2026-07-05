'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

type SetStateAction<T> = T | ((prev: T) => T);

/**
 * A hook that stores data persistently via the server-side API.
 * Falls back to localStorage when the server is unavailable.
 * Data survives browser cache clears, incognito mode, and restarts.
 *
 * Usage: const { data, loaded, setData, remove } = usePersistentStorage<T>(key, defaultValue)
 * - setData() works like useState's setter — pass a value or updater function
 * - remove() clears the data from both server and localStorage
 */
export function usePersistentStorage<T>(key: string, defaultValue: T) {
  const [data, setDataState] = useState<T>(defaultValue);
  const [loaded, setLoaded] = useState(false);
  const prevDataRef = useRef<T>(defaultValue);

  // Keep ref in sync for the debounce effect
  prevDataRef.current = data;

  // Load from server on mount, fall back to localStorage
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/storage?key=${encodeURIComponent(key)}`);
        if (res.ok) {
          const val = await res.json();
          if (val !== null && !cancelled) {
            setDataState(val as T);
            prevDataRef.current = val as T;
            setLoaded(true);
            return;
          }
        }
      } catch (e) {
        console.warn(`[usePersistentStorage] Server load failed for "${key}":`, e);
      }

      // Fallback: try localStorage
      try {
        const stored = localStorage.getItem(key);
        if (stored && !cancelled) {
          const parsed = JSON.parse(stored) as T;
          setDataState(parsed);
          prevDataRef.current = parsed;
        }
      } catch (e) {
        console.warn(`[usePersistentStorage] localStorage fallback failed for "${key}":`, e);
      }
      setLoaded(true);
    }

    load();
    return () => { cancelled = true; };
  }, [key]);

  // Persist to server whenever data changes (debounced)
  useEffect(() => {
    if (!loaded) return;

    const timer = setTimeout(async () => {
      const current = prevDataRef.current;
      try {
        await fetch('/api/storage', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value: current }),
        });
      } catch (e) {
        console.warn(`[usePersistentStorage] Server save failed for "${key}":`, e);
        // Fallback: localStorage
        try { localStorage.setItem(key, JSON.stringify(current)); } catch (e2) {
          console.error(`[usePersistentStorage] localStorage save also failed for "${key}":`, e2);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [data, key, loaded]);

  const setData = useCallback((action: SetStateAction<T>) => {
    setDataState(action);
  }, []);

  const remove = useCallback(async () => {
    setDataState(defaultValue);
    try {
      await fetch(`/api/storage?key=${encodeURIComponent(key)}`, { method: 'DELETE' });
    } catch {}
    try { localStorage.removeItem(key); } catch {}
  }, [key, defaultValue]);

  return { data, loaded, setData, remove };
}
