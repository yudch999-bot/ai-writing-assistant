'use client';

import { useState } from 'react';
import { Menu, Sparkles, Loader2, Copy, AlertCircle } from 'lucide-react';
import { useSettings, callAI } from '../../lib/ai';
import { useToast } from '../../components/Toast';
import Link from 'next/link';
import { useSEO } from '../../lib/useSEO';

const tones = [
  { id: 'daily', label: '日常分享', desc: '轻松随性的生活记录', icon: '☀️' },
  { id: 'tutorial', label: '干货教程', desc: '专业深度的知识输出', icon: '📚' },
  { id: 'emotion', label: '情感共鸣', desc: '触动心灵的内容', icon: '💝' },
  { id: 'marketing', label: '营销种草', desc: '带货转化的产品推广', icon: '🛍️' },
  { id: 'hot', label: '热点追踪', desc: '踏热点追时效的内容', icon: '🔥' },
  { id: 'story', label: '故事叙事', desc: '讲述故事引发好奇', icon: '📖' },
];

const platforms = [
  { id: 'moments', label: '朋友圈', icon: '💛' },
  { id: 'group', label: '社群推广', icon: '👥' },
  { id: 'abstract', label: '公众号摘要', icon: '📰' },
  { id: 'weibo', label: '微博推文', icon: '📕' },
  { id: 'xhs', label: '小红书笔记', icon: '📕' },
  { id: 'douyin', label: '抖音文案', icon: '🎵' },
  { id: 'zhihu', label: '知乎回答', icon: '💡' },
  { id: 'gzh', label: '公众号文章', icon: '📄' },
];

const platformNames: Record<string, string> = {
  moments: '朋友圈', weibo: '微博', xhs: '小红书',
  douyin: '抖音', zhihu: '知乎', abstract: '公众号摘要',
  group: '社群', gzh: '公众号文章',
};

export default function MultiPlatformPage() {
  useSEO('多平台矩阵');
  const { settings } = useSettings();
  const toast = useToast();
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('daily');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['moments', 'weibo']);
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState('');

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const generate = async () => {
    if (!settings.apiKey) { setError('请先在设置中心配置 DeepSeek API Key'); return; }
    if (!topic.trim()) return;

    setGenerating(true);
    setError('');
    setResults(null);

    try {
      const toneLabel = tones.find(t => t.id === tone)?.label || '日常分享';
      const selectedLabels = selectedPlatforms.map(p => platformNames[p] || p);

      const prompt = `你是一位多平台内容创作专家。请根据以下信息，为每个指定平台生成适配的内容。

主题：${topic}
内容基调：${toneLabel}
目标平台：${selectedLabels.join('、')}

为每个平台生成内容，要求：
- 朋友圈：简短有共鸣，2-3行 + 话题标签
- 微博：140-200字，带话题，有点评角度
- 小红书：笔记体，标题+正文+标签，带emoji
- 抖音：口播文案，短句有节奏，有号召行动
- 知乎：长回答体，有观点有分析有结论
- 公众号摘要：一句话钩子吸引点击
- 社群：分享感，自然交流语气
- 公众号文章：完整文章，标题+多段落+金句结尾

请用以下格式输出，不要有其他内容：

【朋友圈】
(内容)

【微博】
(内容)

（以此类推，只输出有的平台）`;

      const res = await callAI(
        [
          { role: 'system', content: '你是一位多平台内容创作专家，熟悉每个平台的调性和风格。严格按照指定格式输出。' },
          { role: 'user', content: prompt },
        ],
        settings.apiKey,
        settings.model,
        settings.provider,
      );
      const parsed: Record<string, string> = {};
      const platformKeys: Record<string, string> = {
        '朋友圈': 'moments', '微博': 'weibo', '小红书': 'xhs',
        '抖音': 'douyin', '知乎': 'zhihu', '公众号摘要': 'abstract',
        '社群': 'group', '公众号文章': 'gzh',
      };

      for (const [label, key] of Object.entries(platformKeys)) {
        const regex = new RegExp(`【${label}】\\s*([\\s\\S]*?)(?=【|$)`, 'g');
        const match = regex.exec(res);
        if (match) {
          const content = match[1].trim();
          if (content && selectedPlatforms.includes(key)) {
            parsed[key] = content;
          }
        }
      }

      // Fallback: if parsing failed, show raw response
      if (Object.keys(parsed).length === 0) {
        parsed.raw = res;
      }

      setResults(parsed);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '生成失败');
    }
    setGenerating(false);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Menu size={22} className="text-orange-400" />
            多平台内容矩阵
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">DeepSeek 为各平台分别生成适配内容</p>
        </div>
        {!settings.apiKey && (
          <Link href="/settings" className="text-xs text-amber-400 hover:underline flex items-center gap-1"><AlertCircle size={12} /> 配置 API Key</Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 glass-card p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">推文主题 / 核心内容 *</label>
            <textarea placeholder="输入主题或核心内容..." value={topic} onChange={e => setTopic(e.target.value)} className="input-field h-20 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">内容基调</label>
            <div className="grid grid-cols-2 gap-2">
              {tones.map(t => (
                <button key={t.id} onClick={() => setTone(t.id)} className={`p-3 rounded-xl text-left text-sm transition-all border ${tone === t.id ? 'border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10' : 'border-[var(--color-border)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)]'}`}>
                  <span className="text-lg">{t.icon}</span>
                  <div className="font-medium mt-1">{t.label}</div>
                  <div className="text-[10px] text-[var(--color-text-secondary)]">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">覆盖发布场景</label>
            <div className="flex flex-wrap gap-2">
              {platforms.map(p => (
                <button key={p.id} onClick={() => togglePlatform(p.id)} className={`tag ${selectedPlatforms.includes(p.id) ? 'active' : ''}`}>
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
          </div>
          {error && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400">{error}</div>}
          <button onClick={generate} disabled={generating || !topic || !settings.apiKey} className="btn-primary w-full justify-center">
            {generating ? <><Loader2 size={16} className="animate-spin" /> DeepSeek 生成中...</> : <><Sparkles size={16} /> 生成多平台内容</>}
          </button>
        </div>

        <div className="lg:col-span-3 glass-card p-6">
          <h2 className="font-semibold mb-4">生成结果</h2>
          {generating ? (
            <div className="flex flex-col items-center justify-center h-64 text-[var(--color-text-secondary)] gap-3">
              <Loader2 size={32} className="animate-spin text-orange-400" />
              <span>DeepSeek 正在为各平台适配内容...</span>
            </div>
          ) : results ? (
            <div className="space-y-3">
              {Object.entries(results).map(([platform, text]) => {
                const p = platforms.find(p => p.id === platform);
                return (
                  <div key={platform} className="p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{p?.icon} {p?.label || platform}</span>
                      <button onClick={() => { navigator.clipboard.writeText(text); toast.show('已复制'); }} className="opacity-0 group-hover:opacity-100 text-xs text-[var(--color-primary-light)] hover:underline flex items-center gap-1 transition-all">
                        <Copy size={12} /> 复制
                      </button>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{text}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-[var(--color-text-secondary)] gap-3">
              <Menu size={40} className="opacity-30" />
              <span>输入主题，选择平台</span>
              <span className="text-xs">DeepSeek 将为每个平台生成适配的内容</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
