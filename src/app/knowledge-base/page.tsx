'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Upload, FileText, Plus, Search, Link, Trash2, X, Eye, Copy, Loader2, Save } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { usePersistentStorage } from '../../lib/usePersistentStorage';

interface Doc {
  id: number;
  title: string;
  type: 'txt' | 'link';
  date: string;
  chars: string;
  content: string;
}

const KB_STORAGE_KEY = 'mobi-knowledge-base';

const defaultDocs: Doc[] = [
    { id: 1, title: '公众号运营SOP完整版', type: 'txt', date: '2026-06-28', chars: '12,580', content: '# 公众号运营SOP\n\n## 一、每日工作流程\n\n### 08:00-09:00 选题与热点追踪\n- 浏览微博热搜、百度热榜、微信热点\n- 筛选与账号定位相关的选题\n- 记录热点关键词和角度\n\n### 09:00-11:00 内容创作\n- 确定今日推文主题\n- 撰写初稿（约1500-2500字）\n- 配图选择与排版\n\n### 11:00-12:00 审核与发布\n- 检查敏感词和合规性\n- 手机预览确认排版效果\n- 定时发布\n\n## 二、每周工作流程\n\n### 周一：数据复盘\n- 分析上周各篇阅读量、分享率、转化率\n- 总结爆款规律\n\n### 周三：选题会\n- 确定下周选题方向\n- 分配写作任务\n\n### 周五：互动维护\n- 精选留言回复\n- 策划周末互动话题\n\n## 三、关键词指标\n- 打开率 > 5%\n- 分享率 > 3%\n- 关注转化率 > 1%' },
    { id: 2, title: '10w+爆款标题库', type: 'txt', date: '2026-06-25', chars: '8,320', content: `# 10w+爆款标题库\n\n## 数字型标题\n1. "月薪3万的人，都在用这5个方法管理时间"\n2. "2026年最值得关注的10个趋势"\n3. "坚持30天后，我的生活发生了这些变化"\n\n## 悬念型标题\n1. "看完这篇，我删掉了手机里80%的APP"\n2. "为什么越来越多的人开始逃离朋友圈？"\n3. "这个被忽视的细节，正在毁掉你的职场前途"\n\n## 痛点型标题\n1. "你那么努力，为什么还是升不了职？"\n2. "35岁被裁员后，我才明白的3个道理"\n3. "为什么你写的文章没人看？问题出在这里"\n\n## 共鸣型标题\n1. "对不起，我不想做一个好说话的人"\n2. "月薪5000和月薪50000的差距，不是钱"\n3. "写给每一个在深夜感到迷茫的你"\n\n## 干货型标题\n1. "2026年公众号运营避坑指南（建议收藏）"\n2. "一份来自10w+作者的写作模板，直接套用"\n3. "从0到1做公众号：我的完整心路历程"`},
    { id: 3, title: '2026年内容营销趋势报告', type: 'txt', date: '2026-06-20', chars: '15,200', content: '# 2026年内容营销趋势报告\n\n## 趋势一：AI辅助创作成为标配\n\n2026年，超过80%的内容创作者已经在使用AI工具辅助写作。但纯粹的AI生成内容难以获得高流量，\"AI+人工\"的协作模式成为主流。\n\n## 趋势二：视频化内容持续增长\n\n公众号图文打开率整体下降，但视频号、短视频的内容消费时长持续增长。图文+短视频的组合模式效果最佳。\n\n## 趋势三：私域精细化运营\n\n粗放式的群发已经失效。基于用户标签和行为的精细化推送，将内容触达转化为实际互动，是2026年的核心方向。\n\n## 趋势四：知识付费与内容深度化\n\n用户对浅层内容的容忍度降低，深度分析、行业报告、实操教程类内容更受欢迎。\n\n## 趋势五：跨界合作与IP联动\n\n单一账号的流量天花板越来越明显。跨账号合作、品牌联名、IP联动成为新的增长点。' },
    { id: 4, title: '账号定位与选题规划', type: 'link', date: '2026-06-18', chars: '-', content: '# 账号定位与选题规划指南\n\n## 一、账号定位三步法\n\n### 1. 找赛道\n- 你擅长什么？\n- 市场需要什么？\n- 你能持续产出什么？\n\n### 2. 找差异\n- 同类账号都在做什么？\n- 你的独特角度是什么？\n- 你的目标用户是谁？\n\n### 3. 定调性\n- 语言风格（专业/亲切/犀利/温暖）\n- 内容形式（图文/视频/音频）\n- 更新频率（日更/周更/专题）\n\n## 二、选题方法论\n\n### 热点型选题（占30%）\n- 紧跟社会热点、行业新闻\n- 时效性强，容易获得流量\n- 关键是要有独特角度\n\n### 常规型选题（占50%）\n- 围绕账号定位的常规内容\n- 保持账号的稳定更新\n- 建立用户期待\n\n### 爆款型选题（占20%）\n- 深挖用户痛点，寻找共鸣点\n- 投入更多精力打磨\n- 追求传播效果' },
];

export default function KnowledgeBasePage() {
  const toast = useToast();
  const { data: docs, loaded, setData: setDocs } = usePersistentStorage<Doc[]>(KB_STORAGE_KEY, defaultDocs);
  const [searchQ, setSearchQ] = useState('');
  const [url, setUrl] = useState('');
  const [viewDoc, setViewDoc] = useState<Doc | null>(null);
  const [addingUrl, setAddingUrl] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  // Data is auto-persisted by usePersistentStorage

  const handleAddDoc = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    const newDoc: Doc = {
      id: Date.now(),
      title: newTitle.trim(),
      type: 'txt',
      date: new Date().toISOString().slice(0, 10),
      chars: newContent.length.toLocaleString(),
      content: newContent,
    };
    setDocs(prev => [newDoc, ...prev]);
    setNewTitle('');
    setNewContent('');
    setShowAddModal(false);
    toast.show('已添加到知识库');
  };

  const filtered = searchQ.trim()
    ? docs.filter(d => d.title.toLowerCase().includes(searchQ.toLowerCase()))
    : docs;

  const handleDelete = (id: number) => {
    setDocs(prev => prev.filter(d => d.id !== id));
    toast.show('已删除');
  };

  const handleExtract = () => {
    if (!url.trim()) return;
    setAddingUrl(true);
    setTimeout(() => {
      const newDoc: Doc = {
        id: Date.now(),
        title: `文章 - ${url.slice(0, 30)}...`,
        type: 'link',
        date: new Date().toISOString().slice(0, 10),
        chars: '-',
        content: `从 ${url} 提取的文章内容。\n\n实际使用时，此处将通过 API 抓取文章内容并保存。`,
      };
      setDocs(prev => [newDoc, ...prev]);
      setUrl('');
      setAddingUrl(false);
      toast.show('已添加到知识库');
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen size={22} className="text-sky-400" />
          知识库
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1">上传文章或笔记，AI 写作时自动检索相关内容作为参考</p>
      </div>

      {/* Actions */}
      <div className="glass-card p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] border-dashed hover:border-[var(--color-primary)]/30 transition-all cursor-pointer text-center">
            <Upload size={24} className="mx-auto text-[var(--color-primary-light)] mb-2" />
            <p className="text-sm font-medium">上传 .txt 文件</p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">支持 UTF-8 编码</p>
            <input type="file" accept=".txt" className="hidden" />
          </label>
          <div className="p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] border-dashed hover:border-[var(--color-primary)]/30 transition-all">
            <div className="text-center mb-2"><Link size={24} className="mx-auto text-[var(--color-primary-light)]" /></div>
            <p className="text-sm font-medium text-center mb-2">公众号文章一键提取</p>
            <div className="flex gap-2">
              <input type="url" placeholder="粘贴文章链接..." value={url} onChange={e => setUrl(e.target.value)} className="input-field text-xs flex-1" />
              <button onClick={handleExtract} disabled={addingUrl || !url.trim()} className="btn-primary text-xs px-3">
                {addingUrl ? <Loader2 size={12} className="animate-spin" /> : '提取'}
              </button>
            </div>
          </div>
          <div onClick={() => setShowAddModal(true)} className="p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] border-dashed hover:border-[var(--color-primary)]/30 transition-all cursor-pointer text-center">
            <FileText size={24} className="mx-auto text-[var(--color-primary-light)] mb-2" />
            <p className="text-sm font-medium">手动新增文档</p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">粘贴或撰写内容</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
        <input type="text" placeholder="搜索知识库..." value={searchQ} onChange={e => setSearchQ(e.target.value)} className="input-field pl-10" />
      </div>

      {/* Doc List */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">文档列表</h2>
          <span className="text-xs text-[var(--color-text-secondary)]">共 {filtered.length} 篇</span>
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[var(--color-text-secondary)]">
            <FileText size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">没有找到匹配的文档</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(doc => (
              <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface-2)] group hover:bg-[var(--color-surface-3)] transition-all cursor-pointer"
                onClick={() => setViewDoc(doc)}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${doc.type === 'link' ? 'bg-sky-500/20 text-sky-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {doc.type === 'link' ? <Link size={14} /> : <FileText size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc.title}</p>
                  <div className="flex items-center gap-3 text-xs text-[var(--color-text-secondary)] mt-0.5">
                    <span>{doc.date}</span>
                    <span>{doc.chars} 字</span>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-[var(--color-surface)] text-rose-400 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Document Modal */}
      {viewDoc && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[5vh] pb-8 px-4 bg-black/60 backdrop-blur-sm" onClick={() => setViewDoc(null)}>
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto glass-card p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-semibold text-base">{viewDoc.title}</h2>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{viewDoc.date} · {viewDoc.chars} 字</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { navigator.clipboard.writeText(viewDoc.content); toast.show('已复制'); }}
                  className="text-xs text-[var(--color-primary-light)] hover:underline flex items-center gap-1"
                >
                  <Copy size={12} /> 复制
                </button>
                <button onClick={() => setViewDoc(null)} className="text-[var(--color-text-secondary)] hover:text-text p-1">
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="rounded-xl bg-[var(--color-surface-2)] p-5 text-sm leading-relaxed whitespace-pre-wrap">
              {viewDoc.content}
          </div>
        </div>
        </div>
      )}

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[5vh] pb-8 px-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto glass-card p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <h2 className="font-semibold text-base">新增文档</h2>
              <button onClick={() => { setShowAddModal(false); setNewTitle(''); setNewContent(''); }} className="text-[var(--color-text-secondary)] hover:text-text p-1"><X size={18} /></button>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">文档标题 *</label>
              <input type="text" placeholder="输入文档标题..." value={newTitle} onChange={e => setNewTitle(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">文档内容 *</label>
              <textarea
                placeholder="粘贴或撰写内容..."
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                className="input-field h-64 resize-none font-mono text-sm leading-relaxed"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={handleAddDoc} disabled={!newTitle.trim() || !newContent.trim()} className="btn-primary">
                <Save size={16} /> 保存到知识库
              </button>
              <button onClick={() => { setShowAddModal(false); setNewTitle(''); setNewContent(''); }} className="btn-secondary">取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
