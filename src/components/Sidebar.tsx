'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
 Sparkles,
 Flame,
 PenLine,
 FileText,
 RotateCcw,
 ShieldCheck,
 Layout,
 Layers,
 Bot,
 BookOpen,
 Settings,
 ChevronLeft,
 ChevronRight,
 Menu,
 Clock,
 CalendarDays,
 Bookmark,
 Star,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  exact?: boolean;
}

const navGroups = [
  {
    label: '创作工具',
    items: [
      { href: '/article-generation', label: '文章生成', icon: Layers },
      { href: '/rewriting', label: '文章仿写', icon: RotateCcw },
      { href: '/style-clone', label: '风格复刻', icon: PenLine },
      { href: '/multi-platform', label: '多平台矩阵', icon: Menu },
    ],
  },
  {
    label: '内容优化',
    items: [
      { href: '/title-generator', label: '标题生成', icon: FileText },
      { href: '/article-critique', label: '文章点评', icon: Star },
      { href: '/content-detection', label: '内容检测', icon: ShieldCheck },
      { href: '/content-plan', label: '内容规划', icon: CalendarDays },
      { href: '/formatting', label: '公众号排版', icon: Layout },
    ],
  },
  {
    label: '情报与管理',
    items: [
      { href: '/hot-topics', label: '热点追踪', icon: Flame },
      { href: '/knowledge-base', label: '知识库', icon: BookOpen },
      { href: '/templates', label: '文章模板', icon: Bookmark },
    ],
  },
  {
    label: '系统',
    items: [
      { href: '/agents', label: '智能体', icon: Bot },
      { href: '/history', label: '历史记录', icon: Clock },
      { href: '/settings', label: '设置中心', icon: Settings },
    ],
  },
];

  export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (item: NavItem) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <aside
      className={clsx(
        'flex flex-col border-r border-[var(--color-border)] transition-all duration-300 h-screen',
        'bg-gradient-to-b from-[var(--color-surface-2)] via-[var(--color-surface-2)] to-[var(--color-surface-3)]',
        collapsed ? 'w-[68px]' : 'w-[240px]',
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-[var(--color-border)] relative">
        <div className="relative">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-[var(--color-primary)]/20">
            <Sparkles size={16} className="text-white" />
          </div>
        </div>
        {!collapsed && (
          <span className="font-bold text-base tracking-tight">
            <span className="gradient-text">墨笔 AI</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <div className="px-3 pt-4 pb-0.5">
                <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-secondary)]/40 select-none">
                  {group.label}
                </span>
              </div>
            )}
            {group.items.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                active
                  ? 'text-[var(--color-primary-light)] bg-gradient-to-r from-[var(--color-primary)]/12 to-transparent'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-3)]/60'
              )}
              title={collapsed ? item.label : undefined}
            >
              {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-[var(--color-primary)]" />}
              <item.icon
                size={18}
                className={clsx(
                  'flex-shrink-0 transition-all duration-200',
                  active && 'scale-110 drop-shadow-[0_0_6px_var(--color-primary)]'
                )}
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
          })}
            </div>
          ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-[var(--color-border)]">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-3)]/60 transition-all group"
        >
          {collapsed ? <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" /> : <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />}
        </button>
      </div>
    </aside>
  );
}
