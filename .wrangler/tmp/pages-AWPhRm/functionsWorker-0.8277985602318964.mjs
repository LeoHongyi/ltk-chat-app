var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../.wrangler/tmp/bundle-ao05CD/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// api/agent.js
var AGENTS = {
  assistant: {
    name: "Assistant",
    systemPrompt: `You are a helpful AI assistant. You provide clear, concise responses.
You can check weather, perform calculations, and analyze text.
Always be polite and helpful.

Available tools:
- get-weather: Get weather for a city
- calculator: Perform math operations (add, subtract, multiply, divide)
- analyze-text: Analyze text for word count and readability`,
    tools: ["weather", "calculator", "text-analyzer"],
    temperature: 0.7
  },
  coder: {
    name: "Coder",
    systemPrompt: `You are an expert software engineer. You specialize in:
- Writing clean, efficient code
- Debugging and code review
- Explaining programming concepts
Use markdown code blocks. Consider edge cases and best practices.

Available tools:
- analyze-code: Analyze code structure and issues
- calculator: Perform calculations`,
    tools: ["code-analyzer", "calculator"],
    temperature: 0.7
  },
  writer: {
    name: "Writer",
    systemPrompt: `You are a creative writing specialist. You excel at:
- Creative writing (stories, poems, scripts)
- Professional content (emails, reports)
- Marketing copy and brand messaging
Adapt your style to the user's needs.

Available tools:
- analyze-text: Analyze text metrics`,
    tools: ["text-analyzer"],
    temperature: 0.8
  },
  analyst: {
    name: "Analyst",
    systemPrompt: `You are a data analysis expert. You specialize in:
- Data interpretation and insights
- Statistical analysis
- Business strategy recommendations
Use structured formatting, bullet points, and tables.

Available tools:
- calculator: Perform calculations
- get-weather: Get weather data
- analyze-text: Analyze text metrics`,
    tools: ["calculator", "weather", "text-analyzer"],
    temperature: 0.7
  }
};
var TOOLS = {
  "get-weather": async (args) => {
    const weatherData = {
      "beijing": { temp: 15, condition: "Sunny", humidity: 45 },
      "shanghai": { temp: 18, condition: "Cloudy", humidity: 65 },
      "new york": { temp: 12, condition: "Rainy", humidity: 80 },
      "london": { temp: 10, condition: "Foggy", humidity: 85 },
      "tokyo": { temp: 16, condition: "Clear", humidity: 55 }
    };
    const city = args.city?.toLowerCase() || "";
    const weather = weatherData[city] || {
      temp: Math.floor(Math.random() * 30),
      condition: ["Sunny", "Cloudy", "Rainy", "Clear"][Math.floor(Math.random() * 4)],
      humidity: Math.floor(Math.random() * 100)
    };
    return { city: args.city, temperature: weather.temp, condition: weather.condition, humidity: weather.humidity, unit: "celsius" };
  },
  "calculator": async (args) => {
    const { operation, a, b } = args;
    let result;
    switch (operation) {
      case "add":
        result = a + b;
        break;
      case "subtract":
        result = a - b;
        break;
      case "multiply":
        result = a * b;
        break;
      case "divide":
        result = b !== 0 ? a / b : "Error: Division by zero";
        break;
      default:
        result = "Unknown operation";
    }
    return { operation, a, b, result, expression: `${a} ${operation} ${b} = ${result}` };
  },
  "analyze-code": async (args) => {
    const { code, language } = args;
    const lines = code?.split("\n").length || 0;
    const hasComments = code?.includes("//") || code?.includes("/*") || code?.includes("#");
    const hasFunctions = code?.includes("function") || code?.includes("=>") || code?.includes("def ");
    let detectedLanguage = language;
    if (!detectedLanguage) {
      if (code?.includes("import React"))
        detectedLanguage = "React/JavaScript";
      else if (code?.includes("def ") && code?.includes(":"))
        detectedLanguage = "Python";
      else
        detectedLanguage = "JavaScript/TypeScript";
    }
    return {
      language: detectedLanguage,
      metrics: { lines, hasComments, hasFunctions },
      suggestions: [
        !hasComments ? "Add comments for better readability" : null,
        lines > 50 ? "Consider breaking into smaller functions" : null
      ].filter(Boolean)
    };
  },
  "analyze-text": async (args) => {
    const text = args.text || "";
    const words = text.split(/\s+/).filter((w) => w.length > 0);
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;
    let readability = "Easy";
    if (avgWordsPerSentence > 20)
      readability = "Difficult";
    else if (avgWordsPerSentence > 14)
      readability = "Moderate";
    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
      readability,
      characterCount: text.length
    };
  }
};
var TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "get-weather",
      description: "Get the current weather for a specified city",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "The city name" }
        },
        required: ["city"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "calculator",
      description: "Perform mathematical calculations",
      parameters: {
        type: "object",
        properties: {
          operation: { type: "string", enum: ["add", "subtract", "multiply", "divide"] },
          a: { type: "number", description: "First number" },
          b: { type: "number", description: "Second number" }
        },
        required: ["operation", "a", "b"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "analyze-code",
      description: "Analyze code for structure and issues",
      parameters: {
        type: "object",
        properties: {
          code: { type: "string", description: "The code to analyze" },
          language: { type: "string", description: "Programming language (optional)" }
        },
        required: ["code"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "analyze-text",
      description: "Analyze text for metrics and readability",
      parameters: {
        type: "object",
        properties: {
          text: { type: "string", description: "The text to analyze" }
        },
        required: ["text"]
      }
    }
  }
];
async function onRequestPost(context) {
  const { request, env } = context;
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  try {
    const body = await request.json();
    const { message, agentId = "assistant", history = [] } = body;
    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
    const apiKey = env.API_KEY;
    const apiUrl = env.API_URL || "https://api.openai.com/v1/chat/completions";
    const model = env.MODEL || "gpt-4o-mini";
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
    const agent = AGENTS[agentId] || AGENTS.assistant;
    const messages = [
      { role: "system", content: agent.systemPrompt },
      ...history.map((msg) => ({ role: msg.role, content: msg.content })),
      { role: "user", content: message }
    ];
    let response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        tools: TOOL_DEFINITIONS,
        tool_choice: "auto",
        max_tokens: 2e3,
        temperature: agent.temperature
      })
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "\u8BF7\u6C42\u592A\u9891\u7E41\u6216\u989D\u5EA6\u5DF2\u7528\u5B8C\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5" }), {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }
      return new Response(JSON.stringify({ error: errorData.error?.message || "AI service error" }), {
        status: response.status,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
    let data = await response.json();
    let assistantMessage = data.choices?.[0]?.message;
    const toolCalls = [];
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
        const toolFn = TOOLS[toolName];
        let result;
        if (toolFn) {
          result = await toolFn(toolArgs);
        } else {
          result = { error: `Unknown tool: ${toolName}` };
        }
        toolResults.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result)
        });
      }
      messages.push(assistantMessage);
      messages.push(...toolResults);
      response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          tools: TOOL_DEFINITIONS,
          tool_choice: "auto",
          max_tokens: 2e3,
          temperature: agent.temperature
        })
      });
      if (!response.ok) {
        break;
      }
      data = await response.json();
      assistantMessage = data.choices?.[0]?.message;
    }
    const reply = assistantMessage?.content || "No response generated";
    return new Response(JSON.stringify({
      reply,
      agent: agentId,
      toolCalls
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  } catch (error) {
    console.error("Agent API Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
}
__name(onRequestPost, "onRequestPost");
async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
__name(onRequestOptions, "onRequestOptions");

// api/graphql.js
async function onRequestPost2(context) {
  const { request, env } = context;
  try {
    const { query, variables } = await request.json();
    if (query && query.includes("chat")) {
      const prompt = variables?.prompt || "";
      const reply = await callOpenAI(prompt, env);
      return jsonResponse({
        data: {
          chat: { reply }
        }
      });
    }
    return jsonResponse({ errors: [{ message: "Unknown query" }] }, 400);
  } catch (err) {
    console.error("GraphQL error:", err);
    return jsonResponse({ errors: [{ message: err.message }] }, 500);
  }
}
__name(onRequestPost2, "onRequestPost");
async function callOpenAI(prompt, env) {
  const apiKey = env.API_KEY;
  const apiUrl = env.API_URL || "https://api.openai.com/v1/chat/completions";
  const model = env.MODEL || "gpt-3.5-turbo";
  if (!apiKey) {
    throw new Error("API_KEY not configured");
  }
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt }
      ]
    })
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI API error:", response.status, errorText);
    if (response.status === 429) {
      throw new Error("\u8BF7\u6C42\u592A\u9891\u7E41\u6216\u989D\u5EA6\u5DF2\u7528\u5B8C\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5");
    }
    throw new Error(`AI service error: ${response.status}`);
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "No response";
}
__name(callOpenAI, "callOpenAI");
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}
__name(jsonResponse, "jsonResponse");

// api/story-workshop.js
var AGENTS2 = {
  educator: {
    name: "Educator",
    emoji: "\u{1F4DA}",
    systemPrompt: `\u4F60\u662F\u4E00\u4F4D\u4E13\u4E1A\u7684\u5E7C\u513F\u6559\u80B2\u4E13\u5BB6\u3002\u6839\u636E\u7528\u6237\u63D0\u4F9B\u7684\u6559\u80B2\u4E3B\u9898\u548C\u5B69\u5B50\u4FE1\u606F\uFF0C\u5206\u6790\u5E76\u786E\u5B9A\u9002\u5408\u8BE5\u5E74\u9F84\u6BB5\u7684\u6559\u80B2\u76EE\u6807\u3002

\u8BF7\u8F93\u51FA\uFF1A
1. \u6838\u5FC3\u6559\u80B2\u76EE\u6807\uFF081-2\u4E2A\uFF09
2. \u9002\u9F84\u7684\u8868\u8FBE\u65B9\u5F0F\u5EFA\u8BAE
3. \u6545\u4E8B\u5E94\u8BE5\u4F20\u8FBE\u7684\u4EF7\u503C\u89C2

\u8F93\u51FA\u683C\u5F0F\u4E3AJSON\uFF1A
{
  "goals": ["\u76EE\u68071", "\u76EE\u68072"],
  "ageAppropriate": "\u9002\u9F84\u8868\u8FBE\u5EFA\u8BAE",
  "values": ["\u4EF7\u503C\u89C21", "\u4EF7\u503C\u89C22"]
}`
  },
  storyteller: {
    name: "Storyteller",
    emoji: "\u2728",
    systemPrompt: `\u4F60\u662F\u4E00\u4F4D\u4E13\u4E1A\u7684\u513F\u7AE5\u6545\u4E8B\u4F5C\u5BB6\u3002\u6839\u636E\u6559\u80B2\u76EE\u6807\u521B\u4F5C\u4E00\u4E2A\u6E29\u99A8\u6709\u8DA3\u7684\u77ED\u6545\u4E8B\u3002

\u8981\u6C42\uFF1A
1. \u6545\u4E8B\u8981\u878D\u5165\u5B69\u5B50\u7684\u540D\u5B57\u4F5C\u4E3A\u4E3B\u89D2
2. \u878D\u5165\u5B69\u5B50\u559C\u6B22\u7684\u52A8\u7269\u4F5C\u4E3A\u89D2\u8272
3. \u4F7F\u7528\u7B80\u5355\u6613\u61C2\u7684\u8BED\u8A00
4. \u6545\u4E8B\u52063-4\u4E2A\u5C0F\u7AE0\u8282
5. \u6BCF\u4E2A\u7AE0\u8282100-150\u5B57
6. \u7ED3\u5C40\u8981\u79EF\u6781\u5411\u4E0A

\u8F93\u51FA\u683C\u5F0F\u4E3AJSON\uFF1A
{
  "title": "\u6545\u4E8B\u6807\u9898",
  "chapters": [
    {"title": "\u7AE0\u8282\u6807\u9898", "content": "\u7AE0\u8282\u5185\u5BB9"},
    ...
  ]
}`
  },
  artist: {
    name: "Artist",
    emoji: "\u{1F3A8}",
    systemPrompt: `\u4F60\u662F\u4E00\u4F4D\u513F\u7AE5\u7ED8\u672C\u63D2\u753B\u5E08\u3002\u4E3A\u6545\u4E8B\u7684\u6BCF\u4E2A\u573A\u666F\u63D0\u4F9B\u8BE6\u7EC6\u7684\u753B\u9762\u63CF\u8FF0\uFF0C\u8FD9\u4E9B\u63CF\u8FF0\u5C06\u7528\u4E8EAI\u7ED8\u56FE\u3002

\u8981\u6C42\uFF1A
1. \u753B\u9762\u8981\u8272\u5F69\u660E\u4EAE\u3001\u6E29\u99A8\u53EF\u7231
2. \u9002\u5408\u513F\u7AE5\u7684\u5361\u901A\u98CE\u683C
3. \u6BCF\u4E2A\u573A\u666F\u63CF\u8FF0\u8981\u5177\u4F53\u3001\u53EF\u89C6\u5316
4. \u4F7F\u7528\u82F1\u6587\u63CF\u8FF0\uFF08\u7528\u4E8EAI\u7ED8\u56FE\uFF09

\u8F93\u51FA\u683C\u5F0F\u4E3AJSON\uFF1A
{
  "scenes": [
    {"sceneId": 1, "description": "\u573A\u666F\u63CF\u8FF0", "prompt": "\u82F1\u6587\u7ED8\u56FE\u63D0\u793A\u8BCD"},
    ...
  ]
}`
  },
  gameDesigner: {
    name: "Game Designer",
    emoji: "\u{1F3AE}",
    systemPrompt: `\u4F60\u662F\u4E00\u4F4D\u513F\u7AE5\u6559\u80B2\u6E38\u620F\u8BBE\u8BA1\u5E08\u3002\u4E3A\u6545\u4E8B\u8BBE\u8BA1\u4E92\u52A8\u95EE\u7B54\u73AF\u8282\u3002

\u8981\u6C42\uFF1A
1. \u95EE\u9898\u8981\u7B80\u5355\u6709\u8DA3
2. \u7B54\u6848\u9009\u9879\u8981\u9002\u5408\u5E7C\u513F\u7406\u89E3
3. \u6BCF\u4E2A\u95EE\u9898\u90FD\u8981\u6709\u6559\u80B2\u610F\u4E49
4. \u8BBE\u8BA12-3\u4E2A\u4E92\u52A8\u95EE\u7B54

\u8F93\u51FA\u683C\u5F0F\u4E3AJSON\uFF1A
{
  "interactions": [
    {
      "question": "\u95EE\u9898\u5185\u5BB9",
      "options": ["\u9009\u9879A", "\u9009\u9879B", "\u9009\u9879C"],
      "correctAnswer": 0,
      "explanation": "\u7B54\u6848\u89E3\u91CA\u548C\u6559\u80B2\u610F\u4E49"
    },
    ...
  ]
}`
  },
  safety: {
    name: "Safety Reviewer",
    emoji: "\u{1F6E1}\uFE0F",
    systemPrompt: `\u4F60\u662F\u4E00\u4F4D\u513F\u7AE5\u5185\u5BB9\u5B89\u5168\u5BA1\u6838\u4E13\u5BB6\u3002\u5BA1\u6838\u6545\u4E8B\u5185\u5BB9\u662F\u5426\u9002\u5408\u513F\u7AE5\u3002

\u68C0\u67E5\u8981\u70B9\uFF1A
1. \u662F\u5426\u6709\u4E0D\u9002\u5408\u513F\u7AE5\u7684\u5185\u5BB9
2. \u662F\u5426\u4F20\u9012\u6B63\u5411\u79EF\u6781\u7684\u4EF7\u503C\u89C2
3. \u8BED\u8A00\u662F\u5426\u9002\u5408\u76EE\u6807\u5E74\u9F84
4. \u662F\u5426\u6709\u6F5C\u5728\u7684\u8D1F\u9762\u5F71\u54CD

\u8F93\u51FA\u683C\u5F0F\u4E3AJSON\uFF1A
{
  "approved": true/false,
  "safetyScore": 1-10,
  "issues": ["\u95EE\u98981", ...] \u6216 [],
  "suggestions": ["\u5EFA\u8BAE1", ...] \u6216 []
}`
  },
  narrator: {
    name: "Narrator",
    emoji: "\u{1F399}\uFE0F",
    systemPrompt: `\u4F60\u662F\u4E00\u4F4D\u4E13\u4E1A\u7684\u513F\u7AE5\u6545\u4E8B\u6717\u8BFB\u8005\u3002\u5C06\u6240\u6709\u5185\u5BB9\u6574\u5408\u6210\u4E00\u4E2A\u5B8C\u6574\u7684\u3001\u9002\u5408\u6717\u8BFB\u7684\u6545\u4E8B\u7248\u672C\u3002

\u8981\u6C42\uFF1A
1. \u8BED\u8A00\u6D41\u7545\u3001\u9002\u5408\u5927\u58F0\u6717\u8BFB
2. \u5728\u9002\u5F53\u4F4D\u7F6E\u52A0\u5165\u8BED\u6C14\u8BCD\u548C\u505C\u987F\u63D0\u793A
3. \u6574\u5408\u4E92\u52A8\u95EE\u7B54\u5230\u6545\u4E8B\u4E2D
4. \u52A0\u5165\u5F00\u573A\u767D\u548C\u7ED3\u675F\u8BED

\u8F93\u51FA\u683C\u5F0F\u4E3AJSON\uFF1A
{
  "openingLine": "\u5F00\u573A\u767D",
  "fullStory": "\u5B8C\u6574\u6545\u4E8B\u6587\u672C\uFF08\u5305\u542B\u6717\u8BFB\u63D0\u793A\uFF09",
  "closingLine": "\u7ED3\u675F\u8BED",
  "readingTime": "\u9884\u8BA1\u6717\u8BFB\u65F6\u95F4\uFF08\u5206\u949F\uFF09"
}`
  }
};
async function callAgent(agentId, userMessage, env) {
  const agent = AGENTS2[agentId];
  const apiKey = env.API_KEY;
  const apiUrl = env.API_URL || "https://api.openai.com/v1/chat/completions";
  const model = env.MODEL || "gpt-4o-mini";
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: agent.systemPrompt },
        { role: "user", content: userMessage }
      ],
      max_tokens: 2e3,
      temperature: 0.8,
      response_format: { type: "json_object" }
    })
  });
  if (!response.ok) {
    throw new Error(`Agent ${agentId} failed: ${response.status}`);
  }
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  try {
    return JSON.parse(content);
  } catch {
    return { raw: content };
  }
}
__name(callAgent, "callAgent");
async function executeWorkflow(input, env, onProgress) {
  const { theme, childName, childAge, favoriteAnimal } = input;
  const results = {
    steps: [],
    finalStory: null
  };
  const baseContext = `
\u4E3B\u9898\uFF1A${theme}
\u5B69\u5B50\u540D\u5B57\uFF1A${childName}
\u5B69\u5B50\u5E74\u9F84\uFF1A${childAge}\u5C81
\u559C\u6B22\u7684\u52A8\u7269\uFF1A${favoriteAnimal}
`;
  onProgress?.({ step: "educator", status: "running", message: "\u{1F4DA} \u6559\u80B2\u4E13\u5BB6\u6B63\u5728\u5206\u6790\u6559\u80B2\u76EE\u6807..." });
  const educatorResult = await callAgent("educator", baseContext, env);
  results.steps.push({ agent: "educator", result: educatorResult });
  onProgress?.({ step: "educator", status: "done", result: educatorResult });
  const educatorContext = `
${baseContext}
\u6559\u80B2\u76EE\u6807\uFF1A${JSON.stringify(educatorResult)}
`;
  onProgress?.({ step: "parallel", status: "running", message: "\u2728\u{1F3A8}\u{1F3AE} \u521B\u4F5C\u56E2\u961F\u5E76\u884C\u5DE5\u4F5C\u4E2D..." });
  const [storytellerResult, artistResult, gameDesignerResult] = await Promise.all([
    callAgent("storyteller", educatorContext, env),
    callAgent("artist", educatorContext, env),
    callAgent("gameDesigner", educatorContext, env)
  ]);
  results.steps.push({ agent: "storyteller", result: storytellerResult });
  results.steps.push({ agent: "artist", result: artistResult });
  results.steps.push({ agent: "gameDesigner", result: gameDesignerResult });
  onProgress?.({ step: "parallel", status: "done" });
  onProgress?.({ step: "safety", status: "running", message: "\u{1F6E1}\uFE0F \u5B89\u5168\u4E13\u5BB6\u6B63\u5728\u5BA1\u6838\u5185\u5BB9..." });
  const contentForReview = `
\u6545\u4E8B\uFF1A${JSON.stringify(storytellerResult)}
\u4E92\u52A8\u95EE\u7B54\uFF1A${JSON.stringify(gameDesignerResult)}
\u76EE\u6807\u5E74\u9F84\uFF1A${childAge}\u5C81
`;
  const safetyResult = await callAgent("safety", contentForReview, env);
  results.steps.push({ agent: "safety", result: safetyResult });
  onProgress?.({ step: "safety", status: "done", result: safetyResult });
  onProgress?.({ step: "narrator", status: "running", message: "\u{1F399}\uFE0F \u6B63\u5728\u6574\u5408\u751F\u6210\u6700\u7EC8\u6545\u4E8B..." });
  const allContent = `
\u5B69\u5B50\u540D\u5B57\uFF1A${childName}
\u6559\u80B2\u76EE\u6807\uFF1A${JSON.stringify(educatorResult)}
\u6545\u4E8B\u5185\u5BB9\uFF1A${JSON.stringify(storytellerResult)}
\u4E92\u52A8\u95EE\u7B54\uFF1A${JSON.stringify(gameDesignerResult)}
\u573A\u666F\u63CF\u8FF0\uFF1A${JSON.stringify(artistResult)}
`;
  const narratorResult = await callAgent("narrator", allContent, env);
  results.steps.push({ agent: "narrator", result: narratorResult });
  onProgress?.({ step: "narrator", status: "done" });
  results.finalStory = {
    title: storytellerResult.title,
    childName,
    childAge,
    theme,
    favoriteAnimal,
    educationGoals: educatorResult,
    story: storytellerResult,
    scenes: artistResult,
    interactions: gameDesignerResult,
    safetyReview: safetyResult,
    narration: narratorResult
  };
  return results;
}
__name(executeWorkflow, "executeWorkflow");
async function onRequestPost3(context) {
  const { request, env } = context;
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  try {
    const body = await request.json();
    const { theme, childName, childAge, favoriteAnimal } = body;
    if (!theme || !childName || !childAge || !favoriteAnimal) {
      return new Response(JSON.stringify({
        error: "\u8BF7\u586B\u5199\u6240\u6709\u5FC5\u586B\u9879\uFF1A\u4E3B\u9898\u3001\u5B69\u5B50\u540D\u5B57\u3001\u5E74\u9F84\u3001\u559C\u6B22\u7684\u52A8\u7269"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
    if (!env.API_KEY) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
    const results = await executeWorkflow(
      { theme, childName, childAge, favoriteAnimal },
      env
    );
    return new Response(JSON.stringify({
      success: true,
      workflow: results.steps.map((s) => ({
        agent: s.agent,
        emoji: AGENTS2[s.agent]?.emoji,
        name: AGENTS2[s.agent]?.name
      })),
      story: results.finalStory
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  } catch (error) {
    console.error("Story Workshop Error:", error);
    return new Response(JSON.stringify({
      error: error.message || "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
}
__name(onRequestPost3, "onRequestPost");
async function onRequestOptions2() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
__name(onRequestOptions2, "onRequestOptions");

// api/user.js
async function onRequestPost4(context) {
  const { request } = context;
  try {
    const { name } = await request.json();
    if (!name || !name.trim()) {
      return jsonResponse2({ success: false, error: "Name is required" }, 400);
    }
    const user = {
      id: Date.now().toString(),
      name: name.trim(),
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    return jsonResponse2({
      success: true,
      user
    });
  } catch (err) {
    return jsonResponse2({ success: false, error: err.message }, 500);
  }
}
__name(onRequestPost4, "onRequestPost");
async function onRequestGet(context) {
  return jsonResponse2({
    success: true,
    message: "User API is working"
  });
}
__name(onRequestGet, "onRequestGet");
function jsonResponse2(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}
__name(jsonResponse2, "jsonResponse");

// ../.wrangler/tmp/pages-AWPhRm/functionsRoutes-0.8839037578935212.mjs
var routes = [
  {
    routePath: "/api/agent",
    mountPath: "/api",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions]
  },
  {
    routePath: "/api/agent",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/graphql",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/api/story-workshop",
    mountPath: "/api",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions2]
  },
  {
    routePath: "/api/story-workshop",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost3]
  },
  {
    routePath: "/api/user",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/user",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost4]
  }
];

// ../node_modules/wrangler/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: () => {
            isFailOpen = true;
          }
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");

// ../node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// ../.wrangler/tmp/bundle-ao05CD/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;

// ../node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// ../.wrangler/tmp/bundle-ao05CD/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=functionsWorker-0.8277985602318964.mjs.map
