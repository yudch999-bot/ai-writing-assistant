import { NextRequest, NextResponse } from 'next/server';

const DEEPSEEK_BASE = 'https://api.deepseek.com/v1';

export async function POST(req: NextRequest) {
  try {
    const { messages, apiKey, model = 'deepseek-chat', stream = false, temperature = 0.7, maxTokens = 4096 } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ error: '请先在设置中心配置 API Key' }, { status: 400 });
    }

    const body: Record<string, unknown> = {
      model,
      messages,
      stream,
      max_tokens: maxTokens,
      temperature,
    };

    const res = await fetch(`${DEEPSEEK_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('DeepSeek API error:', res.status, err);
      return NextResponse.json(
        { error: `API 请求失败 (${res.status})：${err.slice(0, 200)}` },
        { status: res.status }
      );
    }

    if (stream) {
      // Forward SSE stream
      const headers = new Headers({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });
      return new NextResponse(res.body, { headers });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '未知错误';
    console.error('Chat API error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
