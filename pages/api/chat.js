// Next.js API Route - 处理聊天请求
// 在 Cloudflare Workers 环境中，通过 env 获取 API_KEY 和 API_URL

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  // 只允许 POST 请求
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { message } = await request.json();

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 从环境变量获取 API 配置
    // Cloudflare Workers 环境中通过 process.env 访问
    const apiUrl = process.env.API_URL;
    const apiKey = process.env.API_KEY;

    if (!apiUrl || !apiKey) {
      console.error('Missing API_URL or API_KEY environment variables');
      return new Response(JSON.stringify({ reply: 'Server configuration error.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // GraphQL query 调用 AI
    const query = `
      query Chat($prompt: String!) {
        chat(prompt: $prompt) {
          reply
        }
      }
    `;
    const variables = { prompt: message };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      console.error('API response error:', response.status, response.statusText);
      return new Response(JSON.stringify({ reply: 'AI service unavailable.' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const reply = data.data?.chat?.reply || 'No response from AI.';

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Chat API error:', err);
    return new Response(JSON.stringify({ reply: 'Error processing request.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
