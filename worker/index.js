export default {
  async fetch(request, env, ctx) {
    try {
      const { message } = await request.json();
      const apiUrl = env.API_URL;
      const apiKey = env.API_KEY;
      // GraphQL query to call AI
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
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ query, variables })
      });
      const data = await response.json();
      const reply = data.data?.chat?.reply || 'No response';
      return new Response(JSON.stringify({ reply }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (err) {
      return new Response(JSON.stringify({ reply: 'Error processing request.' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      });
    }
  },
};
