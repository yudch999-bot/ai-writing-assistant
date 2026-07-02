import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: '请提供有效的 URL' }, { status: 400 });
    }

    // Validate URL
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return NextResponse.json({ error: '不支持的链接协议' }, { status: 400 });
    }

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: `无法访问链接 (${res.status})` }, { status: 400 });
    }

    const html = await res.text();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    // Extract text content - remove scripts, styles, tags
    let text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();

    // Try to find the main content (after title, before footer-like text)
    const lines = text.split('\n').filter(l => l.trim().length > 10);
    // Remove obvious nav/header/footer lines
    const contentLines = lines.filter(l => {
      const t = l.trim().toLowerCase();
      if (t.length < 15) return false;
      if (t.startsWith('copyright') || t.startsWith('©')) return false;
      if (t.includes('all rights reserved')) return false;
      if (t.includes('分享到')) return false;
      if (t.match(/^(分享|收藏|点赞|在看|关注)/)) return false;
      return true;
    });

    const content = contentLines.slice(0, 80).join('\n\n');

    return NextResponse.json({
      title,
      content: content || '未能从该链接提取到有效内容，请手动粘贴文章全文。',
      url,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'TimeoutError') {
      return NextResponse.json({ error: '获取链接超时，请手动粘贴内容' }, { status: 408 });
    }
    const msg = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ error: `获取失败：${msg}` }, { status: 500 });
  }
}
