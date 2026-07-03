import { NextRequest, NextResponse } from 'next/server';

async function directFetch(url: string): Promise<{ title: string; content: string }> {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.230 Mobile Safari/537.36',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      Referer: 'https://mp.weixin.qq.com/',
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const html = await res.text();

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';

  // Try to extract WeChat article content from embedded script data
  let content = tryExtractWeChatContent(html);

  if (!content) {
    // Fall back to generic HTML-to-text extraction
    content = genericExtractContent(html);
  }

  return { title, content: content || '未能从该链接提取到有效内容。' };
}

/**
 * Extract article content from WeChat article HTML.
 * WeChat stores content in a <script id="js_content"> tag or in the
 * rich_media_content div with client-side rendering.
 */
function tryExtractWeChatContent(html: string): string | null {
  // Pattern 1: <script id="js_content">...</script>
  const jsContentMatch = html.match(
    /<script[^>]*id="js_content"[^>]*>([\s\S]*?)<\/script>/i,
  );
  if (jsContentMatch) {
    let raw = jsContentMatch[1].trim();
    // The content is usually HTML-entity encoded, decode it
    raw = decodeHtmlEntities(raw);
    // Clean HTML tags
    raw = stripHtmlTags(raw);
    if (raw.length > 50) return raw;
  }

  // Pattern 2: content hidden in a script variable
  // e.g. var ct = "encoded_content"; or window.msg_content = "..."
  const varPatterns = [
    /var\s+ct\s*=\s*["']([\s\S]*?)["']\s*;/,
    /window\.msg_content\s*=\s*["']([\s\S]*?)["']\s*;/,
    /var\s+content\s*=\s*["']([\s\S]*?)["']\s*;/,
    /var\s+msg_content\s*=\s*["']([\s\S]*?)["']\s*;/,
  ];
  for (const pattern of varPatterns) {
    const match = html.match(pattern);
    if (match) {
      let raw = match[1]
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
        .replace(/\\\\/g, '\\');
      raw = stripHtmlTags(raw);
      if (raw.length > 50) return raw;
    }
  }

  return null;
}

function genericExtractContent(html: string): string {
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_m: string, n: string) =>
      String.fromCharCode(parseInt(n, 10)),
    )
    .replace(/\s+/g, ' ')
    .trim();

  // Split into lines and filter
  const lines = text
    .split(/\n|。|！|？/)
    .map((l) => l.trim())
    .filter((l) => {
      const t = l.toLowerCase();
      if (l.length < 12) return false;
      if (/^(copyright|©|分享|收藏|点赞|在看|关注|阅读原文)/.test(t))
        return false;
      if (t.includes('all rights reserved')) return false;
      if (t.includes('分享到')) return false;
      return true;
    });

  return lines.slice(0, 80).join('。') + '。';
}

function stripHtmlTags(text: string): string {
  return text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_m: string, n: string) =>
      String.fromCharCode(parseInt(n, 10)),
    )
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_m: string, n: string) =>
      String.fromCharCode(parseInt(n, 10)),
    )
    .replace(/\\x3c/gi, '<')
    .replace(/\\x3e/gi, '>')
    .replace(/\\x22/gi, '"')
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}

// ─── Browser-based fetch (Playwright) ────────────────────────────────

let browserInstance: Awaited<
  ReturnType<typeof import('playwright-core').chromium.launch>
> | null = null;

async function getBrowser() {
  if (!browserInstance || !browserInstance.isConnected()) {
    const { chromium } = await import('playwright-core');
    browserInstance = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });
  }
  return browserInstance;
}

async function browserFetch(
  url: string,
): Promise<{ title: string; content: string }> {
  const browser = await getBrowser();
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.230 Mobile Safari/537.36',
    locale: 'zh-CN',
    viewport: { width: 390, height: 844 },
  });

  const page = await context.newPage();

  try {
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 20000,
    });

    const title = await page.title();

    // WeChat article: try to get the rich_media_content
    let content = await page.evaluate(() => {
      // Try WeChat's rich media content area
      const richMedia =
        document.querySelector('#js_content') ||
        document.querySelector('.rich_media_content') ||
        document.querySelector('#page-content') ||
        document.querySelector('article') ||
        document.querySelector('.article-content');

      if (richMedia) {
        return (richMedia as HTMLElement).innerText;
      }

      // Fallback: get all visible text
      const body = document.body;
      if (!body) return '';
      const clone = body.cloneNode(true) as HTMLElement;

      // Remove hidden/irrelevant elements
      const selectorsToRemove = [
        'script',
        'style',
        'nav',
        'footer',
        '.rich_media_area_extra',
        '.rich_media_tool',
        '.rich_media_prev',
        '.rich_media_next',
        '.page_toolbar',
        '.discuss_container',
        '.reward_area',
        '.read_more',
        '.like_btn',
        '.share_btn',
        '.bottom_tips',
      ];
      selectorsToRemove.forEach((sel) => {
        clone.querySelectorAll(sel).forEach((el) => el.remove());
      });

      return clone.innerText;
    });

    // Clean up the extracted text
    content = content
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 8)
      .filter((l) => {
        const t = l.toLowerCase();
        if (/^(copyright|©|分享|收藏|点赞|在看|关注|阅读原文)/.test(t))
          return false;
        return true;
      })
      .slice(0, 80)
      .join('\n\n');

    return { title, content: content || '未能从该链接提取到有效内容。' };
  } finally {
    await page.close();
    await context.close();
  }
}

// ─── Main handler ────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: '请提供有效的 URL' }, { status: 400 });
    }

    // Validate URL
    let parsed: URL;
    try {
      parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return NextResponse.json({ error: '不支持的链接协议' }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: '无效的链接格式' }, { status: 400 });
    }

    const isWeChatArticle = parsed.hostname.includes('mp.weixin.qq.com');

    // For WeChat articles, prefer browser-based fetch
    if (isWeChatArticle) {
      console.log(`[fetch-url] WeChat article detected, using browser: ${url}`);
      const result = await browserFetch(url);
      return NextResponse.json({ ...result, url, source: 'browser' });
    }

    // For non-WeChat URLs, try direct fetch first
    try {
      const result = await directFetch(url);
      if (result.content && result.content.length > 100) {
        return NextResponse.json({ ...result, url, source: 'direct' });
      }
    } catch (err) {
      console.log(`[fetch-url] Direct fetch failed, trying browser: ${url}`, err);
    }

    // Fallback to browser fetch for non-WeChat URLs too
    try {
      const result = await browserFetch(url);
      return NextResponse.json({ ...result, url, source: 'browser' });
    } catch (browserErr) {
      console.error(`[fetch-url] Browser fetch also failed: ${url}`, browserErr);
      return NextResponse.json(
        { error: '无法访问该链接，请手动粘贴文章内容。' },
        { status: 400 },
      );
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '未知错误';
    console.error('[fetch-url] Error:', msg);
    return NextResponse.json({ error: `获取失败：${msg}` }, { status: 500 });
  }
}
