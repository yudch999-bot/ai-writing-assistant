'use client';

import { useState, useMemo } from 'react';
import { Layout, Smartphone, Copy, Sparkles, Bold, Italic, Heading1, Heading2, Quote, List, ListOrdered, ImageIcon, SeparatorHorizontal } from 'lucide-react';
import { useToast } from '../../components/Toast';

const themes = [
  { id: 'jade', label: '翡翠青', color: 'bg-emerald-500', accent: '#059669', titleColor: '#047857' },
  { id: 'blue', label: '优雅蓝', color: 'bg-blue-500', accent: '#2563eb', titleColor: '#1d4ed8' },
  { id: 'purple', label: '炫彩紫', color: 'bg-purple-500', accent: '#7c3aed', titleColor: '#6d28d9' },
  { id: 'orange', label: '暖阳橙', color: 'bg-orange-500', accent: '#ea580c', titleColor: '#c2410c' },
  { id: 'rose', label: '玫瑰红', color: 'bg-rose-500', accent: '#e11d48', titleColor: '#be123c' },
  { id: 'dark', label: '极客黑', color: 'bg-gray-800', accent: '#6b7280', titleColor: '#374151' },
];

const fontSizes = ['small', 'medium', 'large'] as const;
type FontSize = typeof fontSizes[number];
type Alignment = 'left' | 'center' | 'right';

// Markdown → clean HTML for WeChat editor (line-by-line, no broken nesting)
function mdToHtml(md: string, theme: typeof themes[0], fontSize: FontSize, alignment: Alignment): string {
  const sizeMap: Record<FontSize, string> = { small: '13px', medium: '15px', large: '17px' };
  const baseSize = sizeMap[fontSize];
  const st = (s: string) => `font-size:${s};line-height:1.8`;
  const pSty = `margin:6px 0;${st(baseSize)};text-align:${alignment}`;

  const lines = md.split('\n');
  const out: string[] = [];
  let inUl = false;
  let isFirstParagraph = true;

  const flush = () => {
    if (inUl) { out.push('</ul>'); inUl = false; }
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    // Escape & inline formatting
    const esc = (s: string) => s
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" style="color:${theme.accent};text-decoration:underline">$1</a>`)
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<p style="margin:12px 0;padding:12px;background:#f5f5f5;border-radius:8px;text-align:center;color:#999;font-size:13px">📷 $1</p>');

    const line = esc(raw);

    if (line.startsWith('# ')) { flush(); out.push(`<h1 style="${st('22px')};font-weight:700;margin:24px 0 10px;color:${theme.titleColor}">${line.slice(2)}</h1>`); }
    else if (line.startsWith('## ')) { flush(); out.push(`<h2 style="${st('19px')};font-weight:700;margin:20px 0 8px;color:${theme.titleColor}">${line.slice(3)}</h2>`); }
    else if (line.startsWith('### ')) { flush(); out.push(`<h3 style="${st('17px')};font-weight:700;margin:16px 0 6px;color:${theme.titleColor}">${line.slice(4)}</h3>`); }
    else if (line.startsWith('> ')) { flush(); out.push(`<blockquote style="border-left:3px solid ${theme.accent};padding:8px 12px;margin:10px 0;background:#f8f8f8;border-radius:0 6px 6px 0;color:#555;font-style:italic">${line.slice(2)}</blockquote>`); }
    else if (line.startsWith('---')) { flush(); out.push(`<hr style="border:none;border-top:1px solid #e8e8e8;margin:20px 0">`); }
    else if (line.match(/^[-*+]\s/)) {
      if (!inUl) { out.push('<ul style="padding-left:18px;margin:8px 0">'); inUl = true; }
      out.push(`<li style="margin:3px 0">${line.replace(/^[-*+]\s/, '')}</li>`);
    }
    else if (line.match(/^\d+[\.、]\s/)) {
      if (!inUl) { out.push('<ul style="padding-left:18px;margin:8px 0">'); inUl = true; }
      out.push(`<li style="margin:3px 0">${line.replace(/^\d+[\.、]\s/, '')}</li>`);
    }
    else if (line.trim() === '') { flush(); }
    else {
      flush();
      if (isFirstParagraph && line.trim().length > 0) {
        isFirstParagraph = false;
        const text = line.trim();
        const firstChar = text[0];
        const rest = text.slice(1);
        out.push(`<p style="${pSty}"><span style="float:left;font-size:42px;line-height:1;font-weight:700;margin-right:4px;color:${theme.accent}">${firstChar}</span>${rest}</p>`);
      } else {
        out.push(`<p style="${pSty}">${line}</p>`);
      }
    }
  }
  flush();

  return out.join('\n');
}

export default function FormattingPage() {
  const toast = useToast();
  const [content, setContent] = useState('');
  const [theme, setTheme] = useState(themes[0]);
  const [fontSize, setFontSize] = useState<FontSize>('medium');
  const [alignment, setAlignment] = useState<Alignment>('left');
  const [formatted, setFormatted] = useState(false);

  const previewHtml = useMemo(() => {
    if (!content.trim()) return '';
    const themeObj = themes.find(t => t.id === theme.id) || themes[0];
    return mdToHtml(content, themeObj, fontSize, alignment);
  }, [content, theme, fontSize, alignment]);

  const handleFormat = () => {
    if (!content.trim()) return;
    setFormatted(true);
  };

  const handleCopy = async () => {
    if (!previewHtml) return;
    // Build clean HTML for WeChat editor (no full document wrapper)
    const cleanHtml = `<section style="font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue','PingFang SC','Microsoft YaHei',sans-serif;padding:4px 8px;line-height:1.8;color:#333;max-width:100%">${previewHtml}</section>`;
    // Also build a plain text version
    const plainText = content;
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([cleanHtml], { type: 'text/html' }),
          'text/plain': new Blob([plainText], { type: 'text/plain' }),
        }),
      ]);
      toast.show('排版结果已复制，可直接粘贴到公众号编辑器');
    } catch {
      // Fallback
      await navigator.clipboard.writeText(plainText);
      toast.show('已复制纯文本格式');
    }
  };

  const insertMarkdown = (type: string) => {
    const textarea = document.getElementById('md-input') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    let insert = '';

    switch (type) {
      case 'bold': insert = `**${selected || '加粗文字'}**`; break;
      case 'italic': insert = `*${selected || '斜体文字'}*`; break;
      case 'h1': insert = `\n# ${selected || '一级标题'}\n`; break;
      case 'h2': insert = `\n## ${selected || '二级标题'}\n`; break;
      case 'h3': insert = `\n### ${selected || '三级标题'}\n`; break;
      case 'quote': insert = `\n> ${selected || '引用文字'}\n`; break;
      case 'ul': insert = `\n- ${selected || '列表项'}\n`; break;
      case 'ol': insert = `\n1. ${selected || '列表项'}\n`; break;
      case 'divider': insert = `\n---\n`; break;
      case 'image': insert = `![图片描述](图片链接)`; break;
    }

    const newContent = content.substring(0, start) + insert + content.substring(end);
    setContent(newContent);
    setFormatted(false);

    requestAnimationFrame(() => {
      textarea.focus();
      const pos = start + insert.length;
      textarea.setSelectionRange(pos, pos);
    });
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Layout size={22} className="text-teal-400" />
          公众号排版
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1">使用 Markdown 写作，一键排版为精美微信公众号文章风格，支持复制到公众号编辑器</p>
      </div>

      {/* Theme Selector */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-xs font-medium text-text-secondary w-12">主题</span>
          <div className="flex flex-wrap gap-2 flex-1">
            {themes.map(t => (
              <button
                key={t.id}
                onClick={() => { setTheme(t); setFormatted(false); }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  theme.id === t.id ? 'border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10 text-[var(--color-primary-light)]' : 'border-border bg-surface-2 text-text-secondary hover:text-text'
                }`}
              >
                <span className={`w-3 h-3 rounded-full ${t.color}`} />
                {t.label}
              </button>
            ))}
          </div>
          <span className="text-xs font-medium text-text-secondary w-12">字号</span>
          <div className="flex gap-1">
            {fontSizes.map(s => (
              <button key={s} onClick={() => setFontSize(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  fontSize === s ? 'border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10 text-[var(--color-primary-light)]' : 'border-border bg-surface-2 text-text-secondary'
                }`}
              >{s === 'small' ? '小' : s === 'medium' ? '中' : '大'}</button>
            ))}
          </div>
          <span className="text-xs font-medium text-text-secondary w-12">对齐</span>
          <div className="flex gap-1">
            {(['left', 'center', 'right'] as Alignment[]).map(a => (
              <button key={a} onClick={() => setAlignment(a)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  alignment === a ? 'border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10 text-[var(--color-primary-light)]' : 'border-border bg-surface-2 text-text-secondary'
                }`}
              >{a === 'left' ? '左' : a === 'center' ? '中' : '右'}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 glass-card p-2">
        {[
          { icon: Bold, title: '加粗', action: 'bold' },
          { icon: Italic, title: '斜体', action: 'italic' },
          { type: 'sep' },
          { icon: Heading1, title: '一级标题', action: 'h1' },
          { icon: Heading2, title: '二级标题', action: 'h2' },
          { icon: Heading2, title: '三级标题', action: 'h3' },
          { type: 'sep' },
          { icon: Quote, title: '引用', action: 'quote' },
          { icon: List, title: '无序列表', action: 'ul' },
          { icon: ListOrdered, title: '有序列表', action: 'ol' },
          { type: 'sep' },
          { icon: SeparatorHorizontal, title: '分割线', action: 'divider' },
          { icon: ImageIcon, title: '插入图片', action: 'image' },
        ].map((item, i) =>
          'type' in item && item.type === 'sep' ? (
            <div key={i} className="w-px h-5 bg-border mx-1" />
          ) : (
            <button
              key={i}
              title={'title' in item ? item.title : ''}
              onClick={() => 'action' in item && item.action && insertMarkdown(item.action)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-text-secondary hover:text-text hover:bg-surface-3 transition-all"
            >
              {'icon' in item && item.icon ? <item.icon size={15} /> : null}
            </button>
          )
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Editor */}
        <div className="lg:col-span-3 glass-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">编辑区</h2>
            <span className="text-xs text-text-secondary">{content.length} 字 | {content.split('\n').length} 行</span>
          </div>
          <textarea
            id="md-input"
            placeholder={`# 文章标题\n\n在这里开始写作...\n\n## 小标题\n\n支持 **加粗**、*斜体*、\n> 引用\n\n- 列表项1\n- 列表项2\n\n---\n\n用 Markdown 写，一键排版`}
            value={content}
            onChange={e => { setContent(e.target.value); setFormatted(false); }}
            className="input-field h-[360px] resize-none font-mono text-sm leading-relaxed"
            style={{ lineHeight: '1.7' }}
          />
          <div className="flex gap-2">
            <button
              onClick={handleFormat}
              disabled={!content.trim()}
              className="btn-primary flex-1 justify-center"
            >
              <Sparkles size={16} /> 一键排版
            </button>
            <button
              onClick={handleCopy}
              disabled={!formatted || !previewHtml}
              className="btn-secondary justify-center"
            >
              <Copy size={16} /> 复制
            </button>
          </div>

          {/* Formatting tips */}
          <details className="text-xs text-text-secondary">
            <summary className="cursor-pointer hover:text-text">排版语法提示</summary>
            <div className="mt-2 space-y-1 p-3 rounded-lg bg-surface-2">
              <code className="block"># 标题</code>
              <code className="block">**加粗**</code>
              <code className="block">*斜体*</code>
              <code className="block">&gt; 引用文字</code>
              <code className="block">- 无序列表</code>
              <code className="block">1. 有序列表</code>
              <code className="block">--- 分割线</code>
              <code className="block">![图片描述](图片链接)</code>
              <code className="block">[超链接文字](链接地址)</code>
            </div>
          </details>
        </div>

        {/* Mobile Preview */}
        <div className="lg:col-span-2 glass-card p-5 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4">
            <Smartphone size={14} className="text-text-secondary" />
            <span className="text-xs font-medium text-text-secondary">手机预览</span>
            {formatted && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">已排版</span>}
          </div>
          <div className="w-full max-w-[340px] rounded-[32px] border-4 border-surface-3 bg-white overflow-hidden flex flex-col shadow-xl">
            {/* Phone status bar */}
            <div className="bg-white px-5 pt-5 pb-1 flex items-center justify-between text-[11px] text-gray-400 font-medium">
              <span>9:41</span>
              <div className="flex items-center gap-1.5">
                <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><rect x="0.5" y="0.5" width="15" height="11" rx="2" stroke="currentColor"/><rect x="2" y="2" width="2" height="7.5" rx="0.5" fill="currentColor"/><rect x="4.5" y="2" width="2" height="7.5" rx="0.5" fill="currentColor"/><rect x="7" y="2" width="2" height="7.5" rx="0.5" fill="currentColor"/></svg>
                <span className="text-[10px] font-semibold">5G</span>
                <svg width="22" height="12" viewBox="0 0 22 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="currentColor"/><rect x="2" y="2" width="14" height="8" rx="1.5" fill="currentColor"/><rect x="18" y="3" width="1.5" height="6" rx="0.75" fill="currentColor"/></svg>
              </div>
            </div>
            {/* Article title bar */}
            <div className="bg-white px-4 py-2 border-b border-gray-100">
              <div className="flex items-center gap-2 text-[10px] text-gray-400">
                <span className="w-4 h-4 rounded bg-gray-100 flex items-center justify-center text-[8px]">●</span>
                <span>公众号</span>
                <span>·</span>
                <span>原创</span>
              </div>
            </div>
            {/* Article content */}
            <div className="flex-1 overflow-y-auto px-5 py-3 min-h-[420px] max-h-[480px]"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', sans-serif" }}
            >
              {formatted && previewHtml ? (
                <div
                  className="text-gray-800"
                  style={{ fontSize: fontSize === 'small' ? '13px' : fontSize === 'medium' ? '15px' : '17px' }}
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-300 text-xs gap-3">
                  <Layout size={36} className="opacity-20" />
                  <span>在左侧编辑区写内容</span>
                  <span>点击「一键排版」预览效果</span>
                  <div className="mt-4 p-3 rounded-lg bg-gray-50 text-gray-400 text-[10px] leading-relaxed max-w-[220px]">
                    支持 Markdown 语法<br />
                    # 标题 · **加粗** · *斜体*<br />
                    &gt; 引用 · - 列表 · --- 分割线
                  </div>
                </div>
              )}
            </div>
            {/* Bottom meta */}
            {formatted && (
              <div className="bg-white px-5 py-3 border-t border-gray-100 text-[10px] text-gray-400 flex items-center justify-between">
                <span>阅读 10万+</span>
                <span>赞 128</span>
                <span>在看 56</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
