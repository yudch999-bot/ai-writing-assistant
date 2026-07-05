'use client';

import { useState } from 'react';
import { FileText, Sparkles, Copy, Loader2, AlertCircle } from 'lucide-react';
import { useSettings, callAI } from '../../lib/ai';
import { useToast } from '../../components/Toast';
import { SaveButton } from '../../components/SaveButton';
import { WebSearchToggle } from '../../components/WebSearchToggle';
import Link from 'next/link';
import { useSEO } from '../../lib/useSEO';

const contentTypes = ['公众号爆款文', '情感共鸣', '职场干货', '搞钱攻略', '热点追踪', '故事叙事'];
const titleStyles = ['犀利直击', '温情治愈', '幽默反转', '数字量化', '悬念追问'];
const audiences = ['职场人', '宝妈', '学生', '创业者', '管理者', '自由职业者'];

export default function TitleGeneratorPage() {
  useSEO('标题生成');
  const { settings, loaded } = useSettings();
  const toast = useToast();
  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState('公众号爆款文');
  const [selectedStyles, setSelectedStyles] = useState<string[]>(['数字量化']);
  const [audience, setAudience] = useState('');
  const [count, setCount] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [titles, setTitles] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [webSearch, setWebSearch] = useState(false);
  const [searching, setSearching] = useState(false);

  const toggleStyle = (id: string) => {
    setSelectedStyles(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const generate = async () => {
    if (!settings.apiKey) { setError('请先在设置中心配置 API Key'); return; }
    if (!topic.trim()) return;

    setGenerating(true);
    setError('');
    setTitles([]);

    try {
      let searchContext = '';
      if (webSearch) {
        setSearching(true);
        try {
          const searchRes = await fetch('/api/search', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: topic }),
          });
          const searchData = await searchRes.json();
          if (searchRes.ok && searchData.context) searchContext = `\n\n以下是联网搜索到的相关信息：\n${searchData.context}\n`;
        } catch (e) {
          console.warn('[title-generator] Web search failed:', e);
        }
        setSearching(false);
      }
      const prompt = `${searchContext}你是一位公众号爆款标题专家。请根据以下信息生成 ${count} 个爆款标题。

主题：${topic}
内容类型：${contentType}
标题风格：${selectedStyles.join('、')}
${audience ? `目标人群：${audience}` : ''}

要求：
1. 每个标题要有吸引力和点击欲望
2. 包含数字、悬念或情感钩子
3. 符合公众号标题的传播特性
4. 每个标题占一行，不要编号`;

      const res = await callAI(
        [
          { role: 'system', content: '你是一位资深公众号标题专家，精通爆款标题写作。直接输出标题列表，每行一个，不要其他内容。' },
          { role: 'user', content: prompt },
        ],
        settings.apiKey,
        settings.model,
        settings.provider,
      );

      const lines = res.split('\n').filter(l => l.trim() && !l.match(/^\d+[\.\、]/) && !l.startsWith('-'));
      setTitles(lines.slice(0, count));
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
            <FileText size={22} className="text-amber-400" />
            爆款标题生成器
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">DeepSeek 驱动，批量生成高点击率公众号标题</p>
        </div>
        {!settings.apiKey && loaded && (
          <Link href="/settings" className="text-xs text-amber-400 hover:underline flex items-center gap-1">
            <AlertCircle size={12} /> 配置 API Key
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 glass-card p-6 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium">文章主题 / 关键词 *</label>
              <WebSearchToggle enabled={webSearch} onToggle={() => setWebSearch(!webSearch)} searching={searching} />
            </div>
            <input type="text" placeholder="输入文章主题或关键词..." value={topic} onChange={e => setTopic(e.target.value)} className="input-field" />
            {webSearch && <p className="text-[10px] text-sky-400 mt-1">🌐 已开启联网搜索，将获取实时信息辅助创作</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">内容类型</label>
            <div className="flex flex-wrap gap-2">
              {contentTypes.map(ct => (
                <button key={ct} onClick={() => setContentType(ct)} className={`tag ${contentType === ct ? 'active' : ''}`}>{ct}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">目标人群（可选）</label>
            <div className="flex flex-wrap gap-2">
              {audiences.map(a => (
                <button key={a} onClick={() => setAudience(a === audience ? '' : a)} className={`tag ${audience === a ? 'active' : ''}`}>{a}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">标题风格（多选）</label>
            <div className="flex flex-wrap gap-2">
              {titleStyles.map(ts => (
                <button key={ts} onClick={() => toggleStyle(ts)} className={`tag ${selectedStyles.includes(ts) ? 'active' : ''}`}>{ts}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">生成数量：{count}</label>
            <input type="range" min={5} max={15} step={5} value={count} onChange={e => setCount(Number(e.target.value))} className="w-full accent-[var(--color-primary)]" />
            <div className="flex justify-between text-xs text-text-secondary mt-1"><span>5</span><span>10</span><span>15</span></div>
          </div>

          {error && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400">{error}</div>}

          <button onClick={generate} disabled={generating || !topic || !settings.apiKey} className="btn-primary w-full justify-center">
            {generating ? <><Loader2 size={16} className="animate-spin" /> DeepSeek 生成中...</> : <><Sparkles size={16} /> 批量生成标题</>}
          </button>
        </div>

        <div className="lg:col-span-3 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">生成的标题</h2>
            {titles.length > 0 && (
              <div className="flex items-center gap-2">
                <SaveButton type="标题" title={topic} content={titles.join('\n')} />
                <button onClick={() => { navigator.clipboard.writeText(titles.join('\n')); toast.show('已复制全部'); }} className="text-xs text-primary-light hover:underline flex items-center gap-1"><Copy size={12} /> 复制全部</button>
              </div>
            )}
          </div>
          <div className="space-y-3">
            {generating ? (
              <div className="flex flex-col items-center justify-center h-64 text-text-secondary gap-3">
                <Loader2 size={32} className="animate-spin text-amber-400" />
                <span>DeepSeek 正在生成爆款标题...</span>
              </div>
            ) : titles.length > 0 ? (
              titles.map((title, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-surface-2 group hover:bg-surface-3 transition-all">
                  <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold bg-amber-500/20 text-amber-400 flex-shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-sm flex-1">{title}</p>
                  <button onClick={() => { navigator.clipboard.writeText(title); toast.show('已复制'); }} className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-amber-400 transition-all p-1"><Copy size={14} /></button>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-text-secondary gap-3">
                <FileText size={40} className="opacity-30" />
                <span>输入主题，DeepSeek 生成</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
