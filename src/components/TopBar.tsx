'use client';

import { Bell, Search, ChevronDown, Settings, User, LogOut, ExternalLink } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Notification {
  id: number;
  title: string;
  time: string;
  read: boolean;
  path: string;
}

export function TopBar() {
  const router = useRouter();
  const [showNotif, setShowNotif] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [userName, setUserName] = useState('用户');
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, title: '文章生成完成：2026年必备AI技能', time: '2 分钟前', read: false, path: '/article-generation' },
    { id: 2, title: '内容检测完成：AI 痕迹评分 35%', time: '15 分钟前', read: false, path: '/content-detection' },
    { id: 3, title: '热点数据已更新：共采集 20 条', time: '1 小时前', read: true, path: '/hot-topics' },
    { id: 4, title: '风格分析完成：情感治愈风', time: '3 小时前', read: true, path: '/style-clone' },
  ]);

  const unread = notifications.filter(n => !n.read).length;

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ai-writer-settings');
      if (stored) {
        const s = JSON.parse(stored);
        if (s.userName) setUserName(s.userName);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUser(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="relative z-50 flex items-center justify-between h-16 px-4 md:px-6 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-xl">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
        <input
          type="text"
          placeholder="搜索功能或文章..."
          className="w-full pl-10 pr-4 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/30 transition-all"
        />
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotif(!showNotif); if (!showNotif) setNotifications(prev => prev.map(n => ({ ...n, read: true }))); }}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-all"
          >
            <Bell size={16} />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--color-error)] text-white text-[9px] flex items-center justify-center font-bold">
                {unread}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-11 w-80 p-3 shadow-2xl z-50 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-sm font-semibold">通知</span>
                <span className="text-[10px] text-[var(--color-text-secondary)]">{unread} 条未读</span>
              </div>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-xs text-[var(--color-text-secondary)]">暂无通知</div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => { router.push(n.path); setShowNotif(false); }}
                      className={`flex items-start gap-2 p-2.5 rounded-xl text-sm transition-all cursor-pointer ${
                        n.read ? 'opacity-60 hover:opacity-100' : 'bg-[var(--color-surface-3)]'
                      } hover:bg-[var(--color-surface-4)]`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${n.read ? 'bg-transparent' : 'bg-[var(--color-primary)]'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs">{n.title}</p>
                        <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">{n.time}</p>
                      </div>
                      <ExternalLink size={10} className="text-[var(--color-text-secondary)] mt-1 flex-shrink-0 opacity-0 group-hover:opacity-100" />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUser(!showUser)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-3)] transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-purple-500 flex items-center justify-center text-xs font-bold text-white">
              {userName[0]}
            </div>
            <span className="text-sm font-medium hidden sm:block">{userName}</span>
            <ChevronDown size={14} className="text-[var(--color-text-secondary)]" />
          </button>

          {showUser && (
            <div className="absolute right-0 top-11 w-48 p-1.5 shadow-2xl z-50 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
              <div className="px-3 py-2 border-b border-[var(--color-border)] mb-1">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-[10px] text-[var(--color-text-secondary)]">公众号运营者</p>
              </div>
              <button
                onClick={() => { router.push('/settings'); setShowUser(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-3)] transition-all"
              >
                <Settings size={14} /> 设置中心
              </button>
              <button
                onClick={() => { router.push('/settings?tab=profile'); setShowUser(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-3)] transition-all"
              >
                <User size={14} /> 个人资料
              </button>
              <button
                onClick={() => {
                  if (confirm('确定退出？API Key 不会被清除，如需清除请到设置中心操作。')) {
                    setShowUser(false);
                  }
                }}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-rose-400 hover:text-rose-300 hover:bg-[var(--color-surface-3)] transition-all mt-1"
              >
                <LogOut size={14} /> 退出登录
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
