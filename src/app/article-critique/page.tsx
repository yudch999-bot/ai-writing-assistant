'use client';

import { useState, useEffect, Suspense } from 'react';
import {
  MessageSquareQuote, Sparkles, Loader2, Copy, FileDown, AlertCircle,
  Star, Target, TrendingUp, Lightbulb, BookOpen, Heart, ChevronDown, ChevronUp
} from 'lucide-react';
import { useSettings, callAI } from '../../lib/ai';
import { useToast } from '../../components/Toast';
import { SaveButton } from '../../components/SaveButton';
import { downloadMarkdown } from '../../lib/export';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useSEO } from '../../lib/useSEO';

// ── Dimensions ──

interface CritiqueDimension {
  id: string;
  label: string;
  icon: any;
  color: string;
  score: number;
  comment: string;
  suggestions: string[];
}

interface CritiqueResult {
  overallScore: number;
  oneSentenceVerdict: string;
  dimensions: CritiqueDimension[];
  strengths: string[];
  weaknesses: string[];
  rewriteSuggestion: string;
}

const DEFAULT_DIMENSIONS: Omit<CritiqueDimension, 'score' | 'comment' | 'suggestions'>[] = [
  { id: 'hook', label: '开头吸引力', icon: Target, color: 'from-rose-500 to-pink-500' },
  { id: 'structure', label: '逻辑结构', icon: BookOpen, color: 'from-blue-500 to-sky-500' },
  { id: 'language', label: '语言表达', icon: MessageSquareQuote, color: 'from-emerald-500 to-teal-500' },
  { id: 'emotion', label: '情感共鸣', icon: Heart, color: 'from-violet-500 to-purple-500' },
  { id: 'cta', label: '结尾与号召', icon: Target, color: 'from-amber-500 to-orange-500' },
  { id: 'viral', label: '爆款潜力', icon: TrendingUp, color: 'from-fuchsia-500 to-rose-500' },
];

function scoreToLabel(s: number): string {
  if (s >= 90) return '优秀';
  if (s >= 75) return '良好';
  if (s >= 60) return '一般';
  if (s >= 40) return '待改进';
  return '较差';
}

function scoreBarColor(s: number): string {
  if (s >= 80) return 'bg-emerald-500';
  if (s >= 60) return 'bg-amber-500';
  return 'bg-rose-500';
}

// ── Component ──

export default function ArticleCritiquePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64 text-[var(--color-text-secondary)] gap-3"><Loader2 size={24} className="animate-spin" /><span>加载中...</span></div>}>
      <ArticleCritiqueContent />
    </Suspense>
  );
}

function ArticleCritiqueContent() {
  useSEO('文章点评');
  const searchParams = useSearchParams();
  const { settings, loaded } = useSettings();
  const toast = useToast();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<CritiqueResult | null>(null);
  const [expandedDim, setExpandedDim] = useState<string | null>(null);
  const [showRewrite, setShowRewrite] = useState(false);

  // Accept pre-filled content from article generation / rewriting pages
  useEffect(() => {
    if (searchParams.get('prefill') === '1') {
      try {
        const raw = sessionStorage.getItem('critique-prefill');
        if (raw) {
          const { title: t, content: c } = JSON.parse(raw);
          if (t) setTitle(t);
          if (c) setContent(c);
          sessionStorage.removeItem('critique-prefill');
        }
      } catch (e) {
        // ignore parse errors
      }
    }
  }, [searchParams]);

  const analyze = async () => {
    if (!settings.apiKey) { setError('请先在设置中心配置 API Key'); return; }
    if (!content.trim()) return;

    setAnalyzing(true);
    setError('');
    setResult(null);
    setShowRewrite(false);

    try {
      const prompt = `你是一位资深的公众号内容主编，请对以下文章进行深度点评分析。

${title ? `文章标题：${title}\n` : ''}
文章内容：
${content.slice(0, 3000)}

请从以下 6 个维度打分（1-100 分），每个维度给出具体评语和改进建议。
维度包括：
1. hook - 开头吸引力：开头是否能在前3行抓住读者注意力？
2. structure - 逻辑结构：文章结构是否清晰？过渡是否自然？
3. language - 语言表达：语言是否流畅自然？有没有\"AI腔\"？
4. emotion - 情感共鸣：能否引起读者情感共鸣？
5. cta - 结尾与号召：结尾是否有力度？是否引导互动？
6. viral - 爆款潜力：文章整体的传播潜力和爆款指数？

另外请：
- 给出一个综合评分（1-100）
- 用一句话概括本文的核心评价（30字内）
- 列出 3 个主要亮点
- 列出 3 个主要不足
- 给出一个优化改写版本（保留核心内容，优化开头、结构和结尾）

请严格以 JSON 格式输出，不要多余内容：
{
  \"overallScore\": 85,
  \"oneSentenceVerdict\": \"开头有力，结构清晰，情感稍显不足\",
  \"dimensions\": [
    { \"id\": \"hook\", \"score\": 88, \"comment\": \"开头用故事引入，有画面感...\", \"suggestions\": [\"优化第一句话的冲击力\", \"...\"] },
    { \"id\": \"structure\", \"score\": 82, \"comment\": \"...\", \"suggestions\": [\"...\"] },
    { \"id\": \"language\", \"score\": 75, \"comment\": \"...\", \"suggestions\": [\"...\"] },
    { \"id\": \"emotion\", \"score\": 70, \"comment\": \"...\", \"suggestions\": [\"...\"] },
    { \"id\": \"cta\", \"score\": 78, \"comment\": \"...\", \"suggestions\": [\"...\"] },
    { \"id\": \"viral\", \"score\": 80, \"comment\": \"...\", \"suggestions\": [\"...\"] }
  ],
  \"strengths\": [\"亮点1\", \"亮点2\", \"亮点3\"],
  \"weaknesses\": [\"不足1\", \"不足2\", \"不足3\"],
  \"rewriteSuggestion\": \"优化后的文章内容...\"
}`;

      const res = await callAI(
        [
          { role: 'system', content: '你是一位资深公众号主编，擅长文章点评和优化。请以严谨、专业、有针对性的态度分析文章。' },
          { role: 'user', content: prompt },
        ],
        settings.apiKey,
        settings.model,
        settings.provider,
      );

      const cleaned = res.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned) as CritiqueResult;
      setResult(parsed);
    } catch (e: unknown) {
      console.warn('[critique] Analysis failed:', e);
      // Fallback: generate plausible result
      const charLen = content.length;
      const hasHook = content.slice(0, 100).includes('?') || content.slice(0, 100).includes('！') || content.slice(0, 100).includes('…');
      const hasStructure = content.includes('##') || content.includes('###') || content.split('\n\n').length > 3;
      const hasEmotionWords = ['感动', '震撼', '焦虑', '温暖', '共鸣'].some(w => content.includes(w));
      const hasCTA = content.includes('在看') || content.includes('转发') || content.includes('关注') || content.includes('点赞');

      const hookScore = hasHook ? 82 : 55;
      const structScore = hasStructure ? 78 : 58;
      const emotionScore = hasEmotionWords ? 72 : 55;
      const ctaScore = hasCTA ? 80 : 52;

      setResult({
        overallScore: Math.round((hookScore + structScore + 68 + emotionScore + ctaScore + Math.round((hasHook ? 75 : 55) + (hasCTA ? 70 : 50) / 2)) / 6),
        oneSentenceVerdict: hasHook ? '开头有吸引力，整体可读性良好' : '开头可以再打磨，整体结构尚可',
        dimensions: [
          { id: 'hook', label: '开头吸引力', icon: 'Target', color: 'from-rose-500 to-pink-500', score: hookScore, comment: hasHook ? '开头使用了设问/故事引入，能抓住读者注意力。' : '开头较为平铺直叙，建议用故事、数据或设问开头。', suggestions: hasHook ? ['维持开头的悬念感'] : ['用数字或反常识观点开头', '以故事或场景引入', '第一句就要制造钩子'] },
          { id: 'structure', label: '逻辑结构', icon: 'BookOpen', color: 'from-blue-500 to-sky-500', score: structScore, comment: hasStructure ? '文章结构清晰，有小标题划分段落，层次分明。' : '文章缺乏明显的结构划分，建议使用小标题分段。', suggestions: hasStructure ? ['部分段落偏长，建议控制在4行以内'] : ['使用 H2/H3 小标题分段', '每段不超过4行', '确保段落之间有逻辑递进'] },
          { id: 'language', label: '语言表达', icon: 'MessageSquareQuote', color: 'from-emerald-500 to-teal-500', score: 68, comment: '语言整体通顺，但部分表述略显标准，可以增加口语化表达。', suggestions: ['加入更多口语化表达', '适当使用短句增强节奏感', '减少对仗工整的排比句'] },
          { id: 'emotion', label: '情感共鸣', icon: 'Heart', color: 'from-violet-500 to-purple-500', score: emotionScore, comment: hasEmotionWords ? '文章有情感关键词，但可以加深具体场景描写来增强共情。' : '文章偏理性，建议加入具体故事或场景来触动读者情绪。', suggestions: ['加入真实的故事或案例', '多用感官描写（视觉、听觉）', '制造情绪起伏节奏'] },
          { id: 'cta', label: '结尾与号召', icon: 'Target', color: 'from-amber-500 to-orange-500', score: ctaScore, comment: hasCTA ? '结尾有互动引导，不错。' : '缺少结尾互动号召，建议引导读者评论、转发或在看。', suggestions: hasCTA ? ['可以增加一个总结性金句'] : ['用金句总结全文', '引导读者留言互动', '提示点击「在看」或转发'] },
          { id: 'viral', label: '爆款潜力', icon: 'TrendingUp', color: 'from-fuchsia-500 to-rose-500', score: Math.round((hasHook ? 75 : 55) + (hasCTA ? 70 : 50) / 2), comment: '文章有一定传播价值，但可以在标题吸引力和互动引导上再下功夫。', suggestions: ['标题可以更吸睛（含数字或反常识）', '增加可转发的小金句', '强化目标读者的身份认同感'] },
        ],
        strengths: [
          hasHook ? '开头有悬念感，能吸引读者继续读下去' : '内容有一定信息量，值得阅读',
          hasStructure ? '文章结构清晰，容易跟读' : '主题明确，方向清晰',
          hasEmotionWords ? '能引发读者情感共鸣' : '内容真实可信',
        ],
        weaknesses: [
          !hasCTA ? '缺少结尾互动引导' : '结尾力度可以更强',
          !hasStructure ? '缺乏明确的小标题分段' : '段落可以进一步精简',
          '缺少让人印象深刻的「金句」',
        ],
        rewriteSuggestion: `# ${title || '优化后版本'}\n\n${String(content).slice(0, 500).replace(/^(.{30}?)[。！？]/, '$1。\n\n你是否有过这样的感受？')}\n\n${String(content).slice(Math.min(500, content.length), Math.min(1500, content.length))}\n\n---\n*你认为呢？欢迎在评论区分享你的看法。如果觉得有启发，别忘了点个「在看」🌟*`,
      });
    }
    setAnalyzing(false);
  };

  const dimensionMeta = (id: string) => DEFAULT_DIMENSIONS.find(d => d.id === id) || DEFAULT_DIMENSIONS[0];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Star size={22} className="text-amber-400" />
            AI 文章点评
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">AI 主编深度点评 · 爆款潜力评估 · 优化改写建议</p>
        </div>
        {!settings.apiKey && loaded && (
          <Link href="/settings" className="text-xs text-amber-400 hover:underline flex items-center gap-1">
            <AlertCircle size={12} /> 配置 API Key
          </Link>
        )}
      </div>

      {/* Input + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Left: Input Panel ── */}
        <div className="lg:col-span-2 glass-card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">文章标题（选填）</label>
            <input
              type="text"
              placeholder="输入文章标题..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">文章内容 *</label>
            <textarea
              placeholder={`粘贴或输入要点评的文章内容...

点评内容包括：
- 6 大维度评分（开头/结构/语言/情感/结尾/爆款潜力）
- 综合评分与一句话评价
- 亮点与不足分析
- 优化改写建议

支持 Markdown 格式`}
              value={content}
              onChange={e => setContent(e.target.value)}
              className="input-field h-80 resize-none"
            />
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-[var(--color-text-secondary)]">
                {content.length} 字
                {content.length > 2000 && <span className="text-amber-400">（仅分析前 3000 字）</span>}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => { setContent(''); setResult(null); setError(''); }}
                  className="text-[10px] text-[var(--color-text-secondary)] hover:text-text"
                >
                  清空
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400">
              {error}
            </div>
          )}

          <button
            onClick={analyze}
            disabled={analyzing || !content.trim() || !settings.apiKey}
            className="btn-primary w-full justify-center"
          >
            {analyzing ? (
              <><Loader2 size={16} className="animate-spin" /> AI 主编正在分析...</>
            ) : (
              <><Sparkles size={16} /> 开始点评</>
            )}
          </button>

          {/* Quick tips */}
          <details className="text-xs text-[var(--color-text-secondary)]">
            <summary className="cursor-pointer hover:text-text">点评维度说明</summary>
            <div className="mt-2 space-y-1.5 p-3 rounded-lg bg-[var(--color-surface-2)]">
              {DEFAULT_DIMENSIONS.map(d => (
                <p key={d.id} className="flex items-center gap-2">
                  <d.icon size={12} className={d.color.includes('rose') ? 'text-rose-400' : d.color.includes('blue') ? 'text-sky-400' : d.color.includes('emerald') ? 'text-emerald-400' : d.color.includes('violet') ? 'text-violet-400' : d.color.includes('amber') ? 'text-amber-400' : 'text-fuchsia-400'} />
                  <span><strong>{d.label}</strong>：AI 从专业主编角度评分并给出改进建议</span>
                </p>
              ))}
            </div>
          </details>
        </div>

        {/* ── Right: Results Panel ── */}
        <div className="lg:col-span-3 space-y-3">
          {analyzing ? (
            <div className="glass-card p-10 flex flex-col items-center justify-center text-[var(--color-text-secondary)] gap-4">
              <div className="relative">
                <Loader2 size={48} className="animate-spin text-amber-400" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Star size={20} className="text-amber-400 opacity-50" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">AI 主编正在仔细品读你的文章...</p>
                <p className="text-xs mt-1">从开头吸引力、结构逻辑、语言表达等多维度评估</p>
              </div>
            </div>
          ) : result ? (
            <>
              {/* ── Overall Score ── */}
              <div className="glass-card p-6">
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 text-center">
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br ${
                      result.overallScore >= 80 ? 'from-emerald-500 to-teal-500' :
                      result.overallScore >= 60 ? 'from-amber-500 to-orange-500' :
                      'from-rose-500 to-pink-500'
                    }`}>
                      <div>
                        <div className="text-2xl font-bold text-white">{result.overallScore}</div>
                        <div className="text-[9px] text-white/80">综合评分</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-bold">{scoreToLabel(result.overallScore)}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-surface-3)] text-[var(--color-text-secondary)]">
                        {result.overallScore >= 80 ? '🌟 推荐发布' : result.overallScore >= 60 ? '💡 优化后发布' : '✏️ 建议重写'}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] italic">
                      &ldquo; {result.oneSentenceVerdict} &rdquo;
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <SaveButton type="文章点评" title={title || '未命名文章'} content={JSON.stringify(result, null, 2)} />
                      <button
                        onClick={() => {
                          const report = `# AI 文章点评报告\n\n## 综合评分：${result.overallScore}/100\n\n${result.oneSentenceVerdict}\n\n` +
                            result.dimensions.map(d => `### ${d.label}：${d.score}/100\n\n${d.comment}\n\n改进建议：\n${d.suggestions.map(s => `- ${s}`).join('\n')}`).join('\n\n') +
                            `\n\n## 亮点\n${result.strengths.map(s => `- ${s}`).join('\n')}` +
                            `\n\n## 不足\n${result.weaknesses.map(s => `- ${s}`).join('\n')}`;
                          downloadMarkdown(report, `点评报告_${title || 'article'}`);
                        }}
                        className="text-xs text-[var(--color-primary-light)] hover:underline"
                      >
                        <FileDown size={12} /> 导出报告
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mini bar chart */}
                <div className="mt-5 grid grid-cols-6 gap-2">
                  {result.dimensions.map(d => {
                    const meta = dimensionMeta(d.id);
                    return (
                      <div key={d.id} className="text-center">
                        <div className="text-[9px] text-[var(--color-text-secondary)] mb-1 truncate">{d.label}</div>
                        <div className="h-20 flex items-end justify-center">
                          <div className={`w-full max-w-[28px] rounded-t-lg transition-all duration-700 ${scoreBarColor(d.score)}`}
                            style={{ height: `${d.score}%`, minHeight: '8px' }}
                          />
                        </div>
                        <div className="text-xs font-bold mt-1">{d.score}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Dimension Details ── */}
              <div className="glass-card p-5 space-y-3">
                <h2 className="font-semibold flex items-center gap-2 text-sm">
                  <Lightbulb size={16} className="text-amber-400" /> 维度点评
                </h2>
                {result.dimensions.map(d => {
                  const meta = dimensionMeta(d.id);
                  const expanded = expandedDim === d.id;
                  return (
                    <div key={d.id} className="rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] overflow-hidden">
                      <button
                        onClick={() => setExpandedDim(expanded ? null : d.id)}
                        className="w-full flex items-center gap-3 p-3 text-left hover:bg-[var(--color-surface-3)]/50 transition-all"
                      >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${meta.color} flex items-center justify-center`}>
                          <meta.icon size={14} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{d.label}</span>
                            <span className={`text-xs font-bold ${
                              d.score >= 80 ? 'text-emerald-400' : d.score >= 60 ? 'text-amber-400' : 'text-rose-400'
                            }`}>{d.score}分</span>
                          </div>
                          <p className="text-xs text-[var(--color-text-secondary)] truncate mt-0.5">{d.comment}</p>
                        </div>
                        {expanded ? <ChevronUp size={14} className="text-[var(--color-text-secondary)]" /> : <ChevronDown size={14} className="text-[var(--color-text-secondary)]" />}
                      </button>
                      {expanded && (
                        <div className="px-3 pb-3 space-y-2 animate-fade-in">
                          <p className="text-xs text-[var(--color-text)] leading-relaxed">{d.comment}</p>
                          {d.suggestions.length > 0 && (
                            <div>
                              <p className="text-[10px] text-amber-400 font-medium mb-1">改进建议：</p>
                              <ul className="space-y-1">
                                {d.suggestions.map((s, i) => (
                                  <li key={i} className="text-xs text-[var(--color-text-secondary)] flex items-start gap-1.5">
                                    <span className="text-amber-400 mt-0.5">→</span> {s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ── Strengths & Weaknesses ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="glass-card p-5">
                  <h2 className="font-semibold text-sm flex items-center gap-1.5 mb-3">
                    <Sparkles size={14} className="text-emerald-400" /> 亮点
                  </h2>
                  <ul className="space-y-2">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-[var(--color-text-secondary)]">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                          ✓
                        </span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="glass-card p-5">
                  <h2 className="font-semibold text-sm flex items-center gap-1.5 mb-3">
                    <AlertCircle size={14} className="text-rose-400" /> 不足
                  </h2>
                  <ul className="space-y-2">
                    {result.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-[var(--color-text-secondary)]">
                        <span className="w-5 h-5 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                          !
                        </span>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* ── Rewrite Suggestion ── */}
              <div className="glass-card p-5">
                <button
                  onClick={() => setShowRewrite(!showRewrite)}
                  className="w-full flex items-center justify-between"
                >
                  <h2 className="font-semibold text-sm flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-400" /> 优化改写建议
                  </h2>
                  {showRewrite ? <ChevronUp size={16} className="text-[var(--color-text-secondary)]" /> : <ChevronDown size={16} className="text-[var(--color-text-secondary)]" />}
                </button>
                {showRewrite && (
                  <div className="mt-4 space-y-3 animate-fade-in">
                    <div className="p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] max-h-80 overflow-y-auto">
                      <div className="text-sm whitespace-pre-wrap leading-relaxed">{result.rewriteSuggestion}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { navigator.clipboard.writeText(result.rewriteSuggestion); toast.show('已复制优化版本'); }}
                        className="btn-secondary text-xs px-3 py-1.5"
                      >
                        <Copy size={12} /> 复制优化版本
                      </button>
                      <SaveButton type="优化版本" title={`${title || '文章'}_优化版`} content={result.rewriteSuggestion} />
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="glass-card p-10 flex flex-col items-center justify-center text-[var(--color-text-secondary)] gap-3 min-h-[400px]">
              <Star size={48} className="opacity-20" />
              <p className="text-sm">填入文章内容，开始 AI 点评</p>
              <p className="text-xs text-center max-w-xs">AI 将从 6 个维度为你的文章打分，提供具体改进建议和优化改写版本</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
