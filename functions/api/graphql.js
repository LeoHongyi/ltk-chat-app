// Cloudflare Pages Function - GraphQL API
// 环境变量 API_KEY 和 API_URL 在 Cloudflare Dashboard 中配置

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { query, variables } = await request.json();

    // 解析 GraphQL query
    if (query && query.includes('chat')) {
      const prompt = variables?.prompt || '';
      const reply = await callOpenAI(prompt, env);

      return jsonResponse({
        data: {
          chat: { reply },
        },
      });
    }

    return jsonResponse({ errors: [{ message: 'Unknown query' }] }, 400);
  } catch (err) {
    console.error('GraphQL error:', err);
    return jsonResponse({ errors: [{ message: err.message }] }, 500);
  }
}

// 调用 AI API (支持 OpenAI / DeepSeek 等)
async function callOpenAI(prompt, env) {
  const apiKey = env.API_KEY;
  const apiUrl = env.API_URL || 'https://api.openai.com/v1/chat/completions';
  const model = env.MODEL || 'gpt-3.5-turbo';

  if (!apiKey) {
    throw new Error('API_KEY not configured');
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('AI API error:', response.status, errorText);

    if (response.status === 429) {
      throw new Error('请求太频繁或额度已用完，请稍后再试');
    }
    throw new Error(`AI service error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'No response';
}

// JSON 响应辅助函数
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
