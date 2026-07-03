'use client';

import { useCallback } from 'react';
import { usePersistentStorage } from './usePersistentStorage';

export interface SavedItem {
  id: string;
  type: '文章' | '标题' | '仿写' | '优化' | '智能体';
  title: string;
  content: string;
  createdAt: string;
}

const STORAGE_KEY = 'ai-writer-saved-content';

export function useSavedContent() {
  const { data: items, loaded, setData: setItems } =
    usePersistentStorage<SavedItem[]>(STORAGE_KEY, []);

  const save = useCallback((type: SavedItem['type'], title: string, content: string) => {
    const item: SavedItem = {
      id: Date.now().toString(36),
      type,
      title: title.slice(0, 50),
      content,
      createdAt: new Date().toLocaleString('zh-CN'),
    };
    // setData with functional updater — auto-persisted by the hook
    setItems(prev => [item, ...prev]);
    return item;
  }, [setItems]);

  const remove = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, [setItems]);

  const clearAll = useCallback(() => {
    setItems([]);
  }, [setItems]);

  return { items, loaded, save, remove, clearAll };
}
