'use client';

import { Globe, Loader2 } from 'lucide-react';

interface Props {
  enabled: boolean;
  onToggle: () => void;
  searching?: boolean;
}

export function WebSearchToggle({ enabled, onToggle, searching }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={searching}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
        enabled
          ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
          : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:text-text'
      }`}
    >
      {searching ? (
        <Loader2 size={12} className="animate-spin" />
      ) : (
        <Globe size={12} />
      )}
      {searching ? '搜索中...' : enabled ? '联网已开' : '联网搜索'}
    </button>
  );
}
