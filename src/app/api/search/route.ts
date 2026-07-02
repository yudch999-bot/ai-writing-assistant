import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: '请输入搜索关键词' }, { status: 400 });
    }

    // Use DuckDuckGo instant answer API (free, no key)
    const ddgRes = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`,
      { signal: AbortSignal.timeout(8000) }
    );

    const ddgData = await ddgRes.json();

    // Also search web for top results via a lightweight engine
    const searchResults: { title: string; snippet: string; url: string }[] = [];

    // Add abstract from DDG if available
    if (ddgData.AbstractText) {
      searchResults.push({
        title: ddgData.Heading || '相关摘要',
        snippet: ddgData.AbstractText,
        url: ddgData.AbstractURL || '',
      });
    }

    // Add related topics
    if (ddgData.RelatedTopics && Array.isArray(ddgData.RelatedTopics)) {
      for (const topic of ddgData.RelatedTopics.slice(0, 8)) {
        if (topic.Text) {
          searchResults.push({
            title: typeof topic === 'string' ? topic : topic.Text || '',
            snippet: typeof topic === 'string' ? topic : topic.Text || '',
            url: topic.FirstURL || '',
          });
        }
        // Handle sub-topics
        if (topic.Topics && Array.isArray(topic.Topics)) {
          for (const sub of topic.Topics.slice(0, 3)) {
            if (sub.Text) {
              searchResults.push({
                title: sub.Text,
                snippet: sub.Text,
                url: sub.FirstURL || '',
              });
            }
          }
        }
      }
    }

    // Build search context for AI
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
