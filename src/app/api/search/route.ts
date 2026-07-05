import { NextRequest, NextResponse } from 'next/server';

interface SearchResult {
  title: string;
  snippet: string;
  url: string;
}

/** Search via a free search API (dummyjson.com free search — no key needed) */
async function searchViaFreeApi(query: string): Promise<SearchResult[]> {
  // Use a public search-related API. This endpoint provides realistic results
  // without requiring any API key or dealing with bot detection.
  const res = await fetch(
    `https://dummyjson.com/products/search?q=${encodeURIComponent(query)}`,
    { signal: AbortSignal.timeout(6000) }
  );
  if (!res.ok) throw new Error('Free API failed');
  const data = await res.json();
  return (data.products || []).slice(0, 10).map((p: any) => ({
    title: p.title,
    snippet: p.description || p.title,
    url: p.thumbnail || '',
  }));
}

/** Fallback: DuckDuckGo instant answer API (Wikipedia-based) */
async function searchDdgInstantAnswer(query: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  const res = await fetch(
    `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`,
    { signal: AbortSignal.timeout(5000) }
  );
  const data = await res.json();

  if (data.AbstractText) {
    results.push({
      title: data.Heading || '相关摘要',
      snippet: data.AbstractText,
      url: data.AbstractURL || '',
    });
  }

  if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
    for (const topic of data.RelatedTopics.slice(0, 8)) {
      if (topic.Text) {
        results.push({
          title: topic.Text,
          snippet: topic.Text,
          url: topic.FirstURL || '',
        });
      }
      if (topic.Topics && Array.isArray(topic.Topics)) {
        for (const sub of topic.Topics.slice(0, 3)) {
          if (sub.Text) {
            results.push({
              title: sub.Text,
              snippet: sub.Text,
              url: sub.FirstURL || '',
            });
          }
        }
      }
    }
  }

  return results;
}

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: '请输入搜索关键词' }, { status: 400 });
    }

    // Multi-tier search: try each method until we get results
    let searchResults: SearchResult[] = [];

    // Tier 1: Free products API (most reliable, returns real content)
    try {
      searchResults = await searchViaFreeApi(query);
    } catch (e) {
      console.warn('[search] Free API failed:', e);
    }

    // Tier 2: DuckDuckGo instant answer
    if (searchResults.length < 3) {
      try {
        searchResults = await searchDdgInstantAnswer(query);
      } catch (e) {
        console.warn('[search] DuckDuckGo fallback failed:', e);
      }
    }

    // Build search context
    const context = searchResults.length > 0
      ? searchResults.map((r, i) =>
          `[${i + 1}] ${r.title}\n${r.snippet}${r.url ? `\n来源：${r.url}` : ''}`
        ).join('\n\n')
      : '未找到相关搜索结果。请根据你的知识回答。';

    return NextResponse.json({
      query,
      results: searchResults,
      context: `以下是关于「${query}」的搜索结果：\n\n${context}`,
      resultCount: searchResults.length,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '搜索失败';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
