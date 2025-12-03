import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

/**
 * Weather Tool - Get current weather information
 */
export const weatherTool = createTool({
  id: 'get-weather',
  description: 'Get the current weather for a specified city',
  inputSchema: z.object({
    city: z.string().describe('The city name to get weather for'),
  }),
  execute: async ({ context }) => {
    // Simulated weather data (in production, call a real weather API)
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
 * Calculator Tool - Perform mathematical calculations
 */
export const calculatorTool = createTool({
  id: 'calculator',
  description: 'Perform mathematical calculations. Supports basic operations: add, subtract, multiply, divide',
  inputSchema: z.object({
    operation: z.enum(['add', 'subtract', 'multiply', 'divide']).describe('The mathematical operation to perform'),
    a: z.number().describe('The first number'),
    b: z.number().describe('The second number'),
  }),
  execute: async ({ context }) => {
    const { operation, a, b } = context;
    let result;

    switch (operation) {
      case 'add':
        result = a + b;
        break;
      case 'subtract':
        result = a - b;
        break;
      case 'multiply':
        result = a * b;
        break;
      case 'divide':
        if (b === 0) {
          return { error: 'Cannot divide by zero' };
        }
        result = a / b;
        break;
      default:
        return { error: 'Unknown operation' };
    }

    return {
      operation,
      a,
      b,
      result,
      expression: `${a} ${operation} ${b} = ${result}`,
    };
  },
});

/**
 * Code Analyzer Tool - Analyze code snippets
 */
export const codeAnalyzerTool = createTool({
  id: 'analyze-code',
  description: 'Analyze a code snippet and provide insights about its structure and potential issues',
  inputSchema: z.object({
    code: z.string().describe('The code snippet to analyze'),
    language: z.string().optional().describe('The programming language (optional, will be auto-detected)'),
  }),
  execute: async ({ context }) => {
    const { code, language } = context;

    // Simple analysis
    const lines = code.split('\n').length;
    const hasComments = code.includes('//') || code.includes('/*') || code.includes('#');
    const hasFunctions = code.includes('function') || code.includes('=>') || code.includes('def ');
    const hasClasses = code.includes('class ');

    // Detect language if not provided
    let detectedLanguage = language;
    if (!detectedLanguage) {
      if (code.includes('import React') || code.includes('useState')) {
        detectedLanguage = 'React/JavaScript';
      } else if (code.includes('def ') && code.includes(':')) {
        detectedLanguage = 'Python';
      } else if (code.includes('func ') && code.includes('package')) {
        detectedLanguage = 'Go';
      } else if (code.includes('fn ') && code.includes('let mut')) {
        detectedLanguage = 'Rust';
      } else {
        detectedLanguage = 'JavaScript/TypeScript';
      }
    }

    return {
      language: detectedLanguage,
      metrics: {
        lines,
        hasComments,
        hasFunctions,
        hasClasses,
      },
      suggestions: [
        !hasComments ? 'Consider adding comments to improve code readability' : null,
        lines > 50 ? 'Consider breaking this into smaller functions' : null,
      ].filter(Boolean),
    };
  },
});

/**
 * Text Analyzer Tool - Analyze text content
 */
export const textAnalyzerTool = createTool({
  id: 'analyze-text',
  description: 'Analyze text content for word count, readability, and other metrics',
  inputSchema: z.object({
    text: z.string().describe('The text to analyze'),
  }),
  execute: async ({ context }) => {
    const { text } = context;

    const words = text.split(/\s+/).filter(w => w.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);

    const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;

    // Simple readability score (based on average sentence length)
    let readability = 'Easy';
    if (avgWordsPerSentence > 20) readability = 'Difficult';
    else if (avgWordsPerSentence > 14) readability = 'Moderate';

    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      paragraphCount: paragraphs.length,
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
      readability,
      characterCount: text.length,
    };
  },
});

export const allTools = {
  weatherTool,
  calculatorTool,
  codeAnalyzerTool,
  textAnalyzerTool,
};
