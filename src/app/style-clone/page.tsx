'use client';

import { useState } from 'react';
import {
  PenLine,
  Plus,
  Trash2,
  Copy,
  Sparkles,
  Loader2,
  AlertCircle,
  Settings,
  Download,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { useSettings, callAI } from '../../lib/ai';
import { useToast } from '../../components/Toast';
import Link from 'next/link';

export default function StyleClonePage() {
  const { settings, loaded } = useSettings();
  const toast = useToast();
  const [links, setLinks] = useState(['']);
  const [linkStatus, setLinkStatus] = useState<
    Record<number, 'idle' | 'loading' | 'success' | 'error'>
  >({});
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState('');

  const addLink = () => {
    if (links.length < 5) {
      setLinks([...links, '']);
      setLinkStatus({ ...linkStatus, [links.length]: 'idle' });
    }
  };

  const removeLink = (i: number) => {
    if (links.length > 1) {
      const newLinks = links.filter((_, idx) => idx !== i);
      const newStatus: Record<number, typeof linkStatus[number]> = {};
      // Re-index status
      let newIdx = 0;
      for (let oldIdx = 0; oldIdx < links.length; oldIdx++) {
        if (oldIdx !== i) {
          newStatus[newIdx] = linkStatus[oldIdx] || 'idle';
          newIdx++;
        }
      }
      setLinks(newLinks);
      setLinkStatus(newStatus);
    }
  };

  const updateLink = (i: number, v: string) => {
    const updated = [...links];
    updated[i] = v;
    setLinks(updated);
    // Reset status when URL changes
    if (linkStatus[i] && linkStatus[i] !== 'idle') {
      setLinkStatus({ ...linkStatus, [i]: 'idle' });
    }
  };

  // ─── Fetch content from a single link ──────────────────────────────

  const fetchLink = async (i: number) => {
    const link = links[i].trim();
    if (!link) {
      toast.show('请输入链接');
      return;
    }

    // Validate URL format
    try {
      new URL(link);
    } catch {
      toast.show('链接格式不正确');
      setLinkStatus({ ...linkStatus, [i]: 'error' });
      return;
    }

    setLinkStatus({ ...linkStatus, [i]: 'loading' });
    setError('');

    try {
      const res = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: link }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '获取失败');
      }

      // Append fetched content to the content area
      const newContent = content
        ? `${content}\n\n━━━ 来自 ${data.title || link} ━━━\n\n${data.content}`
        : `━━━ ${data.title || '文章'} ━━━\n\n${data.content}`;

      setContent(newContent);
      setLinkStatus({ ...linkStatus, [i]: 'success' });
      toast.show('内容已获取');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '获取失败';
      setLinkStatus({ ...linkStatus, [i]: 'error' });
      // Set a helpful error message
      setError(`${msg}。如需手动操作，可复制文章内容粘贴到下方文本框。`);
    }
  };

  // ─── Analyze ───────────────────────────────────────────────────────

  const analyze = async () => {
    if (!settings.apiKey) {
      setError('请先在设置中心配置 DeepSeek API Key');
      return;
    }

    const validLinks = links.filter((l) => l.trim());
    const hasInput = validLinks.length > 0 || content.trim();
    if (!hasInput) {
      toast.show('请至少输入链接或粘贴文章内容');
      return;
    }

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
          {
            role: 'system',
            content:
              '你是一位资深的公众号内容分析和写作风格复刻专家。输出使用 Markdown 格式。',
          },
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

  // ─── Link status icon ──────────────────────────────────────────────

  const LinkStatusIcon = ({
    status,
  }: {
    status: 'idle' | 'loading' | 'success' | 'error';
  }) => {
    switch (status) {
      case 'loading':
        return <Loader2 size={14} className="animate-spin text-blue-400" />;
      case 'success':
        return <CheckCircle2 size={14} className="text-emerald-400" />;
      case 'error':
        return <XCircle size={14} className="text-rose-400" />;
      default:
        return null;
    }
  };

  // ─── Render ────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <PenLine
              size={22}
              className="text-[var(--color-primary-light)]"
            />
            风格复刻
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            AI 自动抓取文章内容，提取写作风格，生成可复用的专属提示词
          </p>
        </div>
        {!settings.apiKey && loaded && (
          <Link
            href="/settings"
            className="text-xs text-amber-400 hover:underline flex items-center gap-1"
          >
            <AlertCircle size={12} /> 先去配置 API Key
          </Link>
        )}
      </div>

      {/* Usage hint */}
      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm text-blue-300">
        <p className="flex items-start gap-2">
          <Sparkles size={16} className="mt-0.5 flex-shrink-0" />
          <span>
            <strong>推荐操作流：</strong>
            粘贴文章链接 → 点击「抓取」自动获取内容 → 补充或编辑 → 点击「分析风格」。
            如自动抓取不完整，可手动复制粘贴文章全文到下方文本框。
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="font-semibold">文章链接</h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            可添加 1-5 篇，篇数越多分析越精准。支持微信文章和其他网页链接
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
              {/* Fetch button */}
              <button
                onClick={() => fetchLink(i)}
                disabled={linkStatus[i] === 'loading'}
                title="抓取内容"
                className={`p-1.5 rounded-lg transition-colors ${
                  linkStatus[i] === 'loading'
                    ? 'bg-blue-500/20 text-blue-400 cursor-not-allowed'
                    : linkStatus[i] === 'success'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : linkStatus[i] === 'error'
                        ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
                        : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary-light)] hover:bg-[var(--color-primary)]/10'
                }`}
              >
                <LinkStatusIcon status={linkStatus[i] || 'idle'} />
                {(linkStatus[i] || 'idle') === 'idle' && (
                  <Download size={14} />
                )}
              </button>
              {links.length > 1 && (
                <button
                  onClick={() => removeLink(i)}
                  className="text-rose-400 hover:text-rose-300 p-1"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}

          {links.length < 5 && (
            <button
              onClick={addLink}
              className="text-sm text-[var(--color-primary-light)] hover:underline flex items-center gap-1"
            >
              <Plus size={14} /> 添加更多链接（{links.length}/5）
            </button>
          )}

          <div className="space-y-3 pt-2 border-t border-[var(--color-border)]">
            <label className="block">
              <span className="text-sm font-medium flex items-center gap-2">
                文章内容
                <span className="text-xs text-[var(--color-text-secondary)]">
                  （自动抓取的内容会填充到这里，也可以手动粘贴）
                </span>
              </span>
              <textarea
                placeholder="自动抓取的内容会出现在这里，你也可以直接粘贴文章全文..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="input-field mt-1 h-36 resize-none"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">
                目标作者名称（可选）
              </span>
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
              <>
                <Loader2 size={16} className="animate-spin" /> DeepSeek
                分析中...
              </>
            ) : (
              <>
                <Sparkles size={16} /> 开始分析风格
              </>
            )}
          </button>
        </div>

        {/* Result */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">分析结果</h2>
            {result && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(result || '');
                  toast.show('已复制');
                }}
                className="text-xs text-[var(--color-primary-light)] hover:underline flex items-center gap-1"
              >
                <Copy size={12} /> 复制结果
              </button>
            )}
          </div>
          <div className="min-h-[400px] rounded-xl bg-[var(--color-surface-2)] p-4 overflow-y-auto max-h-[500px]">
            {analyzing ? (
              <div className="flex flex-col items-center justify-center h-full text-[var(--color-text-secondary)] gap-3">
                <Loader2
                  size={32}
                  className="animate-spin text-[var(--color-primary-light)]"
                />
                <span>DeepSeek 正在分析文章风格特征...</span>
                <span className="text-xs opacity-60">
                  分析的文章越多，结果越精准
                </span>
              </div>
            ) : result ? (
              <div className="text-sm whitespace-pre-wrap leading-relaxed">
                {result}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-[var(--color-text-secondary)] gap-3">
                <PenLine size={40} className="opacity-30" />
                <span>输入文章链接，点击「抓取」获取内容</span>
                <span className="text-xs">
                  DeepSeek 将提取作者的语言风格、结构偏好和情绪节奏
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
