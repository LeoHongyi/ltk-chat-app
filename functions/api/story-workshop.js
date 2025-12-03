/**
 * AI 儿童故事创作工坊 - Multi-Agent Workflow API
 *
 * Workflow:
 * 1. Educator Agent - 分析教育目标
 * 2. Parallel: Storyteller + Artist + GameDesigner
 * 3. Safety Agent - 内容安全审核
 * 4. Narrator Agent - 整合输出
 */

// Agent 配置
const AGENTS = {
  educator: {
    name: 'Educator',
    emoji: '📚',
    systemPrompt: `你是一位专业的幼儿教育专家。根据用户提供的教育主题和孩子信息，分析并确定适合该年龄段的教育目标。

请输出：
1. 核心教育目标（1-2个）
2. 适龄的表达方式建议
3. 故事应该传达的价值观

输出格式为JSON：
{
  "goals": ["目标1", "目标2"],
  "ageAppropriate": "适龄表达建议",
  "values": ["价值观1", "价值观2"]
}`
  },

  storyteller: {
    name: 'Storyteller',
    emoji: '✨',
    systemPrompt: `你是一位专业的儿童故事作家。根据教育目标创作一个温馨有趣的短故事。

要求：
1. 故事要融入孩子的名字作为主角
2. 融入孩子喜欢的动物作为角色
3. 使用简单易懂的语言
4. 故事分3-4个小章节
5. 每个章节100-150字
6. 结局要积极向上

输出格式为JSON：
{
  "title": "故事标题",
  "chapters": [
    {"title": "章节标题", "content": "章节内容"},
    ...
  ]
}`
  },

  artist: {
    name: 'Artist',
    emoji: '🎨',
    systemPrompt: `你是一位儿童绘本插画师。为故事的每个场景提供详细的画面描述，这些描述将用于AI绘图。

要求：
1. 画面要色彩明亮、温馨可爱
2. 适合儿童的卡通风格
3. 每个场景描述要具体、可视化
4. 使用英文描述（用于AI绘图）

输出格式为JSON：
{
  "scenes": [
    {"sceneId": 1, "description": "场景描述", "prompt": "英文绘图提示词"},
    ...
  ]
}`
  },

  gameDesigner: {
    name: 'Game Designer',
    emoji: '🎮',
    systemPrompt: `你是一位儿童教育游戏设计师。为故事设计互动问答环节。

要求：
1. 问题要简单有趣
2. 答案选项要适合幼儿理解
3. 每个问题都要有教育意义
4. 设计2-3个互动问答

输出格式为JSON：
{
  "interactions": [
    {
      "question": "问题内容",
      "options": ["选项A", "选项B", "选项C"],
      "correctAnswer": 0,
      "explanation": "答案解释和教育意义"
    },
    ...
  ]
}`
  },

  safety: {
    name: 'Safety Reviewer',
    emoji: '🛡️',
    systemPrompt: `你是一位儿童内容安全审核专家。审核故事内容是否适合儿童。

检查要点：
1. 是否有不适合儿童的内容
2. 是否传递正向积极的价值观
3. 语言是否适合目标年龄
4. 是否有潜在的负面影响

输出格式为JSON：
{
  "approved": true/false,
  "safetyScore": 1-10,
  "issues": ["问题1", ...] 或 [],
  "suggestions": ["建议1", ...] 或 []
}`
  },

  narrator: {
    name: 'Narrator',
    emoji: '🎙️',
    systemPrompt: `你是一位专业的儿童故事朗读者。将所有内容整合成一个完整的、适合朗读的故事版本。

要求：
1. 语言流畅、适合大声朗读
2. 在适当位置加入语气词和停顿提示
3. 整合互动问答到故事中
4. 加入开场白和结束语

输出格式为JSON：
{
  "openingLine": "开场白",
  "fullStory": "完整故事文本（包含朗读提示）",
  "closingLine": "结束语",
  "readingTime": "预计朗读时间（分钟）"
}`
  }
};

// 调用单个 Agent
async function callAgent(agentId, userMessage, env) {
  const agent = AGENTS[agentId];
  const apiKey = env.API_KEY;
  const apiUrl = env.API_URL || 'https://api.openai.com/v1/chat/completions';
  const model = env.MODEL || 'gpt-4o-mini';

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: agent.systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 2000,
      temperature: 0.8,
      response_format: { type: 'json_object' }
    }),
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

// 主 Workflow 执行
async function executeWorkflow(input, env, onProgress) {
  const { theme, childName, childAge, favoriteAnimal } = input;
  const results = {
    steps: [],
    finalStory: null
  };

  const baseContext = `
主题：${theme}
孩子名字：${childName}
孩子年龄：${childAge}岁
喜欢的动物：${favoriteAnimal}
`;

  // Step 1: Educator Agent
  onProgress?.({ step: 'educator', status: 'running', message: '📚 教育专家正在分析教育目标...' });
  const educatorResult = await callAgent('educator', baseContext, env);
  results.steps.push({ agent: 'educator', result: educatorResult });
  onProgress?.({ step: 'educator', status: 'done', result: educatorResult });

  const educatorContext = `
${baseContext}
教育目标：${JSON.stringify(educatorResult)}
`;

  // Step 2: Parallel - Storyteller, Artist, GameDesigner
  onProgress?.({ step: 'parallel', status: 'running', message: '✨🎨🎮 创作团队并行工作中...' });

  const [storytellerResult, artistResult, gameDesignerResult] = await Promise.all([
    callAgent('storyteller', educatorContext, env),
    callAgent('artist', educatorContext, env),
    callAgent('gameDesigner', educatorContext, env)
  ]);

  results.steps.push({ agent: 'storyteller', result: storytellerResult });
  results.steps.push({ agent: 'artist', result: artistResult });
  results.steps.push({ agent: 'gameDesigner', result: gameDesignerResult });
  onProgress?.({ step: 'parallel', status: 'done' });

  // Step 3: Safety Agent
  onProgress?.({ step: 'safety', status: 'running', message: '🛡️ 安全专家正在审核内容...' });
  const contentForReview = `
故事：${JSON.stringify(storytellerResult)}
互动问答：${JSON.stringify(gameDesignerResult)}
目标年龄：${childAge}岁
`;
  const safetyResult = await callAgent('safety', contentForReview, env);
  results.steps.push({ agent: 'safety', result: safetyResult });
  onProgress?.({ step: 'safety', status: 'done', result: safetyResult });

  // Step 4: Narrator Agent
  onProgress?.({ step: 'narrator', status: 'running', message: '🎙️ 正在整合生成最终故事...' });
  const allContent = `
孩子名字：${childName}
教育目标：${JSON.stringify(educatorResult)}
故事内容：${JSON.stringify(storytellerResult)}
互动问答：${JSON.stringify(gameDesignerResult)}
场景描述：${JSON.stringify(artistResult)}
`;
  const narratorResult = await callAgent('narrator', allContent, env);
  results.steps.push({ agent: 'narrator', result: narratorResult });
  onProgress?.({ step: 'narrator', status: 'done' });

  // 组装最终结果
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

// API Handler
export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const body = await request.json();
    const { theme, childName, childAge, favoriteAnimal } = body;

    // 验证输入
    if (!theme || !childName || !childAge || !favoriteAnimal) {
      return new Response(JSON.stringify({
        error: '请填写所有必填项：主题、孩子名字、年龄、喜欢的动物'
      }), {
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

    // 执行 Workflow
    const results = await executeWorkflow(
      { theme, childName, childAge, favoriteAnimal },
      env
    );

    return new Response(JSON.stringify({
      success: true,
      workflow: results.steps.map(s => ({
        agent: s.agent,
        emoji: AGENTS[s.agent]?.emoji,
        name: AGENTS[s.agent]?.name
      })),
      story: results.finalStory
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Story Workshop Error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Internal server error'
    }), {
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
