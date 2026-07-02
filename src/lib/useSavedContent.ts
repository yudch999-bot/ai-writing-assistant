'use client';

import { useState, useCallback } from 'react';

export interface SavedItem {
  id: string;
  type: '文章' | '标题' | '仿写' | '优化' | '智能体';
  title: string;
  content: string;
  createdAt: string;
}

const STORAGE_KEY = 'ai-writer-saved-content';

export function useSavedContent() {
  const [items, setItems] = useState<SavedItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const save = useCallback((type: SavedItem['type'], title: string, content: string) => {
    const item: SavedItem = {
      id: Date.now().toString(36),
      type,
      title: title.slice(0, 50),
      content,
      createdAt: new Date().toLocaleString('zh-CN'),
    };
    const updated = [item, ...items];
    setItems(updated);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
    return item;
  }, [items]);

  const remove = useCallback((id: string) => {
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
  }, [items]);

  const clearAll = useCallback(() => {
    setItems([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  return { items, save, remove, clearAll };
}
