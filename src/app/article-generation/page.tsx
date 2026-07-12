'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { Layers, Sparkles, Loader2, Copy, BookOpen, AlertCircle, LoaderCircle, X, FileDown, Star } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useSettings, callAI } from '../../lib/ai';
import { useToast } from '../../components/Toast';
import { downloadMarkdown } from '../../lib/export';
import { SaveButton } from '../../components/SaveButton';
import { WebSearchToggle } from '../../components/WebSearchToggle';
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

const articleModes = [
  { id: 'custom', label: '定向生成', desc: '输入标题和背景，生成完整文章' },
  { id: 'style', label: '风格写作·精准复刻', desc: '调用已保存的风格提示词生成' },
  { id: 'explosive', label: '暴躁创作专家', desc: '6大核心参数，微信算法友好型爆文' },
  { id: 'toutiao', label: '头条爆文专家', desc: '全网检索数据，高点击率爆文' },
];

export default function ArticleGenerationPage() {
  useSEO('文章生成');
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64 text-text-secondary gap-3">
        <LoaderCircle size={24} className="animate-spin" />
        <span>加载中...</span>
      </div>
    }>
      <ArticleGenerationContent />
    </Suspense>
  );
}

function ArticleGenerationContent() {
  const searchParams = useSearchParams();
  const { settings, loaded } = useSettings();
  const toast = useToast();
  const [mode, setMode] = useState('custom');
  const [title, setTitle] = useState('');
  const [articleType, setArticleType] = useState('gzh');
  const [wordCount, setWordCount] = useState(1500);
  const [background, setBackground] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [webSearch, setWebSearch] = useState(false);
  const [searching, setSearching] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const topic = searchParams.get('topic');

  useEffect(() => {
    if (topic) setTitle(topic);
  }, [topic]);

  const generate = async () => {
    if (!settings.apiKey) { setError('请先在设置中心配置 DeepSeek API Key'); return; }
    if (!title.trim()) return;

    const controller = new AbortController();
    abortRef.current = controller;
    setGenerating(true);
    setError('');
    setResult(null);

    try {
      const typeLabel = articleTypes.find(t => t.id === articleType)?.label || '公众号文章';
      let searchContext = '';

      // Web search if enabled
      if (webSearch) {
        setSearching(true);
        try {
          const searchRes = await fetch('/api/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: `${title} ${background ? background.slice(0, 50) : ''}` }),
          });
          const searchData = await searchRes.json();
          if (searchRes.ok && searchData.context) {
            searchContext = `\n\n===== 以下是联网搜索到的相关信息 =====\n${searchData.context}\n===== 请基于以上信息结合你的知识来写 =====\n`;
          }
        } catch (e) {
          console.warn('[article-generation] Web search failed:', e);
        }
        setSearching(false);
      }

      const prompt = `${searchContext}请写一篇${typeLabel}，要求如下：

标题：${title}
字数：约${wordCount}字
${background ? `背景素材：${background}` : ''}

要求：
1. 开头用故事或设问引入，前3行抓住读者注意力
2. 主体分3-4个部分，每个部分配小标题
3. 每段不超过4行，关键信息加粗
4. 结尾用金句总结，引导互动
5. 语言自然，避免AI腔
6. 使用 Markdown 格式输出`;

      const res = await callAI(
        [
          { role: 'system', content: '你是一位资深公众号文章写手，擅长写爆款文章。用 Markdown 格式输出，口语化自然，不要AI腔。' },
          { role: 'user', content: prompt },
        ],
        settings.apiKey,
        settings.model,
        settings.provider,
        undefined,
        undefined,
        undefined,
        controller.signal,
      );

      setResult(res);
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        setError('');
        return;
      }
      setError(e instanceof Error ? e.message : '生成失败');
    }
    setGenerating(false);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Layers size={22} className="text-emerald-400" />
            文章生成
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">DeepSeek 驱动的全流程公众号文章创作</p>
        </div>
        {!settings.apiKey && loaded && (
          <Link href="/settings" className="text-xs text-amber-400 hover:underline flex items-center gap-1">
            <AlertCircle size={12} /> 配置 API Key
          </Link>
        )}
      </div>

      {/* Mode Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {articleModes.map(m => (
          <button key={m.id} onClick={() => setMode(m.id)} className={`glass-card p-4 text-left glass-card-hover ${mode === m.id ? 'border-[var(--color-primary)]/40 bg-[var(--color-primary)]/5' : ''}`}>
            <h3 className="text-sm font-medium">{m.label}</h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">{m.desc}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 glass-card p-6 space-y-4">
          {mode === 'custom' && (
            <>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium">文章标题 *</label>
                  <WebSearchToggle enabled={webSearch} onToggle={() => setWebSearch(!webSearch)} searching={searching} />
                </div>
                <input type="text" placeholder="输入文章标题..." value={title} onChange={e => setTitle(e.target.value)} className="input-field" />
                {webSearch && <p className="text-[10px] text-sky-400 mt-1">🌐 已开启联网搜索，将获取实时信息辅助创作</p>}
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
                <label className="block text-sm font-medium mb-1">字数：{wordCount}字</label>
                <div className="flex gap-2">
                  {[800, 1500, 2000, 3500, 5000].map(w => (
                    <button key={w} onClick={() => setWordCount(w)} className={`tag ${wordCount === w ? 'active' : ''}`}>{w}字</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">背景素材（可选）</label>
                <textarea placeholder="提供更多背景信息..." value={background} onChange={e => setBackground(e.target.value)} className="input-field h-24 resize-none" />
              </div>
            </>
          )}

          {(mode === 'style' || mode === 'explosive' || mode === 'toutiao') && (
            <div className="text-sm text-[var(--color-text-secondary)] text-center py-8">
              此模式需要更多参数配置，当前使用"定向生成"模式也可以达到类似效果
            </div>
          )}

          {error && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400">{error}</div>}

          {generating ? (
            <div className="flex gap-2">
              <button disabled className="btn-primary w-full justify-center opacity-70">
                <Loader2 size={16} className="animate-spin" /> DeepSeek 创作中...
              </button>
              <button onClick={() => { abortRef.current?.abort(); setGenerating(false); }} className="btn-secondary px-4 text-rose-400 border-rose-500/30">
                <X size={16} /> 取消
              </button>
            </div>
          ) : (
            <button onClick={generate} disabled={generating || !title.trim() || !settings.apiKey} className="btn-primary w-full justify-center">
              <Sparkles size={16} /> 生成文章
            </button>
          )}
        </div>

        <div className="lg:col-span-3 subtle-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">文章预览</h2>
            {result && (
              <div className="flex items-center gap-2">
                <SaveButton type="文章" title={title} content={result || ''} />
                <button onClick={() => { navigator.clipboard.writeText(result || ''); toast.show('已复制'); }} className="text-xs text-primary-light hover:underline flex items-center gap-1"><Copy size={12} /> 复制</button>
                <button onClick={() => { sessionStorage.setItem('critique-prefill', JSON.stringify({ title, content: result })); window.location.href = '/article-critique?prefill=1'; }} className="text-xs text-amber-400 hover:underline flex items-center gap-1"><Star size={12} /> 去点评</button>
                <button onClick={() => downloadMarkdown(result || '', title || 'article')} className="text-xs text-[var(--color-primary-light)] hover:underline flex items-center gap-1"><FileDown size={12} /> 下载 Markdown</button>
              </div>
            )}
          </div>
          <div className="min-h-[500px] rounded-xl bg-[var(--color-surface-2)] p-6 overflow-y-auto max-h-[600px]">
            {generating ? (
              <div className="flex flex-col items-center justify-center h-64 text-text-secondary gap-3">
                <Loader2 size={32} className="animate-spin text-emerald-400" />
                <span>DeepSeek 正在构思文章...</span>
              </div>
            ) : result ? (
              <div className="text-sm whitespace-pre-wrap leading-relaxed">{result}</div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-text-secondary gap-3">
                <Layers size={40} className="opacity-30" />
                <span>填写参数，生成文章</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
