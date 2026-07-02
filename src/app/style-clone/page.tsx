'use client';

import { useState } from 'react';
import { PenLine, Plus, Trash2, Copy, Sparkles, Loader2, AlertCircle, Settings } from 'lucide-react';
import { useSettings, callAI } from '../../lib/ai';
import { useToast } from '../../components/Toast';
import Link from 'next/link';

export default function StyleClonePage() {
  const { settings, loaded } = useSettings();
  const toast = useToast();
  const [links, setLinks] = useState(['']);
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState('');

  const addLink = () => {
    if (links.length < 5) setLinks([...links, '']);
  };

  const removeLink = (i: number) => {
    if (links.length > 1) setLinks(links.filter((_, idx) => idx !== i));
  };

  const updateLink = (i: number, v: string) => {
    const updated = [...links];
    updated[i] = v;
    setLinks(updated);
  };

  const analyze = async () => {
    if (!settings.apiKey) {
      setError('请先在设置中心配置 DeepSeek API Key');
      return;
    }

    const validLinks = links.filter(l => l.trim());
    const hasInput = validLinks.length > 0 || content.trim();
    if (!hasInput) return;

    setAnalyzing(true);
    setError('');
    setResult(null);

    try {
      const prompt = `你是一位专业的公众号文章风格分析专家。请分析以下文章内容，提取作者的写作风格特征。

${validLinks.length > 0 ? `文章链接：${validLinks.join('\n')}` : ''}
${content.trim() ? `文章内容：\n${content.slice(0, 2000)}` : ''}
${authorName.trim() ? `目标作者：${authorName}` : ''}

请输出以下格式的分析报告：

## 语言风格特征
列出句式结构、词汇偏好、情绪节奏等特征

## 专属提示词
生成一段可直接用于 AI 写作的提示词，包含：
1. 开头方式
2. 主体结构
3. 语气要求
4. 结尾风格

## 推荐选题方向
推荐 3 个适合该作者风格的选题方向`;

      const res = await callAI(
        [
          { role: 'system', content: '你是一位资深的公众号内容分析和写作风格复刻专家。输出使用 Markdown 格式。' },
          { role: 'user', content: prompt },
        ],
        settings.apiKey,
        settings.model,
      );

      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '分析失败，请重试');
    }
    setAnalyzing(false);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <PenLine size={22} className="text-[var(--color-primary-light)]" />
            风格复刻
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            输入 1-5 篇公众号文章，AI 自动提取作者的写作风格，生成可复用的专属提示词
          </p>
        </div>
        {!settings.apiKey && loaded && (
          <Link href="/settings" className="text-xs text-amber-400 hover:underline flex items-center gap-1">
            <AlertCircle size={12} /> 先去配置 API Key
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="font-semibold">文章链接</h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            可添加 1-5 篇，篇数越多分析越精准
          </p>

          {links.map((link, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary-light)] text-xs flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              <input
                type="url"
                placeholder="粘贴公众号文章链接..."
                value={link}
                onChange={(e) => updateLink(i, e.target.value)}
                className="input-field flex-1"
              />
              {links.length > 1 && (
                <button onClick={() => removeLink(i)} className="text-rose-400 hover:text-rose-300 p-1">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}

          {links.length < 5 && (
            <button onClick={addLink} className="text-sm text-[var(--color-primary-light)] hover:underline flex items-center gap-1">
              <Plus size={14} /> 添加更多链接（{links.length}/5）
            </button>
          )}

          <div className="space-y-3 pt-2">
            <label className="block">
              <span className="text-sm font-medium">粘贴文章内容 <span className="text-xs text-amber-400">（推荐，链接需要手动粘贴内容）</span></span>
              <textarea
                placeholder="直接粘贴完整的文章内容进行分析..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="input-field mt-1 h-24 resize-none"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">目标作者名称（可选）</span>
              <input
                type="text"
                placeholder="作者名或公众号名"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="input-field mt-1"
              />
            </label>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400">
              {error}
            </div>
          )}

          <button
            onClick={analyze}
            disabled={analyzing || !settings.apiKey}
            className="btn-primary w-full justify-center"
          >
            {analyzing ? (
              <><Loader2 size={16} className="animate-spin" /> DeepSeek 分析中...</>
            ) : (
              <><Sparkles size={16} /> 开始分析风格</>
            )}
          </button>
        </div>

        {/* Result */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">分析结果</h2>
            {result && (
              <button
                onClick={() => { navigator.clipboard.writeText(result || ''); toast.show('已复制'); }}
                className="text-xs text-[var(--color-primary-light)] hover:underline flex items-center gap-1"
              >
                <Copy size={12} /> 复制结果
              </button>
            )}
          </div>
          <div className="min-h-[400px] rounded-xl bg-[var(--color-surface-2)] p-4 overflow-y-auto max-h-[500px]">
            {analyzing ? (
              <div className="flex flex-col items-center justify-center h-full text-[var(--color-text-secondary)] gap-3">
                <Loader2 size={32} className="animate-spin text-[var(--color-primary-light)]" />
                <span>DeepSeek 正在分析文章风格特征...</span>
                <span className="text-xs opacity-60">分析的文章越多，结果越精准</span>
              </div>
            ) : result ? (
              <div className="text-sm whitespace-pre-wrap leading-relaxed">{result}</div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-[var(--color-text-secondary)] gap-3">
                <PenLine size={40} className="opacity-30" />
                <span>输入文章链接，点击分析</span>
                <span className="text-xs">DeepSeek 将提取作者的语言风格、结构偏好和情绪节奏</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
