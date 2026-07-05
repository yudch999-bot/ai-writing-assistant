'use client';

import { useState, useEffect } from 'react';
import {
  CalendarDays, Sparkles, RefreshCw, Plus, ChevronLeft, ChevronRight,
  FileText, Trash2, Edit3, Send, Clock, TrendingUp, Lightbulb,
  CheckCircle2, Circle, Loader2, X, Save
} from 'lucide-react';
import { useSettings, callAI } from '../../lib/ai';
import { useToast } from '../../components/Toast';
import { usePersistentStorage } from '../../lib/usePersistentStorage';
import { useRouter } from 'next/navigation';
import { useSEO } from '../../lib/useSEO';

// ── Data Model ──

type TopicStatus = '灵感' | '写作中' | '待发布' | '已发布';

interface ContentTopic {
  id: string;
  title: string;
  status: TopicStatus;
  publishDate: string | null;
  createdAt: string;
  heat: number | null;
  reason: string | null;
  tags: string[];
  source: 'ai' | 'manual';
}

const STATUS_ORDER: TopicStatus[] = ['灵感', '写作中', '待发布', '已发布'];
const STATUS_COLORS: Record<TopicStatus, string> = {
  '灵感': 'text-violet-400 bg-violet-500/15 border-violet-500/25',
  '写作中': 'text-amber-400 bg-amber-500/15 border-amber-500/25',
  '待发布': 'text-sky-400 bg-sky-500/15 border-sky-500/25',
  '已发布': 'text-emerald-400 bg-emerald-500/15 border-emerald-500/25',
};
const STATUS_ICONS: Record<TopicStatus, any> = {
  '灵感': Lightbulb,
  '写作中': Edit3,
  '待发布': Send,
  '已发布': CheckCircle2,
};

const STORAGE_KEY = 'mobi-content-plan';

// ── Calendar Helpers ──

function getMonthDays(year: number, month: number): (number | null)[] {
  const first = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < first; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
}

const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

// ── Component ──

export default function ContentPlanPage() {
  useSEO('内容规划');
  const { settings } = useSettings();
  const toast = useToast();
  const router = useRouter();

  // Topics state — auto-persisted
  const { data: topics, loaded, setData: setTopics } = usePersistentStorage<ContentTopic[]>(STORAGE_KEY, []);

  // Inspiration
  const [aiTopics, setAiTopics] = useState<any[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  // Topic pool
  const [filter, setFilter] = useState<TopicStatus | '全部'>('全部');

  // Calendar
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPublishDate, setNewPublishDate] = useState('');

  // ── AI Topic Generation ──
  const generateTopics = async () => {
    if (!settings.apiKey) {
      toast.show('请先在设置中心配置 API Key');
      return;
    }
    setLoadingAI(true);
    try {
      const position = '职场成长/个人提升';
      const res = await callAI(
        [
          { role: 'system', content: '你是一位资深公众号内容策划专家。根据账号定位生成5个有爆款潜力的选题。每个选题包含：标题（吸引人）、热度指数（1-100的数字）、为什么能火的分析（30字内）、关联标签（逗号分隔）。以JSON数组格式输出，不要多余内容。格式：[{"title":"...","heat":85,"reason":"...","tags":"标签1,标签2"}]' },
          { role: 'user', content: `我的公众号定位是「${position}」，请推荐5个选题。` },
        ],
        settings.apiKey,
        settings.model,
        settings.provider,
      );
      const cleaned = res.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) setAiTopics(parsed.slice(0, 5));
    } catch (e) {
      console.warn('[content-plan] AI topic generation failed:', e);
      setAiTopics([
        { title: '2026年最被低估的5个AI工具，第3个你可能没用过', heat: 88, reason: 'AI工具话题持续热门，数字型标题点击率高', tags: 'AI工具,效率提升' },
        { title: '月薪3万和月薪8千的差距，不在能力在这3点', heat: 92, reason: '职场焦虑是永恒痛点，对比型标题引发转发', tags: '职场成长,认知提升' },
        { title: '我用了30天「极简社交」，生活发生了什么变化', heat: 85, reason: '个人实验类内容有代入感，容易引发共鸣讨论', tags: '极简生活,社交' },
        { title: '为什么越来越多公司开始取消OKR？', heat: 79, reason: '反常识观点吸引点击，职场人关心管理趋势', tags: 'OKR,企业管理' },
        { title: '35岁被裁员后才明白：这3个能力比工资重要', heat: 90, reason: '年龄焦虑+经验教训型，戳中职场人痛点', tags: '职业规划,焦虑' },
      ]);
    }
    setLoadingAI(false);
  };

  const addToPool = (aiItem: any) => {
    const topic: ContentTopic = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 4),
      title: aiItem.title,
      status: '灵感',
      publishDate: null,
      createdAt: new Date().toLocaleDateString('zh-CN'),
      heat: aiItem.heat || null,
      reason: aiItem.reason || null,
      tags: aiItem.tags ? aiItem.tags.split(',').map((t: string) => t.trim()) : [],
      source: 'ai',
    };
    setTopics(prev => [topic, ...prev]);
    toast.show('已纳入选题池');
  };

  const addCustomTopic = () => {
    if (!newTitle.trim()) return;
    const topic: ContentTopic = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 4),
      title: newTitle.trim(),
      status: '灵感',
      publishDate: newPublishDate || null,
      createdAt: new Date().toLocaleDateString('zh-CN'),
      heat: null,
      reason: null,
      tags: [],
      source: 'manual',
    };
    setTopics(prev => [topic, ...prev]);
    setNewTitle('');
    setNewPublishDate('');
    setShowAddTopic(false);
    toast.show('已添加选题');
  };

  const updateStatus = (id: string, status: TopicStatus) => {
    setTopics(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const deleteTopic = (id: string) => {
    setTopics(prev => prev.filter(t => t.id !== id));
    toast.show('已删除');
  };

  const writeArticle = (topic: ContentTopic) => {
    updateStatus(topic.id, '写作中');
    router.push(`/article-generation?topic=${encodeURIComponent(topic.title)}`);
  };

  // ── Filtered topics ──
  const filteredTopics = filter === '全部'
    ? topics
    : topics.filter(t => t.status === filter);

  const todayStr = new Date().toLocaleDateString('zh-CN');

  // Topics for selected calendar day
  const dayTopics = selectedDay
    ? topics.filter(t => {
        if (!t.publishDate) return false;
        const d = new Date(t.publishDate);
        return d.getFullYear() === calYear && d.getMonth() === calMonth && d.getDate() === selectedDay;
      })
    : [];

  // Today's tasks
  const todayTasks = topics.filter(t => {
    if (!t.publishDate) return false;
    return t.publishDate === todayStr && t.status !== '已发布';
  });

  // ── Init AI topics on first load ──
  useEffect(() => {
    if (loaded && aiTopics.length === 0 && settings.apiKey) {
      generateTopics();
    }
  }, [loaded]);

  const days = getMonthDays(calYear, calMonth);

  const hasTopicOnDay = (d: number) => {
    return topics.some(t => {
      if (!t.publishDate) return false;
      const date = new Date(t.publishDate);
      return date.getFullYear() === calYear && date.getMonth() === calMonth && date.getDate() === d;
    });
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarDays size={22} className="text-rose-400" />
            内容规划
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">AI 推荐选题 · 内容日历 · 从灵感到发布的全管线管理</p>
        </div>
        <button onClick={() => { setShowAddTopic(true); setNewTitle(''); setNewPublishDate(''); }} className="btn-primary">
          <Plus size={16} /> 添加选题
        </button>
      </div>

      {/* ════════ 1. 灵感中心 ════════ */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" /> 灵感中心
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowCustom(!showCustom)} className="btn-secondary text-xs px-3 py-1.5">
              <Plus size={12} /> 自定义灵感
            </button>
            <button onClick={generateTopics} disabled={loadingAI} className="btn-secondary text-xs px-3 py-1.5">
              <RefreshCw size={12} className={loadingAI ? 'animate-spin' : ''} /> 换一批
            </button>
          </div>
        </div>

        {/* Custom prompt */}
        {showCustom && (
          <div className="mb-4 p-3 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] flex gap-2">
            <input
              type="text"
              placeholder="输入你想写的方向，比如「AI 对职场的影响」..."
              value={customPrompt}
              onChange={e => setCustomPrompt(e.target.value)}
              className="input-field flex-1 text-sm"
            />
            <button onClick={async () => {
              if (!customPrompt.trim()) return;
              setLoadingAI(true);
              try {
                const position = '职场成长/个人提升';
                const res = await callAI(
                  [
                    { role: 'system', content: '你是一位资深公众号策划。根据用户方向和账号定位生成3个选题角度。JSON数组格式：[{"title":"...","heat":85,"reason":"..."}]' },
                    { role: 'user', content: `账号定位：${position}，用户想写：${customPrompt}` },
                  ],
                  settings.apiKey!,
                  settings.model,
                  settings.provider,
                );
                const cleaned = res.replace(/```json|```/g, '').trim();
                const parsed = JSON.parse(cleaned);
                if (Array.isArray(parsed)) setAiTopics(parsed.slice(0, 3));
              } catch (e) {
                console.warn('[content-plan] Custom prompt generation failed:', e);
                toast.show('生成失败，请重试');
              }
              setLoadingAI(false);
              setCustomPrompt('');
              setShowCustom(false);
            }} disabled={loadingAI} className="btn-primary text-xs px-3">
              {loadingAI ? <Loader2 size={12} className="animate-spin" /> : '生成'}
            </button>
          </div>
        )}

        {/* AI Topics */}
        {loadingAI ? (
          <div className="flex flex-col items-center justify-center py-12 text-[var(--color-text-secondary)] gap-3">
            <Loader2 size={28} className="animate-spin text-amber-400" />
            <span className="text-sm">AI 正在分析热点和你的账号定位...</span>
          </div>
        ) : aiTopics.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-[var(--color-text-secondary)] gap-2">
            <Sparkles size={36} className="opacity-30" />
            <p className="text-sm">点击「换一批」获取 AI 推荐选题</p>
            <p className="text-xs">需要先在设置中心配置 API Key</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {aiTopics.map((item, i) => (
              <div key={i} className="p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-amber-500/30 transition-all group flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-rose-400" />
                    <span className="text-sm font-bold text-rose-400">{item.heat}</span>
                  </div>
                  <button
                    onClick={() => addToPool(item)}
                    className="opacity-0 group-hover:opacity-100 text-xs text-amber-400 hover:underline flex items-center gap-0.5 transition-all"
                  >
                    <Plus size={11} /> 纳入
                  </button>
                </div>
                <p className="text-sm font-medium leading-snug flex-1">{item.title}</p>
                {item.reason && (
                  <p className="text-[10px] text-[var(--color-text-secondary)] mt-2 leading-relaxed">💡 {item.reason}</p>
                )}
                {item.tags && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.split(',').map((tag: string, j: number) => (
                      <span key={j} className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--color-surface-3)] text-[var(--color-text-secondary)]">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ════════ 2. 选题池 ════════ */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Lightbulb size={16} className="text-violet-400" /> 选题池
            <span className="text-xs font-normal text-[var(--color-text-secondary)]">共 {topics.length} 个选题</span>
          </h2>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(['全部', ...STATUS_ORDER] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all border ${
                filter === s
                  ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary-light)] border-[var(--color-primary)]/30'
                  : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:text-text'
              }`}
            >{s}{s !== '全部' ? ` (${topics.filter(t => t.status === s).length})` : ''}</button>
          ))}
        </div>

        {/* Topic List */}
        {filteredTopics.length === 0 ? (
          <div className="text-center py-10 text-[var(--color-text-secondary)]">
            <Lightbulb size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">还没有选题</p>
            <p className="text-xs mt-1">从灵感中心纳入或手动添加</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTopics.map(topic => {
              const StatusIcon = STATUS_ICONS[topic.status];
              return (
                <div key={topic.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface-2)] group hover:bg-[var(--color-surface-3)] transition-all">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    topic.status === '灵感' ? 'bg-violet-400' :
                    topic.status === '写作中' ? 'bg-amber-400' :
                    topic.status === '待发布' ? 'bg-sky-400' : 'bg-emerald-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{topic.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${STATUS_COLORS[topic.status]}`}>
                        <StatusIcon size={10} className="inline mr-0.5" />
                        {topic.status}
                      </span>
                      {topic.publishDate && <span className="text-[10px] text-[var(--color-text-secondary)]">📅 {topic.publishDate}</span>}
                      {topic.heat && <span className="text-[10px] text-[var(--color-text-secondary)]">🔥 {topic.heat}</span>}
                      <span className="text-[10px] text-[var(--color-text-secondary)]">{topic.createdAt}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    {/* Status quick change */}
                    {STATUS_ORDER.map(s => {
                      if (s === topic.status) return null;
                      const Icon = STATUS_ICONS[s];
                      return (
                        <button key={s} onClick={() => updateStatus(topic.id, s)}
                          title={`改为${s}`}
                          className="p-1.5 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-text transition-all"
                        ><Icon size={12} /></button>
                      );
                    })}
                    {/* Write */}
                    {topic.status !== '已发布' && (
                      <button onClick={() => writeArticle(topic)} title="开始写作"
                        className="p-1.5 rounded-lg hover:bg-[var(--color-surface)] text-emerald-400 hover:text-emerald-300 transition-all"
                      ><FileText size={12} /></button>
                    )}
                    {/* Delete */}
                    <button onClick={() => deleteTopic(topic.id)} title="删除"
                      className="p-1.5 rounded-lg hover:bg-[var(--color-surface)] text-rose-400 transition-all"
                    ><Trash2 size={12} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ════════ 3. 内容日历 ════════ */}
      <div className="glass-card p-5">
        <h2 className="font-semibold flex items-center gap-2 mb-4">
          <CalendarDays size={16} className="text-sky-400" /> 内容日历
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => { if (calMonth === 0) { setCalYear(calYear - 1); setCalMonth(11); } else setCalMonth(calMonth - 1); }}
                className="p-1.5 rounded-lg hover:bg-[var(--color-surface-3)] text-[var(--color-text-secondary)]"
              ><ChevronLeft size={16} /></button>
              <span className="text-sm font-medium">{calYear}年 {MONTH_NAMES[calMonth]}</span>
              <button onClick={() => { if (calMonth === 11) { setCalYear(calYear + 1); setCalMonth(0); } else setCalMonth(calMonth + 1); }}
                className="p-1.5 rounded-lg hover:bg-[var(--color-surface-3)] text-[var(--color-text-secondary)]"
              ><ChevronRight size={16} /></button>
            </div>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-1">
              {WEEKDAYS.map(w => (
                <div key={w} className="text-center text-[10px] text-[var(--color-text-secondary)] font-medium py-1">{w}</div>
              ))}
            </div>
            {/* Days grid */}
            <div className="grid grid-cols-7">
              {days.map((d, i) => {
                const isToday = d === new Date().getDate() && calMonth === new Date().getMonth() && calYear === new Date().getFullYear();
                const isSelected = d === selectedDay;
                const hasTopic = d ? hasTopicOnDay(d) : false;
                return (
                  <button
                    key={i}
                    disabled={d === null}
                    onClick={() => setSelectedDay(d)}
                    className={`relative h-10 text-sm rounded-lg transition-all ${
                      d === null ? '' :
                      isSelected ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary-light)] font-semibold' :
                      isToday ? 'bg-amber-500/20 text-amber-400 font-semibold' :
                      'hover:bg-[var(--color-surface-3)] text-[var(--color-text)]'
                    }`}
                  >
                    {d}
                    {hasTopic && (
                      <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-rose-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected day details + today focus */}
          <div className="space-y-4">
            {/* Today focus */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20">
              <h3 className="text-sm font-medium flex items-center gap-1.5 mb-2">
                <Clock size={14} className="text-amber-400" /> 今日任务
              </h3>
              {todayTasks.length === 0 ? (
                <p className="text-xs text-[var(--color-text-secondary)]">今天没有待办，去灵感中心找点灵感吧</p>
              ) : (
                <div className="space-y-2">
                  {todayTasks.map(t => (
                    <div key={t.id} className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        t.status === '灵感' ? 'bg-violet-400' :
                        t.status === '写作中' ? 'bg-amber-400' : 'bg-sky-400'
                      }`} />
                      <span className="text-xs flex-1 truncate">{t.title}</span>
                      <button onClick={() => writeArticle(t)}
                        className="text-[10px] text-amber-400 hover:underline flex-shrink-0"
                      >写作</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected day topics */}
            <div className="p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
              <h3 className="text-sm font-medium mb-2">
                {selectedDay ? `${calYear}年${calMonth + 1}月${selectedDay}日` : '选择日期'}
              </h3>
              {dayTopics.length === 0 ? (
                <p className="text-xs text-[var(--color-text-secondary)]">当天无安排</p>
              ) : (
                <div className="space-y-1.5">
                  {dayTopics.map(t => (
                    <div key={t.id} className="flex items-center gap-2 text-xs">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        t.status === '灵感' ? 'bg-violet-400' :
                        t.status === '写作中' ? 'bg-amber-400' :
                        t.status === '待发布' ? 'bg-sky-400' : 'bg-emerald-400'
                      }`} />
                      <span className="flex-1 truncate">{t.title}</span>
                      <span className={`text-[9px] px-1 py-0.5 rounded ${STATUS_COLORS[t.status]}`}>{t.status}</span>
                    </div>
                  ))}
                </div>
              )}
              {/* Quick add on date */}
              <button onClick={() => {
                setNewPublishDate(`${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(selectedDay || new Date().getDate()).padStart(2, '0')}`);
                setShowAddTopic(true);
              }} className="mt-3 text-xs text-[var(--color-primary-light)] hover:underline flex items-center gap-1">
                <Plus size={10} /> 在此日期添加选题
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Add Topic Modal ── */}
      {showAddTopic && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] pb-8 px-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddTopic(false)}>
          <div className="w-full max-w-md glass-card p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <h2 className="font-semibold">添加选题</h2>
              <button onClick={() => setShowAddTopic(false)} className="text-[var(--color-text-secondary)] hover:text-text p-1"><X size={18} /></button>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">选题标题 *</label>
              <input type="text" placeholder="输入选题标题..." value={newTitle} onChange={e => setNewTitle(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">计划发布日期（选填）</label>
              <input type="date" value={newPublishDate} onChange={e => setNewPublishDate(e.target.value)} className="input-field" />
            </div>
            <div className="flex gap-3">
              <button onClick={addCustomTopic} disabled={!newTitle.trim()} className="btn-primary">
                <Save size={16} /> 保存
              </button>
              <button onClick={() => setShowAddTopic(false)} className="btn-secondary">取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
