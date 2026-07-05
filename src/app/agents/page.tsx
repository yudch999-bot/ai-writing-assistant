'use client';

import { useState, useEffect } from 'react';
import { Bot, Plus, Sparkles, Play, Trash2, Loader2, PenLine, X, Copy, Layout } from 'lucide-react';
import { useSettings, callAI } from '../../lib/ai';
import { useToast } from '../../components/Toast';
import { useSavedContent } from '../../lib/useSavedContent';
import { usePersistentStorage } from '../../lib/usePersistentStorage';
import { useRouter } from 'next/navigation';
import { useSEO } from '../../lib/useSEO';

interface Agent {
  id: number;
  name: string;
  role: string;
  style: string;
  used: number;
}

const STORAGE_KEY = 'mobi-agent-agents';

const defaultAgents: Agent[] = [
  { id: 1, name: '情感文案助手', role: '你是一位温暖细腻的情感领域作者，擅长用故事打动人心，文字有温度、有画面感。', style: '情感治愈风 - 夜听', used: 28 },
  { id: 2, name: '职场干货写手', role: '你是一位资深职场导师，擅长用数据和案例说话，逻辑清晰，干货满满。', style: '职场干货风 - 插座学院', used: 15 },
];

const wordCountOptions = [500, 800, 1200, 1500, 2000, 2500];

export default function AgentsPage() {
  useSEO('智能体');
  const { settings } = useSettings();
  const toast = useToast();
  const router = useRouter();
  const { save } = useSavedContent();
  const { data: agents, setData: setAgents } = usePersistentStorage<Agent[]>(STORAGE_KEY, defaultAgents);
  const [nextId, setNextId] = useState(0);

  // Derive nextId from agents
  useEffect(() => {
    setNextId(agents.reduce((max, a) => Math.max(max, a.id), 0) + 1);
  }, [agents]);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newStyle, setNewStyle] = useState('');
  const [generating, setGenerating] = useState(false);

  // Writing modal state
  const [writingAgent, setWritingAgent] = useState<Agent | null>(null);
  const [topic, setTopic] = useState('');
  const [wordCount, setWordCount] = useState(1200);
  const [writing, setWriting] = useState(false);
  const [writingResult, setWritingResult] = useState<string | null>(null);

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setNewName(agent.name);
    setNewRole(agent.role);
    setNewStyle(agent.style);
    setShowCreate(true);
  };

  const handleDelete = (id: number) => {
    setAgents(prev => prev.filter(a => a.id !== id));
  };

  const handleUse = (agent: Agent) => {
    setWritingAgent(agent);
    setTopic('');
    setWritingResult(null);
    setWriting(false);
  };

  const handleGenerateRole = async () => {
    if (!settings.apiKey) return;
    setGenerating(true);
    try {
      const res = await callAI(
        [
          { role: 'system', content: '你是一位专业的角色人设创作专家。根据智能体名称生成一段50字左右的角色人设描述，直接输出，不要多余内容。' },
          { role: 'user', content: `为智能体「${newName || '写作助手'}」生成角色人设描述` },
        ],
        settings.apiKey,
        settings.model,
        settings.provider,
      );
      setNewRole(res.trim());
    } catch (e) {
      console.warn('[agents] AI role generation failed:', e);
      toast.show('角色生成失败，请手动输入');
    }
    setGenerating(false);
  };

  const handleSave = () => {
    if (!newName.trim() || !newRole.trim()) return;
    if (editingAgent) {
      setAgents(prev => prev.map(a =>
        a.id === editingAgent.id ? { ...a, name: newName, role: newRole, style: newStyle } : a
      ));
    } else {
      setAgents(prev => [...prev, { id: nextId, name: newName, role: newRole, style: newStyle || '通用风格', used: 0 }]);
      setNextId(nextId + 1);
    }
    setShowCreate(false);
    setEditingAgent(null);
    setNewName('');
    setNewRole('');
    setNewStyle('');
  };

  const handleClose = () => {
    setShowCreate(false);
    setEditingAgent(null);
    setNewName('');
    setNewRole('');
    setNewStyle('');
  };

  const handleWrite = async () => {
    if (!topic.trim() || !writingAgent || !settings.apiKey) return;
    setWriting(true);
    try {
      const res = await callAI(
        [
          { role: 'system', content: `${writingAgent.role}\n\n写作风格：${writingAgent.style}\n\n请按照上述人设和风格写作，输出 Markdown 格式。` },
          { role: 'user', content: `请以你的风格写一篇关于「${topic}」的文章，约${wordCount}字。要求开头吸引人，段落清晰，结尾有金句。` },
        ],
        settings.apiKey,
        settings.model,
        settings.provider,
      );
      setWritingResult(res);
      save('智能体', topic, res);
      toast.show('已保存到历史记录');
      setAgents(prev => prev.map(a =>
        a.id === writingAgent.id ? { ...a, used: a.used + 1 } : a
      ));
    } catch (e) {
      console.warn('[agents] AI write failed:', e);
      toast.show('写作失败，请重试');
    }
    setWriting(false);
  };

  const closeWriting = () => {
    setWritingAgent(null);
    setTopic('');
    setWritingResult(null);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bot size={22} className="text-purple-400" />
            智能体
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">自定义 AI 写作智能体，设定角色人设、写作风格与知识库</p>
        </div>
        <button onClick={() => { setShowCreate(true); setEditingAgent(null); setNewName(''); setNewRole(''); setNewStyle(''); }} className="btn-primary">
          <Plus size={16} /> 创建智能体
        </button>
      </div>

      {/* Create / Edit Form */}
      {showCreate && (
        <div className="glass-card p-6 space-y-4 relative">
          <button onClick={handleClose} className="absolute top-4 right-4 text-[var(--color-text-secondary)] hover:text-text transition-colors"><X size={18} /></button>
          <h2 className="font-semibold">{editingAgent ? '编辑智能体' : '创建新智能体'}</h2>
          <div>
            <label className="block text-sm font-medium mb-1">智能体名称 *</label>
            <input type="text" placeholder="例如：情感文案助手" value={newName} onChange={e => setNewName(e.target.value)} className="input-field" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium">角色人设 *</label>
              <button onClick={handleGenerateRole} disabled={generating} className="text-xs text-[var(--color-primary-light)] hover:underline flex items-center gap-1">
                {generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} AI 生成
              </button>
            </div>
            <textarea placeholder="用日常语言描述你的创作需求，AI 一键生成专业角色人设..." value={newRole} onChange={e => setNewRole(e.target.value)} className="input-field h-24 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">写作风格参考</label>
            <select className="input-field" value={newStyle} onChange={e => setNewStyle(e.target.value)}>
              <option value="">不选择</option>
              <option value="情感治愈风 - 夜听">情感治愈风 - 夜听</option>
              <option value="职场干货风 - 插座学院">职场干货风 - 插座学院</option>
              <option value="认知提升风 - L先生说">认知提升风 - L先生说</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={!newName.trim() || !newRole.trim()} className="btn-primary">
              {editingAgent ? <PenLine size={16} /> : <Sparkles size={16} />} {editingAgent ? '保存修改' : '保存智能体'}
            </button>
            <button onClick={handleClose} className="btn-secondary">取消</button>
          </div>
        </div>
      )}

      {/* Agent List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.length === 0 ? (
          <div className="col-span-full glass-card p-12 text-center text-[var(--color-text-secondary)]">
            <Bot size={48} className="mx-auto mb-3 opacity-30" />
            <p>还没有创建智能体</p>
            <p className="text-xs mt-1">点击右上角「创建智能体」开始打造你的专属 AI 写作助手</p>
          </div>
        ) : (
          agents.map(agent => (
            <div key={agent.id} className="glass-card p-5 glass-card-hover">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
                  <Bot size={20} className="text-purple-400" />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleUse(agent)} title="快速写作" className="p-1.5 rounded-lg hover:bg-[var(--color-surface-3)] text-[var(--color-text-secondary)] hover:text-text transition-all"><Play size={14} /></button>
                  <button onClick={() => handleEdit(agent)} title="编辑" className="p-1.5 rounded-lg hover:bg-[var(--color-surface-3)] text-[var(--color-text-secondary)] hover:text-text transition-all"><PenLine size={14} /></button>
                  <button onClick={() => handleDelete(agent.id)} title="删除" className="p-1.5 rounded-lg hover:bg-[var(--color-surface-3)] text-rose-400 hover:text-rose-300 transition-all"><Trash2 size={14} /></button>
                </div>
              </div>
              <h3 className="font-medium text-sm">{agent.name}</h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1 line-clamp-2">{agent.role}</p>
              <div className="flex items-center gap-3 mt-3 text-xs text-[var(--color-text-secondary)]">
                <span className="px-2 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary-light)] border border-[var(--color-primary)]/20">{agent.style}</span>
                <span>使用 {agent.used} 次</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Writing Modal */}
      {writingAgent && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[5vh] pb-8 px-4 bg-black/60 backdrop-blur-sm" onClick={closeWriting}>
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto glass-card p-6 space-y-4" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-base flex items-center gap-2">
                  <Bot size={18} className="text-purple-400" />
                  {writingAgent.name}
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 line-clamp-1">{writingAgent.role}</p>
              </div>
              <button onClick={closeWriting} className="text-[var(--color-text-secondary)] hover:text-text transition-colors p-1"><X size={18} /></button>
            </div>

            {/* Topic Input */}
            <div>
              <label className="block text-sm font-medium mb-1">写作主题 / 关键词</label>
              <textarea
                placeholder="输入你想写的主题或关键词..."
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="input-field h-20 resize-none"
                disabled={!!writingResult}
              />
            </div>

            {/* Word Count + Buttons */}
            {!writingResult && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">字数</label>
                  <div className="flex flex-wrap gap-2">
                    {wordCountOptions.map(w => (
                      <button key={w} onClick={() => setWordCount(w)} className={`tag ${wordCount === w ? 'active' : ''}`}>{w}字</button>
                    ))}
                  </div>
                </div>
                <button onClick={handleWrite} disabled={writing || !topic.trim()} className="btn-primary w-full justify-center">
                  {writing ? <><Loader2 size={16} className="animate-spin" /> {writingAgent.name} 正在创作...</> : <><Sparkles size={16} /> 开始写作</>}
                </button>
              </>
            )}

            {/* Result */}
            {writing && (
              <div className="flex flex-col items-center justify-center py-12 text-[var(--color-text-secondary)] gap-3">
                <Loader2 size={32} className="animate-spin text-purple-400" />
                <span>AI 正在以 {writingAgent.name} 的风格创作...</span>
              </div>
            )}

            {writingResult && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--color-text-secondary)]">生成完成 · 已保存到历史记录</span>
                  <div className="flex gap-2">
                    <button onClick={() => { navigator.clipboard.writeText(writingResult || ''); router.push('/formatting'); toast.show('已复制并跳转排版'); }} className="btn-primary text-xs px-2 py-1" style={{ fontSize: '11px', padding: '2px 8px', height: 'auto', minHeight: 0 }}>
                      <Layout size={11} /> 一键排版
                    </button>
                    <button onClick={() => { navigator.clipboard.writeText(writingResult || ''); toast.show('已复制'); }} className="text-xs text-[var(--color-primary-light)] hover:underline flex items-center gap-1"><Copy size={12} /> 复制</button>
                    <button onClick={() => { setWritingResult(null); setTopic(''); }} className="text-xs text-[var(--color-text-secondary)] hover:underline">继续写作</button>
                  </div>
                </div>
                <div className="rounded-xl bg-[var(--color-surface-2)] p-5 text-sm leading-relaxed whitespace-pre-wrap max-h-[400px] overflow-y-auto">
                  {writingResult}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
