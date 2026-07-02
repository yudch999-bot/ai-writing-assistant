'use client';

import { useState } from 'react';
import { Clock, Copy, Trash2, FileText, BookOpen, X, RotateCcw, AlertTriangle } from 'lucide-react';
import { useSavedContent, SavedItem } from '../../lib/useSavedContent';
import { useToast } from '../../components/Toast';

const typeIcons: Record<SavedItem['type'], string> = {
  '文章': '📝',
  '标题': '🏷️',
  '仿写': '✍️',
  '优化': '✨',
  '智能体': '🤖',
};

export default function HistoryPage() {
  const toast = useToast();
  const { items, remove, clearAll } = useSavedContent();
  const [viewItem, setViewItem] = useState<SavedItem | null>(null);
  const [filter, setFilter] = useState<SavedItem['type'] | '全部'>('全部');

  const filtered = filter === '全部' ? items : items.filter(i => i.type === filter);
  const types = ['全部', ...new Set(items.map(i => i.type))] as (SavedItem['type'] | '全部')[];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Clock size={22} className="text-amber-400" />
            历史记录
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">已保存的生成内容，刷新页面也不会丢失</p>
        </div>
        {items.length > 0 && (
          <button onClick={() => { if (confirm('确定清除所有历史记录？')) clearAll(); toast.show('已清空'); }} className="btn-secondary text-xs px-3 py-1.5 text-rose-400 border-rose-500/30">
            <Trash2 size={14} /> 清空全部
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {types.map(t => (
          <button key={t} onClick={() => setFilter(t)} className={`tag ${filter === t ? 'active' : ''}`}>{t}</button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center text-[var(--color-text-secondary)]">
          <Clock size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">暂无保存记录</p>
          <p className="text-xs mt-1">生成文章、标题或仿写后，点击「保存」按钮即可保留在这里</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(item => (
            <div key={item.id} className="glass-card p-4 glass-card-hover group">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg">{typeIcons[item.type]}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-surface-3)] text-[var(--color-text-secondary)]">{item.type}</span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => setViewItem(item)} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-3)] text-[var(--color-text-secondary)] hover:text-text"><FileText size={13} /></button>
                  <button onClick={() => { navigator.clipboard.writeText(item.content); toast.show('已复制'); }} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-3)] text-[var(--color-text-secondary)] hover:text-text"><Copy size={13} /></button>
                  <button onClick={() => { remove(item.id); toast.show('已删除'); }} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-3)] text-rose-400"><Trash2 size={13} /></button>
                </div>
              </div>
              <p className="text-sm font-medium truncate">{item.title || `未命名${item.type}`}</p>
              <p className="text-[10px] text-[var(--color-text-secondary)] mt-1">{item.createdAt}</p>
            </div>
          ))}
        </div>
      )}

      {/* View Modal */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[5vh] pb-8 px-4 bg-black/60 backdrop-blur-sm" onClick={() => setViewItem(null)}>
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto glass-card p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{typeIcons[viewItem.type]}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-surface-3)] text-[var(--color-text-secondary)]">{viewItem.type}</span>
                </div>
                <h2 className="font-semibold text-base mt-1">{viewItem.title}</h2>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{viewItem.createdAt}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { navigator.clipboard.writeText(viewItem.content); toast.show('已复制'); }} className="text-xs text-primary-light hover:underline flex items-center gap-1"><Copy size={12} /> 复制</button>
                <button onClick={() => { remove(viewItem.id); setViewItem(null); toast.show('已删除'); }} className="text-xs text-rose-400 hover:underline">删除</button>
                <button onClick={() => setViewItem(null)} className="text-text-secondary hover:text-text p-1"><X size={18} /></button>
              </div>
            </div>
            <div className="rounded-xl bg-[var(--color-surface-2)] p-5 text-sm leading-relaxed whitespace-pre-wrap max-h-[50vh] overflow-y-auto">
              {viewItem.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
