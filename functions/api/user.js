// Cloudflare Pages Function - 用户管理 API

export async function onRequestPost(context) {
  const { request } = context;

  try {
    const { name } = await request.json();

    if (!name || !name.trim()) {
      return jsonResponse({ success: false, error: 'Name is required' }, 400);
    }

    // 创建用户（这里简单处理，实际可以连接数据库）
    const user = {
      id: Date.now().toString(),
      name: name.trim(),
      createdAt: new Date().toISOString(),
    };

    return jsonResponse({
      success: true,
      user,
    });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}

export async function onRequestGet(context) {
  // 获取用户信息（示例）
  return jsonResponse({
    success: true,
    message: 'User API is working',
  });
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
