'use client';

import { useState } from 'react';
import { RotateCcw, Sparkles, Loader2, Copy, AlertCircle, Link as LinkIcon, FileDown, Star } from 'lucide-react';
import { useSettings, callAI } from '../../lib/ai';
import { useToast } from '../../components/Toast';
import { downloadMarkdown } from '../../lib/export';
import { SaveButton } from '../../components/SaveButton';
import Link from 'next/link';
import { useSEO } from '../../lib/useSEO';

const articleTypes = [
  { id: 'gzh', label: '公众号爆款文' },
  { id: 'emotion', label: '情感共鸣' },
  { id: 'tree', label: '错综树洞' },
  { id: 'tutorial', label: '干货教程文' },
  { id: 'grass', label: '营销种草文' },
  { id: 'soup', label: '励志鸡汤' },
];

const directions = [
  { id: 'restate', label: '保留核心观点，重构表达' },
  { id: 'emotion', label: '提升情感共鸣度' },
  { id: 'practical', label: '增强干货实用性' },
  { id: 'story', label: '强化故事叙述感' },
  { id: 'title', label: '优化爆款标题钩子' },
];

export default function RewritingPage() {
  useSEO('文章仿写');
  const { settings, loaded } = useSettings();
  const toast = useToast();
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [articleType, setArticleType] = useState('gzh');
  const [direction, setDirection] = useState('restate');
  const [wordCount, setWordCount] = useState(1500);
  const [rewriting, setRewriting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [fetching, setFetching] = useState(false);

  const handleFetchContent = async () => {
    if (!url.trim()) return;
    setFetching(true);
    setError('');
    try {
      const res = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '获取失败');
      setContent(data.content || '');
      toast.show(`已获取：${data.title || '文章内容'}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '获取失败，请手动粘贴内容');
    }
    setFetching(false);
  };

  const rewrite = async () => {
    if (!settings.apiKey) { setError('请先在设置中心配置 DeepSeek API Key'); return; }
    if (!content.trim()) return;

    setRewriting(true);
    setError('');
    setResult(null);

    try {
      const source = content.trim();
      const typeLabel = articleTypes.find(t => t.id === articleType)?.label || '公众号文章';
      const dirLabel = directions.find(d => d.id === direction)?.label || '重构表达';

      const prompt = `请对以下文章进行深度改写，要求：

原文内容：
${source.slice(0, 3000)}

改写方向：${dirLabel}
目标类型：${typeLabel}
目标字数：约${wordCount}字

要求：
1. 保留原文的核心观点和信息
2. 按照改写方向重构表达方式
3. 输出 100% 原创内容，不能跟原文重复
4. 使用 Markdown 格式输出
5. 开头用故事或设问引入`;

      const res = await callAI(
        [
          { role: 'system', content: '你是一位专业的公众号文章改写专家。擅长在保留原意的基础上进行深度改写，确保100%原创。' },
          { role: 'user', content: prompt },
        ],
        settings.apiKey,
        settings.model,
        settings.provider,
      );
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '改写失败');
    }
    setRewriting(false);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <RotateCcw size={22} className="text-sky-400" />
            文章仿写
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">DeepSeek 深度改写，100% 原创</p>
        </div>
        {!settings.apiKey && loaded && (
          <Link href="/settings" className="text-xs text-amber-400 hover:underline flex items-center gap-1"><AlertCircle size={12} /> 配置 API Key</Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 glass-card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">文章链接 <span className="text-xs text-[var(--color-text-secondary)]">填链接后点「获取内容」自动抓取</span></label>
            <div className="flex gap-2">
              <input type="url" placeholder="https://mp.weixin.qq.com/..." value={url} onChange={e => setUrl(e.target.value)} className="input-field flex-1" />
              <button onClick={handleFetchContent} disabled={fetching || !url.trim()} className="btn-secondary text-xs px-3 whitespace-nowrap">
                {fetching ? <><Loader2 size={14} className="animate-spin" /> 获取中</> : <><LinkIcon size={14} /> 获取内容</>}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">文章内容</label>
            <textarea placeholder="粘贴原文内容，或点「获取内容」自动抓取..." value={content} onChange={e => setContent(e.target.value)} className="input-field h-32 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">文章类型</label>
            <div className="flex flex-wrap gap-2">
              {articleTypes.map(at => (
                <button key={at.id} onClick={() => setArticleType(at.id)} className={`tag ${articleType === at.id ? 'active' : ''}`}>{at.label}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">创作方向</label>
            <div className="space-y-2">
              {directions.map(d => (
                <label key={d.id} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="direction" checked={direction === d.id} onChange={() => setDirection(d.id)} className="accent-[var(--color-primary)]" />
                  <span className="text-sm">{d.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">目标字数</label>
            <div className="flex gap-2">
              {[800, 1200, 1800, 2500, 3000].map(w => (
                <button key={w} onClick={() => setWordCount(w)} className={`tag ${wordCount === w ? 'active' : ''}`}>{w}字</button>
              ))}
            </div>
          </div>
          {error && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400">{error}</div>}
          <button onClick={rewrite} disabled={rewriting || (!content.trim() && !url.trim()) || !settings.apiKey} className="btn-primary w-full justify-center">
            {rewriting ? <><Loader2 size={16} className="animate-spin" /> DeepSeek 改写中...</> : <><Sparkles size={16} /> 开始仿写</>}
          </button>
        </div>

        <div className="lg:col-span-3 subtle-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">改写结果</h2>
            {result && <div className="flex items-center gap-2"><SaveButton type="仿写" title={content.slice(0, 30)} content={result} /><button onClick={() => { navigator.clipboard.writeText(result); toast.show('已复制'); }} className="text-xs text-primary-light hover:underline flex items-center gap-1"><Copy size={12} /> 复制</button><button onClick={() => { sessionStorage.setItem('critique-prefill', JSON.stringify({ title: content.slice(0, 50), content: result })); window.location.href = '/article-critique?prefill=1'; }} className="text-xs text-amber-400 hover:underline flex items-center gap-1"><Star size={12} /> 去点评</button>
                <button onClick={() => downloadMarkdown(result, 'rewritten-article')} className="text-xs text-[var(--color-primary-light)] hover:underline flex items-center gap-1"><FileDown size={12} /> 下载 Markdown</button></div>}
          </div>
          <div className="min-h-[400px] rounded-xl bg-[var(--color-surface-2)] p-4 overflow-y-auto max-h-[500px]">
            {rewriting ? (
              <div className="flex flex-col items-center justify-center h-64 text-text-secondary gap-3">
                <Loader2 size={32} className="animate-spin text-sky-400" />
                <span>DeepSeek 正在改写文章...</span>
              </div>
            ) : result ? (
              <div className="text-sm whitespace-pre-wrap leading-relaxed">{result}</div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-text-secondary gap-3">
                <RotateCcw size={40} className="opacity-30" />
                <span>粘贴文章内容，DeepSeek 改写</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
