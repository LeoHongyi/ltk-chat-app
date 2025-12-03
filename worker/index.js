/**
 * Mastra AI Agent Worker for Cloudflare Workers
 *
 * This worker handles AI agent requests using the Mastra framework.
 * It supports multiple specialized agents with different capabilities.
 */

import { Mastra } from '@mastra/core/mastra';
import { Agent } from '@mastra/core/agent';
import { createTool } from '@mastra/core/tools';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';

// ============================================
// TOOLS DEFINITION
// ============================================

/**
 * Weather Tool - Get current weather information
 */
const weatherTool = createTool({
  id: 'get-weather',
  description: 'Get the current weather for a specified city',
  inputSchema: z.object({
    city: z.string().describe('The city name to get weather for'),
  }),
  execute: async ({ context }) => {
    const weatherData = {
      'beijing': { temp: 15, condition: 'Sunny', humidity: 45 },
      'shanghai': { temp: 18, condition: 'Cloudy', humidity: 65 },
      'new york': { temp: 12, condition: 'Rainy', humidity: 80 },
      'london': { temp: 10, condition: 'Foggy', humidity: 85 },
      'tokyo': { temp: 16, condition: 'Clear', humidity: 55 },
    };

    const city = context.city.toLowerCase();
    const weather = weatherData[city] || {
      temp: Math.floor(Math.random() * 30),
      condition: ['Sunny', 'Cloudy', 'Rainy', 'Clear'][Math.floor(Math.random() * 4)],
      humidity: Math.floor(Math.random() * 100),
    };

    return {
      city: context.city,
      temperature: weather.temp,
      condition: weather.condition,
      humidity: weather.humidity,
      unit: 'celsius',
    };
  },
});

/**
 * Calculator Tool
 */
const calculatorTool = createTool({
  id: 'calculator',
  description: 'Perform mathematical calculations: add, subtract, multiply, divide',
  inputSchema: z.object({
    operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
    a: z.number(),
    b: z.number(),
  }),
  execute: async ({ context }) => {
    const { operation, a, b } = context;
    let result;
    switch (operation) {
      case 'add': result = a + b; break;
      case 'subtract': result = a - b; break;
      case 'multiply': result = a * b; break;
      case 'divide': result = b !== 0 ? a / b : 'Error: Division by zero'; break;
    }
    return { operation, a, b, result, expression: `${a} ${operation} ${b} = ${result}` };
  },
});

/**
 * Code Analyzer Tool
 */
const codeAnalyzerTool = createTool({
  id: 'analyze-code',
  description: 'Analyze code snippets for structure and potential issues',
  inputSchema: z.object({
    code: z.string().describe('The code to analyze'),
    language: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const { code, language } = context;
    const lines = code.split('\n').length;
    const hasComments = code.includes('//') || code.includes('/*') || code.includes('#');
    const hasFunctions = code.includes('function') || code.includes('=>') || code.includes('def ');

    let detectedLanguage = language;
    if (!detectedLanguage) {
      if (code.includes('import React')) detectedLanguage = 'React/JavaScript';
      else if (code.includes('def ') && code.includes(':')) detectedLanguage = 'Python';
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
});

/**
 * Text Analyzer Tool
 */
const textAnalyzerTool = createTool({
  id: 'analyze-text',
  description: 'Analyze text for word count, readability, and metrics',
  inputSchema: z.object({
    text: z.string().describe('The text to analyze'),
  }),
  execute: async ({ context }) => {
    const { text } = context;
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
  },
});

// ============================================
// AGENTS DEFINITION
// ============================================

/**
 * Create agents with environment-based model configuration
 */
function createAgents(env) {
  // Create OpenAI provider with API key from environment
  const openai = createOpenAI({
    apiKey: env.API_KEY,
  });

  const modelName = env.MODEL || 'gpt-4o-mini';
  const model = openai(modelName);

  const assistantAgent = new Agent({
    name: 'assistant',
    instructions: `You are a helpful AI assistant. You provide clear, concise responses.
You can check weather, perform calculations, and analyze text.
Always be polite and helpful.`,
    model: model,
    tools: { weatherTool, calculatorTool, textAnalyzerTool },
  });

  const coderAgent = new Agent({
    name: 'coder',
    instructions: `You are an expert software engineer. You specialize in:
- Writing clean, efficient code
- Debugging and code review
- Explaining programming concepts
Use markdown code blocks. Consider edge cases and best practices.`,
    model: model,
    tools: { codeAnalyzerTool, calculatorTool },
  });

  const writerAgent = new Agent({
    name: 'writer',
    instructions: `You are a creative writing specialist. You excel at:
- Creative writing (stories, poems, scripts)
- Professional content (emails, reports)
- Marketing copy and brand messaging
Adapt your style to the user's needs.`,
    model: model,
    tools: { textAnalyzerTool },
  });

  const analystAgent = new Agent({
    name: 'analyst',
    instructions: `You are a data analysis expert. You specialize in:
- Data interpretation and insights
- Statistical analysis
- Business strategy recommendations
Use structured formatting, bullet points, and tables.`,
    model: model,
    tools: { calculatorTool, weatherTool, textAnalyzerTool },
  });

  return { assistant: assistantAgent, coder: coderAgent, writer: writerAgent, analyst: analystAgent };
}

// ============================================
// WORKER HANDLER
// ============================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Health check endpoint
    if (url.pathname === '/api/health' || url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        service: 'Mastra AI Agent Worker',
        agents: ['assistant', 'coder', 'writer', 'analyst'],
        timestamp: new Date().toISOString(),
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // List agents endpoint
    if (url.pathname === '/api/agents' && request.method === 'GET') {
      return new Response(JSON.stringify({
        agents: [
          { id: 'assistant', name: 'Assistant', description: 'General-purpose AI assistant', icon: '🤖' },
          { id: 'coder', name: 'Coder', description: 'Expert in programming and code review', icon: '💻' },
          { id: 'writer', name: 'Writer', description: 'Creative writing and content', icon: '✍️' },
          { id: 'analyst', name: 'Analyst', description: 'Data analysis and insights', icon: '📊' },
        ],
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Agent chat endpoint
    if (url.pathname === '/api/agent' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { message, agentId = 'assistant', history = [] } = body;

        if (!message || typeof message !== 'string') {
          return new Response(JSON.stringify({ error: 'Message is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        if (!env.API_KEY) {
          return new Response(JSON.stringify({ error: 'API key not configured' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        // Create agents with environment config
        const agents = createAgents(env);
        const agent = agents[agentId] || agents.assistant;

        // Build messages array
        const messages = [
          ...history.map(msg => ({ role: msg.role, content: msg.content })),
          { role: 'user', content: message },
        ];

        // Generate response using Mastra agent
        const response = await agent.generate(messages);

        return new Response(JSON.stringify({
          reply: response.text,
          agent: agentId,
          toolCalls: response.toolCalls || [],
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });

      } catch (error) {
        console.error('Agent Error:', error);

        // Handle rate limit errors
        if (error.message?.includes('429') || error.message?.includes('rate limit')) {
          return new Response(JSON.stringify({
            error: '请求太频繁或额度已用完，请稍后再试',
          }), {
            status: 429,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        return new Response(JSON.stringify({
          error: error.message || 'Internal server error',
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    // 404 for other routes
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  },
};
