'use client';
import { useEffect } from 'react';

export function useSEO(title: string, description?: string) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = `${title} · 墨笔 AI`;
    // Set meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc?.getAttribute('content');
    if (description && metaDesc) {
      metaDesc.setAttribute('content', description);
    }
    return () => {
      document.title = prevTitle;
      if (description && metaDesc && prevDesc) {
        metaDesc.setAttribute('content', prevDesc);
      }
    };
  }, [title, description]);
}
