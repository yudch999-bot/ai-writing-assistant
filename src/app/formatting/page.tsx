'use client';

import { useState, useMemo } from 'react';
import { Layout, Smartphone, Copy, Sparkles, Bold, Italic, Heading1, Heading2, Heading3, Quote, List, ListOrdered, ImageIcon, SeparatorHorizontal, ChevronDown, ChevronUp, RotateCcw, Lightbulb, Bookmark, Star, Columns3, MessagesSquare, Target } from 'lucide-react';
import { useToast } from '../../components/Toast';

// ── Template Definitions ──

interface ThemeColors {
  primary: string;
  title: string;
  text: string;
  bg: string;
  accent: string;
}

interface ThemeTypography {
  titleSize: string;
  bodySize: string;
  lineHeight: number;
  spacing: string;
}

interface Theme {
  id: string;
  label: string;
  category: string;
  desc: string;
  color: string;
  colors: ThemeColors;
  typography: ThemeTypography;
}

const themes: Theme[] = [
  // 🔥 热门推荐
  { id: 'minimal-white', label: '极简白', category: '热门推荐', desc: '干净清爽，阅读感最佳', color: 'bg-gray-100',
    colors: { primary: '#1a1a2e', title: '#1a1a2e', text: '#333333', bg: '#ffffff', accent: '#e8e8e8' },
    typography: { titleSize: '22px', bodySize: '15px', lineHeight: 1.8, spacing: '16px' } },
  { id: 'warm-beige', label: '温暖米灰', category: '热门推荐', desc: '柔和护眼，百搭不出错', color: 'bg-amber-100',
    colors: { primary: '#c4956a', title: '#8b6914', text: '#4a4a4a', bg: '#faf8f5', accent: '#e8ddd0' },
    typography: { titleSize: '21px', bodySize: '15px', lineHeight: 1.8, spacing: '16px' } },
  { id: 'green-literary', label: '墨绿文艺', category: '热门推荐', desc: '沉静有质感，适合深度文', color: 'bg-emerald-700',
    colors: { primary: '#2d6a4f', title: '#1b4332', text: '#2d3748', bg: '#f0f7f4', accent: '#95d5b2' },
    typography: { titleSize: '22px', bodySize: '15px', lineHeight: 1.9, spacing: '18px' } },

  // 🎨 简约风
  { id: 'clear-water', label: '清水', category: '简约风', desc: '通透简约，留白之美', color: 'bg-sky-100',
    colors: { primary: '#0284c7', title: '#0369a1', text: '#334155', bg: '#f8fafc', accent: '#bae6fd' },
    typography: { titleSize: '20px', bodySize: '14px', lineHeight: 1.8, spacing: '14px' } },
  { id: 'plain-note', label: '素笺', category: '简约风', desc: '仿纸质书的阅读体验', color: 'bg-stone-200',
    colors: { primary: '#57534e', title: '#44403c', text: '#292524', bg: '#fafaf9', accent: '#d6d3d1' },
    typography: { titleSize: '21px', bodySize: '15px', lineHeight: 1.85, spacing: '16px' } },
  { id: 'blank-space', label: '留白', category: '简约风', desc: '极致的留白与呼吸感', color: 'bg-white',
    colors: { primary: '#0f172a', title: '#0f172a', text: '#334155', bg: '#ffffff', accent: '#e2e8f0' },
    typography: { titleSize: '24px', bodySize: '16px', lineHeight: 2.0, spacing: '20px' } },

  // 📰 杂志风
  { id: 'cover-story', label: '封面头条', category: '杂志风', desc: '大标题冲击力，杂志感', color: 'bg-red-900',
    colors: { primary: '#991b1b', title: '#7f1d1d', text: '#1f2937', bg: '#fef2f2', accent: '#fecaca' },
    typography: { titleSize: '28px', bodySize: '15px', lineHeight: 1.7, spacing: '18px' } },
  { id: 'dual-column', label: '双栏', category: '杂志风', desc: '图文双栏，信息密度高', color: 'bg-indigo-100',
    colors: { primary: '#4338ca', title: '#3730a3', text: '#1e293b', bg: '#f8faff', accent: '#c7d2fe' },
    typography: { titleSize: '22px', bodySize: '14px', lineHeight: 1.7, spacing: '14px' } },
  { id: 'feature-story', label: '图文混排', category: '杂志风', desc: '图片与文字交错，视觉丰富', color: 'bg-rose-200',
    colors: { primary: '#be185d', title: '#9d174d', text: '#374151', bg: '#fff5f8', accent: '#fbcfe8' },
    typography: { titleSize: '23px', bodySize: '15px', lineHeight: 1.8, spacing: '16px' } },

  // ✨ 文艺风
  { id: 'journal', label: '手账', category: '文艺风', desc: '温暖手写感，像在看日记', color: 'bg-amber-50',
    colors: { primary: '#b45309', title: '#92400e', text: '#57534e', bg: '#fffbeb', accent: '#fde68a' },
    typography: { titleSize: '20px', bodySize: '14px', lineHeight: 1.9, spacing: '14px' } },
  { id: 'film', label: '胶片', category: '文艺风', desc: '复古胶片色调，故事感强', color: 'bg-stone-700',
    colors: { primary: '#78716c', title: '#44403c', text: '#292524', bg: '#faf7f2', accent: '#a8a29e' },
    typography: { titleSize: '21px', bodySize: '15px', lineHeight: 1.85, spacing: '16px' } },
  { id: 'poem', label: '诗篇', category: '文艺风', desc: '诗意的排版，字里行间有韵律', color: 'bg-purple-100',
    colors: { primary: '#7c3aed', title: '#6d28d9', text: '#4c1d95', bg: '#faf5ff', accent: '#ddd6fe' },
    typography: { titleSize: '22px', bodySize: '15px', lineHeight: 2.0, spacing: '18px' } },

  // 💼 商务风
  { id: 'report', label: '报告', category: '商务风', desc: '严肃专业，数据呈现清晰', color: 'bg-blue-800',
    colors: { primary: '#1d4ed8', title: '#1e3a5f', text: '#1e293b', bg: '#f8fafc', accent: '#bfdbfe' },
    typography: { titleSize: '20px', bodySize: '14px', lineHeight: 1.7, spacing: '14px' } },
  { id: 'newsletter', label: '新闻简报', category: '商务风', desc: '简报风格，简洁有力', color: 'bg-gray-800',
    colors: { primary: '#4b5563', title: '#111827', text: '#374151', bg: '#f9fafb', accent: '#d1d5db' },
    typography: { titleSize: '22px', bodySize: '15px', lineHeight: 1.75, spacing: '16px' } },
  { id: 'opinion', label: '观点文', category: '商务风', desc: '观点鲜明，论证有力度', color: 'bg-amber-800',
    colors: { primary: '#d97706', title: '#92400e', text: '#1c1917', bg: '#fffcf0', accent: '#fde68a' },
    typography: { titleSize: '23px', bodySize: '15px', lineHeight: 1.8, spacing: '16px' } },

  // 🎉 活泼风
  { id: 'candy', label: '糖果', category: '活泼风', desc: '明亮甜美的渐变色', color: 'bg-pink-400',
    colors: { primary: '#ec4899', title: '#be185d', text: '#831843', bg: '#fdf2f8', accent: '#fbcfe8' },
    typography: { titleSize: '21px', bodySize: '14px', lineHeight: 1.8, spacing: '14px' } },
  { id: 'gradient', label: '渐变', category: '活泼风', desc: '时尚渐变，年轻有活力', color: 'bg-gradient-to-r from-purple-400 to-pink-400',
    colors: { primary: '#8b5cf6', title: '#6d28d9', text: '#4c1d95', bg: '#f5f3ff', accent: '#c4b5fd' },
    typography: { titleSize: '22px', bodySize: '15px', lineHeight: 1.8, spacing: '16px' } },
  { id: 'cards', label: '卡片', category: '活泼风', desc: '卡片式布局，模块感强', color: 'bg-teal-400',
    colors: { primary: '#0d9488', title: '#115e59', text: '#134e4a', bg: '#f0fdfa', accent: '#99f6e4' },
    typography: { titleSize: '20px', bodySize: '14px', lineHeight: 1.75, spacing: '14px' } },
];

const categories = ['热门推荐', '简约风', '杂志风', '文艺风', '商务风', '活泼风'];

const fontSizes = ['small', 'medium', 'large'] as const;
type FontSize = typeof fontSizes[number];
type Alignment = 'left' | 'center' | 'right';

const presetColors = [
  '#c4956a', '#0284c7', '#7c3aed', '#ec4899',
  '#0d9488', '#d97706', '#dc2626', '#4b5563',
];

// ── Component definitions for toolbar ──
interface ComponentDef {
  icon: any;
  label: string;
  syntax: string;
  placeholder: string;
}

const components: ComponentDef[] = [
  { icon: Lightbulb, label: '提示框', syntax: ':::tip\n在这里写提示内容\n:::', placeholder: '提示内容' },
  { icon: Bookmark, label: '引用卡片', syntax: ':::card\n在这里写引用内容\n:::', placeholder: '引用内容' },
  { icon: Star, label: '金句', syntax: ':::quote\n在这里写金句\n:::', placeholder: '金句内容' },
  { icon: Columns3, label: '对比', syntax: ':::compare\n**左边**：内容A\n**右边**：内容B\n:::', placeholder: '对比内容' },
  { icon: MessagesSquare, label: 'Q&A', syntax: ':::qa\n**Q**：问题\n**A**：答案\n:::', placeholder: '问答内容' },
  { icon: Target, label: '要点', syntax: ':::point\n- 要点1\n- 要点2\n- 要点3\n:::', placeholder: '要点内容' },
];

// ── Markdown → HTML ──

function mdToHtml(md: string, theme: Theme, fontSize: FontSize, alignment: Alignment): string {
  const sizeMap: Record<FontSize, string> = { small: '13px', medium: '15px', large: '17px' };
  const baseSize = sizeMap[fontSize];
  const { colors, typography } = theme;
  const st = (s: string) => `font-size:${s};line-height:${typography.lineHeight}`;
  const pSty = `margin:${typography.spacing} 0;${st(baseSize)};text-align:${alignment}`;

  const lines = md.split('\n');
  const out: string[] = [];
  let inBlock = false;
  let blockType = '';
  let blockLines: string[] = [];
  let isFirstParagraph = true;

  const flushBlock = () => {
    if (!inBlock || !blockType) return;
    const content = blockLines.join('\n');
    const bg = colors.bg === '#ffffff' ? '#f8f8f8' : colors.bg;

    switch (blockType) {
      case 'tip':
        out.push(`<div style="margin:${typography.spacing} 0;padding:14px 16px;border-radius:10px;background:${colors.accent}22;border-left:4px solid ${colors.primary};${st(baseSize)}"><span style="font-weight:600;color:${colors.primary}">💡 提示：</span> ${escapeHtml(content)}</div>`);
        break;
      case 'card':
        out.push(`<div style="margin:${typography.spacing} 0;padding:16px 18px;border-radius:12px;background:${bg};border:1px solid ${colors.accent};box-shadow:0 2px 8px rgba(0,0,0,0.06);${st(baseSize)}">${escapeHtml(content)}</div>`);
        break;
      case 'quote':
        out.push(`<div style="margin:${typography.spacing} 0;padding:14px 18px;border-radius:8px;background:${colors.accent}15;border-left:4px solid ${colors.primary};text-align:center"><span style="font-size:1.3em;font-weight:700;color:${colors.primary};line-height:1.6">“${escapeHtml(content)}”</span></div>`);
        break;
      case 'compare':
        const parts = content.split('**右边**：');
        const left = parts[0].replace('**左边**：', '').trim();
        const right = parts.length > 1 ? parts[1].trim() : '';
        out.push(`<div style="display:flex;gap:12px;margin:${typography.spacing} 0;"><div style="flex:1;padding:12px;border-radius:10px;background:${colors.accent}20;border:1px solid ${colors.accent}40">${escapeHtml(left)}</div><div style="flex:1;padding:12px;border-radius:10px;background:${colors.primary}15;border:1px solid ${colors.primary}30">${escapeHtml(right)}</div></div>`);
        break;
      case 'qa':
        const qaLines = content.split('\n');
        const qaHtml = qaLines.map(l => {
          if (l.startsWith('**Q**')) return `<p style="margin:4px 0"><strong style="color:${colors.primary}">❓ Q：</strong>${l.replace('**Q**：', '').replace('**Q**', '')}</p>`;
          if (l.startsWith('**A**')) return `<p style="margin:4px 0 8px 16px"><strong style="color:${colors.title}">💬 A：</strong>${l.replace('**A**：', '').replace('**A**', '')}</p>`;
          return `<p style="margin:2px 0">${l}</p>`;
        }).join('');
        out.push(`<div style="margin:${typography.spacing} 0;padding:14px 16px;border-radius:10px;background:${bg};border:1px solid ${colors.accent}">${qaHtml}</div>`);
        break;
      case 'point':
        const pointItems = content.split('\n').filter(l => l.trim().startsWith('- ')).map(l => l.trim().slice(2));
        const pointHtml = pointItems.map((item, i) =>
          `<li style="margin:6px 0;padding-left:8px;list-style:none"><span style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;background:${colors.primary};color:white;font-size:11px;font-weight:700;margin-right:8px;flex-shrink:0">${i + 1}</span>${item}</li>`
        ).join('');
        out.push(`<div style="margin:${typography.spacing} 0;padding:12px 16px;border-radius:10px;background:${colors.accent}12"><ul style="padding-left:0;margin:0">${pointHtml}</ul></div>`);
        break;
    }
    blockType = '';
    blockLines = [];
    inBlock = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();

    // Check for block start/end
    if (trimmed.startsWith(':::')) {
      const tag = trimmed.replace(':::', '').trim();
      if (!inBlock && components.some(c => c.syntax.startsWith(`:::${tag}`))) {
        flushBlock();
        inBlock = true;
        blockType = tag;
        blockLines = [];
        continue;
      } else if (inBlock && trimmed === ':::') {
        flushBlock();
        continue;
      }
    }

    if (inBlock) {
      blockLines.push(raw);
      continue;
    }

    // Normal markdown line processing
    const esc = (s: string) => escapeHtml(s)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" style="color:${colors.primary};text-decoration:underline">$1</a>`)
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, `<p style="margin:12px 0;padding:12px;background:${colors.accent}20;border-radius:8px;text-align:center;color:#999;font-size:13px">📷 $1</p>`);

    const line = esc(raw);

    if (line.startsWith('# ')) {
      out.push(`<h1 style="${st(typography.titleSize)};font-weight:700;margin:28px 0 10px;color:${colors.title}">${line.slice(2)}</h1>`);
    } else if (line.startsWith('## ')) {
      out.push(`<h2 style="${st('19px')};font-weight:700;margin:22px 0 8px;color:${colors.title}">${line.slice(3)}</h2>`);
    } else if (line.startsWith('### ')) {
      out.push(`<h3 style="${st('17px')};font-weight:700;margin:18px 0 6px;color:${colors.title}">${line.slice(4)}</h3>`);
    } else if (line.startsWith('> ')) {
      out.push(`<blockquote style="border-left:3px solid ${colors.primary};padding:8px 14px;margin:10px 0;background:${colors.accent}18;border-radius:0 8px 8px 0;color:#555;font-style:italic">${line.slice(2)}</blockquote>`);
    } else if (line.startsWith('---')) {
      out.push(`<hr style="border:none;border-top:1px solid ${colors.accent};margin:24px 0">`);
    } else if (line.match(/^[-*+]\s/)) {
      out.push(`<li style="margin:4px 0">${line.replace(/^[-*+]\s/, '')}</li>`);
    } else if (line.match(/^\d+[\.、]\s/)) {
      out.push(`<li style="margin:4px 0">${line.replace(/^\d+[\.、]\s/, '')}</li>`);
    } else if (line.trim() === '') {
      // blank line - nothing
    } else {
      if (isFirstParagraph && line.trim().length > 0) {
        isFirstParagraph = false;
        const text = line.trim();
        const firstChar = text[0];
        const rest = text.slice(1);
        out.push(`<p style="${pSty}"><span style="float:left;font-size:42px;line-height:1;font-weight:700;margin-right:4px;color:${colors.primary}">${firstChar}</span>${rest}</p>`);
      } else {
        out.push(`<p style="${pSty}">${line}</p>`);
      }
    }
  }
  flushBlock();

  return out.join('\n');
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── Component ──

export default function FormattingPage() {
  const toast = useToast();
  const [content, setContent] = useState('');
  const [themeId, setThemeId] = useState('warm-beige');
  const [category, setCategory] = useState('热门推荐');
  const [fontSize, setFontSize] = useState<FontSize>('medium');
  const [alignment, setAlignment] = useState<Alignment>('left');
  const [formatted, setFormatted] = useState(false);
  const [showStylePanel, setShowStylePanel] = useState(false);

  // Custom style overrides
  const [customColors, setCustomColors] = useState<Partial<ThemeColors>>({});
  const [customLineHeight, setCustomLineHeight] = useState<number | null>(null);
  const [customSpacing, setCustomSpacing] = useState<string | null>(null);

  const theme = themes.find(t => t.id === themeId) || themes[0];
  const filteredThemes = themes.filter(t => t.category === category);

  const mergedColors: ThemeColors = { ...theme.colors, ...customColors };
  const mergedLineHeight = customLineHeight || theme.typography.lineHeight;
  const mergedSpacing = customSpacing || theme.typography.spacing;

  const previewHtml = useMemo(() => {
    if (!content.trim()) return '';
    const mergedTheme = {
      ...theme,
      colors: mergedColors,
      typography: { ...theme.typography, lineHeight: mergedLineHeight, spacing: mergedSpacing },
    };
    return mdToHtml(content, mergedTheme, fontSize, alignment);
  }, [content, theme, mergedColors, mergedLineHeight, mergedSpacing, fontSize, alignment]);

  const handleFormat = () => {
    if (!content.trim()) return;
    setFormatted(true);
  };

  const handleCopy = async () => {
    if (!previewHtml) return;
    const cleanHtml = `<section style="font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue','PingFang SC','Microsoft YaHei',sans-serif;padding:4px 8px;line-height:1.8;color:#333;max-width:100%">${previewHtml}</section>`;
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

    // Handle component insertion
    const comp = components.find(c => c.label === type);
    if (comp) {
      insert = `\n${comp.syntax}\n`;
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

  const resetCustom = () => {
    setCustomColors({});
    setCustomLineHeight(null);
    setCustomSpacing(null);
    toast.show('已重置为模板默认');
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Layout size={22} className="text-teal-400" />
          公众号排版
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1">15 套精品模板 · 样式微调 · 排版组件 · 一键复制到公众号编辑器</p>
      </div>

      {/* ── Template Selector ── */}
      <div className="glass-card p-5 space-y-4">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                category === cat
                  ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary-light)] border border-[var(--color-primary)]/30'
                  : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:text-text'
              }`}
            >{cat}</button>
          ))}
        </div>

        {/* Template grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {filteredThemes.map(t => {
            const active = themeId === t.id;
            return (
              <button key={t.id} onClick={() => { setThemeId(t.id); setFormatted(false); resetCustom(); }}
                className={`p-3 rounded-xl text-left transition-all border ${
                  active
                    ? 'border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10 ring-1 ring-[var(--color-primary)]/30'
                    : 'border-[var(--color-border)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)]'
                }`}
              >
                <div className={`w-full h-8 rounded-lg mb-2 ${t.color}`} style={t.id === 'gradient' ? { background: 'linear-gradient(135deg, #a78bfa, #f472b6)' } : { background: t.color.includes('bg-') ? undefined : t.color }} />
                <p className="text-xs font-medium truncate">{t.label}</p>
                <p className="text-[9px] text-[var(--color-text-secondary)] truncate">{t.desc}</p>
              </button>
            );
          })}
        </div>

        {/* ── Style Adjustment Panel ── */}
        <div className="border-t border-[var(--color-border)] pt-3">
          <button onClick={() => setShowStylePanel(!showStylePanel)}
            className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] hover:text-text transition-all"
          >
            {showStylePanel ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            样式微调 {showStylePanel ? '收起' : '展开'}
          </button>

          {showStylePanel && (
            <div className="mt-3 p-4 rounded-xl bg-[var(--color-surface-2)] space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Colors */}
                {(['primary', 'title', 'bg'] as const).map(key => (
                  <div key={key}>
                    <label className="text-[10px] text-[var(--color-text-secondary)] block mb-1">
                      {key === 'primary' ? '主色' : key === 'title' ? '标题色' : '背景色'}
                    </label>
                    <div className="flex gap-1">
                      {presetColors.map(c => (
                        <button key={c} onClick={() => setCustomColors(prev => ({ ...prev, [key]: c }))}
                          className={`w-5 h-5 rounded-full border-2 transition-all ${(customColors[key] || mergedColors[key]) === c ? 'border-white ring-2 ring-black/20' : 'border-transparent'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Spacing controls */}
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="text-[10px] text-[var(--color-text-secondary)] block mb-1">行距</label>
                  <div className="flex gap-1">
                    {[1.6, 1.8, 2.0, 2.2].map(v => (
                      <button key={v} onClick={() => setCustomLineHeight(v)}
                        className={`px-2.5 py-1 text-xs rounded-lg transition-all ${
                          mergedLineHeight === v
                            ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary-light)] border border-[var(--color-primary)]/30'
                            : 'bg-[var(--color-surface-3)] text-[var(--color-text-secondary)] border border-[var(--color-border)]'
                        }`}
                      >{v}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-[var(--color-text-secondary)] block mb-1">段间距</label>
                  <div className="flex gap-1">
                    {['12px', '16px', '20px', '24px'].map(v => (
                      <button key={v} onClick={() => setCustomSpacing(v)}
                        className={`px-2.5 py-1 text-xs rounded-lg transition-all ${
                          mergedSpacing === v
                            ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary-light)] border border-[var(--color-primary)]/30'
                            : 'bg-[var(--color-surface-3)] text-[var(--color-text-secondary)] border border-[var(--color-border)]'
                        }`}
                      >{v}</button>
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={resetCustom} className="text-xs text-[var(--color-text-secondary)] hover:text-text flex items-center gap-1">
                <RotateCcw size={11} /> 重置为模板默认
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="space-y-1">
        {/* Formatting toolbar */}
        <div className="flex flex-wrap items-center gap-1 glass-card p-2">
          {[
            { icon: Bold, title: '加粗', action: 'bold' },
            { icon: Italic, title: '斜体', action: 'italic' },
            { type: 'sep' },
            { icon: Heading1, title: '一级标题', action: 'h1' },
            { icon: Heading2, title: '二级标题', action: 'h2' },
            { icon: Heading3, title: '三级标题', action: 'h3' },
            { type: 'sep' },
            { icon: Quote, title: '引用', action: 'quote' },
            { icon: List, title: '无序列表', action: 'ul' },
            { icon: ListOrdered, title: '有序列表', action: 'ol' },
            { type: 'sep' },
            { icon: SeparatorHorizontal, title: '分割线', action: 'divider' },
            { icon: ImageIcon, title: '插入图片', action: 'image' },
          ].map((item, i) =>
            'type' in item && item.type === 'sep' ? (
              <div key={i} className="w-px h-5 bg-[var(--color-border)] mx-1" />
            ) : (
              <button key={i} title={'title' in item ? item.title : ''}
                onClick={() => 'action' in item && item.action && insertMarkdown(item.action)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:text-text hover:bg-[var(--color-surface-3)] transition-all"
              >{'icon' in item && item.icon ? <item.icon size={15} /> : null}</button>
            )
          )}
        </div>

        {/* Component toolbar */}
        <div className="flex flex-wrap items-center gap-1 glass-card p-2">
          <span className="text-[10px] text-[var(--color-text-secondary)] px-1 font-medium">排版组件</span>
          {components.map((comp, i) => (
            <button key={i} title={comp.label}
              onClick={() => insertMarkdown(comp.label)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-[var(--color-text-secondary)] hover:text-text hover:bg-[var(--color-surface-3)] transition-all border border-transparent hover:border-[var(--color-border)]"
            >
              <comp.icon size={12} /> {comp.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Editor + Preview ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Editor */}
        <div className="lg:col-span-3 glass-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">编辑区</h2>
            <span className="text-xs text-[var(--color-text-secondary)]">{content.length} 字 | {content.split('\n').length} 行</span>
          </div>
          <textarea
            id="md-input"
            placeholder={`# 文章标题\n\n在这里开始写作...\n\n## 小标题\n\n支持 **加粗**、*斜体*、\n> 引用\n\n- 列表项1\n- 列表项2\n\n:::tip\n提示框内容\n:::\n\n---\n\n用 Markdown 写，一键排版`}
            value={content}
            onChange={e => { setContent(e.target.value); setFormatted(false); }}
            className="input-field h-[360px] resize-none font-mono text-sm leading-relaxed"
            style={{ lineHeight: '1.7' }}
          />
          <div className="flex gap-2">
            <button onClick={handleFormat} disabled={!content.trim()} className="btn-primary flex-1 justify-center">
              <Sparkles size={16} /> 一键排版
            </button>
            <button onClick={handleCopy} disabled={!formatted || !previewHtml} className="btn-secondary justify-center">
              <Copy size={16} /> 复制
            </button>
          </div>

          <details className="text-xs text-[var(--color-text-secondary)]">
            <summary className="cursor-pointer hover:text-text">排版语法提示</summary>
            <div className="mt-2 space-y-1 p-3 rounded-lg bg-[var(--color-surface-2)]">
              <code className="block"># 标题</code>
              <code className="block">**加粗** · *斜体*</code>
              <code className="block">&gt; 引用文字</code>
              <code className="block">- 无序列表 · 1. 有序列表</code>
              <code className="block">--- 分割线</code>
              <code className="block">:::tip 提示框 :::</code>
              <code className="block">:::card 引用卡片 :::</code>
              <code className="block">:::quote 金句 :::</code>
              <code className="block">:::compare 对比 :::</code>
              <code className="block">:::qa Q&A :::</code>
              <code className="block">:::point 要点 :::</code>
              <code className="block">[链接文字](链接地址) · ![图片描述](图片链接)</code>
            </div>
          </details>
        </div>

        {/* Mobile Preview */}
        <div className="lg:col-span-2 glass-card p-5 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4">
            <Smartphone size={14} className="text-[var(--color-text-secondary)]" />
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">手机预览</span>
            {formatted && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">已排版</span>}
          </div>
          <div className="w-full max-w-[340px] rounded-[32px] border-4 border-[var(--color-surface-3)] overflow-hidden flex flex-col shadow-xl"
            style={{ backgroundColor: mergedColors.bg }}
          >
            {/* Phone status bar */}
            <div className="px-5 pt-5 pb-1 flex items-center justify-between text-[11px] text-gray-400 font-medium"
              style={{ backgroundColor: mergedColors.bg }}
            >
              <span>9:41</span>
              <div className="flex items-center gap-1.5">
                <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><rect x="0.5" y="0.5" width="15" height="11" rx="2" stroke="currentColor"/><rect x="2" y="2" width="2" height="7.5" rx="0.5" fill="currentColor"/><rect x="4.5" y="2" width="2" height="7.5" rx="0.5" fill="currentColor"/><rect x="7" y="2" width="2" height="7.5" rx="0.5" fill="currentColor"/></svg>
                <span className="text-[10px] font-semibold">5G</span>
                <svg width="22" height="12" viewBox="0 0 22 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="currentColor"/><rect x="2" y="2" width="14" height="8" rx="1.5" fill="currentColor"/><rect x="18" y="3" width="1.5" height="6" rx="0.75" fill="currentColor"/></svg>
              </div>
            </div>
            {/* Article title bar */}
            <div className="px-4 py-2 border-b border-gray-100" style={{ backgroundColor: mergedColors.bg, borderColor: `${mergedColors.accent}60` }}>
              <div className="flex items-center gap-2 text-[10px]" style={{ color: mergedColors.text + '99' }}>
                <span className="w-4 h-4 rounded flex items-center justify-center text-[8px]" style={{ backgroundColor: mergedColors.accent }}>●</span>
                <span>公众号</span>
                <span>·</span>
                <span>原创</span>
              </div>
            </div>
            {/* Article content */}
            <div className="flex-1 overflow-y-auto px-5 py-3 min-h-[420px] max-h-[480px]"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', sans-serif", backgroundColor: mergedColors.bg }}
            >
              {formatted && previewHtml ? (
                <div style={{ fontSize: fontSize === 'small' ? '13px' : fontSize === 'medium' ? '15px' : '17px', color: mergedColors.text }}
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: mergedColors.text + '60' }}>
                  <Layout size={36} className="opacity-20" />
                  <span className="text-xs">在左侧编辑区写内容</span>
                  <span className="text-xs">点击「一键排版」预览效果</span>
                </div>
              )}
            </div>
            {/* Bottom meta */}
            {formatted && (
              <div className="px-5 py-3 border-t flex items-center justify-between text-[10px]"
                style={{ backgroundColor: mergedColors.bg, borderColor: `${mergedColors.accent}60`, color: mergedColors.text + '99' }}
              >
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
