'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'ai-writer-settings';

interface Settings {
  apiKey: string;
  model: string;
}

const defaults: Settings = {
  apiKey: '',
  model: 'deepseek-chat',
};

export function useSettings() {
  const [settings, setSettingsState] = useState<Settings>(defaults);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSettingsState({ ...defaults, ...JSON.parse(stored) });
    } catch {}
    setLoaded(true);
  }, []);

  const saveSettings = useCallback((s: Partial<Settings>) => {
    const next = { ...settings, ...s };
    setSettingsState(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  }, [settings]);

  return { settings, loaded, saveSettings };
}

export async function callAI(
  messages: { role: string; content: string }[],
  apiKey: string,
  model = 'deepseek-chat',
  onChunk?: (text: string) => void,
  temperature = 0.7,
  maxTokens = 4096,
): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      apiKey,
      stream: !!onChunk,
      temperature,
      maxTokens,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `请求失败 (${res.status})`);
  }

  if (onChunk && res.body) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let full = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
      for (const line of lines) {
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;
        try {
          const json = JSON.parse(data);
          const text = json.choices?.[0]?.delta?.content || '';
          full += text;
          onChunk(full);
        } catch {}
      }
    }
    return full;
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}
