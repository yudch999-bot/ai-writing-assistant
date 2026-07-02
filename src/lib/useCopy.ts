'use client';

import { useState, useCallback } from 'react';

export function useCopy() {
  const [copiedText, setCopiedText] = useState('');

  const copy = useCallback(async (text: string, label = '已复制') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(''), 2000);
    } catch {
      setCopiedText('复制失败');
      setTimeout(() => setCopiedText(''), 2000);
    }
  }, []);

  return { copiedText, copy };
}
