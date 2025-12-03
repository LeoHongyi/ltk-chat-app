/**
 * Mastra AI Agent API for Cloudflare Pages Functions
 *
 * This implements a multi-agent system using Mastra framework concepts.
 * Deployed as part of Cloudflare Pages Functions.
 */

// Agent configurations with system prompts and tools
const AGENTS = {
  assistant: {
    name: 'Assistant',
    systemPrompt: `You are a helpful AI assistant. You provide clear, concise responses.
You can check weather, perform calculations, and analyze text.
Always be polite and helpful.

Available tools:
- get-weather: Get weather for a city
- calculator: Perform math operations (add, subtract, multiply, divide)
- analyze-text: Analyze text for word count and readability`,
    tools: ['weather', 'calculator', 'text-analyzer'],
    temperature: 0.7
  },
  coder: {
    name: 'Coder',
    systemPrompt: `You are an expert software engineer. You specialize in:
- Writing clean, efficient code
- Debugging and code review
- Explaining programming concepts
Use markdown code blocks. Consider edge cases and best practices.

Available tools:
- analyze-code: Analyze code structure and issues
- calculator: Perform calculations`,
    tools: ['code-analyzer', 'calculator'],
    temperature: 0.7
  },
  writer: {
    name: 'Writer',
    systemPrompt: `You are a creative writing specialist. You excel at:
- Creative writing (stories, poems, scripts)
- Professional content (emails, reports)
- Marketing copy and brand messaging
Adapt your style to the user's needs.

Available tools:
- analyze-text: Analyze text metrics`,
    tools: ['text-analyzer'],
    temperature: 0.8
  },
  analyst: {
    name: 'Analyst',
    systemPrompt: `You are a data analysis expert. You specialize in:
- Data interpretation and insights
- Statistical analysis
- Business strategy recommendations
Use structured formatting, bullet points, and tables.

Available tools:
- calculator: Perform calculations
- get-weather: Get weather data
- analyze-text: Analyze text metrics`,
    tools: ['calculator', 'weather', 'text-analyzer'],
    temperature: 0.7
  }
};

// Tool implementations
const TOOLS = {
  'get-weather': async (args) => {
    const weatherData = {
      'beijing': { temp: 15, condition: 'Sunny', humidity: 45 },
      'shanghai': { temp: 18, condition: 'Cloudy', humidity: 65 },
      'new york': { temp: 12, condition: 'Rainy', humidity: 80 },
      'london': { temp: 10, condition: 'Foggy', humidity: 85 },
      'tokyo': { temp: 16, condition: 'Clear', humidity: 55 },
    };
    const city = args.city?.toLowerCase() || '';
    const weather = weatherData[city] || {
      temp: Math.floor(Math.random() * 30),
      condition: ['Sunny', 'Cloudy', 'Rainy', 'Clear'][Math.floor(Math.random() * 4)],
      humidity: Math.floor(Math.random() * 100),
    };
    return { city: args.city, temperature: weather.temp, condition: weather.condition, humidity: weather.humidity, unit: 'celsius' };
  },

  'calculator': async (args) => {
    const { operation, a, b } = args;
    let result;
    switch (operation) {
      case 'add': result = a + b; break;
      case 'subtract': result = a - b; break;
      case 'multiply': result = a * b; break;
      case 'divide': result = b !== 0 ? a / b : 'Error: Division by zero'; break;
      default: result = 'Unknown operation';
    }
    return { operation, a, b, result, expression: `${a} ${operation} ${b} = ${result}` };
  },

  'analyze-code': async (args) => {
    const { code, language } = args;
    const lines = code?.split('\n').length || 0;
    const hasComments = code?.includes('//') || code?.includes('/*') || code?.includes('#');
    const hasFunctions = code?.includes('function') || code?.includes('=>') || code?.includes('def ');
    let detectedLanguage = language;
    if (!detectedLanguage) {
      if (code?.includes('import React')) detectedLanguage = 'React/JavaScript';
      else if (code?.includes('def ') && code?.includes(':')) detectedLanguage = 'Python';
      else detectedLanguage = 'JavaScript/TypeScript';
    }
    return {
      language: detectedLanguage,
      metrics: { lines, hasComments, hasFunctions },
      suggestions: [
        !hasComments ? 'Add comments for better readability' : null,
        lines > 50 ? 'Consider breaking into smaller functions' : null,
      ].filter(Boolean),
    };
  },

  'analyze-text': async (args) => {
    const text = args.text || '';
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;
    let readability = 'Easy';
    if (avgWordsPerSentence > 20) readability = 'Difficult';
    else if (avgWordsPerSentence > 14) readability = 'Moderate';
    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
      readability,
      characterCount: text.length,
    };
  }
};

// Tool definitions for OpenAI function calling
const TOOL_DEFINITIONS = [
  {
    type: 'function',
    function: {
      name: 'get-weather',
      description: 'Get the current weather for a specified city',
      parameters: {
        type: 'object',
        properties: {
          city: { type: 'string', description: 'The city name' }
        },
        required: ['city']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'calculator',
      description: 'Perform mathematical calculations',
      parameters: {
        type: 'object',
        properties: {
          operation: { type: 'string', enum: ['add', 'subtract', 'multiply', 'divide'] },
          a: { type: 'number', description: 'First number' },
          b: { type: 'number', description: 'Second number' }
        },
        required: ['operation', 'a', 'b']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'analyze-code',
      description: 'Analyze code for structure and issues',
      parameters: {
        type: 'object',
        properties: {
          code: { type: 'string', description: 'The code to analyze' },
          language: { type: 'string', description: 'Programming language (optional)' }
        },
        required: ['code']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'analyze-text',
      description: 'Analyze text for metrics and readability',
      parameters: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'The text to analyze' }
        },
        required: ['text']
      }
    }
  }
];

export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const body = await request.json();
    const { message, agentId = 'assistant', history = [] } = body;

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const apiKey = env.API_KEY;
    const apiUrl = env.API_URL || 'https://api.openai.com/v1/chat/completions';
    const model = env.MODEL || 'gpt-4o-mini';

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const agent = AGENTS[agentId] || AGENTS.assistant;

    // Build messages
    const messages = [
      { role: 'system', content: agent.systemPrompt },
      ...history.map(msg => ({ role: msg.role, content: msg.content })),
      { role: 'user', content: message }
    ];

    // First API call with tools
    let response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        tools: TOOL_DEFINITIONS,
        tool_choice: 'auto',
        max_tokens: 2000,
        temperature: agent.temperature,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: '请求太频繁或额度已用完，请稍后再试' }), {
          status: 429,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
      return new Response(JSON.stringify({ error: errorData.error?.message || 'AI service error' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    let data = await response.json();
    let assistantMessage = data.choices?.[0]?.message;
    const toolCalls = [];

    // Handle tool calls
    while (assistantMessage?.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolResults = [];

      for (const toolCall of assistantMessage.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);

        toolCalls.push({
          id: toolCall.id,
          name: toolName,
          args: toolArgs
        });

        // Execute tool
        const toolFn = TOOLS[toolName];
        let result;
        if (toolFn) {
          result = await toolFn(toolArgs);
        } else {
          result = { error: `Unknown tool: ${toolName}` };
        }

        toolResults.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(result)
        });
      }

      // Continue conversation with tool results
      messages.push(assistantMessage);
      messages.push(...toolResults);

      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          tools: TOOL_DEFINITIONS,
          tool_choice: 'auto',
          max_tokens: 2000,
          temperature: agent.temperature,
        }),
      });

      if (!response.ok) {
        break;
      }

      data = await response.json();
      assistantMessage = data.choices?.[0]?.message;
    }

    const reply = assistantMessage?.content || 'No response generated';

    return new Response(JSON.stringify({
      reply,
      agent: agentId,
      toolCalls
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Agent API Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
