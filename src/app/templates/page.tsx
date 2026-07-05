'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Copy, Sparkles, X, Save, Loader2, Bookmark } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { usePersistentStorage } from '../../lib/usePersistentStorage';
import { useRouter } from 'next/navigation';

interface ArticleTemplate {
  id: string;
  name: string;
  description: string;
  structure: string;
  category: string;
  createdAt: string;
  usedCount: number;
}

const STORAGE_KEY = 'mobi-article-templates';
const defaultCategories = ['爆款文', '干货教程', '情感共鸣', '营销种草', '热点评论', '其他'];

const defaultTemplates: ArticleTemplate[] = [
  {
    id: '1',
    name: '公众号爆款文模板',
    description: '标准的 10w+ 爆款文章结构',
    category: '爆款文',
    structure: `# {标题}

## 开头（Hook）
用故事/数据/反常识观点引入，前3行抓住注意力

## 主体（3-4个要点）
### 要点一：{核心观点}
每段不超过4行，关键信息加粗

### 要点二：{具体案例}
插入真实案例增强可信度

### 要点三：{深度分析}
提供独特的见解和分析角度

## 结尾（金句总结）
总结核心观点，引导互动和转发`,
    createdAt: '2026-01-01',
    usedCount: 0,
  },
  {
    id: '2',
    name: '干货教程文',
    description: 'Step-by-step 教学型文章',
    category: '干货教程',
    structure: `# {标题}

## 引言
说明"为什么这个重要"和"看完能收获什么"

## 准备工作
列出需要的工具、前提条件

## 步骤详解
### 第一步：{操作名称}
详细说明每一步怎么操作

### 第二步：{操作名称}
配截图或示例

### 第三步：{操作名称}
常见错误和避坑指南

## 总结
关键要点回顾 + 进阶建议`,
    createdAt: '2026-01-01',
    usedCount: 0,
  },
  {
    id: '3',
    name: '热点评论文',
    description: '紧跟热点的观点评论型文章',
    category: '热点评论',
    structure: `# {标题}

## 热点引入
简述事件经过，点明为什么值得关注

## 核心观点
你的独特角度和判断

## 论据支撑
用数据、案例、引用支撑观点

## 延伸思考
从事件延伸到更广泛的趋势或启示

## 结尾
总结观点 + 互动引导`,
    createdAt: '2026-01-01',
    usedCount: 0,
  },
];

export default function TemplatesPage() {
  const toast = useToast();
  const router = useRouter();
  const { data: templates, loaded, setData: setTemplates } = usePersistentStorage<ArticleTemplate[]>(STORAGE_KEY, defaultTemplates);
  const [showCreate, setShowCreate] = useState(false);
  const [editTemplate, setEditTemplate] = useState<ArticleTemplate | null>(null);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('爆款文');
  const [structure, setStructure] = useState('');
  const [filterCat, setFilterCat] = useState<string>('全部');

  const filtered = filterCat === '全部' ? templates : templates.filter(t => t.category === filterCat);

  const resetForm = () => {
    setName('');
    setDesc('');
    setCategory('爆款文');
    setStructure('');
    setEditTemplate(null);
  };

  const handleSave = () => {
    if (!name.trim() || !structure.trim()) return;
    if (editTemplate) {
      setTemplates(prev => prev.map(t =>
        t.id === editTemplate.id
          ? { ...t, name: name.trim(), description: desc.trim(), category, structure: structure.trim() }
          : t
      ));
      toast.show('模板已更新');
    } else {
      setTemplates(prev => [{
        id: Date.now().toString(36),
        name: name.trim(),
        description: desc.trim(),
        category,
        structure: structure.trim(),
        createdAt: new Date().toISOString().slice(0, 10),
        usedCount: 0,
      }, ...prev]);
      toast.show('模板已创建');
    }
    setShowCreate(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    toast.show('已删除');
  };

  const handleUse = (template: ArticleTemplate) => {
    setTemplates(prev => prev.map(t =>
      t.id === template.id ? { ...t, usedCount: t.usedCount + 1 } : t
    ));
    router.push(`/article-generation?template=${encodeURIComponent(template.name)}`);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bookmark size={22} className="text-teal-400" />
            文章模板
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">预设文章结构模板，快速开始创作</p>
        </div>
        <button onClick={() => { setShowCreate(true); resetForm(); }} className="btn-primary">
          <Plus size={16} /> 创建模板
        </button>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {(['全部', ...defaultCategories] as const).map(c => (
          <button key={c} onClick={() => setFilterCat(c)}
            className={`text-xs px-3 py-1.5 rounded-lg transition-all border ${
              filterCat === c
                ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary-light)] border-[var(--color-primary)]/30'
                : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:text-text'
            }`}
          >{c}</button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="glass-card p-12 text-center text-[var(--color-text-secondary)]">
          <Bookmark size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">暂无模板</p>
          <p className="text-xs mt-1">创建你的第一个文章模板</p>
        </div>
      )}

      {/* Template list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(template => (
          <div key={template.id} className="glass-card p-5 glass-card-hover flex flex-col">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/30 to-emerald-500/30 flex items-center justify-center">
                <FileText size={20} className="text-teal-400" />
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleUse(template)}
                  className="p-1.5 rounded-lg hover:bg-[var(--color-surface-3)] text-[var(--color-text-secondary)] hover:text-emerald-400 transition-all" title="使用模板">
                  <Sparkles size={14} />
                </button>
                <button onClick={() => handleDelete(template.id)}
                  className="p-1.5 rounded-lg hover:bg-[var(--color-surface-3)] text-rose-400 transition-all" title="删除">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <h3 className="font-medium text-sm">{template.name}</h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1 line-clamp-2">{template.description}</p>
            <div className="flex items-center gap-2 mt-3 text-[10px] text-[var(--color-text-secondary)]">
              <span className="px-2 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary-light)]">{template.category}</span>
              <span>使用 {template.usedCount} 次</span>
            </div>
            <div className="mt-auto pt-3">
              <pre className="text-[10px] text-[var(--color-text-secondary)] bg-[var(--color-surface-2)] rounded-lg p-3 overflow-x-auto max-h-[120px] leading-relaxed">{template.structure.slice(0, 200)}{template.structure.length > 200 ? '...' : ''}</pre>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[5vh] pb-8 px-4 bg-black/60 backdrop-blur-sm" onClick={() => { setShowCreate(false); resetForm(); }}>
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto glass-card p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <h2 className="font-semibold text-base">{editTemplate ? '编辑模板' : '创建模板'}</h2>
              <button onClick={() => { setShowCreate(false); resetForm(); }} className="text-[var(--color-text-secondary)] hover:text-text p-1"><X size={18} /></button>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">模板名称 *</label>
              <input type="text" placeholder="例如：公众号爆款文模板" value={name} onChange={e => setName(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">描述</label>
              <input type="text" placeholder="简短描述这个模板的用途" value={desc} onChange={e => setDesc(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">分类</label>
              <div className="flex flex-wrap gap-2">
                {defaultCategories.map(c => (
                  <button key={c} onClick={() => setCategory(c)}
                    className={`tag ${category === c ? 'active' : ''}`}>{c}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">文章结构 *（Markdown 格式，用 {} 标注可替换部分）</label>
              <textarea
                placeholder="# {标题}\n\n## 开头\n...\n\n## 主体\n...\n\n## 结尾\n..."
                value={structure}
                onChange={e => setStructure(e.target.value)}
                className="input-field h-64 resize-none font-mono text-sm leading-relaxed"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={!name.trim() || !structure.trim()} className="btn-primary">
                <Save size={16} /> {editTemplate ? '更新模板' : '保存模板'}
              </button>
              <button onClick={() => { setShowCreate(false); resetForm(); }} className="btn-secondary">取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
