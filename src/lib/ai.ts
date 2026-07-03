'use client';

import { usePersistentStorage } from './usePersistentStorage';

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
  const { data: settings, loaded, setData: saveSettings } = usePersistentStorage<Settings>(STORAGE_KEY, defaults);

  const update = (partial: Partial<Settings>) => {
    saveSettings({ ...settings, ...partial });
  };

  return { settings, loaded, saveSettings: update };
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
        const text = line.slice(6).trim();
        if (text === '[DONE]') continue;
        try {
          const json = JSON.parse(text);
          const delta = json.choices?.[0]?.delta?.content || '';
          full += delta;
          onChunk(full);
        } catch {}
      }
    }
    return full;
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}
