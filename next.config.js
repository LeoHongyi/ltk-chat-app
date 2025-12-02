/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // 环境变量配置 - 这些会在构建时注入
  // 实际的 API_KEY 和 API_URL 应该在 Cloudflare Dashboard 或 wrangler.toml 中配置
  env: {
    // 这里可以设置默认值，但敏感信息应该通过 Cloudflare 环境变量设置
  },

  // 支持 Edge Runtime
  experimental: {
    // runtime: 'edge', // 如果需要全局使用 edge runtime
  },
};

module.exports = nextConfig;
