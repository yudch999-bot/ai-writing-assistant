'use client';

import { useState } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle, XCircle, Loader2, FileText, AlertCircle, Sparkles, Copy, RotateCcw } from 'lucide-react';
import { useSettings, callAI } from '../../lib/ai';
import { useToast } from '../../components/Toast';
import { SaveButton } from '../../components/SaveButton';
import Link from 'next/link';

export default function ContentDetectionPage() {
  const { settings, loaded } = useSettings();
  const toast = useToast();
  const [content, setContent] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [optimizing, setOptimizing] = useState(false);
  const [optimizedContent, setOptimizedContent] = useState('');

  const detect = async () => {
    if (!settings.apiKey) { setError('请先在设置中心配置 DeepSeek API Key'); return; }
    if (!content.trim()) return;

    setDetecting(true);
    setError('');
    setResult(null);
    setOptimizedContent('');

    try {
      const prompt = `请分析以下文章内容，输出 JSON 格式的检测报告：

文章内容：
${content.slice(0, 2000)}

请严格按照以下 JSON 格式输出，不要其他内容：
{
  "aiScore": 0-100的整数，判断文章是AI生成的概率,
  "aiPassed": true/false（低于50分为true）,
  "sensitiveWords": [
    {"word": "敏感词", "level": "warning/info", "suggestion": "替换建议"}
  ],
  "originality": 0-100的整数（原创度评分）,
  "suggestions": ["优化建议1", "优化建议2", "优化建议3"]
}`;

      const res = await callAI(
        [
          { role: 'system', content: '你是一位专业的内容安全与原创度检测专家。只输出 JSON，不要其他文字。' },
          { role: 'user', content: prompt },
        ],
        settings.apiKey,
        settings.model,
      );

      let jsonStr = res.trim();
      jsonStr = jsonStr.replace(/^```(?:json)?\s*/gm, '').replace(/```\s*$/gm, '').trim();
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        setResult(JSON.parse(jsonMatch[0]));
      } else {
        throw new Error('AI 返回格式异常');
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '检测失败');
    }
    setDetecting(false);
  };

  const handleOptimize = async () => {
    if (!result || !content.trim() || !settings.apiKey) return;
    setOptimizing(true);
    setOptimizedContent('');

    try {
      const sensitiveInfo = result.sensitiveWords?.length > 0
        ? `敏感词：${result.sensitiveWords.map((s: any) => `${s.word} → ${s.suggestion}`).join('、')}`
        : '无明显敏感词';

      const prompt = `请把下面的文章改写成"真人写的感觉"，彻底消除 AI 痕迹。

原文：
${content.slice(0, 2500)}

${result.aiScore > 50 ? `检测到该文章 AI 痕迹过重（${result.aiScore}%），需要彻底改写。` : ''}
${result.sensitiveWords?.length > 0 ? `需替换敏感词：${result.sensitiveWords.map((s: any) => `${s.word}→${s.suggestion}`).join('、')}` : ''}

===== 必须遵守的改写规则 =====

【句式方面】
- ❌ 不要用"首先/其次/最后"、"第一/第二/第三"这种模板结构
- ❌ 不要用"值得注意的是"、"不可否认的是"、"从某种角度来说"这类废话开头
- ❌ 不要每段都用"xxx，才能xxx"、"xxx，就是xxx"这种排比句
- ✅ 写短句。一句话不超过25个字
- ✅ 段与段之间要有跳跃感，不要每段都"承上启下"

【语气方面】
- ❌ 不要用"我们"做主语（"我们总是以为" → "我以前也这么想"）
- ❌ 不要用"在当今这个..."、"随着..."、"在这个信息爆炸的时代"开场
- ❌ 不要写"xxx的背后，是xxx"这种装深刻的句式
- ✅ 用"我"、"你"直接对话
- ✅ 像朋友聊天一样写，可以有口语词（"说白了"、"讲真的"、"其实吧"）

【内容方面】
- ❌ 不要堆砌大词（"蜕变"、"赋能"、"共振"、"底层逻辑"）
- ✅ 每讲一个观点，必须配一个具体的故事、例子或细节
- ✅ 可以有个人经历，哪怕是你编的，但要像真的
- ✅ 结尾不要喊口号，用一句大白话收住就行

【操作】
- 直接输出改写后的文章，不要任何说明
- 保留原文的核心观点和信息
- 字数跟原文差不多`;

      const res = await callAI(
        [
          { role: 'system', content: '你是一位专业的内容优化专家。直接输出优化后的文章，不要添加任何说明。' },
          { role: 'user', content: prompt },
        ],
        settings.apiKey,
        settings.model,
      );

      setOptimizedContent(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '优化失败');
    }
    setOptimizing(false);
  };

  const useOptimized = () => {
    if (!optimizedContent) return;
    setContent(optimizedContent);
    setResult(null);
    setOptimizedContent('');
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck size={22} className="text-violet-400" />
            内容检测中心
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">检测 → 优化 → 一键替换，一站式内容质量提升</p>
        </div>
        {!settings.apiKey && loaded && (
          <Link href="/settings" className="text-xs text-amber-400 hover:underline flex items-center gap-1"><AlertCircle size={12} /> 配置 API Key</Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Input */}
        <div className="lg:col-span-3 glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">
              {optimizedContent ? '优化后的文章' : '原始文章'}
            </h2>
            <span className="text-xs text-[var(--color-text-secondary)]">
              {optimizedContent ? optimizedContent.length : content.length} 字
            </span>
          </div>

          {optimizedContent ? (
            <div className="space-y-3">
              <div className="rounded-xl bg-[var(--color-surface-2)] p-4 text-sm leading-relaxed whitespace-pre-wrap min-h-[200px] max-h-[400px] overflow-y-auto">
                {optimizedContent}
              </div>
              <div className="flex gap-2">
                <SaveButton type="优化" title={content.slice(0, 30)} content={optimizedContent} />
                <button onClick={() => { navigator.clipboard.writeText(optimizedContent); toast.show('已复制'); }} className="btn-secondary flex-1 justify-center">
                  <Copy size={16} /> 复制
                </button>
                <button onClick={useOptimized} className="btn-primary flex-1 justify-center">
                  <RotateCcw size={16} /> 替换原文继续修改
                </button>
              </div>
            </div>
          ) : (
            <>
              <textarea
                placeholder="粘贴文章内容进行检测..."
                value={content}
                onChange={e => setContent(e.target.value)}
                className="input-field h-64 resize-none"
              />
              {error && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400">{error}</div>}
              <button onClick={detect} disabled={detecting || !content || !settings.apiKey} className="btn-primary w-full justify-center">
                {detecting ? <><Loader2 size={16} className="animate-spin" /> DeepSeek 检测中...</> : <><ShieldCheck size={16} /> 全面检测</>}
              </button>
            </>
          )}
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-2 space-y-4">
          {detecting ? (
            <div className="glass-card p-5 flex flex-col items-center justify-center h-64 text-[var(--color-text-secondary)] gap-3">
              <Loader2 size={32} className="animate-spin text-violet-400" />
              <span>正在检测...</span>
            </div>
          ) : result ? (
            <>
              {/* AI Score */}
              <div className="glass-card p-5">
                <h3 className="text-sm font-medium flex items-center gap-2 mb-3"><FileText size={14} className="text-cyan-400" /> AI 内容识别</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">AI 生成概率</span>
                    <span className={`text-lg font-bold ${result.aiPassed ? 'text-emerald-400' : 'text-rose-400'}`}>{result.aiScore}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--color-surface-3)] overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${result.aiPassed ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${result.aiScore}%` }} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${result.aiPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {result.aiPassed ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    {result.aiPassed ? '通过，无明显AI痕迹' : 'AI痕迹明显，建议优化'}
                  </div>
                </div>
              </div>

              {/* Sensitive Words */}
              {result.sensitiveWords?.length > 0 && (
                <div className="glass-card p-5">
                  <h3 className="text-sm font-medium flex items-center gap-2 mb-3"><AlertTriangle size={14} className="text-amber-400" /> 敏感词检查</h3>
                  <div className="space-y-2">
                    {result.sensitiveWords.map((sw: any, i: number) => (
                      <div key={i} className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <div className="flex items-center gap-2"><AlertTriangle size={12} className="text-amber-400" /><span className="text-sm font-medium">{sw.word}</span></div>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-1">建议：{sw.suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Originality */}
              <div className="glass-card p-5">
                <h3 className="text-sm font-medium flex items-center gap-2 mb-3"><CheckCircle size={14} className="text-emerald-400" /> 原创度评估</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between"><span className="text-sm">原创度</span><span className="text-lg font-bold text-emerald-400">{result.originality}%</span></div>
                  <div className="h-2 rounded-full bg-[var(--color-surface-3)] overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${result.originality}%` }} />
                  </div>
                </div>
              </div>

              {/* Suggestions + Optimize Button */}
              {result.suggestions?.length > 0 && (
                <div className="glass-card p-5">
                  <h3 className="font-semibold mb-3">优化建议</h3>
                  <div className="space-y-2 mb-4">
                    {result.suggestions.map((s: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-[var(--color-surface-2)]">
                        <span className="w-5 h-5 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary-light)] text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                        <span className="text-sm">{s}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleOptimize}
                    disabled={optimizing || !settings.apiKey}
                    className="btn-primary w-full justify-center"
                  >
                    {optimizing ? (
                      <><Loader2 size={16} className="animate-spin" /> DeepSeek 优化中...</>
                    ) : (
                      <><Sparkles size={16} /> 一键优化文章</>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="glass-card p-5 flex flex-col items-center justify-center h-64 text-[var(--color-text-secondary)] gap-3">
              <ShieldCheck size={40} className="opacity-30" />
              <span>粘贴文章 → 点检测</span>
              <span className="text-xs">检测后可用「一键优化」直接改好</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
