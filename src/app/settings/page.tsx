'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Settings, Key, Sliders, Globe, Shield, User, Palette, Database, Bell, Check, Copy, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { useTheme } from '../../components/ThemeProvider';
import { usePersistentStorage } from '../../lib/usePersistentStorage';

const STORAGE_KEY = 'ai-writer-settings';

interface AppSettings {
  apiKey: string;
  model: string;
  temperature: number;
  deAiStrength: number;
  wxAppId: string;
  wxSecret: string;
  userName: string;
  wechatName: string;
  bio: string;
  theme: string;
  accentColor: string;
  notifyGen: boolean;
  notifyDetect: boolean;
  notifyHot: boolean;
  notifyError: boolean;
}

const defaults: AppSettings = {
  apiKey: '',
  model: 'deepseek-chat',
  temperature: 0.7,
  deAiStrength: 80,
  wxAppId: '',
  wxSecret: '',
  userName: '',
  wechatName: '',
  bio: '',
  theme: '深色模式',
  accentColor: '#6366f1',
  notifyGen: true,
  notifyDetect: true,
  notifyHot: false,
  notifyError: true,
};

const sections = [
  { id: 'api', label: 'API 配置', icon: Key },
  { id: 'model', label: '模型设置', icon: Sliders },
  { id: 'wx', label: '公众号配置', icon: Globe },
  { id: 'security', label: '安全设置', icon: Shield },
  { id: 'profile', label: '个人资料', icon: User },
  { id: 'theme', label: '主题外观', icon: Palette },
  { id: 'data', label: '数据管理', icon: Database },
  { id: 'notify', label: '通知设置', icon: Bell },
];

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const toast = useToast();
  const themeCtx = useTheme();
  const [activeSection, setActiveSection] = useState('api');
  const [testing, setTesting] = useState(false);
  const [testMsg, setTestMsg] = useState('');
  const [showKey, setShowKey] = useState(false);

  const { data: settings, setData: persistSave } = usePersistentStorage<AppSettings>(STORAGE_KEY, defaults);
  const [saved, setSaved] = useState(false);

  // Handle ?tab=profile from TopBar
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'profile') setActiveSection('profile');
    if (tab === 'theme') setActiveSection('theme');
    if (tab === 'data') setActiveSection('data');
  }, [searchParams]);

  const save = () => {
    persistSave(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const update = (partial: Partial<AppSettings>) => {
    // Apply partial update immediately via persistSave
    const next = { ...settings, ...partial };
    persistSave(next);
    setSaved(false);
  };

  const testConnection = async () => {
    if (!settings.apiKey) { setTestMsg('请先输入 API Key'); return; }
    setTesting(true);
    setTestMsg('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: settings.model,
          messages: [{ role: 'user', content: '回复"连接成功"四个字，不要其他内容' }],
          apiKey: settings.apiKey,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTestMsg(`✅ 连接成功！模型回复：${data.choices?.[0]?.message?.content || ''}`);
      } else {
        setTestMsg(`❌ 连接失败：${data.error || res.status}`);
      }
    } catch (e: unknown) {
      setTestMsg(`❌ 连接失败：${e instanceof Error ? e.message : '未知错误'}`);
    }
    setTesting(false);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings size={22} className="text-text" />
          设置中心
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1">配置 DeepSeek API 密钥，开启所有 AI 功能</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="glass-card p-3 space-y-1">
          {sections.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeSection === s.id ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary-light)] border border-[var(--color-primary)]/20' : 'text-[var(--color-text-secondary)] hover:text-text hover:bg-surface-3 border border-transparent'
              }`}>
              <s.icon size={16} />
              {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3 glass-card p-6 space-y-6">
          {activeSection === 'api' && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">API 配置</h2>
                {settings.apiKey && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    已配置
                  </span>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">DeepSeek API Key</label>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={settings.apiKey}
                      onChange={e => update({ apiKey: e.target.value })}
                      className="input-field pr-20"
                    />
                    <button
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-secondary)] hover:text-text px-2 py-1"
                    >
                      {showKey ? '隐藏' : '显示'}
                    </button>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                    密钥仅保存在本地浏览器，不会上传到服务器。前往 <a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noopener" className="text-[var(--color-primary-light)] hover:underline">platform.deepseek.com</a> 获取。
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={save} className="btn-primary">
                    {saved ? <><Check size={16} /> 已保存</> : <><Copy size={16} /> 保存配置</>}
                  </button>
                  <button onClick={testConnection} disabled={testing || !settings.apiKey} className="btn-secondary">
                    {testing ? <><Loader2 size={14} className="animate-spin" /> 测试中...</> : '测试连接'}
                  </button>
                </div>

                {testMsg && (
                  <div className={`p-3 rounded-xl text-sm ${testMsg.startsWith('✅') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                    {testMsg}
                  </div>
                )}

                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm">
                  <p className="font-medium text-amber-400 flex items-center gap-1"><AlertCircle size={14} /> 使用说明</p>
                  <ul className="mt-2 space-y-1 text-xs text-[var(--color-text-secondary)]">
                    <li>1. 注册 DeepSeek 账号并登录</li>
                    <li>2. 在 <a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noopener" className="text-[var(--color-primary-light)]">API Keys</a> 页面创建 Key</li>
                    <li>3. 复制 Key 粘贴到上方输入框</li>
                    <li>4. 点击「保存配置」并「测试连接」</li>
                    <li>5. 之后所有 AI 功能都会使用 DeepSeek 模型</li>
                  </ul>
                </div>
              </div>
            </>
          )}

          {activeSection === 'model' && (
            <>
              <h2 className="font-semibold">生成参数</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1">AI 模型</label>
                  <select className="input-field" value={settings.model} onChange={e => update({ model: e.target.value })}>
                    <option value="deepseek-chat">DeepSeek V4 Flash</option>
                    <option value="deepseek-reasoner">DeepSeek V4 Pro</option>
                  </select>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">Flash 适合日常创作，Pro 适合深度分析</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">创意温度：{settings.temperature}</label>
                  <input type="range" min={0} max={1} step={0.1} value={settings.temperature}
                    onChange={e => update({ temperature: parseFloat(e.target.value) })}
                    className="w-full accent-[var(--color-primary)]" />
                  <div className="flex justify-between text-xs text-[var(--color-text-secondary)] mt-1"><span>精准</span><span>0.5</span><span>创意</span></div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">去 AI 化强度：{settings.deAiStrength}%</label>
                  <input type="range" min={0} max={100} value={settings.deAiStrength}
                    onChange={e => update({ deAiStrength: parseInt(e.target.value) })}
                    className="w-full accent-[var(--color-primary)]" />
                </div>
                <button onClick={save} className="btn-primary">
                  {saved ? <><Check size={16} /> 已保存</> : '保存配置'}
                </button>
              </div>
            </>
          )}

          {activeSection === 'wx' && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">微信公众号配置</h2>
                {settings.wxAppId && settings.wxSecret ? (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">已连接</span>
                ) : (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">未连接</span>
                )}
              </div>
              <p className="text-sm text-[var(--color-text-secondary)]">配置后可在「公众号排版」页面一键导入草稿箱</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">公众号 AppID</label>
                  <input
                    type="text"
                    placeholder="wxxxxxxxxxxxxxxxxx"
                    value={settings.wxAppId || ''}
                    onChange={e => update({ wxAppId: e.target.value })}
                    className="input-field"
                  />
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">在微信公众平台 → 开发 → 基本配置中查看</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">公众号 AppSecret</label>
                  <input
                    type="password"
                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={settings.wxSecret || ''}
                    onChange={e => update({ wxSecret: e.target.value })}
                    className="input-field"
                    onFocus={e => e.target.type = 'text'}
                    onBlur={e => e.target.type = 'password'}
                  />
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">密钥仅保存在本地浏览器，用于获取 AccessToken</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">IP 白名单</label>
                  <div className="flex items-center gap-2">
                    <input type="text" readOnly value="请将你的服务器 IP 添加到微信公众平台 IP 白名单" className="input-field text-xs opacity-60" />
                  </div>
                </div>
                <button onClick={save} className="btn-primary">
                  {saved ? <><Check size={16} /> 已保存</> : <><Copy size={16} /> 保存配置</>}
                </button>
                <div className="p-4 rounded-xl bg-[var(--color-surface-2)] text-sm space-y-2">
                  <p className="font-medium text-[var(--color-text)]">配置成功后可使用：</p>
                  <ul className="space-y-1 text-xs text-[var(--color-text-secondary)]">
                    <li>✅ 一键推送文章到公众号草稿箱</li>
                    <li>✅ 自动适配公众号图文排版格式</li>
                    <li>✅ 管理公众号素材与文章发布状态</li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm">
                  <p className="text-amber-400 flex items-center gap-1"><AlertCircle size={14} /> 配置步骤</p>
                  <ol className="mt-2 space-y-1 text-xs text-[var(--color-text-secondary)]">
                    <li>1. 登录 <a href="https://mp.weixin.qq.com" target="_blank" rel="noopener" className="text-[var(--color-primary-light)]">微信公众平台</a></li>
                    <li>2. 进入「设置与开发」→「基本配置」</li>
                    <li>3. 获取 AppID 和 AppSecret</li>
                    <li>4. 在「IP 白名单」中添加你的服务器 IP</li>
                    <li>5. 填写到上方并保存</li>
                  </ol>
                </div>
              </div>
            </>
          )}

          {activeSection === 'security' && (
            <>
              <h2 className="font-semibold">安全设置</h2>
              <p className="text-sm text-[var(--color-text-secondary)]">管理 API 密钥和账户安全</p>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[var(--color-surface-2)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">API Key 状态</p>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{settings.apiKey ? '已配置（加密存储于本地）' : '未配置'}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${settings.apiKey ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {settings.apiKey ? '安全' : '未设置'}
                    </span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[var(--color-surface-2)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">数据存储</p>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">所有配置仅保存在本地浏览器，不上传到服务器</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">本地存储</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm">
                  <p className="text-amber-400 flex items-center gap-1"><AlertCircle size={14} /> 安全建议</p>
                  <ul className="mt-2 space-y-1 text-xs text-[var(--color-text-secondary)]">
                    <li>• 不要将 API Key 分享给他人</li>
                    <li>• 定期在 DeepSeek 平台轮换 API Key</li>
                    <li>• 本工具所有数据仅存储在浏览器本地</li>
                    <li>• AI 请求通过服务器转发，不会记录内容</li>
                  </ul>
                </div>
              </div>
            </>
          )}

          {activeSection === 'profile' && (
            <>
              <h2 className="font-semibold">个人资料</h2>
              <p className="text-sm text-[var(--color-text-secondary)]">管理你的账号信息</p>
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-purple-500 flex items-center justify-center text-2xl font-bold text-white">
                    {(settings.userName || '用')[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{settings.userName || '用户'}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">公众号运营者</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">昵称</label>
                  <input type="text" placeholder="你的昵称" value={settings.userName || ''} onChange={e => update({ userName: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">公众号名称</label>
                  <input type="text" placeholder="你的公众号名称" value={settings.wechatName || ''} onChange={e => update({ wechatName: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">简介</label>
                  <textarea placeholder="一句话介绍自己..." value={settings.bio || ''} onChange={e => update({ bio: e.target.value })} className="input-field h-20 resize-none" />
                </div>
                <button onClick={save} className="btn-primary">{saved ? <><Check size={16} /> 已保存</> : '保存资料'}</button>
              </div>
            </>
          )}

          {activeSection === 'theme' && (
            <>
              <h2 className="font-semibold">主题外观</h2>
              <p className="text-sm text-[var(--color-text-secondary)]">自定义界面主题和配色</p>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">界面主题</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['深色模式', '浅色模式', '跟随系统'] as const).map(t => (
                      <button key={t} onClick={() => { themeCtx.setTheme(t); update({ theme: t }); }} className={`p-4 rounded-xl text-left text-sm border transition-all ${themeCtx.theme === t ? 'border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10' : 'border-[var(--color-border)] bg-[var(--color-surface-2)]'}`}>
                        <div className="font-medium">{t}</div>
                        <div className="text-xs text-[var(--color-text-secondary)] mt-1">{t === '深色模式' ? '适合夜间使用' : t === '浅色模式' ? '适合白天使用' : '自动切换'}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">强调色</label>
                  <div className="flex gap-3">
                    {['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'].map(c => (
                      <button key={c} onClick={() => { themeCtx.setAccent(c); update({ accentColor: c }); }} className={`w-8 h-8 rounded-xl transition-all ${(themeCtx.accentColor) === c ? 'ring-2 ring-white ring-offset-2 ring-offset-surface-2 scale-110' : ''}`} style={{ background: c }} />
                    ))}
                  </div>
                </div>
                <button onClick={save} className="btn-primary">{saved ? <><Check size={16} /> 已保存</> : '保存主题'}</button>
              </div>
            </>
          )}

          {activeSection === 'data' && (
            <>
              <h2 className="font-semibold">数据管理</h2>
              <p className="text-sm text-[var(--color-text-secondary)]">管理本地存储的数据和配置</p>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[var(--color-surface-2)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">本地存储</p>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">API Key、配置参数、个人资料均存储在浏览器本地</p>
                    </div>
                    <span className="text-xs text-[var(--color-text-secondary)]">~2KB</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const json = JSON.stringify(settings, null, 2);
                      navigator.clipboard.writeText(json);
                      toast.show('配置已导出到剪贴板');
                    }}
                    className="btn-secondary flex-1 justify-center"
                  >
                    <Copy size={14} /> 导出配置
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('确定清除所有数据？API Key 和配置将被删除。')) {
                        fetch(`/api/storage?key=${STORAGE_KEY}`, { method: 'DELETE' }).catch(() => {});
                        try { localStorage.removeItem(STORAGE_KEY); } catch {}
                        toast.show('已清除所有数据');
                        setTimeout(() => window.location.reload(), 1000);
                      }
                    }}
                    className="btn-secondary flex-1 justify-center text-rose-400 border-rose-500/30"
                  >
                    清除数据
                  </button>
                </div>
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm">
                  <p className="text-amber-400 flex items-center gap-1"><AlertCircle size={14} /> 注意</p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">清除数据会删除所有配置，包括 API Key。建议先导出备份。</p>
                </div>
              </div>
            </>
          )}

          {activeSection === 'notify' && (
            <>
              <h2 className="font-semibold">通知设置</h2>
              <p className="text-sm text-[var(--color-text-secondary)]">管理应用通知和提醒</p>
              <div className="space-y-3">
                {[
                  { label: 'AI 生成完成通知', desc: '文章生成或改写完成后发送通知', key: 'notifyGen' },
                  { label: '检测完成通知', desc: '内容检测完成后发送通知', key: 'notifyDetect' },
                  { label: '热点更新通知', desc: '热点数据刷新后通知', key: 'notifyHot' },
                  { label: '错误提醒', desc: 'AI 请求失败时通知', key: 'notifyError' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-surface-2)]">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={true} onChange={() => {}} />
                      <div className="w-9 h-5 bg-[var(--color-surface-3)] rounded-full peer peer-checked:bg-[var(--color-primary)] after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                    </label>
                  </div>
                ))}
                <p className="text-xs text-[var(--color-text-secondary)]">通知功能需要浏览器允许通知权限</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
