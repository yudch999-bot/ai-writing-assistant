'use client';

import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useState } from 'react';
import { useSavedContent, SavedItem } from '../lib/useSavedContent';

interface Props {
  type: SavedItem['type'];
  title: string;
  content: string;
}

export function SaveButton({ type, title, content }: Props) {
  const { save } = useSavedContent();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!content || saved) return;
    save(type, title || `${type} - ${new Date().toLocaleString('zh-CN')}`, content);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <button
      onClick={handleSave}
      className={`text-xs hover:underline flex items-center gap-1 transition-all ${
        saved ? 'text-emerald-400' : 'text-[var(--color-primary-light)]'
      }`}
    >
      {saved ? <BookmarkCheck size={12} /> : <Bookmark size={12} />}
      {saved ? '已保存' : '保存'}
    </button>
  );
}
