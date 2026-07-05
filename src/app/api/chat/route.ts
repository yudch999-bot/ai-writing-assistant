import { NextRequest, NextResponse } from 'next/server';

const PROVIDERS: Record<string, { baseUrl: string; defaultModel: string }> = {
  deepseek: { baseUrl: 'https://api.deepseek.com/v1', defaultModel: 'deepseek-chat' },
  openai: { baseUrl: 'https://api.openai.com/v1', defaultModel: 'gpt-4o-mini' },
  claude: { baseUrl: 'https://api.anthropic.com/v1', defaultModel: 'claude-sonnet-4-20250514' },
  siliconflow: { baseUrl: 'https://api.siliconflow.cn/v1', defaultModel: 'Pro/deepseek-ai/DeepSeek-V3' },
};

const ENV_KEY_MAP: Record<string, string> = {
  deepseek: 'DEEPSEEK_API_KEY',
  openai: 'OPENAI_API_KEY',
  claude: 'ANTHROPIC_API_KEY',
  siliconflow: 'SILICONFLOW_API_KEY',
};

export async function POST(req: NextRequest) {
  try {
    const {
      messages,
      apiKey,
      model = 'deepseek-chat',
      provider = 'deepseek',
      stream = false,
      temperature = 0.7,
      maxTokens = 4096,
    } = await req.json();

    const providerConfig = PROVIDERS[provider];
    if (!providerConfig) {
      return NextResponse.json(
        { error: `不支持的 AI 提供商: ${provider}` },
        { status: 400 },
      );
    }

    // 优先级：服务端环境变量 > 客户端传入的 Key
    const envKeyName = ENV_KEY_MAP[provider];
    const serverKey = process.env[envKeyName] || '';
    const effectiveKey = serverKey || apiKey;

    if (!effectiveKey) {
      return NextResponse.json(
        {
          error:
            `请配置 API Key。推荐：在服务器设置环境变量 ${envKeyName}（安全），或在前端设置中心手动输入 Key。`,
        },
        { status: 400 },
      );
    }

    const body: Record<string, unknown> = {
      model,
      messages,
      stream,
      max_tokens: maxTokens,
      temperature,
    };

    const res = await fetch(`${providerConfig.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${effectiveKey}`,
      },
      body: JSON.stringify(body),
      signal: req.signal,
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`${provider} API error:`, res.status, err.slice(0, 500));
      return NextResponse.json(
        { error: `API 请求失败 (${res.status})：${err.slice(0, 200)}` },
        { status: res.status },
      );
    }

    if (stream) {
      const headers = new Headers({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
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
