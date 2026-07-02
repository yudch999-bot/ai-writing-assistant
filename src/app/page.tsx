'use client';

import { Sparkles, Flame, PenLine, FileText, RotateCcw, ShieldCheck, Layers, Target, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Stat {
  label: string;
  value: string;
  change: string;
  icon: any;
  color: string;
}

export default function HomePage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stat[]>([
    { label: '风格克隆数', value: '0', change: '-', icon: PenLine, color: 'from-[var(--color-primary)] to-purple-500' },
    { label: '今日生成', value: '0', change: '-', icon: Zap, color: 'from-amber-500 to-orange-500' },
    { label: '总字数', value: '0', change: '-', icon: FileText, color: 'from-emerald-500 to-teal-500' },
    { label: '热点采集', value: '0', change: '实时', icon: Flame, color: 'from-rose-500 to-pink-500' },
  ]);

  useEffect(() => {
    try {
      // Count saved items
      const saved = localStorage.getItem('ai-writer-saved-content');
      const items = saved ? JSON.parse(saved) : [];

      const totalItems = items.length;
      const today = new Date().toLocaleDateString('zh-CN');
      const todayItems = items.filter((i: any) => i.createdAt?.includes(today));
      const totalChars = items.reduce((sum: number, i: any) => sum + (i.content?.length || 0), 0);

      // Count hot topics
      let hotCount = 0;
      try {
        const hotModule = localStorage.getItem('hot-topics-count');
        hotCount = hotModule ? parseInt(hotModule) : 120;
      } catch { hotCount = 120; }

      setStats([
        { label: '风格克隆数', value: String(totalItems), change: todayItems.length > 0 ? `+${todayItems.length}` : '-', icon: PenLine, color: 'from-[var(--color-primary)] to-purple-500' },
        { label: '今日生成', value: String(todayItems.length || 0), change: totalItems > 0 ? '+1' : '-', icon: Zap, color: 'from-amber-500 to-orange-500' },
        { label: '总字数', value: totalChars > 10000 ? `${(totalChars / 10000).toFixed(1)}w` : String(totalChars), change: totalChars > 0 ? `+${totalChars}` : '-', icon: FileText, color: 'from-emerald-500 to-teal-500' },
        { label: '热点采集', value: String(hotCount), change: '实时', icon: Flame, color: 'from-rose-500 to-pink-500' },
      ]);
    } catch {}
  }, []);

  const quickActions = [
    { href: '/style-clone', label: '风格复刻', desc: '分析文章风格，生成专属提示词', icon: PenLine, gradient: 'from-[var(--color-primary)]/20 to-purple-500/20', iconColor: 'text-[var(--color-primary-light)]' },
    { href: '/hot-topics', label: '热点追踪', desc: '全网热点实时采集，一键改写', icon: Flame, gradient: 'from-rose-500/20 to-orange-500/20', iconColor: 'text-rose-400' },
    { href: '/title-generator', label: '标题生成', desc: '批量生成爆款标题', icon: FileText, gradient: 'from-amber-500/20 to-yellow-500/20', iconColor: 'text-amber-400' },
    { href: '/article-generation', label: '文章生成', desc: 'AI 生成完整公众号文章', icon: Layers, gradient: 'from-emerald-500/20 to-teal-500/20', iconColor: 'text-emerald-400' },
    { href: '/rewriting', label: '文章仿写', desc: '100% 原创深度改写', icon: RotateCcw, gradient: 'from-sky-500/20 to-blue-500/20', iconColor: 'text-sky-400' },
    { href: '/content-detection', label: '内容检测', desc: '敏感词、AI 痕迹、原创度检测', icon: ShieldCheck, gradient: 'from-violet-500/20 to-purple-500/20', iconColor: 'text-violet-400' },
  ];

  const hotTopics = [
    { rank: 1, title: '2026年AI工具推荐：这5款让工作效率翻倍', source: '微博热搜', heat: '2.3亿' },
    { rank: 2, title: '公众号流量主收益下降？这3个新打法值得尝试', source: '微信热点', heat: '1.8亿' },
    { rank: 3, title: '年轻人为什么开始「反向消费」了', source: '知乎热榜', heat: '1.5亿' },
    { rank: 4, title: '7月新规来了！涉及你的工资、社保和公积金', source: '百度热榜', heat: '1.2亿' },
    { rank: 5, title: '自媒体人必看：2026年内容创作的5个趋势', source: '今日头条', heat: '9800万' },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 border border-[var(--color-primary)]/15"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.04) 50%, transparent 100%)' }}
      >
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #a78bfa 0%, transparent 70%)' }} />
        <div className="relative">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">欢迎回来 👋</h1>
          <p className="text-[var(--color-text-secondary)] max-w-xl leading-relaxed">AI 赋能公众号创作，一键复刻爆款风格，追踪全网热点，生成去 AI 味的原创文章</p>
          <div className="flex flex-wrap gap-3 mt-5">
            <Link href="/article-generation" className="btn-primary"><Zap size={16} /> 开始创作</Link>
            <Link href="/style-clone" className="btn-secondary"><PenLine size={16} /> 风格复刻</Link>
          </div>
        </div>
      </div>

      {/* Stats - dynamically calculated */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card p-4 glass-card-hover">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon size={16} className="text-white" />
              </div>
              <span className="text-xs font-medium text-[var(--color-success)]">{stat.change}</span>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-[var(--color-text-secondary)] mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-3">快捷入口</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href} className="glass-card p-4 glass-card-hover flex flex-col items-center text-center gap-2">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center`}>
                <action.icon size={18} className={action.iconColor} />
              </div>
              <span className="text-sm font-medium">{action.label}</span>
              <span className="text-[10px] text-[var(--color-text-secondary)] leading-tight">{action.desc}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom: Hot Topics + Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Flame size={18} className="text-rose-400" /> 实时热点</h2>
            <Link href="/hot-topics" className="text-xs text-[var(--color-primary-light)] hover:underline">查看更多 →</Link>
          </div>
          <div className="space-y-3">
            {hotTopics.map((topic) => (
              <div
                key={topic.rank}
                onClick={() => router.push(`/article-generation?topic=${encodeURIComponent(topic.title)}`)}
                className="flex items-start gap-3 group cursor-pointer rounded-xl p-2 -mx-2 transition-all hover:bg-[var(--color-surface-3)]/50"
              >
                <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 ${topic.rank <= 3 ? 'bg-rose-500/20 text-rose-400' : 'bg-[var(--color-surface-3)] text-[var(--color-text-secondary)]'}`}>
                  {topic.rank}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate group-hover:text-[var(--color-primary-light)] transition-colors">{topic.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-[var(--color-text-secondary)]">{topic.source}</span>
                    <span className="text-[10px] text-[var(--color-text-secondary)]">·</span>
                    <span className="text-[10px] text-[var(--color-text-secondary)]">{topic.heat}</span>
                    <span className="text-[10px] text-[var(--color-primary-light)] opacity-0 group-hover:opacity-100 transition-all ml-auto">AI改写 →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Target size={18} className="text-emerald-400" /> 创作建议</h2>
          </div>
          <div className="space-y-3">
            {[
              { title: '风格复刻最佳实践', desc: '输入3-5篇同作者文章，AI 分析更精准', icon: '🎯' },
              { title: '热点改写技巧', desc: '选择与自己账号定位相关的热点，事半功倍', icon: '💡' },
              { title: '去 AI 味秘诀', desc: '适当加入个人经历和口语化表达', icon: '✨' },
              { title: '排版提升阅读体验', desc: '使用多级标题和引用，段落不超过4行', icon: '📱' },
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--color-surface-2)]">
                <span className="text-lg">{tip.icon}</span>
                <div>
                  <p className="text-sm font-medium">{tip.title}</p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
