// Next.js API Route - 处理聊天请求

export default async function handler(req, res) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // 从环境变量获取 API 配置
    const apiUrl = process.env.API_URL;
    const apiKey = process.env.API_KEY;

    if (!apiUrl || !apiKey) {
      console.error('Missing API_URL or API_KEY environment variables');
      return res.status(500).json({ reply: 'Server configuration error.' });
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
      return res.status(502).json({ reply: 'AI service unavailable.' });
    }

    const data = await response.json();
    const reply = data.data?.chat?.reply || 'No response from AI.';

    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Chat API error:', err);
    return res.status(500).json({ reply: 'Error processing request.' });
  }
}
